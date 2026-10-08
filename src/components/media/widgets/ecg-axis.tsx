import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Caption, svg, toneSurface, toneText, type Tone } from '../ui'

/* Quick frontal-axis estimate from leads I and aVF (Nikus ym., Oppiportti; Kettunen 2024).
 * Screen y grows downward, so +90° (aVF) points down as on the hexaxial chart. */

type Sign = '+' | '-'

const RESULT: Record<string, { name: string; angle: number; tone: Tone; causes: string }> = {
  '++': { name: 'Normaali akseli', angle: 45, tone: 'ok', causes: 'Vasemmalle alas – sähkö kulkee normaalisti kohti vasenta kammiota.' },
  '+-': { name: 'Vasemmalle (ylös)', angle: -45, tone: 'warning', causes: 'Vasen etuhaarakekatkos, vasen haarakatkos, vasemman kammion hypertrofia, alaseinäinfarkti, tahdistinrytmi. Varsinainen vasen akseli on, jos QRS on pääosin negatiivinen myös kytkennässä II (alle −30°).' },
  '-+': { name: 'Oikealle (alas)', angle: 135, tone: 'warning', causes: 'Vasen takahaarakekatkos, sivuseinäinfarkti, keuhkosairaudet, keuhkoembolia, myrkytykset. Muista ensin kytkentävirhe (käsielektrodit ristissä)!' },
  '--': { name: 'Äärimmäinen oikea (ERAD)', angle: -135, tone: 'danger', causes: 'Leveällä takykardialla viittaa kammiotakykardiaan. Tarkista myös elektrodien paikat.' },
}

const C = 110
const R = 82

function Toggle({ label, value, onChange }: { label: string; value: Sign; onChange: (v: Sign) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
      <span className="font-display text-[15px] font-semibold text-[var(--text)]">Kytkentä {label}</span>
      <div className="grid grid-cols-2 gap-1.5" role="group" aria-label={`Kytkennän ${label} QRS`}>
        {(['+', '-'] as Sign[]).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={value === s}
            onClick={() => onChange(s)}
            className={`min-h-11 min-w-[72px] rounded-lg border text-[13px] font-semibold transition-colors ${
              value === s ? 'border-brand-500 bg-brand-500/12 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'
            }`}
          >
            {s === '+' ? 'Ylöspäin' : 'Alaspäin'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function EcgAxis(_props: WidgetProps) {
  const [i, setI] = useState<Sign>('+')
  const [f, setF] = useState<Sign>('+')
  const r = RESULT[i + f]
  const quadStart = r.angle - 45

  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [C + R * Math.cos((a * Math.PI) / 180), C + R * Math.sin((a * Math.PI) / 180)]
    const [x0, y0] = p(a0)
    const [x1, y1] = p(a1)
    return `M${C} ${C} L${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`
  }

  return (
    <div>
      <div className="grid gap-2">
        <Toggle label="I" value={i} onChange={setI} />
        <Toggle label="aVF" value={f} onChange={setF} />
      </div>

      <svg viewBox="0 0 220 220" className="mx-auto mt-3 h-auto w-full max-w-[280px]" role="img" aria-label={`${r.name}, noin ${r.angle} astetta`}>
        <circle cx={C} cy={C} r={R} fill={svg.raised} stroke={svg.line} />
        <motion.path initial={false} animate={{ d: arc(quadStart, quadStart + 90) }} fill={r.tone === 'ok' ? svg.tealSoft : r.tone === 'danger' ? svg.dangerSoft : svg.brandSoft} transition={{ duration: 0.35 }} />
        <line x1={C - R - 8} x2={C + R + 8} y1={C} y2={C} stroke={svg.dim} strokeDasharray="3 3" />
        <line x1={C} x2={C} y1={C - R - 8} y2={C + R + 8} stroke={svg.dim} strokeDasharray="3 3" />
        <text x={C + R + 4} y={C - 6} fontSize={11} fontWeight={700} fill={svg.ink} textAnchor="end">
          I 0°
        </text>
        <text x={C + 6} y={C + R + 4} fontSize={11} fontWeight={700} fill={svg.ink}>
          aVF +90°
        </text>
        <text x={C + 6} y={C - R + 10} fontSize={10} fill={svg.dim}>
          −90°
        </text>
        <text x={C - R + 2} y={C - 6} fontSize={10} fill={svg.dim}>
          ±180°
        </text>
        <motion.line
          x1={C}
          y1={C}
          stroke={svg.brand}
          strokeWidth={4}
          strokeLinecap="round"
          initial={false}
          animate={{ x2: C + (R - 12) * Math.cos((r.angle * Math.PI) / 180), y2: C + (R - 12) * Math.sin((r.angle * Math.PI) / 180) }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.2 }}
        />
        <motion.circle
          r={7}
          fill={svg.brand}
          initial={false}
          animate={{ cx: C + (R - 8) * Math.cos((r.angle * Math.PI) / 180), cy: C + (R - 8) * Math.sin((r.angle * Math.PI) / 180) }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.2 }}
        />
        <circle cx={C} cy={C} r={5} fill={svg.ink} />
      </svg>

      <div className={`mt-2 rounded-xl border px-4 py-3 ${toneSurface[r.tone]}`} aria-live="polite">
        <p className={`font-display text-[15px] font-semibold ${toneText[r.tone]}`}>{r.name}</p>
        <p className="mt-1 text-[13.5px] leading-snug text-[var(--text)]">{r.causes}</p>
      </div>
      <div className="mt-2">
        <Caption>Katso, onko QRS-kompleksi pääosin ylös- vai alaspäin kytkennöissä I ja aVF. Tarkempi raja: akseli on alle −30°, jos QRS on nettona negatiivinen kytkennässä II, ja yli +90°, jos se on negatiivinen kytkennässä I.</Caption>
      </div>
    </div>
  )
}
