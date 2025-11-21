import React, { useState, useEffect } from 'react'
import '../styles/ProjectTasks.css'
import apiClient from '../services/api'

const ProjectTasks = ({ tasks: initialTasks = [], projectId, onUpdate }) => {
  const [tasks, setTasks] = useState(initialTasks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [taskStates, setTaskStates] = useState({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    completed: false
  })

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

  const handleTaskToggle = (taskId) => {
    setTaskStates(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
    // TODO: Update task completion status via API
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setCreateError(null)

    if (!taskFormData.title.trim()) {
      setCreateError('Task title is required')
      return
    }

    if (!projectId) {
      setCreateError('Project ID is required')
      return
    }

    setCreating(true)

    try {
      await apiClient.addTask(projectId, taskFormData)
      
      // Reset form
      setTaskFormData({
        title: '',
        description: '',
        completed: false
      })
      setShowCreateForm(false)

      // Refresh tasks
      await fetchTasks()
      
      // Notify parent component
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      console.error('Failed to create task:', err)
      setCreateError(err.message || 'Failed to create task. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleCancelCreate = () => {
    setTaskFormData({
      title: '',
      description: '',
      completed: false
    })
    setShowCreateForm(false)
    setCreateError(null)
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
        <div className="tasks-header">
          <div></div>
          <button 
            className="upload-button"
            onClick={() => setShowCreateForm(true)}
          >
            + Create Task
          </button>
        </div>
        
        <div className="tasks-empty">
          <div className="empty-state">
            <span className="empty-icon">✅</span>
            <h3>No Tasks Yet</h3>
            <p>Create your first task to start tracking your project progress.</p>
          </div>
        </div>

        {/* Create Task Form Modal */}
        {showCreateForm && (
          <div className="upload-modal-overlay" onClick={handleCancelCreate}>
            <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
              <div className="upload-modal-header">
                <h3>Create Task</h3>
                <button className="close-button" onClick={handleCancelCreate}>✕</button>
              </div>
              
              <form onSubmit={handleCreateTask} className="upload-form">
                {createError && <div className="upload-error">{createError}</div>}
                
                <div className="form-group">
                  <label htmlFor="task-title">Title *</label>
                  <input
                    type="text"
                    id="task-title"
                    value={taskFormData.title}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="task-description">Description</label>
                  <textarea
                    id="task-description"
                    value={taskFormData.description}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this task..."
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleCancelCreate} className="cancel-button">
                    Cancel
                  </button>
                  <button type="submit" className="submit-button" disabled={creating || !taskFormData.title.trim()}>
                    {creating ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Sort tasks by order
  const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0))

  // Calculate progress
  const completedTasks = Object.values(taskStates).filter(Boolean).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="project-tasks">
      <div className="tasks-header">
        <div></div>
        <button 
          className="upload-button"
          onClick={() => setShowCreateForm(true)}
        >
          + Create Task
        </button>
      </div>

      {/* Tasks List */}
      <div className="tasks-list">
        <div className="category-tasks">
          {sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isCompleted={taskStates[task.id] || false}
              onToggle={() => handleTaskToggle(task.id)}
            />
          ))}
        </div>
      </div>

      {/* Create Task Form Modal */}
      {showCreateForm && (
        <div className="upload-modal-overlay" onClick={handleCancelCreate}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-header">
              <h3>Create Task</h3>
              <button className="close-button" onClick={handleCancelCreate}>✕</button>
            </div>
            
            <form onSubmit={handleCreateTask} className="upload-form">
              {createError && <div className="upload-error">{createError}</div>}
              
              <div className="form-group">
                <label htmlFor="task-title">Title *</label>
                <input
                  type="text"
                  id="task-title"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="task-description">Description</label>
                <textarea
                  id="task-description"
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this task..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancelCreate} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={creating || !taskFormData.title.trim()}>
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Separate TaskItem component for better organization
const TaskItem = ({ task, isCompleted, onToggle }) => {
  return (
    <div className={`task-item ${isCompleted ? 'completed' : ''}`}>
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
    </div>
  )
}

export default ProjectTasks