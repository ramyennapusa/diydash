import { useState } from 'react'
import apiClient from '../services/api'
import './CreateProject.css'

const DEFAULT_PROJECT_IMAGE = '/draft2done-login-bg.png'

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
  const [suggestedTasks, setSuggestedTasks] = useState([])
  const [loadingAI, setLoadingAI] = useState(false)
  const [selectedTitles, setSelectedTitles] = useState(new Set())
  const [aiError, setAiError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    if (name === 'image' && value) {
      setPreviewImage(value)
    } else if (name === 'image' && !value) {
      setPreviewImage(null)
    }

    // Clear stale suggestions if title or description changes
    if (name === 'title' || name === 'description') {
      setSuggestedTasks([])
      setSelectedTitles(new Set())
      setAiError(null)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSuggestTasks = async () => {
    setLoadingAI(true)
    setAiError(null)
    try {
      const result = await apiClient.generateTasks(formData.title.trim(), formData.description.trim())
      const tasks = result?.tasks || []
      setSuggestedTasks(tasks)
      setSelectedTitles(new Set(tasks))
    } catch (err) {
      console.error('generateTasks error:', err)
      setAiError('Could not generate tasks. Please try again.')
    } finally {
      setLoadingAI(false)
    }
  }

  const toggleTask = (title) => {
    setSelectedTitles(prev => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const projectData = {
      title: formData.title.trim(),
      description: (formData.description || '').trim() || '',
      status: formData.status || 'Planning'
    }

    if (formData.image) {
      if (formData.image.startsWith('data:')) {
        const base64Match = formData.image.match(/^data:([^;]+);base64,(.+)$/)
        if (base64Match) {
          projectData.imageData = base64Match[2]
          projectData.imageContentType = base64Match[1] || 'image/jpeg'
        }
      } else if (formData.image.trim()) {
        projectData.image = formData.image.trim()
      }
    }

    if (selectedTitles.size > 0) {
      projectData.suggestedTaskTitles = [...selectedTitles]
    }

    try {
      setSubmitError(null)
      if (onCreateProject) {
        await onCreateProject(projectData)
        setFormData({
          title: '',
          description: '',
          image: '',
          status: 'Planning'
        })
        setPreviewImage(null)
        setErrors({})
        setSuggestedTasks([])
        setSelectedTitles(new Set())
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
    setSuggestedTasks([])
    setSelectedTitles(new Set())
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
            <button
              type="button"
              className="btn-suggest-tasks"
              onClick={handleSuggestTasks}
              disabled={!formData.title.trim() || loadingAI}
            >
              {loadingAI ? 'Generating...' : '✨ Suggest tasks'}
            </button>
            {aiError && (
              <span className="error-message">{aiError}</span>
            )}
          </div>

          {/* Suggested Tasks Checklist */}
          {suggestedTasks.length > 0 && (
            <div className="form-section">
              <label className="form-label">Suggested Tasks</label>
              <p className="form-hint">Uncheck any tasks you don't want.</p>
              <div className="suggested-tasks-list">
                {suggestedTasks.map((title) => (
                  <label key={title} className="suggested-task-item">
                    <input
                      type="checkbox"
                      checked={selectedTitles.has(title)}
                      onChange={() => toggleTask(title)}
                    />
                    <span>{title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
