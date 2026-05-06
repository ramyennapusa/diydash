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
    thumbnail: 'thumbnail1.jpg',
  },
  {
    id: '2',
    title: 'Progress Update',
    url: 'https://youtube.com/watch?v=test2',
    type: 'progress',
    description: 'Progress update video',
    duration: '5:15',
    thumbnail: 'thumbnail2.jpg',
  },
]

describe('ProjectVideos Component', () => {
  test('renders empty state when no videos provided', () => {
    render(<ProjectVideos videos={[]} />)
    expect(screen.getByText('No Videos Yet')).toBeInTheDocument()
    expect(
      screen.getByText('Upload videos or add links to tutorials and progress updates.')
    ).toBeInTheDocument()
  })

  test('renders video titles and section heading', () => {
    render(<ProjectVideos videos={mockVideos} />)
    expect(screen.getByText('Videos & References')).toBeInTheDocument()
    expect(screen.getByText('Tutorial Video')).toBeInTheDocument()
    expect(screen.getByText('Progress Update')).toBeInTheDocument()
  })

  test('opens modal when play is triggered', () => {
    render(<ProjectVideos videos={mockVideos} />)
    const playButtons = screen.getAllByText('▶️ Play')
    fireEvent.click(playButtons[0])
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument()
  })
})
