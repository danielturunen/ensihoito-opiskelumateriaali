import { useState } from 'react'
import { motion } from 'motion/react'
import { Droplets, HandHelping, ShieldCheck, Syringe, Wind } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Bullets, FadeSwap, Stage, useLoop } from '../parts/resp-kit'

type Route = 'blood' | 'air' | 'contact'

const ON = '#0fb8ac'
const UNIFORM = 'color-mix(in srgb, #f8690a 42%, var(--bg-raised))'
const OFF = 'color-mix(in srgb, var(--text) 18%, transparent)'
const PART: Record<Route, string> = { blood: '#dc2626', air: '#38bdf8', contact: '#a3a635' }

const INFO: Record<Route, { diseases: string; protect: string[]; note: string[] }> = {
  blood: {
    diseases: 'B- ja C-hepatiitti, HIV',
    protect: ['Suojakäsineet', 'Huomioi neulat ja verinäytteet'],
    note: ['Verialtistuksessa yhteys infektiopäivystäjään välittömästi.', 'HIV-altistuksen jälkeen estohoito (PEP) tehoaa parhaiten alle 2 tunnin kuluessa.'],
  },
  air: {
    diseases: 'Tuberkuloosi',
    protect: ['Hengityssuojain FFP2/FFP3 aina epäiltäessä', 'Hyvä ilmanvaihto kuljetuksessa'],
    note: ['Ilmateitse tarttuva tauti – suojaudu jo epäilyn perusteella.'],
  },
  contact: {
    diseases: 'Moniresistentit bakteerit (MRSA, ESBL, VRE)',
    protect: ['Suojakäsineet', 'Käsihygienia', 'Välineiden desinfiointi'],
    note: ['Leviävät kosketustartuntana – käsistä ja välineistä seuraavaan potilaaseen.'],
  },
}

export default function InfectionRoutes(_props: WidgetProps) {
  const [route, setRoute] = useState<Route>('blood')
  const { ref, active } = useLoop<HTMLDivElement>()
  const gloves = route !== 'air'
  const mask = route === 'air'
  const info = INFO[route]
  const col = PART[route]

  return (
    <div ref={ref}>
      <Segmented
        layoutId="infection-route"
        value={route}
        onChange={setRoute}
        options={[
          { value: 'blood', label: 'Veriteitse' },
          { value: 'air', label: 'Ilmateitse' },
          { value: 'contact', label: 'Kosketus' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 360 200" className="h-auto w-full" role="img" aria-label={`${info.diseases}. Suojaus: ${info.protect.join(', ')}.`}>
          {/* patient (left) */}
          <g>
            <rect x={14} y={150} width={140} height={14} rx={7} fill={svg.surface} stroke={svg.line} />
            <circle cx={40} cy={128} r={16} fill="rgba(148,163,184,0.25)" stroke={svg.dim} strokeWidth={1.5} />
            <path d="M58 140H140C148 140 150 150 150 150H58Z" fill="rgba(148,163,184,0.25)" stroke={svg.dim} strokeWidth={1.5} />
            <text x={84} y={184} textAnchor="middle" fontSize={11} fontWeight={600} fill={svg.dim}>
              Potilas
            </text>
          </g>

          {/* paramedic (right) */}
          <g>
            <path d="M210 128C200 146 196 160 196 170M290 128C300 146 304 160 304 170" fill="none" stroke={UNIFORM} strokeWidth={12} strokeLinecap="round" />
            <path d="M206 196V124C206 104 222 94 250 94S294 104 294 124V196Z" fill={UNIFORM} stroke={svg.brand} strokeWidth={1.8} />
            <path d="M232 100L250 120L268 100" fill="none" stroke={svg.brand} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
            <circle cx={250} cy={62} r={24} fill="color-mix(in srgb, #d9a07c 45%, var(--bg-raised))" stroke={svg.dim} strokeWidth={1.5} />
            {/* arms + gloves */}
            {[196, 304].map((x) => (
              <motion.circle key={x} cx={x} cy={174} r={9} initial={false} animate={{ fill: gloves ? ON : 'rgba(217,160,124,0.55)' }} stroke={gloves ? ON : svg.dim} strokeWidth={1.5} />
            ))}
            {/* respirator */}
            <motion.path
              d="M234 66C236 80 264 80 266 66L262 60H238Z"
              initial={false}
              animate={{ fill: mask ? ON : 'transparent', stroke: mask ? ON : OFF }}
              strokeWidth={1.8}
              strokeDasharray={mask ? undefined : '3 3'}
            />
            {/* visor – "tarvittaessa" */}
            <path d="M226 40C222 56 222 70 228 82" fill="none" stroke={OFF} strokeWidth={2} strokeDasharray="3 3" />
          </g>

          {/* transmission animation */}
          {route === 'air' &&
            Array.from({ length: 7 }, (_, i) => (
              <motion.circle
                key={`air${i}`}
                r={2.6}
                fill={col}
                initial={false}
                animate={active ? { cx: [58, 228], cy: [124 + (i % 3) * 4, 64 + (i % 3) * 5], opacity: [0, 0.9, 0.9, 0] } : { cx: 120 + i * 14, cy: 100 - i * 4, opacity: 0.8 }}
                transition={{ duration: 2.2, repeat: active ? Infinity : 0, delay: i * 0.3, ease: 'easeOut' }}
              />
            ))}
          {route === 'contact' &&
            Array.from({ length: 5 }, (_, i) => (
              <motion.circle
                key={`c${i}`}
                r={3}
                fill={col}
                initial={false}
                animate={active ? { cx: [96 + i * 10, 194 + (i % 2) * 4], cy: [148, 172], opacity: [1, 1, 0] } : { cx: 96 + i * 10, cy: 148, opacity: 1 }}
                transition={{ duration: 1.6, repeat: active ? Infinity : 0, delay: i * 0.3, ease: 'easeInOut' }}
              />
            ))}
          {route === 'blood' && (
            <g>
              <g transform="translate(160 118) rotate(-30)">
                <rect x={0} y={-4} width={30} height={8} rx={2} fill={svg.surface} stroke={svg.ink} strokeWidth={1.5} />
                <path d="M30 0H44" stroke={svg.ink} strokeWidth={1.5} strokeLinecap="round" />
              </g>
              {[0, 1].map((i) => (
                <motion.path
                  key={i}
                  d="M0 -6C3 -2 5 1 5 3.5A5 5 0 0 1 -5 3.5C-5 1 -3 -2 0 -6Z"
                  fill={col}
                  initial={false}
                  animate={active ? { x: [178, 194], y: [100, 166], opacity: [0, 1, 0] } : { x: 186, y: 140, opacity: 1 }}
                  transition={{ duration: 1.6, repeat: active ? Infinity : 0, delay: i * 0.8 }}
                />
              ))}
            </g>
          )}
          <text x={350} y={20} textAnchor="end" fontSize={11} fontWeight={700} fill={ON}>
            {route === 'air' ? 'hengityssuojain' : 'suojakäsineet'}
          </text>
          <text x={350} y={34} textAnchor="end" fontSize={10.5} fill={svg.dim}>
            kasvosuojain tarvittaessa
          </text>
        </svg>
      </Stage>

      <FadeSwap k={route} className="mt-3 grid gap-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Esimerkit</p>
          <p className="mt-0.5 font-display text-[15px] font-semibold">{info.diseases}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {info.protect.map((p) => (
              <span key={p} className="inline-flex items-center gap-1 rounded-full bg-teal-500/12 px-2.5 py-1 text-[12px] font-semibold text-teal-600">
                <ShieldCheck className="h-3.5 w-3.5" /> {p}
              </span>
            ))}
          </div>
          <div className="mt-2.5">
            <Bullets items={info.note} />
          </div>
        </div>
      </FadeSwap>

      <div className="mt-2 rounded-xl border border-[var(--border)] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Aina, jokaisen potilaan kohdalla</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[12px] font-medium leading-tight">
          <span className="flex flex-col items-center gap-1">
            <HandHelping className="h-5 w-5 text-[var(--text-dim)]" /> Käsihygienia
          </span>
          <span className="flex flex-col items-center gap-1">
            <Droplets className="h-5 w-5 text-[var(--text-dim)]" /> Desinfiointi kuljetuksen jälkeen
          </span>
          <span className="flex flex-col items-center gap-1">
            {route === 'blood' ? <Syringe className="h-5 w-5 text-[var(--text-dim)]" /> : <Wind className="h-5 w-5 text-[var(--text-dim)]" />} Epäselvässä: suojaudu kuin riski olisi
          </span>
        </div>
      </div>
    </div>
  )
}
