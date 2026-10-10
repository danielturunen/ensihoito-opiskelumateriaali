import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg, type Tone } from '../ui'

/* The Assessment Triangle used in the trauma team leader's 5-second round
 * (European Trauma Course manual, ch. 2, fig. 2.2). */

type Level = 0 | 1 | 2

const SIDES = [
  { id: 'social', label: 'Vuorovaikutus', options: ['Rauhallinen', 'Levoton', 'Puuttuu'] },
  { id: 'resp', label: 'Hengitystyö', options: ['Normaali', 'Lisääntynyt', 'Puuttuu'] },
  { id: 'skin', label: 'Ihon perfuusio', options: ['Hyvä', 'Kalpea, kirjava', 'Puuttuu'] },
] as const

const COLORS = [svg.teal, svg.brand, svg.danger]

// triangle vertices: social (top), resp (bottom left), skin (bottom right)
const V = [
  { x: 160, y: 22 },
  { x: 52, y: 196 },
  { x: 268, y: 196 },
]

export default function AssessmentTriangle() {
  const [lv, setLv] = useState<Level[]>([0, 0, 0])
  const reduce = useReducedMotion()
  const worst = Math.max(...lv) as Level

  let title: string
  let text: string
  let tone: Tone
  if (worst === 2) {
    title = 'Kriittinen – toimi heti'
    text = '5 sekunnin kierroksen tarkoitus on sulkea pois täydellinen ilmatietukos, massiivinen ulkoinen verenvuoto ja traumaattinen sydänpysähdys. Jos jokin löytyy, tiimi ohjataan heti ratkaisemaan se – esimerkiksi painamaan vuotokohtaa, avaamaan ilmatie tai aloittamaan TCA-algoritmi – eikä ensiarviota jatketa sitä ennen.'
    tone = 'danger'
  } else if (worst === 1) {
    title = 'Vakava tila – varaudu toimimaan heti'
    text = 'Poikkeava löydös jossakin kolmion osassa viittaa vakavaan tilaan. ETC:n esimerkissä levoton, hengitysvaikeuksinen ja kirjavaihoinen potilas tarvitsee todennäköisesti henkeä pelastavia toimenpiteitä viipymättä. Kuuluta löydökset selvästi, jotta koko tiimi ymmärtää prioriteetit.'
    tone = 'warning'
  } else {
    title = 'Ei todennäköisesti välitöntä toimenpidetarvetta'
    text = 'Rauhallinen potilas, jonka hengitystyö on normaali ja iho hyvin perfusoitunut, ei todennäköisesti tarvitse välitöntä toimenpidettä. Siirrytään luovutusraporttiin ja ensiarvioon – suunnitelma A pysyy.'
    tone = 'ok'
  }

  const pts = V.map((v, i) => {
    // pull each vertex towards the centre as that side worsens
    const k = [0, 0.28, 0.52][lv[i]]
    return { x: v.x + (160 - v.x) * k, y: v.y + (138 - v.y) * k }
  })

  return (
    <div>
      <svg viewBox="0 0 320 222" className="h-auto w-full" role="img" aria-label={`Arviointikolmio: ${SIDES.map((s, i) => `${s.label} ${s.options[lv[i]]}`).join(', ')}`}>
        <g aria-hidden>
          <path d={`M${V[0].x} ${V[0].y} L${V[1].x} ${V[1].y} L${V[2].x} ${V[2].y} Z`} fill="none" stroke={svg.line} strokeWidth={2} strokeDasharray="4 5" />
          <motion.path
            initial={false}
            animate={{ d: `M${pts[0].x} ${pts[0].y} L${pts[1].x} ${pts[1].y} L${pts[2].x} ${pts[2].y} Z` }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.6, bounce: 0.15 }}
            fill={worst === 2 ? svg.dangerSoft : worst === 1 ? svg.brandSoft : svg.tealSoft}
            stroke={COLORS[worst]}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          {pts.map((p, i) => (
            <motion.circle key={i} r={9} initial={false} animate={{ cx: p.x, cy: p.y, fill: COLORS[lv[i]] }} transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.6, bounce: 0.15 }} />
          ))}
          <text x={160} y={14} fontSize={11} fontWeight={600} fill={svg.ink} textAnchor="middle">
            Vuorovaikutus
          </text>
          <text x={52} y={216} fontSize={11} fontWeight={600} fill={svg.ink} textAnchor="middle">
            Hengitystyö
          </text>
          <text x={268} y={216} fontSize={11} fontWeight={600} fill={svg.ink} textAnchor="middle">
            Ihon perfuusio
          </text>
        </g>
      </svg>

      <div className="mt-2 flex flex-col gap-2.5">
        {SIDES.map((s, i) => (
          <div key={s.id}>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{s.label}</p>
            <Segmented
              layoutId={`triangle-${s.id}`}
              size="sm"
              value={String(lv[i])}
              onChange={(v) => setLv((l) => l.map((x, j) => (j === i ? (Number(v) as Level) : x)))}
              options={s.options.map((o, j) => ({ value: String(j), label: o }))}
            />
          </div>
        ))}
      </div>

      <div className="mt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={worst}
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
    </div>
  )
}
