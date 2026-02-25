import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './UserMenu.css'

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const displayName = user?.name?.trim() || user?.email || 'User'
  const initial = (displayName.charAt(0) || 'U').toUpperCase()

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [open])

  const handleAccountClick = () => {
    setOpen(false)
    navigate('/account')
  }

  const handleSupportClick = () => {
    setOpen(false)
    window.location.href = 'mailto:support@diy-dash.com?subject=DIYDash%20Support'
  }

  const handleLogout = () => {
    setOpen(false)
    onLogout?.()
  }

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <span className="user-menu-avatar" aria-hidden="true">
          {initial}
        </span>
      </button>
      {open && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-header">
            <span className="user-menu-avatar user-menu-avatar--lg">{initial}</span>
            <span className="user-menu-email">{user?.email || ''}</span>
          </div>
          <div className="user-menu-divider" />
          <button type="button" className="user-menu-item" role="menuitem" onClick={handleAccountClick}>
            Account management
          </button>
          <button type="button" className="user-menu-item" role="menuitem" onClick={handleSupportClick}>
            Support
          </button>
          <div className="user-menu-divider" />
          <button type="button" className="user-menu-item user-menu-item--logout" role="menuitem" onClick={handleLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
