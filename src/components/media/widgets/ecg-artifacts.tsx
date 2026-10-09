import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Segmented, svg } from '../ui'

/* Recording artefacts that imitate disease (Akuuttihoito-opas: EKG-rekisteröinnin
 * virheet ja häiriöt, Hyvä EKG-rekisteröinti – Mäkijärvi). The strip is synthetic. */

type Kind = 'tremor' | 'ac' | 'wander' | 'arms' | 'calib'

const INFO: Record<Kind, { label: string; looks: string; cause: string; fix: string }> = {
  tremor: {
    label: 'Lihasvapina',
    looks: 'Perusviivan nopea, epätasainen heilahtelu. Voi muistuttaa eteislepatuksen F-aaltoja alaseinäkytkennöissä.',
    cause: 'Lihasjännitys, palelu, Parkinsonin taudin vapina.',
    fix: 'Potilas rentona ja lämpimänä; siirrä raajaelektrodit raajojen tyviin.',
  },
  ac: {
    label: '50 Hz',
    looks: 'Hienojakoinen, tasainen tärinä – nopeudella 50 mm/s yksi piikki jokaisella millimetrillä.',
    cause: 'Vaihtovirta indusoituu johtimiin: potilas koskee metalliin, johtimet lattialla, sähkölaitteiden yllä tai silmukalla.',
    fix: 'Tarkista elektrodit, niputa johtimet, vaihda tarvittaessa paikkaa. 50 Hz:n suodatin auttaa, mutta muuttaa signaalia hieman.',
  },
  wander: {
    label: 'Liike',
    looks: 'Perusviiva vaeltaa – voi herättää epäilyn ST-muutoksista ja iskemiasta.',
    cause: 'Potilaan liikkuminen, voimakas hengitys (astma, hyperventilaatio) tai hikka.',
    fix: 'Potilas makaa rentona ja liikkumatta. Merkitse poikkeama nauhaan.',
  },
  arms: {
    label: 'Kädet ristissä',
    looks: 'Kytkennässä I (ja aVL) P-aalto ja QRS ovat negatiivisia – akseli näyttää kääntyneen ja eteisaalto on oudon suuntainen.',
    cause: 'Oikean ja vasemman käden elektrodit ovat vaihtaneet paikkaa.',
    fix: 'Tarkista värit: punainen oikeaan käteen, keltainen vasempaan.',
  },
  calib: {
    label: 'Kalibraatio',
    looks: 'Vakauslyönti on 20 mm, vaikka 1 mV:n pitäisi näkyä 10 mm:n heilahduksena – kaikki heilahdukset näyttävät kaksinkertaisilta.',
    cause: 'Väärä vahvistus. Voi aiheuttaa virheellisen hypertrofiatulkinnan tai vaikeuttaa iskemian arviota.',
    fix: 'Tarkista kalibraatiopulssi jokaisen rekisteröinnin alusta tai lopusta.',
  },
}
const ORDER: Kind[] = ['tremor', 'ac', 'wander', 'arms', 'calib']

const BASE = 64
const X0 = 46
const X1 = 314

// Stylised PQRST: returns the deflection (positive up) at t ∈ [0,1) within one beat.
function beat(t: number) {
  const g = (mu: number, sd: number, a: number) => a * Math.exp(-((t - mu) ** 2) / (2 * sd * sd))
  return g(0.16, 0.025, 4) + g(0.3, 0.008, -4) + g(0.33, 0.012, 30) + g(0.36, 0.009, -8) + g(0.6, 0.045, 8)
}

function trace(kind: Kind | 'clean') {
  const rr = 78
  const pts: string[] = []
  for (let x = X0; x <= X1; x += 0.5) {
    const t = ((x - X0 + 20) % rr) / rr
    let y = beat(t)
    if (kind === 'arms') y = -y
    if (kind === 'calib') y = y * 2
    if (kind === 'tremor') y += 1.6 * Math.sin(x * 2.3) + 1.2 * Math.sin(x * 3.7 + 1) + 0.9 * Math.sin(x * 5.9 + 2)
    if (kind === 'ac') y += 1.3 * Math.sin(x * Math.PI)
    if (kind === 'wander') y += 10 * Math.sin((x - X0) / 34) + 4 * Math.sin((x - X0) / 11)
    pts.push(`${x.toFixed(1)},${(BASE - y).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}

export default function EcgArtifacts() {
  const [kind, setKind] = useState<Kind>('tremor')
  const [showClean, setShowClean] = useState(false)
  const reduce = useReducedMotion()
  const paths = useMemo(() => Object.fromEntries([...ORDER, 'clean'].map((k) => [k, trace(k as Kind | 'clean')])) as Record<Kind | 'clean', string>, [])
  const i = INFO[kind]
  const calH = kind === 'calib' ? 40 : 20 // 1 mV pulse height (svg units ≈ 2 per mm)

  return (
    <div>
      <Segmented layoutId="ecg-artifacts" size="sm" wrap value={kind} onChange={setKind} options={ORDER.map((k) => ({ value: k, label: INFO[k].label }))} />

      <svg viewBox="0 0 320 120" className="mt-3 h-auto w-full rounded-xl" role="img" aria-label={`Synteettinen EKG-nauha: ${i.label}`}>
        <rect x={0} y={0} width={320} height={120} rx={12} fill="rgba(248,105,10,0.05)" />
        <g aria-hidden stroke="rgba(248,105,10,0.16)" strokeWidth={0.6}>
          {Array.from({ length: 33 }, (_, k) => (
            <line key={`v${k}`} x1={k * 10} y1={0} x2={k * 10} y2={120} />
          ))}
          {Array.from({ length: 13 }, (_, k) => (
            <line key={`h${k}`} x1={0} y1={k * 10} x2={320} y2={k * 10} />
          ))}
        </g>
        {/* calibration pulse */}
        <path
          d={`M8 ${BASE} L16 ${BASE} L16 ${BASE - calH} L30 ${BASE - calH} L30 ${BASE} L40 ${BASE}`}
          fill="none"
          stroke={kind === 'calib' ? svg.danger : svg.ink}
          strokeWidth={1.6}
          strokeLinejoin="round"
          aria-hidden
        />
        {showClean && <path d={paths.clean} fill="none" stroke={svg.teal} strokeWidth={1.4} opacity={0.75} aria-hidden />}
        <motion.path
          key={kind}
          d={paths[kind]}
          fill="none"
          stroke={svg.ink}
          strokeWidth={1.6}
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'linear' }}
          aria-hidden
        />
        <text x={8} y={112} fontSize={10} fill={svg.dim}>
          {kind === 'arms' ? 'kytkentä I' : 'kalibraatio 1 mV'}
        </text>
      </svg>

      <button
        onClick={() => setShowClean((v) => !v)}
        aria-pressed={showClean}
        className={`mt-2 min-h-[40px] rounded-full border px-3 text-[12px] font-semibold transition-colors duration-150 ${
          showClean ? 'border-teal-500 bg-teal-500/10 text-teal-600' : 'border-[var(--border)] text-[var(--text-dim)]'
        }`}
      >
        {showClean ? 'Piilota häiriötön käyrä' : 'Näytä häiriötön käyrä vertailuksi'}
      </button>

      <AnimatePresence mode="wait" initial={false}>
        <motion.dl
          key={kind}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mt-3 flex flex-col gap-2 text-[13px] leading-relaxed"
        >
          {[
            ['Miltä näyttää', i.looks],
            ['Syy', i.cause],
            ['Korjaa', i.fix],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-[var(--bg)] px-3.5 py-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{k}</dt>
              <dd className="text-[var(--text)]">{v}</dd>
            </div>
          ))}
        </motion.dl>
      </AnimatePresence>
    </div>
  )
}
