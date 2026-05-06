import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjectsList from './ProjectsList'

const renderWithRouter = (component) =>
  render(<MemoryRouter>{component}</MemoryRouter>)

describe('ProjectsList Component', () => {
  test('renders main controls and stats', async () => {
    renderWithRouter(<ProjectsList />)
    expect(
      await screen.findByRole('button', { name: 'Create new project' })
    ).toBeInTheDocument()
    expect(screen.getByText('Total Projects')).toBeInTheDocument()
  })

  test('loads projects from API; default status filter shows In Progress and Planning only', async () => {
    renderWithRouter(<ProjectsList />)
    await waitFor(() => {
      expect(screen.getByText('Project B')).toBeInTheDocument()
      expect(screen.getByText('Project C')).toBeInTheDocument()
    })
    expect(screen.queryByText('Project A')).not.toBeInTheDocument()
  })

  test('exposes sort control wired to the projects list', async () => {
    renderWithRouter(<ProjectsList />)
    await screen.findByText('Project B')
    const sortSelect = screen.getByLabelText(/sort/i)
    expect(sortSelect).toHaveValue('newest')
  })
})
