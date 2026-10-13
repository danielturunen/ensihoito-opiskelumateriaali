import { useMemo, useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { BodySilhouette } from '../parts/body-silhouette'
import { FIG, SideFigure, StepControls, useStepper, type ExamStep } from '../parts/exam-kit'

/* Examining the acute abdomen (article Akuutti vatsa; Akuuttihoito-opas, Akuutin vatsan kliininen
 * tutkimus 2025): position, inspection, auscultation, palpation, hernia orifices and masses,
 * renal percussion. Front view in body space (200 × 410); viewer's left = patient's right. */

const STEPS: ExamStep[] = [
  { title: 'Asento', text: 'Potilas makaa puhumatta rentona, polvet hieman koukussa ja kädet rentoina sivuilla. Palpaation luotettavuutta heikentävät lihavuus, korkea ikä, immuunipuutos ja heikentynyt tajunta.', dur: 3.5 },
  { title: 'Inspektio', text: 'Muoto: vatsan turvotus voi viitata distaaliseen suolitukokseen tai askitekseen. Etsi leikkausarvet ja näkyvät tyrät.', dur: 3.5 },
  { title: 'Auskultaatio', text: 'Vilkkaat, metallisointiset, kireästi kurahtelevat tai loiskivat suoliäänet viittaavat usein mekaaniseen suolitukokseen.', dur: 3.5 },
  { title: 'Palpaatio – tärkein tutkimus', text: 'Koko vatsalla tuntuva arkuus, jännittyneet vatsanpeitteet ja lihassuoja (défense) viittaavat yleistyneeseen vatsakalvotulehdukseen. Voimakkaimman aristuksen ja lihassuojan paikallistuminen viittaa alueen elimen tulehdukseen – esimerkiksi umpilisäke oikealla alavatsalla (McBurneyn piste), sappirakko oikealla ylävatsalla.', dur: 6 },
  { title: 'Tyräportit ja resistenssit', text: 'Tunnustele nivuset, napa ja leikkausarvet (kureutunut tyrä – pieni reisityrä jää helposti huomaamatta). Kivulias pullistuma keskellä alavatsaa viittaa virtsarakon retentioon, pulsoiva resistenssi vatsa-aortan aneurysmaan.', dur: 4.5 },
  { title: 'Munuaisten koputusarkuus', text: 'Koputusarkuus viittaa pyelonefriittiin. Tunnustele myös nivuspulssit.', dur: 3.5 },
]

// palpation route through the four quadrants, ending at the right lower quadrant
const ROUTE: [number, number][] = [
  [118, 160],
  [118, 192],
  [84, 160],
  [84, 192],
  [84, 192],
]

export default function ExamAbdomen(_props: WidgetProps) {
  const durs = useMemo(() => STEPS.map((s) => s.dur ?? 3), [])
  const s = useStepper(STEPS.length, durs)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(1.2)
  useFrameLoop(ref, (dt) => setT((v) => v + dt))

  // palpating hand position
  const seg = (t * 0.9) % ROUTE.length
  const i0 = Math.floor(seg)
  const f = seg - i0
  const a = ROUTE[i0]
  const b = ROUTE[Math.min(ROUTE.length - 1, i0 + 1)]
  const handX = a[0] + (b[0] - a[0]) * Math.min(1, f * 2)
  const handY = a[1] + (b[1] - a[1]) * Math.min(1, f * 2)
  const pressing = f > 0.5
  const atPoint = i0 >= 3
  const pulse = 1 + 0.08 * Math.max(0, Math.sin(t * Math.PI * 2 * 1.2))
  const wave = (t * 1.2) % 1

  return (
    <div ref={ref}>
      <Stage>
        <svg viewBox="0 0 340 214" className="h-auto w-full" role="img" aria-label={`Vatsan tutkiminen: ${STEPS[s.i].title}`}>
          {/* posture inset */}
          <g transform="translate(6 120) scale(0.62)">
            <rect x={10} y={66} width={200} height={8} rx={3} fill={svg.raised} stroke={svg.line} />
            <SideFigure p={{ x: 120, y: 55, torso: -90, neck: 0, shoulder: 10, elbow: 10, hip: 45, knee: 90, ankle: 0 }} />
          </g>
          <text x={70} y={206} textAnchor="middle" fontSize={10.5} fill={s.i === 0 ? svg.brand : svg.dim}>
            polvet hieman koukussa
          </text>

          {/* abdomen close-up */}
          <g transform="translate(140 -96) scale(1.06)">
            <BodySilhouette view="front" />
            {/* quadrant guides */}
            <path d="M100 150V205M70 177H130" stroke={svg.line} strokeWidth={1} strokeDasharray="3 4" />

            {s.i === 1 && (
              <g>
                <path d="M80 140C76 150 76 196 80 206M120 140C124 150 124 196 120 206" fill="none" stroke={svg.brand} strokeWidth={1.6} strokeDasharray="4 3" />
                <path d="M110 190l14 12" stroke={svg.dim} strokeWidth={2} strokeLinecap="round" />
              </g>
            )}
            {s.i === 2 && (
              <g>
                <circle cx={104} cy={174} r={7} fill={svg.surface} stroke={svg.dim} strokeWidth={2} />
                {[0, 1, 2].map((n) => (
                  <path key={n} d={`M${114 + ((wave + n / 3) % 1) * 18} 166a10 10 0 0 1 0 16`} fill="none" stroke={svg.teal} strokeWidth={1.6} opacity={1 - ((wave + n / 3) % 1)} />
                ))}
              </g>
            )}
            {s.i === 3 && (
              <g>
                {atPoint && (
                  <g>
                    <circle cx={84} cy={192} r={12 * pulse} fill={svg.dangerSoft} stroke={svg.danger} strokeWidth={1.4} />
                    <path d="M70 186q4 -3 8 0q4 3 8 0q4 -3 8 0" fill="none" stroke={svg.danger} strokeWidth={1.4} />
                  </g>
                )}
                <ellipse cx={handX} cy={handY} rx={13} ry={9} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.6} transform={`translate(0 ${pressing ? 2 : -3})`} />
              </g>
            )}
            {s.i === 4 && (
              <g>
                {[
                  [80, 214],
                  [120, 214],
                  [100, 178],
                ].map(([x, y]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill="none" stroke={svg.brand} strokeWidth={1.8} />
                ))}
                <circle cx={100} cy={200} r={8} fill="none" stroke={svg.teal} strokeWidth={1.6} strokeDasharray="3 2" />
                <circle cx={100} cy={164} r={6 * pulse} fill={svg.dangerSoft} stroke={svg.danger} strokeWidth={1.4} />
              </g>
            )}
            {s.i === 5 && (
              <g>
                <ellipse cx={58} cy={160 + (Math.sin(t * Math.PI * 4) > 0 ? -3 : 0)} rx={8} ry={10} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.6} />
                <ellipse cx={142} cy={160} rx={6} ry={8} fill="none" stroke={svg.line} strokeWidth={1.4} strokeDasharray="3 3" />
              </g>
            )}
          </g>
          {s.i === 3 && atPoint && (
            <text x={8} y={22} fontSize={11} fontWeight={700} fill={svg.danger}>
              maksimiaristus + lihassuoja
            </text>
          )}
          {s.i === 4 && (
            <text x={8} y={22} fontSize={11} fill={svg.dim}>
              tyräportit · rakko · pulsoiva resistenssi
            </text>
          )}
          <text x={244} y={206} textAnchor="middle" fontSize={10.5} fill={svg.dim}>
            potilaan oikea ← → vasen
          </text>
        </svg>
      </Stage>
      <StepControls steps={STEPS} s={s} />
    </div>
  )
}
