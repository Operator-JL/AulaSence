import { Clock3 } from 'lucide-react'
import ActuatorPanel from '../components/ActuatorPanel'
import SensorChart from '../components/SensorChart'
import { currentReading, demoDevice, demoReadings } from '../data/demoData'

const chartReadings = [...demoReadings].reverse()

function getHourlyTrend(dataKey) {
  const previousValue = Number(demoReadings[1]?.[dataKey])
  const currentValue = Number(currentReading[dataKey])

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
  return (
    <main className="page-shell">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Monitoreo del aula</h1>
          <p className="page-subtitle">Lecturas del sensor DHT11 en tiempo real</p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-muted)] shadow-[0_4px_16px_rgb(15_32_51/0.04)]">
          <Clock3 aria-hidden="true" className="size-4 text-[var(--color-primary)]" />
          <span>Actualizado en tiempo real</span>
        </div>
      </div>

      <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] xl:gap-6">
        <section
          aria-label="Gráficas de temperatura y humedad"
          className="grid min-w-0 gap-5 md:grid-cols-2 xl:gap-6"
        >
          <SensorChart
            type="temperature"
            title="Temperatura"
            subtitle="Sensor DHT11"
            value={currentReading.temperatura}
            unit="°C"
            status={currentReading.estado}
            range={
              'Rango: ' +
              demoDevice.temp_min +
              ' °C – ' +
              demoDevice.temp_max +
              ' °C'
            }
            trend={getHourlyTrend('temperatura')}
            chartTitle="Histórico de temperatura (hoy)"
            data={chartReadings}
            dataKey="temperatura"
            domain={[18, 30]}
            ticks={[18, 22, 26, 30]}
          />
          <SensorChart
            type="humidity"
            title="Humedad relativa"
            subtitle="Sensor DHT11"
            value={currentReading.humedad}
            unit="%"
            status="normal"
            range={
              'Rango: ' +
              demoDevice.hum_min +
              ' % – ' +
              demoDevice.hum_max +
              ' %'
            }
            trend={getHourlyTrend('humedad')}
            chartTitle="Histórico de humedad (hoy)"
            data={chartReadings}
            dataKey="humedad"
            domain={[30, 70]}
            ticks={[30, 50, 70]}
          />
        </section>

        <aside aria-label="Controles del aula" className="min-w-0">
          <ActuatorPanel />
        </aside>
      </div>
    </main>
  )
}

export default DashboardPage
