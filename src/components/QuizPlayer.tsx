import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronRight, RotateCcw, XCircle } from 'lucide-react'
import type { QuizQuestion } from '../content/types'

interface Props {
  questions: QuizQuestion[]
  mode: 'practice' | 'exam'
  onComplete?: (scorePct: number) => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function QuizPlayer({ questions, mode, onComplete }: Props) {
  const ordered = useMemo(() => shuffle(questions), [questions])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(false)

  const q = ordered[index]
  const total = ordered.length
  const selected = answers[index]

  function choose(i: number) {
    if (mode === 'practice' && revealed) return
    if (mode === 'exam' && answers[index] !== undefined) return
    setAnswers((a) => ({ ...a, [index]: i }))
    if (mode === 'practice') setRevealed(true)
  }

  function next() {
    if (index + 1 < total) {
      setIndex(index + 1)
      setRevealed(false)
    } else {
      const correct = ordered.filter((qq, i) => answers[i] === qq.correctIndex).length
      const pct = Math.round((correct / total) * 100)
      setFinished(true)
      onComplete?.(pct)
    }
  }

  function restart() {
    setIndex(0)
    setAnswers({})
    setRevealed(false)
    setFinished(false)
  }

  if (total === 0) return <p className="text-[var(--text-dim)]">Tietovisaa ei ole vielä saatavilla tälle aiheelle.</p>

  if (finished) {
    const correct = ordered.filter((qq, i) => answers[i] === qq.correctIndex).length
    const pct = Math.round((correct / total) * 100)
    return (
      <div className="animate-fade-up">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 text-center shadow-[var(--shadow)]">
          <p className="font-display text-5xl font-bold text-brand-500">{pct}%</p>
          <p className="mt-2 text-[15px] text-[var(--text-dim)]">
            {correct}/{total} oikein
          </p>
          <button onClick={restart} className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-brand-500/30">
            <RotateCcw className="h-4 w-4" /> Yritä uudelleen
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="font-display text-sm font-semibold text-[var(--text-dim)]">Käy läpi vastaukset</h3>
          {ordered.map((qq, i) => {
            const isCorrect = answers[i] === qq.correctIndex
            return (
              <div key={qq.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] p-4">
                <div className="flex items-start gap-2">
                  {isCorrect ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" />}
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium">{qq.question}</p>
                    <p className="mt-1 text-[13px] text-[var(--text-dim)]">
                      Oikea vastaus: <span className="font-medium text-[var(--text)]">{qq.options[qq.correctIndex]}</span>
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-dim)]">{qq.explanation}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-card)]">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <span className="shrink-0 text-[12px] font-medium text-[var(--text-dim)]">
          {index + 1}/{total}
        </span>
      </div>

      <div key={q.id} className="animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-5 shadow-[var(--shadow)]">
        <p className="font-display text-[17px] font-semibold leading-snug">{q.question}</p>
        <div className="mt-4 flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const isSelected = selected === i
            const isCorrectOpt = i === q.correctIndex
            const showState = mode === 'practice' && revealed
            let cls = 'border-[var(--border)] hover:border-brand-300'
            if (showState && isCorrectOpt) cls = 'border-teal-500 bg-teal-500/10'
            else if (showState && isSelected && !isCorrectOpt) cls = 'border-danger-500 bg-danger-500/10'
            else if (mode === 'exam' && isSelected) cls = 'border-brand-500 bg-brand-500/10'

            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={mode === 'practice' && revealed}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-[14px] transition-colors ${cls}`}
              >
                <span>{opt}</span>
                {showState && isCorrectOpt && <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />}
                {showState && isSelected && !isCorrectOpt && <XCircle className="h-4 w-4 shrink-0 text-danger-500" />}
              </button>
            )
          })}
        </div>

        {mode === 'practice' && revealed && (
          <div className="mt-4 rounded-xl bg-[var(--bg-card)] p-3.5 text-[13px] leading-relaxed text-[var(--text-dim)]">{q.explanation}</div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={next}
            disabled={selected === undefined}
            className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-opacity disabled:opacity-40"
          >
            {index + 1 < total ? 'Seuraava' : 'Näytä tulos'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
