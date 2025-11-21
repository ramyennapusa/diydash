import { useState, useMemo, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import CreateProject from './CreateProject'
import apiClient from '../services/api'
import './ProjectsList.css'

const DEFAULT_PROJECT_IMAGE = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'

function ProjectsList() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  // By default, exclude "Completed" and "Deleted" - only show Planning and In Progress
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(['Planning', 'In Progress']))
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  // Available status options
  const statusOptions = ['Planning', 'In Progress', 'Completed', 'Deleted']

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects

    // Apply status filter - show projects matching any selected status
    if (selectedStatuses.size > 0) {
      filtered = filtered.filter(project => selectedStatuses.has(project.status))
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(project => {
        const title = (project.title || '').toLowerCase()
        const description = (project.description || '').toLowerCase()
        return title.includes(query) || description.includes(query)
      })
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdDate) - new Date(a.createdDate)
        case 'oldest':
          return new Date(a.createdDate) - new Date(b.createdDate)
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return sorted
  }, [projects, selectedStatuses, sortBy, searchQuery])

  // Handle status checkbox toggle
  const handleStatusToggle = (status) => {
    setSelectedStatuses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(status)) {
        newSet.delete(status)
      } else {
        newSet.add(status)
      }
      return newSet
    })
  }

  // Get filter button text
  const getFilterButtonText = () => {
    if (selectedStatuses.size === 0) {
      return 'No status selected'
    }
    if (selectedStatuses.size === statusOptions.length) {
      return 'All statuses'
    }
    if (selectedStatuses.size === 1) {
      return Array.from(selectedStatuses)[0]
    }
    return `${selectedStatuses.size} selected`
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterDropdown])

  // Get project statistics
  const projectStats = useMemo(() => {
    const completed = projects.filter(p => p.status === 'Completed').length
    const inProgress = projects.filter(p => p.status === 'In Progress').length
    const planning = projects.filter(p => p.status === 'Planning').length
    return { completed, inProgress, planning, total: projects.length }
  }, [projects])

  // Load projects from API - load all projects, filter client-side
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // Load all projects, filtering will be done client-side
        const response = await apiClient.getProjects(null)
        setProjects(response.projects || [])
      } catch (err) {
        console.error('Failed to load projects:', err)
        setError(err.message || 'Failed to load projects')
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [])

  const handleCreateProject = async (projectData) => {
    try {
      setIsCreating(true)
      setError(null)
      
      // Call API to create project (API will handle S3 upload if imageData is provided)
      const newProject = await apiClient.createProject(projectData)
      
      // Add the new project to the list
      setProjects(prev => [newProject, ...prev])
    } catch (err) {
      console.error('Failed to create project:', err)
      setError(err.message || 'Failed to create project')
      throw err // Re-throw so CreateProject can handle it
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="projects-list">
      {showCreateModal && (
        <CreateProject
          onClose={() => setShowCreateModal(false)}
          onCreateProject={handleCreateProject}
          isCreating={isCreating}
        />
      )}
      
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button 
            className="error-close"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Container */}
      <div className="stats-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{projectStats.total}</div>
            <div className="stat-label">Total Projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{projectStats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{projectStats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{projectStats.planning}</div>
            <div className="stat-label">Planning</div>
          </div>
        </div>
      </div>

      {/* Projects Container */}
      <div className="projects-container">
        <div className="controls-group">
          <div className="controls-left">
            <button
              className="btn-create-project"
              onClick={() => setShowCreateModal(true)}
              aria-label="Create new project"
            >
              <span className="btn-create-icon">+</span>
              Create Project
            </button>
            
            <div className="control-item filter-dropdown-container">
              <label className="control-label">Filter:</label>
              <div className="filter-dropdown-wrapper">
                <button
                  type="button"
                  className="filter-dropdown-button"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  aria-expanded={showFilterDropdown}
                  aria-haspopup="true"
                >
                  <span className="filter-button-text">{getFilterButtonText()}</span>
                  <span className={`filter-dropdown-arrow ${showFilterDropdown ? 'open' : ''}`}>▼</span>
                </button>
                {showFilterDropdown && (
                  <div className="filter-dropdown-menu">
                    {statusOptions.map(status => (
                      <label key={status} className="status-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.has(status)}
                          onChange={() => handleStatusToggle(status)}
                          className="status-checkbox"
                        />
                        <span className="status-checkbox-text">{status}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="control-item">
              <label htmlFor="sort-select" className="control-label">Sort:</label>
              <select 
                id="sort-select"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="modern-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>

          <div className="controls-right">
            <div className="search-wrapper">
              <input
                type="text"
                id="search-input"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading projects...</p>
          </div>
        ) : filteredAndSortedProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">No projects found</h3>
            <p className="empty-state-text">
              {searchQuery.trim() !== ''
                ? `No projects found matching "${searchQuery}". Try a different search term.`
                : selectedStatuses.size === 0
                ? 'No status filters selected. Please select at least one status to view projects.'
                : selectedStatuses.size < statusOptions.length
                ? `No projects found with the selected status filters. Try adjusting your filters.`
                : 'Ready to start your first DIY adventure? Every great maker starts with a single project!'
              }
            </p>
            {selectedStatuses.size === 0 && (
              <button 
                className="btn btn-primary"
                onClick={() => setSelectedStatuses(new Set(['Planning', 'In Progress']))}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="projects-grid">
            {filteredAndSortedProjects.map((project, index) => (
              <div 
                key={project.id} 
                className="project-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectsList