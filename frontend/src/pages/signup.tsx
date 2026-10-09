import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { btn, Field, inputCls } from '../components/ui'
import Parent from '../components/parent'

export default function Signup() {
  const { signup } = useAuth()

  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()

    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)

    const result = await signup(
      name,
      email,
      password
    )

    setSubmitting(false)

    if (result) {
      setError(result)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <Parent
      title="Create your account"
      intro="Create your employee account to start using LeaveDesk."
    >
      <form
        onSubmit={submit}
        className="grid gap-3.5"
      >
        <Field label="Full name" id="name">
          <input
            id="name"
            required
            autoComplete="name"
            className={inputCls}
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        </Field>

        <Field label="Work email" id="semail">
          <input
            id="semail"
            type="email"
            required
            autoComplete="email"
            className={inputCls}
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </Field>

        <Field label="Password" id="spw">
          <input
            id="spw"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputCls}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
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
          {submitting
            ? 'Creating account...'
            : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-accent"
        >
          Log in
        </Link>
      </p>

      <p className="mt-2 text-[13px] text-muted">
        New accounts are created as employees.
        Managers and administrators are assigned by HR.
      </p>
    </Parent>
  )
}