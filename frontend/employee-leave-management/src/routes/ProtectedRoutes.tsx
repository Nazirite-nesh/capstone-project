import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { homePath } from '../lib/data'
import type { Role } from '../lib/data'

export default function ProtectedRoutes({
  allowed,
}: {
  allowed: Role[]
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-sm text-muted">
          Loading...
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (!allowed.includes(user.role)) {
    return (
      <Navigate
        to={homePath[user.role]}
        replace
      />
    )
  }

  return <Outlet />
}