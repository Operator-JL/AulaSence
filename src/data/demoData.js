export const demoUser = {
  id: '3f16460a-66f2-4bf4-87f8-33b72788db66',
  nombre: 'Jesús Martín Gallardo',
  email: 'jesus@aulasense.mx',
  rol: 'docente',
  creado_en: '2026-07-30T10:00:00-07:00',
};

export const demoDevice = {
  id: '2bd84b22-b8cb-48e5-95ae-95e4f1d361d0',
  usuario_id: demoUser.id,
  codigo: 'esp32-aula-a1',
  nombre: 'Aula A1',
  temp_min: 18,
  temp_max: 28,
  hum_min: 35,
  hum_max: 65,
  alertas_activas: true,
  actualizado_en: '2026-08-03T15:00:00-07:00',
};

export const demoReadings = [
  {
    id: 'lectura-a1-20260803-1500',
    dispositivo_id: demoDevice.id,
    temperatura: 24.6,
    humedad: 48,
    estado: 'normal',
    medido_en: '2026-08-03T15:00:00-07:00',
  },
  {
    id: 'lectura-a1-20260803-1400',
    dispositivo_id: demoDevice.id,
    temperatura: 24.2,
    humedad: 49,
    estado: 'normal',
    medido_en: '2026-08-03T14:00:00-07:00',
  },
  {
    id: 'lectura-a1-20260803-1300',
    dispositivo_id: demoDevice.id,
    temperatura: 25.1,
    humedad: 47,
    estado: 'normal',
    medido_en: '2026-08-03T13:00:00-07:00',
  },
  {
    id: 'lectura-a1-20260803-1200',
    dispositivo_id: demoDevice.id,
    temperatura: 26.8,
    humedad: 46,
    estado: 'temp_alta',
    medido_en: '2026-08-03T12:00:00-07:00',
  },
  {
    id: 'lectura-a1-20260803-1100',
    dispositivo_id: demoDevice.id,
    temperatura: 25.5,
    humedad: 51,
    estado: 'normal',
    medido_en: '2026-08-03T11:00:00-07:00',
  },
  {
    id: 'lectura-a1-20260803-1000',
    dispositivo_id: demoDevice.id,
    temperatura: 24.9,
    humedad: 52,
    estado: 'normal',
    medido_en: '2026-08-03T10:00:00-07:00',
  },
  {
    id: 'lectura-a1-20260803-0900',
    dispositivo_id: demoDevice.id,
    temperatura: 23.8,
    humedad: 54,
    estado: 'normal',
    medido_en: '2026-08-03T09:00:00-07:00',
  },
  {
    id: 'lectura-a1-20260803-0800',
    dispositivo_id: demoDevice.id,
    temperatura: 23.2,
    humedad: 55,
    estado: 'normal',
    medido_en: '2026-08-03T08:00:00-07:00',
  },
  {
    id: 'lectura-a1-20260803-0700',
    dispositivo_id: demoDevice.id,
    temperatura: 22.7,
    humedad: 56,
    estado: 'normal',
    medido_en: '2026-08-03T07:00:00-07:00',
  },
];

export const currentReading = {
  ...demoReadings[0],
  actualizado_hace_segundos: 8,
};
