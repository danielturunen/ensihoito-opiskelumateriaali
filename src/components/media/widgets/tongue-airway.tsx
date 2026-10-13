import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Bullets, FadeSwap, FlowDots, rc, spring, Stage, StateTabs, useLoop } from '../parts/resp-kit'

/* Sagittal head-and-neck schematic, face to the left (viewBox 300 × 240).
 * Content: European Trauma Course (airway chapter) and Käypä hoito Elvytys 2021, as quoted in
 * the article Hengitystien hallinta. Tongue position is schematic. */

type Mode = 'awake' | 'down' | 'chin' | 'jaw' | 'npa'

const OPEN_PATH = 'M46 89C80 87 118 86 144 92C158 104 157 138 152 160C148 174 142 188 141 236'
const BLOCKED_PATH = 'M46 89C80 87 118 86 144 92C154 100 156 108 156 116'
const NPA_PATH = 'M46 91C80 92 116 92 140 95C154 102 157 118 156 152C155 166 146 182 141 236'
const TUBE_PATH = 'M47 91C80 92 116 92 140 95C153 101 156 116 156 150'

const POSE: Record<Mode, { tongue: string; head: string; open: boolean; npa?: boolean }> = {
  awake: { tongue: 'translate(0px, 0px)', head: 'rotate(0deg)', open: true },
  down: { tongue: 'translate(17px, 5px)', head: 'rotate(0deg)', open: false },
  chin: { tongue: 'translate(-7px, -3px)', head: 'rotate(-7deg)', open: true },
  jaw: { tongue: 'translate(-9px, 2px)', head: 'rotate(0deg)', open: true },
  npa: { tongue: 'translate(17px, 5px)', head: 'rotate(0deg)', open: true, npa: true },
}

const INFO: Record<Mode, { title: string; tone: string; items: string[] }> = {
  awake: {
    title: 'Hengitystie auki',
    tone: 'text-teal-600',
    items: ['Valveilla ylähengitysteiden lihasjäntevyys pitää nielun auki, ja ilma kulkee nenästä nielun kautta henkitorveen.'],
  },
  down: {
    title: 'Kieli tukkii nielun',
    tone: 'text-danger-500',
    items: [
      'Tajunnan laskiessa ylähengitysteiden lihasjäntevyys katoaa: kieli ja pehmeä kitalaki painuvat taaksepäin ja tukkivat nielun.',
      'Kuorsaava ääni kertoo, että nielu on osittain tukossa. Täydellisessä tukoksessa ääntä ja ilmavirtaa ei ole.',
      'Arvioi katso–kuuntele–tunnustele-periaatteella.',
    ],
  },
  chin: {
    title: 'Leuan nosto',
    tone: 'text-teal-600',
    items: [
      'Pää taaksepäin ja alaleuka ylös: kieli nousee irti nielun takaseinästä.',
      'Sudenkuopat: liian vähäinen voima – ja hengitystie menetetään, kun ote irtoaa.',
    ],
  },
  jaw: {
    title: 'Leukaperien työntö',
    tone: 'text-teal-600',
    items: [
      'Paine alaleuan kulmista ylös ja eteenpäin – pää pysyy linjassa.',
      'Jos kaularangan vamma on mahdollinen, kaikki hengitystietoimet tehdään pää ja kaula linjassa käsituennassa.',
      'Ote voi pahentaa tukosta, jos alaleuka on murtunut.',
    ],
  },
  npa: {
    title: 'Nenänieluputki ohittaa kielen',
    tone: 'text-teal-600',
    items: [
      'Sietyy paremmin kuin nieluputki, jos potilas ei ole syvästi tajuton – myös leukalukossa ja kasvovammoissa.',
      'Viedään nenän pohjaa pitkin, ei ylöspäin. Ei kallonpohjan murtumaa epäiltäessä.',
      'Ei ole varma hengitystie: usein tarvitaan edelleen leukaperien työntö.',
    ],
  },
}

export default function TongueAirway(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('down')
  const { ref, reduce, active } = useLoop<HTMLDivElement>()
  const pose = POSE[mode]
  const info = INFO[mode]
  const t = reduce ? { duration: 0 } : spring

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="tongue-mode"
        gridOnly
        value={mode}
        onChange={setMode}
        options={[
          { value: 'awake', label: 'Hereillä' },
          { value: 'down', label: 'Tajunta laskenut' },
          { value: 'chin', label: 'Leuan nosto' },
          { value: 'jaw', label: 'Leukaperien työntö' },
          { value: 'npa', label: 'Nenänieluputki' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 300 240" className="h-auto w-full" role="img" aria-label={`Pään ja kaulan sivukuva. ${info.title}.`}>
          <motion.g
            initial={false}
            animate={{ transform: pose.head }}
            transition={t}
            style={{ transformBox: 'view-box', originX: '170px', originY: '200px' }}
          >
            {/* skin outline */}
            <path
              d="M150 8C110 6 74 18 64 44C60 52 60 58 58 62L40 86L54 93L52 102L58 108L52 115C52 128 54 140 64 148C76 156 100 158 124 162C130 180 132 210 134 240L206 240C206 200 210 170 214 152C238 130 252 96 246 62C238 26 196 8 150 8Z"
              fill={svg.raised}
              stroke={svg.line}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {/* nasal passage and pharynx (air space) */}
            <path
              d="M54 84C80 78 118 76 148 78C162 86 170 104 168 124C166 150 166 170 166 186L150 186L150 240L132 240L132 184C136 176 142 168 146 160C150 140 150 112 144 100C124 98 84 98 56 96Z"
              fill={rc.airLine}
              fillOpacity={0.12}
              stroke="none"
            />
            {/* posterior pharyngeal wall */}
            <path d="M148 76C164 86 172 104 170 126C168 150 168 172 168 240" fill="none" stroke={rc.tissue} strokeWidth={2.4} strokeLinecap="round" />
            {/* hard palate */}
            <path d="M60 97L126 97" stroke={svg.dim} strokeWidth={3} strokeLinecap="round" />
            {/* trachea (front) and oesophagus (behind) */}
            <path d="M132 186L132 240M150 192L150 240" stroke={rc.cartilage} strokeWidth={2} />
            {[198, 212, 226].map((y) => (
              <path key={y} d={`M133 ${y}L149 ${y}`} stroke={rc.cartilage} strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
            ))}
            <path d="M153 186L153 240M166 186L166 240" stroke={svg.dim} strokeWidth={1.4} strokeDasharray="3 3" opacity={0.6} />
            {/* epiglottis */}
            <path d="M146 176C147 168 150 160 156 154" fill="none" stroke={rc.tissue} strokeWidth={3} strokeLinecap="round" />

            {/* tongue + mandible + soft palate move together */}
            <motion.g initial={false} animate={{ transform: pose.tongue }} transition={t}>
              {/* soft palate */}
              <path d="M126 97C136 100 144 106 148 116" fill="none" stroke={rc.tissue} strokeWidth={4} strokeLinecap="round" />
              {/* tongue */}
              <path
                d="M62 116C70 104 96 100 118 104C134 107 144 116 145 132C146 148 140 160 128 164C108 168 86 162 74 152C64 144 58 128 62 116Z"
                fill={rc.mucosaSoft}
                stroke={rc.mucosa}
                strokeWidth={2}
              />
              {/* mandible */}
              <path d="M60 140C76 152 104 156 128 152L138 118" fill="none" stroke={svg.dim} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
            </motion.g>

            {pose.npa && (
              <motion.path
                d={TUBE_PATH}
                fill="none"
                stroke={svg.brand}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={0.55}
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              />
            )}

            {/* airflow */}
            <FlowDots d={pose.npa ? NPA_PATH : pose.open ? OPEN_PATH : BLOCKED_PATH} count={pose.open ? 9 : 4} duration={pose.open ? 2.4 : 1.6} active={active} color={pose.open ? rc.airInk : svg.danger} r={2.6} />

            {/* labels */}
            <text x={98} y={136} textAnchor="middle" fontSize={12} fontWeight={600} fill={svg.ink}>
              kieli
            </text>
            <text x={176} y={140} fontSize={11} fill={svg.dim}>
              nielu
            </text>
            <text x={104} y={230} textAnchor="end" fontSize={11} fill={svg.dim}>
              henkitorvi
            </text>
            <text x={172} y={230} fontSize={11} fill={svg.dim}>
              ruokatorvi
            </text>
          </motion.g>

          {/* obstruction marker */}
          {!pose.open && (
            <g>
              <circle cx={158} cy={124} r={11} fill="none" stroke={svg.danger} strokeWidth={2} strokeDasharray="3 3" />
              <text x={178} y={114} fontSize={12} fontWeight={700} fill={svg.danger}>
                tukos
              </text>
            </g>
          )}
        </svg>
      </Stage>

      <FadeSwap k={mode} className="mt-3">
        <p className={`mb-1.5 font-display text-[15px] font-semibold ${info.tone}`}>{info.title}</p>
        <Bullets items={info.items} />
      </FadeSwap>
    </div>
  )
}
