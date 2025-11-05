import { useState, useMemo } from 'react'
import ProjectCard from './ProjectCard'
import mockProjects from '../data/mockProjects'
import './ProjectsList.css'

function ProjectsList() {
  const [projects] = useState(mockProjects)
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

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

  return (
    <div className="projects-list">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="hero-emoji">🛠️</span>
              My DIY Projects
              <span className="hero-accent">Collection</span>
            </h1>
            <p className="hero-subtitle">
              Crafting dreams into reality, one project at a time
            </p>
          </div>
          
          {/* Stats Cards */}
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
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="controls-wrapper">
          <div className="results-info">
            <span className="results-count">
              {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
            </span>
            {filterStatus !== 'All' && (
              <span className="filter-badge">{filterStatus}</span>
            )}
          </div>
          
          <div className="controls-group">
            <div className="control-item">
              <div className="control-icon">🔍</div>
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
              <div className="control-icon">📊</div>
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
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-section">
        {filteredAndSortedProjects.length === 0 ? (
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