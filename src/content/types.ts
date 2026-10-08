// Shared content types for the study app.
// Articles are authored as Markdown (src/content/articles/<id>.md).
// Quizzes, flashcards and scenarios are authored as JSON matching these types.

export type ModuleId =
  | 'perusteet'
  | 'hengitys'
  | 'sydan'
  | 'neurologia'
  | 'vatsa'
  | 'sokeri'
  | 'myrkytys'
  | 'trauma'
  | 'lapset'
  | 'raskaus'
  | 'infektiot'
  | 'laakkeet'
  | 'ammatillinen'

export interface TopicMeta {
  id: string
  moduleId: ModuleId
  title: string
  /** One-sentence teaser shown on cards / nav */
  summary: string
  /** Approx. minutes to read, shown to the student */
  readMinutes: number
  hasQuiz: boolean
  hasFlashcards: boolean
  hasScenario: boolean
  /** Dispatch/call code shown as a badge for case-based pages, e.g. "703" */
  dispatchCode?: string
}

export interface ModuleMeta {
  id: ModuleId
  title: string
  shortTitle: string
  description: string
  /** lucide-react icon component name */
  icon: string
  /** tailwind color token used for accents, e.g. 'rose' | 'sky' | 'amber' */
  color: string
}

export type QuizQuestionType = 'mcq' | 'truefalse'

export interface QuizQuestion {
  id: string
  type: QuizQuestionType
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface FlashCard {
  id: string
  front: string
  back: string
}

export interface ScenarioChoice {
  text: string
  correct: boolean
  feedback: string
}

/** Measurements stated in a step's situation text (never inferred). Shown on the patient monitor. */
export interface ScenarioVitals {
  hr?: number
  spo2?: number
  /** [systolic, diastolic] mmHg */
  bp?: [number, number]
  rr?: number
  gcs?: number
  /** Blood glucose, mmol/l */
  glucose?: number
  /** Blood ketones, mmol/l */
  ketones?: number
  /** Pain VAS 0–10 */
  pain?: number
  pulse?: 'irregular'
  breath?: 'deep' | 'shallow' | 'irregular'
  /** Short findings quoted from the text, e.g. "Pupillit pistemäiset". */
  findings?: string[]
}

export interface ScenarioStep {
  id: string
  situation: string
  question: string
  choices: ScenarioChoice[]
  vitals?: ScenarioVitals
}

export interface Scenario {
  id: string
  title: string
  dispatchCode?: string
  intro: string
  steps: ScenarioStep[]
  debrief: string
}
