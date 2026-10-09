import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { NumberField, Result, Segmented, type Tone } from '../ui'

/* Stroke time windows and destination (Martikainen, Ensihoito-opas 2023): thrombolysis
 * window 9 h (goal: start within 90 min of onset), thrombectomy for independent (mRS ≤ 3)
 * patients with suspected large-vessel occlusion or a closed lysis window, wake-up
 * strokes up to 24 h. */

export default function StrokeWindow() {
  const [h, setH] = useState(2)
  const [independent, setIndependent] = useState(true)
  const [lvo, setLvo] = useState(false)
  const reduce = useReducedMotion()

  let title: string
  let text: string
  let tone: Tone
  if (!independent) {
    title = 'Lähimpään päivystykseen'
    text = 'Aiemmin ei-omatoiminen potilas kuljetetaan lähimpään päivystykseen lääkärikonsultaation perusteella.'
    tone = 'neutral'
  } else if (lvo && h <= 24) {
    title = 'Suuren suonen tukoksen epäily – konsultoi'
    text = 'Toispuolihalvaus ja katsedeviaatio: ensisijainen hoito on trombektomia ja hoitopaikka yliopistosairaala. Konsultoi aina lääkäriä.'
    tone = 'danger'
  } else if (h <= 9) {
    title = 'Liuotus mahdollinen – A-kiireellinen kuljetus'
    text = 'Suoraan lähimpään liuotusta antavaan päivystykseen ennakkoilmoituksin. Tavoite: liuotus 90 minuutin kuluessa oireiden alusta – kohteessa alle 20 minuuttia.'
    tone = 'warning'
  } else if (h <= 24) {
    title = 'Liuotuksen aikaikkuna (9 h) on sulkeutunut'
    text = 'Trombektomia voi vielä tulla kyseeseen omatoimisella potilaalla – konsultoi. Halvausoireisiin herännyt omatoiminen on hoitoon soveltuva enintään 24 tunnin kuluessa oireiden epäillystä alusta.'
    tone = 'warning'
  } else {
    title = 'Yli 24 tuntia'
    text = 'Korjaavan hoidon aikaikkunat ovat sulkeutuneet – konsultoi hoitopaikasta.'
    tone = 'neutral'
  }

  const pct = Math.min(100, (h / 24) * 100)

  return (
    <div>
      <NumberField label="Viimeksi nähty oireettomana" value={h} onChange={setH} min={0} max={24} step={0.5} unit=" h sitten" />
      <div className="relative mt-2 h-3 overflow-hidden rounded-full bg-[var(--bg)]" aria-hidden>
        <div className="absolute inset-y-0 left-0 bg-teal-500/35" style={{ width: `${(9 / 24) * 100}%` }} />
        <div className="absolute inset-y-0 bg-brand-500/30" style={{ left: `${(9 / 24) * 100}%`, right: 0 }} />
        <motion.div
          className="absolute inset-y-0 w-1 rounded-full bg-[var(--text)]"
          initial={false}
          animate={{ left: `calc(${pct}% - 2px)` }}
          transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.3, bounce: 0 }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-[var(--text-dim)]">
        <span>0 h</span>
        <span>liuotus ≤ 9 h</span>
        <span>24 h</span>
      </div>

      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Aiempi toimintakyky</p>
      <Segmented
        layoutId="stroke-indep"
        size="sm"
        value={independent ? 'y' : 'n'}
        onChange={(v) => setIndependent(v === 'y')}
        options={[
          { value: 'y', label: 'Omatoiminen (mRS ≤ 3)' },
          { value: 'n', label: 'Ei omatoiminen' },
        ]}
      />
      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Toispuolihalvaus + katsedeviaatio</p>
      <Segmented
        layoutId="stroke-lvo"
        size="sm"
        value={lvo ? 'y' : 'n'}
        onChange={(v) => setLvo(v === 'y')}
        options={[
          { value: 'n', label: 'Ei' },
          { value: 'y', label: 'Kyllä' },
        ]}
      />

      <div className="mt-3">
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
      <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-dim)]">Aina: mittaa verensokeri – hypoglykemia voi aiheuttaa halvauksen kaltaisia oireita. Kuljetusaika yli tunti → harkitse helikopteria.</p>
    </div>
  )
}
