import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { Result, Segmented, svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { FIG } from '../parts/exam-kit'

/* Jugular venous pressure (article Sydänpotilaan tutkiminen; Duodecim Oppiportti, Laskimoiden
 * tutkiminen 2024): bed head 30–45°, the pulsation top of the internal jugular vein is measured
 * vertically from the sternal angle; normally at most 3 cm. The raised value is an example. */

const PX_PER_CM = 6
// torso axis from hip to shoulder at 45°
const HIP = { x: 214, y: 166 }
const DIR = { x: -Math.SQRT1_2, y: -Math.SQRT1_2 }
const NORMAL = { x: Math.SQRT1_2, y: -Math.SQRT1_2 } // toward the front of the body
const at = (s: number, n = 0) => ({ x: HIP.x + DIR.x * s + NORMAL.x * n, y: HIP.y + DIR.y * s + NORMAL.y * n })

const SHOULDER = at(96)
const SA = at(84, 20) // sternal angle on the front of the chest
const VEIN0 = at(98, 10)
const VEIN1 = at(146, 10)

function pulsationTop(cm: number) {
  // point on the vein line whose height is `cm` above the sternal angle
  const y = SA.y - cm * PX_PER_CM
  const k = (VEIN0.y - y) / (VEIN0.y - VEIN1.y)
  return { x: VEIN0.x + (VEIN1.x - VEIN0.x) * k, y }
}

export default function ExamJvp(_props: WidgetProps) {
  const [high, setHigh] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 1))
  const cm = high ? 6 : 2.5
  const top = pulsationTop(cm)
  // venous waveform: two small bumps per beat
  const wave = 1.6 * Math.exp(-((t - 0.15) ** 2) / 0.004) + 1.1 * Math.exp(-((t - 0.55) ** 2) / 0.006)
  const pulseY = top.y - wave
  const rulerX = SA.x + 46
  const head = at(160)

  return (
    <div ref={ref}>
      <Segmented
        layoutId="jvp"
        size="sm"
        value={high ? 'h' : 'n'}
        onChange={(v) => setHigh(v === 'h')}
        options={[
          { value: 'n', label: 'Normaali' },
          { value: 'h', label: 'Koholla' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-label={`Kaulalaskimopaine: pulssiaallon huippu ${cm.toString().replace('.', ',')} cm rintalastan kulman yläpuolella`}>
          {/* bed: backrest at 45° */}
          <path d={`M${HIP.x + 6} ${HIP.y + 18}L${HIP.x - 130} ${HIP.y - 118}`} stroke={svg.line} strokeWidth={6} strokeLinecap="round" />
          <path d={`M${HIP.x + 6} ${HIP.y + 18}H312`} stroke={svg.line} strokeWidth={6} strokeLinecap="round" />
          {/* body */}
          <path
            d={`M${at(-10, -14).x} ${at(-10, -14).y}L${at(100, -14).x} ${at(100, -14).y}L${at(100, 22).x} ${at(100, 22).y}L${at(-10, 26).x} ${at(-10, 26).y}Z`}
            fill={FIG.fill}
            stroke={FIG.line}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <path d={`M${HIP.x} ${HIP.y + 6}H300`} stroke={FIG.fill} strokeWidth={20} strokeLinecap="round" />
          {/* neck and head (turned slightly left and up) */}
          <path d={`M${SHOULDER.x} ${SHOULDER.y}L${at(150).x} ${at(150).y}`} stroke={FIG.fill} strokeWidth={26} strokeLinecap="round" />
          <circle cx={head.x - 2} cy={head.y - 2} r={22} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
          <path d={`M${head.x + 16} ${head.y - 14}l9 6l-8 4`} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} strokeLinejoin="round" />
          {/* internal jugular vein */}
          <path d={`M${VEIN0.x} ${VEIN0.y}L${top.x} ${pulseY}`} stroke="#6b72d9" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
          <circle cx={top.x} cy={pulseY} r={4} fill="#6b72d9" stroke={svg.surface} strokeWidth={1.4} />
          {/* sternal angle */}
          <circle cx={SA.x} cy={SA.y} r={3.5} fill={svg.brand} />
          <text x={SA.x + 8} y={SA.y + 16} fontSize={11} fill={svg.brand}>
            rintalastan kulma
          </text>
          {/* measurement */}
          <path d={`M${top.x} ${top.y}H${rulerX}`} stroke={svg.dim} strokeWidth={1} strokeDasharray="3 3" />
          <path d={`M${SA.x} ${SA.y}H${rulerX}`} stroke={svg.dim} strokeWidth={1} strokeDasharray="3 3" />
          <rect x={rulerX} y={SA.y - 8 * PX_PER_CM} width={10} height={8 * PX_PER_CM} fill={svg.surface} stroke={svg.line} />
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${rulerX} ${SA.y - i * PX_PER_CM}h${i % 5 === 0 ? 8 : 4}`} stroke={svg.dim} strokeWidth={1} />
          ))}
          <path d={`M${rulerX - 4} ${SA.y - 3 * PX_PER_CM}h18`} stroke={svg.teal} strokeWidth={1.6} />
          <text x={rulerX + 16} y={SA.y - 3 * PX_PER_CM + 4} fontSize={10.5} fill={svg.teal}>
            3 cm
          </text>
          <text x={rulerX + 52} y={top.y + 4} fontSize={12} fontWeight={700} fill={high ? svg.danger : svg.ink}>
            {cm.toString().replace('.', ',')} cm
          </text>
          <text x={HIP.x - 120} y={HIP.y + 34} fontSize={11} fill={svg.dim}>
            pääpuoli 30–45°
          </text>
        </svg>
      </Stage>
      <ol className="mt-3 space-y-1.5 text-[13px] leading-snug text-[var(--text)]">
        <li>1. Sängyn pääty 30–45°, pää tyynyllä ja olkapäät rentoina.</li>
        <li>2. Käännä päätä varovasti vasemmalle ja ylös – sisemmän kaulalaskimon pulssiaalto näkyy leukakulman alapuolella ihon liikkeenä. Taskulamppu ja hämärä tausta auttavat.</li>
        <li>3. Mittaa pulssiaallon huipun pystysuora etäisyys rintalastan kulmasta.</li>
      </ol>
      <div className="mt-3">
        <Result tone={high ? 'danger' : 'ok'} title={high ? 'Keskuslaskimopaine koholla' : 'Huippu enintään 3 cm rintalastan kulmasta'}>
          {high
            ? 'Nousee esimerkiksi oikeanpuoleisessa sydämen vajaatoiminnassa, keuhkoveritulpassa ja pulmonaalihypertensiossa. Matala verenpaine ja pullottavat kaulalaskimot sopivat tamponaatioon.'
            : 'Normaali huippu ei ylitä 3 cm:n etäisyyttä rintalastan kulmasta (noin 8 cm oikeasta eteisestä) – keskuslaskimopaine on silloin alle 6 mmHg.'}
        </Result>
      </div>
    </div>
  )
}
