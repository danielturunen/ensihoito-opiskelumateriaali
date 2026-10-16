/** Keypoint waveform: [time ms, amplitude mm]. Times must be strictly increasing. */
export type KP = [number, number]

/**
 * Smooth waveform through keypoints (monotone cubic Hermite, Fritsch–Carlson): no overshoot past
 * the keypoints and no flat steps at each point, so peaks stay sharp and slopes stay smooth.
 */
export function ecgCurve(kp: KP[]): (t: number) => number {
  const n = kp.length
  const d: number[] = []
  for (let i = 0; i < n - 1; i++) d.push((kp[i + 1][1] - kp[i][1]) / (kp[i + 1][0] - kp[i][0]))
  const m: number[] = new Array(n)
  m[0] = d[0]
  m[n - 1] = d[n - 2]
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0
      m[i + 1] = 0
      continue
    }
    const a = m[i] / d[i]
    const b = m[i + 1] / d[i]
    const s = a * a + b * b
    if (s > 9) {
      const k = 3 / Math.sqrt(s)
      m[i] = k * a * d[i]
      m[i + 1] = k * b * d[i]
    }
  }
  return (t: number) => {
    if (t <= kp[0][0]) return kp[0][1]
    if (t >= kp[n - 1][0]) return kp[n - 1][1]
    let i = 0
    while (t > kp[i + 1][0]) i++
    const [x0, y0] = kp[i]
    const [x1, y1] = kp[i + 1]
    const h = x1 - x0
    const u = (t - x0) / h
    const u2 = u * u
    const u3 = u2 * u
    return (2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * h * m[i + 1]
  }
}
