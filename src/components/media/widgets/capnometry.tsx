import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Result, svg, type Tone } from '../ui'

/* Interpreting end-tidal CO2 trends (Säämänen 2008; European Trauma Course; Käypä hoito
 * Elvytys; site's paediatric resuscitation notes). Schematic trend curves only – no scale. */

type Id = 'normal' | 'hypo' | 'hyper' | 'flow' | 'leak' | 'cpr' | 'rosc' | 'zero'

const S: Record<Id, { label: string; dir: string; why: string; act: string; tone: Tone; pts: string }> = {
  normal: {
    label: 'Normoventilaatio',
    dir: 'Tasainen',
    why: 'Ventilaatio vastaa elimistön hiilidioksidin tuotantoa. EtCO₂ on yleensä vähintään 0,5 kPa valtimoveren PaCO₂:ta matalampi.',
    act: 'Intuboidulla tavoitellaan normokapniaa – esim. aivovamma- ja ROSC-potilaalla Ensihoito-oppaan tavoite on EtCO₂ 4,0–4,5 kPa.',
    tone: 'ok',
    pts: '0,60 300,60',
  },
  hypo: {
    label: 'Liian harva ventilaatio',
    dir: 'Nousee',
    why: 'Keuhkorakkulat eivät tuuletu riittävästi, ja hiilidioksidia kertyy. Korkea EtCO₂ voi johtua myös lisääntyneestä aineenvaihdunnasta ja hiilidioksidin tuotannosta.',
    act: 'Tarkista ventilaatiotaajuus ja -tilavuus. Aivovammassa kohonnut PaCO₂ laajentaa aivoverisuonia ja nostaa kallonsisäistä painetta.',
    tone: 'warning',
    pts: '0,60 80,60 300,22',
  },
  hyper: {
    label: 'Liian tiheä ventilaatio',
    dir: 'Laskee',
    why: 'Yleisin syy matalaan EtCO₂:een: verestä poistuu keuhkojen kautta liikaa hiilidioksidia.',
    act: 'Hidasta ventilaatiota. Aivovammassa matala PaCO₂ supistaa aivoverisuonia ja heikentää jo valmiiksi huonosti perfusoituneiden alueiden verenkiertoa.',
    tone: 'warning',
    pts: '0,60 80,60 300,98',
  },
  flow: {
    label: 'Heikko verenkierto',
    dir: 'Laskee',
    why: 'Kun sydämen minuuttitilavuus pienenee – esim. hypovoleemisessa sokissa tai massiivisessa keuhkoemboliassa – veri tuo keuhkorakkuloihin vähän hiilidioksidia, vaikka ventilaatio olisi ennallaan.',
    act: 'Älä tulkitse matalaa arvoa pelkäksi ventilaatio-ongelmaksi. Arvioi verenkierto. Tämä yhteys tunnetaan heikoimmin.',
    tone: 'danger',
    pts: '0,60 80,60 160,90 300,112',
  },
  leak: {
    label: 'Ohivirtaus tai kuollut tila',
    dir: 'Matala',
    why: 'Uloshengitysilma ohittaa mittauskohdan (esim. rikkinäinen kuffi) tai sisään- ja uloshengityskaasut sekoittuvat kuolleessa tilassa – ylähengitysteissä, keinoilmatiessä ja keuhkoputkissa, joissa kaasujenvaihtoa ei tapahdu.',
    act: 'Tarkista kuffi, liitokset ja ilmatie.',
    tone: 'warning',
    pts: '0,60 80,60 110,92 300,92',
  },
  cpr: {
    label: 'Painelu-elvytys',
    dir: 'Matala',
    why: 'Painelulla saadaan aikaan vain noin neljäsosa normaalista verenkierrosta, joten EtCO₂ on elvytyksessä tyypillisesti matala (esim. noin 1 kPa) ventilaatiotaajuudesta riippumatta.',
    act: 'Matala lukema ei yksin tarkoita putken virheasentoa tai liian tiheää ventilaatiota. Pysyvästi alle 1,33 kPa tai laskeva trendi viittaa huonoon ennusteeseen. Lapsella ei säädetä ventilaatiota kapnolukeman mukaan.',
    tone: 'neutral',
    pts: '0,124 300,120',
  },
  rosc: {
    label: 'Verenkierto palaa',
    dir: 'Nousee äkillisesti',
    why: 'Kun perfusoiva rytmi palaa, verenkierto tuo kertyneen hiilidioksidin keuhkoihin.',
    act: 'Tarkista syke ja rytmi. Nouseva trendi viittaa verenkierron palautumiseen.',
    tone: 'ok',
    pts: '0,124 150,122 175,50 300,58',
  },
  zero: {
    label: 'Putoaa nollaan',
    dir: 'Nollaan',
    why: 'Putki on lipsahtanut paikaltaan (esim. ruokatorveen) tai potilas on menettänyt verenkiertonsa.',
    act: 'Tarkista potilas ja putki heti. Ellei kapnografi piirrä eikä teknistä syytä löydy, tehdään uusi laryngoskopia – ellei varmuutta saada, putki poistetaan ja ventiloidaan naamarilla.',
    tone: 'danger',
    pts: '0,60 140,60 152,140 300,140',
  },
}
const ORDER: Id[] = ['normal', 'hypo', 'hyper', 'flow', 'leak', 'cpr', 'rosc', 'zero']

export default function Capnometry() {
  const [id, setId] = useState<Id>('flow')
  const reduce = useReducedMotion()
  const s = S[id]

  return (
    <div>
      <svg viewBox="0 0 320 160" className="h-auto w-full" role="img" aria-label={`EtCO₂-trendi: ${s.label}, ${s.dir}`}>
        <g aria-hidden>
          <line x1={10} y1={140} x2={310} y2={140} stroke={svg.line} strokeWidth={1.5} />
          <line x1={10} y1={10} x2={10} y2={140} stroke={svg.line} strokeWidth={1.5} />
          <text x={16} y={20} fontSize={10} fill={svg.dim}>
            EtCO₂ ↑
          </text>
          <text x={306} y={154} fontSize={10} fill={svg.dim} textAnchor="end">
            aika →
          </text>
          <line x1={10} y1={60} x2={310} y2={60} stroke={svg.teal} strokeOpacity={0.4} strokeDasharray="4 5" />
          <text x={306} y={54} fontSize={9} fill={svg.teal} textAnchor="end">
            lähtötaso
          </text>
          <g transform="translate(10 0)">
            <motion.polyline
              key={id}
              points={s.pts}
              fill="none"
              stroke={s.tone === 'danger' ? svg.danger : s.tone === 'ok' ? svg.teal : svg.brand}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0 : 1 }}
            />
          </g>
        </g>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {ORDER.map((k) => (
          <button
            key={k}
            onClick={() => setId(k)}
            aria-pressed={id === k}
            className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-[12.5px] leading-snug transition-[background-color,border-color] duration-150 ${
              id === k ? 'border-brand-500 bg-brand-500/10 font-semibold text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'
            }`}
          >
            {S[k].label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={id}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mt-3 flex flex-col gap-2"
        >
          <div className="rounded-xl bg-[var(--bg)] px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">EtCO₂: {s.dir}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{s.why}</p>
          </div>
          <Result tone={s.tone} title="Mitä teet">
            {s.act}
          </Result>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
