/**
 * Neutral flat-SVG base figure (D11 in-house asset, D12 gender-neutral).
 * Coordinates live in a 160×220 viewBox; clothing overlays are drawn on top.
 *
 * Limbs are stroked paths with round caps, so joints stay smooth and the
 * silhouette reads clearly at small sizes.
 */
import { shade } from '@/components/avatar/color'

export const SKIN = '#f0bd92'
export const HAIR = '#4b3626'
const SKIN_LINE = shade(SKIN, -0.28)

export function AvatarBase() {
  return (
    <g aria-hidden="true">
      {/* legs (dark stroke under the skin stroke defines the silhouette) */}
      <g fill="none" strokeLinecap="round">
        <path d="M71 124 L69 183" stroke={SKIN_LINE} strokeWidth={20} />
        <path d="M89 124 L91 183" stroke={SKIN_LINE} strokeWidth={20} />
        <path d="M71 124 L69 183" stroke={SKIN} strokeWidth={18} />
        <path d="M89 124 L91 183" stroke={SKIN} strokeWidth={18} />
      </g>

      {/* feet */}
      <ellipse cx="67.5" cy="189" rx="11" ry="6.5" fill={SKIN} stroke={SKIN_LINE} strokeWidth={1.1} />
      <ellipse cx="92.5" cy="189" rx="11" ry="6.5" fill={SKIN} stroke={SKIN_LINE} strokeWidth={1.1} />

      {/* arms */}
      <g fill="none" strokeLinecap="round">
        <path d="M64 72 L55 121" stroke={SKIN_LINE} strokeWidth={15} />
        <path d="M96 72 L105 121" stroke={SKIN_LINE} strokeWidth={15} />
        <path d="M64 72 L55 121" stroke={SKIN} strokeWidth={13} />
        <path d="M96 72 L105 121" stroke={SKIN} strokeWidth={13} />
      </g>

      {/* hands */}
      <circle cx="54" cy="126" r="6.8" fill={SKIN} stroke={SKIN_LINE} strokeWidth={1.1} />
      <circle cx="106" cy="126" r="6.8" fill={SKIN} stroke={SKIN_LINE} strokeWidth={1.1} />

      {/* torso */}
      <path
        d="M60 72 Q60 63 69 62 L91 62 Q100 63 100 72 L103 100 L100 125 Q80 131 60 125 L57 100 Z"
        fill={SKIN}
        stroke={SKIN_LINE}
        strokeWidth={1.1}
      />

      {/* neck */}
      <rect x="74" y="52" width="12" height="14" rx="5" fill={shade(SKIN, -0.06)} />

      {/* head + ears */}
      <circle cx="60.5" cy="38" r="3.6" fill={SKIN} stroke={SKIN_LINE} strokeWidth={1} />
      <circle cx="99.5" cy="38" r="3.6" fill={SKIN} stroke={SKIN_LINE} strokeWidth={1} />
      <circle cx="80" cy="36" r="20" fill={SKIN} stroke={SKIN_LINE} strokeWidth={1.1} />

      {/* hair */}
      <path d="M59.5 33 Q61 11 80 11 Q99 11 100.5 33 Q94 23 80 23 Q66 23 59.5 33 Z" fill={HAIR} />

      {/* face */}
      <circle cx="73" cy="37" r="1.9" fill="#3a2a20" />
      <circle cx="87" cy="37" r="1.9" fill="#3a2a20" />
      <circle cx="69" cy="43" r="3" fill="#e57373" opacity="0.4" />
      <circle cx="91" cy="43" r="3" fill="#e57373" opacity="0.4" />
      <path
        d="M73.5 43.5 Q80 49 86.5 43.5"
        fill="none"
        stroke="#3a2a20"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </g>
  )
}