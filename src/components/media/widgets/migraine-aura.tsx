import { useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { AlertTriangle } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Bullets, Stage } from '../parts/resp-kit'
import { useFrameLoop, useSvgId } from '../parts/cardio-hooks'

/* Migraine aura (article Päänsärky ja migreeni; Käypä hoito Migreeni, Akuuttihoito-opas):
 * a zig-zag scintillating arc expands slowly across the visual field, then symptoms "march"
 * (sensory, speech) and the headache begins. Time is compressed; no clock is shown. */

const LOOP = 16 // seconds
const C = { x: 150, y: 104 }

type Stage4 = 'visual' | 'sensory' | 'speech' | 'pain'
const STAGES: { id: Stage4; label: string; from: number; to: number }[] = [
  { id: 'visual', label: 'Näkö', from: 0, to: 7.5 },
  { id: 'sensory', label: 'Tunto', from: 6.5, to: 10.5 },
  { id: 'speech', label: 'Puhe', from: 9.5, to: 12.5 },
  { id: 'pain', label: 'Särky', from: 11.5, to: LOOP },
]

function zigzagArc(radius: number, a0: number, a1: number, amp: number): string {
  const teeth = Math.max(6, Math.round(((a1 - a0) * radius) / 7))
  let d = ''
  for (let i = 0; i <= teeth; i++) {
    const a = a0 + ((a1 - a0) * i) / teeth
    const r = radius + (i % 2 ? amp : -amp)
    const x = C.x + r * Math.cos(a)
    const y = C.y + r * Math.sin(a)
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}

export default function MigraineAura(_props: WidgetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false
  const clock = useMotionValue(reduce ? 4 : 0)
  const [now, setNow] = useState<Stage4[]>(reduce ? ['visual'] : [])

  useFrameLoop(ref, (dt) => {
    const t = (clock.get() + dt) % LOOP
    clock.set(t)
    const on = STAGES.filter((s) => t >= s.from && t < s.to).map((s) => s.id)
    if (on.join() !== now.join()) setNow(on)
  })

  // the arc grows from near fixation to the edge of the field, then fades
  const radius = useTransform(clock, (t) => 22 + Math.min(1, t / 7) * 92)
  const fade = useTransform(clock, (t) => (t < 6 ? 1 : Math.max(0, 1 - (t - 6) / 1.4)))
  const arc = useTransform(radius, (r) => zigzagArc(r, -2.3, 0.9, 4.5))
  const inner = useTransform(radius, (r) => zigzagArc(Math.max(4, r - 13), -2.2, 0.8, 2.5))
  const shimmer = useTransform(clock, (t) => 0.55 + 0.45 * Math.abs(Math.sin(t * 9)))
  const arcOpacity = useTransform([fade, shimmer], ([f, s]: number[]) => f * s)
  const scotomaOpacity = useTransform(fade, (f) => f * 0.16)
  const clipId = useSvgId('aura-field')

  return (
    <div ref={ref}>
      <Stage>
        <svg viewBox="0 0 300 224" className="h-auto w-full" role="img" aria-label="Näkökenttä, jossa sahalaitainen valokaari laajenee keskeltä reunalle">
          <defs>
            <clipPath id={clipId}>
              <circle cx={C.x} cy={C.y} r={98} />
            </clipPath>
          </defs>
          <circle cx={C.x} cy={C.y} r={98} fill={svg.raised} stroke={svg.line} strokeWidth={2} />
          <g clipPath={`url(#${clipId})`}>
            {/* scotoma that trails the arc */}
            <motion.path d={inner} fill="none" stroke={svg.ink} strokeWidth={12} strokeLinejoin="round" style={{ opacity: scotomaOpacity }} />
            <motion.path d={arc} fill="none" stroke={svg.brand} strokeWidth={3.2} strokeLinejoin="round" style={{ opacity: arcOpacity }} />
            <motion.path d={arc} fill="none" stroke="#fde68a" strokeWidth={1.3} strokeLinejoin="round" style={{ opacity: arcOpacity }} />
          </g>
          {/* fixation point */}
          <path d={`M${C.x - 6} ${C.y}H${C.x + 6}M${C.x} ${C.y - 6}V${C.y + 6}`} stroke={svg.dim} strokeWidth={1.6} strokeLinecap="round" />
          <text x={C.x} y={218} textAnchor="middle" fontSize={11} fill={svg.dim}>
            näkökenttä – katse keskellä
          </text>
        </svg>
      </Stage>

      <div className="mt-3 grid grid-cols-4 gap-1.5" aria-live="polite">
        {STAGES.map((s) => {
          const on = now.includes(s.id)
          return (
            <div
              key={s.id}
              className={`rounded-xl border px-1 py-2 text-center text-[12px] font-semibold transition-[background-color,border-color,color] duration-200 ${
                on
                  ? s.id === 'pain'
                    ? 'border-danger-500/40 bg-danger-500/10 text-danger-500'
                    : 'border-brand-500/40 bg-brand-500/10 text-brand-600'
                  : 'border-[var(--border)] text-[var(--text-dim)]'
              }`}
            >
              {s.label}
            </div>
          )
        })}
      </div>

      <div className="mt-3">
        <Bullets
          items={[
            'Aura kehittyy hitaasti laajeten vähintään 5 minuutin aikana, ja yksittäinen oire kestää 5–60 minuuttia. Aura on täysin palautuva.',
            'Tyypillisin on näköaura: laajeneva sahalaitainen valokaari tai näkökenttäpuutos.',
            'Oireet voivat seurata toisiaan – yhden korjautuessa alkaa seuraava, esimerkiksi tunto- ja puheoire ("oireiden marssi").',
            'Päänsärky alkaa auran aikana tai 60 minuutin kuluessa.',
          ]}
        />
      </div>
      <div className="mt-3 flex gap-2.5 rounded-xl border border-danger-500/30 bg-danger-500/10 px-3.5 py-3 text-[13px] leading-snug text-[var(--text)]">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" />
        <span>
          Motorinen heikkous, aivorunko-oireet, vain toisen silmän näköhäiriö tai yli tunnin kestävä aura vaativat selvittelyä. Epäselvässä tilanteessa toimi kuten aivoverenkiertohäiriössä.
        </span>
      </div>
    </div>
  )
}
