import { Navigate, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { menu } from '../lib/data'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return <Navigate to="/login" replace />

  const links = menu[user.role] ?? []

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-300 md:grid-cols-[220px_1fr]">
      <aside className="flex gap-1 overflow-x-auto border-b border-line bg-surface p-2.5 md:flex-col md:border-b-0 md:border-r md:p-3 md:sticky md:top-0 md:h-screen md:self-start">
        <div className="hidden px-3 pb-4 pt-1 text-lg font-bold md:block">
          Leave<span className="text-accent">App</span>
        </div>

        <nav aria-label="Main navigation" className="flex shrink-0 gap-1 md:flex-col">
          {links.map((m) => (
            <NavLink
              key={m.path}
              to={m.path}
              end
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-accent ${
                  isActive
                    ? 'bg-accentSoft font-semibold text-accentInk'
                    : 'text-ink/80 hover:bg-black/5'
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="ml-auto whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-muted hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-accent md:ml-0 md:mt-auto"
        >
          Log out
        </button>
      </aside>

      <main className="min-w-0 p-4 md:px-7 md:py-6">
        <Outlet />
      </main>
    </div>
  )
}