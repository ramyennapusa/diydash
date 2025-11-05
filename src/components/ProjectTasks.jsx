import React, { useState, useEffect } from 'react'
import '../styles/ProjectTasks.css'

const ProjectTasks = ({ tasks = [] }) => {
  const [taskStates, setTaskStates] = useState({})
  const [filterCategory, setFilterCategory] = useState('all')

  // Initialize task states from props
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

  if (!tasks || tasks.length === 0) {
    return (
      <div className="tasks-empty">
        <div className="empty-state">
          <span className="empty-icon">✅</span>
          <h3>No Tasks Yet</h3>
          <p>Tasks will be added as the project plan develops.</p>
        </div>
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
        <h3>Project Tasks</h3>
        <p>Track your progress through each step of the project</p>
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