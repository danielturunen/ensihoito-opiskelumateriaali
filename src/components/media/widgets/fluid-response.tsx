import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg, type Tone } from '../ui'

/* The three possible responses of a bleeding trauma patient to fluid resuscitation
 * (European Trauma Course manual, ch. 5). Schematic systolic pressure curves. */

type Kind = 'resp' | 'trans' | 'non'

const DATA: Record<Kind, { label: string; title: string; why: string; act: string; tone: Tone; color: string; d: string }> = {
  resp: {
    label: 'Paranee',
    title: 'Potilas paranee',
    why: 'Elimistön kompensaatio ja nesteen antonopeus ovat yhdessä suurempia kuin vuodon nopeus.',
    act: 'Punasoluja voidaan tarvita myöhemmin, mutta ne ehtivät täydellisen sopivuuskokeen kautta. Seuraa peruselintoimintoja tiiviisti ja ilmoita äkillisestä huononemisesta heti tiiminjohtajalle.',
    tone: 'ok',
    color: svg.teal,
    d: 'M20 150 C40 150 52 150 60 148 C76 120 96 92 130 84 C170 76 220 74 300 72',
  },
  trans: {
    label: 'Paranee ja huononee',
    title: 'Paranee aluksi, sitten huononee',
    why: 'Vuoto on kiihtynyt: uusi vuotokohta tai alkuperäisen vuotokohdan hyytymä on irronnut – jälkimmäinen voi johtua liiallisesta nesteytyksestä ja verenpaineen noususta.',
    act: 'Kiireellinen kirurginen arvio – useimmat tarvitsevat leikkauksen tai toimenpideradiologisen hoidon. Tarvitaan myös verta (O-ryhmä, ryhmäspesifinen tai sopivuuskokeen kautta) tasapainoisesti plasman ja verihiutaleiden kanssa.',
    tone: 'warning',
    color: svg.brand,
    d: 'M20 150 C40 150 52 150 60 148 C76 122 96 98 124 94 C150 92 168 104 190 124 C220 150 260 166 300 172',
  },
  non: {
    label: 'Ei vastetta',
    title: 'Potilas ei parane',
    why: 'Potilas vuotaa nopeammin kuin nestettä ja verta annetaan – tai kyse ei ole pelkästä hypovoleemisesta sokista, vaan taustalla on toinen syy, kuten kardiogeeninen tai neurogeeninen sokki.',
    act: 'Erottele syyt esitietojen, tutkimuksen ja peruselintoimintojen avulla. Massiivisesti vuotava tarvitsee kiireellisen toimenpiteen (vauriokirurgia): massiivivuotoprotokolla, tasapainoinen verensiirto, hyytymishäiriön korjaus ja hypotermian esto.',
    tone: 'danger',
    color: svg.danger,
    d: 'M20 150 C40 150 52 150 60 150 C90 152 120 156 150 160 C190 166 240 176 300 184',
  },
}
const ORDER: Kind[] = ['resp', 'trans', 'non']

export default function FluidResponse() {
  const [kind, setKind] = useState<Kind>('trans')
  const reduce = useReducedMotion()
  const d = DATA[kind]

  return (
    <div>
      <Segmented layoutId="fluid-response" size="sm" value={kind} onChange={setKind} options={ORDER.map((k) => ({ value: k, label: DATA[k].label }))} />

      <svg viewBox="0 0 320 210" className="mt-3 h-auto w-full" role="img" aria-label={`Systolisen paineen kulku: ${d.title}`}>
        <g aria-hidden>
          {/* axes */}
          <line x1={20} y1={196} x2={306} y2={196} stroke={svg.line} strokeWidth={1.5} />
          <line x1={20} y1={20} x2={20} y2={196} stroke={svg.line} strokeWidth={1.5} />
          <text x={24} y={16} fontSize={10} fill={svg.dim}>
            systolinen paine
          </text>
          <text x={306} y={208} fontSize={10} fill={svg.dim} textAnchor="end">
            aika →
          </text>
          {/* target band 80–90 mmHg (schematic) */}
          <rect x={20} y={94} width={286} height={20} fill={svg.tealSoft} />
          <text x={302} y={108} fontSize={9} fill={svg.teal} textAnchor="end">
            tavoitealue
          </text>
          {/* fluid bolus */}
          <line x1={60} y1={30} x2={60} y2={196} stroke={svg.dim} strokeWidth={1} strokeDasharray="3 4" />
          <text x={64} y={40} fontSize={10} fill={svg.dim}>
            neste / veri
          </text>

          {/* faded curves */}
          {ORDER.filter((k) => k !== kind).map((k) => (
            <path key={k} d={DATA[k].d} fill="none" stroke={DATA[k].color} strokeOpacity={0.22} strokeWidth={2} strokeLinecap="round" />
          ))}
          {/* active curve */}
          <motion.path
            key={kind}
            d={d.d}
            fill="none"
            stroke={d.color}
            strokeWidth={3.5}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduce ? 0 : 1.1, ease: 'easeOut' }}
          />
        </g>
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
            <p className="font-display text-[15px] font-semibold text-[var(--text)]">{d.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{d.why}</p>
          </div>
          <Result tone={d.tone} title="Mitä seuraavaksi">
            {d.act}
          </Result>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
