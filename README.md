# Mom Recommends

> **A privacy-first, single-page web app that tells parents and kids what to wear today — shown with images, not weather numbers.**

---

## What is Mom Recommends?

Mom Recommends solves a simple, universal problem: **"What should I wear today?"**

Instead of asking parents and children to interpret temperature, wind speed, precipitation, and UV levels, the app immediately shows a **complete, visual outfit recommendation** — a kid (or adult) dressed for the day — based on real-time weather conditions for their location.

**Example:** If it's −10°C outside, snowing with a wind chill of −15°C, the app shows a child wearing an insulated jacket, snow pants, insulated boots, a knit hat, and warm mittens. Parents and kids decide by **looking**, not by reading.

---

## Key Ideas

- **Visual-first**: No weather charts, no numbers, just an outfit
- **Rule-based**: Clear, explainable logic (not a black box AI)
- **Privacy-first**: No accounts, no tracking, no data collection
- **Provider-independent**: Works with Open-Meteo (free, no key) or any other weather API
- **Activity-aware**: Different recommendations for school, playground, walk, sports, commute, or general
- **Kids + adults**: Works for both children and adults with generated avatars
- **Single-day focus**: Don't over-plan; just today's outfit (multi-day is post-MVP)
- **Localization ready**: English + Spanish in Phase 1, French and German on the roadmap

---

## How It Works

1. **Location**: App detects your location (browser geolocation or manual search)
2. **Weather**: Calls a weather provider API (default: Open-Meteo — free for non-commercial use, no API key)
3. **Recommendation**: Rule engine analyzes temperature, rain/snow, wind, UV, humidity, air quality, and your selected activity
4. **Visual**: Generated avatar is composed with the recommended clothing items
5. **Explain**: Short rationale shows why this outfit was chosen — in words, never numbers
6. **Warn**: Optional warnings (sun protection, heat, poor air quality)

---

## App Features

### Core Features (MVP)
- [x] **Location-based weather** (auto-detect + manual search; no IP geolocation)
- [x] **Single-day outfit recommendation** with generated avatar
- [x] **Rule-based recommendation engine** (transparent logic)
- [x] **Activity selection** (school, playground, walk, sport, commute, general)
- [x] **Person selection** (child / adult)
- [x] **Weather variable awareness**: temperature, precipitation, wind, UV, humidity, air quality
- [x] **Privacy-first design**: no accounts, no tracking, no data collection
- [x] **Responsive web design**: works on mobile and desktop
- [x] **Provider abstraction**: plug in any weather API
- [x] **Accessibility**: screen-reader outfit descriptions, AA contrast, high-contrast mode
- [x] **Localization**: English + Spanish (i18next-ready structure)

### Planned / Future Features
- [ ] Multi-day outfit preview (7-day carousel) — post-MVP
- [ ] Accessories (scarf, umbrella, sunglasses as optional items) — post-MVP
- [ ] Additional language support (FR, DE)
- [ ] Customization of avatar colors / styles (v2 — not in MVP)
- [ ] PWA install support (install prompt / manifest) — post-MVP
- [ ] Saved / favorite locations — post-MVP
- [ ] Additional weather providers (AccuWeather, OpenWeatherMap, NWS — all keyed)

---

## Project Structure

```
mom-recommends/
├── docs/                        # Documentation
│   ├── decisions.md             # Design decision log (D01–D24) — resolves all open questions
│   ├── architecture.md          # System architecture, components, deployment
│   ├── data-models.md           # Data types, weather provider contract, WMO codes
│   ├── recommendation-rules.md  # Rule engine logic, temperature bands, examples
│   └── privacy.md               # Privacy policy, data handling
├── README.md                    # This file
└── .gitignore
```

> The legacy Java Spring Boot backend (`pom.xml`, `src/main/java/...`) was removed during
> the planning cleanup. The new design is **frontend-only** — the app calls weather APIs
> directly from the browser and needs no server.

---

## Technology Overview

### Current Design (Decided — see `docs/decisions.md`)
- **Frontend**: React + TypeScript + Vite (single-page application)
- **Styling**: Tailwind CSS with CSS-variable design tokens
- **State**: Zustand (weather, outfit, settings)
- **Routing**: React Router (home, search, settings, about)
- **i18n**: i18next with JSON locale files (Phase 1: EN + ES)
- **Icons**: lucide-react
- **Weather APIs**: Provider abstraction (Open-Meteo default — forecast + air quality)
- **Avatar**: In-house flat SVG layer composition (generated, no customization in MVP)
- **Testing**: Vitest + React Testing Library + Playwright

---

## Weather Variables We Use

| Variable | Source | How We Use It |
|----------|--------|---------------|
| Temperature | Open-Meteo forecast | Main driver for clothing layers |
| Apparent temperature (feels like) | Open-Meteo forecast | Wind chill / heat index consideration |
| Precipitation (rain/snow) | Open-Meteo forecast | Add raincoats, snow pants, waterproof boots |
| Precipitation type | Derive from WMO weather code | Distinguish rain from snow |
| Snow depth | Open-Meteo forecast | Ground snow for boot/pant selection |
| Wind speed | Open-Meteo forecast | Add windproof layers above 8 m/s |
| Humidity | Open-Meteo forecast | Moisture-wicking fabric considerations |
| UV Index | Open-Meteo forecast | Sun hat / sunglasses when high |
| Air Quality Index | Open-Meteo Air Quality API (`us_aqi`) | Warn when poor, suggest indoor time |
| Visibility | Open-Meteo forecast | Conditions for outdoor play |
| Cloud cover | Open-Meteo forecast | Adjust sun-protection guidance |

All variables are **internal inputs only** — they are never displayed to the user (the UI
shows the outfit and a worded rationale, no numbers).

---

## Recommendation Examples

### Winter — Snowing, Cold
- **Weather**: −10°C, snowing, wind 15 km/h, UV 2 → band **COLD** + snow
- **Activity**: School
- **Person**: Child
- **Outfit**: Thermal underwear, long-sleeve shirt, sweater, insulated jacket, snow pants, insulated boots, knit hat, waterproof mittens, scarf (optional)
- **Rationale**: "It's cold and snowing — full winter outfit for school."
- **Warnings**: —

### Spring — Rainy, Cool
- **Weather**: 8°C, rain, wind 10 km/h, UV 4 → band **CHILLY** + rain
- **Activity**: Commute
- **Person**: Adult
- **Outfit**: Long-sleeve shirt, raincoat, long pants, waterproof boots
- **Rationale**: "It's cool and raining — raincoat with waterproof boots."
- **Warnings**: "Moderate UV — sunscreen recommended"

### Summer — Hot, Sunny
- **Weather**: 28°C, sunny, UV 8, no rain → band **HOT**
- **Activity**: Playground
- **Person**: Child
- **Outfit**: T-shirt, shorts, sneakers, sun hat, UV sunglasses
- **Rationale**: "It's hot and sunny with very high UV — wear light, breathable clothing with a hat and sunglasses."
- **Warnings**: "Very high UV — apply sunscreen, wear a wide-brim hat and sunglasses"

> Rationales use **words, not numbers** (see Design Principles and `docs/decisions.md` D04).

---

## Design Principles

1. **One Screen, One Answer**: Users should know the outfit in under 2 seconds
2. **Visual Over Text**: Images first, explanations second, numbers never (rationales use
   worded conditions — `docs/decisions.md` D04)
3. **No Confusion**: No weather variables shown — only what to wear
4. **No Accounts**: No signup, no login, no personal data
5. **No Tracking**: No analytics, no cookies, no fingerprints
6. **Works Everywhere**: Mobile-first, responsive, offline-capable (Service Worker in MVP;
   installable PWA is post-MVP)

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
| `docs/decisions.md` | **Decision log (D01–D24)** — every previously open question, resolved |
| `docs/architecture.md` | System design, components, data flow, provider details |
| `docs/data-models.md` | Type definitions, WMO codes, temperature bands |
| `docs/recommendation-rules.md` | Clothing rules by temperature/activity/person |
| `docs/privacy.md` | Privacy policy, data handling |
| `README.md` | This file — overview, vision, examples |

---

## License

This is a planning and documentation project. The app code, bundled avatar assets, and
documentation are released under the **MIT License** (`docs/decisions.md` D01).
Weather data is CC BY 4.0 (via Open-Meteo) and map data is ODbL (via OpenStreetMap);
attribution is displayed in the app footer.

---

**Status**: Planning / Design Phase  
**Last Updated**: 2026-10-22  
**Version**: 0.1.0

---

Made with privacy in mind. No accounts. No tracking. Just what to wear.