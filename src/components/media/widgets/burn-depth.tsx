import { useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Flame } from 'lucide-react'
import { Segmented, svg } from '../ui'

/* Palovamman syvyys – article: palovamma. Skin cross-section with a damage zone that grows
 * (path morph) to the depth of the selected grade. */

type Grade = 'I' | 'II' | 'III'

const GRADES: Record<Grade, { title: string; depth: string; look: string }> = {
  I: { title: 'I aste', depth: 'Vain pintaiho', look: 'Punoitus' },
  II: { title: 'II aste', depth: 'Pintaiho ja osa verinahkaa', look: 'Rakkulat' },
  III: { title: 'III aste', depth: 'Koko ihon paksuus', look: 'Valkoinen ja kovettunut iho' },
}

/* ---------- geometry (viewBox 336 × 214) ---------- */
const VB = { w: 336, h: 214 }
const W = 320 // skin block width (clipped to x 4–316)
const SEG = 10
const N = W / SEG
const SURF = 38 // skin surface
const EDJ = 56 // epidermis / dermis junction (mean)
const DSJ = 136 // dermis / subcutis junction (mean)

/** Wavy line made of N quadratic segments; `reverse` walks right → left. */
function wave(base: number, amp: number, reverse = false): string {
  let d = ''
  const ctrl = (i: number) => `${i * SEG + SEG / 2} ${base + (i % 2 === 0 ? amp : -amp)}`
  if (!reverse) for (let i = 0; i < N; i++) d += `Q${ctrl(i)} ${(i + 1) * SEG} ${base}`
  else for (let i = N - 1; i >= 0; i--) d += `Q${ctrl(i)} ${i * SEG} ${base}`
  return d
}

/** Damage zone from the surface down to a wavy bottom – identical structure for every grade so it can morph. */
const zone = (base: number, amp: number) => `M0 ${SURF}L${W} ${SURF}L${W} ${base}${wave(base, amp, true)}Z`

const EPI_AMP = 5
const DSJ_AMP = 4
const EPIDERMIS = zone(EDJ, EPI_AMP)
const DERMIS = zone(DSJ, DSJ_AMP)
const EDJ_LINE = `M0 ${EDJ}${wave(EDJ, EPI_AMP)}`

const DAMAGE: Record<Grade, { d: string; depth: number }> = {
  I: { d: zone(EDJ, EPI_AMP), depth: EDJ + EPI_AMP / 2 },
  II: { d: zone(97, 6), depth: 100 },
  III: { d: zone(DSJ, DSJ_AMP), depth: DSJ + DSJ_AMP / 2 },
}

const FAT_CELLS = [0, 1, 2].flatMap((row) =>
  Array.from({ length: 14 }, (_, i) => ({
    cx: 8 + i * 24 + (row % 2 ? 12 : 0),
    cy: 152 + row * 22,
    rx: 11 + ((i + row) % 3) * 0.8,
    ry: 9 - ((i + row) % 2) * 0.8,
  })),
)

const CAPILLARIES = [175, 255, 295].map(
  (x) => `M${x - 4} 124C${x - 4} 100 ${x - 3} 80 ${x - 3} 63C${x - 3} 57.6 ${x + 3} 57.6 ${x + 3} 63C${x + 3} 80 ${x + 4} 100 ${x + 4} 124`,
)

const CRACKS = ['M24 39l5 6-3 6', 'M68 39l-4 7 5 5', 'M106 39l6 5-2 7', 'M188 39l-5 6 4 6', 'M232 39l4 7-4 5', 'M296 39l-5 5 3 7']

const BLISTER_FLUID = 'M166 57L166 40C174 17 242 17 250 40L250 57Z'
const BLISTER_ROOF = 'M160 40C168 9 248 9 256 40L250 41C242 18 174 18 166 41Z'

const C = {
  epi: 'color-mix(in srgb, #d9a07a 62%, var(--bg-raised))',
  epiLine: 'color-mix(in srgb, #b87449 70%, var(--bg-raised))',
  derm: 'color-mix(in srgb, #f0a9a0 40%, var(--bg-raised))',
  sub: 'color-mix(in srgb, #f5d27f 30%, var(--bg-raised))',
  fat: 'color-mix(in srgb, #f8e3a6 52%, var(--bg-raised))',
  fatLine: 'color-mix(in srgb, #d9ae4e 55%, var(--bg-raised))',
  follicle: 'color-mix(in srgb, #c98e66 72%, var(--bg-raised))',
  hair: 'color-mix(in srgb, #5b4130 78%, var(--text))',
  seb: 'color-mix(in srgb, #f3cf86 75%, var(--bg-raised))',
  fluid: 'color-mix(in srgb, #fde68a 58%, var(--bg-raised))',
  nerve: svg.teal,
  vessel: svg.danger,
  sweat: svg.air,
  eschar: '#eeece6',
  escharLine: '#a39d90',
}

const pct = (x: number, y: number) => ({ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%` })

const LAYER_LABELS = [
  { name: 'Pintaiho', latin: 'epidermis', x: 10, y: 18 },
  { name: 'Verinahka', latin: 'dermis', x: 10, y: 97 },
  { name: 'Ihonalaiskudos', latin: 'subcutis', x: 10, y: 177 },
]

const LEGEND = [
  { name: 'Karvatuppi', swatch: <path d="M3 13L11 3" stroke={C.hair} strokeWidth={2.2} strokeLinecap="round" /> },
  {
    name: 'Hikirauhanen',
    swatch: <ellipse cx={8} cy={8} rx={5} ry={3.6} fill="none" stroke={C.sweat} strokeWidth={2.2} />,
  },
  { name: 'Verisuonet', swatch: <path d="M1 9C5 5 11 13 15 8" fill="none" stroke={C.vessel} strokeWidth={2.2} strokeLinecap="round" /> },
  {
    name: 'Hermopäätteet',
    swatch: (
      <>
        <path d="M3 14L8 6M8 6L5 2M8 6L12 2" fill="none" stroke={C.nerve} strokeWidth={1.8} strokeLinecap="round" />
        <circle cx={5} cy={2} r={1.4} fill={C.nerve} />
        <circle cx={12} cy={2} r={1.4} fill={C.nerve} />
      </>
    ),
  },
]

export default function BurnDepth() {
  const reduce = useReducedMotion() ?? false
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [grade, setGrade] = useState<Grade>('I')
  const g = GRADES[grade]
  const dmg = DAMAGE[grade]

  const grow = reduce ? { duration: 0 } : ({ type: 'spring', duration: 0.65, bounce: 0.14 } as const)
  const fade = reduce ? { duration: 0 } : { duration: 0.22, ease: [0.23, 1, 0.32, 1] as const }
  const surfaceStroke = grade === 'I' ? svg.danger : grade === 'III' ? C.escharLine : C.epiLine

  return (
    <div className="space-y-3">
      <Segmented
        value={grade}
        onChange={setGrade}
        layoutId={`${uid}-grade`}
        options={[
          { value: 'I', label: 'I aste' },
          { value: 'II', label: 'II aste' },
          { value: 'III', label: 'III aste' },
        ]}
      />

      <div className="relative mx-auto w-full max-w-[560px]">
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`Ihon poikkileikkaus: pintaiho, verinahka ja ihonalaiskudos. ${g.title}: ${g.depth.toLowerCase()}, ${g.look.toLowerCase()}.`}
        >
          <defs>
            <clipPath id={`${uid}-block`}>
              <rect x={4} y={SURF} width={312} height={VB.h - SURF} rx={10} />
            </clipPath>
            <linearGradient id={`${uid}-dmg`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={svg.danger} stopOpacity={0.55} />
              <stop offset="100%" stopColor={svg.brand} stopOpacity={0.4} />
            </linearGradient>
            <pattern id={`${uid}-hatch`} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1={0} y1={0} x2={0} y2={7} stroke={svg.danger} strokeOpacity={0.4} strokeWidth={1.4} />
            </pattern>
          </defs>

          {/* hair shaft above the surface */}
          <path d="M136 38C138 26 146 14 160 6" fill="none" style={{ stroke: C.hair }} strokeWidth={2.4} strokeLinecap="round" aria-hidden />

          <g clipPath={`url(#${uid}-block)`}>
            {/* layers */}
            <rect x={0} y={SURF} width={W} height={VB.h - SURF} style={{ fill: C.sub }} />
            {FAT_CELLS.map((c, i) => (
              <ellipse key={i} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} style={{ fill: C.fat, stroke: C.fatLine }} strokeWidth={1.1} />
            ))}
            <path d={DERMIS} style={{ fill: C.derm }} />
            <path d={EPIDERMIS} style={{ fill: C.epi }} />
            <path d={EDJ_LINE} fill="none" style={{ stroke: C.epiLine }} strokeWidth={1.3} strokeOpacity={0.7} />

            {/* small vessels: deep plexus + capillary loops into the papillae */}
            <g fill="none" strokeLinecap="round" aria-hidden>
              <path d="M0 122C60 118 120 127 180 121S280 125 320 120" stroke={C.vessel} strokeWidth={2.6} />
              <path d="M0 129C60 126 120 133 180 128S280 131 320 127" stroke={C.vessel} strokeOpacity={0.5} strokeWidth={2.6} />
              {CAPILLARIES.map((d) => (
                <path key={d} d={d} stroke={C.vessel} strokeWidth={1.5} strokeOpacity={0.85} />
              ))}
            </g>

            {/* hair follicle + sebaceous gland */}
            <g aria-hidden>
              <path d="M136 41L121 124" style={{ stroke: C.follicle }} strokeWidth={10} strokeLinecap="round" />
              <ellipse cx={141.5} cy={74} rx={6} ry={4.5} style={{ fill: C.seb, stroke: C.follicle }} strokeWidth={1.2} />
              <circle cx={120} cy={128} r={7.5} style={{ fill: C.follicle }} />
              <ellipse cx={120} cy={132} rx={3} ry={2.6} style={{ fill: C.derm }} />
              <path d="M136 38L121.5 125" fill="none" style={{ stroke: C.hair }} strokeWidth={2} strokeLinecap="round" />
            </g>

            {/* nerve with free endings + a deep corpuscle */}
            <g fill="none" stroke={C.nerve} strokeLinecap="round" aria-hidden>
              <path d="M206 214C210 190 202 170 208 150C214 128 206 106 212 84" strokeWidth={2} />
              <path d="M212 84C211 74 206 68 202 61M212 84C214 74 218 68 222 62M210 100C216 94 224 90 230 82M208 170C216 172 222 176 226 181" strokeWidth={1.5} />
              <ellipse cx={229} cy={187} rx={5} ry={7} strokeWidth={1.4} />
              <ellipse cx={229} cy={187} rx={2.4} ry={3.6} strokeWidth={1.1} />
              {[
                [202, 61],
                [222, 62],
                [230, 82],
              ].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={1.8} fill={C.nerve} stroke="none" />
              ))}
            </g>

            {/* sweat gland (coil) + duct to the surface */}
            <g fill="none" stroke={C.sweat} strokeWidth={2.2} strokeLinecap="round" aria-hidden>
              <path d="M282 141C276 128 288 116 282 104C276 92 288 80 282 68C278 61 280 58 278 55C276 51 280 46 277 42C276 40 277 39 276.5 38" />
              <ellipse cx={276} cy={147} rx={6} ry={4.5} />
              <ellipse cx={285} cy={144} rx={6} ry={4.5} />
              <ellipse cx={289} cy={151.5} rx={6} ry={4.5} />
            </g>

            {/* damage zone – grows (morphs) to the depth of the grade */}
            <motion.path
              initial={false}
              animate={{ d: dmg.d }}
              transition={grow}
              fill={`url(#${uid}-dmg)`}
              aria-hidden
            />
            <motion.path initial={false} animate={{ d: dmg.d }} transition={grow} fill={`url(#${uid}-hatch)`} aria-hidden />

            {/* III: white, hardened surface */}
            <motion.g initial={false} animate={{ opacity: grade === 'III' ? 1 : 0 }} transition={fade} aria-hidden>
              <path d={EPIDERMIS} style={{ fill: C.eschar }} />
              <path d={EDJ_LINE} fill="none" stroke={C.escharLine} strokeWidth={1.2} strokeOpacity={0.6} />
              <g fill="none" stroke={C.escharLine} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
                {CRACKS.map((d) => (
                  <path key={d} d={d} />
                ))}
              </g>
            </motion.g>
          </g>

          {/* skin surface */}
          <path
            d={`M4 ${SURF}H316`}
            fill="none"
            strokeWidth={grade === 'III' ? 2.4 : 1.6}
            strokeLinecap="round"
            style={{ stroke: surfaceStroke, transition: 'stroke 200ms ease-out, stroke-width 200ms ease-out' }}
          />

          {/* II: blister */}
          <AnimatePresence initial={false}>
            {grade === 'II' && (
              <motion.g
                key="blister"
                style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.1 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.1 }}
                transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.6, bounce: 0.3, delay: 0.12 }}
                aria-hidden
              >
                <path d={BLISTER_FLUID} style={{ fill: C.fluid }} />
                <path d={BLISTER_ROOF} style={{ fill: C.epi }} />
                <path d={BLISTER_ROOF} fill={`url(#${uid}-dmg)`} />
                <path d="M184 21C194 15 206 13.5 216 14" fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={1.8} strokeLinecap="round" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* depth bracket */}
          <g fill="none" stroke={svg.danger} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d={`M321 ${SURF}H331`} />
            <motion.path initial={false} animate={{ d: `M326 ${SURF}L326 ${dmg.depth}` }} transition={grow} />
            <motion.path
              initial={false}
              animate={{ d: `M321.5 ${dmg.depth - 5.5}L326 ${dmg.depth}L330.5 ${dmg.depth - 5.5}` }}
              transition={grow}
            />
          </g>

          {/* leader for the epidermis label (label sits in the air above the skin) */}
          <path d="M22 33L26 46" fill="none" stroke={svg.dim} strokeWidth={1} strokeLinecap="round" aria-hidden />
          <circle cx={26} cy={46} r={1.6} fill={svg.dim} aria-hidden />
        </svg>

        {/* layer labels */}
        {LAYER_LABELS.map((l) => (
          <span
            key={l.name}
            style={pct(l.x, l.y)}
            className="pointer-events-none absolute -translate-y-1/2 rounded-md bg-[var(--bg-raised)]/80 px-1.5 py-0.5 leading-tight backdrop-blur-[2px]"
          >
            <span className="block text-[11.5px] font-semibold text-[var(--text)]">{l.name}</span>
            <span className="block text-[10px] italic text-[var(--text-dim)]">{l.latin}</span>
          </span>
        ))}
      </div>

      <ul className="flex flex-wrap justify-center gap-x-3.5 gap-y-1 text-[11.5px] text-[var(--text-dim)]" aria-label="Rakenteet">
        {LEGEND.map((l) => (
          <li key={l.name} className="flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
              {l.swatch}
            </svg>
            {l.name}
          </li>
        ))}
      </ul>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={grade}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: reduce ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
          aria-live="polite"
        >
          <p className="font-display text-[16px] font-semibold text-brand-600">{g.title}</p>
          <dl className="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 text-[13.5px]">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Syvyys</dt>
            <dd className="font-medium text-[var(--text)]">{g.depth}</dd>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Iho</dt>
            <dd className="font-medium text-[var(--text)]">{g.look}</dd>
          </dl>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2.5 rounded-xl border border-brand-500/30 bg-brand-500/8 px-4 py-3">
        <Flame className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        <ul className="space-y-1.5 text-[13px] leading-snug text-[var(--text)]">
          <li>Liekki on yleisin mekanismi ja aiheuttaa usein syviä vammoja.</li>
          <li>Liekkipalovamma, jossa iho on kovettunut, on aina syvä vamma pinta-alasta riippumatta.</li>
        </ul>
      </div>
    </div>
  )
}
