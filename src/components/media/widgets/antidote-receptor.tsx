import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Stage, spring } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { StepControls, useStepper, useTween, type ExamStep } from '../parts/exam-kit'

/* Antidote at the receptor (articles Naloksoni, Flumatseniili, Intoksikaatiopotilaan hoito; Akuuttihoidon
 * lääkkeet 2025). The antidote displaces the agonist, the dose is titrated to adequate breathing, and the
 * antidote is eliminated before the drug – symptoms return. Molecules and breathing trace are schematic. */

type Mode = 'opioid' | 'benzo'

const RX = [64, 132, 200, 268]
const MEMBRANE_Y = 118

interface Step extends ExamStep {
  /** which molecule sits in each receptor: a = agonist, n = antidote, '' = empty */
  occ: ('a' | 'n' | '')[]
  breath: 0 | 1
  antidote: boolean
}

const STEPS: Record<Mode, Step[]> = {
  opioid: [
    { title: 'Opioidi reseptoreissa', text: 'Opioidi sitoutuu opioidireseptoreihin: pienet pupillit, harva hengitys, tajunnan lasku ja hypoksia. Ensin hengitystie ja ventilaatio – naloksoni annetaan ABCDE-hoidon ohella.', occ: ['a', 'a', 'a', 'a'], breath: 0, antidote: false, dur: 3.5 },
    { title: 'Naloksoni syrjäyttää opioidin', text: 'Naloksoni salpaa kaikkia kolmea opioidireseptorityyppiä ja työntää opioidin pois. Vaikutus alkaa 2–3 minuutissa.', occ: ['n', 'n', 'n', 'n'], breath: 1, antidote: true, dur: 3.5 },
    { title: 'Tavoite: riittävä hengitys', text: 'Annetaan pieninä erinä vasteen mukaan, kunnes hengitys ja tajunta riittävät. Liian voimakas kumoaminen laukaisee opioidiriippuvaiselle vakavat vieroitusoireet.', occ: ['n', 'n', 'a', 'a'], breath: 1, antidote: true, dur: 4 },
    { title: 'Naloksoni loppuu – opioidi ei', text: 'Naloksonin vaikutus kestää 20–90 minuuttia, usein lyhyemmän ajan kuin opioidin. Opioidi palaa reseptoreihin ja hengityslama uusiutuu – siksi potilas kuljetetaan aina valvontaan.', occ: ['a', 'a', 'a', 'a'], breath: 0, antidote: false, dur: 4.5 },
  ],
  benzo: [
    { title: 'Bentsodiatsepiini reseptoreissa', text: 'Bentsodiatsepiini vahvistaa GABA:n estävää vaikutusta: tajunta laskee, ja suurina annoksina ja yhdessä alkoholin tai opioidien kanssa hengitys lamaantuu.', occ: ['a', 'a', 'a', 'a'], breath: 0, antidote: false, dur: 3.5 },
    { title: 'Flumatseniili kilpailee reseptorista', text: 'Flumatseniili on kilpaileva vastavaikuttaja. 0,2 mg i.v. kerrallaan 1–2 minuutin välein – vaste tulee minuuteissa.', occ: ['n', 'n', 'n', 'n'], breath: 1, antidote: true, dur: 3.5 },
    { title: 'Vain kunnes hengitys riittää', text: 'Ei sekamyrkytyksessä: jos bentsodiatsepiini suojaa toisen aineen, kuten trisyklisen masennuslääkkeen, toksisuudelta, kumoaminen voi laukaista vaikean kouristelun.', occ: ['n', 'n', 'a', 'a'], breath: 1, antidote: true, dur: 4 },
    { title: 'Flumatseniili loppuu – oireet palaavat', text: 'Flumatseniili poistuu nopeammin kuin bentsodiatsepiinit: vaikutus kestää 20–120 minuuttia, ja tajunnan heikkeneminen ja hengityslama palaavat useimmiten 1–2 tunnissa.', occ: ['a', 'a', 'a', 'a'], breath: 0, antidote: false, dur: 4.5 },
  ],
}

const NAMES: Record<Mode, { a: string; n: string }> = {
  opioid: { a: 'opioidi', n: 'naloksoni' },
  benzo: { a: 'bentsodiatsepiini', n: 'flumatseniili' },
}

// free "parking" spots in the blood above the membrane
const FREE = [
  [40, 42],
  [102, 60],
  [170, 34],
  [236, 58],
  [300, 40],
  [150, 78],
] as const

function Agonist({ color }: { color: string }) {
  return (
    <g>
      <path d="M0 -11L9.5 -5.5L9.5 5.5L0 11L-9.5 5.5L-9.5 -5.5Z" fill={color} fillOpacity={0.28} stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M-4 9L0 15L4 9" fill={color} />
    </g>
  )
}

function Antidote() {
  return (
    <g>
      <rect x={-10} y={-10} width={20} height={20} rx={5} fill={svg.tealSoft} stroke={svg.teal} strokeWidth={1.8} />
      <rect x={-5} y={8} width={10} height={8} rx={2} fill={svg.teal} />
    </g>
  )
}

export default function AntidoteReceptor(props: WidgetProps) {
  const [mode, setMode] = useState<Mode>(props.initial === 'benzo' ? 'benzo' : 'opioid')
  const steps = STEPS[mode]
  const durs = useMemo(() => steps.map((s) => s.dur ?? 3), [steps])
  const s = useStepper(steps.length, durs)
  const step = steps[s.i]
  const names = NAMES[mode]
  const agonistColor = mode === 'opioid' ? '#e0674a' : '#8b5cf6'

  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 600))
  const br = useTween({ amp: step.breath ? 15 : 5, cyc: step.breath ? 3.2 : 1.3 }, 1.2)

  // place molecules: agonists 0..3, antidotes 0..3
  const agonistInRx = step.occ.map((o) => o === 'a')
  let freeSlot = 0
  const agonists = RX.map((x, i) => {
    if (agonistInRx[i]) return { x, y: MEMBRANE_Y - 14, free: false }
    const p = FREE[freeSlot++ % FREE.length]
    return { x: p[0], y: p[1], free: true }
  })
  const antidotes = RX.map((x, i) => {
    if (step.occ[i] === 'n') return { x, y: MEMBRANE_Y - 13, on: true, free: false }
    return { x: 300 + i * 6, y: 24, on: false, free: true }
  })

  // breathing trace
  const trace = useMemo(() => {
    const pts: string[] = []
    for (let x = 0; x <= 280; x += 4) {
      const y = 193 - br.amp * Math.sin((x / 280) * br.cyc * Math.PI * 2 - t * br.cyc * 1.6)
      pts.push(`${x === 0 ? 'M' : 'L'}${(30 + x).toFixed(1)} ${y.toFixed(1)}`)
    }
    return pts.join('')
  }, [t, br.amp, br.cyc])

  return (
    <div ref={ref}>
      <Segmented
        layoutId="antidote-mode"
        size="sm"
        value={mode}
        onChange={(v) => {
          setMode(v)
          s.go(0)
        }}
        options={[
          { value: 'opioid', label: 'Opioidi + naloksoni' },
          { value: 'benzo', label: 'Bentsodiatsepiini + flumatseniili' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 340 224" className="h-auto w-full" role="img" aria-label={`${step.title}. Hengitys: ${step.breath ? 'riittävä' : 'lamaantunut'}.`}>
          <text x={10} y={16} fontSize={10.5} fill={svg.dim}>
            verenkierto
          </text>
          {/* membrane with receptors */}
          <rect x={10} y={MEMBRANE_Y} width={320} height={14} rx={4} fill={svg.raised} stroke={svg.line} />
          {RX.map((x) => (
            <path key={x} d={`M${x - 15} ${MEMBRANE_Y + 1}C${x - 15} ${MEMBRANE_Y - 9} ${x - 8} ${MEMBRANE_Y + 5} ${x} ${MEMBRANE_Y + 5}C${x + 8} ${MEMBRANE_Y + 5} ${x + 15} ${MEMBRANE_Y - 9} ${x + 15} ${MEMBRANE_Y + 1}Z`} fill={svg.surface} stroke={svg.dim} strokeWidth={1.4} />
          ))}
          <text x={10} y={MEMBRANE_Y + 28} fontSize={10.5} fill={svg.dim}>
            hermosolun reseptorit
          </text>

          {agonists.map((p, i) => (
            <motion.g key={`a${i}`} initial={false} animate={{ x: p.x, y: p.y }} transition={spring}>
              <g transform={p.free ? `translate(${(Math.sin(t * 1.3 + i * 1.7) * 5).toFixed(1)} ${(Math.cos(t * 1.1 + i) * 4).toFixed(1)})` : undefined}>
                <Agonist color={agonistColor} />
              </g>
            </motion.g>
          ))}
          {antidotes.map((p, i) => (
            <motion.g key={`n${i}`} initial={false} animate={{ x: p.x, y: p.y, opacity: p.on ? 1 : 0 }} transition={spring}>
              <Antidote />
            </motion.g>
          ))}

          {/* legend */}
          <g transform="translate(206 146)">
            <g transform="translate(8 0) scale(0.6)">
              <Agonist color={agonistColor} />
            </g>
            <text x={20} y={4} fontSize={10.5} fill={svg.ink}>
              {names.a}
            </text>
          </g>
          <g transform="translate(206 162)">
            <g transform="translate(8 0) scale(0.6)">
              <Antidote />
            </g>
            <text x={20} y={4} fontSize={10.5} fill={svg.ink}>
              {names.n}
            </text>
          </g>

          {/* breathing */}
          <text x={10} y={158} fontSize={10.5} fontWeight={600} fill={step.breath ? svg.teal : svg.danger}>
            hengitys: {step.breath ? 'riittää' : 'lamaantunut'}
          </text>
          <path d={trace} fill="none" stroke={step.breath ? svg.teal : svg.danger} strokeWidth={2.2} strokeLinecap="round" />
          <text x={170} y={219} textAnchor="middle" fontSize={10} fill={svg.dim}>
            kaavamainen – aika tiivistetty
          </text>
        </svg>
      </Stage>
      <StepControls steps={steps} s={s} />
    </div>
  )
}
