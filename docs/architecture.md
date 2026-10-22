# Mom Recommends — Architecture Document

> **Status**: Planning (v0.1)  
> **Last updated**: 2026-10-22  
> **Audience**: Developers, designers, product stakeholders
> **Related**: `docs/decisions.md` (binding decisions for all open questions)

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
│                              │   UI Layer   │                  │
│                              │   (React)    │                  │
│                              └──────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

**Key properties:**
- **Client-only** — no server, no database, no API keys stored
- **Provider abstraction** — swap weather sources without changing logic
- **Deterministic rules** — same weather + activity = same outfit (cacheable, testable)
- **SPA** — React requires JS; degrade gracefully with a static shell and clear error
  states when JS or a provider is unavailable

---

## 3. Components

### 3.1 Location Provider
| Source | Method | Fallback |
|--------|--------|----------|
| Browser Geolocation API | `navigator.geolocation.getCurrentPosition()` | Show manual search screen |
| Manual search | User types city/postal code → geocode (OpenStreetMap Nominatim) | — |

**Decision (D07):** no IP-based geolocation. If geolocation is denied or unavailable, the
user is asked to search manually — never a silent third-party IP lookup.

Output: `{ lat, lon, displayName, timezone }`

> `timezone` is filled in by the weather provider (Open-Meteo `timezone=auto`), since
> neither the Geolocation API nor Nominatim reliably returns an IANA timezone.

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

**Initial implementation:** `OpenMeteoProvider` (free for non-commercial use, no key, global)  
**Future:** `AccuWeatherProvider`, `OpenWeatherMapProvider`, `NWSProvider` (US-only) — all keyed, so post-MVP (D08, D20)

### 3.3 Normalized Weather Data
All providers map to a single internal type. Canonical units are fixed (D19) and the
provider is responsible for any conversion, so the engine and UI never convert units.

```typescript
interface WeatherData {
  location: { lat: number; lon: number; name: string; timezone: string };
  current: WeatherSnapshot;
  hourly: WeatherSnapshot[];  // next 24–48h
  daily: DailySummary[];      // index 0 = today; 1 = tomorrow (D13)
  fetchedAt: number;          // epoch ms
  provider: string;
}

interface WeatherSnapshot {
  time: number;               // epoch ms (UTC; render in location timezone)
  temperature: number;        // °C
  apparentTemperature: number;// "feels like" °C
  windSpeed: number;          // m/s
  windDirection: number;      // degrees
  precipitation: number;      // mm (rain + snow)
  precipitationType: 'none' | 'rain' | 'snow' | 'sleet' | 'hail';
  snowDepth: number;          // cm on ground (0 if none)
  humidity: number;           // %
  uvIndex: number;            // 0–11+
  airQualityIndex: number | null; // US AQI 0–500; null when provider has no AQI (D09)
  cloudCover: number;         // %
  visibility: number;         // km
  weatherCode: number;        // WMO code (Open-Meteo passes through; others map to WMO)
}

interface DailySummary {
  date: string;               // YYYY-MM-DD in location tz
  tempMin: number;            // °C
  tempMax: number;            // °C
  sunrise: number;            // epoch ms (UTC)
  sunset: number;             // epoch ms (UTC)
  precipitationSum: number;   // mm total for the day
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
  gender?: 'neutral' | 'masculine' | 'feminine'; // avatar styling only; MVP renders 'neutral' (D12)
}

interface Outfit {
  items: OutfitItem[];
  rationale: string;          // human-readable, localized, no weather numbers (D04)
  confidence: number;         // 0–1 (D21)
  warnings: string[];         // e.g., "High UV — apply sunscreen"
}

interface OutfitItem {
  category: ItemCategory;     // base, mid, outer, feet, head, hands, legs, accessory
  name: string;               // "insulated winter boots"
  description: string;        // "waterproof, rated to −20°C"
  layer: number;              // 1 = base, 2 = mid, 3 = outer
  required: boolean;          // false = optional item (post-MVP accessories)
  avatarAsset: string;        // path/ID for generated avatar
}
```

**Engine properties:**
- Pure function: `(request) => Outfit` — no side effects, fully testable
- Rules defined in `docs/recommendation-rules.md`
- Can be evaluated in Web Worker for non-blocking UI
- Output is **cached keyed by `(weather.fetchedAt, activity, person)`** so activity changes
  re-run instantly without re-fetching weather

### 3.5 Avatar Renderer
- **MVP**: flat, layered SVG avatar (body parts + clothing assets), drawn in-house (D11)
- **Asset pipeline**: design → optimized SVG → bundled with app
- **No customization** — deterministic from `OutfitItem.avatarAsset`
- **Future**: canvas/WebGL for animation, export/share image (post-MVP, D14)

### 3.6 UI Layer (React + TypeScript + Vite)
| Route | Purpose |
|-------|---------|
| `/` | Auto-detect location → show today's outfit |
| `/search` | Manual location search → redirect to `/` with coords |
| `/settings` | Default activity, provider choice, language |
| `/about` | Privacy, attribution, credits |

**State management**: Zustand (weather, outfit, settings) — replaces "Context or Zustand" (D02)  
**Styling**: Tailwind CSS with CSS-variable design tokens in `src/theme/` (D02)  
**Icons**: lucide-react (D02)  
**i18n**: `i18next` with JSON locale files; Phase 1 = English + Spanish (D17); missing keys fall back to English with a warning icon

> **No weather numbers are ever shown** (D04). There is no Units (°C/°F) setting in the MVP
> because °C is the internal canonical unit and the UI never prints a number.

---

## 4. Data Flow (Happy Path)

1. **App loads** → check `localStorage` for saved preferences (activity, provider, language)
2. **Location**: try Geolocation API → success → fetch weather; fail/denied → show search screen
3. **Weather fetch**: call active `WeatherProvider.fetch(lat, lon)` → normalize → cache in memory + `sessionStorage` (5 min TTL)
4. **Recommendation**: `engine.recommend({ weather, activity, person })` → `Outfit` (cached, re-run on change)
5. **Render**: Avatar composes from `Outfit.items`; UI shows outfit grid + rationale (worded, no numbers) + warnings
6. **User interactions**: change activity → re-run engine instantly from cache; change location → restart flow

---

## 5. Provider Abstraction Details

```typescript
// providers/registry.ts
export const providers: WeatherProvider[] = [
  new OpenMeteoProvider(),
  // new AccuWeatherProvider(), // future: requires API key input in settings (D20)
];

export function getProvider(name: string): WeatherProvider { ... }

// providers/open-meteo.ts
class OpenMeteoProvider implements WeatherProvider {
  readonly name = 'Open-Meteo';
  readonly attribution = 'Weather data by Open-Meteo.com'; // required (CC BY 4.0, D08)

  async fetch(lat: number, lon: number): Promise<WeatherData> {
    const forecastParams = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current:
        'temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,'
        + 'precipitation,weather_code,relative_humidity_2m,uv_index,visibility,snow_depth',
      hourly:
        'temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,'
        + 'precipitation,precipitation_probability,weather_code,relative_humidity_2m,'
        + 'uv_index,snowfall,snow_depth,visibility,cloud_cover',
      daily:
        'temperature_2m_max,temperature_2m_min,sunrise,sunset,'
        + 'precipitation_sum,precipitation_probability_max,uv_index_max,weather_code',
      timezone: 'auto',
      forecast_days: '2',            // today + tomorrow (D13)
      temperature_unit: 'celsius',
      wind_speed_unit: 'ms',         // default is km/h — must request m/s
      precipitation_unit: 'mm',
      timeformat: 'unixtime',        // epoch seconds; normalize to ms
    });

    // Forecast is required; air quality is optional (D09) — a missing AQI
    // must never fail the whole weather fetch.
    const forecastRes = await fetch(`https://api.open-meteo.com/v1/forecast?${forecastParams}`);
    const forecastJson = await forecastRes.json();

    let airQuality = { current: { us_aqi: null } };
    try {
      const aqRes = await fetch(
        'https://air-quality-api.open-meteo.com/v1/air-quality'
        + `?latitude=${lat}&longitude=${lon}&current=us_aqi&timeformat=unixtime`
      );
      airQuality = await aqRes.json();
    } catch {
      // leave airQualityIndex = null
    }

    return this.normalize(forecastJson, airQuality);
  }

  private normalize(raw: any, airQuality: any): WeatherData { ... }
}
```

**Normalization rules (D19, D09):**
- `visibility` comes back in **meters** → store **km** (`÷ 1000`)
- `snow_depth` comes back in **meters** → store **cm** (`× 100`)
- all timestamps are epoch **seconds** (because `timeformat=unixtime`) → store **ms** (`× 1000`)
- `airQualityIndex` = `airQuality.current.us_aqi`, or `null` if the AQ request fails
  (never fail the whole weather fetch because of missing AQI)
- `weatherCode` passes through (Open-Meteo already returns WMO codes)

**Adding a new provider:** implement `WeatherProvider`, add to `registry.ts`, map raw weather
codes to WMO codes, and convert all units to the canonical set. Keyed providers add an API key
field to Settings (post-MVP, D20).

---

## 6. Caching & Offline Strategy

| Layer | TTL | Storage | Purpose |
|-------|-----|---------|---------|
| Weather response | 5 min | `sessionStorage` | Avoid re-fetch on activity change |
| Geocode results | 7 days | `localStorage` | Instant manual search repeat |
| Outfit assets | ∞ | Cache-Control + Service Worker | Offline avatar rendering |
| User prefs | ∞ | `localStorage` | Activity, provider, language (D23) |

**Service Worker** (Workbox): precache static assets; runtime cache weather API responses
(stale-while-revalidate). Offline caching is MVP; the installable PWA is post-MVP (D16).

---

## 7. Deployment

| Target | Method |
|--------|--------|
| **Production** | Static hosting (Netlify, Vercel, Cloudflare Pages, GitHub Pages) |
| **Preview** | Every PR gets a preview URL |
| **Local dev** | `npm run dev` (Vite) |
| **Build** | `npm run build` → `dist/` (static files only) |

No server, no environment variables required. The Open-Meteo free API is keyless; optional
API keys for future providers are entered in Settings and stored in `localStorage` only
(D20).

---

## 8. Dependencies (Planned)

All decisions per D02/D03.

| Category | Packages |
|----------|----------|
| Framework | `react`, `react-dom`, `react-router-dom` |
| Build | `vite`, `typescript`, `@vitejs/plugin-react` |
| State | `zustand` |
| Styling | `tailwindcss` (+ CSS-variable design tokens) |
| i18n | `i18next`, `react-i18next` |
| Icons | `lucide-react` |
| Date/time | `date-fns-tz` |
| Testing | `vitest`, `@testing-library/react`, `playwright` |
| Lint/Format | `eslint`, `prettier`, `typescript-eslint` |

---

## 9. Security & Privacy

- **No personal data collected** — no analytics, no accounts, no tracking
- **Location** — used only in-browser for the weather fetch and geocode lookup; never sent to our servers; no IP geolocation (D07)
- **Third-party endpoints** — the only outbound calls are Open-Meteo (forecast + air quality) and Nominatim (search); see CSP below and `docs/privacy.md`
- **API keys** — the MVP requires none; any future user-entered key stays in `localStorage` and is used only for that provider (D20)
- **Content Security Policy** — strict `script-src 'self'`; `connect-src` limited to `https://api.open-meteo.com`, `https://air-quality-api.open-meteo.com`, `https://nominatim.openstreetmap.org` (D22)
- **HTTPS only** — enforced by hosting platform

---

## 10. Resolved Decisions / Future Work

All previously open questions are **decided** — see `docs/decisions.md` (D01–D24). The rows
below map each former open question to its decision.

| Former open question | Decision | ID |
|----------------------|----------|-----|
| Avatar illustration style | Flat, minimal, layered in-house SVG | D11 |
| Asset source | In-house set, bundled in-repo (MIT) | D11 |
| Multi-day forecast | Post-MVP 7-day carousel; MVP single-day | D13 |
| Sharing "today's outfit" | Post-MVP (in-browser image + deep link) | D14 |
| Accessibility | MVP requirement (screen-reader, AA, high-contrast) | D15 |
| PWA install | Post-MVP; SW asset caching is MVP | D16 |
| Gender in avatar | Not in MVP; field optional, renders `neutral` | D12 |
| Weather units in UI | Never shown; no °C/°F setting | D04 |
| Localization scope | Phase 1 EN + ES; then FR, DE | D17 |
| License | MIT | D01 |

---

## 11. Appendix: Legacy Code Note

The repository previously contained a Java Spring Boot backend (`src/main/java/...`) that
called AccuWeather on a schedule. That architecture is **superseded** by this document and
the legacy files were removed in the planning cleanup (PR #1). The old code remains available
in git history for reference but is not part of the new frontend-only design.