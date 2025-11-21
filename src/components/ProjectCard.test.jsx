import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjectCard from './ProjectCard'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const renderWithRouter = (component) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  )
}

const mockProject = {
  id: '1',
  title: 'Test Project',
  description: 'A test project description',
  status: 'In Progress',
  image: 'test-image.jpg',
  createdDate: '2024-01-15'
}

describe('ProjectCard Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  test('renders project information correctly', () => {
    renderWithRouter(<ProjectCard project={mockProject} />)
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('A test project description')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText(/Started: Jan 14, 2024/)).toBeInTheDocument()
  })

  test('renders project image with correct alt text', () => {
    renderWithRouter(<ProjectCard project={mockProject} />)
    
    const image = screen.getByAltText('Test Project')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'test-image.jpg')
  })

  test('navigates to project details when clicked', () => {
    renderWithRouter(<ProjectCard project={mockProject} />)
    
    const card = screen.getByText('Test Project').closest('.project-card')
    fireEvent.click(card)
    
    expect(mockNavigate).toHaveBeenCalledWith('/project/1')
  })

  test('applies correct status class for different statuses', () => {
    const completedProject = { ...mockProject, status: 'Completed' }
    renderWithRouter(<ProjectCard project={completedProject} />)
    
    const statusElement = screen.getByText('Completed')
    expect(statusElement).toHaveClass('project-status', 'status-completed')
  })

  test('handles image error with fallback', () => {
    renderWithRouter(<ProjectCard project={mockProject} />)
    
    const image = screen.getByAltText('Test Project')
    fireEvent.error(image)
    
    expect(image).toHaveAttribute('src', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop')
  })

  test('formats date correctly', () => {
    const projectWithDate = { ...mockProject, createdDate: '2024-12-25' }
    renderWithRouter(<ProjectCard project={projectWithDate} />)
    
    expect(screen.getByText(/Started: Dec 24, 2024/)).toBeInTheDocument()
  })
})