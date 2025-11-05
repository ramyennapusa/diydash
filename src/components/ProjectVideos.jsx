import React, { useState } from 'react'
import '../styles/ProjectVideos.css'

const ProjectVideos = ({ videos = [] }) => {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [thumbnailErrors, setThumbnailErrors] = useState({})

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

  if (!videos || videos.length === 0) {
    return (
      <div className="videos-empty">
        <div className="empty-state">
          <span className="empty-icon">🎥</span>
          <h3>No Videos Yet</h3>
          <p>Tutorial videos and progress updates will appear here.</p>
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
        <h3>Videos & References</h3>
        <p>Watch tutorials, progress updates, and reference materials</p>
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

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={handleCloseModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseModal}>
              ✕
            </button>
            
            <div className="video-container">
              <iframe
                src={getEmbedUrl(selectedVideo.url)}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              ></iframe>
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