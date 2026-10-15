import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Bullets, FadeSwap, Stage, StateTabs, rc } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'

/* Adenosine: why the bolus must be fast and flushed (article Adenosiini; Akuuttihoidon lääkkeet 2025).
 * The drug breaks down within seconds; a fast bolus with an immediate saline flush reaches the AV node at a
 * high concentration, briefly halts AV conduction and ends the re-entry. Time and ECG are schematic. */

type Mode = 'fast' | 'slow'

const LOOP = 9
const INJECT = 0.6
const CFG: Record<Mode, { travel: number; tau: number; title: string; items: string[] }> = {
  fast: {
    travel: 1.3,
    tau: 2.6,
    title: 'Nopea bolus ja heti huuhtelu',
    items: [
      'Kanyyli suureen ääreislaskimoon. 5–6 mg ruiskutetaan noin kahdessa sekunnissa, ja perään heti 5–10 ml NaCl 0,9 -huuhtelu.',
      'Lääke ehtii eteis-kammiosolmukkeeseen riittävän suurena pitoisuutena: johtuminen pysähtyy hetkeksi, kiertoaktivaatio katkeaa ja sinusrytmi palaa.',
      'Jos vastetta ei tule 1–2 minuutissa: 10–12 mg, sitten tarvittaessa 12–18 mg. EKG-tallennus on päällä koko ajan.',
    ],
  },
  slow: {
    travel: 4,
    tau: 1,
    title: 'Hidas ruiskutus ilman huuhtelua',
    items: ['Adenosiini hajoaa veressä hyvin nopeasti. Hitaasti tai pieneen laskimoon annettuna se hajoaa matkalla, eikä sydämeen asti pääse vaikuttavaa pitoisuutta.', 'SVT jatkuu – ratkaisevaa on antotekniikka: nopea bolus suureen laskimoon ja heti huuhtelu.'],
  },
}

// cubic bezier from the antecubital cannula to the heart
const P = [
  [34, 110],
  [100, 40],
  [190, 34],
  [258, 78],
] as const
function bez(k: number) {
  const u = 1 - k
  const x = u * u * u * P[0][0] + 3 * u * u * k * P[1][0] + 3 * u * k * k * P[2][0] + k * k * k * P[3][0]
  const y = u * u * u * P[0][1] + 3 * u * u * k * P[1][1] + 3 * u * k * k * P[2][1] + k * k * k * P[3][1]
  return [x, y] as const
}
const VEIN = `M${P[0][0]} ${P[0][1]}C${P[1][0]} ${P[1][1]} ${P[2][0]} ${P[2][1]} ${P[3][0]} ${P[3][1]}`

/** ECG value at time tt (s) within the loop; returns millivolt-like units (positive up). */
function ecg(tt: number, blockAt: number | null) {
  const svtBeat = (x: number) => {
    const ph = x % 0.34
    return ph < 0.03 ? -0.15 : ph < 0.06 ? 1 - Math.abs(ph - 0.045) * 60 : ph > 0.16 && ph < 0.27 ? 0.22 * Math.sin(((ph - 0.16) / 0.11) * Math.PI) : 0
  }
  const sinusBeat = (x: number) => {
    const ph = x % 0.82
    if (ph < 0.09) return 0.15 * Math.sin((ph / 0.09) * Math.PI)
    if (ph > 0.15 && ph < 0.18) return -0.12
    if (ph >= 0.18 && ph < 0.22) return 1 - Math.abs(ph - 0.2) * 45
    if (ph > 0.36 && ph < 0.52) return 0.28 * Math.sin(((ph - 0.36) / 0.16) * Math.PI)
    return 0
  }
  if (blockAt === null || tt < blockAt) return svtBeat(tt)
  if (tt < blockAt + 1.8) return 0
  return sinusBeat(tt - blockAt - 1.8)
}

export default function AdenosineBolus(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('fast')
  const c = CFG[mode]
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(2.2)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % LOOP))

  const since = t - INJECT
  const k = since / c.travel
  const conc = since < 0 ? 0 : Math.exp(-since / c.tau)
  const arriveConc = Math.exp(-c.travel / c.tau)
  const works = arriveConc > 0.4
  const blockAt = works ? INJECT + c.travel : null
  const blocked = blockAt !== null && t >= blockAt && t < blockAt + 1.8
  const converted = blockAt !== null && t >= blockAt + 1.8

  // ECG trace over the last 4 s
  let trace = ''
  for (let i = 0; i <= 150; i++) {
    const tt = t - 4 + (i / 150) * 4
    const v = tt < 0 ? ecg(tt + LOOP, null) : ecg(tt, blockAt)
    trace += `${i ? 'L' : 'M'}${(20 + i * 2).toFixed(1)} ${(202 - v * 20).toFixed(1)}`
  }

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="adenosine-mode"
        value={mode}
        onChange={setMode}
        gridOnly
        options={[
          { value: 'fast', label: 'Nopea + huuhtelu' },
          { value: 'slow', label: 'Hidas, ei huuhtelua' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 340 220" className="h-auto w-full" role="img" aria-label={`${c.title}: ${works ? 'rytmi kääntyy sinusrytmiksi' : 'supraventrikulaarinen takykardia jatkuu'}.`}>
          {/* arm and vein */}
          <path d="M10 124C40 112 70 70 110 52" stroke={rc.tissueSoft} strokeWidth={30} strokeLinecap="round" fill="none" />
          <path d={VEIN} fill="none" stroke={rc.vein} strokeWidth={4} opacity={0.6} />
          <rect x={22} y={104} width={20} height={9} rx={2} fill={svg.surface} stroke={svg.dim} transform="rotate(-25 32 108)" />
          <text x={12} y={146} fontSize={10.5} fill={svg.dim}>
            kyynärtaive
          </text>

          {/* drug bolus travelling and decaying */}
          {since >= 0 && k <= 1.05 &&
            [0, 0.06, 0.12].map((lag, i) => {
              const kk = Math.max(0, Math.min(1, k - lag * (mode === 'slow' ? 3 : 1)))
              const [x, y] = bez(kk)
              return <circle key={i} cx={x} cy={y} r={7 - i * 1.5} fill={svg.teal} opacity={Math.max(0, conc - i * 0.15)} />
            })}

          {/* heart with AV node */}
          <g transform="translate(276 92)">
            <path d="M0 34C-38 8 -38 -22 -19 -27C-8 -30 -2 -22 0 -15C2 -22 8 -30 19 -27C38 -22 38 8 0 34Z" fill={rc.heartSoft} stroke={rc.heart} strokeWidth={1.6} />
            <circle cx={0} cy={4} r={6} fill={blocked ? svg.danger : svg.surface} stroke={blocked ? svg.danger : svg.dim} strokeWidth={1.6} />
            <text x={0} y={52} textAnchor="middle" fontSize={10} fill={blocked ? svg.danger : svg.dim}>
              {blocked ? 'AV-johtuminen pysähtyy' : 'AV-solmuke'}
            </text>
          </g>

          <text x={186} y={20} textAnchor="middle" fontSize={10.5} fill={svg.dim}>
            {since < 0 ? 'valmis antamaan' : k < 1 ? (conc > 0.4 ? 'lääke matkalla' : 'lääke hajoaa matkalla') : works ? 'perillä riittävänä pitoisuutena' : 'liian vähän perillä'}
          </text>

          {/* ECG */}
          <rect x={14} y={156} width={312} height={58} rx={6} fill={svg.surface} stroke={svg.line} />
          <path d={trace} fill="none" stroke={converted ? svg.teal : blocked ? svg.ink : svg.danger} strokeWidth={1.8} strokeLinejoin="round" />
          <text x={22} y={169} fontSize={10} fontWeight={600} fill={converted ? svg.teal : svg.danger}>
            {converted ? 'sinusrytmi' : blocked ? 'tauko' : 'SVT'}
          </text>
          <text x={320} y={169} textAnchor="end" fontSize={10} fill={svg.dim}>
            EKG-tallennus päällä
          </text>
        </svg>
      </Stage>
      <FadeSwap k={mode} className="mt-3">
        <p className="mb-1.5 font-display text-[15px] font-semibold text-[var(--text)]">{c.title}</p>
        <Bullets items={c.items} />
      </FadeSwap>
      <p className="mt-2 text-[12px] leading-snug text-[var(--text-dim)]">Kaavamainen, aika tiivistetty. Varoen astmaatikolle: adenosiini voi ahtauttaa keuhkoputkia.</p>
    </div>
  )
}
