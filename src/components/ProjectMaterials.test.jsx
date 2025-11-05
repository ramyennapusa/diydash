import { render, screen, fireEvent } from '@testing-library/react'
import ProjectMaterials from './ProjectMaterials'

const mockMaterials = [
  {
    id: '1',
    name: 'Wood Plank',
    quantity: '5 pieces',
    specification: '2x4 pine lumber',
    estimatedCost: 25.50,
    supplier: 'Home Depot',
    category: 'Wood',
    essential: true
  },
  {
    id: '2',
    name: 'Screws',
    quantity: '1 box',
    specification: '2.5 inch wood screws',
    estimatedCost: 8.99,
    supplier: 'Lowes',
    category: 'Hardware',
    essential: false
  }
]

const mockTools = [
  {
    id: '1',
    name: 'Drill',
    description: 'Cordless drill for making holes',
    essential: true,
    alternatives: ['Manual drill', 'Screwdriver'],
    category: 'Power Tools'
  },
  {
    id: '2',
    name: 'Hammer',
    description: 'For driving nails',
    essential: false,
    alternatives: ['Mallet'],
    category: 'Hand Tools'
  }
]

describe('ProjectMaterials Component', () => {
  test('renders empty state when no materials or tools provided', () => {
    render(<ProjectMaterials materials={[]} tools={[]} />)
    
    expect(screen.getByText('No Materials or Tools Listed')).toBeInTheDocument()
    expect(screen.getByText('Material and tool requirements will appear here when available.')).toBeInTheDocument()
  })

  test('renders materials and tools with correct information', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    expect(screen.getByText('Materials & Tools')).toBeInTheDocument()
    expect(screen.getByText('Wood Plank')).toBeInTheDocument()
    expect(screen.getByText('Screws')).toBeInTheDocument()
  })

  test('displays estimated total cost', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    expect(screen.getByText('Estimated Total Cost')).toBeInTheDocument()
    expect(screen.getByText('$34.49')).toBeInTheDocument()
  })

  test('switches between materials and tools tabs', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    // Initially on materials tab
    expect(screen.getByText('Wood Plank')).toBeInTheDocument()
    
    // Switch to tools tab
    const toolsTab = screen.getByText('🔨 Tools (2)')
    fireEvent.click(toolsTab)
    
    expect(screen.getByText('Drill')).toBeInTheDocument()
    expect(screen.getByText('Hammer')).toBeInTheDocument()
  })

  test('toggles material checklist items', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    const woodPlankCheckbox = screen.getByLabelText('Wood Plank')
    expect(woodPlankCheckbox).not.toBeChecked()
    
    fireEvent.click(woodPlankCheckbox)
    expect(woodPlankCheckbox).toBeChecked()
  })

  test('toggles tool checklist items', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    // Switch to tools tab
    const toolsTab = screen.getByText('🔨 Tools (2)')
    fireEvent.click(toolsTab)
    
    const drillCheckbox = screen.getByLabelText('Drill')
    expect(drillCheckbox).not.toBeChecked()
    
    fireEvent.click(drillCheckbox)
    expect(drillCheckbox).toBeChecked()
  })

  test('filters materials by category', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    const categoryFilter = screen.getByDisplayValue('All Categories')
    fireEvent.change(categoryFilter, { target: { value: 'Wood' } })
    
    expect(screen.getByText('Wood Plank')).toBeInTheDocument()
    expect(screen.queryByText('Screws')).not.toBeInTheDocument()
  })

  test('filters by essential items only', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    const essentialFilter = screen.getByLabelText('Essential items only')
    fireEvent.click(essentialFilter)
    
    expect(screen.getByText('Wood Plank')).toBeInTheDocument()
    expect(screen.queryByText('Screws')).not.toBeInTheDocument()
  })

  test('displays essential badges for essential items', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    expect(screen.getByText('Essential')).toBeInTheDocument()
  })

  test('displays material specifications and costs', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    expect(screen.getByText('Quantity: 5 pieces')).toBeInTheDocument()
    expect(screen.getByText('2x4 pine lumber')).toBeInTheDocument()
    expect(screen.getByText('Est. Cost: $25.50')).toBeInTheDocument()
    expect(screen.getByText('Supplier: Home Depot')).toBeInTheDocument()
  })

  test('displays tool descriptions and alternatives', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    // Switch to tools tab
    const toolsTab = screen.getByText('🔨 Tools (2)')
    fireEvent.click(toolsTab)
    
    expect(screen.getByText('Cordless drill for making holes')).toBeInTheDocument()
    expect(screen.getByText('Alternatives:')).toBeInTheDocument()
    expect(screen.getByText('Manual drill')).toBeInTheDocument()
    expect(screen.getByText('Screwdriver')).toBeInTheDocument()
  })

  test('displays progress bars for materials and tools', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    expect(screen.getByText('📦 Materials')).toBeInTheDocument()
    expect(screen.getByText('🔨 Tools')).toBeInTheDocument()
    expect(screen.getByText('0/2')).toBeInTheDocument() // Initial progress
  })

  test('updates progress when items are checked', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    const woodPlankCheckbox = screen.getByLabelText('Wood Plank')
    fireEvent.click(woodPlankCheckbox)
    
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  test('groups items by category', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    expect(screen.getByText('🪵')).toBeInTheDocument() // Wood icon
    expect(screen.getByText('🔩')).toBeInTheDocument() // Hardware icon
    expect(screen.getByText('Wood')).toBeInTheDocument()
    expect(screen.getByText('Hardware')).toBeInTheDocument()
  })

  test('shows empty filtered state when no items match filters', () => {
    render(<ProjectMaterials materials={mockMaterials} tools={mockTools} />)
    
    const categoryFilter = screen.getByDisplayValue('All Categories')
    fireEvent.change(categoryFilter, { target: { value: 'NonExistent' } })
    
    expect(screen.getByText('No materials match the current filters.')).toBeInTheDocument()
  })
})