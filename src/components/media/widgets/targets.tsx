import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Result, Segmented } from '../ui'

interface Target {
  label: string
  from: number
  to: number
  text?: string
}

export default function Targets(props: WidgetProps) {
  const targets = (props.targets as Target[] | undefined) ?? []
  const min = (props.min as number | undefined) ?? 0
  const max = (props.max as number | undefined) ?? 100
  const unit = (props.unit as string | undefined) ?? ''
  const label = (props.label as string | undefined) ?? 'Mitattu arvo'
  const [idx, setIdx] = useState('0')
  const [value, setValue] = useState<number>((props.value as number | undefined) ?? Math.round((min + max) / 2))

  const t = targets[Number(idx)]
  if (!t) return null
  const pct = (v: number) => ((v - min) / (max - min)) * 100
  const status = value < t.from ? 'low' : value > t.to ? 'high' : 'ok'

  return (
    <div>
      <Segmented
        layoutId={`targets-${targets.map((x) => x.label).join('')}`}
        value={idx}
        onChange={setIdx}
        size="sm"
        options={targets.map((x, i) => ({ value: String(i), label: x.label }))}
      />

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-[var(--text-dim)]">
          Tavoite:{' '}
          <span className="font-display font-semibold text-teal-600">
            {t.from}–{t.to} {unit}
          </span>
        </span>
        <span className="font-display text-3xl font-bold tabular-nums text-[var(--text)]">
          {value}
          <span className="ml-0.5 text-[14px] font-medium text-[var(--text-dim)]">{unit}</span>
        </span>
      </div>

      <div className="relative mt-3 h-5 rounded-full bg-[var(--bg-card)]">
        <motion.div
          className="absolute inset-y-0 rounded-full bg-teal-500/40 ring-1 ring-teal-500"
          animate={{ left: `${pct(t.from)}%`, width: `${pct(t.to) - pct(t.from)}%` }}
          transition={{ type: 'spring', duration: 0.45, bounce: 0.1 }}
        />
        <div className="pointer-events-none absolute inset-y-[-5px] w-1 -translate-x-1/2 rounded-full bg-[var(--text)]" style={{ left: `${pct(value)}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] tabular-nums text-[var(--text-dim)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label={label}
        className="mt-1 h-8 w-full cursor-pointer accent-brand-500"
      />

      <div className="mt-2">
        <Result
          tone={status === 'ok' ? 'ok' : status === 'low' ? 'danger' : 'warning'}
          title={status === 'ok' ? 'Tavoitealueella' : status === 'low' ? 'Alle tavoitteen' : 'Yli tavoitteen'}
        >
          {t.text}
        </Result>
      </div>
    </div>
  )
}
