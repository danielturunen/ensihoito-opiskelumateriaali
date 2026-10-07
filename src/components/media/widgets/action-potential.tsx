import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Result, Segmented, svg } from '../ui'
import { sample, toPath } from '../parts/ecg-wave'

/* Ventricular cardiomyocyte action potential (schematic). k = 0 normal, k = 1 amiodarone
 * (longer plateau/phase 3 → longer action potential and refractory period). */

type Mode = 'normal' | 'amio'
type PhaseId = '0' | '12' | '3' | '4'

const VB_W = 340
const VB_H = 262
const X0 = 46
const X1 = 330
const T_MAX = 520 // ms
const T0 = 40 // upstroke
const XS = (X1 - X0) / T_MAX
const x = (t: number) => X0 + t * XS
const y = (v: number) => 30 + (40 - v) * 0.9 // +40 mV → 30, −100 mV → 156
const AP_TOP = 22
const AP_BOTTOM = 158
const ECG_BASE = 216
const ECG_GAIN = 30

const TEXT_TEAL = '#0b958c'

const tPlateauEnd = (k: number) => 230 + 52 * k
const tPhase3 = (k: number) => 100 + 26 * k
const tEnd = (k: number) => tPlateauEnd(k) + tPhase3(k)
/** Membrane back below about −60 mV in phase 3 ≈ end of the effective refractory period. */
const tErp = (k: number) => tPlateauEnd(k) + 0.603 * tPhase3(k)

const V1 = 25 - 17 * (1 - Math.exp(-13 / 4))

function apV(t: number, k: number): number {
  const tP = tPlateauEnd(k)
  const d3 = tPhase3(k)
  if (t < T0) return -90
  const u0 = t - T0
  if (u0 < 3) {
    const s = u0 / 3
    return -90 + 115 * s * s * (3 - 2 * s)
  }
  if (u0 < 16) return 25 - 17 * (1 - Math.exp(-(u0 - 3) / 4))
  if (t < tP) {
    const f = (t - T0 - 16) / (tP - T0 - 16)
    return V1 - (V1 + 2) * Math.pow(f, 1.6)
  }
  if (t < tP + d3) {
    const u = (t - tP) / d3
    return -2 - 88 * ((1 - Math.cos(Math.PI * u)) / 2)
  }
  return -90
}

const r1 = (v: number) => Math.round(v * 10) / 10

function apPath(k: number, from = 0, to = T_MAX): string {
  let d = ''
  let t = from
  while (t <= to + 1e-6) {
    d += `${d ? 'L' : 'M'}${r1(x(t))} ${r1(y(apV(t, k)))}`
    const fine = t >= T0 - 1 && t < T0 + 18
    t += fine ? 0.5 : 2
  }
  return d
}

function phasePath(k: number, phase: PhaseId): string {
  const tP = tPlateauEnd(k)
  switch (phase) {
    case '0':
      return apPath(k, T0, T0 + 3)
    case '12':
      return apPath(k, T0 + 3, tP)
    case '3':
      return apPath(k, tP, tP + tPhase3(k))
    case '4':
      return `${apPath(k, 0, T0)}${apPath(k, tEnd(k), T_MAX)}`
  }
}

function ecgPath(k: number): string {
  const tP = tPlateauEnd(k)
  const d3 = tPhase3(k)
  const waves = [
    { at: T0 + 2, amp: -0.08, width: 3.5 },
    { at: T0 + 9, amp: 1, width: 5 },
    { at: T0 + 17, amp: -0.22, width: 4.5 },
    { at: tP + 0.42 * d3, amp: 0.2, width: 0.3 * d3 + 10 },
    { at: tP + 0.62 * d3, amp: 0.12, width: 0.2 * d3 },
  ]
  return toPath(sample(waves, 0, T_MAX, 2), { x0: X0, dx: 2 * XS, y0: ECG_BASE, yScale: ECG_GAIN, eps: 0.15 })
}

const PHASES: { id: PhaseId; badge: string; name: string; ion: string }[] = [
  { id: '0', badge: '0', name: 'Depolarisaatio', ion: 'Na⁺' },
  { id: '12', badge: '1–2', name: 'Plateau', ion: 'Ca²⁺' },
  { id: '3', badge: '3', name: 'Repolarisaatio', ion: 'K⁺ ulos' },
  { id: '4', badge: '4', name: 'Lepo', ion: 'lepopotentiaali' },
]

function Badge({ label, active, wide = false }: { label: string; active: boolean; wide?: boolean }) {
  const w = wide ? 30 : 19
  return (
    <g>
      <rect x={-w / 2} y={-9.5} width={w} height={19} rx={9.5} fill={active ? svg.brand : svg.ink} stroke={svg.raised} strokeWidth={1.5} />
      <text y={4.2} textAnchor="middle" fontSize={12} fontWeight={700} fill={svg.raised}>
        {label}
      </text>
    </g>
  )
}

function PhaseHighlight({ k, phase, active }: { k: MotionValue<number>; phase: PhaseId; active: boolean }) {
  const d = useTransform(k, (v) => phasePath(v, phase))
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={svg.brand}
      strokeWidth={8}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={false}
      animate={{ opacity: active ? 0.32 : 0 }}
      transition={{ duration: 0.2 }}
    />
  )
}

export default function ActionPotential(_props: WidgetProps) {
  const reduce = useReducedMotion() ?? false
  const [mode, setMode] = useState<Mode>('normal')
  const [phase, setPhase] = useState<PhaseId | null>(null)
  const k = useMotionValue(0)

  useEffect(() => {
    const controls = animate(k, mode === 'amio' ? 1 : 0, reduce ? { duration: 0 } : { type: 'spring', duration: 0.6, bounce: 0 })
    return () => controls.stop()
  }, [mode, reduce, k])

  const apD = useTransform(k, (v) => apPath(v))
  const ecgD = useTransform(k, ecgPath)
  const bandEdge = useTransform(k, (v) => x(tErp(v)))
  const bandD = useTransform(bandEdge, (e) => `M ${r1(x(T0))} ${AP_TOP} H ${r1(e)} V ${AP_BOTTOM} H ${r1(x(T0))} Z`)
  const bandLabelX = useTransform(k, (v) => (x(T0) + x(tErp(v))) / 2)
  const ghostOpacity = useTransform(k, [0, 1], [0, 0.6])
  const b2x = useTransform(k, (v) => x((T0 + 16 + tPlateauEnd(v)) / 2))
  const b3x = useTransform(k, (v) => x(tPlateauEnd(v) + 0.5 * tPhase3(v)) + 15)
  const qtEnd = useTransform(k, (v) => x(tEnd(v) + 4))
  const qtD = useTransform(qtEnd, (e) => `M ${x(T0)} 236 V 241 H ${r1(e)} V 236`)
  const qtLabelX = useTransform(qtEnd, (e) => (x(T0) + e) / 2)

  const ghostPath = apPath(0)
  const plateauV = apV((T0 + 16 + tPlateauEnd(0)) / 2, 0)

  return (
    <div className="space-y-4">
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: 'normal', label: 'Normaali' },
          { value: 'amio', label: 'Amiodaroni' },
        ]}
        layoutId="ap-mode"
      />

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="h-auto w-full"
        role="img"
        aria-label={
          mode === 'amio'
            ? 'Kammion sydänlihassolun toimintapotentiaali amiodaronin vaikutuksessa: plateau ja repolarisaatio pitenevät, refraktaariaika ja QT-aika pitenevät.'
            : 'Kammion sydänlihassolun toimintapotentiaali: vaihe 0 depolarisaatio, 1–2 plateau, 3 repolarisaatio, 4 lepo. Varjostettu alue on refraktaariaika.'
        }
      >
        {/* Refractory period band */}
        <motion.path d={bandD} fill={svg.tealSoft} aria-hidden />
        <motion.line
          x1={0}
          x2={0}
          y1={AP_TOP}
          y2={AP_BOTTOM}
          stroke={svg.teal}
          strokeWidth={1.5}
          strokeDasharray="3 3"
          style={{ x: bandEdge }}
          aria-hidden
        />
        <line x1={x(T0)} x2={x(T0)} y1={AP_TOP} y2={AP_BOTTOM} stroke={svg.teal} strokeWidth={1.5} strokeDasharray="3 3" aria-hidden />
        {/* Normal ERP end, shown for comparison once amiodarone is on */}
        <motion.line
          x1={x(tErp(0))}
          x2={x(tErp(0))}
          y1={AP_TOP + 6}
          y2={AP_BOTTOM}
          stroke={svg.dim}
          strokeWidth={1.2}
          strokeDasharray="2 3"
          style={{ opacity: ghostOpacity }}
          aria-hidden
        />
        <motion.text
          x={0}
          y={15}
          textAnchor="middle"
          fontSize={12.5}
          fontWeight={700}
          fill={TEXT_TEAL}
          style={{ x: bandLabelX }}
        >
          Refraktaariaika
        </motion.text>

        {/* Axes */}
        <g aria-hidden>
          <line x1={X0} x2={X1} y1={y(0)} y2={y(0)} stroke={svg.dim} strokeOpacity={0.4} strokeWidth={1} strokeDasharray="2 4" />
          <line x1={X0} x2={X1} y1={y(-90)} y2={y(-90)} stroke={svg.dim} strokeOpacity={0.25} strokeWidth={1} strokeDasharray="2 4" />
          <text x={41} y={y(0) + 4} textAnchor="end" fontSize={12} fill={svg.dim}>
            0 mV
          </text>
          <text x={41} y={y(-90) + 4} textAnchor="end" fontSize={12} fill={svg.dim}>
            −90
          </text>
          <text x={41} y={ECG_BASE + 4} textAnchor="end" fontSize={12} fontWeight={600} fill={svg.dim}>
            EKG
          </text>
          {/* 100 ms scale bar */}
          <line x1={x(410)} x2={x(510)} y1={196} y2={196} stroke={svg.dim} strokeWidth={1.5} strokeLinecap="round" />
          <text x={x(460)} y={190} textAnchor="middle" fontSize={12} fill={svg.dim}>
            100 ms
          </text>
        </g>

        {/* Phase highlight (tap a phase below) */}
        <g aria-hidden>
          {PHASES.map((p) => (
            <PhaseHighlight key={p.id} k={k} phase={p.id} active={phase === p.id} />
          ))}
        </g>

        {/* Normal curve ghost (amiodarone comparison) */}
        <motion.path
          d={ghostPath}
          fill="none"
          stroke={svg.dim}
          strokeWidth={1.6}
          strokeDasharray="4 4"
          strokeLinejoin="round"
          style={{ opacity: ghostOpacity }}
          aria-hidden
        />

        {/* Action potential */}
        <motion.path d={apD} fill="none" stroke={svg.ink} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" aria-hidden />

        {/* Ion labels */}
        <g aria-hidden fontSize={12} fontWeight={600}>
          <text x={x(T0) + 9} y={y(-68)} fill={svg.dim}>
            Na⁺
          </text>
          <motion.text x={0} y={y(plateauV) + 20} textAnchor="middle" fill={svg.dim} style={{ x: b2x }}>
            Ca²⁺
          </motion.text>
        </g>

        {/* Phase badges */}
        <g aria-hidden>
          <g transform={`translate(${x(T0) - 14} ${y(-40)})`}>
            <Badge label="0" active={phase === '0'} />
          </g>
          <g transform={`translate(${x(T0 + 9) + 12} ${y(25) - 1})`}>
            <Badge label="1" active={phase === '12'} />
          </g>
          <motion.g style={{ x: b2x, y: y(plateauV) - 16 }}>
            <Badge label="2" active={phase === '12'} />
          </motion.g>
          <motion.g style={{ x: b3x, y: y(-46) }}>
            <Badge label="3" active={phase === '3'} />
            <text x={14} y={4.2} fontSize={12} fontWeight={600} fill={mode === 'amio' ? svg.danger : svg.dim}>
              K⁺
            </text>
            {/* K⁺ channel block marker */}
            <motion.g style={{ opacity: k }}>
              <circle cx={40} cy={0} r={6.5} fill="none" stroke={svg.danger} strokeWidth={1.8} />
              <line x1={35.4} y1={4.6} x2={44.6} y2={-4.6} stroke={svg.danger} strokeWidth={1.8} strokeLinecap="round" />
            </motion.g>
          </motion.g>
          <g transform={`translate(${x(480)} ${y(-90) - 15})`}>
            <Badge label="4" active={phase === '4'} />
          </g>
        </g>

        {/* ECG below: T wave = repolarisation, QT interval follows the action potential duration */}
        <motion.path d={ecgD} fill="none" stroke={svg.ink} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" aria-hidden />
        <motion.path d={qtD} fill="none" stroke={svg.brand} strokeWidth={1.4} strokeLinejoin="round" aria-hidden />
        <motion.text x={0} y={256} textAnchor="middle" fontSize={12} fontWeight={700} fill={svg.brand} style={{ x: qtLabelX }}>
          QT-aika
        </motion.text>
      </svg>

      {/* Phase legend (tap to highlight) */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {PHASES.map((p) => {
          const active = phase === p.id
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              onClick={() => setPhase(active ? null : p.id)}
              className={`flex min-h-[52px] items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] ${
                active ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border)]'
              }`}
            >
              <span
                className={`flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 text-[12px] font-bold ${
                  active ? 'bg-brand-500 text-white' : 'bg-[var(--text)] text-[var(--bg-raised)]'
                }`}
                aria-hidden
              >
                {p.badge}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-tight text-[var(--text)]">{p.name}</span>
                <span className="block text-[12px] leading-tight text-[var(--text-dim)]">{p.ion}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {mode === 'normal' ? (
        <motion.div
          key="normal"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.45, bounce: 0 }}
          className="rounded-xl bg-[var(--bg)] px-4 py-3"
        >
          <p className="font-display text-[15px] font-semibold text-[var(--text)]">Refraktaariaika</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-dim)]">
            Aika, jolloin solu ei voi uudelleen aktivoitua (varjostettu alue). Valitse <strong className="font-semibold text-[var(--text)]">Amiodaroni</strong>{' '}
            nähdäksesi, miten lääke muuttaa käyrää.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="amio"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.45, bounce: 0 }}
          className="space-y-2.5"
        >
          <div className="rounded-xl border border-brand-500/25 bg-brand-500/[0.06] px-4 py-3">
            <p className="font-display text-[15px] font-semibold text-[var(--text)]">Amiodaroni – luokan III rytmihäiriölääke</p>
            <ul className="mt-2 space-y-1.5 text-[13.5px] leading-snug text-[var(--text-dim)]">
              <li className="flex gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                <span>
                  <strong className="font-semibold text-[var(--text)]">Kaliumkanavien salpaus</strong> pidentää toimintapotentiaalin kestoa ja
                  refraktaariaikaa
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                <span>→ kiertävä impulssi kohtaa palautumattoman kudoksen ja sammuu</span>
              </li>
              <li className="flex gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                <span>Lisäksi natrium- ja kalsiumkanavia sekä alfa- ja beetareseptoreita salpaava vaikutus</span>
              </li>
            </ul>
          </div>
          <Result tone="danger" title="Pidentää myös QT-aikaa">
            Vasta-aiheinen pitkässä QT-ajassa ja kääntyvien kärkien kammiotakykardiassa.
          </Result>
        </motion.div>
      )}
    </div>
  )
}
