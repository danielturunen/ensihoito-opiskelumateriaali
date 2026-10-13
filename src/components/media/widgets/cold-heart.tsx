import { useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import type { WidgetProps } from '../registry'
import { NumberField, Result, svg } from '../ui'
import { useFrameLoop } from '../parts/cardio-hooks'

/* The cold heart (article Hypotermia ja hypoterminen elvytys): heart rate slows as core
 * temperature falls, below 30 °C rough handling can trigger ventricular fibrillation and below
 * 25 °C VF usually follows. The R–R interval is illustrative; no heart rate is shown. */

const W = 300
const H = 70
const PX_PER_S = 75

function rrFor(temp: number) {
  // 35 °C → 0.8 s … 25 °C → 2.2 s (illustrative slowing)
  return 0.8 + ((35 - Math.max(25, Math.min(35, temp))) / 10) * 1.4
}

function sinusPath(rr: number) {
  const k = Math.max(1, Math.ceil(4 / rr))
  const period = k * rr * PX_PER_S
  const total = W + period
  let d = `M0 ${H / 2}`
  for (let x0 = 20; x0 < total + 40; x0 += rr * PX_PER_S) {
    const b = H / 2
    d += ` L${x0} ${b} L${x0 + 5} ${b - 4} L${x0 + 10} ${b} L${x0 + 18} ${b} L${x0 + 20} ${b + 4} L${x0 + 23} ${b - 26} L${x0 + 26} ${b + 9} L${x0 + 29} ${b} L${x0 + 42} ${b} C${x0 + 48} ${b - 8} ${x0 + 56} ${b - 8} ${x0 + 62} ${b}`
  }
  d += ` L${total + 60} ${H / 2}`
  return { d, period }
}

function vfPath() {
  const period = 4 * PX_PER_S
  let d = ''
  for (let x = 0; x <= W + period; x += 3) {
    const t = x / PX_PER_S
    const y = H / 2 + 11 * Math.sin(t * 2 * Math.PI * 4.75) + 6 * Math.sin(t * 2 * Math.PI * 2.25 + 1) + 4 * Math.sin(t * 2 * Math.PI * 7.5 + 2)
    d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`
  }
  return { d, period }
}

function stageOf(temp: number) {
  if (temp >= 35) return { label: 'Ei hypotermiaa (35 °C tai yli)', tone: 'text-teal-600' }
  if (temp >= 32) return { label: 'Lievä hypotermia (32–35 °C)', tone: 'text-teal-600' }
  if (temp >= 30) return { label: 'Kohtalainen hypotermia (30–32 °C)', tone: 'text-brand-600' }
  return { label: 'Vaikea hypotermia (alle 30 °C)', tone: 'text-danger-500' }
}

export default function ColdHeart(_props: WidgetProps) {
  const [temp, setTemp] = useState(34)
  const [handled, setHandled] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false
  const offset = useMotionValue(0)

  const vf = temp < 25 || (handled && temp < 30)
  const strip = useMemo(() => (vf ? vfPath() : sinusPath(rrFor(temp))), [vf, temp])

  useFrameLoop(ref, (dt) => offset.set((offset.get() + dt * PX_PER_S) % strip.period))
  const stripTransform = useTransform(offset, (o) => `translateX(${(-o).toFixed(1)}px)`)

  const stage = stageOf(temp)
  // brain oxygen demand falls linearly with core temperature (illustrative scale)
  const demand = 0.35 + ((temp - 20) / 17) * 0.65

  return (
    <div ref={ref}>
      <NumberField
        label="Ydinlämpö"
        unit="°C"
        value={temp}
        min={20}
        max={35}
        onChange={(v) => {
          setTemp(v)
          if (v >= 30) setHandled(false)
        }}
      />
      <p className={`mt-2 font-display text-[14px] font-semibold ${stage.tone}`}>{stage.label}</p>

      <div className="mt-2 overflow-hidden rounded-xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={vf ? 'Monitorissa kammiovärinä' : 'Monitorissa hidastuva sinusrytmi'}>
          <rect width={W} height={H} fill="#0b1a14" />
          <motion.g style={{ transform: reduce ? 'none' : stripTransform }}>
            <path d={strip.d} fill="none" stroke={vf ? '#fbbf24' : '#34d399'} strokeWidth={2} strokeLinejoin="round" />
          </motion.g>
        </svg>
      </div>
      <p className="mt-1 text-[12px] font-semibold" style={{ color: vf ? svg.brand : svg.teal }}>
        {vf ? 'Kammiovärinä' : temp <= 30 ? 'Hidas rytmi – syke harvenee' : 'Sinusrytmi – syke harvenee lämmön laskiessa'}
      </p>

      <button
        disabled={temp >= 30 || vf}
        onClick={() => setHandled(true)}
        className="mt-3 min-h-[44px] w-full rounded-xl border border-[var(--border)] px-3 text-[13px] font-semibold text-[var(--text)] transition-opacity active:scale-[0.98] disabled:opacity-45"
      >
        Siirrä potilasta reippaasti
      </button>
      {temp >= 30 && <p className="mt-1 text-[11px] text-[var(--text-dim)]">Liikuttelun riski koskee alle 30 °C:n ydinlämpöä – laske lämpöä.</p>}

      {vf && (
        <div className="mt-3">
          <Result tone="danger" title={temp < 25 ? 'Alle 25 °C seuraa yleensä kammiovärinä' : 'Liikuttelu laukaisi kammiovärinän'}>
            {temp < 25
              ? 'Kammiovärinää seuraa lopulta asystole. Kammiovärinä on resistentti defibrillaatiolle.'
              : 'Alle 30 °C:n ydinlämmössä varomaton liikuttelu voi laukaista kammiovärinän – käsittele varovasti ja varaudu aloittamaan elvytys välittömästi.'}
          </Result>
        </div>
      )}

      <div className="mt-3">
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="font-semibold text-[var(--text)]">Aivojen hapentarve</span>
          <span className="text-[var(--text-dim)]">havainnollistus</span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[var(--bg)]">
          <motion.div
            className="h-full origin-left rounded-full bg-sky-500"
            style={{ originX: 0 }}
            initial={false}
            animate={{ transform: `scaleX(${demand.toFixed(3)})` }}
            transition={reduce ? { duration: 0 } : { duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          />
        </div>
        <p className="mt-1.5 text-[12px] leading-snug text-[var(--text-dim)]">
          Kylmä vähentää aivosolujen hapentarvetta lineaarisesti. 20 °C:ssa aivojen kyky sietää verenkierron pysähtymistä on jopa kymmenkertainen normaaliin verrattuna.
        </p>
      </div>

      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-3 text-[13px] leading-snug text-[var(--text)]">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Elvytys tässä lämmössä</p>
        {temp < 30
          ? 'Adrenaliinista pidättäydytään. Jos kammiovärinä jatkuu kolmannen iskun jälkeen, uusista iskuista pidättäydytään, kunnes ydinlämpö on yli 30 °C.'
          : temp < 32
            ? 'Yli 30 °C:ssa adrenaliinin antoväliä pidennetään 6–10 minuuttiin. Lääkevaste on heikentynyt ja vaikutusaika pitkittyy.'
            : 'Estä lisäjäähtyminen ja lämmitä. Jos potilas joudutaan elvyttämään, adrenaliinin antoväli on yli 30 °C:ssa 6–10 minuuttia.'}
      </div>
    </div>
  )
}
