import { useState } from 'react'
import { Caption, NumberField, Segmented } from '../ui'

/* Paediatric arrest calculator. Values: Käypä hoito Elvytys 2021, Lastentautien päivystyskirja
 * (Lapsen elvytys 2024), Ensihoito-opas (Intubaatio ensihoitolääkäriyksikössä) and Metropolia
 * Lasten ensihoito 2025 (tube formula). Optional weight-from-age estimate from the European Trauma Course. */

const fmt = (n: number, d = 2) => String(Math.round(n * 10 ** d) / 10 ** d).replace('.', ',')

function ventRate(age: number) {
  if (age < 1) return 25
  if (age < 8) return 20
  if (age < 12) return 15
  return 10
}

// Ensihoito-opas, taulukko 1: kalvosimellinen putki iän mukaan. Between listed ages both
// neighbouring rows are shown instead of interpolating.
const TUBE: { from: number; to: number; label: string; size: string }[] = [
  { from: 0, to: 1, label: '0–1 v', size: '3,0–4,0' },
  { from: 1, to: 3, label: '1–3 v', size: '4,0–4,5' },
  { from: 4, to: 4, label: '4 v', size: '4,5–5,0' },
  { from: 6, to: 6, label: '6 v', size: '5,0–5,5' },
  { from: 8, to: 8, label: '8 v', size: '5,5–6,0' },
  { from: 10, to: 10, label: '10 v', size: '6,0–6,5' },
  { from: 12, to: 12, label: '12 v', size: '6,5–7,0' },
  { from: 14, to: 14, label: '14 v', size: '7,0–7,5' },
]

function tubeRows(age: number) {
  const hit = TUBE.filter((t) => age >= t.from && age <= t.to)
  if (hit.length) return hit.slice(-1)
  const lower = [...TUBE].reverse().find((t) => t.to < age)
  const upper = TUBE.find((t) => t.from > age)
  return [lower, upper].filter((t): t is (typeof TUBE)[number] => Boolean(t))
}

// Lastentautien päivystyskirja, taulukko 1: kurkunpäämaskin koko.
function lmaSize(kg: number) {
  if (kg < 5) return '1'
  if (kg < 10) return '1,5'
  if (kg < 20) return '2'
  if (kg < 30) return '2,5'
  if (kg < 60) return '3'
  if (kg <= 80) return '4'
  return '5'
}

// European Trauma Course: 1–5 v (2 × ikä) + 8, 6–12 v (3 × ikä) + 7.
function estimateKg(age: number) {
  return age <= 5 ? 2 * age + 8 : 3 * age + 7
}

function Row({ label, sub, value, unit, flag }: { label: string; sub?: string; value: string; unit?: string; flag?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[var(--text)]">{label}</p>
        {sub && <p className="text-[11px] leading-snug text-[var(--text-dim)]">{sub}</p>}
      </div>
      <div className="shrink-0 text-right">
        <p className="font-display text-[16px] font-bold tabular-nums text-[var(--text)]">
          {value}
          {unit && <span className="ml-0.5 text-[11px] font-medium text-[var(--text-dim)]">{unit}</span>}
        </p>
        {flag && <p className="text-[10px] font-semibold text-brand-600">{flag}</p>}
      </div>
    </div>
  )
}

export default function PaedArrest() {
  const [kg, setKg] = useState(12)
  const [age, setAge] = useState(2)
  const [view, setView] = useState<'drugs' | 'airway'>('drugs')

  const joules = 4 * kg
  const joulesCapped = Math.min(joules, 150)
  const joulesHigh = Math.min(8 * kg, 360)
  const adr = Math.min(0.01 * kg, 1)
  const amio = 5 * kg
  const lido = Math.min(kg, 100)
  const tubes = tubeRows(age)
  const formula = age >= 2 ? { uncuffed: age / 4 + 4, cuffed: age / 4 + 3.5 } : null

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Paino" unit="kg" value={kg} onChange={setKg} min={3} max={80} />
        <NumberField label="Ikä" unit="v" value={age} onChange={setAge} min={0} max={15} />
      </div>

      {age >= 1 && age <= 12 && (
        <button
          onClick={() => setKg(estimateKg(age))}
          className="mt-2 min-h-[40px] w-full rounded-xl border border-[var(--border)] px-3 text-[12px] font-semibold text-[var(--text)] active:scale-[0.98]"
        >
          Arvioi paino iästä (ETC): {estimateKg(age)} kg
        </button>
      )}

      <div className="mt-3">
        <Segmented
          layoutId="paed-arrest"
          value={view}
          onChange={setView}
          options={[
            { value: 'drugs', label: 'Isku ja lääkkeet' },
            { value: 'airway', label: 'Hengitystie' },
          ]}
        />
      </div>

      {view === 'drugs' ? (
        <div className="mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
          <Row label="Defibrillaatio" sub="4 J/kg, aikuisen 150 J:ta ei ylitetä" value={fmt(joulesCapped, 0)} unit="J" flag={joules > 150 ? 'enimmäisenergia' : undefined} />
          <Row label="Refraktaarinen tai toistuva VF/VT" sub="harkiten ad 8 J/kg, enintään 360 J" value={fmt(joulesHigh, 0)} unit="J" flag={8 * kg > 360 ? 'enimmäisenergia' : undefined} />
          <Row
            label="Adrenaliini i.v./i.o."
            sub={`0,01 mg/kg (enint. 1 mg) = ${fmt(adr * 10)} ml liuosta 0,1 mg/ml`}
            value={fmt(adr, 3)}
            unit="mg"
            flag={0.01 * kg > 1 ? 'enimmäisannos' : undefined}
          />
          <Row
            label="Amiodaroni 3. iskun jälkeen"
            sub={`5 mg/kg (enint. 300 mg) = ${fmt(Math.min(amio, 300) / 50)} ml liuosta 50 mg/ml`}
            value={fmt(Math.min(amio, 300), 0)}
            unit="mg"
            flag={amio > 300 ? 'enimmäisannos' : undefined}
          />
          <Row
            label="Amiodaroni 5. iskun jälkeen"
            sub={`5 mg/kg (enint. 150 mg) = ${fmt(Math.min(amio, 150) / 50)} ml liuosta 50 mg/ml`}
            value={fmt(Math.min(amio, 150), 0)}
            unit="mg"
            flag={amio > 150 ? 'enimmäisannos' : undefined}
          />
          <Row label="Lidokaiini (jos amiodaronia ei ole)" sub="1 mg/kg, enintään 100 mg" value={fmt(lido, 0)} unit="mg" flag={kg > 100 ? 'enimmäisannos' : undefined} />
        </div>
      ) : (
        <div className="mt-3 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
          <Row label="Ventilaatio intuboituna" sub="Ei tahdisteta painelun kanssa" value={String(ventRate(age))} unit="/min" />
          <Row label="Kurkunpäämaski" sub="koko painon mukaan" value={lmaSize(kg)} />
          <Row
            label="Kalvosimellinen putki"
            sub={`Ensihoito-oppaan taulukko: ${tubes.map((t) => `${t.label} ${t.size}`).join(' · ')}`}
            value={tubes.length === 1 ? tubes[0].size : `${tubes[0].size.split('–')[0]}–${tubes[tubes.length - 1].size.split('–')[1]}`}
            unit="mm"
            flag={tubes.length > 1 ? 'taulukon rivien välissä' : undefined}
          />
          {formula ? (
            <Row label="Kaava yli 2-vuotiaalle" sub="kalvosimeton ikä/4 + 4 · kalvosimellinen ikä/4 + 3,5" value={`${fmt(formula.uncuffed, 1)} / ${fmt(formula.cuffed, 1)}`} unit="mm" />
          ) : (
            <Row label="Kaava" sub="ikä/4 + 4 ja ikä/4 + 3,5 koskevat yli 2-vuotiaita" value="–" />
          )}
          <Row label="Defibrillaatioelektrodit" sub={kg < 25 ? 'alle 25 kg: etu-taka-asento' : 'anterolateraalisesti tai etu-taka-asentoon'} value={kg < 25 ? 'a–p' : 'a–l'} />
        </div>
      )}

      <div className="mt-3">
        <Caption>Oppimisen apuväline – annokset Käypä hoidon, Lastentautien päivystyskirjan ja Ensihoito-oppaan mukaan. Tarkista aina oman alueen ohje ja tee kaksoistarkistus.</Caption>
      </div>
    </div>
  )
}
