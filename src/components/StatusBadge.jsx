import { getReadingStatus } from '../utils/formatters';

const toneStyles = {
  success: {
    badge: 'bg-[var(--color-success-soft)] text-[#148052]',
    dot: 'bg-[var(--color-success)]',
  },
  warning: {
    badge: 'bg-[var(--color-warning-soft)] text-[#b87008]',
    dot: 'bg-[var(--color-warning)]',
  },
  danger: {
    badge: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
    dot: 'bg-[var(--color-danger)]',
  },
  neutral: {
    badge: 'bg-[#f0f3f5] text-[#637485]',
    dot: 'bg-[#8796a4]',
  },
};

export default function StatusBadge({ status = 'normal' }) {
  const { label, tone } = getReadingStatus(status);
  const styles = toneStyles[tone] ?? toneStyles.neutral;

  return (
    <span
      className={`inline-flex min-h-8 items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${styles.badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${styles.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
