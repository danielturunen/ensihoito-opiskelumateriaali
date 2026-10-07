/* Procedural, deterministic ECG waveform generator shared by the ECG-themed widgets.
 *
 * A trace is a sum of Gaussian bumps (P, Q, R, S, T …) placed per beat, plus optional
 * continuous components (flutter saw-tooth, fibrillation, baseline wander). Rhythm strips
 * are built to be perfectly periodic over `period` seconds so they can loop seamlessly. */

/** Small seeded PRNG (mulberry32) so every render produces the identical strip. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** One Gaussian component. `at` = offset from the beat time, `amp` in mV, `width` = sigma. Same time unit as the beat. */
export interface Wave {
  at: number
  amp: number
  width: number
}

export interface Beat {
  t: number
  waves: Wave[]
  gain?: number
}

/** Sum of Gaussian waves evaluated at time t (waves already absolute: `at` = centre). */
export function evalWaves(waves: Wave[], t: number): number {
  let v = 0
  for (const w of waves) {
    const d = (t - w.at) / w.width
    if (d > -5 && d < 5) v += w.amp * Math.exp(-0.5 * d * d)
  }
  return v
}

/** Flatten beats into absolute waves. With `period`, copies at ±period are added so the signal wraps. */
export function beatsToWaves(beats: Beat[], period?: number): Wave[] {
  const out: Wave[] = []
  const shifts = period ? [-period, 0, period] : [0]
  for (const b of beats) {
    const g = b.gain ?? 1
    for (const w of b.waves) for (const s of shifts) out.push({ at: b.t + w.at + s, amp: w.amp * g, width: w.width })
  }
  return out
}

/** Sample waves (+ optional continuous function) on [t0, t1] with step dt. */
export function sample(waves: Wave[], t0: number, t1: number, dt: number, cont?: (t: number) => number): Float64Array {
  const n = Math.round((t1 - t0) / dt) + 1
  const out = new Float64Array(n)
  if (cont) for (let i = 0; i < n; i++) out[i] = cont(t0 + i * dt)
  for (const w of waves) {
    const lo = Math.max(0, Math.floor((w.at - 5 * w.width - t0) / dt))
    const hi = Math.min(n - 1, Math.ceil((w.at + 5 * w.width - t0) / dt))
    for (let i = lo; i <= hi; i++) {
      const d = (t0 + i * dt - w.at) / w.width
      out[i] += w.amp * Math.exp(-0.5 * d * d)
    }
  }
  return out
}

/** Ramer–Douglas–Peucker simplification (iterative). Returns kept indices. */
function simplify(xs: Float64Array, ys: Float64Array, eps: number): number[] {
  const n = xs.length
  if (n < 3) return Array.from({ length: n }, (_, i) => i)
  const keep = new Uint8Array(n)
  keep[0] = 1
  keep[n - 1] = 1
  const stack: [number, number][] = [[0, n - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()!
    const ax = xs[a], ay = ys[a], bx = xs[b], by = ys[b]
    const dx = bx - ax, dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    let best = -1
    let bestD = eps
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * (xs[i] - ax) - dx * (ys[i] - ay)) / len
      if (d > bestD) {
        bestD = d
        best = i
      }
    }
    if (best > 0) {
      keep[best] = 1
      stack.push([a, best], [best, b])
    }
  }
  const idx: number[] = []
  for (let i = 0; i < n; i++) if (keep[i]) idx.push(i)
  return idx
}

const r2 = (v: number) => Math.round(v * 100) / 100

/** Build an SVG polyline path from samples. x = x0 + i*dx, y = y0 - v*yScale (clamped). */
export function toPath(
  values: Float64Array,
  { x0, dx, y0, yScale, yMin = -Infinity, yMax = Infinity, eps = 0.04 }: { x0: number; dx: number; y0: number; yScale: number; yMin?: number; yMax?: number; eps?: number },
): string {
  const n = values.length
  const xs = new Float64Array(n)
  const ys = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    xs[i] = x0 + i * dx
    ys[i] = Math.min(yMax, Math.max(yMin, y0 - values[i] * yScale))
  }
  const idx = simplify(xs, ys, eps)
  let d = `M${r2(xs[idx[0]])} ${r2(ys[idx[0]])}`
  for (let k = 1; k < idx.length; k++) d += `L${r2(xs[idx[k]])} ${r2(ys[idx[k]])}`
  return d
}

/* ------------------------------------------------------------------ */
/* Beat morphologies (seconds, mV)                                      */
/* ------------------------------------------------------------------ */

const P_WAVE: Wave = { at: -0.165, amp: 0.17, width: 0.024 }

const QRS_NARROW: Wave[] = [
  { at: -0.03, amp: -0.1, width: 0.008 },
  { at: 0, amp: 1.15, width: 0.0105 },
  { at: 0.028, amp: -0.28, width: 0.009 },
]

/** Asymmetric T wave whose position follows the RR interval (shorter QT at faster rates). */
function tWave(rr: number, amp = 0.32): Wave[] {
  const peak = 0.29 * Math.sqrt(rr)
  return [
    { at: peak - 0.035, amp: amp * 0.55, width: 0.05 },
    { at: peak + 0.012, amp: amp * 0.55, width: 0.034 },
  ]
}

const QRS_VT: Wave[] = [
  { at: -0.035, amp: 0.25, width: 0.022 },
  { at: 0, amp: 1.05, width: 0.03 },
  { at: 0.07, amp: -0.6, width: 0.032 },
  { at: 0.2, amp: -0.32, width: 0.045 },
]

const QRS_TDP: Wave[] = [
  { at: 0, amp: 1, width: 0.036 },
  { at: 0.085, amp: -0.55, width: 0.04 },
]

const QRS_ESCAPE: Wave[] = [
  { at: -0.02, amp: 0.2, width: 0.016 },
  { at: 0.02, amp: 0.95, width: 0.026 },
  { at: 0.075, amp: -0.4, width: 0.028 },
  { at: 0.36, amp: -0.28, width: 0.07 },
]

/* ------------------------------------------------------------------ */
/* Rhythm strips                                                        */
/* ------------------------------------------------------------------ */

export type RhythmId = 'sinus' | 'af' | 'flutter' | 'psvt' | 'vt' | 'tdp' | 'vf' | 'brady' | 'avb3'

/** Monitor geometry in millimetres (25 mm/s, 10 mm/mV). */
export const ECG_MM_PER_S = 25
export const ECG_MM_PER_MV = 12
export const ECG_WINDOW_S = 4
export const ECG_HEIGHT_MM = 46
const BASELINE_MM = 25
const PERIOD_S = 12
const DT = 0.004

export interface RhythmStrip {
  /** Loop length in seconds (the strip repeats seamlessly after this). */
  period: number
  /** Visible window in seconds. */
  window: number
  /** Total drawn width in mm (= (period + window) * 25). */
  widthMm: number
  heightMm: number
  path: string
  /** QRS (R-peak) times within [0, period). Empty for VF. */
  beats: number[]
  /** Approximate ventricular rate per minute, or null when chaotic. */
  rate: number | null
}

function periodicSines(rand: () => number, count: number, kMin: number, kMax: number, ampMin: number, ampMax: number) {
  const comps = Array.from({ length: count }, () => ({
    k: Math.round(kMin + rand() * (kMax - kMin)),
    a: ampMin + rand() * (ampMax - ampMin),
    p: rand() * Math.PI * 2,
  }))
  return (t: number) => {
    let v = 0
    for (const c of comps) v += c.a * Math.sin((2 * Math.PI * c.k * t) / PERIOD_S + c.p)
    return v
  }
}

const wander = (t: number) => 0.025 * Math.sin((2 * Math.PI * 2 * t) / PERIOD_S + 1)

function regular(rr: number, offset: number, make: (t: number) => Beat): Beat[] {
  const n = Math.round(PERIOD_S / rr)
  const step = PERIOD_S / n
  return Array.from({ length: n }, (_, i) => make(offset + i * step))
}

function design(id: RhythmId): { beats: Beat[]; cont?: (t: number) => number; chaotic?: boolean } {
  switch (id) {
    case 'sinus':
      return { beats: regular(0.8, 0.35, (t) => ({ t, waves: [P_WAVE, ...QRS_NARROW, ...tWave(0.8)] })), cont: wander }
    case 'brady':
      return { beats: regular(1.5, 0.55, (t) => ({ t, waves: [P_WAVE, ...QRS_NARROW, ...tWave(1.5)] })), cont: wander }
    case 'psvt':
      return { beats: regular(1 / 3, 0.2, (t) => ({ t, waves: [...QRS_NARROW, ...tWave(1 / 3, 0.28)] })), cont: wander }
    case 'af': {
      const rand = mulberry32(7)
      const rrs: number[] = []
      let sum = 0
      while (sum < PERIOD_S) {
        const rr = 0.32 + rand() * 0.3
        rrs.push(rr)
        sum += rr
      }
      const scale = PERIOD_S / sum
      let t = 0.25
      const beats = rrs.map((rr) => {
        const b: Beat = { t, waves: [...QRS_NARROW, ...tWave(0.5, 0.24)] }
        t += rr * scale
        return b
      })
      const fib = periodicSines(mulberry32(11), 6, 62, 100, 0.012, 0.03)
      return { beats, cont: (x) => fib(x) + wander(x) }
    }
    case 'flutter': {
      const fPeriod = 0.2
      const saw = (t: number) => {
        const ph = (((t + 0.14) % fPeriod) + fPeriod) % fPeriod / fPeriod
        const s = ph < 0.78 ? 0.5 - ph / 0.78 : -0.5 + (ph - 0.78) / 0.22
        return 0.42 * s
      }
      return {
        beats: regular(0.4, 0.13, (t) => ({ t, waves: [...QRS_NARROW, ...tWave(0.4, 0.08)] })),
        cont: (t) => saw(t) + wander(t),
      }
    }
    case 'vt':
      return { beats: regular(12 / 34, 0.2, (t) => ({ t, waves: QRS_VT })) }
    case 'tdp':
      return {
        beats: regular(0.25, 0.11, (t) => ({ t, waves: QRS_TDP, gain: 1.55 * Math.sin((Math.PI * t) / 3) })),
      }
    case 'vf': {
      const osc = periodicSines(mulberry32(23), 8, 44, 80, 0.5, 1)
      const env = (t: number) =>
        0.62 + 0.26 * Math.sin((2 * Math.PI * 3 * t) / PERIOD_S + 0.7) + 0.14 * Math.sin((2 * Math.PI * 5 * t) / PERIOD_S + 2.1)
      // Normalise to ~0.85 mV peak
      let peak = 0
      for (let t = 0; t < PERIOD_S; t += DT) peak = Math.max(peak, Math.abs(osc(t) * env(t)))
      const g = 0.85 / (peak || 1)
      return { beats: [], cont: (t) => osc(t) * env(t) * g, chaotic: true }
    }
    case 'avb3': {
      const ps = regular(0.8, 0.12, (t) => ({ t, waves: [{ at: 0, amp: 0.15, width: 0.022 }] }))
      const qrs = regular(12 / 7, 0.9, (t) => ({ t, waves: QRS_ESCAPE }))
      return { beats: [...ps, ...qrs], cont: wander }
    }
  }
}

const stripCache = new Map<RhythmId, RhythmStrip>()

export function rhythmStrip(id: RhythmId): RhythmStrip {
  const hit = stripCache.get(id)
  if (hit) return hit
  const { beats, cont, chaotic } = design(id)
  const waves = beatsToWaves(beats, PERIOD_S)
  const total = PERIOD_S + ECG_WINDOW_S
  const values = sample(waves, 0, total, DT, cont ? (t) => cont(((t % PERIOD_S) + PERIOD_S) % PERIOD_S) : undefined)
  const path = toPath(values, {
    x0: 0,
    dx: DT * ECG_MM_PER_S,
    y0: BASELINE_MM,
    yScale: ECG_MM_PER_MV,
    yMin: 0.8,
    yMax: ECG_HEIGHT_MM - 0.8,
    eps: 0.035,
  })
  // Ventricular beats = beats that contain a big (R) component
  const qrsBeats = chaotic ? [] : beats.filter((b) => b.waves.some((w) => Math.abs(w.amp) >= 0.9)).map((b) => b.t)
  const strip: RhythmStrip = {
    period: PERIOD_S,
    window: ECG_WINDOW_S,
    widthMm: total * ECG_MM_PER_S,
    heightMm: ECG_HEIGHT_MM,
    path,
    beats: qrsBeats.sort((a, b) => a - b),
    rate: chaotic ? null : Math.round((qrsBeats.length * 60) / PERIOD_S / 5) * 5,
  }
  stripCache.set(id, strip)
  return strip
}
