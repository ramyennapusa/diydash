import React, { useState, useEffect } from 'react'
import '../styles/ProjectMaterials.css'

const ProjectMaterials = ({ materials = [], tools = [] }) => {
  const [activeTab, setActiveTab] = useState('materials')
  const [materialChecklist, setMaterialChecklist] = useState({})
  const [toolChecklist, setToolChecklist] = useState({})
  const [filterCategory, setFilterCategory] = useState('all')
  const [showEssentialOnly, setShowEssentialOnly] = useState(false)

  // Initialize checklist states
  useEffect(() => {
    const materialStates = {}
    materials.forEach(material => {
      materialStates[material.id] = false
    })
    setMaterialChecklist(materialStates)

    const toolStates = {}
    tools.forEach(tool => {
      toolStates[tool.id] = false
    })
    setToolChecklist(toolStates)
  }, [materials, tools])

  const handleMaterialToggle = (materialId) => {
    setMaterialChecklist(prev => ({
      ...prev,
      [materialId]: !prev[materialId]
    }))
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
  const totalCost = materials.reduce((sum, material) => sum + (material.estimatedCost || 0), 0)

  // Get unique categories for filtering
  const materialCategories = ['all', ...new Set(materials.map(m => m.category))]
  const toolCategories = ['all', ...new Set(tools.map(t => t.category))]

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const categoryMatch = filterCategory === 'all' || material.category === filterCategory
    const essentialMatch = !showEssentialOnly || material.essential
    return categoryMatch && essentialMatch
  })

  // Filter tools
  const filteredTools = tools.filter(tool => {
    const categoryMatch = filterCategory === 'all' || tool.category === filterCategory
    const essentialMatch = !showEssentialOnly || tool.essential
    return categoryMatch && essentialMatch
  })

  // Calculate checklist progress
  const checkedMaterials = Object.values(materialChecklist).filter(Boolean).length
  const checkedTools = Object.values(toolChecklist).filter(Boolean).length
  const materialProgress = materials.length > 0 ? Math.round((checkedMaterials / materials.length) * 100) : 0
  const toolProgress = tools.length > 0 ? Math.round((checkedTools / tools.length) * 100) : 0

  if (materials.length === 0 && tools.length === 0) {
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

  return (
    <div className="project-materials">
      <div className="materials-header">
        <h3>Materials & Tools</h3>
        <p>Everything you need to complete this project</p>
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
            <span>{checkedMaterials}/{materials.length}</span>
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
            <span>{checkedTools}/{tools.length}</span>
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
          📦 Materials ({materials.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          🔨 Tools ({tools.length})
        </button>
      </div>

      {/* Filters */}
      <div className="materials-filters">
        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select 
            id="category-filter"
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            {(activeTab === 'materials' ? materialCategories : toolCategories).map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : `${getCategoryIcon(category)} ${category}`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="checkbox-filter">
            <input
              type="checkbox"
              checked={showEssentialOnly}
              onChange={(e) => setShowEssentialOnly(e.target.checked)}
            />
            <span className="checkmark"></span>
            Essential items only
          </label>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'materials' && (
          <MaterialsList 
            materials={filteredMaterials}
            checklist={materialChecklist}
            onToggle={handleMaterialToggle}
            getCategoryIcon={getCategoryIcon}
          />
        )}
        
        {activeTab === 'tools' && (
          <ToolsList 
            tools={filteredTools}
            checklist={toolChecklist}
            onToggle={handleToolToggle}
            getCategoryIcon={getCategoryIcon}
          />
        )}
      </div>
    </div>
  )
}

// Materials List Component
const MaterialsList = ({ materials, checklist, onToggle, getCategoryIcon }) => {
  if (materials.length === 0) {
    return (
      <div className="empty-filtered">
        <p>No materials match the current filters.</p>
      </div>
    )
  }

  // Group materials by category
  const materialsByCategory = materials.reduce((acc, material) => {
    const category = material.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(material)
    return acc
  }, {})

  return (
    <div className="materials-list">
      {Object.entries(materialsByCategory).map(([category, categoryMaterials]) => (
        <div key={category} className="category-section">
          <h5 className="category-header">
            <span className="category-icon">{getCategoryIcon(category)}</span>
            {category}
            <span className="category-count">({categoryMaterials.length})</span>
          </h5>
          
          <div className="items-grid">
            {categoryMaterials.map((material) => (
              <div key={material.id} className={`material-item ${checklist[material.id] ? 'checked' : ''}`}>
                <div className="item-checkbox">
                  <input
                    type="checkbox"
                    id={`material-${material.id}`}
                    checked={checklist[material.id] || false}
                    onChange={() => onToggle(material.id)}
                  />
                  <label htmlFor={`material-${material.id}`} className="checkbox-label">
                    <span className="checkmark">✓</span>
                  </label>
                </div>
                
                <div className="item-content">
                  <div className="item-header">
                    <h6 className="item-name">{material.name}</h6>
                    {material.essential && <span className="essential-badge">Essential</span>}
                  </div>
                  
                  <div className="item-details">
                    <p className="item-quantity">Quantity: {material.quantity}</p>
                    <p className="item-specification">{material.specification}</p>
                    {material.estimatedCost > 0 && (
                      <p className="item-cost">Est. Cost: ${material.estimatedCost.toFixed(2)}</p>
                    )}
                    {material.supplier && (
                      <p className="item-supplier">Supplier: {material.supplier}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Tools List Component
const ToolsList = ({ tools, checklist, onToggle, getCategoryIcon }) => {
  if (tools.length === 0) {
    return (
      <div className="empty-filtered">
        <p>No tools match the current filters.</p>
      </div>
    )
  }

  // Group tools by category
  const toolsByCategory = tools.reduce((acc, tool) => {
    const category = tool.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(tool)
    return acc
  }, {})

  return (
    <div className="tools-list">
      {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
        <div key={category} className="category-section">
          <h5 className="category-header">
            <span className="category-icon">{getCategoryIcon(category)}</span>
            {category}
            <span className="category-count">({categoryTools.length})</span>
          </h5>
          
          <div className="items-grid">
            {categoryTools.map((tool) => (
              <div key={tool.id} className={`tool-item ${checklist[tool.id] ? 'checked' : ''}`}>
                <div className="item-checkbox">
                  <input
                    type="checkbox"
                    id={`tool-${tool.id}`}
                    checked={checklist[tool.id] || false}
                    onChange={() => onToggle(tool.id)}
                  />
                  <label htmlFor={`tool-${tool.id}`} className="checkbox-label">
                    <span className="checkmark">✓</span>
                  </label>
                </div>
                
                <div className="item-content">
                  <div className="item-header">
                    <h6 className="item-name">{tool.name}</h6>
                    {tool.essential && <span className="essential-badge">Essential</span>}
                  </div>
                  
                  <div className="item-details">
                    <p className="item-description">{tool.description}</p>
                    {tool.alternatives && tool.alternatives.length > 0 && (
                      <div className="alternatives">
                        <p className="alternatives-label">Alternatives:</p>
                        <ul className="alternatives-list">
                          {tool.alternatives.map((alt, index) => (
                            <li key={index}>{alt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProjectMaterials