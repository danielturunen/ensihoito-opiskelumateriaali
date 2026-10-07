import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowRight, Info } from 'lucide-react'
import { Segmented, svg } from '../ui'
import { BODY_FILL_SOFT, BODY_GAP, BodySilhouette, bodyShape, type BodyShape } from '../parts/body-silhouette'

/* Vatsakivun sijainti – articles: akuutti-vatsa (+ socrates-kivun-arviointi for radiation).
 * One SVG holds a front and a back figure; the "camera" (viewBox) zooms between the abdomen
 * close-up and both full figures. Both viewBoxes share the same 4:5 aspect ratio. */

type Mode = 'site' | 'referred'
type RegionId = 'okk' | 'yla' | 'kesk' | 'oav' | 'vav'
type Sel = RegionId | 'diffuse'
type OrganId = 'diaphragm' | 'heart' | 'aorta' | 'kidney' | 'pancreas'
type TargetId = 'shoulders' | 'lowerBack' | 'groin' | 'leftArm' | 'jaw' | 'midBack'
type RefId = 'pallea' | 'aortta' | 'kivi' | 'sydan' | 'haima'

const BACK_DX = 150
const VBOX: Record<Mode, { x: number; y: number; w: number; h: number }> = {
  site: { x: 36, y: 86, w: 128, h: 160 },
  referred: { x: 20, y: 0, w: 328, h: 410 },
}
const vbString = (m: Mode) => `${VBOX[m].x} ${VBOX[m].y} ${VBOX[m].w} ${VBOX[m].h}`
const pct = (m: Mode, x: number, y: number) => ({
  left: `${((x - VBOX[m].x) / VBOX[m].w) * 100}%`,
  top: `${((y - VBOX[m].y) / VBOX[m].h) * 100}%`,
})

/* ---------- abdominal regions (front-view coordinates, viewer-left = patient's right) ---------- */

const ARCH = 'M69 146Q81 141 92 134Q97 130 100 124Q103 130 108 134Q119 141 131 146'

const REGIONS: { id: RegionId; name: string; lines: string[]; d: string; label: { x: number; y: number } }[] = [
  {
    id: 'yla',
    name: 'Ylävatsa',
    lines: ['Ylävatsa'],
    d: 'M92 134Q97 130 100 124Q103 130 108 134Q119 141 131 146C129 154 127.5 160 127.5 166L92 166Z',
    label: { x: 110.5, y: 151 },
  },
  {
    id: 'okk',
    name: 'Oikea kylkikaari',
    lines: ['Oikea', 'kylkikaari'],
    d: 'M69 146Q81 141 92 134L92 166L72.5 166C72.5 160 71 154 69 146Z',
    label: { x: 81.5, y: 154.5 },
  },
  {
    id: 'kesk',
    name: 'Keskivatsa',
    lines: ['Keskivatsa'],
    d: 'M72.5 166L127.5 166C127.5 175 127 183 127.6 190L72.4 190C73 183 72.5 175 72.5 166Z',
    label: { x: 100, y: 171.5 },
  },
  {
    id: 'oav',
    name: 'Oikea alavatsa',
    lines: ['Oikea', 'alavatsa'],
    d: 'M72.4 190L100 190L100 234.5Q98.5 234.5 97 233L68.5 212C69.5 205 71.5 197 72.4 190Z',
    label: { x: 86.5, y: 212 },
  },
  {
    id: 'vav',
    name: 'Vasen alavatsa',
    lines: ['Vasen', 'alavatsa'],
    d: 'M127.6 190L100 190L100 234.5Q101.5 234.5 103 233L131.5 212C130.5 205 128.5 197 127.6 190Z',
    label: { x: 113.5, y: 212 },
  },
]

interface Cause {
  name: string
  note?: string
  lethal?: boolean
}

const CAUSES: Record<Sel, Cause[]> = {
  yla: [{ name: 'Mahahaava' }, { name: 'Pankreatiitti', note: 'vyömäinen, säteilee selkään' }, { name: 'Sydäninfarkti' }, { name: 'Keuhkokuume' }],
  okk: [{ name: 'Kolekystiitti' }, { name: 'Sappitiekivet' }, { name: 'Maksasairaus' }],
  kesk: [{ name: 'Ileus' }, { name: 'Mesenteriaali-iskemia', lethal: true }, { name: 'Aortta-aneurysma', lethal: true }],
  oav: [
    { name: 'Appendisiitti', note: 'kipu siirtyy navan seudusta oikealle alavatsalle (McBurneyn piste)' },
    { name: 'Gynekologiset syyt' },
    { name: 'Tyrä' },
  ],
  vav: [{ name: 'Divertikuliitti', note: 'iäkkäällä' }, { name: 'Gynekologiset syyt' }, { name: 'Tyrä' }],
  diffuse: [
    { name: 'Peritoniitti', note: 'laudankova vatsa', lethal: true },
    { name: 'Ileus' },
    { name: 'Ketoasidoosi' },
    { name: 'Gastroenteriitti' },
  ],
}

const SEL_NAME: Record<Sel, string> = {
  yla: 'Ylävatsa',
  okk: 'Oikea kylkikaari',
  kesk: 'Keskivatsa',
  oav: 'Oikea alavatsa',
  vav: 'Vasen alavatsa',
  diffuse: 'Koko vatsa (diffuusi)',
}

/* Appendicitis: pain migrates from the navel to McBurney's point. */
const NAVEL = { x: 100, y: 178 }
const MCB = { x: 79, y: 196 }
const MIGRATION = 'M98.5 180.5Q88 183 81.2 193.2'
const MIGRATION_HEAD = 'M84.8 191.8L81.2 193.2L81.1 189.3'

/* ---------- referred pain (heijastekipu / säteily) ---------- */

const ORGAN_NAME: Record<OrganId, string> = {
  diaphragm: 'Pallea',
  heart: 'Sydän',
  aorta: 'Aortta',
  kidney: 'Munuainen ja virtsanjohdin',
  pancreas: 'Haima',
}

interface Referred {
  id: RefId
  source: string
  target: string
  kind: string
  organs: OrganId[]
  targets: TargetId[]
  paths: string[]
  labels: { t: string; x: number; y: number }[]
}

const REFERRED: Referred[] = [
  {
    id: 'pallea',
    source: 'Pallean ärsytys',
    target: 'hartia',
    kind: 'Heijastekipu',
    organs: ['diaphragm'],
    targets: ['shoulders'],
    paths: ['M82 133C74 118 62 102 57 87', 'M118 133C126 118 138 102 143 87'],
    labels: [
      { t: 'Hartia', x: 56, y: 68 },
      { t: 'Hartia', x: 144, y: 68 },
    ],
  },
  {
    id: 'aortta',
    source: 'Aortan repeämä',
    target: 'pakara tai selkä',
    kind: 'Heijastekipu',
    organs: ['aorta'],
    targets: ['lowerBack'],
    paths: ['M101 168C140 150 205 160 246 196'],
    labels: [{ t: 'Pakara tai selkä', x: 250, y: 254 }],
  },
  {
    id: 'kivi',
    source: 'Virtsatiekivi',
    target: 'nivus',
    kind: 'Heijastekipu',
    organs: ['kidney'],
    targets: ['groin'],
    paths: ['M112 200C115 208 117 215 119 222'],
    labels: [{ t: 'Nivus', x: 140, y: 242 }],
  },
  {
    id: 'sydan',
    source: 'Sydänperäinen kipu',
    target: 'vasen käsivarsi tai leuka',
    kind: 'Säteilevä kipu',
    organs: ['heart'],
    targets: ['leftArm', 'jaw'],
    paths: ['M113 117C128 119 140 128 147 146', 'M104 103C103 86 101 70 100 55'],
    labels: [
      { t: 'Vasen käsivarsi', x: 152, y: 276 },
      { t: 'Leuka', x: 137, y: 44 },
    ],
  },
  {
    id: 'haima',
    source: 'Haima tai aortta',
    target: 'selkä',
    kind: 'Säteilevä kipu',
    organs: ['pancreas', 'aorta'],
    targets: ['midBack'],
    paths: ['M112 156C150 134 208 138 246 157', 'M101 142C150 114 210 124 248 153'],
    labels: [{ t: 'Selkä', x: 250, y: 134 }],
  },
]

const LEFT_ARM = bodyShape('front', 'armL') as BodyShape
const LOWER_BACK = bodyShape('back', 'lowerBack') as BodyShape

const fadeT = (reduce: boolean, delay = 0) => (reduce ? { duration: 0 } : { duration: 0.25, delay, ease: [0.23, 1, 0.32, 1] as const })

function Organ({ id, on }: { id: OrganId; on: boolean }) {
  const stroke = on ? svg.teal : svg.dim
  const fill = on ? svg.tealSoft : 'none'
  const common = { stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (id) {
    case 'heart':
      return <ellipse cx={106} cy={114} rx={9.5} ry={12.5} transform="rotate(-35 106 114)" fill={on ? svg.tealSoft : 'none'} strokeWidth={on ? 1.8 : 1.2} {...common} />
    case 'diaphragm':
      return <path d="M64 150C70 130 90 126 100 136C110 126 130 130 136 150" fill="none" strokeWidth={on ? 2.6 : 1.4} {...common} />
    case 'aorta':
      return (
        <path
          d="M108 106C108 97 100 95 100 102L101 176M101 176C99 186 95 194 92 204M101 176C103 186 107 194 110 204"
          fill="none"
          strokeWidth={on ? 3.2 : 1.6}
          {...common}
        />
      )
    case 'kidney':
      return (
        <g {...common} strokeWidth={on ? 1.8 : 1.2}>
          <ellipse cx={120} cy={167} rx={5.5} ry={9} transform="rotate(-10 120 167)" fill={fill} />
          <path d="M117 175C114 190 110 206 104 220" fill="none" />
          <ellipse cx={100} cy={224} rx={6} ry={4.2} fill={fill} />
          <circle cx={111.6} cy={197.9} r={2.4} fill={stroke} stroke="none" />
        </g>
      )
    case 'pancreas':
      return (
        <path
          d="M88 161C92 155 101 158 107 155C112 152 117 151 119 154C120 157 114 159 108 160C101 162 94 166 88 161Z"
          fill={fill}
          strokeWidth={on ? 1.8 : 1.2}
          {...common}
        />
      )
  }
}

function Target({ id, pulse }: { id: TargetId; pulse: boolean }) {
  const anim = pulse
    ? { animate: { opacity: [0.5, 0.95, 0.5] }, transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const } }
    : { animate: { opacity: 0.85 } }
  const fill = { fill: svg.brand, stroke: svg.brand, strokeWidth: 1 }
  switch (id) {
    case 'shoulders':
      return (
        <motion.g initial={false} {...anim}>
          <ellipse cx={56} cy={83} rx={9} ry={7} {...fill} />
          <ellipse cx={144} cy={83} rx={9} ry={7} {...fill} />
        </motion.g>
      )
    case 'groin':
      return (
        <motion.g initial={false} {...anim}>
          <ellipse cx={119} cy={224.5} rx={9} ry={4.5} transform="rotate(-35 119 224.5)" {...fill} />
        </motion.g>
      )
    case 'jaw':
      return (
        <motion.g initial={false} {...anim}>
          <ellipse cx={100} cy={50} rx={11} ry={4.5} {...fill} />
        </motion.g>
      )
    case 'midBack':
      return (
        <motion.g initial={false} {...anim}>
          <ellipse cx={100 + BACK_DX} cy={160} rx={22} ry={13} {...fill} />
        </motion.g>
      )
    case 'leftArm':
      return (
        <motion.g initial={false} {...anim}>
          <g transform={LEFT_ARM.transform}>
            <path d={LEFT_ARM.d} fill={svg.brand} stroke={svg.raised} strokeWidth={BODY_GAP} strokeLinejoin="round" />
          </g>
        </motion.g>
      )
    case 'lowerBack':
      return (
        <motion.g initial={false} {...anim}>
          <g transform={`translate(${BACK_DX} 0)`}>
            <path d={LOWER_BACK.d} fill={svg.brand} stroke={svg.raised} strokeWidth={BODY_GAP} strokeLinejoin="round" />
          </g>
        </motion.g>
      )
  }
}

export default function AbdomenMap() {
  const reduce = useReducedMotion() ?? false
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInView(rootRef, { amount: 0.25 })
  const loop = inView && !reduce

  const [mode, setMode] = useState<Mode>('site')
  const [sel, setSel] = useState<Sel | null>(null)
  const [refId, setRefId] = useState<RefId>('pallea')
  const [focus, setFocus] = useState<RegionId | null>(null)
  const [initialViewBox] = useState(() => vbString('site'))

  const isOn = (id: RegionId) => sel === id || sel === 'diffuse'
  const ref = REFERRED.find((r) => r.id === refId) ?? REFERRED[0]
  const activeOrgans = new Set<OrganId>(ref.organs)
  const site = mode === 'site'

  const toggleRegion = (id: Sel) => setSel((s) => (s === id ? null : id))

  return (
    <div ref={rootRef} className="@container space-y-3">
      <Segmented
        value={mode}
        onChange={setMode}
        layoutId={`${uid}-mode`}
        options={[
          { value: 'site', label: 'Kivun sijainti' },
          { value: 'referred', label: 'Heijastekipu' },
        ]}
      />

      <div className="grid gap-4 @lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] @lg:items-start">
        {/* ---------- figure ---------- */}
        <div className="mx-auto w-full max-w-[340px] space-y-2">
          <div className="relative h-[18px] text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]" aria-hidden>
            <AnimatePresence initial={false} mode="wait">
              {site ? (
                <motion.div
                  key="lr"
                  className="absolute inset-0 flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fadeT(reduce)}
                >
                  <span>← Potilaan oikea</span>
                  <span>Potilaan vasen →</span>
                </motion.div>
              ) : (
                <motion.div key="fb" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fadeT(reduce)}>
                  <span className="absolute -translate-x-1/2" style={{ left: pct('referred', 100, 0).left }}>
                    Etupuoli
                  </span>
                  <span className="absolute -translate-x-1/2" style={{ left: pct('referred', 100 + BACK_DX, 0).left }}>
                    Takapuoli
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
            <motion.svg
              viewBox={initialViewBox}
              initial={false}
              animate={{ viewBox: vbString(mode) }}
              transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.8, bounce: 0 }}
              className="absolute inset-0 block h-full w-full"
              role="group"
              aria-label={
                site
                  ? 'Vatsan alueet edestä: oikea kylkikaari, ylävatsa, keskivatsa, oikea ja vasen alavatsa.'
                  : `Heijastekipu: ${ref.source} – kipu tuntuu: ${ref.target}.`
              }
            >
              <BodySilhouette view="front" />
              <g transform={`translate(${BACK_DX} 0)`}>
                <BodySilhouette view="back" />
              </g>

              {/* ----- pain location layer ----- */}
              <motion.g
                initial={false}
                animate={{ opacity: site ? 1 : 0 }}
                transition={fadeT(reduce)}
                style={{ pointerEvents: site ? 'auto' : 'none' }}
                aria-hidden={!site}
              >
                {REGIONS.map((r, i) => {
                  const on = isOn(r.id)
                  return (
                    <g key={r.id}>
                      <path d={r.d} style={{ fill: BODY_FILL_SOFT }} stroke={svg.raised} strokeWidth={1.4} strokeLinejoin="round" />
                      <AnimatePresence initial={false}>
                        {on && (
                          <motion.path
                            key="on"
                            d={r.d}
                            fill={svg.brand}
                            stroke={svg.raised}
                            strokeWidth={1.4}
                            strokeLinejoin="round"
                            style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 0.9, scale: 1 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                            transition={
                              reduce
                                ? { duration: 0 }
                                : { type: 'spring', duration: 0.45, bounce: 0.25, delay: sel === 'diffuse' ? i * 0.035 : 0 }
                            }
                          />
                        )}
                      </AnimatePresence>
                      {focus === r.id && (
                        <path d={r.d} fill="none" stroke={svg.ink} strokeWidth={0.9} strokeDasharray="2 1.6" pointerEvents="none" />
                      )}
                    </g>
                  )
                })}

                <path d={ARCH} fill="none" stroke={svg.dim} strokeOpacity={0.55} strokeWidth={1} strokeLinecap="round" pointerEvents="none" />
                <ellipse cx={NAVEL.x} cy={NAVEL.y} rx={1.3} ry={1.6} fill={svg.dim} fillOpacity={0.6} pointerEvents="none" />

                {/* appendicitis: navel → McBurney */}
                <AnimatePresence initial={false}>
                  {sel === 'oav' && (
                    <motion.g key="mcb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fadeT(reduce)} pointerEvents="none">
                      <circle cx={NAVEL.x} cy={NAVEL.y} r={2.6} fill="none" stroke={svg.ink} strokeWidth={0.9} />
                      <motion.path
                        d={MIGRATION}
                        fill="none"
                        stroke={svg.ink}
                        strokeWidth={1.3}
                        strokeLinecap="round"
                        initial={false}
                        animate={loop ? { pathLength: [0, 1, 1, 1], opacity: [1, 1, 1, 0] } : { pathLength: 1, opacity: 1 }}
                        transition={loop ? { duration: 2.8, times: [0, 0.4, 0.85, 1], repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
                      />
                      <motion.path
                        d={MIGRATION_HEAD}
                        fill="none"
                        stroke={svg.ink}
                        strokeWidth={1.3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={false}
                        animate={loop ? { opacity: [0, 0, 1, 1, 0] } : { opacity: 1 }}
                        transition={loop ? { duration: 2.8, times: [0, 0.36, 0.42, 0.85, 1], repeat: Infinity } : { duration: 0 }}
                      />
                      {loop && (
                        <motion.circle
                          cx={MCB.x}
                          cy={MCB.y}
                          r={2.2}
                          fill="none"
                          stroke={svg.ink}
                          strokeWidth={0.8}
                          style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{ scale: 2.8, opacity: 0 }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                        />
                      )}
                      <circle cx={MCB.x} cy={MCB.y} r={2.2} fill={svg.raised} stroke={svg.ink} strokeWidth={1} />
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* hit / focus layer */}
                {REGIONS.map((r) => (
                  <path
                    key={r.id}
                    d={r.d}
                    fill="transparent"
                    role="button"
                    tabIndex={site ? 0 : -1}
                    aria-pressed={isOn(r.id)}
                    aria-label={r.name}
                    className="cursor-pointer outline-none"
                    onClick={() => toggleRegion(r.id)}
                    onKeyDown={(e: KeyboardEvent<SVGPathElement>) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleRegion(r.id)
                      }
                    }}
                    onFocus={(e: FocusEvent<SVGPathElement>) => setFocus(e.currentTarget.matches(':focus-visible') ? r.id : null)}
                    onBlur={() => setFocus(null)}
                  />
                ))}
              </motion.g>

              {/* ----- referred pain layer ----- */}
              <motion.g
                initial={false}
                animate={{ opacity: site ? 0 : 1 }}
                transition={fadeT(reduce, site ? 0 : 0.15)}
                pointerEvents="none"
                aria-hidden={site}
              >
                <AnimatePresence initial={false}>
                  {!site && (
                    <motion.g key={ref.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fadeT(reduce)}>
                      {ref.targets.map((t) => (
                        <Target key={t} id={t} pulse={loop} />
                      ))}
                    </motion.g>
                  )}
                </AnimatePresence>

                {(Object.keys(ORGAN_NAME) as OrganId[]).map((o) => (
                  <motion.g key={o} initial={false} animate={{ opacity: activeOrgans.has(o) ? 1 : 0.32 }} transition={fadeT(reduce)}>
                    <Organ id={o} on={activeOrgans.has(o)} />
                  </motion.g>
                ))}

                <AnimatePresence initial={false}>
                  {!site && (
                    <motion.g key={ref.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fadeT(reduce)}>
                      {ref.paths.map((d) => (
                        <g key={d}>
                          <path d={d} fill="none" stroke={svg.raised} strokeOpacity={0.85} strokeWidth={4.6} strokeLinecap="round" />
                          <motion.path
                            d={d}
                            fill="none"
                            stroke={svg.brand}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeDasharray="3.2 3.2"
                            initial={false}
                            animate={loop ? { strokeDashoffset: [0, -12.8] } : { strokeDashoffset: 0 }}
                            transition={loop ? { duration: 0.9, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
                          />
                        </g>
                      ))}
                      {ref.paths.map((d) => {
                        const m = /^M([\d.]+) ([\d.]+)/.exec(d)
                        return m ? <circle key={`s-${d}`} cx={Number(m[1])} cy={Number(m[2])} r={2.4} fill={svg.teal} stroke={svg.raised} strokeWidth={1} /> : null
                      })}
                    </motion.g>
                  )}
                </AnimatePresence>
              </motion.g>
            </motion.svg>

            {/* region labels */}
            <AnimatePresence initial={false}>
              {site &&
                REGIONS.map((r) => (
                  <motion.span
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.1 } }}
                    transition={fadeT(reduce, 0.2)}
                    style={pct('site', r.label.x, r.label.y)}
                    className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center text-[11px] font-semibold leading-[1.15] transition-colors duration-150 ${
                      isOn(r.id) ? 'text-white' : 'text-[var(--text)]'
                    }`}
                  >
                    {r.lines.map((l) => (
                      <span key={l} className="block whitespace-nowrap">
                        {l}
                      </span>
                    ))}
                  </motion.span>
                ))}
              {site && sel === 'oav' && (
                <motion.span
                  key="mcb-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.1 } }}
                  transition={fadeT(reduce, 0.2)}
                  style={pct('site', MCB.x + 4, MCB.y + 1.5)}
                  className="pointer-events-none absolute -translate-y-1/2 whitespace-nowrap rounded bg-[var(--bg-raised)]/85 px-1 text-[11px] font-semibold text-[var(--text)]"
                >
                  McBurneyn piste
                </motion.span>
              )}
            </AnimatePresence>

            {/* referred-pain target labels */}
            <AnimatePresence initial={false}>
              {!site &&
                ref.labels.map((l) => (
                  <motion.span
                    key={`${ref.id}-${l.t}-${l.x}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.1 } }}
                    transition={fadeT(reduce, 0.3)}
                    style={pct('referred', l.x, l.y)}
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[var(--bg-raised)]/90 px-1.5 py-0.5 text-[11px] font-semibold text-brand-600 shadow-sm ring-1 ring-brand-500/30"
                  >
                    {l.t}
                  </motion.span>
                ))}
            </AnimatePresence>
          </div>

          {site && (
            <button
              type="button"
              onClick={() => toggleRegion('diffuse')}
              aria-pressed={sel === 'diffuse'}
              className={`flex min-h-[44px] w-full items-center justify-center rounded-xl border text-[13.5px] font-semibold transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.98] ${
                sel === 'diffuse' ? 'border-brand-500 bg-brand-500 text-white' : 'border-[var(--border)] text-[var(--text)]'
              }`}
            >
              Koko vatsa (diffuusi)
            </button>
          )}
        </div>

        {/* ---------- side panel ---------- */}
        <div className="min-w-0 space-y-3">
          {site ? (
            <>
              <div className="min-h-[132px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={sel ?? 'none'}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    transition={{ duration: reduce ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] }}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
                    aria-live="polite"
                  >
                    {sel ? (
                      <>
                        <p className="font-display text-[16px] font-semibold text-[var(--text)]">{SEL_NAME[sel]}</p>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Mahdollisia syitä</p>
                        <ul className="mt-2 space-y-1.5">
                          {CAUSES[sel].map((c) => (
                            <li key={c.name} className="flex gap-2.5 text-[13.5px] leading-snug text-[var(--text)]">
                              <span
                                className={`mt-[5px] h-2 w-2 shrink-0 rounded-full ${c.lethal ? 'bg-danger-500' : 'bg-[var(--border)]'}`}
                                aria-label={c.lethal ? 'nopeasti henkeä uhkaava' : undefined}
                              />
                              <span>
                                <span className={`font-medium ${c.lethal ? 'text-danger-500' : ''}`}>{c.name}</span>
                                {c.note && <span className="text-[var(--text-dim)]"> – {c.note}</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <>
                        <p className="font-display text-[16px] font-semibold text-[var(--text)]">Missä kipu on?</p>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-dim)]">
                          Napauta vatsan aluetta tai valitse koko vatsa. Kivun sijainti antaa vihjeen syystä.
                        </p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex gap-2.5 rounded-xl border border-danger-500/30 bg-danger-500/8 px-4 py-3">
                <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-danger-500" aria-hidden />
                <p className="text-[13px] leading-snug text-[var(--text)]">
                  Aortta-aneurysman repeämä, aortan dissekaatio, mesenteriaali-iskemia ja peritoniitti voivat edetä kuolemaan tunneissa –{' '}
                  <span className="font-semibold">älä viivytä kuljetusta.</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5" role="group" aria-label="Kivun lähde">
                {REFERRED.map((r) => {
                  const on = r.id === refId
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRefId(r.id)}
                      aria-pressed={on}
                      className={`flex min-h-[48px] items-center gap-2.5 rounded-xl border px-3.5 py-2 text-left transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.99] ${
                        on ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border)]'
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-1.5 text-[13.5px] leading-snug text-[var(--text)]">
                          <span className="inline-flex items-center gap-1.5 font-semibold">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" aria-hidden />
                            {r.source}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-dim)]" aria-label="tuntuu" />
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-hidden />
                            {r.target}
                          </span>
                        </span>
                        <span className="block text-[11px] text-[var(--text-dim)]">{r.kind}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-[var(--text-dim)]" aria-hidden>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-500" />
                  Sairas elin
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-500" />
                  Kipu tuntuu
                </span>
              </div>
            </>
          )}

          <p className="flex gap-2 text-[12.5px] leading-relaxed text-[var(--text-dim)]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>Kivun voimakkuus ei kerro vakavuudesta – pehmeä vatsa ei sulje pois mesenteriaali-iskemiaa.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
