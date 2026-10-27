/**
 * Color helper for the avatar (D11 in-house assets).
 * Derives outline/highlight shades from a single base color so every garment
 * stays visually consistent without hand-picking two hex values per item.
 */

/** amount < 0 darkens toward black, amount > 0 lightens toward white (range -1..1). */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const target = amount < 0 ? 0 : 255
  const p = Math.abs(amount)
  const mix = (c: number) => Math.round((target - c) * p + c)
  const r = mix((n >> 16) & 255)
  const g = mix((n >> 8) & 255)
  const b = mix(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
