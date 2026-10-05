import { useMemo, useState } from 'react'
import { GraduationCap, ListChecks } from 'lucide-react'
import { modules } from '../content/modules'
import { topicsByModule } from '../content/topics'
import { getQuiz, quizPacks } from '../content/loader'
import { QuizPlayer } from '../components/QuizPlayer'
import { progressActions } from '../lib/progress'
import type { QuizQuestion } from '../content/types'

export function ExamModePage() {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [questionCap, setQuestionCap] = useState(20)
  const [active, setActive] = useState<{ questions: QuizQuestion[]; recordId: string | null } | null>(null)

  const quizTopicsByModule = useMemo(
    () =>
      modules.map((m) => ({
        module: m,
        topics: topicsByModule(m.id).filter((t) => t.hasQuiz),
      })),
    [],
  )

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    const all = new Set<string>()
    for (const { topics } of quizTopicsByModule) for (const t of topics) all.add(t.id)
    for (const p of quizPacks) all.add(p.id)
    setSelected(all)
  }

  function start() {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    let pool: QuizQuestion[] = []
    for (const id of ids) pool = pool.concat(getQuiz(id))
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, questionCap)
    setActive({ questions: shuffled, recordId: ids.length === 1 ? ids[0] : null })
  }

  if (active) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-10">
        <button onClick={() => setActive(null)} className="text-[13px] font-medium text-[var(--text-dim)] transition-colors duration-150 ease-out hover:text-[var(--text)]">
          ← Takaisin valintoihin
        </button>
        <h1 className="mt-3 font-display text-2xl font-bold">Tenttitila</h1>
        <p className="mt-1 text-[14px] text-[var(--text-dim)]">Oikeat vastaukset näytetään vasta lopussa — aivan kuten oikeassa tentissä.</p>
        <div className="mt-6">
          <QuizPlayer
            questions={active.questions}
            mode="exam"
            onComplete={(pct) => {
              if (active.recordId) progressActions.recordQuizResult(active.recordId, pct)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-10">
      <div className="flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold">Tenttitila</h1>
          <p className="text-[13px] text-[var(--text-dim)]">Valitse aiheet joista haluat tenttikysymyksiä</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-4">
        <button
          onClick={selectAll}
          className="rounded-full bg-[var(--bg-card)] px-3.5 py-1.5 text-[12px] font-semibold transition-[background-color,color,transform] duration-150 ease-out hover:bg-brand-500/10 hover:text-brand-600 active:scale-[0.96]"
        >
          Valitse kaikki
        </button>
        <button
          onClick={() => setSelected(new Set())}
          className="rounded-full bg-[var(--bg-card)] px-3.5 py-1.5 text-[12px] font-semibold transition-[background-color,color,transform] duration-150 ease-out hover:bg-brand-500/10 hover:text-brand-600 active:scale-[0.96]"
        >
          Tyhjennä
        </button>
        <div className="ml-auto flex items-center gap-2 text-[12px] text-[var(--text-dim)]">
          <span>Kysymysten määrä</span>
          <select value={questionCap} onChange={(e) => setQuestionCap(Number(e.target.value))} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-[13px]">
            {[10, 20, 30, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          <ListChecks className="h-4 w-4 text-teal-500" /> Kertauspaketit
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {quizPacks.map((p) => (
            <label key={p.id} className="flex cursor-pointer items-start gap-2.5 rounded-xl px-2.5 py-2 transition-[background-color,transform] duration-150 ease-out hover:bg-[var(--bg-card)] active:scale-[0.99]">
              <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="mt-1 h-4 w-4 accent-brand-500" />
              <span>
                <span className="block text-[14px] font-medium">{p.title}</span>
                <span className="block text-[12px] text-[var(--text-dim)]">{p.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {quizTopicsByModule.map(({ module, topics }) =>
          topics.length === 0 ? null : (
            <div key={module.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-4">
              <p className="text-[13px] font-semibold">{module.title}</p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                {topics.map((t) => (
                  <label key={t.id} className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-[background-color,transform] duration-150 ease-out hover:bg-[var(--bg-card)] active:scale-[0.99]">
                    <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} className="h-4 w-4 accent-brand-500" />
                    <span className="text-[13px]">{t.title}</span>
                  </label>
                ))}
              </div>
            </div>
          ),
        )}
      </div>

      <button
        onClick={start}
        disabled={selected.size === 0}
        className="sticky bottom-20 mt-6 w-full rounded-full bg-brand-500 py-3.5 text-[14px] font-semibold text-white shadow-lg shadow-brand-500/30 transition-[opacity,transform] duration-150 ease-out active:scale-[0.98] disabled:opacity-40 lg:bottom-6"
      >
        Aloita tentti ({selected.size} aihetta valittu)
      </button>
    </div>
  )
}
