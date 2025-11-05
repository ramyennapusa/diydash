import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import ProjectsList from './components/ProjectsList'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <Router>
      <div className="app">
        <ErrorBoundary>
          <Navigation />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<ProjectsList />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </ErrorBoundary>
      </div>
    </Router>
  )
}

export default App
