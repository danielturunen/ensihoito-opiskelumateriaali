import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, X } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Result } from '../ui'

/* Generic "select all that apply" exercise. Props:
 * { prompt?, items: [{ q, options: [{ label, correct, note? }], explain? }] } */

interface Opt {
  label: string
  correct: boolean
  note?: string
}
interface Item {
  q: string
  options: Opt[]
  explain?: string
}

export default function SelectAll(props: WidgetProps) {
  const items = useMemo(() => (props.items as Item[] | undefined) ?? [], [props.items])
  const prompt = (props.prompt as string | undefined) ?? 'Valitse kaikki oikeat vaihtoehdot ja tarkista.'
  const [idx, setIdx] = useState(0)
  const [sel, setSel] = useState<Set<number>>(new Set())
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState<number[]>([])
  const reduce = useReducedMotion()

  if (items.length === 0) return null
  const done = idx >= items.length
  const item = items[Math.min(idx, items.length - 1)]
  const right = item.options.every((o, i) => o.correct === sel.has(i))

  function toggle(i: number) {
    if (checked) return
    setSel((s) => {
      const n = new Set(s)
      if (n.has(i)) n.delete(i)
      else n.add(i)
      return n
    })
  }
  function check() {
    setChecked(true)
    setScore((s) => [...s, right ? 1 : 0])
  }
  function next() {
    setIdx((i) => i + 1)
    setSel(new Set())
    setChecked(false)
  }
  function restart() {
    setIdx(0)
    setSel(new Set())
    setChecked(false)
    setScore([])
  }

  if (done) {
    const ok = score.reduce((a, b) => a + b, 0)
    return (
      <div>
        <Result tone={ok === items.length ? 'ok' : 'warning'} title={`${ok} / ${items.length} täysin oikein`}>
          Tarkista vaikeimmat kohdat artikkelista – ja kokeile uudelleen.
        </Result>
        <button onClick={restart} className="mt-2 min-h-[44px] w-full rounded-xl bg-brand-500 text-[13px] font-semibold text-white active:scale-[0.98]">
          Aloita alusta
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
        {idx + 1} / {items.length}
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={idx} initial={reduce ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
          <p className="font-display text-[15px] font-semibold leading-snug text-[var(--text)]">{item.q}</p>
          <p className="mb-2 mt-0.5 text-[12px] text-[var(--text-dim)]">{prompt}</p>
          <div className="flex flex-col gap-1.5">
            {item.options.map((o, i) => {
              const on = sel.has(i)
              let cls = on ? 'border-brand-500/60 bg-brand-500/10' : 'border-[var(--border)]'
              if (checked) cls = o.correct ? 'border-teal-500/50 bg-teal-500/10' : on ? 'border-danger-500/45 bg-danger-500/10' : 'border-[var(--border)] opacity-60'
              return (
                <button key={o.label} role="checkbox" aria-checked={on} onClick={() => toggle(i)} className={`flex min-h-[44px] items-start gap-3 rounded-xl border px-3 py-2 text-left text-[13px] transition-[background-color,border-color,opacity] duration-150 ${cls}`}>
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${on ? 'border-brand-500 bg-brand-500 text-white' : 'border-[var(--border)] bg-[var(--bg-raised)]'}`}>
                    {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span className="flex-1">
                    <span className="text-[var(--text)]">{o.label}</span>
                    {checked && o.note && <span className="mt-0.5 block text-[12px] leading-snug text-[var(--text-dim)]">{o.note}</span>}
                  </span>
                  {checked &&
                    (o.correct ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={3} /> : on ? <X className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" strokeWidth={3} /> : null)}
                </button>
              )
            })}
          </div>
          {checked && (
            <div className="mt-2">
              <Result tone={right ? 'ok' : 'warning'} title={right ? 'Täysin oikein' : 'Osittain – vihreät ovat oikeat'}>
                {item.explain}
              </Result>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <button
        onClick={checked ? next : check}
        disabled={!checked && sel.size === 0}
        className="mt-3 min-h-[44px] w-full rounded-xl bg-brand-500 text-[13px] font-semibold text-white transition-opacity active:scale-[0.98] disabled:opacity-40"
      >
        {checked ? (idx === items.length - 1 ? 'Näytä tulos' : 'Seuraava') : 'Tarkista'}
      </button>
    </div>
  )
}
