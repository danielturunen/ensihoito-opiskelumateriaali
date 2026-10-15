import { useMemo, useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'

/* Onset, peak and duration of pain medicines (articles Kivunhoito, Fentanyyli, Morfiini, Metoksifluraani;
 * Akuuttihoidon lääkkeet 2025). Curves are schematic shapes built from the published onset, peak and
 * duration; the height is not a dose-response. */

type Id = 'fenta' | 'morf' | 'metox'

interface Drug {
  id: Id
  name: string
  color: string
  onset: number // min
  peak: number // min
  end: number // min (schematic end of a single dose)
  facts: string
  redose: string
}

const DRUGS: Drug[] = [
  { id: 'fenta', name: 'Fentanyyli i.v.', color: '#f8690a', onset: 1.5, peak: 5, end: 90, facts: 'Alkaa 1–2 min, huippu noin 5 min, kerta-annos kestää 0,5–4 h.', redose: 'Lisäannos puolet aloitusannoksesta 5 min kuluttua.' },
  { id: 'morf', name: 'Morfiini i.v.', color: '#6b72d9', onset: 7, peak: 20, end: 180, facts: 'Alkaa 5–10 min, huippu noin 20 min, kerta-annos kestää 2–4 h.', redose: 'Annos voidaan toistaa 5–10 min kuluttua.' },
  { id: 'metox', name: 'Metoksifluraani', color: '#0fb8ac', onset: 2, peak: 6, end: 25, facts: 'Alkaa 6–10 hengenvedon eli 1–3 min jälkeen, yksi 3 ml:n annos riittää noin 15–30 min.', redose: 'Annoksen voi toistaa kerran (enintään 6 ml).' },
]

const T_MAX = 120 // minutes on the x-axis
const X0 = 34
const X1 = 326
const Y0 = 150
const Y1 = 30
const sx = (m: number) => X0 + ((Math.sqrt(m) / Math.sqrt(T_MAX)) * (X1 - X0))
const sy = (v: number) => Y0 - v * (Y0 - Y1)

function level(d: Drug, m: number) {
  if (m <= 0) return 0
  if (m < d.peak) {
    const k = m / d.peak
    return k * k * (3 - 2 * k)
  }
  const k = Math.min(1, (m - d.peak) / (d.end - d.peak))
  return 1 - k * k * (3 - 2 * k)
}

export default function AnalgesicCurves(props: WidgetProps) {
  const init: Id = props.initial === 'morf' || props.initial === 'metox' ? props.initial : 'fenta'
  const [shown, setShown] = useState<Record<Id, boolean>>({ fenta: true, morf: true, metox: init === 'metox' })
  const [focus, setFocus] = useState<Id>(init)
  const ref = useRef<HTMLDivElement>(null)
  const [m, setM] = useState(5)
  const [playing, setPlaying] = useState(true)
  // 1 s of animation = 6 minutes of patient time; loops over the axis
  useFrameLoop(ref, (dt) => setM((v) => (v + dt * 6) % T_MAX), playing)

  const paths = useMemo(
    () =>
      Object.fromEntries(
        DRUGS.map((d) => {
          let p = ''
          for (let i = 0; i <= 160; i++) {
            const mm = (i / 160) ** 2 * T_MAX
            p += `${i ? 'L' : 'M'}${sx(mm).toFixed(1)} ${sy(level(d, mm)).toFixed(1)}`
          }
          return [d.id, p]
        }),
      ) as Record<Id, string>,
    [],
  )

  const fd = DRUGS.find((d) => d.id === focus)!
  const ticks = [0, 5, 10, 20, 30, 60, 90, 120]

  return (
    <div ref={ref}>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Näytettävät lääkkeet">
        {DRUGS.map((d) => (
          <button
            key={d.id}
            aria-pressed={shown[d.id]}
            onClick={() => {
              setShown((s) => ({ ...s, [d.id]: !s[d.id] }))
              setFocus(d.id)
            }}
            className={`flex min-h-[40px] items-center gap-2 rounded-full border px-3 text-[13px] font-semibold transition-[background-color,border-color] duration-150 ${shown[d.id] ? 'border-transparent bg-[var(--bg)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'}`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: shown[d.id] ? d.color : 'transparent', border: `2px solid ${d.color}` }} />
            {d.name}
          </button>
        ))}
      </div>

      <Stage className="mt-3">
        <svg viewBox="0 0 340 186" className="h-auto w-full" role="img" aria-label={`Vaikutuksen kulku ajan funktiona. Aika ${Math.round(m)} minuuttia.`}>
          {/* axes */}
          <path d={`M${X0} ${Y1 - 6}V${Y0}H${X1}`} fill="none" stroke={svg.line} strokeWidth={1.4} />
          <text x={X0 - 4} y={Y1 - 10} fontSize={10} fill={svg.dim}>
            vaikutus
          </text>
          {ticks.map((tk) => (
            <g key={tk}>
              <path d={`M${sx(tk)} ${Y0}v4`} stroke={svg.line} />
              <text x={sx(tk)} y={Y0 + 15} textAnchor="middle" fontSize={9.5} fill={svg.dim}>
                {tk}
              </text>
            </g>
          ))}
          <text x={X1} y={Y0 + 30} textAnchor="end" fontSize={10} fill={svg.dim}>
            min antamisesta (aikajana venytetty alusta)
          </text>

          {DRUGS.filter((d) => shown[d.id]).map((d) => (
            <g key={d.id} opacity={focus === d.id ? 1 : 0.55}>
              <path d={paths[d.id]} fill="none" stroke={d.color} strokeWidth={focus === d.id ? 3 : 2} strokeLinecap="round" />
              <circle cx={sx(m)} cy={sy(level(d, m))} r={4.5} fill={d.color} stroke={svg.surface} strokeWidth={1.5} />
            </g>
          ))}
          {/* peak marker for the focused drug */}
          {shown[focus] && (
            <g>
              <path d={`M${sx(fd.peak)} ${Y1}V${Y0}`} stroke={fd.color} strokeDasharray="3 4" strokeWidth={1.2} />
              <text x={sx(fd.peak) + 4} y={Y0 - 6} fontSize={10} fontWeight={600} fill={fd.color}>
                huippu
              </text>
            </g>
          )}
          {/* time cursor */}
          <path d={`M${sx(m)} ${Y1 - 4}V${Y0}`} stroke={svg.dim} strokeWidth={1} />
          <text x={sx(m)} y={Y1 - 8} textAnchor={m > 90 ? 'end' : 'middle'} fontSize={10.5} fontWeight={700} fill={svg.ink}>
            {Math.round(m)} min
          </text>
        </svg>
      </Stage>

      <div className="mt-2 flex items-center gap-2">
        <button onClick={() => setPlaying((p) => !p)} className="min-h-[40px] rounded-xl border border-[var(--border)] px-3 text-[13px] font-semibold text-[var(--text)]">
          {playing ? 'Pysäytä aika' : 'Jatka aikaa'}
        </button>
        <input
          type="range"
          min={0}
          max={T_MAX}
          step={1}
          value={Math.round(m)}
          onChange={(e) => {
            setPlaying(false)
            setM(Number(e.target.value))
          }}
          className="flex-1 accent-brand-500"
          aria-label="Aika antamisesta minuutteina"
        />
      </div>

      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-3">
        <div className="flex gap-1.5">
          {DRUGS.map((d) => (
            <button key={d.id} onClick={() => setFocus(d.id)} className={`rounded-lg px-2 py-1 text-[12px] font-semibold ${focus === d.id ? 'bg-[var(--bg)] text-[var(--text)]' : 'text-[var(--text-dim)]'}`}>
              {d.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[13px] leading-snug text-[var(--text)]">{fd.facts}</p>
        <p className="mt-1 text-[13px] leading-snug text-[var(--text-dim)]">{fd.redose}</p>
      </div>
      <p className="mt-2 text-[12px] leading-snug text-[var(--text-dim)]">
        Käyrät ovat kaavamaisia: ne kuvaavat vaikutuksen alkua, huippua ja kestoa, eivät annos–vastesuhdetta. Opioidin jälkeen potilas kuljetetaan aina monitoroituna.
      </p>
    </div>
  )
}
