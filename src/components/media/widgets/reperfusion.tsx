import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { NumberField, Result, Segmented, type Tone } from '../ui'

/* STEMI reperfusion choice (article rintakipu-ja-aks, Käypä hoito Sepelvaltimotautikohtaus 2026):
 * PCI if achievable within 120 min of diagnosis, otherwise lysis within 10 min; lysis efficacy
 * falls clearly after 3 h from onset and gives no benefit after 12 h; ≥ 75 y: consider half-dose
 * tenecteplase. Dissection must be considered before reperfusion. */

export default function Reperfusion() {
  const [pci, setPci] = useState(90)
  const [onset, setOnset] = useState(2)
  const [old, setOld] = useState(false)
  const [dissection, setDissection] = useState(false)
  const reduce = useReducedMotion()

  let title: string
  let text: string
  let tone: Tone
  if (dissection) {
    title = 'Pysähdy – dissekaation mahdollisuus'
    text = 'Repivä, paikkaa vaihtava kipu ja pulssiero raajojen välillä: aortan dissekaatio pidetään mielessä ennen reperfuusiopäätöstä. Liuotushoito dissekaatiossa voi johtaa kuolemaan.'
    tone = 'danger'
  } else if (pci <= 120) {
    title = 'Pallolaajennus (PCI)'
    text = 'PCI on ensisijainen, kun se toteutuu 120 minuutin kuluessa STEMI-diagnoosista: varmempi ja pienempi aivoverenvuodon riski. Ennakkoilmoitus ja suora kuljetus PCI-sairaalaan.'
    tone = 'ok'
  } else if (onset > 12) {
    title = 'Liuotuksesta ei hyötyä'
    text = 'Yli 12 tuntia oireiden alusta liuotushoidosta ei ole hyötyä. Konsultoi hoitolinjasta ja kuljetuksesta.'
    tone = 'warning'
  } else {
    title = 'Liuotus 10 minuutin kuluessa diagnoosista'
    text = `PCI ei toteudu 120 minuutissa, joten liuotus aloitetaan 10 minuutin kuluessa diagnoosista – kohteessa annettu liuotus vähentää kuolleisuutta sairaalaliuotukseen verrattuna.${
      onset > 3 ? ' Huomaa: teho heikkenee selvästi 3 tunnin jälkeen oireiden alusta.' : ''
    }${old ? ' Yli 75-vuotiaalle harkitaan puolikasta tenekteplaasiannosta.' : ''} Liuotuksen jälkeen kuljetus sairaalaan, jossa on valmius välittömään varjoainekuvaukseen.`
    tone = 'warning'
  }

  return (
    <div>
      <NumberField label="Arvioitu aika PCI:hin STEMI-diagnoosista" value={pci} onChange={setPci} min={20} max={300} step={10} unit=" min" />
      <div className="mt-3">
        <NumberField label="Oireiden alusta" value={onset} onChange={setOnset} min={0} max={24} step={0.5} unit=" h" />
      </div>
      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Ikä</p>
      <Segmented
        layoutId="rep-age"
        size="sm"
        value={old ? 'o' : 'y'}
        onChange={(v) => setOld(v === 'o')}
        options={[
          { value: 'y', label: 'Alle 75 v' },
          { value: 'o', label: '75 v tai yli' },
        ]}
      />
      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Repivä, vaeltava kipu tai pulssiero?</p>
      <Segmented
        layoutId="rep-diss"
        size="sm"
        value={dissection ? 'y' : 'n'}
        onChange={(v) => setDissection(v === 'y')}
        options={[
          { value: 'n', label: 'Ei' },
          { value: 'y', label: 'Kyllä' },
        ]}
      />
      <div className="mt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={title + text.length}
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
