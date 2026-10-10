import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg, type Tone } from '../ui'

/* Valve-based CPAP mask (Säämänen 2008): the flow is adequate when the pressure valve stays
 * open in both inspiration and expiration; a reversed connection sucks air out of the mask. */

type Mode = 'ok' | 'low' | 'wrong'
type Phase = 'in' | 'out'

const TEXT: Record<Mode, { title: string; text: string; tone: Tone }> = {
  ok: {
    title: 'Virtaus riittää',
    text: 'Paineventtiili pysyy auki sekä sisään- että uloshengityksen aikana – ilmavirtauksen pitää tuntua venttiilin suuaukolta molemmissa vaiheissa. Silloin ilmatiepaine pysyy venttiilin määräämällä tasolla myös sisäänhengityksessä.',
    tone: 'ok',
  },
  low: {
    title: 'Virtaus ei riitä',
    text: 'Venttiili sulkeutuu potilaan sisäänhengittäessä, ja ilmatiepaine laskee venttiilin tason alle. Paineen suuruus riippuu siitä, että maskiin johdetaan riittävän suuri happivirtaus.',
    tone: 'warning',
  },
  wrong: {
    title: 'Väärä kytkentä – hengenvaarallinen',
    text: 'Potilaaseen menevä letku on kytketty generaattorin ilmanottoaukkoon. Happi virtaa suoraan ulkoilmaan ja aiheuttaa letkun kautta imun tiiviisti asetettuun maskiin ja hengitysteihin: potilas ei saa hengitettyä, ja keuhkojen jäännösilmaakin imetään pois.',
    tone: 'danger',
  },
}

export default function CpapValve() {
  const [mode, setMode] = useState<Mode>('ok')
  const [phase, setPhase] = useState<Phase>('in')
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setPhase((p) => (p === 'in' ? 'out' : 'in')), 1800)
    return () => clearInterval(t)
  }, [reduce])

  const valveOpen = mode === 'ok' || (mode === 'low' && phase === 'out')
  // pressure relative to the valve level (1 = set level)
  const pressure = mode === 'ok' ? 1 : mode === 'low' ? (phase === 'in' ? 0.35 : 1) : -0.6
  const t = TEXT[mode]
  const flowColor = mode === 'wrong' ? svg.danger : svg.teal

  return (
    <div>
      <Segmented
        layoutId="cpap-valve"
        size="sm"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'ok', label: 'Riittävä virtaus' },
          { value: 'low', label: 'Liian pieni' },
          { value: 'wrong', label: 'Väärä kytkentä' },
        ]}
      />

      <svg viewBox="0 0 320 150" className="mt-3 h-auto w-full" role="img" aria-label={`${t.title}. ${phase === 'in' ? 'Sisäänhengitys' : 'Uloshengitys'}, venttiili ${valveOpen ? 'auki' : 'kiinni'}.`}>
        <g aria-hidden>
          {/* patient + mask */}
          <circle cx={36} cy={60} r={26} fill={svg.raised} stroke={svg.ink} strokeOpacity={0.35} strokeWidth={2} />
          <path d="M56 46 L76 50 L76 70 L56 74 Z" fill={svg.tealSoft} stroke={svg.teal} strokeWidth={2} />
          {/* lungs breathing */}
          <motion.ellipse cx={36} cy={112} rx={22} initial={false} animate={{ ry: phase === 'in' && mode !== 'wrong' ? 18 : 12 }} transition={{ duration: reduce ? 0 : 0.8 }} fill="rgba(224,120,156,0.25)" stroke="#e0789c" strokeWidth={1.5} />
          {/* tube */}
          <rect x={76} y={54} width={170} height={12} rx={6} fill={svg.raised} stroke={svg.ink} strokeOpacity={0.3} />
          {/* generator / O2 inlet */}
          <rect x={130} y={88} width={50} height={26} rx={5} fill={svg.raised} stroke={svg.ink} strokeOpacity={0.35} />
          <text x={155} y={105} fontSize={9} fontWeight={600} fill={svg.ink} textAnchor="middle">
            O₂-virtaus
          </text>
          <line x1={155} y1={88} x2={155} y2={66} stroke={flowColor} strokeWidth={3} />
          {/* moving flow dots */}
          {!reduce &&
            [0, 1, 2].map((i) => (
              <motion.circle
                key={`${mode}-${i}`}
                r={3}
                fill={flowColor}
                cy={60}
                initial={{ cx: mode === 'wrong' ? 80 : 150, opacity: 0 }}
                animate={{ cx: mode === 'wrong' ? [80, 150] : [150, 82], opacity: [0, 1, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.45 }}
              />
            ))}
          {/* pressure valve */}
          <rect x={246} y={46} width={22} height={28} rx={4} fill={valveOpen ? svg.tealSoft : svg.dangerSoft} stroke={valveOpen ? svg.teal : svg.danger} strokeWidth={2} />
          <motion.line x1={257} x2={257} initial={false} animate={{ y1: valveOpen ? 50 : 56, y2: valveOpen ? 58 : 64 }} stroke={valveOpen ? svg.teal : svg.danger} strokeWidth={3} />
          <text x={257} y={40} fontSize={9} fill={svg.dim} textAnchor="middle">
            paineventtiili
          </text>
          {valveOpen && (
            <motion.path d="M272 60 L300 60 M294 54 L300 60 L294 66" fill="none" stroke={svg.teal} strokeWidth={2.5} strokeLinecap="round" initial={false} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: reduce ? 0 : Infinity }} />
          )}
          {mode === 'wrong' && (
            <text x={200} y={36} fontSize={10} fontWeight={700} fill={svg.danger} textAnchor="middle">
              imu maskiin!
            </text>
          )}

          {/* pressure bar */}
          <text x={226} y={128} fontSize={9} fill={svg.dim}>
            ilmatiepaine
          </text>
          <rect x={226} y={132} width={84} height={10} rx={3} fill={svg.raised} />
          <line x1={226 + 84 * 0.8} y1={128} x2={226 + 84 * 0.8} y2={146} stroke={svg.ink} strokeOpacity={0.5} strokeDasharray="2 2" />
          <motion.rect
            x={226}
            y={132}
            height={10}
            rx={3}
            initial={false}
            animate={{ width: Math.max(0, pressure) * 84 * 0.8, fill: pressure >= 1 ? svg.teal : pressure > 0 ? svg.brand : svg.danger }}
            transition={{ duration: reduce ? 0 : 0.5 }}
          />
        </g>
      </svg>

      <div className="mt-1 flex items-center justify-between text-[12px] text-[var(--text-dim)]">
        <span>
          Vaihe: <strong className="text-[var(--text)]">{phase === 'in' ? 'sisäänhengitys' : 'uloshengitys'}</strong>
        </span>
        {reduce && (
          <button onClick={() => setPhase((p) => (p === 'in' ? 'out' : 'in'))} className="min-h-[36px] rounded-lg border border-[var(--border)] px-3 text-[12px] text-[var(--text)]">
            Vaihda vaihe
          </button>
        )}
        <span>
          {mode === 'wrong' ? (
            <>
              Maskissa: <strong className="text-danger-500">alipaine</strong>
            </>
          ) : (
            <>
              Venttiili: <strong className={valveOpen ? 'text-teal-600' : 'text-danger-500'}>{valveOpen ? 'auki' : 'kiinni'}</strong>
            </>
          )}
        </span>
      </div>

      <div className="mt-3">
        <Result tone={t.tone} title={t.title}>
          {t.text}
        </Result>
      </div>
    </div>
  )
}
