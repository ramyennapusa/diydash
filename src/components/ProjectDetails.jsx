import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import ProjectPictures from './ProjectPictures'
import ProjectTasks from './ProjectTasks'
import ProjectVideos from './ProjectVideos'
import ProjectMaterials from './ProjectMaterials'
import '../styles/ProjectDetails.css'

const ProjectDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('pictures')

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const projectData = await apiClient.getProject(id)
        if (!projectData) {
          setError('Project not found')
        } else {
          setProject(projectData)
        }
      } catch (err) {
        console.error('Failed to load project details:', err)
        setError(err.message || 'Failed to load project details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  const handleBackToProjects = () => {
    navigate('/')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#10b981'
      case 'In Progress':
        return '#f59e0b'
      case 'Planning':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return '#10b981'
      case 'Intermediate':
        return '#f59e0b'
      case 'Advanced':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div className="project-details">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="project-details">
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={handleBackToProjects} className="back-button">
            ← Back to Projects
          </button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="project-details">
        <div className="error-container">
          <h2>Project not found</h2>
          <p>The project you're looking for doesn't exist.</p>
          <button onClick={handleBackToProjects} className="back-button">
            ← Back to Projects
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="project-details">
      <div className="project-header">
        <button onClick={handleBackToProjects} className="back-button">
          ← Back to Projects
        </button>
        
        <div className="project-title-section">
          <h1 className="project-title">{project.title}</h1>
          <div className="project-meta">
            <span 
              className="status-badge" 
              style={{ backgroundColor: getStatusColor(project.status) }}
            >
              {project.status}
            </span>
            <span 
              className="difficulty-badge"
              style={{ backgroundColor: getDifficultyColor(project.difficulty) }}
            >
              {project.difficulty}
            </span>
            <span className="estimated-time">
              ⏱️ {project.estimatedTime}
            </span>
          </div>
        </div>
        
        <p className="project-description">{project.description}</p>
      </div>

      <div className="project-content">
        <nav className="project-tabs">
          <button 
            className={`tab-button ${activeTab === 'pictures' ? 'active' : ''}`}
            onClick={() => setActiveTab('pictures')}
          >
            📸 Pictures
          </button>
          <button 
            className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            ✅ Tasks
          </button>
          <button 
            className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            🎥 Videos
          </button>
          <button 
            className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            🛠️ Materials
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'pictures' && <ProjectPictures pictures={project.pictures || []} />}
          {activeTab === 'tasks' && <ProjectTasks tasks={project.tasks || []} />}
          {activeTab === 'videos' && <ProjectVideos videos={project.videos || []} />}
          {activeTab === 'materials' && (
            <ProjectMaterials 
              materials={project.materials || []} 
              tools={project.tools || []} 
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetails