/**
 * Avatar renderer (architecture §3.5, D11/D12).
 * Flat, layered SVG: the neutral base figure plus one overlay per outfit item,
 * rendered in the deterministic engine order (layer → category → name).
 * Person only changes scale; gender-neutral (D12).
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