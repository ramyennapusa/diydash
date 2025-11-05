import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import ProjectsList from './components/ProjectsList'
import ProjectDetails from './components/ProjectDetails'

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('DIYDash')).toBeInTheDocument()
  })

  test('renders ProjectsList component on default route', () => {
    render(<App />)
    expect(screen.getByText('My DIY Projects')).toBeInTheDocument()
  })

  test('renders Dashboard component on /dashboard route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <div className="app">
          <Navigation />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<ProjectsList />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/project/:id" element={<ProjectDetails />} />
            </Routes>
          </main>
        </div>
      </MemoryRouter>
    )
    expect(screen.getByText('Welcome to DIYDash!')).toBeInTheDocument()
  })
})