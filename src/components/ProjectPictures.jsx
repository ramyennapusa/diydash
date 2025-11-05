import React, { useState } from 'react'
import '../styles/ProjectPictures.css'

const ProjectPictures = ({ pictures = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageErrors, setImageErrors] = useState({})
  const [imageLoading, setImageLoading] = useState({})

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

  if (!pictures || pictures.length === 0) {
    return (
      <div className="pictures-empty">
        <div className="empty-state">
          <span className="empty-icon">📸</span>
          <h3>No Pictures Yet</h3>
          <p>Pictures will appear here as the project progresses.</p>
        </div>
      </div>
    )
  }

  // Sort pictures by order
  const sortedPictures = [...pictures].sort((a, b) => a.order - b.order)

  return (
    <div className="project-pictures">
      <div className="pictures-header">
        <h3>Project Gallery</h3>
        <p>View progress photos and reference images for this project</p>
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