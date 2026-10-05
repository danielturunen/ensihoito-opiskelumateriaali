import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronLeft, CheckCircle2, Circle, Clock, GraduationCap, Layers, Star } from 'lucide-react'
import { getTopic } from '../content/topics'
import { modules } from '../content/modules'
import { getArticle } from '../content/loader'
import { Markdown } from '../components/Markdown'
import { useProgress, progressActions } from '../lib/progress'

export function TopicPage() {
  const { topicId = '' } = useParams()
  const topic = getTopic(topicId)
  const progress = useProgress()

  useEffect(() => {
    if (topic) progressActions.setLastTopic(topic.id)
  }, [topic])

  if (!topic) return <Navigate to="/aiheet" replace />

  const module = modules.find((m) => m.id === topic.moduleId)
  const article = getArticle(topic.id)
  const done = Boolean(progress.completedTopics[topic.id])
  const fav = progress.favorites.includes(topic.id)

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-10">
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/moduuli/${topic.moduleId}`}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-dim)] transition-colors duration-150 ease-out hover:text-[var(--text)]"
        >
          <ChevronLeft className="h-4 w-4" /> {module?.shortTitle}
        </Link>
        <button
          onClick={() => progressActions.toggleFavorite(topic.id)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-dim)] transition-[background-color,transform] duration-150 ease-out hover:bg-[var(--bg-card)] active:scale-90"
          aria-label="Suosikki"
        >
          <Star className={`h-5 w-5 transition-transform duration-200 ${fav ? 'fill-brand-500 text-brand-500 scale-110' : ''}`} />
        </button>
      </div>

      <div className="mt-3 animate-fade-up">
        {topic.dispatchCode && <span className="mb-2 inline-block rounded-md bg-brand-500/10 px-2 py-0.5 font-mono text-[12px] font-semibold text-brand-600">Tehtäväkoodi {topic.dispatchCode}</span>}
        <h1 className="font-display text-[26px] font-bold leading-tight sm:text-3xl">{topic.title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-dim)]">{topic.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-dim)]">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {topic.readMinutes} min lukuaika
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => (done ? progressActions.markTopicIncomplete(topic.id) : progressActions.markTopicComplete(topic.id))}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] ${
            done ? 'bg-teal-500/10 text-teal-600' : 'bg-[var(--bg-card)] text-[var(--text)] hover:bg-brand-500/10 hover:text-brand-600'
          }`}
        >
          <span key={String(done)} className={done ? 'animate-pop flex' : 'flex'}>
            {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
          </span>
          {done ? 'Suoritettu' : 'Merkitse suoritetuksi'}
        </button>
        {topic.hasQuiz && (
          <Link
            to={`/aihe/${topic.id}/tietovisa`}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-transform duration-150 ease-out hover:-translate-y-px active:scale-[0.97] active:translate-y-0"
          >
            <GraduationCap className="h-4 w-4" /> Tietovisa
          </Link>
        )}
        {topic.hasFlashcards && (
          <Link
            to={`/aihe/${topic.id}/kertauskortit`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-[13px] font-semibold text-[var(--text)] transition-[border-color,transform] duration-150 ease-out hover:border-brand-300 active:scale-[0.97]"
          >
            <Layers className="h-4 w-4" /> Kertauskortit
          </Link>
        )}
      </div>

      <div className="mt-8 border-t border-[var(--border)] pt-6">
        {article ? <Markdown source={article} /> : <p className="text-[var(--text-dim)]">Sisältöä ladataan…</p>}
      </div>
    </div>
  )
}
