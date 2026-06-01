import { render, screen } from '@testing-library/react'
import ProjectMaterials from './ProjectMaterials'

const mockSupplies = [
  {
    id: '1',
    name: 'Wood Plank',
    quantity: '5 pieces',
    size: '2x4 pine lumber',
    shoppingLink: 'https://homedepot.example',
    category: 'Wood',
    essential: true,
    purchased: false,
  },
  {
    id: '2',
    name: 'Drill',
    quantity: '',
    size: '',
    shoppingLink: '',
    category: 'General',
    essential: false,
    purchased: true,
  },
]

describe('ProjectMaterials Component', () => {
  test('renders empty state when no supplies and no project', () => {
    render(<ProjectMaterials materials={[]} />)
    expect(screen.getByText('No supplies listed')).toBeInTheDocument()
    expect(
      screen.getByText('Items you need for this project will appear here.')
    ).toBeInTheDocument()
  })

  test('renders supplies list from materials prop', () => {
    render(<ProjectMaterials materials={mockSupplies} />)
    expect(screen.getByText('Supplies')).toBeInTheDocument()
    expect(screen.getByText('Wood Plank')).toBeInTheDocument()
    expect(screen.getByText('Drill')).toBeInTheDocument()
  })
})
