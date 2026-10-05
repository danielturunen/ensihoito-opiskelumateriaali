import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
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

const SWIPE_DISTANCE = 100
const SWIPE_VELOCITY = 500
const SPRING = { type: 'spring', duration: 0.5, bounce: 0.15 } as const

export function FlashcardDeck({ deckId, cards }: { deckId: string; cards: FlashCard[] }) {
  const ordered = useMemo(() => shuffle(cards), [cards])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [again, setAgain] = useState(0)
  const [done, setDone] = useState(false)
  const [exitDir, setExitDir] = useState<1 | -1>(1)

  if (cards.length === 0) return <p className="text-[var(--text-dim)]">Kertauskortteja ei ole vielä saatavilla tälle aiheelle.</p>

  function mark(isKnown: boolean) {
    setExitDir(isKnown ? 1 : -1)
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
          <span className="font-semibold text-teal-600">{known} osasin</span>
          <span className="font-semibold text-danger-500">{again} kertaa vielä</span>
        </div>
        <button
          onClick={restart}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          <RotateCcw className="h-4 w-4" /> Aloita alusta
        </button>
      </div>
    )
  }

  const card = ordered[index]

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-card)]">
          <div className="h-full rounded-full bg-teal-500 transition-[width] duration-300 ease-out" style={{ width: `${((index + 1) / ordered.length) * 100}%` }} />
        </div>
        <span className="shrink-0 text-[12px] font-medium text-[var(--text-dim)]">
          {index + 1}/{ordered.length}
        </span>
      </div>

      <div className="relative" style={{ perspective: 1200 }}>
        <AnimatePresence mode="popLayout" custom={exitDir} initial={false}>
          <SwipeCard key={card.id} card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} onCommit={mark} />
        </AnimatePresence>
      </div>

      <p className="mt-3 text-center text-[12px] text-[var(--text-dim)]">Napauta kääntääksesi · pyyhkäise vastauksen jälkeen</p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          onClick={() => mark(false)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-danger-500/30 bg-danger-500/5 py-3 text-[13px] font-semibold text-danger-500 transition-[background-color,transform] duration-150 ease-out hover:bg-danger-500/10 active:scale-[0.97]"
        >
          <X className="h-4 w-4" /> Kertaa vielä
        </button>
        <button
          onClick={() => mark(true)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/5 py-3 text-[13px] font-semibold text-teal-600 transition-[background-color,transform] duration-150 ease-out hover:bg-teal-500/10 active:scale-[0.97]"
        >
          <Check className="h-4 w-4" /> Osasin
        </button>
      </div>
    </div>
  )
}

function SwipeCard({ card, flipped, onFlip, onCommit }: { card: FlashCard; flipped: boolean; onFlip: () => void; onCommit: (known: boolean) => void }) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-14, 14])
  const knownOpacity = useTransform(x, [20, 110], [0, 1])
  const againOpacity = useTransform(x, [-110, -20], [1, 0])

  const cardVariants = {
    enter: { opacity: 0, scale: 0.95, y: 8 },
    center: { opacity: 1, scale: 1, y: 0 },
    exit: reduceMotion
      ? { opacity: 0, transition: { duration: 0.15 } }
      : (dir: 1 | -1) => ({ x: dir * 400, opacity: 0, rotate: dir * 18, transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] as const } }),
  }

  return (
    <motion.div
      className="relative touch-pan-y"
      style={{ x, rotate: reduceMotion ? 0 : rotate }}
      drag={flipped && !reduceMotion ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.75}
      onDragEnd={(_e, info) => {
        if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) onCommit(true)
        else if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) onCommit(false)
      }}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={SPRING}
    >
      {flipped && (
        <>
          <motion.div
            style={{ opacity: knownOpacity }}
            className="pointer-events-none absolute left-4 top-4 z-10 -rotate-12 rounded-lg border-2 border-teal-500 px-2.5 py-1 text-[13px] font-bold tracking-wide text-teal-500"
          >
            OSASIN
          </motion.div>
          <motion.div
            style={{ opacity: againOpacity }}
            className="pointer-events-none absolute right-4 top-4 z-10 rotate-12 rounded-lg border-2 border-danger-500 px-2.5 py-1 text-[13px] font-bold tracking-wide text-danger-500"
          >
            KERTAA
          </motion.div>
        </>
      )}

      <button onClick={onFlip} className="block w-full cursor-pointer" style={{ perspective: 1200 }} aria-label="Käännä kortti">
        <motion.div
          className="relative min-h-[240px]"
          style={{ transformStyle: reduceMotion ? 'flat' : 'preserve-3d' }}
          animate={{ rotateY: reduceMotion ? 0 : flipped ? 180 : 0 }}
          transition={SPRING}
        >
          <div
            className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] p-7 text-center shadow-[var(--shadow)]"
            style={{
              backfaceVisibility: reduceMotion ? 'visible' : 'hidden',
              WebkitBackfaceVisibility: reduceMotion ? 'visible' : 'hidden',
              display: reduceMotion && flipped ? 'none' : 'flex',
            }}
          >
            <span className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Kysymys</span>
            <p className="font-display text-[19px] font-semibold leading-snug">{card.front}</p>
          </div>
          <div
            className="absolute inset-0 flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-teal-500/30 bg-[var(--bg-raised)] p-7 text-center shadow-[var(--shadow)]"
            style={{
              backfaceVisibility: reduceMotion ? 'visible' : 'hidden',
              WebkitBackfaceVisibility: reduceMotion ? 'visible' : 'hidden',
              transform: reduceMotion ? 'none' : 'rotateY(180deg)',
              display: reduceMotion && !flipped ? 'none' : 'flex',
            }}
          >
            <span className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-teal-500">Vastaus</span>
            <p className="font-display text-[19px] font-semibold leading-snug">{card.back}</p>
          </div>
        </motion.div>
      </button>
    </motion.div>
  )
}
