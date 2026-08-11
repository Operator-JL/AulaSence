const SESSION_STORAGE_KEY = 'aulasense.auth.session.v1'
const SESSION_VERSION = 1

function getStorage() {
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

function optionalText(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function normalizeUserId(value) {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) return value
  return null
}

function sanitizeUser(user) {
  if (!user || typeof user !== 'object') return null

  const id = normalizeUserId(user.id)
  const email = optionalText(user.email)
  if (!id || !email) return null

  const safeUser = {
    id,
    email,
  }
  const nombre = optionalText(user.nombre)
  const rol = optionalText(user.rol)
  const creadoEn = optionalText(user.creado_en)

  if (nombre) safeUser.nombre = nombre
  if (rol) safeUser.rol = rol
  if (creadoEn) safeUser.creado_en = creadoEn

  return safeUser
}

function normalizeExpiresAt(value) {
  if (value === null || value === undefined || value === '') return null

  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null
}

function normalizeSession(session) {
  if (!session || typeof session !== 'object') return null

  const accessToken = optionalText(session.accessToken)
  const user = sanitizeUser(session.user)
  const expiresAt = normalizeExpiresAt(session.expiresAt)
  if (!accessToken || !user || !expiresAt) return null
  if (new Date(expiresAt).getTime() <= Date.now()) return null

  return {
    accessToken,
    expiresAt,
    user,
  }
}

export function readSession() {
  const storage = getStorage()
  if (!storage) return null

  try {
    const serializedSession = storage.getItem(SESSION_STORAGE_KEY)
    if (!serializedSession) return null

    const storedSession = JSON.parse(serializedSession)
    const session =
      storedSession?.version === SESSION_VERSION
        ? normalizeSession(storedSession)
        : null

    if (!session) storage.removeItem(SESSION_STORAGE_KEY)
    return session
  } catch {
    try {
      storage.removeItem(SESSION_STORAGE_KEY)
    } catch {
      // La sesión en memoria sigue disponible aunque el navegador bloquee storage.
    }
    return null
  }
}

export function writeSession(session) {
  const safeSession = normalizeSession(session)
  if (!safeSession) {
    throw new TypeError('El backend devolvió una sesión incompleta o inválida.')
  }

  const storage = getStorage()
  if (storage) {
    try {
      storage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ version: SESSION_VERSION, ...safeSession }),
      )
    } catch {
      // AuthContext conserva la sesión en memoria para esta carga de la app.
    }
  }

  return safeSession
}

export function clearSession() {
  try {
    getStorage()?.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // No hay nada más que limpiar si sessionStorage no está disponible.
  }
}
