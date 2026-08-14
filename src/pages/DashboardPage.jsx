import { useCallback, useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import ActuatorPanel from '../components/ActuatorPanel'
import SensorChart from '../components/SensorChart'
import { api } from '../services/api'

const REFRESH_INTERVAL_MS = 30_000

// Tendencia vs. la lectura más cercana a una hora antes de la última.
function getHourlyTrend(readings, dataKey) {
  if (readings.length < 2) return null

  const latest = readings[readings.length - 1]
  const latestTime = new Date(latest.measuredAt).getTime()
  const oneHourBefore = latestTime - 60 * 60 * 1000

  let reference = readings[0]
  for (const reading of readings) {
    if (new Date(reading.measuredAt).getTime() <= oneHourBefore) {
      reference = reading
    } else {
      break
    }
  }

  const previousValue = Number(reference[dataKey])
  const currentValue = Number(latest[dataKey])

  if (!Number.isFinite(previousValue) || !Number.isFinite(currentValue)) {
    return null
  }

  const value = Number((currentValue - previousValue).toFixed(1))

  return {
    value,
    direction: value > 0 ? 'up' : value < 0 ? 'down' : 'stable',
  }
}

function DashboardPage() {
  const [device, setDevice] = useState(null)
  const [currentReading, setCurrentReading] = useState(null)
  const [readings, setReadings] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  const loadData = useCallback(async () => {
    try {
      const devices = await api.getDevices()
      const firstDevice = devices?.[0]

      if (!firstDevice) {
        setErrorMessage('No hay dispositivos vinculados a tu cuenta.')
        return
      }

      const [latest, history] = await Promise.all([
        api.getLatestReading(firstDevice.id),
        api.getReadings(firstDevice.id, { limit: 200 }),
      ])

      setDevice(firstDevice)
      setReadings(history?.readings ?? [])
      setCurrentReading(latest ?? history?.readings?.at(-1) ?? null)
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.message || 'No fue posible cargar las lecturas.')
    }
  }, [])

  useEffect(() => {
    loadData()
    const intervalId = window.setInterval(loadData, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [loadData])

  const thresholds = device?.thresholds

  return (
    <main className="page-shell">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Monitoreo del aula</h1>
          <p className="page-subtitle">Lecturas del sensor DHT11 en tiempo real</p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-muted)] shadow-[0_4px_16px_rgb(15_32_51/0.04)]">
          <Clock3 aria-hidden="true" className="size-4 text-[var(--color-primary)]" />
          <span>{device?.online ? 'Actualizado en tiempo real' : 'Dispositivo sin conexión'}</span>
        </div>
      </div>

      {errorMessage && (
        <p className="mb-6 rounded-xl border border-red-200 bg-[var(--color-danger-soft)] px-4 py-3 text-sm leading-5 text-[var(--color-danger)]" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] xl:gap-6">
        <section
          aria-label="Gráficas de temperatura y humedad"
          className="grid min-w-0 gap-5 md:grid-cols-2 xl:gap-6"
        >
          <SensorChart
            type="temperature"
            title="Temperatura"
            subtitle="Sensor DHT11"
            value={currentReading?.temperature}
            unit="°C"
            status={currentReading?.status ?? 'normal'}
            range={
              thresholds
                ? 'Rango: ' + thresholds.tempMin + ' °C – ' + thresholds.tempMax + ' °C'
                : undefined
            }
            trend={getHourlyTrend(readings, 'temperature')}
            chartTitle="Histórico de temperatura (24 h)"
            data={readings}
            dataKey="temperature"
          />
          <SensorChart
            type="humidity"
            title="Humedad relativa"
            subtitle="Sensor DHT11"
            value={currentReading?.humidity}
            unit="%"
            status="normal"
            range={
              thresholds
                ? 'Rango: ' + thresholds.humMin + ' % – ' + thresholds.humMax + ' %'
                : undefined
            }
            trend={getHourlyTrend(readings, 'humidity')}
            chartTitle="Histórico de humedad (24 h)"
            data={readings}
            dataKey="humidity"
          />
        </section>

        <aside aria-label="Controles del aula" className="min-w-0">
          <ActuatorPanel device={device} />
        </aside>
      </div>
    </main>
  )
}

export default DashboardPage
