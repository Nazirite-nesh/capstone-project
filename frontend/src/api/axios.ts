import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://capstone-project-y3mf.onrender.com/api')

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export const getErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED') {
      return 'The server is taking too long to respond. Please try again'
    }

    if (!err.response) {
      return 'Unable to connect to server'
    }

    const message = err.response.data?.message

    if (typeof message === 'string' && message) {
      return message
    }

    if (err.response.status === 403) {
      return 'You do not have permission to do that'
    }

    if (err.response.status === 404) {
      return 'Not found'
    }
  }

  return 'Something went wrong. Please try again'
}

export default api
