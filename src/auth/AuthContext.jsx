import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const login = useCallback(async (credentials) => {
    setIsAuthenticating(true)

    try {
      const nextSession = await authService.login(credentials)
      setSession(nextSession)
      return nextSession
    } finally {
      setIsAuthenticating(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      isAuthenticated: Boolean(session?.access_token && session?.user),
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
