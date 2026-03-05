import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import { INVITE_TOKEN_KEY } from './InviteLanding'
import './Login.css'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null)
  const [devCode, setDevCode] = useState(null)
  const [token, setToken] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Please enter your email address.')
      return
    }
    if (!password) {
      setError(isRegister ? 'Please enter a password.' : 'Please enter your password.')
      return
    }
    if (isRegister) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (isRegister) {
        await apiClient.createAccount(trimmedEmail, password)
        const res = await apiClient.sendVerificationCode(trimmedEmail)
        setPendingVerificationEmail(trimmedEmail)
        setDevCode(res.devCode || null)
        setToken('')
        setResendCooldown(60)
      } else if (onLogin) {
        try {
          await apiClient.validateUser(trimmedEmail)
        } catch (e) {
          setError(e.message || 'User ID not found. Please create an account.')
          return
        }
        onLogin({ email: trimmedEmail })
        const inviteToken = sessionStorage.getItem(INVITE_TOKEN_KEY)
        if (inviteToken) {
          try {
            const data = await apiClient.redeemInvite(inviteToken)
            sessionStorage.removeItem(INVITE_TOKEN_KEY)
            navigate(`/project/${data.projectId}`, { replace: true })
            return
          } catch (e) {
            setError(e.message || 'Failed to join project.')
            return
          }
        }
      }
    } catch (err) {
      setError(err.message || (isRegister ? 'Failed to create account or send verification code.' : 'Login failed. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    setError('')
    const code = token.replace(/\D/g, '').slice(0, 4)
    if (code.length !== 4) {
      setError('Please enter the 4-digit code from your email.')
      return
    }

    setSubmitting(true)
    try {
      await apiClient.verifyCode(pendingVerificationEmail, code)
      if (onLogin) {
        onLogin({ email: pendingVerificationEmail })
        const inviteToken = sessionStorage.getItem(INVITE_TOKEN_KEY)
        if (inviteToken) {
          try {
            const data = await apiClient.redeemInvite(inviteToken)
            sessionStorage.removeItem(INVITE_TOKEN_KEY)
            navigate(`/project/${data.projectId}`, { replace: true })
            return
          } catch (e) {
            setError(e.message || 'Failed to join project.')
            return
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    setError('')
    setDevCode(null)
    setSubmitting(true)
    try {
      const res = await apiClient.sendVerificationCode(pendingVerificationEmail)
      setDevCode(res.devCode || null)
      setResendCooldown(60)
    } catch (err) {
      setError(err.message || 'Failed to resend code.')
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = () => {
    setIsRegister((prev) => !prev)
    setError('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setPendingVerificationEmail(null)
    setDevCode(null)
    setToken('')
  }

  useEffect(() => {
    const msg = sessionStorage.getItem('loginMessage')
    if (msg) {
      sessionStorage.removeItem('loginMessage')
      setError(msg)
    }
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  if (pendingVerificationEmail) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Draft2Done</h1>
            <p className="login-subtitle">Check your email</p>
          </div>

          <form onSubmit={handleVerifySubmit} className="login-form">
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <p className="login-verify-message">
              {devCode
                ? 'Email is not configured yet. Use this code to continue:'
                : <>We sent a 4-digit code to <strong>{pendingVerificationEmail}</strong>. Enter it below.</>}
            </p>
            {devCode && (
              <p className="login-dev-code">
                <strong>{devCode}</strong>
              </p>
            )}

            <div className="login-field">
              <label htmlFor="login-token">Verification code</label>
              <input
                id="login-token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="0000"
                maxLength={4}
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 4))}
                disabled={submitting}
                className="login-input login-input-code"
              />
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={submitting || token.replace(/\D/g, '').length !== 4}
            >
              {submitting ? 'Verifying…' : 'Verify and sign in'}
            </button>

            <div className="login-switch">
              <button
                type="button"
                className="login-switch-button"
                onClick={handleResendCode}
                disabled={submitting || resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>

            <div className="login-switch">
              <button
                type="button"
                className="login-switch-button"
                onClick={() => { setPendingVerificationEmail(null); setDevCode(null); setToken(''); setError(''); }}
                disabled={submitting}
              >
                Use a different email
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Draft2Done</h1>
          <p className="login-subtitle">
            {isRegister ? 'Create an account to get started' : 'Sign in to manage your DIY projects'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="login-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="login-input"
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="login-input"
            />
          </div>

          {isRegister && (
            <div className="login-field">
              <label htmlFor="login-confirm-password">Confirm password</label>
              <input
                id="login-confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                className="login-input"
              />
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={submitting}
          >
            {submitting
              ? (isRegister ? 'Creating account…' : 'Signing in…')
              : (isRegister ? 'Create account' : 'Sign in')}
          </button>

          <div className="login-switch">
            <button
              type="button"
              className="login-switch-button"
              onClick={switchMode}
              disabled={submitting}
            >
              {isRegister ? 'Already have an account? Sign in' : 'New user? Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
