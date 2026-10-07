import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { ChevronDown, TriangleAlert } from 'lucide-react'
import { Segmented, svg } from '../ui'
import { clamp, lerp } from '../parts/cardio-hooks'

type View = 'adult' | 'child'
type Spot = 1 | 2 | 3 | 4

/* ------------------------------------------------------------------ text */

const SPOTS: { n: Spot; title: string; sub?: string; child: string; adult: string }[] = [
  {
    n: 1,
    title: 'Suuri takaraivo',
    sub: '0–3-vuotias',
    child: 'Selinmakuulla pää kallistuu eteenpäin ja voi tukkia hengitystien. Pää pidetään neutraalissa asennossa – ei taaksepäin taivutettuna.',
    adult: 'Aikuisella pää taivutetaan taaksepäin.',
  },
  {
    n: 2,
    title: 'Kurkunpää korkealla',
    sub: 'vastasyntynyt ja imeväinen',
    child: 'Kurkunpää sijaitsee korkealla kaulalla → äänenraon näkeminen intubaatiossa on vaikeampaa.',
    adult: 'Aikuisella kurkunpää on alempana kaulalla.',
  },
  {
    n: 3,
    title: 'Iso kieli, veltto kurkunkansi',
    child: 'Suhteellisen iso kieli ja veltto, taaksepäin kääntyvä kurkunkansi huonontavat näkyvyyttä laryngoskopiassa. Nieluputki helpottaa usein naamariventilaatiota.',
    adult: 'Aikuisella kieli on suhteessa pienempi.',
  },
  {
    n: 4,
    title: 'Kapein kohta',
    sub: 'alle 10-vuotias',
    child: 'Kapein kohta on äänenraon jälkeen sormusruston kohdalla → vierasesine voi kiilautua tähän vaikeasti havaittavaan kohtaan.',
    adult: 'Aikuisella kapein kohta on äänenrako.',
  },
]

/* -------------------------------------------------------------- geometry */

interface Pt {
  x: number
  y: number
}
/** A point that bends with the head by `w` × head angle (1 = rigid with the head, 0 = fixed to the torso). */
interface WPt extends Pt {
  w: number
}
interface TPt extends WPt {
  hw: number
}

const VW = 360
const VH = 236
const TABLE = 212

const f = (n: number) => n.toFixed(1)
const P = (x: number, y: number): Pt => ({ x, y })
const W_ = (x: number, y: number, w: number): WPt => ({ x, y, w })
const T_ = (x: number, y: number, hw: number, w: number): TPt => ({ x, y, hw, w })

/** Head silhouette in skull units (origin = skull centre, x → feet, y → table). */
const FACE_ADULT: Pt[] = [
  P(0.62, 0.86), // nape
  P(0.0, 1.0), // occiput
  P(-0.72, 0.7),
  P(-1.0, 0.0), // vertex
  P(-0.7, -0.72),
  P(-0.05, -1.0), // forehead
  P(0.22, -1.02),
  P(0.34, -0.98), // nasion
  P(0.56, -1.22), // nose tip
  P(0.66, -1.02),
  P(0.76, -1.03),
  P(0.82, -0.98), // mouth
  P(0.9, -1.02),
  P(1.12, -0.94), // chin
  P(1.26, -0.74),
  P(1.42, -0.46), // jaw → neck
]
const FACE_CHILD: Pt[] = [
  P(0.7, 0.8),
  P(0.0, 1.0),
  P(-0.74, 0.68),
  P(-1.0, 0.0),
  P(-0.7, -0.72),
  P(0.0, -1.0),
  P(0.3, -0.96),
  P(0.4, -0.93),
  P(0.54, -1.08),
  P(0.62, -0.95),
  P(0.7, -0.95),
  P(0.75, -0.91),
  P(0.81, -0.94),
  P(0.96, -0.86),
  P(1.04, -0.7),
  P(1.14, -0.48),
]

interface Body {
  r: number
  c: Pt
  front: WPt[]
  back: WPt[]
  airway: TPt[]
  glottis: number
  cricoid: number
  esophagus: WPt[]
  tongue: { c: Pt; rx: number; ry: number; a: number }
  epi: { b: WPt; t: WPt; bend: number }
}

const ADULT: Body = {
  r: 50,
  c: P(96, 162),
  front: [W_(186, 141, 0.6), W_(214, 142, 0.25), W_(238, 136, 0), W_(262, 124, 0), W_(300, 119, 0), W_(372, 118, 0)],
  back: [W_(250, TABLE, 0), W_(214, 209, 0.2), W_(180, 207, 0.5)],
  airway: [
    T_(137, 113, 3, 1),
    T_(130, 128, 5, 1),
    T_(128, 150, 6, 1),
    T_(138, 170, 6.5, 0.7),
    T_(162, 178, 6, 0.4),
    T_(186, 168, 5, 0.25),
    T_(204, 158, 3.2, 0.15),
    T_(216, 156, 4.8, 0.08),
    T_(240, 153, 5, 0),
    T_(300, 151, 5, 0),
    T_(372, 150, 5, 0),
  ],
  glottis: 6,
  cricoid: 7,
  esophagus: [W_(162, 182, 0.4), W_(200, 184, 0.15), W_(240, 177, 0), W_(300, 172, 0), W_(372, 170, 0)],
  tongue: { c: P(151, 146), rx: 12, ry: 16, a: -30 },
  epi: { b: W_(194, 160, 0.25), t: W_(178, 157, 0.3), bend: -3 },
}

const CHILD: Body = {
  r: 62,
  c: P(100, 150),
  front: [W_(184, 126, 0.6), W_(198, 125, 0.25), W_(214, 114, 0), W_(240, 102, 0), W_(290, 98, 0), W_(372, 97, 0)],
  back: [W_(236, TABLE, 0), W_(200, 204, 0.2), W_(172, 199, 0.5)],
  airway: [
    T_(146, 93, 3, 1),
    T_(139, 106, 4.5, 1),
    T_(137, 126, 5.5, 1),
    T_(145, 144, 5.5, 0.7),
    T_(162, 150, 5, 0.4),
    T_(173, 141, 4.4, 0.25),
    T_(181, 135, 3.8, 0.15),
    T_(191, 133, 2.6, 0.08),
    T_(206, 131, 4, 0),
    T_(280, 129, 4.5, 0),
    T_(372, 128, 4.5, 0),
  ],
  glottis: 6,
  cricoid: 7,
  esophagus: [W_(162, 154, 0.4), W_(192, 153, 0.15), W_(220, 147, 0), W_(280, 143, 0), W_(372, 141, 0)],
  tongue: { c: P(159, 118), rx: 14, ry: 17, a: -30 },
  epi: { b: W_(177, 135, 0.25), t: W_(160, 143, 0.3), bend: 4 },
}

const lp = (a: Pt, b: Pt, t: number): Pt => P(lerp(a.x, b.x, t), lerp(a.y, b.y, t))
const lw = (a: WPt, b: WPt, t: number): WPt => ({ ...lp(a, b, t), w: lerp(a.w, b.w, t) })
const lt = (a: TPt, b: TPt, t: number): TPt => ({ ...lw(a, b, t), hw: lerp(a.hw, b.hw, t) })

function rot(p: Pt, o: Pt, deg: number): Pt {
  const a = (deg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  const dx = p.x - o.x
  const dy = p.y - o.y
  return P(o.x + dx * c - dy * s, o.y + dx * s + dy * c)
}

/** Catmull-Rom spline through the points, as cubic Béziers. */
function spline(pts: Pt[], { closed = false, move = true } = {}): string {
  const n = pts.length
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)])
  let d = move ? `M${f(pts[0].x)} ${f(pts[0].y)}` : ''
  const segs = closed ? n : n - 1
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    d += ` C${f(p1.x + (p2.x - p0.x) / 6)} ${f(p1.y + (p2.y - p0.y) / 6)} ${f(p2.x - (p3.x - p1.x) / 6)} ${f(p2.y - (p3.y - p1.y) / 6)} ${f(p2.x)} ${f(p2.y)}`
  }
  return closed ? d + 'Z' : d
}

function tube(pts: TPt[]): string {
  const left: Pt[] = []
  const right: Pt[] = []
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    left.push(P(p.x + nx * p.hw, p.y + ny * p.hw))
    right.push(P(p.x - nx * p.hw, p.y - ny * p.hw))
  })
  const back = right.reverse()
  return `${spline(left)} L${f(back[0].x)} ${f(back[0].y)}${spline(back, { move: false })}Z`
}

interface Geo {
  head: string
  neckFill: string
  neckFront: string
  neckBack: string
  occiput: string
  airway: string
  esophagus: string
  tongue: string
  epi: string
  thyroid: string
  cords: string
  cricoid: string
  rings: string
  glottis: Pt
  cricoidPt: Pt
  tongueC: Pt
  contact: Pt
}

/** m: 0 = adult, 1 = small child. th: head angle in degrees (+ = flexion, chin towards chest). */
function geometry(m: number, th: number): Geo {
  const A = ADULT
  const K = CHILD
  const c = lp(A.c, K.c, m)
  const pivot = P(c.x, TABLE)
  const R = (p: Pt, w: number) => rot(p, pivot, th * w)
  const flex = clamp(th / 16, 0, 1)
  const ext = clamp(-th / 12, 0, 1)

  const face = FACE_ADULT.map((u, i) => {
    const k = FACE_CHILD[i]
    return R(P(c.x + lerp(u.x * A.r, k.x * K.r, m), c.y + lerp(u.y * A.r, k.y * K.r, m)), 1)
  })
  const nape = face[0]
  const jaw = face[face.length - 1]
  const center = R(c, 1)

  const front = A.front.map((p, i) => lw(p, K.front[i], m)).map((p) => R(p, p.w))
  const back = A.back.map((p, i) => lw(p, K.back[i], m)).map((p) => R(p, p.w))
  const frontPts = [jaw, ...front]
  const backPts = [...back, nape]
  const lastFront = front[front.length - 1]

  const neckFill =
    spline(frontPts) +
    ` L${VW + 12} ${f(lastFront.y)} L${VW + 12} ${TABLE} L${f(back[0].x)} ${TABLE}` +
    spline(backPts, { move: false }) +
    ` L${f(center.x)} ${f(center.y)}Z`

  // airway: pharynx narrows when the head flexes; opens slightly on extension
  const air = A.airway.map((p, i) => lt(p, K.airway[i], m))
  const squeeze = [1, 1, 1 - 0.55 * flex, 1 - 0.75 * flex, 1 - 0.6 * flex, 1 - 0.2 * flex, 1, 1, 1, 1, 1]
  const airPts: TPt[] = air.map((p, i) => ({ ...R(p, p.w), w: p.w, hw: p.hw * squeeze[i] * (i >= 2 && i <= 4 ? 1 + 0.15 * ext : 1) }))

  const eso = A.esophagus.map((p, i) => lw(p, K.esophagus[i], m)).map((p) => R(p, p.w))

  const tg = {
    c: lp(A.tongue.c, K.tongue.c, m),
    rx: lerp(A.tongue.rx, K.tongue.rx, m),
    ry: lerp(A.tongue.ry, K.tongue.ry, m),
    a: lerp(A.tongue.a, K.tongue.a, m),
  }
  const ta = (tg.a * Math.PI) / 180
  const tonguePts = Array.from({ length: 16 }, (_, i) => {
    const t = (i / 16) * Math.PI * 2
    const x = tg.rx * Math.cos(t)
    const y = tg.ry * Math.sin(t)
    return R(P(tg.c.x + x * Math.cos(ta) - y * Math.sin(ta), tg.c.y + x * Math.sin(ta) + y * Math.cos(ta)), 1)
  })

  const eb = lw(A.epi.b, K.epi.b, m)
  const et = lw(A.epi.t, K.epi.t, m)
  const bend = lerp(A.epi.bend, K.epi.bend, m)
  const b1 = R(eb, eb.w)
  const t1 = R(et, et.w)
  const mid = P((b1.x + t1.x) / 2 + bend * 0.6, (b1.y + t1.y) / 2 + bend)

  const g = airPts[A.glottis]
  const cr = airPts[A.cricoid]
  const thyroid = `M${f(g.x - 9)} ${f(g.y - g.hw - 3)} Q${f(g.x - 1)} ${f(g.y - g.hw - 11)} ${f(g.x + 8)} ${f(g.y - g.hw - 3)}`
  const cords = `M${f(g.x - 2.5)} ${f(g.y - g.hw - 1.5)} L${f(g.x)} ${f(g.y - g.hw + 2.2)} L${f(g.x + 2.5)} ${f(g.y - g.hw - 1.5)}Z M${f(g.x - 2.5)} ${f(g.y + g.hw + 1.5)} L${f(g.x)} ${f(g.y + g.hw - 2.2)} L${f(g.x + 2.5)} ${f(g.y + g.hw + 1.5)}Z`
  const ch = cr.hw + 4
  const cricoid = `M${f(cr.x - 4)} ${f(cr.y - ch)} h8 a2 2 0 0 1 2 2 v${f(ch * 2 - 4)} a2 2 0 0 1 -2 2 h-8 a2 2 0 0 1 -2 -2 v${f(-(ch * 2 - 4))} a2 2 0 0 1 2 -2Z`
  let rings = ''
  const t0 = airPts[8]
  const t9 = airPts[9]
  for (let x = t0.x + 4; x < VW; x += 9) {
    const k = (x - t0.x) / (t9.x - t0.x)
    const y = lerp(t0.y, t9.y, Math.min(k, 1))
    const hw = lerp(t0.hw, t9.hw, Math.min(k, 1)) + 2
    rings += `M${f(x)} ${f(y - hw)} L${f(x)} ${f(y - hw + 2.5)} M${f(x)} ${f(y + hw)} L${f(x)} ${f(y + hw - 2.5)} `
  }

  const occ = [face[2], face[1], P(lerp(face[1].x, face[0].x, 0.6), lerp(face[1].y, face[0].y, 0.6) - 2)]

  return {
    head: spline(face) + 'Z',
    neckFill,
    neckFront: spline(frontPts),
    neckBack: spline(backPts),
    occiput: spline(occ),
    airway: tube(airPts),
    esophagus: spline(eso),
    tongue: spline(tonguePts, { closed: true }),
    epi: `M${f(b1.x)} ${f(b1.y)} Q${f(mid.x)} ${f(mid.y)} ${f(t1.x)} ${f(t1.y)}`,
    thyroid,
    cords,
    cricoid,
    rings,
    glottis: P(g.x, g.y - g.hw),
    cricoidPt: P(cr.x, cr.y - ch),
    tongueC: R(tg.c, 1),
    contact: R(P(c.x, TABLE), 1),
  }
}

/* ---------------------------------------------------------------- colors */

const SKIN = 'rgba(217,160,124,0.2)'
const SKIN_EDGE = 'color-mix(in srgb, var(--text) 42%, transparent)'
const TONGUE = 'rgba(236,72,153,0.22)'
const TONGUE_EDGE = 'rgba(219,39,119,0.6)'
const EPI = '#db5b94'
const CART = 'color-mix(in srgb, var(--text) 45%, transparent)'
const TABLE_FILL = 'color-mix(in srgb, var(--text) 6%, transparent)'

/** Marker positions in viewBox units (markers are HTML buttons laid over the SVG). */
const MARKERS: Record<Spot, Pt> = { 1: P(74, 182), 2: P(214, 30), 3: P(146, 30), 4: P(282, 30) }

function theta(view: View, spot: Spot | null) {
  if (view === 'child') return spot === 1 ? 0 : 16
  return spot === 1 ? -12 : 0
}

/* -------------------------------------------------------------- drawing */

function Leader({ geo, from, to, on }: { geo: MotionValue<Geo>; from: Pt; to: (g: Geo) => Pt; on: boolean }) {
  const x2 = useTransform(geo, (g) => to(g).x)
  const y2 = useTransform(geo, (g) => to(g).y)
  return (
    <g>
      <motion.line
        x1={from.x}
        y1={from.y + 14}
        x2={x2}
        y2={y2}
        stroke={on ? svg.brand : svg.dim}
        strokeWidth={on ? 1.5 : 1}
        strokeDasharray={on ? undefined : '2 3'}
        strokeLinecap="round"
        opacity={on ? 1 : 0.6}
      />
      <motion.circle cx={x2} cy={y2} r={on ? 2.6 : 2} fill={on ? svg.brand : svg.dim} />
    </g>
  )
}

function Figure({ view, spot, reduce }: { view: View; spot: Spot | null; reduce: boolean }) {
  const m = useMotionValue(view === 'child' ? 1 : 0)
  const th = useMotionValue(theta(view, spot))
  const prevView = useRef(view)
  const geo = useTransform(() => geometry(m.get(), th.get()))

  useEffect(() => {
    const viewChanged = prevView.current !== view
    prevView.current = view
    const mT = view === 'child' ? 1 : 0
    const tT = theta(view, spot)
    if (reduce) {
      m.jump(mT)
      th.jump(tT)
      return
    }
    const a = animate(m, mT, { type: 'spring', duration: 0.6, bounce: 0.05 })
    // On entering the child view the head morphs first, then visibly tips forward on the flat surface.
    const b = animate(th, tT, { type: 'spring', duration: 0.9, bounce: 0.12, delay: viewChanged && view === 'child' ? 0.45 : 0 })
    return () => {
      a.stop()
      b.stop()
    }
  }, [view, spot, reduce, m, th])

  const head = useTransform(geo, (g) => g.head)
  const neckFill = useTransform(geo, (g) => g.neckFill)
  const neckFront = useTransform(geo, (g) => g.neckFront)
  const neckBack = useTransform(geo, (g) => g.neckBack)
  const occiput = useTransform(geo, (g) => g.occiput)
  const airway = useTransform(geo, (g) => g.airway)
  const esophagus = useTransform(geo, (g) => g.esophagus)
  const tongue = useTransform(geo, (g) => g.tongue)
  const epi = useTransform(geo, (g) => g.epi)
  const thyroid = useTransform(geo, (g) => g.thyroid)
  const cords = useTransform(geo, (g) => g.cords)
  const cricoid = useTransform(geo, (g) => g.cricoid)
  const rings = useTransform(geo, (g) => g.rings)
  const gx = useTransform(geo, (g) => g.glottis.x)
  const gy = useTransform(geo, (g) => g.glottis.y + 3)
  const cx = useTransform(geo, (g) => g.cricoidPt.x)
  const cy = useTransform(geo, (g) => g.cricoidPt.y + 4)
  const px = useTransform(geo, (g) => g.contact.x)

  const hl = (on: boolean) => ({ initial: false, animate: { opacity: on ? 1 : 0 }, transition: { duration: reduce ? 0 : 0.25 } })

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${view === 'child' ? 'Pieni lapsi' : 'Aikuinen'} selinmakuulla sivulta: ylähengitystiet, kieli, kurkunkansi, kurkunpää ja henkitorvi.`}
    >
      {/* surface */}
      <rect x="0" y={TABLE} width={VW} height={VH - TABLE} fill={TABLE_FILL} />
      <line x1="0" x2={VW} y1={TABLE} y2={TABLE} stroke={SKIN_EDGE} strokeWidth="1.5" />

      {/* body */}
      <motion.path d={head} fill={svg.surface} />
      <motion.path d={head} fill={SKIN} stroke={SKIN_EDGE} strokeWidth="1.75" strokeLinejoin="round" />
      <motion.path d={neckFill} fill={svg.surface} />
      <motion.path d={neckFill} fill={SKIN} />
      <motion.path d={neckFront} fill="none" stroke={SKIN_EDGE} strokeWidth="1.75" strokeLinecap="round" />
      <motion.path d={neckBack} fill="none" stroke={SKIN_EDGE} strokeWidth="1.75" strokeLinecap="round" />

      {/* #1 occiput highlight */}
      <motion.g {...hl(spot === 1)} aria-hidden>
        <motion.path d={occiput} fill="none" stroke={svg.brand} strokeWidth="5" strokeLinecap="round" opacity="0.85" />
        <motion.circle cx={px} cy={TABLE} r="3.5" fill={svg.brand} />
      </motion.g>

      {/* esophagus + airway */}
      <motion.path d={esophagus} fill="none" stroke={CART} strokeWidth="5" strokeLinecap="round" opacity="0.35" />
      <motion.path d={airway} fill={svg.airSoft} stroke={svg.air} strokeWidth="1.5" strokeLinejoin="round" />
      <motion.path d={rings} fill="none" stroke={CART} strokeWidth="1.5" strokeLinecap="round" />

      {/* #2 larynx */}
      <motion.circle cx={gx} cy={gy} r="14" fill={svg.brandSoft} {...hl(spot === 2)} />
      <motion.path d={thyroid} fill="none" stroke={spot === 2 ? svg.brand : CART} strokeWidth="2" strokeLinecap="round" />
      <motion.path d={cords} fill={spot === 2 ? svg.brand : CART} />

      {/* #4 cricoid */}
      <motion.circle cx={cx} cy={cy} r="13" fill={svg.brandSoft} {...hl(spot === 4)} />
      <motion.path d={cricoid} fill="none" stroke={spot === 4 ? svg.brand : CART} strokeWidth="1.75" />

      {/* tongue + epiglottis (#3) */}
      <motion.path d={tongue} fill={svg.surface} />
      <motion.path d={tongue} fill={TONGUE} stroke={TONGUE_EDGE} strokeWidth="1.5" />
      <motion.path d={tongue} fill={svg.brandSoft} stroke={svg.brand} strokeWidth="2" {...hl(spot === 3)} />
      <motion.path d={epi} fill="none" stroke={spot === 3 ? svg.brand : EPI} strokeWidth="3.5" strokeLinecap="round" />

      {/* leaders to the numbered markers */}
      <g aria-hidden>
        <Leader geo={geo} from={MARKERS[3]} to={(g) => g.tongueC} on={spot === 3} />
        <Leader geo={geo} from={MARKERS[2]} to={(g) => g.glottis} on={spot === 2} />
        <Leader geo={geo} from={MARKERS[4]} to={(g) => g.cricoidPt} on={spot === 4} />
      </g>
    </svg>
  )
}

/* ------------------------------------------------- narrowest-point inset */

function InsetChild() {
  return (
    <svg viewBox="0 0 120 150" className="h-auto w-full" role="img" aria-label="Lapsen hengitystie suppilomainen, kapein sormusruston kohdalla">
      <path
        d="M30 6C33 26 38 40 42 50C46 62 52 78 53 88C54 96 50 102 48 110L48 146L72 146L72 110C70 102 66 96 67 88C68 78 74 62 78 50C82 40 87 26 90 6Z"
        fill={svg.airSoft}
      />
      <path d="M30 6C33 26 38 40 42 50C46 62 52 78 53 88C54 96 50 102 48 110L48 146" fill="none" stroke={svg.air} strokeWidth="2" strokeLinecap="round" />
      <path d="M90 6C87 26 82 40 78 50C74 62 68 78 67 88C66 96 70 102 72 110L72 146" fill="none" stroke={svg.air} strokeWidth="2" strokeLinecap="round" />
      <path d="M41 45L52 50.5L42 56ZM79 45L68 50.5L78 56Z" fill={CART} />
      <rect x="43" y="81" width="9" height="15" rx="3" fill={svg.brandSoft} stroke={svg.brand} strokeWidth="1.75" />
      <rect x="68" y="81" width="9" height="15" rx="3" fill={svg.brandSoft} stroke={svg.brand} strokeWidth="1.75" />
      <path d="M31 83L39 88.5L31 94ZM89 83L81 88.5L89 94Z" fill={svg.brand} />
      <circle cx="60" cy="79" r="6.5" fill={svg.dim} opacity="0.85" />
    </svg>
  )
}

function InsetAdult() {
  return (
    <svg viewBox="0 0 120 150" className="h-auto w-full" role="img" aria-label="Aikuisen hengitystie lieriömäinen, kapein äänenraossa">
      <path d="M30 6C33 24 37 38 40 48C41 56 41 64 41 74L41 146L79 146L79 74C79 64 79 56 80 48C83 38 87 24 90 6Z" fill={svg.airSoft} />
      <path d="M30 6C33 24 37 38 40 48C41 56 41 64 41 74L41 146" fill="none" stroke={svg.air} strokeWidth="2" strokeLinecap="round" />
      <path d="M90 6C87 24 83 38 80 48C79 56 79 64 79 74L79 146" fill="none" stroke={svg.air} strokeWidth="2" strokeLinecap="round" />
      <path d="M40 44.5L55 50.5L41 56.5ZM80 44.5L65 50.5L79 56.5Z" fill={svg.brand} />
      <rect x="32" y="84" width="9" height="15" rx="3" fill="none" stroke={CART} strokeWidth="1.75" />
      <rect x="79" y="84" width="9" height="15" rx="3" fill="none" stroke={CART} strokeWidth="1.75" />
      <path d="M25 46L33 51L25 56ZM95 46L87 51L95 56Z" fill={svg.brand} />
    </svg>
  )
}

function NarrowestInset() {
  return (
    <div className="mt-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2.5">
      <div className="grid grid-cols-2 gap-2">
        <figure className="m-0">
          <div className="mx-auto max-w-[130px]">
            <InsetChild />
          </div>
          <figcaption className="mt-1 text-center text-[12px] leading-snug">
            <span className="font-semibold text-[var(--text)]">Lapsi &lt; 10 v</span>
            <br />
            <span className="text-[var(--text-dim)]">kapein sormusruston kohdalla</span>
          </figcaption>
        </figure>
        <figure className="m-0">
          <div className="mx-auto max-w-[130px]">
            <InsetAdult />
          </div>
          <figcaption className="mt-1 text-center text-[12px] leading-snug">
            <span className="font-semibold text-[var(--text)]">Aikuinen</span>
            <br />
            <span className="text-[var(--text-dim)]">kapein äänenraossa</span>
          </figcaption>
        </figure>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11.5px] text-[var(--text-dim)]">
        <span className="inline-flex items-center gap-1">
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
            <path d="M1 1L9 5L1 9Z" fill={svg.brand} />
          </svg>
          kapein kohta
        </span>
        <span className="inline-flex items-center gap-1">
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
            <rect x="1.5" y="0.5" width="7" height="9" rx="2" fill="none" stroke={CART} strokeWidth="1.5" />
          </svg>
          sormusrusto
        </span>
        <span className="inline-flex items-center gap-1">
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden>
            <circle cx="5" cy="5" r="4" fill={svg.dim} />
          </svg>
          vierasesine
        </span>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- widget */

const STATUS: Record<string, { text: string; cls: string } | undefined> = {
  'child-flexed': { text: 'Pää kallistuu eteenpäin ja voi tukkia hengitystien', cls: 'border-danger-500/35 bg-danger-500/10 text-danger-500' },
  'child-neutral': { text: 'Neutraali asento – hengitystie auki', cls: 'border-teal-500/30 bg-teal-500/10 text-teal-600' },
  'adult-extended': { text: 'Aikuisella pää taivutetaan taaksepäin', cls: 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-dim)]' },
}

export default function AirwayChild() {
  const reduce = useReducedMotion() ?? false
  const [view, setView] = useState<View>('child')
  const [spot, setSpot] = useState<Spot | null>(null)
  const toggle = (n: Spot) => setSpot((s) => (s === n ? null : n))
  const statusKey = view === 'child' ? (spot === 1 ? 'child-neutral' : 'child-flexed') : spot === 1 ? 'adult-extended' : ''
  const status = STATUS[statusKey]

  return (
    <div className="@container">
      <Segmented
        layoutId="airway-child-view"
        value={view}
        onChange={setView}
        options={[
          { value: 'adult', label: 'Aikuinen' },
          { value: 'child', label: 'Pieni lapsi' },
        ]}
      />

      <div className="relative mx-auto mt-3 max-w-[560px]">
        <Figure view={view} spot={spot} reduce={reduce} />
        {SPOTS.map((s) => {
          const p = MARKERS[s.n]
          const on = spot === s.n
          return (
            <button
              key={s.n}
              type="button"
              onClick={() => toggle(s.n)}
              aria-pressed={on}
              aria-label={`${s.n}. ${s.title}`}
              className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ left: `${(p.x / VW) * 100}%`, top: `${(p.y / VH) * 100}%` }}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border font-display text-[13px] font-bold shadow-sm transition-[background-color,color,border-color,transform] duration-150 ease-out group-active:scale-90 ${
                  on ? 'border-brand-500 bg-brand-500 text-white' : 'border-brand-500/50 bg-[var(--bg-raised)] text-brand-600'
                }`}
              >
                {s.n}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex min-h-[30px] justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {status && (
            <motion.p
              key={statusKey}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: reduce ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] }}
              className={`rounded-full border px-3 py-1 text-center text-[12px] font-semibold ${status.cls}`}
              aria-live="polite"
            >
              {status.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2 flex flex-col gap-1.5">
        {SPOTS.map((s) => {
          const on = spot === s.n
          return (
            <div key={s.n} className={`rounded-xl border transition-colors duration-200 ${on ? 'border-brand-500/50 bg-brand-500/[0.06]' : 'border-[var(--border)] bg-[var(--bg-card)]'}`}>
              <button
                type="button"
                onClick={() => toggle(s.n)}
                aria-expanded={on}
                className="flex min-h-[48px] w-full items-center gap-3 px-3 py-2 text-left"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[12px] font-bold transition-colors duration-150 ${
                    on ? 'bg-brand-500 text-white' : 'bg-brand-500/10 text-brand-600'
                  }`}
                >
                  {s.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[14px] font-semibold leading-tight text-[var(--text)]">{s.title}</span>
                  {s.sub && <span className="block text-[12px] leading-tight text-[var(--text-dim)]">{s.sub}</span>}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--text-dim)] transition-transform duration-200 ${on ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pl-12">
                      <p className="text-[13px] leading-relaxed text-[var(--text)]">{s.child}</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--text-dim)]">{s.adult}</p>
                      {s.n === 4 && <NarrowestInset />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger-500/35 bg-danger-500/10 px-3.5 py-2.5">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" strokeWidth={2.25} />
        <p className="text-[12.5px] leading-relaxed text-[var(--text)]">
          <span className="font-semibold text-danger-500">Red flag: </span>
          nielun ja kurkunpään manipulaatio voi laukaista laryngospasmin – vältä turhia imuja pinnallisesti tajuttoman lapsen hengitysteihin.
        </p>
      </div>
    </div>
  )
}
