import { useId } from 'react'
import { motion, type Transition } from 'motion/react'
import { svg } from '../ui'

/* Shared eye/pupil drawings for the pupils and toxidrome widgets. */

export type PupilSize = 'small' | 'normal' | 'large'

/** Iris radius in EyeGlyph units. Pupil radii are given in the same units. */
export const IRIS_R = 26

// Almond-shaped lid opening around (0,0), ~144 × 54 units.
const ALMOND = 'M -72 0 C -46 -37 46 -37 72 0 C 46 33 -46 33 -72 0 Z'
const UPPER_LID = 'M -72 0 C -46 -37 46 -37 72 0'
const CREASE = 'M -58 -21 C -32 -47 32 -47 58 -21'

const STRIATIONS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2
  const c = Math.cos(a)
  const s = Math.sin(a)
  return `M ${(c * 9).toFixed(2)} ${(s * 9).toFixed(2)} L ${(c * (IRIS_R - 3)).toFixed(2)} ${(s * (IRIS_R - 3)).toFixed(2)}`
}).join(' ')

/** Light sclera in both themes (falls back to the attribute colour if light-dark() is unsupported). */
const SCLERA_FILL = '#efede8'
const SCLERA_STYLE = { fill: 'light-dark(#f4f2ee, #ccd2dd)' }

/**
 * Schematic eye drawn around (x, y) for use inside a parent <svg>.
 * `pupil` is the pupil radius (units, iris radius is IRIS_R); it animates with `transition`.
 */
export function EyeGlyph({
  x = 0,
  y = 0,
  pupil,
  transition,
  glow = 0,
}: {
  x?: number
  y?: number
  pupil: number
  transition: Transition
  /** 0–1: warm light reflection on the eye (light-reaction test). */
  glow?: number
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const clip = `${uid}-clip`
  const iris = `${uid}-iris`
  const light = `${uid}-light`
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={clip}>
          <path d={ALMOND} />
        </clipPath>
        <radialGradient id={iris}>
          <stop offset="0%" stopColor="#8fbfd0" />
          <stop offset="55%" stopColor="#5f95ab" />
          <stop offset="100%" stopColor="#3b6a80" />
        </radialGradient>
        <radialGradient id={light}>
          <stop offset="0%" stopColor="#fff6c9" stopOpacity="0.2" />
          <stop offset="40%" stopColor="#fde68a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={ALMOND} fill={SCLERA_FILL} style={SCLERA_STYLE} />
      <g clipPath={`url(#${clip})`}>
        <circle r={IRIS_R} fill={`url(#${iris})`} />
        <path d={STRIATIONS} stroke="#2f5568" strokeOpacity={0.35} strokeWidth={1.1} strokeLinecap="round" />
        <circle r={IRIS_R - 0.8} fill="none" stroke="#2a4a5b" strokeOpacity={0.7} strokeWidth={1.8} />
        <motion.circle initial={false} animate={{ r: pupil }} transition={transition} fill="#101216" />
        <circle cx={-8.5} cy={-8.5} r={3.4} fill="#ffffff" opacity={0.85} />
        <circle cx={-3} cy={-12} r={1.4} fill="#ffffff" opacity={0.6} />
        {/* soft shadow under the upper lid */}
        <path d={UPPER_LID} fill="none" stroke="#1b2430" strokeOpacity={0.12} strokeWidth={9} />
        <motion.circle
          r={64}
          fill={`url(#${light})`}
          initial={false}
          animate={{ opacity: glow }}
          transition={{ duration: glow ? 0.18 : 0.6, ease: 'easeOut' }}
        />
      </g>
      <path d={ALMOND} fill="none" stroke={svg.dim} strokeWidth={2} strokeLinejoin="round" />
      <path d={CREASE} fill="none" stroke={svg.dim} strokeOpacity={0.45} strokeWidth={1.75} strokeLinecap="round" />
    </g>
  )
}

const MINI_PUPIL: Record<PupilSize, number> = { small: 1.9, normal: 3.6, large: 5.9 }

/** Tiny iris + pupil icon (20 px) for chips; uses currentColor. */
export function MiniPupil({ size, className = 'h-5 w-5' }: { size: PupilSize; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <circle cx={10} cy={10} r={8.3} fill="currentColor" fillOpacity={0.14} stroke="currentColor" strokeWidth={1.5} />
      <circle cx={10} cy={10} r={MINI_PUPIL[size]} fill="currentColor" />
    </svg>
  )
}
