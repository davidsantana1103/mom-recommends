# Mom Recommends — Privacy Policy

> **Status**: Draft (v0.1)  
> **Last updated**: 2025-10-22  
> **Audience**: Users, privacy regulators, parents

---

## 1. Commitment to Privacy

Mom Recommends is designed with privacy as a core principle. We **do not collect, store, or share any personal data** from users. This includes:

- No location tracking beyond immediate weather fetching
- No user accounts, emails, or profiles
- No analytics, cookies, or tracking pixels
- No API keys or personal data stored in browser storage

We are **not a data collection service** — we are a **privacy-first tool**.

---

## 2. Data Flow Architecture

### 2.1 What We Process (Client-Side Only)

| Data Type | Where It Stays | How Long | Notes |
|-----------|----------------|----------|-------|
| Location (lat/lon) | Browser memory | Until page reload | Never sent to our servers |
| Weather API response | Browser memory + `sessionStorage` | 5 minutes | Cached locally, never uploaded |
| User preferences (units, activity) | `localStorage` | Until cleared | Never leaves browser |
| Generated outfit | Browser memory | Until page reload | Never sent anywhere |

### 2.2 What We Do NOT Collect

- No IP addresses
- No device identifiers
- No cookies (beyond `localStorage`/`sessionStorage` for app state)
- No browser fingerprinting
- No form submissions
- No user behavior tracking

### 2.3 Data Sources

- **Weather Data**: From public APIs (Open-Meteo by default, others optional)
- **Location**: Browser Geolocation API or manual search via OpenStreetMap Nominatim
- **Assets**: Static SVG files bundled with the app

---

## 3. User Control

### 3.1 Location Options

1. **Auto-detect** (default): Uses browser Geolocation API
2. **Manual search**: User types city/postal code → geocoded via OpenStreetMap
3. **Saved locations**: Not currently supported (v1)

### 3.2 Settings Available

- **Units**: °C or °F
- **Default activity**: school, playground, walk, sport, commute, general
- **Weather provider**: Open-Meteo (default), others can be added in settings
- **Language**: English (default), others can be added

All settings are stored in `localStorage` and never leave the browser.

---

## 4. Security Measures

- **HTTPS only**: All weather API calls use secure connections
- **CSP headers**: Strict Content Security Policy prevents script injection
- **No inline scripts**: All JavaScript is external
- **Data isolation**: Weather data never leaves the browser
- **Privacy by design**: No personal data is ever collected

---

## 5. Open-Meteo Privacy Policy (Our Weather Provider)

We use Open-Meteo as the default weather provider. According to their [Privacy Policy](https://open-meteo.com/en/privacy-policy):

> "Open-Meteo does not collect personal data from users. All weather data is provided anonymously and does not identify individual users. The service is free and open-source."

We inherit this privacy commitment — Open-Meteo does not track users, and neither do we.

---

## 6. Future Privacy Considerations

| Feature | Current Status | Privacy Impact |
|---------|----------------|--------------|
| User accounts | Not planned | No personal data collection |
| Email notifications | Not planned | No communication channels |
| Data export | Not applicable | No data to export |
| Third-party integrations | Not planned | No external trackers |
| Location history | Not planned | No persistent location data |

---

## 7. Compliance

This app is designed to comply with:
- **GDPR** (General Data Protection Regulation) - no personal data means no processing
- **CCPA** (California Consumer Privacy Act) - no personal data means no consumer rights needed
- **COPPA** (Children's Online Privacy Protection Act) - since we don't collect data from children, this applies by default
- **Privacy by Design** principles - built-in from day one

---

## 8. Contact Information

If you have privacy concerns or questions about data handling:

- **Email**: privacy@mom-recommends.dev (hypothetical)
- **No contact form** - we do not collect contact information

---

## 9. Changes to This Policy

This privacy policy may be updated in the future. When we make changes:

- We will post the updated version on this page
- We will notify users via the app interface if any changes affect data handling
- **No notification required** for minor clarifications or policy updates that don't change data collection practices

---

**Last Updated**: October 22, 2025  
**Version**: 0.1

---

This privacy policy is a binding agreement. By using Mom Recommends, you agree to these terms. If you disagree with any part of this policy, you should not use the application.