import './ProjectCard.css'

function ProjectCard({ project }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed'
      case 'In Progress':
        return 'status-in-progress'
      case 'Planning':
        return 'status-planning'
      default:
        return 'status-default'
    }
  }

  return (
    <div className="project-card">
      <div className="project-card-image">
        <img 
          src={project.image} 
          alt={project.title}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop'
          }}
        />
        <div className={`project-status ${getStatusColor(project.status)}`}>
          {project.status}
        </div>
      </div>
      
      <div className="project-card-content">
        <h3 className="project-title">{project.title}</h3>
        <p className="project-description">{project.description}</p>
        <div className="project-meta">
          <span className="project-date">
            Started: {formatDate(project.createdDate)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProjectCard