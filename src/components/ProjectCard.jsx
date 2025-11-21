import { useNavigate } from 'react-router-dom'
import './ProjectCard.css'

const DEFAULT_PROJECT_IMAGE = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'

function ProjectCard({ project }) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/project/${project.id}`)
  }

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
      case 'Deleted':
        return 'status-deleted'
      default:
        return 'status-default'
    }
  }

  // Use default image if no image is provided or if image is empty string
  const imageUrl = project.image && project.image.trim() !== '' 
    ? project.image 
    : DEFAULT_PROJECT_IMAGE

  return (
    <div className="project-card" onClick={handleCardClick}>
      <div className="project-card-image">
        <img 
          src={imageUrl} 
          alt={project.title}
          onError={(e) => {
            e.target.src = DEFAULT_PROJECT_IMAGE
          }}
        />
        <div className={`project-status ${getStatusColor(project.status)}`}>
          {project.status}
        </div>
      </div>
      
      <div className="project-card-content">
        <h3 className="project-title">{project.title}</h3>
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