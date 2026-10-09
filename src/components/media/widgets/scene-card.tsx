import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { AlertTriangle, BookOpen, Check, Hand, RotateCcw, Search } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Segmented } from '../ui'

/* "Kohteessa" card: what a paramedic must know (Tiedä), be able to do (Osaa) and
 * examine (Tutki) on scene for one topic. Items are tappable so the card doubles as
 * a self-check; an optional red-flag strip stays visible under every tab. */

type Item = string | { label: string; detail?: string }
type TabId = 'know' | 'do' | 'examine'

const TABS: { id: TabId; label: string; Icon: typeof BookOpen; lead: string }[] = [
  { id: 'know', label: 'Tiedä', Icon: BookOpen, lead: 'Mitä sinun pitää tietää ennen kuin astut kohteeseen' },
  { id: 'examine', label: 'Tutki', Icon: Search, lead: 'Mitä potilaasta pitää tutkia ja kysyä' },
  { id: 'do', label: 'Osaa', Icon: Hand, lead: 'Mitä sinun pitää osata tehdä kohteessa' },
]

function norm(it: Item) {
  return typeof it === 'string' ? { label: it, detail: undefined } : it
}

export default function SceneCard(props: WidgetProps) {
  const lists: Record<TabId, Item[]> = {
    know: (props.know as Item[] | undefined) ?? [],
    examine: (props.examine as Item[] | undefined) ?? [],
    do: (props.do as Item[] | undefined) ?? [],
  }
  const redFlags = (props.redFlags as string[] | undefined) ?? []
  const id = (props.id as string | undefined) ?? 'scene'
  const tabs = TABS.filter((t) => lists[t.id].length > 0)
  const [tab, setTab] = useState<TabId>(tabs[0]?.id ?? 'know')
  const [done, setDone] = useState<Record<TabId, Set<number>>>({ know: new Set(), examine: new Set(), do: new Set() })
  const reduce = useReducedMotion()

  const current = TABS.find((t) => t.id === tab)!
  const items = lists[tab].map(norm)
  const total = tabs.reduce((s, t) => s + lists[t.id].length, 0)
  const ticked = tabs.reduce((s, t) => s + done[t.id].size, 0)

  function toggle(i: number) {
    setDone((d) => {
      const next = new Set(d[tab])
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return { ...d, [tab]: next }
    })
  }

  return (
    <div>
      <Segmented
        layoutId={`scene-${id}`}
        value={tab}
        onChange={setTab}
        options={tabs.map((t) => ({ value: t.id, label: `${t.label} ${done[t.id].size}/${lists[t.id].length}` }))}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        >
          <p className="mb-2 mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-dim)]">
            <current.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden /> {current.lead}
          </p>
          <div className="flex flex-col gap-1.5">
            {items.map((it, i) => {
              const on = done[tab].has(i)
              return (
                <button
                  key={i}
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggle(i)}
                  className={`flex min-h-[44px] items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.99] ${
                    on ? 'border-teal-500/40 bg-teal-500/10' : 'border-[var(--border)] bg-[var(--bg-card)]'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ${
                      on ? 'border-teal-500 bg-teal-500 text-white' : 'border-[var(--border)] bg-[var(--bg-raised)]'
                    }`}
                  >
                    {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium leading-snug text-[var(--text)]">{it.label}</span>
                    {it.detail && <span className="mt-0.5 block text-[12px] leading-relaxed text-[var(--text-dim)]">{it.detail}</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {redFlags.length > 0 && (
        <div className="mt-3 rounded-xl border border-danger-500/35 bg-danger-500/10 px-3.5 py-2.5">
          <p className="flex items-center gap-1.5 font-display text-[13px] font-semibold text-danger-500">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden /> Hälytysmerkit
          </p>
          <ul className="mt-1 flex flex-col gap-0.5 text-[12px] leading-relaxed text-[var(--text)]">
            {redFlags.map((f, i) => (
              <li key={i} className="flex gap-1.5">
                <span aria-hidden className="text-danger-500">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--text-dim)]">
        <span className="tabular-nums">
          {ticked}/{total} käyty läpi{ticked === total && total > 0 ? ' – valmis kohteeseen' : ''}
        </span>
        {ticked > 0 && (
          <button
            onClick={() => setDone({ know: new Set(), examine: new Set(), do: new Set() })}
            className="inline-flex min-h-[36px] items-center gap-1 px-2 font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Tyhjennä
          </button>
        )}
      </div>
    </div>
  )
}
