import { Link, useLocation, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import mockProjectDetails from '../data/mockProjectDetails'
import UserMenu from './UserMenu'
import './Navigation.css'

function Navigation({ user, onLogout }) {
  const location = useLocation()
  const { id } = useParams()
  const [projectTitle, setProjectTitle] = useState('')

  // Get project title for breadcrumb when on project details page
  useEffect(() => {
    if (location.pathname.startsWith('/project/') && id) {
      const project = mockProjectDetails[id]
      if (project) {
        setProjectTitle(project.title)
      }
    }
  }, [location.pathname, id])

  const renderBreadcrumb = () => {
    if (location.pathname.startsWith('/project/')) {
      return (
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Projects</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{projectTitle || 'Project Details'}</span>
        </div>
      )
    }
    if (location.pathname === '/account') {
      return (
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Projects</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Account</span>
        </div>
      )
    }
    return null
  }

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/" className="nav-brand-link">
          <h1>Draft2Done</h1>
        </Link>
      </div>
      
      <div className="nav-content">
        {renderBreadcrumb()}
        {user && onLogout && <UserMenu user={user} onLogout={onLogout} />}
      </div>
    </nav>
  )
}

export default Navigation