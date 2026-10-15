import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Bullets, FadeSwap, Stage, StateTabs, rc, smoothstep } from '../parts/resp-kit'
import { seeded, useFrameLoop } from '../parts/cardio-hooks'

/* Fibrinolysis and the two drugs that push it in opposite directions (articles Tenekteplaasi, Alteplaasi,
 * Traneksaamihappo, Massiivinen verenvuoto; Akuuttihoidon lääkkeet 2025). Plasmin cuts fibrin: a thrombolytic
 * activates plasminogen to dissolve an occluding clot, tranexamic acid blocks plasmin so a haemostatic clot
 * holds. Timing is compressed and schematic. */

type Mode = 'thrombus' | 'lysis' | 'bleed' | 'txa'

const CFG: Record<Mode, { scene: 'occlusion' | 'leak'; dissolve: boolean; plasmin: 'few' | 'active' | 'blocked'; title: string; items: string[] }> = {
  thrombus: {
    scene: 'occlusion',
    dissolve: false,
    plasmin: 'few',
    title: 'Tukos suonessa',
    items: ['Fibriiniverkko ja siihen tarttuneet solut tukkivat valtimon – ST-nousuinfarktissa sepelvaltimon, keuhkoemboliassa keuhkovaltimon.', 'Elimistön oma fibrinolyysi ei riitä avaamaan tuoretta tukosta nopeasti.'],
  },
  lysis: {
    scene: 'occlusion',
    dissolve: true,
    plasmin: 'active',
    title: 'Liuotuslääke avaa tukoksen',
    items: [
      'Tenekteplaasi ja alteplaasi muuttavat plasminogeenin plasmiiniksi, joka pilkkoo hyytymän fibriiniä – tenekteplaasi sitoutuu nimenomaan hyytymän fibriiniin.',
      'ST-nousuinfarktissa liuotusta harkitaan, jos pallolaajennus ei toteudu riittävän nopeasti, ja se aloitetaan 10 minuutin kuluessa diagnoosista.',
      'Sama mekanismi liuottaa myös haavojen hyytymiä: tärkein haitta on verenvuoto, harvinaisimpana kallonsisäinen vuoto.',
    ],
  },
  bleed: {
    scene: 'leak',
    dissolve: true,
    plasmin: 'active',
    title: 'Vuoto: fibrinolyysi hajottaa hyytymän',
    items: ['Vakavassa vammassa fibrinolyysi lisääntyy: plasmiini hajottaa jo muodostuneen hyytymän, ja vuoto alkaa uudelleen.', 'Hyytymistekijöiden laimeneminen, kylmä ja happamuus pahentavat kierrettä.'],
  },
  txa: {
    scene: 'leak',
    dissolve: false,
    plasmin: 'blocked',
    title: 'Traneksaamihappo pitää hyytymän',
    items: [
      'Traneksaamihappo estää plasmiinin fibriiniä hajottavaa vaikutusta: hyytymä pysyy, mutta lääke ei tyrehdytä vuotoa itse.',
      'Vammapotilaalle 1 g i.v. mahdollisimman pian, viimeistään 3 tunnin kuluessa vammasta (lapsi 20 mg/kg).',
      'Osa vuodon hallintaa – kiristysside, lantiovyö, lämpö ja verituotteet ovat yhtä tärkeitä.',
    ],
  },
}

const CX = 178
const rnd = seeded(11)
// fibrin strands inside the clot region; each dissolves at its own threshold
const STRANDS = Array.from({ length: 48 }, () => {
  const a = rnd() * Math.PI
  const x = CX - 24 + rnd() * 48
  const y = 60 + rnd() * 78
  const len = 18 + rnd() * 22
  return { x1: x - Math.cos(a) * len * 0.5, y1: y - Math.sin(a) * len * 0.5, x2: x + Math.cos(a) * len * 0.5, y2: y + Math.sin(a) * len * 0.5, th: rnd() }
})
const TRAPPED = Array.from({ length: 16 }, () => ({ x: CX - 22 + rnd() * 44, y: 64 + rnd() * 70 }))
const LEAK_STRANDS = Array.from({ length: 14 }, () => {
  const a = rnd() * Math.PI
  const x = CX - 12 + rnd() * 24
  const y = 146 + rnd() * 18
  const len = 10 + rnd() * 10
  return { x1: x - Math.cos(a) * len * 0.5, y1: y - Math.sin(a) * len * 0.5, x2: x + Math.cos(a) * len * 0.5, y2: y + Math.sin(a) * len * 0.5, th: rnd() }
})
const FLOW = Array.from({ length: 12 }, () => ({ lane: 66 + rnd() * 66, off: rnd() }))

function Plasmin({ x, y, blocked, active }: { x: number; y: number; blocked: boolean; active: boolean }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <path d="M0 0L6 -4A7 7 0 1 0 6 4Z" fill={active ? '#8b5cf6' : svg.line} opacity={active ? 0.9 : 0.8} />
      {blocked && <circle cx={6} cy={0} r={3.6} fill={svg.teal} stroke={svg.surface} strokeWidth={1} />}
    </g>
  )
}

export default function Fibrinolysis(props: WidgetProps) {
  const [mode, setMode] = useState<Mode>((['thrombus', 'lysis', 'bleed', 'txa'] as Mode[]).includes(props.initial as Mode) ? (props.initial as Mode) : 'lysis')
  const c = CFG[mode]
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(4.5)
  const LOOP = 9
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % LOOP))
  const d = c.dissolve ? smoothstep(1.2, 6, t) : 0
  const open = c.scene === 'occlusion' ? smoothstep(0.55, 0.95, d) : 0
  const leak = c.scene === 'leak' ? smoothstep(0.5, 0.9, d) : 0

  const strands = c.scene === 'occlusion' ? STRANDS : LEAK_STRANDS
  const nPlasmin = c.plasmin === 'few' ? 2 : 6

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="fibrinolysis-mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'thrombus', label: 'Tukos' },
          { value: 'lysis', label: 'Liuotushoito' },
          { value: 'bleed', label: 'Vuoto' },
          { value: 'txa', label: 'Traneksaamihappo' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 340 214" className="h-auto w-full" role="img" aria-label={`${c.title}.`}>
          {/* vessel walls */}
          <rect x={6} y={44} width={328} height={10} rx={3} fill={rc.tissueSoft} stroke={rc.tissue} />
          {c.scene === 'occlusion' ? (
            <rect x={6} y={142} width={328} height={10} rx={3} fill={rc.tissueSoft} stroke={rc.tissue} />
          ) : (
            <g>
              <path d={`M6 142H${CX - 14}V152H6Z`} fill={rc.tissueSoft} stroke={rc.tissue} />
              <path d={`M${CX + 14} 142H334V152H${CX + 14}Z`} fill={rc.tissueSoft} stroke={rc.tissue} />
              <text x={CX} y={206} textAnchor="middle" fontSize={10.5} fill={svg.dim}>
                suonen seinämän vaurio
              </text>
            </g>
          )}

          {/* flowing blood */}
          {FLOW.map((f, i) => {
            let x: number
            if (c.scene === 'occlusion') {
              // blocked upstream unless the clot has opened
              const k = (f.off + t * 0.09) % 1
              x = 8 + k * 326
              if (open < 0.5 && x > CX - 34) {
                // no flow past the clot: cells queue upstream
                x = CX - 40 - (i % 6) * 15
              }
            } else {
              x = 8 + ((f.off + t * 0.09) % 1) * 326
            }
            return <ellipse key={i} cx={x} cy={f.lane} rx={7} ry={4.4} fill={rc.oxy} opacity={0.45} />
          })}

          {/* leak drops */}
          {c.scene === 'leak' &&
            leak > 0.05 &&
            [0, 1, 2].map((k) => {
              const ph = (t * 0.9 + k / 3) % 1
              return <circle key={k} cx={CX + (k - 1) * 5} cy={156 + ph * 34} r={3.4} fill={rc.oxy} opacity={leak * (1 - ph)} />
            })}

          {/* clot: trapped cells and fibrin */}
          {c.scene === 'occlusion' &&
            TRAPPED.map((r, i) => <ellipse key={i} cx={r.x} cy={r.y} rx={6.5} ry={4.2} fill={rc.clot} opacity={0.75 * (1 - open)} />)}
          {strands.map((s, i) => {
            const gone = d > s.th * 0.9 + 0.05
            return <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#e8e2c8" strokeWidth={1.8} strokeLinecap="round" opacity={gone ? 0 : 0.9} style={{ transition: 'opacity 300ms ease-out' }} />
          })}

          {/* plasmin / plasminogen around the clot */}
          {Array.from({ length: nPlasmin }, (_, i) => {
            const a = t * 0.8 + (i / nPlasmin) * Math.PI * 2
            const cy = c.scene === 'occlusion' ? 98 : 150
            const rr = c.scene === 'occlusion' ? 36 : 22
            return <Plasmin key={i} x={CX + Math.cos(a) * rr} y={cy + Math.sin(a) * rr * 0.75} active={c.plasmin !== 'few'} blocked={c.plasmin === 'blocked'} />
          })}

          {/* legend */}
          <g transform="translate(10 22)">
            <path d="M0 0L6 -4A7 7 0 1 0 6 4Z" fill="#8b5cf6" transform="translate(4 0)" />
            <text x={18} y={4} fontSize={10.5} fill={svg.ink}>
              plasmiini
            </text>
            <line x1={86} y1={0} x2={104} y2={0} stroke="#e8e2c8" strokeWidth={2} strokeLinecap="round" />
            <text x={110} y={4} fontSize={10.5} fill={svg.ink}>
              fibriini
            </text>
            {c.plasmin === 'blocked' && (
              <g>
                <circle cx={168} cy={0} r={3.6} fill={svg.teal} />
                <text x={176} y={4} fontSize={10.5} fill={svg.ink}>
                  traneksaamihappo
                </text>
              </g>
            )}
          </g>
          {c.scene === 'occlusion' && (
            <text x={334} y={174} textAnchor="end" fontSize={11} fontWeight={700} fill={open > 0.5 ? svg.teal : svg.danger}>
              {open > 0.5 ? 'virtaus palautuu' : 'suoni tukossa'}
            </text>
          )}
          {c.scene === 'leak' && (
            <text x={334} y={174} textAnchor="end" fontSize={11} fontWeight={700} fill={leak > 0.3 ? svg.danger : svg.teal}>
              {leak > 0.3 ? 'vuoto jatkuu' : 'hyytymä pitää'}
            </text>
          )}
        </svg>
      </Stage>
      <FadeSwap k={mode} className="mt-3">
        <p className="mb-1.5 font-display text-[15px] font-semibold text-[var(--text)]">{c.title}</p>
        <Bullets items={c.items} />
      </FadeSwap>
    </div>
  )
}
