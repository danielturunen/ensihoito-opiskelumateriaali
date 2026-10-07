import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Eye, Snail, Volume2 } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Segmented } from '../ui'
import { hasVoiceFor, speak, speechSupported, stopSpeaking, warmUpVoices } from '../../../lib/speech'

interface Phrase {
  fi: string
  sv: string
  pron?: string
}
interface Section {
  title: string
  phrases: Phrase[]
}

export default function Phrasebook(props: WidgetProps) {
  const sections = (props.sections as Section[] | undefined) ?? []
  const [mode, setMode] = useState<'read' | 'practice'>('read')
  const [sectionIdx, setSectionIdx] = useState('0')
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [playing, setPlaying] = useState<string | null>(null)
  const [, setVoicesReady] = useState(0)
  const reduce = useReducedMotion()
  const supported = speechSupported()

  useEffect(() => warmUpVoices(() => setVoicesReady((n) => n + 1)), [])
  useEffect(() => () => stopSpeaking(), [])

  const section = sections[Number(sectionIdx)]
  if (!section) return null

  function play(key: string, text: string, slow: boolean) {
    stopSpeaking()
    setPlaying(key)
    // "[nimi]"-style placeholders become a short pause instead of being read out.
    speak(text.replace(/\[[^\]]*\]/g, ','), { lang: 'sv-SE', rate: slow ? 0.6 : 0.9, onEnd: () => setPlaying((p) => (p === key ? null : p)), onError: () => setPlaying(null) })
  }

  return (
    <div>
      <Segmented
        layoutId="phrase-mode"
        value={mode}
        onChange={(v) => {
          setMode(v)
          setRevealed(new Set())
        }}
        options={[
          { value: 'read', label: 'Kuuntele ja lue' },
          { value: 'practice', label: 'Harjoittele' },
        ]}
      />
      <div className="mt-2">
        <Segmented layoutId="phrase-section" value={sectionIdx} onChange={setSectionIdx} size="sm" options={sections.map((s, i) => ({ value: String(i), label: s.title }))} />
      </div>

      {!supported && <p className="mt-3 rounded-xl bg-[var(--bg)] px-3 py-2 text-[12px] text-[var(--text-dim)]">Tämä selain ei tue puhesynteesiä – ääntämisohjeet näkyvät tekstinä.</p>}
      {supported && !hasVoiceFor('sv-SE') && (
        <p className="mt-3 rounded-xl bg-[var(--bg)] px-3 py-2 text-[12px] text-[var(--text-dim)]">
          Laitteelta ei löytynyt ruotsinkielistä ääntä. iPhonessa: Asetukset → Käyttöapu → Puhuttu sisältö → Äänet → Svenska.
        </p>
      )}

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${sectionIdx}-${mode}`}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-3 flex flex-col gap-2"
        >
          {section.phrases.map((p, i) => {
            const key = `${sectionIdx}-${i}`
            const hidden = mode === 'practice' && !revealed.has(key)
            return (
              <div key={key} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3">
                <p className="text-[12px] font-medium text-[var(--text-dim)]">{p.fi}</p>
                {hidden ? (
                  <button
                    onClick={() => setRevealed((s) => new Set(s).add(key))}
                    className="mt-1.5 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] text-[13px] font-medium text-[var(--text-dim)]"
                  >
                    <Eye className="h-4 w-4" /> Sano ääneen ruotsiksi, sitten napauta
                  </button>
                ) : (
                  <div className="mt-1 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-[16px] font-semibold leading-snug text-[var(--text)]" lang="sv">
                        {p.sv}
                      </p>
                      {p.pron && <p className="mt-0.5 text-[12px] italic text-[var(--text-dim)]">[{p.pron}]</p>}
                    </div>
                    {supported && (
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => play(key + 's', p.sv, true)}
                          aria-label="Kuuntele hitaasti"
                          className={`flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,transform] duration-150 active:scale-90 ${
                            playing === key + 's' ? 'bg-teal-500 text-white' : 'bg-[var(--bg-raised)] text-[var(--text-dim)]'
                          }`}
                        >
                          <Snail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => play(key, p.sv, false)}
                          aria-label="Kuuntele"
                          className={`flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,transform] duration-150 active:scale-90 ${
                            playing === key ? 'bg-brand-500 text-white' : 'bg-brand-500/10 text-brand-600'
                          }`}
                        >
                          <Volume2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
