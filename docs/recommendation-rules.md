# Mom Recommends — Recommendation Rules

> **Status**: Draft (v0.1)  
> **Last updated**: 2026-10-22  
> **Audience**: Developers, product managers, testers
> **Related**: `docs/decisions.md` (D04–D06, D21), `docs/data-models.md` (types & bands)

---

## 1. Overview

The recommendation engine is a **pure, deterministic, rule-based function**:

```
Outfit = rules(WeatherData, Activity, Person)
```

- **Input**: normalized weather snapshot + selected activity + person type
- **Output**: a complete set of clothing items with rationale text
- **No ML**, **no backend** — logic lives entirely in the frontend

Rules are organized into:
1. **Temperature band rules** (primary driver)
2. **Precipitation modifiers** (rain/snow/wind add layers)
3. **UV modifiers** (sun protection when high)
4. **Activity modifiers** (school vs. sport vs. playground)
5. **Person modifiers** (adult vs. child)

Rules are composable — temperature sets the base layer stack, then activity and condition modifiers adjust individual items.

---

## 2. Temperature Bands

Bands are **half-open intervals `[lower, upper)`** (D05): an exact boundary value belongs to
the **warmer** band. E.g. `0°C → CHILLY`, `10°C → COOL`, `25°C → HOT`, `35°C → VERY_HOT`.
Below −30°C is still FROZEN (with an "extreme cold" warning). Derivation is defined in
`docs/data-models.md` §4.2.

| Band | Temp Range (°C) | Condition word (D06) | Description | Base layers (§4) |
|------|-----------------|----------------------|-------------|------------------|
| **FROZEN** | `< −10` (clamp −30) | freezing | Very cold, risk of frostbite | §4.1 |
| **COLD** | `[−10, 0)` | cold | Cold, wind chill possible | §4.2 |
| **CHILLY** | `[0, 10)` | cool | Cool, damp conditions | §4.3 |
| **COOL** | `[10, 15)` | mildly cool | Mildly cool | §4.4 |
| **MILD** | `[15, 20)` | mild | Pleasant, spring/fall | §4.5 |
| **WARM** | `[20, 25)` | warm | Warm, summer-like | §4.6 |
| **HOT** | `[25, 35)` | hot | Hot, sunny | §4.7 |
| **VERY_HOT** | `≥ 35` | very hot | Very hot, heat stress | §4.8 |

---

## 3. Rule Engine (Pseudo-code)

```typescript
interface RuleContext {
  tempBand: TempBand;
  precipType: PrecipType;
  uvMeaning: UVMeaning;         // label from getUVMeaning(), §4.4 of data-models
  uvIndex: number;              // numeric — used directly by warnings
  windSpeed: number;            // m/s
  temperature: number;          // °C
  snowDepth: number;            // cm
  visibility: number;           // km
  airQualityIndex: number | null; // US AQI or null (D09)
}

function recommendOutfit(request: OutfitRequest): Outfit {
  const { weather, activity, person } = request;

  // 1. Determine base temperature band (half-open, D05)
  const tempBand = getTempBand(weather.current.temperature);

  // 2. Build context from all weather variables
  const ctx: RuleContext = {
    tempBand,
    precipType: weather.current.precipitationType,
    uvMeaning: getUVMeaning(weather.current.uvIndex),
    uvIndex: weather.current.uvIndex,
    windSpeed: weather.current.windSpeed,
    temperature: weather.current.temperature,
    snowDepth: weather.current.snowDepth,
    visibility: weather.current.visibility,
    airQualityIndex: weather.current.airQualityIndex,
  };

  // 3. Generate base outfit from temperature band
  let items = baseLayersForTempBand(tempBand, person);

  // 4. Apply precipitation modifier
  items = applyPrecipitationModifier(items, ctx, activity);

  // 5. Apply UV modifier
  items = applyUVModifier(items, ctx);

  // 6. Apply activity modifier
  items = applyActivityModifier(items, activity, person);

  // 7. Apply person modifier (adult vs child)
  items = applyPersonModifier(items, person);

  // 8. Deduplicate and sort by layer order (§13)
  items = dedupeAndSort(items);

  // 9. Generate rationale (worded conditions only — no numbers, D04)
  const rationale = generateRationale(ctx, items, activity);

  // 10. Calculate confidence score (§10, D21)
  const confidence = calculateConfidence(ctx);

  // 11. Generate warnings array (§11)
  const warnings = generateWarnings(ctx);

  return { items, rationale, confidence, warnings };
}
```

---

## 4. Base Layers per Temperature Band

### 4.1 FROZEN (below −10°C; lower clamp −30°C)
```
Category | Item                  | Required | Notes
---------|-----------------------|----------|------------------------------------------
base     | thermal underwear     | Yes      | moisture-wicking base layer
mid      | thermal shirt         | Yes      | long-sleeve thermal
mid      | fleece or wool layer  | Yes      | mid-weight fleece or wool sweater
outer    | heavy winter coat     | Yes      | insulated, windproof, water-resistant
legs     | snow pants            | Yes      | insulated, waterproof
feet     | insulated winter boots| Yes      | rated to −20°C+, waterproof
head     | knit hat / beanie     | Yes      | covers ears
hands    | insulated mittens     | Yes      | warmer than gloves
hands    | glove liners          | Yes      | thin liner under mittens
legs     | thermal leggings      | Yes      | under snow pants
head     | face covering         | Optional | balaclava or neck gaiter
```

### 4.2 COLD (−10°C ≤ t < 0°C)
```
Category | Item                  | Required | Notes
---------|-----------------------|----------|------------------------------------------
base     | thermal underwear     | Yes      | if below −5°C
mid      | long-sleeve shirt     | Yes      | or thermal shirt
mid      | sweater/fleece        | Yes      | mid-weight
outer    | insulated jacket      | Yes      | windproof
legs     | insulated pants       | Yes      | jeans with thermal liner or snow pants
feet     | insulated boots       | Yes      | waterproof
head     | knit hat / beanie     | Yes      |
hands    | gloves                | Yes      | insulated
legs     | thermal leggings      | Optional | under pants if below −5°C
head     | scarf                 | Optional | neck protection
```

### 4.3 CHILLY (0°C ≤ t < 10°C)
```
Category | Item                  | Required | Notes
---------|-----------------------|----------|------------------------------------------
mid      | long-sleeve shirt     | Yes      |
outer    | light jacket          | Yes      | windbreaker or denim jacket
legs     | long pants            | Yes      | jeans, trousers, leggings
feet     | closed shoes          | Yes      | sneakers or boots
head     | hat                   | Optional | beanie or cap
hands    | light gloves          | Optional | if windy or below 5°C
head     | hood                  | Optional | jacket hood up if raining
```

### 4.4 COOL (10°C ≤ t < 15°C)
```
Category | Item                  | Required | Notes
---------|-----------------------|----------|------------------------------------------
base     | t-shirt               | Yes      | short-sleeve
mid      | sweater or light jacket| Yes      | cardigan or light coat
legs     | long pants            | Yes      | jeans or trousers
feet     | closed shoes          | Yes      | sneakers or boots
head     | hat                   | Optional | cap or light beanie
head     | hood                  | Optional | jacket hood if needed
```

### 4.5 MILD (15°C ≤ t < 20°C)
```
Category | Item                  | Required | Notes
---------|-----------------------|----------|------------------------------------------
base     | t-shirt               | Yes      | short-sleeve
legs     | long pants            | Yes      | jeans, chinos, leggings
feet     | closed shoes          | Yes      | sneakers
outer    | light jacket          | Optional | cardigan or windbreaker
head     | hat                   | Optional | cap
```

### 4.6 WARM (20°C ≤ t < 25°C)
```
Category | Item                  | Required | Notes
---------|-----------------------|----------|------------------------------------------
base     | t-shirt               | Yes      | short-sleeve
legs     | shorts or light pants | Yes      | breathable fabric
feet     | sneakers or sandals   | Yes      | open-toed OK
outer    | light cardigan        | Optional | for air conditioning
head     | hat                   | Optional | sun hat or cap
```

### 4.7 HOT (25°C ≤ t < 35°C)
```
Category | Item                  | Required | Notes
---------|-----------------------|----------|------------------------------------------
base     | t-shirt               | Yes      | short-sleeve, breathable
legs     | shorts                | Yes      | light fabric
feet     | sandals               | Yes      | open-toed
head     | sun hat               | Yes      | wide-brim preferred
hands    | sunglasses            | Optional | UV protection
```

### 4.8 VERY_HOT (t ≥ 35°C)
```
Category | Item                  | Required | Notes
---------|-----------------------|----------|------------------------------------------
base     | t-shirt               | Yes      | ultra-light, moisture-wicking
legs     | shorts                | Yes      | light fabric
feet     | sandals               | Yes      | open-toed
head     | wide-brim hat         | Yes      | sun protection
hands    | sunglasses            | Optional | UV protection
legs     | breathable fabric     | Yes      | linen or cotton
```

---

## 5. Precipitation Modifiers

### 5.1 RAIN
| Temperature Band | Addition | Notes |
|------------------|----------|-------|
| Any | waterproof outer layer | replace light jacket with raincoat |
| Any | waterproof footwear | boots instead of sneakers |
| COLD and below | waterproof pants | instead of regular pants |
| COOL and below | hood | jacket hood up |

> Umbrella is **not produced in the MVP** — it is a post-MVP accessory (see §14).

### 5.2 SNOW
| Temperature Band | Addition | Notes |
|------------------|----------|-------|
| FROZEN | snow pants (already in base) | required |
| FROZEN | insulated boots (already in base) | required |
| COLD | snow pants | replace regular pants |
| COLD | insulated boots | replace regular boots |
| COLD | waterproof gloves | replace regular gloves |
| CHILLY | waterproof boots | replace closed shoes |
| CHILLY | hood | jacket hood up |

### 5.3 SLEET / HAIL / ICE PELLETS
| Temperature Band | Addition | Notes |
|------------------|----------|-------|
| Any | waterproof outer layer | raincoat or winter coat |
| Any | waterproof footwear | boots |
| COLD and below | insulated gloves | mittens preferred |

### 5.4 Wind Modifier (applied on top of precipitation)
- **Wind > 8 m/s (18 mph)**: add windproof layer regardless of temp band
- **Wind > 12 m/s (27 mph)**: add hat with ear coverage, scarf
- **Wind > 15 m/s (34 mph)**: add face covering if below 10°C

---

## 6. UV Modifiers

| UV Index | Action | Item |
|----------|--------|------|
| 0–2 | None | — |
| 3–5 | Sunscreen recommended | warning text only (§11) |
| 6–7 | Hat recommended + sunscreen | cap or sun hat + warning |
| 8–10 | Hat required + sunglasses | sun hat + UV sunglasses |
| 11+ | Wide-brim hat required + sunglasses | wide-brim hat + UV sunglasses |

**UV modifier behavior**: adds head/hands items only — it never changes temperature-based
layers. The corresponding warnings are generated in §11.

---

## 7. Activity Modifiers

### 7.1 School
- Conservative coverage: long sleeves, long pants regardless of temperature
- If temp ≥ 20°C: short sleeves allowed but keep light jacket for classroom AC
- Backpack-friendly: items should be easy to put on/take off
- Shoe requirement: closed-toe shoes (no sandals) for safety

### 7.2 Playground
- Minimal layers: breathable, durable fabrics
- Easy removal: child can add/remove layers independently
- Shoe requirement: closed-toe shoes (no sandals) for safety
- If temp ≥ 25°C: shorts allowed, otherwise long pants

### 7.3 Walk
- Variable activity: layering system (easy to add/remove)
- If temp ≥ 15°C: short sleeves OK
- If temp < 10°C: add hat and gloves
- Shoe requirement: closed-toe shoes

### 7.4 Sport
- Technical fabrics: moisture-wicking, stretchy
- Minimal layers: breathable base layer
- If temp < 15°C: thermal base under athletic wear
- Shoe requirement: sneakers only

### 7.5 Commute
- Layering for transitions: base + mid + outer (remove outer indoors)
- Compact: items pack into bag
- If rain/snow: add waterproof outer (compact umbrella is post-MVP)
- Shoe requirement: closed-toe shoes

### 7.6 General (default)
- Balanced: no specific bias
- Temperature bands applied as-is

---

## 8. Person Modifiers

### 8.1 Child vs Adult
| Item Category | Child | Adult |
|---------------|-------|-------|
| Thermal layers | More insulation required | Standard insulation |
| Footwear | Smaller sizes, easier fasteners (Velcro) | Adult sizing |
| Headwear | Larger brim for sun protection | Standard cap/hat |
| Gloves | Mittens preferred (warmer) | Gloves preferred (dexterity) |
| Safety | Closed-toe shoes required | Closed-toe preferred |

### 8.2 Avatar Proportions
- Child avatar: smaller head-to-body ratio, shorter limbs
- Adult avatar: standard proportions
- All items scale accordingly

---

## 9. Example: Complete Rule Walkthroughs

### Example A: Cold Snowy Day — Child Going to School
```
Weather: −12°C, snowing, wind 15 km/h, UV 2 (low)
Activity: school
Person: child

1. Temp band: −12 < −10 → FROZEN (half-open bands, §2)

2. Base layers (FROZEN + child):
   - thermal underwear, thermal shirt, fleece, heavy winter coat,
   - snow pants, insulated winter boots, knit hat, insulated mittens,
   - glove liners, thermal leggings

3. Precipitation modifier (snow):
   - snow pants already in base
   - insulated boots already in base
   - upgrade mittens → waterproof mittens

4. Wind modifier (15 km/h ≈ 4.2 m/s):
   - below the 8 m/s threshold → no change

5. Activity modifier (school):
   - conservative coverage already satisfied
   - closed-toe shoes already satisfied by boots

6. UV modifier (UV 2): none

7. Final outfit:
   - thermal underwear, thermal shirt, fleece, heavy winter coat,
   - snow pants, insulated winter boots, knit hat, waterproof mittens,
   - glove liners, thermal leggings

Confidence: 1.0 − 0.05 (FROZEN) = 0.95
Warnings: ["Extreme cold — limit outdoor exposure"]   (UV 2 is low)

Rationale: "It's freezing and snowing, so we recommend a full winter outfit for school.
Warm layers to keep dry and protected."   (worded conditions only — no numbers, D04)
```

### Example B: Warm Sunny Day — Adult Playground
```
Weather: 28°C, sunny, wind 5 km/h, UV 8 (very high)
Activity: playground
Person: adult

1. Temp band: 28 is in [25, 35) → HOT

2. Base layers (HOT + adult):
   - t-shirt, shorts, sandals

3. Precipitation modifier: none (dry)

4. Wind modifier (5 km/h ≈ 1.4 m/s): none

5. Activity modifier (playground):
   - closed-toe shoes → replace sandals with sneakers
   - shorts allowed (temp ≥ 25°C)

6. UV modifier (UV 8, in 8–10):
   - hat required → sun hat
   - sunglasses → UV sunglasses

7. Final outfit:
   - t-shirt, shorts, sneakers, sun hat, UV sunglasses

Confidence: 1.0 − 0.05 (HOT) − 0.05 (UV ≥ 8) = 0.90
Warnings: ["Very high UV — apply sunscreen, wear a wide-brim hat and sunglasses"]

Rationale: "It's hot and sunny with very high UV, so wear light, breathable clothing. A hat
and sunglasses will help with sun protection."   (worded conditions only — no numbers, D04)
```

### Example C: Rainy Cool Day — Adult Commute
```
Weather: 8°C, raining, wind 10 km/h, UV 4 (moderate)
Activity: commute
Person: adult

1. Temp band: 8 is in [0, 10) → CHILLY

2. Base layers (CHILLY + adult):
   - long-sleeve shirt, light jacket, long pants, closed shoes

3. Precipitation modifier (rain):
   - waterproof outer layer → replace light jacket with raincoat
   - waterproof footwear → replace closed shoes with boots
   - (umbrella is post-MVP — not produced)

4. Wind modifier (10 km/h ≈ 2.8 m/s): none

5. Activity modifier (commute):
   - layering satisfied; raincoat is compact → no change

6. UV modifier (UV 4, in 3–5): sunscreen warning only

7. Final outfit:
   - long-sleeve shirt, raincoat, long pants, boots

Confidence: 1.0 − 0.05 (rain) = 0.95
Warnings: ["Moderate UV — sunscreen recommended"]

Rationale: "It's cool and raining, so wear a raincoat over your layers with waterproof
boots."   (worded conditions only — no numbers, D04)
```

---

## 10. Confidence Calculation

```typescript
function calculateConfidence(ctx: RuleContext): number {
  let confidence = 1.0;

  // Extreme temperature bands need human judgment
  if (ctx.tempBand === 'FROZEN' || ctx.tempBand === 'VERY_HOT') {
    confidence -= 0.05;
  }

  // Rain can be patchy; sleet/hail is genuinely ambiguous
  if (ctx.precipType === 'rain') confidence -= 0.05;
  if (ctx.precipType === 'sleet' || ctx.precipType === 'hail') confidence -= 0.10;

  // High wind makes the "feels like" temperature vary
  if (ctx.windSpeed > 10) confidence -= 0.05;

  // Poor visibility
  if (ctx.visibility < 5) confidence -= 0.05;

  // UV ≥ 8 days depend on personal sunscreen discipline
  if (ctx.uvIndex >= 8) confidence -= 0.05;

  return Math.max(0.1, Math.min(1.0, confidence));
}
```

The worked examples in §9 match this function exactly (D21):

| Example | Deductions | Result |
|---------|------------|--------|
| A (−12°C FROZEN) | −0.05 (FROZEN) | 0.95 |
| B (28°C HOT, UV 8) | −0.05 (HOT) −0.05 (UV ≥ 8) | 0.90 |
| C (8°C rain) | −0.05 (rain) | 0.95 |

---

## 11. Warnings Generation

Warnings use **numeric thresholds** on `ctx.uvIndex` (never on the `uvMeaning` label), so the
warning set is an exact match for §6:

```typescript
function generateWarnings(ctx: RuleContext): string[] {
  const warnings: string[] = [];

  // UV warnings — one message per severity band, mirrors the §6 table
  // (input is ctx.uvIndex, a number, never the uvMeaning label)
  if (ctx.uvIndex >= 11) {
    warnings.push('Extreme UV — minimize outdoor exposure, apply SPF 50+ sunscreen');
  } else if (ctx.uvIndex >= 8) {
    warnings.push('Very high UV — apply sunscreen, wear a wide-brim hat and sunglasses');
  } else if (ctx.uvIndex >= 6) {
    warnings.push('High UV — apply sunscreen and wear a hat');
  } else if (ctx.uvIndex >= 3) {
    warnings.push('Moderate UV — sunscreen recommended');
  }

  // Temperature warnings
  if (ctx.tempBand === 'FROZEN') {
    warnings.push('Extreme cold — limit outdoor exposure');
  }
  if (ctx.tempBand === 'VERY_HOT') {
    warnings.push('Heat warning — stay hydrated');
  }

  // Air quality (only when the provider supplies it — D09)
  if (ctx.airQualityIndex !== null && ctx.airQualityIndex > 150) {
    warnings.push('Poor air quality — consider indoor activities');
  }

  // Precipitation warnings
  if (ctx.precipType === 'snow' && ctx.snowDepth > 10) {
    warnings.push('Heavy snow — boots recommended');
  }

  return warnings;
}
```

Warning strings are **not hard-coded** in the UI: every string is an i18next key (D17); the
pseudo-code above shows the English defaults.

---

## 12. Rationale Generation

The rationale is a human-readable sentence explaining why this outfit was chosen. It is
**localized** (i18next) and uses **worded conditions only — never weather numbers** (D04/D06).

```
Template:
"It's {condition_word} and {weather_phrase}, so we recommend {outfit_summary} for {activity}."

Fill-ins:
- condition_word: from the temp band (D06): freezing / cold / cool / mildly cool / mild / warm / hot / very hot
- weather_phrase: snowing, raining, sleeting, windy, foggy, sunny, cloudy, overcast, dry
- outfit_summary: 2–4 headline items ("a full winter outfit", "a raincoat over layers")
- activity: school / playground / walk / sport / commute

Examples:
- "It's freezing and snowing, so we recommend a full winter outfit for school. Warm layers to keep dry and protected."
- "It's hot and sunny with very high UV, so wear light, breathable clothing. A hat and sunglasses will help with sun protection."
- "It's cool and raining, so wear a raincoat over your layers with waterproof boots."
```

`weather_phrase` is derived from `weatherCode` → `precipitationType` (data-models §4.1) plus
cloud cover; it never includes a numeric value, a degree symbol, or a wind figure.

---

## 13. Implementation Notes

### 13.1 Rule Order Matters
Rules must be applied in this order:
1. **Temperature bands** → set base layers
2. **Precipitation** → replace/add weather-protective items
3. **Wind** → add windproof items
4. **UV** → add sun protection items
5. **Activity** → adjust for school/sport/etc.
6. **Person** → adjust for child/adult

### 13.2 Deduplication
If both temperature and precipitation suggest the same category (e.g., footwear), use the
more protective one (insulated boots over sneakers, waterproof over non-waterproof).

### 13.3 Layer Conflicts
- Only one item per **category per layer** (e.g., can't have two "base layer" items for feet).
- If a conflict arises, keep the item with `required: true` over `required: false`; if both
  have the same `required` flag, keep the later-applied (more weather-specific) one.
- "One item per category" applies to **rendered** items; e.g., thermal leggings may be listed
  under `legs` alongside snow pants because they occupy different layers (2 vs 3).

### 13.4 Extensibility
New rules can be added by:
1. Adding a new modifier function (e.g., `applyAirQualityModifier`)
2. Calling it in `recommendOutfit` between steps 5–7
3. Documenting the rule in this document
4. Recording any product choice it introduces in `docs/decisions.md`

---

## 14. Future Considerations

Statuses reflect decisions D13–D16.

| Idea | Status | Notes |
|------|--------|-------|
| Multi-day outfit carousel | Post-MVP (D13) | Use `daily` forecast once extended to 7 days |
| Accessories (scarf, umbrella, sunglasses) | Post-MVP | Optional items; `required: false` already supported |
| Customization | Not planned (D11/D12) | Avatar stays deterministic; gender deferred |
| Season modifier | Future | "Spring wardrobe" vs "Winter wardrobe" presets |
| Weighted rules | Future | Allow power users to prioritize warmth vs. breathability |

---

This document defines the complete rule-based recommendation engine for Mom Recommends.
All logic is frontend-side, deterministic, testable, and provider-independent; every open
question it previously raised is resolved in `docs/decisions.md`.