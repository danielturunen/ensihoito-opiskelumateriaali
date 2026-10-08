import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Bullets, FadeSwap, Stage, useLoop } from '../parts/resp-kit'

type Pattern = 'normal' | 'kussmaul' | 'depression' | 'fatigue'

/** period = seconds per breath, amp = relative depth. Illustrative, not measured values. */
const P: Record<Pattern, { label: string; period: number; amp: number; title: string; tone: string; items: string[] }> = {
  normal: {
    label: 'Normaali',
    period: 3.4,
    amp: 0.5,
    title: 'Vertailukohta',
    tone: 'text-[var(--text)]',
    items: ['Rauhallinen, säännöllinen hengitys. Vertaa muihin kuvioihin syvyyttä ja tahtia.'],
  },
  kussmaul: {
    label: 'Kussmaul',
    period: 2.2,
    amp: 1,
    title: 'Kussmaulin hengitys',
    tone: 'text-brand-600',
    items: [
      'Syvä, työläs hengitys, jolla keho kompensoi asidoosia – tyypillisesti diabeettinen ketoasidoosi.',
      'Usein asetonin haju hengityksessä.',
      'Ei ole paniikkikohtaus! HHS:ssä ei ole merkittävää asidoosia eikä Kussmaulin hengitystä.',
    ],
  },
  depression: {
    label: 'Hengityslama',
    period: 7,
    amp: 0.22,
    title: 'Hengityslama',
    tone: 'text-danger-500',
    items: [
      'Hidas ja pinnallinen hengitys.',
      'Pistemäiset pupillit ja hengityslama viittaavat opioidiin – vastalääke naloksoni.',
      'Naloksonin vaikutusaika on lyhyt (noin 20–90 min): hengityslama voi uusiutua, joten potilas kuljetetaan aina.',
    ],
  },
  fatigue: {
    label: 'Väsyvä hengitys',
    period: 1.6,
    amp: 0.2,
    title: 'Hengitysväsymys – "hiljainen keuhko"',
    tone: 'text-danger-500',
    items: [
      'Tiheä mutta pinnallinen hengitys; potilas väsyy.',
      'Kun vinkuna vähenee ja hengitysääni hiljenee kokonaan, ilmaa ei enää liiku riittävästi – tilanne on pahempi, ei parempi.',
    ],
  },
}

const W = 340
const H = 70
const SPEED = 46 // px per second

/** One breath: smooth inhale (40 %), slower exhale. */
const breath = (ph: number) => (ph < 0.4 ? 0.5 - 0.5 * Math.cos((ph / 0.4) * Math.PI) : 0.5 + 0.5 * Math.cos(((ph - 0.4) / 0.6) * Math.PI))

function stripPath(period: number, amp: number) {
  // A strip exactly N breaths long (≥ 2 × W) so translating by one breath-multiple loops seamlessly.
  const cycle = period * SPEED
  const n = Math.max(2, Math.ceil((W * 2) / cycle))
  const len = n * cycle
  let d = ''
  for (let x = 0; x <= len; x += 2) {
    const ph = (x % cycle) / cycle
    const y = H - 8 - breath(ph) * amp * (H - 16)
    d += `${x === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return { d, shift: Math.floor(len / 2 / cycle) * cycle }
}

export default function BreathingPatterns(props: WidgetProps) {
  const initial = (['normal', 'kussmaul', 'depression', 'fatigue'] as Pattern[]).includes(props.initial as Pattern) ? (props.initial as Pattern) : 'normal'
  const [pat, setPat] = useState<Pattern>(initial)
  const { ref, active } = useLoop<HTMLDivElement>()
  const p = P[pat]
  const strip = useMemo(() => stripPath(p.period, p.amp), [p.period, p.amp])

  return (
    <div ref={ref}>
      <Segmented
        layoutId="breathing-pattern"
        size="sm"
        wrap
        value={pat}
        onChange={setPat}
        options={(Object.keys(P) as Pattern[]).map((k) => ({ value: k, label: P[k].label }))}
      />

      <Stage className="mt-3">
        <div className="grid grid-cols-[96px_1fr] items-center gap-2 p-3">
          {/* chest */}
          <svg viewBox="0 0 96 110" className="h-auto w-full" aria-hidden>
            <motion.g
              key={pat}
              style={{ transformOrigin: '48px 60px' }}
              animate={active ? { scaleX: [1, 1 + 0.12 * p.amp, 1], scaleY: [1, 1 + 0.05 * p.amp, 1] } : { scaleX: 1, scaleY: 1 }}
              transition={{ duration: p.period, repeat: active ? Infinity : 0, ease: 'easeInOut', times: [0, 0.4, 1] }}
            >
              <path d="M18 24C26 14 70 14 78 24C88 40 90 74 82 98H14C6 74 8 40 18 24Z" fill="rgba(248,105,10,0.12)" stroke={svg.brand} strokeWidth={2} />
              {[38, 52, 66, 80].map((y) => (
                <path key={y} d={`M22 ${y}C34 ${y + 6} 42 ${y + 4} 46 ${y - 2}M74 ${y}C62 ${y + 6} 54 ${y + 4} 50 ${y - 2}`} fill="none" stroke={svg.brand} strokeWidth={1.4} opacity={0.5} strokeLinecap="round" />
              ))}
              <path d="M48 20V96" stroke={svg.brand} strokeWidth={1.4} opacity={0.4} />
            </motion.g>
          </svg>

          {/* waveform */}
          <div className="relative overflow-hidden rounded-lg bg-[#070b14]" style={{ height: 86 }}>
            <span className="absolute top-1.5 left-2 text-[10px] font-semibold tracking-wide text-[#facc15]">HENGITYS</span>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-x-0 bottom-1 h-[70px] w-full" aria-hidden>
              <motion.path
                key={pat}
                d={strip.d}
                fill="none"
                stroke="#facc15"
                strokeWidth={2}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={{ x: 0 }}
                animate={active ? { x: -strip.shift } : { x: 0 }}
                transition={active ? { duration: strip.shift / SPEED, ease: 'linear', repeat: Infinity } : { duration: 0 }}
              />
            </svg>
          </div>
        </div>
      </Stage>

      <FadeSwap k={pat} className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        <p className={`mb-2 font-display text-[15px] font-semibold ${p.tone}`}>{p.title}</p>
        <Bullets items={p.items} />
      </FadeSwap>
      <p className="mt-2 text-[12px] text-[var(--text-dim)]">Kaaviokuva: syvyys ja tahti ovat havainnollistavia, eivät mittausarvoja.</p>
    </div>
  )
}
