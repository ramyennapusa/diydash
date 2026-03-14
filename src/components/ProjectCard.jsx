import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import ResolvedImage from './ResolvedImage'
import './ProjectCard.css'

const DEFAULT_PROJECT_IMAGE = '/draft2done-login-bg.png'

function ProjectCard({ project, onUpdate }) {
  const navigate = useNavigate()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(project.title || '')
  const [updatingTitle, setUpdatingTitle] = useState(false)

  const handleCardClick = () => {
    if (!editingTitle) {
      navigate(`/project/${project.id}`)
    }
  }

  const handleCollabIconClick = (e) => {
    e.stopPropagation()
    if (editingTitle) return
    navigate(`/project/${project.id}`, { state: { openShare: true } })
  }

  const handleTitleEdit = (e) => {
    e.stopPropagation()
    setTitleValue(project.title || '')
    setEditingTitle(true)
  }

  const handleTitleCancel = (e) => {
    e.stopPropagation()
    setTitleValue(project.title || '')
    setEditingTitle(false)
  }

  const handleTitleSave = async (e) => {
    e.stopPropagation()
    if (!titleValue.trim()) {
      return
    }

    if (titleValue.trim() === project.title) {
      setEditingTitle(false)
      return
    }

    try {
      setUpdatingTitle(true)
      await apiClient.updateProject(project.id, { title: titleValue.trim() })
      setEditingTitle(false)
      // Refresh the project list if callback provided
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      console.error('Failed to update project title:', err)
      alert(err.message || 'Failed to update project title')
    } finally {
      setUpdatingTitle(false)
    }
  }

  const handleTitleKeyDown = (e) => {
    e.stopPropagation()
    if (e.key === 'Enter') {
      handleTitleSave(e)
    } else if (e.key === 'Escape') {
      handleTitleCancel(e)
    }
  }

  // Update title value when project changes
  useEffect(() => {
    if (!editingTitle) {
      setTitleValue(project.title || '')
    }
  }, [project.title, editingTitle])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate task progress percentage
  const calculateTaskProgress = () => {
    if (!project.tasks || !Array.isArray(project.tasks) || project.tasks.length === 0) {
      return 0
    }
    const completedTasks = project.tasks.filter(task => task.completed === true).length
    const totalTasks = project.tasks.length
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  const taskProgress = calculateTaskProgress()

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed'
      case 'In Progress':
        return 'status-in-progress'
      case 'Planning':
        return 'status-planning'
      case 'Deleted':
        return 'status-deleted'
      default:
        return 'status-default'
    }
  }

  const hasImage = (project.imageKey || project.image) && String(project.image || project.imageKey || '').trim() !== ''
  const imageUrl = hasImage ? (project.image || project.imageKey || '') : DEFAULT_PROJECT_IMAGE

  return (
    <div className="project-card" onClick={handleCardClick}>
      <div className="project-card-image">
        {hasImage ? (
          <ResolvedImage
            s3Key={project.imageKey}
            fallbackUrl={project.image}
            alt={project.title}
            onError={(e) => {
              e.target.src = DEFAULT_PROJECT_IMAGE
            }}
          />
        ) : (
          <img src={DEFAULT_PROJECT_IMAGE} alt={project.title} />
        )}
        <div className="project-card-status-row">
          <div 
            className={`project-status ${getStatusColor(project.status)}`}
            style={
              project.status === 'In Progress' && taskProgress > 0
                ? {
                    background: `linear-gradient(90deg, #10b981 0%, #10b981 ${taskProgress}%, #fef3c7 ${taskProgress}%, #fef3c7 100%)`,
                    color: taskProgress > 50 ? '#ffffff' : '#92400e',
                    fontWeight: taskProgress > 50 ? '600' : '500'
                  }
                : {}
            }
            title={
              project.status === 'In Progress' && taskProgress > 0
                ? `${taskProgress}% of tasks completed`
                : project.status
            }
          >
            {project.status}
          </div>
          {project.hasCollaborators ? (
            <button
              type="button"
              className="project-collab-icon project-collab-icon-button"
              title="Shared with others – open share"
              aria-label="Open share project"
              onClick={handleCollabIconClick}
            >
              👥
            </button>
          ) : (
            <button
              type="button"
              className="project-collab-icon project-collab-icon-button project-share-icon"
              title="Share project"
              aria-label="Share project"
              onClick={handleCollabIconClick}
            >
              <span className="project-share-icon-inner">
                <span className="project-share-person">👤</span>
                <span className="project-share-plus">+</span>
              </span>
            </button>
          )}
        </div>
      </div>
      
      <div className="project-card-content">
        <div className="project-title-container">
          {editingTitle ? (
            <div className="project-title-edit">
              <input
                type="text"
                className="project-title-input"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onClick={(e) => e.stopPropagation()}
                disabled={updatingTitle}
                autoFocus
              />
              <div className="project-title-actions">
                <button
                  className="title-save-button"
                  onClick={handleTitleSave}
                  disabled={updatingTitle || !titleValue.trim()}
                  title="Save"
                >
                  ✓
                </button>
                <button
                  className="title-cancel-button"
                  onClick={handleTitleCancel}
                  disabled={updatingTitle}
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="project-title-display">
              <h3 className="project-title">{project.title}</h3>
              <button
                className="card-edit-button"
                onClick={handleTitleEdit}
                title="Edit title"
                aria-label="Edit project title"
              >
                <span className="edit-icon">✏️</span>
              </button>
            </div>
          )}
        </div>
        <div className="project-meta">
          <span className="project-date">
            Started: {formatDate(project.createdDate)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard