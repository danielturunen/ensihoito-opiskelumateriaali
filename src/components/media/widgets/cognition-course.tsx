import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg, type Tone } from '../ui'

/* How cognition changes over time in the common dementias vs. an acute cause.
 * Shapes are schematic; descriptions from the article (Sulkava, Oppiportti Geriatria). */

type Kind = 'alz' | 'vas' | 'lewy' | 'acute'

const X0 = 30
const X1 = 312
const TOP = 26
const BOT = 116

function lewyPath() {
  let d = `M${X0} ${TOP + 4}`
  for (let x = X0 + 6; x <= X1; x += 6) {
    const trend = TOP + 4 + ((x - X0) / (X1 - X0)) * 62
    const wobble = 9 * Math.sin((x - X0) / 9)
    d += ` L${x} ${(trend + wobble).toFixed(1)}`
  }
  return d
}

const DATA: Record<Kind, { label: string; path: string; time: string; title: string; text: string; tone: Tone }> = {
  alz: {
    label: 'Alzheimer',
    path: `M${X0} ${TOP + 2} C120 ${TOP + 8} 200 ${TOP + 40} ${X1} ${BOT - 18}`,
    time: 'vuosia – hiipivä',
    title: 'Hiipivä heikkeneminen',
    text: 'Lähimuisti, sanojen haku ja hahmottaminen heikkenevät vähitellen; sosiaaliset taidot säilyvät pitkään. Noin 60 % muistisairauksista.',
    tone: 'brand',
  },
  vas: {
    label: 'Vaskulaarinen',
    path: `M${X0} ${TOP + 2} L100 ${TOP + 2} L104 ${TOP + 24} L180 ${TOP + 24} L184 ${TOP + 50} L250 ${TOP + 50} L254 ${TOP + 72} L${X1} ${TOP + 72}`,
    time: 'vuosia – portaittain',
    title: 'Voi edetä portaittain',
    text: 'Aivoinfarktien tai pienten suonten taudin seuraus. Toiminnanohjaus heikkenee, kävely on töpöttelevää ja yöllä voi olla sekavuutta. Noin 15 %.',
    tone: 'brand',
  },
  lewy: {
    label: 'Lewy',
    path: lewyPath(),
    time: 'vuosia – vaihteleva',
    title: 'Vireys ja kognitio vaihtelevat',
    text: 'Aamulla selkeä, iltapäivällä sekava; näköharhat, parkinsonismi, kaatumiset ja ortostaattinen hypotensio. Erittäin herkkä neurolepteille. 15–20 %.',
    tone: 'warning',
  },
  acute: {
    label: 'Äkillinen',
    path: `M${X0} ${TOP + 30} L190 ${TOP + 32} C198 ${TOP + 34} 202 ${BOT - 6} 214 ${BOT - 4} L${X1} ${BOT - 2}`,
    time: 'tunteja tai päiviä',
    title: 'Äkillinen muutos ei ole "vain dementiaa"',
    text: 'Äkillinen sekavuus, tajunnan vaihtelu tai uusi neurologinen oire viittaa akuuttiin syyhyn: delirium (infektio, lääke), aivoverenkiertohäiriö tai pään vamma kaatumisen jälkeen. Selvitä, mikä on uutta.',
    tone: 'danger',
  },
}
const ORDER: Kind[] = ['alz', 'vas', 'lewy', 'acute']

export default function CognitionCourse() {
  const [kind, setKind] = useState<Kind>('alz')
  const reduce = useReducedMotion()
  const d = DATA[kind]
  const stroke = d.tone === 'danger' ? svg.danger : d.tone === 'warning' ? svg.brand : svg.teal

  return (
    <div>
      <Segmented layoutId="cognition-course" size="sm" wrap value={kind} onChange={setKind} options={ORDER.map((k) => ({ value: k, label: DATA[k].label }))} />

      <svg viewBox="0 0 320 150" className="mt-3 h-auto w-full" role="img" aria-label={`Kognition kulku: ${d.title}`}>
        <g aria-hidden>
          <line x1={X0 - 4} y1={BOT + 4} x2={X1} y2={BOT + 4} stroke={svg.line} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={X0 - 4} y1={BOT + 4} x2={X0 - 4} y2={14} stroke={svg.line} strokeWidth={1.5} strokeLinecap="round" />
          <text x={12} y={70} fontSize={11} fill={svg.dim} transform="rotate(-90 12 70)" textAnchor="middle">
            toimintakyky
          </text>
          <text x={X1} y={140} fontSize={11} fill={svg.dim} textAnchor="end">
            aika →
          </text>
          {ORDER.filter((k) => k !== kind).map((k) => (
            <path key={k} d={DATA[k].path} fill="none" stroke={svg.line} strokeWidth={1.5} strokeLinejoin="round" opacity={0.7} />
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
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
        </g>
        <text x={X0 + 4} y={140} fontSize={11} fill={svg.ink} fontWeight={600}>
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
          className="mt-2"
        >
          <Result tone={d.tone} title={d.title}>
            {d.text}
          </Result>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
