import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, type Tone } from '../ui'

/* Immediate care after ROSC by blood pressure and heart rate
 * (Akuuttihoito-opas 2025, Hoppu ja Silfvast: Välitön hoito sydämen käynnistyttyä). */

type Bp = 'low' | 'ok' | 'high'
type Hr = 'slow' | 'normal' | 'fast'

interface Plan {
  title: string
  tone: Tone
  steps: string[]
}

function plan(bp: Bp, hr: Hr): Plan {
  if (bp === 'high') {
    return {
      title: 'Hypertensiivinen potilas',
      tone: 'warning',
      steps: [
        'Varmista riittävä sedaatio – heräämisen merkkejä ovat kyynelehtiminen ja intubaatioputken kakominen.',
        'Ensisijaisesti nopea- ja lyhytvaikutteiset: fentanyyli 25–50 µg ja midatsolaami 2–5 mg erissä i.v.',
        'Sydänpotilaan verenpaineen ensisijainen lääke on nitraatti (nitroglyseriini-infuusio).',
        'Syke pyritään pitämään alle 100/min; beetasalpaus (esim. metoprololi 2 mg erissä i.v.) vasta, kun verenkierto on vakiintunut.',
      ],
    }
  }
  if (bp === 'low' && hr === 'slow') {
    return {
      title: 'Hypotensio ja bradykardia: hoida ensin bradykardia',
      tone: 'danger',
      steps: [
        'Atropiini 0,5 mg i.v., tarvittaessa toistaen – enintään 3 mg.',
        'Ellei vakaudu tai syke on alle 35/min: adrenaliini 0,05 mg erissä i.v.',
        'Ellei adrenaliini auta: ulkoinen tahdistus.',
        '12-kytkentäinen EKG – taustalla voi olla akuutti infarkti.',
        'NaCl 0,9 % 300–500 ml, ellei potilaalla ole sydämen vajaatoimintaa; noradrenaliini-infuusio.',
        'Konsultoi ensihoito- tai tehohoitolääkäriä.',
      ],
    }
  }
  if (bp === 'low') {
    return {
      title: hr === 'fast' ? 'Hypotensio ja takykardia' : 'Hypotensio, normaali syke',
      tone: 'danger',
      steps: [
        ...(hr === 'fast' ? ['Muu kuin sinustakykardia ja huono hemodynamiikka → synkronoitu kardioversio (bifaasinen 25–75 J).'] : []),
        'NaCl 0,9 % 300–500 ml; jatka nesteytystä, jos syke hidastuu ja paine nousee.',
        'Noradrenaliini-infuusio, tavoite MAP yli 65 mmHg.',
        'Konsultoi ensihoito- tai tehohoitolääkäriä.',
      ],
    }
  }
  return {
    title: 'Verenpaine tavoitteessa',
    tone: 'ok',
    steps: [
      'Jatka tiivistä seurantaa – uuden sydänpysähdyksen riski on suurin ensimmäisinä minuutteina.',
      'Tunnustele syke ja mittaa verenpaine 3–5 minuutin välein; monitorin käyrään ei voi luottaa.',
      ...(hr === 'fast'
        ? ['Elvytyksessä annettu adrenaliini aiheuttaa takykardiaa ja rytmihäiriöitä noin 5 minuutin ajan – älä anna beetasalpaajaa heti.']
        : []),
      ...(hr === 'slow' ? ['Seuraa bradykardiaa: jos verenpaine laskee, hoida bradykardia ensin (atropiini).'] : []),
      'Anna tilanteen rauhoittua ennen potilaan liikuttelua.',
    ],
  }
}

export default function RoscCare() {
  const [bp, setBp] = useState<Bp>('low')
  const [hr, setHr] = useState<Hr>('slow')
  const reduce = useReducedMotion()
  const p = plan(bp, hr)

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Verenpaine</p>
      <Segmented
        layoutId="rosc-bp"
        size="sm"
        value={bp}
        onChange={setBp}
        options={[
          { value: 'low', label: 'Matala' },
          { value: 'ok', label: 'MAP > 65' },
          { value: 'high', label: 'Korkea' },
        ]}
      />
      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Syke</p>
      <Segmented
        layoutId="rosc-hr"
        size="sm"
        value={hr}
        onChange={setHr}
        options={[
          { value: 'slow', label: 'Hidas' },
          { value: 'normal', label: 'Normaali' },
          { value: 'fast', label: 'Nopea' },
        ]}
      />

      <div className="mt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${bp}-${hr}`}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <Result tone={p.tone} title={p.title}>
              <ol className="mt-1 flex flex-col gap-1.5">
                {p.steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--bg-raised)] font-display text-[11px] font-bold text-[var(--text)]">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </Result>
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-dim)]">
        Kaikille: SpO₂ yli 94 %, etCO₂ 4,5–6 kPa, MAP yli 65 mmHg ja kuumeen välttäminen (alle 37,8 °C).
      </p>
    </div>
  )
}
