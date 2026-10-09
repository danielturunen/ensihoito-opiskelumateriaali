import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg, type Tone } from '../ui'

/* Acute abdominal pain: how the pain STARTS points to the mechanism
 * (Akuuttihoito-opas, Akuutin vatsan kliininen tutkimus, taulukko 1). */

type Kind = 'sudden' | 'colic' | 'gradual'

const X0 = 34
const X1 = 312
const BASE = 118
const TOP = 30

function colicPath() {
  // Waves of pain with pain-free gaps, then (dashed part) continuous pain when it complicates.
  let d = `M${X0} ${BASE}`
  let x = X0
  for (let i = 0; i < 4; i++) {
    d += ` C${x + 10} ${BASE} ${x + 12} ${TOP + 8} ${x + 22} ${TOP + 8} C${x + 32} ${TOP + 8} ${x + 34} ${BASE - 6} ${x + 46} ${BASE - 6}`
    x += 46
  }
  return { d, end: x }
}

const colic = colicPath()

const DATA: Record<
  Kind,
  { label: string; path: string; extra?: string; time: string; mech: string; causes: string[]; note: string; tone: Tone }
> = {
  sudden: {
    label: 'Äkillinen',
    path: `M${X0} ${BASE} L74 ${BASE} C77 70 79 ${TOP + 4} 86 ${TOP} L${X1} ${TOP}`,
    time: 'yhtäkkiä tai minuuteissa',
    mech: 'Puhkeama, repeämä tai valtimotukos',
    causes: ['Maha-suolikanavan perforaatio (erityisesti ulkusperforaatio)', 'Repeämä: aneurysma, kysta, parenkyymielin', 'Suoli-iskemia embolian vuoksi'],
    note: 'Henkeä uhkaavien syiden joukko. Etsi sokin merkit, selkään säteilevä kipu ja pyörtyminen (RAAA) sekä kova kipu pehmeällä vatsalla (suoli-iskemia). Ennakkoilmoitus ja kuljetus kirurgiseen päivystykseen viipymättä.',
    tone: 'danger',
  },
  colic: {
    label: 'Koliikki',
    path: colic.d,
    extra: `M${colic.end} ${BASE - 6} C${colic.end + 10} ${BASE - 6} ${colic.end + 12} ${TOP + 14} ${colic.end + 24} ${TOP + 14} L${X1} ${TOP + 14}`,
    time: 'aaltoina, välissä helpompaa',
    mech: 'Putkimaisen elimen tukos',
    causes: ['Suolitukos', 'Sappitietukos (sappikivikohtaus)', 'Virtsatietukos (virtsatiekivi)'],
    note: 'Komplisoituessa kipu muuttuu jatkuvaksi (katkoviiva): kolekystiitti, sappipankreatiitti tai suolen kuristuminen. Vilkkaat, metallinsointiset suoliäänet viittaavat mekaaniseen suolitukokseen.',
    tone: 'warning',
  },
  gradual: {
    label: 'Vähitellen',
    path: `M${X0} ${BASE} C120 ${BASE - 2} 170 96 220 66 S290 ${TOP + 6} ${X1} ${TOP + 2}`,
    time: 'tunneissa, jomottava ja lisääntyvä',
    mech: 'Tulehdus (inflammaatio)',
    causes: ['Appendisiitti', 'Kolekystiitti', 'Divertikuliitti'],
    note: 'Voimakkain aristus ja lihassuoja paljastavat tulehtuneen elimen. Koko vatsan arkuus ja jännittyneet vatsanpeitteet viittaavat yleistyneeseen vatsakalvotulehdukseen. Tulehdusarvot voivat alussa olla vielä normaalit.',
    tone: 'brand',
  },
}

const ORDER: Kind[] = ['sudden', 'colic', 'gradual']

export default function PainOnset() {
  const [kind, setKind] = useState<Kind>('sudden')
  const reduce = useReducedMotion()
  const d = DATA[kind]
  const stroke = d.tone === 'danger' ? svg.danger : d.tone === 'warning' ? svg.brand : svg.teal

  return (
    <div>
      <Segmented layoutId="pain-onset" value={kind} onChange={setKind} options={ORDER.map((k) => ({ value: k, label: DATA[k].label }))} />

      <svg viewBox="0 0 320 150" className="mt-3 h-auto w-full" role="img" aria-label={`Kivun voimakkuus ajan funktiona: ${d.label.toLowerCase()} alku – ${d.time}`}>
        <g aria-hidden>
          <line x1={X0} y1={BASE + 4} x2={X1} y2={BASE + 4} stroke={svg.line} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={X0 - 4} y1={BASE + 4} x2={X0 - 4} y2={18} stroke={svg.line} strokeWidth={1.5} strokeLinecap="round" />
          <text x={14} y={70} fontSize={11} fill={svg.dim} transform="rotate(-90 14 70)" textAnchor="middle">
            kipu
          </text>
          <text x={X1} y={140} fontSize={11} fill={svg.dim} textAnchor="end">
            aika →
          </text>
          {ORDER.filter((k) => k !== kind).map((k) => (
            <path key={k} d={DATA[k].path} fill="none" stroke={svg.line} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
          ))}
          <motion.path
            key={kind}
            d={d.path}
            fill="none"
            stroke={stroke}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          />
          {d.extra && (
            <motion.path
              key={`${kind}-x`}
              d={d.extra}
              fill="none"
              stroke={stroke}
              strokeWidth={3}
              strokeDasharray="6 6"
              strokeLinecap="round"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduce ? 0 : 1.1, duration: 0.3 }}
            />
          )}
        </g>
        <text x={X0 + 6} y={140} fontSize={11} fill={svg.ink} fontWeight={600}>
          {d.time}
        </text>
      </svg>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={kind}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mt-2 flex flex-col gap-2"
        >
          <div className="rounded-xl bg-[var(--bg)] px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Mekanismi</p>
            <p className="font-display text-[15px] font-semibold text-[var(--text)]">{d.mech}</p>
            <ul className="mt-1 flex flex-col gap-0.5 text-[13px] leading-snug text-[var(--text)]">
              {d.causes.map((c) => (
                <li key={c} className="flex gap-1.5">
                  <span aria-hidden style={{ color: stroke }}>
                    •
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <Result tone={d.tone} title="Kohteessa">
            {d.note}
          </Result>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
