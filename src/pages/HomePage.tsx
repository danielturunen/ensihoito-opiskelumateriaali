import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap, Layers, Sparkles } from 'lucide-react'
import { modules } from '../content/modules'
import { getTopic, topics } from '../content/topics'
import { ModuleCard } from '../components/ModuleCard'
import { useProgress } from '../lib/progress'

export function HomePage() {
  const progress = useProgress()
  const doneCount = Object.keys(progress.completedTopics).length
  const lastTopic = progress.lastTopicId ? getTopic(progress.lastTopicId) : undefined
  const pct = topics.length ? Math.round((doneCount / topics.length) * 100) : 0

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 lg:px-8 lg:pt-10">
      <div className="animate-fade-up">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-[12px] font-semibold text-brand-600">
          <Sparkles className="h-3.5 w-3.5" /> Ensihoitaja (AMK) -opiskelumateriaali
        </p>
        <h1 className="mt-3 font-display text-[28px] font-bold leading-tight sm:text-4xl">
          Kaikki ensihoidon keskeiset aiheet, yhdessä paikassa.
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--text-dim)]">
          {topics.length} aihetta, kertauskortit, tietovisat ja potilastapaukset. Opiskele omaan tahtiin, kertaa nopeasti ennen tenttiä ja harjoittele tenttitilassa.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Edistyminen" value={`${pct}%`} sub={`${doneCount}/${topics.length} aihetta suoritettu`} />
        <Link to="/tenttitila" className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-4 shadow-[var(--shadow)] transition-colors hover:border-brand-300">
          <GraduationCap className="h-5 w-5 text-brand-500" />
          <div className="mt-3">
            <p className="font-display text-[15px] font-semibold">Tenttitila</p>
            <p className="text-[12px] text-[var(--text-dim)]">Harjoittele kuin oikeassa tentissä</p>
          </div>
        </Link>
        <Link to="/aiheet" className="group flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-4 shadow-[var(--shadow)] transition-colors hover:border-brand-300">
          <Layers className="h-5 w-5 text-teal-500" />
          <div className="mt-3">
            <p className="font-display text-[15px] font-semibold">Selaa kaikkia aiheita</p>
            <p className="text-[12px] text-[var(--text-dim)]">{modules.length} aihealuetta</p>
          </div>
        </Link>
      </div>

      {lastTopic && (
        <Link
          to={lastTopic.hasScenario ? `/aihe/${lastTopic.id}/tapaus` : `/aihe/${lastTopic.id}`}
          className="mt-5 flex items-center justify-between rounded-2xl border border-brand-300/60 bg-brand-500/5 px-5 py-4 transition-colors hover:bg-brand-500/10"
        >
          <div>
            <p className="text-[12px] font-semibold text-brand-600">Jatka opiskelua</p>
            <p className="font-display text-[15px] font-semibold">{lastTopic.title}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-brand-500" />
        </Link>
      )}

      <h2 className="mt-10 mb-4 font-display text-xl font-semibold">Aihealueet</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <ModuleCard key={m.id} module={m} />
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-4 shadow-[var(--shadow)]">
      <p className="text-[12px] font-medium text-[var(--text-dim)]">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-[var(--text)]">{value}</p>
      <p className="mt-1 text-[12px] text-[var(--text-dim)]">{sub}</p>
    </div>
  )
}
