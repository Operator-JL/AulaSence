# CLAUDE.md — AulaSence Frontend

## Project overview

`AulaSence` is the React frontend for AulaSense: an IoT classroom monitoring dashboard. It displays DHT11 sensor readings (temperature and humidity), controls actuators (LED, buzzer), and shows historical data. The app is in demo mode — all data currently comes from static fixtures in `src/data/demoData.js`; no real backend is wired yet.

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
- **@supabase/supabase-js** — auth (GoTrue) and session management (to be installed; not yet in `package.json`)

## Project structure

```
src/
  App.jsx                  # Route tree
  main.jsx                 # React root, AuthProvider wrapper
  index.css                # Global CSS variables and utility classes
  auth/
    AuthContext.jsx        # useAuth() hook + AuthProvider
    ProtectedRoute.jsx     # Redirects unauthenticated users to /login
    sessionStore.js        # sessionStorage read/write/clear with validation
  components/
    ActuatorPanel.jsx      # LED + buzzer toggles, automatic/manual mode
    Header.jsx             # Top navigation bar
    MetricCard.jsx         # Single-value stat card
    ReadingsTable.jsx      # Tabular history of sensor readings
    SensorChart.jsx        # Recharts area chart for temperature or humidity
    StatusBadge.jsx        # Colored badge for sensor state (normal / temp_alta…)
    Toggle.jsx             # Accessible on/off toggle switch
  data/
    demoData.js            # Static demo fixtures (user, device, readings)
  layouts/
    AuthenticatedLayout.jsx  # Shell with Header + <Outlet>
  pages/
    DashboardPage.jsx      # / and /resumen — live sensor charts + actuator panel
    HistoryPage.jsx        # /historial — readings table + threshold settings
    LoginPage.jsx          # /login
    SettingsPage.jsx       # /configuracion
  services/
    authService.js         # login() stub — throws AuthNotConfiguredError until backend is ready
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

### Estado actual del código (pendiente de migrar)

El código actual usa un flujo propio que **aún no está conectado a Supabase**:
- `authService.js` — `login()` lanza `AuthNotConfiguredError`. Debe reemplazarse con `supabase.auth.signInWithPassword()`.
- `sessionStore.js` — persiste la sesión en `sessionStorage` manualmente. Supabase ya maneja esto internamente; este archivo quedará obsoleto.
- `AuthContext.jsx` — gestiona la sesión en React. Debe reescribirse para consumir `supabase.auth.getSession()` y el listener `onAuthStateChange`.

### Cliente Supabase

Crear `src/lib/supabaseClient.js` con las variables de entorno de Vite:

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

Todas las rutas de `/api` requieren el token de Supabase:

```js
const { data: { session } } = await supabase.auth.getSession()
fetch(`${import.meta.env.VITE_API_BASE_URL}/api/devices`, {
  headers: { Authorization: `Bearer ${session.access_token}` },
})
```

El backend responde en **camelCase** (`tempMin`, `lastSeenAt`, `alertsEnabled`). No transformar los nombres en el frontend.

## Demo data

All visible data is hardcoded in `src/data/demoData.js`:
- `demoUser` — teacher account
- `demoDevice` — ESP32 device `esp32-aula-a1` (Aula A1) with threshold values
- `demoReadings` — 9 hourly readings on 2026-08-03
- `currentReading` — alias for the most recent reading

Cuando se conecte el backend real, reemplazar los imports de `demoData` con llamadas a los endpoints del backend (ver contrato en `AulaSense-Backend/CLAUDE.md §8`).

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
