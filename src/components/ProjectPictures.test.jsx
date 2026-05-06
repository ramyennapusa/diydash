import { render, screen, fireEvent } from '@testing-library/react'
import ProjectPictures from './ProjectPictures'

const mockPictures = [
  {
    id: '1',
    url: 'test-image-1.jpg',
    caption: 'Test Image 1',
    type: 'progress',
    order: 1,
  },
  {
    id: '2',
    url: 'test-image-2.jpg',
    caption: 'Test Image 2',
    type: 'final',
    order: 2,
  },
]

describe('ProjectPictures Component', () => {
  test('renders empty state when no pictures provided', () => {
    render(<ProjectPictures pictures={[]} />)
    expect(screen.getByText('No Pictures Yet')).toBeInTheDocument()
    expect(
      screen.getByText('Upload pictures to track your project progress.')
    ).toBeInTheDocument()
  })

  test('renders picture captions in the grid', () => {
    render(<ProjectPictures pictures={mockPictures} />)
    expect(screen.getByText('Test Image 1')).toBeInTheDocument()
    expect(screen.getByText('Test Image 2')).toBeInTheDocument()
  })

  test('opens lightbox when an image is clicked', () => {
    render(<ProjectPictures pictures={mockPictures} />)
    fireEvent.click(screen.getByAltText('Test Image 1'))
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument()
  })
})
