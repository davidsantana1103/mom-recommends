# Mom Recommends — Data Models

> **Status**: Draft (v0.1)  
> **Last updated**: 2026-10-22  
> **Audience**: Developers, testers, documentation readers
> **Related**: `docs/decisions.md` (binding decisions D01–D24)

---

## 1. Core Concepts

### 1.1 Activity Types
The activity type determines how conservative or minimal the outfit should be.

```typescript
export type Activity = 'school' | 'playground' | 'walk' | 'sport' | 'commute' | 'general';
```

| Activity | Description | Outfit Philosophy |
|----------|-------------|-------------------|
| `school` | School day, moderate activity | Balanced: warm enough for class, not for recess |
| `playground` | Outdoor play, high activity | Minimal layers (breathable), durable materials |
| `walk` | Casual walking, variable activity | Mid-weight, easy to remove if warm |
| `sport` | Active sports (soccer, etc.) | Technical fabrics, moisture-wicking, flexibility |
| `commute` | Travel to/from school/work | Weather-protective, compact (jacket + umbrella) |
| `general` | Default, no specific context | Balanced for typical outdoor time |

### 1.2 Person Types
```typescript
export type Person = 'adult' | 'child';
```

- **Adults**: Full-sized avatar, standard proportions
- **Child**: Smaller avatar, typically shorter, may need boots/pants for snow

### 1.3 ItemCategory
```typescript
export type ItemCategory = 
  | 'base'    // underwear, thermal layer
  | 'mid'     // sweater, long-sleeve shirt
  | 'outer'   // jacket, coat, raincoat
  | 'feet'    // shoes, boots, sneakers
  | 'head'    // hat, hood, helmet
  | 'hands'   // gloves, mittens
  | 'legs'    // pants, leggings, tights
  | 'accessory' // scarf, umbrella, sunglasses (post-MVP)
;
```

### 1.4 OutfitItem
```typescript
interface OutfitItem {
  category: ItemCategory;
  name: string;               // "insulated winter boots"
  description: string;        // "waterproof, rated to -20°C"
  layer: number;              // 1 = base, 2 = mid, 3 = outer
  required: boolean;          // true = must wear, false = optional (future)
  avatarAsset: string;        // path to SVG asset for generated avatar
}
```

### 1.5 WeatherData (Normalized)

All providers output this standardized format. **Canonical units are fixed (D19)** — °C,
m/s, mm, km (visibility), cm (snow depth), % — and the provider is responsible for
converting from whatever its source returns. The engine and UI never convert units.

```typescript
interface WeatherData {
  location: {
    lat: number;
    lon: number;
    name: string;               // human-readable location name
    timezone: string;           // IANA timezone, e.g. "America/New_York" (from provider)
  };
  current: WeatherSnapshot;
  hourly: WeatherSnapshot[];    // next 24–48 hours
  daily: DailySummary[];        // index 0 = today; index 1 = tomorrow (fetched per D13)
  fetchedAt: number;            // epoch ms when fetched
  provider: string;             // e.g. "open-meteo"
}

interface WeatherSnapshot {
  time: number;                 // epoch ms (UTC; render in location timezone)
  temperature: number;          // °C
  apparentTemperature: number;  // "feels like" °C
  windSpeed: number;            // m/s
  windDirection: number;        // degrees (0 = North)
  precipitation: number;        // mm (rain + snow)
  precipitationType: 'none' | 'rain' | 'snow' | 'sleet' | 'hail';
  snowDepth: number;            // cm on ground (0 if none)
  humidity: number;             // 0–100%
  uvIndex: number;              // 0–11+ (UV Index)
  airQualityIndex: number | null; // US AQI 0–500; null if provider has no AQI (D09)
  cloudCover: number;           // 0–100%
  visibility: number;           // km
  weatherCode: number;          // WMO code (Open-Meteo passes through; others map to WMO)
}
```

### 1.6 DailySummary
```typescript
interface DailySummary {
  date: string;                 // YYYY-MM-DD in location timezone
  tempMin: number;              // °C
  tempMax: number;              // °C
  sunrise: number;              // epoch ms (UTC)
  sunset: number;               // epoch ms (UTC)
  precipitationSum: number;     // mm total for day
  precipitationType: 'none' | 'rain' | 'snow' | 'mixed';
  // derived from the daily WMO weather_code (dominant) — 'mixed' when daytime codes span rain + snow
  uvIndexMax: number;           // max UV during day
}
```

---

## 2. Outfit Generation

### 2.1 OutfitRequest
Input to the recommendation engine:

```typescript
interface OutfitRequest {
  weather: WeatherData;
  activity: Activity;
  person: Person;
  gender?: 'neutral' | 'masculine' | 'feminine'; // avatar styling only; MVP renders 'neutral' (D12)
}
```

### 2.2 Outfit
Engine output:

```typescript
interface Outfit {
  items: OutfitItem[];
  rationale: string;            // human-readable explanation
  confidence: number;           // 0–1 (how certain we are)
  warnings: string[];           // e.g., "UV high — apply sunscreen"
}
```

### 2.3 OutfitItem (Expanded)
```typescript
interface OutfitItem {
  category: ItemCategory;
  name: string;                 // "insulated winter boots"
  description: string;          // "waterproof, rated to −20°C"
  layer: number;                // 1 = base, 2 = mid, 3 = outer
  required: boolean;            // true = essential, false = optional (post-MVP accessories)
  avatarAsset: string;          // e.g. "/public/assets/avatar/clothing/feet/boots.svg"
}
```

> `description` is developer/QA-facing; the end-user UI never shows raw item text or
> weather numbers (D04). All user-facing strings are i18next keys (see §7).
> A photo variant (`imageUrl`) is **not modeled** in the MVP — avatars are SVG only.

---

## 3. Weather Provider Contract

All providers implement this interface:

```typescript
interface WeatherProvider {
  /** Human-readable name for UI selection */
  readonly name: string;
  /** Optional attribution text for UI footer */
  readonly attribution?: string;

  /**
   * Fetch current + today's forecast for a coordinate.
   * @param lat Latitude in decimal degrees
   * @param lon Longitude in decimal degrees
   * @returns WeatherData normalized for this provider
   */
  fetch(lat: number, lon: number): Promise<WeatherData>;
}
```

### 3.1 Provider Examples

#### OpenMeteoProvider (MVP default — free, no key, D08)
- **Forecast URL**: `https://api.open-meteo.com/v1/forecast`
- **Air quality URL**: `https://air-quality-api.open-meteo.com/v1/air-quality` (separate request, `current=us_aqi`, D09)
- **Parameters**:
  - `latitude`, `longitude`: required
  - `current` / `hourly` / `daily`: variable groups (see `docs/architecture.md` §5)
  - `timezone`: `auto` (returns the IANA timezone for the coordinates)
  - `forecast_days`: `2` (today + tomorrow; MVP shows only today, D13)
  - `temperature_unit=celsius`, `wind_speed_unit=ms`, `precipitation_unit=mm` (must be set — defaults are not the canonical units, D19)
  - `timeformat=unixtime` (epoch **seconds**; provider converts to ms)
- **Free tier**: 10,000 calls/day for **non-commercial** use, no API key (limits per Open-Meteo terms)
- **Attribution**: required under CC BY 4.0 — "Weather data by Open-Meteo.com"
- **Normalization**: visibility m→km (`÷ 1000`), snow_depth m→cm (`× 100`), timestamps s→ms (`× 1000`), AQI `us_aqi` (or `null` on failure)

#### AccuWeatherProvider (Future, keyed)
- **URL**: `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/{cityId}`
- **Requires**: API key, location key (city search first)
- **Features**: minute-by-minute forecasts, severe weather alerts
- **Status**: post-MVP (D20)

#### OpenWeatherMapProvider (Future, keyed)
- **URL**: `https://api.openweathermap.org/data/2.5/onecall`
- **Requires**: API key
- **Features**: current + hourly + daily, global coverage
- **Status**: post-MVP (D20)

---

## 4. Weather Code Normalization

`WeatherSnapshot.weatherCode` always holds a **WMO weather code**. Open-Meteo already
returns WMO codes, so it passes through unchanged; any other provider must map its raw codes
into the WMO table below. The grouping below is the canonical reference used by the whole
system (see the WMO appendix, §10).

### 4.1 precipitationType Derivation

```typescript
export type PrecipType = 'none' | 'rain' | 'snow' | 'sleet' | 'hail';
```

`precipitationType` is **derived from `weatherCode`** (not from precipitation amounts), so
all providers agree on semantics. A provider may refine with observed amounts, but the code
grouping is the source of truth.

```typescript
function derivePrecipitationType(code: number): PrecipType {
  if ([0, 1, 2, 3, 45, 48].includes(code)) return 'none';        // clear/cloudy/fog
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code)) return 'rain'; // drizzle, rain, showers, thunderstorm
  if ([56, 57, 66, 67, 83, 84].includes(code)) return 'sleet';   // freezing drizzle/rain, mixed showers
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';    // snow fall, snow grains, snow showers
  if ([96, 99].includes(code)) return 'hail';                    // thunderstorm with hail
  return 'none';                                                 // unknown codes treated as dry
}
```

### 4.2 Temperature Bands (for clothing rules)

Bands are **half-open intervals `[min, max)`** (D05): an exact boundary value belongs to the
**warmer** band. Temperatures below −30°C are still FROZEN (with an "extreme cold" warning).

```typescript
export type TempBand =
  | 'FROZEN' | 'COLD' | 'CHILLY' | 'COOL' | 'MILD' | 'WARM' | 'HOT' | 'VERY_HOT';

export function getTempBand(t: number): TempBand {
  if (t < -10) return 'FROZEN';     // lower clamp at -30 (still FROZEN below)
  if (t < 0)   return 'COLD';       // [-10, 0)
  if (t < 10)  return 'CHILLY';     // [0, 10)
  if (t < 15)  return 'COOL';       // [10, 15)
  if (t < 20)  return 'MILD';       // [15, 20)
  if (t < 25)  return 'WARM';       // [20, 25)
  if (t < 35)  return 'HOT';        // [25, 35)
  return 'VERY_HOT';                // [35, ∞)
}
```

Boundary examples: `−10 → COLD`, `0 → CHILLY`, `10 → COOL`, `15 → MILD`, `20 → WARM`,
`25 → HOT`, `35 → VERY_HOT`.

### 4.3 Condition Words (for the rationale)

The rationale never prints numbers (D04); it uses a fixed word per band (D06):

```typescript
export const CONDITION_WORDS: Record<TempBand, string> = {
  FROZEN: 'freezing', COLD: 'cold', CHILLY: 'cool', COOL: 'mildly cool',
  MILD: 'mild', WARM: 'warm', HOT: 'hot', VERY_HOT: 'very hot',
};
```

### 4.4 UV Index Levels

```typescript
export type UVMeaning = 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';

export function getUVMeaning(uv: number): UVMeaning {
  if (uv <= 2) return 'low';
  if (uv <= 5) return 'moderate';
  if (uv <= 7) return 'high';
  if (uv <= 10) return 'very_high';
  return 'extreme';
}
```

> `getUVMeaning` returns a **label**, never a number — warnings use the numeric `uvIndex`
> thresholds directly (see `docs/recommendation-rules.md` §11).

---

## 5. Recommendation Engine Logic (Pseudo-Code)

```typescript
function recommendOutfit(request: OutfitRequest): Outfit {
  const { weather, activity, person } = request;

  // 1. Get temperature band (half-open intervals, D05)
  const tempBand = getTempBand(weather.current.temperature);

  // 2. Get precipitation type (derived from WMO weatherCode, §4.1)
  const precipType = weather.current.precipitationType;

  // 3. Get UV level (label, not a number, §4.4)
  const uvMeaning = getUVMeaning(weather.current.uvIndex);

  // 4–5. Build the rule context (wind, snow depth, AQI, etc.)
  const ctx = buildRuleContext(weather, tempBand, precipType, uvMeaning);

  // 6. Apply rules in fixed order — see docs/recommendation-rules.md §13.1
  const items = recommendOutfitItems(ctx, activity, person);

  // 7. Rationale: localized, worded conditions only, no numbers (D04/D06)
  const rationale = generateRationale(ctx, items, activity);

  // 8. Confidence: deterministic deductions (§10 of recommendation-rules.md, D21)
  const confidence = calculateConfidence(ctx);

  // 9. Warnings: numeric uvIndex thresholds, not uvMeaning labels (recommendation-rules §11)
  const warnings = generateWarnings(ctx);

  return { items, rationale, confidence, warnings };
}
```

> The authoritative rule steps are in `docs/recommendation-rules.md`. This file defines the
> types and normalizations only.

---

## 6. Asset Management

### 6.1 Avatar Assets
- **Format**: SVG (scalable, lightweight)
- **Structure**: Layered parts (head, body, arms, legs) + clothing items
- **Naming**: `category_name.svg` (e.g., `feet_insulated_winter_boots.svg`)
- **Bundle**: All assets in `/public/assets/avatar/`

### 6.2 Weather & Provider Data
- The app has **no weather images** — everything visual is an SVG from §6.1
- All weather data is fetched from the configured provider and cached per D23
  (`sessionStorage`, 5-minute TTL)
- Provider metadata (display name, attribution text) is bundled in the registry — no runtime
  fetch or cache needed for it

---

## 7. Localization (i18n) Strategy

### 7.1 Language Keys
- All UI strings use `i18next` keys in format: `recommendation.rationale.temp_frozen`
- Example keys:
  - `location.search` → "Search for location"
  - `recommendation.rationale` → "It's {condition} and {weather_phrase}, so we recommend {outfit_summary} for {activity}."
  - `warnings.high_uv` → "High UV — apply sunscreen"
  - `activity.school` → "School"
- Rationale takes **condition words, not temperatures** (D04/D06, §4.3) — never interpolate a
  number into a user-facing string

### 7.2 Language Support
- **Phase 1 (MVP):** English (default) + Spanish (es) — D17
- **Roadmap:** French (fr), German (de) — D17

### 7.3 Fallback
- If a translation is missing, show the English string with a warning icon (dev-only)

---

## 8. Testing Strategy

### 8.1 Unit Tests
- Test each rule function in isolation
- Test edge cases (boundary temperatures, precipitation transitions)
- Mock weather data for all provider types

### 8.2 Integration Tests
- Test full flow: location → weather → outfit → UI
- Test activity changes for same weather
- Test person type differences

### 8.3 Visual Regression
- Snapshot tests for key UI components
- Ensure avatar rendering matches outfit items

---

## 9. Versioning & Extensibility

### 9.1 Future Provider Extensions
- Add `requiresApiKey: boolean` to provider interface
- Support multiple locations (array of coords)
- Add `updateInterval` field for scheduled refreshes

### 9.2 Rule Engine Extensibility
- Allow custom rules via config (advanced users)
- Support weighted rules (priority system)
- Add "season" modifier (spring, summer, fall, winter)

---

## 10. Appendix: WMO Weather Code Reference

Canonical grouping used by Open-Meteo and by this app's normalization (§4). This is the
**complete** code set the app must handle.

| Code(s) | Meaning | §4.1 → precipitationType |
|---------|---------|--------------------------|
| 0 | Clear sky | none |
| 1 | Mainly clear | none |
| 2 | Partly cloudy | none |
| 3 | Overcast | none |
| 45 | Fog | none |
| 48 | Depositing rime fog | none |
| 51, 53, 55 | Drizzle: light, moderate, dense | rain |
| 56, 57 | Freezing drizzle: light, dense | sleet |
| 61, 63, 65 | Rain: slight, moderate, heavy | rain |
| 66, 67 | Freezing rain: light, heavy | sleet |
| 71, 73, 75 | Snow fall: slight, moderate, heavy | snow |
| 77 | Snow grains | snow |
| 80, 81, 82 | Rain showers: slight, moderate, violent | rain |
| 83, 84 | Rain and snow showers, mixed | sleet |
| 85, 86 | Snow showers: slight, heavy | snow |
| 95 | Thunderstorm (slight or moderate, no hail) | rain |
| 96, 99 | Thunderstorm with slight / heavy hail | hail |

*Source: WMO weather interpretation codes as implemented by Open-Meteo. Codes 83/84 are in
the table for future providers; Open-Meteo itself does not emit them.*

---

## 11. Appendix: Temperature Band Definitions

Half-open intervals `[lower, upper)` (D05) — a boundary value belongs to the warmer band.

| Band | Range (°C) | Condition word (D06) | Description | Clothing Notes |
|------|------------|----------------------|-------------|----------------|
| FROZEN | `< −10` (clamp −30) | freezing | Very cold, risk of frostbite | Heavy winter coat, insulated boots, hat, gloves, face covering |
| COLD | `[−10, 0)` | cold | Cold, wind chill possible | Insulated jacket, thermal layers, waterproof boots, gloves, hat |
| CHILLY | `[0, 10)` | cool | Cool, damp conditions common | Light jacket, long sleeves, scarf, waterproof shoes |
| COOL | `[10, 15)` | mildly cool | Mildly cool, comfortable for most | Sweater or light jacket, long pants, closed shoes |
| MILD | `[15, 20)` | mild | Pleasant, spring/fall weather | T-shirt + light jacket, jeans, sneakers |
| WARM | `[20, 25)` | warm | Warm, summer-like | T-shirt, shorts/light pants, sandals/sneakers |
| HOT | `[25, 35)` | hot | Hot, sunny | Light clothing, hat, sunscreen |
| VERY_HOT | `≥ 35` | very hot | Very hot, potential heat stress | Minimal clothing, wide-brim hat, high SPF sunscreen, hydration reminder |

---

## 12. Appendix: Activity-Specific Rules (Examples)

> Full activity rules live in `docs/recommendation-rules.md` §7; this is a summary.

### 12.1 School Activity
- Conservative: wear full coverage (long sleeves, pants)
- If cold: add thermal base layer
- If warm: short sleeves OK, but keep light jacket for classroom AC

### 12.2 Playground Activity
- Minimal layers: breathable fabrics
- If cold: warm jacket but allow removal
- If rain: waterproof outer layer, quick-dry base

### 12.3 Sport Activity
- Technical fabrics: moisture-wicking, stretchy
- If cold: thermal base layer under athletic wear
- If rain: windbreaker with ventilation

### 12.4 Commute Activity
- Prepare for transitions: layering system
- If rain/snow: waterproof outer layer + compact umbrella (post-MVP accessory)
- If cold: insulated coat with hood, warm accessories

---

## 13. Appendix: Sample Outfit Generation (Cold Day)

**Weather**: −12°C, snowing, wind 15 km/h, UV 2 (low) → band **FROZEN**, precip **snow**  
**Activity**: school  
**Person**: child  

**Outfit**:
1. **base** → thermal underwear (layer 1) - required
2. **mid** → thermal shirt + fleece/wool layer (layer 2) - required
3. **outer** → heavy winter coat (layer 3) - required
4. **legs** → snow pants + thermal leggings (layer 2) - required
5. **feet** → insulated winter boots (layer 3) - required
6. **head** → knit hat (layer 1) - required
7. **hands** → insulated mittens + glove liners (layer 2) - required

**Rationale**: "It's freezing and snowing, so we recommend a full winter outfit for school.
Warm layers to keep dry and protected." *(worded conditions only — no numbers, D04)*

**Warnings**: ["Extreme cold — limit outdoor exposure"] (FROZEN band warning; UV 2 is low)

---

## 14. Appendix: Sample Outfit Generation (Warm Day)

**Weather**: 28°C, sunny, wind 5 km/h, UV 8 (very high) → band **HOT**, precip **none**  
**Activity**: playground  
**Person**: adult  

**Outfit**:
1. **base** → t-shirt (layer 1) - required
2. **legs** → shorts (layer 1) - required
3. **feet** → sneakers (layer 1) - required (playground requires closed-toe)
4. **head** → sun hat (layer 1) - required (UV ≥ 8)
5. **hands** → UV sunglasses (layer 1) - required (UV ≥ 8)

**Rationale**: "It's hot and sunny with very high UV, so wear light, breathable clothing. A hat
and sunglasses will help with sun protection." *(worded conditions only — no numbers, D04)*

**Warnings**: ["Very high UV — apply sunscreen, wear a wide-brim hat and sunglasses"]

---

## 15. Appendix: Avatar Asset Structure

```
/public/
└── assets/
    └── avatar/
        ├── base/
        │   ├── body.svg
        │   ├── head.svg
        │   └── ... (other base parts)
        ├── clothing/
        │   ├── base/
        │   │   ├── underwear.svg
        │   │   └── tshirt.svg
        │   ├── mid/
        │   │   ├── sweater.svg
        │   │   └── hoodie.svg
        │   ├── outer/
        │   │   ├── jacket.svg
        │   │   └── raincoat.svg
        │   ├── feet/
        │   │   ├── sneakers.svg
        │   │   └── boots.svg
        │   ├── head/
        │   │   ├── cap.svg
        │   │   └── hood.svg
        │   ├── hands/
        │   │   ├── gloves.svg
        │   │   └── mittens.svg
        │   └── legs/
        │       ├── pants.svg
        │       └── leggings.svg
        └── accessories/
            ├── scarf.svg
            ├── umbrella.svg
            └── sunglasses.svg
```

**Naming convention**: within each category folder, files are `{item-slug}.svg`
(e.g., `clothing/feet/boots.svg`). Full asset path = `/public/assets/avatar/{...}`.

---

## 16. Appendix: Build & Deployment Checklist

- [ ] SPA built with Vite + React + TypeScript (D02)
- [ ] All SVG assets optimized (only SVG — no photos, D11)
- [ ] Service worker configured for offline assets (MVP; installable PWA post-MVP, D16)
- [ ] i18n ready with JSON locale files — Phase 1 EN + ES (D17)
- [ ] Responsive design tested on mobile devices
- [ ] Privacy line + provider/OSM attributions shown in the footer (D08/D10)
- [ ] No API keys in the MVP; future keyed providers keep keys in `localStorage` only (D20)
- [ ] Open-Meteo as default provider (non-commercial, no key, D08)
- [ ] Documentation updated in `/docs/` (decisions in `docs/decisions.md`)

---

## 17. Resolved Decisions

Every item that used to be listed as an open question is now decided (D01–D24). Summary:

| Topic | Decision | ID |
|-------|----------|-----|
| Avatar illustration style | Flat, minimal, layered SVG — in-house | D11 |
| Asset sourcing | Draw in-house; bundled in-repo under MIT | D11 |
| Multi-language support | Phase 1 EN + ES; FR, DE roadmap | D17 |
| Performance optimization | In-MVP: avatar SVGs are lazy-loaded; single-purpose bundles | D02 |
| Testing framework | Vitest + React Testing Library + Playwright | D03 |
| Weather numbers in UI | Never shown; worded rationale only | D04 |
| Temperature bands | Half-open `[lower, upper)`; boundaries warmer | D05 |
| Air quality | Open-Meteo Air Quality API; nullable US AQI | D09 |
| API keys | None in MVP; `localStorage` only later | D20 |

---

This document defines the complete data model and normalization contract for the Mom
Recommends SPA. All components are provider-agnostic, privacy-first, and use the canonical
units and decisions recorded in `docs/decisions.md`.