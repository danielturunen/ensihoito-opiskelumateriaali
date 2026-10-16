import { useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { StepControls, useStepper, type ExamStep } from '../parts/exam-kit'
import { ecgCurve, type KP } from '../parts/ecg-curve'

/* How the ischaemic injury evolves in a STEMI (article Rintakipu ja AKS; oppikirjan kuva "Iskeemisen vaurion
 * kehittyminen ST-nousuinfarktissa": tunti – päivä – viikko – kuukausi). Shapes follow that figure; the Q wave
 * marks necrosis and may stay as a scar. Schematic. */

interface Stage4 extends ExamStep {
  key: string
  kp: KP[]
  labels: { x: number; y: number; text: string; anchor?: 'start' | 'middle' }[]
}

const PRE: KP[] = [
  [0, 0],
  [60, 0],
  [100, 1],
  [140, 0],
  [200, 0],
]

const STEPS: Stage4[] = [
  {
    key: 'h',
    title: 'Tunteja: ST-nousu',
    text: 'Tuoreessa ST-nousuinfarktissa ST-väli kohoaa ja sulautuu T-aaltoon. Nyt ratkaisee nopea reperfuusiohoito – liuotushoidon teho heikkenee jo 3 tunnin jälkeen.',
    dur: 3.5,
    kp: [...PRE, [212, -0.4], [240, 10], [265, 8.5], [330, 6], [400, 4], [450, 1.5], [480, 0], [700, 0]],
    labels: [{ x: 440, y: 4.5, text: 'ST-nousu', anchor: 'start' }],
  },
  {
    key: 'd',
    title: 'Päivä: Q-aalto',
    text: 'Syvä Q-aalto kertoo kuolleesta sydänlihaksesta. ST on edelleen koholla.',
    dur: 3.5,
    kp: [...PRE, [235, -8], [265, 0], [285, 3.2], [330, 4.4], [375, 4.6], [425, 3.2], [465, 1], [490, 0], [700, 0]],
    labels: [
      { x: 235, y: -8, text: 'Q' },
      { x: 360, y: 4.5, text: 'ST-nousu' },
    ],
  },
  {
    key: 'w',
    title: 'Viikko: T-inversio',
    text: 'Q-aalto jää, ST palaa perustasolle ja T-aalto kääntyy syvästi negatiiviseksi.',
    dur: 3.5,
    kp: [...PRE, [235, -8], [265, 0], [300, 0], [360, -4], [410, -5], [460, -2], [490, 0], [700, 0]],
    labels: [
      { x: 235, y: -8, text: 'Q' },
      { x: 410, y: -5, text: 'T-inversio' },
    ],
  },
  {
    key: 'm',
    title: 'Kuukausia: arpi',
    text: 'ST ja T palautuvat. Patologinen Q-aalto voi jäädä pysyväksi arveksi – se kertoo sairastetusta infarktista, ei välttämättä akuutista tilanteesta.',
    dur: 4,
    kp: [...PRE, [212, -1.2], [235, 9], [255, -0.5], [268, 0], [340, 0], [385, 1.6], [430, 0], [700, 0]],
    labels: [{ x: 212, y: -1.2, text: 'q' }],
  },
]

const PX = 10 // px per mm, 1 mm = 40 ms
const GL = 10 // grid left
const GT = 12 // grid top
const COLS = 32
const ROWS = 21
const BASE = GT + 11 * PX
const T0 = -290 // ms at the grid's left edge
const xOf = (t: number) => GL + ((t - T0) / 40) * PX
const yOf = (v: number) => BASE - v * PX

export default function StemiEvolution(_props: WidgetProps) {
  const reduce = useReducedMotion() ?? false
  const durs = useMemo(() => STEPS.map((s) => s.dur ?? 3), [])
  const s = useStepper(STEPS.length, durs)
  const step = STEPS[s.i]

  const d = useMemo(() => {
    const f = ecgCurve(step.kp)
    let p = ''
    for (let t = T0; t <= T0 + COLS * 40; t += 5) p += `${t === T0 ? 'M' : 'L'}${xOf(t).toFixed(1)} ${yOf(t < 0 ? 0 : f(t)).toFixed(1)}`
    return p
  }, [step])

  const grid = []
  for (let i = 0; i <= COLS; i++) {
    const big = i % 5 === 1
    grid.push(<line key={`v${i}`} x1={GL + i * PX} y1={GT} x2={GL + i * PX} y2={GT + ROWS * PX} stroke={svg.line} strokeWidth={big ? 0.8 : 0.4} opacity={big ? 0.9 : 0.5} />)
  }
  for (let i = 0; i <= ROWS; i++) {
    const big = i % 5 === 1
    grid.push(<line key={`h${i}`} x1={GL} y1={GT + i * PX} x2={GL + COLS * PX} y2={GT + i * PX} stroke={svg.line} strokeWidth={big ? 0.8 : 0.4} opacity={big ? 0.9 : 0.5} />)
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5" role="tablist" aria-label="Aika infarktin alusta">
        {STEPS.map((st, i) => (
          <button
            key={st.key}
            role="tab"
            aria-selected={i === s.i}
            onClick={() => s.go(i)}
            className={`min-h-[40px] rounded-xl border px-1 text-[12.5px] font-semibold transition-colors ${i === s.i ? 'border-brand-500 bg-brand-500/10 text-brand-600' : 'border-[var(--border)] text-[var(--text-dim)]'}`}
          >
            {st.title.split(':')[0]}
          </button>
        ))}
      </div>
      <Stage className="mt-3">
        <svg viewBox="0 0 340 234" className="h-auto w-full" role="img" aria-label={`${step.title}. ${step.text}`}>
          <g aria-hidden>{grid}</g>
          <rect x={GL} y={GT} width={COLS * PX} height={ROWS * PX} fill="none" stroke={svg.line} />
          <line x1={GL} y1={BASE} x2={GL + COLS * PX} y2={BASE} stroke={svg.dim} strokeWidth={0.8} strokeDasharray="3 3" />
          <motion.path initial={false} animate={{ d }} transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.9, bounce: 0.1 }} fill="none" stroke={svg.danger} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
          <AnimatePresence mode="popLayout" initial={false}>
            {step.labels.map((l) => (
              <motion.text
                key={`${step.key}-${l.text}`}
                x={xOf(l.x)}
                y={l.y < 0 ? yOf(l.y) + 17 : yOf(l.y) - 10}
                textAnchor={l.anchor ?? 'middle'}
                fontSize={12}
                fontWeight={700}
                fill={svg.ink}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: reduce ? 0 : 0.35 }}
              >
                {l.text}
              </motion.text>
            ))}
          </AnimatePresence>
        </svg>
      </Stage>
      <StepControls steps={STEPS} s={s} />
      <p className="mt-2 text-[12px] leading-snug text-[var(--text-dim)]">Kaavamainen, oppikirjan kuvan mukaan.</p>
    </div>
  )
}
