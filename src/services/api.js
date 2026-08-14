import { supabase } from '../lib/supabaseClient'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// El backend responde en camelCase (tempMin, lastSeenAt, alertsEnabled).
// No transformar los nombres aquí ni en las páginas.
async function request(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${session?.access_token ?? ''}`,
      ...options.headers,
    },
  })

  if (response.status === 204) return null

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message = typeof payload?.detail === 'string'
      ? payload.detail
      : `Error ${response.status} al llamar al backend`
    throw new Error(message)
  }

  return response.json()
}

function getDevices() {
  return request('/api/devices')
}

// Devuelve null (204) si el dispositivo aún no tiene lecturas.
function getLatestReading(deviceId) {
  return request(`/api/readings/latest?deviceId=${deviceId}`)
}

function getReadings(deviceId, { from, to, limit } = {}) {
  const params = new URLSearchParams({ deviceId: String(deviceId) })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (limit) params.set('limit', String(limit))
  return request(`/api/readings?${params.toString()}`)
}

function updateDevice(deviceId, body) {
  return request(`/api/devices/${deviceId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

function updateActuators(deviceId, body) {
  return request(`/api/devices/${deviceId}/actuators`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

function deleteDevice(deviceId) {
  return request(`/api/devices/${deviceId}`, { method: 'DELETE' })
}

export const api = Object.freeze({
  getDevices,
  getLatestReading,
  getReadings,
  updateDevice,
  updateActuators,
  deleteDevice,
})
