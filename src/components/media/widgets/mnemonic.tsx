import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Eye, RotateCcw } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Segmented } from '../ui'

interface Item {
  letter: string
  word: string
  text?: string
}

export default function Mnemonic(props: WidgetProps) {
  const items = (props.items as Item[] | undefined) ?? []
  const name = (props.name as string | undefined) ?? items.map((i) => i.letter).join('')
  const [mode, setMode] = useState<'learn' | 'test'>('learn')
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [active, setActive] = useState<number | null>(null)
  const reduce = useReducedMotion()

  const isTest = mode === 'test'
  const allRevealed = revealed.size === items.length

  function tap(i: number) {
    if (isTest) {
      setRevealed((s) => new Set(s).add(i))
    }
    setActive((a) => (a === i ? null : i))
  }

  return (
    <div>
      <Segmented
        layoutId={`mn-${name}`}
        value={mode}
        onChange={(v) => {
          setMode(v)
          setRevealed(new Set())
          setActive(null)
        }}
        options={[
          { value: 'learn', label: 'Opettele' },
          { value: 'test', label: 'Testaa muistisi' },
        ]}
      />

      <p className="mt-3 text-center font-display text-[22px] font-bold tracking-[0.18em] text-[var(--text)]">{name}</p>
      {isTest && (
        <p className="mt-1 text-center text-[12px] text-[var(--text-dim)]">
          Muista sana ennen kuin napautat · {revealed.size}/{items.length} paljastettu
        </p>
      )}

      <div className="mt-3 flex flex-col gap-1.5">
        {items.map((item, i) => {
          const hidden = isTest && !revealed.has(i)
          const open = active === i
          return (
            <button
              key={i}
              onClick={() => tap(i)}
              className={`flex min-h-[48px] w-full flex-col rounded-xl border px-3 py-2 text-left transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.99] ${
                open ? 'border-brand-500/40 bg-brand-500/8' : 'border-[var(--border)] bg-[var(--bg-card)]'
              }`}
              aria-expanded={open}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 font-display text-[18px] font-bold text-white">{item.letter}</span>
                <span className="relative min-w-0 flex-1">
                  <AnimatePresence mode="wait" initial={false}>
                    {hidden ? (
                      <motion.span
                        key="hidden"
                        exit={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)' }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1.5 text-[13px] text-[var(--text-dim)]"
                      >
                        <Eye className="h-4 w-4" /> Napauta paljastaaksesi
                      </motion.span>
                    ) : (
                      <motion.span
                        key="word"
                        initial={reduce ? false : { opacity: 0, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.2 }}
                        className="block font-display text-[15px] font-semibold text-[var(--text)]"
                      >
                        {item.word}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </span>
              <AnimatePresence initial={false}>
                {open && !hidden && item.text && (
                  <motion.span
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className="block overflow-hidden pl-12 text-[13px] leading-relaxed text-[var(--text-dim)]"
                  >
                    <span className="block pt-1">{item.text}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </div>

      {isTest && allRevealed && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-teal-500/10 px-3.5 py-2.5">
          <span className="text-[13px] font-semibold text-teal-600">Kaikki käyty läpi – kuinka monta muistit?</span>
          <button
            onClick={() => {
              setRevealed(new Set())
              setActive(null)
            }}
            className="inline-flex min-h-[36px] items-center gap-1 rounded-full bg-[var(--bg-raised)] px-3 text-[12px] font-semibold text-[var(--text)]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Uudestaan
          </button>
        </div>
      )}
    </div>
  )
}
