import { useState } from 'react'
import { NumberField, Result, Stat } from '../ui'

/* Safe working time near radioactive contamination (Ensihoito-opas, Säteilyaltistus):
 * time (h) = acceptable dose (mSv) / dose rate (mSv/h). The acceptable dose is set by the
 * authority leading the scene (STUK VAL guide); a radiation worker's annual dose is 20 mSv. */

function fmt(h: number) {
  if (!isFinite(h)) return '–'
  if (h >= 1) {
    const hh = Math.floor(h)
    const mm = Math.round((h - hh) * 60)
    return mm ? `${hh} h ${mm} min` : `${hh} h`
  }
  return `${Math.round(h * 60)} min`
}

export default function RadTime() {
  const [dose, setDose] = useState(20)
  const [rate, setRate] = useState(10)
  const t = dose / rate

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Työskentelyaika" value={fmt(t)} tone={dose > 20 ? 'warning' : 'neutral'} />
        <Stat label="Kaava" value={<span className="text-[15px]">{dose} ÷ {rate}</span>} />
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <NumberField label="Hyväksyttävä annos" value={dose} onChange={setDose} min={1} max={100} step={1} unit="mSv" />
        <NumberField label="Annosnopeus" value={rate} onChange={setRate} min={1} max={200} step={1} unit="mSv/h" />
      </div>
      <div className="mt-3">
        <Result tone={dose > 20 ? 'warning' : 'neutral'} title={dose > 20 ? 'Yli säteilytyöntekijän vuosiannoksen' : 'Työskentelyaika = annos ÷ annosnopeus'}>
          {dose > 20
            ? 'Säteilytyöntekijän vuosiannos on 20 mSv, eikä sitä tule yksittäisessä tilanteessa pääsääntöisesti ylittää. Hengen pelastamiseksi hyväksyttävän annoksen määrittää tilannetta johtava viranomainen (yleensä pelastusviranomainen) Säteilyturvakeskuksen VAL-ohjeen perusteella.'
            : 'Hyväksyttävän annoksen määrittää tilannetta johtava viranomainen. Annosnopeuden voi mitata esimerkiksi pelastushenkilöstö tai poliisin erityiskoulutettu henkilöstö.'}
        </Result>
      </div>
    </div>
  )
}
