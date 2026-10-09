import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { Result, Segmented, svg, type Tone } from '../ui'

/* Umbilical cord prolapse: how the mother's position changes the presenting part's
 * pressure on the cord (Ensihoito-opas, Kämäräinen 2023). Schematic, not to scale. */

type Pos = 'sit' | 'knee' | 'left'

const POS: Record<Pos, { label: string; angle: number; press: boolean; title: string; text: string; tone: Tone }> = {
  sit: {
    label: 'Istuen',
    angle: 0,
    press: true,
    title: 'Ei suositella',
    text: 'Istuma-asennossa ja kantotuolilla siirrettäessä painovoima painaa tarjoutuvaa osaa napanuoraa vasten. Synnyttäjä autetaan ensisijaisesti kävelemään ambulanssiin.',
    tone: 'danger',
  },
  knee: {
    label: 'Kontallaan',
    angle: 150,
    press: false,
    title: 'Polvet ja kyynärpäät, pakarat ylhäällä',
    text: 'Jos siirtyminen ambulanssiin ei onnistu heti, äiti asettuu kontalleen rintakehä alhaalla. Kuljetuksen aikana asento on hankala: turvavöitä on vaikea kiinnittää ja sivuttaisliikkeet voivat kaataa – tue tyynyillä ja avustajalla.',
    tone: 'warning',
  },
  left: {
    label: 'Vasen kylki',
    angle: -105,
    press: false,
    title: 'Turvallisin kuljetusasento',
    text: 'Ambulanssissa jyrkkä vasen kylkiasento ja lantion alle reilu korotus. Paine napanuoraan vähenee, ja synnyttäjä voidaan kiinnittää turvallisesti.',
    tone: 'ok',
  },
}
const ORDER: Pos[] = ['sit', 'knee', 'left']

const CX = 160
const CY = 104

export default function CordProlapse() {
  const [pos, setPos] = useState<Pos>('sit')
  const reduce = useReducedMotion()
  const p = POS[pos]
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, duration: 0.8, bounce: 0.1 }

  return (
    <div>
      <Segmented layoutId="cord-prolapse" value={pos} onChange={setPos} options={ORDER.map((k) => ({ value: k, label: POS[k].label }))} />

      <div className="relative mt-3">
        <svg viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-label={`${p.label}: ${p.press ? 'tarjoutuva osa painaa napanuoraa' : 'paine napanuoraan vähenee'}`}>
          <motion.g initial={false} animate={{ rotate: p.angle }} transition={spring} style={{ transformOrigin: `${CX}px ${CY}px` }} aria-hidden>
            {/* uterus, cervix at the bottom (local coordinates) */}
            <path
              d={`M${CX - 62} ${CY - 6} Q${CX - 64} ${CY - 80} ${CX} ${CY - 84} Q${CX + 64} ${CY - 80} ${CX + 62} ${CY - 6} Q${CX + 50} ${CY + 52} ${CX + 12} ${CY + 70} L${CX - 12} ${CY + 70} Q${CX - 50} ${CY + 52} ${CX - 62} ${CY - 6} Z`}
              fill="rgba(224,120,156,0.16)"
              stroke="#de8aa2"
              strokeWidth={3}
            />
            {/* fetus: body + head that slides toward the cervix under gravity */}
            <motion.g initial={false} animate={{ y: p.press ? 0 : -26 }} transition={spring}>
              <ellipse cx={CX + 4} cy={CY - 34} rx={34} ry={30} fill="rgba(248,105,10,0.16)" stroke={svg.brand} strokeWidth={1.5} />
              <circle cx={CX} cy={CY + 32} r={26} fill="rgba(248,105,10,0.26)" stroke={svg.brand} strokeWidth={2} />
            </motion.g>
            {/* umbilical cord loop slipping past the head through the cervix */}
            <path
              d={`M${CX + 22} ${CY - 6} C${CX + 40} ${CY + 30} ${CX + 20} ${CY + 58} ${CX + 4} ${CY + 66} C${CX - 10} ${CY + 76} ${CX - 4} ${CY + 98} ${CX + 12} ${CY + 96}`}
              fill="none"
              stroke={p.press ? svg.danger : '#6b72d9'}
              strokeWidth={5}
              strokeLinecap="round"
            />
            {p.press && <circle cx={CX + 6} cy={CY + 62} r={9} fill="none" stroke={svg.danger} strokeWidth={2} strokeDasharray="3 3" />}
          </motion.g>
          <text x={12} y={202} fontSize={11} fill={svg.dim}>
            painovoima
          </text>
        </svg>
        <ArrowDown className="absolute bottom-6 left-4 h-5 w-5 text-[var(--text-dim)]" aria-hidden />
        <span
          className={`absolute right-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-semibold ${p.press ? 'bg-danger-500/15 text-danger-500' : 'bg-teal-500/15 text-teal-600'}`}
        >
          {p.press ? 'Napanuora puristuksissa' : 'Paine vähenee'}
        </span>
      </div>

      <div className="mt-2">
        <Result tone={p.tone} title={p.title}>
          {p.text}
        </Result>
      </div>
      <ul className="mt-3 flex flex-col gap-1 rounded-xl bg-[var(--bg)] px-3.5 py-2.5 text-[12px] leading-relaxed text-[var(--text)]">
        <li>• Äiti ei saa ponnistaa – ponnistustarpeessa voimakas läähättäminen.</li>
        <li>• Kuljetus alkaa alle 5 minuutissa; sikiön hätätilanne vaatii yleensä hätäsektion.</li>
        <li>• Hoito-ohjeella: steriilein käsinein tarjoutuvaa osaa työnnetään kohtuun päin – varo aukileita.</li>
      </ul>
    </div>
  )
}
