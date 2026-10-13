import { useRef, useState } from 'react'
import type { WidgetProps } from '../registry'
import { Result, Segmented, svg } from '../ui'
import { Stage } from '../parts/resp-kit'
import { useFrameLoop } from '../parts/cardio-hooks'
import { FIG } from '../parts/exam-kit'

/* Pitting oedema (article Sydänpotilaan tutkiminen; Duodecim Oppiportti, Alaraajaturvotuksen
 * tutkiminen 2024): a finger pressed on the swollen shin leaves a pit. Timing is illustrative. */

type Kind = 'pitting' | 'nonpitting' | 'none'

const LOOP = 6

export default function ExamEdema(_props: WidgetProps) {
  const [kind, setKind] = useState<Kind>('pitting')
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(2.6)
  useFrameLoop(ref, (dt) => setT((v) => (v + dt) % LOOP))

  const swell = kind === 'none' ? 0 : 1
  const press = t < 0.5 ? 0 : t < 0.8 ? (t - 0.5) / 0.3 : t < 2 ? 1 : t < 2.2 ? 1 - (t - 2) / 0.2 : 0
  const after = t - 2.2
  // depth of the pit (px): follows the finger, then stays (pitting) or springs back
  let pit = press * (kind === 'none' ? 3 : 10)
  if (after > 0 && kind === 'pitting') pit = 10 * Math.max(0, 1 - after / 3.2)
  const front = 112 + swell * 14 // x of the shin's front surface
  const y0 = 96
  const leg = `M70 30L${front - 6} 30C${front} 60 ${front} ${y0 - 22} ${front} ${y0 - 14}C${front - pit * 0.6} ${y0 - 6} ${front - pit} ${y0} ${front - pit} ${y0}C${front - pit} ${y0} ${front - pit * 0.6} ${y0 + 6} ${front} ${y0 + 14}C${front} 140 ${front - 4} 158 ${front - 8} 170L${front + 30} 178C${front + 34} 190 ${front + 20} 196 ${front - 6} 196L72 196C66 170 66 120 70 30Z`

  return (
    <div ref={ref}>
      <Segmented
        layoutId="edema"
        size="sm"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'pitting', label: 'Kuoppaturvotus' },
          { value: 'nonpitting', label: 'Kuoppautumaton' },
          { value: 'none', label: 'Ei turvotusta' },
        ]}
      />
      <Stage className="mt-3">
        <svg viewBox="0 0 320 210" className="h-auto w-full" role="img" aria-label={kind === 'pitting' ? 'Painaminen jättää säären iholle kuopan' : 'Painaminen ei jätä kuoppaa'}>
          <path d={leg} fill={FIG.fill} stroke={FIG.line} strokeWidth={1.6} strokeLinejoin="round" />
          {swell > 0 && <path d={`M${front - 10} 44C${front - 4} 80 ${front - 4} 130 ${front - 10} 160`} fill="none" stroke="#7dd3fc" strokeWidth={10} opacity={0.18} />}
          {/* finger */}
          <g transform={`translate(${-press * (kind === 'none' ? 3 : 10)} 0)`} opacity={t > 2.4 ? 0.3 : 1}>
            <rect x={front + 2} y={y0 - 9} width={60} height={18} rx={9} fill={FIG.handSoft} stroke={FIG.hand} strokeWidth={1.6} />
          </g>
          <text x={front + 70} y={y0 - 16} fontSize={11} fill={svg.dim}>
            {t < 2.2 ? 'paina säären etupintaa' : kind === 'pitting' && pit > 1 ? 'kuoppa jää' : 'iho palautuu'}
          </text>
          <text x={96} y={18} textAnchor="middle" fontSize={11} fill={svg.dim}>
            sääri sivulta
          </text>
        </svg>
      </Stage>
      <div className="mt-3">
        <Result
          tone={kind === 'pitting' ? 'warning' : 'neutral'}
          title={kind === 'pitting' ? 'Kuoppaturvotus' : kind === 'nonpitting' ? 'Kuoppautumaton turvotus' : 'Ei turvotusta'}
        >
          {kind === 'pitting'
            ? 'Sydämen vajaatoiminnan turvotus on sormin todettavaa kuoppaturvotusta, joka ilmaantuu ensin alaraajoihin (vuodepotilaalla ristiselkään) ja jakautuu tasaisesti molemmille puolille. Paino voi nousta useita kiloja.'
            : kind === 'nonpitting'
              ? 'Esimerkiksi lihavuuteen liittyvä turvotus ei kuoppaudu.'
              : 'Turvotus on epäspesifinen löydös – arvioi aina myös toispuolisuus ja muut löydökset.'}
        </Result>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[12.5px] leading-snug">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Toispuolinen</p>
          <p className="text-[var(--text)]">Paikallinen syy: syvä laskimotukos, ruusu, Bakerin kysta, trauma, niveltulehdus, laskimoiden vajaatoiminta.</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Molemminpuolinen</p>
          <p className="text-[var(--text)]">Systeeminen syy: sydämen tai munuaisten vajaatoiminta, immobilisaatio, kalsiumkanavan salpaaja, vaikea hypoalbuminemia.</p>
        </div>
      </div>
    </div>
  )
}
