import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Bullets, FadeSwap, Stage, StateTabs, rc, spring } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'

/* Infusion fluids and tonicity (articles Natriumkloridi 0,9 %, Ringerin liuos, Glukoosi G10, Pään vamma;
 * Akuuttihoitotyön opas Hypovolemian arviointi ja hoito 2024). Isotonic fluid stays outside the cells, hypotonic
 * fluid moves water into the cells and hypertonic fluid draws water out. Volumes are schematic. */

type Fluid = 'iso' | 'hypo' | 'hyper'

const CFG: Record<Fluid, { cell: number; plasma: number; water: -1 | 0 | 1; title: string; examples: string; items: string[] }> = {
  iso: {
    cell: 1,
    plasma: 1.25,
    water: 0,
    title: 'Isotoninen',
    examples: 'NaCl 0,9 %, Ringerin liuos',
    items: [
      'Ei muuta veren osmolaliteettia: neste lisää solunulkoista tilaa annetun määrän verran, eivätkä solut turpoa tai kutistu.',
      'Hypovolemian ja sokin nesteytykseen sekä aivovammapotilaalle – tavoitteena normovolemia ilman ylinesteytystä.',
      'Verenvuoto korvataan ensisijaisesti verituotteilla: kristalloidi ei kuljeta happea eikä hyytymistekijöitä.',
    ],
  },
  hypo: {
    cell: 1.3,
    plasma: 1.05,
    water: 1,
    title: 'Hypotoninen',
    examples: 'NaCl 0,45 %, 5-prosenttinen glukoosi',
    items: [
      'Vesi siirtyy soluihin, jolloin solut turpoavat ja solunulkoinen tila pienenee. Voimakkaasti hypotoniset nesteet hajottavat punasoluja.',
      'Aivovammassa hypotoniset nesteet voivat aiheuttaa hyponatremiaa ja pahentaa aivoturvotusta.',
      'Glukoosipitoisia nesteitä ei käytetä hypovolemian korjaukseen – vain energiantarpeeseen ja hypoglykemiaan.',
    ],
  },
  hyper: {
    cell: 0.78,
    plasma: 1.35,
    water: -1,
    title: 'Hypertoninen',
    examples: 'esim. 3–7,5-prosenttinen NaCl',
    items: [
      'Vetää vettä soluista: solunulkoinen tila kasvaa ja solunsisäinen pienenee.',
      'Hypertonista keittosuolaa voidaan käyttää hoito-ohjeen mukaan osmoottisena hoitona kohonneessa kallonsisäisessä paineessa. Vammapotilaan perusnesteytykseen hypertoniset liuokset eivät sovi: ne aiheuttavat helposti hypernatremiaa.',
    ],
  },
}

const CELLS = [
  [70, 150],
  [150, 160],
  [230, 148],
  [300, 162],
]

export default function Tonicity(props: WidgetProps) {
  const [fluid, setFluid] = useState<Fluid>((['iso', 'hypo', 'hyper'] as Fluid[]).includes(props.initial as Fluid) ? (props.initial as Fluid) : 'iso')
  const c = CFG[fluid]
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 2))

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="tonicity-fluid"
        value={fluid}
        onChange={setFluid}
        gridOnly
        options={[
          { value: 'iso', label: 'Isotoninen' },
          { value: 'hypo', label: 'Hypotoninen' },
          { value: 'hyper', label: 'Hypertoninen' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 340 218" className="h-auto w-full" role="img" aria-label={`${c.title} neste: solut ${c.cell > 1.05 ? 'turpoavat' : c.cell < 0.95 ? 'kutistuvat' : 'ennallaan'}.`}>
          {/* infusion bag */}
          <g transform="translate(26 14)">
            <rect x={0} y={0} width={34} height={46} rx={6} fill={svg.airSoft} stroke={svg.air} strokeWidth={1.4} />
            <path d="M17 46v22" stroke={svg.air} strokeWidth={2} />
            <text x={44} y={18} fontSize={11} fontWeight={700} fill={svg.ink}>
              {c.title}
            </text>
            <text x={44} y={33} fontSize={10.5} fill={svg.dim}>
              {c.examples}
            </text>
          </g>

          {/* vessel (plasma volume) */}
          <motion.rect x={20} width={300} rx={14} fill={rc.oxy} fillOpacity={0.14} stroke={rc.oxy} strokeOpacity={0.5} initial={false} animate={{ y: 96 - 14 * c.plasma, height: 28 * c.plasma }} transition={spring} />
          <text x={326} y={70} textAnchor="end" fontSize={10.5} fill={svg.dim}>
            suonensisäinen tila
          </text>
          {[60, 120, 180, 240].map((x, i) => (
            <ellipse key={x} cx={20 + ((x + t * 60 + i * 13) % 300)} cy={96} rx={7} ry={4.4} fill={rc.oxy} opacity={0.55} />
          ))}

          {/* tissue cells */}
          <text x={14} y={194} fontSize={10.5} fill={svg.dim}>
            kudoksen solut
          </text>
          {CELLS.map(([x, y], i) => (
            <g key={i}>
              <motion.ellipse cx={x} cy={y} fill={rc.tissueSoft} stroke={rc.tissue} strokeWidth={1.4} initial={false} animate={{ rx: 22 * c.cell, ry: 16 * c.cell }} transition={spring} />
              <circle cx={x} cy={y} r={4} fill={rc.tissue} opacity={0.7} />
              {c.water !== 0 &&
                [0, 1].map((k) => {
                  const ph = (t / 2 + k / 2) % 1
                  const dir = c.water
                  const yy = dir > 0 ? y - 34 + ph * 18 : y - 18 - ph * 18
                  return <path key={k} d={`M${x + (k ? 9 : -9)} ${yy}v-6M${x + (k ? 9 : -9) - 3} ${yy - (dir > 0 ? 0 : 6)}l3 ${dir > 0 ? 3 : -3}l3 ${dir > 0 ? -3 : 3}`} stroke="#38bdf8" strokeWidth={1.6} fill="none" opacity={1 - ph} strokeLinecap="round" />
                })}
            </g>
          ))}
          <text x={170} y={211} textAnchor="middle" fontSize={11} fontWeight={600} fill={c.water === 0 ? svg.teal : c.water > 0 ? svg.danger : svg.brand}>
            {c.water === 0 ? 'solut ennallaan' : c.water > 0 ? 'vesi soluihin – solut turpoavat' : 'vesi soluista – solut kutistuvat'}
          </text>
        </svg>
      </Stage>
      <FadeSwap k={fluid} className="mt-3">
        <Bullets items={c.items} />
      </FadeSwap>
      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3.5 py-3 text-[12.5px] leading-snug text-[var(--text)]">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Menetyksen korvaus (Akuuttihoitotyön opas)</p>
        <p>Oksennus ja mahaerite → NaCl 0,9 % (alkaloosi). Ripuli, suolisto-, sappi- ja haimaerite → Ringer (asidoosi). Verenvuoto → verituotteet.</p>
      </div>
    </div>
  )
}
