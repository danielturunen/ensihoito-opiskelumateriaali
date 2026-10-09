import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { NumberField, Result, Segmented, svg, type Tone } from '../ui'

/* Time without CPR: VF fades to asystole in about 10 min and the brain tolerates
 * normothermic ischaemia for < 10 min. Survival by initial rhythm.
 * Facts: Akuuttihoito-opas 2025 (Hoppu ja Silfvast). The strip is synthetic. */

type Rhythm = 'vf' | 'pea' | 'asys'

const RHYTHMS: Record<Rhythm, { label: string; title: string; text: string; tone: Tone }> = {
  vf: {
    label: 'VF / VT',
    title: 'Defibrilloitava: ennuste paras',
    text: 'Ainoa korjaava hoito on defibrillaatio. Välittömällä defibrillaatiolla jopa 80 % selviää; sairaalan ulkopuolella hyvin toteutuneella ensihoidolla jopa 35 %. Taustalla useimmiten sepelvaltimotauti.',
    tone: 'ok',
  },
  pea: {
    label: 'PEA',
    title: 'Sykkeetön rytmi: etsi syy',
    text: 'Monitorissa komplekseja, yleensä harvoja. Syy on usein muu kuin sepelvaltimotauti (4H/4T): massiivinen keuhkoembolia, tamponaatio, aortan repeämä. Selviytyminen vain 5–8 % – adrenaliini ja syyn mukainen hoito.',
    tone: 'warning',
  },
  asys: {
    label: 'Asystolia',
    title: 'Ennuste hyvin huono',
    text: 'Johtuu useimmiten pitkästä viiveestä tai muusta kuin sepelvaltimoperäisestä syystä. Elvytysyrityksen mielekkyys harkitaan tarkoin; jos elvytetään, painelu-puhalluselvytys ja adrenaliini.',
    tone: 'danger',
  },
}

const X0 = 8
const X1 = 312
const MID = 50

function strip(min: number) {
  // amplitude fades linearly to zero at 10 min (coarse → fine VF → asystole)
  const amp = Math.max(0, 1 - min / 10)
  const a = 26 * amp ** 0.9
  const pts: string[] = []
  for (let x = X0; x <= X1; x += 0.6) {
    const t = x / 18
    let y = a * (0.55 * Math.sin(t * 2.1) + 0.3 * Math.sin(t * 3.3 + 1.3) + 0.25 * Math.sin(t * 1.3 + 0.4))
    y += 0.6 * Math.sin(x * 1.7) // baseline noise so asystole is never a perfectly drawn line
    pts.push(`${x.toFixed(1)},${(MID - y).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}

export default function VfDecay() {
  const [min, setMin] = useState(2)
  const [rhythm, setRhythm] = useState<Rhythm>('vf')
  const reduce = useReducedMotion()
  const d = useMemo(() => strip(min), [min])
  const label = min >= 10 ? 'Asystolia' : min === 0 ? 'Kammiovärinä' : 'Kammiovärinä – amplitudi pienenee'
  const brainOk = min < 10
  const r = RHYTHMS[rhythm]

  return (
    <div>
      <NumberField label="Aikaa ilman painelua" value={min} onChange={setMin} min={0} max={12} unit=" min" />
      <svg viewBox="0 0 320 100" className="mt-2 h-auto w-full rounded-xl" role="img" aria-label={`${label} ${min} minuutin kohdalla`}>
        <rect x={0} y={0} width={320} height={100} rx={12} fill="rgba(248,105,10,0.05)" />
        <g aria-hidden stroke="rgba(248,105,10,0.14)" strokeWidth={0.6}>
          {Array.from({ length: 33 }, (_, k) => (
            <line key={`v${k}`} x1={k * 10} y1={0} x2={k * 10} y2={100} />
          ))}
          {Array.from({ length: 11 }, (_, k) => (
            <line key={`h${k}`} x1={0} y1={k * 10} x2={320} y2={k * 10} />
          ))}
        </g>
        <motion.path d={d} fill="none" stroke={min >= 10 ? svg.dim : svg.danger} strokeWidth={1.6} strokeLinejoin="round" initial={false} animate={{ d }} transition={reduce ? { duration: 0 } : { duration: 0.25 }} aria-hidden />
        <text x={10} y={92} fontSize={11} fontWeight={600} fill={svg.ink}>
          {label}
        </text>
      </svg>

      {/* brain tolerance bar 0–12 min, tolerance < 10 min */}
      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[12px]">
          <span className="font-medium text-[var(--text-dim)]">Aivojen hapenpuutteen sieto (normaali lämpö)</span>
          <span className={`font-semibold ${brainOk ? 'text-teal-600' : 'text-danger-500'}`}>{brainOk ? 'alle 10 min' : 'ylittyi'}</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-[var(--bg)]">
          <div className="absolute inset-y-0 left-0 bg-teal-500/30" style={{ width: `${(10 / 12) * 100}%` }} />
          <div className="absolute inset-y-0 right-0 bg-danger-500/30" style={{ width: `${(2 / 12) * 100}%` }} />
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-[var(--text)]"
            style={{ width: 4 }}
            initial={false}
            animate={{ left: `calc(${(min / 12) * 100}% - 2px)` }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.3, bounce: 0 }}
          />
        </div>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-dim)]">
        Ilman painelu-puhalluselvytystä kammiovärinä hiipuu asystoliaksi noin 10 minuutissa. Siksi painelu aloitetaan heti ja defibrillaattori haetaan paikalle.
      </p>

      <p className="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Alkurytmi ja ennuste</p>
      <Segmented layoutId="vf-rhythm" size="sm" value={rhythm} onChange={setRhythm} options={(Object.keys(RHYTHMS) as Rhythm[]).map((k) => ({ value: k, label: RHYTHMS[k].label }))} />
      <div className="mt-3">
        <Result tone={r.tone} title={r.title}>
          {r.text}
        </Result>
      </div>
    </div>
  )
}
