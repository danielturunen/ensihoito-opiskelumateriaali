import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { Result, Segmented, svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { Face, SideFigure, type SidePose } from '../parts/exam-kit'

/* Stroke quick exam (article Aivoverenkiertohäiriö; Ensihoito-opas): face, arms, speech, leg
 * and gaze. Each test loops; time is compressed (the 10 s / 5 s holds run faster). */

type Test = 'face' | 'arms' | 'speech' | 'leg' | 'gaze'

const INFO: Record<Test, { cue: string; normal: string; abnormal: string }> = {
  face: { cue: '"Irvistäkää."', normal: 'Suupielet nousevat symmetrisesti.', abnormal: 'Toinen suupieli roikkuu.' },
  arms: { cue: 'Kädet ylös 10 sekunnin ajaksi – istuen 90°, makuulla 45°. Tarkista myös puristusvoima.', normal: 'Kädet pysyvät ylhäällä.', abnormal: 'Toinen yläraaja painuu.' },
  speech: { cue: '"Sanokaa: Mustan kissan paksut posket."', normal: 'Puhe on selkeää ja sujuvaa.', abnormal: 'Puheentuotto on häiriintynyt.' },
  leg: { cue: 'Makuulla jalka suorana 30° kulmaan 5 sekunnin ajaksi.', normal: 'Jalka pysyy ylhäällä.', abnormal: 'Alaraaja painuu.' },
  gaze: { cue: 'Katso silmien asentoa.', normal: 'Katse keskellä, silmät liikkuvat yhdessä.', abnormal: 'Katsedeviaatio: silmät kääntyneet sivulle.' },
}

function Scene({ test, abn, t }: { test: Test; abn: boolean; t: number }) {
  if (test === 'face' || test === 'gaze') {
    const smile = test === 'face' ? Math.min(1, Math.max(0, (t - 0.6) / 0.5)) * (t < 3.4 ? 1 : Math.max(0, 1 - (t - 3.4) / 0.4)) : 0
    return <Face cx={160} cy={92} r={64} smile={smile} droop={test === 'face' && abn ? 1 : 0} gaze={test === 'gaze' && abn ? -0.95 : 0} />
  }
  if (test === 'speech') {
    const words = ['Mustan', 'kissan', 'paksut', 'posket.']
    const slurred = ['Mussan', 'kih…', 'pa…', '…ke']
    const shown = Math.min(4, Math.floor(t / 0.7))
    return (
      <g>
        <Face cx={92} cy={96} r={52} smile={0.15} />
        <path d="M150 52h140a14 14 0 0 1 14 14v52a14 14 0 0 1 -14 14h-112l-20 18v-18h-8a14 14 0 0 1 -14 -14v-52a14 14 0 0 1 14 -14z" fill={svg.surface} stroke={svg.line} strokeWidth={1.4} />
        <text x={226} y={98} textAnchor="middle" fontSize={15} fontWeight={600} fill={abn ? svg.danger : svg.ink} style={{ filter: abn ? 'blur(0.6px)' : undefined }}>
          {(abn ? slurred : words).slice(0, shown).join(' ')}
        </text>
      </g>
    )
  }
  if (test === 'arms') {
    const hold = t > 0.6 && t < 4.4
    const up = Math.min(1, Math.max(0, (t - 0.2) / 0.5))
    const drift = abn && hold ? Math.min(1, (t - 1.4) / 2.6) : 0
    const down = t > 4.4 ? Math.min(1, (t - 4.4) / 0.5) : 0
    const near = 90 * up * (1 - down) - 48 * Math.max(0, drift) * (1 - down)
    const far = 90 * up * (1 - down)
    const p: SidePose = { x: 150, y: 150, torso: 0, neck: 0, shoulder: near, elbow: 0, hip: 90, knee: 90, ankle: 0, shoulderFar: far, elbowFar: 0 }
    return (
      <g>
        <rect x={120} y={150} width={56} height={8} rx={3} fill={svg.raised} stroke={svg.line} />
        <path d="M128 158V200M168 158V200M128 150V112" stroke={svg.line} strokeWidth={4} strokeLinecap="round" />
        <SideFigure p={p} />
        {hold && (
          <text x={250} y={40} textAnchor="middle" fontSize={13} fontWeight={700} fill={svg.brand}>
            {Math.min(10, Math.max(1, Math.round(((t - 0.6) / 3.8) * 10)))} s
          </text>
        )}
      </g>
    )
  }
  // leg
  const hold = t > 0.6 && t < 3.6
  const up = Math.min(1, Math.max(0, (t - 0.1) / 0.5))
  const down = t > 3.6 ? Math.min(1, (t - 3.6) / 0.5) : 0
  const drift = abn && hold ? Math.min(1, (t - 1.2) / 2.2) : 0
  const hip = 30 * up * (1 - down) - 26 * Math.max(0, drift) * (1 - down)
  const p: SidePose = { x: 176, y: 150, torso: -90, neck: 0, shoulder: 6, elbow: 6, hip, knee: 0, ankle: -70, hipFar: 0, kneeFar: 0 }
  return (
    <g>
      <rect x={70} y={161} width={220} height={8} rx={3} fill={svg.raised} stroke={svg.line} />
      <SideFigure p={{ ...p, y: 150 }} />
      <path d="M176 150L270 150M176 150L257 103" stroke={svg.dim} strokeWidth={1} strokeDasharray="3 4" />
      <text x={262} y={104} fontSize={11} fill={svg.dim}>
        30°
      </text>
      {hold && (
        <text x={250} y={40} textAnchor="middle" fontSize={13} fontWeight={700} fill={svg.brand}>
          {Math.min(5, Math.max(1, Math.round(((t - 0.6) / 3) * 5)))} s
        </text>
      )}
    </g>
  )
}

export default function ExamStroke(_props: WidgetProps) {
  const [test, setTest] = useState<Test>('arms')
  const [abn, setAbn] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(2.6)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 5.4))
  const info = INFO[test]
  return (
    <div ref={ref}>
      <Segmented
        layoutId="stroke-test"
        size="sm"
        wrap
        value={test}
        onChange={(v) => {
          setTest(v)
          setT(0)
        }}
        options={[
          { value: 'face', label: 'Suupieli' },
          { value: 'arms', label: 'Yläraajat' },
          { value: 'speech', label: 'Puhe' },
          { value: 'leg', label: 'Alaraaja' },
          { value: 'gaze', label: 'Katse' },
        ]}
      />
      <div className="mt-2">
        <Segmented
          layoutId="stroke-abn"
          size="sm"
          value={abn ? 'ab' : 'n'}
          onChange={(v) => setAbn(v === 'ab')}
          options={[
            { value: 'n', label: 'Normaali' },
            { value: 'ab', label: 'Poikkeava' },
          ]}
        />
      </div>
      <p className="mt-2 text-[13px] font-semibold leading-snug text-[var(--text)]">{info.cue}</p>
      <Stage className="mt-2">
        <svg viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-label={`${info.cue} ${abn ? info.abnormal : info.normal}`}>
          <Scene test={test} abn={abn} t={t} />
        </svg>
      </Stage>
      <div className="mt-3">
        <Result tone={abn ? 'danger' : 'ok'} title={abn ? info.abnormal : info.normal}>
          {abn
            ? test === 'gaze'
              ? 'Toispuolihalvaus ja katsedeviaatio → konsultoi aina lääkäriä: ensisijainen hoito on trombektomia ja hoitopaikka yliopistosairaala.'
              : 'AVH-epäily: selvitä oireiden alkamisaika ja aiempi toimintakyky ja mittaa verensokeri – hypoglykemia voi aiheuttaa halvauksen kaltaisia oireita.'
            : 'Tee kaikki osatutkimukset – yksikin poikkeava löydös herättää AVH-epäilyn.'}
        </Result>
      </div>
      <p className="mt-2 text-[11px] text-[var(--text-dim)]">
        Aika on tiivistetty.
      </p>
    </div>
  )
}
