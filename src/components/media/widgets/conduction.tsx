import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { RotateCcw, Scissors } from 'lucide-react'
import type { WidgetProps } from '../registry'
import { Result, Segmented, svg } from '../ui'
import { sample, toPath, type Wave } from '../parts/ecg-wave'

/* ------------------------------------------------------------------ */
/* Geometry (viewBox 0 0 320 300, frontal schematic)                   */
/* ------------------------------------------------------------------ */

const OUTER = `M 100 42 C 124 34, 150 34, 172 40 C 200 34, 244 36, 260 60 C 272 80, 270 106, 260 122
C 280 150, 284 196, 264 232 C 248 262, 218 284, 194 290 C 168 294, 140 280, 116 260
C 86 236, 56 200, 50 160 C 47 142, 48 128, 54 120 C 40 102, 40 72, 56 54 C 68 44, 84 40, 100 42 Z`
const RA = 'M 68 70 C 74 56, 96 50, 118 53 C 136 56, 147 68, 149 84 L 149 110 C 128 117, 92 118, 64 112 C 57 98, 59 82, 68 70 Z'
const LA = 'M 166 74 C 172 58, 200 50, 226 53 C 246 57, 256 72, 254 90 C 253 102, 249 110, 245 113 C 220 118, 190 118, 166 112 Z'
const RV = 'M 64 138 C 90 134, 124 134, 146 138 C 150 176, 162 222, 180 254 C 156 248, 124 232, 100 210 C 80 190, 66 166, 64 138 Z'
const LV = 'M 174 138 C 200 134, 230 134, 246 140 C 258 168, 256 204, 242 230 C 230 250, 214 262, 198 264 C 184 230, 176 180, 174 138 Z'
const SVC = 'M 82 52 L 82 16 Q 82 9 89 9 L 107 9 Q 114 9 114 16 L 114 46'
const AORTA = 'M 148 44 C 146 18, 164 7, 188 7 C 214 7, 232 18, 236 38 L 236 56 L 218 56 L 218 42 C 215 30, 204 25, 189 25 C 175 25, 166 32, 166 44 Z'
const RING = 'M 40 118 L 290 118 L 290 136 L 40 136 Z'
const RV_REGION = 'M 0 124 L 160 124 C 164 170, 172 232, 194 300 L 0 300 Z'
const LV_REGION = 'M 160 124 L 320 124 L 320 300 L 194 300 C 172 232, 164 170, 160 124 Z'

type Pt = { x: number; y: number }
const SA: Pt = { x: 86, y: 54 }
const AV: Pt = { x: 155, y: 121 }

const PATH = {
  internodal: 'M 86 54 C 108 62, 136 84, 155 121',
  bachmann: 'M 86 54 C 130 42, 186 44, 232 62',
  his: 'M 155 121 C 157 130, 159 140, 160 148',
  rbb: 'M 160 148 C 158 166, 160 192, 166 214 C 171 232, 177 248, 184 262',
  lbb: 'M 160 148 C 166 164, 170 192, 174 214 C 179 234, 187 254, 199 272',
  purkR: 'M 184 262 C 158 263, 124 248, 98 224 C 76 202, 62 176, 58 150',
  purkL: 'M 199 272 C 226 270, 250 246, 262 214 C 270 190, 270 162, 262 142',
} as const
type PathKey = keyof typeof PATH

const TWIGS = ['M 123 243 L 128 234', 'M 80 203 L 87 198', 'M 64 173 L 72 171', 'M 229 260 L 224 251', 'M 253 232 L 245 226', 'M 268 178 L 258 177']
const ACCESSORY = 'M 58 150 C 56 146, 50 140, 54 134 C 60 126, 50 118, 56 108'
/** Re-entry loop: AV-solmuke → Hisin kimppu → oikea haara → kammion seinämä → oikorata → eteinen → AV-solmuke. */
const CIRCUIT =
  'M 155 121 C 157 130, 159 140, 160 148 C 158 166, 160 192, 166 214 C 171 232, 177 248, 184 262 C 158 263, 124 248, 98 224 C 76 202, 62 176, 58 150 C 56 146, 50 140, 54 134 C 60 126, 50 118, 56 108 C 84 114, 124 118, 155 121'
/** Fractions along CIRCUIT (measured from the segment lengths). */
const LOOP = { vStart: 0.27, vEnd: 0.69, aStart: 0.79 }
const SLOW_SPREAD = 'M 160 247 C 138 242, 114 228, 94 204'

/* ------------------------------------------------------------------ */
/* Content                                                              */
/* ------------------------------------------------------------------ */

type Mode = 'normal' | 'reentry' | 'aberration'
type PartId = 'sa' | 'av' | 'his' | 'branches' | 'purkinje'

const PARTS: { id: PartId; n: number; name: string; text: string; badge: Pt }[] = [
  {
    id: 'sa',
    n: 1,
    name: 'Sinussolmuke',
    text: 'Oikean eteisen yläosassa. Tahdistaa sydäntä nopeimmin – normaali rytmi lähtee täältä.',
    badge: { x: 62, y: 32 },
  },
  {
    id: 'av',
    n: 2,
    name: 'Eteis-kammiosolmuke',
    text: 'Impulssi viivästyy täällä ennen kammioita – viive näkyy EKG:ssä PR-välinä. Kuuluu varajärjestelmään.',
    badge: { x: 134, y: 128 },
  },
  {
    id: 'his',
    n: 3,
    name: 'Hisin kimppu',
    text: 'Johtaa impulssin eteis-kammiosolmukkeesta kammioväliseinään. Kuuluu varajärjestelmään.',
    badge: { x: 178, y: 129 },
  },
  {
    id: 'branches',
    n: 4,
    name: 'Oikea ja vasen haara',
    text: 'Kulkevat kammioväliseinän molemmin puolin. Jos haara ei ehdi palautua johtokykyiseksi, QRS leventyy (aberraatio).',
    badge: { x: 140, y: 206 },
  },
  {
    id: 'purkinje',
    n: 5,
    name: 'Purkinjen säikeet',
    text: 'Levittävät impulssin kammioiden seinämiin. Normaalia johtoratajärjestelmää pitkin kulkeva impulssi tuottaa kapean QRS-kompleksin. Kuuluvat varajärjestelmään.',
    badge: { x: 284, y: 240 },
  },
]

const MODES: { value: Mode; label: string }[] = [
  { value: 'normal', label: 'Normaali' },
  { value: 'reentry', label: 'Kiertoaktivaatio' },
  { value: 'aberration', label: 'Aberraatio' },
]

/* ------------------------------------------------------------------ */
/* Timing + mini-ECG                                                    */
/* ------------------------------------------------------------------ */

const CYCLE = 3000 // ms, slowed-down heartbeat
const LAP = 1500 // ms per re-entry lap
const LAPS_SHOWN = 4
const ECG_X0 = 10
const ECG_W = 300
const ECG_BASE = 56
const ECG_GAIN = 30
const ECG_DT = 5
const QRS_END = { normal: 1680, aberration: 2080 }

const TEXT_TEAL = '#0b958c'
const TEXT_BRAND = '#d85400'

const P_WAVE: Wave = { at: 300, amp: 0.22, width: 95 }
const NARROW: Wave[] = [
  { at: 1440, amp: -0.08, width: 14 },
  { at: 1485, amp: 1, width: 20 },
  { at: 1535, amp: -0.22, width: 16 },
  { at: 2160, amp: 0.16, width: 160 },
  { at: 2310, amp: 0.14, width: 110 },
]
const WIDE: Wave[] = [
  { at: 1450, amp: -0.06, width: 14 },
  { at: 1505, amp: 0.85, width: 32 },
  { at: 1790, amp: -0.42, width: 115 },
  { at: 2420, amp: 0.12, width: 170 },
  { at: 2570, amp: 0.1, width: 120 },
]

interface EcgModel {
  path: string
  ghost?: string
  values: Float64Array
  total: number
}

function buildEcg(mode: Mode): EcgModel {
  if (mode === 'reentry') {
    const waves: Wave[] = []
    for (let i = -1; i <= LAPS_SHOWN; i++) {
      const q = (i + 0.34) * LAP
      waves.push({ at: q - 30, amp: -0.08, width: 12 }, { at: q, amp: 1, width: 17 }, { at: q + 34, amp: -0.22, width: 13 })
      waves.push({ at: q + 330, amp: 0.24, width: 95 })
    }
    const total = LAP * LAPS_SHOWN
    const values = sample(waves, 0, total, ECG_DT)
    const path = toPath(values, { x0: ECG_X0, dx: (ECG_DT / total) * ECG_W, y0: ECG_BASE, yScale: ECG_GAIN, eps: 0.12 })
    return { path, values, total }
  }
  const waves = [P_WAVE, ...(mode === 'aberration' ? WIDE : NARROW)]
  const values = sample(waves, 0, CYCLE, ECG_DT)
  const opts = { x0: ECG_X0, dx: (ECG_DT / CYCLE) * ECG_W, y0: ECG_BASE, yScale: ECG_GAIN, eps: 0.12 }
  const path = toPath(values, opts)
  const ghost = mode === 'aberration' ? toPath(sample([P_WAVE, ...NARROW], 0, CYCLE, ECG_DT), opts) : undefined
  return { path, ghost, values, total: CYCLE }
}

const ecgX = (t: number, total: number) => ECG_X0 + (t / total) * ECG_W

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a))
const easeOut = (v: number) => 1 - Math.pow(1 - v, 3)
const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2)
const scaleAt = (p: Pt, s: number) => `translate(${p.x} ${p.y}) scale(${s}) translate(${-p.x} ${-p.y})`
const fmt = (v: number) => Math.round(v * 1000) / 1000

function setAttr(el: Element | null | undefined, name: string, value: number | string) {
  if (el) el.setAttribute(name, typeof value === 'number' ? String(fmt(value)) : value)
}

/* ------------------------------------------------------------------ */
/* Widget                                                               */
/* ------------------------------------------------------------------ */

export default function Conduction(_props: WidgetProps) {
  const reduce = useReducedMotion() ?? false
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [mode, setMode] = useState<Mode>('normal')
  const [part, setPart] = useState<PartId | null>(null)
  const [loop, setLoop] = useState<'running' | 'stopping' | 'stopped'>('running')

  const stageRef = useRef<HTMLDivElement>(null)
  const inView = useInView(stageRef, { amount: 0.25 })
  const els = useRef<Record<string, Element | null>>({})
  const clock = useRef(0)
  const stopLap = useRef<number | null>(null)

  const ecg = useMemo(() => buildEcg(mode), [mode])
  const reg = (key: string) => (node: Element | null) => {
    els.current[key] = node
  }
  const url = (name: string) => `url(#${uid}-${name})`

  const changeMode = (m: Mode) => {
    clock.current = 0
    stopLap.current = null
    setLoop('running')
    setMode(m)
  }

  const cutLoop = () => {
    if (reduce) {
      setLoop('stopped')
      return
    }
    stopLap.current = Math.floor(clock.current / LAP)
    setLoop('stopping')
  }
  const restartLoop = () => {
    clock.current = 0
    stopLap.current = null
    setLoop('running')
  }

  const running = inView && !reduce && !(mode === 'reentry' && loop === 'stopped')

  useEffect(() => {
    if (!running) return
    const E = els.current
    const lens: Record<string, number> = {}
    const measure = (key: string) => {
      const node = E[`m-${key}`] as SVGPathElement | null
      if (!node) return 0
      return (lens[key] ??= node.getTotalLength())
    }
    const pointOn = (key: string, f: number): Pt => {
      const node = E[`m-${key}`] as SVGPathElement | null
      if (!node) return AV
      const p = node.getPointAtLength(measure(key) * clamp01(f))
      return { x: p.x, y: p.y }
    }
    const dot = (key: string, p: Pt | null, opacity = 1, scale = 1) => {
      const node = E[key]
      if (!node) return
      if (!p || opacity <= 0.001) {
        setAttr(node, 'opacity', 0)
        return
      }
      setAttr(node, 'opacity', opacity)
      setAttr(node, 'transform', `translate(${fmt(p.x)} ${fmt(p.y)}) scale(${fmt(scale)})`)
    }
    const lit = (key: PathKey, f: number, alpha: number) => {
      for (const layer of ['lit', 'glow']) {
        const node = E[`${layer}-${key}`]
        setAttr(node, 'stroke-dashoffset', 1 - f)
        setAttr(node, 'opacity', f > 0 ? alpha : 0)
      }
    }
    const cursor = (t: number) => {
      const x = ecgX(t, ecg.total)
      const i = Math.min(ecg.values.length - 1, Math.max(0, Math.round(t / ECG_DT)))
      setAttr(E.cursor, 'transform', `translate(${fmt(x)} 0)`)
      setAttr(E.cursorDot, 'transform', `translate(${fmt(x)} ${fmt(ECG_BASE - ecg.values[i] * ECG_GAIN)})`)
    }

    const frameBeat = (c: number) => {
      const aberr = mode === 'aberration'
      // Sinus node fires
      const sf = seg(c, 0, 380)
      setAttr(E.saHalo, 'opacity', c < 380 ? (1 - sf) * 0.85 : 0)
      setAttr(E.saHalo, 'transform', scaleAt(SA, 1 + sf * 1.6))
      // Atria depolarise (wavefront from SA)
      setAttr(E.atria, 'opacity', c < 1250 ? seg(c, 0, 120) : 1 - seg(c, 1250, 1700))
      setAttr(E.atria, 'transform', scaleAt(SA, 0.04 + 0.96 * easeOut(seg(c, 0, 650))))
      // Conduction paths light up as the impulse passes
      const fade = 1 - seg(c, 2100, 2600)
      lit('internodal', seg(c, 0, 520), fade)
      lit('bachmann', seg(c, 0, 420), fade)
      lit('his', seg(c, 1100, 1220), fade)
      lit('lbb', seg(c, 1220, 1420), fade)
      lit('purkL', seg(c, 1420, 1660), fade)
      if (!aberr) {
        lit('rbb', seg(c, 1220, 1420), fade)
        lit('purkR', seg(c, 1420, 1660), fade)
      }
      // AV-node delay glow
      const avOn = seg(c, 470, 560) * (1 - seg(c, 1100, 1180))
      setAttr(E.avGlow, 'opacity', avOn * (0.65 + 0.35 * Math.sin((c - 470) / 70)))
      // Impulse dots
      let p1: Pt | null = null
      let s1 = 1
      if (c < 520) p1 = pointOn('internodal', c / 520)
      else if (c < 1100) {
        p1 = AV
        s1 = 0.85 + 0.15 * Math.sin((c - 520) / 60)
      } else if (c < 1220) p1 = pointOn('his', seg(c, 1100, 1220))
      else if (c < 1420) p1 = pointOn(aberr ? 'lbb' : 'rbb', seg(c, 1220, 1420))
      else if (c < 1700) p1 = pointOn(aberr ? 'purkL' : 'purkR', seg(c, 1420, 1660))
      dot('dot1', p1, 1 - seg(c, 1640, 1700), s1)
      dot('dot2', c < 440 ? pointOn('bachmann', seg(c, 0, 420)) : null, 1 - seg(c, 380, 440))
      if (!aberr) {
        const p3 = c >= 1220 && c < 1700 ? (c < 1420 ? pointOn('lbb', seg(c, 1220, 1420)) : pointOn('purkL', seg(c, 1420, 1660))) : null
        dot('dot3', p3, 1 - seg(c, 1640, 1700))
      }
      // Ventricles depolarise
      const lvOp = c < 2250 ? seg(c, 1420, 1500) : 1 - seg(c, 2250, 2750)
      setAttr(E.lv, 'opacity', lvOp)
      setAttr(E.lv, 'transform', scaleAt({ x: 184, y: 236 }, 0.05 + 0.95 * easeOut(seg(c, 1420, 1700))))
      if (aberr) {
        setAttr(E.rv, 'opacity', c < 2380 ? seg(c, 1580, 1680) : 1 - seg(c, 2380, 2850))
        setAttr(E.rv, 'transform', scaleAt({ x: 166, y: 204 }, 0.05 + 0.95 * easeInOut(seg(c, 1580, 2380))))
      } else {
        setAttr(E.rv, 'opacity', lvOp)
        setAttr(E.rv, 'transform', scaleAt({ x: 172, y: 230 }, 0.05 + 0.95 * easeOut(seg(c, 1420, 1700))))
      }
      // Mini-ECG cursor + active band
      cursor(c)
      const qEnd = aberr ? QRS_END.aberration : QRS_END.normal
      setAttr(E.bandP, 'opacity', c < 600 ? 1 : 0.4)
      setAttr(E.bandAV, 'opacity', c >= 600 && c < 1400 ? 1 : 0.4)
      setAttr(E.bandQRS, 'opacity', c >= 1400 && c < qEnd ? 1 : 0.4)
    }

    const comet = [
      { key: 'tail', len: 0.36 },
      { key: 'mid', len: 0.12 },
      { key: 'head', len: 0.035 },
    ]
    const frameLoop = (t: number) => {
      const lapF = t / LAP
      const lap = Math.floor(lapF)
      const p = lapF - lap
      if (stopLap.current !== null && lap > stopLap.current) {
        // The impulse has come back to the AV node and is blocked there.
        for (const c of comet) setAttr(E[`comet-${c.key}`], 'opacity', 0)
        dot('dotHead', null)
        setAttr(E.lv, 'opacity', 0)
        setAttr(E.rv, 'opacity', 0)
        setAttr(E.atria, 'opacity', 0)
        setLoop('stopped')
        return
      }
      for (const c of comet) {
        setAttr(E[`comet-${c.key}`], 'stroke-dashoffset', c.len - p)
        setAttr(E[`comet-${c.key}`], 'opacity', 1)
      }
      dot('dotHead', pointOn('circuit', p))
      const vOp = seg(p, LOOP.vStart, LOOP.vStart + 0.05) * (1 - seg(p, LOOP.vEnd, LOOP.vEnd + 0.14))
      setAttr(E.lv, 'opacity', vOp)
      setAttr(E.rv, 'opacity', vOp)
      const aOp = p >= LOOP.aStart ? seg(p, LOOP.aStart, LOOP.aStart + 0.06) : lap === 0 ? 0 : 1 - seg(p, 0, 0.16)
      setAttr(E.atria, 'opacity', aOp)
      cursor(((lap % LAPS_SHOWN) + p) * LAP)
    }

    let raf = 0
    let last = -1
    const tick = (now: number) => {
      if (last >= 0) clock.current += Math.min(now - last, 50)
      last = now
      if (mode === 'reentry') frameLoop(clock.current)
      else frameBeat(clock.current % CYCLE)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, mode, ecg])

  const sceneKey = `${mode}-${reduce ? 'r' : 'a'}`
  const staticLit = reduce
  const aberr = mode === 'aberration'
  const reentry = mode === 'reentry'
  const branchesLit: PathKey[] = aberr
    ? ['internodal', 'bachmann', 'his', 'lbb', 'purkL']
    : ['internodal', 'bachmann', 'his', 'rbb', 'lbb', 'purkR', 'purkL']
  const selected = PARTS.find((p) => p.id === part) ?? null
  const qEnd = aberr ? QRS_END.aberration : QRS_END.normal

  return (
    <div className="space-y-4">
      <Segmented value={mode} onChange={changeMode} options={MODES} layoutId="conduction-mode" size="sm" />

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] sm:items-start">
        {/* ---------------- Illustration ---------------- */}
        <div ref={stageRef} className="space-y-2">
          <svg
            viewBox="0 0 320 300"
            className="h-auto w-full"
            role="img"
            aria-label={
              reentry
                ? 'Sydän: impulssi kiertää silmukkaa eteis-kammiosolmukkeen, Hisin kimpun, oikean haaran, kammion seinämän ja oikoradan kautta takaisin eteiseen.'
                : aberr
                  ? 'Sydän: oikea haara ei ole palautunut, joten impulssi kulkee vasenta haaraa pitkin ja leviää oikeaan kammioon hitaasti.'
                  : 'Sydämen johtoratajärjestelmä: sinussolmuke, eteis-kammiosolmuke, Hisin kimppu, oikea ja vasen haara sekä Purkinjen säikeet.'
            }
          >
            <defs>
              <clipPath id={`${uid}-heart`}>
                <path d={OUTER} />
              </clipPath>
              <clipPath id={`${uid}-atriaR`}>
                <rect x="0" y="0" width="320" height="121" />
              </clipPath>
              <clipPath id={`${uid}-rvR`}>
                <path d={RV_REGION} />
              </clipPath>
              <clipPath id={`${uid}-lvR`}>
                <path d={LV_REGION} />
              </clipPath>
              <radialGradient id={`${uid}-gTeal`}>
                <stop offset="0%" stopColor={svg.teal} stopOpacity={0.12} />
                <stop offset="82%" stopColor={svg.teal} stopOpacity={0.24} />
                <stop offset="100%" stopColor={svg.teal} stopOpacity={0.42} />
              </radialGradient>
              <radialGradient id={`${uid}-gRed`}>
                <stop offset="0%" stopColor={svg.danger} stopOpacity={0.14} />
                <stop offset="82%" stopColor={svg.danger} stopOpacity={0.22} />
                <stop offset="100%" stopColor={svg.danger} stopOpacity={0.36} />
              </radialGradient>
              <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.6" markerHeight="3.6" orient="auto-start-reverse">
                <path d="M1 1 L9 5 L1 9 Z" fill={svg.brand} />
              </marker>
              <marker id={`${uid}-arrowRed`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                <path d="M1 1 L9 5 L1 9 Z" fill={svg.danger} />
              </marker>
            </defs>

            {/* Great vessels + heart body */}
            <g aria-hidden>
              <path d={AORTA} fill={svg.dangerSoft} fillOpacity={0.5} stroke={svg.dim} strokeOpacity={0.45} strokeWidth={1.5} strokeLinejoin="round" />
              <path d={SVC} fill={svg.dangerSoft} fillOpacity={0.5} stroke={svg.dim} strokeOpacity={0.45} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <path d={OUTER} fill={svg.raised} />
              <path d={OUTER} fill={svg.dangerSoft} fillOpacity={0.8} />
              <g clipPath={url('heart')}>
                <path d={RING} fill={svg.dim} fillOpacity={0.15} />
              </g>
              <g fill={svg.raised} stroke={svg.dim} strokeOpacity={0.28} strokeWidth={1.2}>
                <path d={RA} />
                <path d={LA} />
                <path d={RV} />
                <path d={LV} />
              </g>
            </g>

            <g key={sceneKey} aria-hidden>
              {/* Activation tints (engine-driven) */}
              <g clipPath={url('heart')}>
                <g clipPath={url('atriaR')}>
                  <circle ref={reg('atria')} cx={SA.x} cy={SA.y} r={215} fill={url('gTeal')} opacity={0} />
                </g>
                <g clipPath={url('rvR')}>
                  <circle ref={reg('rv')} cx={aberr ? 166 : 172} cy={aberr ? 204 : 230} r={150} fill={url('gRed')} opacity={0} />
                </g>
                <g clipPath={url('lvR')}>
                  <circle ref={reg('lv')} cx={184} cy={236} r={150} fill={url('gRed')} opacity={0} />
                </g>
              </g>
            </g>

            <path d={OUTER} fill="none" stroke={svg.dim} strokeOpacity={0.65} strokeWidth={2} strokeLinejoin="round" aria-hidden />

            {/* Chamber labels */}
            <g fill={svg.dim} fontSize={12} textAnchor="middle" opacity={0.85} aria-hidden>
              <text x={93} y={88}>oikea</text>
              <text x={93} y={102}>eteinen</text>
              <text x={210} y={84}>vasen</text>
              <text x={210} y={98}>eteinen</text>
              <text x={102} y={164}>oikea</text>
              <text x={102} y={178}>kammio</text>
              <text x={216} y={188}>vasen</text>
              <text x={216} y={202}>kammio</text>
            </g>

            {/* Selected-structure highlight */}
            <AnimatePresence>
              {part && (
                <motion.g
                  key={part}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  fill="none"
                  stroke={svg.brand}
                  strokeOpacity={0.28}
                  strokeLinecap="round"
                  aria-hidden
                >
                  {part === 'sa' && <circle cx={SA.x} cy={SA.y} r={14} fill={svg.brand} fillOpacity={0.22} stroke="none" />}
                  {part === 'av' && <ellipse cx={AV.x} cy={AV.y} rx={14} ry={11} fill={svg.brand} fillOpacity={0.22} stroke="none" />}
                  {part === 'his' && <path d={PATH.his} strokeWidth={11} />}
                  {part === 'branches' && (
                    <>
                      <path d={PATH.rbb} strokeWidth={9} />
                      <path d={PATH.lbb} strokeWidth={9} />
                    </>
                  )}
                  {part === 'purkinje' && (
                    <>
                      <path d={PATH.purkR} strokeWidth={9} />
                      <path d={PATH.purkL} strokeWidth={9} />
                    </>
                  )}
                </motion.g>
              )}
            </AnimatePresence>

            {/* Conduction system — base (resting) drawing, also used for path measurement */}
            <g fill="none" stroke={svg.brand} strokeLinecap="round" aria-hidden>
              <path ref={reg('m-internodal')} d={PATH.internodal} strokeOpacity={0.45} strokeWidth={1.8} strokeDasharray="1 4.5" />
              <path ref={reg('m-bachmann')} d={PATH.bachmann} strokeOpacity={0.45} strokeWidth={1.8} strokeDasharray="1 4.5" />
              <path ref={reg('m-his')} d={PATH.his} strokeOpacity={0.55} strokeWidth={3.2} />
              <path
                ref={reg('m-rbb')}
                d={PATH.rbb}
                stroke={aberr ? svg.dim : svg.brand}
                strokeOpacity={aberr ? 0.6 : 0.55}
                strokeWidth={2.4}
                strokeDasharray={aberr ? '3 4' : undefined}
              />
              <path ref={reg('m-lbb')} d={PATH.lbb} strokeOpacity={0.55} strokeWidth={2.4} />
              <path
                ref={reg('m-purkR')}
                d={PATH.purkR}
                stroke={aberr ? svg.dim : svg.brand}
                strokeOpacity={aberr ? 0.45 : 0.5}
                strokeWidth={1.8}
              />
              <path ref={reg('m-purkL')} d={PATH.purkL} strokeOpacity={0.5} strokeWidth={1.8} />
              {TWIGS.map((d) => (
                <path key={d} d={d} strokeOpacity={0.45} strokeWidth={1.3} />
              ))}
            </g>

            <g key={`${sceneKey}-paths`} aria-hidden>
              {/* Lit overlay (draws along with the impulse; fully drawn + arrows when motion is reduced) */}
              {!reentry && (
                <g fill="none" strokeLinecap="round">
                  {branchesLit.map((k) => (
                    <path
                      key={`glow-${k}`}
                      ref={reg(`glow-${k}`)}
                      d={PATH[k]}
                      pathLength={1}
                      stroke={svg.brand}
                      strokeOpacity={0.22}
                      strokeWidth={k === 'his' ? 9 : 7}
                      strokeDasharray="1 1"
                      strokeDashoffset={staticLit ? 0 : 1}
                      opacity={staticLit ? 1 : 0}
                    />
                  ))}
                  {branchesLit.map((k) => (
                    <path
                      key={`lit-${k}`}
                      ref={reg(`lit-${k}`)}
                      d={PATH[k]}
                      pathLength={1}
                      stroke={svg.brand}
                      strokeWidth={k === 'his' ? 3.4 : k === 'internodal' || k === 'bachmann' ? 2 : 2.6}
                      strokeDasharray="1 1"
                      strokeDashoffset={staticLit ? 0 : 1}
                      opacity={staticLit ? 1 : 0}
                      markerEnd={staticLit ? url('arrow') : undefined}
                    />
                  ))}
                </g>
              )}

              {/* Re-entry circuit */}
              {reentry && (
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path ref={reg('m-circuit')} d={CIRCUIT} stroke={svg.teal} strokeOpacity={0.22} strokeWidth={8} />
                  <path d={ACCESSORY} stroke={svg.teal} strokeWidth={2.6} />
                  {staticLit ? (
                    <path
                      d={CIRCUIT}
                      stroke={svg.brand}
                      strokeWidth={2.6}
                      opacity={loop === 'stopped' ? 0.3 : 1}
                      markerMid={url('arrow')}
                    />
                  ) : (
                    <>
                      <path ref={reg('comet-tail')} d={CIRCUIT} pathLength={1} stroke={svg.dim} strokeOpacity={0.55} strokeWidth={6} strokeDasharray="0.36 0.64" opacity={0} />
                      <path ref={reg('comet-mid')} d={CIRCUIT} pathLength={1} stroke={svg.brand} strokeOpacity={0.45} strokeWidth={6} strokeDasharray="0.12 0.88" opacity={0} />
                      <path ref={reg('comet-head')} d={CIRCUIT} pathLength={1} stroke={svg.brand} strokeWidth={3.4} strokeDasharray="0.035 0.965" opacity={0} />
                    </>
                  )}
                  <text transform="translate(37 129) rotate(-90)" textAnchor="middle" fontSize={12} fontWeight={600} fill={TEXT_TEAL} stroke="none">
                    oikorata
                  </text>
                </g>
              )}

              {/* Aberration: blocked right bundle branch + slow muscle-to-muscle spread */}
              {aberr && (
                <g>
                  <line x1={152} y1={185} x2={165} y2={185} stroke={svg.danger} strokeWidth={3.5} strokeLinecap="round" />
                  {staticLit && (
                    <path d={SLOW_SPREAD} fill="none" stroke={svg.danger} strokeWidth={2} strokeDasharray="2 4" strokeLinecap="round" markerEnd={url('arrowRed')} />
                  )}
                </g>
              )}
            </g>

            {/* Nodes */}
            <g aria-hidden>
              <circle cx={SA.x} cy={SA.y} r={6.5} fill={svg.brand} stroke={svg.raised} strokeWidth={1.5} />
              <ellipse cx={AV.x} cy={AV.y} rx={6.8} ry={5} fill={svg.brand} stroke={svg.raised} strokeWidth={1.5} />
            </g>

            {/* Engine-driven glows and impulse dots */}
            <g key={`${sceneKey}-dots`} aria-hidden>
              <circle ref={reg('saHalo')} cx={SA.x} cy={SA.y} r={9} fill="none" stroke={svg.brand} strokeWidth={2} opacity={0} />
              <ellipse ref={reg('avGlow')} cx={AV.x} cy={AV.y} rx={12} ry={10} fill={svg.brand} fillOpacity={0.3} opacity={0} />
              {['dot1', 'dot2', 'dot3', 'dotHead'].map((k) => (
                <g key={k} ref={reg(k)} opacity={0}>
                  <circle r={9} fill={svg.brand} fillOpacity={0.22} />
                  <circle r={4.4} fill={svg.brand} />
                  <circle r={1.9} fill={svg.raised} />
                </g>
              ))}
            </g>

            {/* Conduction block in the AV node after "Katkaise kierto" */}
            <AnimatePresence>
              {reentry && loop === 'stopped' && (
                <motion.g
                  key="av-block"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', duration: 0.45, bounce: 0.25 }}
                  aria-hidden
                >
                  <circle cx={157} cy={128} r={14} fill={svg.dangerSoft} />
                  <line x1={146} y1={131} x2={168} y2={125} stroke={svg.danger} strokeWidth={4} strokeLinecap="round" />
                </motion.g>
              )}
            </AnimatePresence>

            {/* Numbered badges (1–5 = conduction order) */}
            <g aria-hidden>
              {PARTS.map((p) => {
                const active = part === p.id
                return (
                  <g key={p.id}>
                    <circle cx={p.badge.x} cy={p.badge.y} r={active ? 11 : 9.5} fill={active ? svg.ink : svg.brand} stroke={svg.raised} strokeWidth={1.5} />
                    <text x={p.badge.x} y={p.badge.y + 4.2} textAnchor="middle" fontSize={12} fontWeight={700} fill={svg.raised}>
                      {p.n}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Mini-ECG synchronised with the impulse */}
          <div className="rounded-xl bg-[var(--bg)] px-2 pb-1 pt-2">
            <svg
              viewBox="0 0 320 96"
              className="h-auto w-full"
              role="img"
              aria-label={
                reentry
                  ? 'EKG: jokainen kierros tuottaa kapean QRS-kompleksin, syntyy säännöllinen takykardia.'
                  : aberr
                    ? 'EKG: P-aalto, PR-väli ja leveä QRS-kompleksi. Katkoviivalla normaali kapea QRS vertailuksi.'
                    : 'EKG: P-aalto = eteiset, PR-väli = viive eteis-kammiosolmukkeessa, QRS = kammiot.'
              }
            >
              <g key={`${sceneKey}-ecg`}>
                {!reentry && (
                  <>
                    {/* Bands brighten while the cursor is inside them (engine-driven) */}
                    <rect
                      ref={reg('bandP')}
                      x={ecgX(40, CYCLE)}
                      y={14}
                      width={ecgX(600, CYCLE) - ecgX(40, CYCLE)}
                      height={56}
                      rx={6}
                      fill={svg.tealSoft}
                      opacity={reduce ? 1 : 0.4}
                    />
                    <rect
                      ref={reg('bandAV')}
                      x={ecgX(600, CYCLE)}
                      y={14}
                      width={ecgX(1400, CYCLE) - ecgX(600, CYCLE)}
                      height={56}
                      rx={6}
                      fill={svg.brandSoft}
                      opacity={reduce ? 1 : 0.4}
                    />
                    <rect
                      ref={reg('bandQRS')}
                      x={ecgX(1400, CYCLE)}
                      y={14}
                      width={ecgX(qEnd, CYCLE) - ecgX(1400, CYCLE)}
                      height={56}
                      rx={6}
                      fill={svg.dangerSoft}
                      opacity={reduce ? 1 : 0.4}
                    />
                    <g textAnchor="middle" fontSize={12} fontWeight={700}>
                      <text x={ecgX(320, CYCLE)} y={10} fill={TEXT_TEAL}>
                        P
                      </text>
                      <text x={ecgX(1000, CYCLE)} y={10} fill={TEXT_BRAND}>
                        AV-viive
                      </text>
                      <text x={ecgX((1400 + qEnd) / 2, CYCLE)} y={10} fill={svg.danger}>
                        QRS
                      </text>
                    </g>
                    {/* PR interval bracket: P onset → QRS onset */}
                    <path
                      d={`M ${ecgX(60, CYCLE)} 74 V 79 H ${ecgX(1400, CYCLE)} V 74`}
                      fill="none"
                      stroke={TEXT_BRAND}
                      strokeWidth={1.3}
                      strokeLinejoin="round"
                    />
                    <text x={ecgX(730, CYCLE)} y={93} textAnchor="middle" fontSize={12} fontWeight={600} fill={TEXT_BRAND}>
                      PR-väli
                    </text>
                  </>
                )}
                {ecg.ghost && (
                  <path d={ecg.ghost} fill="none" stroke={svg.dim} strokeOpacity={0.5} strokeWidth={1.4} strokeDasharray="3 3" strokeLinejoin="round" />
                )}
                <path d={ecg.path} fill="none" stroke={svg.ink} strokeWidth={1.9} strokeLinejoin="round" strokeLinecap="round" />
                {!reduce && (
                  <>
                    <g ref={reg('cursor')} transform={`translate(${ECG_X0} 0)`}>
                      <line x1={0} x2={0} y1={14} y2={70} stroke={svg.brand} strokeOpacity={0.55} strokeWidth={1.5} />
                    </g>
                    <g ref={reg('cursorDot')} transform={`translate(${ECG_X0} ${ECG_BASE})`}>
                      <circle r={6} fill={svg.brand} fillOpacity={0.25} />
                      <circle r={3.2} fill={svg.brand} />
                    </g>
                  </>
                )}
              </g>
            </svg>
          </div>

          {/* ECG legend */}
          {reentry ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-[12px] text-[var(--text-dim)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" aria-hidden />
                Impulssi
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-[var(--text-dim)] opacity-60" aria-hidden />
                Refraktaarinen (palautuu)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-teal-500/50" aria-hidden />
                Palautunut, johtaa taas
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-[12px] text-[var(--text-dim)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" aria-hidden />P = eteiset
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" aria-hidden />
                PR-väli = viive AV-solmukkeessa
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger-500" aria-hidden />
                QRS = kammiot
              </span>
            </div>
          )}
        </div>

        {/* ---------------- Explanation + controls ---------------- */}
        <div className="space-y-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="space-y-3"
            >
              {mode === 'normal' && (
                <div className="rounded-xl bg-[var(--bg)] px-4 py-3">
                  <p className="font-display text-[15px] font-semibold text-[var(--text)]">Normaali johtuminen</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-dim)]">
                    <strong className="font-semibold text-[var(--text)]">Sinussolmuke tahdistaa sydäntä nopeimmin.</strong> Alemmat tahdistinsolut –
                    eteis-kammiosolmuke, Hisin kimppu ja kammioiden johtoradat – ovat varajärjestelmä.
                  </p>
                  <ol className="mt-2.5 space-y-1 text-[13px] text-[var(--text-dim)]">
                    <li>
                      <span className="font-semibold text-teal-600">Eteiset</span> aktivoituvat sinussolmukkeesta → P-aalto
                    </li>
                    <li>
                      <span className="font-semibold text-brand-600">Viive</span> eteis-kammiosolmukkeessa → PR-väli
                    </li>
                    <li>
                      <span className="font-semibold text-danger-500">Kammiot</span> aktivoituvat haarojen ja Purkinjen säikeiden kautta → QRS
                    </li>
                  </ol>
                </div>
              )}

              {mode === 'reentry' && (
                <>
                  <div className="rounded-xl bg-[var(--bg)] px-4 py-3">
                    <p className="font-display text-[15px] font-semibold text-[var(--text)]">Kiertoaktivaatio (re-entry)</p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-dim)]">
                      Valtaosa ensihoidossa kohdattavista rytmihäiriöistä syntyy kiertoaktivaatiolla. Impulssi jää kiertämään, kun{' '}
                      <strong className="font-semibold text-[var(--text)]">kierroksen kesto on pidempi kuin solujen palautumisaika</strong>{' '}
                      (refraktaariaika).
                    </p>
                    <ul className="mt-2.5 space-y-1 text-[13px] leading-snug text-[var(--text-dim)]">
                      <li>
                        <span className="font-semibold text-[var(--text)]">Anatominen:</span> esim. WPW-oikorata (kuvassa) tai eteislepatus
                        trikuspidaaliläpän ympärillä
                      </li>
                      <li>
                        <span className="font-semibold text-[var(--text)]">Toiminnallinen:</span> esim. iskeemisen alueen reunalla
                      </li>
                    </ul>
                  </div>
                  {loop === 'stopped' ? (
                    <>
                      <Result tone="ok" title="Kierto katkesi eteis-kammiosolmukkeessa">
                        Kiertoaktivaatio katkaistaan pysäyttämällä johtuminen eteis-kammiosolmukkeessa (adenosiini, defibrillaatio) tai pidentämällä
                        refraktaariaikaa (amiodaroni).
                      </Result>
                      <button
                        type="button"
                        onClick={restartLoop}
                        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 text-[14px] font-medium text-[var(--text)] transition-transform duration-150 ease-out active:scale-[0.98]"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden />
                        Käynnistä kierto uudelleen
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={cutLoop}
                      disabled={loop === 'stopping'}
                      className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-[14px] font-semibold text-white shadow-sm transition-[transform,opacity] duration-150 ease-out active:scale-[0.98] disabled:opacity-70"
                    >
                      <Scissors className="h-4 w-4" aria-hidden />
                      {loop === 'stopping' ? 'Katkaistaan…' : 'Katkaise kierto'}
                    </button>
                  )}
                </>
              )}

              {mode === 'aberration' && (
                <>
                  <div className="rounded-xl bg-[var(--bg)] px-4 py-3">
                    <p className="font-display text-[15px] font-semibold text-[var(--text)]">Aberraatio</p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--text-dim)]">
                      Normaalia johtoratajärjestelmää pitkin kulkeva impulssi tuottaa kapean QRS:n. Jos{' '}
                      <strong className="font-semibold text-[var(--text)]">toinen haara ei ehdi palautua johtokykyiseksi</strong> korkealla
                      sykkeellä, impulssi leviää sen puoleiseen kammioon hitaammin ja{' '}
                      <strong className="font-semibold text-[var(--text)]">QRS leventyy</strong>.
                    </p>
                  </div>
                  <Result tone="warning" title="Leveä QRS ei aina tarkoita kammioperäistä">
                    Siksi myös supraventrikulaarinen rytmihäiriö voi näyttää leveäkompleksiselta.
                  </Result>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Structure chips */}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">Johtoratajärjestelmä</p>
            <div className="flex flex-wrap gap-1.5">
              {PARTS.map((p) => {
                const active = part === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPart(active ? null : p.id)}
                    className={`flex min-h-[44px] items-center gap-2 rounded-xl border py-1.5 pl-1.5 pr-3 text-[13px] font-medium transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${
                      active ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text)]'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ${
                        active ? 'bg-[var(--text)] !text-[var(--bg-raised)]' : 'bg-brand-500'
                      }`}
                      aria-hidden
                    >
                      {p.n}
                    </span>
                    {p.name}
                  </button>
                )
              })}
            </div>
            <div className="mt-2 min-h-[44px]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {selected ? (
                  <motion.p
                    key={selected.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="rounded-xl border border-brand-500/25 bg-brand-500/[0.06] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[var(--text-dim)]"
                  >
                    <strong className="font-semibold text-[var(--text)]">{selected.name}.</strong> {selected.text}
                  </motion.p>
                ) : (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="px-1 text-[12.5px] leading-relaxed text-[var(--text-dim)]"
                  >
                    Napauta rakennetta – numerot kulkevat impulssin järjestyksessä.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
