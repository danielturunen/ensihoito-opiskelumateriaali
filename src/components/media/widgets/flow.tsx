import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { toneSurface, toneText, type Tone } from '../ui'

interface Branch {
  label: string
  title: string
  text?: string
  tone?: Tone
}
interface Step {
  title: string
  text?: string
  tone?: Tone
  branches?: Branch[]
}

function Connector() {
  return (
    <div className="flex justify-center py-1" aria-hidden>
      <svg width="14" height="22" viewBox="0 0 14 22">
        <path d="M7 1v16" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
        <path d="M2.5 13.5 7 18.5l4.5-5" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function Node({ step, index, expanded, onToggle }: { step: Step; index: number; expanded: boolean; onToggle: () => void }) {
  const tone = step.tone ?? 'neutral'
  const expandable = Boolean(step.text)
  return (
    <button
      onClick={expandable ? onToggle : undefined}
      className={`w-full rounded-xl border px-3.5 py-3 text-left transition-transform duration-150 ease-out ${toneSurface[tone]} ${expandable ? 'active:scale-[0.99]' : 'cursor-default'}`}
      aria-expanded={expandable ? expanded : undefined}
    >
      <span className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--bg-raised)] font-display text-[11px] font-bold text-[var(--text-dim)]">
          {index + 1}
        </span>
        <span className={`min-w-0 flex-1 font-display text-[14px] font-semibold leading-snug ${toneText[tone]}`}>{step.title}</span>
        {expandable && (
          <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-[var(--text-dim)] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        )}
      </span>
      <AnimatePresence initial={false}>
        {expandable && expanded && (
          <motion.span
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="block overflow-hidden pl-[30px] text-[13px] leading-relaxed text-[var(--text-dim)]"
          >
            <span className="block pt-1.5">{step.text}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

function Branches({ branches }: { branches: Branch[] }) {
  return (
    <div className={`grid gap-2 ${branches.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
      {branches.map((b) => {
        const tone = b.tone ?? 'neutral'
        return (
          <div key={b.label + b.title} className={`rounded-xl border px-3 py-2.5 ${toneSurface[tone]}`}>
            <span className="inline-block rounded-md bg-[var(--bg-raised)] px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-dim)]">{b.label}</span>
            <p className={`mt-1.5 font-display text-[13px] font-semibold leading-snug ${toneText[tone]}`}>{b.title}</p>
            {b.text && <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-dim)]">{b.text}</p>}
          </div>
        )
      })}
    </div>
  )
}

export default function Flow(props: WidgetProps) {
  const steps = (props.steps as Step[] | undefined) ?? []
  const reduce = useReducedMotion()
  const [mode, setMode] = useState<'all' | 'step'>('all')
  const [shown, setShown] = useState(1)
  const [open, setOpen] = useState<Set<number>>(new Set())

  const visible = mode === 'all' ? steps.length : shown
  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(i)) n.delete(i)
      else n.add(i)
      return n
    })

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={() => setMode('all')}
          className={`min-h-[36px] rounded-full px-3.5 text-[12px] font-semibold transition-colors duration-150 ${mode === 'all' ? 'bg-brand-500 text-white' : 'bg-[var(--bg-card)] text-[var(--text-dim)]'}`}
        >
          Koko kaavio
        </button>
        <button
          onClick={() => {
            setMode('step')
            setShown(1)
          }}
          className={`min-h-[36px] rounded-full px-3.5 text-[12px] font-semibold transition-colors duration-150 ${mode === 'step' ? 'bg-brand-500 text-white' : 'bg-[var(--bg-card)] text-[var(--text-dim)]'}`}
        >
          Vaihe kerrallaan
        </button>
        <button
          onClick={() => setOpen(open.size === steps.length ? new Set() : new Set(steps.map((_, i) => i)))}
          className="ml-auto min-h-[36px] rounded-full px-3 text-[12px] font-medium text-[var(--text-dim)]"
        >
          {open.size === steps.length ? 'Piilota tiedot' : 'Avaa kaikki'}
        </button>
      </div>

      <div>
        {steps.slice(0, visible).map((step, i) => (
          <motion.div
            key={i}
            initial={reduce || mode === 'all' ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            {i > 0 && <Connector />}
            <Node step={step} index={i} expanded={open.has(i)} onToggle={() => toggle(i)} />
            {step.branches && (
              <>
                <Connector />
                <Branches branches={step.branches} />
              </>
            )}
          </motion.div>
        ))}
      </div>

      {mode === 'step' && (
        <div className="mt-4 flex justify-end gap-2">
          {shown >= steps.length ? (
            <button onClick={() => setShown(1)} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[var(--bg-card)] px-4 text-[13px] font-semibold text-[var(--text)] active:scale-[0.97]">
              <RotateCcw className="h-4 w-4" /> Alusta
            </button>
          ) : (
            <button
              onClick={() => {
                setShown((n) => n + 1)
                setOpen((s) => new Set(s).add(shown))
              }}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-full bg-brand-500 px-4 text-[13px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              Seuraava vaihe <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
