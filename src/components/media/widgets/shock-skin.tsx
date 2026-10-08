import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Bullets, FadeSwap, rc, Stage, useLoop } from '../parts/resp-kit'

type Mode = 'septic' | 'hypo'

const HAND = 'M40 168V108C40 100 50 98 52 106V74C52 64 66 64 66 74V64C66 54 80 54 80 64V70C80 60 94 60 94 70V82C94 74 106 74 106 84V128C106 150 94 168 84 176H52C46 176 40 174 40 168Z'

const spring = { type: 'spring', duration: 0.9, bounce: 0.05 } as const

export default function ShockSkin(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('septic')
  const { ref, active } = useLoop<HTMLDivElement>()
  const septic = mode === 'septic'
  const vesselR = septic ? 17 : 6
  const blood = septic ? 'rgba(220,38,38,0.55)' : 'rgba(220,38,38,0.35)'

  return (
    <div ref={ref}>
      <Segmented
        layoutId="shock-skin"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'septic', label: 'Septinen sokki' },
          { value: 'hypo', label: 'Hypovoleeminen sokki' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 360 196" className="h-auto w-full" role="img" aria-label={septic ? 'Lämmin sokki: iho lämmin ja punoittava, ääreisverisuonet laajentuneet.' : 'Kylmä sokki: iho kylmä ja kalpea, ääreisverisuonet supistuneet.'}>
          {/* hand */}
          <motion.path
            d={HAND}
            strokeWidth={2}
            strokeLinejoin="round"
            initial={false}
            animate={{
              fill: septic ? 'rgba(244,114,94,0.55)' : 'rgba(186,198,214,0.4)',
              stroke: septic ? '#e0674a' : '#94a3b8',
            }}
            transition={{ duration: 0.6 }}
          />
          {/* warmth or cold indicators */}
          {septic
            ? [56, 74, 92].map((x, i) => (
                <motion.path
                  key={x}
                  d={`M${x} 46c-4 -6 4 -10 0 -16s4 -10 0 -16`}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={false}
                  animate={active ? { opacity: [0, 0.9, 0], y: [6, -4] } : { opacity: 0.8, y: 0 }}
                  transition={{ duration: 1.8, repeat: active ? Infinity : 0, delay: i * 0.4 }}
                />
              ))
            : [62, 92].map((x) => (
                <g key={x} stroke="#38bdf8" strokeWidth={2} strokeLinecap="round" opacity={0.9}>
                  <path d={`M${x} 18v22M${x - 10} 23l20 12M${x - 10} 35l20 -12`} />
                </g>
              ))}
          <text x={73} y={192} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={septic ? '#ea580c' : '#0ea5e9'}>
            {septic ? 'Iho lämmin' : 'Iho kylmä, kalpea'}
          </text>

          {/* skin section with arterioles */}
          <g transform="translate(150 22)">
            <rect x={0} y={0} width={196} height={136} rx={14} fill={svg.surface} stroke={svg.line} />
            <rect x={0} y={0} width={196} height={22} rx={10} fill={septic ? 'rgba(244,114,94,0.28)' : 'rgba(186,198,214,0.3)'} />
            <text x={10} y={15} fontSize={10.5} fontWeight={600} fill={svg.dim}>
              Iho
            </text>
            {[42, 98, 154].map((cx, i) => (
              <g key={cx}>
                <motion.circle
                  cx={cx}
                  cy={74}
                  fill={blood}
                  stroke={rc.heart}
                  strokeWidth={3}
                  initial={false}
                  animate={active ? { r: [vesselR, vesselR * 1.08, vesselR] } : { r: vesselR }}
                  transition={active ? { duration: 0.9, repeat: Infinity, delay: i * 0.1 } : spring}
                />
                {/* smooth muscle ring */}
                <motion.circle cx={cx} cy={74} fill="none" stroke="#e0674a" strokeDasharray="3 3" initial={false} animate={{ r: vesselR + 6, strokeWidth: septic ? 1.5 : 4 }} transition={spring} />
              </g>
            ))}
            {/* arrows: relaxed outward vs squeezed inward */}
            {[42, 98, 154].map((cx) => {
              const r = vesselR + 9
              return (
                <g key={`a${cx}`} stroke={septic ? '#ea580c' : '#0ea5e9'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
                  {septic ? (
                    <>
                      <path d={`M${cx} ${74 - r}v-8m-3 3l3 -3 3 3`} />
                      <path d={`M${cx} ${74 + r}v8m-3 -3l3 3 3 -3`} />
                    </>
                  ) : (
                    <>
                      <path d={`M${cx} ${74 - r - 8}v8m-3 -3l3 3 3 -3`} />
                      <path d={`M${cx} ${74 + r + 8}v-8m-3 3l3 -3 3 3`} />
                    </>
                  )}
                </g>
              )
            })}
            <text x={98} y={128} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={svg.ink}>
              {septic ? 'Ääreisverisuonet laajentuneet' : 'Ääreisverisuonet supistuneet'}
            </text>
          </g>
        </svg>
      </Stage>

      <FadeSwap k={mode} className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        {septic ? (
          <>
            <p className="mb-2 font-display text-[15px] font-semibold text-brand-600">"Lämmin sokki"</p>
            <Bullets
              items={[
                'Ääreisverenkierron vastus on alentunut: iho poikkeavan lämmin, syke koholla, potilas levoton.',
                'Hengitystaajuus nousee usein ennen muita selviä merkkejä – mittaa se kaikilta infektioepäilypotilailta.',
                'Nesteytys kirkkailla liuoksilla vasteen mukaan; jos 1000–2000 ml ei poista sokin merkkejä → vasopressori (ensisijaisesti noradrenaliini).',
              ]}
            />
          </>
        ) : (
          <>
            <p className="mb-2 font-display text-[15px] font-semibold text-sky-600">Tyypillinen kylmä sokki</p>
            <Bullets
              items={[
                'Elimistö kompensoi supistamalla ääreisverenkiertoa.',
                'Iho kylmä, kalpea ja hikinen.',
                'Lämmin iho septisellä potilaalla erottaa tilan tästä tyypillisestä kylmästä hypovoleemisesta sokista.',
              ]}
            />
          </>
        )}
      </FadeSwap>
    </div>
  )
}
