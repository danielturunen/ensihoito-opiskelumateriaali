import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getTopic } from '../content/topics'
import { getQuiz } from '../content/loader'
import { QuizPlayer } from '../components/QuizPlayer'
import { progressActions } from '../lib/progress'

export function QuizPage() {
  const { topicId = '' } = useParams()
  const topic = getTopic(topicId)
  if (!topic) return <Navigate to="/aiheet" replace />

  const questions = getQuiz(topic.id)

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-10">
      <Link to={`/aihe/${topic.id}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-dim)] hover:text-[var(--text)]">
        <ChevronLeft className="h-4 w-4" /> {topic.title}
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold">Tietovisa</h1>
      <p className="mt-1 text-[14px] text-[var(--text-dim)]">{topic.title}</p>

      <div className="mt-6">
        <QuizPlayer questions={questions} mode="practice" onComplete={(pct) => progressActions.recordQuizResult(topic.id, pct)} />
      </div>
    </div>
  )
}
