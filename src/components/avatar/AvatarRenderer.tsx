/**
 * Avatar renderer (architecture §3.5, D11/D12).
 * Flat, layered SVG: a soft backdrop, a ground shadow, the neutral base figure,
 * then one overlay per outfit item in the deterministic engine order
 * (layer → category → name). Person only changes scale; gender-neutral (D12).
 */
import type { OutfitItem, Person } from '@/types/outfit'
import { compareItems } from '@/engine/items'
import { AvatarBase } from '@/components/avatar/AvatarBase'
import { ClothingOverlay } from '@/components/avatar/AvatarClothing'

export function AvatarRenderer({
  items,
  person,
  label,
}: {
  items: OutfitItem[]
  person: Person
  label: string
}) {
  const sorted = [...items].sort(compareItems)
  return (
    <svg
      viewBox="0 0 160 220"
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      {/* backdrop + ground shadow give the figure depth on any card background */}
      <rect x="0" y="0" width="160" height="220" rx="20" fill="#eaf2fb" />
      <ellipse cx="80" cy="197" rx="42" ry="9" fill="#cfdcea" opacity="0.9" />
      <g transform={person === 'child' ? 'translate(17.5 48.4) scale(0.78)' : undefined}>
        <AvatarBase />
        {sorted.map((item) => (
          <g key={item.name} data-item={item.name}>
            <ClothingOverlay slug={item.name} />
          </g>
        ))}
      </g>
    </svg>
  )
}