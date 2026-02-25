import React, { useState, useRef } from 'react'
import '../styles/ProjectPictures.css'
import apiClient from '../services/api'

const ProjectPictures = ({ pictures = [], projectId, onUpdate }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageErrors, setImageErrors] = useState({})
  const [imageLoading, setImageLoading] = useState({})
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [uploadError, setUploadError] = useState(null)
  const [deletingPictureId, setDeletingPictureId] = useState(null)
  const [showImageMenu, setShowImageMenu] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const clickZoomTimeoutRef = useRef(null)
  const [uploadFormData, setUploadFormData] = useState({
    files: [],
    captions: {},
    previews: []
  })

  // Debug: Log picture URLs when they change
  React.useEffect(() => {
    if (pictures && pictures.length > 0) {
      console.log('ProjectPictures: Received pictures:', pictures.map(p => ({
        id: p.id,
        url: p.url,
        urlType: p.url?.startsWith('http') ? 'presigned' : 's3-key',
        caption: p.caption
      })))
    }
  }, [pictures])

  const handleImageClick = (picture) => {
    setSelectedImage(picture)
    setZoomLevel(1) // Reset zoom when opening a new image
  }

  const handleSearchImage = async (e, imageUrl) => {
    e.stopPropagation()
    if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
      alert('Image URL is not available for search')
      return
    }

    // Try Yandex first as it often works better with S3 presigned URLs
    const yandexUrl = `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}`
    window.open(yandexUrl, '_blank', 'noopener,noreferrer')
    
    // Also try Google Images (may not work with CORS-restricted URLs)
    setTimeout(() => {
      const googleUrl = `https://www.google.com/searchbyimage?image_url=${encodeURIComponent(imageUrl)}&safe=off`
      window.open(googleUrl, '_blank', 'noopener,noreferrer')
    }, 500)
    
    // Try TinEye as well
    setTimeout(() => {
      const tineyeUrl = `https://tineye.com/search?url=${encodeURIComponent(imageUrl)}`
      window.open(tineyeUrl, '_blank', 'noopener,noreferrer')
    }, 1000)
  }

  const handleDownloadImage = async (e, imageUrl, caption) => {
    e.stopPropagation()
    if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
      alert('Image URL is not available for download')
      return
    }

    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Use caption as filename if available, otherwise use timestamp
      const filename = caption && caption.trim() 
        ? `${caption.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`
        : `image_${Date.now()}.jpg`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Failed to download image. Please try again.')
    }
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
    setShowImageMenu(false)
    setZoomLevel(1) // Reset zoom when closing
  }

  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 5)) // Max zoom 5x
  }

  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25)) // Min zoom 0.25x
  }

  // Reset zoom
  const handleZoomReset = () => {
    setZoomLevel(1)
  }

  // Click on image: zoom in (delay so double-click can cancel)
  const handleImageClickZoom = (e) => {
    e.stopPropagation()
    if (clickZoomTimeoutRef.current) return // ignore if we're about to fire a delayed zoom
    clickZoomTimeoutRef.current = setTimeout(() => {
      clickZoomTimeoutRef.current = null
      handleZoomIn()
    }, 200)
  }

  // Double-click on image: reset zoom
  const handleImageDoubleClickZoom = (e) => {
    e.stopPropagation()
    if (clickZoomTimeoutRef.current) {
      clearTimeout(clickZoomTimeoutRef.current)
      clickZoomTimeoutRef.current = null
    }
    handleZoomReset()
  }

  // Right-click on image: zoom out
  const handleImageRightClickZoom = (e) => {
    e.preventDefault()
    e.stopPropagation()
    handleZoomOut()
  }

  // Get current image index
  const getCurrentImageIndex = () => {
    if (!selectedImage || !pictures || pictures.length === 0) return -1
    return pictures.findIndex(pic => pic.id === selectedImage.id)
  }

  // Navigate to previous image
  const handlePreviousImage = (e) => {
    e.stopPropagation()
    const currentIndex = getCurrentImageIndex()
    if (currentIndex > 0) {
      setSelectedImage(pictures[currentIndex - 1])
      setZoomLevel(1) // Reset zoom when navigating
    } else if (pictures.length > 0) {
      // Loop to last image
      setSelectedImage(pictures[pictures.length - 1])
      setZoomLevel(1) // Reset zoom when navigating
    }
  }

  // Navigate to next image
  const handleNextImage = (e) => {
    e.stopPropagation()
    const currentIndex = getCurrentImageIndex()
    if (currentIndex < pictures.length - 1) {
      setSelectedImage(pictures[currentIndex + 1])
      setZoomLevel(1) // Reset zoom when navigating
    } else if (pictures.length > 0) {
      // Loop to first image
      setSelectedImage(pictures[0])
      setZoomLevel(1) // Reset zoom when navigating
    }
  }

  // Handle keyboard navigation and zoom
  React.useEffect(() => {
    if (!selectedImage || !pictures || pictures.length === 0) return

    const handleKeyDown = (e) => {
      // Zoom controls
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      } else if (e.key === '0') {
        e.preventDefault()
        handleZoomReset()
      }
      // Navigation
      else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const currentIndex = pictures.findIndex(pic => pic.id === selectedImage.id)
        if (currentIndex > 0) {
          setSelectedImage(pictures[currentIndex - 1])
          setZoomLevel(1) // Reset zoom when navigating
        } else if (pictures.length > 0) {
          setSelectedImage(pictures[pictures.length - 1])
          setZoomLevel(1) // Reset zoom when navigating
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const currentIndex = pictures.findIndex(pic => pic.id === selectedImage.id)
        if (currentIndex < pictures.length - 1) {
          setSelectedImage(pictures[currentIndex + 1])
          setZoomLevel(1) // Reset zoom when navigating
        } else if (pictures.length > 0) {
          setSelectedImage(pictures[0])
          setZoomLevel(1) // Reset zoom when navigating
        }
      } else if (e.key === 'Escape') {
        setSelectedImage(null)
        setShowImageMenu(false)
        setZoomLevel(1) // Reset zoom when closing
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage, pictures])

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!showImageMenu) return

    const handleClickOutside = (e) => {
      if (!e.target.closest('.lightbox-menu-container')) {
        setShowImageMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showImageMenu])

  const handleImageError = (pictureId, pictureUrl) => {
    console.error(`Failed to load image for picture ${pictureId}:`, pictureUrl)
    setImageErrors(prev => ({ ...prev, [pictureId]: true }))
    setImageLoading(prev => ({ ...prev, [pictureId]: false }))
  }

  const handleImageLoad = (pictureId) => {
    setImageLoading(prev => ({ ...prev, [pictureId]: false }))
  }

  const handleImageLoadStart = (pictureId) => {
    setImageLoading(prev => ({ ...prev, [pictureId]: true }))
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) {
      return
    }

    setUploadError(null)
    const validFiles = []
    const invalidFiles = []

    // Validate all files
    selectedFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name}: Not an image file`)
      } else if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name}: File size must be less than 10MB`)
      } else {
        validFiles.push(file)
      }
    })

    if (invalidFiles.length > 0) {
      setUploadError(`Some files were invalid:\n${invalidFiles.join('\n')}`)
    }

    if (validFiles.length === 0) {
      return
    }

    // Create previews for all valid files
    const previewPromises = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve({
            file,
            preview: reader.result
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(previewPromises).then(previews => {
      setUploadFormData(prev => ({
        ...prev,
        files: [...prev.files, ...previews.map(p => p.file)],
        previews: [...prev.previews, ...previews.map(p => p.preview)]
      }))
    })
  }

  const handleRemoveFile = (index) => {
    setUploadFormData(prev => {
      const newFiles = [...prev.files]
      const newPreviews = [...prev.previews]
      const newCaptions = { ...prev.captions }
      
      newFiles.splice(index, 1)
      newPreviews.splice(index, 1)
      
      // Reindex captions
      const reindexedCaptions = {}
      Object.keys(newCaptions).forEach(key => {
        const oldIndex = parseInt(key)
        if (oldIndex > index) {
          reindexedCaptions[oldIndex - 1] = newCaptions[oldIndex]
        } else if (oldIndex < index) {
          reindexedCaptions[oldIndex] = newCaptions[oldIndex]
        }
      })
      
      return {
        files: newFiles,
        previews: newPreviews,
        captions: reindexedCaptions
      }
    })
    
    // Reset file input to allow selecting the same file again
    const fileInput = document.getElementById('picture-file')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    setUploadError(null)

    if (uploadFormData.files.length === 0) {
      setUploadError('Please select at least one image file')
      return
    }

    setUploading(true)

    try {
      // Get current project to determine starting order
      const project = await apiClient.getProject(projectId)
      const currentPictures = project.pictures || []
      let currentOrder = currentPictures.length

      // Upload all files sequentially to avoid race conditions
      // Each upload reads the project state, so parallel uploads would overwrite each other
      const totalFiles = uploadFormData.files.length
      setUploadProgress({ current: 0, total: totalFiles })
      
      for (let index = 0; index < uploadFormData.files.length; index++) {
        const file = uploadFormData.files[index]
        setUploadProgress({ current: index + 1, total: totalFiles })
        
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
          reader.readAsDataURL(file)
        })

        // Get updated project state to get current picture count
        const updatedProject = await apiClient.getProject(projectId)
        const updatedPictures = updatedProject.pictures || []
        currentOrder = updatedPictures.length

        // Create new picture object
        const newPicture = {
          id: `pic-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          imageData: base64Data,
          imageContentType: file.type,
          caption: uploadFormData.captions[index] || '',
          order: currentOrder + 1
        }

        // Upload picture via API (sequentially)
        await apiClient.addPicture(projectId, newPicture)
      }

      // Reset form
      setUploadFormData({
        files: [],
        captions: {},
        previews: []
      })
      setShowUploadForm(false)
      
      // Reset file input
      const fileInput = document.getElementById('picture-file')
      if (fileInput) {
        fileInput.value = ''
      }

      // Refresh project data to get new presigned URLs
      if (onUpdate) {
        console.log('Refreshing project data after picture upload...')
        await onUpdate()
        console.log('Project data refreshed')
      }
    } catch (err) {
      console.error('Failed to upload pictures:', err)
      setUploadError(err.message || 'Failed to upload pictures. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleCancelUpload = () => {
    setUploadFormData({
      files: [],
      captions: {},
      previews: []
    })
    setShowUploadForm(false)
    setUploadError(null)
    // Reset file input
    const fileInput = document.getElementById('picture-file')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleDeletePicture = async (pictureId, closeLightbox = false) => {
    if (!window.confirm('Are you sure you want to delete this picture?')) {
      return
    }

    try {
      setDeletingPictureId(pictureId)
      setUploadError(null)
      
      // If deleting from lightbox, determine navigation before deletion
      let nextImage = null
      if (closeLightbox && selectedImage && selectedImage.id === pictureId) {
        const currentIndex = getCurrentImageIndex()
        const updatedPictures = pictures.filter(p => p.id !== pictureId)
        
        if (updatedPictures.length === 0) {
          // No pictures left, will close lightbox
          nextImage = null
        } else if (currentIndex < updatedPictures.length) {
          // Navigate to next image (or same index if available)
          nextImage = updatedPictures[currentIndex]
        } else if (currentIndex > 0) {
          // Navigate to previous image
          nextImage = updatedPictures[currentIndex - 1]
        } else {
          // Fallback to first image
          nextImage = updatedPictures[0]
        }
      }
      
      await apiClient.deletePicture(projectId, pictureId)
      
      // If deleting from lightbox, navigate or close
      if (closeLightbox && selectedImage && selectedImage.id === pictureId) {
        if (nextImage) {
          setSelectedImage(nextImage)
        } else {
          setSelectedImage(null)
        }
      }
      
      // Refresh project data
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      console.error('Failed to delete picture:', err)
      setUploadError(err.message || 'Failed to delete picture. Please try again.')
    } finally {
      setDeletingPictureId(null)
    }
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
            <div 
              className="picture-container"
              onClick={() => !imageErrors[picture.id] && handleImageClick(picture)}
              style={{ cursor: imageErrors[picture.id] ? 'default' : 'pointer' }}
            >
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
              ) : !picture.url || (!picture.url.startsWith('http://') && !picture.url.startsWith('https://')) ? (
                <div className="image-error">
                  <span className="error-icon">🖼️</span>
                  <p>Invalid image URL</p>
                </div>
              ) : (
                <img
                  src={picture.url}
                  alt={picture.caption || 'Project picture'}
                  className="picture-image"
                  onLoad={() => handleImageLoad(picture.id)}
                  onError={(e) => {
                    console.error('Image load error:', {
                      pictureId: picture.id,
                      url: picture.url,
                      urlType: picture.url?.startsWith('http') ? 'presigned' : 's3-key',
                      error: e
                    })
                    handleImageError(picture.id, picture.url)
                  }}
                  onLoadStart={() => handleImageLoadStart(picture.id)}
                />
              )}
              
              <div className="picture-overlay">
                <button 
                  className="view-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleImageClick(picture)
                  }}
                  disabled={imageErrors[picture.id]}
                >
                  🔍 View
                </button>
                <button 
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePicture(picture.id)
                  }}
                  disabled={deletingPictureId === picture.id || imageErrors[picture.id]}
                  title="Delete picture"
                >
                  {deletingPictureId === picture.id ? '⏳' : '×'}
                </button>
              </div>
            </div>
            
            {picture.caption && picture.caption.trim() !== '' && picture.caption.trim() !== 'Uploaded picture' && (
              <div className="picture-info">
                <p className="picture-caption">{picture.caption}</p>
              </div>
            )}
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
              
              <div className="form-group">
                <label htmlFor="picture-file">Select Images *</label>
                <input
                  type="file"
                  id="picture-file"
                  accept="image/*"
                  onChange={handleFileChange}
                  multiple
                  required={uploadFormData.files.length === 0}
                />
                <p className="form-hint">Max file size: 10MB per image. You can select multiple images.</p>
              </div>

              {uploadFormData.previews.length > 0 && (
                <div className="upload-previews-container">
                  <h4 className="previews-title">Selected Images ({uploadFormData.previews.length})</h4>
                  <div className="upload-previews-grid">
                    {uploadFormData.previews.map((preview, index) => (
                      <div key={index} className="upload-preview-item">
                        <div className="preview-image-wrapper">
                          <img src={preview} alt={`Preview ${index + 1}`} className="preview-image" />
                          <button
                            type="button"
                            className="remove-preview-button"
                            onClick={() => handleRemoveFile(index)}
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          className="preview-caption-input"
                          placeholder="Caption (optional)"
                          value={uploadFormData.captions[index] || ''}
                          onChange={(e) => setUploadFormData(prev => ({
                            ...prev,
                            captions: {
                              ...prev.captions,
                              [index]: e.target.value
                            }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={handleCancelUpload} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={uploading || uploadFormData.files.length === 0}>
                  {uploading 
                    ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...` 
                    : `Upload ${uploadFormData.files.length > 0 ? uploadFormData.files.length : ''} Image${uploadFormData.files.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && pictures.length > 0 && (
        <div className="lightbox-modal" onClick={handleCloseModal}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseModal}>
              ✕
            </button>
            
            <div className="lightbox-menu-container">
              <button 
                className="lightbox-menu-button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowImageMenu(!showImageMenu)
                }}
                title="More options"
                aria-label="More options"
              >
                ⋮
              </button>
              
              {showImageMenu && (
                <div className="lightbox-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="lightbox-menu-item"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadImage(e, selectedImage.url, selectedImage.caption)
                      setShowImageMenu(false)
                    }}
                  >
                    <span className="menu-item-icon">⬇️</span>
                    <span className="menu-item-text">Download Image</span>
                  </button>
                  <button
                    className="lightbox-menu-item lightbox-menu-item-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePicture(selectedImage.id, true)
                      setShowImageMenu(false)
                    }}
                    disabled={deletingPictureId === selectedImage.id}
                  >
                    <span className="menu-item-icon">🗑️</span>
                    <span className="menu-item-text">
                      {deletingPictureId === selectedImage.id ? 'Deleting...' : 'Delete Image'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            <button 
              className="lightbox-search-button"
              onClick={(e) => handleSearchImage(e, selectedImage.url)}
              title="Search image origin (opens Google & Yandex)"
              aria-label="Search image origin"
            >
              🔍
            </button>
            
            {pictures.length > 1 && (
              <>
                <button 
                  className="lightbox-nav-button lightbox-nav-prev" 
                  onClick={handlePreviousImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button 
                  className="lightbox-nav-button lightbox-nav-next" 
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
            
            <div className="lightbox-image-wrapper">
              <div className="lightbox-image-container">
                <img
                  src={selectedImage.url && (selectedImage.url.startsWith('http://') || selectedImage.url.startsWith('https://')) ? selectedImage.url : ''}
                  alt={selectedImage.caption}
                  className="lightbox-image"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}
                  onClick={handleImageClickZoom}
                  onDoubleClick={handleImageDoubleClickZoom}
                  onContextMenu={handleImageRightClickZoom}
                  title="Click to zoom in, double-click to reset, right-click to zoom out"
                />
              </div>
            </div>
            
            {pictures.length > 1 && (
              <div className="lightbox-counter">
                {getCurrentImageIndex() + 1} / {pictures.length}
              </div>
            )}
            
            {zoomLevel !== 1 && (
              <div className="lightbox-zoom-indicator">
                {Math.round(zoomLevel * 100)}%
              </div>
            )}
            
            {selectedImage.caption && selectedImage.caption.trim() !== '' && selectedImage.caption.trim() !== 'Uploaded picture' && (
              <div className="lightbox-info">
                <h4 className="lightbox-caption">{selectedImage.caption}</h4>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectPictures