import { render, screen, fireEvent } from '@testing-library/react'
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
    category: 'Planning'
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description 2',
    completed: true,
    estimatedTime: '4 hours',
    difficulty: 'Intermediate',
    order: 2,
    category: 'Construction'
  }
]

describe('ProjectTasks Component', () => {
  test('renders empty state when no tasks provided', () => {
    render(<ProjectTasks tasks={[]} />)
    
    expect(screen.getByText('No Tasks Yet')).toBeInTheDocument()
    expect(screen.getByText('Tasks will be added as the project plan develops.')).toBeInTheDocument()
  })

  test('renders tasks with correct information', () => {
    render(<ProjectTasks tasks={mockTasks} />)
    
    expect(screen.getByText('Project Tasks')).toBeInTheDocument()
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getByText('Description 2')).toBeInTheDocument()
  })

  test('displays correct progress statistics', () => {
    render(<ProjectTasks tasks={mockTasks} />)
    
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Remaining')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument() // Progress
  })

  test('toggles task completion when checkbox is clicked', () => {
    render(<ProjectTasks tasks={mockTasks} />)
    
    const checkboxes = screen.getAllByRole('checkbox', { name: '✓' })
    const firstTaskCheckbox = checkboxes[0] // First checkbox (Task 1)
    expect(firstTaskCheckbox).not.toBeChecked()
    
    fireEvent.click(firstTaskCheckbox)
    expect(firstTaskCheckbox).toBeChecked()
  })

  test('filters tasks by category', () => {
    render(<ProjectTasks tasks={mockTasks} />)
    
    const categorySelect = screen.getByDisplayValue('All Categories')
    fireEvent.change(categorySelect, { target: { value: 'Planning' } })
    
    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument()
  })

  test('displays difficulty badges with correct colors', () => {
    render(<ProjectTasks tasks={mockTasks} />)
    
    const beginnerBadge = screen.getByText('Beginner')
    const intermediateBadge = screen.getByText('Intermediate')
    
    expect(beginnerBadge).toBeInTheDocument()
    expect(intermediateBadge).toBeInTheDocument()
  })

  test('displays estimated time for tasks', () => {
    render(<ProjectTasks tasks={mockTasks} />)
    
    expect(screen.getByText('⏱️ 2 hours')).toBeInTheDocument()
    expect(screen.getByText('⏱️ 4 hours')).toBeInTheDocument()
  })

  test('groups tasks by category when showing all categories', () => {
    render(<ProjectTasks tasks={mockTasks} />)
    
    expect(screen.getByText('📋')).toBeInTheDocument() // Planning icon
    expect(screen.getByText('🔨')).toBeInTheDocument() // Construction icon
    expect(screen.getByText('Planning')).toBeInTheDocument()
    expect(screen.getByText('Construction')).toBeInTheDocument()
  })

  test('updates progress bar when tasks are completed', () => {
    render(<ProjectTasks tasks={mockTasks} />)
    
    const progressBar = document.querySelector('.progress-fill')
    expect(progressBar).toHaveStyle('width: 50%')
    
    const checkboxes = screen.getAllByRole('checkbox', { name: '✓' })
    const firstTaskCheckbox = checkboxes[0] // First checkbox (unchecked)
    fireEvent.click(firstTaskCheckbox)
    
    // Progress should update to 100% (2 out of 2 completed)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  test('sorts tasks by order', () => {
    const unsortedTasks = [
      { ...mockTasks[1], order: 1 },
      { ...mockTasks[0], order: 2 }
    ]
    
    render(<ProjectTasks tasks={unsortedTasks} />)
    
    const taskTitles = screen.getAllByText(/Task [12]/)
    expect(taskTitles[0]).toHaveTextContent('Task 2')
    expect(taskTitles[1]).toHaveTextContent('Task 1')
  })
})