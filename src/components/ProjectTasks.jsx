import React, { useState, useEffect, useRef } from 'react'
import '../styles/ProjectTasks.css'
import apiClient from '../services/api'

const ProjectTasks = ({ tasks: initialTasks = [], projectId, onUpdate, onStatusUpdate, currentStatus }) => {
  const [tasks, setTasks] = useState(initialTasks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [taskStates, setTaskStates] = useState({})
  const [newTaskText, setNewTaskText] = useState('')
  const [creating, setCreating] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState(null)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [hasShownCompletionPrompt, setHasShownCompletionPrompt] = useState(false)
  const [showUncompleteModal, setShowUncompleteModal] = useState(false)
  const [hasShownUncompletePrompt, setHasShownUncompletePrompt] = useState(false)
  const textareaRef = useRef(null)

  // Fetch tasks from API
  const fetchTasks = async () => {
    if (!projectId) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getTasks(projectId)
      setTasks(response.tasks || [])
    } catch (err) {
      console.error('Failed to load tasks:', err)
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  // Fetch tasks on mount and when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchTasks()
    } else if (initialTasks.length > 0) {
      // Fallback to initialTasks if no projectId
      setTasks(initialTasks)
    }
  }, [projectId])

  // Initialize task states from tasks
  useEffect(() => {
    const initialStates = {}
    tasks.forEach(task => {
      initialStates[task.id] = task.completed
    })
    setTaskStates(initialStates)
  }, [tasks])

  // Reset completion prompt when project status changes or when tasks are added/removed
  useEffect(() => {
    if (currentStatus === 'Completed') {
      setHasShownCompletionPrompt(true) // Don't show prompt if already completed
      setHasShownUncompletePrompt(false) // Reset uncomplete prompt when status changes to Completed
    } else {
      // Reset prompt flag when project is not completed (allows showing again if tasks are uncompleted then re-completed)
      const allCompleted = tasks.length > 0 && tasks.every(task => task.completed)
      if (!allCompleted) {
        setHasShownCompletionPrompt(false)
      }
      // Reset uncomplete prompt when status is not Completed
      setHasShownUncompletePrompt(false)
    }
  }, [currentStatus, tasks])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [newTaskText])

  const handleNewTaskKeyDown = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const text = newTaskText.trim()
      
      if (!text || !projectId || creating) {
        return
      }

      setCreating(true)
      try {
        const response = await apiClient.addTask(projectId, {
          title: text,
          description: '',
          completed: false
        })
        setNewTaskText('')
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
        // Add the new task to local state from API response — no full refetch or parent refresh
        const created = response?.task
        if (created) {
          const newTask = {
            id: created.id,
            title: created.title || text,
            description: created.description || '',
            completed: created.completed || false,
            order: created.order != null ? created.order : (tasks.length + 1)
          }
          setTasks(prev => [...prev, newTask].sort((a, b) => (a.order || 0) - (b.order || 0)))
        } else {
          // Fallback: refetch only tasks if API didn't return the task
          await fetchTasks()
        }
        // Do not call onUpdate() — it triggers full project refetch and page refresh
      } catch (err) {
        console.error('Failed to create task:', err)
        alert(err.message || 'Failed to create task')
      } finally {
        setCreating(false)
      }
    }
  }

  const handleTaskToggle = async (taskId) => {
    if (!projectId) return

    const newCompletedState = !taskStates[taskId]
    
    // Update local state immediately for better UX
    setTaskStates(prev => ({
      ...prev,
      [taskId]: newCompletedState
    }))

    // Update the task in the tasks array
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: newCompletedState }
        : task
    )
    setTasks(updatedTasks)

    try {
      // Update backend with the new completion status
      const taskToUpdate = updatedTasks.find(t => t.id === taskId)
      if (taskToUpdate) {
        const updatedProjectTasks = updatedTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          completed: task.completed || false,
          order: task.order || 0,
          estimatedTime: task.estimatedTime || '',
          difficulty: task.difficulty || 'Beginner',
          category: task.category || 'Planning'
        }))

        await apiClient.updateProject(projectId, { tasks: updatedProjectTasks })
        
        // Check if all tasks are now completed (use updatedTasks array which has the latest completion state)
        const allCompleted = updatedTasks.length > 0 && updatedTasks.every(task => task.completed === true)
        
        // Show completion prompt if all tasks are completed and project is not already completed
        if (allCompleted && updatedTasks.length > 0 && currentStatus !== 'Completed' && !hasShownCompletionPrompt) {
          // Small delay to let the UI update first
          setTimeout(() => {
            setShowCompletionModal(true)
            setHasShownCompletionPrompt(true)
          }, 300)
        }
        
        // Show uncomplete prompt if a task is unchecked and project status is "Completed"
        if (!newCompletedState && currentStatus === 'Completed' && !hasShownUncompletePrompt) {
          // Small delay to let the UI update first
          setTimeout(() => {
            setShowUncompleteModal(true)
            setHasShownUncompletePrompt(true)
          }, 300)
        }
      }
    } catch (err) {
      console.error('Failed to update task completion:', err)
      // Revert on error
      setTaskStates(prev => ({
        ...prev,
        [taskId]: !newCompletedState
      }))
      const revertedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !newCompletedState }
          : task
      )
      setTasks(revertedTasks)
      alert(err.message || 'Failed to update task. Please try again.')
    }
  }

  const handleMarkProjectComplete = async () => {
    if (onStatusUpdate) {
      try {
        await onStatusUpdate('Completed')
        setShowCompletionModal(false)
      } catch (err) {
        console.error('Failed to mark project as complete:', err)
        alert(err.message || 'Failed to mark project as complete')
      }
    }
  }

  const handleDismissCompletionModal = () => {
    setShowCompletionModal(false)
  }

  const handleMarkProjectInProgress = async () => {
    if (onStatusUpdate) {
      try {
        await onStatusUpdate('In Progress')
        setShowUncompleteModal(false)
      } catch (err) {
        console.error('Failed to mark project as in progress:', err)
        alert(err.message || 'Failed to mark project as in progress')
      }
    }
  }

  const handleDismissUncompleteModal = () => {
    setShowUncompleteModal(false)
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    if (!projectId) return

    try {
      // Remove task from local state immediately for better UX
      const updatedTasks = tasks.filter(task => task.id !== taskId)
      
      // Reorder remaining tasks
      const reorderedTasks = updatedTasks.map((task, index) => ({
        ...task,
        order: index + 1
      }))

      setTasks(reorderedTasks)

      // Update backend - remove task and reorder remaining tasks
      const updatedProjectTasks = reorderedTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        completed: task.completed || false,
        order: task.order,
        estimatedTime: task.estimatedTime || '',
        difficulty: task.difficulty || 'Beginner',
        category: task.category || 'Planning'
      }))

      console.log('Sending updated tasks to backend:', updatedProjectTasks.map(t => ({ id: t.id, title: t.title })))
      const result = await apiClient.updateProject(projectId, { tasks: updatedProjectTasks })
      console.log('Update project result:', result)
      
      // Small delay to ensure backend deletion completes
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refresh tasks to ensure sync
      await fetchTasks()
      
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      console.error('Failed to delete task:', err)
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      })
      // Revert on error
      await fetchTasks()
      alert(err.message || 'Failed to delete task. Please try again.')
    }
  }

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target)
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedTaskId(null)
    setDraggedOverIndex(null)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDraggedOverIndex(index)
  }

  const handleDragLeave = () => {
    setDraggedOverIndex(null)
  }

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault()
    setDraggedOverIndex(null)

    if (!draggedTaskId || !projectId) return

    const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0))
    const draggedTask = sortedTasks.find(t => t.id === draggedTaskId)
    if (!draggedTask) return

    const draggedIndex = sortedTasks.findIndex(t => t.id === draggedTaskId)
    if (draggedIndex === dropIndex) return

    // Reorder tasks
    const newTasks = [...sortedTasks]
    newTasks.splice(draggedIndex, 1)
    newTasks.splice(dropIndex, 0, draggedTask)

    // Update order values
    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      order: index + 1
    }))

    // Update local state immediately for better UX
    setTasks(updatedTasks)

    // Update in backend - tasks are stored in separate table
    // We need to update each task's order individually
    try {
      // Update each task's order via the project update endpoint
      // The backend should handle syncing to the tasks table
      const updatedProjectTasks = updatedTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        completed: task.completed || false,
        order: task.order,
        estimatedTime: task.estimatedTime || '',
        difficulty: task.difficulty || 'Beginner',
        category: task.category || 'Planning'
      }))
      
      console.log('Updating task order:', updatedProjectTasks.map(t => ({ id: t.id, order: t.order })))
      
      const result = await apiClient.updateProject(projectId, { tasks: updatedProjectTasks })
      console.log('Task order update result:', result)
      
      // Verify the update was successful by checking the response
      if (!result) {
        throw new Error('Update returned no result')
      }
      
      // Don't refresh - state is already updated locally
      // Don't call onUpdate for reordering to avoid parent component refresh
    } catch (err) {
      console.error('Failed to update task order:', err)
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      })
      // Revert on error - only fetch if update failed
      await fetchTasks()
      alert(`Failed to update task order: ${err.message || 'Unknown error'}. Please try again.`)
    }
  }




  if (loading) {
    return (
      <div className="tasks-empty">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="tasks-empty">
        <div className="empty-state">
          <span className="empty-icon">⚠️</span>
          <h3>Error Loading Tasks</h3>
          <p>{error}</p>
          <button onClick={fetchTasks} className="upload-button" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="project-tasks">
        <div className="tasks-empty">
          <div className="empty-state">
            <span className="empty-icon">✅</span>
            <h3>No Tasks Yet</h3>
            <p>Create your first task to start tracking your project progress.</p>
          </div>
        </div>

        {/* Notepad-style Task Input */}
        <div className="task-notepad-container">
          <textarea
            ref={textareaRef}
            className="task-notepad-input"
            placeholder="Type a task and press Enter..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleNewTaskKeyDown}
            rows={1}
            disabled={creating}
          />
        </div>
      </div>
    )
  }

  // Sort tasks by order
  const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Calculate progress based on completed tasks
  // Use taskStates for real-time updates, but fall back to task.completed if taskStates doesn't have it
  const completedTasks = sortedTasks.filter(task => {
    return taskStates[task.id] !== undefined ? taskStates[task.id] : (task.completed || false)
  }).length
  const totalTasks = sortedTasks.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="project-tasks">
      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="progress-overview">
          <div className="progress-bar-container">
            <span className="progress-percentage">{progressPercentage}%</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="tasks-list">
        <div className="category-tasks">
          {sortedTasks.length === 0 ? (
            <div className="tasks-empty">
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <p>No tasks yet. Start typing below to add one.</p>
              </div>
            </div>
          ) : (
            sortedTasks.map((task, index) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`task-drag-wrapper ${draggedTaskId === task.id ? 'dragging' : ''} ${draggedOverIndex === index ? 'drag-over' : ''}`}
              >
                <TaskItem
                  task={task}
                  isCompleted={taskStates[task.id] || false}
                  onToggle={() => handleTaskToggle(task.id)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notepad-style Task Input */}
      <div className="task-notepad-container">
        <textarea
          ref={textareaRef}
          className="task-notepad-input"
          placeholder="Type a task and press Enter..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={handleNewTaskKeyDown}
          rows={1}
          disabled={creating}
        />
      </div>

      {/* Completion Celebration Modal */}
      {showCompletionModal && (
        <div className="completion-modal-overlay" onClick={handleDismissCompletionModal}>
          <div className="completion-modal" onClick={(e) => e.stopPropagation()}>
            <div className="completion-modal-content">
              <div className="completion-icon">🎉</div>
              <h2 className="completion-title">Congratulations!</h2>
              <p className="completion-message">
                You've completed all tasks for this project! 🎊
              </p>
              <p className="completion-question">
                Would you like to mark this project as "Completed"?
              </p>
              <div className="completion-modal-actions">
                <button
                  className="completion-button completion-button-primary"
                  onClick={handleMarkProjectComplete}
                >
                  Yes, Mark as Complete
                </button>
                <button
                  className="completion-button completion-button-secondary"
                  onClick={handleDismissCompletionModal}
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uncomplete Project Modal */}
      {showUncompleteModal && (
        <div className="completion-modal-overlay" onClick={handleDismissUncompleteModal}>
          <div className="completion-modal" onClick={(e) => e.stopPropagation()}>
            <div className="completion-modal-content">
              <div className="completion-icon">📝</div>
              <h2 className="completion-title">Task Unchecked</h2>
              <p className="completion-message">
                You've unchecked a task in this completed project.
              </p>
              <p className="completion-question">
                Would you like to change the project status back to "In Progress"?
              </p>
              <div className="completion-modal-actions">
                <button
                  className="completion-button completion-button-primary"
                  onClick={handleMarkProjectInProgress}
                >
                  Yes, Mark as In Progress
                </button>
                <button
                  className="completion-button completion-button-secondary"
                  onClick={handleDismissUncompleteModal}
                >
                  Keep as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Separate TaskItem component for better organization
const TaskItem = ({ task, isCompleted, onToggle, onDelete }) => {
  return (
    <div className={`task-item ${isCompleted ? 'completed' : ''}`}>
      <div className="task-drag-handle">⋮⋮</div>
      <div className="task-checkbox-container">
        <input
          type="checkbox"
          id={`task-${task.id}`}
          checked={isCompleted}
          onChange={onToggle}
          className="task-checkbox"
        />
        <label htmlFor={`task-${task.id}`} className="checkbox-label">
          <span className="checkmark">✓</span>
        </label>
      </div>
      
      <div className="task-content">
        <div className="task-header">
          <h5 className="task-title">{task.title}</h5>
          {task.estimatedTime && (
            <div className="task-badges">
              <span className="time-badge">
                ⏱️ {task.estimatedTime}
              </span>
            </div>
          )}
        </div>
        
        <p className="task-description">{task.description}</p>
      </div>
      
      <button
        className="task-delete-button"
        onClick={onDelete}
        title="Delete task"
        aria-label="Delete task"
      >
        ×
      </button>
    </div>
  )
}

export default ProjectTasks