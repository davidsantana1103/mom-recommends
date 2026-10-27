/**
 * Clothing overlays: maps an item `slug` (OutfitItem.name) to flat SVG shapes
 * drawn on top of AvatarBase (D11 in-house assets, deterministic).
 *
 * Each garment is a filled silhouette with a darker outline (`shade(color,
 * -0.3)`) and a lighter sheen (`shade(color, +0.3)`), so items read as
 * distinct objects instead of flat color blocks. Colors are stylistic only;
 * the item's role (shape + placement) is what carries meaning (D04).
 */
import type { ReactNode } from 'react'
import { shade } from '@/components/avatar/color'

/* ---------------------------------- primitives ---------------------------------- */

/** Torso + sleeves. `length: 'long'` extends the coat past the waist. */
function Torso({
  color,
  sleeves = 'long',
  length = 'waist',
  children,
}: {
  color: string
  sleeves?: 'short' | 'long'
  length?: 'waist' | 'long'
  children?: ReactNode
}) {
  const outline = shade(color, -0.3)
  const light = shade(color, 0.3)
  const body =
    length === 'long'
      ? 'M60 72 Q60 63 69 62 L91 62 Q100 63 100 72 L103 100 L104 142 Q80 149 56 142 L57 100 Z'
      : 'M60 72 Q60 63 69 62 L91 62 Q100 63 100 72 L103 100 L100 125 Q80 131 60 125 L57 100 Z'

  return (
    <g>
      {/* sleeves: a thick dark stroke under a color stroke gives a clean outline */}
      <g fill="none" strokeLinecap="round">
        {sleeves === 'long' ? (
          <>
            <path d="M65 70 L55 120" stroke={outline} strokeWidth={15.4} />
            <path d="M95 70 L105 120" stroke={outline} strokeWidth={15.4} />
            <path d="M65 70 L55 120" stroke={color} strokeWidth={13} />
            <path d="M95 70 L105 120" stroke={color} strokeWidth={13} />
          </>
        ) : (
          <>
            <path d="M64 71 L60 90" stroke={outline} strokeWidth={15.4} />
            <path d="M96 71 L100 90" stroke={outline} strokeWidth={15.4} />
            <path d="M64 71 L60 90" stroke={color} strokeWidth={13} />
            <path d="M96 71 L100 90" stroke={color} strokeWidth={13} />
          </>
        )}
      </g>

      <path d={body} fill={color} stroke={outline} strokeWidth={1.2} strokeLinejoin="round" />

      {/* neckline + left-chest sheen */}
      <path d="M69 63 Q80 71 91 63" fill="none" stroke={outline} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M64 78 Q64 71 70 68" fill="none" stroke={light} strokeWidth={2.2} strokeLinecap="round" opacity={0.65} />
      {children}
    </g>
  )
}

/** Two legs joined at the hip. `length: 'short'` stops above the knee. */
function Legs({
  color,
  length = 'long',
  children,
}: {
  color: string
  length?: 'short' | 'long'
  children?: ReactNode
}) {
  const outline = shade(color, -0.3)
  const toY = length === 'short' ? 140 : 183
  return (
    <g>
      <g fill="none" strokeLinecap="round">
        <path d={`M71 122 L69 ${toY}`} stroke={outline} strokeWidth={20.6} />
        <path d={`M89 122 L91 ${toY}`} stroke={outline} strokeWidth={20.6} />
        <path d={`M71 122 L69 ${toY}`} stroke={color} strokeWidth={18} />
        <path d={`M89 122 L91 ${toY}`} stroke={color} strokeWidth={18} />
      </g>
      <path
        d="M60 114 Q80 120 100 114 L100 126 Q80 132 60 126 Z"
        fill={color}
        stroke={outline}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {children}
    </g>
  )
}

function Boots({ color, cuff }: { color: string; cuff?: string }) {
  const outline = shade(color, -0.3)
  const sole = shade(color, -0.45)
  return (
    <g>
      {cuff && (
        <>
          <rect x="61" y="152" width="18" height="7" rx="3.5" fill={cuff} />
          <rect x="81" y="152" width="18" height="7" rx="3.5" fill={cuff} />
        </>
      )}
      <g stroke={outline} strokeWidth={1.2} strokeLinejoin="round">
        <rect x="62" y="156" width="16" height="24" rx="3" fill={color} />
        <rect x="82" y="156" width="16" height="24" rx="3" fill={color} />
        <rect x="57" y="176" width="26" height="14" rx="7" fill={color} />
        <rect x="77" y="176" width="26" height="14" rx="7" fill={color} />
      </g>
      <rect x="57" y="186" width="26" height="4" rx="2" fill={sole} />
      <rect x="77" y="186" width="26" height="4" rx="2" fill={sole} />
    </g>
  )
}

function Sneakers({ color }: { color: string }) {
  const outline = shade(color, -0.3)
  return (
    <g>
      <g stroke={outline} strokeWidth={1.2} strokeLinejoin="round">
        <rect x="56" y="177" width="28" height="13" rx="6" fill={color} />
        <rect x="76" y="177" width="28" height="13" rx="6" fill={color} />
      </g>
      <rect x="56" y="186" width="28" height="4" rx="2" fill="#d3d7de" />
      <rect x="76" y="186" width="28" height="4" rx="2" fill="#d3d7de" />
      <path
        d="M62 182 l6 -4 M70 182 l6 -4 M82 182 l6 -4 M90 182 l6 -4"
        stroke={shade(color, -0.4)}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </g>
  )
}

function Sandals({ color }: { color: string }) {
  const outline = shade(color, -0.35)
  return (
    <g stroke={outline} strokeWidth={1.1} strokeLinejoin="round">
      <rect x="56" y="184" width="28" height="6" rx="3" fill={color} />
      <rect x="76" y="184" width="28" height="6" rx="3" fill={color} />
      <path d="M62 184 v-7 M70 184 v-7" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <path d="M82 184 v-7 M90 184 v-7" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}

function Mittens({ color }: { color: string }) {
  const outline = shade(color, -0.3)
  const cuff = shade(color, 0.18)
  return (
    <g stroke={outline} strokeWidth={1.2}>
      <rect x="46" y="119" width="17" height="18" rx="8.5" fill={color} />
      <rect x="97" y="119" width="17" height="18" rx="8.5" fill={color} />
      <rect x="46" y="119" width="17" height="6" rx="3" fill={cuff} />
      <rect x="97" y="119" width="17" height="6" rx="3" fill={cuff} />
    </g>
  )
}

function Gloves({ color }: { color: string }) {
  const outline = shade(color, -0.3)
  const cuff = shade(color, 0.18)
  return (
    <g>
      <g stroke={outline} strokeWidth={1.2}>
        <rect x="46" y="118" width="17" height="19" rx="7" fill={color} />
        <rect x="97" y="118" width="17" height="19" rx="7" fill={color} />
        <rect x="46" y="118" width="17" height="6" rx="3" fill={cuff} />
        <rect x="97" y="118" width="17" height="6" rx="3" fill={cuff} />
      </g>
      <path
        d="M51 124 v10 M56 124 v10 M102 124 v10 M107 124 v10"
        stroke={outline}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </g>
  )
}

function Sunglasses() {
  return (
    <g fill="#2b2f36" stroke="#2b2f36" strokeWidth={1.6}>
      <rect x="66" y="33" width="12" height="8" rx="3" />
      <rect x="82" y="33" width="12" height="8" rx="3" />
      <path d="M78 36 h4" fill="none" />
      <path d="M66 35 h-4 M94 35 h4" fill="none" />
    </g>
  )
}

/* headwear primitives (defined after the switch for readability) */

function KnitHat({ color }: { color: string }) {
  const outline = shade(color, -0.3)
  return (
    <g stroke={outline} strokeWidth={1.2} strokeLinejoin="round">
      <path d="M60 34 Q60 14 80 14 Q100 14 100 34 Z" fill={color} />
      <rect x="58" y="30" width="44" height="9" rx="4.5" fill={shade(color, -0.18)} />
      <circle cx="80" cy="11" r="5.5" fill={shade(color, 0.2)} />
      <path
        d="M66 32 v5 M74 32 v5 M86 32 v5 M94 32 v5"
        stroke={shade(color, -0.35)}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </g>
  )
}

function Cap({ color }: { color: string }) {
  const outline = shade(color, -0.3)
  return (
    <g stroke={outline} strokeWidth={1.2} strokeLinejoin="round">
      <path d="M60 34 Q60 16 80 16 Q100 16 100 34 Z" fill={color} />
      <path d="M60 34 Q80 40 100 34 L100 30 Q80 36 60 30 Z" fill={shade(color, -0.18)} />
      <path d="M74 34 Q92 34 101 41 Q93 38 74 38 Z" fill={shade(color, -0.32)} />
      <circle cx="80" cy="15" r="2.6" fill={shade(color, -0.32)} />
    </g>
  )
}

function SunHat({ color }: { color: string }) {
  const outline = shade(color, -0.3)
  return (
    <g stroke={outline} strokeWidth={1.2} strokeLinejoin="round">
      <ellipse cx="80" cy="34" rx="30" ry="8" fill={color} />
      <path d="M66 34 Q66 18 80 18 Q94 18 94 34 Z" fill={shade(color, -0.12)} />
      <path d="M66 30 Q80 36 94 30" fill="none" stroke={shade(color, -0.35)} strokeWidth={2.4} />
    </g>
  )
}

function WideBrimHat({ color }: { color: string }) {
  const outline = shade(color, -0.3)
  return (
    <g stroke={outline} strokeWidth={1.2} strokeLinejoin="round">
      <ellipse cx="80" cy="35" rx="35" ry="9" fill={color} />
      <path d="M68 35 Q68 20 80 20 Q92 20 92 35 Z" fill={shade(color, -0.15)} />
      <path d="M68 32 Q80 38 92 32" fill="none" stroke={shade(color, -0.35)} strokeWidth={2.4} />
    </g>
  )
}

function Hood({ color }: { color: string }) {
  const outline = shade(color, -0.3)
  return (
    <g stroke={outline} strokeWidth={1.2} strokeLinejoin="round">
      <path d="M57 42 Q54 12 80 12 Q106 12 103 42 Q80 31 57 42 Z" fill={color} />
      <path d="M57 42 Q80 31 103 42" fill="none" stroke={shade(color, -0.25)} strokeWidth={2} />
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
      return (
        <Torso color="#d98888" sleeves="long">
          <path d="M80 66 v58" stroke={shade('#d98888', -0.3)} strokeWidth={1.2} strokeDasharray="3 3" />
        </Torso>
      )
    case 'thermal_shirt':
      return (
        <Torso color="#d98888" sleeves="long">
          <path d="M80 66 v58" stroke={shade('#d98888', -0.3)} strokeWidth={1.2} strokeDasharray="3 3" />
        </Torso>
      )
    case 'long_sleeve_shirt':
      return (
        <Torso color="#a8c8e8" sleeves="long">
          <path d="M80 64 v60" stroke={shade('#a8c8e8', -0.35)} strokeWidth={1} />
        </Torso>
      )
    case 'fleece':
      return (
        <Torso color="#8fa3c9" sleeves="long">
          <path d="M80 62 v62" stroke={shade('#8fa3c9', -0.4)} strokeWidth={3} strokeDasharray="1 4" strokeLinecap="round" />
          <rect x="62" y="104" width="16" height="10" rx="3" fill={shade('#8fa3c9', -0.15)} />
          <rect x="82" y="104" width="16" height="10" rx="3" fill={shade('#8fa3c9', -0.15)} />
        </Torso>
      )
    case 'sweater':
      return (
        <Torso color="#a87cb8" sleeves="long">
          <path d="M69 63 Q80 73 91 63" fill="none" stroke={shade('#a87cb8', -0.4)} strokeWidth={2.4} />
          <path
            d="M66 80 h28 M64 92 h32 M63 104 h34"
            stroke={shade('#a87cb8', -0.18)}
            strokeWidth={1.4}
            opacity={0.8}
          />
        </Torso>
      )

    // legs
    case 'thermal_leggings':
      return <Legs color="#b96262" />
    case 'long_pants':
      return (
        <Legs color="#3d5a80">
          <path d="M60 118 h40" stroke={shade('#3d5a80', -0.35)} strokeWidth={1.2} />
          <path d="M70 126 v56 M90 126 v56" stroke={shade('#3d5a80', 0.25)} strokeWidth={1.4} opacity={0.6} />
        </Legs>
      )
    case 'insulated_pants':
      return (
        <Legs color="#334a63">
          <path
            d="M71 128 v52 M89 128 v52"
            stroke={shade('#334a63', 0.28)}
            strokeWidth={1.4}
            strokeDasharray="2 5"
            opacity={0.7}
          />
        </Legs>
      )
    case 'snow_pants':
      return (
        <Legs color="#4a79a8">
          <rect x="57" y="112" width="46" height="12" rx="5" fill="#4a79a8" stroke={shade('#4a79a8', -0.3)} strokeWidth={1.2} />
          <path d="M60 118 h40" stroke={shade('#4a79a8', -0.4)} strokeWidth={1.4} />
        </Legs>
      )
    case 'shorts':
      return <Legs color="#4a6fa5" length="short" />

    // outer layers
    case 'light_jacket':
      return (
        <Torso color="#98a8b8" sleeves="long">
          <path d="M80 64 v60" stroke={shade('#98a8b8', -0.4)} strokeWidth={1.6} />
          <rect x="62" y="100" width="15" height="10" rx="2.5" fill={shade('#98a8b8', -0.16)} />
          <rect x="83" y="100" width="15" height="10" rx="2.5" fill={shade('#98a8b8', -0.16)} />
        </Torso>
      )
    case 'insulated_jacket':
      return (
        <Torso color="#3f7d9e" sleeves="long">
          <path d="M80 62 v62" stroke={shade('#3f7d9e', -0.4)} strokeWidth={2.2} />
          <path
            d="M62 82 h36 M60 94 h40 M60 106 h40"
            stroke={shade('#3f7d9e', -0.25)}
            strokeWidth={1.2}
            opacity={0.8}
          />
          <circle cx="80" cy="88" r="1.6" fill={shade('#3f7d9e', 0.4)} />
          <circle cx="80" cy="100" r="1.6" fill={shade('#3f7d9e', 0.4)} />
        </Torso>
      )
    case 'heavy_winter_coat':
      return (
        <Torso color="#2f5d7a" sleeves="long" length="long">
          <path d="M80 62 v80" stroke={shade('#2f5d7a', -0.45)} strokeWidth={2.4} />
          <path d="M60 96 h40 M58 114 h44" stroke={shade('#2f5d7a', -0.28)} strokeWidth={1.4} />
          <path d="M60 74 Q80 86 100 74 Q100 66 91 63 L69 63 Q60 66 60 74 Z" fill="#e9e2d0" stroke={shade('#2f5d7a', -0.3)} strokeWidth={1.2} />
          <rect x="62" y="130" width="16" height="11" rx="2.5" fill={shade('#2f5d7a', -0.2)} />
          <rect x="82" y="130" width="16" height="11" rx="2.5" fill={shade('#2f5d7a', -0.2)} />
        </Torso>
      )
    case 'raincoat':
      return (
        <Torso color="#e8cf4e" sleeves="long">
          <path d="M80 62 v62" stroke={shade('#e8cf4e', -0.45)} strokeWidth={1.6} />
          <path d="M60 76 Q80 88 100 76 Q100 66 91 63 L69 63 Q60 66 60 76 Z" fill={shade('#e8cf4e', 0.15)} stroke={shade('#e8cf4e', -0.4)} strokeWidth={1.2} />
          <rect x="62" y="98" width="15" height="9" rx="2.5" fill={shade('#e8cf4e', -0.2)} />
          <rect x="83" y="98" width="15" height="9" rx="2.5" fill={shade('#e8cf4e', -0.2)} />
        </Torso>
      )
    case 'windbreaker':
      return (
        <Torso color="#a5c4e0" sleeves="long">
          <path d="M80 64 v60" stroke={shade('#a5c4e0', -0.4)} strokeWidth={1.4} />
          <path d="M60 84 h40" stroke="#eef4fa" strokeWidth={3} />
          <path d="M60 84 h40" stroke={shade('#a5c4e0', -0.35)} strokeWidth={1} />
        </Torso>
      )
    case 'light_cardigan':
      return (
        <Torso color="#c98a5a" sleeves="long">
          <path d="M80 62 v62" stroke={shade('#c98a5a', -0.45)} strokeWidth={3.4} />
          <path d="M74 62 v62 M86 62 v62" stroke={shade('#c98a5a', -0.25)} strokeWidth={1.4} />
          <circle cx="76" cy="84" r="1.7" fill="#f4e0c8" />
          <circle cx="76" cy="100" r="1.7" fill="#f4e0c8" />
          <circle cx="76" cy="116" r="1.7" fill="#f4e0c8" />
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
      return <Boots color="#4a3728" />
    case 'insulated_winter_boots':
      return <Boots color="#4a3728" cuff="#e9e2d0" />

    // head
    case 'knit_hat':
      return <KnitHat color="#b0515c" />
    case 'hat':
      return <Cap color="#5a8ac0" />
    case 'sun_hat':
      return <SunHat color="#e8c87a" />
    case 'wide_brim_hat':
      return <WideBrimHat color="#d9a65e" />
    case 'hood':
      return <Hood color="#8fa3c9" />
    case 'face_covering':
      return (
        <g stroke={shade('#9aa5b0', -0.3)} strokeWidth={1.2}>
          <rect x="68" y="41" width="24" height="14" rx="6" fill="#9aa5b0" />
          <path d="M68 46 h24 M68 51 h24" fill="none" stroke={shade('#9aa5b0', -0.15)} strokeWidth={1} />
          <path d="M62 45 h6 M92 45 h6" fill="none" strokeWidth={2} />
        </g>
      )

    // hands + accessories
    case 'gloves':
    case 'light_gloves':
      return <Gloves color="#a06a8a" />
    case 'glove_liners':
      return <Gloves color="#c9a2b8" />
    case 'insulated_mittens':
      return <Mittens color="#a06a8a" />
    case 'waterproof_mittens':
      return <Mittens color="#5a7a9a" />
    case 'sunglasses':
      return <Sunglasses />
    case 'scarf':
      return (
        <g stroke={shade('#c86a3a', -0.3)} strokeWidth={1.2} strokeLinejoin="round">
          <path d="M65 58 Q80 67 95 58 L95 65 Q80 74 65 65 Z" fill="#c86a3a" />
          <path d="M86 65 h10 v20 l-10 -3 Z" fill="#c86a3a" />
          <path d="M86 71 h10 M86 77 h10" fill="none" stroke={shade('#c86a3a', -0.15)} strokeWidth={1} />
        </g>
      )
    default:
      return null
  }
}