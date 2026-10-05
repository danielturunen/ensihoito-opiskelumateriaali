import { Children, isValidElement, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { AlertTriangle, Info, Lightbulb, Siren } from 'lucide-react'

const CALLOUT_RE = /^\[!(tip|warning|danger|info|important|example|success|note|critical)\]\s*(.*)$/i

const CALLOUT_STYLES: Record<string, { icon: typeof Info; cls: string; iconCls: string }> = {
  tip: { icon: Lightbulb, cls: 'border-teal-500/30 bg-teal-500/8', iconCls: 'text-teal-500' },
  success: { icon: Lightbulb, cls: 'border-teal-500/30 bg-teal-500/8', iconCls: 'text-teal-500' },
  warning: { icon: AlertTriangle, cls: 'border-brand-500/35 bg-brand-500/10', iconCls: 'text-brand-500' },
  important: { icon: AlertTriangle, cls: 'border-brand-500/35 bg-brand-500/10', iconCls: 'text-brand-500' },
  danger: { icon: Siren, cls: 'border-danger-500/40 bg-danger-500/10', iconCls: 'text-danger-500' },
  critical: { icon: Siren, cls: 'border-danger-500/40 bg-danger-500/10', iconCls: 'text-danger-500' },
  info: { icon: Info, cls: 'border-mist-dim/30 bg-[var(--bg-raised)]', iconCls: 'text-mist-dim' },
  note: { icon: Info, cls: 'border-mist-dim/30 bg-[var(--bg-raised)]', iconCls: 'text-mist-dim' },
  example: { icon: Info, cls: 'border-mist-dim/30 bg-[var(--bg-raised)]', iconCls: 'text-mist-dim' },
}

function textContent(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(textContent).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textContent(node.props.children)
  return ''
}

function Blockquote({ children }: { children?: ReactNode }) {
  // react-markdown interleaves whitespace-only text nodes between block children; drop them.
  const kids = Children.toArray(children).filter((k) => !(typeof k === 'string' && k.trim() === ''))
  const first = kids[0]
  const firstText = isValidElement(first) ? textContent(first) : ''
  const match = firstText.match(CALLOUT_RE)

  if (match) {
    const type = match[1].toLowerCase()
    const title = match[2]?.trim()
    const style = CALLOUT_STYLES[type] ?? CALLOUT_STYLES.info
    const Icon = style.icon
    const rest = kids.slice(1)
    return (
      <div className={`my-4 flex gap-3 rounded-2xl border px-4 py-3.5 ${style.cls}`}>
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconCls}`} aria-hidden />
        <div className="min-w-0 text-[15px] leading-relaxed [&>p]:m-0 [&>p+p]:mt-2">
          {title && <p className="mb-1 font-display font-semibold text-[var(--text)]">{title}</p>}
          {rest}
        </div>
      </div>
    )
  }

  return (
    <blockquote className="my-4 border-l-4 border-[var(--border)] pl-4 italic text-[var(--text-dim)]">
      {children}
    </blockquote>
  )
}

/**
 * A `> [!type] Title` line immediately followed by more `>` lines (no blank line
 * between) parses as ONE merged paragraph in CommonMark, which breaks the title/body
 * split the Blockquote renderer above relies on. Insert a blank quoted line after the
 * marker line so the blockquote keeps the marker and body as separate paragraphs.
 */
function preprocessCallouts(src: string): string {
  return src.replace(/^(> \[!\w+\][^\n]*)\n(> (?!\[!)[^\n]*(?:\n> [^\n]*)*)/gm, (_full, header, body) => `${header}\n>\n${body}`)
}

export function Markdown({ source }: { source: string }) {
  const processed = preprocessCallouts(source)
  return (
    <div className="prose-ens">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          blockquote: Blockquote,
          a: ({ href, children }) => {
            if (href?.startsWith('topic:')) {
              const id = href.slice('topic:'.length)
              return (
                <Link to={`/aihe/${id}`} className="font-medium text-brand-600 underline decoration-brand-300 decoration-2 underline-offset-2 hover:text-brand-500">
                  {children}
                </Link>
              )
            }
            return (
              <a href={href} target="_blank" rel="noreferrer noopener" className="font-medium text-brand-600 underline decoration-brand-300 decoration-2 underline-offset-2 hover:text-brand-500">
                {children}
              </a>
            )
          },
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border-b border-[var(--border)] bg-[var(--bg-raised)] px-3 py-2 text-left font-display font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-[var(--border)] px-3 py-2 align-top">{children}</td>,
          h2: ({ children }) => <h2 className="mt-9 mb-3 scroll-mt-20 text-xl font-semibold first:mt-0 sm:text-2xl">{children}</h2>,
          h3: ({ children }) => <h3 className="mt-6 mb-2 scroll-mt-20 text-lg font-semibold">{children}</h3>,
          p: ({ children }) => <p className="my-3 leading-relaxed text-[var(--text)]">{children}</p>,
          ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-brand-500">{children}</ul>,
          ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-brand-500">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-[var(--text)]">{children}</strong>,
          code: ({ children }) => <code className="rounded bg-[var(--bg-raised)] px-1.5 py-0.5 font-mono text-[0.85em]">{children}</code>,
          hr: () => <hr className="my-8 border-[var(--border)]" />,
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
