import axios, { AxiosError } from 'axios'

const TOKEN_KEY = 'rotik_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

const apiRoot = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

export const api = axios.create({
  baseURL: `${apiRoot}/api`,
  headers: { Accept: 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let onUnauthenticated: (() => void) | null = null

export function setUnauthenticatedHandler(handler: () => void) {
  onUnauthenticated = handler
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStore.clear()
      onUnauthenticated?.()
    }
    return Promise.reject(error)
  },
)

interface ApiErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

export function extractErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'A conexão demorou demais. Verifique sua rede e tente de novo.'
    }
    if (!error.response) {
      return 'Não foi possível falar com o servidor. Verifique se a API está no ar.'
    }
    const body = error.response.data as ApiErrorBody | undefined
    return body?.message ?? fallback
  }
  return fallback
}

export function extractFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error) && error.response?.status === 422) {
    const body = error.response.data as ApiErrorBody | undefined
    const fields = body?.errors ?? {}
    return Object.fromEntries(Object.entries(fields).map(([key, messages]) => [key, messages[0]]))
  }
  return {}
}
