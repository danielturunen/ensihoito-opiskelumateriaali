import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { OptionList, Result, Segmented } from '../ui'

type Part = 'E' | 'V' | 'M'

// Descriptors as in the "Pään vamma" article's GCS table.
const scales: Record<Part, { name: string; options: { value: number; label: string }[] }> = {
  E: {
    name: 'Silmien avaus',
    options: [
      { value: 4, label: 'Spontaanisti' },
      { value: 3, label: 'Ääneen (puheeseen)' },
      { value: 2, label: 'Kipuun' },
      { value: 1, label: 'Ei vastetta' },
    ],
  },
  V: {
    name: 'Puhevaste',
    options: [
      { value: 5, label: 'Orientoitunut' },
      { value: 4, label: 'Sekava' },
      { value: 3, label: 'Sanoja' },
      { value: 2, label: 'Ääniä' },
      { value: 1, label: 'Ei vastetta' },
    ],
  },
  M: {
    name: 'Liikevaste',
    options: [
      { value: 6, label: 'Tottelee käskyjä' },
      { value: 5, label: 'Paikantaa kivun' },
      { value: 4, label: 'Väistää kipua' },
      { value: 3, label: 'Fleksio (koukistus)' },
      { value: 2, label: 'Ekstensio (ojennus)' },
      { value: 1, label: 'Ei vastetta' },
    ],
  },
}

export default function Gcs(_props: WidgetProps) {
  const [part, setPart] = useState<Part>('E')
  const [score, setScore] = useState<Record<Part, number>>({ E: 4, V: 5, M: 6 })
  const [baseline, setBaseline] = useState<number | null>(null)
  const reduce = useReducedMotion()

  const total = score.E + score.V + score.M
  const drop = baseline !== null ? baseline - total : 0

  function choose(v: number) {
    setScore((s) => ({ ...s, [part]: v }))
    if (part === 'E') setPart('V')
    else if (part === 'V') setPart('M')
  }

  const tone = total <= 8 ? 'danger' : total < 15 ? 'warning' : 'ok'

  return (
    <div>
      <div className="flex items-center gap-4">
        <motion.div
          key={total}
          initial={reduce ? false : { scale: 0.85, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.3 }}
          className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl ${
            tone === 'danger' ? 'bg-danger-500 text-white' : tone === 'warning' ? 'bg-brand-500 text-white' : 'bg-teal-500 text-white'
          }`}
        >
          <span className="font-display text-[32px] font-bold leading-none tabular-nums">{total}</span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-90">/ 15</span>
        </motion.div>
        <div className="min-w-0">
          <p className="font-display text-[18px] font-semibold tabular-nums text-[var(--text)]">
            E{score.E} V{score.V} M{score.M}
          </p>
          <p className="text-[12px] leading-relaxed text-[var(--text-dim)]">Kirjaa aina myös osa-arvot – ne kertovat enemmän kuin pelkkä summa.</p>
        </div>
      </div>

      <div className="mt-4">
        <Segmented
          layoutId="gcs-part"
          value={part}
          onChange={setPart}
          options={[
            { value: 'E', label: `Silmät ${score.E}` },
            { value: 'V', label: `Puhe ${score.V}` },
            { value: 'M', label: `Liike ${score.M}` },
          ]}
        />
      </div>
      <p className="mt-3 mb-2 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{scales[part].name}</p>
      <OptionList
        value={score[part]}
        onChange={choose}
        options={scales[part].options.map((o) => ({ value: o.value, label: o.label, hint: String(o.value) }))}
      />

      <div className="mt-4 flex flex-col gap-2">
        {total <= 8 ? (
          <Result tone="danger" title="GCS 8 tai alle – hengitystie uhattuna">
            Potilas ei kykene luotettavasti pitämään hengitystietään auki (suojaheijasteet pettävät). Hengitystien hallinta nousee ensisijaiseksi; vammapotilaalla
            intubaatioraja on GCS alle 9.
          </Result>
        ) : total < 15 ? (
          <Result tone="warning" title="Alentunut tajunta">
            Selvitä syy ja seuraa tiiviisti. Mittaa aina verensokeri – hypoglykemia on nopeasti korjattava syy.
          </Result>
        ) : (
          <Result tone="ok" title="GCS 15 – täysin orientoitunut" />
        )}

        <div className="flex items-center justify-between gap-3 rounded-xl bg-[var(--bg)] px-3.5 py-2.5">
          <p className="text-[12px] leading-relaxed text-[var(--text-dim)]">
            {baseline === null ? 'Tallenna vertailuarvo ja seuraa muutosta.' : `Vertailuarvo ${baseline} → nyt ${total}${drop > 0 ? ` (−${drop})` : ''}`}
          </p>
          <button
            onClick={() => setBaseline(baseline === null ? total : null)}
            className="min-h-[36px] shrink-0 rounded-full bg-[var(--bg-raised)] px-3 text-[12px] font-semibold text-[var(--text)] active:scale-[0.97]"
          >
            {baseline === null ? 'Tallenna' : 'Poista'}
          </button>
        </div>
        {drop >= 2 && (
          <Result tone="danger" title={`GCS laskenut ${drop} pistettä`}>
            Pisteiden lasku jo kahdella on merkittävä hälytysmerkki, vaikka kokonaispistemäärä olisi vielä kohtuullinen.
          </Result>
        )}
      </div>
    </div>
  )
}
