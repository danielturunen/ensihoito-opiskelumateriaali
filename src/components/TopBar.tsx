import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Moon, Search, Stethoscope, Sun } from 'lucide-react'
import { useTheme } from '../lib/theme'

function ThemeIcon({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={theme}
        className="flex"
        initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </motion.span>
    </AnimatePresence>
  )
}

export function TopBar({ onSearch }: { onSearch: () => void }) {
  const { theme, toggle } = useTheme()

  return (
    <header className="pt-safe sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-lg lg:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
            <Stethoscope className="h-4 w-4" strokeWidth={2.25} />
          </span>
          <span className="font-display text-[15px] font-semibold">Ensihoito-opas</span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={onSearch}
            aria-label="Haku"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-[var(--text-dim)] transition-[background-color,transform] duration-150 ease-out active:scale-90 active:bg-[var(--bg-card)]"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={toggle}
            aria-label="Vaihda teema"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-[var(--text-dim)] transition-[background-color,transform] duration-150 ease-out active:scale-90 active:bg-[var(--bg-card)]"
          >
            <ThemeIcon theme={theme} />
          </button>
        </div>
      </div>
    </header>
  )
}

export function DesktopTopBar({ onSearch }: { onSearch: () => void }) {
  const { theme, toggle } = useTheme()
  return (
    <header className="sticky top-0 z-30 hidden items-center gap-4 border-b border-[var(--border)] bg-[var(--bg)]/90 px-8 py-4 backdrop-blur-lg lg:flex">
      <button
        onClick={onSearch}
        className="flex w-80 items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-dim)] transition-[border-color,transform] duration-150 ease-out hover:border-brand-400 active:scale-[0.99]"
      >
        <Search className="h-4 w-4" />
        <span>Hae aiheita, termejä, lääkkeitä…</span>
        <kbd className="ml-auto rounded border border-[var(--border)] bg-[var(--bg)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-dim)]">Ctrl K</kbd>
      </button>
      <button
        onClick={toggle}
        aria-label="Vaihda teema"
        className="ml-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-[var(--text-dim)] transition-[background-color,transform] duration-150 ease-out hover:bg-[var(--bg-card)] active:scale-90"
      >
        <ThemeIcon theme={theme} />
      </button>
    </header>
  )
}
