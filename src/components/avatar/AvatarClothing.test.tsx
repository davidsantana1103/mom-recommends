/**
 * Every outfit item the engine can recommend must have a visual overlay (D11).
 * The set of items is defined by the i18n keys under `items`; this test fails
 * if a new item is added without its SVG (which would render as a bare figure).
 */
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ClothingOverlay } from '@/components/avatar/AvatarClothing'
import en from '@/i18n/locales/en.json'

const slugs = Object.keys(en.items)

describe('ClothingOverlay', () => {
  it('has at least one overlay per catalog item', () => {
    expect(slugs.length).toBeGreaterThan(0)
    for (const slug of slugs) {
      const { container } = render(<ClothingOverlay slug={slug} />)
      expect(container.firstElementChild, `no overlay rendered for "${slug}"`).not.toBeNull()
    }
  })

  it('returns nothing for an unknown slug', () => {
    const { container } = render(<ClothingOverlay slug="not_a_real_item" />)
    expect(container.firstElementChild).toBeNull()
  })
})
