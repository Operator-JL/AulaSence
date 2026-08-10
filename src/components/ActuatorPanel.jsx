import { RotateCcw } from 'lucide-react';
import { useState } from 'react';

import Toggle from './Toggle';

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

export default function ActuatorPanel({ className = '', initialAutomatic = true }) {
  const [automaticMode, setAutomaticMode] = useState(initialAutomatic);
  const [ledOn, setLedOn] = useState(false);
  const [buzzerOn, setBuzzerOn] = useState(false);

  const resetAutomaticMode = () => {
    setAutomaticMode(true);
    setLedOn(false);
    setBuzzerOn(false);
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
          onChange={setAutomaticMode}
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
            disabled={automaticMode}
            onChange={setLedOn}
          />
          <ManualControl
            color="bg-[var(--color-warning)]"
            label="Buzzer"
            checked={buzzerOn}
            disabled={automaticMode}
            onChange={setBuzzerOn}
          />
        </div>
      </div>

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={resetAutomaticMode}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#a9ddd3] px-4 py-3 text-sm font-semibold text-[var(--color-primary-dark)] transition-colors hover:bg-[var(--color-primary-soft)]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Restablecer modo automático
        </button>
      </div>
    </section>
  );
}
