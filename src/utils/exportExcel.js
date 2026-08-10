import { formatDate, formatTime, getStatusLabel } from './formatters.js';

const DEFAULT_FILE_NAME = 'lecturas-aulasense.xlsx';
const EXCEL_HEADERS = [
  'Fecha',
  'Hora',
  'Temperatura (°C)',
  'Humedad (%)',
  'Estado',
];

function withXlsxExtension(fileName) {
  return fileName.toLowerCase().endsWith('.xlsx')
    ? fileName
    : `${fileName}.xlsx`;
}

export async function exportReadingsToExcel(
  readings,
  fileName = DEFAULT_FILE_NAME,
) {
  if (!Array.isArray(readings) || readings.length === 0) return false;

  const XLSX = await import('xlsx');

  const rows = readings.map((reading) => ({
    Fecha: formatDate(reading.medido_en, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    Hora: formatTime(reading.medido_en),
    'Temperatura (°C)': Number(reading.temperatura),
    'Humedad (%)': Number(reading.humedad),
    Estado: getStatusLabel(reading.estado),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: EXCEL_HEADERS,
  });
  worksheet['!cols'] = [
    { wch: 13 },
    { wch: 8 },
    { wch: 19 },
    { wch: 14 },
    { wch: 20 },
  ];
  worksheet['!autofilter'] = { ref: worksheet['!ref'] };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lecturas');
  XLSX.writeFile(workbook, withXlsxExtension(fileName));

  return true;
}

export default exportReadingsToExcel;
