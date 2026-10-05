import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home, LayoutGrid, GraduationCap, LineChart, Stethoscope } from 'lucide-react'
import { modules } from '../content/modules'
import { Icon } from './Icon'
import { useProgress } from '../lib/progress'
import { topics } from '../content/topics'

const PILL_SPRING = { type: 'spring', duration: 0.5, bounce: 0.2 } as const

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
              className="relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-transform duration-150 ease-out active:scale-[0.98]"
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="sidebar-pill" className="absolute inset-0 rounded-lg bg-brand-500/10" transition={PILL_SPRING} />}
                  <Icon name={m.icon} className={`relative h-4 w-4 shrink-0 transition-colors duration-150 ${isActive ? 'text-brand-600' : 'text-[var(--text-dim)]'}`} strokeWidth={2} />
                  <span className={`relative truncate transition-colors duration-150 ${isActive ? 'text-brand-600' : 'text-[var(--text-dim)]'}`}>{m.shortTitle}</span>
                </>
              )}
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
            <div className="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out" style={{ width: `${(doneCount / topics.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </aside>
  )
}

function TopLink({ to, icon: Icon, label, end }: { to: string; icon: typeof Home; label: string; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className="relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98]">
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId="sidebar-pill" className="absolute inset-0 rounded-lg bg-brand-500 shadow-sm shadow-brand-500/30" transition={PILL_SPRING} />}
          <Icon className={`relative h-[18px] w-[18px] transition-colors duration-150 ${isActive ? 'text-white' : 'text-[var(--text)]'}`} strokeWidth={2.25} />
          <span className={`relative transition-colors duration-150 ${isActive ? 'text-white' : 'text-[var(--text)]'}`}>{label}</span>
        </>
      )}
    </NavLink>
  )
}
