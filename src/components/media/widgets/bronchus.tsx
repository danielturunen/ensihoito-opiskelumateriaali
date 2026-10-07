import { useEffect, useId, useState } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'motion/react'
import { Hourglass, Zap } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Caption, svg } from '../ui'
import { FadeSwap, Stage, StateTabs, Swatch, closedCurve, easeOut, rc, useAnimatedNumber, useLoop, wavyCircle, type Pt } from '../parts/resp-kit'

type Mech = 'spasm' | 'edema' | 'mucus'
type Drug = 'none' | 'beta2' | 'anti' | 'steroid'

const MECHS: { id: Mech; label: string; color: string }[] = [
  { id: 'spasm', label: 'Bronko­spasmi', color: rc.muscle },
  { id: 'edema', label: 'Limakalvon turvotus', color: rc.mucosa },
  { id: 'mucus', label: 'Lima­eritys', color: rc.mucus },
]

const DRUG_TABS: { value: Drug; label: string }[] = [
  { value: 'none', label: 'Ei lääkettä' },
  { value: 'beta2', label: 'Beeta-2-agonisti' },
  { value: 'anti', label: 'Antikolinergi' },
  { value: 'steroid', label: 'Kortikosteroidi' },
]

interface DrugInfo {
  name: string
  example: string
  targets: Mech[]
  mechanism: string
  onset: string
  onsetTone: 'fast' | 'slow' | 'delay'
  extra?: string
  side?: string
}

/* Facts from the article "Astma ja COPD". */
const DRUGS: Record<Exclude<Drug, 'none'>, DrugInfo> = {
  beta2: {
    name: 'Beeta-2-agonisti',
    example: 'esim. salbutamoli',
    targets: ['spasm'],
    mechanism: 'Stimuloi beeta-2-reseptoreita → keuhkoputken sileä lihas relaksoituu.',
    onset: 'Nopea, minuuteissa',
    onsetTone: 'fast',
    side: 'Vapina, takykardia, levottomuus',
  },
  anti: {
    name: 'Antikolinergi',
    example: 'esim. ipratropiumbromidi',
    targets: ['spasm', 'mucus'],
    mechanism: 'Salpaa muskariinireseptoreita → estää hermoston aiheuttamaa bronkokonstriktiota ja vähentää eritystä.',
    onset: 'Hitaampi kuin beeta-2-agonisti',
    onsetTone: 'slow',
    extra: 'Erityisen hyödyllinen COPD:ssa ja vaikeassa astmassa.',
    side: 'Suun kuivuminen',
  },
  steroid: {
    name: 'Kortikosteroidi',
    example: 'esim. hydrokortisoni tai metyyliprednisoloni suonensisäisesti',
    targets: ['edema'],
    mechanism: 'Hoitaa taustalla olevaa tulehdusta (limakalvon turvotus).',
    onset: 'Vasta tuntien viiveellä — annetaan silti varhain',
    onsetTone: 'delay',
  },
}

const MECH_NAME: Record<Mech, string> = { spasm: 'Bronkospasmi', edema: 'Turvotus', mucus: 'Limaneritys' }

/* ---------- geometry (viewBox 300 × 300) ---------- */
const C = 150
const R0 = 83.5 // open lumen radius with no obstruction
const STEROID_DELAY = 2.6 // s, stands in for "hours"

const arc = (r: number, a1: number, a2: number) => {
  const p = (a: number) => [C + r * Math.cos((a * Math.PI) / 180), C + r * Math.sin((a * Math.PI) / 180)].map((n) => n.toFixed(1)).join(' ')
  return `M${p(a1)}A${r} ${r} 0 0 1 ${p(a2)}`
}
const CARTILAGE = [
  [198, 252],
  [278, 336],
  [18, 74],
  [104, 160],
]
const BLOBS = [
  { a: 35, size: 14 },
  { a: 162, size: 10.5 },
  { a: 258, size: 12 },
]
const AEROSOL: Pt[] = [
  [-14, -8], [10, -16], [16, 8], [-6, 14], [2, -2], [-20, 6], [22, -4],
]

function lumenR(s: number, e: number) {
  const rMid = 98 - 24 * s
  const thick = 9 + 7 * s
  return rMid - thick / 2 - (10 + 18 * e)
}

function blobsPath(rL: number, m: number) {
  if (m < 0.03) return 'M0 0'
  return BLOBS.map((b) => {
    const a = (b.a * Math.PI) / 180
    const size = b.size * m
    const cr = rL - size * 0.7 - 1.5
    const cx = C + cr * Math.cos(a)
    const cy = C + cr * Math.sin(a)
    const pts: Pt[] = Array.from({ length: 7 }, (_, k) => {
      const t = (k / 7) * Math.PI * 2
      const rr = size * (1 + 0.18 * Math.sin(3 * t + b.a))
      return [cx + rr * Math.cos(t), cy + rr * 0.86 * Math.sin(t)] as const
    })
    return closedCurve(pts)
  }).join('')
}

function bucket(v: number): { label: string; tone: string; bar: string } {
  if (v >= 0.85) return { label: 'Avoin', tone: 'text-teal-600', bar: 'bg-teal-500' }
  if (v >= 0.62) return { label: 'Kaventunut', tone: 'text-brand-600', bar: 'bg-brand-400' }
  if (v >= 0.42) return { label: 'Selvästi ahtautunut', tone: 'text-brand-600', bar: 'bg-brand-500' }
  return { label: 'Vaikeasti ahtautunut', tone: 'text-danger-500', bar: 'bg-danger-500' }
}

export default function Bronchus(_props: WidgetProps) {
  const [on, setOn] = useState<Record<Mech, boolean>>({ spasm: true, edema: true, mucus: true })
  const [drug, setDrug] = useState<Drug>('none')
  const [steroidReady, setSteroidReady] = useState(false)
  const { ref, reduce, active } = useLoop<HTMLDivElement>()
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  useEffect(() => {
    setSteroidReady(false)
    if (drug !== 'steroid') return
    if (reduce) {
      setSteroidReady(true)
      return
    }
    const id = window.setTimeout(() => setSteroidReady(true), STEROID_DELAY * 1000)
    return () => window.clearTimeout(id)
  }, [drug, reduce])

  const sT = on.spasm ? (drug === 'beta2' ? 0 : drug === 'anti' ? 0.3 : 1) : 0
  const mT = on.mucus ? (drug === 'anti' ? 0.4 : 1) : 0
  const eT = on.edema ? (drug === 'steroid' ? 0.2 : 1) : 0

  const fast = { type: 'spring', duration: 0.7, bounce: 0.08 } as const
  const slow = { duration: 2.2, ease: easeOut } as const
  const delayed = { duration: 1.8, ease: 'easeInOut', delay: STEROID_DELAY } as const
  const sMV = useAnimatedNumber(sT, reduce, drug === 'anti' ? slow : fast)
  const mMV = useAnimatedNumber(mT, reduce, drug === 'anti' ? slow : fast)
  const eMV = useAnimatedNumber(eT, reduce, drug === 'steroid' ? delayed : fast)

  const rMid = useTransform(sMV, (s) => 98 - 24 * s)
  const thick = useTransform(sMV, (s) => 9 + 7 * s)
  const rMi = useTransform(sMV, (s) => 98 - 24 * s - (9 + 7 * s) / 2)
  const lumen = useTransform([sMV, eMV], ([s, e]: number[]) => wavyCircle(C, C, lumenR(s, e), 1.5 + 6 * s + 2.5 * e, 9, 0.3))
  const cilia = useTransform([sMV, eMV], ([s, e]: number[]) => wavyCircle(C, C, lumenR(s, e) + 4, 1.5 + 6 * s + 2.5 * e, 9, 0.3))
  const mucus = useTransform([sMV, eMV, mMV], ([s, e, m]: number[]) => blobsPath(lumenR(s, e), m))
  const mucosaFill = useTransform(eMV, [0, 1], [rc.mucosaSoft, rc.mucosaHot])
  const ratio = useTransform([sMV, eMV, mMV], ([s, e, m]: number[]) => Math.max(0.05, (lumenR(s, e) - 7 * m) / R0))

  const [b, setB] = useState(() => bucket(ratio.get()))
  useMotionValueEvent(ratio, 'change', (v) => {
    const nb = bucket(v)
    if (nb.label !== b.label) setB(nb)
  })

  const info = drug === 'none' ? null : DRUGS[drug]
  const inhaled = drug === 'beta2' || drug === 'anti'
  const countered = (m: Mech) => !!info && on[m] && info.targets.includes(m)

  return (
    <div ref={ref} className="space-y-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Ahtautumisen mekanismit</p>
        <div className="grid grid-cols-3 gap-2">
          {MECHS.map((m) => {
            const isOn = on[m.id]
            const helped = countered(m.id)
            return (
              <button
                key={m.id}
                aria-pressed={isOn}
                onClick={() => setOn((o) => ({ ...o, [m.id]: !o[m.id] }))}
                className={`flex min-h-[60px] flex-col items-start justify-center gap-1 rounded-xl border px-2.5 py-2 text-left transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${
                  isOn ? 'border-[var(--text-dim)]/40 bg-[var(--bg-card)] shadow-sm' : 'border-[var(--border)] bg-transparent'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full transition-opacity duration-150"
                    style={{ background: m.color, opacity: isOn ? 1 : 0.3 }}
                  />
                  <span className={`text-[10.5px] font-semibold uppercase tracking-wide ${helped ? 'text-teal-600' : 'text-[var(--text-dim)]'}`}>
                    {!isOn ? 'Pois' : helped ? 'Lääke ↓' : 'Päällä'}
                  </span>
                </span>
                <span
                  lang="fi"
                  className={`text-[12.5px] font-semibold leading-tight [hyphens:manual] ${isOn ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'}`}
                >
                  {m.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Stage className="mx-auto w-full max-w-[340px]">
          <svg
            viewBox="0 0 300 300"
            className="block h-auto w-full"
            role="img"
            aria-label={`Keuhkoputken poikkileikkaus. Ilmatien läpimitta: ${b.label.toLowerCase()}.`}
          >
            {/* wall: connective tissue + cartilage plates */}
            <circle cx={C} cy={C} r={136} fill={svg.surface} />
            <circle cx={C} cy={C} r={136} fill={rc.wallSoft} stroke={svg.line} strokeWidth={1.5} />
            <g fill="none" stroke={rc.cartilage} strokeWidth={11} strokeLinecap="round" opacity={0.75}>
              {CARTILAGE.map(([a1, a2]) => (
                <path key={a1} d={arc(120, a1, a2)} />
              ))}
            </g>

            {/* smooth muscle ring */}
            <motion.circle cx={C} cy={C} r={rMid} fill="none" stroke={rc.muscleSoft} style={{ strokeWidth: thick }} />
            <motion.circle cx={C} cy={C} r={rMid} fill="none" stroke={rc.muscle} strokeWidth={1.2} strokeDasharray="7 5" opacity={0.7} />

            {/* mucosa + open lumen */}
            <motion.circle cx={C} cy={C} r={rMi} fill={svg.surface} />
            <motion.circle cx={C} cy={C} r={rMi} style={{ fill: mucosaFill }} />
            <motion.path d={lumen} fill={svg.raised} />
            <motion.path d={lumen} fill={svg.airSoft} stroke={rc.mucosa} strokeWidth={1.8} strokeLinejoin="round" />
            <motion.path d={cilia} fill="none" stroke={rc.mucosa} strokeWidth={1.2} strokeDasharray="1.5 3" opacity={0.6} />

            {/* mucus plugs */}
            <motion.path d={mucus} fill={rc.mucusSoft} stroke={rc.mucus} strokeWidth={1.4} strokeLinejoin="round" />

            {/* inhaled drug aerosol */}
            {inhaled && (
              <g aria-hidden>
                {AEROSOL.map(([x, y], i) => (
                  <motion.circle
                    key={`${drug}-${i}`}
                    cx={C + x}
                    cy={C + y}
                    r={2.4}
                    fill={svg.teal}
                    initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                    animate={
                      active
                        ? { opacity: [0, 0.9, 0.9, 0], scale: 1, x: [0, x * 0.5], y: [0, y * 0.5] }
                        : { opacity: 0.8, scale: 1 }
                    }
                    transition={active ? { duration: 2.4, delay: i * 0.25, repeat: Infinity, ease: 'easeOut' } : { duration: 0.2 }}
                  />
                ))}
              </g>
            )}
          </svg>
        </Stage>

        <div className="space-y-3">
          <div className="rounded-xl bg-[var(--bg)] px-3.5 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[12px] font-medium text-[var(--text-dim)]">Ilmatien läpimitta</span>
              <span className={`font-display text-[14px] font-semibold ${b.tone}`} aria-live="polite">
                {b.label}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--border)]">
              <motion.div className={`h-full w-full rounded-full transition-colors duration-300 ${b.bar}`} style={{ scaleX: ratio, originX: 0 }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3.5 gap-y-1.5">
            <Swatch color={rc.cartilage} label="Rusto" />
            <Swatch color={rc.muscleSoft} stroke={rc.muscle} label="Sileä lihas" />
            <Swatch color={rc.mucosaSoft} stroke={rc.mucosa} label="Limakalvo" />
            <Swatch color={rc.mucusSoft} stroke={rc.mucus} label="Lima" />
            <Swatch color={svg.airSoft} stroke={rc.airLine} label="Ilmatie" />
          </div>
          <Caption>
            Kolmoismekanismi tukkii erityisesti <strong className="font-semibold text-[var(--text)]">uloshengitystä</strong> → ilmaa jää loukkuun
            keuhkoihin.
          </Caption>
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Lääke</p>
        <StateTabs value={drug} onChange={setDrug} options={DRUG_TABS} layoutId={`drug-${uid}`} />
        <FadeSwap k={drug}>
          {info ? (
            <div className="space-y-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-3">
              <div>
                <p className="font-display text-[15px] font-semibold text-[var(--text)]">{info.name}</p>
                <p className="text-[12px] text-[var(--text-dim)]">{info.example}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {info.targets.map((t) => (
                  <span key={t} className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[11.5px] font-semibold text-teal-600">
                    {MECH_NAME[t]} ↓
                  </span>
                ))}
              </div>
              <p className="text-[13.5px] leading-snug text-[var(--text)]">{info.mechanism}</p>
              <div className="flex items-start gap-2 text-[13px] leading-snug">
                {info.onsetTone === 'delay' ? (
                  <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.25} />
                ) : (
                  <Zap className={`mt-0.5 h-4 w-4 shrink-0 ${info.onsetTone === 'fast' ? 'text-teal-600' : 'text-brand-600'}`} strokeWidth={2.25} />
                )}
                <span>
                  <span className="text-[var(--text-dim)]">Vaikutus alkaa: </span>
                  <span className="font-semibold text-[var(--text)]">{info.onset}</span>
                </span>
              </div>
              {info.onsetTone === 'delay' && (
                <div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                    <motion.div
                      className="h-full w-full rounded-full bg-brand-500"
                      style={{ originX: 0 }}
                      initial={{ scaleX: reduce ? 1 : 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: reduce ? 0 : STEROID_DELAY, ease: 'linear' }}
                    />
                  </div>
                  <p className="mt-1 text-[11.5px] text-[var(--text-dim)]" aria-live="polite">
                    {steroidReady ? (on.edema ? 'Tulehdus ja turvotus lievittyvät.' : 'Turvotus ei ole nyt päällä — kytke se nähdäksesi vaikutuksen.') : 'Tuntien viive…'}
                  </p>
                </div>
              )}
              {info.extra && <p className="text-[13px] leading-snug text-[var(--text)]">{info.extra}</p>}
              {info.side && (
                <p className="text-[13px] leading-snug">
                  <span className="text-[var(--text-dim)]">Haitat: </span>
                  {info.side}
                </p>
              )}
            </div>
          ) : (
            <p className="rounded-xl bg-[var(--bg)] px-3.5 py-3 text-[13px] leading-snug text-[var(--text-dim)]">
              Valitse lääke: kuva näyttää, mihin mekanismiin se vaikuttaa ja kuinka nopeasti.
            </p>
          )}
        </FadeSwap>
      </div>

      <Caption>
        Yhdistelmä <strong className="font-semibold text-[var(--text)]">beeta-2-agonisti + antikolinergi</strong> toimii vaikeassa obstruktiossa, koska
        lääkkeet vaikuttavat eri reseptoreiden kautta.
      </Caption>
    </div>
  )
}
