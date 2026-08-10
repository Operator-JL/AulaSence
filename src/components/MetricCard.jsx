import { Droplets, Thermometer } from 'lucide-react';

import StatusBadge from './StatusBadge';

const metricStyles = {
  temperature: {
    defaultLabel: 'Temperatura',
    icon: Thermometer,
    iconColor: 'text-[#ef9a19]',
    iconBackground: 'bg-[#fff7e9]',
  },
  humidity: {
    defaultLabel: 'Humedad relativa',
    icon: Droplets,
    iconColor: 'text-[#347ee5]',
    iconBackground: 'bg-[#eef5ff]',
  },
};

export default function MetricCard({
  type = 'temperature',
  label,
  value,
  unit,
  status = 'normal',
  range,
}) {
  const metric = metricStyles[type] ?? metricStyles.temperature;
  const Icon = metric.icon;

  return (
    <article className="surface-card flex min-h-64 flex-col p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${metric.iconBackground}`}
          aria-hidden="true"
        >
          <Icon className={`h-5 w-5 ${metric.iconColor}`} strokeWidth={2.25} />
        </span>
        <h2 className="text-sm font-semibold text-[#526476]">
          {label ?? metric.defaultLabel}
        </h2>
      </div>

      <div className="mt-6 flex items-end gap-2 text-[var(--color-ink)]">
        <span className="text-5xl leading-none font-bold tracking-[-0.04em] sm:text-[3.35rem]">
          {value}
        </span>
        <span className="pb-1 text-lg font-semibold text-[#5f7081]">{unit}</span>
      </div>

      <div className="mt-6">
        <StatusBadge status={status} />
      </div>

      {range && (
        <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">{range}</p>
      )}
    </article>
  );
}
