import { useState, useCallback, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import apiClient from './services/api'
import { isCognitoConfigured, auth } from './services/auth'
import Navigation from './components/Navigation'
import Login from './components/Login'
import InviteLanding from './components/InviteLanding'
import Dashboard from './components/Dashboard'
import ProjectsList from './components/ProjectsList'
import ProjectDetails from './components/ProjectDetails'
import Account from './components/Account'
import ErrorBoundary from './components/ErrorBoundary'

const STORAGE_KEY = 'draft2done_user'

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const u = raw ? JSON.parse(raw) : null
    apiClient.setUser(u)
    return u
  } catch {
    apiClient.setUser(null)
    return null
  }
}

function App() {
  const [user, setUser] = useState(loadUser)
  const [authChecked, setAuthChecked] = useState(false)
  const isLoggedIn = !!user

  // Restore Cognito session on load (auth is Cognito-only)
  useEffect(() => {
    if (!isCognitoConfigured) {
      setAuthChecked(true)
      return
    }
    let cancelled = false
    auth.getCurrentUserEmail().then((email) => {
      if (cancelled) return
      setAuthChecked(true)
      if (email) {
        const userData = { email }
        setUser(userData)
        apiClient.setUser(userData)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      } else {
        setUser(null)
        apiClient.setUser(null)
        localStorage.removeItem(STORAGE_KEY)
      }
    }).catch(() => {
      if (!cancelled) {
        setAuthChecked(true)
        setUser(null)
        apiClient.setUser(null)
      }
    })
    return () => { cancelled = true }
  }, [])

  const handleLogin = useCallback((userData) => {
    setUser(userData)
    apiClient.setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }, [])

  const handleLogout = useCallback(async () => {
    await auth.signOut()
    setUser(null)
    apiClient.setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const handleProfileUpdate = useCallback((updatedUser) => {
    setUser(updatedUser)
    apiClient.setUser(updatedUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
  }, [])

  useEffect(() => {
    apiClient.setUser(user)
  }, [user])

  useEffect(() => {
    apiClient.setOnUnauthorized(handleLogout)
    return () => apiClient.setOnUnauthorized(null)
  }, [handleLogout])

  if (!authChecked) {
    return (
      <div className="app">
        <main className="app-content" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <p>Loading…</p>
        </main>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        <ErrorBoundary>
          {isLoggedIn && <Navigation user={user} onLogout={handleLogout} />}
          <main className="app-content">
            <Routes>
              <Route
                path="/"
                element={
                  isLoggedIn ? (
                    <ProjectsList />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  isLoggedIn ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/project/:id"
                element={
                  isLoggedIn ? (
                    <ProjectDetails />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/account"
                element={
                  isLoggedIn ? (
                    <Account user={user} onProfileUpdate={handleProfileUpdate} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route path="/invite" element={<InviteLanding user={user} />} />
            </Routes>
          </main>
        </ErrorBoundary>
      </div>
    </Router>
  )
}

export default App
