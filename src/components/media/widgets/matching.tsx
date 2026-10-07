import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { Check, RotateCcw } from 'lucide-react'
import type { WidgetProps } from '../registry'

interface Pair {
  left: string
  right: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Matching(props: WidgetProps) {
  const pairs = useMemo(() => (props.pairs as Pair[] | undefined) ?? [], [props.pairs])
  const prompt = (props.prompt as string | undefined) ?? 'Valitse kohta ja napauta siihen kuuluvaa vastausta.'
  const [round, setRound] = useState(0)
  const order = useMemo(() => shuffle(pairs.map((_, i) => i)), [pairs, round])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [selected, setSelected] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [wrongChip, setWrongChip] = useState<number | null>(null)
  const controls = useAnimationControls()
  const reduce = useReducedMotion()

  const done = matched.size === pairs.length

  function pick(answerIndex: number) {
    if (done || matched.has(answerIndex)) return
    if (answerIndex === selected) {
      const next = new Set(matched).add(answerIndex)
      setMatched(next)
      const remaining = pairs.map((_, i) => i).filter((i) => !next.has(i))
      setSelected(remaining[0] ?? -1)
    } else {
      setMistakes((m) => m + 1)
      setWrongChip(answerIndex)
      if (!reduce) controls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.3 } })
      setTimeout(() => setWrongChip(null), 450)
    }
  }

  function restart() {
    setMatched(new Set())
    setSelected(0)
    setMistakes(0)
    setRound((r) => r + 1)
  }

  return (
    <div>
      <p className="mb-3 text-[13px] text-[var(--text-dim)]">{prompt}</p>

      <div className="flex flex-col gap-1.5">
        {pairs.map((p, i) => {
          const isMatched = matched.has(i)
          const isSelected = selected === i && !isMatched
          return (
            <motion.button
              key={i}
              animate={isSelected ? controls : undefined}
              onClick={() => !isMatched && setSelected(i)}
              className={`flex min-h-[48px] flex-col items-start gap-1 rounded-xl border px-3.5 py-2.5 text-left transition-[background-color,border-color] duration-150 ${
                isMatched
                  ? 'border-teal-500/40 bg-teal-500/10'
                  : isSelected
                    ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/20'
                    : 'border-[var(--border)] bg-[var(--bg-card)]'
              }`}
            >
              <span className="font-display text-[14px] font-semibold leading-snug text-[var(--text)]">{p.left}</span>
              <AnimatePresence>
                {isMatched && (
                  <motion.span
                    initial={reduce ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-[13px] text-teal-600"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} /> {p.right}
                  </motion.span>
                )}
              </AnimatePresence>
              {isSelected && <span className="text-[12px] text-brand-600">Valitse oikea vastaus alta ↓</span>}
            </motion.button>
          )
        })}
      </div>

      {!done && (
        <div className="mt-4 rounded-xl bg-[var(--bg)] p-2.5">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Vastausvaihtoehdot</p>
          <div className="flex flex-wrap gap-1.5">
            {order.map((ai) =>
              matched.has(ai) ? null : (
                <button
                  key={`${round}-${ai}`}
                  onClick={() => pick(ai)}
                  className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-[13px] leading-snug transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${
                    wrongChip === ai ? 'border-danger-500 bg-danger-500/10 text-danger-500' : 'border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text)]'
                  }`}
                >
                  {pairs[ai].right}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--text-dim)]">
        <span className="tabular-nums">
          {matched.size}/{pairs.length} oikein · {mistakes} virhettä
        </span>
        {(done || matched.size > 0) && (
          <button onClick={restart} className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-2 font-semibold text-[var(--text)]">
            <RotateCcw className="h-3.5 w-3.5" /> Uusi kierros
          </button>
        )}
      </div>
      {done && (
        <p className="mt-2 rounded-xl bg-teal-500/10 px-3.5 py-2.5 text-[13px] font-semibold text-teal-600">
          {mistakes === 0 ? 'Täydellinen suoritus – kaikki oikein ensimmäisellä yrityksellä!' : `Valmis! Virheitä matkalla ${mistakes} – kokeile uudestaan ilman virheitä.`}
        </p>
      )}
    </div>
  )
}
