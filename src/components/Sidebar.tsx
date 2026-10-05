import { NavLink } from 'react-router-dom'
import { Home, LayoutGrid, GraduationCap, LineChart, Stethoscope } from 'lucide-react'
import { modules } from '../content/modules'
import { Icon } from './Icon'
import { useProgress } from '../lib/progress'
import { topics } from '../content/topics'

export function Sidebar() {
  const progress = useProgress()
  const doneCount = Object.keys(progress.completedTopics).length

  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-raised)] lg:flex">
      <div className="flex items-center gap-2.5 px-6 pt-7 pb-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/30">
          <Stethoscope className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold text-[var(--text)]">Ensihoito-opas</p>
          <p className="text-xs text-[var(--text-dim)]">Opiskelumateriaali</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-3" aria-label="Päävalikko">
        <TopLink to="/" icon={Home} label="Etusivu" end />
        <TopLink to="/aiheet" icon={LayoutGrid} label="Kaikki aiheet" />
        <TopLink to="/tenttitila" icon={GraduationCap} label="Tenttitila" />
        <TopLink to="/edistyminen" icon={LineChart} label="Oma eteneminen" />
      </nav>

      <div className="mt-5 px-3">
        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Aihealueet</p>
        <div className="flex flex-col gap-0.5">
          {modules.map((m) => (
            <NavLink
              key={m.id}
              to={`/moduuli/${m.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-[var(--text-dim)] hover:bg-[var(--bg-card)] hover:text-[var(--text)]'
                }`
              }
            >
              <Icon name={m.icon} className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="truncate">{m.shortTitle}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <p className="text-xs font-medium text-[var(--text-dim)]">Edistyminen</p>
          <p className="mt-1 font-display text-2xl font-semibold text-[var(--text)]">
            {doneCount}/{topics.length}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg)]">
            <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(doneCount / topics.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </aside>
  )
}

function TopLink({ to, icon: Icon, label, end }: { to: string; icon: typeof Home; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isActive ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30' : 'text-[var(--text)] hover:bg-[var(--bg-card)]'
        }`
      }
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
      {label}
    </NavLink>
  )
}
