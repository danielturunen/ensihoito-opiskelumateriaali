import { Fragment, type ReactNode, type SVGProps } from 'react'
import { svg } from '../ui'

/* Shared, gender-neutral human body silhouette (front + back view) for the body widgets.
 *
 * Coordinate system: every view lives in a 200 × 410 box (BODY_VIEWBOX), body centred on x = 100,
 * head top y ≈ 10, soles y ≈ 404. Shapes are drawn from the VIEWER's point of view:
 *   - front view: the patient's RIGHT side is on the viewer's LEFT (x < 100)
 *   - back view:  the patient's RIGHT side is on the viewer's RIGHT (x > 100)
 * Limbs are drawn once (viewer-left) and mirrored with MIRROR for the other side.
 *
 * Regions are separate paths so widgets can colour / hit-test them independently. Neighbouring
 * regions share their edges exactly; a thin stroke in the card colour (BODY_GAP) separates them. */

export type BodyView = 'front' | 'back'

export type BodyRegion =
  | 'headNeck'
  | 'chest'
  | 'abdomen'
  | 'pelvis'
  | 'upperBack'
  | 'lowerBack'
  | 'armR'
  | 'armL'
  | 'legR'
  | 'legL'

/** `trunk` = chest + abdomen (front) or upper + lower back (back), used with `mergeTrunk`. */
export type BodyPart = BodyRegion | 'trunk'

export interface BodyShape {
  id: BodyPart
  /** Path in shape-local coordinates. */
  d: string
  /** Mirror transform for limbs on the viewer's right side. */
  transform?: string
  /** Visual centre of the shape in VIEW coordinates (already mirrored). */
  anchor: { x: number; y: number }
}

export const BODY_W = 200
export const BODY_H = 410
export const BODY_VIEWBOX = `0 0 ${BODY_W} ${BODY_H}`

/** Flip around the body's vertical midline (x = 100). */
export const MIRROR = 'matrix(-1 0 0 1 200 0)'

/** Opaque neutral body tone for both themes (use via `style={{ fill: BODY_FILL }}`). */
export const BODY_FILL = 'color-mix(in srgb, var(--text) 9%, var(--bg-raised))'
/** Slightly lighter tone, e.g. for panels drawn on top of the body. */
export const BODY_FILL_SOFT = 'color-mix(in srgb, var(--text) 4%, var(--bg-raised))'
/** Width of the separating stroke between regions. */
export const BODY_GAP = 1.6

/* ---------- geometry ---------- */

export const BODY_PATHS = {
  headNeck:
    'M100 10C111.5 10 119 19 119 31C119 41 115 49.5 109.5 54L109.5 63C109.5 67 112 70 116 71.5L84 71.5C88 70 90.5 67 90.5 63L90.5 54C85 49.5 81 41 81 31C81 19 88.5 10 100 10Z',
  /** Upper trunk: chest (front) and upper back (back) share this outline. */
  upperTrunk:
    'M84 71.5L116 71.5C126 72.5 134.5 75 138.5 79.5C141 82.5 141 90 138.5 98L134 148C123 151 111 152.5 100 152.5C89 152.5 77 151 66 148L61.5 98C59 90 59 82.5 61.5 79.5C65.5 75 74 72.5 84 71.5Z',
  abdomen:
    'M66 148C77 151 89 152.5 100 152.5C111 152.5 123 151 134 148C132.5 158 129.5 165 129.5 174C129.5 183 131 190 132 197C122 200.5 111 202 100 202C89 202 78 200.5 68 197C69 190 70.5 183 70.5 174C70.5 165 67.5 158 66 148Z',
  pelvis:
    'M68 197C78 200.5 89 202 100 202C111 202 122 200.5 132 197C133.5 203 134.5 209 134.5 215L104 236.5C102 238 98 238 96 236.5L65.5 215C65.5 209 66.5 203 68 197Z',
  /** Abdomen + pelvis outline (lower back incl. buttocks in the back view). */
  lowerTrunk:
    'M66 148C77 151 89 152.5 100 152.5C111 152.5 123 151 134 148C132.5 158 129.5 165 129.5 174C129.5 183 131 190 132 197C133.5 203 134.5 209 134.5 215L104 236.5C102 238 98 238 96 236.5L65.5 215C65.5 209 66.5 203 68 197C69 190 70.5 183 70.5 174C70.5 165 67.5 158 66 148Z',
  /** Chest + abdomen (front trunk, rule of nines). */
  trunkFront:
    'M84 71.5L116 71.5C126 72.5 134.5 75 138.5 79.5C141 82.5 141 90 138.5 98L134 148C132.5 158 129.5 165 129.5 174C129.5 183 131 190 132 197C122 200.5 111 202 100 202C89 202 78 200.5 68 197C69 190 70.5 183 70.5 174C70.5 165 67.5 158 66 148L61.5 98C59 90 59 82.5 61.5 79.5C65.5 75 74 72.5 84 71.5Z',
  /** Whole back of the trunk incl. buttocks (rule of nines). */
  trunkBack:
    'M84 71.5L116 71.5C126 72.5 134.5 75 138.5 79.5C141 82.5 141 90 138.5 98L134 148C132.5 158 129.5 165 129.5 174C129.5 183 131 190 132 197C133.5 203 134.5 209 134.5 215L104 236.5C102 238 98 238 96 236.5L65.5 215C65.5 209 66.5 203 68 197C69 190 70.5 183 70.5 174C70.5 165 67.5 158 66 148L61.5 98C59 90 59 82.5 61.5 79.5C65.5 75 74 72.5 84 71.5Z',
  /** Viewer-left arm (hangs slightly away from the trunk, palm forward). */
  arm:
    'M67 76C57.5 76.5 51 83 49.5 95C47 116 45.5 137 44 158C42.5 179 39 199 37 219C34 226 31.5 236 32 247C32.5 255 35.5 261 39.5 261C43.5 261 46 255 46.5 247C47 239 48.5 229 50.5 222C53.5 202 57 182 59 160C60.5 140 62.5 121 64 106C65.5 96 68.5 85 67 76Z',
  /** Viewer-left leg incl. foot. */
  leg:
    'M65.5 215L96 236.5C97.2 237.4 98.6 237.8 100 237.8L99.6 246C99 266 97.5 286 96.5 302C96 314 97 330 96.5 346C96 362 94.5 374 94.5 386C95 393 97 399 96 402.5C95.5 403.5 94.5 404 93 404L81 404C77 404 76.5 399.5 81 395C84 392 85.5 388 85 381C82.5 364 76 346 76 327C76 316 77.5 309 77.5 302C72 280 64.5 250 65.5 215Z',
} as const

const ARM_ANCHOR = { x: 52, y: 160 }
const LEG_ANCHOR = { x: 86, y: 296 }
const mirrorPt = (p: { x: number; y: number }) => ({ x: BODY_W - p.x, y: p.y })

/** Limb shape for a patient side in a given view. */
function limb(id: 'armR' | 'armL' | 'legR' | 'legL', view: BodyView): BodyShape {
  const isArm = id === 'armR' || id === 'armL'
  const patientRight = id === 'armR' || id === 'legR'
  // front: patient's right is drawn on the viewer's left (unmirrored); back: the opposite
  const mirrored = view === 'front' ? !patientRight : patientRight
  const anchor = isArm ? ARM_ANCHOR : LEG_ANCHOR
  return {
    id,
    d: isArm ? BODY_PATHS.arm : BODY_PATHS.leg,
    transform: mirrored ? MIRROR : undefined,
    anchor: mirrored ? mirrorPt(anchor) : anchor,
  }
}

/**
 * Region shapes of a view in paint order (trunk first, limbs last – the arms overlap the
 * shoulders slightly, so they must be painted on top).
 */
export function bodyShapes(view: BodyView, opts: { mergeTrunk?: boolean } = {}): BodyShape[] {
  const head: BodyShape = { id: 'headNeck', d: BODY_PATHS.headNeck, anchor: { x: 100, y: 32 } }
  let trunk: BodyShape[]
  if (view === 'front') {
    trunk = opts.mergeTrunk
      ? [
          { id: 'trunk', d: BODY_PATHS.trunkFront, anchor: { x: 100, y: 138 } },
          { id: 'pelvis', d: BODY_PATHS.pelvis, anchor: { x: 100, y: 218 } },
        ]
      : [
          { id: 'chest', d: BODY_PATHS.upperTrunk, anchor: { x: 100, y: 112 } },
          { id: 'abdomen', d: BODY_PATHS.abdomen, anchor: { x: 100, y: 175 } },
          { id: 'pelvis', d: BODY_PATHS.pelvis, anchor: { x: 100, y: 218 } },
        ]
  } else {
    trunk = opts.mergeTrunk
      ? [{ id: 'trunk', d: BODY_PATHS.trunkBack, anchor: { x: 100, y: 150 } }]
      : [
          { id: 'upperBack', d: BODY_PATHS.upperTrunk, anchor: { x: 100, y: 112 } },
          { id: 'lowerBack', d: BODY_PATHS.lowerTrunk, anchor: { x: 100, y: 190 } },
        ]
  }
  return [head, ...trunk, limb('legR', view), limb('legL', view), limb('armR', view), limb('armL', view)]
}

/** A single shape of a view (or undefined if the view has no such part). */
export function bodyShape(view: BodyView, id: BodyPart, opts: { mergeTrunk?: boolean } = {}): BodyShape | undefined {
  return bodyShapes(view, { mergeTrunk: opts.mergeTrunk ?? id === 'trunk' }).find((s) => s.id === id)
}

export const regionLabel: Record<BodyPart, string> = {
  headNeck: 'Pää ja kaula',
  chest: 'Rintakehä',
  abdomen: 'Vatsa',
  pelvis: 'Lantio',
  upperBack: 'Yläselkä',
  lowerBack: 'Alaselkä',
  trunk: 'Vartalo',
  armR: 'Oikea yläraaja',
  armL: 'Vasen yläraaja',
  legR: 'Oikea alaraaja',
  legL: 'Vasen alaraaja',
}

/* ---------- rendering ---------- */

/** Neutral base fill for one shape (shape-local coordinates – place inside the shape's group). */
export function BodyShapePath({
  shape,
  fill = BODY_FILL,
  gap = svg.raised,
  ...rest
}: { shape: BodyShape; fill?: string; gap?: string } & Omit<SVGProps<SVGPathElement>, 'd' | 'fill'>) {
  return <path d={shape.d} style={{ fill }} stroke={gap} strokeWidth={BODY_GAP} strokeLinejoin="round" {...rest} />
}

/** Subtle landmarks so front and back are distinguishable at a glance. */
export function BodyDetails({ view }: { view: BodyView }) {
  const line = { fill: 'none', stroke: svg.dim, strokeLinecap: 'round' as const, strokeWidth: 1.1 }
  return (
    <g aria-hidden pointerEvents="none">
      {view === 'front' ? (
        <>
          {/* clavicles + navel */}
          <path d="M88 81C80 79.5 72 80 66.5 82.5M112 81C120 79.5 128 80 133.5 82.5" {...line} strokeOpacity={0.22} />
          <ellipse cx={100} cy={178} rx={1.4} ry={1.7} fill={svg.dim} fillOpacity={0.45} />
        </>
      ) : (
        <>
          {/* spine, shoulder blades, gluteal cleft */}
          <path d="M100 77V200" {...line} strokeOpacity={0.18} strokeDasharray="0.1 4.2" strokeWidth={2} />
          <path d="M79 92C80 104 84 116 92 121M121 92C120 104 116 116 108 121" {...line} strokeOpacity={0.2} />
          <path d="M100 213V235" {...line} strokeOpacity={0.26} />
        </>
      )}
    </g>
  )
}

/**
 * Renders all shapes of a view. Pass `renderShape` to draw each shape yourself (base fill,
 * highlights, hit areas …) – it is called in paint order and its output is wrapped in a
 * group carrying the shape's mirror transform, so draw in shape-local coordinates.
 */
export function BodySilhouette({
  view,
  mergeTrunk,
  renderShape,
  fill = BODY_FILL,
  gap = svg.raised,
  details = true,
  ...rest
}: {
  view: BodyView
  mergeTrunk?: boolean
  renderShape?: (shape: BodyShape) => ReactNode
  fill?: string
  gap?: string
  details?: boolean
} & Omit<SVGProps<SVGGElement>, 'fill' | 'children'>) {
  const shapes = bodyShapes(view, { mergeTrunk })
  return (
    <g {...rest}>
      {shapes.map((s) => (
        <Fragment key={s.id}>
          <g transform={s.transform}>{renderShape ? renderShape(s) : <BodyShapePath shape={s} fill={fill} gap={gap} />}</g>
        </Fragment>
      ))}
      {details && <BodyDetails view={view} />}
    </g>
  )
}
