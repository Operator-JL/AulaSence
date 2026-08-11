import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { clearSession, readSession, writeSession } from './sessionStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSession())
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const login = useCallback(async (credentials, options) => {
    setIsAuthenticating(true)

    try {
      const nextSession = await authService.login(credentials, options)
      const storedSession = writeSession(nextSession)
      setSession(storedSession)
      return storedSession
    } finally {
      setIsAuthenticating(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  useEffect(() => {
    if (!session?.expiresAt) return undefined

    const maximumTimeout = 2_147_483_647
    let timeoutId

    const scheduleExpiration = () => {
      const expiresIn = new Date(session.expiresAt).getTime() - Date.now()

      if (expiresIn <= 0) {
        logout()
        return
      }

      timeoutId = window.setTimeout(
        scheduleExpiration,
        Math.min(expiresIn, maximumTimeout),
      )
    }

    scheduleExpiration()
    return () => window.clearTimeout(timeoutId)
  }, [logout, session?.expiresAt])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: Boolean(session?.accessToken && session?.user),
      isAuthenticating,
      login,
      logout,
    }),
    [isAuthenticating, login, logout, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.')
  }

  return context
}
