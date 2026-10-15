import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { svg } from '../ui'
import { FadeSwap, Stage, StateTabs, rc } from '../parts/resp-kit'
import { seeded, useFrameLoop } from '../parts/cardio-hooks'

/* Antiplatelet drugs (articles Asetyylisalisyylihappo, Klopidogreeli, Tikagrelori, Rintakipu ja AKS;
 * Akuuttihoidon lääkkeet 2025, Käypä hoito Sepelvaltimotautikohtaus). Two activation routes – thromboxane A2
 * and ADP via the P2Y12 receptor – drive platelet aggregation at a damaged plaque. Plug sizes are schematic. */

type Mode = 'none' | 'asa' | 'p2y12' | 'dapt'

const CFG: Record<Mode, { cap: number; txa: boolean; adp: boolean; title: string; text: string }> = {
  none: { cap: 34, txa: true, adp: true, title: 'Ilman lääkettä', text: 'Revenneen plakin kohdalla verihiutaleet aktivoituvat ja kasautuvat. Tromboksaani A2 ja ADP välittävät verihiutaleiden aktivaatiota ja kasautumista, ja tulppa kasvaa – sepelvaltimotautikohtauksessa se voi tukkia suonen.' },
  asa: { cap: 20, txa: false, adp: true, title: 'ASA: tromboksaani A2 estetty', text: 'ASA estää palautumattomasti tromboksaani A2:n muodostumisen. AKS-epäilyssä 250 mg p.o. tai i.v. heti – myös kotilääkkeenä ASA:ta käyttävälle.' },
  p2y12: { cap: 18, txa: true, adp: false, title: 'ADP-reseptorin salpaaja: P2Y12 estetty', text: 'Klopidogreeli (palautumaton) ja tikagrelori (palautuva) salpaavat ADP:n P2Y12-reseptorin. Ensihoidossa niitä annetaan harvoin: STEMI:n PCI-esilääkityksenä, liuotushoidossa tai ASA-allergiselle alueellisen ohjeen mukaan.' },
  dapt: { cap: 8, txa: false, adp: false, title: 'Kaksoisesto: ASA + ADP-reseptorin salpaaja', text: 'Molempien reittien esto pienentää tulppaa eniten, mutta lisää myös verenvuotoja. Pallolaajennuksen jälkeen kaksoisestoa ei saa tauottaa omin päin – tauotus suurentaa stenttitromboosin riskiä moninkertaisesti.' },
}

const WALL_TOP = 40
const WALL_BOT = 132
const INJ_X = 182

// pile slots for the aggregate, bottom-up
const PILE: [number, number][] = []
for (let row = 0; row < 7; row++) {
  const n = 8 - row
  for (let k = 0; k < n; k++) {
    PILE.push([INJ_X - (n - 1) * 4.6 + k * 9.2 + (row % 2) * 2, WALL_BOT - 6 - row * 7.6])
  }
}

const rnd = seeded(7)
const FLOW = Array.from({ length: 16 }, () => ({ lane: WALL_TOP + 10 + rnd() * (WALL_BOT - WALL_TOP - 20), off: rnd(), speed: 0.12 + rnd() * 0.06 }))
const RBC = Array.from({ length: 7 }, () => ({ lane: WALL_TOP + 14 + rnd() * (WALL_BOT - WALL_TOP - 28), off: rnd() }))

function Platelet({ x, y, active, o = 1 }: { x: number; y: number; active: boolean; o?: number }) {
  return active ? (
    <path transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} d="M-4.5 0L-2 -1.5L0 -4.5L2 -1.5L4.5 0L2 1.5L0 4.5L-2 1.5Z" fill="#f2c94c" stroke="#b8901f" strokeWidth={0.8} opacity={o} />
  ) : (
    <ellipse cx={x} cy={y} rx={4.6} ry={2.6} fill="#f6dc8a" stroke="#c9a227" strokeWidth={0.8} opacity={o} />
  )
}

function Route({ x, y, label, sub, open, drug }: { x: number; y: number; label: string; sub: string; open: boolean; drug: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={-13} width={148} height={30} rx={8} fill={open ? svg.surface : svg.dangerSoft} stroke={open ? svg.line : svg.danger} />
      <text x={8} y={0} fontSize={10.5} fontWeight={700} fill={svg.ink}>
        {label}
      </text>
      <text x={8} y={12} fontSize={9.5} fill={svg.dim}>
        {open ? sub : `estää: ${drug}`}
      </text>
      {!open && <path d="M130 -6l10 10M140 -6l-10 10" stroke={svg.danger} strokeWidth={2.4} strokeLinecap="round" />}
      {open && <path d="M128 1h12m-4 -4l4 4l-4 4" fill="none" stroke={svg.teal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
    </g>
  )
}

export default function PlateletBlock(props: WidgetProps) {
  const [mode, setMode] = useState<Mode>((['none', 'asa', 'p2y12', 'dapt'] as Mode[]).includes(props.initial as Mode) ? (props.initial as Mode) : 'none')
  const c = CFG[mode]
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(6)
  const LOOP = 9
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % LOOP))
  const grow = Math.min(1, t / 6)
  const fade = t > 8 ? 1 - (t - 8) : 1
  const count = Math.round(c.cap * grow)

  return (
    <div ref={ref}>
      <StateTabs
        layoutId="platelet-mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'none', label: 'Ei lääkettä' },
          { value: 'asa', label: 'ASA' },
          { value: 'p2y12', label: 'ADP-salpaaja' },
          { value: 'dapt', label: 'Molemmat' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 340 230" className="h-auto w-full" role="img" aria-label={`${c.title}: verihiutaletulppa ${c.cap > 25 ? 'suuri' : c.cap > 12 ? 'pienempi' : 'pieni'}.`}>
          {/* vessel */}
          <rect x={6} y={WALL_TOP - 8} width={328} height={8} rx={3} fill={rc.tissueSoft} stroke={rc.tissue} />
          <path d={`M6 ${WALL_BOT}H${INJ_X - 34}C${INJ_X - 24} ${WALL_BOT - 4} ${INJ_X - 14} ${WALL_BOT - 6} ${INJ_X} ${WALL_BOT - 5}C${INJ_X + 14} ${WALL_BOT - 6} ${INJ_X + 24} ${WALL_BOT - 4} ${INJ_X + 34} ${WALL_BOT}H334V${WALL_BOT + 8}H6Z`} fill={rc.tissueSoft} stroke={rc.tissue} />
          <path d={`M${INJ_X - 22} ${WALL_BOT - 2}l5 6l5 -7l5 7l5 -6l5 6l5 -7l5 6`} fill="none" stroke={svg.brand} strokeWidth={1.6} strokeLinejoin="round" />
          <text x={INJ_X} y={WALL_BOT + 22} textAnchor="middle" fontSize={10.5} fill={svg.brand}>
            revennyt plakki
          </text>
          <text x={10} y={WALL_TOP - 14} fontSize={10.5} fill={svg.dim}>
            sepelvaltimo
          </text>

          {RBC.map((r, i) => {
            const x = 6 + (((r.off + t * 0.07) % 1) * 328)
            return <ellipse key={`r${i}`} cx={x} cy={r.lane} rx={7} ry={4.5} fill={rc.oxy} opacity={0.35} />
          })}
          {FLOW.map((f, i) => {
            const x = 6 + (((f.off + t * f.speed) % 1) * 328)
            return <Platelet key={`f${i}`} x={x} y={f.lane} active={false} o={0.85} />
          })}
          {PILE.slice(0, count).map(([x, y], i) => (
            <Platelet key={`p${i}`} x={x} y={y} active o={fade} />
          ))}

          {/* activation routes */}
          <text x={10} y={178} fontSize={10.5} fontWeight={600} fill={svg.ink}>
            Aktivaatioreitit
          </text>
          <Route x={10} y={200} label="Tromboksaani A2" sub="vahvistaa kasautumista" open={c.txa} drug="ASA" />
          <Route x={176} y={200} label="ADP → P2Y12" sub="vahvistaa kasautumista" open={c.adp} drug="klopidogreeli, tikagrelori" />
        </svg>
      </Stage>
      <FadeSwap k={mode} className="mt-3">
        <p className="font-display text-[15px] font-semibold text-[var(--text)]">{c.title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{c.text}</p>
      </FadeSwap>
      <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-[var(--bg)] text-[var(--text-dim)]">
            <tr>
              <th className="px-2.5 py-2 font-semibold">Lääke</th>
              <th className="px-2.5 py-2 font-semibold">Sitoutuminen</th>
              <th className="px-2.5 py-2 font-semibold">Alkaa</th>
              <th className="px-2.5 py-2 font-semibold">Häviää</th>
            </tr>
          </thead>
          <tbody className="text-[var(--text)]">
            <tr className="border-t border-[var(--border)]">
              <td className="px-2.5 py-2 font-semibold">ASA</td>
              <td className="px-2.5 py-2">palautumaton</td>
              <td className="px-2.5 py-2">–</td>
              <td className="px-2.5 py-2">–</td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <td className="px-2.5 py-2 font-semibold">Klopidogreeli</td>
              <td className="px-2.5 py-2">palautumaton</td>
              <td className="px-2.5 py-2">3–6 h</td>
              <td className="px-2.5 py-2">n. 5 vrk</td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <td className="px-2.5 py-2 font-semibold">Tikagrelori</td>
              <td className="px-2.5 py-2">palautuva</td>
              <td className="px-2.5 py-2">½–2 h</td>
              <td className="px-2.5 py-2">3–7 vrk</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] leading-snug text-[var(--text-dim)]">Tulpan koot ovat kaavamaisia. Ajat: Käypä hoito ja Akuuttihoidon lääkkeet (tikagrelorin häviämisaika vaihtelee lähteittäin).</p>
    </div>
  )
}
