import { useEffect, useMemo, useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { FIG, SideFigure, StepControls, useNystagmus, useStepper, useTween, type ExamStep, type SidePose } from '../parts/exam-kit'

/* Dix–Hallpike test and the horizontal-canal test (article Huimaus; Lääkärin käsikirja BPPV 2026,
 * Akuuttihoito-opas Akuutti huimaus 2025). Side view of the patient on the examination table,
 * a top-view inset for the head turn and an eye inset for the nystagmus. Time is compressed. */

type Mode = 'dh' | 'hc'

const SIT: SidePose = { x: 238, y: 142, torso: 0, neck: 0, shoulder: 12, elbow: 18, hip: 90, knee: 0, ankle: -70 }
const LIE: SidePose = { x: 238, y: 139, torso: -90, neck: -20, shoulder: 8, elbow: 6, hip: 0, knee: 0, ankle: -70 }
const LIE_FLEX: SidePose = { ...LIE, x: 266, neck: 30 }

interface Frame {
  pose: SidePose
  yaw: number
  nys: 'none' | 'beat' | 'reverse' | 'geo'
}

const DH_STEPS: (ExamStep & Frame)[] = [
  { title: 'Valmistelu', text: 'Kerro potilaalle testin vaiheet ja varmista, ettei niskan vamma tai muu tukirankaperäinen vaiva estä testiä. Potilas istuu tutkimuspöydällä.', pose: SIT, yaw: 0, nys: 'none', dur: 3 },
  { title: 'Pää 45° tutkittavaa puolta kohti', text: 'Tutkija kääntää istuvan potilaan päätä 45 astetta tutkittavalle puolelle.', pose: SIT, yaw: 45, nys: 'none', dur: 2.6 },
  { title: 'Nopeasti selinmakuulle', text: 'Tutkija kannattelee päätä ja ohjaa potilaan nopeasti selälleen pää pöydän päädyn yli: niskan linja noin 20° vaakatason alapuolelle, pää yhä 45° kierrossa.', pose: LIE, yaw: 45, nys: 'none', dur: 3 },
  { title: 'Tarkkaile silmiä', text: 'Nystagmus tulee noin 5–20 sekunnin viiveellä, lyö enemmän sairaaseen korvaan päin ja väsyy; huimaus ja nystagmus loppuvat yleensä minuutin kuluessa. Frenzelin lasit auttavat näkemään hennonkin värveen. Kysy samalla huimauksesta.', pose: LIE, yaw: 45, nys: 'beat', dur: 6 },
  { title: 'Takaisin istumaan', text: 'Noustessa istumaan näkyy usein käänteinen, kiertävä nystagmus, joka lyö alaspäin terveeseen korvaan päin – se tukee takimmaisen kaarikäytävän asentohuimausta.', pose: SIT, yaw: 45, nys: 'reverse', dur: 4 },
  { title: 'Toinen puoli', text: 'Sama tehdään toiselle puolelle. Kun potilas kuvaa toistuvia, asennon muutoksiin liittyviä kiertohuimauskohtauksia ja koe on positiivinen, kyse on takimmaisen kaarikäytävän hyvänlaatuisesta asentohuimauksesta.', pose: SIT, yaw: -45, nys: 'none', dur: 3 },
]

const HC_STEPS: (ExamStep & Frame)[] = [
  { title: 'Makuulle, pää koukkuun', text: 'Potilas makaa selällään pää noin 30° fleksiossa.', pose: LIE_FLEX, yaw: 0, nys: 'none', dur: 2.6 },
  { title: 'Pää sivulle', text: 'Potilas kääntää päänsä sivulle. Lyhyellä viiveellä ilmaantuu yleensä geotrooppinen eli alaspäin lyövä nystagmus.', pose: LIE_FLEX, yaw: 80, nys: 'geo', dur: 4.5 },
  { title: 'Pää toiselle sivulle', text: 'Sama toiselle puolelle. Nystagmus on voimakkaampi sairaalta puolelta – kyse on horisontaalisen kaarikäytävän asentohuimauksesta.', pose: LIE_FLEX, yaw: -80, nys: 'geo', dur: 4.5 },
]

export default function ExamDixHallpike(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('dh')
  const steps = mode === 'dh' ? DH_STEPS : HC_STEPS
  const durs = useMemo(() => steps.map((s) => s.dur ?? 3), [steps])
  const s = useStepper(steps.length, durs)
  const f = steps[s.i]
  const ref = useRef<HTMLDivElement>(null)

  const pose = useTween(f.pose as unknown as Record<string, number>, 0.9) as unknown as SidePose
  const yaw = useTween({ yaw: f.yaw }, 0.6).yaw

  // nystagmus starts after a (compressed) latency and fades
  const [nysOn, setNysOn] = useState(false)
  useEffect(() => {
    setNysOn(false)
    if (f.nys === 'none') return
    const t1 = setTimeout(() => setNysOn(true), f.nys === 'beat' ? 1600 : 500)
    const t2 = setTimeout(() => setNysOn(false), f.nys === 'beat' ? 5600 : 3800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [f, mode])
  const amp = f.nys === 'reverse' ? 0.6 : 1
  const nx = useNystagmus(ref, nysOn, amp, f.nys === 'reverse' ? -1 : 1, 2.4)
  const vertical = f.nys === 'geo'
  const latency = f.nys === 'beat' && !nysOn

  return (
    <div ref={ref}>
      <Segmented
        layoutId="dh-mode"
        value={mode}
        onChange={(v) => {
          setMode(v)
          s.go(0)
        }}
        options={[
          { value: 'dh', label: 'Dix–Hallpike' },
          { value: 'hc', label: 'Vaakakaarikäytävä' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 340 214" className="h-auto w-full" role="img" aria-label={`${f.title}. ${f.text}`}>
          {/* table */}
          <rect x={176} y={150} width={154} height={10} rx={3} fill={svg.raised} stroke={svg.line} strokeWidth={1.4} />
          <path d="M190 160V206M316 160V206" stroke={svg.line} strokeWidth={4} strokeLinecap="round" />
          <SideFigure
            p={pose}
            headExtra={
              <g opacity={pose.torso < -40 ? 1 : 0.85}>
                <ellipse cx={-6} cy={-78} rx={6} ry={9} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.4} />
              </g>
            }
          />
          {/* horizontal reference when lying */}
          {pose.torso < -60 && mode === 'dh' && <path d="M176 128H120" stroke={svg.dim} strokeWidth={1} strokeDasharray="3 4" />}

          {/* top-view inset: head turn */}
          <g transform="translate(46 50)">
            <circle r={30} fill={svg.surface} stroke={svg.line} strokeWidth={1.4} />
            <text y={-36} textAnchor="middle" fontSize={11} fill={svg.dim}>
              pää ylhäältä
            </text>
            <g transform={`rotate(${yaw})`}>
              <ellipse rx={15} ry={17} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
              <path d="M-4 -16L0 -23L4 -16" fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} strokeLinejoin="round" />
              <ellipse cx={-15} cy={0} rx={2.5} ry={5} fill={FIG.fill} stroke={FIG.line} />
              <ellipse cx={15} cy={0} rx={2.5} ry={5} fill={FIG.fill} stroke={FIG.line} />
            </g>
            <text y={46} textAnchor="middle" fontSize={11} fontWeight={600} fill={svg.ink}>
              {mode === 'hc' ? (Math.abs(yaw) > 5 ? 'sivulle' : 'suoraan') : `${Math.round(Math.abs(yaw))}°`}
            </text>
          </g>

          {/* eye inset */}
          <g transform="translate(46 170)">
            <ellipse rx={28} ry={13} fill={svg.surface} stroke={svg.dim} strokeWidth={1.4} />
            <circle cx={vertical ? 0 : nx * 9} cy={vertical ? nx * 5 : 0} r={7} fill={svg.ink} />
            {nysOn && (
              <text x={36} y={4} fontSize={11} fontWeight={700} fill={svg.brand}>
                {f.nys === 'reverse' ? 'käänteinen' : f.nys === 'geo' ? 'geotrooppinen' : 'nystagmus'}
              </text>
            )}
            {latency && (
              <text x={36} y={4} fontSize={11} fontWeight={700} fill={svg.dim}>
                viive…
              </text>
            )}
          </g>
        </svg>
      </Stage>
      <StepControls steps={steps} s={s} />
    </div>
  )
}
