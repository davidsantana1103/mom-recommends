/**
 * Neutral flat-SVG base figure (D11 in-house asset, D12 gender-neutral).
 * Coordinates live in a 160×220 viewBox; clothing overlays are drawn on top.
 */
export function AvatarBase() {
  return (
    <g aria-hidden="true">
      {/* legs (bare skin showing when wearing shorts) */}
      <rect x="63" y="118" width="15" height="72" rx="7" fill="#f2c9a0" />
      <rect x="82" y="118" width="15" height="72" rx="7" fill="#f2c9a0" />

      {/* feet */}
      <ellipse cx="70" cy="192" rx="10" ry="6" fill="#f2c9a0" />
      <ellipse cx="90" cy="192" rx="10" ry="6" fill="#f2c9a0" />

      {/* neck + torso base */}
      <rect x="74" y="38" width="12" height="16" rx="3" fill="#f2c9a0" />
      <path
        d="M61 64 C61 58 66 54 74 54 H86 C93 54 98 58 99 66 L100 100 L98 126 H62 L60 100 Z"
        fill="#f2c9a0"
      />

      {/* arms (bare skin when wearing short sleeves) */}
      <path d="M61 62 h14 v64 h-16 v-56 a6 6 0 0 1 2 -8 Z" fill="#f2c9a0" />
      <path d="M85 62 h14 v64 h-16 v-56 a6 6 0 0 1 2 -8 Z" fill="#f2c9a0" />

      {/* hands */}
      <circle cx="58" cy="130" r="7" fill="#f2c9a0" />
      <circle cx="102" cy="130" r="7" fill="#f2c9a0" />

      {/* head */}
      <circle cx="80" cy="26" r="18" fill="#f2c9a0" />
      {/* hair (simple cap line) */}
      <path d="M62 22 a18 18 0 0 1 36 0" fill="#4a3328" stroke="none" />
      {/* face */}
      <circle cx="73" cy="25" r="1.6" fill="#3a2a20" />
      <circle cx="87" cy="25" r="1.6" fill="#3a2a20" />
      <path d="M74 32 q6 5 12 0" stroke="#3a2a20" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  )
}