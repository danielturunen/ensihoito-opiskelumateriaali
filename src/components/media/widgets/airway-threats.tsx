import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Bullets, FadeSwap, rc, Stage, useLoop } from '../parts/resp-kit'

type Threat = 'object' | 'swelling' | 'consciousness' | 'fatigue'

const INFO: Record<Threat, { label: string; title: string; items: string[] }> = {
  object: {
    label: 'Mekaaninen tukos',
    title: 'Mekaaninen tukos',
    items: ['Vierasesine, oksennus, veri, lima tai irronnut hammasproteesi estää ilman kulun fyysisesti.'],
  },
  swelling: {
    label: 'Turvotus',
    title: 'Turvotus',
    items: [
      'Anafylaksia, epiglottiitti, palovamma tai trauma ahtauttaa ilmatietä kudosturvotuksella.',
      'Mitä ylempänä turvotus sijaitsee, sitä vaarallisemmaksi tilanne voi muuttua.',
    ],
  },
  consciousness: {
    label: 'Tajunnan lasku',
    title: 'Tajunnan lasku',
    items: [
      'Esim. hypoglykemia, intoksikaatio, kouristelu tai aivoverenkiertohäiriö heikentää nielun lihastonusta – kieli painuu taaksepäin.',
      'Suojamekanismit heikkenevät ja aspiraatioriski kasvaa. Tajuton potilas on aina myös ilmatiepotilas.',
    ],
  },
  fatigue: {
    label: 'Hengitysväsymys',
    title: 'Hengitysväsymys tai lihasheikkous',
    items: [
      'Esim. vaikea astma, COPD-pahenema tai pitkittyneen kouristelun jälkitila.',
      'Ilmatie voi olla anatomisesti auki, mutta potilaalla ei ole enää voimia hengittää tehokkaasti.',
    ],
  },
}

const PROTECT = ['Tajunta', 'Nielemisrefleksi', 'Yskimisrefleksi', 'Äänihuulten sulkeutuminen', 'Kurkunkansi']

const HEAD =
  'M120 12C180 4 236 30 244 70L258 92L246 100L244 108L240 114L244 120C242 140 228 150 208 150C198 160 194 190 196 230H96C96 190 92 170 80 150C40 130 30 60 70 30C86 18 104 12 120 12Z'
/** Airway centre line: nose/mouth → pharynx → larynx → trachea. */
const AIR = 'M240 108C210 108 170 106 150 108C126 110 120 128 124 146C128 166 134 190 138 230'
/** Fraction of AIR length where each obstruction sits (airflow stops there). */
const STOP: Record<Threat, number> = { object: 0.66, swelling: 0.58, consciousness: 0.47, fatigue: 1 }

export default function AirwayThreats(_props: WidgetProps) {
  const [th, setTh] = useState<Threat>('object')
  const { ref, active } = useLoop<HTMLDivElement>()
  const pathRef = useRef<SVGPathElement>(null)
  const [pts, setPts] = useState<{ x: number; y: number }[]>([])
  useLayoutEffect(() => {
    const p = pathRef.current
    if (!p) return
    const len = p.getTotalLength()
    setPts(Array.from({ length: 41 }, (_, i) => p.getPointAtLength((len * i) / 40)))
  }, [])

  const info = INFO[th]
  const stopIdx = Math.round(STOP[th] * 40)
  const route = pts.slice(0, stopIdx + 1)
  const weak = th === 'fatigue'
  const tongueBack = th === 'consciousness'

  return (
    <div ref={ref}>
      <Segmented
        layoutId="airway-threat"
        size="sm"
        wrap
        value={th}
        onChange={setTh}
        options={(Object.keys(INFO) as Threat[]).map((k) => ({ value: k, label: INFO[k].label }))}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 300 236" className="mx-auto h-auto w-full max-w-[420px]" role="img" aria-label={`${info.title}. ${info.items.join(' ')}`}>
          <path d={HEAD} fill="color-mix(in srgb, #d9a07c 22%, var(--bg-raised))" stroke="rgba(217,160,124,0.8)" strokeWidth={1.8} strokeLinejoin="round" />
          {/* airway lumen */}
          <path d={AIR} fill="none" stroke={rc.airLine} strokeOpacity={0.25} strokeWidth={20} strokeLinecap="round" />
          <path ref={pathRef} d={AIR} fill="none" stroke={rc.airLine} strokeOpacity={0.5} strokeWidth={1.2} strokeDasharray="2 4" />

          {/* swelling narrows the pharynx/larynx */}
          <motion.path
            d="M118 118C112 132 114 150 122 164M136 120C132 134 134 150 140 166"
            fill="none"
            stroke={rc.mucosaHot}
            strokeLinecap="round"
            initial={false}
            animate={{ strokeWidth: th === 'swelling' ? 11 : 0, opacity: th === 'swelling' ? 1 : 0 }}
            transition={{ type: 'spring', duration: 0.7, bounce: 0.1 }}
          />

          {/* tongue */}
          <motion.ellipse
            rx={30}
            ry={12}
            fill={rc.mucosaSoft}
            stroke={rc.mucosa}
            strokeWidth={1.6}
            initial={false}
            animate={tongueBack ? { cx: 146, cy: 124, rotate: 50 } : { cx: 184, cy: 131, rotate: -4 }}
            transition={{ type: 'spring', duration: 0.8, bounce: 0.1 }}
          />
          {!tongueBack && (
            <text x={184} y={135} fontSize={10.5} fill={svg.ink} textAnchor="middle">
              kieli
            </text>
          )}
          {/* epiglottis */}
          <path d="M128 140C122 146 122 154 126 158" fill="none" stroke={rc.mucosa} strokeWidth={3} strokeLinecap="round" />

          {/* foreign body */}
          <motion.path
            d="M124 152C130 146 142 148 144 156C146 164 136 170 128 166C122 163 120 157 124 152Z"
            fill="#78716c"
            stroke="#57534e"
            strokeWidth={1.4}
            initial={false}
            animate={{ opacity: th === 'object' ? 1 : 0, scale: th === 'object' ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
          />

          {/* airflow */}
          {route.length > 1 &&
            Array.from({ length: weak ? 2 : 4 }, (_, i) => (
              <motion.circle
                key={`${th}-${i}`}
                r={weak ? 2.4 : 3.2}
                fill={rc.airInk}
                initial={false}
                animate={
                  active
                    ? { cx: route.map((q) => q.x), cy: route.map((q) => q.y), opacity: route.map((_, k) => (k === 0 || k === route.length - 1 ? 0 : weak ? 0.45 : 1)) }
                    : { cx: route[Math.floor(route.length / 2)].x, cy: route[Math.floor(route.length / 2)].y, opacity: 0.9 }
                }
                transition={{ duration: (weak ? 3.6 : 2) * (route.length / 41), repeat: active ? Infinity : 0, delay: i * 0.45, ease: 'linear' }}
              />
            ))}
          {th !== 'fatigue' && pts[stopIdx] && (
            <g>
              <path d={`M${pts[stopIdx].x + 18} ${pts[stopIdx].y - 6}l10 10m0 -10l-10 10`} stroke={svg.danger} strokeWidth={2.4} strokeLinecap="round" />
            </g>
          )}
          {weak && (
            <g transform="translate(214 182)" aria-hidden>
              <rect x={0} y={0} width={34} height={16} rx={3} fill="none" stroke={svg.danger} strokeWidth={2} />
              <rect x={34} y={5} width={3} height={6} rx={1} fill={svg.danger} />
              <rect x={3} y={3} width={7} height={10} rx={1.5} fill={svg.danger} />
              <text x={-4} y={34} fontSize={11} fontWeight={700} fill={svg.danger}>
                voimat loppuvat
              </text>
            </g>
          )}
        </svg>
      </Stage>

      <FadeSwap k={th} className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        <p className="mb-2 font-display text-[15px] font-semibold text-[var(--text)]">{info.title}</p>
        <Bullets items={info.items} />
      </FadeSwap>

      <div className="mt-3 rounded-xl border border-[var(--border)] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Hengitystien suojausmekanismit</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PROTECT.map((p) => (
            <span
              key={p}
              className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors duration-300 ${
                tongueBack ? 'bg-danger-500/10 text-danger-500 line-through decoration-2' : 'bg-teal-500/12 text-teal-600'
              }`}
            >
              {p}
            </span>
          ))}
        </div>
        {tongueBack && <p className="mt-2 text-[12.5px] text-danger-500">Tajunnan laskiessa suojamekanismit heikkenevät → aspiraatioriski.</p>}
      </div>
    </div>
  )
}
