import { Component } from 'react'
import './ErrorBoundary.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>🔧 Oops! Something went wrong</h2>
            <p>
              DIYDash encountered an unexpected error. Don't worry - your projects are safe!
            </p>
            <details className="error-details">
              <summary>Error Details</summary>
              <pre>{this.state.error?.toString()}</pre>
            </details>
            <button 
              className="error-boundary-button"
              onClick={() => window.location.reload()}
            >
              🔄 Reload DIYDash
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary