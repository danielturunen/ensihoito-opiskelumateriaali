import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Bullets, FadeSwap, Stage, StateTabs } from '../parts/resp-kit'
import { ecgCurve, type KP } from '../parts/ecg-curve'

/* Bundle branch block and ischaemia (articles Rintakipu ja AKS, EKG:n iskemiatulkinta). RBBB: rSR' in V1, wide S
 * in V6 – the ST level is read normally. LBBB: rS in V1, broad R in V6, ST and T discordant to the QRS; the
 * oppikirja box lists the findings that point to transmural ischaemia (1 mm concordant elevation, 5 mm
 * discordant elevation, 1 mm concordant depression V1–V3). Waveforms are schematic. */

type Type = 'rbbb' | 'lbbb'
type St = 'base' | 'concElev' | 'discExcess' | 'concDep' | 'stElev'

const P_WAVE: KP[] = [
  [0, 0],
  [90, 0],
  [130, 0.9],
  [170, 0],
  [230, 0],
]

/** QRS keypoints (from 230 ms) ending at the J point time; ST/T are appended from j and tp. */
const QRS: Record<Type, { v1: KP[]; v6: KP[]; jAt: number; m1: string; m6: string }> = {
  lbbb: {
    v1: [
      [242, 0.6],
      [262, -3],
      [300, -10],
      [335, -5],
    ],
    v6: [
      [255, 5],
      [280, 8.5],
      [295, 7],
      [315, 9.5],
      [345, 4],
    ],
    jAt: 372,
    m1: 'rS',
    m6: 'R',
  },
  rbbb: {
    v1: [
      [245, 3],
      [262, -3],
      [292, 8.5],
      [322, 1],
    ],
    v6: [
      [240, -1],
      [262, 9.5],
      [285, -1],
      [305, -3],
      [340, -1],
    ],
    jAt: 360,
    m1: "rSR'",
    m6: 'qRs',
  },
}

interface Lv {
  j: number
  tp: number
}
interface StateCfg {
  label: string
  v1: Lv
  v6: Lv
  flag: 'v1' | 'v6' | null
  measure?: string
  title: string
  items: string[]
}

const LBBB_V1: Lv = { j: 1.5, tp: 3.5 }
const LBBB_V6: Lv = { j: -1.2, tp: -3 }
const RBBB_V1: Lv = { j: -0.3, tp: -2.5 }
const RBBB_V6: Lv = { j: 0, tp: 3 }

const STATES: Record<Type, Partial<Record<St, StateCfg>>> = {
  lbbb: {
    base: {
      label: 'Tavallinen LBBB',
      v1: LBBB_V1,
      v6: LBBB_V6,
      flag: null,
      title: 'Vasen haarakatkos (LBBB)',
      items: [
        'V1 negatiivinen (rS), V6 positiivinen (leveä, usein lovinen R) – samoin I ja aVL.',
        'LBBB:n määritelmään kuuluu, että ST-väli ja T-aalto ovat QRS:n kanssa erisuuntaisia. Siksi se voi peittää iskemian ST-muutokset ja vaikeuttaa ST-tason arviointia.',
        'EKG ei silti ole käyttökelvoton: valitse muutos yläpuolelta ja katso, mikä on poikkeavaa.',
      ],
    },
    concElev: {
      label: 'ST-nousu QRS:n suuntaan',
      v1: LBBB_V1,
      v6: { j: 1.5, tp: 3.5 },
      flag: 'v6',
      measure: '≥ 1 mm',
      title: 'Samansuuntainen ST-nousu',
      items: ['Vähintään 1 mm:n ST-nousu kytkennässä, jossa QRS on positiivinen, viittaa transmuraaliseen iskemiaan – löydöksellä on suuri painoarvo.', 'Kompleksin kanssa samansuuntainen ST-välin muutos on LBBB:ssä aina poikkeava.'],
    },
    discExcess: {
      label: 'Liian suuri vastakkainen nousu',
      v1: { j: 5.5, tp: 7 },
      v6: LBBB_V6,
      flag: 'v1',
      measure: '≥ 5 mm',
      title: 'Erityisen suuri vastakkainen ST-nousu',
      items: [
        'Vähintään 5 mm:n ST-nousu kytkennässä, jossa QRS on negatiivinen.',
        'Erisuuntainen ST-muutos kuuluu LBBB:hen, mutta erityisen iso muutos on poikkeava. Uudemmissa kriteereissä raja suhteutetaan S-aallon syvyyteen (ks. EKG:n iskemiatulkinta).',
      ],
    },
    concDep: {
      label: 'ST-lasku V1–V3',
      v1: { j: -1.5, tp: -2.5 },
      v6: LBBB_V6,
      flag: 'v1',
      measure: '≥ 1 mm',
      title: 'ST-lasku QRS:n suuntaan V1–V3',
      items: ['Vähintään 1 mm:n ST-lasku QRS-kompleksin suuntaan kytkennöissä V1–V3 viittaa transmuraaliseen iskemiaan.', 'Kompleksi on näissä kytkennöissä negatiivinen – samansuuntainen lasku ei kuulu tavalliseen LBBB:hen.'],
    },
  },
  rbbb: {
    base: {
      label: 'Tavallinen RBBB',
      v1: RBBB_V1,
      v6: RBBB_V6,
      flag: null,
      title: 'Oikea haarakatkos (RBBB)',
      items: [
        'V1:ssä kaksijakoinen rSR′ – "pupunkorvat". V6:ssa (samoin I ja aVL) leveä S-aalto: kompleksi voi näyttää nopeasti kapealta, mutta leveä S tekee siitä leveän.',
        'RBBB ei vaikuta ST-tason tulkintaan – iskemian ST-muutokset näkyvät yleensä normaalisti.',
      ],
    },
    stElev: {
      label: 'RBBB + ST-nousu',
      v1: { j: 2, tp: 2.5 },
      v6: RBBB_V6,
      flag: 'v1',
      measure: 'ST↑',
      title: 'ST-nousu oikeassa haarakatkoksessa',
      items: [
        'RBBB:ssä ST-tason pitäisi kytkennöissä V1–V3 olla isoelektrinen tai lievästi laskenut – pienikin ST-nousu herättää iskemiaepäilyn.',
        'Varman iskemian yhteydessä uusi RBBB on suuren vaaran merkki, sillä sen voi aiheuttaa LAD:n tukos.',
      ],
    },
  },
}

const PX = 6 // px per mm; 1 mm = 40 ms
const W = 150
const H = 150
const TOP = 22
const BASE = TOP + 80
const PANELS = [10, 178]

function leadPath(type: Type, lead: 'v1' | 'v6', lv: Lv, x0: number) {
  const q = QRS[type]
  const jAt = q.jAt
  const kp: KP[] = [...P_WAVE, ...q[lead], [jAt, lv.j], [jAt + 50, lv.j + (lv.tp - lv.j) * 0.35], [jAt + 110, lv.tp], [jAt + 210, 0], [1000, 0]]
  const f = ecgCurve(kp)
  let d = ''
  for (let t = 0; t <= 1000; t += 5) {
    const x = x0 + (t / 40) * PX
    const y = BASE - f(t) * PX
    d += `${t ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}

function Grid({ x0 }: { x0: number }) {
  const lines = []
  for (let i = 0; i <= W / PX; i++) {
    const big = i % 5 === 0
    lines.push(<line key={`v${i}`} x1={x0 + i * PX} y1={TOP} x2={x0 + i * PX} y2={TOP + H} stroke={svg.line} strokeWidth={big ? 0.8 : 0.4} opacity={big ? 0.9 : 0.5} />)
  }
  for (let i = 0; i <= H / PX; i++) {
    const big = i % 5 === 0
    lines.push(<line key={`h${i}`} x1={x0} y1={TOP + i * PX} x2={x0 + W} y2={TOP + i * PX} stroke={svg.line} strokeWidth={big ? 0.8 : 0.4} opacity={big ? 0.9 : 0.5} />)
  }
  return <g aria-hidden>{lines}</g>
}

export default function BbbIschemia(props: WidgetProps) {
  const reduce = useReducedMotion() ?? false
  const [type, setType] = useState<Type>(props.initial === 'rbbb' ? 'rbbb' : 'lbbb')
  const [st, setSt] = useState<St>('base')
  const states = STATES[type]
  const cfg = states[st] ?? states.base!
  const options = (Object.keys(states) as St[]).map((k) => ({ value: k, label: states[k]!.label }))
  const q = QRS[type]
  const tr = reduce ? { duration: 0 } : { type: 'spring' as const, duration: 0.6, bounce: 0.1 }

  return (
    <div>
      <Segmented
        layoutId="bbb-type"
        size="sm"
        value={type}
        onChange={(v) => {
          setType(v)
          setSt('base')
        }}
        options={[
          { value: 'lbbb', label: 'Vasen (LBBB)' },
          { value: 'rbbb', label: 'Oikea (RBBB)' },
        ]}
      />
      <div className="mt-2">
        <StateTabs layoutId={`bbb-state-${type}`} value={st} onChange={setSt} options={options} gridOnly />
      </div>
      <Stage className="mt-3">
        <svg viewBox="0 0 340 196" className="h-auto w-full" role="img" aria-label={`${cfg.title}. V1 ${q.m1}, V6 ${q.m6}.`}>
          {(['v1', 'v6'] as const).map((lead, i) => {
            const x0 = PANELS[i]
            const lv = cfg[lead]
            const flagged = cfg.flag === lead
            const jx = x0 + (q.jAt / 40) * PX
            return (
              <g key={lead}>
                <rect x={x0} y={TOP} width={W} height={H} rx={4} fill={svg.surface} />
                <Grid x0={x0} />
                {flagged && (
                  <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <rect x={jx - 3} y={TOP + 2} width={60} height={H - 4} fill={svg.dangerSoft} />
                    <line x1={x0} y1={BASE} x2={x0 + W} y2={BASE} stroke={svg.dim} strokeWidth={1} strokeDasharray="3 3" />
                    <line x1={jx - 6} y1={BASE} x2={jx - 6} y2={BASE - lv.j * PX} stroke={svg.danger} strokeWidth={1.6} />
                    <text x={jx + 2} y={lv.j < 0 ? BASE + 16 : BASE - lv.j * PX - 18} fontSize={11} fontWeight={700} fill={svg.danger}>
                      {cfg.measure}
                    </text>
                  </motion.g>
                )}
                <motion.path
                  initial={false}
                  animate={{ d: leadPath(type, lead, lv, x0) }}
                  transition={tr}
                  fill="none"
                  stroke={flagged ? svg.danger : svg.ink}
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <text x={x0 + 6} y={TOP + 15} fontSize={13} fontWeight={700} fill={svg.ink}>
                  {lead === 'v1' ? 'V1' : 'V6'}
                </text>
                {lead === 'v6' && (
                  <text x={x0 + 30} y={TOP + 15} fontSize={10.5} fill={svg.dim}>
                    (myös I, aVL)
                  </text>
                )}
                <text x={x0 + W / 2} y={TOP + H + 18} textAnchor="middle" fontSize={12} fontWeight={600} fill={svg.dim}>
                  {lead === 'v1' ? q.m1 : q.m6}
                </text>
              </g>
            )
          })}
        </svg>
      </Stage>
      <FadeSwap k={`${type}-${st}`} className="mt-3">
        <p className={`mb-1.5 font-display text-[15px] font-semibold ${cfg.flag ? 'text-danger-500' : 'text-[var(--text)]'}`}>{cfg.title}</p>
        <Bullets items={cfg.items} />
      </FadeSwap>
      <p className="mt-2 text-[12px] leading-snug text-[var(--text-dim)]">Kaavamainen. 1 pieni ruutu = 1 mm = 40 ms. Vertaa aina aiempaan EKG:hen ja potilaan oireisiin.</p>
    </div>
  )
}
