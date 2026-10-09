import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Result, type Tone } from '../ui'

interface Band {
  from: number
  to: number
  label: string
  text?: string
  tone?: Tone
  /** Relative display width; bands are equal width by default so narrow-but-critical ranges stay tappable. */
  weight?: number
}

const bandColor: Record<Tone, string> = {
  neutral: 'var(--bg-card)',
  brand: 'rgba(248,105,10,0.35)',
  ok: 'rgba(15,184,172,0.45)',
  warning: 'rgba(248,105,10,0.55)',
  danger: 'rgba(220,38,38,0.6)',
  info: 'var(--border)',
}

export default function Scale(props: WidgetProps) {
  const bands = useMemo(() => (props.bands as Band[] | undefined) ?? [], [props.bands])
  const unit = (props.unit as string | undefined) ?? ''
  const step = (props.step as number | undefined) ?? 0.1
  const label = (props.label as string | undefined) ?? 'Arvo'
  const decimals = step < 1 ? 1 : 0

  const weights = bands.map((b) => b.weight ?? 1)
  const totalW = weights.reduce((a, b) => a + b, 0)
  const cum = weights.reduce<number[]>((acc, w) => [...acc, (acc[acc.length - 1] ?? 0) + w / totalW], [])

  const toPos = (v: number) => {
    let start = 0
    for (let i = 0; i < bands.length; i++) {
      const b = bands[i]
      if (v <= b.to || i === bands.length - 1) {
        // Single-value bands (from === to, e.g. a 0–4 grade) sit in the middle of their slot.
        const t = b.to === b.from ? 0.5 : Math.min(1, Math.max(0, (v - b.from) / (b.to - b.from)))
        return start + t * (cum[i] - start)
      }
      start = cum[i]
    }
    return 1
  }
  const fromPos = (p: number) => {
    let start = 0
    for (let i = 0; i < bands.length; i++) {
      if (p <= cum[i] || i === bands.length - 1) {
        const t = (p - start) / (cum[i] - start || 1)
        const b = bands[i]
        const raw = b.from + t * (b.to - b.from)
        return Math.round(raw / step) * step
      }
      start = cum[i]
    }
    return bands[bands.length - 1]?.to ?? 0
  }

  const [value, setValue] = useState<number>((props.value as number | undefined) ?? bands[Math.floor(bands.length / 2)]?.from ?? 0)
  const pos = toPos(value)
  const current =
    bands.find((b, i) => (b.from === b.to ? value === b.from : value >= b.from && (value < b.to || (i === bands.length - 1 && value <= b.to)))) ??
    bands[bands.length - 1]

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[var(--text-dim)]">{label}</span>
        <span className="font-display text-3xl font-bold tabular-nums text-[var(--text)]">
          {value.toFixed(decimals).replace('.', ',')}
          <span className="ml-1 text-[14px] font-medium text-[var(--text-dim)]">{unit}</span>
        </span>
      </div>

      <div className="relative mt-3 pb-7">
        <div className="flex h-4 overflow-hidden rounded-full">
          {bands.map((b, i) => (
            <div key={i} style={{ flexGrow: weights[i], background: bandColor[b.tone ?? 'neutral'] }} className="border-r border-[var(--bg-raised)] last:border-r-0" />
          ))}
        </div>
        {/* Full-width wrapper translated by % of its own width (= track width), so the thumb moves with a transform only. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-4px]"
          animate={{ x: `${pos * 100}%` }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
        >
          <div className="h-6 w-6 -translate-x-1/2 rounded-full border-2 border-[var(--bg-raised)] bg-[var(--text)] shadow-md" />
        </motion.div>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(pos * 1000)}
          onChange={(e) => setValue(fromPos(Number(e.target.value) / 1000))}
          aria-label={label}
          className="absolute inset-x-0 top-[-12px] h-10 w-full cursor-pointer opacity-0"
        />
        <div className="absolute inset-x-0 top-6 flex text-[10px] font-medium tabular-nums text-[var(--text-dim)]">
          {bands.map((b, i) => (
            <div key={i} style={{ flexGrow: weights[i] }} className="truncate pl-0.5">
              {String(b.from).replace('.', ',')}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {bands.map((b, i) => (
          <button
            key={i}
            onClick={() => setValue(Math.round(((b.from + b.to) / 2) / step) * step)}
            className={`min-h-[34px] rounded-full px-3 text-[12px] font-medium transition-colors duration-150 ${
              b === current ? 'bg-[var(--text)] text-[var(--bg)]' : 'bg-[var(--bg-card)] text-[var(--text-dim)]'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {current && (
        <Result tone={current.tone ?? 'neutral'} title={current.label}>
          {current.text}
        </Result>
      )}
    </div>
  )
}
