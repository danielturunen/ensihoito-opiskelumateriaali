import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { TriangleAlert } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Bullets, FadeSwap, FlowDots, Stage, closedCurve, rc, useLoop, type Pt } from '../parts/resp-kit'

type Group = 'upper' | 'lower'
type PartId = 'nose' | 'mouth' | 'pharynx' | 'epiglottis' | 'larynx' | 'trachea' | 'main' | 'bronchi' | 'alveoli'
type Sound = 'none' | 'stridor' | 'wheeze'

interface Part {
  id: PartId
  name: string
  group: Group
  text: string
  /** where the selection ring pulses */
  anchor: Pt
}

/* Facts from "Hengitysteiden fysiologia" + "Astma ja COPD". */
const PARTS: Part[] = [
  {
    id: 'nose',
    name: 'Nenäontelo',
    group: 'upper',
    anchor: [150, 108],
    text: 'Hengitysilma kulkee normaalisti nenän kautta. Nenäontelo suodattaa, lämmittää ja kostuttaa ilmaa ennen kuin se jatkaa alemmas.',
  },
  {
    id: 'mouth',
    name: 'Suuontelo',
    group: 'upper',
    anchor: [140, 150],
    text: 'Toinen reitti ilmalle nenän rinnalla. Tajunnan laskiessa kieli painuu taaksepäin ja voi ahtauttaa nielua.',
  },
  {
    id: 'pharynx',
    name: 'Nielu',
    group: 'upper',
    anchor: [216, 140],
    text: 'Ilman ja ruoan yhteinen reitti. Kun tajunta laskee, nielun lihastonus heikkenee ja ilmatie voi sulkeutua ilman näkyvää esinettä.',
  },
  {
    id: 'epiglottis',
    name: 'Kurkunkansi (epiglottis)',
    group: 'upper',
    anchor: [204, 186],
    text: 'Suojaa alempia hengitysteitä aspiraatiolta sulkemalla kurkunpään aukon nieltäessä. Kurkunkannen tulehdus (epiglottiitti) voi ahtauttaa ilmatietä turvotuksella.',
  },
  {
    id: 'larynx',
    name: 'Kurkunpää ja äänihuulet',
    group: 'upper',
    anchor: [189, 229],
    text: 'Äänihuulten sulkeutuminen suojaa alempia hengitysteitä. Ahtauma tällä tasolla kuuluu stridorina; äänen käheys tai selvä muutos on red flag -löydös.',
  },
  {
    id: 'trachea',
    name: 'Henkitorvi',
    group: 'lower',
    anchor: [188, 292],
    text: 'Johtaa ilman kurkunpäästä rintakehään. Rustorenkaat pitävät sen avoimena.',
  },
  {
    id: 'main',
    name: 'Pääbronkukset',
    group: 'lower',
    anchor: [188, 336],
    text: 'Henkitorvi jakautuu oikeaan ja vasempaan pääbronkukseen, jotka vievät ilman kumpaankin keuhkoon.',
  },
  {
    id: 'bronchi',
    name: 'Bronkukset ja bronkiolit',
    group: 'lower',
    anchor: [122, 394],
    text: 'Haarautuvat yhä pienemmiksi. Seinämässä on sileää lihasta, limakalvo ja limaa erittäviä soluja — astmassa ja COPD:ssa ne ahtautuvat, mikä kuuluu vinkunana.',
  },
  {
    id: 'alveoli',
    name: 'Alveolit (keuhkorakkulat)',
    group: 'lower',
    anchor: [276, 428],
    text: 'Varsinainen kaasujenvaihto: happi siirtyy alveoleista vereen ja hiilidioksidi verestä uloshengitysilmaan.',
  },
]

const GROUPS: Record<Group, { name: string; text: string; color: string; soft: string; dot: string }> = {
  upper: {
    name: 'Ylähengitystiet',
    text: 'Johtavat, suodattavat, lämmittävät ja kostuttavat ilmaa sekä suojaavat alempia hengitysteitä aspiraatiolta.',
    color: svg.brand,
    soft: svg.brandSoft,
    dot: 'bg-brand-500',
  },
  lower: {
    name: 'Alahengitystiet',
    text: 'Kuljettavat ilman syvälle keuhkoihin; varsinainen kaasujenvaihto tapahtuu alveoleissa.',
    color: svg.teal,
    soft: svg.tealSoft,
    dot: 'bg-teal-500',
  },
}

const SOUNDS: Record<Exclude<Sound, 'none'>, { title: string; group: Group; items: ReactNode[] }> = {
  stridor: {
    title: 'Stridor → ylähengitystie',
    group: 'upper',
    items: [
      <>
        Kuriseva, korkea ääni — vaikein yleensä <strong className="font-semibold">sisäänhengityksessä</strong>.
      </>,
      'Muita piirteitä: äänen muutos, kuolaaminen, nielemisvaikeus.',
    ],
  },
  wheeze: {
    title: 'Vinkuna → alahengitystiet',
    group: 'lower',
    items: [
      <>
        Uloshengityksen poikkeava ääni — vaikein yleensä <strong className="font-semibold">uloshengityksessä</strong>.
      </>,
      'Muita piirteitä: pitkittynyt uloshengitys, bronkospasmi (keuhkoputkien supistuminen), lisääntynyt hengitystyö.',
    ],
  },
}

/* ---------- geometry (viewBox 360 × 470): head in profile flowing into a frontal bronchial tree ---------- */
const HEAD =
  'M160 290L160 222C160 208 152 198 138 196C126 194 114 190 110 180C106 172 108 164 106 158C101 156 99 152 102 148C104 146 104 144 102 142C99 139 100 135 104 132C106 130 106 128 104 126C96 125 86 123 85 117C85 111 98 100 104 90C108 84 109 80 110 74C112 54 128 32 154 22C180 12 222 14 250 30C274 46 288 80 284 114C281 140 268 160 258 176C251 188 248 204 248 222L248 290'
const NOSE_D = 'M104 120C110 108 126 98 150 94C172 91 192 96 206 104L206 121C180 125 130 126 104 120Z'
const TURBINATES = ['M150 101C162 99 178 101 190 107', 'M138 109C156 107 176 109 192 114', 'M130 116C150 115 172 116 192 119']
const ORAL_D = 'M106 131C130 128 170 128 197 131C201 146 201 160 197 176C176 182 136 182 116 172C108 164 104 146 106 131Z'
const TONGUE_D = 'M112 156C126 146 160 138 182 142C194 146 198 158 196 176C194 190 186 196 176 194C156 190 132 184 118 174C110 168 108 160 112 156Z'
const PHARYNX_D = 'M206 98C216 94 226 98 228 110L228 236L210 236C208 214 204 196 201 180C199 160 201 128 206 98Z'
const EPI_D = 'M197 204C196 190 200 177 208 168C212 172 211 184 205 195C203 199 201 203 199 207Z'
const LARYNX_D = 'M178 206C171 214 169 224 174 233L176 254L202 254L204 206Z'
const VOCAL = ['M180 223L189.5 229L180 235Z', 'M200 223L190.5 229L200 235Z']
const TRACHEA_D = 'M188 254L188 332'
const MAIN_D = ['M188 333C180 344 166 352 150 362', 'M188 333C198 342 214 350 234 356']

type Seg = [number, number, number, number, number] // x1 y1 x2 y2 width
const BRANCHES: Seg[] = [
  [150, 362, 116, 350, 8], [150, 362, 122, 394, 8], [150, 362, 150, 414, 8],
  [116, 350, 98, 336, 4.5], [116, 350, 94, 364, 4.5],
  [122, 394, 96, 398, 4.5], [122, 394, 108, 422, 4.5],
  [150, 414, 130, 440, 4.5], [150, 414, 162, 446, 4.5],
  [234, 356, 266, 346, 8], [234, 356, 262, 392, 8], [234, 356, 230, 414, 8],
  [266, 346, 282, 334, 4.5], [266, 346, 290, 364, 4.5],
  [262, 392, 288, 398, 4.5], [262, 392, 274, 422, 4.5],
  [230, 414, 214, 442, 4.5], [230, 414, 246, 446, 4.5],
]
const TIPS = BRANCHES.filter((b) => b[4] < 6)

/** Grape-like alveolar cluster at the end of a terminal bronchiole. */
function cluster([x1, y1, x2, y2]: Seg): Pt[] {
  const len = Math.hypot(x2 - x1, y2 - y1)
  const dx = (x2 - x1) / len
  const dy = (y2 - y1) / len
  const px = -dy
  const py = dx
  return [
    [x2 + dx * 6, y2 + dy * 6],
    [x2 + dx * 2 + px * 6, y2 + dy * 2 + py * 6],
    [x2 + dx * 2 - px * 6, y2 + dy * 2 - py * 6],
    [x2 + dx * 10 + px * 3.5, y2 + dy * 10 + py * 3.5],
  ]
}
const ALVEOLI = TIPS.flatMap(cluster)

const LUNG_L: Pt[] = [
  [132, 304], [100, 318], [76, 350], [64, 400], [66, 446], [100, 462], [150, 460], [176, 448], [172, 400], [166, 360], [160, 328], [148, 308],
]
const LUNG_R: Pt[] = LUNG_L.map(([x, y]) => [376 - x, y] as const)

const INSP_D = 'M86 121C120 116 170 102 214 110C220 140 218 176 212 196C206 210 192 210 189 222L188 330'
const EXP_L = 'M108 420L122 394L150 362C166 352 180 344 188 334L188 222C190 208 206 204 212 188C216 170 206 154 186 151C160 148 130 146 102 142'
const EXP_R = 'M274 422L262 392L234 356C214 350 198 342 188 334L188 222C190 208 206 204 212 188C216 170 206 154 186 151C160 148 130 146 102 142'

const partById = (id: PartId) => PARTS.find((p) => p.id === id) as Part

/** One structure: visible drawing + generous invisible tap target. */
function Structure({
  part,
  state,
  onSelect,
  hit,
  children,
}: {
  part: Part
  state: 'normal' | 'selected' | 'dim'
  onSelect: (id: PartId) => void
  hit: ReactNode
  children: ReactNode
}) {
  const g = GROUPS[part.group]
  return (
    <motion.g
      initial={false}
      animate={{ opacity: state === 'dim' ? 0.32 : 1 }}
      transition={{ duration: 0.2 }}
      style={{ filter: state === 'selected' ? `drop-shadow(0 0 5px ${g.color})` : 'none' }}
    >
      {children}
      <g
        aria-hidden
        onClick={() => onSelect(part.id)}
        className="cursor-pointer"
        fill="transparent"
        stroke="transparent"
        style={{ pointerEvents: 'all' }}
      >
        {hit}
      </g>
    </motion.g>
  )
}

export default function AirwayAnatomy(_props: WidgetProps) {
  const [selected, setSelected] = useState<PartId | null>(null)
  const [sound, setSound] = useState<Sound>('none')
  const { ref, reduce, active } = useLoop<HTMLDivElement>()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  const select = (id: PartId) => {
    setSelected((cur) => (cur === id && sound === 'none' ? null : id))
    setSound('none')
  }
  const chooseSound = (s: Sound) => {
    setSound(s)
    if (s !== 'none') setSelected(null)
  }

  const soundGroup: Group | null = sound === 'none' ? null : SOUNDS[sound].group
  const stateOf = (p: Part): 'normal' | 'selected' | 'dim' => {
    if (soundGroup) return p.group === soundGroup ? 'normal' : 'dim'
    if (!selected) return 'normal'
    return p.id === selected ? 'selected' : 'dim'
  }
  const sel = selected ? partById(selected) : null
  const U = GROUPS.upper
  const L = GROUPS.lower
  const tube = (d: string, w: number, key?: string | number) => (
    <g key={key} fill="none" strokeLinecap="round">
      <path d={d} stroke={L.color} strokeWidth={w} />
      <path d={d} stroke={svg.surface} strokeWidth={w - 3.2} />
      <path d={d} stroke={L.soft} strokeWidth={w - 3.2} />
    </g>
  )

  const ariaLabel = sel
    ? `Hengitystiet: valittuna ${sel.name}.`
    : sound !== 'none'
      ? `Hengitystiet: ${SOUNDS[sound].title}.`
      : 'Hengitystiet: nenäontelo, suuontelo, nielu, kurkunkansi, kurkunpää ja äänihuulet (ylähengitystiet) sekä henkitorvi, pääbronkukset, bronkukset, bronkiolit ja alveolit (alahengitystiet).'

  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-start">
      <Stage className="mx-auto w-full max-w-[400px]">
        <AnimatePresence>
          {(sel || sound !== 'none') && (
            <motion.div
              key={sel ? sel.id : sound}
              initial={reduce ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex max-w-[85%] items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-raised)] px-2.5 py-1 text-[12px] font-semibold text-[var(--text)] shadow-sm"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${GROUPS[sel ? sel.group : (soundGroup as Group)].dot}`} />
              <span className="truncate">{sel ? sel.name : SOUNDS[sound as Exclude<Sound, 'none'>].title}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <svg viewBox="0 0 360 470" className="block h-auto w-full" role="img" aria-label={ariaLabel}>
          {/* head & neck silhouette (profile) */}
          <path d={HEAD} fill={svg.surface} stroke={svg.line} strokeWidth={1.6} strokeLinejoin="round" />
          {/* cervical spine + oesophagus for orientation */}
          <g aria-hidden fill={svg.line} opacity={0.8}>
            {[112, 134, 156, 178, 200, 222, 244, 266].map((y) => (
              <rect key={y} x={232} y={y} width={14} height={17} rx={4} />
            ))}
          </g>
          <path d="M215 236V286" stroke={svg.line} strokeWidth={13} strokeLinecap="round" opacity={0.9} aria-hidden />
          {/* faint lungs */}
          <g aria-hidden fill={rc.lungSoft} stroke={rc.lung} strokeWidth={1.5} opacity={0.55}>
            <path d={closedCurve(LUNG_L)} />
            <path d={closedCurve(LUNG_R)} />
          </g>

          {/* sound regions */}
          <AnimatePresence>
            {sound !== 'none' && (
              <motion.rect
                key={sound}
                {...(sound === 'stridor' ? { x: 78, y: 84, width: 160, height: 176, rx: 30 } : { x: 54, y: 294, width: 268, height: 172, rx: 34 })}
                fill={sound === 'stridor' ? U.soft : L.soft}
                stroke={sound === 'stridor' ? U.color : L.color}
                strokeWidth={1.6}
                strokeDasharray="5 5"
                initial={reduce ? false : { opacity: 0 }}
                animate={active ? { opacity: [0.55, 1, 0.55] } : { opacity: 0.85 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={active ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
              />
            )}
          </AnimatePresence>

          {/* ---- upper airway ---- */}
          <Structure part={partById('pharynx')} state={stateOf(partById('pharynx'))} onSelect={select} hit={<path d={PHARYNX_D} strokeWidth={8} />}>
            <path d={PHARYNX_D} fill={U.soft} stroke={U.color} strokeWidth={1.8} strokeLinejoin="round" />
          </Structure>
          <Structure part={partById('nose')} state={stateOf(partById('nose'))} onSelect={select} hit={<path d={NOSE_D} strokeWidth={10} />}>
            <path d={NOSE_D} fill={U.soft} stroke={U.color} strokeWidth={1.8} strokeLinejoin="round" />
            <g fill="none" stroke={U.color} strokeWidth={1.5} strokeLinecap="round" opacity={0.55}>
              {TURBINATES.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </Structure>
          <Structure part={partById('mouth')} state={stateOf(partById('mouth'))} onSelect={select} hit={<path d={ORAL_D} strokeWidth={6} />}>
            <path d={ORAL_D} fill={U.soft} stroke={U.color} strokeWidth={1.8} strokeLinejoin="round" />
          </Structure>
          {/* tongue + palate (context, not selectable) */}
          <g aria-hidden pointerEvents="none">
            <path d={TONGUE_D} fill={rc.tissueSoft} stroke={rc.tissue} strokeWidth={1.6} />
            <path d="M106 125C140 128 176 127 199 125" fill="none" stroke={svg.dim} strokeOpacity={0.45} strokeWidth={3} strokeLinecap="round" />
            <path d="M199 125C206 128 210 134 210 144" fill="none" stroke={rc.tissue} strokeWidth={5} strokeLinecap="round" />
          </g>
          <Structure part={partById('larynx')} state={stateOf(partById('larynx'))} onSelect={select} hit={<path d={LARYNX_D} strokeWidth={10} />}>
            <path d={LARYNX_D} fill={U.soft} stroke={U.color} strokeWidth={1.8} strokeLinejoin="round" />
            <g fill={U.color}>
              {VOCAL.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
          </Structure>
          <Structure part={partById('epiglottis')} state={stateOf(partById('epiglottis'))} onSelect={select} hit={<circle cx={204} cy={188} r={15} />}>
            <path d={EPI_D} fill={U.color} fillOpacity={0.85} stroke={U.color} strokeWidth={1.4} strokeLinejoin="round" />
          </Structure>

          {/* ---- lower airway ---- */}
          <Structure part={partById('trachea')} state={stateOf(partById('trachea'))} onSelect={select} hit={<path d={TRACHEA_D} strokeWidth={30} />}>
            {tube(TRACHEA_D, 20)}
            <path d={TRACHEA_D} stroke={L.color} strokeOpacity={0.45} strokeWidth={16.8} strokeDasharray="2.5 5" fill="none" />
          </Structure>
          <Structure
            part={partById('main')}
            state={stateOf(partById('main'))}
            onSelect={select}
            hit={
              <g strokeWidth={24} strokeLinecap="round" fill="none">
                {MAIN_D.map((d) => (
                  <path key={d} d={d} />
                ))}
              </g>
            }
          >
            {MAIN_D.map((d) => tube(d, 13, d))}
          </Structure>
          <Structure
            part={partById('bronchi')}
            state={stateOf(partById('bronchi'))}
            onSelect={select}
            hit={
              <g strokeLinecap="round">
                {BRANCHES.map(([x1, y1, x2, y2], i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={16} />
                ))}
              </g>
            }
          >
            <g strokeLinecap="round" stroke={L.color}>
              {BRANCHES.map(([x1, y1, x2, y2, w], i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={w} />
              ))}
            </g>
          </Structure>
          <Structure
            part={partById('alveoli')}
            state={stateOf(partById('alveoli'))}
            onSelect={select}
            hit={
              <g>
                {TIPS.map((t, i) => (
                  <circle key={i} cx={t[2] + (t[2] - t[0]) * 0.2} cy={t[3] + (t[3] - t[1]) * 0.2} r={12} />
                ))}
              </g>
            }
          >
            <g fill={L.soft} stroke={L.color} strokeWidth={1.3}>
              {ALVEOLI.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={4.3} />
              ))}
            </g>
          </Structure>

          {/* narrowing marker for stridor */}
          {sound === 'stridor' && (
            <g aria-hidden fill="none" stroke={U.color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M160 221L169 229L160 237" />
              <path d="M218 221L209 229L218 237" />
            </g>
          )}

          {/* airflow */}
          {sound === 'stridor' && <FlowDots d={INSP_D} count={8} duration={2.6} active={active} color={U.color} r={3.2} />}
          {sound === 'wheeze' && (
            <>
              <FlowDots d={EXP_L} count={9} duration={5} active={active} color={L.color} r={3} />
              <FlowDots d={EXP_R} count={9} duration={5} active={active} color={L.color} r={3} />
            </>
          )}

          {/* pulsing ring on the selected structure */}
          {sel && (
            <motion.circle
              key={sel.id}
              cx={sel.anchor[0]}
              cy={sel.anchor[1]}
              r={13}
              fill="none"
              stroke={GROUPS[sel.group].color}
              strokeWidth={2}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={active ? { scale: [0.7, 1.5], opacity: [0.9, 0] } : { scale: 1, opacity: 0.8 }}
              transition={active ? { duration: 1.4, repeat: Infinity, ease: 'easeOut' } : { duration: 0.2 }}
              pointerEvents="none"
            />
          )}
        </svg>
      </Stage>

      <div className="space-y-4">
        {(['upper', 'lower'] as Group[]).map((gid) => {
          const g = GROUPS[gid]
          return (
            <div key={gid}>
              <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
                <span className={`h-2 w-2 rounded-full ${g.dot}`} aria-hidden />
                {g.name}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PARTS.filter((p) => p.group === gid).map((p) => {
                  const on = selected === p.id
                  return (
                    <button
                      key={p.id}
                      aria-pressed={on}
                      onClick={() => select(p.id)}
                      className={`min-h-[44px] rounded-full border px-3.5 text-[13px] font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] ${
                        on
                          ? gid === 'upper'
                            ? 'border-brand-500 bg-brand-500 text-white'
                            : 'border-teal-500 bg-teal-500 text-white'
                          : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)]'
                      }`}
                    >
                      {p.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        <FadeSwap k={sel ? sel.id : sound} className="min-h-[96px]" >
          {sel ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-3" aria-live="polite">
              <p className="font-display text-[16px] font-semibold text-[var(--text)]">{sel.name}</p>
              <p className={`mt-0.5 flex items-center gap-1.5 text-[12px] font-semibold ${sel.group === 'upper' ? 'text-brand-600' : 'text-teal-600'}`}>
                <span className={`h-2 w-2 rounded-full ${GROUPS[sel.group].dot}`} aria-hidden />
                {GROUPS[sel.group].name}
              </p>
              <p className="mt-2 text-[13.5px] leading-snug text-[var(--text)]">{sel.text}</p>
              <p className="mt-2 border-t border-[var(--border)] pt-2 text-[12px] leading-snug text-[var(--text-dim)]">{GROUPS[sel.group].text}</p>
            </div>
          ) : sound !== 'none' ? (
            <div className="space-y-2" aria-live="polite">
              <div
                className={`rounded-xl border px-3.5 py-3 ${
                  SOUNDS[sound].group === 'upper' ? 'border-brand-500/30 bg-brand-500/8' : 'border-teal-500/30 bg-teal-500/10'
                }`}
              >
                <p className={`mb-2 font-display text-[15px] font-semibold ${SOUNDS[sound].group === 'upper' ? 'text-brand-600' : 'text-teal-600'}`}>
                  {SOUNDS[sound].title}
                </p>
                <Bullets items={SOUNDS[sound].items} dot={SOUNDS[sound].group === 'upper' ? 'bg-brand-500' : 'bg-teal-500'} />
              </div>
              <p className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 px-3.5 py-2.5 text-[13px] leading-snug text-[var(--text)]">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" strokeWidth={2.25} />
                Mitä ylempänä ahtauma, sitä nopeammin tilanne voi muuttua täydelliseksi tukokseksi.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {(['upper', 'lower'] as Group[]).map((gid) => (
                <div key={gid} className="rounded-xl bg-[var(--bg)] px-3.5 py-2.5">
                  <p className={`text-[13px] font-semibold ${gid === 'upper' ? 'text-brand-600' : 'text-teal-600'}`}>{GROUPS[gid].name}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-[var(--text)]">{GROUPS[gid].text}</p>
                </div>
              ))}
              <p className="text-[12px] text-[var(--text-dim)]">Napauta rakennetta kuvassa tai listassa.</p>
            </div>
          )}
        </FadeSwap>

        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Ääni</p>
          <Segmented
            value={sound}
            onChange={chooseSound}
            layoutId={`snd-${uid}`}
            options={[
              { value: 'none', label: 'Ei' },
              { value: 'stridor', label: 'Stridor' },
              { value: 'wheeze', label: 'Vinkuna' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
