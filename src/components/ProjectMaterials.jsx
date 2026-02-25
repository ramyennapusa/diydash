import React, { useState, useEffect } from 'react'
import '../styles/ProjectMaterials.css'
import apiClient from '../services/api'

/** Shorten a URL for display (e.g. show domain or truncate). href stays full URL. */
function shortLinkDisplay(url, maxLength = 50) {
  if (!url || typeof url !== 'string') return url
  const trimmed = url.trim()
  if (trimmed.length <= maxLength) return trimmed
  try {
    const fullUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
    const u = new URL(fullUrl)
    const host = u.hostname.replace(/^www\./, '')
    const path = u.pathname === '/' ? '' : u.pathname
    const combined = path ? `${host}${path}` : host
    if (combined.length <= maxLength) return combined
    return combined.slice(0, maxLength - 3) + '…'
  } catch {
    return trimmed.length > maxLength ? trimmed.slice(0, maxLength - 3) + '…' : trimmed
  }
}

const ProjectMaterials = ({ materials = [], tools = [], projectId, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('materials')
  const [localMaterials, setLocalMaterials] = useState(materials)
  const [localTools, setLocalTools] = useState(tools)
  const [materialChecklist, setMaterialChecklist] = useState({})
  const [toolChecklist, setToolChecklist] = useState({})
  const [filterCategory, setFilterCategory] = useState('all')
  const [showEssentialOnly, setShowEssentialOnly] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    size: '',
    shoppingLink: '',
    notes: ''
  })
  const [quickAddInput, setQuickAddInput] = useState('')
  const [quickAddInputTools, setQuickAddInputTools] = useState('')
  const [showAddFormTools, setShowAddFormTools] = useState(false)
  const [editingIdTools, setEditingIdTools] = useState(null)
  const [formDataTools, setFormDataTools] = useState({
    name: '',
    quantity: '',
    size: '',
    shoppingLink: '',
    notes: ''
  })

  // Sync from parent when project or initial data changes (e.g. navigated to another project)
  useEffect(() => {
    setLocalMaterials(materials)
    setLocalTools(tools)
  }, [projectId, materials, tools])

  // Initialize checklist states
  useEffect(() => {
    const materialStates = {}
    localMaterials.forEach(material => {
      materialStates[material.id] = false
    })
    setMaterialChecklist(materialStates)

    const toolStates = {}
    localTools.forEach(tool => {
      toolStates[tool.id] = false
    })
    setToolChecklist(toolStates)
  }, [localMaterials, localTools])

  const handleMaterialToggle = (materialId) => {
    setMaterialChecklist(prev => ({
      ...prev,
      [materialId]: !prev[materialId]
    }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Item name is required')
      return
    }

    setIsSubmitting(true)

    try {
      // Format shopping link URL
      let shoppingLink = formData.shoppingLink.trim()
      if (shoppingLink && !shoppingLink.match(/^https?:\/\//i)) {
        shoppingLink = 'https://' + shoppingLink
      }

      const materialData = {
        id: editingId || `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name.trim(),
        quantity: formData.quantity.trim() || '',
        size: formData.size.trim() || '',
        shoppingLink: shoppingLink || '',
        notes: formData.notes.trim() || '',
        category: 'General',
        essential: false
      }

      const updatedMaterials = editingId
        ? localMaterials.map(m => m.id === editingId ? materialData : m)
        : [...localMaterials, materialData]

      await apiClient.updateProject(projectId, { materials: updatedMaterials })

      setLocalMaterials(updatedMaterials)
      // Reset form
      setFormData({
        name: '',
        quantity: '',
        size: '',
        shoppingLink: '',
        notes: ''
      })
      setQuickAddInput('')
      setShowAddForm(false)
      setEditingId(null)

      // Do not call onUpdate() — avoids full page refresh
    } catch (err) {
      console.error('Failed to save material:', err)
      setError(err.message || 'Failed to save item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (material) => {
    setFormData({
      name: material.name || '',
      quantity: material.quantity || '',
      size: material.size || '',
      shoppingLink: material.shoppingLink || '',
      notes: material.notes || ''
    })
    setEditingId(material.id)
    setShowAddForm(true)
    setError(null)
  }

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      const updatedMaterials = localMaterials.filter(m => m.id !== materialId)
      await apiClient.updateProject(projectId, { materials: updatedMaterials })

      setLocalMaterials(updatedMaterials)
      // Do not call onUpdate() — avoids full page refresh
    } catch (err) {
      console.error('Failed to delete material:', err)
      alert('Failed to delete item. Please try again.')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      quantity: '',
      size: '',
      shoppingLink: '',
      notes: ''
    })
    setQuickAddInput('')
    setShowAddForm(false)
    setEditingId(null)
    setError(null)
  }

  const handleQuickAdd = async () => {
    const itemName = quickAddInput.trim()
    if (!itemName) return

    try {
      const materialData = {
        id: `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: itemName,
        quantity: '',
        size: '',
        shoppingLink: '',
        notes: '',
        category: 'General',
        essential: false
      }

      const updatedMaterials = [...localMaterials, materialData]
      await apiClient.updateProject(projectId, { materials: updatedMaterials })

      setLocalMaterials(updatedMaterials)
      setQuickAddInput('')
      // Do not call onUpdate() — avoids full page refresh
    } catch (err) {
      console.error('Failed to add item:', err)
      alert('Failed to add item. Please try again.')
    }
  }

  const handleQuickAddKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleQuickAdd()
    }
  }

  const handleQuickAddTools = async () => {
    const itemName = quickAddInputTools.trim()
    if (!itemName) return

    try {
      const toolData = {
        id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: itemName,
        quantity: '',
        size: '',
        shoppingLink: '',
        notes: '',
        category: 'General',
        essential: false
      }

      const updatedTools = [...localTools, toolData]
      await apiClient.updateProject(projectId, { tools: updatedTools })

      setLocalTools(updatedTools)
      setQuickAddInputTools('')
      // Do not call onUpdate() — avoids full page refresh
    } catch (err) {
      console.error('Failed to add tool:', err)
      alert('Failed to add tool. Please try again.')
    }
  }

  const handleQuickAddToolsKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleQuickAddTools()
    }
  }

  const handleInputChangeTools = (e) => {
    const { name, value } = e.target
    setFormDataTools(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleSubmitTools = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formDataTools.name.trim()) {
      setError('Tool name is required')
      return
    }

    setIsSubmitting(true)

    try {
      // Format shopping link URL
      let shoppingLink = formDataTools.shoppingLink.trim()
      if (shoppingLink && !shoppingLink.match(/^https?:\/\//i)) {
        shoppingLink = 'https://' + shoppingLink
      }

      const toolData = {
        id: editingIdTools || `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: formDataTools.name.trim(),
        quantity: formDataTools.quantity.trim() || '',
        size: formDataTools.size.trim() || '',
        shoppingLink: shoppingLink || '',
        notes: formDataTools.notes.trim() || '',
        category: 'General',
        essential: false
      }

      const updatedTools = editingIdTools
        ? localTools.map(t => t.id === editingIdTools ? toolData : t)
        : [...localTools, toolData]

      await apiClient.updateProject(projectId, { tools: updatedTools })

      setLocalTools(updatedTools)
      // Reset form
      setFormDataTools({
        name: '',
        quantity: '',
        size: '',
        shoppingLink: '',
        notes: ''
      })
      setQuickAddInputTools('')
      setShowAddFormTools(false)
      setEditingIdTools(null)

      // Do not call onUpdate() — avoids full page refresh
    } catch (err) {
      console.error('Failed to save tool:', err)
      setError(err.message || 'Failed to save tool. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTools = (tool) => {
    setFormDataTools({
      name: tool.name || '',
      quantity: tool.quantity || '',
      size: tool.size || '',
      shoppingLink: tool.shoppingLink || '',
      notes: tool.notes || ''
    })
    setEditingIdTools(tool.id)
    setShowAddFormTools(true)
    setError(null)
  }

  const handleDeleteTools = async (toolId) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) {
      return
    }

    try {
      const updatedTools = localTools.filter(t => t.id !== toolId)
      await apiClient.updateProject(projectId, { tools: updatedTools })

      setLocalTools(updatedTools)
      // Do not call onUpdate() — avoids full page refresh
    } catch (err) {
      console.error('Failed to delete tool:', err)
      alert('Failed to delete tool. Please try again.')
    }
  }

  const handleCancelTools = () => {
    setFormDataTools({
      name: '',
      quantity: '',
      size: '',
      shoppingLink: '',
      notes: ''
    })
    setQuickAddInputTools('')
    setShowAddFormTools(false)
    setEditingIdTools(null)
    setError(null)
  }

  const handleToolToggle = (toolId) => {
    setToolChecklist(prev => ({
      ...prev,
      [toolId]: !prev[toolId]
    }))
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Wood':
        return '🪵'
      case 'Hardware':
        return '🔩'
      case 'Electronics':
        return '⚡'
      case 'Adhesives':
        return '🧪'
      case 'Finish':
        return '🎨'
      case 'Consumables':
        return '📦'
      case 'Soil':
        return '🌱'
      case 'Power Tools':
        return '🔌'
      case 'Hand Tools':
        return '🔨'
      case 'Clamping':
        return '🗜️'
      default:
        return '📋'
    }
  }

  // Calculate total cost
  const totalCost = localMaterials.reduce((sum, material) => sum + (material.estimatedCost || 0), 0)

  // Get unique categories for filtering
  const materialCategories = ['all', ...new Set(localMaterials.map(m => m.category))]
  const toolCategories = ['all', ...new Set(localTools.map(t => t.category))]

  // Filter materials
  const filteredMaterials = localMaterials.filter(material => {
    const categoryMatch = filterCategory === 'all' || material.category === filterCategory
    const essentialMatch = !showEssentialOnly || material.essential
    return categoryMatch && essentialMatch
  })

  // Filter tools
  const filteredTools = localTools.filter(tool => {
    const categoryMatch = filterCategory === 'all' || tool.category === filterCategory
    const essentialMatch = !showEssentialOnly || tool.essential
    return categoryMatch && essentialMatch
  })

  // Calculate checklist progress
  const checkedMaterials = Object.values(materialChecklist).filter(Boolean).length
  const checkedTools = Object.values(toolChecklist).filter(Boolean).length
  const materialProgress = localMaterials.length > 0 ? Math.round((checkedMaterials / localMaterials.length) * 100) : 0
  const toolProgress = localTools.length > 0 ? Math.round((checkedTools / localTools.length) * 100) : 0

  if (localMaterials.length === 0 && localTools.length === 0 && !projectId) {
    return (
      <div className="materials-empty">
        <div className="empty-state">
          <span className="empty-icon">🛠️</span>
          <h3>No Materials or Tools Listed</h3>
          <p>Material and tool requirements will appear here when available.</p>
        </div>
      </div>
    )
  }

  if (localMaterials.length === 0 && activeTab === 'materials' && projectId) {
    return (
      <div className="project-materials">
        <div className="materials-header">
          <div>
            <h3>Materials & Tools</h3>
            <p>Everything you need to complete this project</p>
          </div>
        </div>
        
        {/* Quick Add Input */}
        <div className="quick-add-container">
          <input
            type="text"
            className="quick-add-input"
            placeholder="Type item name and press Enter"
            value={quickAddInput}
            onChange={(e) => setQuickAddInput(e.target.value)}
            onKeyDown={handleQuickAddKeyDown}
          />
        </div>

        <div className="materials-empty">
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h3>No Items Yet</h3>
            <p>Type an item name above and click + to add details.</p>
          </div>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="form-modal-overlay" onClick={handleCancel}>
            <div className="form-modal" onClick={(e) => e.stopPropagation()}>
              <div className="form-header">
                <h3>{editingId ? 'Edit Item' : 'Add Item'}</h3>
                <button className="close-button" onClick={handleCancel}>✕</button>
              </div>
              
              <form onSubmit={handleSubmit} className="material-form">
                {error && <div className="form-error">{error}</div>}
                
                <div className="form-group">
                  <label htmlFor="name">Item Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., 2x4 Lumber"
                    required
                    autoFocus={!editingId}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                      type="text"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="e.g., 4 pieces"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="size">Size</label>
                    <input
                      type="text"
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="e.g., 8ft length"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="shoppingLink">Shopping Link</label>
                  <input
                    type="text"
                    id="shoppingLink"
                    name="shoppingLink"
                    value={formData.shoppingLink}
                    onChange={handleInputChange}
                    placeholder="https://example.com or example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add any additional notes..."
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
    <div className="project-materials">
      <div className="materials-header">
        <div>
          <h3>Materials & Tools</h3>
          <p>Everything you need to complete this project</p>
        </div>
      </div>

      {/* Cost Overview */}
      {totalCost > 0 && (
        <div className="cost-overview">
          <div className="cost-card">
            <h4>Estimated Total Cost</h4>
            <div className="cost-amount">${totalCost.toFixed(2)}</div>
            <p className="cost-note">Prices may vary by location and supplier</p>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-item">
          <div className="progress-label">
            <span>📦 Materials</span>
            <span>{checkedMaterials}/{localMaterials.length}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill materials" 
              style={{ width: `${materialProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="progress-item">
          <div className="progress-label">
            <span>🔨 Tools</span>
            <span>{checkedTools}/{localTools.length}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill tools" 
              style={{ width: `${toolProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="materials-tabs">
        <button 
          className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          📦 Materials ({localMaterials.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          🔨 Tools ({localTools.length})
        </button>
      </div>

      {/* Quick Add Input */}
      {projectId && activeTab === 'materials' && (
        <div className="quick-add-container">
          <input
            type="text"
            className="quick-add-input"
            placeholder="Type item name and press Enter"
            value={quickAddInput}
            onChange={(e) => setQuickAddInput(e.target.value)}
            onKeyDown={handleQuickAddKeyDown}
          />
        </div>
      )}

      {projectId && activeTab === 'tools' && (
        <div className="quick-add-container">
          <input
            type="text"
            className="quick-add-input"
            placeholder="Type tool name and press Enter"
            value={quickAddInputTools}
            onChange={(e) => setQuickAddInputTools(e.target.value)}
            onKeyDown={handleQuickAddToolsKeyDown}
          />
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'materials' && (
          <MaterialsList 
            materials={filteredMaterials}
            checklist={materialChecklist}
            onToggle={handleMaterialToggle}
            onEdit={projectId ? handleEdit : null}
            onDelete={projectId ? handleDelete : null}
          />
        )}
        
        {activeTab === 'tools' && (
          <ToolsList 
            tools={filteredTools}
            checklist={toolChecklist}
            onToggle={handleToolToggle}
            onEdit={projectId ? handleEditTools : null}
            onDelete={projectId ? handleDeleteTools : null}
          />
        )}
      </div>

      {/* Add/Edit Form Modal for Materials */}
      {showAddForm && projectId && (
        <div className="form-modal-overlay" onClick={handleCancel}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>{editingId ? 'Edit Item' : 'Add Item'}</h3>
              <button className="close-button" onClick={handleCancel}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="material-form">
              {error && <div className="form-error">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="name">Item Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., 2x4 Lumber"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    type="text"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="e.g., 4 pieces"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="size">Size</label>
                  <input
                    type="text"
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g., 8ft length"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="shoppingLink">Shopping Link</label>
                <input
                  type="text"
                  id="shoppingLink"
                  name="shoppingLink"
                  value={formData.shoppingLink}
                  onChange={handleInputChange}
                  placeholder="https://example.com or example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes..."
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

      {/* Add/Edit Form Modal for Tools */}
      {showAddFormTools && projectId && (
        <div className="form-modal-overlay" onClick={handleCancelTools}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>{editingIdTools ? 'Edit Tool' : 'Add Tool'}</h3>
              <button className="close-button" onClick={handleCancelTools}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitTools} className="material-form">
              {error && <div className="form-error">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="name-tools">Tool Name *</label>
                <input
                  type="text"
                  id="name-tools"
                  name="name"
                  value={formDataTools.name}
                  onChange={handleInputChangeTools}
                  placeholder="e.g., Hammer"
                  required
                  autoFocus={!editingIdTools}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity-tools">Quantity</label>
                  <input
                    type="text"
                    id="quantity-tools"
                    name="quantity"
                    value={formDataTools.quantity}
                    onChange={handleInputChangeTools}
                    placeholder="e.g., 1 piece"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="size-tools">Size</label>
                  <input
                    type="text"
                    id="size-tools"
                    name="size"
                    value={formDataTools.size}
                    onChange={handleInputChangeTools}
                    placeholder="e.g., 16oz"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="shoppingLink-tools">Shopping Link</label>
                <input
                  type="text"
                  id="shoppingLink-tools"
                  name="shoppingLink"
                  value={formDataTools.shoppingLink}
                  onChange={handleInputChangeTools}
                  placeholder="https://example.com or example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes-tools">Notes</label>
                <textarea
                  id="notes-tools"
                  name="notes"
                  value={formDataTools.notes}
                  onChange={handleInputChangeTools}
                  placeholder="Add any additional notes..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancelTools} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingIdTools ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Materials List Component
const MaterialsList = ({ materials, checklist, onToggle, onEdit, onDelete }) => {
  if (materials.length === 0) {
    return (
      <div className="empty-filtered">
        <p>No items yet. Click "+ Add Item" to get started.</p>
      </div>
    )
  }

  return (
    <div className="materials-list-simple">
      {materials.map((material) => (
        <div key={material.id} className={`material-item-simple ${checklist[material.id] ? 'checked' : ''}`}>
          <div className="item-checkbox-simple">
            <input
              type="checkbox"
              id={`material-${material.id}`}
              checked={checklist[material.id] || false}
              onChange={() => onToggle(material.id)}
            />
            <label htmlFor={`material-${material.id}`} className="checkbox-label-simple">
              <span className="checkmark-simple">✓</span>
            </label>
          </div>
          
          <div className="item-content-simple">
            <div className="item-header-simple">
              <h6 className="item-name-simple">{material.name}</h6>
              {(onEdit || onDelete) && (
                <div className="item-actions-simple">
                  {onEdit && (
                    <button 
                      className="edit-button-simple"
                      onClick={() => onEdit(material)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      className="delete-button-simple"
                      onClick={() => onDelete(material.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="item-details-simple">
              {material.quantity && (
                <div className="detail-item">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{material.quantity}</span>
                </div>
              )}
              {material.size && (
                <div className="detail-item">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{material.size}</span>
                </div>
              )}
              {material.shoppingLink && (
                <div className="detail-item">
                  <span className="detail-label">Link:</span>
                  <a 
                    href={material.shoppingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="shopping-link-simple"
                    title={material.shoppingLink}
                  >
                    {shortLinkDisplay(material.shoppingLink)}
                    <span className="external-icon">↗</span>
                  </a>
                </div>
              )}
              {material.notes && (
                <div className="detail-item">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{material.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Tools List Component
const ToolsList = ({ tools, checklist, onToggle, onEdit, onDelete }) => {
  if (tools.length === 0) {
    return (
      <div className="empty-filtered">
        <p>No tools yet. Type a tool name above and press Enter to get started.</p>
      </div>
    )
  }

  return (
    <div className="materials-list-simple">
      {tools.map((tool) => (
        <div key={tool.id} className={`material-item-simple ${checklist[tool.id] ? 'checked' : ''}`}>
          <div className="item-checkbox-simple">
            <input
              type="checkbox"
              id={`tool-${tool.id}`}
              checked={checklist[tool.id] || false}
              onChange={() => onToggle(tool.id)}
            />
            <label htmlFor={`tool-${tool.id}`} className="checkbox-label-simple">
              <span className="checkmark-simple">✓</span>
            </label>
          </div>
          
          <div className="item-content-simple">
            <div className="item-header-simple">
              <h6 className="item-name-simple">{tool.name}</h6>
              {(onEdit || onDelete) && (
                <div className="item-actions-simple">
                  {onEdit && (
                    <button 
                      className="edit-button-simple"
                      onClick={() => onEdit(tool)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      className="delete-button-simple"
                      onClick={() => onDelete(tool.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="item-details-simple">
              {tool.quantity && (
                <div className="detail-item">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{tool.quantity}</span>
                </div>
              )}
              {tool.size && (
                <div className="detail-item">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{tool.size}</span>
                </div>
              )}
              {tool.shoppingLink && (
                <div className="detail-item">
                  <span className="detail-label">Link:</span>
                  <a 
                    href={tool.shoppingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="shopping-link-simple"
                    title={tool.shoppingLink}
                  >
                    {shortLinkDisplay(tool.shoppingLink)}
                    <span className="external-icon">↗</span>
                  </a>
                </div>
              )}
              {tool.notes && (
                <div className="detail-item">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{tool.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProjectMaterials