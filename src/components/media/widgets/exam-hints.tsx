import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { Result, Segmented, svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { FIG, Face } from '../parts/exam-kit'

/* HINTS (article Huimaus; Lääkärin käsikirja Huimaus 2025): head impulse test, nystagmus
 * and vertical skew. Schematic; time is slowed down so the corrective saccade is visible. */

type Tab = 'impulse' | 'nys' | 'skew'

function HeadImpulse() {
  const [abnormal, setAbnormal] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0.9)
  const running = useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 2.8))

  // head: quick turn, hold, slow return
  const head = t < 0.18 ? (t / 0.18) * 22 : t < 1.7 ? 22 : t < 2.3 ? 22 * (1 - (t - 1.7) / 0.6) : 0
  // eye-in-head: a healthy reflex counter-rotates at once; a failing one catches up late
  const sacc = t < 0.55 ? 0 : t < 0.63 ? (t - 0.55) / 0.08 : 1
  const eyeInHead = abnormal ? -head * (t < 1.7 ? sacc : 1) : -head
  const gaze = head + eyeInHead
  const off = Math.abs(gaze) > 1.5
  const C = { x: 160, y: 132 }

  const eye = (dx: number) => {
    const a = ((head - 90) * Math.PI) / 180
    const ex = C.x + dx * Math.cos(a + Math.PI / 2) + 30 * Math.cos(a)
    const ey = C.y + dx * Math.sin(a + Math.PI / 2) + 30 * Math.sin(a)
    const g = ((gaze - 90) * Math.PI) / 180
    return (
      <g key={dx}>
        <path d={`M${ex} ${ey}L${ex + 120 * Math.cos(g)} ${ey + 120 * Math.sin(g)}`} stroke={off ? svg.danger : svg.teal} strokeWidth={1.4} strokeDasharray="4 4" />
        <circle cx={ex} cy={ey} r={5} fill={svg.surface} stroke={svg.dim} strokeWidth={1.2} />
        <circle cx={ex + 2.4 * Math.cos(g)} cy={ey + 2.4 * Math.sin(g)} r={2.4} fill={svg.ink} />
      </g>
    )
  }

  return (
    <div ref={ref}>
      <Segmented
        layoutId="hit-res"
        size="sm"
        value={abnormal ? 'ab' : 'n'}
        onChange={(v) => setAbnormal(v === 'ab')}
        options={[
          { value: 'n', label: 'Katse pysyy' },
          { value: 'ab', label: 'Korjausliike' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label={abnormal ? 'Pään nykäisyssä katse lähtee pään mukana ja palaa korjausliikkeellä' : 'Pään nykäisyssä katse pysyy kohteessa'}>
          <circle cx={C.x} cy={14} r={5} fill={svg.brand} />
          <text x={C.x - 12} y={18} textAnchor="end" fontSize={10.5} fill={svg.dim}>
            katsekohde (tutkijan nenä)
          </text>
          <g transform={`rotate(${head} ${C.x} ${C.y})`}>
            <ellipse cx={C.x} cy={C.y} rx={36} ry={42} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.4} />
            <path d={`M${C.x - 5} ${C.y - 41}L${C.x} ${C.y - 50}L${C.x + 5} ${C.y - 41}`} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} strokeLinejoin="round" />
            {/* examiner's hands */}
            <ellipse cx={C.x - 40} cy={C.y} rx={8} ry={16} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.4} />
            <ellipse cx={C.x + 40} cy={C.y} rx={8} ry={16} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.4} />
          </g>
          {eye(-11)}
          {eye(11)}
          {!running && <text x={C.x} y={194} textAnchor="middle" fontSize={11} fill={svg.dim}>pysäytyskuva</text>}
        </svg>
      </Stage>
      <div className="mt-3">
        <Result tone={abnormal ? 'ok' : 'danger'} title={abnormal ? 'Korjausliike → sisäkorvaperäinen syy' : 'Normaali pään nykäisykoe huimaavalla potilaalla'}>
          {abnormal
            ? 'Kun päätä nykäistään äkisti sairaalle puolelle, katse ei seuraa kohdetta vaan palaa siihen viiveellä tulevalla korjausliikkeellä – horisontaalisen kaarikäytävän toiminnanvajaus.'
            : 'Katse pysyy kohteessa. Äkillisesti huimaavalla, nystagmusta tuottavalla potilaalla normaali pään nykäisykoe viittaa aivoverenkiertohäiriöön.'}
        </Result>
      </div>
    </div>
  )
}

function Nystagmus() {
  const [kind, setKind] = useState<'peripheral' | 'central'>('central')
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0.4)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 6))
  const look = t < 3 ? -1 : 1 // patient looks left, then right
  const beat = (t * 2.5) % 1
  const jerk = beat < 0.8 ? beat / 0.8 : 1 - (beat - 0.8) / 0.2 // 0→1 slow drift, 1→0 fast phase
  // fast phase toward `fast`: drift is the opposite way
  const fast = kind === 'central' ? look : 1
  const gaze = look * 0.9 - fast * (jerk - 0.5) * 0.7
  return (
    <div ref={ref}>
      <Segmented
        layoutId="nys-kind"
        size="sm"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'peripheral', label: 'Yhteen suuntaan' },
          { value: 'central', label: 'Suuntaa vaihtava' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 320 170" className="h-auto w-full" role="img" aria-label="Nystagmus katseen suunnan mukaan">
          <Face cx={160} cy={84} r={62} gaze={gaze} />
          <text x={160} y={164} textAnchor="middle" fontSize={11} fill={svg.dim}>
            katse {look < 0 ? 'vasemmalle' : 'oikealle'} – nopea vaihe {fast < 0 ? 'vasemmalle' : 'oikealle'}
          </text>
        </svg>
      </Stage>
      <div className="mt-3">
        <Result tone={kind === 'central' ? 'danger' : 'ok'} title={kind === 'central' ? 'Katseen suuntaan lyövä, suuntaa vaihtava nystagmus' : 'Nystagmus lyö aina samaan suuntaan'}>
          {kind === 'central'
            ? 'Viittaa aivoverenkiertohäiriöön. Myös pystysuuntainen nystagmus on yleensä merkki aivorungon alueen häiriöstä.'
            : 'Esimerkiksi vestibulaarineuriitissa spontaani nystagmus lyö terveeseen korvaan päin katseen suunnasta riippumatta.'}
        </Result>
      </div>
    </div>
  )
}

function Skew() {
  const [skew, setSkew] = useState(true)
  return (
    <div>
      <Segmented
        layoutId="skew"
        size="sm"
        value={skew ? 's' : 'n'}
        onChange={(v) => setSkew(v === 's')}
        options={[
          { value: 'n', label: 'Silmät linjassa' },
          { value: 's', label: 'Pystypoikkeama' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 320 170" className="h-auto w-full" role="img" aria-label={skew ? 'Silmät eri korkeudella' : 'Silmät samalla korkeudella'}>
          <Face cx={160} cy={84} r={62} gazeR={{ dy: skew ? -6 : 0 }} />
          {skew && <path d="M196 70H232M196 64H232" stroke={svg.danger} strokeWidth={1.2} strokeDasharray="3 3" />}
        </svg>
      </Stage>
      <div className="mt-3">
        <Result tone={skew ? 'danger' : 'neutral'} title={skew ? 'Katseen vertikaalinen dyskonjugaatio' : 'Ei pystypoikkeamaa'}>
          {skew ? 'Silmien pystysuuntainen yhteisliikkeen häiriö viittaa aivoverenkiertohäiriöön.' : 'Silmät liikkuvat yhdessä samalla tasolla.'}
        </Result>
      </div>
    </div>
  )
}

export default function ExamHints(_props: WidgetProps) {
  const [tab, setTab] = useState<Tab>('impulse')
  return (
    <div>
      <Segmented
        layoutId="hints-tab"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'impulse', label: 'Pään nykäisy' },
          { value: 'nys', label: 'Nystagmus' },
          { value: 'skew', label: 'Pystypoikkeama' },
        ]}
      />
      <p className="mt-2 text-[12px] leading-snug text-[var(--text-dim)]">
        HINTS on tarkoitettu tutkimushetkellä oireiselle potilaalle, jolla on nystagmus ja äkillisesti alkanut huimaus. Se erottaa aivoperäisen syyn tasapainoelimen häiriöstä.
      </p>
      <div className="mt-3">{tab === 'impulse' ? <HeadImpulse /> : tab === 'nys' ? <Nystagmus /> : <Skew />}</div>
    </div>
  )
}
