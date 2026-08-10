export const APP_LOCALE = 'es-MX';
export const APP_TIME_ZONE = 'America/Tijuana';

export const READING_STATUS = Object.freeze({
  normal: Object.freeze({ label: 'Normal', tone: 'success' }),
  temp_alta: Object.freeze({ label: 'Temperatura alta', tone: 'warning' }),
  temp_baja: Object.freeze({ label: 'Temperatura baja', tone: 'warning' }),
  hum_alta: Object.freeze({ label: 'Humedad alta', tone: 'warning' }),
  hum_baja: Object.freeze({ label: 'Humedad baja', tone: 'warning' }),
});

const UNKNOWN_STATUS = Object.freeze({
  label: 'Estado desconocido',
  tone: 'neutral',
});

function toValidDate(value) {
  if (value === null || value === undefined || value === '') return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, options = {}) {
  const date = toValidDate(value);

  if (!date) return '—';

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
    .format(date)
    .replaceAll('.', '');
}

export function formatTime(value, options = {}) {
  const date = toValidDate(value);

  if (!date) return '—';

  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    ...options,
  }).format(date);
}

export function formatNumber(value, options = {}) {
  const number = Number(value);

  if (!Number.isFinite(number)) return '—';

  return new Intl.NumberFormat(APP_LOCALE, {
    maximumFractionDigits: 1,
    ...options,
  }).format(number);
}

export function getReadingStatus(status) {
  return READING_STATUS[status] ?? UNKNOWN_STATUS;
}

export function getStatusLabel(status) {
  return getReadingStatus(status).label;
}
