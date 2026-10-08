/* Official NEWS2 parameter bands (Royal College of Physicians 2017, SpO2 scale 1).
 * Shared by the NEWS2 calculator widget and the scenario patient monitor. */

export const scoreRR = (v: number) => (v <= 8 ? 3 : v <= 11 ? 1 : v <= 20 ? 0 : v <= 24 ? 2 : 3)
export const scoreSpO2 = (v: number) => (v <= 91 ? 3 : v <= 93 ? 2 : v <= 95 ? 1 : 0)
export const scoreSBP = (v: number) => (v <= 90 ? 3 : v <= 100 ? 2 : v <= 110 ? 1 : v <= 219 ? 0 : 3)
export const scoreHR = (v: number) => (v <= 40 ? 3 : v <= 50 ? 1 : v <= 90 ? 0 : v <= 110 ? 1 : v <= 130 ? 2 : 3)
export const scoreTemp = (v: number) => (v <= 35 ? 3 : v <= 36 ? 1 : v <= 38 ? 0 : v <= 39 ? 1 : 2)
