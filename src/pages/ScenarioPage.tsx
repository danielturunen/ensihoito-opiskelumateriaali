import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getTopic } from '../content/topics'
import { getScenario } from '../content/loader'
import { ScenarioPlayer } from '../components/ScenarioPlayer'

export function ScenarioPage() {
  const { topicId = '' } = useParams()
  const topic = getTopic(topicId)
  const scenario = getScenario(topicId)
  if (!topic || !scenario) return <Navigate to="/aiheet" replace />

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-10">
      <Link to={`/moduuli/${topic.moduleId}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-dim)] hover:text-[var(--text)]">
        <ChevronLeft className="h-4 w-4" /> Takaisin
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold">{scenario.title}</h1>
      <p className="mt-1 text-[14px] text-[var(--text-dim)]">Potilastapaus · harjoittele päätöksentekoa vaihe vaiheelta</p>

      <div className="mt-6">
        <ScenarioPlayer scenario={scenario} />
      </div>
    </div>
  )
}
