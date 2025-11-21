import React, { useState } from 'react'
import '../styles/ProjectVideos.css'
import apiClient from '../services/api'

const ProjectVideos = ({ videos = [], projectId, onUpdate }) => {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [thumbnailErrors, setThumbnailErrors] = useState({})
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadMode, setUploadMode] = useState('url') // 'url' or 'file'
  const [uploadFormData, setUploadFormData] = useState({
    file: null,
    url: '',
    title: '',
    description: '',
    type: 'tutorial',
    duration: '',
    preview: null
  })

  const handleVideoClick = (video) => {
    setSelectedVideo(video)
  }

  const handleCloseModal = () => {
    setSelectedVideo(null)
  }

  const handleThumbnailError = (videoId) => {
    setThumbnailErrors(prev => ({ ...prev, [videoId]: true }))
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'tutorial':
        return '🎓'
      case 'progress':
        return '📹'
      case 'reference':
        return '🔗'
      default:
        return '🎥'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'tutorial':
        return 'Tutorial'
      case 'progress':
        return 'Progress Video'
      case 'reference':
        return 'Reference'
      default:
        return 'Video'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'tutorial':
        return '#3b82f6'
      case 'progress':
        return '#10b981'
      case 'reference':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  const getEmbedUrl = (url) => {
    // Convert YouTube watch URLs to embed URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    
    // Convert YouTube short URLs to embed URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    
    // Convert Vimeo URLs to embed URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}`
    }
    
    // Return original URL if no conversion needed
    return url
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setUploadError('Please select a video file')
        return
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setUploadError('Video size must be less than 100MB')
        return
      }

      setUploadError(null)
      
      // Create preview thumbnail (using first frame)
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        video.currentTime = 0.1
      }
      video.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnail = canvas.toDataURL('image/jpeg')
        
        setUploadFormData(prev => ({
          ...prev,
          file: file,
          preview: thumbnail
        }))
      }
      video.src = URL.createObjectURL(file)
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    setUploadError(null)

    if (uploadMode === 'file' && !uploadFormData.file) {
      setUploadError('Please select a video file')
      return
    }

    if (uploadMode === 'url' && !uploadFormData.url.trim()) {
      setUploadError('Please enter a video URL')
      return
    }

    if (!uploadFormData.title.trim()) {
      setUploadError('Please enter a title')
      return
    }

    setUploading(true)

    try {
      const project = await apiClient.getProject(projectId)
      
      let newVideo = {
        id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: uploadFormData.title.trim(),
        description: uploadFormData.description.trim(),
        type: uploadFormData.type,
        duration: uploadFormData.duration || '0:00',
        thumbnail: uploadFormData.preview || ''
      }

      if (uploadMode === 'file') {
        // Convert file to base64
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result
            const base64 = result.includes(',') ? result.split(',')[1] : result
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(uploadFormData.file)
        })

        newVideo.videoData = base64Data
        newVideo.videoContentType = uploadFormData.file.type
        newVideo.url = '' // Will be set by backend after S3 upload
      } else {
        // URL mode
        newVideo.url = uploadFormData.url.trim()
        if (!newVideo.url.match(/^https?:\/\//i)) {
          newVideo.url = 'https://' + newVideo.url
        }
      }

      // Upload video via API
      await apiClient.addVideo(projectId, newVideo)

      // Reset form
      setUploadFormData({
        file: null,
        url: '',
        title: '',
        description: '',
        type: 'tutorial',
        duration: '',
        preview: null
      })
      setShowUploadForm(false)
      setUploadMode('url')

      // Refresh project data
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      console.error('Failed to upload video:', err)
      setUploadError(err.message || 'Failed to upload video. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleCancelUpload = () => {
    setUploadFormData({
      file: null,
      url: '',
      title: '',
      description: '',
      type: 'tutorial',
      duration: '',
      preview: null
    })
    setShowUploadForm(false)
    setUploadMode('url')
    setUploadError(null)
  }

  const hasVideos = videos && videos.length > 0

  if (!hasVideos && !showUploadForm) {
    return (
      <div className="videos-empty">
        <div className="empty-state">
          <span className="empty-icon">🎥</span>
          <h3>No Videos Yet</h3>
          <p>Upload videos or add links to tutorials and progress updates.</p>
          <button 
            className="upload-button"
            onClick={() => setShowUploadForm(true)}
          >
            + Add Video
          </button>
        </div>
      </div>
    )
  }

  // Get unique video types
  const videoTypes = ['all', ...new Set(videos.map(video => video.type))]

  // Filter videos by type
  const filteredVideos = filterType === 'all' 
    ? videos 
    : videos.filter(video => video.type === filterType)

  // Group videos by type for better organization
  const videosByType = filteredVideos.reduce((acc, video) => {
    const type = video.type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(video)
    return acc
  }, {})

  return (
    <div className="project-videos">
      <div className="videos-header">
        <div>
          <h3>Videos & References</h3>
          <p>Watch tutorials, progress updates, and reference materials</p>
        </div>
        <button 
          className="upload-button"
          onClick={() => setShowUploadForm(true)}
        >
          + Add Video
        </button>
      </div>

      {/* Type Filter */}
      <div className="type-filter">
        <label htmlFor="type-select">Filter by type:</label>
        <select 
          id="type-select"
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="type-select"
        >
          {videoTypes.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : `${getTypeIcon(type)} ${getTypeLabel(type)}`}
            </option>
          ))}
        </select>
      </div>

      {/* Videos List */}
      <div className="videos-list">
        {filterType === 'all' ? (
          // Group by type when showing all
          Object.entries(videosByType).map(([type, typeVideos]) => (
            <div key={type} className="type-group">
              <h4 className="type-title">
                <span className="type-icon">{getTypeIcon(type)}</span>
                {getTypeLabel(type)}
                <span className="type-count">({typeVideos.length})</span>
              </h4>
              
              <div className="type-videos">
                {typeVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onVideoClick={handleVideoClick}
                    onThumbnailError={handleThumbnailError}
                    thumbnailError={thumbnailErrors[video.id]}
                    getTypeIcon={getTypeIcon}
                    getTypeLabel={getTypeLabel}
                    getTypeColor={getTypeColor}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Show filtered videos without grouping
          <div className="type-videos">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onVideoClick={handleVideoClick}
                onThumbnailError={handleThumbnailError}
                thumbnailError={thumbnailErrors[video.id]}
                getTypeIcon={getTypeIcon}
                getTypeLabel={getTypeLabel}
                getTypeColor={getTypeColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="upload-modal-overlay" onClick={handleCancelUpload}>
          <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-header">
              <h3>Add Video</h3>
              <button className="close-button" onClick={handleCancelUpload}>✕</button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="upload-form">
              {uploadError && <div className="upload-error">{uploadError}</div>}
              
              <div className="upload-mode-toggle">
                <button
                  type="button"
                  className={`mode-button ${uploadMode === 'url' ? 'active' : ''}`}
                  onClick={() => {
                    setUploadMode('url')
                    setUploadError(null)
                  }}
                >
                  🔗 Add URL
                </button>
                <button
                  type="button"
                  className={`mode-button ${uploadMode === 'file' ? 'active' : ''}`}
                  onClick={() => {
                    setUploadMode('file')
                    setUploadError(null)
                  }}
                >
                  📁 Upload File
                </button>
              </div>

              {uploadMode === 'file' && (
                <>
                  <div className="upload-preview">
                    {uploadFormData.preview ? (
                      <img src={uploadFormData.preview} alt="Video preview" className="preview-image" />
                    ) : (
                      <div className="preview-placeholder">
                        <span>🎥</span>
                        <p>Video preview will appear here</p>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="video-file">Select Video *</label>
                    <input
                      type="file"
                      id="video-file"
                      accept="video/*"
                      onChange={handleFileChange}
                      required={uploadMode === 'file'}
                    />
                    <p className="form-hint">Max file size: 100MB</p>
                  </div>
                </>
              )}

              {uploadMode === 'url' && (
                <div className="form-group">
                  <label htmlFor="video-url">Video URL *</label>
                  <input
                    type="text"
                    id="video-url"
                    value={uploadFormData.url}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    required={uploadMode === 'url'}
                  />
                  <p className="form-hint">Supports YouTube, Vimeo, or direct video URLs</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="video-title">Title *</label>
                <input
                  type="text"
                  id="video-title"
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Video title..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="video-description">Description</label>
                <textarea
                  id="video-description"
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this video..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="video-type">Type</label>
                <select
                  id="video-type"
                  value={uploadFormData.type}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="tutorial">🎓 Tutorial</option>
                  <option value="progress">📹 Progress Video</option>
                  <option value="reference">🔗 Reference</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="video-duration">Duration (Optional)</label>
                <input
                  type="text"
                  id="video-duration"
                  value={uploadFormData.duration}
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 5:30"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancelUpload} className="cancel-button">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button" 
                  disabled={uploading || (uploadMode === 'file' && !uploadFormData.file) || (uploadMode === 'url' && !uploadFormData.url.trim()) || !uploadFormData.title.trim()}
                >
                  {uploading ? 'Uploading...' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={handleCloseModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseModal}>
              ✕
            </button>
            
            <div className="video-container">
              {selectedVideo.url && (selectedVideo.url.startsWith('http://') || selectedVideo.url.startsWith('https://') || selectedVideo.url.includes('youtube.com') || selectedVideo.url.includes('youtu.be') || selectedVideo.url.includes('vimeo.com')) ? (
                <iframe
                  src={getEmbedUrl(selectedVideo.url)}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video-iframe"
                ></iframe>
              ) : (
                <video
                  src={selectedVideo.url}
                  controls
                  className="video-iframe"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            
            <div className="video-info">
              <div className="video-type">
                <span className="type-icon">{getTypeIcon(selectedVideo.type)}</span>
                <span 
                  className="type-label"
                  style={{ color: getTypeColor(selectedVideo.type) }}
                >
                  {getTypeLabel(selectedVideo.type)}
                </span>
                <span className="video-duration">⏱️ {selectedVideo.duration}</span>
              </div>
              <h4 className="video-title">{selectedVideo.title}</h4>
              <p className="video-description">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Separate VideoCard component for better organization
const VideoCard = ({ 
  video, 
  onVideoClick, 
  onThumbnailError, 
  thumbnailError,
  getTypeIcon,
  getTypeLabel,
  getTypeColor
}) => {
  return (
    <div className="video-card">
      <div className="video-thumbnail-container">
        {thumbnailError ? (
          <div className="thumbnail-error">
            <span className="error-icon">🎥</span>
            <p>Thumbnail not available</p>
          </div>
        ) : (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="video-thumbnail"
            onError={() => onThumbnailError(video.id)}
          />
        )}
        
        <div className="video-overlay">
          <button 
            className="play-button"
            onClick={() => onVideoClick(video)}
          >
            ▶️ Play
          </button>
        </div>
        
        <div className="video-duration-badge">
          {video.duration}
        </div>
      </div>
      
      <div className="video-card-info">
        <div className="video-card-type">
          <span className="type-icon">{getTypeIcon(video.type)}</span>
          <span 
            className="type-label"
            style={{ color: getTypeColor(video.type) }}
          >
            {getTypeLabel(video.type)}
          </span>
        </div>
        <h5 className="video-card-title">{video.title}</h5>
        <p className="video-card-description">{video.description}</p>
      </div>
    </div>
  )
}

export default ProjectVideos