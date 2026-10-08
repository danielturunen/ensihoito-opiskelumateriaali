import { useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Caption, Segmented, svg, toneSurface, toneText, type Tone } from '../ui'

/* One ECG complex that morphs through the stages of ischaemia, plus the special patterns
 * that hide an occlusion (Kettunen: EKG-tulkintaa – iskemiatulkinta, Duodecim webinaari 2024).
 * Every complex is built from the same command list so motion can interpolate the path. */

type Mode = 'stages' | 'patterns'

interface Beat {
  q: number // mm below baseline
  r: number
  s: number
  j: number // J point / ST level, + = elevation
  slope: number // early ST slope, + = up
  ta: number // first T extreme
  tb: number // second T extreme (biphasic)
}

interface Lead {
  name: string
  beat: Beat
}

interface Item {
  key: string
  label: string
  tone: Tone
  title: string
  text: string
  leads: Lead[]
}

const N: Beat = { q: 0.5, r: 9, s: 2, j: 0, slope: 0.3, ta: 3, tb: 0 }

const STAGES: Item[] = [
  { key: 'n', label: 'Normaali', tone: 'ok', title: 'Normaali kompleksi', text: 'ST-väli on perusviivan tasolla ja T-aalto positiivinen, epäsymmetrinen ja matalampi kuin R.', leads: [{ name: 'V3', beat: N }] },
  {
    key: 't',
    label: 'Hyperakuutti T',
    tone: 'warning',
    title: 'Hyperakuutit T-aallot',
    text: 'Infarktin alkuvaiheessa ennen ST-nousuja T-aallot voivat olla korkeat, piikkimäiset ja leveät ("läskit"). T-aallon muutokset ovat yksinään epäspesifejä – mutta uudet muutokset akuutissa tilanteessa liittyvät todennäköisesti iskemiaan.',
    leads: [{ name: 'V3', beat: { ...N, j: 0.6, slope: 1.2, ta: 8, tb: 0 } }],
  },
  {
    key: 'd',
    label: 'ST-lasku',
    tone: 'warning',
    title: 'ST-lasku: keskivaikea iskemia',
    text: 'Iskemian kehittyessä ST-taso laskee perusviivan alapuolelle, ja mukana voi olla T-inversioita. Kuvastaa usein UAP:ta tai NSTEMI:ä – erotus tehdään merkkiaineilla, ei EKG:stä.',
    leads: [{ name: 'V5', beat: { ...N, j: -1.8, slope: 0, ta: 0.8, tb: 0 } }],
  },
  {
    key: 'e',
    label: 'ST-nousu',
    tone: 'danger',
    title: 'ST-nousu: vaurio (STEMI)',
    text: 'Vaurion kehittyessä ST-taso nousee perusviivan yläpuolelle. Etsi peilikuvamuutokset vastakkaisista kytkennöistä – ne tukevat diagnoosia.',
    leads: [{ name: 'V3', beat: { ...N, s: 1, j: 3.5, slope: 1.2, ta: 6, tb: 0 } }],
  },
  {
    key: 'x',
    label: 'QRS-distorsio',
    tone: 'danger',
    title: 'Terminaalisen QRS:n distorsio',
    text: 'Vaikeimmissa tapauksissa QRS:n loppuosa (S-aalto) sulautuu ST-väliin. Vaikean ja laajan iskemian merkki.',
    leads: [{ name: 'V3', beat: { q: 0.5, r: 9, s: -5, j: 6, slope: 0.6, ta: 7, tb: 0 } }],
  },
]

const PATTERNS: Item[] = [
  {
    key: 'wa',
    label: 'Wellens A',
    tone: 'danger',
    title: 'Wellensin oireyhtymä, tyyppi A',
    text: 'Kaksivaiheiset T-aallot etuseinäkytkennöissä (V2–V3). Viittaa LAD:n kriittiseen ahtaumaan. Potilas voi olla kivuton EKG:n ottohetkellä!',
    leads: [{ name: 'V2', beat: { ...N, j: 0.3, slope: 0.4, ta: 2.2, tb: -2.6 } }],
  },
  {
    key: 'wb',
    label: 'Wellens B',
    tone: 'danger',
    title: 'Wellensin oireyhtymä, tyyppi B',
    text: 'Syvät, symmetriset negatiiviset T-aallot etuseinäkytkennöissä. Viittaa LAD:n ahtaumaan – kivuttomuus ei rauhoita.',
    leads: [{ name: 'V3', beat: { ...N, j: 0.2, slope: -0.6, ta: -5, tb: -0.3 } }],
  },
  {
    key: 'dw',
    label: 'de Winter',
    tone: 'danger',
    title: 'de Winterin T-aallot',
    text: 'Rintakytkennöissä yli 1 mm:n ylöspäin viettävä ST-lasku ja korkeat, piikkimäiset T-aallot, lisäksi ST-nousu aVR:ssä. Johtuu LAD:n tukoksesta, vaikka klassisia ST-nousuja ei ole.',
    leads: [
      { name: 'V3', beat: { ...N, j: -2, slope: 2.5, ta: 9, tb: 0 } },
      { name: 'aVR', beat: { q: 0, r: 1.5, s: 7, j: 1, slope: 0, ta: -1, tb: 0 } },
    ],
  },
  {
    key: 'g',
    label: 'Globaali',
    tone: 'danger',
    title: 'Globaali iskemia',
    text: 'Laaja-alaiset ST-laskut ja samalla ST-nousu aVR:ssä voivat viitata vasemman päärungon (LMCA) tyven tukokseen tai muuhun globaaliin iskemiaan – huono tilanne.',
    leads: [
      { name: 'V5', beat: { ...N, j: -2, slope: 0, ta: 0.6, tb: 0 } },
      { name: 'aVR', beat: { q: 0, r: 1.5, s: 7, j: 2, slope: 0, ta: 0.5, tb: 0 } },
    ],
  },
]

const MM = 5 // px per mm
const BY = 70

function beatPath(b: Beat) {
  const y = (mm: number) => (BY - mm * MM).toFixed(1)
  const jy = b.j
  return [
    `M0 ${BY}`,
    `L18 ${BY}`,
    `Q26 ${y(1.4)} 34 ${BY}`, // P
    `L50 ${BY}`,
    `L54 ${y(-b.q)}`,
    `L61 ${y(b.r)}`,
    `L68 ${y(-b.s)}`,
    `L73 ${y(jy)}`, // J point
    `C83 ${y(jy + b.slope)} 92 ${y(b.ta)} 102 ${y(b.ta)}`,
    `C112 ${y(b.ta)} 116 ${y(b.tb)} 124 ${y(b.tb)}`,
    `C130 ${y(b.tb)} 134 ${BY} 142 ${BY}`,
    `L170 ${BY}`,
  ].join(' ')
}

function Trace({ lead, id }: { lead: Lead; id: string }) {
  return (
    <svg viewBox="0 0 170 120" className="h-auto w-full" role="img" aria-label={`Kytkentä ${lead.name}`}>
      <defs>
        <pattern id={`${id}-g`} width={MM} height={MM} patternUnits="userSpaceOnUse">
          <path d={`M${MM} 0 L0 0 0 ${MM}`} fill="none" stroke="rgba(236,72,153,0.16)" strokeWidth={0.5} />
        </pattern>
        <pattern id={`${id}-G`} width={MM * 5} height={MM * 5} patternUnits="userSpaceOnUse">
          <rect width={MM * 5} height={MM * 5} fill={`url(#${id}-g)`} />
          <path d={`M${MM * 5} 0 L0 0 0 ${MM * 5}`} fill="none" stroke="rgba(236,72,153,0.32)" strokeWidth={0.8} />
        </pattern>
      </defs>
      <rect width={170} height={120} fill={`url(#${id}-G)`} rx={6} />
      <line x1={0} x2={170} y1={BY} y2={BY} stroke={svg.dim} strokeOpacity={0.35} strokeDasharray="3 3" />
      <motion.path d={beatPath(lead.beat)} initial={false} animate={{ d: beatPath(lead.beat) }} transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }} fill="none" stroke={svg.ink} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <text x={6} y={14} fontSize={11} fontWeight={700} fill={svg.ink}>
        {lead.name}
      </text>
      {lead.beat.j !== 0 && (
        <text x={164} y={14} textAnchor="end" fontSize={10} fill={lead.beat.j > 0 ? svg.danger : svg.brand}>
          ST {lead.beat.j > 0 ? '+' : '−'}
          {Math.abs(lead.beat.j).toString().replace('.', ',')} mm
        </text>
      )}
    </svg>
  )
}

export default function IschemiaEcg(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('stages')
  const [si, setSi] = useState(0)
  const [pi, setPi] = useState(0)
  const items = mode === 'stages' ? STAGES : PATTERNS
  const idx = mode === 'stages' ? si : pi
  const it = items[idx]
  const set = mode === 'stages' ? setSi : setPi
  // keep two trace slots so the second lead can appear/disappear without remounting the first
  const leads = it.leads

  return (
    <div>
      <Segmented
        layoutId="isch-mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'stages', label: 'Iskemian eteneminen' },
          { value: 'patterns', label: 'Erityiset kuviot' },
        ]}
      />
      <div className={`mt-3 grid gap-2 ${leads.length > 1 ? 'grid-cols-2' : 'mx-auto max-w-[320px] grid-cols-1'}`}>
        {leads.map((l, i) => (
          <Trace key={i} lead={l} id={`isch-${i}`} />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" role="tablist">
        {items.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            aria-selected={i === idx}
            onClick={() => set(i)}
            className={`min-h-11 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
              i === idx ? 'border-brand-500 bg-brand-500/12 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className={`mt-3 rounded-xl border px-4 py-3 ${toneSurface[it.tone]}`} aria-live="polite">
        <p className={`font-display text-[15px] font-semibold ${toneText[it.tone]}`}>{it.title}</p>
        <p className="mt-1 text-[13.5px] leading-snug text-[var(--text)]">{it.text}</p>
      </div>
      <div className="mt-2">
        <Caption>Kaaviokuva, ruutu = 1 mm. Lähde: Kettunen, EKG-tulkintaa – iskemiatulkinta (Duodecim-webinaari 2024).</Caption>
      </div>
    </div>
  )
}
