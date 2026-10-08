import { useState } from 'react'
import { motion } from 'motion/react'
import { Baby, Check, Hand } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Result, Segmented, svg } from '../ui'
import { Bullets, InfoCard, Stage, useLoop } from '../parts/resp-kit'

type Mode = 'firm' | 'atony'

const UTERUS = '#e879a6'
const BLOOD = '#dc2626'

export default function Postpartum(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('firm')
  const [massage, setMassage] = useState(false)
  const [feed, setFeed] = useState(false)
  const { ref, active } = useLoop<HTMLDivElement>()
  const atony = mode === 'atony'

  // Illustrative: massage and breastfeeding both support uterine contraction.
  const bleed = atony ? Math.max(0.15, 1 - (massage ? 0.45 : 0) - (feed ? 0.3 : 0)) : 0.12
  const size = 1 + (bleed - 0.12) * 0.42
  const meter = atony ? 0.45 + bleed * 0.5 : 0.3
  const controlled = atony && bleed < 0.4

  const choose = (m: Mode) => {
    setMode(m)
    setMassage(false)
    setFeed(false)
  }

  return (
    <div ref={ref}>
      <Segmented
        layoutId="postpartum-mode"
        value={mode}
        onChange={choose}
        options={[
          { value: 'firm', label: 'Supistunut kohtu' },
          { value: 'atony', label: 'Pehmeä, kookas kohtu' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 360 200" className="h-auto w-full" role="img" aria-label={atony ? `Pehmeä ja kookas kohtu, vuoto ${bleed > 0.6 ? 'runsasta' : 'vähenee'}.` : 'Kiinteä, supistunut kohtu, vähäinen vuoto.'}>
          {/* abdomen outline */}
          <path d="M40 6C30 60 30 120 56 194H220C246 120 246 60 236 6" fill={svg.surface} stroke={svg.line} strokeWidth={2} />
          <circle cx={138} cy={46} r={2.4} fill={svg.dim} />
          {/* uterus */}
          <g transform="translate(138 116)">
            <motion.path
              d="M0 -46C30 -46 44 -26 40 0C36 22 16 34 8 48H-8C-16 34 -36 22 -40 0C-44 -26 -30 -46 0 -46Z"
              fill="rgba(232,121,166,0.25)"
              stroke={UTERUS}
              strokeWidth={atony && bleed > 0.4 ? 2 : 3.2}
              strokeDasharray={atony && bleed > 0.4 ? '5 4' : undefined}
              initial={false}
              animate={
                active && atony && bleed > 0.4
                  ? { scale: [size, size * 1.03, size], rotate: [0, 1.5, 0] }
                  : { scale: size, rotate: 0 }
              }
              transition={active && atony && bleed > 0.4 ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { type: 'spring', duration: 0.9, bounce: 0.15 }}
            />
            <text y={4} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={UTERUS}>
              Kohtu
            </text>
            <text y={18} textAnchor="middle" fontSize={10.5} fill={svg.dim}>
              {atony && bleed > 0.4 ? 'pehmeä' : 'kiinteä'}
            </text>
          </g>
          {/* massage hand */}
          {massage && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={active ? { opacity: 1, x: [0, 8, 0, -8, 0], y: [0, 4, 8, 4, 0] } : { opacity: 1 }}
              transition={active ? { duration: 1.6, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
            >
              <ellipse cx={138} cy={58} rx={24} ry={11} fill={svg.raised} stroke={svg.ink} strokeWidth={1.6} />
              <text x={168} y={50} fontSize={11} fontWeight={600} fill={svg.ink}>
                hieronta
              </text>
            </motion.g>
          )}
          {/* bleeding drops */}
          {Array.from({ length: 5 }, (_, i) => (
            <motion.path
              key={i}
              d="M0 -6C3 -2 5 1 5 3.5A5 5 0 0 1 -5 3.5C-5 1 -3 -2 0 -6Z"
              fill={BLOOD}
              initial={false}
              animate={
                active
                  ? { x: 132 + (i % 3) * 6, y: [166, 196], opacity: i / 5 < bleed ? [0, 1, 0] : 0 }
                  : { x: 132 + (i % 3) * 6, y: 176 + i * 3, opacity: i / 5 < bleed ? 1 : 0 }
              }
              transition={{ duration: 1.1 - bleed * 0.4, repeat: active ? Infinity : 0, delay: i * 0.22, ease: 'easeIn' }}
            />
          ))}

          {/* blood loss meter */}
          <g transform="translate(276 20)">
            <text x={30} y={0} textAnchor="middle" fontSize={11} fontWeight={600} fill={svg.dim}>
              Vuoto
            </text>
            <rect x={14} y={8} width={32} height={160} rx={8} fill={svg.surface} stroke={svg.line} strokeWidth={1.5} />
            <motion.rect
              x={16}
              width={28}
              rx={6}
              fill={BLOOD}
              opacity={0.75}
              initial={false}
              animate={{ y: 166 - 156 * meter, height: 156 * meter }}
              transition={{ type: 'spring', duration: 1, bounce: 0 }}
            />
            <line x1={4} x2={50} y1={88} y2={88} stroke={svg.ink} strokeWidth={1.6} strokeDasharray="4 3" />
            <text x={2} y={84} textAnchor="end" fontSize={11} fontWeight={700} fill={svg.ink}>
              500 ml
            </text>
          </g>
        </svg>
      </Stage>

      {atony && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { on: massage, set: setMassage, label: 'Kohdun hieronta', sub: 'vatsanpeitteiden läpi', icon: Hand },
            { on: feed, set: setFeed, label: 'Vauva rinnalle', sub: 'tukee supistumista', icon: Baby },
          ].map((b) => {
            const Icon = b.icon
            return (
              <button
                key={b.label}
                onClick={() => b.set(!b.on)}
                aria-pressed={b.on}
                className={`flex min-h-[52px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] ${
                  b.on ? 'border-teal-500 bg-teal-500/10' : 'border-[var(--border)] bg-[var(--bg-card)]'
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${b.on ? 'bg-teal-500 text-white' : 'bg-[var(--bg)] text-[var(--text-dim)]'}`}>
                  {b.on ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold leading-tight">{b.label}</span>
                  <span className="block text-[11px] leading-tight text-[var(--text-dim)]">{b.sub}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-3 grid gap-2">
        {!atony ? (
          <Result tone="ok" title="Normaali jälkeisvaihe">
            Istukka syntyy tavallisesti 5–60 minuutin kuluessa. Normaali vuoto on yleensä alle 500 ml – seuraa silti vuotoa ja kohdun supistumista aktiivisesti myös istukan synnyttyä.
          </Result>
        ) : controlled ? (
          <Result tone="ok" title="Kohtu supistuu, vuoto vähenee">
            Jatka seurantaa. Suoniyhteys, sokin hoito sekä oksitosiini ja traneksaamihappo paikallisen hoito-ohjeen mukaan.
          </Result>
        ) : (
          <Result tone="danger" title="Huolestuttava jälkeisvaihe">
            Pehmeä ja kookas kohtu, yli 500 ml:n tai nopeasti lisääntyvä vuoto. Vuoto voi kertyä myös näkymättömissä kohtuun.
          </Result>
        )}
        <InfoCard title="Muista">
          <Bullets
            items={[
              'Huolestuttavaa: yli 500 ml tai nopeasti lisääntyvä vuoto, pehmeä ja kookas kohtu, sokin merkit, vuoto jatkuu istukan synnyttyä.',
              'Istukkaa ei revitä väkisin – jos se ei irtoa helposti, lopeta yritys ja kuljeta.',
            ]}
          />
        </InfoCard>
      </div>
    </div>
  )
}
