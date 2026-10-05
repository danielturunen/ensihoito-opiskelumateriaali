import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Icon } from './Icon'
import type { ModuleMeta } from '../content/types'
import { topicsByModule } from '../content/topics'
import { useProgress } from '../lib/progress'

export function ModuleCard({ module }: { module: ModuleMeta }) {
  const progress = useProgress()
  const topicsIn = topicsByModule(module.id)
  const done = topicsIn.filter((t) => progress.completedTopics[t.id]).length

  return (
    <Link
      to={`/moduuli/${module.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-5 shadow-[var(--shadow)] transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-300 active:scale-[0.98] active:duration-100"
    >
      <div className="flex items-start justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-card)] text-brand-500`}>
          <Icon name={module.icon} className="h-5 w-5" strokeWidth={2} />
        </span>
        <ChevronRight className="h-5 w-5 text-[var(--text-dim)] transition-[transform,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-brand-500" />
      </div>
      <div>
        <h3 className="font-display text-[16px] font-semibold leading-snug text-[var(--text)]">{module.title}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[var(--text-dim)]">{module.description}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 pt-1">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-card)]">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${topicsIn.length ? (done / topicsIn.length) * 100 : 0}%` }} />
        </div>
        <span className="shrink-0 text-[11px] font-medium text-[var(--text-dim)]">
          {done}/{topicsIn.length}
        </span>
      </div>
    </Link>
  )
}
