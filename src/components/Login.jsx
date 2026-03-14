import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/api'
import { isCognitoConfigured, auth } from '../services/auth'
import { INVITE_TOKEN_KEY } from './InviteLanding'
import './Login.css'

// Auth is Cognito-only; require config
const COGNITO_REQUIRED_MSG = 'Cognito is not configured. Set VITE_COGNITO_* in .env.'

const IconEyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
)
const IconEyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
)
const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
)

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(null)
  const [token, setToken] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [pendingPassword, setPendingPassword] = useState('') // used for Cognito auto sign-in after confirm

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!isCognitoConfigured) {
      setError(COGNITO_REQUIRED_MSG)
      return
    }

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
        await auth.signUp({ email: trimmedEmail, password })
        setPendingPassword(password)
        setPendingVerificationEmail(trimmedEmail)
        setToken('')
        setResendCooldown(60)
      } else if (onLogin) {
        await auth.signIn(trimmedEmail, password)
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
      setError(err.message || (isRegister ? 'Failed to create account.' : 'Login failed. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!isCognitoConfigured) {
      setError(COGNITO_REQUIRED_MSG)
      return
    }
    const code = token.replace(/\D/g, '').slice(0, 6).trim()
    if (!code || code.length < 6) {
      setError('Please enter the 6-digit verification code from your email.')
      return
    }

    setSubmitting(true)
    try {
      await auth.confirmSignUp(pendingVerificationEmail, code)
      if (pendingPassword) {
        await auth.signIn(pendingVerificationEmail, pendingPassword)
        setPendingPassword('')
      }
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
    setSubmitting(true)
    try {
      const { resendSignUpCode } = await import('aws-amplify/auth')
      await resendSignUpCode({ username: pendingVerificationEmail })
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
    setPendingPassword('')
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
      <div className="login-page login-page--verify">
        <div className="login-layout">
          <header className="login-topbar">
            <span className="login-logo">Draft2Done</span>
          </header>
          <div className="login-hero">
            <h1 className="login-hero-title">ORCHESTRATE YOUR<br />CREATIVITY</h1>
            <p className="login-hero-desc">From concept to completion, organize inspiration,<br />manage projects, and collaborate seamlessly.<br />Built for those who turn vision into reality.</p>
          </div>
          <div className="login-modal-wrap">
            <div className="login-modal-card login-modal-card--verify">
              <h2 className="login-modal-title">Almost there!</h2>
              <p className="login-modal-greeting">Verify your email</p>
              <form onSubmit={handleVerifySubmit} className="login-form">
                {error && <div className="login-error" role="alert">{error}</div>}
                <p className="login-verify-message">
                  We sent a 6-digit code to <strong>{pendingVerificationEmail}</strong>. Enter it below.
                </p>
                <div className="login-field">
                  <input
                    id="login-token"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    maxLength={6}
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={submitting}
                    className="login-input login-input-code"
                  />
                </div>
                <button type="submit" className="login-submit" disabled={submitting || token.replace(/\D/g, '').length < 6}>
                  {submitting ? 'Verifying…' : 'Verify and sign in'}
                </button>
                <div className="login-switch">
                  <button type="button" className="login-switch-button" onClick={handleResendCode} disabled={submitting || resendCooldown > 0}>
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
                <div className="login-switch">
                  <button type="button" className="login-switch-button" onClick={() => { setPendingVerificationEmail(null); setToken(''); setError(''); }} disabled={submitting}>
                    Use a different email
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-layout">
        <header className="login-topbar">
          <span className="login-logo">Draft2Done</span>
        </header>

        <div className="login-hero">
          <h1 className="login-hero-title">ORCHESTRATE YOUR<br />CREATIVITY</h1>
          <p className="login-hero-desc">From concept to completion, organize inspiration,<br />manage projects, and collaborate seamlessly.<br />Built for those who turn vision into reality.</p>
        </div>

        <div className="login-modal-wrap">
          <div className="login-modal-card">
            <h2 className="login-modal-title">{isRegister ? 'Sign up for Draft2Done' : 'Login to Draft2Done'}</h2>
            {isRegister && <p className="login-modal-greeting">Join us, Creator!</p>}
            {!isCognitoConfigured && (
              <div className="login-error" role="alert">{COGNITO_REQUIRED_MSG}</div>
            )}
            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="login-error" role="alert">{error}</div>}

              <div className="login-field">
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="login-input"
                />
              </div>

              <div className="login-field">
                <div className="login-input-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    className="login-input"
                  />
                  <button type="button" className="login-icon-btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <IconEyeClosed /> : <IconEyeOpen />}</button>
                  <span className="login-input-icon" aria-hidden><IconInfo /></span>
                </div>
              </div>

              {isRegister && (
                <div className="login-field">
                  <input
                    id="login-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={submitting}
                    className="login-input"
                  />
                </div>
              )}

              {!isRegister && (
                <div className="login-options">
                  <label className="login-remember">
                    <input type="checkbox" /> Remember Me
                  </label>
                  <a href="#" className="login-forgot">Forgot Password?</a>
                </div>
              )}

              <button type="submit" className="login-submit" disabled={submitting}>
                {submitting ? (isRegister ? 'Creating account…' : 'Signing in…') : (isRegister ? 'Create account' : 'LOGIN')}
              </button>

              <div className="login-switch">
                <button type="button" className="login-switch-button" onClick={switchMode} disabled={submitting}>
                  {isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
