import { useEffect, useId, useLayoutEffect, useRef, type RefObject } from 'react'
import { useInView, useReducedMotion } from 'motion/react'

/**
 * Runs `tick(dtSeconds)` on every animation frame while the element is on screen and
 * the user has not asked for reduced motion. No frames are scheduled otherwise, so an
 * off-screen widget costs nothing. Returns whether the loop is currently running.
 */
export function useFrameLoop(ref: RefObject<Element | null>, tick: (dt: number) => void, enabled = true): boolean {
  const reduce = useReducedMotion()
  const inView = useInView(ref, { margin: '80px 0px' })
  const active = enabled && !reduce && inView
  const tickRef = useRef(tick)

  useLayoutEffect(() => {
    tickRef.current = tick
  })

  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      // Clamp so a backgrounded tab doesn't teleport everything on return.
      const dt = Math.min(now - last, 50) / 1000
      last = now
      tickRef.current(dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return active
}

/** useId() output is not always a valid url(#…) fragment — strip the unsafe characters. */
export function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}

/** Small deterministic PRNG so initial particle layouts are identical on every render. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
