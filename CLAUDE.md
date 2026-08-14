# CLAUDE.md — AulaSence Frontend

## Project overview

`AulaSence` is the React frontend for AulaSense: an IoT classroom monitoring dashboard. It displays DHT11 sensor readings (temperature and humidity), controls actuators (LED, buzzer), and shows historical data. All pages are wired to the real FastAPI backend (`VITE_API_BASE_URL`) through `src/services/api.js`, with Supabase handling authentication. The six endpoints of the backend contract (`AulaSense-Backend/CLAUDE.md §8`) are all in use: device listing, latest reading, readings history, device PATCH (name/thresholds/alerts), actuators PATCH, and device DELETE.

## Running the app

```powershell
cd AulaSence
npm run dev      # Vite dev server, typically http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build locally
```

## Tech stack

- **React 19** with lazy-loaded pages via `Suspense`
- **React Router v7** — all routes defined in `src/App.jsx`
- **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config.js` — configured through the Vite plugin)
- **Recharts** for sensor charts
- **lucide-react** for icons
- **xlsx** (SheetJS) for Excel export (`src/utils/exportExcel.js`)
- **@supabase/supabase-js** — auth (GoTrue) and session management

## Project structure

```
src/
  App.jsx                  # Route tree
  main.jsx                 # React root, AuthProvider wrapper
  index.css                # Global CSS variables and utility classes
  auth/
    AuthContext.jsx        # useAuth() hook + AuthProvider (Supabase session via getSession + onAuthStateChange)
    ProtectedRoute.jsx     # Redirects unauthenticated users to /login
    sessionStore.js        # OBSOLETO: sin imports. Supabase persiste la sesión; pendiente de borrar
  components/
    ActuatorPanel.jsx      # LED + buzzer toggles — PATCH /api/devices/:id/actuators (recibe prop `device`)
    Header.jsx             # Top navigation bar
    MetricCard.jsx         # Single-value stat card
    ReadingsTable.jsx      # Tabular history of sensor readings
    SensorChart.jsx        # Recharts area chart for temperature or humidity
    StatusBadge.jsx        # Colored badge for sensor state (normal / temp_alta…)
    Toggle.jsx             # Accessible on/off toggle switch
  data/
    demoData.js            # OBSOLETO: fixtures sin imports; pendiente de borrar
  layouts/
    AuthenticatedLayout.jsx  # Shell with Header + <Outlet>
  lib/
    supabaseClient.js      # createClient con VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
  pages/
    DashboardPage.jsx      # / and /resumen — live sensor charts + actuator panel (refresca cada 30 s)
    HistoryPage.jsx        # /historial — readings table + threshold settings (PATCH)
    LoginPage.jsx          # /login
    SettingsPage.jsx       # /configuracion — device PATCH, cuenta Supabase, device DELETE
  services/
    api.js                 # Cliente único del backend: Bearer token + los 6 endpoints de /api
    authService.js         # login()/logout() con supabase.auth
  utils/
    exportExcel.js         # exportReadingsToExcel(readings)
    formatters.js          # Date/number formatting helpers
```

## Routes

| Path | Page | Auth required |
|---|---|---|
| `/login` | `LoginPage` | No |
| `/` | `DashboardPage` | Yes |
| `/resumen` | `DashboardPage` | Yes |
| `/historial` | `HistoryPage` | Yes |
| `/configuracion` | `SettingsPage` | Yes |
| `*` | Redirects to `/resumen` | Yes |

## Auth

El login **no** pasa por el backend de FastAPI. Flujo real con Supabase:

1. React llama a `supabase.auth.signInWithPassword({ email, password })` directamente contra GoTrue.
2. Supabase devuelve un `access_token` (JWT) y lo refresca automáticamente.
3. Cada request al backend incluye `Authorization: Bearer <access_token>`.
4. El backend FastAPI verifica el token; React nunca verifica JWTs.

### Implementación

La migración a Supabase ya está hecha:
- `authService.js` — `login()` llama a `supabase.auth.signInWithPassword()`; `logout()` a `signOut()`.
- `AuthContext.jsx` — consume `supabase.auth.getSession()` y el listener `onAuthStateChange`. `useAuth()` expone `session`, `user`, `accessToken`, `isAuthenticated`, `isAuthenticating`, `login`, `logout`.
- `sessionStore.js` — **obsoleto y sin imports** (Supabase persiste y refresca el token solo). Se conserva únicamente hasta que se decida borrarlo; no volver a importarlo.
- Los datos de cuenta en Configuración salen del usuario de Supabase: `user.email`, `user.created_at`, `user.user_metadata.nombre` / `.rol`.

### Cliente Supabase

`src/lib/supabaseClient.js` crea el cliente con las variables de entorno de Vite:

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

Variables requeridas en `.env.local` (nunca commitear):
```
VITE_SUPABASE_URL=https://kxpscwbustzbirgsaouf.supabase.co
VITE_SUPABASE_ANON_KEY=...   # clave pública (anon), no la service_role
VITE_API_BASE_URL=https://...  # URL del backend FastAPI en Oracle
```

### Llamadas al backend

Todas las llamadas a `/api` pasan por `src/services/api.js`, que obtiene la sesión con `supabase.auth.getSession()` y agrega `Authorization: Bearer <access_token>` en cada request. No hacer `fetch` directo al backend desde páginas o componentes — usar siempre `api.*`:

```js
import { api } from '../services/api'

const devices = await api.getDevices()
const latest = await api.getLatestReading(deviceId)   // null si responde 204 (sin lecturas)
const history = await api.getReadings(deviceId, { from, to, limit })
await api.updateDevice(deviceId, { nombre, tempMin, tempMax, humMin, humMax, alertsEnabled })
await api.updateActuators(deviceId, { mode, led, buzzer })
await api.deleteDevice(deviceId)
```

El backend responde en **camelCase** (`tempMin`, `lastSeenAt`, `alertsEnabled`). No transformar los nombres en el frontend. Los errores de FastAPI (`{"detail": "..."}`) se relanzan como `Error` con ese mensaje.

Reglas del contrato reflejadas en el frontend (detalle en `AulaSense-Backend/CLAUDE.md §8`):
- `getReadings` devuelve la serie **ascendente** por `measuredAt` (las gráficas la usan tal cual; la tabla del historial la invierte).
- `updateActuators` con `mode: "auto"` manda **solo** `mode` — el backend responde 422 si van `led`/`buzzer`. El toggle del LED mapea a `"rojo"`/`"apagado"`.
- `deleteDevice` es **destructivo** (cascade sobre `lecturas`): el modal de Configuración exige teclear el nombre guardado del dispositivo antes de habilitar la confirmación.

## Datos

Todos los datos visibles vienen del backend; no hay modo demo. `src/data/demoData.js` sigue en el repo pero **nada lo importa** — es un remanente pendiente de borrar; no usarlo en código nuevo. Si el usuario autenticado no tiene filas en `dispositivos`, las páginas muestran estados vacíos/de error, no fixtures.

## CSS conventions

- CSS custom properties are defined in `index.css` (e.g. `--color-primary`, `--color-muted`, `--color-border`, `--color-ink`, `--color-success`, `--color-warning`, `--color-danger`).
- Utility class shorthands like `surface-card`, `page-shell`, `page-title`, `page-subtitle`, `primary-button`, `field-input`, `notice` are also defined in `index.css`.
- Use these tokens and shorthand classes instead of hardcoding color hex values.

## Comments

Never delete existing comments in the user's code. When editing a file, preserve all comments as-is.

## Deploy

La app se despliega en **Vercel**. Las variables `VITE_*` se configuran en el panel de Vercel como variables de entorno de producción — nunca en archivos commiteados. El backend permite el origen de Vercel en su CORS; no agregar `*`.

## Exports convention

All components use `export default` at the bottom of the file. Named exports (`export function`, `export const`) are used for hooks and utilities.
