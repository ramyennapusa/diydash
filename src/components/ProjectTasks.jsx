import React, { useState, useEffect } from 'react'
import '../styles/ProjectTasks.css'
import apiClient from '../services/api'

const ProjectTasks = ({ tasks: initialTasks = [], projectId, onUpdate }) => {
  const [tasks, setTasks] = useState(initialTasks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [taskStates, setTaskStates] = useState({})
  const [filterCategory, setFilterCategory] = useState('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    estimatedTime: '',
    difficulty: 'Beginner',
    category: 'Planning',
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
        estimatedTime: '',
        difficulty: 'Beginner',
        category: 'Planning',
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
      estimatedTime: '',
      difficulty: 'Beginner',
      category: 'Planning',
      completed: false
    })
    setShowCreateForm(false)
    setCreateError(null)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return '#10b981'
      case 'Intermediate':
        return '#f59e0b'
      case 'Advanced':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Planning':
        return '📋'
      case 'Materials':
        return '📦'
      case 'Construction':
        return '🔨'
      case 'Installation':
        return '⚙️'
      case 'Finishing':
        return '✨'
      case 'Design':
        return '🎨'
      case 'Electronics':
        return '⚡'
      case 'Programming':
        return '💻'
      default:
        return '📝'
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
        <div className="tasks-header">
          <div>
            <h3>Project Tasks</h3>
            <p>Track your progress through each step of the project</p>
          </div>
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

                <div className="form-group">
                  <label htmlFor="task-category">Category</label>
                  <select
                    id="task-category"
                    value={taskFormData.category}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Planning">📋 Planning</option>
                    <option value="Materials">📦 Materials</option>
                    <option value="Construction">🔨 Construction</option>
                    <option value="Installation">⚙️ Installation</option>
                    <option value="Finishing">✨ Finishing</option>
                    <option value="Design">🎨 Design</option>
                    <option value="Electronics">⚡ Electronics</option>
                    <option value="Programming">💻 Programming</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="task-difficulty">Difficulty</label>
                  <select
                    id="task-difficulty"
                    value={taskFormData.difficulty}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="task-time">Estimated Time</label>
                  <input
                    type="text"
                    id="task-time"
                    value={taskFormData.estimatedTime}
                    onChange={(e) => setTaskFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    placeholder="e.g., 2 hours, 30 minutes"
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
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order)

  // Get unique categories
  const categories = ['all', ...new Set(tasks.map(task => task.category))]

  // Filter tasks by category
  const filteredTasks = filterCategory === 'all' 
    ? sortedTasks 
    : sortedTasks.filter(task => task.category === filterCategory)

  // Calculate progress
  const completedTasks = Object.values(taskStates).filter(Boolean).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Group tasks by category for better organization
  const tasksByCategory = filteredTasks.reduce((acc, task) => {
    const category = task.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(task)
    return acc
  }, {})

  return (
    <div className="project-tasks">
      <div className="tasks-header">
        <div>
          <h3>Project Tasks</h3>
          <p>Track your progress through each step of the project</p>
        </div>
        <button 
          className="upload-button"
          onClick={() => setShowCreateForm(true)}
        >
          + Create Task
        </button>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-stats">
          <div className="stat">
            <span className="stat-number">{completedTasks}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat">
            <span className="stat-number">{totalTasks - completedTasks}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat">
            <span className="stat-number">{progressPercentage}%</span>
            <span className="stat-label">Progress</span>
          </div>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="progress-text">{progressPercentage}% Complete</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <label htmlFor="category-select">Filter by category:</label>
        <select 
          id="category-select"
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="category-select"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : `${getCategoryIcon(category)} ${category}`}
            </option>
          ))}
        </select>
      </div>

      {/* Tasks List */}
      <div className="tasks-list">
        {filterCategory === 'all' ? (
          // Group by category when showing all
          Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
            <div key={category} className="category-group">
              <h4 className="category-title">
                <span className="category-icon">{getCategoryIcon(category)}</span>
                {category}
                <span className="category-count">({categoryTasks.length})</span>
              </h4>
              
              <div className="category-tasks">
                {categoryTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isCompleted={taskStates[task.id] || false}
                    onToggle={() => handleTaskToggle(task.id)}
                    getDifficultyColor={getDifficultyColor}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Show filtered tasks without grouping
          <div className="category-tasks">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isCompleted={taskStates[task.id] || false}
                onToggle={() => handleTaskToggle(task.id)}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </div>
        )}
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

              <div className="form-group">
                <label htmlFor="task-category">Category</label>
                <select
                  id="task-category"
                  value={taskFormData.category}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="Planning">📋 Planning</option>
                  <option value="Materials">📦 Materials</option>
                  <option value="Construction">🔨 Construction</option>
                  <option value="Installation">⚙️ Installation</option>
                  <option value="Finishing">✨ Finishing</option>
                  <option value="Design">🎨 Design</option>
                  <option value="Electronics">⚡ Electronics</option>
                  <option value="Programming">💻 Programming</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="task-difficulty">Difficulty</label>
                <select
                  id="task-difficulty"
                  value={taskFormData.difficulty}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="task-time">Estimated Time</label>
                <input
                  type="text"
                  id="task-time"
                  value={taskFormData.estimatedTime}
                  onChange={(e) => setTaskFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  placeholder="e.g., 2 hours, 30 minutes"
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
const TaskItem = ({ task, isCompleted, onToggle, getDifficultyColor }) => {
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
          <div className="task-badges">
            <span 
              className="difficulty-badge"
              style={{ backgroundColor: getDifficultyColor(task.difficulty) }}
            >
              {task.difficulty}
            </span>
            <span className="time-badge">
              ⏱️ {task.estimatedTime}
            </span>
          </div>
        </div>
        
        <p className="task-description">{task.description}</p>
      </div>
    </div>
  )
}

export default ProjectTasks