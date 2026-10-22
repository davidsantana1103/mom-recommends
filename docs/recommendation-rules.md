# Mom Recommends — Recommendation Rules

> **Status**: Draft (v0.1)  
> **Last updated**: 2025-10-22  
> **Audience**: Developers, product managers, testers

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

| Band | Temp Range (°C) | Description | Base Layers |
|------|-----------------|-------------|-------------|
| **FROZEN** | −30 to −11 | Very cold, risk of frostbite | thermal base + heavy coat + hat + gloves + insulated boots + scarf + face covering |
| **COLD** | −10 to 0 | Cold, wind chill possible | thermal base + insulated jacket + hat + gloves + waterproof boots |
| **CHILLY** | 0 to 10 | Cool, damp conditions | long sleeves + light jacket + scarf + closed shoes |
| **COOL** | 10 to 15 | Mildly cool | sweater + long pants + closed shoes |
| **MILD** | 15 to 20 | Pleasant, spring/fall | t-shirt + light jacket + jeans + sneakers |
| **WARM** | 20 to 25 | Warm, summer-like | t-shirt + shorts/light pants + sandals/sneakers |
| **HOT** | 25 to 35 | Hot, sunny | light clothing + hat + sunscreen |
| **VERY_HOT** | 35+ | Very hot, heat stress | minimal clothing + wide-brim hat + high SPF sunscreen + hydration reminder |

---

## 3. Rule Engine (Pseudo-code)

```typescript
interface RuleContext {
  tempBand: TempBand;
  precipType: PrecipType;
  uvMeaning: UVMeaning;
  windSpeed: number;        // m/s
  temperature: number;      // °C
  snowDepth: number;        // cm
  visibility: number;       // km
  airQualityIndex: number;  // AQI
}

function recommendOutfit(request: OutfitRequest): Outfit {
  const { weather, activity, person } = request;

  // 1. Determine base temperature band
  const tempBand = getTempBand(weather.current.temperature);

  // 2. Build context from all weather variables
  const ctx = {
    tempBand,
    precipType: weather.current.precipitationType,
    uvMeaning: getUVMeaning(weather.current.uvIndex),
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

  // 8. Deduplicate and sort by layer order
  items = dedupeAndSort(items);

  // 9. Generate rationale string
  const rationale = generateRationale(ctx, items, activity);

  // 10. Calculate confidence score
  const confidence = calculateConfidence(ctx);

  // 11. Generate warnings array
  const warnings = generateWarnings(ctx);

  return { items, rationale, confidence, warnings };
}
```

---

## 4. Base Layers per Temperature Band

### 4.1 FROZEN (−30°C to −11°C)
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

### 4.2 COLD (−10°C to 0°C)
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

### 4.3 CHILLY (0°C to 10°C)
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

### 4.4 COOL (10°C to 15°C)
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

### 4.5 MILD (15°C to 20°C)
```
Category | Item                  | Required | Notes
---------|-----------------------|----------|------------------------------------------
base     | t-shirt               | Yes      | short-sleeve
legs     | long pants            | Yes      | jeans, chinos, leggings
feet     | closed shoes          | Yes      | sneakers
outer    | light jacket          | Optional | cardigan or windbreaker
head     | hat                   | Optional | cap
```

### 4.6 WARM (20°C to 25°C)
```
Category | Item                  | Required | Notes
---------|-----------------------|----------|------------------------------------------
base     | t-shirt               | Yes      | short-sleeve
legs     | shorts or light pants | Yes      | breathable fabric
feet     | sneakers or sandals   | Yes      | open-toed OK
outer    | light cardigan        | Optional | for air conditioning
head     | hat                   | Optional | sun hat or cap
```

### 4.7 HOT (25°C to 35°C)
```
Category | Item                  | Required | Notes
---------|-----------------------|----------|------------------------------------------
base     | t-shirt               | Yes      | short-sleeve, breathable
legs     | shorts                | Yes      | light fabric
feet     | sandals               | Yes      | open-toed
head     | sun hat               | Yes      | wide-brim preferred
hands    | sunglasses            | Optional | UV protection
```

### 4.8 VERY_HOT (35°C+)
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
| CHILLY and below | umbrella | optional |
| COLD and below | waterproof pants | instead of regular pants |
| COOL and below | hood | jacket hood up |

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
| 3–5 | Sunscreen recommended | warning text only |
| 6–7 | Hat recommended | baseball cap or sun hat |
| 8–10 | Hat required + sunglasses | sun hat + UV sunglasses |
| 11+ | Wide-brim hat + sunglasses + sunscreen warning | wide-brim hat + UV sunglasses |

**UV modifier behavior**: adds head/hands items only — does not change temperature-based layers.

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
- If rain/snow: add waterproof outer + compact umbrella
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

1. Temp band: COLD (−10°C to 0°C? No, −12°C → FROZEN band)
   Actually −12°C is below −10°C → COLD band (−10 to 0)
   Wait: −12°C < −10°C → actually COLD band (−10 to 0) doesn't include −12
   Correction: −12°C is in FROZEN band (−30 to −11)? No, −12 > −30 but −12 < −10
   Actually −12°C is between −30 and −11? −12 < −11 so yes → FROZEN band

2. Base layers (FROZEN + child):
   - thermal underwear, thermal shirt, fleece, heavy winter coat,
   - snow pants, insulated winter boots, knit hat, insulated mittens,
   - glove liners, thermal leggings

3. Precipitation modifier (snow):
   - snow pants already in base
   - insulated boots already in base
   - waterproof gloves → upgrade mittens to waterproof mittens

4. Wind modifier (15 km/h ≈ 4.2 m/s):
   - Not above 8 m/s threshold → no change

5. Activity modifier (school):
   - Conservative coverage: long sleeves, long pants → already satisfied
   - Closed-toe shoes → boots satisfy this

6. UV modifier (UV 2): None

7. Final outfit:
   - thermal underwear, thermal shirt, fleece, heavy winter coat,
   - snow pants, insulated winter boots, knit hat, waterproof mittens,
   - glove liners, thermal leggings

Rationale: "It's −12°C and snowing, so we recommend a full winter outfit for school. Warm layers to stay dry and protected."
Confidence: 0.95
Warnings: []
```

### Example B: Warm Sunny Day — Adult Playground
```
Weather: 28°C, sunny, wind 5 km/h, UV 8 (very high)
Activity: playground
Person: adult

1. Temp band: WARM (20°C to 25°C)? 28°C → HOT (25°C to 35°C)

2. Base layers (HOT + adult):
   - t-shirt, shorts, sandals

3. Precipitation modifier: None

4. Wind modifier: 5 km/h ≈ 1.4 m/s → None

5. Activity modifier (playground):
   - Closed-toe shoes → replace sandals with sneakers
   - Long pants? No (temp ≥ 25°C): shorts allowed

6. UV modifier (UV 8):
   - Hat required → sun hat
   - Sunglasses recommended → UV sunglasses

7. Final outfit:
   - t-shirt, shorts, sneakers, sun hat, UV sunglasses

Rationale: "It's 28°C and sunny with very high UV, so wear light, breathable clothing. A cap and sunglasses will help with sun protection."
Confidence: 0.90
Warnings: ["High UV index — apply sunscreen", "Wear a hat for extra sun protection"]
```

### Example C: Rainy Cool Day — Adult Commute
```
Weather: 8°C, raining, wind 10 km/h, UV 4 (moderate)
Activity: commute
Person: adult

1. Temp band: CHILLY (0°C to 10°C)

2. Base layers (CHILLY + adult):
   - long-sleeve shirt, light jacket, long pants, closed shoes

3. Precipitation modifier (rain):
   - waterproof outer layer → replace light jacket with raincoat
   - waterproof footwear → replace closed shoes with boots
   - umbrella → add to accessories (future v2)

4. Wind modifier (10 km/h ≈ 2.8 m/s): None

5. Activity modifier (commute):
   - Layering system: base + mid + outer → satisfied
   - Compact: raincoat folds into bag → no change

6. UV modifier (UV 4): Sunscreen recommended → warning text

7. Final outfit:
   - long-sleeve shirt, raincoat, long pants, boots

Rationale: "It's 8°C and raining, so wear a raincoat over your layers with waterproof boots."
Confidence: 0.92
Warnings: ["Moderate UV index — sunscreen recommended"]
```

---

## 10. Confidence Calculation

```typescript
function calculateConfidence(ctx: RuleContext): number {
  let confidence = 1.0;

  // Reduce confidence for extreme conditions
  if (ctx.tempBand === 'FROZEN' || ctx.tempBand === 'VERY_HOT') {
    confidence -= 0.05; // extreme temps need human judgment
  }

  // Reduce confidence for mixed precipitation
  if (ctx.precipType === 'sleet' || ctx.precipType === 'hail') {
    confidence -= 0.10; // ambiguous precipitation
  }

  // Reduce confidence for high wind
  if (ctx.windSpeed > 10) {
    confidence -= 0.05; // wind chill factor varies
  }

  // Reduce confidence for poor visibility
  if (ctx.visibility < 5) {
    confidence -= 0.05;
  }

  return Math.max(0.1, Math.min(1.0, confidence));
}
```

---

## 11. Warnings Generation

```typescript
function generateWarnings(ctx: RuleContext): string[] {
  const warnings: string[] = [];

  // UV warnings
  if (ctx.uvMeaning >= UV_MEANING.HIGH) {
    warnings.push('High UV index — apply sunscreen');
  }
  if (ctx.uvMeaning >= UV_MEANING.VERY_HIGH) {
    warnings.push('Very high UV — wear a wide-brim hat');
  }

  // Temperature warnings
  if (ctx.tempBand === 'FROZEN') {
    warnings.push('Extreme cold — limit outdoor exposure');
  }
  if (ctx.tempBand === 'VERY_HOT') {
    warnings.push('Heat warning — stay hydrated');
  }

  // Air quality warnings
  if (ctx.airQualityIndex > 150) {
    warnings.push('Poor air quality — consider indoor activities');
  }

  // Precipitation warnings
  if (ctx.precipType === 'snow' && ctx.snowDepth > 10) {
    warnings.push('Heavy snow — boots recommended');
  }

  return warnings;
}
```

---

## 12. Rationale Generation

The rationale is a human-readable sentence explaining why this outfit was chosen:

```
Template: "It's {temperature}°C and {condition}, {activity-specific note}, so we recommend {item summary} for {person}."

Examples:
- "It's −12°C and snowing, so we recommend a full winter outfit for school. Warm layers to stay dry and protected."
- "It's 28°C and sunny with very high UV, so wear light, breathable clothing. A cap and sunglasses will help with sun protection."
- "It's 8°C and raining, so wear a raincoat over your layers with waterproof boots."
```

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
If both temperature and precipitation suggest footwear, use the more protective one (e.g., insulated boots over sneakers).

### 13.3 Layer Conflicts
- Only one item per category per layer (e.g., can't have two "base layer" items for feet)
- If conflict arises, keep the item with higher `required` flag

### 13.4 Extensibility
New rules can be added by:
1. Adding a new modifier function (e.g., `applyAirQualityModifier`)
2. Calling it in `recommendOutfit` between steps 5–7
3. Documenting the rule in this document

---

## 14. Future Considerations

| Idea | Status | Notes |
|------|--------|-------|
| Multi-day outfit carousel | Planned | Use `daily` forecast for 7-day preview |
| Accessories (scarf, umbrella) | Planned | v2 feature — optional items |
| Customization | Not planned | MVP keeps generated avatar fixed |
| Season modifier | Future | "Spring wardrobe" vs "Winter wardrobe" presets |
| Weighted rules | Future | Allow power users to prioritize warmth vs. breathability |

---

This document defines the complete rule-based recommendation engine for Mom Recommends. All logic is frontend-side, testable, and provider-independent.