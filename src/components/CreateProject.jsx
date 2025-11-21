import { useState } from 'react'
import './CreateProject.css'

const DEFAULT_PROJECT_IMAGE = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'

function CreateProject({ onClose, onCreateProject, isCreating = false }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    status: 'Planning'
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Update preview if image URL changes
    if (name === 'image' && value) {
      setPreviewImage(value)
    } else if (name === 'image' && !value) {
      setPreviewImage(null)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Create a local preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
        // Store the file as base64 data URL for S3 upload
        // The API will handle uploading to S3
        setFormData(prev => ({
          ...prev,
          image: reader.result // Store as data URL for preview
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Prepare project data
    const projectData = {
      title: formData.title.trim(),
      description: (formData.description || '').trim() || '',
      status: formData.status || 'Planning'
    }

    // Handle image: if it's a data URL (from file upload), extract base64 for S3 upload
    // If it's a regular URL, send it as is
    if (formData.image) {
      if (formData.image.startsWith('data:')) {
        // It's a data URL from file upload - extract base64 for S3 upload
        const base64Match = formData.image.match(/^data:([^;]+);base64,(.+)$/)
        if (base64Match) {
          projectData.imageData = base64Match[2] // Base64 string without prefix
          projectData.imageContentType = base64Match[1] || 'image/jpeg'
        }
      } else if (formData.image.trim()) {
        // It's a regular URL
        projectData.image = formData.image.trim()
      }
    }

    try {
      setSubmitError(null)
      if (onCreateProject) {
        await onCreateProject(projectData)
        // Reset form on success
        setFormData({
          title: '',
          description: '',
          image: '',
          status: 'Planning'
        })
        setPreviewImage(null)
        setErrors({})
        onClose()
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to create project. Please try again.')
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      status: 'Planning'
    })
    setPreviewImage(null)
    setErrors({})
    onClose()
  }

  const displayImage = previewImage || formData.image || DEFAULT_PROJECT_IMAGE

  return (
    <div className="create-project-overlay" onClick={handleCancel}>
      <div className="create-project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-project-header">
          <h2>Create New Project</h2>
          <button 
            className="create-project-close"
            onClick={handleCancel}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-project-form">
          {submitError && (
            <div className="form-error-banner">
              <span className="error-icon">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}
          
          {/* Image Preview Section */}
          <div className="form-section">
            <label htmlFor="image-preview" className="form-label">
              Project Image
            </label>
            <div className="image-preview-container">
              <img 
                src={displayImage} 
                alt="Project preview" 
                className="image-preview"
                onError={(e) => {
                  e.target.src = DEFAULT_PROJECT_IMAGE
                }}
              />
              <div className="image-preview-overlay">
                <label htmlFor="image-upload" className="image-change-button">
                  Change Image
                </label>
              </div>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="image-upload-input"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="form-section">
            <label htmlFor="title" className="form-label">
              Project Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Wooden Coffee Table"
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              required
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-section">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project..."
              rows="4"
              className={`form-textarea ${errors.description ? 'input-error' : ''}`}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          {/* Status */}
          <div className="form-section">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProject

