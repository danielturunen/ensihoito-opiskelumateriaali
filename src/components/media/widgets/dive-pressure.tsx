import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { useLoop } from '../parts/resp-kit'

/* Boyle and Henry at a glance. Pressure = 1 atm + 1 atm per 10 m of water.
 * Free-diving lung volume = 6 l / pressure; dissolved nitrogen at equilibrium ∝ pressure. */

const MAX = 40
const WATER_TOP = 18
const WATER_H = 196

export default function DivePressure(_props: WidgetProps) {
  const [depth, setDepth] = useState(30)
  const [mode, setMode] = useState<'free' | 'scuba'>('free')
  const [ascent, setAscent] = useState(false)
  const { ref, active, reduce } = useLoop<HTMLDivElement>()

  const p = 1 + depth / 10
  const lungs = mode === 'free' ? 6 / p : 6
  const n2 = p
  const y = WATER_TOP + (depth / MAX) * (WATER_H - 34)
  const bubbles = ascent && mode === 'scuba' ? Math.round(Math.max(0, depth - 8) / 3) : 0
  const lungScale = Math.sqrt(lungs / 6)

  return (
    <div ref={ref}>
      <Segmented
        layoutId="dive-mode"
        value={mode}
        onChange={(m) => {
          setMode(m)
          setAscent(false)
        }}
        options={[
          { value: 'free', label: 'Vapaasukellus' },
          { value: 'scuba', label: 'Laitesukellus' },
        ]}
      />

      <div className="mt-3 grid grid-cols-[1fr_128px] gap-3">
        <svg viewBox="0 0 200 230" className="h-auto w-full" role="img" aria-label={`Syvyys ${depth} m, paine ${p.toFixed(1).replace('.', ',')} ilmakehää.`}>
          <defs>
            <linearGradient id="dp-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(56,189,248,0.25)" />
              <stop offset="1" stopColor="rgba(14,116,144,0.55)" />
            </linearGradient>
          </defs>
          <rect x={0} y={WATER_TOP} width={200} height={WATER_H} rx={10} fill="url(#dp-water)" />
          <path d={`M0 ${WATER_TOP}q25 -6 50 0t50 0t50 0t50 0`} fill="none" stroke="#38bdf8" strokeWidth={2} />
          {[0, 10, 20, 30, 40].map((d) => {
            const yy = WATER_TOP + (d / MAX) * (WATER_H - 34)
            return (
              <g key={d}>
                <line x1={0} x2={10} y1={yy} y2={yy} stroke={svg.ink} strokeOpacity={0.5} />
                <text x={14} y={yy + 4} fontSize={10} fill={svg.ink} opacity={0.7}>
                  {d} m
                </text>
              </g>
            )
          })}
          {/* diver with lungs */}
          <motion.g initial={false} animate={{ y }} transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0.1 }}>
            <circle cx={120} cy={8} r={8} fill={svg.raised} stroke={svg.ink} strokeWidth={1.5} />
            <rect x={108} y={16} width={24} height={30} rx={10} fill={svg.raised} stroke={svg.ink} strokeWidth={1.5} />
            {mode === 'scuba' && <rect x={132} y={16} width={8} height={24} rx={4} fill="#facc15" stroke={svg.ink} strokeWidth={1} />}
            <motion.g style={{ transformOrigin: '120px 31px' }} initial={false} animate={{ scale: lungScale }} transition={{ type: 'spring', duration: 0.5 }}>
              <ellipse cx={115} cy={31} rx={4.5} ry={9} fill="rgba(224,120,156,0.75)" />
              <ellipse cx={125} cy={31} rx={4.5} ry={9} fill="rgba(224,120,156,0.75)" />
            </motion.g>
          </motion.g>
          {/* bubbles on fast ascent */}
          <AnimatePresence>
            {Array.from({ length: bubbles }, (_, i) => (
              <motion.circle
                key={i}
                cx={60 + ((i * 37) % 120)}
                r={3 + (i % 3)}
                fill="none"
                stroke="#e0f2fe"
                strokeWidth={1.5}
                initial={{ cy: WATER_TOP + WATER_H - 10, opacity: 0 }}
                animate={active ? { cy: [WATER_TOP + WATER_H - 10, WATER_TOP + 10], opacity: [0, 1, 0] } : { cy: WATER_TOP + 60 + i * 9, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.4, repeat: active ? Infinity : 0, delay: i * 0.25 }}
              />
            ))}
          </AnimatePresence>
        </svg>

        <div className="flex flex-col gap-2">
          <Gauge label="Paine" value={`${p.toFixed(1).replace('.', ',')} atm`} sub={depth === 0 ? 'pinnalla' : `+${(depth / 10).toFixed(1).replace('.', ',')} atm vedestä`} />
          <Gauge label="Keuhkot" value={`${lungs.toFixed(1).replace('.', ',')} l`} sub={mode === 'free' ? 'Boyle: tilavuus ∝ 1/paine' : 'laite kompensoi'} />
          <Gauge label="Liuennut typpi" value={`× ${n2.toFixed(1).replace('.', ',')}`} sub="Henry: ∝ paine" warn={n2 >= 3} />
        </div>
      </div>

      <label className="mt-3 block">
        <span className="flex justify-between text-[13px] font-medium text-[var(--text-dim)]">
          Syvyys
          <span className="font-display text-[15px] font-semibold tabular-nums text-[var(--text)]">{depth} m</span>
        </span>
        <input
          type="range"
          min={0}
          max={MAX}
          step={1}
          value={depth}
          onChange={(e) => {
            setDepth(Number(e.target.value))
            setAscent(false)
          }}
          className="mt-1 h-8 w-full cursor-pointer accent-brand-500"
          aria-label="Syvyys metreinä"
        />
      </label>

      {mode === 'scuba' ? (
        <button
          onClick={() => setAscent((a) => !a)}
          aria-pressed={ascent}
          className={`mt-2 min-h-[44px] w-full rounded-xl border px-4 text-[14px] font-semibold transition-colors duration-150 active:scale-[0.99] ${
            ascent ? 'border-danger-500 bg-danger-500/10 text-danger-500' : 'border-[var(--border)]'
          }`}
        >
          {ascent ? 'Nopea nousu: liuennut typpi kuplii' : 'Nouse pintaan nopeasti'}
        </button>
      ) : null}

      <p className="mt-3 text-[13px] leading-relaxed text-[var(--text)]">
        {mode === 'free'
          ? 'Vapaasukeltajan keuhkot puristuvat kokoon syvyyden kasvaessa (6 l → 1,5 l 30 metrissä). Vapaasukellus ei normaalisti altista sukeltajantaudille.'
          : ascent && depth > 8
            ? 'Jos typpeä on liuennut enemmän kuin uloshengitys ehtii poistaa, verenkiertoon ja kudoksiin syntyy kuplia – sukeltajantauti. 30 metrissä noin 30 minuutissa liukenee jo niin paljon, että nopea nousu saisi aikaan kuplia.'
            : 'Paineilmalaite pitää keuhkojen tilavuuden ennallaan, mutta typpeä liukenee kudoksiin paineen suhteessa – mitä syvemmälle ja kauemmin, sitä enemmän.'}
      </p>
      <p className="mt-1 text-[12px] text-[var(--text-dim)]">Kaaviokuva. Liuennut typpi kuvaa tasapainotilannetta pintaan verrattuna.</p>
    </div>
  )
}

function Gauge({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-2 ${warn ? 'bg-brand-500/12' : 'bg-[var(--bg-card)]'}`}>
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{label}</p>
      <p className={`font-display text-[19px] font-bold tabular-nums ${warn ? 'text-brand-600' : 'text-[var(--text)]'}`}>{value}</p>
      <p className="text-[10.5px] leading-tight text-[var(--text-dim)]">{sub}</p>
    </div>
  )
}
