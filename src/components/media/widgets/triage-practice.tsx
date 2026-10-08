import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Caption } from '../ui'

/* Primary triage drill following the Modified Simple Triage and Rapid Treatment chart
 * (Kuisma & Porthan, Ensihoito-kirja 8.2). One decision per patient, ~30 s each. */

type Tag = 'green' | 'yellow' | 'red' | 'black'

const TAGS: { id: Tag; label: string; bg: string; fg: string }[] = [
  { id: 'red', label: 'Punainen', bg: '#dc2626', fg: '#fff' },
  { id: 'yellow', label: 'Keltainen', bg: '#facc15', fg: '#111' },
  { id: 'green', label: 'Vihreä', bg: '#16a34a', fg: '#fff' },
  { id: 'black', label: 'Musta', bg: '#111827', fg: '#fff' },
]

interface Case {
  text: string
  tag: Tag
  path: string[]
}

const CASES: Case[] = [
  { text: 'Nuori mies kävelee luoksesi, käsivarressa pieni vuotava viilto.', tag: 'green', path: ['Kävelee → vihreä'] },
  { text: 'Nainen istuu maassa, ei pysty kävelemään. Reiden haavasta suihkuaa verta.', tag: 'red', path: ['Ei kävele', 'Suuri ulkoinen verenvuoto → punainen', 'Tyrehdytä heti kiristyssiteellä'] },
  { text: 'Mies makaa liikkumatta eikä hengitä. Kun avaat hengitystiet, hän alkaa hengittää.', tag: 'red', path: ['Ei kävele', 'Ei hengitä → avaa hengitystiet', 'Hengittää → punainen', 'Käännä kylkiasentoon'] },
  { text: 'Nainen ei hengitä. Hengitystien avaamisen jälkeenkään hengitys ei käynnisty, eikä kaulavaltimon syke tunnu.', tag: 'black', path: ['Ei kävele', 'Ei hengitä → avaa hengitystiet', 'Ei hengitä, karotissyke ei tunnu → musta'] },
  { text: 'Iäkäs mies makaa maassa ja hengittää 34 kertaa minuutissa.', tag: 'red', path: ['Ei kävele', 'Hengittää', 'Hengitystaajuus yli 30/min → punainen'] },
  { text: 'Nuori nainen ei pysty nousemaan. Hengitys 20/min, rannesyke ei tunnu.', tag: 'red', path: ['Ei kävele', 'Hengitys 10–30/min', 'Rannepulssi ei tunnu → punainen'] },
  { text: 'Mies istuu ja pitelee nilkkaansa, ei pysty kävelemään. Hengitys 18/min, rannesyke tuntuu, vastaa kysymyksiisi asiallisesti.', tag: 'yellow', path: ['Ei kävele', 'Hengitys 10–30/min', 'Rannepulssi tuntuu', 'Vastaa yksinkertaisiin kysymyksiin → keltainen'] },
  { text: 'Nainen makaa silmät auki. Hengitys 16/min, rannesyke tuntuu, mutta hän ei vastaa yksinkertaisiin kysymyksiin.', tag: 'red', path: ['Ei kävele', 'Hengitys 10–30/min', 'Rannepulssi tuntuu', 'Ei vastaa yksinkertaisiin kysymyksiin → punainen'] },
  { text: 'Lapsi itkee äidin sylissä, molemmat kävelevät turvaan. Lapsella on naarmuja kasvoissa.', tag: 'green', path: ['Kävelevät → vihreä (kaikki kävelevät potilaat)'] },
  { text: 'Mies makaa paikallaan. Hengitys on hyvin hidasta, noin 6 kertaa minuutissa.', tag: 'red', path: ['Ei kävele', 'Hengittää', 'Hengitystaajuus hyvin matala → punainen'] },
]

export default function TriagePractice(_props: WidgetProps) {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<Tag | null>(null)
  const [score, setScore] = useState({ right: 0, done: 0 })
  const c = CASES[i]
  const correct = pick === c.tag
  const tag = TAGS.find((t) => t.id === c.tag)!

  const choose = (t: Tag) => {
    if (pick) return
    setPick(t)
    setScore((s) => ({ right: s.right + (t === c.tag ? 1 : 0), done: s.done + 1 }))
  }
  const next = () => {
    setPick(null)
    setI((v) => (v + 1) % CASES.length)
    if (i === CASES.length - 1) setScore({ right: 0, done: 0 })
  }

  return (
    <div>
      <div className="flex items-center justify-between text-[12px] text-[var(--text-dim)]">
        <span>
          Potilas {i + 1} / {CASES.length}
        </span>
        <span className="tabular-nums">
          Oikein {score.right} / {score.done}
        </span>
      </div>

      <div className="relative mt-2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={i}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="pr-14 text-[14.5px] leading-snug text-[var(--text)]"
          >
            {c.text}
          </motion.p>
        </AnimatePresence>
        <AnimatePresence>
          {pick && (
            <motion.div
              key={`tag-${i}`}
              initial={{ rotate: -20, y: -40, opacity: 0 }}
              animate={{ rotate: -8, y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.35 }}
              className="absolute right-3 top-3 flex h-12 w-10 items-center justify-center rounded-md text-[13px] font-bold shadow-md"
              style={{ background: tag.bg, color: tag.fg }}
              aria-hidden
            >
              {tag.label[0]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {TAGS.map((t) => {
          const chosen = pick === t.id
          const isAnswer = pick && t.id === c.tag
          return (
            <button
              key={t.id}
              type="button"
              disabled={!!pick}
              onClick={() => choose(t.id)}
              className={`min-h-12 rounded-xl border-2 text-[14px] font-semibold transition-[opacity,transform] active:scale-[0.98] ${pick && !chosen && !isAnswer ? 'opacity-35' : ''}`}
              style={{ background: t.bg, color: t.fg, borderColor: isAnswer ? 'var(--text)' : t.id === 'black' ? 'var(--border)' : 'transparent' }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {pick && (
        <div className={`mt-3 rounded-xl border px-4 py-3 ${correct ? 'border-teal-500/30 bg-teal-500/10' : 'border-danger-500/35 bg-danger-500/10'}`} aria-live="polite">
          <p className={`font-display text-[15px] font-semibold ${correct ? 'text-teal-600' : 'text-danger-500'}`}>{correct ? 'Oikein' : `Oikea luokka: ${tag.label}`}</p>
          <ol className="mt-1.5 space-y-0.5 text-[13px] leading-snug text-[var(--text)]">
            {c.path.map((p, k) => (
              <li key={k}>
                <span className="text-[var(--text-dim)]">{k + 1}.</span> {p}
              </li>
            ))}
          </ol>
          <button type="button" onClick={next} className="mt-3 min-h-11 w-full rounded-xl bg-brand-600 text-[14px] font-semibold text-white active:scale-[0.98]">
            Seuraava potilas →
          </button>
        </div>
      )}

      <div className="mt-3">
        <Caption>Kävelee → vihreä · suuri ulkoinen vuoto → punainen · ei hengitä avaamisenkaan jälkeen eikä karotis tunnu → musta · hengitys poikkeava, rannepulssi ei tunnu tai ei vastaa kysymyksiin → punainen · muut → keltainen. Ainoat sallitut hoidot: hengitystien avaus ja kylkiasento sekä massiivin vuodon tyrehdytys.</Caption>
      </div>
    </div>
  )
}
