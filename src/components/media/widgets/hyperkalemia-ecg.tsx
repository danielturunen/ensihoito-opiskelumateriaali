import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg, type Tone, toneSurface, toneText } from '../ui'
import { FadeSwap } from '../parts/resp-kit'

type Stage = 'normal' | 'peakedT' | 'pLoss' | 'wideQrs' | 'sine'

interface Wave {
  at: number
  amp: number
  w: number
}

/* One beat as a sum of Gaussian bumps (time in s relative to the R peak). Schematic shapes. */
const BEATS: Record<Stage, Wave[]> = {
  normal: [
    { at: -0.17, amp: 0.13, w: 0.028 },
    { at: -0.03, amp: -0.1, w: 0.01 },
    { at: 0, amp: 1, w: 0.012 },
    { at: 0.03, amp: -0.25, w: 0.012 },
    { at: 0.28, amp: 0.27, w: 0.055 },
  ],
  peakedT: [
    { at: -0.17, amp: 0.12, w: 0.028 },
    { at: -0.03, amp: -0.1, w: 0.01 },
    { at: 0, amp: 1, w: 0.012 },
    { at: 0.03, amp: -0.28, w: 0.012 },
    { at: 0.25, amp: 0.85, w: 0.032 },
  ],
  pLoss: [
    { at: -0.25, amp: 0.05, w: 0.04 },
    { at: -0.035, amp: -0.08, w: 0.014 },
    { at: 0, amp: 0.9, w: 0.02 },
    { at: 0.045, amp: -0.32, w: 0.02 },
    { at: 0.28, amp: 0.8, w: 0.036 },
  ],
  wideQrs: [
    { at: 0, amp: 0.75, w: 0.045 },
    { at: 0.1, amp: -0.42, w: 0.05 },
    { at: 0.34, amp: 0.7, w: 0.05 },
  ],
  sine: [
    { at: 0, amp: 0.7, w: 0.085 },
    { at: 0.2, amp: -0.6, w: 0.085 },
    { at: 0.4, amp: 0.55, w: 0.085 },
  ],
}

const INFO: Record<Stage, { label: string; title: string; tone: Tone; text: string; mark?: { t: number; label: string } }> = {
  normal: { label: 'Normaali', title: 'Normaali EKG', tone: 'ok', text: 'P-aalto, kapea QRS ja matala, pyöreä T-aalto. P-K normaalisti noin 3,5–5,0 mmol/l.' },
  peakedT: {
    label: 'Korkea T',
    title: '1. Korkea, piikkimäinen T-aalto',
    tone: 'warning',
    text: 'Ensimmäinen ja yleisin muutos. QT-aika normaali tai lyhentynyt. Muista: korkea T voi olla myös hyperakuutin iskemian merkki.',
    mark: { t: 0.25, label: 'piikkimäinen T' },
  },
  pLoss: {
    label: 'P katoaa',
    title: '2. PQ pitenee, P-aallot madaltuvat',
    tone: 'warning',
    text: 'PQ-aika pitenee ja P-aallot madaltuvat ja lopulta katoavat. QRS alkaa levetä.',
    mark: { t: -0.25, label: 'matala P' },
  },
  wideQrs: {
    label: 'Leveä QRS',
    title: '3. QRS-kompleksi levenee',
    tone: 'danger',
    text: 'P-aaltoja ei enää erotu ja QRS on leveä. Hengenvaarallisten rytmihäiriöiden riski kasvaa – suojaa sydäntä kalsiumilla.',
    mark: { t: 0.05, label: 'leveä QRS' },
  },
  sine: {
    label: 'Sinikäyrä',
    title: '4. Sinikäyrä',
    tone: 'danger',
    text: 'QRS erittäin leveä ja muodoton, S- ja T-aallot sulautuvat yhteen. Uhkaava kammiovärinä tai asystole.',
  },
}

const ORDER: Stage[] = ['normal', 'peakedT', 'pLoss', 'wideQrs', 'sine']

const W = 340
const H = 120
const BASE = 74
const GAIN = 50
const RR = 0.9 // s between beats
const PX_PER_S = 110

function path(stage: Stage) {
  const waves = BEATS[stage]
  const beatTimes = [0.45, 0.45 + RR, 0.45 + 2 * RR, 0.45 + 3 * RR]
  let d = ''
  for (let x = 0; x <= W; x += 2) {
    const t = x / PX_PER_S
    let v = 0
    for (const b of beatTimes) for (const w of waves) {
      const z = (t - b - w.at) / w.w
      if (z > -5 && z < 5) v += w.amp * Math.exp(-0.5 * z * z)
    }
    d += `${x ? 'L' : 'M'}${x} ${(BASE - v * GAIN).toFixed(1)}`
  }
  return d
}

const PATHS = Object.fromEntries(ORDER.map((s) => [s, path(s)])) as Record<Stage, string>

export default function HyperkalemiaEcg(_props: WidgetProps) {
  const [stage, setStage] = useState<Stage>('normal')
  const reduce = useReducedMotion()
  const info = INFO[stage]
  const idx = ORDER.indexOf(stage)
  const markX = info.mark ? (0.45 + RR + info.mark.t) * PX_PER_S : null

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-[#070b14] p-2">
        <div className="mb-1 flex items-center justify-between px-1">
          <span className="text-[10px] font-semibold tracking-wide text-[#4ade80]">II</span>
          <span className="text-[10px] font-medium text-[#64748b]">kaaviokuva</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${info.title}. ${info.text}`}>
          <defs>
            <pattern id="hk-grid" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M22 0H0V22" fill="none" stroke="rgba(74,222,128,0.12)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#hk-grid)" />
          <motion.path
            d={PATHS[stage]}
            initial={false}
            animate={{ d: PATHS[stage] }}
            transition={reduce ? { duration: 0 } : { duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            fill="none"
            stroke="#4ade80"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {markX !== null && info.mark && (
            <motion.g key={stage} initial={reduce ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <path d={`M${markX} 14v10m-4 -4l4 4 4 -4`} stroke="#fbbf24" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <text x={markX} y={11} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fbbf24">
                {info.mark.label}
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1" role="tablist" aria-label="Hyperkalemian vaiheet">
        {ORDER.map((s, i) => {
          const on = s === stage
          return (
            <button
              key={s}
              role="tab"
              aria-selected={on}
              onClick={() => setStage(s)}
              className={`flex min-h-[48px] flex-col items-center justify-center rounded-lg px-0.5 text-center text-[11px] font-semibold leading-tight transition-colors duration-150 ${
                on ? 'bg-[var(--bg-raised)] text-[var(--text)] shadow-sm ring-1 ring-[var(--border)]' : 'text-[var(--text-dim)]'
              }`}
            >
              <span className={`mb-1 h-1.5 w-full rounded-full ${i <= idx ? (i >= 3 ? 'bg-danger-500' : i >= 1 ? 'bg-brand-500' : 'bg-teal-500') : 'bg-[var(--border)]'}`} />
              {INFO[s].label}
            </button>
          )
        })}
      </div>
      <div className="mt-1 flex justify-between px-1 text-[11px] text-[var(--text-dim)]">
        <span>Kalium normaali</span>
        <span>Kalium nousee →</span>
      </div>

      <FadeSwap k={stage} className={`mt-3 rounded-xl border px-4 py-3 ${toneSurface[info.tone]}`}>
        <p className={`font-display text-[15px] font-semibold ${toneText[info.tone]}`}>{info.title}</p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text)]">{info.text}</p>
      </FadeSwap>
      <p className="mt-2 text-[12px] leading-relaxed" style={{ color: svg.dim }}>
        Selvää kaliumrajaa muutoksille ei ole, mutta niitä nähdään yleensä, kun P-K ylittää 5,5–6,0 mmol/l.
      </p>
    </div>
  )
}
