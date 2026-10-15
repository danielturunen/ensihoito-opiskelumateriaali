import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { Bullets, FadeSwap, Stage, StateTabs, rc, spring } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'

/* Adrenergic receptors and four drugs (articles Adrenaliini, Noradrenaliini, Metoprololi, Ipratropiumbromidi +
 * salbutamoli; Akuuttihoidon lääkkeet 2025). α receptors constrict vessels, β1 speeds and strengthens the heart,
 * β2 relaxes the bronchi. Magnitudes are schematic. */

type Drug = 'adr' | 'nor' | 'meto' | 'salb'
type Eff = -1 | 0 | 1 | 2

interface Cfg {
  label: string
  vessel: Eff // + = constriction
  heart: Eff // + = faster/stronger
  bronchus: Eff // + = dilation
  rec: { a: 'on' | 'off' | 'block'; b1: 'on' | 'off' | 'block' | 'weak'; b2: 'on' | 'off' | 'block' }
  items: string[]
}

const CFG: Record<Drug, Cfg> = {
  adr: {
    label: 'Adrenaliini',
    vessel: 1,
    heart: 2,
    bronchus: 2,
    rec: { a: 'on', b1: 'on', b2: 'on' },
    items: ['Stimuloi sekä α- että β-reseptoreita: supistaa verisuonia, nopeuttaa sykettä ja laajentaa keuhkoputkia – siksi se on anafylaksian tärkein lääke.', 'Haitat: takykardia, rytmihäiriöt ja liiallinen verisuonten supistuminen.', 'Beetasalpaajaa käyttävällä adrenaliinin teho voi olla heikentynyt.'],
  },
  nor: {
    label: 'Noradrenaliini',
    vessel: 2,
    heart: 0,
    bronchus: 0,
    rec: { a: 'on', b1: 'weak', b2: 'off' },
    items: ['Vaikuttaa pääasiassa α-reseptoreihin: supistaa verisuonia ja nostaa verenpainetta – ensisijainen vasopressori.', 'β-vaikutus vaihtelee hemodynaamisen tilan mukaan. Ilman supistusvoimaa lisäävää lääkettä se voi heikentää pumppausta, koska jälkikuorma kasvaa.', 'Ei korvaa adrenaliinia anafylaksiassa eikä sitä käytetä, jos keuhkoputket ovat ahtautuneet.'],
  },
  meto: {
    label: 'Metoprololi',
    vessel: 0,
    heart: -1,
    bronchus: 0,
    rec: { a: 'off', b1: 'block', b2: 'off' },
    items: ['Selektiivinen β1-salpaaja: syke hidastuu ja supistusvoima heikkenee, jolloin sydämen hapenkulutus pienenee.', 'Ei, kun nopea syke on kompensaatiota: hypotensio, sokki, infektio, kuume, kuivuma ja verenvuoto.', 'Obstruktiivisessa keuhkosairaudessa beeta-2-agonisti voi olla tarpeen.'],
  },
  salb: {
    label: 'Salbutamoli',
    vessel: 0,
    heart: 1,
    bronchus: 2,
    rec: { a: 'off', b1: 'off', b2: 'on' },
    items: ['Lyhytvaikutteinen β2-agonisti: keuhkoputkien sileä lihas relaksoituu minuuteissa.', 'Haitat: vapina, takykardia, sydämentykytys ja levottomuus.', 'Ei auta ylähengitysteiden tukokseen eikä hypotensioon, eikä se korvaa adrenaliinia.'],
  },
}

function Badge({ x, y, name, state }: { x: number; y: number; name: string; state: 'on' | 'off' | 'block' | 'weak' }) {
  const fill = state === 'on' ? svg.tealSoft : state === 'block' ? svg.dangerSoft : state === 'weak' ? svg.tealSoft : svg.surface
  const stroke = state === 'on' ? svg.teal : state === 'block' ? svg.danger : state === 'weak' ? svg.teal : svg.line
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-22} y={-11} width={44} height={22} rx={11} fill={fill} stroke={stroke} strokeDasharray={state === 'weak' ? '3 2' : undefined} strokeWidth={1.4} />
      <text x={0} y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill={state === 'off' ? svg.dim : svg.ink}>
        {name}
      </text>
      {state === 'block' && <path d="M14 -14l8 8M22 -14l-8 8" stroke={svg.danger} strokeWidth={2.2} strokeLinecap="round" />}
    </g>
  )
}

export default function Adrenergic(props: WidgetProps) {
  const [drug, setDrug] = useState<Drug>((['adr', 'nor', 'meto', 'salb'] as Drug[]).includes(props.initial as Drug) ? (props.initial as Drug) : 'adr')
  const c = CFG[drug]
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % 1000))

  // heart: beats per second (schematic)
  const bps = [0.7, 1.15, 1.6, 2.1][c.heart + 1]
  const phase = (t * bps) % 1
  const beat = phase < 0.18 ? Math.sin((phase / 0.18) * Math.PI) : 0
  const strength = c.heart > 0 ? 0.13 : c.heart < 0 ? 0.06 : 0.09
  const vesselR = [17, 13, 9][Math.max(0, c.vessel)]
  const lumen = [9, 9, 15, 19][c.bronchus + 1]

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="adrenergic-drug"
        value={drug}
        onChange={setDrug}
        gridOnly
        options={[
          { value: 'adr', label: 'Adrenaliini' },
          { value: 'nor', label: 'Noradrenaliini' },
          { value: 'meto', label: 'Metoprololi' },
          { value: 'salb', label: 'Salbutamoli' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 340 196" className="h-auto w-full" role="img" aria-label={`${c.label}: verisuoni ${c.vessel > 0 ? 'supistuu' : 'ennallaan'}, syke ${c.heart > 0 ? 'nopeutuu' : c.heart < 0 ? 'hidastuu' : 'ennallaan'}, keuhkoputki ${c.bronchus > 0 ? 'laajenee' : 'ennallaan'}.`}>
          {/* vessel cross-section */}
          <g transform="translate(58 82)">
            <circle r={30} fill={rc.tissueSoft} stroke={rc.tissue} strokeWidth={1.4} />
            <motion.circle r={vesselR} fill={rc.oxy} fillOpacity={0.55} initial={false} animate={{ r: vesselR }} transition={spring} />
            <text y={50} textAnchor="middle" fontSize={11} fontWeight={600} fill={svg.ink}>
              verisuoni
            </text>
            <text y={64} textAnchor="middle" fontSize={10} fill={c.vessel > 0 ? svg.danger : svg.dim}>
              {c.vessel === 2 ? 'supistuu voimakkaasti' : c.vessel === 1 ? 'supistuu' : 'ennallaan'}
            </text>
          </g>
          <Badge x={58} y={24} name="α" state={c.rec.a} />

          {/* heart */}
          <g transform="translate(170 82)">
            <g transform={`scale(${(1 + beat * strength).toFixed(3)})`}>
              <path d="M0 26C-30 6 -30 -18 -15 -22C-6 -24 -1 -18 0 -12C1 -18 6 -24 15 -22C30 -18 30 6 0 26Z" fill={rc.heartSoft} stroke={rc.heart} strokeWidth={1.6} />
            </g>
            <text y={50} textAnchor="middle" fontSize={11} fontWeight={600} fill={svg.ink}>
              sydän
            </text>
            <text y={64} textAnchor="middle" fontSize={10} fill={c.heart > 0 ? svg.danger : c.heart < 0 ? svg.teal : svg.dim}>
              {c.heart === 2 ? 'syke ja voima ↑↑' : c.heart === 1 ? 'syke ↑' : c.heart === -1 ? 'syke ja voima ↓' : 'ennallaan'}
            </text>
          </g>
          <Badge x={170} y={24} name="β1" state={c.rec.b1} />

          {/* bronchus */}
          <g transform="translate(282 82)">
            <circle r={30} fill={rc.muscleSoft} stroke={rc.muscle} strokeWidth={1.4} />
            <circle r={24} fill={rc.mucosaSoft} />
            <motion.circle fill={svg.surface} stroke={rc.airLine} strokeWidth={1.2} initial={false} animate={{ r: lumen }} transition={spring} />
            <text y={50} textAnchor="middle" fontSize={11} fontWeight={600} fill={svg.ink}>
              keuhkoputki
            </text>
            <text y={64} textAnchor="middle" fontSize={10} fill={c.bronchus > 0 ? svg.teal : svg.dim}>
              {c.bronchus > 0 ? 'laajenee' : 'ennallaan'}
            </text>
          </g>
          <Badge x={282} y={24} name="β2" state={c.rec.b2} />

          <g transform="translate(10 178)">
            <rect x={0} y={-8} width={12} height={12} rx={6} fill={svg.tealSoft} stroke={svg.teal} />
            <text x={18} y={2} fontSize={10} fill={svg.dim}>
              stimuloi
            </text>
            <rect x={78} y={-8} width={12} height={12} rx={6} fill={svg.dangerSoft} stroke={svg.danger} />
            <text x={96} y={2} fontSize={10} fill={svg.dim}>
              salpaa
            </text>
            <rect x={150} y={-8} width={12} height={12} rx={6} fill={svg.tealSoft} stroke={svg.teal} strokeDasharray="3 2" />
            <text x={168} y={2} fontSize={10} fill={svg.dim}>
              vaihteleva
            </text>
            <text x={320} y={2} textAnchor="end" fontSize={10} fill={svg.dim}>
              kaavamainen
            </text>
          </g>
        </svg>
      </Stage>
      <FadeSwap k={drug} className="mt-3">
        <p className="mb-1.5 font-display text-[15px] font-semibold text-[var(--text)]">{c.label}</p>
        <Bullets items={c.items} />
      </FadeSwap>
    </div>
  )
}
