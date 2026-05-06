import { render, screen } from '@testing-library/react'
import ProjectTasks from './ProjectTasks'

const mockTasks = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description 1',
    completed: false,
    estimatedTime: '2 hours',
    difficulty: 'Beginner',
    order: 1,
    category: 'Planning',
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    completed: true,
    estimatedTime: '4 hours',
    difficulty: 'Intermediate',
    order: 2,
    category: 'Construction',
  },
]

describe('ProjectTasks Component', () => {
  test('renders empty state when no tasks provided', () => {
    render(<ProjectTasks tasks={[]} />)
    expect(screen.getByText('No Tasks Yet')).toBeInTheDocument()
    expect(
      screen.getByText('Create your first task to start tracking your project progress.')
    ).toBeInTheDocument()
  })

  test('renders task titles and descriptions', () => {
    render(<ProjectTasks tasks={mockTasks} />)
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getByText('Description 2')).toBeInTheDocument()
  })
})
