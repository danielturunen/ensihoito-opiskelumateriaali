import { useMemo, useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { FIG, StepControls, useStepper, useTween, type ExamStep } from '../parts/exam-kit'

/* Log roll (blokkikääntö) and palpation of the spine (article Traumapotilaan tutkiminen;
 * European Trauma Course). Left: end-on view from the feet. Right: the back after the roll. */

const STEPS: (ExamStep & { roll: number; palpate: boolean })[] = [
  { title: 'Valmistelu', text: 'Kaularanka käsituennassa, pää ja kaula linjassa. Tiimi suunnittelee käännön ja toimii yhtä aikaa – koordinoimaton kääntö on tavallinen virhe.', roll: 0, palpate: false, dur: 3 },
  { title: 'Kääntö kyljelleen', text: 'Pää, vartalo ja lantio käännetään yhtenä kappaleena niin, ettei ranka kierry.', roll: 80, palpate: false, dur: 3 },
  { title: 'Selän inspektio', text: 'Etsi haavat, mustelmat, turvotus ja epämuodostumat – ne voivat olla nikamavamman ulkoisia merkkejä.', roll: 80, palpate: false, dur: 3 },
  { title: 'Rangan palpaatio', text: 'Tunnustele koko selkäranka takaraivosta häntäluuhun: arkuus, porrastumat, epämuodostumat ja okahaarakkeiden väliset raot.', roll: 80, palpate: true, dur: 6 },
  { title: 'Takaisin selälleen', text: 'Kääntö takaisin yhtä koordinoidusti. Jos koko kehon TT kuuluu ensiarvioon, blokkikääntö ei ole tylpässä vammassa ensisijainen – se voi siirtää murtumaa ja lantiomurtumapotilaalla irrottaa hyytymän.', roll: 0, palpate: false, dur: 3 },
]

const VERTEBRAE = 15

export default function ExamLogRoll(_props: WidgetProps) {
  const durs = useMemo(() => STEPS.map((s) => s.dur ?? 3), [])
  const s = useStepper(STEPS.length, durs)
  const step = STEPS[s.i]
  const { roll } = useTween({ roll: step.roll }, 1.1)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 5), step.palpate)
  const finger = step.palpate ? Math.min(VERTEBRAE - 1, Math.floor((t / 4.4) * VERTEBRAE)) : -1
  const tender = 9

  return (
    <div ref={ref}>
      <Stage>
        <svg viewBox="0 0 340 214" className="h-auto w-full" role="img" aria-label={`Blokkikääntö: ${step.title}`}>
          {/* ---- end-on view ---- */}
          <text x={80} y={18} textAnchor="middle" fontSize={11} fill={svg.dim}>
            jalkopäästä
          </text>
          <rect x={20} y={150} width={120} height={8} rx={3} fill={svg.raised} stroke={svg.line} />
          <g transform={`rotate(${-roll} 80 150)`}>
            <ellipse cx={80} cy={132} rx={42} ry={18} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.4} />
            <circle cx={80} cy={122} r={15} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} opacity={0.9} />
            <path d="M80 150v-6" stroke={svg.dim} strokeWidth={3} strokeLinecap="round" />
            {/* head holder's hands */}
            <ellipse cx={62} cy={120} rx={5} ry={9} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.4} />
            <ellipse cx={98} cy={120} rx={5} ry={9} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.4} />
          </g>
          {/* helpers' hands on the far side */}
          <g opacity={roll > 5 ? 1 : 0.5}>
            <ellipse cx={128} cy={110} rx={10} ry={6} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.4} />
            <ellipse cx={130} cy={136} rx={10} ry={6} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.4} />
          </g>
          <text x={80} y={204} textAnchor="middle" fontSize={11} fill={svg.dim}>
            pää ja vartalo yhtenä kappaleena
          </text>

          {/* ---- back view ---- */}
          <g opacity={roll > 60 ? 1 : 0.35}>
            <text x={336} y={22} textAnchor="end" fontSize={11} fill={svg.dim}>
              selkä
            </text>
            <rect x={226} y={44} width={72} height={150} rx={26} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
            <circle cx={262} cy={30} r={14} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
            {Array.from({ length: VERTEBRAE }, (_, i) => {
              const y = 44 + i * 10
              const isTender = finger >= tender && i === tender
              return <rect key={i} x={257} y={y} width={10} height={6} rx={2} fill={isTender ? svg.danger : i <= finger ? svg.teal : svg.surface} stroke={svg.dim} strokeWidth={0.8} />
            })}
            {finger >= 0 && <circle cx={278} cy={47 + finger * 10} r={6} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.6} />}
            {finger >= tender && (
              <text x={300} y={48 + tender * 10} fontSize={10.5} fontWeight={700} fill={svg.danger}>
                arka
              </text>
            )}
            <text x={226} y={40} textAnchor="end" fontSize={10} fill={svg.dim}>
              takaraivo
            </text>
            <text x={226} y={200} textAnchor="end" fontSize={10} fill={svg.dim}>
              häntäluu
            </text>
          </g>
        </svg>
      </Stage>
      <StepControls steps={STEPS} s={s} />
    </div>
  )
}
