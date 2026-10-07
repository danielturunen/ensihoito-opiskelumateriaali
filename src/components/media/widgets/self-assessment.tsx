import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Caption, svg } from '../ui'

interface Item {
  id: string
  label: string
  short: string
}

const LEVELS = ['Vasta alussa', 'Perusteet hallussa', 'Kohtalainen', 'Hyvä', 'Vahva']

function load(key: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}')
  } catch {
    return {}
  }
}

export default function SelfAssessment(props: WidgetProps) {
  const items = (props.items as Item[] | undefined) ?? []
  const storageKey = `ensihoito:self:${(props.storageKey as string | undefined) ?? 'default'}`
  const [ratings, setRatings] = useState<Record<string, number>>(() => load(storageKey))
  const reduce = useReducedMotion()

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(ratings))
    } catch {
      /* private mode: ratings just won't persist */
    }
  }, [ratings, storageKey])

  const n = items.length
  const cx = 150
  const cy = 140
  const R = 100
  const point = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    return [cx + Math.cos(a) * R * (v / 5), cy + Math.sin(a) * R * (v / 5)] as const
  }
  const poly = items.map((it, i) => point(i, ratings[it.id] ?? 0).join(',')).join(' ')
  const rated = items.filter((it) => ratings[it.id])
  const sorted = [...rated].sort((a, b) => (ratings[a.id] ?? 0) - (ratings[b.id] ?? 0))

  return (
    <div>
      <svg viewBox="0 0 300 290" className="mx-auto h-auto w-full max-w-[340px]" role="img" aria-label="Osaamisprofiili säteittäisenä kaaviona">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <polygon key={lvl} points={items.map((_, i) => point(i, lvl).join(',')).join(' ')} fill="none" stroke={svg.line} strokeWidth={lvl === 5 ? 1.5 : 1} />
        ))}
        {items.map((_, i) => {
          const [x, y] = point(i, 5)
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={svg.line} strokeWidth="1" />
        })}
        <motion.polygon
          initial={false}
          animate={{ points: poly }}
          transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0.15 }}
          fill="rgba(248,105,10,0.22)"
          stroke={svg.brand}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {items.map((it, i) => {
          const [x, y] = point(i, 5.9)
          return (
            <text key={it.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill={svg.dim}>
              {it.short}
            </text>
          )
        })}
      </svg>

      <div className="mt-2 flex flex-col gap-3">
        {items.map((it) => (
          <div key={it.id}>
            <p className="text-[13px] font-medium leading-snug text-[var(--text)]">{it.label}</p>
            <div className="mt-1.5 grid grid-cols-5 gap-1.5" role="radiogroup" aria-label={it.label}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  role="radio"
                  aria-checked={ratings[it.id] === v}
                  aria-label={`${v} – ${LEVELS[v - 1]}`}
                  onClick={() => setRatings((r) => ({ ...r, [it.id]: v }))}
                  className={`min-h-[40px] rounded-lg font-display text-[14px] font-bold transition-[background-color,transform] duration-150 active:scale-95 ${
                    (ratings[it.id] ?? 0) >= v ? 'bg-brand-500 text-white' : 'bg-[var(--bg-card)] text-[var(--text-dim)]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {rated.length >= 3 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-teal-500/10 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-600">Vahvin alue</p>
            <p className="mt-0.5 text-[13px] text-[var(--text)]">{sorted[sorted.length - 1].label}</p>
          </div>
          <div className="rounded-xl bg-brand-500/10 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">Kohdenna kertaus tänne</p>
            <p className="mt-0.5 text-[13px] text-[var(--text)]">{sorted[0].label}</p>
          </div>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <Caption>Arvio tallentuu vain tähän laitteeseen. Kohdennettu kertaus heikoimmille alueille tehoaa paremmin kuin yleinen kertaus.</Caption>
        {rated.length > 0 && (
          <button onClick={() => setRatings({})} className="min-h-[36px] shrink-0 px-2 text-[12px] font-medium text-[var(--text-dim)]">
            Nollaa
          </button>
        )}
      </div>
    </div>
  )
}
