import { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Bullets, FadeSwap, FlowDots, rc, Stage, StateTabs } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'

/* Chest cross-section seen from the feet (viewBox 320 × 220). Content: Säämänen 2008 and
 * Käypä hoito Elvytys 2021 as quoted in the article Aikuisen elvytys. The "verenkierto" bar
 * is illustrative, not a measured value. */

type Mode = 'good' | 'lean' | 'pause'

const PERIOD = 60 / 110 // seconds per compression at 110/min

const INFO: Record<Mode, { title: string; tone: string; flow: number; items: string[] }> = {
  good: {
    title: 'Laadukas painelu',
    tone: 'text-teal-600',
    flow: 1,
    items: [
      'Sydän puristuu rintalastan ja selkärangan väliin, ja veri virtaa valtimoihin.',
      'Rintakehän painevaihtelu sekä puristaa verta valtimoihin että lisää laskimopaluuta rintaonteloon (Säämänen 2008).',
      'Syvyys 5–6 cm, tahti 100–120/min, täydellinen palautuminen joka painalluksen jälkeen – painelija vaihtuu 2 minuutin välein.',
    ],
  },
  lean: {
    title: 'Painelija nojaa rintakehään',
    tone: 'text-brand-600',
    flow: 0.45,
    items: [
      'Rintakehä ei palaudu: veri ei pääse palaamaan rintaonteloon, sydän ei täyty kunnolla, ja seuraava painallus pumppaa vähemmän.',
      'Siksi rintakehän täydellinen palautuminen on yhtä tärkeää kuin syvyys ja tahti.',
    ],
  },
  pause: {
    title: 'Painelutauko',
    tone: 'text-danger-500',
    flow: 0,
    items: [
      'Kun painelu taukoaa, pumppu pysähtyy.',
      'Rytmin analyysi, isku, hengitystie ja suoniyhteys hoidetaan mahdollisimman lyhyin tauoin – intubaation aikana painelu saa keskeytyä alle 5 sekunniksi, eikä suoniyhteyden avaaminen saa keskeyttää painelua.',
    ],
  },
}

export default function CprPump(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('good')
  const ref = useRef<HTMLDivElement>(null)
  const phase = useRef(0)
  const depth = useMotionValue(0.5) // 0 = chest fully up, 1 = fully compressed

  const running = useFrameLoop(
    ref,
    (dt) => {
      if (mode === 'pause') {
        depth.set(depth.get() * 0.85)
        return
      }
      phase.current = (phase.current + dt / PERIOD) % 1
      const wave = 0.5 - 0.5 * Math.cos(phase.current * Math.PI * 2)
      depth.set(mode === 'lean' ? 0.4 + 0.6 * wave : wave)
    },
    true,
  )

  // chest outline: the anterior half moves down by up to 16 units
  const chest = useTransform(depth, (d) => {
    const top = 36 + d * 16
    return `M40 120C40 ${top + 20} 98 ${top} 160 ${top}C222 ${top} 280 ${top + 20} 280 120C280 168 228 196 160 196C92 196 40 168 40 120Z`
  })
  const sternumY = useTransform(depth, (d) => 34 + d * 16)
  const heartRy = useTransform(depth, (d) => 27 - d * 10)
  const heartCy = useTransform(depth, (d) => 122 + d * 5)
  const handsTransform = useTransform(depth, (d) => `translateY(${d * 16}px)`)
  const info = INFO[mode]
  const flowOn = running && mode !== 'pause'

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="cpr-pump"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'good', label: 'Hyvä painelu' },
          { value: 'lean', label: 'Nojaa rintakehään' },
          { value: 'pause', label: 'Painelutauko' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 320 220" className="h-auto w-full" role="img" aria-label={`Rintakehän poikkileikkaus painelun aikana. ${info.title}.`}>
          <motion.path d={chest} fill={svg.raised} stroke={svg.line} strokeWidth={2} />
          {/* lungs */}
          <ellipse cx={92} cy={124} rx={40} ry={44} fill={rc.lungSoft} stroke={rc.lung} strokeWidth={1.4} opacity={0.8} />
          <ellipse cx={228} cy={124} rx={40} ry={44} fill={rc.lungSoft} stroke={rc.lung} strokeWidth={1.4} opacity={0.8} />
          {/* spine */}
          <circle cx={160} cy={180} r={13} fill={svg.surface} stroke={svg.dim} strokeWidth={2.4} />
          <text x={160} y={212} textAnchor="middle" fontSize={11} fill={svg.dim}>
            selkäranka
          </text>
          {/* vessels */}
          <path d="M184 108C214 84 252 70 300 64" fill="none" stroke={rc.oxy} strokeWidth={6} strokeLinecap="round" opacity={0.35} />
          <path d="M20 154C60 150 104 140 138 130" fill="none" stroke={rc.vein} strokeWidth={6} strokeLinecap="round" opacity={0.35} />
          <FlowDots d="M184 108C214 84 252 70 300 64" count={mode === 'lean' ? 3 : 6} duration={mode === 'lean' ? 2.6 : 1.5} active={flowOn} color={rc.oxy} r={3} />
          <FlowDots d="M20 154C60 150 104 140 138 130" count={mode === 'lean' ? 2 : 5} duration={mode === 'lean' ? 3.2 : 1.8} active={flowOn} color={rc.vein} r={3} />
          {/* heart */}
          <motion.ellipse cx={160} cy={heartCy} rx={34} ry={heartRy} fill={rc.heartSoft} stroke={rc.heart} strokeWidth={2.2} />
          <text x={160} y={126} textAnchor="middle" fontSize={11} fontWeight={600} fill={svg.ink}>
            sydän
          </text>
          {/* sternum + hands */}
          <motion.rect x={140} y={sternumY} width={40} height={9} rx={4} fill={svg.surface} stroke={svg.dim} strokeWidth={2} />
          <motion.g style={{ transform: handsTransform }}>
            <path d="M138 18L182 18L176 32L144 32Z" fill={svg.brandSoft} stroke={svg.brand} strokeWidth={1.8} strokeLinejoin="round" />
          </motion.g>
          <text x={196} y={30} fontSize={11} fill={svg.dim}>
            rintalasta
          </text>
          <text x={300} y={56} textAnchor="end" fontSize={11} fill={svg.dim}>
            valtimoihin
          </text>
          <text x={20} y={184} fontSize={11} fill={svg.dim}>
            laskimopaluu
          </text>
        </svg>
      </Stage>

      <div className="mt-3">
        <div className="flex items-baseline justify-between text-[12px]">
          <span className="font-semibold text-[var(--text)]">Verenkierto</span>
          <span className="text-[var(--text-dim)]">havainnollistus</span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[var(--bg)]">
          <motion.div
            className="h-full origin-left rounded-full"
            style={{ originX: 0, background: info.flow > 0.6 ? svg.teal : info.flow > 0 ? svg.brand : svg.danger }}
            initial={false}
            animate={{ transform: `scaleX(${Math.max(info.flow, 0.02)})` }}
            transition={{ duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
          />
        </div>
      </div>

      <FadeSwap k={mode} className="mt-3">
        <p className={`mb-1.5 font-display text-[15px] font-semibold ${info.tone}`}>{info.title}</p>
        <Bullets items={info.items} />
      </FadeSwap>
    </div>
  )
}
