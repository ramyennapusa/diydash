import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjectCard from './ProjectCard'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const renderWithRouter = (component) =>
  render(<MemoryRouter>{component}</MemoryRouter>)

const mockProject = {
  id: '1',
  title: 'Test Project',
  description: 'A test project description',
  status: 'In Progress',
  image: 'test-image.jpg',
  createdDate: '2024-01-15T12:00:00.000Z',
  tasks: [],
}

describe('ProjectCard Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  test('renders project information', () => {
    renderWithRouter(<ProjectCard project={mockProject} />)
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText(/Started:/)).toBeInTheDocument()
  })

  test('renders project image', () => {
    renderWithRouter(<ProjectCard project={mockProject} />)
    const image = screen.getByAltText('Test Project')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'test-image.jpg')
  })

  test('navigates to project details when card is clicked', () => {
    renderWithRouter(<ProjectCard project={mockProject} />)
    const card = screen.getByText('Test Project').closest('.project-card')
    fireEvent.click(card)
    expect(mockNavigate).toHaveBeenCalledWith('/project/1')
  })
})
