/**
 * Phase 1 i18n = English + Spanish (D17). Missing keys fall back to English
 * (with a warning), but the phase goal is full parity — this test enforces it.
 */
import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en.json'
import es from '@/i18n/locales/es.json'

type JsonObject = Record<string, unknown>

function flatten(obj: JsonObject, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flatten(value as JsonObject, path)
    }
    return [path]
  })
}

describe('locale parity (D17)', () => {
  it('English and Spanish expose the exact same key sets', () => {
    const enKeys = flatten(en as JsonObject).sort()
    const esKeys = flatten(es as JsonObject).sort()

    const missingInEs = enKeys.filter((k) => !esKeys.includes(k))
    const extraInEs = esKeys.filter((k) => !enKeys.includes(k))

    expect(missingInEs, `keys missing in es.json: ${missingInEs.join(', ')}`).toEqual([])
    expect(extraInEs, `extra keys in es.json: ${extraInEs.join(', ')}`).toEqual([])
  })

  it('translations keep interpolation placeholders aligned', () => {
    const placeholders = (s: string) => [...s.matchAll(/\{\{\w+\}\}/g)].map((m) => m[0]).sort()
    const enKeys = flatten(en as JsonObject)
    for (const key of enKeys) {
      const enValue = key.split('.').reduce<unknown>((o, k) => (o as JsonObject)[k], en)
      const esValue = key.split('.').reduce<unknown>((o, k) => (o as JsonObject)[k], es)
      if (typeof enValue === 'string') {
        expect(
          placeholders(esValue as string),
          `placeholder mismatch in es.json:${key}`,
        ).toEqual(placeholders(enValue))
      }
    }
  })
})