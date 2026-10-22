# Mom Recommends — Architecture Document

> **Status**: Planning (v0.1)  
> **Last updated**: 2025-10-22  
> **Audience**: Developers, designers, product stakeholders

---

## 1. Vision Statement

A single-page web application that instantly shows parents and children **what to wear today** — not a list of numbers, but a complete, visual outfit recommendation based on real weather conditions. Privacy-first, no backend, no accounts, no tracking.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (SPA)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Location    │  │   Weather    │  │  Recommendation      │  │
│  │  Provider    │──▶│  Provider    │──▶│  Engine (rules)      │  │
│  └──────────────┘  └──────┬───────┘  └──────────┬───────────┘  │
│                           │                     │              │
│                           ▼                     ▼              │
│                    ┌──────────────┐    ┌──────────────────┐   │
│                    │  Weather     │    │  Outfit + Avatar │   │
│                    │  Data (norm) │    │  Renderer        │   │
│                    └──────────────┘    └──────────────────┘   │
│                           │                     │              │
│                           └──────────┬──────────┘              │
│                                      ▼                         │
│                              ┌──────────────┐                  │
│                              │  UI Layer    │                  │
│                              │  (React/Vue) │                  │
│                              └──────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key properties:**
- **Client-only** — no server, no database, no API keys stored
- **Provider abstraction** — swap weather sources without changing logic
- **Deterministic rules** — same weather + activity = same outfit (cacheable, testable)
- **Progressive enhancement** — works without JS for core data, rich UI with JS

---

## 3. Components

### 3.1 Location Provider
| Source | Method | Fallback |
|--------|--------|----------|
| Browser Geolocation API | `navigator.geolocation.getCurrentPosition()` | IP-based (ipapi.co) |
| Manual search | User types city/postal code → geocode (OpenStreetMap Nominatim) | — |

Output: `{ lat, lon, displayName, timezone }`

### 3.2 Weather Provider (Abstract Interface)
```typescript
interface WeatherProvider {
  /** Human-readable name for UI selection */
  readonly name: string;
  /** Fetch current + today's forecast for a coordinate */
  fetch(lat: number, lon: number): Promise<WeatherData>;
  /** Optional: metadata for attribution */
  readonly attribution?: string;
}
```

**Initial implementation:** `OpenMeteoProvider` (free, no key, global, good hourly forecast)  
**Future:** `AccuWeatherProvider`, `OpenWeatherMapProvider`, `NWSProvider` (US-only)

### 3.3 Normalized Weather Data
All providers map to a single internal type:

```typescript
interface WeatherData {
  location: { lat: number; lon: number; name: string; timezone: string };
  current: WeatherSnapshot;
  hourly: WeatherSnapshot[];  // next 24–48h
  daily: DailySummary;        // today's min/max, sunrise/sunset
  fetchedAt: number;          // epoch ms
  provider: string;
}

interface WeatherSnapshot {
  time: number;               // epoch ms (hour start)
  temperature: number;        // °C
  apparentTemperature: number;// "feels like" °C
  windSpeed: number;          // m/s
  windDirection: number;      // degrees
  precipitation: number;      // mm (rain + snow)
  precipitationType: 'none' | 'rain' | 'snow' | 'sleet' | 'hail';
  snowDepth: number;          // cm on ground
  humidity: number;           // %
  uvIndex: number;            // 0–11+
  airQualityIndex: number;    // 0–500 (US AQI) or provider-specific
  cloudCover: number;         // %
  visibility: number;         // km
  weatherCode: number;        // WMO code (provider-normalized)
}

interface DailySummary {
  date: string;               // YYYY-MM-DD in location tz
  tempMin: number;
  tempMax: number;
  sunrise: number;
  sunset: number;
  precipitationSum: number;
  precipitationType: 'none' | 'rain' | 'snow' | 'mixed';
  uvIndexMax: number;
}
```

### 3.4 Recommendation Engine (Pure Function)
```typescript
type Activity = 'school' | 'playground' | 'walk' | 'sport' | 'commute' | 'general';

interface OutfitRequest {
  weather: WeatherData;
  activity: Activity;
  person: 'adult' | 'child';
  gender?: 'neutral' | 'masculine' | 'feminine'; // for avatar styling only
}

interface Outfit {
  items: OutfitItem[];
  rationale: string;          // human-readable explanation
  confidence: number;         // 0–1
  warnings: string[];         // e.g., "UV high — apply sunscreen"
}

interface OutfitItem {
  category: ItemCategory;     // base, mid, outer, feet, head, hands, legs
  name: string;               // "insulated winter boots"
  description: string;        // "waterproof, rated to -20°C"
  layer: number;              // 1 = base, 2 = mid, 3 = outer
  required: boolean;          // false = optional accessory (v2)
  avatarAsset: string;        // path/ID for generated avatar
}
```

**Engine properties:**
- Pure function: `(request) => Outfit` — no side effects, fully testable
- Rules defined in `docs/recommendation-rules.md`
- Can be evaluated in Web Worker for non-blocking UI

### 3.5 Avatar Renderer
- **MVP**: SVG-based composed avatar (layered body parts + clothing assets)
- **Asset pipeline**: Figma → optimized SVG → bundled with app
- **No customization** — deterministic from `OutfitItem.avatarAsset`
- **Future**: canvas/WebGL for animation, export/share image

### 3.6 UI Layer (React + TypeScript + Vite)
| Route | Purpose |
|-------|---------|
| `/` | Auto-detect location → show today's outfit |
| `/search` | Manual location search → redirect to `/` with coords |
| `/settings` | Units (°C/°F), default activity, provider choice, language |
| `/about` | Privacy, attribution, credits |

**State management**: React Context + `useReducer` for weather/outfit/settings  
**Styling**: CSS Modules or Tailwind (design tokens in `theme/`)  
**i18n**: `i18next` with JSON locale files, English default, keys structured for translation

---

## 4. Data Flow (Happy Path)

1. **App loads** → check `localStorage` for saved preferences (units, activity, provider)
2. **Location**: try Geolocation API → success → fetch weather; fail → show search screen
3. **Weather fetch**: call active `WeatherProvider.fetch(lat, lon)` → normalize → cache in memory + `sessionStorage` (5 min TTL)
4. **Recommendation**: `engine.recommend({ weather, activity, person })` → `Outfit`
5. **Render**: Avatar composes from `Outfit.items`; UI shows outfit grid + rationale + warnings
6. **User interactions**: change activity → re-run engine instantly; change location → restart flow

---

## 5. Provider Abstraction Details

```typescript
// providers/registry.ts
export const providers: WeatherProvider[] = [
  new OpenMeteoProvider(),
  // new AccuWeatherProvider(), // requires API key input in settings
];

export function getProvider(name: string): WeatherProvider { ... }

// providers/open-meteo.ts
class OpenMeteoProvider implements WeatherProvider {
  readonly name = 'Open-Meteo';
  readonly attribution = 'Weather data by Open-Meteo.com';

  async fetch(lat: number, lon: number): Promise<WeatherData> {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: 'temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weather_code,relative_humidity_2m,uv_index,visibility',
      hourly: 'temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,precipitation_probability,weather_code,relative_humidity_2m,uv_index,snowfall,snow_depth,visibility,cloud_cover',
      daily: 'temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,uv_index_max',
      timezone: 'auto',
      forecast_days: '2',
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    const json = await res.json();
    return this.normalize(json);
  }

  private normalize(raw: any): WeatherData { ... }
}
```

**Adding a new provider:** implement `WeatherProvider`, add to `registry.ts`, optionally add API key field to Settings.

---

## 6. Caching & Offline Strategy

| Layer | TTL | Storage | Purpose |
|-------|-----|---------|---------|
| Weather response | 5 min | `sessionStorage` | Avoid re-fetch on activity change |
| Geocode results | 7 days | `localStorage` | Instant manual search repeat |
| Outfit assets | ∞ | Cache-Control + Service Worker | Offline avatar rendering |
| User prefs | ∞ | `localStorage` | Units, activity, provider, language |

**Service Worker** (Workbox): precache static assets; runtime cache weather API responses (stale-while-revalidate).

---

## 7. Deployment

| Target | Method |
|--------|--------|
| **Production** | Static hosting (Netlify, Vercel, Cloudflare Pages, GitHub Pages) |
| **Preview** | Every PR gets a preview URL |
| **Local dev** | `npm run dev` (Vite) |
| **Build** | `npm run build` → `dist/` (static files only) |

No server, no environment variables required (Open-Meteo is keyless). Optional API keys entered in Settings UI, stored in `localStorage` only.

---

## 8. Dependencies (Planned)

| Category | Packages |
|----------|----------|
| Framework | `react`, `react-dom`, `react-router-dom` |
| Build | `vite`, `typescript`, `@vitejs/plugin-react` |
| State | (built-in Context) or `zustand` |
| i18n | `i18next`, `react-i18next` |
| Icons | `lucide-react` or inline SVG |
| Date/time | `date-fns-tz` |
| Testing | `vitest`, `@testing-library/react`, `playwright` |
| Lint/Format | `eslint`, `prettier`, `typescript-eslint` |

---

## 9. Security & Privacy

- **No personal data collected** — no analytics, no accounts, no tracking
- **Location** — used only in-browser for weather fetch; never sent to our servers
- **API keys** (if user enters one) — stored in `localStorage`, never leave browser
- **Content Security Policy** — strict `script-src 'self'` + `connect-src` for weather APIs only
- **HTTPS only** — enforced by hosting platform

---

## 10. Open Questions / Future Work

| Topic | Decision Needed |
|-------|-----------------|
| Avatar style | Illustration style (flat, line art, 3D-ish)? |
| Asset source | Draw in-house, commission, or license a set? |
| Multi-day | Extend `daily` forecast to 7-day carousel? |
| Sharing | "Share today's outfit" → generate image + deep link? |
| Accessibility | Screen-reader description of outfit; high-contrast mode |
| PWA install | `manifest.json`, `beforeinstallprompt` handling |

---

## 11. Appendix: Legacy Code Note

The repository previously contained a Java Spring Boot backend (`src/main/java/...`) that called AccuWeather on a schedule. That architecture is **superseded** by this document. Legacy code is preserved in git history for reference but is not part of the new frontend-only design.