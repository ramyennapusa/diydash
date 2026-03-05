import { useState, useCallback, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import apiClient from './services/api'
import Navigation from './components/Navigation'
import Login from './components/Login'
import InviteLanding from './components/InviteLanding'
import Dashboard from './components/Dashboard'
import ProjectsList from './components/ProjectsList'
import ProjectDetails from './components/ProjectDetails'
import Account from './components/Account'
import ErrorBoundary from './components/ErrorBoundary'

const STORAGE_KEY = 'diydash_user'

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
  const isLoggedIn = !!user

  const handleLogin = useCallback((userData) => {
    setUser(userData)
    apiClient.setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }, [])

  const handleLogout = useCallback(() => {
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
                    <Account user={user} onProfileUpdate={handleProfileUpdate} />
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
