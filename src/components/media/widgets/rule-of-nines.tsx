import { useEffect, useId, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { Hand, Minus, Plus, RotateCcw } from 'lucide-react'
import { Caption, Result, Segmented, Stat, svg } from '../ui'
import { BODY_GAP, BodyShapePath, BodySilhouette, bodyShapes, type BodyPart, type BodyShape, type BodyView } from '../parts/body-silhouette'

/* 9:n sääntö – articles: palovamma (aikuinen) and lapsi-ensihoidossa (lapsi). */

type Key = `${BodyView}:${BodyPart}`

interface Area {
  pct: number
  name: string
}

// Adult rule of nines, split front/back: head 4.5 + 4.5, trunk 18 + 18, arm 4.5 + 4.5, leg 9 + 9, genitals 1.
type Age = 'adult' | 'child'
type AreaMap = Record<BodyView, Partial<Record<BodyPart, Area>>>

const ADULT: AreaMap = {
  front: {
    headNeck: { pct: 4.5, name: 'Pää ja kaula, etupuoli' },
    trunk: { pct: 18, name: 'Etuvartalo' },
    pelvis: { pct: 1, name: 'Genitaalialue' },
    armR: { pct: 4.5, name: 'Oikea yläraaja, etupuoli' },
    armL: { pct: 4.5, name: 'Vasen yläraaja, etupuoli' },
    legR: { pct: 9, name: 'Oikea alaraaja, etupuoli' },
    legL: { pct: 9, name: 'Vasen alaraaja, etupuoli' },
  },
  back: {
    headNeck: { pct: 4.5, name: 'Pää ja kaula, takapuoli' },
    trunk: { pct: 18, name: 'Takavartalo' },
    armR: { pct: 4.5, name: 'Oikea yläraaja, takapuoli' },
    armL: { pct: 4.5, name: 'Vasen yläraaja, takapuoli' },
    legR: { pct: 9, name: 'Oikea alaraaja, takapuoli' },
    legL: { pct: 9, name: 'Vasen alaraaja, takapuoli' },
  },
}

// Child (lasten ensihoidon lisämateriaali): head 18, trunk 18 per side, arm 9, leg 14 – split front/back.
const CHILD: AreaMap = {
  front: {
    headNeck: { pct: 9, name: 'Pää, etupuoli' },
    trunk: { pct: 18, name: 'Etuvartalo' },
    armR: { pct: 4.5, name: 'Oikea yläraaja, etupuoli' },
    armL: { pct: 4.5, name: 'Vasen yläraaja, etupuoli' },
    legR: { pct: 7, name: 'Oikea alaraaja, etupuoli' },
    legL: { pct: 7, name: 'Vasen alaraaja, etupuoli' },
  },
  back: {
    headNeck: { pct: 9, name: 'Pää, takapuoli' },
    trunk: { pct: 18, name: 'Takavartalo' },
    armR: { pct: 4.5, name: 'Oikea yläraaja, takapuoli' },
    armL: { pct: 4.5, name: 'Vasen yläraaja, takapuoli' },
    legR: { pct: 7, name: 'Oikea alaraaja, takapuoli' },
    legL: { pct: 7, name: 'Vasen alaraaja, takapuoli' },
  },
}
const MAPS: Record<Age, AreaMap> = { adult: ADULT, child: CHILD }

const VIEWS: BodyView[] = ['front', 'back']
const VIEW_NAME: Record<BodyView, string> = { front: 'Etupuoli', back: 'Takapuoli' }
const VB = '12 4 176 406'
const LIMB = new Set<BodyPart>(['armR', 'armL', 'legR', 'legL'])
const ARMS = new Set<BodyPart>(['armR', 'armL'])

const keyOf = (view: BodyView, part: BodyPart): Key => `${view}:${part}`
const areaOf = (k: Key, age: Age): Area | undefined => {
  const [view, part] = k.split(':') as [BodyView, BodyPart]
  return MAPS[age][view][part]
}
const fmt = (n: number) => n.toLocaleString('fi-FI', { maximumFractionDigits: 1 })

/** Where the % label of a shape sits (arms: outside the arm, the arm is too narrow). */
function labelPos(s: BodyShape): { x: number; y: number } {
  if (ARMS.has(s.id)) return { x: s.anchor.x < 100 ? 26 : 174, y: 198 }
  if (s.id === 'legR' || s.id === 'legL') return { x: s.anchor.x, y: 266 }
  return s.anchor
}

function AnimatedNumber({ value, reduce }: { value: number; reduce: boolean }) {
  const mv = useSpring(value, { stiffness: 240, damping: 30 })
  useEffect(() => {
    mv.set(value)
  }, [mv, value])
  const text = useTransform(mv, (v) => fmt(Math.round(v * 2) / 2))
  return reduce ? <>{fmt(value)}</> : <motion.span>{text}</motion.span>
}

function Figure({
  view,
  burned,
  toggle,
  focus,
  setFocus,
  reduce,
  age,
}: {
  age: Age
  view: BodyView
  burned: Set<Key>
  toggle: (k: Key) => void
  focus: Key | null
  setFocus: (k: Key | null) => void
  reduce: boolean
}) {
  const shapes = bodyShapes(view, { mergeTrunk: true })
  const limbs = shapes.filter((s) => LIMB.has(s.id))
  const core = shapes.filter((s) => !LIMB.has(s.id))

  const hitProps = (s: BodyShape) => {
    const k = keyOf(view, s.id)
    const area = MAPS[age][view][s.id]
    const on = burned.has(k)
    return {
      d: s.d,
      transform: s.transform,
      fill: 'transparent',
      role: 'checkbox',
      tabIndex: 0,
      'aria-checked': on,
      'aria-label': area ? `${area.name} ${fmt(area.pct)} %` : undefined,
      className: 'cursor-pointer outline-none',
      onClick: () => toggle(k),
      onKeyDown: (e: KeyboardEvent<SVGPathElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggle(k)
        }
      },
      onFocus: (e: FocusEvent<SVGPathElement>) => setFocus(e.currentTarget.matches(':focus-visible') ? k : null),
      onBlur: () => setFocus(null),
    } as const
  }

  return (
    <svg viewBox={VB} className="block h-auto w-full" role="group" aria-label={`${VIEW_NAME[view]}: napauta palaneet alueet`}>
      <BodySilhouette
        view={view}
        mergeTrunk
        renderShape={(s) => {
          const k = keyOf(view, s.id)
          return (
            <>
              <BodyShapePath shape={s} />
              <AnimatePresence initial={false}>
                {burned.has(k) && (
                  <motion.path
                    key="burn"
                    d={s.d}
                    fill={svg.brand}
                    stroke={svg.raised}
                    strokeWidth={BODY_GAP}
                    strokeLinejoin="round"
                    style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.86 }}
                    animate={{ opacity: 0.92, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                    transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0.3 }}
                  />
                )}
              </AnimatePresence>
              {focus === k && <path d={s.d} fill="none" stroke={svg.ink} strokeWidth={1.4} strokeDasharray="3 2.5" pointerEvents="none" />}
            </>
          )
        }}
      />

      {/* % labels */}
      <g aria-hidden pointerEvents="none">
        {shapes.map((s) => {
          const area = MAPS[age][view][s.id]
          if (!area) return null
          const p = labelPos(s)
          const on = burned.has(keyOf(view, s.id))
          const outside = ARMS.has(s.id)
          return (
            <text
              key={s.id}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-display"
              fontSize={12.5}
              fontWeight={700}
              fill={on ? (outside ? svg.brand : '#fff') : svg.dim}
              style={{ transition: 'fill 150ms ease-out' }}
            >
              {fmt(area.pct)}
            </text>
          )
        })}
      </g>

      {/* hit layer: enlarged limb strokes → exact trunk/head → exact limbs (paint order = priority) */}
      <g>
        {limbs.map((s) => (
          <path
            key={`wide-${s.id}`}
            d={s.d}
            transform={s.transform}
            fill="none"
            stroke="transparent"
            strokeWidth={18}
            strokeLinejoin="round"
            pointerEvents="stroke"
            aria-hidden
            className="cursor-pointer"
            onClick={() => toggle(keyOf(view, s.id))}
          />
        ))}
        {core.map((s) => (
          <path key={s.id} {...hitProps(s)} />
        ))}
        {limbs.map((s) => (
          <path key={s.id} {...hitProps(s)} />
        ))}
      </g>
    </svg>
  )
}

export default function RuleOfNines(props: { age?: unknown }) {
  const [age, setAge] = useState<Age>(props.age === 'child' ? 'child' : 'adult')
  const reduce = useReducedMotion() ?? false
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [view, setView] = useState<BodyView>('front')
  const [burned, setBurned] = useState<Set<Key>>(() => new Set())
  const [palms, setPalms] = useState(0)
  const [focus, setFocus] = useState<Key | null>(null)

  const regionSum = [...burned].reduce((sum, k) => sum + (areaOf(k, age)?.pct ?? 0), 0)
  const total = regionSum + palms
  const limit = age === 'child' ? 10 : 20
  const big = total > limit
  const genital = burned.has('front:pelvis')

  const viewSum = (v: BodyView) => [...burned].filter((k) => k.startsWith(`${v}:`)).reduce((s, k) => s + (areaOf(k, age)?.pct ?? 0), 0)

  const toggle = (k: Key) => {
    const next = new Set(burned)
    if (next.has(k)) next.delete(k)
    else next.add(k)
    const sum = [...next].reduce((s, key) => s + (areaOf(key, age)?.pct ?? 0), 0)
    setBurned(next)
    setPalms((p) => Math.min(p, Math.floor(100 - sum)))
  }
  const clear = () => {
    setBurned(new Set())
    setPalms(0)
  }

  const btn =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text)] transition-transform duration-150 ease-out active:scale-[0.94] disabled:opacity-35'

  const changeAge = (a: Age) => {
    setAge(a)
    setBurned(new Set())
    setPalms(0)
  }

  return (
    <div className="@container space-y-3">
      <Segmented
        value={age}
        onChange={changeAge}
        layoutId={`${uid}-age`}
        options={[
          { value: 'adult', label: 'Aikuinen' },
          { value: 'child', label: 'Lapsi' },
        ]}
      />
      <div className="@lg:hidden">
        <Segmented
          value={view}
          onChange={setView}
          layoutId={`${uid}-view`}
          options={[
            { value: 'front', label: 'Etupuoli' },
            { value: 'back', label: 'Takapuoli' },
          ]}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-start gap-3 @lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.95fr)]">
        {VIEWS.map((v) => (
          <figure key={v} className={`${view === v ? '' : 'hidden'} animate-fade-up mx-auto w-full max-w-[220px] @lg:block`}>
            <Figure age={age} view={v} burned={burned} toggle={toggle} focus={focus} setFocus={setFocus} reduce={reduce} />
            <figcaption className="mt-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">
              {VIEW_NAME[v]} · <span className="tabular-nums">{fmt(viewSum(v))} %</span>
            </figcaption>
          </figure>
        ))}

        {/* panel */}
        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <Stat
              label="% kehon pinta-alasta"
              tone={big ? 'danger' : total > 0 ? 'brand' : 'neutral'}
              value={
                <span className="text-[38px] leading-tight">
                  <AnimatedNumber value={total} reduce={reduce} />
                </span>
              }
            />
            <div className="relative mx-1 mt-2.5 h-2 rounded-full bg-[var(--border)]" aria-hidden>
              <motion.div
                className={`h-full w-full origin-left rounded-full ${big ? 'bg-danger-500' : 'bg-brand-500'}`}
                initial={false}
                animate={{ scaleX: Math.min(total, 100) / 100 }}
                transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0 }}
              />
              <span className="absolute -top-1 bottom-[-4px] w-0.5 -translate-x-1/2 rounded-full bg-[var(--text)]" style={{ left: `${limit}%` }} />
            </div>
            <div className="relative mx-1 mt-1 h-4 text-[10.5px] font-medium text-[var(--text-dim)]" aria-hidden>
              {limit >= 15 && <span className="absolute left-0">0</span>}
              <span className="absolute -translate-x-1/2 font-semibold text-[var(--text)]" style={{ left: `${limit}%` }}>
                {limit} %
              </span>
              <span className="absolute right-0">100</span>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <Hand className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
              <p className="text-[13px] font-semibold text-[var(--text)]">Kämmensääntö</p>
            </div>
            <p className="mt-0.5 text-[11.5px] leading-snug text-[var(--text-dim)]">Potilaan oman kämmenen kokoinen alue ≈ 1 %</p>
            <div className="mt-2 flex items-center justify-between gap-1">
              <button type="button" className={btn} aria-label="Yksi kämmen vähemmän" disabled={palms === 0} onClick={() => setPalms((p) => Math.max(0, p - 1))}>
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <span className="min-w-0 text-center" aria-live="polite">
                <span className="block font-display text-[20px] font-bold leading-none tabular-nums text-[var(--text)]">{palms}</span>
                <span className="block text-[10.5px] text-[var(--text-dim)]">kämmentä</span>
              </span>
              <button type="button" className={btn} aria-label="Yksi kämmen lisää" disabled={total + 1 > 100} onClick={() => setPalms((p) => p + 1)}>
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={clear}
            disabled={total === 0}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] text-[13.5px] font-semibold text-[var(--text)] transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Tyhjennä
          </button>
        </div>
      </div>

      {big ? (
        <Result tone="danger" title={age === 'child' ? 'Laaja palovamma (lapsi > 10 %)' : 'Laaja palovamma (aikuinen > 20 %)'}>
          {age === 'child'
            ? 'Vaikeassa palovammassa (ei kuuman veden aiheuttama) nestehoito lapsella 20 ml/kg/h. Estä hypotermia.'
            : 'Vaikeassa palovammassa (ei kuuman veden aiheuttama) nestehoito aikuisella noin 1000 ml/h. Estä hypotermia – laajoissa vammoissa ruumiinlämpö laskee helposti.'}
        </Result>
      ) : (
        <Result tone="neutral" title={total === 0 ? 'Napauta palaneet alueet' : `Ei ylitä ${age === 'child' ? 'lapsen' : 'aikuisen'} laajan palovamman rajaa`}>
          <ul className="mt-0.5 space-y-1 pl-4 [list-style:disc]">
            <li>Laaja palovamma: aikuisella yli 20 %, lapsella yli 10 % kehon pinta-alasta.</li>
            <li>Liekkipalovamma, jossa iho on kovettunut, on aina syvä vamma pinta-alasta riippumatta.</li>
            <li className={genital ? 'font-medium text-[var(--text)]' : undefined}>
              Nivelten ja genitaalien alueen palovammat ohjataan päivystykseen pienestäkin koosta huolimatta.
            </li>
          </ul>
        </Result>
      )}

      <Caption>
        {age === 'child'
          ? 'Lapsella pää on suhteessa suurempi: pää 18 %, vartalo 18 % puolelta, kumpikin yläraaja 9 % ja alaraaja 14 %. Lasten palovammojen yleisin aiheuttaja on kuuma neste.'
          : '9:n sääntö on aikuisen arviointimenetelmä. Kuvan luvut: % kehon pinta-alasta.'}
      </Caption>
    </div>
  )
}
