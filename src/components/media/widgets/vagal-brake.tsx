import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Bullets, FadeSwap, rc, Stage, Swatch, useLoop } from '../parts/resp-kit'

type Mode = 'brake' | 'atropine' | 'structural'

const ACH = '#0fb8ac'
const ATRO = '#f8690a'

/* Schematic coordinates (viewBox 360 × 206) */
const SA = { x: 150, y: 58 }
const AV = { x: 176, y: 112 }
const APEX = { x: 196, y: 172 }
const RECEPTORS = [-0.95, -0.15, 0.65].map((a) => ({ x: SA.x + 19 * Math.cos(a - Math.PI / 2 - 0.6), y: SA.y + 19 * Math.sin(a - Math.PI / 2 - 0.6) }))

const INFO: Record<Mode, { title: string; tone: string; rate: string; items: string[] }> = {
  brake: {
    title: 'Vagaalinen jarru',
    tone: 'text-brand-600',
    rate: 'Syke hidas',
    items: [
      'Vagushermo vapauttaa asetyylikoliinia, joka sitoutuu muskariinireseptoreihin – sinussolmuke hidastuu.',
      'Esim. oksentelun, ulostamisen tai intubaation yhteydessä, ja alaseinäinfarktissa.',
    ],
  },
  atropine: {
    title: 'Atropiini kumoaa jarrun',
    tone: 'text-teal-600',
    rate: 'Syke nousee',
    items: [
      'Atropiini salpaa muskariinireseptorit: asetyylikoliini ei pääse vaikuttamaan.',
      'Sinussolmuke nopeutuu ja eteis-kammiojohtuminen paranee. Vaikutus alkaa 1–2 minuutissa laskimoon annettuna ja kestää noin 30–60 minuuttia.',
      'Haittoja: takykardia, suun kuivuminen, pupillien laajeneminen, näön sumentuminen.',
    ],
  },
  structural: {
    title: 'Rakenteellinen johtumisvika',
    tone: 'text-danger-500',
    rate: 'Syke pysyy hitaana',
    items: [
      'Etuseinäinfarktiin liittyvä johtumishäiriö vastaa atropiinille usein huonommin – vika on johtoradassa, ei vagaalinen.',
      'Jos atropiini ei nosta sykettä: valmistaudu ulkoiseen tahdistukseen.',
    ],
  },
}

export default function VagalBrake(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('brake')
  const { ref, active } = useLoop<HTMLDivElement>()
  const info = INFO[mode]
  const blocked = mode !== 'brake' // receptors occupied by atropine
  const saPeriod = mode === 'brake' ? 2.1 : 0.95
  const ventPeriod = mode === 'atropine' ? 0.95 : 2.1

  return (
    <div ref={ref}>
      <Segmented
        layoutId="vagal-mode"
        size="sm"
        wrap
        value={mode}
        onChange={setMode}
        options={[
          { value: 'brake', label: 'Vagaalinen jarru' },
          { value: 'atropine', label: 'Atropiini annettu' },
          { value: 'structural', label: 'Johtumisvika' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 360 206" className="h-auto w-full" role="img" aria-label={`${info.title}. ${info.rate}.`}>
          {/* heart outline */}
          <path
            d="M120 52C140 30 196 26 222 44C250 62 252 112 230 146C214 172 200 188 196 192C186 182 150 158 128 130C106 102 104 70 120 52Z"
            fill={rc.heartSoft}
            stroke={rc.heart}
            strokeWidth={1.8}
            opacity={0.85}
          />
          {/* conduction path */}
          <path d={`M${SA.x} ${SA.y} Q${SA.x + 20} ${SA.y + 30} ${AV.x} ${AV.y}`} fill="none" stroke={svg.dim} strokeWidth={1.4} strokeDasharray="3 4" />
          <path d={`M${AV.x} ${AV.y} L${APEX.x} ${APEX.y}`} fill="none" stroke={svg.dim} strokeWidth={1.4} strokeDasharray="3 4" />
          {/* AV node */}
          <circle cx={AV.x} cy={AV.y} r={7} fill={svg.surface} stroke={rc.heart} strokeWidth={2} />
          <text x={AV.x + 12} y={AV.y + 4} fontSize={11} fontWeight={600} fill={svg.ink}>
            AV-solmuke
          </text>
          {mode === 'structural' && (
            <g>
              <path d={`M${AV.x + 2} ${AV.y + 14}l12 12m0 -12l-12 12`} stroke={svg.danger} strokeWidth={2.6} strokeLinecap="round" />
              <text x={AV.x + 18} y={AV.y + 26} fontSize={11} fontWeight={700} fill={svg.danger}>
                johtumisvika
              </text>
            </g>
          )}
          {/* SA node */}
          <motion.circle
            cx={SA.x}
            cy={SA.y}
            r={13}
            fill={svg.surface}
            stroke={rc.heart}
            strokeWidth={2.6}
            animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, repeat: active ? Infinity : 0, repeatDelay: saPeriod - 0.35 }}
          />
          <text x={SA.x + 18} y={SA.y + 24} fontSize={11} fontWeight={600} fill={svg.ink}>
            Sinussolmuke
          </text>
          {/* receptors */}
          {RECEPTORS.map((r, i) => (
            <g key={i}>
              <circle cx={r.x} cy={r.y} r={6} fill={svg.raised} stroke={svg.dim} strokeWidth={1.2} />
              <motion.circle
                cx={r.x}
                cy={r.y}
                r={5}
                initial={false}
                animate={{ fill: blocked ? ATRO : ACH, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              />
            </g>
          ))}

          {/* vagus nerve */}
          <path d="M18 14 C50 22 64 4 92 16 C110 24 118 34 128 40" fill="none" stroke="#eab308" strokeWidth={3} strokeLinecap="round" />
          <circle cx={128} cy={40} r={4} fill="#eab308" />
          <text x={16} y={34} fontSize={11} fontWeight={700} fill="#ca8a04">
            Vagushermo
          </text>
          {/* acetylcholine release */}
          {Array.from({ length: 4 }, (_, i) => (
            <motion.circle
              key={`a${i}`}
              r={2.6}
              fill={ACH}
              initial={false}
              animate={
                active
                  ? blocked
                    ? { cx: [130, 136, 120], cy: [42, 46, 60], opacity: [0, 1, 0] }
                    : { cx: [130, RECEPTORS[i % 3].x], cy: [42, RECEPTORS[i % 3].y], opacity: [0, 1, 0] }
                  : { cx: 132, cy: 46, opacity: 0.8 }
              }
              transition={{ duration: 1.3, repeat: active ? Infinity : 0, delay: i * 0.32, ease: 'easeIn' }}
            />
          ))}

          {/* impulse from SA */}
          <motion.circle
            r={4.5}
            fill={svg.brand}
            initial={false}
            animate={
              active
                ? mode === 'structural'
                  ? { cx: [SA.x, SA.x + 14, AV.x], cy: [SA.y, SA.y + 30, AV.y], opacity: [1, 1, 0] }
                  : { cx: [SA.x, SA.x + 14, AV.x, APEX.x], cy: [SA.y, SA.y + 30, AV.y, APEX.y], opacity: [1, 1, 1, 0] }
                : { cx: AV.x, cy: AV.y, opacity: 0 }
            }
            transition={{ duration: 0.6, repeat: active ? Infinity : 0, repeatDelay: saPeriod - 0.6, ease: 'linear' }}
          />

          {/* rate indicator */}
          <g transform="translate(300 92)">
            <motion.path
              d="M0 22C-26 4-34-11-23-22C-15-29-5-26 0-17C5-26 15-29 23-22C34-11 26 4 0 22Z"
              fill={mode === 'atropine' ? 'rgba(15,184,172,0.25)' : 'rgba(248,105,10,0.22)'}
              stroke={mode === 'atropine' ? svg.teal : svg.brand}
              strokeWidth={2}
              animate={active ? { scale: [1, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.32, repeat: active ? Infinity : 0, repeatDelay: ventPeriod - 0.32 }}
            />
            <text y={44} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={mode === 'atropine' ? svg.teal : mode === 'structural' ? svg.danger : svg.brand}>
              {info.rate}
            </text>
          </g>
        </svg>
      </Stage>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <Swatch color={ACH} label="Asetyylikoliini" />
        <Swatch color={ATRO} label="Atropiini reseptorissa" />
        <Swatch color={svg.brand} label="Sähköinen impulssi" shape="ring" />
      </div>

      <FadeSwap k={mode} className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        <p className={`mb-2 font-display text-[15px] font-semibold ${info.tone}`}>{info.title}</p>
        <Bullets items={info.items} />
      </FadeSwap>
    </div>
  )
}
