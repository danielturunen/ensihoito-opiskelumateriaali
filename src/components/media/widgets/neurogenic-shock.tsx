import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { BodyShapePath, BodySilhouette } from '../parts/body-silhouette'
import { Bullets, FadeSwap, FlowDots, rc, spring, Stage, StateTabs, useLoop } from '../parts/resp-kit'

/* Neurogenic shock by level of spinal cord injury (article Selkäranka- ja selkäydinvamma; ETC).
 * Front-view body (body space 200 × 410, scaled 0.5). Sympathetic pathways are schematic:
 * branches leave the cord below the brain; an injury cuts every branch that leaves below it. */

type Level = 'none' | 'cervical' | 'thoracic' | 'low'

const CORD = 'M100 30L100 200'
const BRANCHES = [
  { id: 'heart', from: 82, d: 'M100 82C103 92 105 100 106 108' },
  { id: 'armL', from: 92, d: 'M100 92C82 102 66 122 54 150' },
  { id: 'armR', from: 92, d: 'M100 92C118 102 134 122 146 150' },
  { id: 'gut', from: 130, d: 'M100 130C108 140 112 156 108 170' },
  { id: 'legL', from: 176, d: 'M100 176C94 214 88 258 86 300' },
  { id: 'legR', from: 176, d: 'M100 176C106 214 112 258 114 300' },
] as const

const CFG: Record<Level, { injury: number | null; pool: number; pooled: string[]; brady: boolean; bp: string; hr: string; limbs: string; tone: string; title: string; items: string[] }> = {
  none: {
    injury: null,
    pool: 0,
    pooled: [],
    brady: false,
    bp: 'normaali',
    hr: 'normaali',
    limbs: 'normaali tonus',
    tone: 'text-teal-600',
    title: 'Ehjä selkäydin',
    items: ['Sympaattinen hermotus pitää yllä valtimoiden ja laskimoiden tonusta, ja sydämen sympaattinen hermotus lähtee ylimmästä rintarangasta.'],
  },
  cervical: {
    injury: 66,
    pool: 0.4,
    pooled: ['chest', 'abdomen', 'pelvis', 'armR', 'armL', 'legR', 'legL'],
    brady: true,
    bp: 'laskee',
    hr: 'bradykardia',
    limbs: 'veri jää raajoihin',
    tone: 'text-danger-500',
    title: 'Vamma T2-tason yläpuolella',
    items: [
      'Verisuonten tonus katoaa: valtimot ja laskimot laajenevat, veri jää raajoihin ja laskimopaluu vähenee.',
      'Myös sydämen sympaattinen hermotus katoaa, joten hypotensioon tulee mukaan bradykardia.',
      'ETC: systolinen paine voi olla alle 70 mmHg ja syke alle 60/min, vaikka nestetila olisi normaali.',
    ],
  },
  thoracic: {
    injury: 108,
    pool: 0.32,
    pooled: ['abdomen', 'pelvis', 'legR', 'legL'],
    brady: false,
    bp: 'laskee',
    hr: 'ei bradykardiaa',
    limbs: 'veri jää alaruumiiseen',
    tone: 'text-brand-600',
    title: 'Vamma T2–T6',
    items: [
      'Neurogeeninen sokki syntyy T6-tason yläpuolisessa vammassa: vamman alapuolella verisuonet laajenevat ja laskimopaluu vähenee.',
      'Sydämen sympaattinen hermotus on tallella – syke ei hidastu.',
    ],
  },
  low: {
    injury: 156,
    pool: 0.12,
    pooled: ['pelvis', 'legR', 'legL'],
    brady: false,
    bp: 'ei neurogeenista sokkia',
    hr: 'normaali',
    limbs: 'vähäinen vaikutus',
    tone: 'text-teal-600',
    title: 'Vamma T6-tason alapuolella',
    items: ['Mitä korkeammalla vamma on, sitä suurempi vaikutus: T6-tason alapuolinen vamma ei aiheuta neurogeenista sokkia.'],
  },
}

export default function NeurogenicShock(_props: WidgetProps) {
  const [level, setLevel] = useState<Level>('cervical')
  const { ref, reduce, active } = useLoop<HTMLDivElement>()
  const c = CFG[level]
  const cut = (from: number) => c.injury !== null && from > c.injury
  const t = reduce ? { duration: 0 } : spring

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="neuro-level"
        value={level}
        onChange={setLevel}
        options={[
          { value: 'none', label: 'Ei vammaa' },
          { value: 'cervical', label: 'Yli T2' },
          { value: 'thoracic', label: 'T2–T6' },
          { value: 'low', label: 'Alle T6' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 320 214" className="h-auto w-full" role="img" aria-label={`Neurogeeninen sokki: ${c.title}. Verenpaine ${c.bp}, syke ${c.hr}.`}>
          <g transform="translate(6 2) scale(0.5)">
            <BodySilhouette view="front" />
            {/* pooled blood in dilated vessels */}
            <motion.g initial={false} animate={{ opacity: c.pool }} transition={t}>
              <BodySilhouette
                view="front"
                details={false}
                renderShape={(sh) => (c.pooled.includes(sh.id) ? <BodyShapePath shape={sh} fill={rc.deoxy} gap="transparent" /> : null)}
              />
            </motion.g>
            {/* spinal cord */}
            <path d={CORD} stroke={svg.teal} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
            <FlowDots d={c.injury ? `M100 30L100 ${c.injury - 4}` : CORD} count={c.injury ? 3 : 6} duration={1.6} active={active} color={svg.teal} r={3.2} />
            {BRANCHES.map((b) => {
              const off = cut(b.from)
              return (
                <g key={b.id}>
                  <path d={b.d} fill="none" stroke={off ? svg.line : svg.teal} strokeWidth={2.4} strokeDasharray={off ? '4 5' : undefined} opacity={off ? 0.7 : 0.55} />
                  <FlowDots d={b.d} count={3} duration={1.4} active={active && !off} color={svg.teal} r={2.8} />
                </g>
              )
            })}
            {/* heart */}
            <motion.path
              d="M98 112C98 104 108 102 112 108C116 102 126 104 124 114C122 124 112 130 108 134C102 128 98 120 98 112Z"
              fill={rc.heartSoft}
              stroke={rc.heart}
              strokeWidth={2}
              animate={active ? { transform: ['scale(1)', 'scale(1.16)', 'scale(1)'] } : { transform: 'scale(1)' }}
              transition={active ? { duration: 0.32, repeat: Infinity, repeatDelay: c.brady ? 1.25 : 0.45 } : { duration: 0 }}
              style={{ transformBox: 'fill-box', originX: 0.5, originY: 0.5 }}
            />
            {/* injury */}
            {c.injury !== null && (
              <g>
                <path d={`M86 ${c.injury}L114 ${c.injury}`} stroke={svg.danger} strokeWidth={5} strokeLinecap="round" />
                <path d={`M86 ${c.injury - 6}L114 ${c.injury + 6}M114 ${c.injury - 6}L86 ${c.injury + 6}`} stroke={svg.danger} strokeWidth={3} strokeLinecap="round" />
              </g>
            )}
          </g>

          {/* readouts */}
          <g transform="translate(120 16)">
            {[
              { k: 'Verenpaine', v: c.bp, bad: c.bp === 'laskee' },
              { k: 'Syke', v: c.hr, bad: c.brady },
              { k: 'Raajat', v: c.limbs, bad: c.pool > 0.3 },
            ].map((r, i) => (
              <g key={r.k} transform={`translate(0 ${i * 62})`}>
                <rect x={0} y={0} width={188} height={50} rx={12} fill={r.bad ? svg.dangerSoft : svg.surface} stroke={r.bad ? svg.danger : svg.line} strokeWidth={1.2} />
                <text x={12} y={20} fontSize={11} fill={svg.dim}>
                  {r.k}
                </text>
                <text x={12} y={39} fontSize={13} fontWeight={700} fill={r.bad ? svg.danger : svg.ink}>
                  {r.v}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </Stage>

      <FadeSwap k={level} className="mt-3">
        <p className={`mb-1.5 font-display text-[15px] font-semibold ${c.tone}`}>{c.title}</p>
        <Bullets items={c.items} />
      </FadeSwap>
    </div>
  )
}
