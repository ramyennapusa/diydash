import { render, screen, fireEvent } from '@testing-library/react'
import ProjectVideos from './ProjectVideos'

const mockVideos = [
  {
    id: '1',
    title: 'Tutorial Video',
    url: 'https://youtube.com/watch?v=test1',
    type: 'tutorial',
    description: 'A helpful tutorial',
    duration: '10:30',
    thumbnail: 'thumbnail1.jpg'
  },
  {
    id: '2',
    title: 'Progress Update',
    url: 'https://youtube.com/watch?v=test2',
    type: 'progress',
    description: 'Progress update video',
    duration: '5:15',
    thumbnail: 'thumbnail2.jpg'
  }
]

describe('ProjectVideos Component', () => {
  test('renders empty state when no videos provided', () => {
    render(<ProjectVideos videos={[]} />)
    
    expect(screen.getByText('No Videos Yet')).toBeInTheDocument()
    expect(screen.getByText('Tutorial videos and progress updates will appear here.')).toBeInTheDocument()
  })

  test('renders videos with correct information', () => {
    render(<ProjectVideos videos={mockVideos} />)
    
    expect(screen.getByText('Videos & References')).toBeInTheDocument()
    expect(screen.getByText('Tutorial Video')).toBeInTheDocument()
    expect(screen.getByText('Progress Update')).toBeInTheDocument()
    expect(screen.getByText('A helpful tutorial')).toBeInTheDocument()
    expect(screen.getByText('Progress update video')).toBeInTheDocument()
  })

  test('opens video modal when play button is clicked', () => {
    render(<ProjectVideos videos={mockVideos} />)
    
    const playButtons = screen.getAllByText('▶️ Play')
    fireEvent.click(playButtons[0])
    
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument()
    expect(screen.getByTitle('Tutorial Video')).toBeInTheDocument()
  })

  test('closes video modal when close button is clicked', () => {
    render(<ProjectVideos videos={mockVideos} />)
    
    const playButtons = screen.getAllByText('▶️ Play')
    fireEvent.click(playButtons[0])
    
    const closeButton = screen.getByRole('button', { name: '✕' })
    fireEvent.click(closeButton)
    
    expect(screen.queryByRole('button', { name: '✕' })).not.toBeInTheDocument()
  })

  test('filters videos by type', () => {
    render(<ProjectVideos videos={mockVideos} />)
    
    const typeSelect = screen.getByDisplayValue('All Types')
    fireEvent.change(typeSelect, { target: { value: 'tutorial' } })
    
    expect(screen.getByText('Tutorial Video')).toBeInTheDocument()
    expect(screen.queryByText('Progress Update')).not.toBeInTheDocument()
  })

  test('displays correct type icons and labels', () => {
    render(<ProjectVideos videos={mockVideos} />)
    
    expect(screen.getByText('🎓')).toBeInTheDocument() // tutorial icon
    expect(screen.getByText('📹')).toBeInTheDocument() // progress icon
    expect(screen.getByText('Tutorial')).toBeInTheDocument()
    expect(screen.getByText('Progress Video')).toBeInTheDocument()
  })

  test('displays video duration badges', () => {
    render(<ProjectVideos videos={mockVideos} />)
    
    expect(screen.getByText('10:30')).toBeInTheDocument()
    expect(screen.getByText('5:15')).toBeInTheDocument()
  })

  test('handles thumbnail error correctly', () => {
    render(<ProjectVideos videos={mockVideos} />)
    
    const firstThumbnail = screen.getByAltText('Tutorial Video')
    fireEvent.error(firstThumbnail)
    
    expect(screen.getByText('Thumbnail not available')).toBeInTheDocument()
  })

  test('groups videos by type when showing all types', () => {
    render(<ProjectVideos videos={mockVideos} />)
    
    expect(screen.getByText('Tutorial')).toBeInTheDocument()
    expect(screen.getByText('Progress Video')).toBeInTheDocument()
    expect(screen.getByText('(1)')).toBeInTheDocument() // count for each type
  })

  test('converts YouTube URLs to embed format', () => {
    render(<ProjectVideos videos={mockVideos} />)
    
    const playButtons = screen.getAllByText('▶️ Play')
    fireEvent.click(playButtons[0])
    
    const iframe = screen.getByTitle('Tutorial Video')
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/test1')
  })

  test('displays video information in modal', () => {
    render(<ProjectVideos videos={mockVideos} />)
    
    const playButtons = screen.getAllByText('▶️ Play')
    fireEvent.click(playButtons[0])
    
    expect(screen.getByText('Tutorial Video')).toBeInTheDocument()
    expect(screen.getByText('A helpful tutorial')).toBeInTheDocument()
    expect(screen.getByText('⏱️ 10:30')).toBeInTheDocument()
  })
})