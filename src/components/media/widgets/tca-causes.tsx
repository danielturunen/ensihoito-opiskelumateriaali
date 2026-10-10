import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { svg } from '../ui'

/* Reversible causes of traumatic cardiac arrest and the simultaneous actions of the
 * TCA / peri-arrest algorithm (European Trauma Course manual, ch. 5c, fig. 5c.1). */

type Cause = 'hypo' | 'tension' | 'hypox' | 'tamp'

const CAUSES: { id: Cause; label: string; pct: number; color: string; note: string }[] = [
  {
    id: 'hypo',
    label: 'Hypovolemia',
    pct: 48,
    color: svg.danger,
    note: 'Hallitsematon verenvuoto. Periaate on vuodon tyrehdytys viiveettä – yleensä kirurgisesti tai radiologisesti. Sallittu hypotensio: nestettä vain sen verran, että rannesyke säilyy; verivalmisteet ensisijaisena elvytysnesteenä (punasolut, plasma, verihiutaleet 1:1:1).',
  },
  {
    id: 'tension',
    label: 'Jänniteilmarinta',
    pct: 13,
    color: '#38bdf8',
    note: 'Molemminpuolinen paineenpurku torakostomioilla 4. kylkivälistä, tarvittaessa jatkettuna simpukkatorakotomiaksi. Ylipaineventilaatiossa torakostomia on todennäköisesti tehokkaampi kuin neula ja nopeampi kuin dreeni.',
  },
  {
    id: 'hypox',
    label: 'Hypoksemia',
    pct: 13,
    color: svg.teal,
    note: 'Ilmatietukos tai traumaattinen asfyksia. Perustoimet ja toisen sukupolven supraglottinen väline, jos intubaatio ei onnistu heti. Ylipaineventilaatio heikentää laskimopaluuta – pienet kertatilavuudet ja hidas taajuus, kapnografia ja normokapnia.',
  },
  {
    id: 'tamp',
    label: 'Tamponaatio',
    pct: 10,
    color: svg.brand,
    note: 'Lävistävä vamma rintakehään tai ylävatsaan ja sydänpysähdys → välitön elvytystorakotomia (simpukkaviilto) voi pelastaa. Ennuste on noin neljä kertaa parempi puukotushaavassa kuin ampumahaavassa.',
  },
]

const ACTIONS: { n: number; text: string; causes: Cause[] }[] = [
  { n: 1, text: 'Hallitse katastrofaalinen ulkoinen vuoto', causes: ['hypo'] },
  { n: 2, text: 'Varmista ilmatie ja maksimoi hapetus', causes: ['hypox'] },
  { n: 3, text: 'Molemminpuolinen rintakehän paineenpurku (torakostomiat)', causes: ['tension'] },
  { n: 4, text: 'Pura tamponaatio (lävistävä rintakehävamma)', causes: ['tamp'] },
  { n: 5, text: 'Proksimaalinen verisuonikontrolli (aortan painaminen käsin)', causes: ['hypo'] },
  { n: 6, text: 'Lantiovyö', causes: ['hypo'] },
  { n: 7, text: 'Verivalmisteet, massiivivuotoprotokolla', causes: ['hypo'] },
]

export default function TcaCauses() {
  const [sel, setSel] = useState<Cause>('hypo')
  const reduce = useReducedMotion()
  const cur = CAUSES.find((c) => c.id === sel)!

  // stacked bar: known causes, remainder not itemised in the source
  const total = 100
  let x = 0

  return (
    <div>
      <svg viewBox="0 0 320 64" className="h-auto w-full" role="img" aria-label="Traumaattisen sydänpysähdyksen syyt: hypovolemia 48 %, jänniteilmarinta 13 %, hypoksemia 13 %, tamponaatio noin 10 %">
        <g aria-hidden>
          {CAUSES.map((c) => {
            const w = (c.pct / total) * 300
            const g = (
              <g key={c.id} onClick={() => setSel(c.id)} style={{ cursor: 'pointer' }}>
                <motion.rect
                  x={10 + x}
                  y={14}
                  width={w - 2}
                  height={30}
                  rx={5}
                  fill={c.color}
                  initial={false}
                  animate={{ opacity: sel === c.id ? 1 : 0.35 }}
                  transition={{ duration: reduce ? 0 : 0.2 }}
                />
                <text x={10 + x + (w - 2) / 2} y={34} fontSize={w < 40 ? 9 : 11} fontWeight={700} fill="#fff" textAnchor="middle">
                  {c.id === 'tamp' ? '~10 %' : `${c.pct} %`}
                </text>
              </g>
            )
            x += w
            return g
          })}
          <rect x={10 + x} y={14} width={300 - x} height={30} rx={5} fill={svg.line} />
          <text x={10 + x + (300 - x) / 2} y={58} fontSize={9} fill={svg.dim} textAnchor="middle">
            muu
          </text>
        </g>
      </svg>

      <div className="mt-1 grid grid-cols-2 gap-1.5">
        {CAUSES.map((c) => {
          const active = sel === c.id
          return (
            <button
              key={c.id}
              onClick={() => setSel(c.id)}
              aria-pressed={active}
              className={`flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-2 text-left text-[13px] transition-[background-color,border-color] duration-150 ${
                active ? 'border-[var(--text-dim)] bg-[var(--bg-raised)] font-semibold text-[var(--text)]' : 'border-[var(--border)] text-[var(--text-dim)]'
              }`}
            >
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: c.color }} />
              {c.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={sel}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mt-3 rounded-xl bg-[var(--bg)] px-3.5 py-2.5 text-[13px] leading-relaxed text-[var(--text)]"
        >
          {cur.note}
        </motion.p>
      </AnimatePresence>

      <p className="mb-1.5 mt-4 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Samanaikaisesti – ennen painelua</p>
      <ol className="flex flex-col gap-1.5">
        {ACTIONS.map((a) => {
          const on = a.causes.includes(sel)
          return (
            <motion.li
              key={a.n}
              initial={false}
              animate={{ opacity: on ? 1 : 0.45 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
              className="flex items-start gap-2.5 rounded-xl border px-3 py-2 text-[13px]"
              style={{ borderColor: on ? cur.color : 'var(--border)' }}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold text-white" style={{ background: on ? cur.color : 'var(--text-dim)' }}>
                {a.n}
              </span>
              <span className="text-[var(--text)]">{a.text}</span>
            </motion.li>
          )
        })}
      </ol>
      <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-dim)]">
        Ensihoidossa: välitön kuljetus sopivaan sairaalaan. Sairaalassa: vauriokirurgia ja -elvytys. Jos verenkierto ei palaa, harkitaan elvytyksen lopettamista.
      </p>
    </div>
  )
}
