import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { BodyShapePath, BodySilhouette, BODY_FILL } from '../parts/body-silhouette'
import { Bullets, FadeSwap, FlowDots, rc, spring, Stage, StateTabs, useLoop } from '../parts/resp-kit'

/* Pulmonary embolism: the clot's journey and its two consequences (article Keuhkoembolia).
 * Left: body silhouette (front view, body space 200 × 410, scaled). Right: dead-space alveolus
 * and the loaded right ventricle. Schematic – vessel routes are simplified. */

type Step = 'dvt' | 'travel' | 'lodged'

// Patient's left leg (viewer's right) → pelvis → inferior vena cava → right heart → pulmonary artery branch.
const ROUTE = 'M114 352C112 330 112 312 111 296C109 270 107 250 105 232C103 212 101 196 101 176C101 158 101 142 102 132C105 126 109 121 109 113C107 105 100 101 88 100'

const INFO: Record<Step, { title: string; tone: string; items: string[] }> = {
  dvt: {
    title: 'Syvä laskimotukos alaraajassa',
    tone: 'text-brand-600',
    items: [
      'Hyytymä syntyy tyypillisesti alaraajan syvään laskimoon. Toispuoleinen jalan turvotus ja kipu viittaavat laskimotukokseen.',
      'Riskitekijöitä: immobilisaatio, tuore iso leikkaus, syöpä, raskaus tai hormonaalinen ehkäisy ja aiempi tukos.',
    ],
  },
  travel: {
    title: 'Hyytymä irtoaa',
    tone: 'text-brand-600',
    items: ['Hyytymä kulkeutuu verenkierron mukana laskimoista sydämen oikealle puolelle ja sieltä keuhkovaltimoon.'],
  },
  lodged: {
    title: 'Tukos keuhkovaltimossa',
    tone: 'text-danger-500',
    items: [
      'Keuhkoissa: alue saa ilmaa mutta ei verta – kaasujenvaihto estyy (dead space).',
      'Sydämessä: oikea kammio pumppaa valtavaa vastusta vasten → oikean puolen vajaatoiminta ja sokki.',
      'Auskultaatio on usein normaali: äkillinen hengenahdistus ja takykardia ilman selittävää löydöstä on keuhkoembolia, kunnes toisin todistetaan.',
    ],
  },
}

export default function PePath(_props: WidgetProps) {
  const [step, setStep] = useState<Step>('dvt')
  const [run, setRun] = useState(0)
  const { ref, reduce, active } = useLoop<HTMLDivElement>()
  const routeRef = useRef<SVGPathElement>(null)
  const progress = useMotionValue(0)

  useEffect(() => {
    const target = step === 'dvt' ? 0 : 1
    if (step !== 'travel' || reduce) {
      progress.jump(target)
      return
    }
    progress.jump(0)
    const c = animate(progress, 1, { duration: 3.4, ease: [0.77, 0, 0.175, 1] })
    return () => c.stop()
  }, [step, run, reduce, progress])

  const clotTransform = useTransform(progress, (p) => {
    const path = routeRef.current
    if (!path) return 'translate(114px, 352px)'
    const pt = path.getPointAtLength(p * path.getTotalLength())
    return `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px)`
  })

  const lodged = step === 'lodged'
  const info = INFO[step]

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="pe-step"
        value={step}
        onChange={setStep}
        options={[
          { value: 'dvt', label: '1. Laskimotukos' },
          { value: 'travel', label: '2. Hyytymä irtoaa' },
          { value: 'lodged', label: '3. Keuhkovaltimossa' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 340 300" className="h-auto w-full" role="img" aria-label={`Keuhkoembolian synty: ${info.title}.`}>
          {/* ---- body ---- */}
          <g transform="translate(6 2) scale(0.72)">
            <BodySilhouette
              view="front"
              renderShape={(s) => (
                <BodyShapePath shape={s} fill={s.id === 'legL' ? 'color-mix(in srgb, #dc2626 16%, var(--bg-raised))' : BODY_FILL} />
              )}
            />
            {/* lungs */}
            <ellipse cx={84} cy={106} rx={16} ry={28} fill={rc.lungSoft} stroke={rc.lung} strokeWidth={1.4} />
            <ellipse cx={118} cy={106} rx={16} ry={28} fill={rc.lungSoft} stroke={rc.lung} strokeWidth={1.4} />
            {/* heart */}
            <motion.path
              d="M98 112C98 104 108 102 112 108C116 102 126 104 124 114C122 124 112 130 108 134C102 128 98 120 98 112Z"
              fill={rc.heartSoft}
              stroke={rc.heart}
              strokeWidth={1.6}
              initial={false}
              animate={{ transform: lodged ? 'scale(1.18)' : 'scale(1)' }}
              transition={reduce ? { duration: 0 } : spring}
              style={{ transformBox: 'fill-box', originX: 0.3, originY: 0.6 }}
            />
            {/* venous route */}
            <path ref={routeRef} d={ROUTE} fill="none" stroke={rc.vein} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
            {/* clot */}
            <motion.g style={{ transform: clotTransform }}>
              <ellipse cx={0} cy={0} rx={5.5} ry={4} fill={rc.clot} stroke="#fca5a5" strokeWidth={1} />
            </motion.g>
            {lodged && (
              <g>
                <path d="M88 100L70 88C68 98 68 112 72 124Z" fill="color-mix(in srgb, var(--text) 30%, transparent)" />
                <circle cx={88} cy={100} r={9} fill="none" stroke={svg.danger} strokeWidth={2} strokeDasharray="3 3" />
              </g>
            )}
          </g>

          {/* ---- detail panels ---- */}
          <g transform="translate(168 14)">
            <text x={0} y={12} fontSize={12} fontWeight={700} fill={svg.ink}>
              Keuhkorakkula
            </text>
            <circle cx={78} cy={64} r={34} fill={rc.airLine} fillOpacity={0.12} stroke={rc.airLine} strokeWidth={1.6} />
            <FlowDots d="M78 20L78 52" count={3} duration={1.6} active={active} color={rc.airInk} r={2.4} />
            <path d="M8 112C40 104 116 104 156 112" fill="none" stroke={lodged ? svg.line : rc.oxy} strokeWidth={10} strokeLinecap="round" opacity={lodged ? 0.6 : 0.3} />
            {!lodged && <FlowDots d="M8 112C40 104 116 104 156 112" count={6} duration={1.8} active={active} color={rc.oxy} r={2.6} />}
            <text x={0} y={140} fontSize={11} fill={lodged ? svg.danger : svg.dim} fontWeight={lodged ? 700 : 400}>
              {lodged ? 'Ilmaa mutta ei verta' : 'Ilma ja veri kohtaavat'}
            </text>

            <text x={0} y={176} fontSize={12} fontWeight={700} fill={svg.ink}>
              Oikea kammio
            </text>
            <motion.path
              d="M30 200C44 188 74 190 82 210C88 228 70 256 50 262C34 252 22 226 30 200Z"
              fill={rc.heartSoft}
              stroke={rc.heart}
              strokeWidth={2}
              initial={false}
              animate={{ transform: lodged ? 'scale(1.22)' : 'scale(1)' }}
              transition={reduce ? { duration: 0 } : spring}
              style={{ transformBox: 'fill-box', originX: 0.5, originY: 0.5 }}
            />
            {lodged && (
              <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
                <path d="M104 236L136 236M128 228L136 236L128 244" fill="none" stroke={svg.danger} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                <text x={100} y={262} fontSize={11} fontWeight={700} fill={svg.danger}>
                  paine nousee
                </text>
              </motion.g>
            )}
          </g>
        </svg>
      </Stage>

      <div className="mt-3 flex items-start justify-between gap-3">
        <FadeSwap k={step} className="min-w-0 flex-1">
          <p className={`mb-1.5 font-display text-[15px] font-semibold ${info.tone}`}>{info.title}</p>
          <Bullets items={info.items} />
        </FadeSwap>
        {step === 'travel' && !reduce && (
          <button
            onClick={() => setRun((n) => n + 1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--bg-card)] text-[var(--text)] active:scale-[0.95]"
            aria-label="Toista hyytymän matka"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
