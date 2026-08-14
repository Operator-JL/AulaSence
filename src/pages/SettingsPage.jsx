import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Info, LogOut, Trash2, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import Toggle from '../components/Toggle'
import { api } from '../services/api'
import { formatDate } from '../utils/formatters'

function getInitials(name, email) {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? []

  if (words.length > 0) {
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }

  return email?.trim().slice(0, 2).toUpperCase() || 'US'
}

function ConfirmDeleteModal({ deviceName, onCancel, onConfirm }) {
  const cancelButtonRef = useRef(null)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const nameMatches = confirmText.trim() === deviceName

  useEffect(() => {
    const previousFocus = document.activeElement
    cancelButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onCancel])

  const handleConfirm = async () => {
    if (!nameMatches || deleting) return

    setDeleting(true)
    setErrorMessage('')
    try {
      await onConfirm()
    } catch (error) {
      setErrorMessage(error.message || 'No fue posible eliminar el dispositivo.')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#102033]/45 p-4" onMouseDown={deleting ? undefined : onCancel}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        className="surface-card w-full max-w-md p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
            <AlertTriangle aria-hidden="true" className="size-5" />
          </div>
          <button type="button" onClick={onCancel} disabled={deleting} aria-label="Cerrar confirmación" className="rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-slate-100 hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-50">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <h2 id="delete-modal-title" className="mt-5 text-xl font-bold">¿Eliminar {deviceName}?</h2>
        <p id="delete-modal-description" className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Se eliminarán el dispositivo y todas sus lecturas registradas de forma permanente. Esta acción no se puede deshacer.
        </p>

        <div className="mt-5">
          <label htmlFor="delete-confirm-name" className="mb-2 block text-sm font-medium text-[var(--color-muted)]">
            Escribe <span className="font-semibold text-[var(--color-ink)]">{deviceName}</span> para confirmar
          </label>
          <input
            id="delete-confirm-name"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            disabled={deleting}
            autoComplete="off"
            className="field-input"
            placeholder={deviceName}
          />
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-xl border border-red-200 bg-[var(--color-danger-soft)] px-4 py-3 text-sm leading-5 text-[var(--color-danger)]" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button ref={cancelButtonRef} type="button" onClick={onCancel} disabled={deleting} className="min-h-11 rounded-xl border border-[var(--color-border)] px-4 font-semibold text-[var(--color-ink)] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm} disabled={!nameMatches || deleting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-danger)] px-4 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Trash2 aria-hidden="true" className="size-4" />
            {deleting ? 'Eliminando...' : 'Confirmar eliminación'}
          </button>
        </div>
      </section>
    </div>
  )
}

function SettingsPage() {
  const { logout, user } = useAuth()
  const [device, setDevice] = useState(null)
  const [classroomName, setClassroomName] = useState('')
  const [automaticAlerts, setAutomaticAlerts] = useState(true)
  const [nameError, setNameError] = useState('')
  const [saveNotice, setSaveNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteNotice, setDeleteNotice] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    api.getDevices()
      .then((devices) => {
        const firstDevice = devices?.[0]
        if (cancelled || !firstDevice) return
        setDevice(firstDevice)
        setClassroomName(firstDevice.nombre)
        setAutomaticAlerts(firstDevice.alertsEnabled)
      })
      .catch(() => {
        if (!cancelled) setNameError('No fue posible cargar el dispositivo.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async (event) => {
    event.preventDefault()
    if (!classroomName.trim()) {
      setNameError('Escribe un nombre para el aula')
      setSaveNotice('')
      return
    }
    if (!device) return

    setNameError('')
    setSaveNotice('')
    setSaving(true)
    try {
      const updatedDevice = await api.updateDevice(device.id, {
        nombre: classroomName.trim(),
        alertsEnabled: automaticAlerts,
      })
      setDevice(updatedDevice)
      setSaveNotice('Cambios guardados correctamente')
    } catch (error) {
      setNameError(error.message || 'No fue posible guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    await api.deleteDevice(device.id)
    setDeleteModalOpen(false)
    setDevice(null)
    setClassroomName('')
    setAutomaticAlerts(true)
    setDeleteNotice('Dispositivo eliminado junto con todas sus lecturas.')
  }

  const visibleDeviceName = classroomName.trim() || device?.nombre || 'el dispositivo'
  const accountName = user?.user_metadata?.nombre || user?.email || 'Usuario de AulaSense'
  const accountEmail = user?.email || 'Correo no disponible'
  const accountRole = user?.user_metadata?.rol || 'docente'
  const accountInitials = getInitials(user?.user_metadata?.nombre, user?.email)

  return (
    <main className="page-shell max-w-[1128px]">
      <div className="mb-8">
        <h1 className="page-title">Configuración</h1>
        <p className="page-subtitle">Administra el dispositivo y tu cuenta</p>
      </div>

      <div className="grid gap-5 sm:gap-6">
        <section className="surface-card p-5 sm:p-7" aria-labelledby="device-title">
          <h2 id="device-title" className="text-xl font-semibold">Dispositivo</h2>
          <p className="mt-1 text-[var(--color-muted)]">Datos del ESP32 vinculado a esta aula</p>

          <form onSubmit={handleSave} className="mt-6" noValidate>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="classroom-name" className="mb-2 block font-medium text-[var(--color-muted)]">Nombre del aula</label>
                <input
                  id="classroom-name"
                  value={classroomName}
                  onChange={(event) => {
                    setClassroomName(event.target.value)
                    setNameError('')
                    setSaveNotice('')
                  }}
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? 'classroom-name-error' : undefined}
                  className={`field-input text-lg ${nameError ? 'border-red-400' : ''}`}
                />
                {nameError && <p id="classroom-name-error" className="mt-1.5 text-sm text-[var(--color-danger)]">{nameError}</p>}
              </div>

              <div>
                <label htmlFor="device-code" className="mb-2 block font-medium text-[var(--color-muted)]">Código del dispositivo</label>
                <input id="device-code" value={device?.codigo ?? ''} readOnly className="field-input font-mono" />
              </div>
            </div>

            <p className="mt-3 flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <Info aria-hidden="true" className="size-4 shrink-0" />
              El código se usa como topic MQTT y no se puede cambiar
            </p>

            <div className="mt-6 flex items-center justify-between gap-5 rounded-2xl bg-[var(--color-primary-soft)] px-5 py-4 sm:px-6">
              <div>
                <h3 className="font-semibold text-[#115b51]">Alertas automáticas</h3>
                <p className="mt-0.5 text-sm text-[#328477]">Activa el LED y el buzzer fuera de rango</p>
              </div>
              <Toggle
                id="automatic-alerts"
                checked={automaticAlerts}
                onChange={(nextValue) => {
                  setAutomaticAlerts(nextValue)
                  setSaveNotice('')
                }}
                label="Alertas automáticas"
              />
            </div>

            <button type="submit" className="primary-button mt-6 w-full text-base disabled:cursor-not-allowed disabled:opacity-65" disabled={saving || !device}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saveNotice && <p className="notice mt-4" role="status">{saveNotice}</p>}
          </form>
        </section>

        <section className="surface-card p-5 sm:p-7" aria-labelledby="account-title">
          <h2 id="account-title" className="text-xl font-semibold">Cuenta</h2>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid size-16 shrink-0 place-items-center rounded-full bg-[var(--color-primary-soft)] text-lg font-semibold text-[var(--color-primary-dark)]" aria-hidden="true">{accountInitials}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold">{accountName}</p>
              <p className="truncate text-[var(--color-muted)]">{accountEmail}</p>
            </div>
            <span className="w-fit rounded-full bg-[var(--color-primary-soft)] px-4 py-1.5 text-sm font-medium capitalize text-[#17685d]">{accountRole}</span>
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-[var(--color-border)] pt-5 text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
            <span>Registrado desde</span>
            {user?.created_at ? (
              <time dateTime={user.created_at} className="font-medium text-[var(--color-ink)]">{formatDate(user.created_at)}</time>
            ) : (
              <span className="font-medium text-[var(--color-ink)]">No disponible</span>
            )}
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 text-sm font-semibold text-[#526476] transition-colors hover:border-[#b9d9d2] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary-dark)]"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Cerrar sesión
          </button>
        </section>

        <section className="rounded-[1.125rem] border border-red-200 bg-white p-5 sm:p-7" aria-labelledby="danger-title">
          <h2 id="danger-title" className="text-xl font-semibold text-[var(--color-danger)]">Eliminar dispositivo</h2>
          <p className="mt-1 leading-6 text-[var(--color-muted)]">Se borran también todas sus lecturas registradas. No se puede deshacer.</p>
          <button
            type="button"
            disabled={!device}
            onClick={() => {
              setDeleteNotice('')
              setDeleteModalOpen(true)
            }}
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-300 px-5 font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Eliminar {visibleDeviceName}
          </button>
          {deleteNotice && <p className="notice mt-4" role="status">{deleteNotice}</p>}
        </section>
      </div>

      {deleteModalOpen && device && (
        <ConfirmDeleteModal
          deviceName={device.nombre}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </main>
  )
}

export default SettingsPage
