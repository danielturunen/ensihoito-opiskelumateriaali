import { lazy, Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar, DesktopTopBar } from './TopBar'
import { UpdateToast } from './UpdateToast'

// Lazy: pulls in Fuse.js + the full article text index, so keep it out of the initial bundle.
const SearchOverlay = lazy(() => import('./SearchOverlay').then((m) => ({ default: m.SearchOverlay })))

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-dvh bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <div className="flex min-h-dvh w-full flex-col">
        <TopBar onSearch={() => setSearchOpen(true)} />
        <DesktopTopBar onSearch={() => setSearchOpen(true)} />
        <main className="flex-1 pb-24 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <BottomNav onSearch={() => setSearchOpen(true)} />
      <UpdateToast />
      {searchOpen && (
        <Suspense fallback={null}>
          <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}
