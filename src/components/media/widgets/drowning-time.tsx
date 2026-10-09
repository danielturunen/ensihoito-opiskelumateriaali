import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { NumberField, Result, Segmented, type Tone } from '../ui'

/* Submersion time, water temperature and age (Lund, Ensihoito-opas 2023: hukkuminen). */

type Water = 'warm' | 'cold'
type Age = 'adult' | 'child'

export default function DrowningTime() {
  const [min, setMin] = useState(15)
  const [water, setWater] = useState<Water>('cold')
  const [age, setAge] = useState<Age>('child')
  const reduce = useReducedMotion()

  let title: string
  let text: string
  let tone: Tone
  if (water === 'cold' && age === 'child' && min <= 60) {
    title = min > 30 ? 'Kylmä vesi ja lapsi: elvytä' : 'Kylmä vesi suojaa – elvytä'
    text =
      'Mitä pienempi lapsi ja mitä kylmempi vesi, sitä pidempi hypoksia-aika hyväksytään. Lapsia ja nuoria on selvinnyt jopa 45–60 minuutin hukuksissaolon jälkeen erittäin kylmästä vedestä alkurytmistä riippumatta. Harkitse kuljetusta elvyttäen sydän-keuhkokoneeseen (aikaikkuna alle tunti).'
    tone = min > 30 ? 'warning' : 'ok'
  } else if (min > 30) {
    title = 'Ennuste heikko'
    text = 'Yli 30 minuutin hukuksissaolon jälkeen selviytyminen on veden lämpötilasta riippumatta heikkoa. Kylmästä vedestä pelastetun kohdalla hypoksia-aikaa hyväksytään kuitenkin pidempään – päätös tehdään tilannekohtaisesti.'
    tone = 'danger'
  } else if (water === 'warm' && min > 10) {
    title = 'Ennuste alkaa huonontua'
    text = 'Uimalämpöisessä vedessä ennuste alkaa huonontua jo 10 minuutin jälkeen. Elvytys aloitetaan, jos toipuminen on mahdollista.'
    tone = 'warning'
  } else if (water === 'cold') {
    title = 'Kylmä vesi voi suojata – elvytä'
    text = 'Alle 10-asteisessa vedessä jäähtyminen on voinut suojata aivoja ennen hapenpuutetta. Kuljetusta elvyttäen sydän-keuhkokoneeseen harkitaan, kun aikaikkuna on alle tunti.'
    tone = 'ok'
  } else {
    title = 'Elvytä – ennuste parempi'
    text = 'Hengitystie ja viisi alkupuhallusta, sitten painelu-puhalluselvytys tavalliseen tapaan.'
    tone = 'ok'
  }

  return (
    <div>
      <NumberField label="Hukuksissa" value={min} onChange={setMin} min={0} max={60} unit=" min" />
      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Vesi</p>
      <Segmented
        layoutId="drown-water"
        size="sm"
        value={water}
        onChange={setWater}
        options={[
          { value: 'warm', label: 'Uimalämpöinen' },
          { value: 'cold', label: 'Kylmä (alle 10 °C)' },
        ]}
      />
      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Potilas</p>
      <Segmented
        layoutId="drown-age"
        size="sm"
        value={age}
        onChange={setAge}
        options={[
          { value: 'adult', label: 'Aikuinen' },
          { value: 'child', label: 'Lapsi tai nuori' },
        ]}
      />
      <div className="mt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={title + tone}
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
      <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-dim)]">Aina ensin: hengitystie ja 5 alkupuhallusta. Myös nopeasti toipunut kuljetetaan – keuhkopöhö voi kehittyä viiveellä.</p>
    </div>
  )
}
