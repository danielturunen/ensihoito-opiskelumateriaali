import Fuse from 'fuse.js'
import { topics } from '../content/topics'
import { modules } from '../content/modules'
import { getArticle } from '../content/loader'

export interface SearchDoc {
  id: string
  title: string
  summary: string
  moduleTitle: string
  snippet: string
}

function stripMarkdown(src: string): string {
  return src
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[>#*_`~|-]/g, ' ')
    .replace(/\[!\w+\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

let docs: SearchDoc[] | null = null

function buildDocs(): SearchDoc[] {
  return topics.map((t) => {
    const mod = modules.find((m) => m.id === t.moduleId)
    const raw = getArticle(t.id) ?? ''
    const plain = stripMarkdown(raw)
    return {
      id: t.id,
      title: t.title,
      summary: t.summary,
      moduleTitle: mod?.shortTitle ?? '',
      snippet: plain.slice(0, 400),
    }
  })
}

let fuse: Fuse<SearchDoc> | null = null

function getFuse() {
  if (!fuse) {
    docs = buildDocs()
    fuse = new Fuse(docs, {
      keys: [
        { name: 'title', weight: 0.45 },
        { name: 'summary', weight: 0.2 },
        { name: 'moduleTitle', weight: 0.1 },
        { name: 'snippet', weight: 0.25 },
      ],
      threshold: 0.32,
      ignoreLocation: true,
      minMatchCharLength: 2,
    })
  }
  return fuse
}

export function search(query: string, limit = 12): SearchDoc[] {
  const q = query.trim()
  if (!q) return []
  return getFuse()
    .search(q, { limit })
    .map((r) => r.item)
}
