import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Bullets, FadeSwap, Stage } from '../parts/resp-kit'

interface Step {
  title: string
  items: string[]
  head: { x: number; inside?: boolean }
  body?: number // body ellipse centre x, if visible
  shoulder?: 'upper' | 'lower' | 'both'
  arrow?: 'down' | 'up'
  hands?: boolean
  cord?: boolean
}

const STEPS: Step[] = [
  {
    title: 'Kuljetus vai synnytys kohteessa?',
    items: [
      'Pääsääntö: kuljeta viiveettä synnytyssairaalaan vasemmassa kylkiasennossa, jos synnytys ei ole välittömästi käynnissä.',
      'Jää hoitamaan synnytys kohteeseen, kun pää tai muu tarjoutuva osa on jo näkyvissä, ponnistuspakko on voimakas ja synnytys etenee nopeasti.',
      'Valmistaudu aina myös siirtoon, jos ponnistusvaihe ei etene odotetusti.',
    ],
    head: { x: 78, inside: true },
  },
  {
    title: 'Ponnistusvaihe',
    items: ['Tue synnyttäjää ja anna hänen tehdä työtä rauhassa.', 'Puutu aktiivisesti vasta, kun pää alkaa syntyä.'],
    head: { x: 110, inside: true },
  },
  {
    title: 'Pää syntyy',
    items: ['Toisella kädellä tuetaan välilihaa.', 'Toisella kontrolloidaan pään syntymistä, ettei se "ponnahda" ulos hallitsemattomasti.'],
    head: { x: 150 },
    hands: true,
  },
  {
    title: 'Tarkista napanuora',
    items: ['Kun pää on syntynyt, tarkista napanuora kaulan ympäriltä.', 'Löysä: pujota pään yli.', 'Tiukka: älä revi väkisin – lapsi autetaan syntymään ja napanuora vapautetaan heti.'],
    head: { x: 166 },
    cord: true,
  },
  {
    title: 'Ylempi hartia',
    items: ['Hartiat syntyvät usein seuraavalla supistuksella.', 'Auta ylempi hartia painamalla päätä varovasti kohti äidin selkää.'],
    head: { x: 172 },
    shoulder: 'upper',
    arrow: 'down',
  },
  {
    title: 'Alempi hartia',
    items: ['Auta alempi hartia nostamalla päätä kohti äidin vatsaa.'],
    head: { x: 176 },
    shoulder: 'both',
    arrow: 'up',
  },
  {
    title: 'Rauhallinen ulosauttaminen',
    items: ['Ulosauttaminen on aina rauhallinen ja aaltomainen – ei koskaan voimalla tehty.', 'Jos hartiat eivät seuraa normaalisti, kyse on hartiadystokiasta: hälytä lisäapu.'],
    head: { x: 270 },
    body: 196,
  },
]

const SKIN = 'color-mix(in srgb, #d9a07c 26%, var(--bg-raised))'
const SKIN_EDGE = 'rgba(217,160,124,0.9)'
const BABY = 'rgba(244,184,160,0.55)'
const BABY_EDGE = '#e29578'

export default function Delivery(_props: WidgetProps) {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const st = STEPS[i]
  const t = reduce ? { duration: 0 } : ({ type: 'spring', duration: 0.8, bounce: 0.05 } as const)
  const crowning = !st.head.inside && st.head.x < 200

  return (
    <div>
      <Stage>
        <svg viewBox="0 0 360 210" className="h-auto w-full" role="img" aria-label={`Vaihe ${i + 1}: ${st.title}. ${st.items.join(' ')}`}>
          {/* orientation */}
          <text x={352} y={18} textAnchor="end" fontSize={11} fontWeight={600} fill={svg.dim}>
            ↑ äidin vatsa
          </text>
          <text x={352} y={202} textAnchor="end" fontSize={11} fontWeight={600} fill={svg.dim}>
            ↓ äidin selkä
          </text>

          {/* baby body (behind the mother while inside) */}
          <AnimatePresence>
            {st.body !== undefined && (
              <motion.ellipse
                key="body"
                cy={105}
                rx={64}
                ry={30}
                fill={BABY}
                stroke={BABY_EDGE}
                strokeWidth={2}
                initial={reduce ? false : { cx: 120, opacity: 0 }}
                animate={{ cx: st.body, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={t}
              />
            )}
          </AnimatePresence>

          {/* shoulders */}
          <AnimatePresence>
            {(st.shoulder === 'upper' || st.shoulder === 'both') && (
              <motion.ellipse key="su" cx={140} rx={16} ry={11} fill={BABY} stroke={BABY_EDGE} strokeWidth={2} initial={reduce ? false : { cy: 100, opacity: 0 }} animate={{ cy: 76, opacity: 1 }} exit={{ opacity: 0 }} transition={t} />
            )}
            {st.shoulder === 'both' && (
              <motion.ellipse key="sl" cx={140} rx={16} ry={11} fill={BABY} stroke={BABY_EDGE} strokeWidth={2} initial={reduce ? false : { cy: 110, opacity: 0 }} animate={{ cy: 134, opacity: 1 }} exit={{ opacity: 0 }} transition={t} />
            )}
          </AnimatePresence>

          {/* mother: perineum with the birth opening on the right edge */}
          <path d="M0 10H64C104 10 126 42 132 82V128C126 168 104 200 64 200H0Z" fill={SKIN} stroke={SKIN_EDGE} strokeWidth={2} />
          <path d="M0 105H120" stroke={SKIN_EDGE} strokeWidth={1.2} strokeDasharray="4 5" opacity={0.6} />
          <text x={12} y={30} fontSize={11} fontWeight={600} fill={svg.dim}>
            Synnyttäjä
          </text>

          {/* head */}
          <motion.circle
            cy={105}
            r={30}
            initial={false}
            animate={{ cx: st.head.x }}
            transition={t}
            fill={st.head.inside ? 'transparent' : BABY}
            stroke={BABY_EDGE}
            strokeWidth={2}
            strokeDasharray={st.head.inside ? '5 4' : undefined}
          />
          {/* crowning ring: the opening stretched around the head */}
          {crowning && (
            <motion.path
              d="M132 76C140 76 140 134 132 134"
              fill="none"
              stroke={SKIN_EDGE}
              strokeWidth={3}
              strokeLinecap="round"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          {/* cord around the neck */}
          {st.cord && (
            <motion.path
              d="M150 86C164 70 184 76 186 96C188 116 168 128 152 122"
              fill="none"
              stroke="#60a5fa"
              strokeWidth={5}
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* hands */}
          {st.hands && (
            <g>
              <motion.g initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <rect x={104} y={146} width={64} height={20} rx={10} fill={svg.raised} stroke={svg.ink} strokeWidth={1.6} transform="rotate(-18 136 156)" />
                <text x={176} y={176} fontSize={11} fontWeight={600} fill={svg.ink}>
                  tue välilihaa
                </text>
              </motion.g>
              <motion.g initial={reduce ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <rect x={176} y={70} width={20} height={64} rx={10} fill={svg.raised} stroke={svg.ink} strokeWidth={1.6} />
                <text x={204} y={98} fontSize={11} fontWeight={600} fill={svg.ink}>
                  hidasta päätä
                </text>
                <text x={204} y={112} fontSize={11} fill={svg.dim}>
                  ei "ponnahdusta"
                </text>
              </motion.g>
            </g>
          )}

          {/* guidance arrow */}
          {st.arrow && (
            <motion.g
              key={st.arrow}
              initial={reduce ? false : { opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: st.arrow === 'down' ? [0, 8, 0] : [0, -8, 0] }}
              transition={{ duration: 1.4, repeat: reduce ? 0 : Infinity }}
            >
              <path
                d={st.arrow === 'down' ? 'M226 70V140m-9 -10l9 10 9 -10' : 'M226 140V70m-9 10l9 -10 9 10'}
                fill="none"
                stroke={svg.brand}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text x={244} y={st.arrow === 'down' ? 132 : 82} fontSize={11.5} fontWeight={700} fill={svg.brand}>
                {st.arrow === 'down' ? 'kohti selkää' : 'kohti vatsaa'}
              </text>
            </motion.g>
          )}
        </svg>
      </Stage>

      {/* step dots */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          aria-label="Edellinen vaihe"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)] transition-transform duration-150 active:scale-90 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-center justify-center gap-1.5" role="tablist" aria-label="Vaiheet">
          {STEPS.map((s, k) => (
            <button key={s.title} role="tab" aria-selected={k === i} aria-label={`Vaihe ${k + 1}: ${s.title}`} onClick={() => setI(k)} className="flex h-11 w-7 items-center justify-center">
              <span className={`block h-2 rounded-full transition-all duration-200 ${k === i ? 'w-5 bg-brand-500' : 'w-2 bg-[var(--border)]'}`} />
            </button>
          ))}
        </div>
        <button
          onClick={() => setI((v) => Math.min(STEPS.length - 1, v + 1))}
          disabled={i === STEPS.length - 1}
          aria-label="Seuraava vaihe"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition-transform duration-150 active:scale-90 disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <FadeSwap k={String(i)} className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        <p className="mb-2 font-display text-[15px] font-semibold text-[var(--text)]">
          <span className="mr-1.5 text-[var(--text-dim)]">
            {i + 1}/{STEPS.length}
          </span>
          {st.title}
        </p>
        <Bullets items={st.items} />
      </FadeSwap>
    </div>
  )
}
