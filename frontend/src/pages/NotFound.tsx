import { Link } from 'react-router'
import { btn } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { homePath } from '../lib/data'

export default function NotFound() {
  const { user } = useAuth()
  const targetPath = user ? homePath[user.role] || '/dashboard' : '/login'
  const buttonText = user ? 'Go to Dashboard' : 'Go to Login'

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
      <p className="text-6xl font-bold text-accent">404</p>
      <p className="mt-2 text-xl font-semibold">Page not found</p>
      <p className="mt-4 text-sm text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link to={targetPath} className={`${btn()} min-w-[140px] text-center`}>
          {buttonText}
        </Link>
      </div>
    </div>
  )
}
