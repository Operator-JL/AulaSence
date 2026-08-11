import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

export default function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-app-background)] text-[var(--color-ink)]">
      <Header />
      <Outlet />
    </div>
  )
}

