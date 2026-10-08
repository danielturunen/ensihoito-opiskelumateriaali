import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// After a deploy, a page still running the previous build may request code chunks that no longer
// exist (blank page). Reload once to pick up the new build; the guard prevents a reload loop.
window.addEventListener('vite:preloadError', (event) => {
  const KEY = 'ensihoito:chunk-reload'
  let last = 0
  try {
    last = Number(sessionStorage.getItem(KEY) ?? 0)
  } catch {
    /* storage unavailable */
  }
  if (Date.now() - last < 10_000) return
  event.preventDefault()
  try {
    sessionStorage.setItem(KEY, String(Date.now()))
  } catch {
    /* storage unavailable */
  }
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
