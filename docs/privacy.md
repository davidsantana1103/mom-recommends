# Mom Recommends — Privacy Policy

> **Status**: Draft (v0.1)  
> **Last updated**: 2026-10-22  
> **Audience**: Users, privacy regulators, parents
> **Related**: `docs/decisions.md` (D07, D08, D10, D20, D24)

---

## 1. Commitment to Privacy

Mom Recommends is designed with privacy as a core principle. We **do not collect, store, or
share any personal data** from users. This includes:

- No user accounts, emails, or profiles
- No analytics, cookies, or tracking pixels
- No IP-based geolocation (D07) — we never silently identify you by IP address
- No API keys required — the MVP uses the keyless Open-Meteo service (D20)

We are **not a data collection service** — we are a **privacy-first tool**.

---

## 2. Data Flow Architecture

### 2.1 What We Process (Client-Side Only)

| Data Type | Where It Stays | How Long | Notes |
|-----------|----------------|----------|-------|
| Location (lat/lon) | Browser memory | Until page reload | Never sent to our servers |
| Weather + air-quality API responses | Browser memory + `sessionStorage` | 5 minutes | Cached locally, never uploaded |
| User preferences (activity, provider, language) | `localStorage` | Until cleared | Never leaves browser |
| Geocode search results | `localStorage` | 7 days | Cache for repeat manual searches |
| Generated outfit | Browser memory | Until page reload | Never sent anywhere |

### 2.2 What We Do NOT Collect

- No device identifiers
- No browser fingerprinting
- No form submissions (no login/contact forms in the app)
- No user behavior tracking
- No advertising or marketing data
- No tracking cookies — the only browser storage is `localStorage`/`sessionStorage` used for
  the app's own state (D23), which is cleared with the browser

### 2.3 Data Sources

- **Weather Data**: Open-Meteo forecast API + Open-Meteo Air Quality API (D08/D09)
- **Location**: Browser Geolocation API or manual search via OpenStreetMap Nominatim (D07/D10)
- **Assets**: Static SVG files bundled with the app (no external image requests)

### 2.4 Third-Party Requests (Disclosure)

The app is client-only, so requests go **directly from the user's browser** to the services
below. We operate no server and never see these requests:

| Service | What is sent | What is NOT sent |
|---------|--------------|------------------|
| Open-Meteo (forecast + air quality) | Approximate latitude/longitude | No name, email, account, or device ID |
| OpenStreetMap Nominatim (manual search) | The place name typed by the user | No other personal data; we follow their usage policy (≤1 req/s, valid User-Agent, attribution) |

Attribution required by these services: **"Weather data by Open-Meteo.com"** (CC BY 4.0) and
**"© OpenStreetMap contributors"** (ODbL) are shown in the app footer (D08/D10).

---

## 3. User Control

### 3.1 Location Options

1. **Auto-detect** (default): Uses the browser Geolocation API — nothing is stored or sent
   until the user approves the browser prompt (D07)
2. **Manual search**: User types a city/postal code → geocoded via OpenStreetMap Nominatim
3. **Saved locations**: Post-MVP (D18)

> There is no IP-based geolocation fallback (D07). If the user declines geolocation, we ask
> them to search manually.

### 3.2 Settings Available

- **Default activity**: school, playground, walk, sport, commute, general
- **Weather provider**: Open-Meteo (default); keyed providers are post-MVP
- **Language**: English + Spanish (Phase 1), French and German later (D17)

> There is **no Units (°C/°F) setting** because the UI never shows weather numbers (D04).

All settings are stored in `localStorage`, never leave the browser, and are cleared with the
browser or via the site's storage controls.

---

## 4. Security Measures

- **HTTPS only**: All provider calls use secure connections
- **CSP**: Strict Content Security Policy — `script-src 'self'`, `connect-src` limited to
  `api.open-meteo.com`, `air-quality-api.open-meteo.com`, and `nominatim.openstreetmap.org`
  (D22)
- **No inline scripts**: All JavaScript is external
- **Data isolation**: Weather and location data never leave the browser except for the
  disclosed third-party requests in §2.4
- **Privacy by design**: No personal data is ever collected

---

## 5. Open-Meteo (Our Default Weather Provider)

We use Open-Meteo's free API as the default provider (D08), which is governed by their
[Terms & Privacy](https://open-meteo.com/en/terms). What that means for our users:

- **Non-commercial, keyless**: the free API needs no account or API key (10,000 calls/day,
  5,000/hour, 600/minute — the daily limit applies to the app as a whole)
- **Server logs**: per Open-Meteo's terms, the API collects non-personal information such as
  IP addresses and request URLs to monitor API usage; individual log files are removed after
  90 days and only aggregated usage data is retained
- **No advertising tracking**: Open-Meteo does not use the data for advertising or profiling;
  no cookies are required to call the API
- **Attribution**: Open-Meteo's data is CC BY 4.0, so the app displays
  "Weather data by Open-Meteo.com"

### 5.1 OpenStreetMap Nominatim (Manual Search)

Nominatim is operated by the OpenStreetMap Foundation. Its
[usage policy](https://operations.osmfoundation.org/policies/nominatim/) requires valid
`User-Agent`, attribution ("© OpenStreetMap contributors"), no bulk geocoding, and no
personal data in queries. The app's search box accepts place names only and follows these
requirements (D10).

---

## 6. Future Privacy Considerations

| Feature | Current Status | Privacy Impact |
|---------|----------------|--------------|
| User accounts | Not planned | No personal data collection |
| Email notifications | Not planned | No communication channels |
| Data export | Not applicable | No data to export |
| Third-party integrations | Post-MVP, keyed providers only (D20) | Key stays in `localStorage`, sent only to that provider |
| Location history | Not planned | No persistent location data |
| Saved locations | Post-MVP (D18) | Stored in `localStorage` only, like other prefs |
| Avatar gender option | Post-MVP (D12) | Avatar styling only; never transmitted |

---

## 7. Compliance

This app is designed to comply with:
- **GDPR** (General Data Protection Regulation) — no personal data means no processing
- **CCPA** (California Consumer Privacy Act) — no personal data means no consumer rights
  obligations to fulfill
- **COPPA** (Children's Online Privacy Protection Act) — the app collects no personal
  information from anyone, including children, so no COPPA-permitted data practices apply
- **Privacy by Design** principles — built in from day one

---

## 8. Contact Information

If you have privacy concerns or questions about data handling:

- **During development**: open a public issue on the project's
  [GitHub repository](https://github.com/davidsantana1103/mom-recommends) (D24)
- **At first production release**: a dedicated contact email is published in the app's About
  page (D24)
- The app itself has no contact form — we deliberately do not collect any personal data

---

## 9. Changes to This Policy

This privacy policy may be updated in the future. When we make changes:

- We will post the updated version on this page (and in the repo, since changes are tracked
  in git)
- We will notify users via the app interface if any change affects how data is handled
- **No notification required** for minor clarifications that do not change data handling

---

**Last Updated**: October 22, 2026  
**Version**: 0.1

---

This policy describes how Mom Recommends handles data. By using the app, you agree to this
policy. If you disagree with any part of it, please do not use the application.