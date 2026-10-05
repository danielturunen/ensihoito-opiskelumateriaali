import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home, LayoutGrid, Search, GraduationCap, LineChart } from 'lucide-react'

const items = [
  { to: '/', label: 'Etusivu', icon: Home, end: true },
  { to: '/aiheet', label: 'Aiheet', icon: LayoutGrid, end: false },
  { to: '/tenttitila', label: 'Tenttitila', icon: GraduationCap, end: false },
  { to: '/edistyminen', label: 'Oma eteneminen', icon: LineChart, end: false },
]

export function BottomNav({ onSearch }: { onSearch: () => void }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg-raised)]/95 backdrop-blur-lg lg:hidden" aria-label="Päävalikko">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.slice(0, 2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
        <button
          onClick={onSearch}
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[var(--text-dim)] transition-transform duration-150 ease-out active:scale-90"
          aria-label="Haku"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30">
            <Search className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="text-[10px] font-medium leading-none">Haku</span>
        </button>
        {items.slice(2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({ to, label, icon: Icon, end }: { to: string; label: string; icon: typeof Home; end: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className="relative flex flex-col items-center justify-center gap-1 py-2.5 transition-transform duration-150 ease-out active:scale-90"
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="bottom-nav-pill"
              className="absolute top-1 h-7 w-12 rounded-full bg-brand-500/10"
              transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
            />
          )}
          <Icon className={`relative h-5 w-5 transition-colors duration-150 ${isActive ? 'text-brand-600' : 'text-[var(--text-dim)]'}`} strokeWidth={2.25} />
          <span className={`relative px-1 text-center text-[10px] font-medium leading-none transition-colors duration-150 ${isActive ? 'text-brand-600' : 'text-[var(--text-dim)]'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}
