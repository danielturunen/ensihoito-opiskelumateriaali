import { Component, Suspense, type ReactNode } from 'react'
import { Activity, AudioLines, BookOpenCheck, Calculator, Clock, GitBranch, Hand, Sparkles } from 'lucide-react'
import { getWidget, widgetMeta, type MediaKind } from './registry'

export interface MediaSpec {
  widget: string
  title?: string
  caption?: string
  [key: string]: unknown
}

/** ```media blocks contain either a bare widget name or a JSON object with a `widget` key. */
export function parseMediaSpec(raw: string): { ok: true; spec: MediaSpec } | { ok: false; error: string } {
  const text = raw.trim()
  if (!text.startsWith('{')) return { ok: true, spec: { widget: text } }
  try {
    const parsed = JSON.parse(text)
    if (typeof parsed?.widget !== 'string') return { ok: false, error: 'Puuttuva "widget"-kenttä' }
    return { ok: true, spec: parsed as MediaSpec }
  } catch (e) {
    return { ok: false, error: `Virheellinen JSON: ${(e as Error).message}` }
  }
}

const kindIcon: Record<MediaKind, typeof Activity> = {
  Laskuri: Calculator,
  'Interaktiivinen kuva': Hand,
  Animaatio: Activity,
  Kaavio: GitBranch,
  Harjoitus: BookOpenCheck,
  Ääni: AudioLines,
  Itsearviointi: Sparkles,
  Aikajana: Clock,
}

class WidgetBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return <p className="text-[13px] text-[var(--text-dim)]">Tätä elementtiä ei voitu näyttää.</p>
    return this.props.children
  }
}

function Skeleton() {
  return (
    <div className="flex min-h-[180px] items-center justify-center" aria-hidden>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

export function MediaBlock({ raw }: { raw: string }) {
  const parsed = parseMediaSpec(raw)
  if (!parsed.ok) {
    return import.meta.env.DEV ? <pre className="my-4 rounded-xl bg-danger-500/10 p-3 text-[12px] text-danger-500">{parsed.error}</pre> : null
  }

  const { widget, title, caption, ...props } = parsed.spec
  const meta = widgetMeta[widget]
  const Widget = getWidget(widget)
  if (!Widget || !meta) {
    return import.meta.env.DEV ? <pre className="my-4 rounded-xl bg-danger-500/10 p-3 text-[12px] text-danger-500">Tuntematon media: {widget}</pre> : null
  }

  const Icon = kindIcon[meta.kind]

  return (
    <figure data-media className="not-prose my-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] shadow-[var(--shadow)]">
      <figcaption className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <span className="line-clamp-2 min-w-0 flex-1 font-display text-[14px] leading-snug font-semibold text-[var(--text)]">{title ?? meta.title}</span>
        <span className="hidden shrink-0 rounded-full bg-[var(--bg-card)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-dim)] min-[520px]:inline-block">
          {meta.kind}
        </span>
      </figcaption>
      <div className="p-4">
        <WidgetBoundary>
          <Suspense fallback={<Skeleton />}>
            <Widget {...props} />
          </Suspense>
        </WidgetBoundary>
        {caption && <p className="mt-3 text-[12px] leading-relaxed text-[var(--text-dim)]">{caption}</p>}
      </div>
    </figure>
  )
}
