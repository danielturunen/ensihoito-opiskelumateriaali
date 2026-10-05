import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
const STORAGE_KEY = 'ensihoito:theme'

const COLORS: Record<Theme, string> = { dark: '#0b0f17', light: '#faf8f5' }

function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

let theme: Theme = typeof window !== 'undefined' ? getStoredTheme() ?? (systemPrefersDark() ? 'dark' : 'light') : 'dark'
const listeners = new Set<() => void>()

function applyToDom(t: Theme) {
  document.documentElement.setAttribute('data-theme', t)
  document.getElementById('theme-color-meta')?.setAttribute('content', COLORS[t])
}

if (typeof window !== 'undefined') applyToDom(theme)

function setTheme(t: Theme) {
  theme = t
  applyToDom(t)
  try {
    localStorage.setItem(STORAGE_KEY, t)
  } catch {
    /* ignore quota/private-mode errors */
  }
  for (const l of listeners) l()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return theme
}

export function useTheme() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return {
    theme: current,
    setTheme,
    toggle: () => setTheme(current === 'dark' ? 'light' : 'dark'),
  }
}
