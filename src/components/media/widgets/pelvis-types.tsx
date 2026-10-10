import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg, type Tone } from '../ui'

/* Pelvic ring injury patterns by direction of force and the effect of a pelvic binder
 * (European Trauma Course manual, ch. 7). Schematic AP view; viewer's right = patient's left. */

type Kind = 'normal' | 'apc' | 'lc' | 'vs'

interface Pose {
  l: number // rotation of viewer's-left hemipelvis (deg, + = symphysis end outwards)
  r: number // same for the mirrored right hemipelvis
  ry: number // vertical shift of right hemipelvis
  pool: number // relative blood volume in the small pelvis
}

const DATA: Record<Kind, { label: string; force: string; what: string; stab: string; bleed: string; tone: Tone }> = {
  normal: {
    label: 'Ehjä',
    force: 'Lantiorengas on elimistön suurin ja vahvin luu-nivelsiderakenne.',
    what: 'Vakaus syntyy luiden ja nivelsiteiden yhteistyöstä: vahvat takimmaiset ristisuoliluunivelen siteet pitävät renkaan kasassa. Rikkoutuessaan rengas katkeaa lähes aina kahdesta tai useammasta kohdasta.',
    stab: 'Vakaa',
    bleed: 'Pienen lantion läpi kulkee suuria suonia, jotka muodostavat runsaasti yhteyksiä toisiinsa – siksi lantiorenkaan murtuma hoidetaan kuin verisuonivamma.',
    tone: 'neutral',
  },
  apc: {
    label: 'Avautuva kirja',
    force: 'Voima edestä taaksepäin (esim. nokkakolari).',
    what: 'Lantion puoliskot kiertyvät ulospäin kuin kirjan sivut. Häpyliitos sijoiltaan tai häpy- ja istuinluun haarat murtuvat; takana vain ohuet etusiteet repeävät.',
    stab: 'Rotaatioltaan epävakaa, pystysuunnassa vakaa',
    bleed: 'Massiivinen verenvuoto: pienen lantion tilavuus kasvaa ja lukuisat suoniyhteydet repeävät. Myös lantionpohjaan kiinnittyvät rakenteet, kuten virtsaputki, voivat revetä.',
    tone: 'danger',
  },
  lc: {
    label: 'Sivupuristus',
    force: 'Voima sivulta (sivutörmäys).',
    what: 'Puoliskot puristuvat yhteen ja toinen kiertyy sisäänpäin. Usein myös saman puolen ristiluun murskavamma.',
    stab: 'Rotaatioltaan epävakaa (sisäänpäin), pystysuunnassa vakaa',
    bleed: 'Mekaanisesti vakaampi ja harvemmin massiivinen vuoto, ellei siirtymä ole suuri (esim. kierähdys). Paine voi silti vahingoittaa pienen lantion elimiä – esim. virtsarakon repeämä.',
    tone: 'warning',
  },
  vs: {
    label: 'Pystyleikkaus',
    force: 'Pystysuora voima (putoaminen korkealta).',
    what: 'Lantion puoliskot irtoavat täysin toisistaan ja vammapuoli siirtyy ylöspäin. Renkaan etu- ja takaosa sekä lantionpohja repeävät.',
    stab: 'Sekä rotaatioltaan että pystysuunnassa epävakaa',
    bleed: 'Henkeä uhkaava vuoto: anatomisia rajoja ei enää ole, joten veri pääsee vatsakalvon takaiseen tilaan palleaan asti. Usein myös suuret suonet vaurioituvat.',
    tone: 'danger',
  },
}
const ORDER: Kind[] = ['normal', 'apc', 'lc', 'vs']
const BONE = 'rgba(214,196,158,0.28)'
const BONE_LINE = '#c8b48a'

const BINDER: Record<Kind, string> = {
  normal: 'Lantiovyön aihe on rotaatioltaan tai pystysuunnassa epävakaa murtuma. Vyö asetetaan heti, kun epävakaata lantiorengasvammaa ja hypotensiota epäillään – kuvantamista ei tarvita ennen sitä.',
  apc: 'Vyö kohdistaa painetta rikkoutuneisiin osiin, pienentää pienen lantion tilavuutta ja estää suuret liikkeet käsittelyn ja kuljetuksen aikana. Vatsa jää vapaaksi toimenpiteille.',
  lc: 'Sivupuristuksessakin rengas on rotaatioltaan epävakaa, joten vyö on aiheellinen: se estää suuret liikkeet käsittelyn ja kuljetuksen aikana.',
  vs: 'Vyö pienentää lantion tilavuutta ja estää suuret liikkeet käsittelyn ja kuljetuksen aikana. Lopullinen vakauttaminen (esim. ulkoinen kiinnitin tai lantiopihti) tehdään sairaalassa.',
}

function pose(kind: Kind, binder: boolean): Pose {
  switch (kind) {
    case 'apc':
      return binder ? { l: 2, r: 2, ry: 0, pool: 0.45 } : { l: 13, r: 13, ry: 0, pool: 1 }
    case 'lc':
      return { l: 0, r: -7, ry: 0, pool: 0.3 }
    case 'vs':
      return binder ? { l: 0, r: 2, ry: -18, pool: 0.7 } : { l: 0, r: 7, ry: -18, pool: 1 }
    default:
      return { l: 0, r: 0, ry: 0, pool: 0 }
  }
}

/* one hemipelvis (iliac wing + rami + acetabulum + proximal femur), drawn for the viewer's left side */
const HEMI = 'M136 56 C116 36 80 30 58 44 C46 56 50 82 64 98 C74 110 82 118 86 128 C92 146 112 168 156 176 L157 160 C134 156 122 148 116 136 C120 124 132 116 138 106 Z'

function Hemi({ broken }: { broken?: boolean }) {
  return (
    <g>
      <path d={HEMI} fill={BONE} stroke={BONE_LINE} strokeWidth={2} strokeLinejoin="round" />
      <ellipse cx={128} cy={154} rx={10} ry={7} fill={svg.surface} stroke={BONE_LINE} strokeOpacity={0.7} strokeWidth={1.5} />
      <path d="M86 132 L70 206" stroke={BONE_LINE} strokeOpacity={0.45} strokeWidth={12} strokeLinecap="round" />
      <circle cx={86} cy={130} r={12} fill={svg.surface} stroke={BONE_LINE} strokeWidth={2} />
      {broken && <path d="M154 170 L150 164" stroke={svg.danger} strokeWidth={2.5} strokeLinecap="round" />}
    </g>
  )
}

export default function PelvisTypes() {
  const [kind, setKind] = useState<Kind>('apc')
  const [binder, setBinder] = useState(false)
  const reduce = useReducedMotion()
  const d = DATA[kind]
  const p = pose(kind, binder)
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, duration: 0.8, bounce: 0.15 }

  return (
    <div>
      <Segmented layoutId="pelvis-types" size="sm" wrap value={kind} onChange={setKind} options={ORDER.map((k) => ({ value: k, label: DATA[k].label }))} />

      <svg viewBox="0 0 320 220" className="mt-3 h-auto w-full" role="img" aria-label={`Lantiorengas: ${d.label}${binder ? ', lantiovyö asetettu' : ''}`}>
        <g aria-hidden>
          {/* blood in the small pelvis */}
          <motion.ellipse
            cx={160}
            cy={140}
            fill={svg.dangerSoft}
            stroke={svg.danger}
            strokeOpacity={0.5}
            initial={false}
            animate={{ rx: 18 + 46 * p.pool, ry: 10 + 30 * p.pool, opacity: p.pool > 0 ? 1 : 0 }}
            transition={spring}
          />
          {kind === 'vs' && !reduce && (
            <motion.path d="M160 104 L160 58" stroke={svg.danger} strokeWidth={3} strokeLinecap="round" strokeDasharray="4 6" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.4 }} />
          )}

          {/* sacrum */}
          <path d="M136 50 L184 50 L178 110 L160 128 L142 110 Z" fill={BONE} stroke={BONE_LINE} strokeWidth={2} strokeLinejoin="round" />
          {kind === 'lc' && <path d="M172 62 L178 72 L170 80 L178 90" fill="none" stroke={svg.danger} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}

          {/* hemipelves */}
          <motion.g initial={false} animate={{ rotate: p.l }} transition={spring} style={{ transformBox: 'view-box', transformOrigin: '138px 70px' }}>
            <Hemi broken={kind !== 'normal' && kind !== 'lc'} />
          </motion.g>
          <g transform="translate(320 0) scale(-1 1)">
            <motion.g initial={false} animate={{ rotate: p.r, y: p.ry }} transition={spring} style={{ transformBox: 'view-box', transformOrigin: '138px 70px' }}>
              <Hemi broken={kind !== 'normal'} />
            </motion.g>
          </g>

          {/* pelvic binder at the level of the greater trochanters */}
          <AnimatePresence>
            {binder && (
              <motion.g key="binder" initial={reduce ? false : { opacity: 0, scaleX: 1.25 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ transformBox: 'view-box', transformOrigin: '160px 140px' }}>
                <rect x={30} y={128} width={260} height={22} rx={8} fill={svg.teal} fillOpacity={0.3} stroke={svg.teal} strokeWidth={2} />
                <rect x={148} y={131} width={24} height={16} rx={3} fill={svg.teal} />
              </motion.g>
            )}
          </AnimatePresence>
        </g>
      </svg>

      <div className="mt-1 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-2">
        <span className="text-[13px] text-[var(--text)]">Lantiovyö isojen sarvennoisten tasolle</span>
        <button
          role="switch"
          aria-checked={binder}
          onClick={() => setBinder((b) => !b)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${binder ? 'bg-teal-500' : 'bg-[var(--bg-raised)] ring-1 ring-[var(--border)]'}`}
        >
          <span className="sr-only">Lantiovyö</span>
          <motion.span className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow" initial={false} animate={{ x: binder ? 20 : 0 }} transition={{ duration: reduce ? 0 : 0.18 }} />
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={kind + String(binder)}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mt-3 flex flex-col gap-2"
        >
          <div className="rounded-xl bg-[var(--bg)] px-3.5 py-2.5">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{d.force}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{d.what}</p>
            <p className="mt-2 text-[13px] font-semibold text-[var(--text)]">{d.stab}</p>
          </div>
          <Result tone={d.tone} title={kind === 'normal' ? 'Miksi lantio vuotaa?' : 'Verenvuoto'}>
            {d.bleed}
          </Result>
          {binder && (
            <Result tone={kind === 'normal' ? 'neutral' : 'ok'} title="Lantiovyön vaikutus">
              {BINDER[kind]}
            </Result>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
