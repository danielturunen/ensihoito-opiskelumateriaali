import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { FIG } from '../parts/exam-kit'

/* Key muscles of the spinal segments and muscle power grading (article Selkäranka- ja
 * selkäydinvamma; European Trauma Course, ASIA chart). Each level animates its movement;
 * the grade changes how much of the movement is achieved. Diagrams are schematic. */

type Level = 'C5' | 'C6' | 'C7' | 'C8' | 'T1' | 'L2' | 'L3' | 'L4' | 'L5' | 'S1'

interface Joint {
  name: string
  /** fixed segment: from → joint */
  from: [number, number]
  joint: [number, number]
  len: number
  rest: number
  active: number
  end?: 'hand' | 'foot' | 'none'
}

const LEVELS: Record<Level, Joint> = {
  C5: { name: 'Kyynärnivelen koukistus', from: [150, 30], joint: [150, 100], len: 62, rest: 90, active: -35, end: 'hand' },
  C6: { name: 'Ranteen ojennus', from: [70, 104], joint: [170, 104], len: 40, rest: 0, active: -55, end: 'hand' },
  C7: { name: 'Kyynärnivelen ojennus', from: [150, 30], joint: [150, 100], len: 62, rest: -35, active: 88, end: 'hand' },
  C8: { name: 'Sormien koukistus', from: [90, 104], joint: [180, 104], len: 26, rest: 0, active: 80, end: 'none' },
  T1: { name: 'Pikkusormen loitonnus', from: [0, 0], joint: [0, 0], len: 0, rest: 0, active: 0, end: 'none' },
  L2: { name: 'Lonkan koukistus', from: [40, 150], joint: [130, 150], len: 120, rest: 0, active: -38, end: 'foot' },
  L3: { name: 'Polven ojennus', from: [60, 96], joint: [150, 96], len: 70, rest: 90, active: 8, end: 'foot' },
  L4: { name: 'Nilkan koukistus ylöspäin (dorsifleksio)', from: [140, 20], joint: [140, 128], len: 48, rest: 0, active: -24, end: 'none' },
  L5: { name: 'Varpaiden pitkät ojentajat', from: [70, 140], joint: [160, 140], len: 20, rest: 0, active: -40, end: 'none' },
  S1: { name: 'Nilkan koukistus alaspäin (plantaarifleksio)', from: [140, 20], joint: [140, 128], len: 48, rest: 0, active: 34, end: 'none' },
}

const GRADES: { n: number; text: string }[] = [
  { n: 0, text: 'Täydellinen halvaus' },
  { n: 1, text: 'Tunnusteltava tai näkyvä supistus' },
  { n: 2, text: 'Aktiivinen liike, kun painovoima on eliminoitu' },
  { n: 3, text: 'Aktiivinen liike painovoimaa vastaan' },
  { n: 4, text: 'Liike jonkin verran vastusta vastaan' },
  { n: 5, text: 'Liike täyttä vastusta vastaan' },
]

const pt = (o: [number, number], len: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180
  return [o[0] + len * Math.cos(a), o[1] + len * Math.sin(a)]
}

function Diagram({ level, k, grade, twitch }: { level: Level; k: number; grade: number; twitch: number }) {
  if (level === 'T1') {
    const spread = 22 * k
    return (
      <g transform="translate(-40 -8)">
        <rect x={126} y={170} width={48} height={36} rx={10} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
        <rect x={110} y={100} width={80} height={80} rx={18} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.4} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={116 + i * 20} y={36} width={14} height={68} rx={7} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
        ))}
        <g transform={`rotate(${spread} 183 104)`}>
          <rect x={176} y={50} width={13} height={56} rx={6.5} fill={FIG.fill} stroke={grade > 0 ? svg.teal : FIG.line} strokeWidth={1.6} />
        </g>
        {grade >= 4 && <ellipse cx={204 + spread * 0.9} cy={72} rx={7} ry={11} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.4} />}
      </g>
    )
  }
  const j = LEVELS[level]
  const ang = j.rest + (j.active - j.rest) * k + twitch
  const tip = pt(j.joint, j.len, ang)
  const thick = level === 'C8' || level === 'L5' ? 9 : 12
  return (
    <g>
      <path d={`M${j.from[0]} ${j.from[1]}L${j.joint[0]} ${j.joint[1]}`} stroke={FIG.fill} strokeWidth={thick + 2} strokeLinecap="round" />
      <path d={`M${j.joint[0]} ${j.joint[1]}L${tip[0]} ${tip[1]}`} stroke={grade > 0 ? 'color-mix(in srgb, #0fb8ac 45%, var(--bg-raised))' : FIG.fill} strokeWidth={thick} strokeLinecap="round" />
      <circle cx={j.joint[0]} cy={j.joint[1]} r={thick / 2 + 1} fill={svg.surface} stroke={svg.dim} strokeWidth={1.2} />
      {(level === 'L4' || level === 'S1') && (
        <path d={`M${j.joint[0]} ${j.joint[1]}L${pt(j.joint, 16, ang + 180)[0]} ${pt(j.joint, 16, ang + 180)[1]}`} stroke={grade > 0 ? 'color-mix(in srgb, #0fb8ac 45%, var(--bg-raised))' : FIG.fill} strokeWidth={thick} strokeLinecap="round" />
      )}
      {j.end === 'hand' && <circle cx={tip[0]} cy={tip[1]} r={9} fill={FIG.fill} stroke={FIG.line} />}
      {j.end === 'foot' && <path d={`M${tip[0]} ${tip[1]}L${pt(tip, 18, ang - 90)[0]} ${pt(tip, 18, ang - 90)[1]}`} stroke={FIG.fill} strokeWidth={9} strokeLinecap="round" />}
      {grade >= 4 && (
        <ellipse cx={pt(j.joint, j.len * 0.82, ang - 8)[0]} cy={pt(j.joint, j.len * 0.82, ang - 8)[1]} rx={9} ry={7} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.4} />
      )}
    </g>
  )
}

export default function ExamMyotomes(_props: WidgetProps) {
  const [level, setLevel] = useState<Level>('C5')
  const [grade, setGrade] = useState(5)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(1.2)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 3.2))
  const phase = t < 0.3 ? 0 : t < 1.2 ? (t - 0.3) / 0.9 : t < 2.2 ? 1 : t < 3 ? 1 - (t - 2.2) / 0.8 : 0
  const e = phase < 0.5 ? 2 * phase * phase : 1 - Math.pow(-2 * phase + 2, 2) / 2
  const amp = grade === 0 ? 0 : grade === 1 ? 0 : grade === 2 ? 0.45 : 1
  const twitch = grade === 1 && t > 0.4 && t < 1.4 ? Math.sin(t * 40) * 1.5 : 0
  const j = LEVELS[level]

  return (
    <div ref={ref}>
      <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Selkäydinsegmentti">
        {(Object.keys(LEVELS) as Level[]).map((l) => (
          <button
            key={l}
            role="radio"
            aria-checked={level === l}
            onClick={() => setLevel(l)}
            className={`min-h-[44px] rounded-xl border font-display text-[14px] font-semibold transition-[background-color,border-color] duration-150 ${
              level === l ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <p className="mt-2 font-display text-[15px] font-semibold text-[var(--text)]">
        {level}: {j.name}
      </p>
      <Stage className="mt-2">
        <svg viewBox="0 0 300 200" className="h-auto w-full" role="img" aria-label={`${level}: ${j.name}, voima ${grade}`}>
          <Diagram level={level} k={e * amp} grade={grade} twitch={twitch} />
          {(grade === 1 || grade === 2 || grade >= 4) && (
            <text x={292} y={192} textAnchor="end" fontSize={11} fill={svg.dim}>
              {grade === 1 ? 'vain supistus, ei liikettä' : grade === 2 ? 'liike vain painovoima poistettuna' : 'tutkijan käsi antaa vastusta'}
            </text>
          )}
        </svg>
      </Stage>
      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] font-semibold text-[var(--text)]">Lihasvoima</span>
          <span className="font-display text-[18px] font-bold tabular-nums text-[var(--text)]">{grade}</span>
        </div>
        <div className="mt-1 grid grid-cols-6 gap-1">
          {GRADES.map((g) => (
            <button
              key={g.n}
              onClick={() => setGrade(g.n)}
              aria-pressed={grade === g.n}
              className={`min-h-[44px] rounded-lg border font-display text-[14px] font-semibold ${grade === g.n ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'}`}
            >
              {g.n}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[13px] text-[var(--text)]">{GRADES[grade].text}</p>
      </div>
      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-3 text-[12.5px] leading-snug text-[var(--text)]">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Heijasteet ja tunto</p>
        <p>Hauis C5–C6 · ojentaja C7–C8 · polvi L3–L4 · nilkka S1–S2.</p>
        <p className="mt-1">Tuntotaso on alin dermatomi, jossa tunto on normaali. Tunto peräaukon ympärillä voi olla ensimmäinen merkki epätäydellisestä selkäydinvammasta.</p>
      </div>
    </div>
  )
}
