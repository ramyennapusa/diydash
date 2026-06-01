import React, { useState, useEffect } from 'react'
import '../styles/ProjectMaterials.css'
import apiClient from '../services/api'
import { suppliesPatch } from '../utils/suppliesUtils'

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

const ProjectMaterials = ({ materials = [], projectId, onUpdate, isDemo = false }) => {
  const [localSupplies, setLocalSupplies] = useState(materials)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [quickAddInput, setQuickAddInput] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    size: '',
    shoppingLink: '',
    notes: '',
  })

  useEffect(() => {
    setLocalSupplies(materials)
  }, [projectId, materials])

  const persistSupplies = async (updated) => {
    if (!projectId || isDemo) {
      setLocalSupplies(updated)
      return
    }
    await apiClient.updateProject(projectId, suppliesPatch(updated))
    setLocalSupplies(updated)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const buildItemFromForm = (base = null) => {
    let shoppingLink = formData.shoppingLink.trim()
    if (shoppingLink && !shoppingLink.match(/^https?:\/\//i)) {
      shoppingLink = 'https://' + shoppingLink
    }
    return {
      id: base?.id || `supply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name.trim(),
      quantity: formData.quantity.trim() || '',
      size: formData.size.trim() || '',
      shoppingLink: shoppingLink || '',
      notes: formData.notes.trim() || '',
      category: base?.category || 'General',
      essential: base?.essential ?? false,
      purchased: base?.purchased ?? false,
    }
  }

  const resetForm = () => {
    setFormData({ name: '', quantity: '', size: '', shoppingLink: '', notes: '' })
    setQuickAddInput('')
    setShowAddForm(false)
    setEditingId(null)
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
      const itemData = buildItemFromForm(
        editingId ? localSupplies.find((s) => s.id === editingId) : null
      )
      const updated = editingId
        ? localSupplies.map((s) => (s.id === editingId ? itemData : s))
        : [...localSupplies, itemData]
      await persistSupplies(updated)
      resetForm()
    } catch (err) {
      console.error('Failed to save supply:', err)
      setError(err.message || 'Failed to save item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item) => {
    setFormData({
      name: item.name || '',
      quantity: item.quantity || '',
      size: item.size || '',
      shoppingLink: item.shoppingLink || '',
      notes: item.notes || '',
    })
    setEditingId(item.id)
    setShowAddForm(true)
    setError(null)
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    try {
      const updated = localSupplies.filter((s) => s.id !== itemId)
      await persistSupplies(updated)
    } catch (err) {
      console.error('Failed to delete supply:', err)
      alert('Failed to delete item. Please try again.')
    }
  }

  const handleTogglePurchased = async (itemId) => {
    if (isDemo || !projectId) return
    try {
      const updated = localSupplies.map((s) =>
        s.id === itemId ? { ...s, purchased: !s.purchased } : s
      )
      await persistSupplies(updated)
    } catch (err) {
      console.error('Failed to update item:', err)
      alert('Failed to update item. Please try again.')
    }
  }

  const handleQuickAdd = async () => {
    const itemName = quickAddInput.trim()
    if (!itemName) return
    try {
      const itemData = {
        id: `supply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: itemName,
        quantity: '',
        size: '',
        shoppingLink: '',
        notes: '',
        category: 'General',
        essential: false,
        purchased: false,
      }
      await persistSupplies([...localSupplies, itemData])
      setQuickAddInput('')
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

  if (localSupplies.length === 0 && !projectId) {
    return (
      <div className="materials-empty">
        <div className="empty-state">
          <span className="empty-icon">🛠️</span>
          <h3>No supplies listed</h3>
          <p>Items you need for this project will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="project-materials">
      <div className="materials-header">
        <div>
          <h3>Supplies</h3>
          <p>Everything you need to complete this project</p>
        </div>
      </div>

      {projectId && !isDemo && (
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

      <SuppliesList
        supplies={localSupplies}
        onToggle={isDemo || !projectId ? null : handleTogglePurchased}
        onEdit={isDemo || !projectId ? null : handleEdit}
        onDelete={isDemo || !projectId ? null : handleDelete}
      />

      {showAddForm && projectId && !isDemo && (
        <div className="form-modal-overlay" onClick={resetForm}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h3>{editingId ? 'Edit item' : 'Add item'}</h3>
              <button className="close-button" onClick={resetForm} type="button">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="material-form">
              {error && <div className="form-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="name">Item name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
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
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="shoppingLink">Shopping link</label>
                <input
                  type="url"
                  id="shoppingLink"
                  name="shoppingLink"
                  value={formData.shoppingLink}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const SuppliesList = ({ supplies, onToggle, onEdit, onDelete }) => {
  if (supplies.length === 0) {
    return (
      <div className="empty-filtered">
        <p>No items yet. Add supplies using the field above.</p>
      </div>
    )
  }

  return (
    <div className="materials-list-simple">
      {supplies.map((item) => (
        <div
          key={item.id}
          className={`material-item-simple ${item.purchased ? 'checked' : ''}`}
        >
          <div className="item-checkbox-simple">
            <input
              type="checkbox"
              id={`supply-${item.id}`}
              checked={!!item.purchased}
              onChange={onToggle ? () => onToggle(item.id) : undefined}
              readOnly={!onToggle}
            />
            <label htmlFor={`supply-${item.id}`} className="checkbox-label-simple">
              <span className="checkmark-simple">✓</span>
            </label>
          </div>

          <div className="item-content-simple">
            <div className="item-header-simple">
              <h6 className="item-name-simple">{item.name}</h6>
              {(onEdit || onDelete) && (
                <div className="item-actions-simple">
                  {onEdit && (
                    <button
                      type="button"
                      className="edit-button-simple"
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="delete-button-simple"
                      onClick={() => onDelete(item.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="item-details-simple">
              {item.quantity && (
                <div className="detail-item">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{item.quantity}</span>
                </div>
              )}
              {item.size && (
                <div className="detail-item">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{item.size}</span>
                </div>
              )}
              {item.shoppingLink && (
                <div className="detail-item">
                  <span className="detail-label">Link:</span>
                  <a
                    href={item.shoppingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shopping-link-simple"
                    title={item.shoppingLink}
                  >
                    {shortLinkDisplay(item.shoppingLink)}
                    <span className="external-icon">↗</span>
                  </a>
                </div>
              )}
              {item.notes && (
                <div className="detail-item">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{item.notes}</span>
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
