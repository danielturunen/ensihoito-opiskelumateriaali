import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Result, svg, type Tone } from '../ui'

/* The Vortex approach as summarised in the European Trauma Course manual (ch. 3):
 * three lifelines, at most three attempts each, a "best effort" ends a lifeline,
 * and when all three fail the situation is CICO → front-of-neck access. */

type Id = 'ett' | 'sga' | 'bmv'
const LINES: { id: Id; label: string; angle: number }[] = [
  { id: 'ett', label: 'Intubaatio', angle: -90 },
  { id: 'sga', label: 'Supraglottinen', angle: 30 },
  { id: 'bmv', label: 'Naamari-palje', angle: 150 },
]

const CX = 160
const CY = 112

export default function Vortex() {
  const [fails, setFails] = useState<Record<Id, number>>({ ett: 0, sga: 0, bmv: 0 })
  const [green, setGreen] = useState(true)
  const reduce = useReducedMotion()

  const total = fails.ett + fails.sga + fails.bmv
  const exhausted = LINES.filter((l) => fails[l.id] >= 3).length
  const cico = exhausted === 3

  const depth = green ? 0 : Math.min(1, total / 9)
  const r = green ? 92 : 78 - depth * 62
  const a = ((green ? -60 : -60 + depth * 600) * Math.PI) / 180
  const mx = CX + r * Math.cos(a)
  const my = CY + r * Math.sin(a) * 0.62

  function fail(id: Id, best = false) {
    setGreen(false)
    setFails((f) => ({ ...f, [id]: best ? 3 : Math.min(3, f[id] + 1) }))
  }
  function success() {
    setGreen(true)
  }
  function reset() {
    setFails({ ett: 0, sga: 0, bmv: 0 })
    setGreen(true)
  }

  let title: string
  let text: string
  let tone: Tone
  if (green && total === 0) {
    title = 'Vihreä alue'
    text = 'Potilas hapettuu. Anestesian alkaessa vihreältä alueelta poistutaan, ja happeutus alkaa kiertää suppiloa alaspäin.'
    tone = 'ok'
  } else if (green) {
    title = 'Takaisin vihreällä alueella'
    text = 'Happeutus on turvattu jollakin kolmesta keinosta – nyt on aikaa pysähtyä ja suunnitella seuraava vaihe rauhassa.'
    tone = 'ok'
  } else if (cico) {
    title = 'CICO – ei voi intuboida, ei voi happeuttaa'
    text = 'Kaikilla kolmella keinolla on tehty paras yritys. Kaulan etuosan kautta tehtävä hengitystie (FONA) heti. ETC suosittaa ennen kirurgista hengitystietä lyhyen aikalisän (10 sekuntia 10 minuutin edestä) – päätös sanotaan selvästi ja toteutetaan välittömästi.'
    tone = 'danger'
  } else {
    const left = LINES.filter((l) => fails[l.id] < 3).map((l) => l.label.toLowerCase())
    title = 'Happeutus kiertää alaspäin'
    text = `Jäljellä olevat keinot: ${left.join(', ')}. Vaihda keinoa, kun paras yritys on tehty – jatkaminen ei kannata, vaikka kyseessä olisi ensimmäinen yritys.`
    tone = exhausted >= 2 ? 'danger' : 'warning'
  }

  return (
    <div>
      <svg viewBox="0 0 320 224" className="h-auto w-full" role="img" aria-label={`Vortex-suppilo: ${title}`}>
        <g aria-hidden>
          {/* funnel rings (viewed obliquely from above) */}
          {[100, 82, 64, 46, 28].map((rr, i) => (
            <ellipse key={rr} cx={CX} cy={CY + i * 6} rx={rr} ry={rr * 0.62} fill="none" stroke={i === 0 ? svg.teal : svg.line} strokeWidth={i === 0 ? 10 : 1.5} strokeOpacity={i === 0 ? 0.45 : 1} />
          ))}
          <ellipse cx={CX} cy={CY + 30} rx={16} ry={10} fill={cico ? svg.danger : svg.dangerSoft} stroke={svg.danger} strokeWidth={1.5} />
          <text x={CX} y={CY + 34} fontSize={9} fontWeight={700} fill={cico ? '#fff' : svg.danger} textAnchor="middle">
            CICO
          </text>
          <text x={CX} y={14} fontSize={10} fontWeight={600} fill={svg.teal} textAnchor="middle">
            vihreä alue
          </text>

          {/* lifeline labels and attempt pips */}
          {LINES.map((l) => {
            const ang = (l.angle * Math.PI) / 180
            const lx = CX + 128 * Math.cos(ang) * (l.id === 'ett' ? 0 : 1)
            const ly = l.id === 'ett' ? 30 : CY + 86 * Math.sin(ang) + 16
            return (
              <g key={l.id}>
                <text x={l.id === 'ett' ? CX : lx} y={ly} fontSize={10} fontWeight={600} fill={fails[l.id] >= 3 ? svg.danger : svg.ink} textAnchor="middle">
                  {l.label}
                </text>
                {[0, 1, 2].map((k) => (
                  <circle key={k} cx={(l.id === 'ett' ? CX : lx) - 10 + k * 10} cy={ly + 9} r={3.5} fill={k < fails[l.id] ? svg.danger : svg.raised} stroke={svg.line} />
                ))}
              </g>
            )
          })}

          {/* oxygenation marker */}
          <motion.circle
            r={8}
            initial={false}
            animate={{ cx: mx, cy: my, fill: green ? svg.teal : cico ? svg.danger : svg.brand }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.8, bounce: 0.2 }}
            stroke="#fff"
            strokeWidth={2}
          />
        </g>
      </svg>

      <div className="mt-1 flex flex-col gap-2">
        {LINES.map((l) => {
          const out = fails[l.id] >= 3
          return (
            <div key={l.id} className={`rounded-xl border px-3 py-2 ${out ? 'border-danger-500/35 bg-danger-500/8' : 'border-[var(--border)]'}`}>
              <p className="text-[13px] font-semibold text-[var(--text)]">
                {l.label} <span className="font-normal text-[var(--text-dim)]">– yrityksiä {fails[l.id]}/3{out ? ' · käytetty' : ''}</span>
              </p>
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                <button disabled={out || cico} onClick={() => fail(l.id)} className="min-h-[40px] rounded-lg border border-[var(--border)] px-2 text-[12px] font-medium text-[var(--text)] disabled:opacity-40">
                  Epäonnistui
                </button>
                <button disabled={out || cico} onClick={() => fail(l.id, true)} className="min-h-[40px] rounded-lg border border-[var(--border)] px-2 text-[12px] font-medium text-[var(--text)] disabled:opacity-40">
                  Paras yritys
                </button>
                <button disabled={out || cico} onClick={success} className="min-h-[40px] rounded-lg bg-teal-500/15 px-2 text-[12px] font-semibold text-teal-600 disabled:opacity-40">
                  Onnistui
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3">
        <Result tone={tone} title={title}>
          {text}
        </Result>
      </div>
      {(total > 0 || !green) && (
        <button onClick={reset} className="mt-2 min-h-[40px] w-full rounded-xl text-[12px] font-medium text-[var(--text-dim)]">
          Aloita alusta
        </button>
      )}
    </div>
  )
}
