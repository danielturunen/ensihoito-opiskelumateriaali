import { lazy, Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar, DesktopTopBar } from './TopBar'
import { UpdateToast } from './UpdateToast'

// Lazy: pulls in Fuse.js + the full article text index, so keep it out of the initial bundle.
const SearchOverlay = lazy(() => import('./SearchOverlay').then((m) => ({ default: m.SearchOverlay })))

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchLoaded, setSearchLoaded] = useState(false)
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function openSearch() {
    setSearchLoaded(true)
    setSearchOpen(true)
  }

  return (
    <div className="flex min-h-dvh bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <div className="flex min-h-dvh w-full flex-col">
        <TopBar onSearch={openSearch} />
        <DesktopTopBar onSearch={openSearch} />
        <main className="flex-1 pb-24 lg:pb-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNav onSearch={openSearch} />
      <UpdateToast />
      {searchLoaded && (
        <Suspense fallback={null}>
          <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}
