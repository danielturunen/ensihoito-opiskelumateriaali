import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { Result, Segmented, svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { FIG } from '../parts/exam-kit'

/* Capillary refill time (articles ABCDE-arviointi, Lapsi ensihoidossa, Sokki, Infektiosairaudet):
 * press, release, count the seconds until the colour returns. Refill speeds are illustrative;
 * the 2-second limit comes from the articles. */

const PRESS_START = 0.5
const RELEASE = 2
const LOOP = 7.5

export default function ExamCapRefill(_props: WidgetProps) {
  const [slow, setSlow] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(3)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % LOOP))
  const refill = slow ? 3.6 : 1.4 // seconds after release
  const pressing = t > PRESS_START && t < RELEASE
  const press = t < PRESS_START ? 0 : t < PRESS_START + 0.25 ? (t - PRESS_START) / 0.25 : t < RELEASE ? 1 : t < RELEASE + 0.15 ? 1 - (t - RELEASE) / 0.15 : 0
  const since = t - RELEASE
  const blanch = t < PRESS_START ? 0 : t < RELEASE ? Math.min(1, (t - PRESS_START) / 0.3) : since < refill ? 1 - since / refill : 0
  const counting = since >= 0 && since < refill + 0.6
  const shown = Math.max(0, Math.min(since, refill))

  return (
    <div ref={ref}>
      <Segmented
        layoutId="crt"
        size="sm"
        value={slow ? 's' : 'n'}
        onChange={(v) => setSlow(v === 's')}
        options={[
          { value: 'n', label: 'Normaali' },
          { value: 's', label: 'Pidentynyt' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 320 190" className="h-auto w-full" role="img" aria-label={`Kapillaaritäyttö: väri palaa ${slow ? 'yli' : 'alle'} 2 sekunnissa`}>
          {/* fingertip seen from above */}
          <path d="M70 150V70C70 38 92 22 120 22C148 22 170 38 170 70V150Z" fill={FIG.fill} stroke={FIG.line} strokeWidth={1.6} />
          <path d="M92 70C92 52 104 42 120 42C136 42 148 52 148 70V108C148 116 140 120 120 120C100 120 92 116 92 108Z" fill="#f2a7b5" stroke="#d97786" strokeWidth={1.4} />
          <path
            d="M92 70C92 52 104 42 120 42C136 42 148 52 148 70V108C148 116 140 120 120 120C100 120 92 116 92 108Z"
            fill="#fbf4f2"
            opacity={blanch}
          />
          {/* examiner's thumb */}
          <g transform={`translate(0 ${-28 + press * 26})`} opacity={t < PRESS_START - 0.2 || t > RELEASE + 0.4 ? 0.35 : 1}>
            <ellipse cx={120} cy={70} rx={30} ry={20} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.8} />
          </g>
          <text x={120} y={176} textAnchor="middle" fontSize={11} fill={svg.dim}>
            {pressing ? 'paina' : since >= 0 && since < refill ? 'vapauta – laske sekunnit' : ' '}
          </text>

          {/* stopwatch */}
          <g transform="translate(250 92)">
            <circle r={44} fill={svg.surface} stroke={svg.line} strokeWidth={2} />
            <path d={`M0 0L${44 * Math.sin((2 / 6) * 2 * Math.PI)} ${-44 * Math.cos((2 / 6) * 2 * Math.PI)}`} stroke={svg.danger} strokeWidth={1.2} strokeDasharray="3 3" />
            <path d={`M0 0L${36 * Math.sin((shown / 6) * 2 * Math.PI)} ${-36 * Math.cos((shown / 6) * 2 * Math.PI)}`} stroke={svg.ink} strokeWidth={3} strokeLinecap="round" />
            <circle r={4} fill={svg.ink} />
            <text y={66} textAnchor="middle" fontSize={15} fontWeight={700} fill={counting && shown > 2 ? svg.danger : svg.ink}>
              {counting ? `${shown.toFixed(1).replace('.', ',')} s` : '0,0 s'}
            </text>
            <text x={34} y={-34} fontSize={10.5} fill={svg.danger}>
              2 s
            </text>
          </g>
        </svg>
      </Stage>
      <div className="mt-3">
        <Result tone={slow ? 'danger' : 'ok'} title={slow ? 'Kapillaaritäyttöaika yli 2 sekuntia' : 'Väri palaa alle 2 sekunnissa'}>
          {slow
            ? 'Heikentynyt ääreisperfuusio – sokin merkki. Selvästi pidentynyt kapillaaritäyttö on myös SIRS-löydös. Lapsella ulkoilman lämpötila voi vaikuttaa tulokseen.'
            : 'Normaali kapillaaritäyttö. Arvioi aina myös syke, iho, verenpaine ja tajunta.'}
        </Result>
      </div>
    </div>
  )
}
