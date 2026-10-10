import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg } from '../ui'

/* Incomplete spinal cord injury patterns (European Trauma Course manual, ch. 9).
 * Schematic cross-section, anterior up; the damaged area is shaded. */

type Kind = 'central' | 'anterior' | 'brown'

const DATA: Record<Kind, { label: string; title: string; who: string; find: string; prog: string; tone: 'ok' | 'warning' | 'danger' }> = {
  central: {
    label: 'Sentraalinen',
    title: 'Sentraalinen selkäydinoireyhtymä',
    who: 'Yleisin epätäydellisen selkäydinvamman muoto. Seuraa usein kaulan yliojennusta, kuten kaatumista kasvoilleen – tyypillisesti iäkkäällä, jolla on kaularangan rappeumamuutoksia ja ahdas selkäydinkanava.',
    find: 'Raajojen heikkous, kädet pahemmin kuin jalat; käsien veltto halvaus, pahimmillaan distaalisesti. Perianaalinen tunto säilyy. Tuntohäiriöt ja yliherkkyys korostuvat käsissä.',
    prog: 'Jonkinasteinen liikekyky palautuu noin 75 %:lla – ensin ristiluun ja jalkojen alueella, käsien toiminta palautuu yleensä vähiten.',
    tone: 'ok',
  },
  anterior: {
    label: 'Anteriorinen',
    title: 'Anteriorinen selkäydinoireyhtymä',
    who: 'Selkäytimen etummaiset kaksi kolmannesta eivät toimi. Yleensä fleksio- tai aksiaalinen vamma, jossa murskamurtuma vaurioittaa etummaista selkäydinvaltimoa – voi seurata myös syvää hypotensiota.',
    find: 'Veltto halvaus sekä kivun ja lämmön tunnon menetys vamman alapuolella. Asento-, värinä- ja syvä painetunto säilyvät, koska takajuostet ovat ehjät.',
    prog: 'Huono ennuste: toiminnallisen liikekyvyn palautumisen mahdollisuus on vain noin 10 %.',
    tone: 'danger',
  },
  brown: {
    label: 'Brown-Séquard',
    title: 'Brown-Séquardin oireyhtymä',
    who: 'Harvinainen selkäytimen toispuoleinen katkeama. Syynä useimmiten lävistävä vamma – ampuma- tai puukotushaava.',
    find: 'Vamman puolella lihasvoima sekä asento-, värinä- ja syvä painetunto katoavat vamman tasolta alaspäin. Vastakkaisella puolella kivun ja lämmön tunto katoaa vamman tason alapuolella.',
    prog: 'Lähes kaikki toipuvat osittain, ja useimmat saavat takaisin suolen ja rakon toiminnan sekä kävelykyvyn.',
    tone: 'ok',
  },
}
const ORDER: Kind[] = ['central', 'anterior', 'brown']

const MOTOR = svg.brand
const PAIN = svg.teal
const POST = '#6b9bd1'

const GREY = 'M160 96 C150 82 140 64 120 60 C106 62 106 80 116 92 C124 102 130 106 132 112 C128 124 120 142 120 162 C126 168 132 162 136 150 C142 134 150 122 160 120 C170 122 178 134 184 150 C188 162 194 168 200 162 C200 142 192 124 188 112 C190 106 196 102 204 92 C214 80 214 62 200 60 C180 64 170 82 160 96 Z'
const POST_L = 'M157 124 L157 184 Q138 182 124 172 L138 152 Q146 132 157 124 Z'
const POST_R = 'M163 124 L163 184 Q182 182 196 172 L182 152 Q174 132 163 124 Z'

export default function CordSyndromes() {
  const [kind, setKind] = useState<Kind>('central')
  const reduce = useReducedMotion()
  const d = DATA[kind]
  const t = reduce ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div>
      <Segmented layoutId="cord-syndromes" size="sm" value={kind} onChange={setKind} options={ORDER.map((k) => ({ value: k, label: DATA[k].label }))} />

      <svg viewBox="0 0 320 222" className="mt-3 h-auto w-full" role="img" aria-label={`Selkäytimen poikkileikkaus: ${d.title}`}>
        <defs>
          <clipPath id="cord-clip">
            <path d="M160 26 C152 22 120 24 90 34 C56 46 40 76 40 106 C40 146 70 178 110 186 C130 190 150 190 160 188 C170 190 190 190 210 186 C250 178 280 146 280 106 C280 76 264 46 230 34 C200 24 168 22 160 26 Z" />
          </clipPath>
        </defs>
        <g aria-hidden>
          <text x={160} y={14} fontSize={10} fill={svg.dim} textAnchor="middle">
            etu (vatsan puoli)
          </text>
          <text x={160} y={218} fontSize={10} fill={svg.dim} textAnchor="middle">
            taka (selän puoli)
          </text>

          <g clipPath="url(#cord-clip)">
            <rect x={0} y={0} width={320} height={222} fill={svg.raised} />
            <path d={GREY} fill="rgba(148,163,184,0.35)" stroke={svg.ink} strokeOpacity={0.3} strokeWidth={1.5} />
            {/* posterior columns: proprioception, vibration, deep pressure */}
            <path d={POST_L} fill={POST} fillOpacity={0.45} />
            <path d={POST_R} fill={POST} fillOpacity={0.45} />
            {/* lateral corticospinal tracts: motor */}
            <ellipse cx={82} cy={132} rx={28} ry={22} fill={MOTOR} fillOpacity={0.4} />
            <ellipse cx={238} cy={132} rx={28} ry={22} fill={MOTOR} fillOpacity={0.4} />
            {/* spinothalamic tracts: pain and temperature */}
            <ellipse cx={76} cy={80} rx={24} ry={18} fill={PAIN} fillOpacity={0.4} />
            <ellipse cx={244} cy={80} rx={24} ry={18} fill={PAIN} fillOpacity={0.4} />

            {/* damaged area */}
            <motion.circle
              cx={160}
              cy={104}
              fill="rgba(220,38,38,0.38)"
              stroke={svg.danger}
              strokeWidth={2}
              strokeDasharray="5 4"
              initial={false}
              animate={{ r: kind === 'central' ? 54 : 0, opacity: kind === 'central' ? 1 : 0 }}
              transition={t}
            />
            <motion.rect
              x={0}
              y={0}
              width={320}
              fill="rgba(220,38,38,0.38)"
              stroke={svg.danger}
              strokeWidth={2}
              strokeDasharray="5 4"
              initial={false}
              animate={{ height: kind === 'anterior' ? 134 : 0, opacity: kind === 'anterior' ? 1 : 0 }}
              transition={t}
            />
            <motion.rect
              x={0}
              y={0}
              height={222}
              fill="rgba(220,38,38,0.38)"
              stroke={svg.danger}
              strokeWidth={2}
              strokeDasharray="5 4"
              initial={false}
              animate={{ width: kind === 'brown' ? 160 : 0, opacity: kind === 'brown' ? 1 : 0 }}
              transition={t}
            />
          </g>
          <path d="M160 26 C152 22 120 24 90 34 C56 46 40 76 40 106 C40 146 70 178 110 186 C130 190 150 190 160 188 C170 190 190 190 210 186 C250 178 280 146 280 106 C280 76 264 46 230 34 C200 24 168 22 160 26 Z" fill="none" stroke={svg.ink} strokeOpacity={0.4} strokeWidth={2} />

          {/* somatotopy: arm fibres lie centrally, leg and sacral fibres peripherally */}
          {kind === 'central' && (
            <g fontSize={10} fontWeight={700} textAnchor="middle" fill={svg.ink}>
              <text x={100} y={136}>K</text>
              <text x={68} y={136}>J</text>
              <text x={220} y={136}>K</text>
              <text x={252} y={136}>J</text>
            </g>
          )}
          {kind === 'brown' && (
            <text x={80} y={204} fontSize={10} fontWeight={600} fill={svg.danger} textAnchor="middle">
              vamman puoli
            </text>
          )}
        </g>
      </svg>

      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--text-dim)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: MOTOR }} />
          liike (kortikospinaalirata)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: PAIN }} />
          kipu ja lämpö (spinotalaminen rata)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: POST }} />
          asento-, värinä- ja painetunto (takajuostet)
        </span>
        {kind === 'central' && <span>K = käsi, J = jalka</span>}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={kind}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mt-3 flex flex-col gap-2"
        >
          <div className="rounded-xl bg-[var(--bg)] px-3.5 py-2.5">
            <p className="font-display text-[15px] font-semibold text-[var(--text)]">{d.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-dim)]">{d.who}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--text)]">{d.find}</p>
          </div>
          <Result tone={d.tone} title="Ennuste">
            {d.prog}
          </Result>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
