import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { Result, Segmented, svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { SideFigure, type SidePose } from '../parts/exam-kit'

/* Neck stiffness (article Päänsärky ja migreeni; Akuuttihoito-opas Päänsärky 2025: "saako potilas
 * taivutettua leuan jugulumiin"). Side view of a seated patient flexing the neck. */

export default function ExamMeningism(_props: WidgetProps) {
  const [stiff, setStiff] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(1.6)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 4.2))
  const k = t < 0.4 ? 0 : t < 1.6 ? (t - 0.4) / 1.2 : t < 3 ? 1 : t < 3.8 ? 1 - (t - 3) / 0.8 : 0
  const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
  const max = stiff ? 16 : 48
  const p: SidePose = { x: 150, y: 150, torso: 6, neck: max * e, shoulder: 8, elbow: 30, hip: 90, knee: 90, ankle: 0 }
  const blocked = stiff && k > 0.85

  return (
    <div ref={ref}>
      <Segmented
        layoutId="mening"
        size="sm"
        value={stiff ? 's' : 'n'}
        onChange={(v) => setStiff(v === 's')}
        options={[
          { value: 'n', label: 'Leuka rintaan' },
          { value: 's', label: 'Niska jäykkä' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-label={stiff ? 'Leuka ei taivu rintaan – niskajäykkyys' : 'Leuka taipuu rintaan'}>
          <g transform="translate(150 142) scale(1.4) translate(-150 -150)">
            <rect x={118} y={150} width={60} height={8} rx={3} fill={svg.raised} stroke={svg.line} />
            <path d="M126 158V196M170 158V196M126 150V96" stroke={svg.line} strokeWidth={4} strokeLinecap="round" />
            <SideFigure p={p} />
          </g>
          {blocked && (
            <g>
              <path d="M182 26l7 -7M188 34l10 -3M176 20l1 -9" stroke={svg.danger} strokeWidth={2.2} strokeLinecap="round" />
              <text x={204} y={30} fontSize={12} fontWeight={700} fill={svg.danger}>
                kipu, jäykkä
              </text>
            </g>
          )}
          <text x={252} y={110} textAnchor="middle" fontSize={11} fill={svg.dim}>
            "Painakaa leuka rintaan"
          </text>
        </svg>
      </Stage>
      <div className="mt-3">
        <Result tone={stiff ? 'danger' : 'ok'} title={stiff ? 'Meningismi: leuka ei taivu rintaan' : 'Leuka taipuu rintaan'}>
          {stiff
            ? 'Niskajäykkyys on hälytysmerkki. Kuumeen, sepsiksen merkkien tai petekioiden kanssa → bakteerimeningiitti (päivystys ennakkoilmoituksella); äkillisesti alkaneen kovan päänsäryn kanssa → lukinkalvonalainen verenvuoto.'
            : 'Ei meningismiä. Arvioi silti päänsäryn muut hälytysmerkit: äkillinen alku, tajunnan häiriö, neurologinen puutosoire ja kuume.'}
        </Result>
      </div>
    </div>
  )
}
