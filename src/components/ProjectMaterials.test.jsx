import { render, screen, fireEvent } from '@testing-library/react'
import ProjectMaterials from './ProjectMaterials'

const mockMaterials = [
  {
    id: '1',
    name: 'Wood Plank',
    quantity: '5 pieces',
    size: '2x4 pine lumber',
    estimatedCost: 25.5,
    shoppingLink: 'https://homedepot.example',
    category: 'Wood',
    essential: true,
  },
  {
    id: '2',
    name: 'Screws',
    quantity: '1 box',
    size: '2.5 inch wood screws',
    estimatedCost: 8.99,
    shoppingLink: '',
    category: 'Hardware',
    essential: false,
  },
]

const mockTools = [
  {
    id: '1',
    name: 'Drill',
    description: 'Cordless drill for making holes',
    essential: true,
    alternatives: ['Manual drill', 'Screwdriver'],
    category: 'Power Tools',
  },
]

describe('ProjectMaterials Component', () => {
  test('renders empty state when no materials or tools and no project', () => {
    render(<ProjectMaterials materials={[]} tools={[]} />)
    expect(screen.getByText('No Materials or Tools Listed')).toBeInTheDocument()
    expect(
      screen.getByText('Material and tool requirements will appear here when available.')
    ).toBeInTheDocument()
  })

  test('renders material names on the materials tab', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    expect(screen.getByText('Materials & Tools')).toBeInTheDocument()
    expect(screen.getByText('Wood Plank')).toBeInTheDocument()
    expect(screen.getByText('Screws')).toBeInTheDocument()
  })

  test('switches to tools tab', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    fireEvent.click(screen.getByText(/Tools \(1\)/))
    expect(screen.getByText('Drill')).toBeInTheDocument()
  })
})
