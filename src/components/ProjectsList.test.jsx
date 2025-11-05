import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjectsList from './ProjectsList'

// Mock the mockProjects data
jest.mock('../data/mockProjects', () => [
  {
    id: '1',
    title: 'Project A',
    description: 'Description A',
    status: 'Completed',
    image: 'image1.jpg',
    createdDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'Project B',
    description: 'Description B',
    status: 'In Progress',
    image: 'image2.jpg',
    createdDate: '2024-02-10'
  },
  {
    id: '3',
    title: 'Project C',
    description: 'Description C',
    status: 'Planning',
    image: 'image3.jpg',
    createdDate: '2024-01-20'
  }
])

const renderWithRouter = (component) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  )
}

describe('ProjectsList Component', () => {
  test('renders hero section with title and subtitle', () => {
    renderWithRouter(<ProjectsList />)
    
    expect(screen.getByText('My DIY Projects')).toBeInTheDocument()
    expect(screen.getByText('Crafting dreams into reality, one project at a time')).toBeInTheDocument()
  })

  test('displays correct project statistics', () => {
    renderWithRouter(<ProjectsList />)
    
    expect(screen.getByText('3')).toBeInTheDocument() // Total projects
    expect(screen.getByText('Total Projects')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // Completed
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Planning')).toBeInTheDocument()
  })

  test('renders all projects by default', () => {
    renderWithRouter(<ProjectsList />)
    
    expect(screen.getByText('Project A')).toBeInTheDocument()
    expect(screen.getByText('Project B')).toBeInTheDocument()
    expect(screen.getByText('Project C')).toBeInTheDocument()
    expect(screen.getByText('3 projects')).toBeInTheDocument()
  })

  test('filters projects by status', () => {
    renderWithRouter(<ProjectsList />)
    
    const statusFilter = screen.getByDisplayValue('All')
    fireEvent.change(statusFilter, { target: { value: 'Completed' } })
    
    expect(screen.getByText('Project A')).toBeInTheDocument()
    expect(screen.queryByText('Project B')).not.toBeInTheDocument()
    expect(screen.queryByText('Project C')).not.toBeInTheDocument()
    expect(screen.getByText('1 project')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument() // Filter badge
  })

  test('sorts projects correctly', () => {
    renderWithRouter(<ProjectsList />)
    
    const sortSelect = screen.getByDisplayValue('Newest First')
    fireEvent.change(sortSelect, { target: { value: 'alphabetical' } })
    
    const projectTitles = screen.getAllByText(/Project [ABC]/)
    expect(projectTitles[0]).toHaveTextContent('Project A')
    expect(projectTitles[1]).toHaveTextContent('Project B')
    expect(projectTitles[2]).toHaveTextContent('Project C')
  })

  test('shows empty state when no projects match filter', () => {
    renderWithRouter(<ProjectsList />)
    
    const statusFilter = screen.getByDisplayValue('All')
    fireEvent.change(statusFilter, { target: { value: 'Completed' } })
    
    // Clear all projects by changing to a non-existent status
    fireEvent.change(statusFilter, { target: { value: 'Non-existent' } })
    
    expect(screen.getByText('No projects found')).toBeInTheDocument()
  })

  test('clears filter when "Show All Projects" button is clicked', () => {
    renderWithRouter(<ProjectsList />)
    
    // First filter to show empty state
    const statusFilter = screen.getByDisplayValue('All')
    fireEvent.change(statusFilter, { target: { value: 'Completed' } })
    
    // Verify filter is applied
    expect(screen.getByText('1 project')).toBeInTheDocument()
    
    // Clear filter
    fireEvent.change(statusFilter, { target: { value: 'All' } })
    expect(screen.getByText('3 projects')).toBeInTheDocument()
  })

  test('renders filter and sort controls', () => {
    renderWithRouter(<ProjectsList />)
    
    expect(screen.getByDisplayValue('All')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Newest First')).toBeInTheDocument()
  })

  test('updates results count when filtering', () => {
    renderWithRouter(<ProjectsList />)
    
    // Initially shows all projects
    expect(screen.getByText('3 projects')).toBeInTheDocument()
    
    // Filter to In Progress
    const statusFilter = screen.getByDisplayValue('All')
    fireEvent.change(statusFilter, { target: { value: 'In Progress' } })
    
    expect(screen.getByText('1 project')).toBeInTheDocument()
  })
})