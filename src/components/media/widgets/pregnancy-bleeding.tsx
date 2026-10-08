import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Caption, Segmented, svg, toneSurface, toneText, type Tone } from '../ui'
import { useLoop } from '../parts/resp-kit'

/* Front view of the uterus: four bleeding emergencies side by side.
 * Article: raskauden-verenvuodot. Facts from Terveyskirjasto (kohdunulkoinen raskaus,
 * loppuraskauden verenvuoto) and the 2026 ensihoito lecture on pregnancy emergencies. */

type Cause = 'ectopic' | 'abruption' | 'praevia' | 'rupture'

const UT = '#ec4899'
const UT_SOFT = 'rgba(236,72,153,0.12)'
const PLACENTA = '#9f1239'
const BLOOD = '#b91c1c'
const FETUS = 'rgba(251,191,36,0.28)'

const INFO: Record<Cause, { label: string; when: string; tone: Tone; rows: [string, string][]; act: string }> = {
  ectopic: {
    label: 'Kohdunulkoinen',
    when: 'Alkuraskaus, kipu tyypillisesti rv 6–9',
    tone: 'danger',
    rows: [
      ['Kipu', 'Toispuoleinen tai kouristeleva alavatsakipu – hartiapistos!'],
      ['Vuoto', 'Niukka emättimestä – mutta munatorven revetessä runsas vuoto vatsaonteloon'],
      ['Muuta', 'Potilas ei aina tiedä olevansa raskaana; pyörtyminen ja sokin merkit'],
    ],
    act: 'Sokin hoito, suoniyhteys ja nesteytys, kiireellinen kuljetus gynekologiseen päivystykseen.',
  },
  abruption: {
    label: 'Ablaatio',
    when: 'Keski- ja loppuraskaus, 0,5–2 % raskauksista',
    tone: 'danger',
    rows: [
      ['Kipu', 'Jatkuva (ei aaltomainen kuten supistus)'],
      ['Kohtu', 'Kova, pinkeä ja aristava'],
      ['Vuoto', 'Verinen – mutta voi jäädä kokonaan istukan taakse piiloon'],
    ],
    act: 'Hätätilanne äidille ja sikiölle: vasen kylkiasento, sokin hoito, nopea kuljetus ja ennakkoilmoitus.',
  },
  praevia: {
    label: 'Etisistukka',
    when: 'Loppuraskaus, alle 1 % raskauksista',
    tone: 'warning',
    rows: [
      ['Kipu', 'Yleensä kivuton'],
      ['Vuoto', 'Kirkkaanpunainen, voi olla runsas'],
      ['Muuta', 'Äiti tietää usein istukan sijainnin neuvolasta – kysy ja katso äitiyskortti'],
    ],
    act: 'Ei sisätutkimusta. Kuljetus synnytyssairaalaan kylkiasennossa, ennakkoilmoitus.',
  },
  rupture: {
    label: 'Kohdun repeämä',
    when: 'Yleensä synnytyksen aikana, riskinä aiempi sektio',
    tone: 'danger',
    rows: [
      ['Kipu', 'Kova alavatsakipu, joka voi hetkeksi helpottaa'],
      ['Verenkierto', 'Nopeasti kehittyvä sokki – massiivinen vuoto vatsaonteloon'],
      ['Kohtu', 'Muoto voi muuttua, kun sikiö siirtyy vatsaonteloon'],
    ],
    act: 'Aina hätätilanne: sokin hoito ja välitön kuljetus leikkausvalmiuteen.',
  },
}

const BIG =
  'M170 22 C246 22 282 82 280 140 C278 190 242 220 202 230 L188 248 L152 248 L138 230 C98 220 62 190 60 140 C58 82 94 22 170 22 Z'
const BIG_IN =
  'M170 34 C236 34 268 86 266 140 C264 184 232 210 196 218 L180 234 L160 234 L144 218 C108 210 76 184 74 140 C72 86 104 34 170 34 Z'
const SMALL =
  'M170 104 C206 104 222 130 220 160 C218 186 202 198 188 204 L182 226 L158 226 L152 204 C138 198 122 186 120 160 C118 130 134 104 170 104 Z'

function Drops({ x, y, n, active, color = BLOOD, dy = 30 }: { x: number; y: number; n: number; active: boolean; color?: string; dy?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <motion.circle
          key={i}
          cx={x + (i % 2 ? 3 : -3)}
          r={3}
          fill={color}
          initial={{ cy: y, opacity: 0 }}
          animate={active ? { cy: [y, y + dy], opacity: [0, 1, 0] } : { cy: y + dy / 2, opacity: 0.8 }}
          transition={active ? { duration: 1.4, repeat: Infinity, delay: i * 0.45, ease: 'easeIn' } : { duration: 0 }}
        />
      ))}
    </>
  )
}

function Pool({ cx, cy, rx, active }: { cx: number; cy: number; rx: number; active: boolean }) {
  return (
    <motion.ellipse
      cx={cx}
      cy={cy}
      ry={rx * 0.22}
      fill={BLOOD}
      opacity={0.55}
      initial={{ rx: rx * 0.4 }}
      animate={active ? { rx: [rx * 0.4, rx, rx] } : { rx }}
      transition={active ? { duration: 4, repeat: Infinity, ease: 'easeOut' } : { duration: 0 }}
    />
  )
}

function Scene({ cause, active }: { cause: Cause; active: boolean }) {
  if (cause === 'ectopic') {
    return (
      <g>
        {/* tubes and ovaries */}
        <path d="M206 120 C240 104 270 100 300 112" fill="none" stroke={UT} strokeWidth={6} strokeLinecap="round" opacity={0.55} />
        <path d="M134 120 C100 104 70 100 40 112" fill="none" stroke={UT} strokeWidth={6} strokeLinecap="round" opacity={0.55} />
        <ellipse cx={290} cy={140} rx={14} ry={9} fill={UT_SOFT} stroke={UT} strokeWidth={1.5} />
        <ellipse cx={50} cy={140} rx={14} ry={9} fill={UT_SOFT} stroke={UT} strokeWidth={1.5} />
        <path d={SMALL} fill={UT_SOFT} stroke={UT} strokeWidth={3} />
        {/* gestational sac in the tube */}
        <motion.ellipse
          cx={258}
          cy={106}
          rx={13}
          ry={10}
          fill={FETUS}
          stroke={PLACENTA}
          strokeWidth={2}
          animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 1.6, repeat: active ? Infinity : 0 }}
          style={{ transformOrigin: '258px 106px' }}
        />
        <path d="M262 116 l-4 6 l5 3 l-3 6" fill="none" stroke={BLOOD} strokeWidth={2} />
        <Drops x={260} y={128} n={3} active={active} dy={90} />
        <Pool cx={250} cy={238} rx={46} active={active} />
        <text x={258} y={88} textAnchor="middle" fontSize={10} fontWeight={600} fill={svg.ink}>
          sikiöpussi munatorvessa
        </text>
        <text x={250} y={256} textAnchor="middle" fontSize={10} fill={svg.dim}>
          verta vatsaonteloon
        </text>
        <text x={170} y={246} textAnchor="middle" fontSize={10} fill={svg.dim}>
          kohtu
        </text>
      </g>
    )
  }

  return (
    <g>
      <motion.path
        d={BIG}
        fill={UT_SOFT}
        stroke={UT}
        initial={false}
        animate={{ strokeWidth: cause === 'abruption' && active ? [3, 6, 3] : 3 }}
        transition={{ duration: 1.2, repeat: cause === 'abruption' && active ? Infinity : 0 }}
      />
      <path d={BIG_IN} fill="none" stroke={UT} strokeOpacity={0.35} strokeWidth={1} />
      {/* fetus, head down */}
      <circle cx={170} cy={186} r={26} fill={FETUS} stroke={svg.dim} strokeOpacity={0.4} />
      <ellipse cx={176} cy={132} rx={38} ry={44} fill={FETUS} stroke={svg.dim} strokeOpacity={0.4} />

      {cause === 'abruption' && (
        <g>
          {/* haematoma between the uterine wall and the detaching placenta */}
          <motion.ellipse
            cx={170}
            cy={60}
            fill={BLOOD}
            opacity={0.9}
            initial={{ rx: 20, ry: 6 }}
            animate={active ? { rx: [20, 40, 40], ry: [6, 13, 13] } : { rx: 36, ry: 12 }}
            transition={active ? { duration: 3.5, repeat: Infinity } : { duration: 0 }}
          />
          <path d="M112 82 C140 62 200 62 228 82 L222 94 C196 78 144 78 118 94 Z" fill={PLACENTA} />
          <text x={170} y={16} textAnchor="middle" fontSize={10} fontWeight={600} fill={svg.ink}>
            istukan taakse kertyvä verenpurkauma
          </text>
          <Drops x={170} y={252} n={2} active={active} dy={18} />
        </g>
      )}

      {cause === 'praevia' && (
        <g>
          <path d="M128 214 C148 236 192 236 212 214 L206 204 C188 222 152 222 134 204 Z" fill={PLACENTA} />
          <Drops x={170} y={250} n={4} active={active} color="#ef4444" dy={20} />
          <text x={262} y={258} textAnchor="middle" fontSize={10} fontWeight={600} fill={svg.ink}>
            istukka kohdunsuun päällä
          </text>
        </g>
      )}

      {cause === 'rupture' && (
        <g>
          <path d="M112 70 C140 52 200 52 228 70 L222 82 C196 66 144 66 118 82 Z" fill={PLACENTA} opacity={0.8} />
          <path d="M268 168 l-10 8 l9 6 l-11 9 l10 6" fill="none" stroke={BLOOD} strokeWidth={3} strokeLinejoin="round" />
          <Drops x={278} y={186} n={3} active={active} dy={50} />
          <Pool cx={290} cy={246} rx={36} active={active} />
          <text x={300} y={160} textAnchor="middle" fontSize={10} fontWeight={600} fill={svg.ink}>
            repeämä
          </text>
        </g>
      )}
    </g>
  )
}

export default function PregnancyBleeding(_props: WidgetProps) {
  const [cause, setCause] = useState<Cause>('ectopic')
  const { ref, active } = useLoop<HTMLDivElement>()
  const info = INFO[cause]

  return (
    <div ref={ref}>
      <Segmented
        layoutId="preg-bleed"
        wrap
        value={cause}
        onChange={setCause}
        options={(Object.keys(INFO) as Cause[]).map((c) => ({ value: c, label: INFO[c].label }))}
      />

      <svg viewBox="0 0 340 262" className="mt-3 h-auto w-full" role="img" aria-label={`${info.label}: ${info.rows.map((r) => r[1]).join('. ')}`}>
        <AnimatePresence mode="wait">
          <motion.g key={cause} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Scene cause={cause} active={active} />
          </motion.g>
        </AnimatePresence>
      </svg>

      <div className={`mt-2 rounded-xl border px-4 py-3 ${toneSurface[info.tone]}`} aria-live="polite">
        <p className={`font-display text-[15px] font-semibold ${toneText[info.tone]}`}>{info.label}</p>
        <p className="text-[12px] text-[var(--text-dim)]">{info.when}</p>
        <dl className="mt-2 space-y-1.5 text-[13.5px] leading-snug">
          {info.rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[84px_1fr] gap-2">
              <dt className="font-semibold text-[var(--text)]">{k}</dt>
              <dd className="text-[var(--text)]">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-[13px] leading-snug text-[var(--text-dim)]">
          <span className="font-semibold text-[var(--text)]">Ensihoito: </span>
          {info.act}
        </p>
      </div>
      <div className="mt-2">
        <Caption>Kaaviokuva, ei mittakaavassa. Kohdunulkoisessa raskaudessa kohtu on vielä pieni; muissa kuvissa loppuraskauden kohtu ja sikiö.</Caption>
      </div>
    </div>
  )
}
