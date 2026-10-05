import type { FlashCard, QuizQuestion, Scenario } from './types'
import { topics, getTopic } from './topics'
import { modules } from './modules'

const articleModules = import.meta.glob('./articles/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const quizModules = import.meta.glob('./quizzes/*.json', { eager: true }) as Record<string, { default: QuizQuestion[] }>
const flashcardModules = import.meta.glob('./flashcards/*.json', { eager: true }) as Record<string, { default: FlashCard[] }>
const scenarioModules = import.meta.glob('./scenarios/*.json', { eager: true }) as Record<string, { default: Scenario }>

function idFromPath(path: string): string {
  const file = path.split('/').pop() ?? ''
  return file.replace(/\.(md|json)$/, '')
}

const articlesById = new Map<string, string>()
for (const [path, raw] of Object.entries(articleModules)) {
  articlesById.set(idFromPath(path), raw)
}

const quizzesById = new Map<string, QuizQuestion[]>()
for (const [path, mod] of Object.entries(quizModules)) {
  quizzesById.set(idFromPath(path), mod.default)
}

const flashcardsById = new Map<string, FlashCard[]>()
for (const [path, mod] of Object.entries(flashcardModules)) {
  flashcardsById.set(idFromPath(path), mod.default)
}

const scenariosById = new Map<string, Scenario>()
for (const [path, mod] of Object.entries(scenarioModules)) {
  scenariosById.set(idFromPath(path), mod.default)
}

export function getArticle(id: string): string | undefined {
  return articlesById.get(id)
}

export function getQuiz(id: string): QuizQuestion[] {
  return quizzesById.get(id) ?? []
}

export function getFlashcards(id: string): FlashCard[] {
  return flashcardsById.get(id) ?? []
}

export function getScenario(id: string): Scenario | undefined {
  return scenariosById.get(id)
}

/** Standalone quiz packs not tied to a single article (e.g. HUS-tietotesti). */
export interface QuizPack {
  id: string
  title: string
  description: string
}

export const quizPacks: QuizPack[] = [
  {
    id: 'hus-tietotesti',
    title: 'Yleinen tietotesti -harjoitus',
    description: 'Laaja kertauspaketti akuuttihoidon yleisosaamisesta – hyvä tapa testata kokonaiskuvaa.',
  },
]

export function getQuizPack(id: string): QuizQuestion[] {
  return quizzesById.get(id) ?? []
}

export function allTopicIds(): string[] {
  return topics.map((t) => t.id)
}

/** Content completeness report, used only during local dev to spot missing files. */
export function contentReport() {
  const missing: string[] = []
  for (const t of topics) {
    if (!articlesById.has(t.id) && !t.hasScenario) missing.push(`article:${t.id}`)
    if (t.hasQuiz && !quizzesById.has(t.id)) missing.push(`quiz:${t.id}`)
    if (t.hasFlashcards && !flashcardsById.has(t.id)) missing.push(`flashcards:${t.id}`)
    if (t.hasScenario && !scenariosById.has(t.id)) missing.push(`scenario:${t.id}`)
  }
  return missing
}

export { topics, getTopic, modules }
