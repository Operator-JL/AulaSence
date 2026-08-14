import { useState } from 'react'
import { LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function getRequestedPath(location) {
  const requestedLocation = location.state?.from
  if (!requestedLocation?.pathname || requestedLocation.pathname === '/login') {
    return '/resumen'
  }

  return [
    requestedLocation.pathname,
    requestedLocation.search ?? '',
    requestedLocation.hash ?? '',
  ].join('')
}

export default function LoginPage() {
  const { isAuthenticated, isAuthenticating, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const requestedPath = getRequestedPath(location)

  if (isAuthenticated) {
    return <Navigate to={requestedPath} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password) {
      setErrorMessage('Escribe tu correo y contraseña para continuar.')
      return
    }

    try {
      await login({ email: email.trim(), password })
      navigate(requestedPath, { replace: true })
    } catch (error) {
      setErrorMessage(
        error?.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : 'No fue posible iniciar sesión. Inténtalo de nuevo.',
      )
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--color-app-background)] px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--color-primary-soft)] blur-3xl sm:h-[30rem] sm:w-[30rem]"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-3 text-xl font-bold tracking-[-0.03em] text-[var(--color-ink)]">
          <span className="size-10 rounded-full bg-[var(--color-primary)] shadow-[0_6px_18px_rgb(15_159_140_/_25%)]" aria-hidden="true" />
          <span>AulaSense</span>
        </div>

        <section className="surface-card p-6 sm:p-8" aria-labelledby="login-title">
          <div className="text-center">
            <h1 id="login-title" className="text-2xl font-bold tracking-[-0.035em] sm:text-[1.75rem]">
              Inicia sesión
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              Accede al monitoreo ambiental de tu aula
            </p>
          </div>

          <form className="mt-7" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-[#405469]">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setErrorMessage('')
                  }}
                  className="field-input pl-11"
                  placeholder="nombre@escuela.mx"
                  disabled={isAuthenticating}
                  required
                />
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-[#405469]">
                Contraseña
              </label>
              <div className="relative">
                <LockKeyhole aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setErrorMessage('')
                  }}
                  className="field-input pl-11"
                  placeholder="Tu contraseña"
                  disabled={isAuthenticating}
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <p className="mt-4 rounded-xl border border-red-200 bg-[var(--color-danger-soft)] px-4 py-3 text-sm leading-5 text-[var(--color-danger)]" role="alert">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="primary-button mt-6 w-full text-base disabled:cursor-not-allowed disabled:opacity-65"
              disabled={isAuthenticating}
            >
              {isAuthenticating && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
              {isAuthenticating ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-3 border-t border-[var(--color-border)] pt-5 text-xs leading-5 text-[var(--color-muted)]">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" />
            <p>La contraseña se validará únicamente en el servidor y nunca contra datos de Supabase desde este navegador.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
