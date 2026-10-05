import { useState } from 'react'
import { CheckCircle2, ChevronRight, RotateCcw, Siren, XCircle } from 'lucide-react'
import type { Scenario } from '../content/types'
import { progressActions } from '../lib/progress'

export function ScenarioPlayer({ scenario }: { scenario: Scenario }) {
  const [stage, setStage] = useState<'intro' | 'playing' | 'done'>('intro')
  const [stepIndex, setStepIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const step = scenario.steps[stepIndex]

  function choose(i: number) {
    if (chosen !== null) return
    setChosen(i)
    if (step.choices[i].correct) setCorrectCount((c) => c + 1)
  }

  function next() {
    if (stepIndex + 1 < scenario.steps.length) {
      setStepIndex(stepIndex + 1)
      setChosen(null)
    } else {
      progressActions.recordScenarioResult(scenario.id, correctCount, scenario.steps.length)
      setStage('done')
    }
  }

  function restart() {
    setStage('intro')
    setStepIndex(0)
    setChosen(null)
    setCorrectCount(0)
  }

  if (stage === 'intro') {
    return (
      <div className="animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-[var(--shadow)]">
        <div className="flex items-center gap-2 text-brand-600">
          <Siren className="h-5 w-5" />
          <span className="text-[12px] font-semibold uppercase tracking-wide">Hälytystiedot</span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed">{scenario.intro}</p>
        <button
          onClick={() => setStage('playing')}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          Aloita tehtävä <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className="animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 shadow-[var(--shadow)]">
        <p className="font-display text-4xl font-bold text-brand-500">
          {correctCount}/{scenario.steps.length}
        </p>
        <p className="mt-1 text-[14px] text-[var(--text-dim)]">parasta valintaa tehty</p>
        <div className="mt-4 rounded-xl bg-[var(--bg-card)] p-4">
          <p className="text-[13px] font-semibold text-[var(--text-dim)]">Yhteenveto</p>
          <p className="mt-1 text-[14px] leading-relaxed">{scenario.debrief}</p>
        </div>
        <button
          onClick={restart}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <RotateCcw className="h-4 w-4" /> Aja tapaus uudelleen
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-card)]">
          <div className="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out" style={{ width: `${((stepIndex + 1) / scenario.steps.length) * 100}%` }} />
        </div>
        <span className="shrink-0 text-[12px] font-medium text-[var(--text-dim)]">
          {stepIndex + 1}/{scenario.steps.length}
        </span>
      </div>

      <div key={step.id} className="animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-5 shadow-[var(--shadow)]">
        <p className="text-[14px] leading-relaxed text-[var(--text-dim)]">{step.situation}</p>
        <p className="mt-3 font-display text-[17px] font-semibold leading-snug">{step.question}</p>

        <div className="mt-4 flex flex-col gap-2">
          {step.choices.map((c, i) => {
            const show = chosen !== null
            let cls = 'border-[var(--border)] hover:border-brand-300'
            if (show && c.correct) cls = 'border-teal-500 bg-teal-500/10'
            else if (show && chosen === i && !c.correct) cls = 'border-danger-500 bg-danger-500/10'
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={chosen !== null}
                className={`rounded-xl border px-4 py-3 text-left text-[14px] transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.99] ${cls}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{c.text}</span>
                  {show && c.correct && <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />}
                  {show && chosen === i && !c.correct && <XCircle className="h-4 w-4 shrink-0 text-danger-500" />}
                </div>
                {show && chosen === i && <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-dim)]">{c.feedback}</p>}
              </button>
            )
          })}
        </div>

        {chosen !== null && (
          <div className="mt-5 flex justify-end">
            <button
              onClick={next}
              className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              {stepIndex + 1 < scenario.steps.length ? 'Seuraava vaihe' : 'Näytä yhteenveto'} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
