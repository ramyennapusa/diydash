import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import ProjectPictures from './ProjectPictures'
import ProjectTasks from './ProjectTasks'
import ProjectMaterials from './ProjectMaterials'
import ProjectReferences from './ProjectReferences'
import '../styles/ProjectDetails.css'

const DEFAULT_PROJECT_IMAGE = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'

const ProjectDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('tasks')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingImage, setUpdatingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [updatingTitle, setUpdatingTitle] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [descriptionValue, setDescriptionValue] = useState('')
  const [updatingDescription, setUpdatingDescription] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  const fetchProject = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)
      
      const projectData = await apiClient.getProject(id)
      if (!projectData) {
        setError('Project not found')
      } else {
        setProject(projectData)
      }
    } catch (err) {
      console.error('Failed to load project details:', err)
      setError(err.message || 'Failed to load project details')
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (id) {
      fetchProject()
    }
  }, [id])

  useEffect(() => {
    if (project) {
      setTitleValue(project.title || '')
      setDescriptionValue(project.description || '')
    }
  }, [project])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleBackToProjects = () => {
    navigate('/')
  }

  const handleDeleteProject = async () => {
    if (!project) {
      return
    }

    const confirmMessage = `Are you sure you want to delete "${project.title}"?\n\nThis action cannot be undone.`
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      setDeleting(true)
      setError(null)
      
      await apiClient.deleteProject(id)
      
      // Navigate back to projects list after successful deletion
      navigate('/')
    } catch (err) {
      console.error('Failed to delete project:', err)
      setError(err.message || 'Failed to delete project')
      setDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (!project || project.status === newStatus) {
      return
    }

    try {
      setUpdatingStatus(true)
      setError(null)
      
      // Update status via API
      const updatedProject = await apiClient.updateProjectStatus(id, newStatus)
      
      // Update local state with the updated project
      setProject(updatedProject)
    } catch (err) {
      console.error('Failed to update project status:', err)
      setError(err.message || 'Failed to update project status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Create a local preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTitleEdit = () => {
    if (project) {
      setTitleValue(project.title || '')
      setEditingTitle(true)
    }
  }

  const handleTitleCancel = () => {
    if (project) {
      setTitleValue(project.title || '')
    }
    setEditingTitle(false)
  }

  const handleTitleSave = async () => {
    if (!project || !titleValue.trim()) {
      setError('Title cannot be empty')
      return
    }

    if (titleValue.trim() === project.title) {
      setEditingTitle(false)
      return
    }

    try {
      setUpdatingTitle(true)
      setError(null)
      
      const updatedProject = await apiClient.updateProject(id, { title: titleValue.trim() })
      setProject(updatedProject)
      setEditingTitle(false)
    } catch (err) {
      console.error('Failed to update project title:', err)
      setError(err.message || 'Failed to update project title')
    } finally {
      setUpdatingTitle(false)
    }
  }

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      handleTitleCancel()
    }
  }

  const handleDescriptionEdit = () => {
    if (project) {
      setDescriptionValue(project.description || '')
      setEditingDescription(true)
    }
  }

  const handleDescriptionCancel = () => {
    if (project) {
      setDescriptionValue(project.description || '')
    }
    setEditingDescription(false)
  }

  const handleDescriptionSave = async () => {
    if (!project) {
      return
    }

    // Description can be empty, so we allow saving empty descriptions
    if (descriptionValue === (project.description || '')) {
      setEditingDescription(false)
      return
    }

    try {
      setUpdatingDescription(true)
      setError(null)
      
      const updatedProject = await apiClient.updateProject(id, { description: descriptionValue })
      setProject(updatedProject)
      setEditingDescription(false)
    } catch (err) {
      console.error('Failed to update project description:', err)
      setError(err.message || 'Failed to update project description')
    } finally {
      setUpdatingDescription(false)
    }
  }

  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleDescriptionCancel()
    }
    // Allow Ctrl+Enter or Cmd+Enter to save for textarea
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleDescriptionSave()
    }
  }

  const handleImageUpload = async () => {
    if (!previewImage || !project) {
      return
    }

    try {
      setUpdatingImage(true)
      setError(null)

      // Prepare image data for upload
      const projectData = {}
      
      // Extract base64 from data URL
      if (previewImage.startsWith('data:')) {
        const base64Match = previewImage.match(/^data:([^;]+);base64,(.+)$/)
        if (base64Match && base64Match[2]) {
          projectData.imageData = base64Match[2] // Base64 string without prefix
          projectData.imageContentType = base64Match[1] || 'image/jpeg'
        } else {
          throw new Error('Failed to extract image data from preview')
        }
      } else {
        // If it's not a data URL, treat it as a regular URL
        projectData.image = previewImage
      }

      // Verify we have image data to upload
      if (!projectData.imageData && !projectData.image) {
        throw new Error('No image data to upload')
      }

      console.log('Uploading image with contentType:', projectData.imageContentType || 'image/jpeg')
      console.log('Image data length:', projectData.imageData ? projectData.imageData.length : 0)
      console.log('Project data being sent:', { 
        hasImageData: !!projectData.imageData, 
        imageContentType: projectData.imageContentType 
      })

      // Update project with new image
      const result = await apiClient.updateProject(id, projectData)
      console.log('Image upload successful, result:', result)
      
      // Refresh project to get presigned URL for the new image (without showing loading spinner)
      await fetchProject(false)
      
      // Clear preview
      setPreviewImage(null)
      
      // Clear file input
      const fileInput = document.getElementById('project-image-upload')
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (err) {
      console.error('Failed to update project image:', err)
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      })
      // Show more detailed error message
      const errorMessage = err.data?.error 
        ? `${err.message}: ${err.data.error}`
        : err.message || 'Failed to update project image'
      setError(errorMessage)
    } finally {
      setUpdatingImage(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#10b981'
      case 'In Progress':
        return '#f59e0b'
      case 'Planning':
        return '#3b82f6'
      case 'Deleted':
        return '#6b7280'
      default:
        return '#6b7280'
    }
  }

  // Get image URL (with default fallback)
  const getImageUrl = () => {
    if (previewImage) {
      return previewImage
    }
    if (project?.image && project.image.trim() !== '') {
      return project.image
    }
    return DEFAULT_PROJECT_IMAGE
  }


  if (loading) {
    return (
      <div className="project-details">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="project-details">
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={handleBackToProjects} className="back-button">
            ← Back to Projects
          </button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="project-details">
        <div className="error-container">
          <h2>Project not found</h2>
          <p>The project you're looking for doesn't exist.</p>
          <button onClick={handleBackToProjects} className="back-button">
            ← Back to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="project-details">
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button 
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
      <div className="project-header">
        {/* More Options Menu */}
        <div className="project-details-menu" ref={menuRef}>
          <button
            className="project-menu-button"
            onClick={handleMenuToggle}
            title="More options"
            aria-label="More options"
          >
            <span className="menu-icon">⋮</span>
          </button>
          {showMenu && (
            <div className="project-menu-dropdown">
              <button
                className="project-menu-item delete-item"
                onClick={handleDeleteProject}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          )}
        </div>
        <button onClick={handleBackToProjects} className="back-button">
          ← Back to Projects
        </button>
        
        {/* Project Image Section */}
        <div className="project-image-section">
          <div className="project-image-container">
            <img 
              src={getImageUrl()} 
              alt={project.title}
              className="project-image"
              onError={(e) => {
                e.target.src = DEFAULT_PROJECT_IMAGE
              }}
            />
            <div className="project-image-overlay">
              <label htmlFor="project-image-upload" className="image-change-button">
                {previewImage ? 'Change Image' : 'Change Image'}
              </label>
            </div>
            <input
              type="file"
              id="project-image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="image-upload-input"
              style={{ display: 'none' }}
            />
          </div>
          {previewImage && (
            <div className="image-upload-actions">
              <button
                onClick={handleImageUpload}
                disabled={updatingImage}
                className="btn-save-image"
              >
                {updatingImage ? 'Uploading...' : 'Save Image'}
              </button>
              <button
                onClick={() => {
                  setPreviewImage(null)
                  const fileInput = document.getElementById('project-image-upload')
                  if (fileInput) {
                    fileInput.value = ''
                  }
                }}
                disabled={updatingImage}
                className="btn-cancel-image"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="project-title-section">
          <div className="project-title-container">
            {editingTitle ? (
              <div className="project-title-edit">
                <input
                  type="text"
                  className="project-title-input"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
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
                <h1 className="project-title">{project.title}</h1>
                <button
                  className="title-edit-button"
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
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="status-select"
              style={{ backgroundColor: getStatusColor(project.status) }}
              aria-label="Project status"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Deleted">Deleted</option>
            </select>
            {updatingStatus && (
              <span className="status-updating-indicator">Updating...</span>
            )}
          </div>
        </div>
        
        <div className="project-description-container">
          {editingDescription ? (
            <div className="project-description-edit">
              <textarea
                className="project-description-input"
                value={descriptionValue}
                onChange={(e) => setDescriptionValue(e.target.value)}
                onKeyDown={handleDescriptionKeyDown}
                disabled={updatingDescription}
                rows={4}
                placeholder="Enter project description..."
                autoFocus
              />
              <div className="project-description-actions">
                <button
                  className="description-save-button"
                  onClick={handleDescriptionSave}
                  disabled={updatingDescription}
                  title="Save"
                >
                  ✓ Save
                </button>
                <button
                  className="description-cancel-button"
                  onClick={handleDescriptionCancel}
                  disabled={updatingDescription}
                  title="Cancel"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="project-description-display">
              <p className="project-description">
                {project.description || <span className="description-placeholder">No description</span>}
              </p>
              <button
                className="description-edit-button"
                onClick={handleDescriptionEdit}
                title="Edit description"
                aria-label="Edit project description"
              >
                <span className="edit-icon">✏️</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="project-content">
        <nav className="project-tabs">
          <button 
            className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            ✅ Tasks
          </button>
          <button 
            className={`tab-button ${activeTab === 'pictures' ? 'active' : ''}`}
            onClick={() => setActiveTab('pictures')}
          >
            📸 Pictures
          </button>
          <button 
            className={`tab-button ${activeTab === 'references' ? 'active' : ''}`}
            onClick={() => setActiveTab('references')}
          >
            🔗 References
          </button>
          <button 
            className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            🛠️ Materials
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'tasks' && (
            <ProjectTasks 
              tasks={project.tasks || []} 
              projectId={project.id}
              onUpdate={fetchProject}
              onStatusUpdate={handleStatusChange}
              currentStatus={project.status}
            />
          )}
          {activeTab === 'pictures' && (
            <ProjectPictures 
              pictures={project.pictures || []} 
              projectId={project.id}
              onUpdate={fetchProject}
            />
          )}
          {activeTab === 'references' && (
            <ProjectReferences 
              references={project.references || []}
              projectId={project.id}
              onUpdate={fetchProject}
            />
          )}
          {activeTab === 'materials' && (
            <ProjectMaterials 
              materials={project.materials || []} 
              tools={project.tools || []}
              projectId={project.id}
              onUpdate={fetchProject}
            />
          )}
        </div>
      </div>

    </div>
  )
}

export default ProjectDetails