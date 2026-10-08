import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Result, type Tone } from '../ui'

interface Item {
  label: string
  group?: string
  /** Small right-aligned note, e.g. a risk ratio. */
  hint?: string
}
interface Outcome {
  title: string
  text?: string
  tone?: Tone
}
interface Rule {
  type: 'any' | 'atLeast' | 'groups'
  /** Word shown after the group counter, e.g. "elinjärjestelmää" (default). */
  unit?: string
  n?: number
}

export default function Checklist(props: WidgetProps) {
  const items = (props.items as Item[] | undefined) ?? []
  const rule = (props.rule as Rule | undefined) ?? { type: 'any' }
  const met = props.met as Outcome
  const notMet = props.notMet as Outcome
  const prompt = props.prompt as string | undefined
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const groups = useMemo(() => {
    const order: string[] = []
    for (const it of items) {
      const g = it.group ?? ''
      if (!order.includes(g)) order.push(g)
    }
    return order
  }, [items])

  const count = checked.size
  const groupsHit = new Set(Array.from(checked).map((i) => items[i].group ?? '')).size
  const n = rule.n ?? 1
  const isMet = rule.type === 'any' ? count >= 1 : rule.type === 'atLeast' ? count >= n : groupsHit >= n

  function toggle(i: number) {
    setChecked((s) => {
      const next = new Set(s)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const counterText =
    rule.type === 'groups' ? `${groupsHit}/${n} ${rule.unit ?? 'elinjärjestelmää'}` : rule.type === 'atLeast' ? `${count}/${n} löydöstä` : `${count} valittu`

  return (
    <div>
      {prompt && <p className="mb-3 text-[13px] text-[var(--text-dim)]">{prompt}</p>}
      <div className="flex flex-col gap-3">
        {groups.map((g) => (
          <div key={g || 'default'}>
            {g && <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{g}</p>}
            <div className="flex flex-col gap-1.5">
              {items.map((it, i) =>
                (it.group ?? '') !== g ? null : (
                  <button
                    key={i}
                    role="checkbox"
                    aria-checked={checked.has(i)}
                    onClick={() => toggle(i)}
                    className={`flex min-h-[44px] items-center gap-3 rounded-xl border px-3 py-2 text-left text-[13px] leading-snug transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.99] ${
                      checked.has(i) ? 'border-brand-500/50 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text)]'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ${
                        checked.has(i) ? 'border-brand-500 bg-brand-500 text-white' : 'border-[var(--border)] bg-[var(--bg-raised)]'
                      }`}
                    >
                      {checked.has(i) && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">{it.label}</span>
                    {it.hint && <span className="shrink-0 font-display text-[12px] font-semibold tabular-nums text-[var(--text-dim)]">{it.hint}</span>}
                  </button>
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-[12px] text-[var(--text-dim)]">
          <span className="tabular-nums">{counterText}</span>
          {count > 0 && (
            <button onClick={() => setChecked(new Set())} className="min-h-[32px] px-2 font-medium">
              Tyhjennä
            </button>
          )}
        </div>
        {isMet ? (
          <Result tone={met.tone ?? 'danger'} title={met.title}>
            {met.text}
          </Result>
        ) : (
          <Result tone={notMet.tone ?? 'neutral'} title={notMet.title}>
            {notMet.text}
          </Result>
        )}
      </div>
    </div>
  )
}
