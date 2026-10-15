import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Result, svg } from '../ui'
import { Stage, spring } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'

/* Tricyclic antidepressant poisoning and sodium bicarbonate (articles Natriumbikarbonaatti, Intoksikaatiopotilaan
 * hoito; Akuuttihoidon lääkkeet 2025, intoksikaatio-opas). The drug blocks cardiac sodium channels and widens
 * the QRS; alkalinisation with bicarbonate reduces the binding. QRS widths and pH steps are illustrative. */

const QRS = [168, 148, 130, 114, 104]
const PH = [7.3, 7.38, 7.46, 7.53, 7.59]
const CHANNELS = [40, 90, 140, 190, 240, 290]

export default function TcaBicarbonate(_props: WidgetProps) {
  const [doses, setDoses] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0.4)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 1.6))

  const qrs = QRS[doses]
  const ph = PH[doses]
  const blocked = [5, 4, 3, 2, 1][doses]
  const goal = qrs < 120
  const stop = ph > 7.55

  // one beat with QRS width scaled from ms
  const w = (qrs / 1000) * 260 // px per beat window of 1 s ~ 260 px
  const beat = (x: number) => {
    // x in px from beat start
    if (x < 14) return 0.12 * Math.sin((x / 14) * Math.PI)
    const q0 = 26
    if (x >= q0 && x < q0 + w) {
      const k = (x - q0) / w
      return k < 0.18 ? -0.2 * (k / 0.18) : k < 0.5 ? -0.2 + 1.35 * ((k - 0.18) / 0.32) : k < 0.85 ? 1.15 - 1.55 * ((k - 0.5) / 0.35) : -0.4 + 0.4 * ((k - 0.85) / 0.15)
    }
    const tw = q0 + w + 26
    if (x > tw && x < tw + 46) return 0.3 * Math.sin(((x - tw) / 46) * Math.PI)
    return 0
  }
  const sweep = (t / 1.6) * 290
  let trace = ''
  for (let x = 0; x <= 290; x += 2) {
    const local = x % 145
    const y = 192 - beat(local) * 24
    trace += `${x ? 'L' : 'M'}${(25 + x).toFixed(1)} ${y.toFixed(1)}`
  }

  return (
    <div ref={ref}>
      <Stage>
        <svg viewBox="0 0 340 222" className="h-auto w-full" role="img" aria-label={`QRS ${qrs} ms, pH ${ph.toFixed(2)} – annoksia ${doses}.`}>
          {/* sodium channels */}
          <text x={10} y={16} fontSize={10.5} fill={svg.dim}>
            sydänlihassolun natriumkanavat
          </text>
          <rect x={10} y={42} width={320} height={16} rx={5} fill={svg.raised} stroke={svg.line} />
          {CHANNELS.map((x, i) => (
            <g key={x}>
              <rect x={x - 9} y={36} width={18} height={28} rx={5} fill={svg.surface} stroke={svg.dim} strokeWidth={1.3} />
              <motion.circle cx={x} cy={50} r={6} fill="#8b5cf6" initial={false} animate={{ opacity: i < blocked ? 1 : 0, scale: i < blocked ? 1 : 0.4 }} transition={spring} style={{ transformBox: 'fill-box', originX: 0.5, originY: 0.5 }} />
              {i >= blocked && <path d={`M${x} 26v8m-3 -3l3 3l3 -3`} fill="none" stroke={svg.teal} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />}
            </g>
          ))}
          <text x={10} y={82} fontSize={10.5} fill={svg.ink}>
            <tspan fill="#8b5cf6" fontWeight={700}>
              ●
            </tspan>{' '}
            masennuslääke salpaa kanavan · <tspan fill={svg.teal} fontWeight={700}>↓</tspan> natrium virtaa
          </text>

          {/* pH gauge */}
          <g transform="translate(10 100)">
            <rect x={0} y={0} width={320} height={10} rx={5} fill={svg.surface} stroke={svg.line} />
            <rect x={((7.45 - 7.2) / 0.45) * 320} y={0} width={((7.55 - 7.45) / 0.45) * 320} height={10} fill={svg.tealSoft} />
            <motion.circle cy={5} r={7} fill={stop ? svg.danger : svg.ink} initial={false} animate={{ cx: ((ph - 7.2) / 0.45) * 320 }} transition={spring} />
            <text x={0} y={26} fontSize={10.5} fill={svg.dim}>
              pH {ph.toFixed(2).replace('.', ',')}
            </text>
            <text x={320} y={26} textAnchor="end" fontSize={10} fill={svg.teal}>
              tavoite 7,45–7,55
            </text>
          </g>

          {/* ECG */}
          <rect x={14} y={140} width={312} height={64} rx={6} fill={svg.surface} stroke={svg.line} />
          <path d={trace} fill="none" stroke={goal ? svg.teal : svg.danger} strokeWidth={1.8} strokeLinejoin="round" />
          <rect x={25 + sweep} y={142} width={14} height={60} fill={svg.surface} opacity={0.9} />
          <text x={22} y={154} fontSize={11} fontWeight={700} fill={goal ? svg.teal : svg.danger}>
            QRS {qrs} ms
          </text>
          <text x={320} y={154} textAnchor="end" fontSize={10} fill={svg.dim}>
            tavoite alle 120 ms
          </text>
          <text x={170} y={218} textAnchor="middle" fontSize={10} fill={svg.dim}>
            arvot havainnollistavia
          </text>
        </svg>
      </Stage>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setDoses((d) => Math.min(QRS.length - 1, d + 1))}
          disabled={stop || doses >= QRS.length - 1}
          className="min-h-[44px] flex-1 rounded-xl bg-brand-500 px-3 text-[13px] font-semibold text-white disabled:opacity-40"
        >
          Anna 50–100 ml (7,5 %) i.v.
        </button>
        <button onClick={() => setDoses(0)} className="min-h-[44px] rounded-xl border border-[var(--border)] px-3 text-[13px] font-semibold text-[var(--text)]">
          Alusta
        </button>
      </div>
      <p className="mt-1.5 text-[12px] text-[var(--text-dim)]">Annettu {doses} kertaa – toisto 5–10 minuutin välein (aika tiivistetty).</p>

      <div className="mt-3">
        {stop ? (
          <Result tone="danger" title="pH yli 7,55 – ei lisäannoksia">
            Lisäannoksia ei anneta, jos pH on yli 7,55 tai natrium yli 155 mmol/l. Liika bikarbonaatti aiheuttaa alkaloosin ja hypernatremian.
          </Result>
        ) : goal ? (
          <Result tone="ok" title="QRS kapeni alle 120 ms">
            Bikarbonaatti alkalisoi verta ja vähentää lääkkeen sitoutumista natriumkanaviin. Seuraa QRS:ää, pH:ta ja natriumia, ja huolehdi ventilaatiosta – bikarbonaatti muodostaa hiilidioksidia.
          </Result>
        ) : (
          <Result tone="warning" title="Leveä QRS – natriumkanavat salpautuneet">
            Trisyklisen masennuslääkkeen myrkytyksessä QRS levenee (yli 100 ms), ja kammioarytmiat ja kouristelu uhkaavat. Bikarbonaattia annetaan 50–100 ml (noin 1–2 mmol/kg) 1–5 minuutin aikana ja toistetaan, kunnes QRS on alle 120 ms tai rytmihäiriö loppuu.
          </Result>
        )}
      </div>
    </div>
  )
}
