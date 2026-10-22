/**
 * Clothing overlays: maps an item `slug` (OutfitItem.name) to flat SVG shapes
 * drawn on top of AvatarBase (D11 in-house assets, deterministic).
 * Colors are stylistic only; the item's role (shape + placement) is what
 * carries meaning for the recommendation.
 */
import type { ReactNode } from 'react'

/* ---------------------------------- primitives ---------------------------------- */

function Torso({
  color,
  sleeves = 'long',
  hem,
  children,
}: {
  color: string
  sleeves?: 'short' | 'long'
  hem?: string
  children?: ReactNode
}) {
  return (
    <g>
      {sleeves === 'long' && (
        <>
          <path d="M60 60 h15 v74 h-21 v-66 a9 9 0 0 1 6 -8 Z" fill={color} />
          <path d="M85 60 h15 v74 h-21 v-66 a9 9 0 0 1 6 -8 Z" fill={color} />
        </>
      )}
      <path d="M62 57 L98 57 L107 90 L101 126 L59 126 L53 90 Z" fill={color} />
      {sleeves === 'short' && (
        <>
          <path d="M53 88 L60 58 L52 78 Z" fill={color} />
          <path d="M107 88 L100 58 L108 78 Z" fill={color} />
        </>
      )}
      {hem && <rect x="60" y="120" width="40" height="6" rx="3" fill={hem} />}
      {children}
    </g>
  )
}

function Legs({
  color,
  length = 'long',
  children,
}: {
  color: string
  length?: 'short' | 'long'
  children?: ReactNode
}) {
  const toY = length === 'short' ? 142 : 188
  return (
    <g>
      <rect x="60" y="118" width="18" height={toY - 118} rx="6" fill={color} />
      <rect x="82" y="118" width="18" height={toY - 118} rx="6" fill={color} />
      {children}
    </g>
  )
}

function Boots({ color }: { color: string }) {
  return (
    <g>
      <path d="M62 158 h16 v26 a6 6 0 0 1 -6 6 h-5 a5 5 0 0 1 -5 -5 Z" fill={color} />
      <path d="M82 158 h16 v26 a6 6 0 0 1 -6 6 h-5 a5 5 0 0 1 -5 -5 Z" fill={color} />
    </g>
  )
}

function Sneakers({ color }: { color: string }) {
  return (
    <g>
      <rect x="58" y="184" width="24" height="10" rx="5" fill={color} />
      <rect x="58" y="190" width="24" height="4" rx="2" fill="#b9bec7" />
      <rect x="78" y="184" width="24" height="10" rx="5" fill={color} />
      <rect x="78" y="190" width="24" height="4" rx="2" fill="#b9bec7" />
    </g>
  )
}

function Sandals({ color }: { color: string }) {
  return (
    <g>
      <rect x="58" y="188" width="22" height="5" rx="2.5" fill={color} />
      <rect x="80" y="188" width="22" height="5" rx="2.5" fill={color} />
      <path d="M62 180 h4 v10 h-4 Z M68 180 h4 v10 h-4 Z" fill={color} />
      <path d="M84 180 h4 v10 h-4 Z M90 180 h4 v10 h-4 Z" fill={color} />
    </g>
  )
}

function Sunglasses() {
  return (
    <g>
      <rect x="66" y="22" width="10" height="6" rx="2" fill="#2b2f36" />
      <rect x="84" y="22" width="10" height="6" rx="2" fill="#2b2f36" />
      <path d="M76 24 h8" stroke="#2b2f36" strokeWidth="2" />
      <path d="M66 23 h-3 M94 23 h3" stroke="#2b2f36" strokeWidth="2" />
    </g>
  )
}

/* ---------------------------------- slug → overlay ---------------------------------- */

export function ClothingOverlay({ slug }: { slug: string }) {
  switch (slug) {
    // base layers
    case 'tshirt':
      return <Torso color="#7cc4f0" sleeves="short" />
    case 'thermal_underwear':
      return <Torso color="#d98888" sleeves="long" hem="#b96262" />
    case 'thermal_shirt':
      return <Torso color="#d98888" sleeves="long" />
    case 'long_sleeve_shirt':
      return <Torso color="#a8c8e8" sleeves="long" />
    case 'fleece':
      return <Torso color="#8fa3c9" sleeves="long" hem="#6f83a8" />
    case 'sweater':
      return <Torso color="#a87cb8" sleeves="long" hem="#8a5a9e" />

    // legs
    case 'thermal_leggings':
      return <Legs color="#b96262" />
    case 'long_pants':
      return <Legs color="#3d5a80" />
    case 'insulated_pants':
      return <Legs color="#334a63" />
    case 'snow_pants':
      return (
        <Legs color="#4a79a8">
          <rect x="58" y="116" width="44" height="8" rx="4" fill="#4a79a8" />
        </Legs>
      )
    case 'shorts':
      return <Legs color="#4a6fa5" length="short" />

    // outer layers
    case 'light_jacket':
      return (
        <Torso color="#98a8b8" sleeves="long">
          <path d="M80 60 v60" stroke="#7d8c9c" strokeWidth="2" />
        </Torso>
      )
    case 'insulated_jacket':
      return (
        <Torso color="#3f7d9e" sleeves="long">
          <path d="M80 60 v60" stroke="#2c5e79" strokeWidth="2" />
          <circle cx="80" cy="110" r="1.5" fill="#e8eef4" />
        </Torso>
      )
    case 'heavy_winter_coat':
      return (
        <Torso color="#2f5d7a" sleeves="long">
          <path d="M80 58 v66" stroke="#1f4358" strokeWidth="2" />
          <rect x="70" y="56" width="20" height="8" rx="4" fill="#1f4358" />
        </Torso>
      )
    case 'raincoat':
      return (
        <Torso color="#e8cf4e" sleeves="long">
          <path d="M62 57 q18 -10 36 0 Z" fill="#e8cf4e" />
          <circle cx="80" cy="112" r="1.5" fill="#c9b02f" />
        </Torso>
      )
    case 'windbreaker':
      return (
        <Torso color="#a5c4e0" sleeves="long">
          <path d="M80 60 v60" stroke="#7fa2c2" strokeWidth="2" />
        </Torso>
      )
    case 'light_cardigan':
      return (
        <Torso color="#c98a5a" sleeves="long">
          <path d="M80 62 v58" stroke="#b06f40" strokeWidth="2" />
          <circle cx="74" cy="90" r="1.5" fill="#8a5330" />
          <circle cx="86" cy="110" r="1.5" fill="#8a5330" />
        </Torso>
      )

    // feet
    case 'closed_shoes':
    case 'sneakers':
      return <Sneakers color="#e8eaf0" />
    case 'sandals':
      return <Sandals color="#c9a87a" />
    case 'waterproof_boots':
      return <Boots color="#5a6650" />
    case 'insulated_boots':
    case 'insulated_winter_boots':
      return <Boots color="#4a3728" />

    // head
    case 'knit_hat':
      return <KnitHat />
    case 'hat':
      return <Cap />
    case 'sun_hat':
      return <SunHat />
    case 'wide_brim_hat':
      return <WideBrimHat />
    case 'hood':
      return <Hood />
    case 'face_covering':
      return (
        <g>
          <rect x="70" y="28" width="20" height="12" rx="4" fill="#9aa5b0" />
          <rect x="70" y="36" width="20" height="4" rx="2" fill="#7d8a97" />
        </g>
      )

    // hands + accessories
    case 'gloves':
    case 'insulated_mittens':
    case 'waterproof_mittens':
    case 'glove_liners':
    case 'light_gloves':
      return <Mittens color={slug.includes('waterproof') ? '#5a7a9a' : '#a06a8a'} />
    case 'sunglasses':
      return <Sunglasses />
    case 'scarf':
      return (
        <g>
          <rect x="66" y="42" width="28" height="8" rx="4" fill="#c86a3a" />
          <path d="M84 44 h6 v20 h-6 Z" fill="#c86a3a" />
        </g>
      )
    default:
      return null
  }
}

/* headwear primitives (defined after the switch for readability) */

function KnitHat() {
  return (
    <g>
      <path d="M62 24 a18 18 0 0 1 36 0 v2 h-36 Z" fill="#b0515c" />
      <rect x="62" y="24" width="36" height="6" rx="3" fill="#8f3f49" />
      <circle cx="80" cy="8" r="5" fill="#c96a76" />
    </g>
  )
}

function Cap() {
  return (
    <g>
      <path d="M62 24 a18 18 0 0 1 36 0 Z" fill="#5a8ac0" />
      <path d="M74 22 h30 l-8 -5 Z" fill="#3f6ba0" />
      <rect x="62" y="23" width="36" height="5" rx="2.5" fill="#3f6ba0" />
    </g>
  )
}

function SunHat() {
  return (
    <g>
      <ellipse cx="80" cy="26" rx="24" ry="6" fill="#e8c87a" />
      <path d="M68 24 a12 14 0 0 1 24 0 Z" fill="#d9a65e" />
    </g>
  )
}

function WideBrimHat() {
  return (
    <g>
      <ellipse cx="80" cy="28" rx="28" ry="7" fill="#d9a65e" />
      <path d="M70 26 a10 12 0 0 1 20 0 Z" fill="#b8803f" />
    </g>
  )
}

function Hood() {
  return (
    <path
      d="M62 18 a24 24 0 0 1 36 0 v12 h-36 Z"
      fill="#8fa3c9"
      opacity="0.95"
    />
  )
}

function Mittens({ color }: { color: string }) {
  return (
    <g>
      <rect x="50" y="120" width="16" height="14" rx="7" fill={color} />
      <rect x="50" y="121" width="16" height="4" rx="2" fill="#7d4f6e" />
      <rect x="94" y="120" width="16" height="14" rx="7" fill={color} />
      <rect x="94" y="121" width="16" height="4" rx="2" fill="#7d4f6e" />
    </g>
  )
}