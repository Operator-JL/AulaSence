import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Header from './components/Header'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
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
    <div className="min-h-screen bg-[var(--color-app-background)] text-[var(--color-ink)]">
      <Header />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/resumen" element={<DashboardPage />} />
          <Route path="/historial" element={<HistoryPage />} />
          <Route path="/configuracion" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
