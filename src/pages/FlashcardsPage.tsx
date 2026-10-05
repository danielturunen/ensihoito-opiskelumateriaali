import { Link, Navigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getTopic } from '../content/topics'
import { getFlashcards } from '../content/loader'
import { FlashcardDeck } from '../components/FlashcardDeck'

export function FlashcardsPage() {
  const { topicId = '' } = useParams()
  const topic = getTopic(topicId)
  if (!topic) return <Navigate to="/aiheet" replace />

  const cards = getFlashcards(topic.id)

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-10">
      <Link to={`/aihe/${topic.id}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-dim)] hover:text-[var(--text)]">
        <ChevronLeft className="h-4 w-4" /> {topic.title}
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold">Kertauskortit</h1>
      <p className="mt-1 text-[14px] text-[var(--text-dim)]">{topic.title} · {cards.length} korttia</p>

      <div className="mt-6">
        <FlashcardDeck deckId={topic.id} cards={cards} />
      </div>
    </div>
  )
}
