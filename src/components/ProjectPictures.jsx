import React, { useState } from 'react'
import '../styles/ProjectPictures.css'
import apiClient from '../services/api'

const ProjectPictures = ({ pictures = [], projectId, onUpdate }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageErrors, setImageErrors] = useState({})
  const [imageLoading, setImageLoading] = useState({})
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadFormData, setUploadFormData] = useState({
    file: null,
    caption: '',
    type: 'progress',
    preview: null
  })

  const handleImageClick = (picture) => {
    setSelectedImage(picture)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

  const handleImageError = (pictureId) => {
    setImageErrors(prev => ({ ...prev, [pictureId]: true }))
    setImageLoading(prev => ({ ...prev, [pictureId]: false }))
  }

  const handleImageLoad = (pictureId) => {
    setImageLoading(prev => ({ ...prev, [pictureId]: false }))
  }

  const handleImageLoadStart = (pictureId) => {
    setImageLoading(prev => ({ ...prev, [pictureId]: true }))
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'progress':
        return '🔄'
      case 'final':
        return '✅'
      case 'reference':
        return '📋'
      case 'step':
        return '👣'
      default:
        return '📸'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'progress':
        return 'Progress'
      case 'final':
        return 'Final Result'
      case 'reference':
        return 'Reference'
      case 'step':
        return 'Step'
      default:
        return 'Photo'
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Image size must be less than 10MB')
        return
      }

      setUploadError(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadFormData(prev => ({
          ...prev,
          file: file,
          preview: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    setUploadError(null)

    if (!uploadFormData.file) {
      setUploadError('Please select an image file')
      return
    }

    setUploading(true)

    try {
      // Convert file to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result
          // Remove data URL prefix if present
          const base64 = result.includes(',') ? result.split(',')[1] : result
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(uploadFormData.file)
      })

      // Get current project to add picture
      const project = await apiClient.getProject(projectId)
      const currentPictures = project.pictures || []
      
      // Create new picture object
      const newPicture = {
        id: `pic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageData: base64Data,
        imageContentType: uploadFormData.file.type,
        caption: uploadFormData.caption || 'Uploaded image',
        type: uploadFormData.type,
        order: currentPictures.length + 1
      }

      // Upload picture via API
      await apiClient.addPicture(projectId, newPicture)

      // Reset form
      setUploadFormData({
        file: null,
        caption: '',
        type: 'progress',
        preview: null
      })
      setShowUploadForm(false)

      // Refresh project data
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      console.error('Failed to upload picture:', err)
      setUploadError(err.message || 'Failed to upload picture. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleCancelUpload = () => {
    setUploadFormData({
      file: null,
      caption: '',
      type: 'progress',
      preview: null
    })
    setShowUploadForm(false)
    setUploadError(null)
  }

  const hasPictures = pictures && pictures.length > 0

  if (!hasPictures && !showUploadForm) {
    return (
      <div className="pictures-empty">
        <div className="empty-state">
          <span className="empty-icon">📸</span>
          <h3>No Pictures Yet</h3>
          <p>Upload pictures to track your project progress.</p>
          <button 
            className="upload-button"
            onClick={() => setShowUploadForm(true)}
          >
            + Upload Picture
          </button>
        </div>
      </div>
    )
  }

  // Sort pictures by order
  const sortedPictures = [...pictures].sort((a, b) => a.order - b.order)

  return (
    <div className="project-pictures">
      <div className="pictures-header">
        <div></div>
        <button 
          className="upload-button"
          onClick={() => setShowUploadForm(true)}
        >
          + Upload Picture
        </button>
      </div>

      <div className="pictures-grid">
        {sortedPictures.map((picture) => (
          <div key={picture.id} className="picture-card">
            <div className="picture-container">
              {imageLoading[picture.id] && (
                <div className="image-loading">
                  <div className="loading-spinner"></div>
                </div>
              )}
              
              {imageErrors[picture.id] ? (
                <div className="image-error">
                  <span className="error-icon">🖼️</span>
                  <p>Image not available</p>
                </div>
              ) : (
                <img
                  src={picture.url}
                  alt={picture.caption}
                  className="picture-image"
                  onClick={() => handleImageClick(picture)}
                  onLoad={() => handleImageLoad(picture.id)}
                  onError={() => handleImageError(picture.id)}
                  onLoadStart={() => handleImageLoadStart(picture.id)}
                />
              )}
              
              <div className="picture-overlay">
                <button 
                  className="view-button"
                  onClick={() => handleImageClick(picture)}
                  disabled={imageErrors[picture.id]}
                >
                  🔍 View
                </button>
              </div>
            </div>
            
            <div className="picture-info">
              <div className="picture-type">
                <span className="type-icon">{getTypeIcon(picture.type)}</span>
                <span className="type-label">{getTypeLabel(picture.type)}</span>
              </div>
              <p className="picture-caption">{picture.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="upload-modal-overlay" onClick={handleCancelUpload}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-header">
              <h3>Upload Picture</h3>
              <button className="close-button" onClick={handleCancelUpload}>✕</button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="upload-form">
              {uploadError && <div className="upload-error">{uploadError}</div>}
              
              <div className="upload-preview">
                {uploadFormData.preview ? (
                  <img src={uploadFormData.preview} alt="Preview" className="preview-image" />
                ) : (
                  <div className="preview-placeholder">
                    <span>📸</span>
                    <p>Image preview will appear here</p>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="picture-file">Select Image *</label>
                <input
                  type="file"
                  id="picture-file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                <p className="form-hint">Max file size: 10MB</p>
              </div>

              <div className="form-group">
                <label htmlFor="picture-caption">Caption</label>
                <input
                  type="text"
                  id="picture-caption"
                  value={uploadFormData.caption}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Describe this picture..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="picture-type">Type</label>
                <select
                  id="picture-type"
                  value={uploadFormData.type}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="progress">🔄 Progress</option>
                  <option value="final">✅ Final Result</option>
                  <option value="reference">📋 Reference</option>
                  <option value="step">👣 Step</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancelUpload} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={uploading || !uploadFormData.file}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-modal" onClick={handleCloseModal}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseModal}>
              ✕
            </button>
            
            <div className="lightbox-image-container">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="lightbox-image"
              />
            </div>
            
            <div className="lightbox-info">
              <div className="lightbox-type">
                <span className="type-icon">{getTypeIcon(selectedImage.type)}</span>
                <span className="type-label">{getTypeLabel(selectedImage.type)}</span>
              </div>
              <h4 className="lightbox-caption">{selectedImage.caption}</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectPictures