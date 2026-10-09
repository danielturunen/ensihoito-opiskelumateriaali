import { useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg, type Tone } from '../ui'

/* Histamine-mediated (allergic reaction / anaphylaxis) vs bradykinin-mediated swelling
 * (HAE, ACE-inhibitor angioedema). Pick a drug and see whether the capillary leak stops.
 * Facts: Akuuttihoito-opas 2025 (Kekki: anafylaksia; Hyry: HAE). */

type Mode = 'hist' | 'brady'
type Effect = 'works' | 'partial' | 'none'

interface Drug {
  id: string
  label: string
  effect: Effect
  text: string
}

const MODES: Record<Mode, { label: string; source: string; intro: string; drugs: Drug[] }> = {
  hist: {
    label: 'Histamiini',
    source: 'Syöttösolu',
    intro:
      'Allerginen reaktio ja anafylaksia: syöttösolut ja basofiilit vapauttavat histamiinia ja muita välittäjäaineita. Suonet laajenevat ja vuotavat, keuhkoputket ja suolen sileä lihas supistuvat. Iho-oireet (kutina, nokkosihottuma) 80–90 %:ssa.',
    drugs: [
      {
        id: 'adr',
        label: 'Adrenaliini i.m.',
        effect: 'works',
        text: 'Tehokkain ja nopeimmin vaikuttava lääke. Bronkusobstruktio laukeaa yleensä 5–10 minuutissa; annos voidaan uusia 5–15 minuutin kuluttua. Anafylaksiassa ei absoluuttisia vasta-aiheita.',
      },
      {
        id: 'ah',
        label: 'Antihistamiini',
        effect: 'partial',
        text: 'Vaikutus tulee hitaasti (30–45 min). Lievittää ihottumaa ja kutinaa, mutta ei auta hengitysteiden obstruktioon eikä hypotensioon.',
      },
      {
        id: 'cs',
        label: 'Kortisoni',
        effect: 'partial',
        text: 'Vaikutus alkaa hitaasti, eikä se korvaa adrenaliinia vaikeassa reaktiossa.',
      },
      {
        id: 'salb',
        label: 'Salbutamoli',
        effect: 'partial',
        text: 'Avaa bronkusobstruktiota, mutta ei auta nielun tai kurkunpään tukoksessa eikä hypotensiossa.',
      },
    ],
  },
  brady: {
    label: 'Bradykiniini',
    source: 'Bradykiniini',
    intro:
      'HAE (C1-esteraasin estäjän puutos) ja ACE:n estäjän aiheuttama turvotus: bradykiniini lisää suonten vuotoa. Ei kutinaa eikä nokkosihottumaa. Turvotus kasvoissa, raajoissa, kielessä ja huulissa, harvemmin nielussa; vatsaoireet voivat muistuttaa akuuttia vatsaa.',
    drugs: [
      {
        id: 'ah',
        label: 'Antihistamiini',
        effect: 'none',
        text: 'Ei hyötyä HAE-kohtauksessa. Jos potilas vastaa antihistamiiniin tai kortisoniin, syy on todennäköisesti muu.',
      },
      {
        id: 'cs',
        label: 'Kortisoni',
        effect: 'none',
        text: 'Ei hyötyä HAE-kohtauksessa – allergialääkkeet eivät tehoa, vaan tarvitaan HAE-taudin omia lääkkeitä.',
      },
      {
        id: 'ica',
        label: 'Ikatibantti 30 mg s.c.',
        effect: 'works',
        text: 'Salpaa bradykiniinin B2-reseptorin. Oireet alkavat lievittyä 30–120 minuutissa. Monella HAE-potilaalla on lääke mukana, ja kohtaus hoidetaan heti ensioireisiin, koska varhain annettuna se tehoaa parhaiten.',
      },
      {
        id: 'c1',
        label: 'C1-inhibiittori i.v.',
        effect: 'works',
        text: 'Korvaa puuttuvaa C1-esteraasin estäjää (esim. Berinert 20 ky/kg i.v.). Oireet lievittyvät 30–60 minuutissa, ja vaikutus kestää useita päiviä.',
      },
    ],
  },
}

const effectTone: Record<Effect, Tone> = { works: 'ok', partial: 'warning', none: 'danger' }
const effectTitle: Record<Effect, string> = { works: 'Tehoaa', partial: 'Vain osittain', none: 'Ei tehoa' }

const GAPS = [96, 160, 224]

export default function Angioedema() {
  const [mode, setMode] = useState<Mode>('hist')
  const [drug, setDrug] = useState<string | null>(null)
  const reduce = useReducedMotion()
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { amount: 0.3 })

  const m = MODES[mode]
  const chosen = m.drugs.find((d) => d.id === drug) ?? null
  const stopped = chosen?.effect === 'works'
  const animate = !reduce && inView && !stopped
  const mediatorColor = mode === 'hist' ? svg.brand : '#8b5cf6'

  return (
    <div>
      <Segmented
        layoutId="angioedema"
        value={mode}
        onChange={(v) => {
          setMode(v)
          setDrug(null)
        }}
        options={[
          { value: 'hist', label: 'Histamiini (allergia)' },
          { value: 'brady', label: 'Bradykiniini (HAE)' },
        ]}
      />

      <svg ref={ref} viewBox="0 0 320 150" className="mt-3 h-auto w-full" role="img" aria-label={`${m.label} lisää hiussuonen vuotoa kudokseen${stopped ? ' – valittu lääke pysäyttää vuodon' : ''}`}>
        <rect x={4} y={4} width={312} height={142} rx={14} fill="rgba(222,138,162,0.10)" stroke={svg.line} strokeWidth={1} />
        {/* source cell */}
        <g aria-hidden>
          <circle cx={46} cy={40} r={20} fill={mode === 'hist' ? svg.brandSoft : 'rgba(139,92,246,0.18)'} stroke={mediatorColor} strokeWidth={2} />
          {mode === 'hist' ? (
            [
              [-8, -6],
              [4, -10],
              [9, 2],
              [-2, 6],
              [-10, 6],
              [6, 10],
            ].map(([dx, dy], i) => <circle key={i} cx={46 + dx} cy={40 + dy} r={2.6} fill={mediatorColor} />)
          ) : (
            <text x={46} y={44} fontSize={12} fontWeight={700} textAnchor="middle" fill={mediatorColor}>
              BK
            </text>
          )}
        </g>
        <text x={74} y={30} fontSize={11} fill={svg.ink} fontWeight={600}>
          {m.source}
        </text>
        <text x={312} y={22} fontSize={11} fill={svg.dim} textAnchor="end">
          turvotus kudoksessa
        </text>

        {/* capillary */}
        <rect x={16} y={96} width={288} height={30} rx={15} fill={svg.dangerSoft} />
        {/* top wall with endothelial gaps that close when the leak stops */}
        {[16, ...GAPS].map((x0, i) => {
          const x1 = i < GAPS.length ? GAPS[i] : 304
          const start = i === 0 ? x0 + 12 : x0
          return (
            <motion.line
              key={i}
              y1={96}
              y2={96}
              stroke={svg.danger}
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={false}
              animate={{ x1: i === 0 ? start : start + (stopped ? 0 : 7), x2: i < GAPS.length ? x1 - (stopped ? 0 : 7) : x1 - 12 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0 }}
            />
          )
        })}
        <line x1={28} y1={126} x2={292} y2={126} stroke={svg.danger} strokeWidth={2.5} strokeLinecap="round" />
        <text x={160} y={115} fontSize={11} fill={svg.danger} textAnchor="middle" fontWeight={600}>
          hiussuoni
        </text>

        {/* mediator travelling to the vessel wall */}
        {GAPS.map((gx, i) => (
          <motion.circle
            key={`m${mode}${i}`}
            r={2.6}
            fill={mediatorColor}
            initial={{ cx: 52, cy: 56, opacity: 0 }}
            animate={animate ? { cx: [52, gx], cy: [56, 90], opacity: [0, 1, 0] } : { cx: gx, cy: 90, opacity: reduce && !stopped ? 1 : 0 }}
            transition={animate ? { duration: 1.6, repeat: Infinity, delay: i * 0.45, ease: 'easeIn' } : { duration: 0.2 }}
          />
        ))}

        {/* plasma leaking out of the gaps */}
        {GAPS.flatMap((gx, i) =>
          [0, 1].map((k) => (
            <motion.circle
              key={`p${i}${k}`}
              r={3.4}
              fill="rgba(250,204,21,0.7)"
              stroke="#d9a400"
              strokeWidth={1}
              initial={{ cx: gx, cy: 96, opacity: 0 }}
              animate={
                animate
                  ? { cx: [gx, gx + (k ? 14 : -12)], cy: [96, 50], opacity: [0, 1, 0] }
                  : { cx: gx + (k ? 10 : -9), cy: 66, opacity: reduce && !stopped ? 0.9 : 0 }
              }
              transition={animate ? { duration: 2, repeat: Infinity, delay: 0.8 + i * 0.4 + k, ease: 'easeOut' } : { duration: 0.3 }}
            />
          )),
        )}
      </svg>

      <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-dim)]">{m.intro}</p>

      <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Kokeile lääkettä</p>
      <div className="grid grid-cols-2 gap-1.5">
        {m.drugs.map((d) => {
          const active = d.id === drug
          return (
            <button
              key={d.id}
              onClick={() => setDrug(active ? null : d.id)}
              aria-pressed={active}
              className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-[13px] font-medium leading-snug transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] ${
                active ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text)]'
              }`}
            >
              {d.label}
            </button>
          )
        })}
      </div>

      <div className="mt-3">
        {chosen ? (
          <Result tone={effectTone[chosen.effect]} title={`${chosen.label}: ${effectTitle[chosen.effect]}`}>
            {chosen.text}
          </Result>
        ) : (
          <Result tone="neutral" title="Valitse lääke">
            Pysähtyykö vuoto hiussuonesta kudokseen?
          </Result>
        )}
      </div>
    </div>
  )
}
