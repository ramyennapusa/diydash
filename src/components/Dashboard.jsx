import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">DIYDash</h1>
        <p className="dashboard-subtitle">Your DIY Project Management Dashboard</p>
      </header>
      
      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to DIYDash!</h2>
          <p>
            Organize, track, and manage all your DIY projects in one place. 
            From woodworking to electronics, crafts to home improvement - 
            DIYDash helps you stay organized and motivated.
          </p>
          <div className="dashboard-actions">
            <Link to="/" className="btn btn-primary">
              View My Projects
            </Link>
          </div>
        </div>
        
        <div className="features-preview">
          <div className="feature-card">
            <h3>🔨 Project Tracking</h3>
            <p>Keep track of your ongoing DIY projects and their progress</p>
            <Link to="/" className="feature-link">
              Browse Projects →
            </Link>
          </div>
          
          <div className="feature-card">
            <h3>📋 Task Management</h3>
            <p>Break down projects into manageable tasks and check them off</p>
            <span className="feature-link coming-soon">
              Coming Soon
            </span>
          </div>
          
          <div className="feature-card">
            <h3>🛠️ Tool & Material Lists</h3>
            <p>Organize your tools and materials for each project</p>
            <span className="feature-link coming-soon">
              Coming Soon
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard