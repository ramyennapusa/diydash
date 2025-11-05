import { render, screen, fireEvent } from '@testing-library/react'
import ProjectPictures from './ProjectPictures'

const mockPictures = [
  {
    id: '1',
    url: 'test-image-1.jpg',
    caption: 'Test Image 1',
    type: 'progress',
    order: 1
  },
  {
    id: '2',
    url: 'test-image-2.jpg',
    caption: 'Test Image 2',
    type: 'final',
    order: 2
  }
]

describe('ProjectPictures Component', () => {
  test('renders empty state when no pictures provided', () => {
    render(<ProjectPictures pictures={[]} />)
    
    expect(screen.getByText('No Pictures Yet')).toBeInTheDocument()
    expect(screen.getByText('Pictures will appear here as the project progresses.')).toBeInTheDocument()
  })

  test('renders pictures grid with correct information', () => {
    render(<ProjectPictures pictures={mockPictures} />)
    
    expect(screen.getByText('Project Gallery')).toBeInTheDocument()
    expect(screen.getByText('Test Image 1')).toBeInTheDocument()
    expect(screen.getByText('Test Image 2')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('Final Result')).toBeInTheDocument()
  })

  test('opens lightbox modal when image is clicked', () => {
    render(<ProjectPictures pictures={mockPictures} />)
    
    const firstImage = screen.getByAltText('Test Image 1')
    fireEvent.click(firstImage)
    
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument()
    expect(document.querySelector('.lightbox-modal')).toBeInTheDocument()
  })

  test('closes lightbox modal when close button is clicked', () => {
    render(<ProjectPictures pictures={mockPictures} />)
    
    const firstImage = screen.getByAltText('Test Image 1')
    fireEvent.click(firstImage)
    
    const closeButton = screen.getByRole('button', { name: '✕' })
    fireEvent.click(closeButton)
    
    expect(screen.queryByRole('button', { name: '✕' })).not.toBeInTheDocument()
  })

  test('opens lightbox modal when view button is clicked', () => {
    render(<ProjectPictures pictures={mockPictures} />)
    
    const viewButtons = screen.getAllByText('🔍 View')
    fireEvent.click(viewButtons[0])
    
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument()
  })

  test('handles image error correctly', () => {
    render(<ProjectPictures pictures={mockPictures} />)
    
    const firstImage = screen.getByAltText('Test Image 1')
    fireEvent.error(firstImage)
    
    expect(screen.getByText('Image not available')).toBeInTheDocument()
  })

  test('sorts pictures by order', () => {
    const unsortedPictures = [
      { ...mockPictures[1], order: 1 },
      { ...mockPictures[0], order: 2 }
    ]
    
    render(<ProjectPictures pictures={unsortedPictures} />)
    
    const images = screen.getAllByRole('img')
    expect(images[0]).toHaveAttribute('alt', 'Test Image 2')
    expect(images[1]).toHaveAttribute('alt', 'Test Image 1')
  })

  test('displays correct type icons and labels', () => {
    render(<ProjectPictures pictures={mockPictures} />)
    
    expect(screen.getByText('🔄')).toBeInTheDocument() // progress icon
    expect(screen.getByText('✅')).toBeInTheDocument() // final icon
  })
})