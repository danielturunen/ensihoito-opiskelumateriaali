import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'ensihoito:progress:v1'

export interface QuizResult {
  bestScore: number
  lastScore: number
  attempts: number
  lastAttemptAt: string
}

export interface FlashcardCardState {
  box: number // 1 (new/hard) .. 5 (mastered)
  dueAt: string
  reviews: number
}

export interface ScenarioResult {
  correctSteps: number
  totalSteps: number
  completedAt: string
}

export interface ProgressState {
  version: 1
  completedTopics: Record<string, string> // topicId -> ISO completedAt
  favorites: string[]
  lastTopicId?: string
  quizResults: Record<string, QuizResult>
  flashcardState: Record<string, Record<string, FlashcardCardState>>
  scenarioCompletions: Record<string, ScenarioResult>
}

function emptyState(): ProgressState {
  return {
    version: 1,
    completedTopics: {},
    favorites: [],
    quizResults: {},
    flashcardState: {},
    scenarioCompletions: {},
  }
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    return { ...emptyState(), ...parsed }
  } catch {
    return emptyState()
  }
}

let state: ProgressState = typeof window !== 'undefined' ? load() : emptyState()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota/private-mode errors */
  }
  for (const l of listeners) l()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return state
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export const progressActions = {
  markTopicComplete(topicId: string) {
    state = { ...state, completedTopics: { ...state.completedTopics, [topicId]: new Date().toISOString() } }
    persist()
  },
  markTopicIncomplete(topicId: string) {
    const next = { ...state.completedTopics }
    delete next[topicId]
    state = { ...state, completedTopics: next }
    persist()
  },
  setLastTopic(topicId: string) {
    state = { ...state, lastTopicId: topicId }
    persist()
  },
  toggleFavorite(topicId: string) {
    const has = state.favorites.includes(topicId)
    state = { ...state, favorites: has ? state.favorites.filter((id) => id !== topicId) : [...state.favorites, topicId] }
    persist()
  },
  recordQuizResult(quizId: string, scorePct: number) {
    const prev = state.quizResults[quizId]
    state = {
      ...state,
      quizResults: {
        ...state.quizResults,
        [quizId]: {
          bestScore: Math.max(prev?.bestScore ?? 0, scorePct),
          lastScore: scorePct,
          attempts: (prev?.attempts ?? 0) + 1,
          lastAttemptAt: new Date().toISOString(),
        },
      },
    }
    persist()
  },
  recordScenarioResult(scenarioId: string, correctSteps: number, totalSteps: number) {
    state = {
      ...state,
      scenarioCompletions: {
        ...state.scenarioCompletions,
        [scenarioId]: { correctSteps, totalSteps, completedAt: new Date().toISOString() },
      },
    }
    persist()
  },
  /** Simple 5-box leitner scheduling. `known` pushes the card further out, `again` resets it. */
  reviewFlashcard(deckId: string, cardId: string, known: boolean) {
    const deck = state.flashcardState[deckId] ?? {}
    const prev = deck[cardId] ?? { box: 1, dueAt: new Date().toISOString(), reviews: 0 }
    const box = known ? Math.min(5, prev.box + 1) : 1
    const daysOut = [0, 1, 3, 7, 14, 30][box]
    const dueAt = new Date(Date.now() + daysOut * 24 * 60 * 60 * 1000).toISOString()
    state = {
      ...state,
      flashcardState: {
        ...state.flashcardState,
        [deckId]: { ...deck, [cardId]: { box, dueAt, reviews: prev.reviews + 1 } },
      },
    }
    persist()
  },
  resetAll() {
    state = emptyState()
    persist()
  },
}

export function exportProgress(): string {
  return JSON.stringify(state, null, 2)
}

export function deckMasteryPct(deckId: string, totalCards: number): number {
  if (totalCards === 0) return 0
  const deck = state.flashcardState[deckId]
  if (!deck) return 0
  const mastered = Object.values(deck).filter((c) => c.box >= 4).length
  return Math.round((mastered / totalCards) * 100)
}
