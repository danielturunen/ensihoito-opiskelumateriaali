import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { NumberField, Result, Segmented, svg } from '../ui'
import { Stage, rc } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'

/* Intranasal administration (articles Fentanyyli, Naloksoni, Midatsolaami, S-ketamiini; Ensihoito-opas,
 * Akuuttihoidon lääkkeet 2025). Under 0.5 ml per nostril is optimal (at most 1 ml), larger volumes are split
 * into several rounds and the atomiser wastes about 0.1 ml. Always check the regional instruction. */

type Drug = 'fenta' | 'nalox' | 'mida' | 'esket'

interface Out {
  dose: number
  unit: string
  conc: number // per ml, same unit
  note?: string
  consult?: boolean
}

const DRUGS: Record<Drug, { label: string; concLabel: string; calc: (kg: number, old: boolean) => Out }> = {
  fenta: {
    label: 'Fentanyyli',
    concLabel: '50 µg/ml',
    calc: (kg, old) => ({ dose: Math.min(200, Math.round((old ? 1 : 2) * kg)), unit: 'µg', conc: 50, note: old ? 'Yli 70-vuotiaalle 1 µg/kg.' : '2 µg/kg, enintään 200 µg. Lisäannos puolet aloitusannoksesta 5 min kuluttua.' }),
  },
  nalox: {
    label: 'Naloksoni',
    concLabel: '0,4 mg/ml',
    calc: (kg) => (kg >= 40 ? { dose: 0.4, unit: 'mg', conc: 0.4, note: 'Aikuiselle 0,4 mg i.n., jos suoniyhteyttä ei saada. Nenään tarvitaan suurempi annos kuin suoneen.' } : { dose: Math.round(kg * 0.01 * 100) / 100, unit: 'mg', conc: 0.4, note: 'Lapselle 0,01 mg/kg, toistaen 2–3 min välein suurenevin annoksin (enintään 2 mg).' }),
  },
  mida: {
    label: 'Midatsolaami',
    concLabel: '5 mg/ml',
    calc: (kg) => ({ dose: kg <= 10 ? 2.5 : kg <= 20 ? 5 : kg <= 40 ? 7.5 : 10, unit: 'mg', conc: 5, note: 'Painon mukaan: 5–10 kg 2,5 mg, 11–20 kg 5 mg, 21–40 kg 7,5 mg, yli 40 kg 10 mg. Limaiselle sama annos lihakseen.' }),
  },
  esket: {
    label: 'Esketamiini',
    concLabel: '25 mg/ml',
    calc: (kg) => (kg >= 40 ? { dose: 50, unit: 'mg', conc: 25, note: 'Akuuttihoidon lääkkeet 25–50 mg i.n. (Ensihoito-opas 50–100 mg). Laskelma enimmäisannoksella 50 mg.' } : { dose: 0, unit: 'mg', conc: 25, consult: true, note: 'Lasten annoksista konsultoidaan.' }),
  },
}

const fmt = (n: number, d = 2) => n.toFixed(d).replace(/\.?0+$/, '').replace('.', ',')

export default function IntranasalDose(props: WidgetProps) {
  const [drug, setDrug] = useState<Drug>((['fenta', 'nalox', 'mida', 'esket'] as Drug[]).includes(props.initial as Drug) ? (props.initial as Drug) : 'fenta')
  const [kg, setKg] = useState(70)
  const [old, setOld] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0.5)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 2.4))

  const d = DRUGS[drug]
  const o = d.calc(kg, old)
  const vol = o.consult ? 0 : o.dose / o.conc
  const draw = vol + 0.1
  const rounds = Math.max(1, Math.ceil(vol / 1 - 1e-9))
  const perNostril = vol / (2 * rounds)
  const spray = t < 1.2

  return (
    <div ref={ref}>
      <Segmented
        layoutId="in-drug"
        size="sm"
        value={drug}
        onChange={setDrug}
        options={[
          { value: 'fenta', label: 'Fentanyyli' },
          { value: 'nalox', label: 'Naloksoni' },
          { value: 'mida', label: 'Midatsolaami' },
          { value: 'esket', label: 'Esketamiini' },
        ]}
      />
      <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
        <NumberField label="Paino" value={kg} onChange={setKg} min={5} max={150} step={1} unit="kg" />
        {drug === 'fenta' && (
          <button onClick={() => setOld((v) => !v)} aria-pressed={old} className={`min-h-[44px] rounded-xl border px-3 text-[13px] font-semibold ${old ? 'border-transparent bg-[var(--text)] text-[var(--bg)]' : 'border-[var(--border)] text-[var(--text)]'}`}>
            Yli 70 v
          </button>
        )}
      </div>

      <Stage className="mt-3">
        <svg viewBox="0 0 340 196" className="h-auto w-full" role="img" aria-label={o.consult ? 'Lasten annoksesta konsultoidaan.' : `${d.label} ${fmt(o.dose)} ${o.unit} = ${fmt(vol)} ml, ${rounds} antokerta(a), ${fmt(perNostril)} ml sierainta kohden.`}>
          {/* face profile */}
          <path d="M150 20C110 20 92 52 96 86C98 98 92 104 84 112C80 118 86 122 92 122C94 130 92 138 98 144C104 150 116 150 120 162C124 176 130 188 150 192" fill={svg.raised} stroke={svg.line} strokeWidth={1.6} />
          <path d="M150 20C190 24 214 60 210 110C206 150 186 186 150 192" fill={svg.raised} stroke="none" />
          <ellipse cx={98} cy={116} rx={5} ry={3} fill={rc.mucosa} opacity={0.7} />
          {/* nasal mucosa */}
          <path d="M104 112C116 104 132 98 148 98" fill="none" stroke={rc.mucosa} strokeWidth={6} strokeLinecap="round" opacity={0.45} />

          {/* atomiser */}
          <g transform="translate(26 136) rotate(-28)">
            <rect x={0} y={-7} width={56} height={14} rx={3} fill={svg.surface} stroke={svg.dim} strokeWidth={1.3} />
            <rect x={4} y={-5} width={Math.min(48, (draw / 4.2) * 48)} height={10} rx={2} fill={svg.tealSoft} />
            <path d="M56 -4L70 -2L70 2L56 4Z" fill={svg.dim} />
            <rect x={-14} y={-3} width={14} height={6} rx={1} fill={svg.dim} />
          </g>
          {/* mist */}
          {!o.consult &&
            spray &&
            Array.from({ length: 10 }, (_, i) => {
              const ph = ((t * 1.6 + i / 10) % 1)
              const ang = -0.75 + (i % 5) * 0.09
              return <circle key={i} cx={86 + Math.cos(ang) * ph * 46} cy={110 + Math.sin(ang) * ph * 30} r={1.6 + ph * 1.6} fill={svg.teal} opacity={0.7 * (1 - ph)} />
            })}

          {/* nostril bars */}
          {!o.consult && (
            <g transform="translate(236 40)">
              <text x={0} y={-12} fontSize={10.5} fontWeight={600} fill={svg.ink}>
                sierainta kohden
              </text>
              {[0, 1].map((n) => (
                <g key={n} transform={`translate(${n * 46} 0)`}>
                  <rect x={0} y={0} width={30} height={110} rx={6} fill={svg.surface} stroke={svg.line} />
                  <rect x={2} y={108 - Math.min(1, perNostril) * 106} width={26} height={Math.min(1, perNostril) * 106} rx={4} fill={perNostril > 0.5 ? svg.dangerSoft : svg.tealSoft} />
                  <text x={15} y={124} textAnchor="middle" fontSize={10} fill={svg.dim}>
                    {n ? 'oikea' : 'vasen'}
                  </text>
                </g>
              ))}
              <path d="M-4 55H80" stroke={svg.teal} strokeDasharray="3 3" />
              <text x={84} y={58} fontSize={9.5} fill={svg.teal}>
                0,5
              </text>
              <path d="M-4 2H80" stroke={svg.danger} strokeDasharray="3 3" />
              <text x={84} y={5} fontSize={9.5} fill={svg.danger}>
                1 ml
              </text>
            </g>
          )}
        </svg>
      </Stage>

      <div className="mt-3">
        {o.consult ? (
          <Result tone="warning" title={`${d.label}: konsultoi`}>
            {o.note}
          </Result>
        ) : (
          <Result tone={rounds > 1 ? 'warning' : 'ok'} title={`${d.label} ${fmt(o.dose)} ${o.unit} = ${fmt(vol)} ml (${d.concLabel})`}>
            Vedä ruiskuun {fmt(draw)} ml (atomisaattorin hukka noin 0,1 ml).{' '}
            {rounds > 1
              ? `Määrä on suuri: jaa ${rounds} antokertaan, jolloin sierainta kohden noin ${fmt(perNostril)} ml kerrallaan.`
              : `Jaa molempiin sieraimiin – noin ${fmt(perNostril)} ml sierainta kohden.`}{' '}
            {o.note}
          </Result>
        )}
      </div>
      <p className="mt-2 text-[12px] leading-snug text-[var(--text-dim)]">
        Optimaalinen määrä on alle 0,5 ml sierainta kohden, enintään 1 ml. Runsas nenäerite tai veri tekee imeytymisestä epävarmaa – silloin valitaan toinen antoreitti. Annokset tarkistetaan aina alueellisesta hoito-ohjeesta.
      </p>
    </div>
  )
}
