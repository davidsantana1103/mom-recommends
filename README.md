# Mom Recommends

> **A privacy-first, single-page web app that tells parents and kids what to wear today — shown with images, not weather numbers.**

---

## What is Mom Recommends?

Mom Recommends solves a simple, universal problem: **"What should I wear today?"**

Instead of asking parents and children to interpret temperature, wind speed, precipitation, and UV levels, the app immediately shows a **complete, visual outfit recommendation** — a kid (or adult) dressed for the day — based on real-time weather conditions for their location.

**Example:** If it's −10°C outside, snowing with a wind chill of −15°C, the app shows a child wearing insulated winter boots, snow pants, a heavy winter jacket, a knit hat, and warm mittens. Parents and kids decide by **looking**, not by reading.

---

## Key Ideas

- **Visual-first**: No weather charts, no numbers, just an outfit
- **Rule-based**: Clear, explainable logic (not a black box AI)
- **Privacy-first**: No accounts, no tracking, no data collection
- **Provider-independent**: Works with Open-Meteo (free, no key) or any other weather API
- **Activity-aware**: Different recommendations for school, playground, sports, commute, or general
- **Kids + adults**: Works for both children and adults with generated avatars
- **Single-day focus**: Don't over-plan; just today's outfit
- **Localization ready**: English default, structured for translation

---

## How It Works

1. **Location**: App detects your location (browser geolocation or manual search)
2. **Weather**: Calls a weather provider API (default: Open-Meteo — free, no API key)
3. **Recommendation**: Rule engine analyzes temperature, rain/snow, wind, UV, humidity, air quality, and your selected activity
4. **Visual**: Generated avatar is composed with the recommended clothing items
5. **Explain**: Short rationale shows why this outfit was chosen
6. **Warn**: Optional warnings (sun protection, heat, poor air quality)

---

## App Features

### Core Features (MVP)
- [x] **Location-based weather** (auto-detect + manual search)
- [x] **Single-day outfit recommendation** with generated avatar
- [x] **Rule-based recommendation engine** (transparent logic)
- [x] **Activity selection** (school, playground, walk, sport, commute, general)
- [x] **Person selection** (child / adult)
- [x] **Weather variable awareness**: temperature, precipitation, wind, UV, humidity, air quality
- [x] **Privacy-first design**: no accounts, no tracking, no data collection
- [x] **Responsive web design**: works on mobile and desktop
- [x] **Provider abstraction**: plug in any weather API
- [x] **English** with i18n-ready structure

### Planned / Future Features
- [ ] Multi-day outfit preview (7-day carousel)
- [ ] Accessories (scarf, umbrella, sunglasses as optional items)
- [ ] Additional language support (ES, FR, DE)
- [ ] Customization of avatar colors / styles (v2 — not in MVP)
- [ ] PWA install support
- [ ] Accessibility improvements (high contrast, screen reader descriptions)
- [ ] Additional weather providers (AccuWeather, OpenWeatherMap, NWS)

---

## Project Structure

```
/workspace/project/mom-recommends/
├── docs/                        # Documentation
│   ├── architecture.md          # System architecture, components, deployment
│   ├── data-models.md           # Data types, weather provider contract
│   ├── recommendation-rules.md  # Rule engine logic, temperature bands
│   ├── privacy.md               # Privacy policy, data handling
│   └── (legacy) index.html, .drawio
├── README.md                    # This file
├── .gitignore
├── pom.xml                      # Legacy Java project (preserved for reference)
├── src/                         # Legacy Java source (preserved)
│   ├── main/java/com/recommendations/
│   │   ├── ConsumingRestApplication.java
│   │   ├── Forecast.java
│   │   └── ScheduledTasks.java
│   └── main/resources/application.yml
└── (new frontend code)          # To be created as SPA
```

---

## Technology Overview

### Current Design (Planned)
- **Frontend**: React + TypeScript + Vite (single-page application)
- **Styling**: CSS Modules or Tailwind CSS with design tokens
- **State**: React Context / Zustand (lightweight)
- **Routing**: React Router (home, search, settings, about)
- **i18n**: i18next with JSON locale files
- **Weather APIs**: Provider abstraction (Open-Meteo default, easily extensible)
- **Avatar**: SVG layer composition (generated, no customization in MVP)
- **Testing**: Vitest + React Testing Library + Playwright

### Legacy Code (Preserved)
The existing Java Spring Boot project (`pom.xml`, `src/main/java/...`) previously fetched AccuWeather on a schedule and logged results. **This architecture is superseded.** The new design is frontend-only, calling weather APIs directly from the browser, with no server needed.

---

## Weather Variables We Use

| Variable | Source | How We Use It |
|----------|--------|---------------|
| Temperature | Weather API | Main driver for clothing layers |
| Apparent temperature (feels like) | Weather API | Wind chill / heat index consideration |
| Precipitation (rain/snow) | Weather API | Add raincoats, snow pants, waterproof boots |
| Precipitation type | Weather API | Distinguish rain from snow |
| Snow depth | Weather API | Check ground snow for boot/pant selection |
| Wind speed | Weather API | Add windproof layers above 8 m/s |
| Humidity | Weather API | Consider moisture-wicking fabrics |
| UV Index | Weather API | Add sun hat / sunglasses when high |
| Air Quality Index | Weather API | Warn when poor, suggest indoor time |
| Visibility | Weather API | Consider conditions for outdoor play |
| Cloud cover | Weather API | Adjust sun protection recommendations |

---

## Recommendation Examples

### Winter — Snowing, Cold
- **Weather**: −10°C, snow, wind 15 km/h, UV 2
- **Activity**: School
- **Person**: Child
- **Outfit**: Insulated winter jacket, snow pants, thermal underwear, insulated boots, knit hat, warm mittens, scarf
- **Rationale**: "It's −10°C and snowing — full winter outfit for school."

### Spring — Rainy, Cool
- **Weather**: 8°C, rain, wind 10 km/h, UV 4
- **Activity**: Commute
- **Person**: Adult
- **Outfit**: Raincoat over long-sleeve shirt, long pants, waterproof boots
- **Rationale**: "It's 8°C and raining — raincoat with waterproof boots."

### Summer — Hot, Sunny
- **Weather**: 28°C, sunny, UV 8, no rain
- **Activity**: Playground
- **Person**: Child
- **Outfit**: T-shirt, shorts, sneakers, sun hat
- **Warnings**: "High UV — apply sunscreen, wear hat"

---

## Design Principles

1. **One Screen, One Answer**: Users should know the outfit in under 2 seconds
2. **Visual Over Text**: Images first, explanations second, numbers never
3. **No Confusion**: No weather variables shown — only what to wear
4. **No Accounts**: No signup, no login, no personal data
5. **No Tracking**: No analytics, no cookies, no fingerprints
6. **Works Everywhere**: Mobile-first, responsive, PWA-ready

---

## Getting Started (Future Development)

```bash
# Clone
# Navigate to project root
# Install dependencies (when created)
npm install

# Development
npm run dev

# Build (static files for hosting)
npm run build
```

The app will be deployed as static files to Netlify / Vercel / Cloudflare Pages — no server required.

---

## Documentation

| Document | Purpose |
|----------|---------|
| `docs/architecture.md` | System design, components, data flow |
| `docs/data-models.md` | Type definitions, weather provider interface |
| `docs/recommendation-rules.md` | Clothing rules by temperature/activity/person |
| `docs/privacy.md` | Privacy policy, data handling |
| `README.md` | This file — overview, vision, examples |

---

## License

This is a planning and documentation project. Implementation code will follow an open-source license (TBD — MIT or Apache-2.0 recommended for privacy-focused apps).

---

**Status**: Planning / Design Phase  
**Last Updated**: 2025-10-22  
**Version**: 0.1.0

---

Made with privacy in mind. No accounts. No tracking. Just what to wear.