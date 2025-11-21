import React, { useState } from 'react'
import '../styles/ProjectReferences.css'
import apiClient from '../services/api'

const ProjectReferences = ({ references = [], projectId, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    sourceType: 'website'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const sourceTypes = [
    { value: 'website', label: 'Website', icon: '🌐' },
    { value: 'instagram', label: 'Instagram', icon: '📷' },
    { value: 'pinterest', label: 'Pinterest', icon: '📌' },
    { value: 'youtube', label: 'YouTube', icon: '▶️' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'facebook', label: 'Facebook', icon: '👥' },
    { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
    { value: 'reddit', label: 'Reddit', icon: '💬' },
    { value: 'other', label: 'Other', icon: '🔗' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const validateUrl = (url) => {
    if (!url.trim()) return false
    try {
      // Add protocol if missing
      let testUrl = url
      if (!url.match(/^https?:\/\//i)) {
        testUrl = 'https://' + url
      }
      new URL(testUrl)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!validateUrl(formData.url)) {
      setError('Please enter a valid URL')
      return
    }

    setIsSubmitting(true)

    try {
      const newReference = {
        id: editingId || `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title.trim(),
        url: formData.url.trim().match(/^https?:\/\//i) 
          ? formData.url.trim() 
          : `https://${formData.url.trim()}`,
        description: formData.description.trim(),
        sourceType: formData.sourceType,
        addedDate: editingId 
          ? references.find(r => r.id === editingId)?.addedDate || new Date().toISOString()
          : new Date().toISOString()
      }

      const updatedReferences = editingId
        ? references.map(ref => ref.id === editingId ? newReference : ref)
        : [...references, newReference]

      // Update project via API
      await apiClient.updateProject(projectId, { references: updatedReferences })

      // Reset form
      setFormData({
        title: '',
        url: '',
        description: '',
        sourceType: 'website'
      })
      setShowAddForm(false)
      setEditingId(null)

      // Notify parent to refresh
      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      console.error('Failed to save reference:', err)
      setError(err.message || 'Failed to save reference. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (reference) => {
    setFormData({
      title: reference.title,
      url: reference.url,
      description: reference.description || '',
      sourceType: reference.sourceType || 'website'
    })
    setEditingId(reference.id)
    setShowAddForm(true)
    setError(null)
  }

  const handleDelete = async (referenceId) => {
    if (!window.confirm('Are you sure you want to delete this reference?')) {
      return
    }

    try {
      const updatedReferences = references.filter(ref => ref.id !== referenceId)
      await apiClient.updateProject(projectId, { references: updatedReferences })

      if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      console.error('Failed to delete reference:', err)
      alert('Failed to delete reference. Please try again.')
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      url: '',
      description: '',
      sourceType: 'website'
    })
    setShowAddForm(false)
    setEditingId(null)
    setError(null)
  }

  const getSourceIcon = (sourceType) => {
    const source = sourceTypes.find(s => s.value === sourceType)
    return source ? source.icon : '🔗'
  }

  const getSourceLabel = (sourceType) => {
    const source = sourceTypes.find(s => s.value === sourceType)
    return source ? source.label : 'Link'
  }

  const getSourceColor = (sourceType) => {
    const colors = {
      instagram: '#E4405F',
      pinterest: '#BD081C',
      youtube: '#FF0000',
      tiktok: '#000000',
      facebook: '#1877F2',
      twitter: '#1DA1F2',
      reddit: '#FF4500',
      website: '#3b82f6',
      other: '#6b7280'
    }
    return colors[sourceType] || colors.other
  }

  // Filter references by type
  const filteredReferences = filterType === 'all'
    ? references
    : references.filter(ref => ref.sourceType === filterType)

  // Get unique source types for filter
  const availableTypes = ['all', ...new Set(references.map(ref => ref.sourceType || 'other'))]

  if (!references || references.length === 0) {
    return (
      <div className="references-empty">
        <div className="empty-state">
          <span className="empty-icon">🔗</span>
          <h3>No References Yet</h3>
          <p>Save useful links, tutorials, and inspiration from social media and websites.</p>
          <button 
            className="add-first-button"
            onClick={() => setShowAddForm(true)}
          >
            + Add Your First Reference
          </button>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="form-modal-overlay" onClick={handleCancel}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
              <div className="form-header">
                <h3>{editingId ? 'Edit Reference' : 'Add Reference'}</h3>
                <button className="close-button" onClick={handleCancel}>✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="reference-form">
                {error && <div className="form-error">{error}</div>}
                
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Coffee Table Inspiration"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="url">URL *</label>
                  <input
                    type="text"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com or example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sourceType">Source Type</label>
                  <select
                    id="sourceType"
                    name="sourceType"
                    value={formData.sourceType}
                    onChange={handleInputChange}
                  >
                    {sourceTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description (Optional)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Add notes about this reference..."
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" onClick={handleCancel} className="cancel-button">
                    Cancel
                  </button>
                  <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingId ? 'Update' : 'Add')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="project-references">
      <div className="references-header">
        <div>
          <h3>References & Links</h3>
          <p>Save useful links, tutorials, and inspiration from social media and websites</p>
        </div>
        <button 
          className="add-reference-button"
          onClick={() => setShowAddForm(true)}
        >
          + Add Reference
        </button>
      </div>

      {/* Type Filter */}
      {references.length > 0 && (
        <div className="type-filter">
          <label htmlFor="type-select">Filter by source:</label>
          <select 
            id="type-select"
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="type-select"
          >
            {availableTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Sources' : `${getSourceIcon(type)} ${getSourceLabel(type)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* References List */}
      <div className="references-list">
        {filteredReferences.length === 0 ? (
          <div className="empty-filtered">
            <p>No references match the current filter.</p>
          </div>
        ) : (
          filteredReferences.map((reference) => (
            <div key={reference.id} className="reference-card">
              <div className="reference-header">
                <div className="reference-source">
                  <span 
                    className="source-icon"
                    style={{ color: getSourceColor(reference.sourceType || 'other') }}
                  >
                    {getSourceIcon(reference.sourceType || 'other')}
                  </span>
                  <span 
                    className="source-label"
                    style={{ color: getSourceColor(reference.sourceType || 'other') }}
                  >
                    {getSourceLabel(reference.sourceType || 'other')}
                  </span>
                </div>
                <div className="reference-actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEdit(reference)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(reference.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <h4 className="reference-title">{reference.title}</h4>
              
              {reference.description && (
                <p className="reference-description">{reference.description}</p>
              )}
              
              <a 
                href={reference.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="reference-link"
              >
                {reference.url}
                <span className="external-icon">↗</span>
              </a>
              
              {reference.addedDate && (
                <p className="reference-date">
                  Added {new Date(reference.addedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="form-modal-overlay" onClick={handleCancel}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>{editingId ? 'Edit Reference' : 'Add Reference'}</h3>
              <button className="close-button" onClick={handleCancel}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="reference-form">
              {error && <div className="form-error">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Coffee Table Inspiration"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="url">URL *</label>
                <input
                  type="text"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com or example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sourceType">Source Type</label>
                <select
                  id="sourceType"
                  name="sourceType"
                  value={formData.sourceType}
                  onChange={handleInputChange}
                >
                  {sourceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add notes about this reference..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectReferences

