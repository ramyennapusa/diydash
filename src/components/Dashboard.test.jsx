import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

describe('Dashboard Component', () => {
  test('renders dashboard title', () => {
    render(<Dashboard />)
    expect(screen.getByText('DIYDash')).toBeInTheDocument()
  })

  test('renders dashboard subtitle', () => {
    render(<Dashboard />)
    expect(screen.getByText('Your DIY Project Management Dashboard')).toBeInTheDocument()
  })

  test('renders welcome section', () => {
    render(<Dashboard />)
    expect(screen.getByText('Welcome to DIYDash!')).toBeInTheDocument()
    expect(screen.getByText(/Organize, track, and manage all your DIY projects/)).toBeInTheDocument()
  })

  test('renders feature preview cards', () => {
    render(<Dashboard />)
    expect(screen.getByText('🔨 Project Tracking')).toBeInTheDocument()
    expect(screen.getByText('📋 Task Management')).toBeInTheDocument()
    expect(screen.getByText('🛠️ Tool & Material Lists')).toBeInTheDocument()
  })

  test('renders feature descriptions', () => {
    render(<Dashboard />)
    expect(screen.getByText('Keep track of your ongoing DIY projects and their progress')).toBeInTheDocument()
    expect(screen.getByText('Break down projects into manageable tasks and check them off')).toBeInTheDocument()
    expect(screen.getByText('Organize your tools and materials for each project')).toBeInTheDocument()
  })
})