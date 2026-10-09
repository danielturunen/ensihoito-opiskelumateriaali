import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { NumberField, Result, Stat, type Tone } from '../ui'

/* Orthostatic test interpretation (article: sydanpotilaan-tutkiminen, Oppiportti 2024):
 * normal SBP change ≤ ±10 mmHg and HR rise ≤ ~20/min; SBP drop ≥ 20 = orthostatic
 * hypotension; unusually large HR rise → hypovolaemia; no HR rise → autonomic failure. */

export default function Orthostatic() {
  const [sbpLie, setSbpLie] = useState(132)
  const [hrLie, setHrLie] = useState(72)
  const [sbpStand, setSbpStand] = useState(108)
  const [hrStand, setHrStand] = useState(76)
  const reduce = useReducedMotion()

  const dSbp = sbpStand - sbpLie
  const dHr = hrStand - hrLie
  const oh = dSbp <= -20

  let title: string
  let text: string
  let tone: Tone
  if (oh && dHr <= 0) {
    title = 'Ortostaattinen hypotensio, syke ei nouse'
    text = 'Paine laskee mutta syke ei nouse – syynä voi olla autonomisen hermoston vajaus (diabetes, Parkinsonin tauti, antikolinergiset lääkkeet).'
    tone = 'danger'
  } else if (oh && dHr > 20) {
    title = 'Ortostaattinen hypotensio ja suuri sykkeen nousu'
    text = 'Systolinen paine laskee vähintään 20 mmHg ja syke nousee tavallista enemmän – sopii hypovolemiaan (vuoto, kuivuminen).'
    tone = 'danger'
  } else if (oh) {
    title = 'Ortostaattinen hypotensio'
    text = 'Systolinen paine laskee vähintään 20 mmHg seisomaan noustessa. Kirjaa oireet (huimaus) ja etsi syy: lääkkeet, nestevaje, autonominen vajaus.'
    tone = 'warning'
  } else if (dHr > 20) {
    title = 'Paine pysyy, mutta syke nousee paljon'
    text = 'Sykkeen tavallista suurempi nousu voi viitata hypovolemiaan, vaikka verenpaine vielä pysyisi.'
    tone = 'warning'
  } else if (Math.abs(dSbp) <= 10) {
    title = 'Normaali vaste'
    text = 'Systolinen paine muuttuu enintään ±10 mmHg ja syke nousee hieman.'
    tone = 'ok'
  } else {
    title = 'Rajatapaus'
    text = 'Muutos on normaalia suurempi, mutta ei täytä ortostaattisen hypotension rajaa (lasku vähintään 20 mmHg). Toista mittaus 2 minuutin kohdalla ja kirjaa oireet.'
    tone = 'neutral'
  }

  return (
    <div>
      <p className="mb-2 text-[12px] leading-relaxed text-[var(--text-dim)]">
        1. Potilas lepää makuulla noin 10 min → mittaa. 2. Nousee itse nopeasti seisomaan ilman tukea. 3. Mittaa heti ja 2 minuutin kuluttua.
      </p>
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
        <div className="rounded-xl bg-[var(--bg)] p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Makuulla</p>
          <NumberField label="Systolinen" value={sbpLie} onChange={setSbpLie} min={70} max={200} unit=" mmHg" />
          <div className="mt-2">
            <NumberField label="Syke" value={hrLie} onChange={setHrLie} min={40} max={150} unit="/min" />
          </div>
        </div>
        <div className="rounded-xl bg-[var(--bg)] p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Seisten</p>
          <NumberField label="Systolinen" value={sbpStand} onChange={setSbpStand} min={50} max={200} unit=" mmHg" />
          <div className="mt-2">
            <NumberField label="Syke" value={hrStand} onChange={setHrStand} min={40} max={180} unit="/min" />
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Systolinen muutos" value={`${dSbp > 0 ? '+' : ''}${dSbp}`} tone={oh ? 'danger' : Math.abs(dSbp) <= 10 ? 'ok' : 'warning'} />
        <Stat label="Sykkeen muutos" value={`${dHr > 0 ? '+' : ''}${dHr}`} tone={dHr > 20 ? 'warning' : 'neutral'} />
      </div>
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
    </div>
  )
}
