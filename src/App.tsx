import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { HomePage } from './pages/HomePage'

const ModulesIndexPage = lazy(() => import('./pages/ModulesIndexPage').then((m) => ({ default: m.ModulesIndexPage })))
const ModulePage = lazy(() => import('./pages/ModulePage').then((m) => ({ default: m.ModulePage })))
const TopicPage = lazy(() => import('./pages/TopicPage').then((m) => ({ default: m.TopicPage })))
const QuizPage = lazy(() => import('./pages/QuizPage').then((m) => ({ default: m.QuizPage })))
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage').then((m) => ({ default: m.FlashcardsPage })))
const ScenarioPage = lazy(() => import('./pages/ScenarioPage').then((m) => ({ default: m.ScenarioPage })))
const ExamModePage = lazy(() => import('./pages/ExamModePage').then((m) => ({ default: m.ExamModePage })))
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/aiheet" element={<ModulesIndexPage />} />
            <Route path="/moduuli/:moduleId" element={<ModulePage />} />
            <Route path="/aihe/:topicId" element={<TopicPage />} />
            <Route path="/aihe/:topicId/tietovisa" element={<QuizPage />} />
            <Route path="/aihe/:topicId/kertauskortit" element={<FlashcardsPage />} />
            <Route path="/aihe/:topicId/tapaus" element={<ScenarioPage />} />
            <Route path="/tenttitila" element={<ExamModePage />} />
            <Route path="/edistyminen" element={<ProgressPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
