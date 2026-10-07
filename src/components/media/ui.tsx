import { type ReactNode } from 'react'
import { motion } from 'motion/react'

/* Shared building blocks for media widgets. Widgets render INSIDE MediaBlock's frame,
 * so they only provide their own content. Keep every tap target >= 44px tall. */

export type Tone = 'neutral' | 'brand' | 'ok' | 'warning' | 'danger' | 'info'

export const toneText: Record<Tone, string> = {
  neutral: 'text-[var(--text)]',
  brand: 'text-brand-600',
  ok: 'text-teal-600',
  warning: 'text-brand-600',
  danger: 'text-danger-500',
  info: 'text-[var(--text-dim)]',
}

export const toneSurface: Record<Tone, string> = {
  neutral: 'border-[var(--border)] bg-[var(--bg-card)]',
  brand: 'border-brand-500/30 bg-brand-500/8',
  ok: 'border-teal-500/30 bg-teal-500/10',
  warning: 'border-brand-500/35 bg-brand-500/10',
  danger: 'border-danger-500/35 bg-danger-500/10',
  info: 'border-[var(--border)] bg-[var(--bg-card)]',
}

/** Raw colors for SVG fills/strokes (CSS variables keep light/dark correct). */
export const svg = {
  ink: 'var(--text)',
  dim: 'var(--text-dim)',
  line: 'var(--border)',
  surface: 'var(--bg-card)',
  raised: 'var(--bg-raised)',
  brand: '#f8690a',
  brandSoft: 'rgba(248,105,10,0.18)',
  teal: '#0fb8ac',
  tealSoft: 'rgba(15,184,172,0.18)',
  danger: '#dc2626',
  dangerSoft: 'rgba(220,38,38,0.16)',
  blood: '#c2410c',
  air: '#7dd3fc',
  airSoft: 'rgba(125,211,252,0.28)',
} as const

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  layoutId,
  size = 'md',
  wrap = false,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  layoutId: string
  size?: 'sm' | 'md'
  /** Two-column grid on phones instead of a horizontally scrolling row – use when every option must stay visible. */
  wrap?: boolean
}) {
  return (
    <div
      className={`no-select w-full gap-1 rounded-xl bg-[var(--bg)] p-1 ${
        wrap ? 'grid grid-cols-2 min-[560px]:flex min-[560px]:overflow-x-auto [scrollbar-width:none] [&>*:last-child:nth-child(odd)]:col-span-2' : 'flex overflow-x-auto [scrollbar-width:none]'
      }`}
      role="tablist"
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`relative min-h-[40px] flex-1 shrink-0 whitespace-nowrap rounded-lg px-3 font-medium transition-colors duration-150 ${
              size === 'sm' ? 'text-[12px]' : 'text-[13px]'
            } ${active ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'}`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-[var(--bg-raised)] shadow-sm"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Result({ tone = 'neutral', title, children }: { tone?: Tone; title: ReactNode; children?: ReactNode }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${toneSurface[tone]}`} aria-live="polite">
      <p className={`font-display text-[15px] font-semibold ${toneText[tone]}`}>{title}</p>
      {children && <div className="mt-1 text-[13px] leading-relaxed text-[var(--text-dim)]">{children}</div>}
    </div>
  )
}

export function Stat({ label, value, tone = 'neutral' }: { label: string; value: ReactNode; tone?: Tone }) {
  return (
    <div className="rounded-xl bg-[var(--bg)] px-3 py-2.5 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-dim)]">{label}</p>
      <p className={`font-display text-2xl font-bold tabular-nums ${toneText[tone]}`}>{value}</p>
    </div>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  unit?: string
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-[13px] font-medium text-[var(--text-dim)]">
        {label}
        <span className="font-display text-[15px] font-semibold tabular-nums text-[var(--text)]">
          {value}
          {unit && <span className="ml-0.5 text-[12px] font-medium text-[var(--text-dim)]">{unit}</span>}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-8 w-full cursor-pointer accent-brand-500"
      />
    </label>
  )
}

export function OptionList<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; hint?: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={String(o.value)}
            onClick={() => onChange(o.value)}
            className={`flex min-h-[44px] items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-left text-[13px] transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.99] ${
              active ? 'border-brand-500 bg-brand-500/10 font-medium text-[var(--text)]' : 'border-[var(--border)] text-[var(--text)]'
            }`}
          >
            <span>{o.label}</span>
            {o.hint && <span className="shrink-0 font-display text-[13px] font-semibold tabular-nums text-[var(--text-dim)]">{o.hint}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function Caption({ children }: { children: ReactNode }) {
  return <p className="text-[12px] leading-relaxed text-[var(--text-dim)]">{children}</p>
}
