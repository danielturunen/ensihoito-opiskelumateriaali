import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Caption, Result, Segmented, Stat, svg } from '../ui'

/* Frank–Starling: preload vs stroke volume. Each bolus moves the point right; on the steep
 * part stroke volume rises, on the flat part it no longer does and only oedema risk grows.
 * Fluid responsiveness ≈ ≥10–15 % rise after 200–500 ml (Wilkman & Kuitunen, Duodecim 2018). */

type Heart = 'normal' | 'weak'

const W = 340
const H = 220
const PAD = { l: 34, r: 12, t: 14, b: 30 }
const PW = W - PAD.l - PAD.r
const PH = H - PAD.t - PAD.b
const START = 0.1
const STEP = 0.13
const MAX_BOLUS = 6

const sv = (heart: Heart, x: number) => (heart === 'normal' ? 1 : 0.55) * (1 - Math.exp(-x / 0.28))
const px = (x: number) => PAD.l + x * PW
const py = (y: number) => PAD.t + (1 - y) * PH

function curve(heart: Heart) {
  return Array.from({ length: 61 }, (_, i) => {
    const x = i / 60
    return `${i ? 'L' : 'M'}${px(x).toFixed(1)} ${py(sv(heart, x)).toFixed(1)}`
  }).join(' ')
}

export default function FrankStarling(_props: WidgetProps) {
  const [heart, setHeart] = useState<Heart>('normal')
  const [n, setN] = useState(0)

  const x = START + n * STEP
  const y = sv(heart, x)
  const prev = n ? sv(heart, x - STEP) : y
  const gain = n ? ((y - prev) / prev) * 100 : 0
  const base = sv(heart, START)
  const total = ((y - base) / base) * 100
  const responsive = gain >= 10
  const flat = n > 0 && !responsive

  return (
    <div>
      <Segmented
        layoutId="fs-heart"
        value={heart}
        onChange={(h) => {
          setHeart(h)
          setN(0)
        }}
        options={[
          { value: 'normal', label: 'Normaali sydän' },
          { value: 'weak', label: 'Vajaatoimintainen' },
        ]}
      />

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label={`Frank–Starlingin käyrä, ${n} nestebolusta, iskutilavuus ${Math.round(y * 100)} % maksimista.`}>
        {/* zones */}
        <rect x={px(0)} y={PAD.t} width={px(0.38) - px(0)} height={PH} fill={svg.tealSoft} opacity={0.5} />
        <rect x={px(0.62)} y={PAD.t} width={px(1) - px(0.62)} height={PH} fill={svg.dangerSoft} opacity={0.6} />
        <text x={px(0.19)} y={PAD.t + PH - 8} textAnchor="middle" fontSize={10} fill={svg.teal} fontWeight={600}>
          jyrkkä osa – nestevaste
        </text>
        <text x={px(0.81)} y={PAD.t + PH - 8} textAnchor="middle" fontSize={10} fill={svg.danger} fontWeight={600}>
          laakea osa – pöhö
        </text>
        {/* axes */}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + PH} stroke={svg.dim} />
        <line x1={PAD.l} y1={PAD.t + PH} x2={PAD.l + PW} y2={PAD.t + PH} stroke={svg.dim} />
        <text x={PAD.l + PW / 2} y={H - 8} textAnchor="middle" fontSize={11} fill={svg.dim}>
          Esikuorma (sydämen täyttö) →
        </text>
        <text x={12} y={PAD.t + PH / 2} textAnchor="middle" fontSize={11} fill={svg.dim} transform={`rotate(-90 12 ${PAD.t + PH / 2})`}>
          Iskutilavuus →
        </text>
        {/* reference curve and active curve */}
        <path d={curve(heart === 'normal' ? 'weak' : 'normal')} fill="none" stroke={svg.dim} strokeOpacity={0.35} strokeDasharray="4 4" strokeWidth={1.5} />
        <path d={curve(heart)} fill="none" stroke={svg.brand} strokeWidth={3} strokeLinecap="round" />
        {/* trail of previous boluses */}
        {Array.from({ length: n }, (_, i) => {
          const xi = START + i * STEP
          return <circle key={i} cx={px(xi)} cy={py(sv(heart, xi))} r={3} fill={svg.brand} opacity={0.4} />
        })}
        <motion.circle
          r={8}
          fill={flat ? svg.danger : svg.teal}
          stroke="#fff"
          strokeWidth={2}
          initial={false}
          animate={{ cx: px(x), cy: py(y) }}
          transition={{ type: 'spring', duration: 0.6, bounce: 0.15 }}
        />
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <Stat label="Viimeinen bolus" value={n ? `+${Math.round(gain)} %` : '–'} tone={!n ? 'neutral' : responsive ? 'ok' : 'danger'} />
        <Stat label="Yhteensä" value={n ? `+${Math.round(total)} %` : '–'} tone="neutral" />
      </div>

      <div className="mt-2">
        {!n ? (
          <Result tone="neutral" title="Hypovoleeminen lähtötilanne">
            Anna nestebolus ja seuraa, kasvaako iskutilavuus. Katkoviiva näyttää {heart === 'normal' ? 'vajaatoimintaisen' : 'normaalin'} sydämen käyrän.
          </Result>
        ) : responsive ? (
          <Result tone="ok" title="Nestevasteinen">
            Iskutilavuus kasvoi vähintään 10 %. Sydän toimii käyrän jyrkällä osalla – lisänesteestä voi olla hyötyä. Arvioi vaste aina uudelleen.
          </Result>
        ) : (
          <Result tone="danger" title="Ei enää nestevastetta">
            Iskutilavuus ei juuri kasva. Lisäneste lisää vain turvotuksia ja keuhkopöhön riskiä – harkitse vasopressoria (noradrenaliini, MAP-tavoite noin 65 mmHg){heart === 'weak' ? ' ja pumppausvajauksessa inotrooppia (dobutamiini)' : ''}.
          </Result>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setN(0)}
          className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[14px] font-medium text-[var(--text)] active:scale-[0.98]"
        >
          Alusta
        </button>
        <button
          type="button"
          disabled={n >= MAX_BOLUS}
          onClick={() => setN((v) => Math.min(MAX_BOLUS, v + 1))}
          className="min-h-11 rounded-xl bg-brand-600 text-[14px] font-semibold text-white active:scale-[0.98] disabled:opacity-40"
        >
          Nestebolus 250–500 ml
        </button>
      </div>
      <div className="mt-3">
        <Caption>Kaaviomalli. Nestevasteisuus määritellään minuuttitilavuuden 10–15 %:n kasvuksi 200–500 ml:n nestetäytön jälkeen. Vain noin puolet sokkipotilaista on nestevasteisia.</Caption>
      </div>
    </div>
  )
}
