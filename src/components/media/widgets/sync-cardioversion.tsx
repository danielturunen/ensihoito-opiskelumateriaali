import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { Result, Segmented, svg, type Tone } from '../ui'

/* Synchronised cardioversion (Säämänen 2008): the defibrillator marks the tallest deflection
 * (R wave) so the shock falls on depolarisation, never on the T wave. */

type Pos = 'p' | 'r' | 't'
const BEATS = [18, 96, 174, 252]

const OUT: Record<Pos, { title: string; text: string; tone: Tone; dx: number; y: number }> = {
  p: {
    title: 'Ei näin – P-aaltoa laite ei juuri tunnista',
    text: 'P-aallon poikkeama perusviivasta on niin pieni, ettei defibrillaattori pysty sitä luotettavasti tunnistamaan. Laite tunnistaa EKG:stä aina korkeimman heilahduksen.',
    tone: 'warning',
    dx: 6,
    y: 50,
  },
  r: {
    title: 'Oikein – merkki jokaisen R-aallon päällä',
    text: 'Isku ajoittuu kammioiden depolarisaatioon (QRS), jolloin kammiovärinän riski on pienin. Laite tunnistaa R-aallon parhaiten korkeimmasta heilahduksesta (esim. II-kytkentä). Onnistunut synkronointi näkyy valopilkkuna tai nuolena jokaisen R-aallon yläpuolella.',
    tone: 'ok',
    dx: 22,
    y: 10,
  },
  t: {
    title: 'Vaarallinen – isku T-aaltoon',
    text: 'T-aalto on repolarisaatiovaihe. Jos isku purkaa solujen kalvojännitteen niiden uudelleenlatautuessa, se voi käynnistää kammiovärinän ja sydänpysähdyksen.',
    tone: 'danger',
    dx: 46,
    y: 44,
  },
}

const RHYTHMS: { label: string; sync: boolean; note: string }[] = [
  { label: 'Eteisvärinä, verenkierto heikentynyt', sync: true, note: 'Synkronoitu rytminsiirto.' },
  { label: 'Eteislepatus, verenkierto heikentynyt', sync: true, note: 'Synkronoitu rytminsiirto.' },
  { label: 'Kammiotakykardia, syke tuntuu', sync: true, note: 'Verenkiertoa heikentävä, mutta ei romahtanut → synkronoitu.' },
  { label: 'Kammiovärinä', sync: false, note: 'Sydänpysähdys – defibrillointi ilman synkronointia. Synkronointi vain hidastaisi iskua.' },
  { label: 'Pulssiton kammiotakykardia', sync: false, note: 'Sydänpysähdys – defibrillointi ilman synkronointia.' },
]

function beat(x: number) {
  return `M${x} 70 L${x + 2} 70 C${x + 4} 62 ${x + 9} 62 ${x + 11} 70 L${x + 18} 70 L${x + 20} 76 L${x + 22} 18 L${x + 25} 84 L${x + 28} 70 L${x + 36} 70 C${x + 40} 56 ${x + 52} 56 ${x + 56} 70 L${x + 78} 70`
}

export default function SyncCardioversion() {
  const [pos, setPos] = useState<Pos | null>(null)
  const [shown, setShown] = useState<Set<number>>(new Set())
  const reduce = useReducedMotion()
  const o = pos ? OUT[pos] : null

  return (
    <div>
      <svg viewBox="0 0 330 100" className="h-auto w-full" role="img" aria-label={pos ? `Synkronointimerkki ${pos.toUpperCase()}-kohdassa` : 'Kaavamainen nopea rytmi'}>
        <g aria-hidden>
          <path d={BEATS.map(beat).join(' ')} fill="none" stroke={svg.teal} strokeWidth={2.2} strokeLinejoin="round" />
          {pos &&
            BEATS.map((x, i) => (
              <motion.path
                key={`${pos}-${i}`}
                d={`M${x + OUT[pos].dx - 5} ${OUT[pos].y - 8} L${x + OUT[pos].dx + 5} ${OUT[pos].y - 8} L${x + OUT[pos].dx} ${OUT[pos].y} Z`}
                fill={pos === 'r' ? svg.brand : pos === 't' ? svg.danger : svg.dim}
                initial={reduce ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: reduce ? 0 : i * 0.08 }}
              />
            ))}
          <text x={BEATS[0] + 6} y={95} fontSize={9} fill={svg.dim} textAnchor="middle">
            P
          </text>
          <text x={BEATS[0] + 22} y={95} fontSize={9} fill={svg.dim} textAnchor="middle">
            QRS
          </text>
          <text x={BEATS[0] + 46} y={95} fontSize={9} fill={svg.dim} textAnchor="middle">
            T
          </text>
        </g>
      </svg>

      <p className="mb-1.5 mt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Mihin synkronointimerkin pitää ilmestyä?</p>
      <Segmented
        layoutId="sync-pos"
        size="sm"
        value={pos ?? ''}
        onChange={(v) => setPos(v as Pos)}
        options={[
          { value: 'p', label: 'P-aalto' },
          { value: 'r', label: 'R-aalto' },
          { value: 't', label: 'T-aalto' },
        ]}
      />
      <div className="mt-2 min-h-[24px]">
        <AnimatePresence mode="wait" initial={false}>
          {o && (
            <motion.div key={pos} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <Result tone={o.tone} title={o.title}>
                {o.text}
              </Result>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Käytetäänkö synkronointia? Napauta ja tarkista</p>
      <div className="flex flex-col gap-1.5">
        {RHYTHMS.map((r, i) => {
          const open = shown.has(i)
          return (
            <button
              key={r.label}
              onClick={() => setShown((s) => new Set(s).add(i))}
              className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-[13px] transition-[background-color,border-color] duration-150 ${
                open ? (r.sync ? 'border-teal-500/40 bg-teal-500/10' : 'border-danger-500/35 bg-danger-500/10') : 'border-[var(--border)]'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[var(--text)]">{r.label}</span>
                {open &&
                  (r.sync ? (
                    <span className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-teal-600">
                      <Check className="h-4 w-4" strokeWidth={3} /> Synkronoitu
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-danger-500">
                      <X className="h-4 w-4" strokeWidth={3} /> Ei synkronointia
                    </span>
                  ))}
              </span>
              {open && <span className="mt-1 block text-[12px] text-[var(--text-dim)]">{r.note}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
