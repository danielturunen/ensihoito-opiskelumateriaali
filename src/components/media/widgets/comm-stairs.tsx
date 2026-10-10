import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { svg } from '../ui'

/* The "stairway of communication" (European Trauma Course manual, ch. 1, fig. 1.2):
 * a message can be lost at every step unless the loop is closed. */

const STEPS = [
  { word: 'Tarkoitettu', fail: 'Tarkoitettu ei ole vielä sanottu.', fix: 'Keskity faktoihin, jotka haluat välittää – mieti, mitä oikeasti pyydät.' },
  { word: 'Sanottu', fail: 'Sanottu ei ole vielä kuultu.', fix: 'Kohdista viesti tietylle henkilölle: nimi ja katsekontakti. Vältä asiaan kuulumatonta puhetta – se nostaa vain melutasoa.' },
  { word: 'Kuultu', fail: 'Kuultu ei ole vielä ymmärretty.', fix: 'Anna lyhyet, täsmälliset tiedot ja toista tarvittaessa. Vastaanottaja toistaa ohjeen ääneen.' },
  { word: 'Ymmärretty', fail: 'Ymmärretty ei ole vielä tehty!', fix: 'Vastaanottaja raportoi takaisin, kun pyydetty toimenpide on tehty – silmukka sulkeutuu.' },
  { word: 'Tehty', fail: 'Silmukka on suljettu.', fix: 'Koko tiimi vastaa siitä, miten viestit annetaan, ymmärretään ja toteutetaan.' },
]

const W = 56
const H = 30

export default function CommStairs() {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const s = STEPS[i]
  const done = i === STEPS.length - 1

  return (
    <div>
      <svg viewBox="0 0 320 190" className="h-auto w-full" role="img" aria-label={`Viestinnän portaat, vaihe: ${s.word}`}>
        <g aria-hidden>
          {STEPS.map((st, k) => {
            const x = 14 + k * W
            const y = 160 - k * H
            const active = k <= i
            return (
              <g key={st.word} onClick={() => setI(k)} style={{ cursor: 'pointer' }}>
                <rect x={x} y={y} width={W} height={190 - y} fill={active ? (k === STEPS.length - 1 && done ? svg.tealSoft : svg.brandSoft) : svg.raised} stroke={k === i ? (done ? svg.teal : svg.brand) : svg.line} strokeWidth={k === i ? 2 : 1} />
                <text x={x + W / 2} y={y + 18} fontSize={10} fontWeight={600} fill={active ? svg.ink : svg.dim} textAnchor="middle">
                  {st.word}
                </text>
              </g>
            )
          })}
          {/* the message climbing the stairs */}
          <motion.circle
            r={8}
            initial={false}
            animate={{ cx: 14 + i * W + W / 2, cy: 160 - i * H - 14, fill: done ? svg.teal : svg.brand }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.55, bounce: 0.35 }}
          />
        </g>
      </svg>

      <div className="mt-1 flex gap-2">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="min-h-[44px] flex-1 rounded-xl border border-[var(--border)] px-3 text-[13px] font-medium text-[var(--text)] disabled:opacity-40"
        >
          Edellinen
        </button>
        <button
          onClick={() => setI((v) => (v === STEPS.length - 1 ? 0 : v + 1))}
          className="min-h-[44px] flex-1 rounded-xl bg-brand-500 px-3 text-[13px] font-semibold text-white active:scale-[0.98]"
        >
          {done ? 'Alusta' : 'Seuraava porras'}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={i}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className={`mt-3 rounded-xl border px-3.5 py-2.5 ${done ? 'border-teal-500/30 bg-teal-500/10' : 'border-brand-500/30 bg-brand-500/8'}`}
          aria-live="polite"
        >
          <p className={`font-display text-[15px] font-semibold ${done ? 'text-teal-600' : 'text-brand-600'}`}>{s.fail}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{s.fix}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
