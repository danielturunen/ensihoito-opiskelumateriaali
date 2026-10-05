import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, Star } from 'lucide-react'
import type { TopicMeta } from '../content/types'
import { useProgress, progressActions } from '../lib/progress'

export function TopicCard({ topic }: { topic: TopicMeta }) {
  const progress = useProgress()
  const done = Boolean(progress.completedTopics[topic.id])
  const fav = progress.favorites.includes(topic.id)
  const quiz = progress.quizResults[topic.id]

  const href = topic.hasScenario ? `/aihe/${topic.id}/tapaus` : `/aihe/${topic.id}`

  return (
    <Link
      to={href}
      className="group relative flex flex-col gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-4 shadow-[var(--shadow)] transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-300 active:scale-[0.98] active:duration-100"
    >
      <button
        onClick={(e) => {
          e.preventDefault()
          progressActions.toggleFavorite(topic.id)
        }}
        aria-label={fav ? 'Poista suosikeista' : 'Lisää suosikiksi'}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-dim)] transition-[background-color,transform] duration-150 ease-out hover:bg-[var(--bg-card)] active:scale-90"
      >
        <Star className={`h-4 w-4 ${fav ? 'fill-brand-500 text-brand-500' : ''}`} />
      </button>

      <div className="flex items-center gap-2 pr-8">
        {topic.dispatchCode && (
          <span className="rounded-md bg-brand-500/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-brand-600">{topic.dispatchCode}</span>
        )}
        {done && <CheckCircle2 className="h-4 w-4 text-teal-500" />}
      </div>

      <h3 className="font-display text-[15px] font-semibold leading-snug text-[var(--text)] pr-6">{topic.title}</h3>
      <p className="line-clamp-2 text-[13px] leading-relaxed text-[var(--text-dim)]">{topic.summary}</p>

      <div className="mt-auto flex items-center gap-3 pt-1 text-[11px] text-[var(--text-dim)]">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {topic.readMinutes} min
        </span>
        {topic.hasScenario && <span className="rounded-full bg-[var(--bg-card)] px-2 py-0.5 font-medium">Skenaario</span>}
        {quiz && <span className="rounded-full bg-teal-500/10 px-2 py-0.5 font-medium text-teal-600">Paras {quiz.bestScore}%</span>}
      </div>
    </Link>
  )
}
