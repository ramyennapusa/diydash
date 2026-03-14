import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import apiClient from '../services/api'

const INVITE_TOKEN_KEY = 'draft2done_invite_token'

/**
 * Landing page for invite links: /invite?token=xxx
 * Stores token in sessionStorage. If user is logged in, redeems and redirects to project; otherwise redirects to /.
 */
function InviteLanding({ user }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token || !token.trim()) {
      navigate('/', { replace: true })
      return
    }
    sessionStorage.setItem(INVITE_TOKEN_KEY, token.trim())
    if (user?.email) {
      apiClient.setUser(user)
      apiClient
        .redeemInvite(token.trim())
        .then((data) => {
          sessionStorage.removeItem(INVITE_TOKEN_KEY)
          navigate(`/project/${data.projectId}`, { replace: true })
        })
        .catch(() => {
          navigate('/', { replace: true })
        })
    } else {
      navigate('/', { replace: true })
    }
  }, [token, user, navigate])

  return (
    <div className="invite-landing">
      <p>Taking you to the project…</p>
    </div>
  )
}

export default InviteLanding
export { INVITE_TOKEN_KEY }
