import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Bullets, FadeSwap, InfoCard, Stage, useLoop } from '../parts/resp-kit'

type Src = 'upper' | 'lower'

const GUT = 'rgba(244,114,182,0.38)'
const COLON_C = 'rgba(217,119,6,0.32)'
const RED = '#dc2626'
const TAR = '#1c1917'

/* viewBox 360 × 250, front view (patient's left = viewer's right) */
const ESO = 'M110 0V60'
const STOMACH = 'M110 60C112 46 158 44 166 72C174 100 146 112 126 106'
const COLON = 'M44 226V120H204V214C204 232 162 236 128 238'
const SMALL =
  'M126 106C104 110 90 124 102 136C120 148 152 132 164 150C176 168 130 172 108 164C88 158 74 178 96 188C120 198 164 182 160 202C156 216 96 214 64 222L44 226'
/** Blood path for upper bleeding: stomach → small bowel → colon → rectum. */
const UPPER_DOWN = `M150 92C150 102 140 106 126 106${SMALL.slice(SMALL.indexOf('C'))}V120H204V214C204 232 162 236 128 238L120 252`
/** Haematemesis: stomach up through the oesophagus and out of the mouth. */
const UPPER_UP = 'M150 92C162 74 128 58 110 60V0L104 -8'
/** Lower bleeding: diverticulum in the descending colon → rectum. */
const LOWER_DOWN = 'M204 180V214C204 232 162 236 128 238L120 252'
const BLEED = { upper: { x: 150, y: 92 }, lower: { x: 204, y: 180 } }

function useTrack(d: string) {
  const ref = useRef<SVGPathElement>(null)
  const [pts, setPts] = useState<{ x: number; y: number }[]>([])
  useLayoutEffect(() => {
    const p = ref.current
    if (!p) return
    const len = p.getTotalLength()
    setPts(Array.from({ length: 30 }, (_, i) => p.getPointAtLength((len * i) / 29)))
  }, [d])
  return { ref, pts }
}

function Flow({ pts, darken, active, n = 4, duration = 4 }: { pts: { x: number; y: number }[]; darken: boolean; active: boolean; n?: number; duration?: number }) {
  if (pts.length < 2) return null
  const fills = pts.map((_, i) => (darken ? (i / pts.length > 0.35 ? TAR : RED) : RED))
  return (
    <>
      {Array.from({ length: n }, (_, k) => (
        <motion.circle
          key={k}
          r={3.6}
          initial={false}
          animate={
            active
              ? { cx: pts.map((q) => q.x), cy: pts.map((q) => q.y), fill: fills, opacity: pts.map((_, i) => (i === 0 || i === pts.length - 1 ? 0 : 1)) }
              : { cx: pts[Math.floor((pts.length * (k + 1)) / (n + 1))].x, cy: pts[Math.floor((pts.length * (k + 1)) / (n + 1))].y, fill: fills[Math.floor((pts.length * (k + 1)) / (n + 1))], opacity: 1 }
          }
          transition={{ duration, repeat: active ? Infinity : 0, delay: (k * duration) / n, ease: 'linear' }}
        />
      ))}
    </>
  )
}

export default function GiBleed(_props: WidgetProps) {
  const [src, setSrc] = useState<Src>('upper')
  const { ref, active } = useLoop<HTMLDivElement>()
  const down = useTrack(UPPER_DOWN)
  const up = useTrack(UPPER_UP)
  const low = useTrack(LOWER_DOWN)
  const upper = src === 'upper'

  return (
    <div ref={ref}>
      <Segmented
        layoutId="gi-src"
        value={src}
        onChange={setSrc}
        options={[
          { value: 'upper', label: 'Yläosan vuoto' },
          { value: 'lower', label: 'Alaosan vuoto' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 -10 360 262" className="h-auto w-full" role="img" aria-label={upper ? 'Vuoto mahalaukusta: verioksennus ja tervamainen uloste.' : 'Vuoto paksusuolesta: kirkas veri peräsuolesta.'}>
          {/* tract */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={ESO} stroke={GUT} strokeWidth={10} />
            <path d={COLON} stroke={COLON_C} strokeWidth={18} />
            <path d={SMALL} stroke={GUT} strokeWidth={9} />
            <path d={STOMACH} stroke={GUT} strokeWidth={24} />
          </g>
          <text x={102} y={26} fontSize={10.5} fill={svg.dim} textAnchor="end">
            ruokatorvi
          </text>
          <text x={176} y={62} fontSize={10.5} fill={svg.dim}>
            mahalaukku
          </text>
          <text x={214} y={150} fontSize={10.5} fill={svg.dim}>
            paksusuoli
          </text>
          <text x={104} y={152} fontSize={10.5} fill={svg.dim} textAnchor="middle">
            ohutsuoli
          </text>

          {/* invisible tracks */}
          <path ref={down.ref} d={UPPER_DOWN} fill="none" stroke="none" />
          <path ref={up.ref} d={UPPER_UP} fill="none" stroke="none" />
          <path ref={low.ref} d={LOWER_DOWN} fill="none" stroke="none" />

          {/* bleeding site */}
          <motion.circle
            r={7}
            fill={RED}
            initial={false}
            animate={{ cx: upper ? BLEED.upper.x : BLEED.lower.x, cy: upper ? BLEED.upper.y : BLEED.lower.y, scale: active ? [1, 1.35, 1] : 1 }}
            transition={{ cx: { type: 'spring', duration: 0.5 }, cy: { type: 'spring', duration: 0.5 }, scale: { duration: 1, repeat: active ? Infinity : 0 } }}
          />
          <motion.text initial={false} animate={{ x: upper ? 158 : 214, y: upper ? 98 : 186 }} fontSize={11} fontWeight={700} fill={RED}>
            {upper ? 'haava' : 'divertikkeli'}
          </motion.text>

          {upper ? (
            <>
              <Flow key="d" pts={down.pts} darken active={active} n={5} duration={5} />
              <Flow key="u" pts={up.pts} darken={false} active={active} n={2} duration={1.6} />
            </>
          ) : (
            <Flow key="l" pts={low.pts} darken={false} active={active} n={3} duration={1.8} />
          )}

          {/* outputs */}
          <g transform="translate(232 0)">
            {upper && (
              <>
                <rect x={0} y={-2} width={124} height={44} rx={10} fill="rgba(220,38,38,0.12)" />
                <text x={10} y={16} fontSize={11.5} fontWeight={700} fill={RED}>
                  Hematemeesi
                </text>
                <text x={10} y={32} fontSize={10.5} fill={svg.dim}>
                  verioksennus
                </text>
              </>
            )}
            <rect x={0} y={196} width={124} height={44} rx={10} fill={upper ? 'rgba(28,25,23,0.35)' : 'rgba(220,38,38,0.12)'} />
            <text x={10} y={214} fontSize={11.5} fontWeight={700} fill={upper ? svg.ink : RED}>
              {upper ? 'Meleena' : 'Hematoketsia'}
            </text>
            <text x={10} y={230} fontSize={10.5} fill={svg.dim}>
              {upper ? 'tervamainen uloste' : 'kirkas veri peräsuolesta'}
            </text>
          </g>
        </svg>
      </Stage>

      <FadeSwap k={src} className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        {upper ? (
          <Bullets
            items={[
              'Noin 80 % vuodoista on peräisin ruoansulatuskanavan yläosasta – yleisin syy on maha- tai pohjukaissuolihaava.',
              'Näkyy verioksennuksena (hematemeesi) tai tervamaisena ulosteena (meleena).',
            ]}
          />
        ) : (
          <Bullets
            items={[
              'Kirkas peräsuolivuoto viittaa useimmiten alaosan syyhyn – divertikuloosi on yleisin.',
              '10–15 %:ssa kirkas vuoto on kuitenkin rajusta ylävuodosta – potilaalla on silloin jo sokin oireita.',
            ]}
          />
        )}
      </FadeSwap>

      <div className="mt-2">
        <InfoCard title="Ensihoito" accent="brand">
          <Bullets
            dot="bg-brand-500"
            items={[
              'Avaa suoniyhteys herkästi; nestehoito sokin merkkien ilmetessä (tavoite systolinen noin 90 mmHg).',
              'Vältä liiallista nesteytystä – se laimentaa hyytymistekijöitä.',
              'Harkitse traneksaamihappoa runsaassa vuodossa. Selvitä antikoagulaatiolääkitys.',
            ]}
          />
        </InfoCard>
      </div>
    </div>
  )
}
