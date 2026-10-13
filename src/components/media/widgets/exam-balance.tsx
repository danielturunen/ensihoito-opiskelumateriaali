import { useRef, useState, type RefObject } from 'react'
import type { WidgetProps } from '../registry'
import { Result, Segmented, svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { FIG } from '../parts/exam-kit'

/* Balance tests (article Huimaus; Akuuttihoito-opas Akuutti huimaus 2025, Päänsärky 2025;
 * Lääkärin käsikirja Huimaus 2025 and Ménièren tauti 2026): Romberg, blind marching
 * (Unterberger) and walk-rotate-walk. Time is compressed. */

type Tab = 'romberg' | 'march' | 'wrw'

function useClock(ref: RefObject<HTMLDivElement | null>, loop: number, initial: number) {
  const [t, setT] = useState(initial)
  const running = useFrameLoop(ref, (dt) => setT((v) => (v + dt) % loop))
  return { t, running }
}

/* ---------- Romberg ---------- */

type RombergResult = 'stable' | 'sway' | 'fall'

function FrontFigure({ lean, eyesClosed }: { lean: number; eyesClosed: boolean }) {
  // pivot at the feet (160, 196)
  return (
    <g transform={`rotate(${lean} 160 196)`}>
      <path d="M154 196L156 140M166 196L164 140" stroke={FIG.fill} strokeWidth={10} strokeLinecap="round" />
      <rect x={142} y={78} width={36} height={66} rx={14} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
      <path d="M146 86L138 136M174 86L182 136" stroke={FIG.fill} strokeWidth={8} strokeLinecap="round" />
      <circle cx={160} cy={58} r={16} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
      {eyesClosed ? (
        <path d="M151 57q3 2 6 0M163 57q3 2 6 0" fill="none" stroke={svg.ink} strokeWidth={1.5} strokeLinecap="round" />
      ) : (
        <g fill={svg.ink}>
          <circle cx={154} cy={57} r={1.8} />
          <circle cx={166} cy={57} r={1.8} />
        </g>
      )}
    </g>
  )
}

function Romberg() {
  const [res, setRes] = useState<RombergResult>('fall')
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useClock(ref, 7, 4)
  const closed = t > 1.6
  const k = Math.max(0, t - 1.6)
  let lean = Math.sin(t * 3) * 0.6
  if (closed && res === 'sway') lean = Math.sin(k * 2.2) * 6 + Math.sin(k * 3.7) * 3
  if (closed && res === 'fall') lean = Math.min(14, k * 6) + Math.sin(k * 5) * 0.8
  const info: Record<RombergResult, { tone: 'ok' | 'warning' | 'danger'; title: string; text: string }> = {
    stable: { tone: 'ok', title: 'Pysyy pystyssä', text: 'Ei objektiivista tasapainohäiriötä.' },
    sway: { tone: 'warning', title: 'Huojuu eri suuntiin, ei kaadu', text: 'Esimerkiksi jännityspäänsäryssä potilas voi huojua eri suuntiin, mutta ei kaadu mihinkään suuntaan.' },
    fall: { tone: 'danger', title: 'Kaatuu toistuvasti samaan suuntaan', text: 'Rombergin kokeessa tai istuen toistettava, samaan suuntaan kaatava huimaus on yleensä takaverenkierron aivoverenkiertohäiriön merkki – etenkin, jos mukana on neurologisia liitännäisoireita.' },
  }
  const r = info[res]
  return (
    <div ref={ref}>
      <Segmented
        layoutId="romberg-res"
        size="sm"
        value={res}
        onChange={setRes}
        options={[
          { value: 'stable', label: 'Vakaa' },
          { value: 'sway', label: 'Huojuu' },
          { value: 'fall', label: 'Kaatuu' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-label={`Rombergin koe: ${r.title}`}>
          <path d="M100 198H220" stroke={svg.line} strokeWidth={2} />
          <path d="M160 198V30" stroke={svg.line} strokeWidth={1} strokeDasharray="3 5" />
          <FrontFigure lean={lean} eyesClosed={closed} />
          <text x={232} y={40} fontSize={12} fontWeight={700} fill={closed ? svg.brand : svg.teal}>
            {closed ? 'silmät kiinni' : 'silmät auki'}
          </text>
          <text x={232} y={58} fontSize={11} fill={svg.dim}>
            jalat yhdessä
          </text>
        </svg>
      </Stage>
      <p className="mt-2 text-[13px] leading-snug text-[var(--text)]">Arvioi: kaataako, huojuttaako, mihin suuntaan ja toistuuko löydös.</p>
      <div className="mt-2">
        <Result tone={r.tone} title={r.title}>
          {r.text}
        </Result>
      </div>
    </div>
  )
}

/* ---------- blind marching (Unterberger) ---------- */

function TopFigure({ x, y, angle, step }: { x: number; y: number; angle: number; step: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <ellipse cx={-7} cy={step * 6} rx={4.5} ry={8} fill={FIG.far} stroke={FIG.line} />
      <ellipse cx={7} cy={-step * 6} rx={4.5} ry={8} fill={FIG.far} stroke={FIG.line} />
      <ellipse cx={0} cy={0} rx={22} ry={11} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
      <circle cx={0} cy={-2} r={9} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.2} />
      <path d="M-3 -10L0 -15L3 -10" fill={FIG.fill} stroke={FIG.line} strokeWidth={1} />
    </g>
  )
}

function March() {
  const [abn, setAbn] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useClock(ref, 8, 5)
  const k = Math.min(1, t / 6)
  const angle = (abn ? 70 : 25) * k
  const step = Math.sin(t * Math.PI * 2.2)
  const arc = (deg: number, r: number) => {
    const a = ((deg - 90) * Math.PI) / 180
    return `${160 + r * Math.cos(a)} ${108 + r * Math.sin(a)}`
  }
  return (
    <div ref={ref}>
      <Segmented
        layoutId="march-res"
        size="sm"
        value={abn ? 'ab' : 'n'}
        onChange={(v) => setAbn(v === 'ab')}
        options={[
          { value: 'n', label: 'Alle 45°' },
          { value: 'ab', label: 'Yli 45°' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-label={`Sokkokävely: vartalo kääntyy ${Math.round(angle)} astetta`}>
          <path d={`M160 108L${arc(0, 80)}`} stroke={svg.line} strokeWidth={1} strokeDasharray="3 5" />
          <path d={`M160 108L${arc(45, 80)}`} stroke={svg.danger} strokeWidth={1.2} strokeDasharray="3 4" />
          <path d={`M${arc(0, 60)}A60 60 0 0 1 ${arc(45, 60)}`} fill="none" stroke={svg.danger} strokeWidth={1.4} opacity={0.6} />
          <text x={arc(45, 92).split(' ')[0]} y={arc(45, 92).split(' ')[1]} fontSize={11} fontWeight={700} fill={svg.danger}>
            45°
          </text>
          <TopFigure x={160} y={108} angle={angle} step={step} />
          <text x={160} y={200} textAnchor="middle" fontSize={11} fill={svg.dim}>
            ylhäältä – marssii paikallaan silmät kiinni
          </text>
        </svg>
      </Stage>
      <p className="mt-2 text-[13px] leading-snug text-[var(--text)]">Potilas marssii paikallaan silmät suljettuina noin 30 sekuntia. Vartalon ei pitäisi kääntyä yli 45°.</p>
      <div className="mt-2">
        <Result tone={abn ? 'danger' : 'ok'} title={abn ? 'Kääntyy yli 45°' : 'Kääntyminen alle 45°'}>
          {abn ? 'Patologinen löydös – esimerkiksi Ménièren taudissa kääntymä voi suuntautua sairaan korvan puolelle.' : 'Normaali löydös.'}
        </Result>
      </div>
    </div>
  )
}

/* ---------- walk-rotate-walk ---------- */

function Wrw() {
  const [abn, setAbn] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useClock(ref, 7, 2)
  // 0–2.5 s walk up, 2.5–3.1 turn, 3.1–5.6 walk back, pause
  let y = 170
  let angle = 0
  let sway = 0
  if (t < 2.5) y = 170 - (t / 2.5) * 120
  else if (t < 3.1) {
    y = 50
    angle = ((t - 2.5) / 0.6) * 180
  } else if (t < 5.6) {
    y = 50 + ((t - 3.1) / 2.5) * 120
    angle = 180
    if (abn) sway = Math.sin((t - 3.1) * 7) * 12 * Math.max(0, 1 - (t - 3.1) / 2.5)
  } else {
    y = 170
    angle = 180
  }
  const step = t < 2.5 || (t > 3.1 && t < 5.6) ? Math.sin(t * Math.PI * 3) : 0
  return (
    <div ref={ref}>
      <Segmented
        layoutId="wrw-res"
        size="sm"
        value={abn ? 'ab' : 'n'}
        onChange={(v) => setAbn(v === 'ab')}
        options={[
          { value: 'n', label: 'Suora paluu' },
          { value: 'ab', label: 'Horjahtelee' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-label="Walk-rotate-walk: kävely, nopea käännös ja paluu">
          <path d="M160 180V40" stroke={svg.line} strokeWidth={1} strokeDasharray="3 5" />
          <TopFigure x={160 + sway} y={y} angle={angle} step={step} />
          <text x={176} y={46} fontSize={11} fill={svg.dim}>
            nopea käännös 180°
          </text>
          <text x={160} y={204} textAnchor="middle" fontSize={11} fill={svg.dim}>
            ylhäältä
          </text>
        </svg>
      </Stage>
      <p className="mt-2 text-[13px] leading-snug text-[var(--text)]">Potilas kävelee suoraan, kääntyy nopeasti 180° ja palaa lähtöpaikkaan.</p>
      <div className="mt-2">
        <Result tone={abn ? 'warning' : 'ok'} title={abn ? 'Horjahtelu ja sivuaskeleet' : 'Kävelee suoraan takaisin'}>
          {abn ? 'Viittaa horisontaalisen kaarikäytävän hyvänlaatuiseen asentohuimaukseen.' : 'Normaali löydös.'}
        </Result>
      </div>
    </div>
  )
}

export default function ExamBalance(_props: WidgetProps) {
  const [tab, setTab] = useState<Tab>('romberg')
  return (
    <div>
      <Segmented
        layoutId="balance-tab"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'romberg', label: 'Romberg' },
          { value: 'march', label: 'Sokkokävely' },
          { value: 'wrw', label: 'WRW' },
        ]}
      />
      <div className="mt-3">{tab === 'romberg' ? <Romberg /> : tab === 'march' ? <March /> : <Wrw />}</div>
    </div>
  )
}
