import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { modules } from '../content/modules'
import { topicsByModule } from '../content/topics'
import { Icon } from '../components/Icon'
import { TopicCard } from '../components/TopicCard'

export function ModulePage() {
  const { moduleId = '' } = useParams()
  const module = modules.find((m) => m.id === moduleId)
  const topicsIn = topicsByModule(moduleId)

  if (!module) return <Navigate to="/aiheet" replace />

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 lg:px-8 lg:pt-10">
      <Link to="/aiheet" className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-dim)] hover:text-[var(--text)]">
        <ChevronLeft className="h-4 w-4" /> Kaikki aihealueet
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-card)] text-brand-500">
          <Icon name={module.icon} className="h-6 w-6" strokeWidth={2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{module.title}</h1>
          <p className="text-[14px] text-[var(--text-dim)]">{topicsIn.length} aihetta</p>
        </div>
      </div>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--text-dim)]">{module.description}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topicsIn.map((t) => (
          <TopicCard key={t.id} topic={t} />
        ))}
      </div>
    </div>
  )
}
