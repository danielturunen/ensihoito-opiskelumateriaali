import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, RotateCcw, Star, Trash2 } from 'lucide-react'
import { modules } from '../content/modules'
import { getTopic, topics, topicsByModule } from '../content/topics'
import { useProgress, progressActions } from '../lib/progress'

export function ProgressPage() {
  const progress = useProgress()
  const [confirmReset, setConfirmReset] = useState(false)

  const doneCount = Object.keys(progress.completedTopics).length
  const quizIds = Object.keys(progress.quizResults)
  const favoriteTopics = progress.favorites.map((id) => getTopic(id)).filter(Boolean)

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Oma eteneminen</h1>
      <p className="mt-1 text-[14px] text-[var(--text-dim)]">Edistymisesi tallentuu tähän laitteeseen — ei kirjautumista tarvita.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-4 shadow-[var(--shadow)]">
          <p className="text-[12px] font-medium text-[var(--text-dim)]">Suoritetut aiheet</p>
          <p className="mt-1 font-display text-3xl font-bold">
            {doneCount}/{topics.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-4 shadow-[var(--shadow)]">
          <p className="text-[12px] font-medium text-[var(--text-dim)]">Tietovisat tehty</p>
          <p className="mt-1 font-display text-3xl font-bold">{quizIds.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-4 shadow-[var(--shadow)]">
          <p className="text-[12px] font-medium text-[var(--text-dim)]">Suosikit</p>
          <p className="mt-1 font-display text-3xl font-bold">{favoriteTopics.length}</p>
        </div>
      </div>

      <h2 className="mt-8 mb-3 font-display text-lg font-semibold">Edistyminen aihealueittain</h2>
      <div className="flex flex-col gap-2.5">
        {modules.map((m) => {
          const ts = topicsByModule(m.id)
          const done = ts.filter((t) => progress.completedTopics[t.id]).length
          return (
            <Link
              key={m.id}
              to={`/moduuli/${m.id}`}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-3 transition-[border-color,transform] duration-150 ease-out hover:border-brand-300 active:scale-[0.99]"
            >
              <span className="w-36 shrink-0 truncate text-[13px] font-medium">{m.shortTitle}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-card)]">
                <div
                  className="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out"
                  style={{ width: `${ts.length ? (done / ts.length) * 100 : 0}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-[12px] text-[var(--text-dim)]">
                {done}/{ts.length}
              </span>
            </Link>
          )
        })}
      </div>

      {quizIds.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 font-display text-lg font-semibold">Tietovisatulokset</h2>
          <div className="flex flex-col gap-2">
            {quizIds.map((id) => {
              const t = getTopic(id)
              const r = progress.quizResults[id]
              return (
                <div key={id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-2.5">
                  <span className="text-[13px] font-medium">{t?.title ?? id}</span>
                  <span className="text-[13px] text-[var(--text-dim)]">
                    Paras <span className="font-semibold text-teal-600">{r.bestScore}%</span> · {r.attempts}x
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {favoriteTopics.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 flex items-center gap-1.5 font-display text-lg font-semibold">
            <Star className="h-4 w-4 fill-brand-500 text-brand-500" /> Suosikit
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {favoriteTopics.map((t) => (
              <Link
                key={t!.id}
                to={`/aihe/${t!.id}`}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-2.5 transition-[border-color,transform] duration-150 ease-out hover:border-brand-300 active:scale-[0.99]"
              >
                {progress.completedTopics[t!.id] && <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-500" />}
                <span className="truncate text-[13px] font-medium">{t!.title}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="mt-10 border-t border-[var(--border)] pt-6">
        {confirmReset ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[13px] text-[var(--text-dim)]">Oletko varma? Kaikki eteneminen, tietovisatulokset ja kertauskorttien tila poistetaan tästä laitteesta.</p>
            <button
              onClick={() => {
                progressActions.resetAll()
                setConfirmReset(false)
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-danger-500 px-4 py-2 text-[12px] font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              <Trash2 className="h-3.5 w-3.5" /> Vahvista nollaus
            </button>
            <button onClick={() => setConfirmReset(false)} className="text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 ease-out hover:text-[var(--text)]">
              Peruuta
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-dim)] transition-colors duration-150 ease-out hover:text-danger-500"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Nollaa oma eteneminen
          </button>
        )}
      </div>
    </div>
  )
}
