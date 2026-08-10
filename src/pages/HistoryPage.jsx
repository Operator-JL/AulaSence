import { useState } from 'react'
import ActuatorPanel from '../components/ActuatorPanel'
import ReadingsTable from '../components/ReadingsTable'
import { demoDevice, demoReadings } from '../data/demoData'
import { exportReadingsToExcel } from '../utils/exportExcel'

const initialThresholds = {
  tempMin: String(demoDevice.temp_min),
  tempMax: String(demoDevice.temp_max),
  humMin: String(demoDevice.hum_min),
  humMax: String(demoDevice.hum_max),
}

const thresholdFields = [
  { id: 'tempMin', label: 'Mínima (°C)' },
  { id: 'tempMax', label: 'Máxima (°C)' },
  { id: 'humMin', label: 'Mínima (%)' },
  { id: 'humMax', label: 'Máxima (%)' },
]

function validateThresholds(values) {
  const errors = {}

  thresholdFields.forEach(({ id }) => {
    if (values[id].trim() === '') errors[id] = 'Este valor es obligatorio'
  })

  if (!errors.tempMin && !errors.tempMax && Number(values.tempMin) >= Number(values.tempMax)) {
    errors.tempMax = 'La máxima debe ser mayor que la mínima'
  }

  if (!errors.humMin && !errors.humMax && Number(values.humMin) >= Number(values.humMax)) {
    errors.humMax = 'La máxima debe ser mayor que la mínima'
  }

  return errors
}

function ThresholdCard() {
  const [values, setValues] = useState(initialThresholds)
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSaved(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateThresholds(values)
    setErrors(nextErrors)
    setSaved(Object.keys(nextErrors).length === 0)
  }

  return (
    <section className="surface-card p-5 sm:p-6" aria-labelledby="threshold-title">
      <h2 id="threshold-title" className="text-lg font-bold">Umbrales de alerta</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
        El LED y el buzzer se activan al superar estos valores.
      </p>

      <form className="mt-6" onSubmit={handleSubmit} noValidate>
        <fieldset>
          <legend className="mb-3 font-semibold">Temperatura</legend>
          <div className="grid grid-cols-2 gap-3">
            {thresholdFields.slice(0, 2).map((field) => (
              <ThresholdField key={field.id} {...field} value={values[field.id]} error={errors[field.id]} onChange={handleChange} />
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="mb-3 font-semibold">Humedad</legend>
          <div className="grid grid-cols-2 gap-3">
            {thresholdFields.slice(2).map((field) => (
              <ThresholdField key={field.id} {...field} value={values[field.id]} error={errors[field.id]} onChange={handleChange} />
            ))}
          </div>
        </fieldset>

        <button type="submit" className="primary-button mt-5 w-full">Guardar umbrales</button>
        {saved && <p className="notice mt-3" role="status">Umbrales guardados correctamente</p>}
      </form>
    </section>
  )
}

function ThresholdField({ id, label, value, error, onChange }) {
  const errorId = `${id}-error`

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[var(--color-muted)]">{label}</label>
      <input
        id={id}
        name={id}
        type="number"
        step="0.1"
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`field-input ${error ? 'border-red-400' : ''}`}
      />
      {error && <p id={errorId} className="mt-1.5 text-xs leading-4 text-[var(--color-danger)]">{error}</p>}
    </div>
  )
}

function HistoryPage() {
  const handleExport = () => exportReadingsToExcel(demoReadings)

  return (
    <main className="page-shell">
      <div className="mb-8">
        <h1 className="page-title">Historial</h1>
        <p className="page-subtitle">Consulta lecturas guardadas y define cuándo activar las alertas</p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.85fr)_minmax(300px,1fr)] xl:gap-6">
        <ReadingsTable readings={demoReadings} onExport={handleExport} />

        <aside className="grid min-w-0 gap-5 md:grid-cols-2 lg:grid-cols-1 xl:gap-6" aria-label="Configuración de alertas y actuadores">
          <ThresholdCard />
          <ActuatorPanel />
        </aside>
      </div>
    </main>
  )
}

export default HistoryPage
