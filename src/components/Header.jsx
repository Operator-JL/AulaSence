import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const navigationItems = [
  { label: 'Resumen', to: '/resumen' },
  { label: 'Historial', to: '/historial' },
  { label: 'Configuración', to: '/configuracion' },
];

const REFRESH_INTERVAL_MS = 30_000;

export default function Header() {
  const { pathname } = useLocation();
  const [deviceOnline, setDeviceOnline] = useState(null);

  const loadDeviceStatus = useCallback(async () => {
    try {
      const devices = await api.getDevices();
      const firstDevice = devices?.[0];

      if (!firstDevice) {
        setDeviceOnline(false);
        return;
      }

      setDeviceOnline(Boolean(firstDevice.online));
    } catch {
      setDeviceOnline(false);
    }
  }, []);

  useEffect(() => {
    loadDeviceStatus();

    const intervalId = window.setInterval(
      loadDeviceStatus,
      REFRESH_INTERVAL_MS,
    );

    return () => window.clearInterval(intervalId);
  }, [loadDeviceStatus]);

  const connectionLabel =
    deviceOnline === null
      ? 'Comprobando ESP32...'
      : deviceOnline
        ? 'ESP32 conectado'
        : 'ESP32 desconectado';

  const connectionStyles =
    deviceOnline === null
      ? 'border-[var(--color-border)] bg-white text-[var(--color-muted)]'
      : deviceOnline
        ? 'border-[#d8eee7] bg-[var(--color-primary-soft)] text-[#126b60]'
        : 'border-red-200 bg-[var(--color-danger-soft)] text-[var(--color-danger)]';

  const indicatorStyles =
    deviceOnline === null
      ? 'bg-[var(--color-muted)]'
      : deviceOnline
        ? 'bg-[var(--color-success)] shadow-[0_0_0_4px_rgb(24_173_101_/_8%)]'
        : 'bg-[var(--color-danger)] shadow-[0_0_0_4px_rgb(220_38_38_/_8%)]';

  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto grid min-h-20 w-full max-w-[1384px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 px-4 sm:gap-x-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link
          to="/resumen"
          className="inline-flex min-w-0 items-center gap-2.5 py-3 text-base font-bold tracking-[-0.02em] text-[var(--color-ink)] sm:gap-3 sm:text-[1.15rem]"
          aria-label="AulaSense, ir al resumen"
        >
          <span
            className="size-8 shrink-0 rounded-full bg-[var(--color-primary)] shadow-[0_5px_14px_rgb(15_159_140_/_22%)] sm:size-9"
            aria-hidden="true"
          />
          <span>AulaSense</span>
        </Link>

        <nav
          className="col-span-2 row-start-2 grid w-full grid-cols-3 items-stretch border-t border-[var(--color-border)] lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:flex lg:w-auto lg:self-stretch lg:border-t-0"
          aria-label="Navegación principal"
        >
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.to ||
              (item.to === '/resumen' && pathname === '/');

            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={`relative inline-flex min-h-12 items-center justify-center px-1 text-[0.8rem] font-medium transition-colors sm:px-4 sm:text-sm ${
                  isActive
                    ? 'text-[var(--color-primary-dark)] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[var(--color-primary)]'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div
          className={`inline-flex items-center gap-1.5 justify-self-end rounded-full border px-2.5 py-2 text-[0.7rem] font-medium whitespace-nowrap sm:gap-2 sm:px-5 sm:text-sm lg:col-start-3 lg:row-start-1 ${connectionStyles}`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${indicatorStyles}`}
            aria-hidden="true"
          />
          <span>{connectionLabel}</span>
        </div>
      </div>
    </header>
  );
}