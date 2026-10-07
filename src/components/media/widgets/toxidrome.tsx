import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Activity, ArrowRight, Check, Droplets, Lightbulb, Minus, Sun, TrendingDown, TrendingUp, X, type LucideIcon } from 'lucide-react'
import { Caption, Segmented } from '../ui'
import { MiniPupil, type PupilSize } from '../parts/misc-eye'

type Hr = 'high' | 'low' | 'var'
type Sk = 'sweaty' | 'dry' | 'normal'
type Pu = PupilSize
type ToxId = 'sympa' | 'antikol' | 'kol' | 'opioid' | 'sedat'

interface Opt<T extends string> {
  value: T
  label: string
  icon: ReactNode
}

const ic = (Icon: LucideIcon) => <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />

const HR_OPTS: Opt<Hr>[] = [
  { value: 'high', label: 'Koholla', icon: ic(TrendingUp) },
  { value: 'low', label: 'Matala', icon: ic(TrendingDown) },
  { value: 'var', label: 'Normaali tai vaihteleva', icon: ic(Activity) },
]
const PU_OPTS: Opt<Pu>[] = [
  { value: 'large', label: 'Laajat', icon: <MiniPupil size="large" /> },
  { value: 'small', label: 'Pienet', icon: <MiniPupil size="small" /> },
  { value: 'normal', label: 'Normaalit', icon: <MiniPupil size="normal" /> },
]
const SK_OPTS: Opt<Sk>[] = [
  { value: 'sweaty', label: 'Hikoileva', icon: ic(Droplets) },
  { value: 'dry', label: 'Kuiva ja punoittava', icon: ic(Sun) },
  { value: 'normal', label: 'Normaali tai viileä', icon: ic(Minus) },
]

interface Tox {
  id: ToxId
  name: string
  hr: Hr[]
  pu: Pu[]
  sk: Sk[]
  agents: string
  /** finding texts as in the article table */
  show: { hr: string; pu: string; sk: string }
}

// Article: intoksikaatiopotilaan-hoito, toksidromitaulukko.
const TOX: Tox[] = [
  {
    id: 'sympa',
    name: 'Sympatomimeettinen',
    hr: ['high'],
    pu: ['large'],
    sk: ['sweaty'],
    agents: 'Amfetamiini, kokaiini, ekstaasi',
    show: { hr: 'Koholla', pu: 'Laajat', sk: 'Hikoileva' },
  },
  {
    id: 'antikol',
    name: 'Antikolinerginen',
    hr: ['high'],
    pu: ['large'],
    sk: ['dry'],
    agents: 'Trisykliset masennuslääkkeet, atropiini',
    show: { hr: 'Koholla', pu: 'Laajat', sk: 'Kuiva, punoittava' },
  },
  {
    id: 'kol',
    name: 'Kolinerginen',
    hr: ['var'],
    pu: ['small'],
    sk: ['sweaty'],
    agents: 'Torjunta-aineet, hermokaasut',
    show: { hr: 'Vaihtelee', pu: 'Pienet', sk: 'Hikoileva, ”märkä”' },
  },
  {
    id: 'opioid',
    name: 'Opioidi',
    hr: ['low'],
    pu: ['small'],
    sk: ['normal'],
    agents: 'Heroiini, morfiini, fentanyyli',
    show: { hr: 'Matala', pu: 'Pienet (mioosi)', sk: 'Normaali/viileä' },
  },
  {
    id: 'sedat',
    name: 'Sedatiivis-hypnoottinen',
    hr: ['low', 'var'],
    pu: ['normal'],
    sk: ['normal'],
    agents: 'Bentsodiatsepiinit, alkoholi',
    show: { hr: 'Matala/normaali', pu: 'Normaalit', sk: 'Normaali' },
  },
]

const TIP = 'Iho ratkaisee: hikinen → sympatomimeetti, kuiva ja punoittava → antikolinerginen.'
const spring = { type: 'spring', duration: 0.45, bounce: 0.12 } as const

/* ───────────────────────── Shared bits ───────────────────────── */

function ChipRow<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T | null
  onChange: (v: T | null) => void
  options: Opt<T>[]
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{label}</legend>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? null : o.value)}
              className={`flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-center text-[12.5px] leading-tight transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] ${
                active
                  ? 'border-brand-500 bg-brand-500/10 font-semibold text-[var(--text)]'
                  : 'border-[var(--border)] font-medium text-[var(--text-dim)]'
              }`}
            >
              <span className={active ? 'text-brand-600' : ''}>{o.icon}</span>
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function findingIcon(kind: 'hr' | 'pu' | 'sk', t: Tox) {
  if (kind === 'hr') return HR_OPTS.find((o) => o.value === t.hr[0])!.icon
  if (kind === 'pu') return PU_OPTS.find((o) => o.value === t.pu[0])!.icon
  return SK_OPTS.find((o) => o.value === t.sk[0])!.icon
}

const KIND_SHORT = { hr: 'Syke/RR', pu: 'Pupillit', sk: 'Iho' } as const

/* ───────────────────────── Tunnista ───────────────────────── */

function Identify() {
  const reduce = useReducedMotion()
  const [hr, setHr] = useState<Hr | null>(null)
  const [pu, setPu] = useState<Pu | null>(null)
  const [sk, setSk] = useState<Sk | null>(null)
  const n = (hr ? 1 : 0) + (pu ? 1 : 0) + (sk ? 1 : 0)

  const match = (t: Tox) => ({
    hr: hr ? t.hr.includes(hr) : null,
    pu: pu ? t.pu.includes(pu) : null,
    sk: sk ? t.sk.includes(sk) : null,
  })
  const ranked = TOX.map((t, i) => {
    const m = match(t)
    return { t, i, m, score: [m.hr, m.pu, m.sk].filter(Boolean).length }
  }).sort((a, b) => b.score - a.score || a.i - b.i)

  const top = ranked[0]
  const topGroup = ranked.filter((r) => r.score === top.score)
  const showTip = top.score > 0 && topGroup.some((r) => r.t.id === 'sympa') && topGroup.some((r) => r.t.id === 'antikol')
  const others = topGroup.slice(1).map((r) => r.t.name)

  return (
    <div>
      <div className="flex flex-col gap-3">
        <ChipRow label="Syke/verenpaine" value={hr} onChange={setHr} options={HR_OPTS} />
        <ChipRow label="Pupillit" value={pu} onChange={setPu} options={PU_OPTS} />
        <ChipRow label="Iho" value={sk} onChange={setSk} options={SK_OPTS} />
      </div>

      <div className="mt-4" aria-live="polite">
        {n === 0 || top.score === 0 ? (
          <div className="flex min-h-[104px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] px-4 py-3 text-center text-[13px] text-[var(--text-dim)]">
            {n === 0 ? 'Valitse löydökset – todennäköisin toksidromi päivittyy heti.' : 'Mikään toksidromi ei sovi valittuihin löydöksiin.'}
          </div>
        ) : (
          <motion.div
            key={top.t.id}
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0 } : spring}
            className={`rounded-xl border px-4 py-3 ${top.score === n && n === 3 ? 'border-teal-500/35 bg-teal-500/10' : 'border-brand-500/30 bg-brand-500/8'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{others.length ? 'Parhaat osumat' : 'Paras osuma'}</p>
                <p className="font-display text-[18px] font-bold leading-tight text-[var(--text)]">{top.t.name}</p>
                {others.length > 0 && <p className="text-[13px] font-medium text-[var(--text-dim)]">yhtä hyvin: {others.join(', ')}</p>}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 font-display text-[15px] font-bold tabular-nums ${
                  top.score === n ? 'bg-teal-500/15 text-teal-600' : 'bg-brand-500/12 text-brand-600'
                }`}
              >
                {top.score}/{n}
              </span>
            </div>
            <p className="mt-1.5 text-[13px] leading-snug text-[var(--text)]">
              <span className="text-[var(--text-dim)]">Tyypillisiä aiheuttajia: </span>
              {top.t.agents}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(['hr', 'pu', 'sk'] as const).map((k) => {
                const ok = top.m[k]
                return (
                  <span
                    key={k}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] font-medium ${
                      ok === true
                        ? 'bg-teal-500/12 text-teal-600'
                        : ok === false
                          ? 'bg-danger-500/10 text-danger-500'
                          : 'bg-[var(--bg)] text-[var(--text-dim)]'
                    }`}
                  >
                    {ok === true ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : ok === false ? <X className="h-3.5 w-3.5" strokeWidth={3} /> : <Minus className="h-3.5 w-3.5" />}
                    {top.t.show[k]}
                  </span>
                )
              })}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {showTip && (
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduce ? undefined : { opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <p className="mt-2 flex gap-2 rounded-xl bg-brand-500/10 px-3.5 py-2.5 text-[13px] leading-snug text-[var(--text)]">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.25} />
                {TIP}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {n > 0 && top.score > 0 && (
          <ol className="mt-3 flex flex-col gap-1">
            {ranked.map((r) => (
              <motion.li
                key={r.t.id}
                layout={!reduce}
                transition={spring}
                className="flex min-h-[32px] items-center gap-3 rounded-lg px-1"
              >
                <span className={`min-w-0 flex-1 truncate text-[13px] ${r === top ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-dim)]'}`}>{r.t.name}</span>
                <span className="relative h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-[var(--bg)] sm:w-28">
                  <motion.span
                    className={`absolute inset-0 origin-left rounded-full ${r.score === n ? 'bg-teal-500' : 'bg-brand-500'}`}
                    initial={false}
                    animate={{ scaleX: n ? r.score / n : 0 }}
                    transition={reduce ? { duration: 0 } : spring}
                  />
                </span>
                <span className="w-8 shrink-0 text-right font-display text-[13px] font-semibold tabular-nums text-[var(--text-dim)]">
                  {r.score}/{n}
                </span>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────── Harjoittele ───────────────────────── */

function pickNext(prev?: ToxId): ToxId {
  const pool = TOX.filter((t) => t.id !== prev)
  return pool[Math.floor(Math.random() * pool.length)].id
}

function Practice() {
  const reduce = useReducedMotion()
  const [cur, setCur] = useState<ToxId>(() => pickNext())
  const [picked, setPicked] = useState<ToxId | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const t = TOX.find((x) => x.id === cur)!
  const right = picked === cur

  function pick(id: ToxId) {
    if (picked) return
    setPicked(id)
    setScore((s) => ({ right: s.right + (id === cur ? 1 : 0), total: s.total + 1 }))
  }

  function next() {
    setCur((c) => pickNext(c))
    setPicked(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Potilaan löydökset</p>
        <span className="rounded-full bg-[var(--bg)] px-2.5 py-1 font-display text-[13px] font-semibold tabular-nums text-[var(--text)]">
          {score.right}/{score.total} oikein
        </span>
      </div>

      <motion.div
        key={`${cur}-${score.total}`}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="mt-2 grid grid-cols-3 gap-1.5"
      >
        {(['hr', 'pu', 'sk'] as const).map((k) => (
          <div key={k} className="flex flex-col items-center gap-1 rounded-xl bg-[var(--bg)] px-1.5 py-2.5 text-center">
            <span className="text-brand-600">{findingIcon(k, t)}</span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--text-dim)]">{KIND_SHORT[k]}</span>
            <span className="text-[13px] font-semibold leading-tight text-[var(--text)]">{t.show[k]}</span>
          </div>
        ))}
      </motion.div>

      <p className="mt-3 text-[13px] font-medium text-[var(--text)]">Mikä toksidromi?</p>
      <div className="mt-1.5 flex flex-col gap-1.5">
        {TOX.map((o) => {
          const isRight = picked && o.id === cur
          const isWrongPick = picked === o.id && o.id !== cur
          return (
            <button
              key={o.id}
              type="button"
              disabled={!!picked}
              onClick={() => pick(o.id)}
              className={`flex min-h-[44px] items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-left text-[13.5px] transition-[background-color,border-color,opacity,transform] duration-150 ease-out enabled:active:scale-[0.99] ${
                isRight
                  ? 'border-teal-500 bg-teal-500/10 font-semibold text-[var(--text)]'
                  : isWrongPick
                    ? 'border-danger-500 bg-danger-500/10 font-semibold text-[var(--text)]'
                    : picked
                      ? 'border-[var(--border)] text-[var(--text-dim)] opacity-60'
                      : 'border-[var(--border)] font-medium text-[var(--text)]'
              }`}
            >
              {o.name}
              {isRight && <Check className="h-4 w-4 shrink-0 text-teal-600" strokeWidth={3} />}
              {isWrongPick && <X className="h-4 w-4 shrink-0 text-danger-500" strokeWidth={3} />}
            </button>
          )
        })}
      </div>

      <AnimatePresence initial={false}>
        {picked && (
          <motion.div
            key="fb"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduce ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className={`mt-3 rounded-xl border px-4 py-3 ${right ? 'border-teal-500/30 bg-teal-500/10' : 'border-danger-500/30 bg-danger-500/10'}`} aria-live="polite">
              <p className={`font-display text-[15px] font-semibold ${right ? 'text-teal-600' : 'text-danger-500'}`}>{right ? 'Oikein!' : `Ei aivan – oikea vastaus: ${t.name}`}</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--text-dim)]">Tyypillisiä aiheuttajia: {t.agents}.</p>
              {(t.id === 'sympa' || t.id === 'antikol') && <p className="mt-1 text-[13px] leading-snug text-[var(--text-dim)]">{TIP}</p>}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-brand-500 px-5 text-[14px] font-semibold text-white shadow-sm shadow-brand-500/30 transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                Seuraava <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ───────────────────────── Widget ───────────────────────── */

export default function Toxidrome() {
  const [mode, setMode] = useState<'identify' | 'practice'>('identify')
  return (
    <div>
      <Segmented
        layoutId="toxidrome-mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'identify', label: 'Tunnista' },
          { value: 'practice', label: 'Harjoittele' },
        ]}
      />
      <div className="mt-4">{mode === 'identify' ? <Identify /> : <Practice />}</div>
      <div className="mt-4 rounded-xl bg-[var(--bg)] px-3.5 py-2.5">
        <Caption>
          <span className="font-semibold text-[var(--text)]">”Hoida potilasta, älä myrkkyä”</span> – ABCDE menee aina antidoottien edelle. Mittaa verensokeri
          kaikilta tajunnaltaan poikkeavilta.
        </Caption>
      </div>
    </div>
  )
}
