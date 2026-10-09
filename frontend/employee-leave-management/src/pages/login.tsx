import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { homePath, type Role } from '../lib/data'
import { btn, Field, inputCls } from '../components/ui'
import Parent from '../components/parent'

export default function Login() {
  const { login, loading } = useAuth()

  const navigate = useNavigate()

  const location = useLocation()

  const created = (
    location.state as { email?: string } | null
  )?.email

  const [email, setEmail] = useState(created ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()

    setError('')
    setSubmitting(true)

    const result = await login(email, password)

    setSubmitting(false)

    if (result) {
      setError(result)
      return
    }

    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      setError('Login succeeded but user information was not found.')
      return
    }

    const user = JSON.parse(storedUser)
    const targetRole: Role = (user?.role as Role) || 'employee'
    const targetPath = homePath[targetRole] ?? '/dashboard'

    navigate(targetPath, { replace: true })
  }

  if (loading) {
    return (
      <Parent
        title="Checking session..."
        intro="Please wait."
      >
        <p className="text-sm text-muted">
          Restoring your session...
        </p>
      </Parent>
    )
  }

  return (
    <Parent
      title="Log in"
      intro="Welcome back. Log in to open your dashboard."
    >
      {created && (
        <p
          role="status"
          className="mb-3.5 rounded-lg bg-okBg p-3 text-sm text-ok"
        >
          Account created. Log in to continue.
        </p>
      )}

      <form
        onSubmit={submit}
        className="grid gap-3.5"
      >
        <Field label="Work email" id="email">
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password" id="pw">
          <input
            id="pw"
            type="password"
            required
            autoComplete="current-password"
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error && (
          <p
            role="alert"
            className="text-sm text-no"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className={btn()}
          disabled={submitting}
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        New here?{' '}
        <Link
          to="/signup"
          className="font-semibold text-accent"
        >
          Create an account
        </Link>
      </p>
    </Parent>
  )
}