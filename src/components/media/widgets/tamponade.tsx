import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Bullets, InfoCard, rc, Stage, Swatch, useLoop } from '../parts/resp-kit'

type Mode = 'normal' | 'tamponade'

const SIGNS = ['Matala verenpaine', 'Takykardia', 'Kaulalaskimot pullottavat']
const MORE = ['sentraalinen syanoosi', 'kaventunut pulssipaine', 'vaimentuneet sydänäänet', 'pulsus paradoxus', 'vaihteleva EKG-amplitudi']

const spring = { type: 'spring', duration: 1.4, bounce: 0 } as const

export default function Tamponade(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('normal')
  const { ref, active } = useLoop<HTMLDivElement>()
  const tamp = mode === 'tamponade'
  // Heart: smaller and barely filling when compressed, beating faster (tachycardia).
  const beat = tamp ? 0.45 : 0.9
  const fill = tamp ? 0.025 : 0.09
  const base = tamp ? 0.8 : 1

  return (
    <div ref={ref}>
      <Segmented
        layoutId="tamponade-mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'normal', label: 'Normaali' },
          { value: 'tamponade', label: 'Sydäntamponaatio' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 360 214" className="h-auto w-full" role="img" aria-label={tamp ? 'Sydänpussiin on kertynyt verta, joka puristaa sydäntä niin, ettei se pääse täyttymään. Kaulalaskimot pullottavat.' : 'Normaali sydän sydänpussin sisällä.'}>
          {/* pericardial sac */}
          <g transform="translate(118 106)">
            <motion.ellipse
              rx={92}
              ry={84}
              stroke={svg.dim}
              strokeWidth={2}
              initial={false}
              animate={{ fill: tamp ? 'rgba(194,65,12,0.55)' : 'rgba(148,163,184,0.06)' }}
              transition={{ duration: 1.6 }}
            />
            <text x={0} y={-90} textAnchor="middle" fontSize={11} fontWeight={600} fill={svg.dim}>
              Sydänpussi
            </text>
            {tamp && (
              <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} x={0} y={74} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
                verta sydänpussissa
              </motion.text>
            )}
            {/* heart: RV crescent + LV ring */}
            <motion.g initial={false} animate={{ scale: base }} transition={spring}>
              <motion.g
                animate={active ? { scale: [1, 1 + fill, 1] } : { scale: 1 }}
                transition={{ duration: beat, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
              >
                <path d="M-62 -10C-70 -42 -40 -62 -10 -56C-26 -36 -28 -6 -18 22C-30 30 -56 22 -62 -10Z" fill={rc.heartSoft} stroke={rc.heart} strokeWidth={2} />
                <ellipse cx={14} cy={-6} rx={46} ry={50} fill="color-mix(in srgb, #dc2626 24%, var(--bg-raised))" stroke={rc.heart} strokeWidth={2} />
                <ellipse cx={14} cy={-6} rx={24} ry={28} fill={svg.surface} stroke={rc.heart} strokeWidth={1.5} />
                <text x={14} y={-2} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={rc.heart}>
                  VK
                </text>
                <text x={-42} y={-10} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={rc.heart}>
                  OK
                </text>
              </motion.g>
            </motion.g>
          </g>

          {/* venous return into the heart, blocked when compressed */}
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              r={3.5}
              fill={rc.vein}
              initial={false}
              animate={
                active
                  ? tamp
                    ? { cx: [250, 236, 250], cy: [60, 72, 60], opacity: [0.9, 0.9, 0.9] }
                    : { cx: [250, 160], cy: [60, 96], opacity: [0, 1, 0] }
                  : { cx: 240, cy: 66, opacity: 0.9 }
              }
              transition={{ duration: tamp ? 1.2 : 1.6, repeat: active ? Infinity : 0, delay: i * 0.5, ease: 'easeInOut' }}
            />
          ))}

          {/* head and neck in profile, with the external jugular vein */}
          <g>
            <path
              d="M300 16C324 12 344 28 344 50L350 60L344 64L344 74C344 84 336 88 326 88L326 96C326 120 330 150 340 178H284C290 150 292 120 290 96C278 90 272 74 274 56C274 34 284 18 300 16Z"
              fill="rgba(217,160,124,0.2)"
              stroke="rgba(217,160,124,0.85)"
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
            <motion.path
              d="M312 98C308 124 312 150 318 176"
              fill="none"
              stroke={rc.vein}
              strokeLinecap="round"
              initial={false}
              animate={{ strokeWidth: tamp ? 9 : 3 }}
              transition={spring}
            />
            <text x={312} y={194} textAnchor="middle" fontSize={11} fontWeight={600} fill={tamp ? svg.danger : svg.dim}>
              Kaulalaskimo
            </text>
            <text x={312} y={208} textAnchor="middle" fontSize={11} fontWeight={tamp ? 700 : 400} fill={tamp ? svg.danger : svg.dim}>
              {tamp ? 'pullottaa' : 'normaali'}
            </text>
          </g>
        </svg>
      </Stage>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <Swatch color={rc.heart} label="Sydän (OK = oikea, VK = vasen kammio)" shape="ring" />
        <Swatch color="rgba(194,65,12,0.8)" label="Veri sydänpussissa" />
        <Swatch color={rc.vein} label="Laskimopaluu" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {SIGNS.map((s, i) => (
          <motion.div
            key={s}
            initial={false}
            animate={{ opacity: tamp ? 1 : 0.55 }}
            transition={{ duration: 0.3, delay: tamp ? 1 + i * 0.15 : 0 }}
            className={`flex min-h-[64px] items-center justify-center rounded-xl border px-2 py-2 text-center text-[12.5px] font-semibold leading-tight transition-colors duration-300 ${
              tamp ? 'border-danger-500/40 bg-danger-500/10 text-danger-500' : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-dim)]'
            }`}
            style={{ transitionDelay: tamp ? `${1000 + i * 150}ms` : '0ms' }}
          >
            {s}
          </motion.div>
        ))}
      </div>

      <div className="mt-3 grid gap-2">
        {tamp ? (
          <>
            <InfoCard title="Mitä tapahtuu" accent="danger">
              <Bullets
                dot="bg-danger-500"
                items={[
                  'Verta tai nestettä kertyy sydänpussiin ja estää sydämen täyttymisen.',
                  'Matala verenpaine, takykardia ja kaulalaskimoiden pullotus yhdessä viittaavat tamponaatioon.',
                  'Nopeasti henkeä uhkaava: pikainen kuljetus, ennakkoilmoitus ja ensihoitolääkärin konsultaatio.',
                ]}
              />
            </InfoCard>
            <InfoCard title="Lisäksi voi esiintyä">
              <p className="text-[13px] leading-relaxed text-[var(--text)]">{MORE.join(' · ')}</p>
            </InfoCard>
          </>
        ) : (
          <InfoCard title="Lävistävä rintakehävamma">
            <p className="text-[13px] leading-relaxed text-[var(--text)]">Muista paineilmarinnan lisäksi sydäntamponaatio. Vaihda tilaa ja katso, miten sydänpussiin kertyvä veri puristaa sydäntä.</p>
          </InfoCard>
        )}
      </div>
    </div>
  )
}
