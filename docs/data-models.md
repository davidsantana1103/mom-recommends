# Mom Recommends — Data Models

> **Status**: Draft (v0.1)  
> **Last updated**: 2025-10-22  
> **Audience**: Developers, testers, documentation readers

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
  | 'accessory' // scarf, umbrella, sunglasses (v2)
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
All providers output this standardized format:

```typescript
interface WeatherData {
  location: {
    lat: number;
    lon: number;
    name: string;               // human-readable location name
    timezone: string;           // IANA timezone, e.g. "America/New_York"
  };
  current: WeatherSnapshot;
  hourly: WeatherSnapshot[];    // next 24–48 hours
  daily: DailySummary;          // today's min/max, sunrise/sunset
  fetchedAt: number;            // epoch ms when fetched
  provider: string;             // e.g. "open-meteo"
}

interface WeatherSnapshot {
  time: number;                 // epoch ms (hour start)
  temperature: number;          // °C (Celsius preferred)
  apparentTemperature: number;  // "feels like" °C
  windSpeed: number;            // m/s
  windDirection: number;        // degrees (0 = North)
  precipitation: number;        // mm (rain + snow)
  precipitationType: 'none' | 'rain' | 'snow' | 'sleet' | 'hail';
  snowDepth: number;            // cm on ground (0 if none)
  humidity: number;             // 0–100%
  uvIndex: number;              // 0–11+ (UV Index)
  airQualityIndex: number;      // 0–500 (US AQI) or provider-specific
  cloudCover: number;           // 0–100%
  visibility: number;           // km
  weatherCode: number;          // WMO code (normalized)
  fetchedAt: number;            // epoch ms
}
```

### 1.6 DailySummary
```typescript
interface DailySummary {
  date: string;                 // YYYY-MM-DD in location timezone
  tempMin: number;              // °C
  tempMax: number;              // °C
  sunrise: number;              // epoch ms (local time)
  sunset: number;               // epoch ms (local time)
  precipitationSum: number;     // mm total for day
  precipitationType: 'none' | 'rain' | 'snow' | 'mixed';
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
  gender?: 'neutral' | 'masculine' | 'feminine'; // for avatar styling only
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
  description: string;          // "waterproof, rated to -20°C"
  layer: number;                // 1 = base, 2 = mid, 3 = outer
  required: boolean;            // true = essential, false = optional
  avatarAsset: string;          // e.g. "/assets/avatar/boots.svg"
  imageUrl?: string;            // optional photo for display (future)
}
```

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

#### OpenMeteoProvider (Free, No Key)
- **URL**: `https://api.open-meteo.com/v1/forecast`
- **Parameters**:
  - `latitude`, `longitude`: required
  - `current`: temperature, wind, etc.
  - `hourly`: detailed hourly forecast
  - `daily`: daily summary
  - `timezone`: auto-detect
  - `forecast_days`: 2 (today + tomorrow)
- **Free tier**: 10,000 requests/day, no API key needed

#### AccuWeatherProvider (Future)
- **URL**: `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/{cityId}`
- **Requires**: API key, city ID
- **Features**: Minute-by-minute, severe weather alerts

#### OpenWeatherMapProvider (Future)
- **URL**: `https://api.openweathermap.org/data/2.5/onecall`
- **Requires**: API key
- **Features**: Current + hourly + daily, global coverage

---

## 4. Weather Code Normalization

We map provider-specific weather codes to a **unified set** for consistent logic:

| Provider | Raw Code | Normalized Meaning |
|----------|----------|---------------------|
| Open-Meteo | 0 | clear sky |
| Open-Meteo | 1 | mainly clear |
| Open-Meteo | 2 | partly cloudy |
| Open-Meteo | 3 | overcast |
| Open-Meteo | 45 | fog |
| Open-Meteo | 48 | depositing rime fog |
| Open-Meteo | 51 | light drizzle |
| Open-Meteo | 61 | light rain |
| Open-Meteo | 80 | rain showers |
| Open-Meteo | 95 | thunderstorm |
| Open-Meteo | 85 | snow fall |
| Open-Meteo | 86 | snow grains |
| Open-Meteo | 88 | ice pellets |
| Open-Meteo | 98 | thunderstorm with snow |

### 4.1 Temperature Bands (for clothing rules)
```typescript
export const TEMP_BANDS = {
  FROZEN: { min: -30, max: -11 },        // -30°C to -11°C
  COLD: { min: -10, max: 0 },            // -10°C to 0°C
  CHILLY: { min: 0, max: 10 },           // 0°C to 10°C
  COOL: { min: 10, max: 15 },            // 10°C to 15°C
  MILD: { min: 15, max: 20 },            // 15°C to 20°C
  WARM: { min: 20, max: 25 },            // 20°C to 25°C
  HOT: { min: 25, max: 35 },             // 25°C to 35°C
  VERY_HOT: { min: 35, max: 45 },        // 35°C to 45°C+
};
```

### 4.2 Precipitation Type Mapping
- `'none'` → no precipitation
- `'rain'` → liquid rain
- `'snow'` → solid precipitation
- `'sleet'` → mixed rain/snow
- `'hail'` → ice pellets
- `'mixed'` → precipitationSum > 0 but type ambiguous

### 4.3 UV Index Interpretation
```typescript
export const UV_MEANING = {
  LOW: 0,  // 0-2: minimal risk
  MODERATE: 3,  // 3-5: moderate risk
  HIGH: 6,    // 6-7: high risk
  VERY_HIGH: 8, // 8-10: very high risk
  EXTREME: 11+  // 11+: extreme risk
};
```

---

## 5. Recommendation Engine Logic (Pseudo-Code)

```typescript
function recommendOutfit(request: OutfitRequest): Outfit {
  const { weather, activity, person } = request;
  
  // 1. Get temperature band
  const tempBand = getTempBand(weather.current.temperature);
  
  // 2. Get precipitation type
  const precipType = weather.current.precipitationType;
  
  // 3. Get UV level
  const uvMeaning = getUVMeaning(weather.current.uvIndex);
  
  // 4. Activity modifiers
  const activityModifiers = getActivityModifiers(activity);
  
  // 5. Person modifiers
  const personModifiers = getPersonModifiers(person);
  
  // 6. Apply rules (see docs/recommendation-rules.md)
  const items = applyClothingRules({
    tempBand,
    precipType,
    uvMeaning,
    activityModifiers,
    personModifiers,
    weather: weather
  });
  
  // 7. Generate rationale
  const rationale = generateRationale({
    tempBand,
    precipType,
    uvMeaning,
    activityModifiers,
    personModifiers,
    weather: weather
  });
  
  // 8. Confidence (simple heuristic)
  const confidence = calculateConfidence({ tempBand, precipType, uvMeaning, activityModifiers });
  
  // 9. Warnings
  const warnings = generateWarnings({
    uvMeaning,
    precipType,
    tempBand
  });
  
  return { items, rationale, confidence, warnings };
}
```

---

## 6. Asset Management

### 6.1 Avatar Assets
- **Format**: SVG (scalable, lightweight)
- **Structure**: Layered parts (head, body, arms, legs) + clothing items
- **Naming**: `category_name.svg` (e.g., `feet_insulated_winter_boots.svg`)
- **Bundle**: All assets in `/public/assets/avatar/`

### 6.2 Weather Asset CDN
- All weather data is fetched from public APIs
- No local caching of weather images (real-time only)
- Optional: cache provider metadata (provider name, attribution)

---

## 7. Localization (i18n) Strategy

### 7.1 Language Keys
- All UI strings use `i18next` keys in format: `recommendation.rationale.temp_cold`
- Example keys:
  - `location.search` → "Search for location"
  - `recommendation.rationale` → "It's {temp}°C and {condition}, so we recommend..."
  - `warnings.high_uv` → "High UV index — apply sunscreen"
  - `activity.school` → "School"

### 7.2 Language Support (Phase 1)
- English (default)
- Spanish (es)
- French (fr)
- German (de)

### 7.3 Fallback
- If translation missing, show English with warning icon

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

| Code | Meaning | Notes |
|------|---------|-------|
| 0 | clear sky | day/night distinction in Open-Meteo |
| 1 | mostly clear | few clouds |
| 2 | partly cloudy | scattered clouds |
| 3 | overcast | cloudy all day |
| 45 | fog | visibility < 1km |
| 48 | depositing rime fog | fog with freezing droplets |
| 51 | light drizzle | very light rain |
| 53 | moderate drizzle | medium intensity |
| 55 | heavy drizzle | strong drizzle |
| 56 | light freezing drizzle | drizzle with freezing rain |
| 57 | heavy freezing drizzle | intense freezing drizzle |
| 61 | light rain | 0.1–2.9 mm/h |
| 63 | moderate rain | 2.9–6.1 mm/h |
| 65 | heavy rain | >6.1 mm/h |
| 66 | light freezing rain | rain with freezing droplets |
| 67 | heavy freezing rain | intense freezing rain |
| 68 | light snow | 0.1–2.9 mm/h |
| 69 | moderate snow | 2.9–6.1 mm/h |
| 70 | heavy snow | >6.1 mm/h |
| 71 | light snow shower | brief, light snow |
| 69 | moderate snow shower | brief, medium snow |
| 77 | snow grains | small ice particles |
| 75 | squall | sudden gusty wind with rain/snow |
| 76 | squall with snow grains | |
| 78 | squall with rain | |
| 95 | thunderstorm | rain + lightning |
| 96 | thunderstorm with slight hail | |
| 99 | thunderstorm with heavy hail | |

*Source: WMO Weather Codes (international standard)*

---

## 11. Appendix: Temperature Band Definitions

| Band | Range (°C) | Description | Clothing Notes |
|------|------------|-------------|----------------|
| FROZEN | -30 to -11 | Very cold, risk of frostbite | Heavy winter coat, insulated boots, hat, gloves, face covering |
| COLD | -10 to 0 | Cold, wind chill possible | Insulated jacket, thermal layers, waterproof boots, gloves, hat |
| CHILLY | 0 to 10 | Cool, damp conditions common | Light jacket, long sleeves, scarf, waterproof shoes |
| COOL | 10 to 15 | Mildly cool, comfortable for most | Sweater or light jacket, long pants, closed shoes |
| MILD | 15 to 20 | Pleasant, spring/fall weather | T-shirt + light jacket, jeans, sneakers |
| WARM | 20 to 25 | Warm, summer-like | T-shirt, shorts/light pants, sandals/sneakers |
| HOT | 25 to 35 | Hot, sunny | Light clothing, hat, sunscreen |
| VERY_HOT | 35+ | Very hot, potential heat stress | Minimal clothing, wide-brim hat, high SPF sunscreen, hydration reminder |

---

## 12. Appendix: Activity-Specific Rules (Examples)

### 2.1 School Activity
- Conservative: wear full coverage (long sleeves, pants)
- If cold: add thermal base layer
- If warm: short sleeves OK, but keep light jacket for classroom AC

### 2.1 Playground Activity
- Minimal layers: breathable fabrics
- If cold: warm jacket but allow removal
- If rain: waterproof outer layer, quick-dry base

### 2.1 Sport Activity
- Technical fabrics: moisture-wicking, stretchy
- If cold: thermal base layer under athletic wear
- If rain: windbreaker with ventilation

### 2.1 Commute Activity
- Prepare for transitions: layering system
- If rain/snow: waterproof outer layer + compact umbrella
- If cold: insulated coat with hood, warm accessories

---

## 13. Appendix: Sample Outfit Generation (Cold Day)

**Weather**: -12°C, snowing, wind 15 km/h, UV 2 (low)  
**Activity**: school  
**Person**: child  

**Outfit**:
1. **base** → thermal underwear (layer 1) - required
2. **mid** → long-sleeve thermal shirt (layer 2) - required
3. **outer** → insulated winter jacket (layer 3) - required
4. **legs** → snow pants (layer 2) - required
5. **feet** → insulated winter boots (layer 3) - required
6. **head** → knit hat (layer 1) - required
7. **hands** → winter gloves (layer 2) - required

**Rationale**: "It's -12°C and snowing, so we recommend a full winter outfit for school. Warm layers to stay dry and protected."

**Warnings**: [] (UV is low)

---

## 14. Appendix: Sample Outfit Generation (Warm Day)

**Weather**: 28°C, sunny, UV 8 (very high), no precipitation  
**Activity**: playground  
**Person**: adult  

**Outfit**:
1. **base** → t-shirt (layer 1) - required
2. **mid** → light shorts (layer 1) - required
3. **feet** → sneakers (layer 1) - required
4. **head** → baseball cap (layer 1) - optional
5. **hands** → sunglasses (layer 1) - optional
6. **legs** → jeans or shorts - required

**Rationale**: "It's 28°C and sunny with very high UV, so wear light, breathable clothing. A cap and sunglasses will help with sun protection."

**Warnings**: ["High UV index — apply sunscreen", "Wear a hat for extra sun protection"]

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

**Naming convention**: `{category}_{item_name}.svg`  
**Example**: `feet_insulated_winter_boots.svg`

---

## 16. Appendix: Build & Deployment Checklist

- [ ] SPA built with Vite + React + TypeScript
- [ ] All assets optimized (SVG compression, image WebP)
- [ ] Service worker configured for offline support
- [ ] i18n ready with JSON locale files
- [ ] Responsive design tested on mobile devices
- [ ] Privacy policy displayed on first load (no tracking)
- [ ] No API keys hardcoded (user-configurable in Settings)
- [ ] Open-Meteo as default provider (no key required)
- [ ] Documentation updated in `/docs/`

---

## 17. Open Questions

| Topic | Status | Notes |
|-------|--------|-------|
| Avatar illustration style | Decided | Flat SVG layers (simple, scalable) |
| Asset sourcing | To-do | Need to create or license SVG set |
| Multi-language support | Planned | Start with EN + ES |
| Performance optimization | In-progress | Lazy-load avatar assets |
| Testing framework | Planned | Vitest + React Testing Library |

---

This document defines the complete data model and architecture for the Mom Recommends SPA. All components are designed to be provider-agnostic, privacy-first, and easy to extend.