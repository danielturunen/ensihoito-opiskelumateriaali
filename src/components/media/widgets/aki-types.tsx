import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg } from '../ui'

/* Acute kidney injury: pre-renal, renal, post-renal – where along the path the
 * problem is (article: munuaisten-vajaatoiminta, Akuuttihoitotyön opas 2024). Schematic. */

type Kind = 'pre' | 'ren' | 'post'

const DATA: Record<Kind, { label: string; title: string; what: string; examples: string; scene: string; focus: { x: number; y: number; w: number; h: number } }> = {
  pre: {
    label: 'Prerenaalinen',
    title: 'Munuaisten verenkierto ei riitä (yleisin)',
    what: 'Munuainen on terve, mutta sinne ei virtaa tarpeeksi verta.',
    examples: 'Vuoto, oksentelu, ripuli, kuivuminen, sydämen vajaatoiminta, sepsis, keuhkoembolia, lääkkeet.',
    scene: 'Korjaa hypovolemia balansoidulla kirkkaalla liuoksella – mutta vältä liikaa nestettä. Noradrenaliini on ensisijainen vasopressori.',
    focus: { x: 18, y: 30, w: 96, h: 120 },
  },
  ren: {
    label: 'Renaalinen',
    title: 'Munuaiskudos vaurioituu',
    what: 'Vaurio on itse munuaisessa.',
    examples: 'Pitkittynyt iskemia, röntgenvarjoaine, lääkkeet, rabdomyolyysi, hemolyysi, glomerulonefriitti, vaskuliitti.',
    scene: 'Selvitä munuaisille haitalliset lääkkeet (tulehduskipulääkkeet, ACE:n estäjät, AT-salpaajat, metformiini) sekä rabdomyolyysin tai hemolyysin mahdollisuus.',
    focus: { x: 120, y: 30, w: 92, h: 120 },
  },
  post: {
    label: 'Postrenaalinen',
    title: 'Virtsan kulku on estynyt',
    what: 'Munuainen tekee virtsaa, mutta se ei pääse ulos.',
    examples: 'Eturauhassairaudet, kivet, kasvaimet, rakon tyhjenemishäiriö – tavallinen iäkkäällä.',
    scene: 'Muista virtsaumpi: kivulias pullistuma keskellä alavatsaa, iäkkäällä miehellä eturauhanen.',
    focus: { x: 214, y: 30, w: 92, h: 120 },
  },
}
const ORDER: Kind[] = ['pre', 'ren', 'post']

export default function AkiTypes() {
  const [kind, setKind] = useState<Kind>('pre')
  const reduce = useReducedMotion()
  const d = DATA[kind]

  return (
    <div>
      <Segmented layoutId="aki-types" size="sm" value={kind} onChange={setKind} options={ORDER.map((k) => ({ value: k, label: DATA[k].label }))} />

      <svg viewBox="0 0 320 170" className="mt-3 h-auto w-full" role="img" aria-label={`${d.label}: ${d.what}`}>
        <motion.rect
          initial={false}
          animate={{ x: d.focus.x, y: d.focus.y, width: d.focus.w, height: d.focus.h }}
          transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.1 }}
          rx={14}
          fill={svg.brandSoft}
          stroke={svg.brand}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          aria-hidden
        />
        <g aria-hidden>
          {/* heart */}
          <path d="M66 70 C58 56 38 58 38 76 C38 92 66 106 66 106 C66 106 94 92 94 76 C94 58 74 56 66 70 Z" fill={svg.dangerSoft} stroke={svg.danger} strokeWidth={2} />
          {/* aorta / renal artery */}
          <path d="M66 106 L66 128 L150 128 L150 104" fill="none" stroke={svg.danger} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          {/* kidney */}
          <path d="M150 52 C128 52 124 74 132 88 C138 98 136 108 146 114 C164 124 182 108 180 84 C178 62 170 52 150 52 Z" fill="rgba(194,65,12,0.22)" stroke={svg.blood} strokeWidth={2} />
          {/* ureter to bladder */}
          <path d="M168 104 C190 120 214 112 236 98" fill="none" stroke="#d9a400" strokeWidth={4} strokeLinecap="round" />
          {/* bladder */}
          <ellipse cx={254} cy={92} rx={24} ry={18} fill="rgba(250,204,21,0.24)" stroke="#d9a400" strokeWidth={2} />
          {/* urethra + prostate */}
          <path d="M254 110 L254 146" stroke="#d9a400" strokeWidth={4} strokeLinecap="round" />
          <circle cx={254} cy={122} r={9} fill="none" stroke={svg.dim} strokeWidth={2} />
          {/* flow dots */}
          {!reduce &&
            [0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                r={3}
                fill={svg.danger}
                initial={{ cx: 66, cy: 106, opacity: 0 }}
                animate={{ cx: [66, 66, 150, 150], cy: [106, 128, 128, 104], opacity: [0, 1, 1, 0] }}
                transition={{ duration: kind === 'pre' ? 3.2 : 1.8, repeat: Infinity, delay: i * 0.6, ease: 'linear' }}
              />
            ))}
        </g>
        <text x={66} y={44} fontSize={11} textAnchor="middle" fill={svg.ink} fontWeight={600}>
          sydän
        </text>
        <text x={156} y={44} fontSize={11} textAnchor="middle" fill={svg.ink} fontWeight={600}>
          munuainen
        </text>
        <text x={258} y={66} fontSize={11} textAnchor="middle" fill={svg.ink} fontWeight={600}>
          rakko
        </text>
        <text x={244} y={146} fontSize={10} fill={svg.dim} textAnchor="end">
          eturauhanen
        </text>
      </svg>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={kind}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mt-2 flex flex-col gap-2"
        >
          <div className="rounded-xl bg-[var(--bg)] px-3.5 py-2.5">
            <p className="font-display text-[15px] font-semibold text-[var(--text)]">{d.title}</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--text-dim)]">{d.what}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{d.examples}</p>
          </div>
          <Result tone="warning" title="Kohteessa">
            {d.scene}
          </Result>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
