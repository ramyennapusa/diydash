import { render, screen } from '@testing-library/react'
import App from './App'

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('DIYDash')).toBeInTheDocument()
  })

  test('renders Dashboard component', () => {
    render(<App />)
    expect(screen.getByText('Your DIY Project Management Dashboard')).toBeInTheDocument()
  })

  test('renders welcome message', () => {
    render(<App />)
    expect(screen.getByText('Welcome to DIYDash!')).toBeInTheDocument()
  })
})