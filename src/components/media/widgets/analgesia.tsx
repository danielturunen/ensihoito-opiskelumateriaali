import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { NumberField, Result, Segmented, type Tone } from '../ui'

/* Pain treatment choice on scene, following Ensihoito-opas (Kurola 2023, Kipu – perusteet):
 * NRS < 4 mild, > 4 severe; opioids are the basis for severe pain; the patient's
 * circulation and level of consciousness steer which one. */

type Circ = 'stable' | 'shock'
type Gcs = 'normal' | 'lowered'

function band(nrs: number): { label: string; tone: Tone } {
  if (nrs === 0) return { label: 'Ei kipua', tone: 'ok' }
  if (nrs < 4) return { label: 'Lievä kipu', tone: 'ok' }
  if (nrs === 4) return { label: 'Rajalla', tone: 'warning' }
  return { label: 'Kova kipu', tone: 'danger' }
}

export default function Analgesia() {
  const [nrs, setNrs] = useState(7)
  const [circ, setCirc] = useState<Circ>('stable')
  const [gcs, setGcs] = useState<Gcs>('normal')
  const reduce = useReducedMotion()
  const b = band(nrs)

  let title: string
  let text: string
  let tone: Tone
  if (nrs === 0) {
    title = 'Ei lääkehoidon tarvetta'
    text = 'Seuraa kipua koko tehtävän ajan – se voi muuttua.'
    tone = 'ok'
  } else if (nrs < 4) {
    title = 'Lievä kipu: harkitse parasetamolia'
    text = 'Erityisesti, jos potilaalla on myös kuumetta. Raajavammassa hyvä tukeminen vähentää kipua.'
    tone = 'ok'
  } else if (circ === 'shock') {
    title = 'Vaikea verenkiertovajaus: harkitse esketamiinia'
    text = 'Esketamiinin poikkeava vaikutus pitää tuntea tarkoin. Hoida samalla verenkiertovajauksen syytä.'
    tone = 'warning'
  } else if (gcs === 'lowered') {
    title = 'Lyhytvaikutteinen opioidi'
    text = 'Lievästi tajunnaltaan alentuneelle, jotta tajunnan tason arviointi onnistuu jatkohoidossa. Voidaan antaa myös intranasaalisesti.'
    tone = 'warning'
  } else {
    title = 'Pitkävaikutteinen opioidi'
    text = 'Morfiini tai oksikodoni sopii peruselintoiminnoiltaan vakaalle potilaalle. Kova kipu hoidetaan tehokkaasti.'
    tone = 'brand'
  }
  const level = nrs === 0 ? 'none' : nrs < 4 ? 'mild' : 'severe'
  const key = `${level}-${circ}-${gcs}`

  return (
    <div>
      <NumberField label="Kipu NRS (0–10)" value={nrs} onChange={setNrs} min={0} max={10} />
      <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-dim)]">
        <span>0 = ei kipua</span>
        <span className={`font-semibold ${b.tone === 'danger' ? 'text-danger-500' : b.tone === 'warning' ? 'text-brand-600' : 'text-teal-600'}`}>{b.label}</span>
        <span>10 = pahin</span>
      </div>

      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Verenkierto</p>
      <Segmented
        layoutId="anlg-circ"
        size="sm"
        value={circ}
        onChange={setCirc}
        options={[
          { value: 'stable', label: 'Vakaa' },
          { value: 'shock', label: 'Vaikea vajaus' },
        ]}
      />
      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Tajunta</p>
      <Segmented
        layoutId="anlg-gcs"
        size="sm"
        value={gcs}
        onChange={setGcs}
        options={[
          { value: 'normal', label: 'Normaali' },
          { value: 'lowered', label: 'Lievästi alentunut' },
        ]}
      />

      <div className="mt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={key}
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
        {nrs === 4 && (
          <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-dim)]">
            Ensihoito-oppaan mukaan alle 4 on lievää ja yli 4 kovaa kipua – lukema 4 on rajalla, joten arvioi kokonaistilanne.
          </p>
        )}
      </div>

      <ul className="mt-3 flex flex-col gap-1 rounded-xl bg-[var(--bg)] px-3.5 py-2.5 text-[12px] leading-relaxed text-[var(--text)]">
        <li>• Opioidi kentällä → kuljetus aina ambulanssilla monitoroituna.</li>
        <li>• Huomioi toleranssi: syöpäpotilas, pitkäaikainen kipu, opioidien väärinkäyttö tai korvaushoito.</li>
        <li>• Opioidin pahoinvointiin esim. ondansetroni.</li>
        <li>• Seuraa vastetta koko tehtävän ajan.</li>
      </ul>
    </div>
  )
}
