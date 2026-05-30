import { useNavigate } from 'react-router-dom'
import { DEMO_PROJECTS } from '../data/demoProject'
import '../styles/DemoLanding.css'

const DEMO_ROUTES = {
  birthday: '/demo/birthday',
  patio: '/demo/patio',
}

export default function DemoLanding() {
  const navigate = useNavigate()

  const completedCount = (project) =>
    (project.tasks || []).filter(t => t.completed).length

  return (
    <div className="demo-landing">
      <div className="demo-landing-banner">
        <span>You're exploring sample projects.</span>
        <button
          className="demo-landing-banner-cta"
          onClick={() => navigate('/')}
        >
          Sign up free to create your own →
        </button>
      </div>

      <div className="demo-landing-body">
        <div className="demo-landing-heading">
          <h1>Explore Draft2Done</h1>
          <p>Click a project to see how teams plan and track real DIY projects.</p>
        </div>

        <div className="demo-landing-grid">
          {DEMO_PROJECTS.map((project) => (
            <div
              key={project.id}
              className="demo-card"
              onClick={() => navigate(DEMO_ROUTES[project.id])}
            >
              <div className="demo-card-image">
                <img
                  src={project.image}
                  alt={project.title}
                  onError={(e) => { e.target.src = '/draft2done-login-bg.png' }}
                />
              </div>
              <div className="demo-card-body">
                <h2 className="demo-card-title">{project.title}</h2>
                <p className="demo-card-desc">{project.description}</p>
                <div className="demo-card-meta">
                  <span className="demo-card-status">{project.status}</span>
                  <span>{(project.tasks || []).length} tasks · {completedCount(project)} done</span>
                </div>
                <div className="demo-card-cta">Explore this project →</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
