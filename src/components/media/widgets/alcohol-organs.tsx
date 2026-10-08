import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { BODY_VIEWBOX, BodySilhouette } from '../parts/body-silhouette'
import { FadeSwap } from '../parts/resp-kit'

type Organ = 'brain' | 'nerves' | 'heart' | 'liver' | 'pancreas' | 'gi' | 'metabolism' | 'blood'

const ORGANS: { id: Organ; label: string; text: string }[] = [
  { id: 'brain', label: 'Aivot', text: 'Aivoatrofia, dementia, kouristusherkkyys, suurentunut aivoverenvuodon ja -infarktin riski.' },
  { id: 'heart', label: 'Sydän', text: 'Alkoholikardiomyopatia, eteisvärinä, pidentynyt QT-aika, kohonnut verenpaine.' },
  { id: 'liver', label: 'Maksa', text: 'Rasvamaksa → alkoholihepatiitti → maksakirroosi.' },
  { id: 'pancreas', label: 'Haima', text: 'Krooninen haimatulehdus; akuutista pankreatiitista noin 70 % on alkoholin aiheuttamia.' },
  { id: 'gi', label: 'Ruoansulatuskanava', text: 'Refluksitauti, gastriitti, Mallory-Weissin repeämä, suonikohjuvuodot.' },
  { id: 'nerves', label: 'Ääreishermosto ja lihakset', text: 'Polyneuropatia (jopa 80 %:lla suurkuluttajista), harvinaisena rabdomyolyysi.' },
  { id: 'metabolism', label: 'Aineenvaihdunta', text: 'Ketoasidoosi, laktaattiasidoosi, hypoglykemia paastossa.' },
  { id: 'blood', label: 'Veri ja infektiot', text: 'Anemia, trombosytopenia, immuunipuutos, lisääntynyt infektioherkkyys.' },
]

const LIVER_STAGES = ['Rasvamaksa', 'Alkoholihepatiitti', 'Maksakirroosi']
const HOT = '#f8690a'

/** Organ glyphs in body-silhouette coordinates (200 × 410, patient's right on the viewer's left). */
function OrganShape({ id, on }: { id: Organ; on: boolean }) {
  const fill = on ? 'rgba(248,105,10,0.35)' : 'rgba(148,163,184,0.18)'
  const stroke = on ? HOT : 'color-mix(in srgb, var(--text) 35%, transparent)'
  const p = { fill, stroke, strokeWidth: on ? 2.2 : 1.2, strokeLinejoin: 'round' as const }
  switch (id) {
    case 'brain':
      return <path d="M100 16C88 14 82 22 84 30C80 36 86 44 94 42C98 46 106 46 108 42C116 44 120 36 116 30C118 22 112 14 100 16Z" {...p} />
    case 'heart':
      return <path d="M106 118C96 110 92 102 98 97C102 94 106 96 108 99C110 95 116 94 119 98C123 104 116 112 106 118Z" {...p} />
    case 'liver':
      return <path d="M68 140C72 132 96 130 112 134C116 138 110 146 100 150C88 156 74 156 68 150Z" {...p} />
    case 'pancreas':
      return <path d="M98 160C106 154 122 154 130 158C128 164 116 164 106 166C100 167 96 164 98 160Z" {...p} />
    case 'gi':
      return <path d="M100 70V120C100 132 116 138 124 144C130 150 126 172 114 178C100 186 82 182 80 196C78 206 92 214 104 208" fill="none" stroke={stroke} strokeWidth={on ? 4 : 3} strokeLinecap="round" />
    case 'nerves':
      return <path d="M82 230L76 300L72 380M118 230L124 300L128 380M46 100L30 160L24 216M154 100L170 160L176 216" fill="none" stroke={stroke} strokeWidth={on ? 2.6 : 1.4} strokeLinecap="round" strokeDasharray={on ? undefined : '2 4'} />
    case 'metabolism':
      return (
        <g>
          <circle cx={150} cy={250} r={11} {...p} />
          <text x={150} y={254} textAnchor="middle" fontSize={10} fontWeight={700} fill={on ? HOT : svg.dim}>
            pH
          </text>
        </g>
      )
    case 'blood':
      return <path d="M50 236C56 244 60 250 60 255A10 10 0 0 1 40 255C40 250 44 244 50 236Z" {...p} />
  }
}

export default function AlcoholOrgans(_props: WidgetProps) {
  const [sel, setSel] = useState<Organ>('liver')
  const [stage, setStage] = useState(0)
  const organ = ORGANS.find((o) => o.id === sel)!

  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 min-[520px]:grid-cols-[170px_1fr]">
      <svg viewBox={BODY_VIEWBOX} className="h-auto w-full self-start" role="img" aria-label={`Kehokartta, valittuna ${organ.label}.`}>
        <BodySilhouette view="front" mergeTrunk />
        {ORGANS.map((o) => (
          <motion.g key={o.id} initial={false} animate={{ opacity: o.id === sel ? 1 : 0.7 }} style={{ cursor: 'pointer' }} onClick={() => setSel(o.id)}>
            <OrganShape id={o.id} on={o.id === sel} />
          </motion.g>
        ))}
      </svg>

      <div className="min-w-0">
        <div className="flex flex-col gap-1" role="tablist" aria-label="Elinjärjestelmät">
          {ORGANS.map((o) => {
            const on = o.id === sel
            return (
              <button
                key={o.id}
                role="tab"
                aria-selected={on}
                onClick={() => setSel(o.id)}
                className={`min-h-[40px] rounded-lg px-3 text-left text-[13px] font-medium leading-tight transition-colors duration-150 ${
                  on ? 'bg-brand-500/12 font-semibold text-brand-600' : 'text-[var(--text-dim)]'
                }`}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      </div>

      <FadeSwap k={sel} className="col-span-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        <p className="font-display text-[15px] font-semibold">{organ.label}</p>
        <p className="mt-1 text-[13.5px] leading-relaxed">{organ.text}</p>
        {sel === 'liver' && (
          <div className="mt-3">
            <div className="grid grid-cols-3 gap-1.5">
              {LIVER_STAGES.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setStage(i)}
                  className={`min-h-[44px] rounded-lg border px-1.5 text-[12px] font-semibold leading-tight transition-colors duration-150 ${
                    i <= stage ? 'border-brand-500/50 bg-brand-500/12 text-brand-600' : 'border-[var(--border)] text-[var(--text-dim)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg)]">
              <motion.div className="h-full rounded-full bg-brand-500" initial={false} animate={{ width: `${((stage + 1) / 3) * 100}%` }} transition={{ type: 'spring', duration: 0.5, bounce: 0 }} />
            </div>
          </div>
        )}
      </FadeSwap>
    </div>
  )
}
