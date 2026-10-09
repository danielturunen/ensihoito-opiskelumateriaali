import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, RotateCcw } from 'lucide-react'
import { Result, type Tone } from '../ui'

/* Headache sorting on scene: danger signs first, then migraine (ICHD-3 B–D) vs
 * tension-type features. Content: Käypä hoito Migreeni 2024. */

type Group = 'red' | 'mig' | 'migD' | 'tens'
interface Item {
  id: string
  label: string
  group: Group
}

const ITEMS: Item[] = [
  { id: 'r1', label: 'Tajunnan lasku tai kallonsisäisen paineen oireet', group: 'red' },
  { id: 'r2', label: 'Kuume ja epäily aivokalvotulehduksesta', group: 'red' },
  { id: 'r3', label: 'Meningeaaliset oireet (niskajäykkyys)', group: 'red' },
  { id: 'r4', label: 'Tuore neurologinen fokaalioire, joka ei sovi auraksi', group: 'red' },
  { id: 'r5', label: 'Antikoaguloidulla aiemmasta poikkeava päänsärky', group: 'red' },
  { id: 'r6', label: 'Pään vamma ja epäily kallonsisäisestä vuodosta', group: 'red' },
  { id: 'r7', label: 'Pitkittynyt, kotihoitoon reagoimaton kova särky ja pahoinvointi', group: 'red' },
  { id: 'm1', label: 'Toispuoleinen', group: 'mig' },
  { id: 'm2', label: 'Sykkivä', group: 'mig' },
  { id: 'm3', label: 'Kohtalainen tai kova', group: 'mig' },
  { id: 'm4', label: 'Rasitus pahentaa', group: 'mig' },
  { id: 'd1', label: 'Pahoinvointi tai oksentelu', group: 'migD' },
  { id: 'd2', label: 'Valo- ja ääniarkuus', group: 'migD' },
  { id: 't1', label: 'Pantamainen, puristava koko pään alueella', group: 'tens' },
  { id: 't2', label: 'Liikunta helpottaa', group: 'tens' },
  { id: 't3', label: 'Ei liitännäisoireita, toimintakyky säilyy', group: 'tens' },
]

const GROUPS: { id: Group; title: string }[] = [
  { id: 'red', title: 'Vaaranmerkit – päivystyslähetteen aiheet' },
  { id: 'mig', title: 'Särky on…' },
  { id: 'migD', title: 'Särkyyn liittyy…' },
  { id: 'tens', title: 'Jännityspäänsäryn piirteitä' },
]

export default function HeadacheCheck() {
  const [sel, setSel] = useState<Set<string>>(new Set())
  const reduce = useReducedMotion()
  const count = (g: Group) => ITEMS.filter((i) => i.group === g && sel.has(i.id)).length

  let title: string
  let text: string
  let tone: Tone
  if (count('red') > 0) {
    title = 'Vaaranmerkki – kuljetus päivystykseen'
    text = 'Sekundaarinen päänsärky on suljettava pois ennen kuin oireita pidetään migreeninä. Tutki neurologinen tila ja tajunta ja tee ennakkoilmoitus tarvittaessa.'
    tone = 'danger'
  } else if (count('mig') >= 2 && count('migD') >= 1) {
    title = 'Piirteet sopivat migreeniin'
    text = 'Aurattomassa migreenissä kohtaus kestää 4–72 tuntia, ja diagnoosiin tarvitaan vähintään viisi tällaista kohtausta. Kysy, onko potilaalla todettu migreeni ja onko kohtaus tavanomainen.'
    tone = 'ok'
  } else if (count('tens') >= 2) {
    title = 'Piirteet sopivat jännityspäänsärkyyn'
    text = 'Jännityspäänsäryssä ei ole ennakko-oireita eikä liitännäisoireita, ja toimintakyky säilyy. Sitä voi esiintyä myös migreenin ohella.'
    tone = 'brand'
  } else {
    title = 'Valitse havaitut piirteet'
    text = 'Käy ensin läpi vaaranmerkit. Migreenin kriteereissä särystä täyttyy vähintään kaksi piirrettä ja liitännäisoireista vähintään yksi.'
    tone = 'neutral'
  }

  function toggle(id: string) {
    setSel((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {GROUPS.map((g) => (
          <div key={g.id}>
            <p className={`mb-1.5 text-[11px] font-semibold uppercase tracking-wide ${g.id === 'red' ? 'text-danger-500' : 'text-[var(--text-dim)]'}`}>{g.title}</p>
            <div className={g.id === 'red' ? 'flex flex-col gap-1.5' : 'flex flex-wrap gap-1.5'}>
              {ITEMS.filter((i) => i.group === g.id).map((i) => {
                const on = sel.has(i.id)
                const red = g.id === 'red'
                return (
                  <button
                    key={i.id}
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(i.id)}
                    className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-2 text-left text-[13px] leading-snug transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] ${
                      on ? (red ? 'border-danger-500/60 bg-danger-500/10' : 'border-brand-500/50 bg-brand-500/10') : 'border-[var(--border)]'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        on ? (red ? 'border-danger-500 bg-danger-500 text-white' : 'border-brand-500 bg-brand-500 text-white') : 'border-[var(--border)] bg-[var(--bg-raised)]'
                      }`}
                    >
                      {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className="text-[var(--text)]">{i.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={title}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <Result tone={tone} title={title}>
              {text}
            </Result>
          </motion.div>
        </AnimatePresence>
      </div>
      {sel.size > 0 && (
        <button onClick={() => setSel(new Set())} className="mt-2 inline-flex min-h-[36px] items-center gap-1 px-1 text-[12px] font-medium text-[var(--text-dim)]">
          <RotateCcw className="h-3.5 w-3.5" /> Tyhjennä
        </button>
      )}
    </div>
  )
}
