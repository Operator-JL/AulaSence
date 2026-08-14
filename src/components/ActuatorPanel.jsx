import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { api } from '../services/api';
import Toggle from './Toggle';

const DEFAULT_ACTUATORS = { mode: 'auto', led: 'apagado', buzzer: false };

function ManualControl({ color, label, checked, disabled, onChange }) {
  return (
    <div
      className={`flex min-h-20 items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] p-4 transition-opacity ${
        disabled ? 'bg-[#fafbfc] opacity-65' : 'bg-white'
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${color}`} aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">{label}</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {checked ? 'Encendido' : 'Apagado'}
          </p>
        </div>
      </div>
      <Toggle
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        label={`${checked ? 'Apagar' : 'Encender'} ${label}`}
      />
    </div>
  );
}

export default function ActuatorPanel({ className = '', device = null }) {
  const [actuators, setActuators] = useState(device?.actuators ?? DEFAULT_ACTUATORS);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // El estado confirmado llega del ESP32 vía el ingestor; al refrescar el
  // dispositivo desde la página, lo reportado por el equipo gana.
  useEffect(() => {
    if (device?.actuators) setActuators(device.actuators);
  }, [device]);

  const automaticMode = actuators.mode !== 'manual';
  const ledOn = Boolean(actuators.led) && actuators.led !== 'apagado';
  const buzzerOn = Boolean(actuators.buzzer);

  const sendUpdate = async (body) => {
    if (!device || pending) return;

    setPending(true);
    setErrorMessage('');
    try {
      const updatedDevice = await api.updateActuators(device.id, body);
      setActuators(updatedDevice?.actuators ?? body);
    } catch (error) {
      setErrorMessage(error.message || 'No fue posible enviar el comando al dispositivo.');
    } finally {
      setPending(false);
    }
  };

  // En modo auto el backend rechaza led/buzzer en el body (422): solo se manda mode.
  const handleModeChange = (nextAutomatic) => {
    if (nextAutomatic) {
      sendUpdate({ mode: 'auto' });
    } else {
      sendUpdate({ mode: 'manual', led: actuators.led ?? 'apagado', buzzer: buzzerOn });
    }
  };

  const handleLedChange = (nextOn) => {
    sendUpdate({ mode: 'manual', led: nextOn ? 'rojo' : 'apagado', buzzer: buzzerOn });
  };

  const handleBuzzerChange = (nextOn) => {
    sendUpdate({ mode: 'manual', led: actuators.led ?? 'apagado', buzzer: nextOn });
  };

  const resetAutomaticMode = () => {
    sendUpdate({ mode: 'auto' });
  };

  return (
    <section className={`surface-card flex h-full flex-col p-5 sm:p-6 ${className}`} aria-labelledby="actuator-panel-title">
      <div>
        <h2 id="actuator-panel-title" className="text-base font-bold text-[var(--color-ink)]">
          Control de actuadores
        </h2>
        <p className="mt-1 text-sm leading-5 text-[var(--color-muted)]">
          Gestiona los dispositivos del aula
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-[var(--color-primary-soft)] p-4">
        <div className="pr-2">
          <p className="text-sm font-semibold text-[#13766a]">Modo automático</p>
          <p className="mt-1 text-xs leading-5 text-[#4e817b]">
            El sistema controla los actuadores según los umbrales definidos.
          </p>
        </div>
        <Toggle
          checked={automaticMode}
          onChange={handleModeChange}
          disabled={pending || !device}
          label={automaticMode ? 'Desactivar modo automático' : 'Activar modo automático'}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-[var(--color-ink)]">Control manual</h3>
        <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
          Controla temporalmente los actuadores cuando el modo automático está desactivado.
        </p>

        <div className="mt-4 space-y-3">
          <ManualControl
            color="bg-[var(--color-success)]"
            label="LED de alerta"
            checked={ledOn}
            disabled={automaticMode || pending || !device}
            onChange={handleLedChange}
          />
          <ManualControl
            color="bg-[var(--color-warning)]"
            label="Buzzer"
            checked={buzzerOn}
            disabled={automaticMode || pending || !device}
            onChange={handleBuzzerChange}
          />
        </div>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-red-200 bg-[var(--color-danger-soft)] px-4 py-3 text-sm leading-5 text-[var(--color-danger)]" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={resetAutomaticMode}
          disabled={pending || !device || automaticMode}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#a9ddd3] px-4 py-3 text-sm font-semibold text-[var(--color-primary-dark)] transition-colors hover:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Restablecer modo automático
        </button>
      </div>
    </section>
  );
}
