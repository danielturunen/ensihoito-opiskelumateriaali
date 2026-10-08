import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Ambulance, Check, Layers, Shirt, Thermometer } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Result, svg } from '../ui'
import { Stage, useLoop } from '../parts/resp-kit'

type Act = 'insulate' | 'wet' | 'cover' | 'warm'

const ACTS: { id: Act; label: string; sub: string; icon: typeof Layers; w: number }[] = [
  { id: 'insulate', label: 'Eristä alustasta', sub: 'kylmä maa vie lämpöä nopeammin kuin kylmä ilma', icon: Layers, w: 0.4 },
  { id: 'wet', label: 'Märät vaatteet pois', sub: 'kostea kangas jäähdyttää tehokkaammin', icon: Shirt, w: 0.25 },
  { id: 'cover', label: 'Peitä uudelleen', sub: 'paljasta vain tutkiessa', icon: Thermometer, w: 0.25 },
  { id: 'warm', label: 'Lämmitä hoitotila', sub: 'jo matkalla kohteeseen', icon: Ambulance, w: 0.1 },
]

const HEAT = '#f97316'
const COLD = '#38bdf8'

function Arrow({ x, y, dir, show, active, delay = 0, wavy = false }: { x: number; y: number; dir: 'down' | 'up'; show: boolean; active: boolean; delay?: number; wavy?: boolean }) {
  const d = wavy
    ? `M${x} ${y}c-5 -5 5 -8 0 -13s5 -8 0 -13m-6 6l6 -6 6 6`
    : dir === 'down'
      ? `M${x} ${y}v22m-6 -7l6 7 6 -7`
      : `M${x} ${y}v-22m-6 7l6 -7 6 7`
  return (
    <AnimatePresence>
      {show && (
        <motion.path
          d={d}
          fill="none"
          stroke={wavy ? COLD : HEAT}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={active ? { opacity: [0.3, 1, 0.3], y: dir === 'down' ? [0, 4, 0] : [0, -4, 0] } : { opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 1.6, repeat: active ? Infinity : 0, delay }}
        />
      )}
    </AnimatePresence>
  )
}

export default function HeatLoss(_props: WidgetProps) {
  const [done, setDone] = useState<Record<Act, boolean>>({ insulate: false, wet: false, cover: false, warm: false })
  const { ref, active } = useLoop<HTMLDivElement>()
  const loss = 1 - ACTS.reduce((a, x) => a + (done[x.id] ? x.w : 0), 0)
  const all = ACTS.every((x) => done[x.id])

  return (
    <div ref={ref}>
      <Stage>
        <svg viewBox="0 0 360 170" className="h-auto w-full" role="img" aria-label={`Maassa makaava potilas. Lämmönhukka ${loss > 0.6 ? 'suuri' : loss > 0.2 ? 'vähenee' : 'pieni'}.`}>
          {/* cold ground */}
          <rect x={0} y={128} width={360} height={42} fill="rgba(56,189,248,0.16)" />
          <text x={8} y={160} fontSize={11} fontWeight={600} fill={COLD}>
            kylmä maa
          </text>
          {/* insulation mat */}
          <AnimatePresence>
            {done.insulate && (
              <motion.rect key="mat" x={40} y={118} width={248} height={10} rx={4} fill="#a3a3a3" initial={{ opacity: 0, scaleX: 0.6 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0 }} style={{ transformOrigin: '164px 123px' }} />
            )}
          </AnimatePresence>
          {/* patient lying supine (head on the right) */}
          <g>
            <circle cx={274} cy={98} r={17} fill="rgba(217,160,124,0.45)" stroke={svg.dim} strokeWidth={1.5} />
            <path d="M64 92C64 84 72 80 84 80H248C256 80 258 88 258 96V108C258 114 254 118 248 118H74C68 118 64 114 64 108Z" fill={done.wet ? 'rgba(148,163,184,0.35)' : 'rgba(56,189,248,0.4)'} stroke={svg.dim} strokeWidth={1.5} />
            <path d="M40 98C40 94 44 92 50 92H70V112H50C44 112 40 110 40 106Z" fill="rgba(217,160,124,0.45)" stroke={svg.dim} strokeWidth={1.5} />
            {!done.wet && (
              <text x={160} y={104} textAnchor="middle" fontSize={11} fontWeight={700} fill={svg.ink}>
                märät vaatteet
              </text>
            )}
          </g>
          {/* blanket */}
          <AnimatePresence>
            {done.cover && (
              <motion.path
                key="blanket"
                d="M56 84C56 72 70 66 90 66H254C262 66 266 76 266 86V96H56Z"
                fill="rgba(248,105,10,0.35)"
                stroke={HEAT}
                strokeWidth={1.8}
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ type: 'spring', duration: 0.5, bounce: 0.1 }}
              />
            )}
          </AnimatePresence>

          {/* heat-loss arrows */}
          {[90, 140, 190, 240].map((x, i) => (
            <Arrow key={`g${x}`} x={x} y={124} dir="down" show={!done.insulate} active={active} delay={i * 0.2} />
          ))}
          {[112, 172, 232].map((x, i) => (
            <Arrow key={`w${x}`} x={x} y={74} dir="up" wavy show={!done.wet} active={active} delay={0.3 + i * 0.25} />
          ))}
          {[84, 142, 202, 262].map((x, i) => (
            <Arrow key={`c${x}`} x={x} y={74} dir="up" show={!done.cover} active={active} delay={0.5 + i * 0.25} />
          ))}
          <text x={8} y={18} fontSize={10.5} fill={svg.dim}>
            lämpöä karkaa
          </text>

          {/* loss meter */}
          <g transform="translate(316 10)">
            <rect x={0} y={0} width={20} height={100} rx={10} fill={svg.surface} stroke={svg.line} />
            <motion.rect x={2} width={16} rx={8} fill={loss > 0.6 ? '#ef4444' : loss > 0.2 ? HEAT : '#14b8a6'} initial={false} animate={{ y: 2 + 96 * (1 - loss), height: Math.max(6, 96 * loss) }} transition={{ type: 'spring', duration: 0.6, bounce: 0 }} />
            <text x={10} y={118} textAnchor="middle" fontSize={10} fill={svg.dim}>
              hukka
            </text>
          </g>
        </svg>
      </Stage>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {ACTS.map((a) => {
          const on = done[a.id]
          const Icon = a.icon
          return (
            <button
              key={a.id}
              onClick={() => setDone((s) => ({ ...s, [a.id]: !s[a.id] }))}
              aria-pressed={on}
              className={`flex min-h-[60px] items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.98] ${
                on ? 'border-teal-500 bg-teal-500/10' : 'border-[var(--border)] bg-[var(--bg-card)]'
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${on ? 'bg-teal-500 text-white' : 'bg-[var(--bg)] text-[var(--text-dim)]'}`}>
                {on ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold leading-tight">{a.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-[var(--text-dim)]">{a.sub}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3">
        {all ? (
          <Result tone="ok" title="Lämpötalous hoidettu">
            Lämpötalouden hoito on yhtä tärkeä toimenpide kuin suoniyhteyden avaaminen.
          </Result>
        ) : (
          <Result tone="warning" title="Kylmä potilas vuotaa pidempään">
            Hypotermia heikentää hyytymistä ja ruokkii kuoleman kolmiota (hypotermia, asidoosi, koagulopatia). Eristä alustasta ennen muita pitkäkestoisia toimenpiteitä.
          </Result>
        )}
      </div>
    </div>
  )
}
