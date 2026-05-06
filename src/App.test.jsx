import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import ProjectsList from './components/ProjectsList'
import ProjectDetails from './components/ProjectDetails'

const STORAGE_KEY = 'draft2done_user'

describe('App Component', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: 'test@example.com' }))
  })

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY)
  })

  test('renders without crashing', async () => {
    render(<App />)
    expect(await screen.findByText('Draft2Done')).toBeInTheDocument()
  })

  test('renders ProjectsList on default route', async () => {
    render(<App />)
    expect(
      await screen.findByRole('button', { name: 'Create new project' })
    ).toBeInTheDocument()
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
    expect(screen.getByText('Welcome to Draft2Done!')).toBeInTheDocument()
  })
})