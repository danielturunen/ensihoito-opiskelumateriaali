import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { Result, svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { FIG, SideFigure, useTween, type SidePose } from '../parts/exam-kit'

/* GCS motor response (articles Pään vamma and Tajuttomuus; European Trauma Course): the
 * examiner presses the supraorbital nerve and the arm responds. Poses are schematic. */

type Score = 6 | 5 | 4 | 3 | 2 | 1

const REST: SidePose = { x: 186, y: 134, torso: -90, neck: 0, shoulder: 4, elbow: 6, hip: 0, knee: 0, ankle: -70 }

const RESP: Record<Score, { label: string; pose: Partial<SidePose>; dur: number; text: string; stim: boolean }> = {
  6: { label: 'Tottelee käskyjä', pose: { shoulder: 95, elbow: 0 }, dur: 0.8, stim: false, text: '"Nostakaa kättä." Potilas tekee pyydetyn liikkeen – kipuärsykettä ei tarvita.' },
  5: { label: 'Paikantaa kivun', pose: { shoulder: 150, elbow: 70 }, dur: 0.8, stim: true, text: 'Käsi hakeutuu kohti ärsykettä. Paikantamiseksi (5) lasketaan vain, jos käsi nousee solisluun tason yläpuolelle.' },
  4: { label: 'Väistää kipua', pose: { shoulder: 40, elbow: 55 }, dur: 0.6, stim: true, text: 'Raaja vetäytyy, mutta käsi ei nouse solisluun tason yläpuolelle.' },
  3: { label: 'Fleksio', pose: { shoulder: 20, elbow: 120 }, dur: 1.3, stim: true, text: 'Kyynärvarsi koukistuu kohti rintaa (koukistusreaktio). Tajuttomalla aivoverenvuoto- tai SAV-potilaalla nähdään usein koukistus- tai ojennusreaktio kipuun.' },
  2: { label: 'Ekstensio', pose: { shoulder: -6, elbow: -4, ankle: -95 }, dur: 1.1, stim: true, text: 'Raajat ojentuvat jäykästi (ojennusreaktio).' },
  1: { label: 'Ei vastetta', pose: {}, dur: 0.5, stim: true, text: 'Ei liikettä kipuärsykkeeseen.' },
}

export default function ExamGcsMotor(_props: WidgetProps) {
  const [score, setScore] = useState<Score>(5)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(2)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 5))
  const r = RESP[score]
  const active = t > 0.6 && t < 3.6
  const pose = useTween({ ...REST, ...(active ? r.pose : {}) } as unknown as Record<string, number>, r.dur) as unknown as SidePose
  const pressing = r.stim && t > 0.3 && t < 3.6

  return (
    <div ref={ref}>
      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Liikevaste">
        {([6, 5, 4, 3, 2, 1] as Score[]).map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={score === n}
            onClick={() => {
              setScore(n)
              setT(0)
            }}
            className={`min-h-[44px] rounded-xl border px-1.5 text-[12px] font-semibold leading-tight transition-[background-color,border-color] duration-150 ${
              score === n ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'
            }`}
          >
            <span className="block font-display text-[15px]">{n}</span>
            {RESP[n].label}
          </button>
        ))}
      </div>

      <Stage className="mt-3">
        <svg viewBox="0 0 320 190" className="h-auto w-full" role="img" aria-label={`GCS-liikevaste ${score}: ${r.label}`}>
          <rect x={64} y={145} width={246} height={8} rx={3} fill={svg.raised} stroke={svg.line} />
          {/* clavicle level */}
          <path d="M130 30V140" stroke={svg.teal} strokeWidth={1} strokeDasharray="3 4" opacity={0.7} />
          <text x={134} y={38} fontSize={10.5} fill={svg.teal}>
            solisluun taso
          </text>
          <SideFigure
            p={pose}
            headExtra={
              pressing ? (
                <g>
                  <circle cx={9} cy={-80} r={7} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.6} />
                  <circle cx={9} cy={-80} r={12} fill="none" stroke={FIG.hand} strokeWidth={1} opacity={0.6} />
                </g>
              ) : null
            }
          />
          {score === 6 && active && (
            <text x={240} y={40} textAnchor="middle" fontSize={12} fontWeight={600} fill={svg.brand}>
              "Nostakaa kättä"
            </text>
          )}
          {pressing && (
            <text x={64} y={22} fontSize={11} fontWeight={600} fill={svg.brand}>
              paina silmäkuopan yläreunaa
            </text>
          )}
        </svg>
      </Stage>

      <div className="mt-3">
        <Result tone={score >= 5 ? 'ok' : score >= 3 ? 'warning' : 'danger'} title={`Liikevaste ${score}: ${r.label}`}>
          {r.text}
        </Result>
      </div>
      <ul className="mt-3 space-y-1.5 text-[13px] leading-snug text-[var(--text)]">
        <li>• Kipuärsyke annetaan painamalla silmäkuopan yläreunan hermoa – raajaan annettua ärsykettä ei välttämättä tunneta kaularankavammassa.</li>
        <li>• Lastoitettu tai murtunut raaja: kirjaa paremman puolen vaste ja puolieron syy.</li>
        <li>• Arvioi ja kirjaa GCS ennen lääkkeitä, jos potilas intuboidaan.</li>
      </ul>
    </div>
  )
}
