import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AuthenticatedLayout from './layouts/AuthenticatedLayout'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function PageLoading() {
  return (
    <main className="page-shell" aria-live="polite">
      <div className="surface-card flex min-h-40 items-center justify-center p-6 text-sm text-[var(--color-muted)]">
        Cargando información...
      </div>
    </main>
  )
}

function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/resumen" element={<DashboardPage />} />
            <Route path="/historial" element={<HistoryPage />} />
            <Route path="/configuracion" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/resumen" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
