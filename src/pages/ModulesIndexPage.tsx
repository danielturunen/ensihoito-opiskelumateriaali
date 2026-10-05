import { modules } from '../content/modules'
import { ModuleCard } from '../components/ModuleCard'

export function ModulesIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-10 sm:px-6 lg:px-8 lg:pt-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Kaikki aihealueet</h1>
      <p className="mt-1.5 text-[15px] text-[var(--text-dim)]">Valitse aihealue aloittaaksesi tai jatkaaksesi opiskelua.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <ModuleCard key={m.id} module={m} />
        ))}
      </div>
    </div>
  )
}
