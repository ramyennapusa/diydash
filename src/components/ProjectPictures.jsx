import React, { useState, useRef } from 'react'
import '../styles/ProjectPictures.css'
import apiClient from '../services/api'
import ResolvedImage from './ResolvedImage'
import { getS3ObjectUrl, isS3MediaConfigured } from '../services/s3Media'

const ProjectPictures = ({ pictures = [], projectId, onUpdate, isDemo = false, isParentLoading = false }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageErrors, setImageErrors] = useState({})
  const [imageLoading, setImageLoading] = useState({})
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [uploadError, setUploadError] = useState(null)
  const [deletingPictureId, setDeletingPictureId] = useState(null)
  const [showImageMenu, setShowImageMenu] = useState(false)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedPictureIds, setSelectedPictureIds] = useState(new Set())
  const [deletingSelected, setDeletingSelected] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isShoppingMode, setIsShoppingMode] = useState(false)
  const [shopPin, setShopPin] = useState(null)       // { x, y } as 0-1 floats
  const [shopResult, setShopResult] = useState(null) // null | {loading:true} | {product,listings} | {error}
  const clickZoomTimeoutRef = useRef(null)
  const shopRequestIdRef = useRef(0)
  const [uploadFormData, setUploadFormData] = useState({
    files: [],
    captions: {},
    previews: []
  })

  const handleImageClick = (picture) => {
    setSelectedImage(picture)
    setZoomLevel(1) // Reset zoom when opening a new image
  }

  const handleSearchImage = async (e, imageUrl) => {
    e.stopPropagation()
    if (!imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
      alert('Reverse image search is not available for images stored in the app.')
      return
    }

    const googleUrl = `https://www.google.com/searchbyimage?image_url=${encodeURIComponent(imageUrl)}&safe=off`
    window.open(googleUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadImage = async (e, imageUrlOrKey, caption) => {
    e.stopPropagation()
    if (!imageUrlOrKey) {
      alert('Image is not available for download')
      return
    }

    const isHttp = imageUrlOrKey.startsWith('http://') || imageUrlOrKey.startsWith('https://')

    try {
      let url
      if (isHttp) {
        const response = await fetch(imageUrlOrKey)
        if (!response.ok) throw new Error('Failed to fetch image')
        const blob = await response.blob()
        url = window.URL.createObjectURL(blob)
      } else if (isS3MediaConfigured) {
        url = await getS3ObjectUrl(imageUrlOrKey)
        if (!url) throw new Error('Failed to load image')
      } else {
        alert('Image is not available for download')
        return
      }

      const link = document.createElement('a')
      link.href = url
      const filename = caption && caption.trim()
        ? `${caption.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`
        : `image_${Date.now()}.jpg`
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      if (!isHttp && url) window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
      alert(err.message || 'Failed to download image')
    }
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
    setShowImageMenu(false)
    setZoomLevel(1)
    setIsShoppingMode(false)
    setShopPin(null)
    setShopResult(null)
  }

  const handleToggleShoppingMode = (e) => {
    e.stopPropagation()
    setIsShoppingMode(prev => {
      if (prev) { setShopPin(null); setShopResult(null) }
      return !prev
    })
  }

  const cropImageAtClick = (img, clickX, clickY) => {
    try {
      const natW = img.naturalWidth
      const natH = img.naturalHeight
      if (!natW || !natH) return null
      const cropSize = Math.min(natW, natH) * 0.4
      const cropLeft = Math.max(0, Math.min(natW - cropSize, clickX * natW - cropSize / 2))
      const cropTop = Math.max(0, Math.min(natH - cropSize, clickY * natH - cropSize / 2))
      const outSize = Math.min(Math.round(cropSize), 800)
      const canvas = document.createElement('canvas')
      canvas.width = outSize
      canvas.height = outSize
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, cropLeft, cropTop, cropSize, cropSize, 0, 0, outSize, outSize)
      return canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
    } catch {
      return null  // Canvas tainted (CORS) — fall back to coordinate-based identification
    }
  }

  const handleImageShopClick = async (e) => {
    if (!isShoppingMode) return
    e.stopPropagation()
    const img = e.currentTarget
    const rect = img.getBoundingClientRect()

    // object-fit: contain adds letterbox margins — calculate actual rendered image bounds
    const naturalW = img.naturalWidth || rect.width
    const naturalH = img.naturalHeight || rect.height
    const elementAspect = rect.width / rect.height
    const imageAspect = naturalW / naturalH
    let renderedW, renderedH, offsetX, offsetY
    if (imageAspect > elementAspect) {
      renderedW = rect.width
      renderedH = rect.width / imageAspect
      offsetX = 0
      offsetY = (rect.height - renderedH) / 2
    } else {
      renderedH = rect.height
      renderedW = rect.height * imageAspect
      offsetX = (rect.width - renderedW) / 2
      offsetY = 0
    }
    const clickX = Math.max(0, Math.min(1, (e.clientX - rect.left - offsetX) / renderedW))
    const clickY = Math.max(0, Math.min(1, (e.clientY - rect.top - offsetY) / renderedH))
    // Pin is positioned inside the container (full element box), so convert back to container fractions
    const pinX = (offsetX + clickX * renderedW) / rect.width
    const pinY = (offsetY + clickY * renderedH) / rect.height
    setShopPin({ x: pinX, y: pinY })
    setShopResult({ loading: true })

    // Stamp this request so stale responses from earlier clicks are ignored
    shopRequestIdRef.current += 1
    const requestId = shopRequestIdRef.current

    // Crop the image around the click point — Claude identifies what's in the crop rather than
    // guessing at percentage coordinates, which is far more reliable
    const imageData = cropImageAtClick(img, clickX, clickY)

    const picture = selectedImage
    const isHttpUrl = picture.url?.startsWith('http://') || picture.url?.startsWith('https://')
    const s3Key = isHttpUrl ? null : (picture.key || picture.url)
    const imageUrl = isHttpUrl ? picture.url : null

    let product
    try {
      // Phase 1: Claude identifies the product (~5-8s)
      const identified = await apiClient.identifyAtPoint(s3Key, imageUrl, clickX, clickY, imageData)
      if (shopRequestIdRef.current !== requestId) return  // a newer click superseded this one
      product = identified.product
      if (!product) {
        setShopResult({ product: null })
        return
      }
      setShopResult({ product, listings: null, loadingListings: true })
    } catch (err) {
      if (shopRequestIdRef.current !== requestId) return
      console.error('identifyAtPoint error:', err)
      setShopResult({ error: 'Could not identify product. Please try again.' })
      return
    }

    try {
      // Phase 2: SerpAPI listings
      const result = await apiClient.fetchProductListings(product.searchQuery)
      if (shopRequestIdRef.current !== requestId) return
      setShopResult({ product, listings: result.listings || [] })
    } catch (err) {
      if (shopRequestIdRef.current !== requestId) return
      console.error('fetchProductListings error:', err)
      setShopResult({ product, listings: [] })
    }
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
    setIsShoppingMode(false)
    setShopPin(null)
    setShopResult(null)
    if (currentIndex > 0) {
      setSelectedImage(pictures[currentIndex - 1])
      setZoomLevel(1)
    } else if (pictures.length > 0) {
      setSelectedImage(pictures[pictures.length - 1])
      setZoomLevel(1)
    }
  }

  // Navigate to next image
  const handleNextImage = (e) => {
    e.stopPropagation()
    const currentIndex = getCurrentImageIndex()
    setIsShoppingMode(false)
    setShopPin(null)
    setShopResult(null)
    if (currentIndex < pictures.length - 1) {
      setSelectedImage(pictures[currentIndex + 1])
      setZoomLevel(1)
    } else if (pictures.length > 0) {
      setSelectedImage(pictures[0])
      setZoomLevel(1)
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
        setIsShoppingMode(false); setShopPin(null); setShopResult(null)
        if (currentIndex > 0) {
          setSelectedImage(pictures[currentIndex - 1])
          setZoomLevel(1)
        } else if (pictures.length > 0) {
          setSelectedImage(pictures[pictures.length - 1])
          setZoomLevel(1)
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const currentIndex = pictures.findIndex(pic => pic.id === selectedImage.id)
        setIsShoppingMode(false); setShopPin(null); setShopResult(null)
        if (currentIndex < pictures.length - 1) {
          setSelectedImage(pictures[currentIndex + 1])
          setZoomLevel(1)
        } else if (pictures.length > 0) {
          setSelectedImage(pictures[0])
          setZoomLevel(1)
        }
      } else if (e.key === 'Escape') {
        setSelectedImage(null)
        setShowImageMenu(false)
        setZoomLevel(1)
        setIsShoppingMode(false); setShopPin(null); setShopResult(null)
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

      // Refresh project data so new pictures appear with resolved media URLs
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

  const handleEnterSelectionMode = () => {
    setIsSelectionMode(true)
    setSelectedPictureIds(new Set())
  }

  const handleExitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedPictureIds(new Set())
  }

  const handleToggleSelectPicture = (pictureId) => {
    setSelectedPictureIds(prev => {
      const next = new Set(prev)
      if (next.has(pictureId)) next.delete(pictureId)
      else next.add(pictureId)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedPictureIds.size === sortedPictures.length) {
      setSelectedPictureIds(new Set())
    } else {
      setSelectedPictureIds(new Set(sortedPictures.map(p => p.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedPictureIds.size === 0) return
    const count = selectedPictureIds.size
    if (!window.confirm(`Delete ${count} selected image${count !== 1 ? 's' : ''}? This cannot be undone.`)) return

    setDeletingSelected(true)
    try {
      // Fetch project once, filter out all selected ids in one update
      const project = await apiClient.getProject(projectId)
      const remaining = (project.pictures || []).filter(p => !selectedPictureIds.has(p.id))
      await apiClient.updateProject(projectId, { pictures: remaining })
      handleExitSelectionMode()
      if (onUpdate) onUpdate(false)
    } catch (err) {
      console.error('Failed to delete pictures:', err)
      setUploadError(err.message || 'Failed to delete pictures. Please try again.')
    } finally {
      setDeletingSelected(false)
    }
  }

  const hasPictures = pictures && pictures.length > 0

  if (isParentLoading && !hasPictures && !showUploadForm) {
    return (
      <div className="pictures-empty">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading pictures…</p>
        </div>
      </div>
    )
  }

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
        {!isDemo && (
          <button
            className="upload-button"
            onClick={() => setShowUploadForm(true)}
          >
            + Upload Picture
          </button>
        )}
      </div>

      {!isDemo && hasPictures && !isSelectionMode && (
        <div className="pictures-select-row">
          <button className="select-pictures-link" onClick={handleEnterSelectionMode}>
            Select
          </button>
        </div>
      )}

      {isSelectionMode && (
        <div className="pictures-selection-bar">
          <span className="pictures-selection-count">
            {selectedPictureIds.size} selected
          </span>
          <div className="pictures-selection-actions">
            <button
              className="selection-bar-btn selection-bar-btn--secondary"
              onClick={handleSelectAll}
            >
              {selectedPictureIds.size === sortedPictures.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              className="selection-bar-btn selection-bar-btn--danger"
              onClick={handleDeleteSelected}
              disabled={selectedPictureIds.size === 0 || deletingSelected}
            >
              {deletingSelected ? 'Deleting…' : `Delete (${selectedPictureIds.size})`}
            </button>
            <button
              className="selection-bar-btn selection-bar-btn--cancel"
              onClick={handleExitSelectionMode}
              disabled={deletingSelected}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="pictures-grid">
        {sortedPictures.map((picture) => {
          const isSelected = selectedPictureIds.has(picture.id)
          return (
          <div
            key={picture.id}
            className={`picture-card${isSelected ? ' picture-card--selected' : ''}`}
          >
            <div
              className="picture-container"
              onClick={() => {
                if (isSelectionMode) {
                  handleToggleSelectPicture(picture.id)
                } else if (!imageErrors[picture.id]) {
                  handleImageClick(picture)
                }
              }}
              style={{ cursor: isSelectionMode ? 'pointer' : (imageErrors[picture.id] ? 'default' : 'pointer') }}
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
              ) : (picture.key || picture.url) ? (
                <ResolvedImage
                  s3Key={picture.key}
                  fallbackUrl={picture.url}
                  alt={picture.caption || 'Project picture'}
                  className="picture-image"
                  onLoad={() => handleImageLoad(picture.id)}
                  onError={(e) => {
                    handleImageError(picture.id, picture.url || picture.key)
                  }}
                />
              ) : (
                <div className="image-error">
                  <span className="error-icon">🖼️</span>
                  <p>Invalid image URL</p>
                </div>
              )}

              {isSelectionMode ? (
                <div className="picture-select-overlay">
                  <div className={`picture-checkbox${isSelected ? ' picture-checkbox--checked' : ''}`}>
                    {isSelected && <span className="picture-checkbox-check">✓</span>}
                  </div>
                </div>
              ) : (
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
                  {!isDemo && (
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
                  )}
                </div>
              )}
            </div>

            {picture.caption && picture.caption.trim() !== '' && picture.caption.trim() !== 'Uploaded picture' && (
              <div className="picture-info">
                <p className="picture-caption">{picture.caption}</p>
              </div>
            )}
          </div>
          )
        })}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && !isDemo && (
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
                      handleDownloadImage(e, selectedImage.key || selectedImage.url, selectedImage.caption)
                      setShowImageMenu(false)
                    }}
                  >
                    <span className="menu-item-icon">⬇️</span>
                    <span className="menu-item-text">Download Image</span>
                  </button>
                  {!isDemo && (
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
                  )}
                </div>
              )}
            </div>

            <button
              className={`lightbox-products-button${isShoppingMode ? ' lightbox-products-button--active' : ''}`}
              onClick={handleToggleShoppingMode}
              title={isShoppingMode ? 'Exit shopping mode' : 'Click a product in the image to shop for it'}
              aria-label="Toggle shopping mode"
            >
              <span style={{ fontSize: '15px', filter: 'brightness(0) invert(1)', lineHeight: 1 }}>🛒</span>
            </button>

            <button
              className="lightbox-search-button"
              onClick={(e) => handleSearchImage(e, selectedImage.url)}
              title={(selectedImage.key || selectedImage.url) && !selectedImage.url?.startsWith('http') ? 'Reverse image search not available for app images' : 'Search image origin (opens Google Images)'}
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
            
            <div className="lightbox-main-row">
              <div className={`lightbox-image-wrapper${isShoppingMode ? ' lightbox-image-wrapper--shopping' : ''}`}>
                <div className="lightbox-image-container">
                  <ResolvedImage
                    s3Key={selectedImage.key}
                    fallbackUrl={selectedImage.url}
                    alt={selectedImage.caption || 'Project picture'}
                    className="lightbox-image"
                    style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}
                    onClick={isShoppingMode ? handleImageShopClick : handleImageClickZoom}
                    onDoubleClick={isShoppingMode ? undefined : handleImageDoubleClickZoom}
                    onContextMenu={isShoppingMode ? undefined : handleImageRightClickZoom}
                    title={isShoppingMode ? 'Click on a product to identify and shop for it' : 'Click to zoom in, double-click to reset, right-click to zoom out'}
                  />
                  {shopPin && (
                    <div
                      className="shop-pin"
                      style={{ left: `${shopPin.x * 100}%`, top: `${shopPin.y * 100}%` }}
                    />
                  )}
                </div>
              </div>

              {(isShoppingMode || shopResult) && (
                <div className="lightbox-products-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="lightbox-products-header">
                    <span className="lightbox-products-title">
                      {shopResult?.loading ? 'Identifying...' :
                       shopResult?.error ? 'Error' :
                       shopResult?.product ? shopResult.product.name :
                       shopResult?.product === null ? 'No Product Found' :
                       'Shopping Mode'}
                    </span>
                    <button
                      className="lightbox-products-close"
                      onClick={() => { setIsShoppingMode(false); setShopPin(null); setShopResult(null) }}
                      aria-label="Close"
                    >✕</button>
                  </div>
                  {!shopResult && (
                    <p className="lightbox-products-empty" style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem' }}>
                      Click on any product in the image
                    </p>
                  )}
                  {shopResult?.loading && (
                    <p className="lightbox-products-empty">Identifying product and finding listings…</p>
                  )}
                  {shopResult?.error && (
                    <p className="lightbox-products-empty">{shopResult.error}</p>
                  )}
                  {shopResult && !shopResult.loading && !shopResult.error && shopResult.product === null && (
                    <p className="lightbox-products-empty">No product found at that location</p>
                  )}
                  {shopResult?.product && (
                    <div className="lightbox-products-list">
                      <div className="lightbox-product-item">
                        <div className="lightbox-product-desc">{shopResult.product.description}</div>
                        {shopResult.loadingListings && (
                          <div className="lightbox-products-empty">Finding listings…</div>
                        )}
                        {Array.isArray(shopResult.listings) && shopResult.listings.length === 0 && (
                          <div className="lightbox-products-empty">No listings found</div>
                        )}
                        <div className="lightbox-product-listings">
                          {(shopResult.listings || []).map((listing, lIdx) => (
                            <a
                              key={lIdx}
                              href={listing.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="lightbox-listing-card"
                            >
                              <div className="lightbox-listing-thumb">
                                {listing.image
                                  ? <img src={listing.image} alt={listing.title} />
                                  : <span className="lightbox-listing-thumb-placeholder">🛒</span>
                                }
                              </div>
                              <div className="lightbox-listing-info">
                                <div className="lightbox-listing-title">{listing.title}</div>
                                {listing.price && (
                                  <div className="lightbox-listing-price">{listing.price}</div>
                                )}
                                {listing.source && (
                                  <div className="lightbox-listing-source">{listing.source}</div>
                                )}
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
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