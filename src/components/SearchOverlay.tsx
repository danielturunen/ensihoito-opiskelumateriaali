import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { search, type SearchDoc } from '../lib/search'

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchDoc[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setResults(search(query))
  }, [query])

  if (!open) return null

  const go = (id: string) => {
    navigate(`/aihe/${id}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-3 pt-16 backdrop-blur-sm sm:pt-28" onClick={onClose}>
      <div
        className="w-full max-w-xl animate-fade-up overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3.5">
          <Search className="h-5 w-5 shrink-0 text-[var(--text-dim)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hae aiheita, termejä, lääkkeitä…"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--text-dim)]"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && results[0]) go(results[0].id)
            }}
          />
          <button onClick={onClose} aria-label="Sulje" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-dim)] hover:bg-[var(--bg-card)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query && results.length === 0 && <p className="px-3 py-8 text-center text-sm text-[var(--text-dim)]">Ei tuloksia haulle "{query}"</p>}
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => go(r.id)}
              className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3.5 py-2.5 text-left transition-colors hover:bg-[var(--bg-card)]"
            >
              <span className="flex items-center gap-2 text-[13px] font-medium text-brand-600">{r.moduleTitle}</span>
              <span className="font-display text-[15px] font-semibold text-[var(--text)]">{r.title}</span>
              <span className="line-clamp-1 text-[13px] text-[var(--text-dim)]">{r.summary}</span>
            </button>
          ))}
          {!query && (
            <p className="px-3.5 py-8 text-center text-sm text-[var(--text-dim)]">Kirjoita hakeaksesi aiheita, lääkkeitä tai käsitteitä.</p>
          )}
        </div>
      </div>
    </div>
  )
}
