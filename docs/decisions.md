# Mom Recommends — Design Decision Log

> **Status**: Active
> **Last updated**: 2026-10-22
> **Audience**: Developers, designers, product stakeholders

This document records **every design and product decision** that was previously an open
question or an inconsistency in the planning docs. Each decision is binding for the MVP
unless explicitly marked as post-MVP. See the related planning docs for full context:

- `docs/architecture.md` — system design
- `docs/data-models.md` — types and provider contract
- `docs/recommendation-rules.md` — rule engine
- `docs/privacy.md` — privacy policy

---

## Decision Index

| ID  | Topic | Decision (short) |
|-----|-------|------------------|
| D01 | License | App code, avatar assets, and docs are **MIT**. |
| D02 | Frontend stack | React + TypeScript + Vite; **Zustand**; **Tailwind CSS** with design tokens; **lucide-react**; **date-fns-tz**; **i18next**. |
| D03 | Testing | **Vitest + React Testing Library + Playwright**. |
| D04 | Weather numbers in UI | **Never shown.** Rationale uses worded conditions; °C is the internal canonical unit; no °C/°F setting in MVP. |
| D05 | Temperature band boundaries | **Half-open bands** `[lower, upper)`; an exact boundary value belongs to the warmer band. |
| D06 | Rationale condition words | FROZEN=`freezing`, COLD=`cold`, CHILLY=`cool`, COOL=`mildly cool`, MILD=`mild`, WARM=`warm`, HOT=`hot`, VERY_HOT=`very hot`. |
| D07 | Location detection | **No IP geolocation.** Order: browser Geolocation → manual search. |
| D08 | Weather provider | **Open-Meteo free API** (non-commercial, ≤ 10,000 calls/day). Attribution required (CC BY 4.0). |
| D09 | Air quality | Open-Meteo **Air Quality API** (`us_aqi`); normalized as **nullable** US AQI. |
| D10 | Geocoding | OpenStreetMap **Nominatim**; valid `User-Agent`; attribution required; ≤ 1 req/s; results cached. |
| D11 | Avatar style | **Flat, minimal, layered SVG**, drawn in-house, bundled in-repo (MIT). |
| D12 | Avatar gender | **Not in MVP.** `gender` stays optional in the type for the future; MVP renders `neutral`. |
| D13 | Multi-day forecast | **Post-MVP (v1.1).** MVP is single-day; `forecast_days=2` is fetched but only today is shown. |
| D14 | Sharing | **Post-MVP.** No share feature in MVP. |
| D15 | Accessibility | **MVP requirement.** Screen-reader outfit descriptions, WCAG 2.1 AA, high-contrast mode. |
| D16 | PWA / offline | **Service Worker for asset caching in MVP**; installable PWA (manifest, install prompt) is post-MVP. |
| D17 | Localization | **Phase 1: English + Spanish.** French and German are roadmap. |
| D18 | Saved locations | **Post-MVP.** MVP has auto-detect and manual search only. |
| D19 | Units & conversions | Engine works in °C, m/s, mm, km, %; provider does all unit conversion to this canonical set. |
| D20 | API keys & privacy | **MVP requires no API keys.** Future keyed providers store keys in `localStorage` only. |
| D21 | Confidence score | One deterministic deduction function; example walkthroughs match the function output exactly. |
| D22 | CSP `connect-src` | Allowlist: Open-Meteo forecast + air-quality hosts and Nominatim **only**. |
| D23 | Config/state storage | Weather response cached in `sessionStorage` (5 min); user prefs and geocode cache in `localStorage`. |
| D24 | Privacy contact | **During development:** project GitHub Issues. At first production release, a contact email is published in the app's About page. |

---

## Full Decisions

### D01 — License
**Decision:** The application code, bundled avatar assets, and documentation are released
under the **MIT license**.

**Reasoning:** MIT is the simplest permissive license for an open, privacy-focused app and
is compatible with the CC BY 4.0 weather data used via Open-Meteo (attribution, not
copyleft). Rejected Apache-2.0 as unnecessary for a client-only app.

**Status:** Decided — replaces the "TBD — MIT or Apache-2.0" note in the README.

---

### D02 — Frontend stack
**Decision:**

- **Framework:** React + TypeScript + Vite (SPA)
- **State:** Zustand (weather, outfit, settings) — replaces "React Context / useReducer or Zustand"
- **Styling:** Tailwind CSS with CSS-variable design tokens in `src/theme/` — replaces "CSS Modules or Tailwind"
- **Icons:** lucide-react — replaces "lucide-react or inline SVG"
- **Date/time:** `date-fns-tz` (IANA timezone rendering)
- **i18n:** `i18next` + `react-i18next` with JSON locale files

**Reasoning:** Removes all "X or Y" ambiguity from the planning docs. Zustand avoids Context
re-render boilerplate; Tailwind is the established default for Vite SPAs.

**Status:** Decided for MVP.

---

### D03 — Testing
**Decision:** Vitest for unit tests, React Testing Library for component/integration tests,
Playwright for end-to-end flows. Visual snapshot tests for avatar rendering.

**Status:** Decided for MVP.

---

### D04 — Weather numbers in UI
**Decision:** The app **never displays weather numbers** anywhere, including the rationale.
The rationale uses localized condition words (see D06). The internal canonical temperature
unit is °C; the **Units (°C/°F) setting is removed from the MVP** because it has nothing to
display. It may return if a future "weather details" panel is ever added.

**Reasoning:** This resolves the contradiction between the design principle
("Visual over text — numbers never") and the earlier rationale examples that printed
"−12°C".

**Status:** Decided for MVP.

---

### D05 — Temperature band boundaries
**Decision:** Temperature bands are **half-open intervals** `[lower, upper)`:

| Band | Range (°C) | Includes | Excludes |
|------|-----------|----------|----------|
| FROZEN | `< −10` (lower clamp −30) | any value `< −10` (clamped at −30) | −10 and above |
| COLD | `[−10, 0)` | −10 … −0.001 | 0 and above |
| CHILLY | `[0, 10)` | 0 … 9.999 | 10 and above |
| COOL | `[10, 15)` | 10 … 14.999 | 15 and above |
| MILD | `[15, 20)` | 15 … 19.999 | 20 and above |
| WARM | `[20, 25)` | 20 … 24.999 | 25 and above |
| HOT | `[25, 35)` | 25 … 34.999 | 35 and above |
| VERY_HOT | `≥ 35` | 35 and above | — |

**Rules:**
1. An exact boundary value belongs to the **warmer** band (e.g., `0°C` → CHILLY, `10°C` →
   COOL, `35°C` → VERY_HOT).
2. Temperatures below −30°C are still FROZEN and additionally emit an "extreme cold"
   warning.

**Status:** Decided — removes all boundary overlap/gap ambiguity.

---

### D06 — Rationale condition words
**Decision:** The rationale references the temperature band through a fixed word map:

| Band | Condition word |
|------|----------------|
| FROZEN | freezing |
| COLD | cold |
| CHILLY | cool |
| COOL | mildly cool |
| MILD | mild |
| WARM | warm |
| HOT | hot |
| VERY_HOT | very hot |

**Status:** Decided for MVP.

---

### D07 — Location detection
**Decision:** No IP-based geolocation. Flow: browser `navigator.geolocation.getCurrentPosition()`
→ on failure or denial, show the manual search screen (Nominatim).

**Reasoning:** IP geolocation would send the user's IP to a third party (e.g., ipapi.co),
contradicting the privacy-first positioning. Manual search is the privacy-safe fallback.

**Status:** Decided — replaces "IP-based (ipapi.co)" fallback in architecture.

---

### D08 — Weather provider
**Decision:** Open-Meteo free API (`api.open-meteo.com/v1/forecast`) is the default and only
MVP provider. It is free for **non-commercial** use, rate-limited to 10,000 calls/day
(5,000/hour, 600/minute), and its data is CC BY 4.0 — so the app **must** show attribution:
"Weather data by Open-Meteo.com".

**Reasoning:** The original docs claimed "free, no key" but omitted the non-commercial terms
and the attribution requirement. Both are now documented and displayed.

**Status:** Decided for MVP. AccuWeather/OpenWeatherMap/NWS remain roadmap (keyed).

---

### D09 — Air quality
**Decision:** Air quality comes from the separate
Open-Meteo Air Quality API (`air-quality-api.open-meteo.com/v1/air-quality`, `current=us_aqi`).
Normalized `airQualityIndex` is **US AQI (0–500) and nullable** (`number | null`), because
other providers may not expose AQI. Missing AQI never produces warnings; it only suppresses
the air-quality branch.

**Status:** Decided — resolves "0–500 (US AQI) or provider-specific".

---

### D10 — Geocoding
**Decision:** Manual search uses OpenStreetMap **Nominatim**. Implementation must send a
valid `User-Agent`/`Referer` identifying the app, respect the ≤ 1 request/second limit,
show "© OpenStreetMap contributors" attribution, cache results for 7 days, and never submit
personal data (the search box accepts only place names).

**Status:** Decided for MVP.

---

### D11 — Avatar style
**Decision:** **Flat, minimal, layered SVG**, drawn in-house as a small deterministic set and
bundled in-repo under MIT. No third-party asset set in MVP.

**Reasoning:** Resolves "illustration style" and "asset source" open questions. Flat SVG is
small, scalable, testable, and matches the "no customization" MVP.

**Status:** Decided.

---

### D12 — Avatar gender
**Decision:** `gender` is **not part of the MVP UI**. The `OutfitRequest.gender` field stays
optional (`'neutral' | 'masculine' | 'feminine'`) for the future and is avatar-styling only;
the MVP always renders `'neutral'`.

**Status:** Decided.

---

### D13 — Multi-day forecast
**Decision:** The UI shows **today only** in the MVP. The provider fetches
`forecast_days=2` (today + tomorrow) so the engine can reason about the rest of the day and
tomorrow morning if needed later. The 7-day carousel is **post-MVP (v1.1)**.

**Status:** Decided — resolves "Extend daily forecast to 7-day carousel?".

---

### D14 — Sharing
**Decision:** No share feature in the MVP. "Share today's outfit" (generated image + deep
link) is **post-MVP** and will not call any backend — only in-browser image generation.

**Status:** Decided.

---

### D15 — Accessibility
**Decision:** Accessibility is an **MVP requirement**: every outfit has a screen-reader
description (e.g., "A child in an insulated jacket, snow pants and winter boots"),
AA contrast, visible focus states, and a high-contrast mode toggle.

**Status:** Decided — moved from "open question" to MVP scope.

---

### D16 — PWA / offline
**Decision:** A Workbox **Service Worker** precaches the app shell and avatar assets in the
MVP (offline rendering). The installable PWA (`manifest.json`, install prompt handling) is
**post-MVP**.

**Status:** Decided — resolves the "PWA install" open question.

---

### D17 — Localization
**Decision:** **Phase 1 ships English + Spanish.** French and German are on the roadmap. All
UI strings use i18next keys; missing translations fall back to English with a warning icon.

**Status:** Decided — reconciles the inconsistent "EN + ES" vs "ES, FR, DE" claims.

---

### D18 — Saved locations
**Decision:** Saved/favorite locations are **post-MVP**. The MVP supports auto-detect and
manual search only.

**Status:** Decided.

---

### D19 — Units & conversions
**Decision:** The normalized model uses one canonical unit set — °C, m/s, mm (precipitation),
km (visibility), cm (snow depth), %, and WMO weather codes — and **providers convert**, so the
engine and UI never convert units. Concretely, the Open-Meteo provider:

1. requests `wind_speed_unit=ms` and `temperature_unit=celsius` and `precipitation_unit=mm`;
2. requests `timeformat=unixtime` (epoch **seconds**); normalizes to epoch **ms**;
3. converts `visibility` meters → km (`÷ 1000`);
4. converts `snow_depth` meters → cm (`× 100`);
5. keeps `snowfall` in **cm** (Open-Meteo's native unit) and uses it only for ground-condition
   hints; liquid `precipitation` (mm) drives the rain logic.

**Status:** Decided — removes the unit ambiguities that made the docs unimplementable
(e.g., missing `wind_speed_unit`, wrong snow-depth scale).

---

### D20 — API keys & privacy
**Decision:** The MVP requires **no API keys**. If a future keyed provider is added, the key
is entered in Settings, stored in `localStorage`, used only for requests to that provider,
and never sent anywhere else. The privacy policy reflects this.

**Status:** Decided — resolves the privacy/architecture contradiction about API keys in
`localStorage`.

---

### D21 — Confidence score
**Decision:** One deterministic confidence function with documented deductions (see
`docs/recommendation-rules.md` §10). The worked examples in that document produce exactly the
function's output:

- Cold/snowy school day → **0.95**
- Hot sunny playground day → **0.90**
- Cool rainy commute → **0.95**

**Status:** Decided — the examples no longer contradict the function.

---

### D22 — CSP `connect-src`
**Decision:** Content Security Policy allows `script-src 'self'` and `connect-src` limited
to `https://api.open-meteo.com`, `https://air-quality-api.open-meteo.com`, and
`https://nominatim.openstreetmap.org` (plus whatever hosts a future keyed provider needs, if
the user opts in). No other network calls are permitted.

**Status:** Decided.

---

### D23 — Config/state storage
**Decision:** Weather response → `sessionStorage`, 5-minute TTL. Geocode results →
`localStorage`, 7-day TTL. User preferences (activity, provider, language) → `localStorage`.
All of it is browser-local and cleared with the browser.

**Status:** Decided for MVP.

---

### D24 — Privacy contact
**Decision:** During development, privacy questions are handled through the project's public
**GitHub Issues** tracker. At first production release, a dedicated contact email is published
in the app's About page. The placeholder email from earlier drafts is removed.

**Status:** Decided.

---

## How to Update This Document

1. Add a new row to the index and a subsection under Full Decisions.
2. Link the decision from every affected planning doc.
3. Do **not** leave a question in the planning docs unanswered — answer it here first.

---

**Last updated**: 2026-10-22