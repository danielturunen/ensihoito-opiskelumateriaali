import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Bullets, FadeSwap, Stage, Swatch, useLoop } from '../parts/resp-kit'

type Mode = 'none' | 'drug'

const SERO = '#ec4899'
const DRUG = '#f8690a'
const NERVE = '#eab308'

/* viewBox 360 × 214 */
const CENTER = { x: 272, y: 62 } // vomiting centre
const GUT_R = { x: 92, y: 170 } // receptor on vagal endings in the gut
const NERVE_PATH = `M${GUT_R.x + 8} ${GUT_R.y - 6} C150 150 170 110 210 96 S250 78 ${CENTER.x - 14} ${CENTER.y + 6}`

function Receptor({ x, y, blocked, label }: { x: number; y: number; blocked: boolean; label: string }) {
  return (
    <g>
      <path d={`M${x - 9} ${y - 4}v8a9 9 0 0 0 18 0v-8`} fill="none" stroke={svg.ink} strokeWidth={2} strokeLinecap="round" />
      <motion.path
        d={`M${x - 7} ${y - 6}h14v6a7 7 0 0 1 -14 0z`}
        initial={false}
        animate={{ opacity: blocked ? 1 : 0, y: blocked ? 0 : -10 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
        fill={DRUG}
      />
      <text x={x} y={y + 22} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={svg.dim}>
        {label}
      </text>
    </g>
  )
}

export default function Antiemetic(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('none')
  const { ref, active } = useLoop<HTMLDivElement>()
  const drug = mode === 'drug'
  const nerveRef = useRef<SVGPathElement>(null)
  const [track, setTrack] = useState<{ xs: number[]; ys: number[] } | null>(null)
  useLayoutEffect(() => {
    const p = nerveRef.current
    if (!p) return
    const len = p.getTotalLength()
    const pts = Array.from({ length: 16 }, (_, i) => p.getPointAtLength((len * i) / 15))
    setTrack({ xs: pts.map((q) => q.x), ys: pts.map((q) => q.y) })
  }, [])

  return (
    <div ref={ref}>
      <Segmented
        layoutId="antiemetic-mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'none', label: 'Ilman lääkettä' },
          { value: 'drug', label: 'Ondansetroni' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 360 214" className="h-auto w-full" role="img" aria-label={drug ? 'Ondansetroni salpaa 5-HT3-reseptorit suolistossa ja oksentelukeskuksessa, viesti ei kulje.' : 'Serotoniini aktivoi 5-HT3-reseptorit suolistossa ja oksentelukeskuksessa, viesti kulkee vagushermoa pitkin.'}>
          {/* brain */}
          <path
            d="M226 64C214 40 236 14 266 18C286 6 318 14 324 36C344 44 344 74 326 86C322 104 298 112 282 104C266 114 240 108 234 92C216 90 214 72 226 64Z"
            fill="rgba(236,72,153,0.10)"
            stroke={svg.dim}
            strokeWidth={1.6}
          />
          <text x={276} y={128} textAnchor="middle" fontSize={11} fontWeight={600} fill={svg.ink}>
            Oksentelukeskus
          </text>
          <motion.circle
            cx={CENTER.x}
            cy={CENTER.y}
            r={18}
            initial={false}
            animate={
              active && !drug
                ? { fill: ['rgba(236,72,153,0.25)', 'rgba(236,72,153,0.65)', 'rgba(236,72,153,0.25)'] }
                : { fill: drug ? 'rgba(15,184,172,0.22)' : 'rgba(236,72,153,0.45)' }
            }
            transition={{ duration: 1.2, repeat: active && !drug ? Infinity : 0 }}
            stroke={drug ? svg.teal : SERO}
            strokeWidth={2}
          />
          <Receptor x={CENTER.x + 30} y={CENTER.y + 2} blocked={drug} label="5-HT3" />

          {/* central serotonin acting directly at the centre */}
          {Array.from({ length: 3 }, (_, i) => (
            <motion.circle
              key={`c${i}`}
              r={2.8}
              fill={SERO}
              initial={false}
              animate={active ? { cx: [CENTER.x + 34, CENTER.x + 31], cy: [CENTER.y - 30, CENTER.y - 2], opacity: drug ? [0, 0.8, 0] : [0, 1, 1] } : { cx: CENTER.x + 34, cy: CENTER.y - 18, opacity: 0.8 }}
              transition={{ duration: 1.4, repeat: active ? Infinity : 0, delay: i * 0.45 }}
            />
          ))}

          {/* gut */}
          <path
            d="M24 158C24 140 52 140 52 158S80 176 80 158 108 140 108 158 136 176 136 158"
            fill="none"
            stroke="rgba(244,114,182,0.55)"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <text x={24} y={202} fontSize={11} fontWeight={600} fill={svg.ink}>
            Suolisto
          </text>
          <Receptor x={GUT_R.x} y={GUT_R.y + 12} blocked={drug} label="" />
          {/* serotonin release in the gut */}
          {Array.from({ length: 4 }, (_, i) => (
            <motion.circle
              key={`g${i}`}
              r={2.8}
              fill={SERO}
              initial={false}
              animate={active ? { cx: [GUT_R.x - 26 + i * 6, GUT_R.x], cy: [GUT_R.y - 18, GUT_R.y + 8], opacity: drug ? [0, 0.8, 0] : [0, 1, 1] } : { cx: GUT_R.x - 14 + i * 6, cy: GUT_R.y - 8, opacity: 0.8 }}
              transition={{ duration: 1.5, repeat: active ? Infinity : 0, delay: i * 0.38 }}
            />
          ))}

          {/* vagus nerve */}
          <path ref={nerveRef} d={NERVE_PATH} fill="none" stroke={NERVE} strokeWidth={3} strokeLinecap="round" opacity={0.9} />
          <text x={150} y={92} fontSize={11} fontWeight={700} fill="#ca8a04" transform="rotate(-24 150 92)">
            Vagushermo
          </text>
          {/* signal pulses travelling to the centre */}
          {!drug &&
            track &&
            [0, 1].map((i) => (
              <motion.circle
                key={`s${i}`}
                r={5}
                fill={NERVE}
                initial={false}
                animate={active ? { cx: track.xs, cy: track.ys, opacity: [0, 1, ...Array(12).fill(1), 1, 0] } : { cx: track.xs[8], cy: track.ys[8], opacity: 1 }}
                transition={{ duration: 1.6, repeat: active ? Infinity : 0, delay: i * 0.8, ease: 'linear' }}
              />
            ))}
          {drug && (
            <text x={176} y={136} fontSize={12} fontWeight={700} fill={svg.teal}>
              ei viestiä
            </text>
          )}

          {/* outcome */}
          <text x={348} y={160} textAnchor="end" fontSize={12.5} fontWeight={700} fill={drug ? svg.teal : SERO}>
            {drug ? 'Pahoinvointi helpottuu' : 'Pahoinvointi, oksentelu'}
          </text>
        </svg>
      </Stage>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <Swatch color={SERO} label="Serotoniini" />
        <Swatch color={DRUG} label="Ondansetroni (5-HT3-salpaaja)" />
        <Swatch color={NERVE} label="Viesti vagushermossa" />
      </div>

      <FadeSwap k={mode} className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        {drug ? (
          <>
            <p className="mb-2 font-display text-[15px] font-semibold text-teal-600">Ondansetroni salpaa 5-HT3-reseptorit</p>
            <Bullets
              items={[
                'Sekä oksentelukeskuksessa että suoliston vagushermopäätteissä – ärsyke oksentelukeskukseen vähenee.',
                'Vaikutus alkaa noin 15–30 minuutissa ja kestää 4–8 tuntia.',
                'Pidentää QT-aikaa – tarkista QT-aika ennen antoa.',
              ]}
            />
          </>
        ) : (
          <>
            <p className="mb-2 font-display text-[15px] font-semibold text-[var(--text)]">Serotoniini välittää pahoinvoinnin</p>
            <Bullets
              items={[
                'Serotoniini aktivoi 5-HT3-reseptoreita suolistossa; viesti kulkee vagushermoa pitkin oksentelukeskukseen.',
                'Keskushermostossa serotoniini vaikuttaa myös suoraan oksentelukeskukseen.',
                'Ensihoidossa: opioidien aiheuttama pahoinvointi ja sepelvaltimotautikohtauksen (erityisesti vagaalinen) pahoinvointi.',
              ]}
            />
          </>
        )}
      </FadeSwap>
    </div>
  )
}
