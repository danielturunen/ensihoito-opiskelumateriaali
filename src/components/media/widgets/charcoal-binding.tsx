import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { Result, Segmented, svg } from '../ui'
import { Stage, rc, smoothstep } from '../parts/resp-kit'
import { seeded, useFrameLoop } from '../parts/cardio-hooks'

/* Activated charcoal binds a drug in the gut before it is absorbed (articles Lääkehiili, Intoksikaatiopotilaan
 * hoito; Akuuttihoidon lääkkeet 2025). It works best within an hour, does nothing to what is already absorbed
 * and does not bind alcohols, lithium, iron, acids or alkalis. Molecule counts are schematic. */

type Agent = 'drug' | 'alcohol' | 'lithium'
type When = 'early' | 'late'

const N = 12
const rnd = seeded(23)
const START = Array.from({ length: N }, () => [40 + rnd() * 260, 38 + rnd() * 50] as const)
const BLOOD = Array.from({ length: N }, (_, i) => [30 + ((i * 26 + rnd() * 10) % 280), 142 + rnd() * 16] as const)
const CHARCOAL = [
  [92, 62],
  [178, 54],
  [262, 66],
]

const AGENTS: Record<Agent, { label: string; binds: boolean; note: string }> = {
  drug: { label: 'Lääkeaine (esim. parasetamoli)', binds: true, note: 'Parasetamolimyrkytyksessä annetaan lääkehiiltä, jos ottamisesta on kulunut vähän aikaa (noin 1–2 h), ja potilas kuljetetaan nopeasti sairaalaan vastalääkehoitoon.' },
  alcohol: { label: 'Alkoholi', binds: false, note: 'Alkoholit (etanoli, metanoli, etyleeniglykoli) eivät juuri sitoudu lääkehiileen – hiilestä ei ole hyötyä.' },
  lithium: { label: 'Litium tai rauta', binds: false, note: 'Metallit (rauta, litium) eivät juuri sitoudu lääkehiileen. Myöskään hapot, emäkset, liuottimet, petrolituotteet, fluoridi ja syanidi eivät sitoudu.' },
}

function Charcoal({ x, y, o }: { x: number; y: number; o: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <path d="M-14 -4C-14 -12 -4 -14 2 -12C10 -14 16 -6 14 2C16 10 6 14 0 12C-8 14 -16 8 -14 -4Z" fill="#2b2b2b" stroke="#555" />
      {[
        [-6, -4],
        [4, -6],
        [6, 4],
        [-4, 6],
      ].map(([a, b], i) => (
        <circle key={i} cx={a} cy={b} r={2} fill="#555" />
      ))}
    </g>
  )
}

export default function CharcoalBinding(_props: WidgetProps) {
  const [agent, setAgent] = useState<Agent>('drug')
  const [when, setWhen] = useState<When>('early')
  const [given, setGiven] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(5)
  const LOOP = 8
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % LOOP))

  const a = AGENTS[agent]
  const pre = when === 'late' ? 6 : 1 // already absorbed before charcoal arrives
  const canBind = given && a.binds
  const bound = canBind ? N - pre - 1 : 0
  const absorbed = N - bound
  const showCharcoal = given ? smoothstep(0.2, 1.2, t) : 0

  return (
    <div ref={ref}>
      <div className="grid gap-2">
        <Segmented
          layoutId="charcoal-agent"
          size="sm"
          value={agent}
          onChange={setAgent}
          options={[
            { value: 'drug', label: 'Lääkeaine' },
            { value: 'alcohol', label: 'Alkoholi' },
            { value: 'lithium', label: 'Litium, rauta' },
          ]}
        />
        <div className="flex gap-2">
          <Segmented
            layoutId="charcoal-when"
            size="sm"
            value={when}
            onChange={setWhen}
            options={[
              { value: 'early', label: 'Alle 1 h' },
              { value: 'late', label: '3–6 h' },
            ]}
          />
          <button
            onClick={() => setGiven((g) => !g)}
            aria-pressed={given}
            className={`min-h-[40px] flex-1 rounded-xl border px-3 text-[13px] font-semibold ${given ? 'border-transparent bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] text-[var(--text)]'}`}
          >
            {given ? 'Lääkehiili annettu' : 'Anna lääkehiili'}
          </button>
        </div>
      </div>

      <Stage className="mt-3">
        <svg viewBox="0 0 340 196" className="h-auto w-full" role="img" aria-label={`${a.label}: ${absorbed} / ${N} imeytyy verenkiertoon.`}>
          <text x={10} y={20} fontSize={10.5} fill={svg.dim}>
            mahalaukku ja suoli
          </text>
          <rect x={10} y={26} width={320} height={80} rx={14} fill={svg.raised} stroke={svg.line} />
          <rect x={10} y={110} width={320} height={10} rx={3} fill={rc.mucosaSoft} stroke={rc.mucosa} />
          <text x={10} y={136} fontSize={10.5} fill={svg.dim}>
            verenkierto
          </text>
          <rect x={10} y={140} width={320} height={22} rx={10} fill={rc.oxy} fillOpacity={0.12} stroke={rc.oxy} strokeOpacity={0.4} />

          {CHARCOAL.map(([x, y], i) => (
            <Charcoal key={i} x={x} y={y} o={showCharcoal} />
          ))}

          {START.map(([sx0, sy0], i) => {
            const isPre = i < pre
            const isBound = !isPre && i < pre + bound
            let x: number = sx0
            let y: number = sy0
            if (isPre) {
              x = 30 + ((BLOOD[i][0] - 30 + t * 18) % 280)
              y = BLOOD[i][1]
            } else if (isBound) {
              const ch = CHARCOAL[i % 3]
              const k = smoothstep(1.2, 3, t)
              const ang = (i * 1.9) % (Math.PI * 2)
              x = sx0 + (ch[0] + Math.cos(ang) * 15 - sx0) * k
              y = sy0 + (ch[1] + Math.sin(ang) * 13 - sy0) * k
            } else {
              const k = smoothstep(1.5 + (i % 5) * 0.5, 3.5 + (i % 5) * 0.5, t)
              const [bx, by] = BLOOD[i]
              x = sx0 + (bx - sx0) * k
              y = sy0 + (by - sy0) * k
            }
            return <circle key={i} cx={x} cy={y} r={4.2} fill={agent === 'drug' ? '#f8690a' : agent === 'alcohol' ? '#38bdf8' : '#a3a3a3'} stroke={svg.surface} strokeWidth={1} />
          })}

          <text x={10} y={186} fontSize={11} fontWeight={700} fill={absorbed > 6 ? svg.danger : svg.teal}>
            imeytyy: {absorbed} / {N}
          </text>
          <text x={330} y={186} textAnchor="end" fontSize={10} fill={svg.dim}>
            kaavamainen
          </text>
        </svg>
      </Stage>

      <div className="mt-3">
        {!a.binds ? (
          <Result tone="warning" title="Ei sitoudu lääkehiileen">
            {a.note}
          </Result>
        ) : !given ? (
          <Result tone="neutral" title="Ilman lääkehiiltä kaikki imeytyy">
            {a.note}
          </Result>
        ) : when === 'early' ? (
          <Result tone="ok" title="Annettu alle tunnissa – teho parhaimmillaan">
            Hiili sitoo suolistossa vielä olevan aineen. Aikuiselle 50 g (1 pullollinen) juottamalla; tajunnaltaan heikentyneelle vasta intubaation jälkeen letkun kautta.
          </Result>
        ) : (
          <Result tone="warning" title="Myöhään annettuna osa on jo imeytynyt">
            Jo imeytyneeseen aineeseen hiili ei vaikuta. Hyötyä voi silti olla, koska yliannokset imeytyvät usein hitaasti ja esimerkiksi monet psyykenlääkkeet hidastavat mahan tyhjenemistä.
          </Result>
        )}
      </div>
    </div>
  )
}
