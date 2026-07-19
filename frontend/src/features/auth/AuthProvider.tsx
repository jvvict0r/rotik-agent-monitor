import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, setUnauthenticatedHandler, tokenStore } from '@/lib/api'
import type { AuthUser } from '@/types/api'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthContextValue['status']>('loading')

  useEffect(() => {
    setUnauthenticatedHandler(() => {
      setUser(null)
      setStatus('unauthenticated')
    })
  }, [])

  useEffect(() => {
    if (!tokenStore.get()) {
      setStatus('unauthenticated')
      return
    }

    let active = true
    api
      .get<{ data: AuthUser }>('/auth/me')
      .then(({ data }) => {
        if (!active) return
        setUser(data.data)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        tokenStore.clear()
        setStatus('unauthenticated')
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    })
    tokenStore.set(data.token)
    setUser(data.user)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      tokenStore.clear()
      setUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, logout }),
    [user, status, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
