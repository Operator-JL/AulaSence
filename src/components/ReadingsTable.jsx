import { useEffect, useId, useMemo, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';

import { formatNumber, formatTime } from '../utils/formatters';
import StatusBadge from './StatusBadge';

export default function ReadingsTable({
  readings = [],
  onExport,
  loading = false,
  error = false,
  itemsPerPage = 9,
}) {
  const titleId = useId();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(readings.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const visibleReadings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return readings.slice(start, start + itemsPerPage);
  }, [currentPage, itemsPerPage, readings]);

  const firstItem = readings.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const lastItem = Math.min(currentPage * itemsPerPage, readings.length);

  return (
    <section className="surface-card overflow-hidden" aria-labelledby={titleId}>
      <div className="flex flex-col gap-4 border-b border-[#edf1f3] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 id={titleId} className="text-base font-bold text-[var(--color-ink)]">
            Lecturas registradas
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Datos almacenados desde el ESP32
          </p>
        </div>
        <button
          type="button"
          onClick={onExport}
          disabled={loading || Boolean(error) || readings.length === 0}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[#526476] transition-colors hover:border-[#b9d9d2] hover:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <FileSpreadsheet className="h-4 w-4 text-[#15945a]" aria-hidden="true" />
          Exportar a Excel
        </button>
      </div>

      {error ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center" role="alert">
          <AlertCircle className="h-7 w-7 text-[var(--color-danger)]" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-[var(--color-ink)]">
            No fue posible cargar la información
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <caption className="sr-only">
              Historial de temperatura, humedad y estado del aula
            </caption>
            <thead className="bg-[#f7f9fa] text-xs font-semibold text-[#718394]">
              <tr>
                <th scope="col" className="px-6 py-4">Hora</th>
                <th scope="col" className="px-6 py-4">Temperatura (°C)</th>
                <th scope="col" className="px-6 py-4">Humedad (%)</th>
                <th scope="col" className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f3]">
              {loading &&
                Array.from({ length: 5 }, (_, index) => (
                  <tr key={index} aria-hidden="true">
                    {Array.from({ length: 4 }, (__, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4">
                        <span className="block h-4 w-24 animate-pulse rounded bg-[#edf1f3]" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && visibleReadings.length === 0 && (
                <tr>
                  <td colSpan="4" className="h-64 px-6 text-center text-sm text-[var(--color-muted)]">
                    No hay lecturas registradas
                  </td>
                </tr>
              )}

              {!loading &&
                visibleReadings.map((reading) => (
                  <tr key={reading.id} className="text-sm text-[#314458] transition-colors hover:bg-[#fbfcfc]">
                    <td className="px-6 py-4 font-semibold text-[var(--color-ink)]">
                      {formatTime(reading.medido_en)}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatNumber(reading.temperatura, {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatNumber(reading.humedad, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={reading.estado} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {!error && !loading && readings.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-[#edf1f3] px-5 py-4 text-xs text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Mostrando {firstItem} a {lastItem} de {readings.length} lecturas
          </p>
          <div className="flex items-center gap-2" aria-label="Paginación de lecturas">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white text-[#6f8192] hover:bg-[#f5f8f9] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] px-2 font-semibold text-[var(--color-primary-dark)]">
              {currentPage}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white text-[#6f8192] hover:bg-[#f5f8f9] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
