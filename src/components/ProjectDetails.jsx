import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()
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
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false)
  const [collaboratorsList, setCollaboratorsList] = useState([])
  const [pendingShareRequests, setPendingShareRequests] = useState([])
  const [shareEmailFields, setShareEmailFields] = useState([{ email: '', permission: 'view' }])
  const [shareAdding, setShareAdding] = useState(false)
  const [shareRemoveLoading, setShareRemoveLoading] = useState(false)
  const [shareError, setShareError] = useState(null)
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
    if (project && location.state?.openShare) {
      setShowCollaboratorsModal(true)
      setShareError(null)
      setShareEmailFields([{ email: '', permission: 'view' }])
      fetchCollaborators()
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [project, location.state?.openShare])

  // Load collaborators for this project (for share modal + task assignment)
  useEffect(() => {
    if (id) {
      const load = async () => {
        try {
          const res = await apiClient.getCollaborators(id)
          setCollaboratorsList(res.collaborators || [])
          setPendingShareRequests(res.pending || [])
        } catch {
          // Non-blocking; share modal can still refetch explicitly
        }
      }
      load()
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

  const canManageCollaborators = project && (project.role === 'owner' || (project.role === 'collaborator' && project.collaboratorPermission === 'edit'))
  const currentUserEmail = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('diydash_user') || 'null')
      return (u?.email || '').trim().toLowerCase()
    } catch {
      return ''
    }
  })()

  const fetchCollaborators = async () => {
    if (!id) return
    try {
      const res = await apiClient.getCollaborators(id)
      setCollaboratorsList(res.collaborators || [])
      setPendingShareRequests(res.pending || [])
    } catch (err) {
      setCollaboratorsList([])
      setPendingShareRequests([])
      setShareError(err.message || 'Failed to load collaborators')
    }
  }

  const handleOpenCollaborators = () => {
    setShowMenu(false)
    setShowCollaboratorsModal(true)
    setShareError(null)
    setShareEmailFields([{ email: '', permission: 'view' }])
    fetchCollaborators()
  }

  const handleShareEmailChange = (index, value) => {
    setShareEmailFields(prev => prev.map((row, i) => (i === index ? { ...row, email: value } : row)))
  }

  const handleSharePermissionChange = (index, value) => {
    setShareEmailFields(prev => prev.map((row, i) => (i === index ? { ...row, permission: value } : row)))
  }

  const handleAddMoreField = () => {
    setShareEmailFields(prev => [...prev, { email: '', permission: 'view' }])
    setShareError(null)
  }

  const handleRemoveShareField = (index) => {
    if (shareEmailFields.length <= 1) return
    setShareEmailFields(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddCollaborator = async (e) => {
    e.preventDefault()
    const entries = shareEmailFields
      .map(row => ({ email: row.email.trim().toLowerCase(), permission: row.permission || 'view' }))
      .filter(row => row.email.length > 0)
    const seen = new Set()
    const deduped = entries.filter(row => {
      if (seen.has(row.email)) return false
      seen.add(row.email)
      return true
    })
    if (deduped.length === 0) return
    try {
      setShareAdding(true)
      setShareError(null)
      const failed = []
      for (const { email, permission } of deduped) {
        try {
          await apiClient.addCollaborator(id, { email, permission })
        } catch (err) {
          failed.push({ email, message: err.message })
        }
      }
      await fetchCollaborators()
      await fetchProject(false)
      if (failed.length > 0) {
        const msg = failed.length === deduped.length
          ? (failed[0]?.message || 'Failed to add')
          : `Added ${deduped.length - failed.length}. Failed: ${failed.map(f => f.email).join(', ')}`
        setShareError(msg)
      } else {
        setShareEmailFields([{ email: '', permission: 'view' }])
      }
    } catch (err) {
      setShareError(err.message || 'Failed to add collaborators')
    } finally {
      setShareAdding(false)
    }
  }

  const hasAnyShareEmail = shareEmailFields.some(row => (row.email || '').trim().length > 0)

  const handleRemoveCollaborator = async (email) => {
    const isRemovingSelf = email && email.toLowerCase() === currentUserEmail
    try {
      setShareRemoveLoading(true)
      setShareError(null)
      await apiClient.removeCollaborator(id, email)
      if (isRemovingSelf) {
        setShowCollaboratorsModal(false)
        navigate('/')
        return
      }
      await fetchCollaborators()
      await fetchProject(false)
    } catch (err) {
      setShareError(err.message || 'Failed to remove collaborator')
    } finally {
      setShareRemoveLoading(false)
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
              {(project.role === 'owner' || project.role === 'collaborator') && (
                <button
                  className="project-menu-item"
                  onClick={handleOpenCollaborators}
                >
                  Share project
                </button>
              )}
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

      {showCollaboratorsModal && (
        <div className="collaborators-modal-overlay" onClick={() => setShowCollaboratorsModal(false)}>
          <div className="collaborators-modal" onClick={e => e.stopPropagation()}>
            <div className="collaborators-modal-header">
              <h3>Share project</h3>
              <button type="button" className="collaborators-modal-close" onClick={() => setShowCollaboratorsModal(false)} aria-label="Close">×</button>
            </div>
            {shareError && (
              <div className="collaborators-error">
                <span>{shareError}</span>
                <button type="button" onClick={() => setShareError(null)}>×</button>
              </div>
            )}
            {canManageCollaborators && (
              <form className="collaborators-add-form" onSubmit={handleAddCollaborator}>
                <div className="collaborators-email-fields">
                  {shareEmailFields.map((row, index) => (
                    <div key={index} className="collaborators-email-row">
                      <input
                        type="text"
                        inputMode="email"
                        placeholder="Collaborator email"
                        value={row.email}
                        onChange={e => handleShareEmailChange(index, e.target.value)}
                        className="collaborators-email-input"
                      />
                      <select
                        value={row.permission || 'view'}
                        onChange={e => handleSharePermissionChange(index, e.target.value)}
                        className="collaborators-permission-select"
                        title="Access"
                      >
                        <option value="view">View only</option>
                        <option value="edit">Full access</option>
                      </select>
                      {shareEmailFields.length > 1 && (
                        <button
                          type="button"
                          className="collaborators-remove-field-btn"
                          onClick={() => handleRemoveShareField(index)}
                          aria-label="Remove field"
                          title="Remove"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="collaborators-add-row">
                  <button type="submit" disabled={shareAdding || shareRemoveLoading || !hasAnyShareEmail} className="collaborators-add-btn">
                    {shareAdding ? 'Adding...' : 'Add'}
                  </button>
                  <button type="button" className="collaborators-add-more-btn" onClick={handleAddMoreField} disabled={shareAdding || shareRemoveLoading}>
                    Add more
                  </button>
                </div>
              </form>
            )}
            <div className="collaborators-list">
              <h4>Everyone with access</h4>
              <ul>
                {project.ownerEmail && (
                  <li key="owner" className="collaborators-list-item collaborators-list-item-owner">
                    <span className="collaborators-email">{project.ownerEmail}</span>
                    <span className="collaborators-permission collaborators-permission-owner">Owner</span>
                  </li>
                )}
                {collaboratorsList.map(c => (
                  <li key={c.email} className="collaborators-list-item">
                    <span className="collaborators-email">{c.email}</span>
                    <span className="collaborators-permission">{c.permission === 'edit' ? 'Full access' : 'View only'}</span>
                      {(project.role === 'owner' || (c.email && c.email.toLowerCase() === currentUserEmail)) && (
                        <button
                          type="button"
                          className="collaborators-remove-btn"
                          onClick={() => handleRemoveCollaborator(c.email)}
                          disabled={shareAdding || shareRemoveLoading}
                          title={c.email && c.email.toLowerCase() === currentUserEmail ? 'Leave project' : 'Remove'}
                        >
                          {c.email && c.email.toLowerCase() === currentUserEmail ? 'Leave project' : 'Remove'}
                        </button>
                      )}
                  </li>
                ))}
              </ul>
              {!project.ownerEmail && collaboratorsList.length === 0 && pendingShareRequests.length === 0 && (
                <p className="collaborators-empty">No one has access yet.</p>
              )}
              {pendingShareRequests.length > 0 && (
                <>
                  <h4 className="collaborators-pending-title">Pending</h4>
                  <ul>
                    {pendingShareRequests.map((p) => (
                      <li key={p.email} className="collaborators-list-item collaborators-list-item-pending">
                        <span className="collaborators-email">{p.email}</span>
                        <span className="collaborators-permission">{p.permission === 'edit' ? 'Full access' : 'View only'}</span>
                        {project.role === 'owner' && (
                          <button
                            type="button"
                            className="collaborators-remove-btn"
                            onClick={() => handleRemoveCollaborator(p.email)}
                            disabled={shareAdding || shareRemoveLoading}
                            title="Cancel request"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
              isShared={collaboratorsList.length > 0}
              collaborators={[
                ...(project.ownerEmail ? [{ email: project.ownerEmail, label: project.ownerEmail.toLowerCase() === currentUserEmail ? 'You (owner)' : 'Owner' }] : []),
                ...(collaboratorsList || [])
                  .filter(c => c.email && c.email.toLowerCase() !== (project.ownerEmail || '').toLowerCase())
                  .map(c => ({ email: c.email, label: c.email.toLowerCase() === currentUserEmail ? 'You' : c.email }))
              ]}
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