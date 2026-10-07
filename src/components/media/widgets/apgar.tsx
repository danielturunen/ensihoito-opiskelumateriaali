import { useState } from 'react'
import type { WidgetProps } from '../registry'
import { Caption, Result, Segmented, Stat } from '../ui'

type Key = 'A' | 'P' | 'G' | 'Ac' | 'R'

// Standard Apgar scoring (Virginia Apgar). Clinical actions below come from the article.
const criteria: { key: Key; name: string; options: [string, string, string] }[] = [
  { key: 'A', name: 'Väri', options: ['Sininen tai kalpea koko keho', 'Vartalo punakka, raajat sinertävät', 'Kokonaan punakka'] },
  { key: 'P', name: 'Syke', options: ['Ei sykettä', 'Alle 100/min', 'Yli 100/min'] },
  { key: 'G', name: 'Ärtyvyys', options: ['Ei reagoi', 'Irvistää', 'Itkee, yskii tai aivastaa'] },
  { key: 'Ac', name: 'Jäntevyys', options: ['Veltto', 'Raajoissa jonkin verran koukistusta', 'Aktiiviset liikkeet'] },
  { key: 'R', name: 'Hengitys', options: ['Ei hengitä', 'Heikko tai epäsäännöllinen', 'Hyvä, itkee ponnekkaasti'] },
]

type Minute = '1' | '5' | '10'
const full: Record<Key, number> = { A: 2, P: 2, G: 2, Ac: 2, R: 2 }

export default function Apgar(_props: WidgetProps) {
  const [minute, setMinute] = useState<Minute>('1')
  const [scores, setScores] = useState<Record<Minute, Record<Key, number>>>({ '1': { ...full }, '5': { ...full }, '10': { ...full } })
  const s = scores[minute]
  const total = Object.values(s).reduce((a, b) => a + b, 0)

  const set = (k: Key, v: number) => setScores((all) => ({ ...all, [minute]: { ...all[minute], [k]: v } }))

  return (
    <div>
      <Segmented
        layoutId="apgar-minute"
        value={minute}
        onChange={setMinute}
        options={[
          { value: '1', label: `1 min · ${Object.values(scores['1']).reduce((a, b) => a + b, 0)}` },
          { value: '5', label: `5 min · ${Object.values(scores['5']).reduce((a, b) => a + b, 0)}` },
          { value: '10', label: `10 min · ${Object.values(scores['10']).reduce((a, b) => a + b, 0)}` },
        ]}
      />

      <div className="mt-4 grid grid-cols-[96px_1fr] items-center gap-4">
        <Stat label="Apgar" value={total} tone={total >= 7 ? 'ok' : total >= 4 ? 'warning' : 'danger'} />
        <p className="text-[12px] leading-relaxed text-[var(--text-dim)]">Pisteet kirjataan 1, 5 ja tarvittaessa 10 minuutin kohdalla. Kukin kohta 0–2 pistettä.</p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {criteria.map((c) => (
          <div key={c.key}>
            <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{c.name}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {c.options.map((label, v) => (
                <button
                  key={v}
                  onClick={() => set(c.key, v)}
                  className={`flex min-h-[52px] flex-col items-center justify-center rounded-xl border px-1.5 py-1.5 text-center text-[11px] leading-tight transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${
                    s[c.key] === v ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'
                  }`}
                >
                  <span className="font-display text-[15px] font-bold text-[var(--text)]">{v}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {s.R < 2 || s.P < 2 ? (
          <Result tone="danger" title="Puutteellinen hengitys tai syke alle 100/min">
            Lämmönhukan esto, hengitystie neutraaliin asentoon ja stimulaatio kuivaamalla. Aloita ventilaatio maskilla 30–60/min ja varmista rintakehän nousu. Jos syke
            pysyy alle 60/min tehokkaasta ventiloinnista huolimatta → paineluelvytys 3:1.
          </Result>
        ) : (
          <Result tone="ok" title="Hengittää ja syke yli 100/min">
            Kuivaa huolellisesti, pidä lämpimänä ja ihokontaktissa äidin kanssa. Raajojen sinerrys voi alkuvaiheessa olla normaalia, keskivartalon sinisyys ei.
          </Result>
        )}
      </div>
      <div className="mt-3">
        <Caption>Apgar-pisteytyksen kohdat yleisesti käytetyn asteikon mukaan. Huonokuntoisen vastasyntyneen tärkein hoito on tehokas ventilaatio – ei lääkkeet.</Caption>
      </div>
    </div>
  )
}
