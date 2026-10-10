import { useMemo, useState } from 'react'
import type { WidgetProps } from '../registry'
import { Result, type Tone } from '../ui'

/* Generic yes/no decision check. Props:
 * { required: [{label}], blockers: [{label, note?}], requiredTitle?, blockersTitle?,
 *   ok: {title, text}, notOk: {title, text}, pending?: {title, text} }
 * Decision allowed only when every "required" is KYLLÄ and every "blocker" is EI. */

interface Q {
  label: string
  note?: string
}
interface Out {
  title: string
  text?: string
}

type Ans = 'y' | 'n' | undefined

function Row({ q, ans, onAns, bad }: { q: Q; ans: Ans; onAns: (a: Ans) => void; bad: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 transition-[background-color,border-color] duration-150 ${bad ? 'border-danger-500/45 bg-danger-500/10' : 'border-[var(--border)]'}`}>
      <p className="text-[13px] leading-snug text-[var(--text)]">{q.label}</p>
      {bad && q.note && <p className="mt-0.5 text-[12px] text-[var(--text-dim)]">{q.note}</p>}
      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        {(['y', 'n'] as const).map((v) => (
          <button
            key={v}
            onClick={() => onAns(ans === v ? undefined : v)}
            aria-pressed={ans === v}
            className={`min-h-[36px] rounded-lg border text-[12px] font-semibold transition-[background-color,border-color] duration-150 ${
              ans === v ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'
            }`}
          >
            {v === 'y' ? 'Kyllä' : 'Ei'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function GoNoGo(props: WidgetProps) {
  const required = useMemo(() => (props.required as Q[] | undefined) ?? [], [props.required])
  const blockers = useMemo(() => (props.blockers as Q[] | undefined) ?? [], [props.blockers])
  const ok = props.ok as Out
  const notOk = props.notOk as Out
  const pending = (props.pending as Out | undefined) ?? { title: 'Vastaa kaikkiin kysymyksiin', text: 'Päätöksen edellytykset arvioidaan vasta, kun jokainen kohta on käyty läpi.' }
  const [ra, setRa] = useState<Ans[]>(() => required.map(() => undefined))
  const [ba, setBa] = useState<Ans[]>(() => blockers.map(() => undefined))

  const failedReq = ra.some((a) => a === 'n')
  const hitBlock = ba.some((a) => a === 'y')
  const allAnswered = ra.every(Boolean) && ba.every(Boolean)

  let out: Out
  let tone: Tone
  if (failedReq || hitBlock) {
    out = notOk
    tone = 'danger'
  } else if (allAnswered) {
    out = ok
    tone = 'ok'
  } else {
    out = pending
    tone = 'neutral'
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{(props.requiredTitle as string) ?? 'Kaikkiin vastaus KYLLÄ'}</p>
      <div className="flex flex-col gap-1.5">
        {required.map((q, i) => (
          <Row key={q.label} q={q} ans={ra[i]} bad={ra[i] === 'n'} onAns={(a) => setRa((s) => s.map((x, j) => (j === i ? a : x)))} />
        ))}
      </div>
      <p className="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{(props.blockersTitle as string) ?? 'Yksikin KYLLÄ estää päätöksen'}</p>
      <div className="flex flex-col gap-1.5">
        {blockers.map((q, i) => (
          <Row key={q.label} q={q} ans={ba[i]} bad={ba[i] === 'y'} onAns={(a) => setBa((s) => s.map((x, j) => (j === i ? a : x)))} />
        ))}
      </div>
      <div className="mt-3">
        <Result tone={tone} title={out.title}>
          {out.text}
        </Result>
      </div>
    </div>
  )
}
