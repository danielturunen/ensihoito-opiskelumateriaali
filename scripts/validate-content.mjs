// Checks that every topic in src/content/topics.ts has the files its flags require,
// that every JSON file parses, and that every `(topic:<id>)` link in articles points
// to a real topic id. Run with: node scripts/validate-content.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const contentDir = path.join(dir, '..', 'src', 'content')

const topicsSrc = fs.readFileSync(path.join(contentDir, 'topics.ts'), 'utf8')

// Lightweight parse: pull out each `{ id: '...', ... hasQuiz: bool, hasFlashcards: bool, hasScenario: bool }`
const topicBlocks = [...topicsSrc.matchAll(/\{\s*id:\s*'([^']+)'[^}]*?\}/gs)]
const topics = topicBlocks.map((m) => {
  const block = m[0]
  const id = m[1]
  const get = (flag) => new RegExp(`${flag}:\\s*true`).test(block)
  return {
    id,
    hasQuiz: get('hasQuiz'),
    hasFlashcards: get('hasFlashcards'),
    hasScenario: get('hasScenario'),
  }
})

const knownIds = new Set(topics.map((t) => t.id))
let errors = 0
let warnings = 0

function exists(sub, id, ext) {
  return fs.existsSync(path.join(contentDir, sub, `${id}.${ext}`))
}

function readJSON(sub, id) {
  const p = path.join(contentDir, sub, `${id}.json`)
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch (e) {
    console.error(`INVALID JSON  ${sub}/${id}.json — ${e.message}`)
    errors++
    return null
  }
}

for (const t of topics) {
  const hasArticle = exists('articles', t.id, 'md')
  if (!t.hasScenario && !hasArticle) {
    console.error(`MISSING article/${t.id}.md`)
    errors++
  }
  if (t.hasScenario && hasArticle) {
    console.warn(`NOTE  ${t.id} has hasScenario:true but also an article file — check this is intentional`)
    warnings++
  }

  if (t.hasQuiz) {
    if (!exists('quizzes', t.id, 'json')) {
      console.error(`MISSING quizzes/${t.id}.json`)
      errors++
    } else {
      const q = readJSON('quizzes', t.id)
      if (q && (!Array.isArray(q) || q.length < 4)) {
        console.warn(`THIN quiz  ${t.id} has only ${Array.isArray(q) ? q.length : '?'} questions`)
        warnings++
      }
      if (Array.isArray(q)) {
        for (const item of q) {
          if (typeof item.correctIndex !== 'number' || item.correctIndex < 0 || item.correctIndex >= item.options.length) {
            console.error(`BAD correctIndex in quizzes/${t.id}.json for question "${item.question?.slice(0, 40)}"`)
            errors++
          }
        }
      }
    }
  }

  if (t.hasFlashcards) {
    if (!exists('flashcards', t.id, 'json')) {
      console.error(`MISSING flashcards/${t.id}.json`)
      errors++
    } else {
      const f = readJSON('flashcards', t.id)
      if (f && (!Array.isArray(f) || f.length < 4)) {
        console.warn(`THIN flashcards  ${t.id} has only ${Array.isArray(f) ? f.length : '?'} cards`)
        warnings++
      }
    }
  }

  if (t.hasScenario) {
    if (!exists('scenarios', t.id, 'json')) {
      console.error(`MISSING scenarios/${t.id}.json`)
      errors++
    } else {
      const s = readJSON('scenarios', t.id)
      if (s && (!Array.isArray(s.steps) || s.steps.length < 2)) {
        console.warn(`THIN scenario  ${t.id} has only ${s.steps?.length ?? '?'} steps`)
        warnings++
      }
    }
  }

  // Check internal topic: links resolve
  if (hasArticle) {
    const md = fs.readFileSync(path.join(contentDir, 'articles', `${t.id}.md`), 'utf8')
    for (const m of md.matchAll(/\(topic:([a-z0-9-]+)\)/g)) {
      if (!knownIds.has(m[1])) {
        console.error(`BROKEN LINK in articles/${t.id}.md -> topic:${m[1]} (no such topic id)`)
        errors++
      }
    }
  }
}

console.log(`\n${topics.length} topics checked. ${errors} errors, ${warnings} warnings.`)
process.exit(errors > 0 ? 1 : 0)
