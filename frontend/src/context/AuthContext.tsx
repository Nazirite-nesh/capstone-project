import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import api from '../api/axios'
import type { Role } from '../lib/data'

export interface User {
  id: string
  _id?: string
  name: string
  email: string
  role: Role
  manager?: { _id: string; name: string; email: string } | string
}

interface AuthResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: User
  }
}

interface MeResponse {
  success: boolean
  message: string
  data: User
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<string | null>
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const normalizeUser = (u: any): User => ({
  ...u,
  id: u.id || u._id || '',
  _id: u._id || u.id || '',
})

export const initials = (name: string): string =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? normalizeUser(JSON.parse(stored)) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get<MeResponse>('/auth/me')
        const normalized = normalizeUser(response.data.data)

        setUser(normalized)
        localStorage.setItem('user', JSON.stringify(normalized))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (
    email: string,
    password: string
  ): Promise<string | null> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      })

      const { token, user: rawUser } = response.data.data
      const user = normalizeUser(rawUser)

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      setUser(user)

      return null
    } catch (error: any) {
      return (
        error.response?.data?.message ||
        'Unable to log in. Please try again.'
      )
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<string | null> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })

      const { token, user: rawUser } = response.data.data
      const user = normalizeUser(rawUser)

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      setUser(user)

      return null
    } catch (error: any) {
      return (
        error.response?.data?.message ||
        'Unable to create account. Please try again.'
      )
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    )
  }

  return context
}