import { useState, useMemo, useEffect } from 'react'
import ProjectCard from './ProjectCard'
import CreateProject from './CreateProject'
import apiClient from '../services/api'
import './ProjectsList.css'

const DEFAULT_PROJECT_IMAGE = 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop'

function ProjectsList() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Get unique statuses for filter dropdown
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(projects.map(project => project.status))]
    return ['All', ...uniqueStatuses]
  }, [projects])

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects

    // Apply status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter(project => project.status === filterStatus)
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
  }, [projects, filterStatus, sortBy])

  // Get project statistics
  const projectStats = useMemo(() => {
    const completed = projects.filter(p => p.status === 'Completed').length
    const inProgress = projects.filter(p => p.status === 'In Progress').length
    const planning = projects.filter(p => p.status === 'Planning').length
    return { completed, inProgress, planning, total: projects.length }
  }, [projects])

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const apiStatus = filterStatus !== 'All' ? filterStatus : null
        const response = await apiClient.getProjects(apiStatus)
        setProjects(response.projects || [])
      } catch (err) {
        console.error('Failed to load projects:', err)
        setError(err.message || 'Failed to load projects')
      } finally {
        setIsLoading(false)
      }
    }

    loadProjects()
  }, [filterStatus])

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
          <button
            className="btn-create-project"
            onClick={() => setShowCreateModal(true)}
            aria-label="Create new project"
          >
            <span className="btn-create-icon">+</span>
            Create Project
          </button>
          
          <div className="control-item">
            <label htmlFor="status-filter" className="control-label">Filter:</label>
            <select 
              id="status-filter"
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="modern-select"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
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
              {filterStatus !== 'All' 
                ? `No projects with status "${filterStatus}" found. Try adjusting your filters.`
                : 'Ready to start your first DIY adventure? Every great maker starts with a single project!'
              }
            </p>
            {filterStatus !== 'All' && (
              <button 
                className="btn btn-primary"
                onClick={() => setFilterStatus('All')}
              >
                Show All Projects
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