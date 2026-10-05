import { useMemo, useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import type { FlashCard } from '../content/types'
import { progressActions } from '../lib/progress'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function FlashcardDeck({ deckId, cards }: { deckId: string; cards: FlashCard[] }) {
  const ordered = useMemo(() => shuffle(cards), [cards])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [again, setAgain] = useState(0)
  const [done, setDone] = useState(false)

  if (cards.length === 0) return <p className="text-[var(--text-dim)]">Kertauskortteja ei ole vielä saatavilla tälle aiheelle.</p>

  function mark(isKnown: boolean) {
    progressActions.reviewFlashcard(deckId, ordered[index].id, isKnown)
    if (isKnown) setKnown((k) => k + 1)
    else setAgain((a) => a + 1)
    if (index + 1 < ordered.length) {
      setIndex(index + 1)
      setFlipped(false)
    } else {
      setDone(true)
    }
  }

  function restart() {
    setIndex(0)
    setFlipped(false)
    setKnown(0)
    setAgain(0)
    setDone(false)
  }

  if (done) {
    return (
      <div className="animate-fade-up rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-6 text-center shadow-[var(--shadow)]">
        <p className="font-display text-2xl font-bold">Kansio käyty läpi</p>
        <div className="mt-3 flex justify-center gap-6 text-[14px]">
          <span className="text-teal-600 font-semibold">{known} osasin</span>
          <span className="text-danger-500 font-semibold">{again} kertaa vielä</span>
        </div>
        <button onClick={restart} className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-brand-500/30">
          <RotateCcw className="h-4 w-4" /> Aloita alusta
        </button>
      </div>
    )
  }

  const card = ordered[index]

  return (
    <div className="animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-card)]">
          <div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${((index + 1) / ordered.length) * 100}%` }} />
        </div>
        <span className="shrink-0 text-[12px] font-medium text-[var(--text-dim)]">
          {index + 1}/{ordered.length}
        </span>
      </div>

      <button
        key={card.id}
        onClick={() => setFlipped((f) => !f)}
        className="animate-fade-up flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-7 text-center shadow-[var(--shadow)] transition-colors hover:border-brand-300"
      >
        <span className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{flipped ? 'Vastaus' : 'Kysymys · napauta kääntääksesi'}</span>
        <p className="font-display text-[19px] font-semibold leading-snug">{flipped ? card.back : card.front}</p>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => mark(false)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-danger-500/30 bg-danger-500/5 py-3 text-[13px] font-semibold text-danger-500 transition-colors hover:bg-danger-500/10"
        >
          <X className="h-4 w-4" /> Kertaa vielä
        </button>
        <button
          onClick={() => mark(true)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/5 py-3 text-[13px] font-semibold text-teal-600 transition-colors hover:bg-teal-500/10"
        >
          <Check className="h-4 w-4" /> Osasin
        </button>
      </div>
    </div>
  )
}
