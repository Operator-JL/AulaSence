import { useId, useMemo } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Droplet,
  Minus,
  Thermometer,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatNumber, formatTime } from '../utils/formatters';
import StatusBadge from './StatusBadge';

const sensorThemes = {
  temperature: {
    Icon: Thermometer,
    accent: '#e87500',
    accentText: 'text-[#c65300]',
    iconBackground: 'bg-[#fff3e5]',
    softBackground: 'bg-[#fff8f0]',
    softBorder: 'border-[#ffe5c8]',
    topBorder: 'bg-gradient-to-r from-[#e87500] to-[#ff9840]',
  },
  humidity: {
    Icon: Droplet,
    accent: '#347ee5',
    accentText: 'text-[#2563eb]',
    iconBackground: 'bg-[#edf5ff]',
    softBackground: 'bg-[#f3f8ff]',
    softBorder: 'border-[#dceaff]',
    topBorder: 'bg-gradient-to-r from-[#347ee5] to-[#55a2f2]',
  },
};

function TrendBadge({ trend, unit, theme }) {
  if (!trend || !Number.isFinite(Number(trend.value))) return null;

  const numericValue = Number(trend.value);
  const trendIcons = {
    down: ArrowDownRight,
    stable: Minus,
    up: ArrowUpRight,
  };
  const TrendIcon = trendIcons[trend.direction] ?? Minus;
  const sign = numericValue > 0 ? '+' : '';

  return (
    <div
      className={[
        'min-w-[6.75rem] shrink-0 rounded-xl border px-3 py-2',
        theme.softBackground,
        theme.softBorder,
      ].join(' ')}
      aria-label={
        sign +
        formatNumber(numericValue) +
        ' ' +
        unit +
        ', ' +
        (trend.label ?? 'comparado con hace una hora')
      }
    >
      <div
        className={[
          'flex items-center gap-1.5 text-sm font-bold',
          theme.accentText,
        ].join(' ')}
      >
        <TrendIcon className="size-4" aria-hidden="true" />
        <span>
          {sign}
          {formatNumber(numericValue)} {unit}
        </span>
      </div>
      <p className="mt-0.5 text-[0.7rem] font-medium text-[var(--color-muted)]">
        {trend.caption ?? 'vs. hace 1 h'}
      </p>
    </div>
  );
}

function SensorTooltip({ active, payload, label, unit, accent }) {
  const chartValue = payload?.[0]?.value;

  if (!active || chartValue === undefined || chartValue === null) return null;

  return (
    <div className="rounded-xl border border-[#e1e8ed] bg-white px-3 py-2.5 shadow-[0_10px_28px_rgb(15_32_51/0.12)]">
      <p className="text-[0.68rem] font-medium text-[var(--color-muted)]">{label}</p>
      <p className="mt-1.5 flex items-center gap-2 text-xs font-bold text-[var(--color-ink)]">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
        {formatNumber(chartValue)} {unit}
      </p>
    </div>
  );
}

export default function SensorChart({
  type = 'temperature',
  title,
  subtitle = 'Sensor DHT11',
  value,
  unit,
  status = 'normal',
  range,
  trend,
  chartTitle,
  data = [],
  dataKey,
  domain = ['auto', 'auto'],
  ticks,
}) {
  const theme = sensorThemes[type] ?? sensorThemes.temperature;
  const Icon = theme.Icon;
  const componentId = useId().replaceAll(':', '');
  const titleId = componentId + '-title';
  const gradientId = componentId + '-gradient';

  const chartData = useMemo(
    () =>
      data.map((reading) => ({
        ...reading,
        chartTime:
          reading.hora ??
          (reading.measuredAt ? formatTime(reading.measuredAt) : ''),
      })),
    [data],
  );

  return (
    <section
      className="surface-card relative min-w-0 overflow-hidden p-5 pt-6 sm:p-6 sm:pt-7"
      aria-labelledby={titleId}
    >
      <span
        className={['absolute inset-x-0 top-0 h-1', theme.topBorder].join(' ')}
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={[
              'inline-flex size-12 shrink-0 items-center justify-center rounded-full',
              theme.iconBackground,
            ].join(' ')}
            aria-hidden="true"
          >
            <Icon
              className={['size-6', theme.accentText].join(' ')}
              strokeWidth={2.15}
            />
          </span>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-base font-bold tracking-[-0.02em] text-[var(--color-ink)]"
            >
              {title}
            </h2>
            <p className="mt-1 text-xs font-medium text-[var(--color-muted)]">
              {subtitle}
            </p>
          </div>
        </div>

        <TrendBadge trend={trend} unit={unit} theme={theme} />
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-end gap-2">
          <span
            className={[
              'text-[3.25rem] leading-none font-bold tracking-[-0.05em] sm:text-[3.75rem]',
              theme.accentText,
            ].join(' ')}
          >
            {formatNumber(value)}
          </span>
          <span className="pb-1 text-xl font-semibold text-[#526476] sm:text-2xl">
            {unit}
          </span>
        </div>
        <StatusBadge status={status} />
      </div>

      {range && (
        <div
          className={[
            'mt-5 inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold sm:text-sm',
            theme.softBackground,
            theme.softBorder,
            theme.accentText,
          ].join(' ')}
        >
          <Icon className="size-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />
          <span>{range}</span>
        </div>
      )}

      <div className="my-6 h-px bg-[#e8edf1]" aria-hidden="true" />

      <div className="mb-5 flex items-start justify-between gap-4">
        <h3 className="text-sm font-bold leading-5 text-[#30465c]">
          {chartTitle}
        </h3>
        <span className="shrink-0 text-xs font-semibold text-[var(--color-muted)]">
          {unit}
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center rounded-xl bg-[#f8fafb] text-sm text-[var(--color-muted)] sm:h-60">
          No hay lecturas para mostrar
        </div>
      ) : (
        <div
          className="h-[220px] min-w-0 sm:h-60"
          role="img"
          aria-label={
            chartTitle +
            '. ' +
            chartData.length +
            ' lecturas disponibles en ' +
            unit +
            '.'
          }
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 6, left: -14, bottom: 0 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.accent} stopOpacity={0.2} />
                  <stop offset="72%" stopColor={theme.accent} stopOpacity={0.05} />
                  <stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#e7edf1"
                strokeDasharray="4 5"
                vertical={false}
              />
              <XAxis
                dataKey="chartTime"
                axisLine={{ stroke: '#dfe6eb' }}
                tickLine={false}
                tick={{ fill: '#5f7081', fontSize: 11, fontWeight: 500 }}
                interval="preserveStartEnd"
                minTickGap={24}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5f7081', fontSize: 11, fontWeight: 500 }}
                domain={domain}
                ticks={ticks}
                tickCount={4}
                width={42}
              />
              <Tooltip
                cursor={{
                  stroke: theme.accent,
                  strokeDasharray: '4 4',
                  strokeOpacity: 0.25,
                }}
                content={<SensorTooltip unit={unit} accent={theme.accent} />}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={theme.accent}
                strokeWidth={2.75}
                fill={'url(#' + gradientId + ')'}
                fillOpacity={1}
                dot={{
                  r: 4,
                  fill: theme.accent,
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5.5,
                  fill: theme.accent,
                  stroke: '#ffffff',
                  strokeWidth: 3,
                }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
