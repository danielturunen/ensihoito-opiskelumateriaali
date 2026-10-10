import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg, type Tone } from '../ui'

/* Where irritant gases act in the airway and what that means for treatment
 * (Ensihoito-opas: Toiminta kemikaalionnettomuustilanteessa, tables 1–2). */

type Level = 'upper' | 'bronchi' | 'alveoli'

const L: Record<Level, { label: string; gases: string; sx: string; tx: string; tone: Tone }> = {
  upper: {
    label: 'Ylähengitystiet',
    gases: 'Ammoniakki, formaldehydi, asetaldehydi, suolahappo, rikkihappo, etikkahappo',
    sx: 'Sisäänhengitysvaikeus, stridor, turvotuksen tunne, kipu.',
    tx: 'Adrenaliini- ja kortisoni-inhalaatiot, tarvittaessa kortisoni i.v. Syövyttävät aineet neutraloidaan vedellä myös nielun alueella. Varaudu hengitysteiden ahtautumiseen – happo ja emäs voivat turvottaa nielua.',
    tone: 'warning',
  },
  bronchi: {
    label: 'Ylähengitystiet ja keuhkoputket',
    gases: 'Fluorivetyhappo, klooridioksidi, jodi, rikkidioksidi, kloori, bromi, fluori',
    sx: 'Ylähengitysteiden oireiden lisäksi astmatyyppistä oireilua.',
    tx: 'Keuhkoputkia laajentava lääkitys (salbutamoli) ja inhaloitava steroidi heti alkuvaiheessa. Fluorivetyhappo imeytyy ihon läpi ja aiheuttaa hypokalsemiaa: kalsiumpitoinen voide iholle, kalsium i.v. – pitoisuus mitataan ennen korjausta.',
    tone: 'warning',
  },
  alveoli: {
    label: 'Keuhkorakkulat',
    gases: 'Fosgeeni, metyylibromidi, akroleiini, otsoni, typpidioksidi, dimetyylisulfaatti, sinkkikloridi',
    sx: 'Alveolivaurio ja hapetushäiriö – oireet voivat alkaa viiveellä.',
    tx: 'Osa kaasuista aiheuttaa keuhkopöhön vasta tuntien kuluttua, joten seuranta on erityisen tärkeää, vaikka potilas olisi aluksi lähes oireeton. Happi ja peruselintoimintojen tuki.',
    tone: 'danger',
  },
}
const ORDER: Level[] = ['upper', 'bronchi', 'alveoli']

export default function GasLevels() {
  const [lv, setLv] = useState<Level>('upper')
  const reduce = useReducedMotion()
  const d = L[lv]
  const on = (l: Level) => (l === lv ? 1 : 0.25)

  return (
    <div>
      <Segmented layoutId="gas-levels" size="sm" wrap value={lv} onChange={setLv} options={ORDER.map((k) => ({ value: k, label: L[k].label }))} />
      <svg viewBox="0 0 320 200" className="mt-3 h-auto w-full" role="img" aria-label={`Vaikutustaso: ${d.label}`}>
        <g aria-hidden>
          {/* upper airway */}
          <motion.path d="M140 10 C140 30 146 40 160 44 C174 40 180 30 180 10" fill="none" stroke={svg.brand} strokeWidth={10} strokeLinecap="round" initial={false} animate={{ opacity: on('upper') }} />
          <motion.rect x={152} y={44} width={16} height={48} rx={6} fill={svg.brand} initial={false} animate={{ opacity: Math.max(on('upper'), on('bronchi')) }} />
          {/* bronchi */}
          <motion.path d="M160 90 L120 120 L96 150 M160 90 L200 120 L224 150 M120 120 L118 160 M200 120 L202 160" fill="none" stroke="#e0789c" strokeWidth={8} strokeLinecap="round" initial={false} animate={{ opacity: on('bronchi') }} />
          {/* alveoli */}
          {[
            [90, 160],
            [104, 172],
            [118, 166],
            [96, 180],
            [212, 166],
            [226, 176],
            [204, 180],
            [222, 158],
          ].map(([x, y], i) => (
            <motion.circle key={i} cx={x} cy={y} r={9} fill="rgba(224,120,156,0.35)" stroke="#e0789c" strokeWidth={2} initial={false} animate={{ opacity: on('alveoli'), scale: lv === 'alveoli' && !reduce ? [1, 1.1, 1] : 1 }} transition={{ duration: 1.6, repeat: lv === 'alveoli' && !reduce ? Infinity : 0 }} style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }} />
          ))}
          <text x={236} y={30} fontSize={10} fill={svg.dim}>
            nielu, kurkunpää
          </text>
          <text x={236} y={110} fontSize={10} fill={svg.dim}>
            keuhkoputket
          </text>
          <text x={236} y={190} fontSize={10} fill={svg.dim}>
            rakkulat
          </text>
        </g>
      </svg>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={lv} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="mt-2 flex flex-col gap-2">
          <div className="rounded-xl bg-[var(--bg)] px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Esimerkkejä kaasuista</p>
            <p className="mt-0.5 text-[13px] text-[var(--text)]">{d.gases}</p>
            <p className="mt-2 text-[13px] text-[var(--text)]">
              <strong>Oireet:</strong> {d.sx}
            </p>
          </div>
          <Result tone={d.tone} title="Hoito">
            {d.tx}
          </Result>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
