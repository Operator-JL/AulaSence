export default function Toggle({
  checked = false,
  onChange,
  disabled = false,
  label = 'Cambiar estado',
  id,
  className = '',
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45 ${
        checked
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
          : 'border-[#dce3e8] bg-[#e5eaee]'
      } ${className}`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[1.35rem]' : 'translate-x-0.5'
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
