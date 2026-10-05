import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useDragControls, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { Search, X } from 'lucide-react'
import { search, type SearchDoc } from '../lib/search'

const SPRING = { type: 'spring', duration: 0.45, bounce: 0.1 } as const
const DISMISS_DISTANCE = 120
const DISMISS_VELOCITY = 600

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchDoc[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const y = useMotionValue(0)
  const dimOpacity = useTransform(y, [0, 400], [1, 0.3])
  const dragControls = useDragControls()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      y.set(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open, y])

  useEffect(() => {
    setResults(search(query))
  }, [query])

  const go = (id: string) => {
    navigate(`/aihe/${id}`)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ opacity: reduceMotion ? undefined : dimOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-[var(--border)] bg-[var(--bg-raised)] shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-24 sm:bottom-auto sm:max-h-[70vh] sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:rounded-2xl sm:border"
            style={{ y }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.65 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > DISMISS_DISTANCE || info.velocity.y > DISMISS_VELOCITY) onClose()
            }}
            initial={reduceMotion ? { opacity: 0 } : { y: '100%', opacity: 1 }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0, transition: { duration: 0.15 } } : { y: '100%', transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] } }}
            transition={SPRING}
          >
            {/* Only this handle initiates the sheet drag — the results list below keeps native scroll. */}
            <div
              className="flex cursor-grab touch-none justify-center pb-1 pt-2.5 active:cursor-grabbing sm:hidden"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="h-1.5 w-10 rounded-full bg-[var(--border)]" />
            </div>

            <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3.5">
              <Search className="h-5 w-5 shrink-0 text-[var(--text-dim)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Hae aiheita, termejä, lääkkeitä…"
                className="w-full bg-transparent text-[16px] outline-none placeholder:text-[var(--text-dim)]"
                enterKeyHint="search"
                autoCapitalize="none"
                autoCorrect="off"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') onClose()
                  if (e.key === 'Enter' && results[0]) go(results[0].id)
                }}
              />
              <button
                onClick={onClose}
                aria-label="Sulje"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-dim)] transition-[background-color,transform] duration-150 ease-out hover:bg-[var(--bg-card)] active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain p-2" style={{ touchAction: 'pan-y' }}>
              {query && results.length === 0 && <p className="px-3 py-8 text-center text-sm text-[var(--text-dim)]">Ei tuloksia haulle "{query}"</p>}
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => go(r.id)}
                  className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3.5 py-2.5 text-left transition-[background-color] duration-150 ease-out hover:bg-[var(--bg-card)] active:scale-[0.99]"
                >
                  <span className="flex items-center gap-2 text-[13px] font-medium text-brand-600">{r.moduleTitle}</span>
                  <span className="font-display text-[15px] font-semibold text-[var(--text)]">{r.title}</span>
                  <span className="line-clamp-1 text-[13px] text-[var(--text-dim)]">{r.summary}</span>
                </button>
              ))}
              {!query && <p className="px-3.5 py-8 text-center text-sm text-[var(--text-dim)]">Kirjoita hakeaksesi aiheita, lääkkeitä tai käsitteitä.</p>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
