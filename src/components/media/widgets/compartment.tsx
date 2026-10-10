import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { NumberField, Result, svg, type Tone } from '../ui'

/* Compartment syndrome of the lower leg (European Trauma Course manual, ch. 10):
 * four fascial compartments; an open wound may decompress only one of them. */

const COMPS = [
  { id: 'ant', label: 'Etumainen', d: 'M150 46 C176 34 214 40 236 62 L218 104 C200 100 178 88 160 74 Z', lx: 196, ly: 66 },
  { id: 'lat', label: 'Lateraalinen', d: 'M236 62 C252 82 258 108 252 132 L226 140 C222 126 220 114 218 104 Z', lx: 240, ly: 104 },
  { id: 'deep', label: 'Syvä takimmainen', d: 'M160 74 C178 88 200 100 218 104 C220 114 222 126 226 140 C204 146 172 140 140 124 C134 108 140 88 160 74 Z', lx: 182, ly: 118 },
  { id: 'sup', label: 'Pinnallinen takimmainen', d: 'M140 124 C172 140 204 146 226 140 L252 132 C244 168 210 196 166 198 C124 198 92 178 88 142 C104 136 122 132 140 124 Z', lx: 166, ly: 172 },
] as const

function stage(v: number): { title: string; text: string; tone: Tone } {
  if (v < 30)
    return {
      title: 'Turvotus alkaa',
      text: 'Murtuman jälkeinen kipu on odotettavaa. Seuraa kipua ja raajan verenkiertoa toistuvasti – erityisesti lastoituksen ja reponoinnin jälkeen.',
      tone: 'neutral',
    }
  if (v < 70)
    return {
      title: 'Klassiset varhaiset merkit',
      text: 'Etenevä kipu, joka on vammaan nähden suhteeton; lihasryhmän erittäin voimakas aristus; kipu, kun lihasta venytetään passiivisesti. Kova kipu, joka jatkuu lastoituksen jälkeen, on aitio-oireyhtymä, kunnes toisin todistetaan.',
      tone: 'warning',
    }
  return {
    title: 'Myöhäiset merkit – lihas ja hermo kärsivät',
    text: 'Tuntoharhat, pulssittomuus ja lopulta lihas- ja hermokuolio. Pulssin tuntuminen ei sulje pois aitio-oireyhtymää. Hoito on välitön kirurginen faskiotomia.',
    tone: 'danger',
  }
}

export default function Compartment() {
  const [swell, setSwell] = useState(45)
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const st = stage(swell)
  const k = swell / 100

  return (
    <div>
      <svg viewBox="0 0 320 236" className="h-auto w-full" role="img" aria-label={`Säären poikkileikkaus, turvotus ${swell} %${open ? ', etumainen aitio avoin' : ''}`}>
        <g aria-hidden>
          <text x={160} y={18} fontSize={10} fill={svg.dim} textAnchor="middle">
            etu
          </text>
          <text x={52} y={122} fontSize={10} fill={svg.dim} textAnchor="middle">
            sisä
          </text>
          <text x={286} y={122} fontSize={10} fill={svg.dim} textAnchor="middle">
            ulko
          </text>
          {/* skin */}
          <motion.ellipse
            cx={172}
            cy={118}
            initial={false}
            animate={{ rx: 94 + k * 8, ry: 92 + k * 7 }}
            transition={{ duration: reduce ? 0 : 0.3 }}
            fill={svg.raised}
            stroke={svg.ink}
            strokeOpacity={0.35}
            strokeWidth={2}
          />
          {COMPS.map((c) => {
            const isOpen = open && c.id === 'ant'
            const level = isOpen ? 0.05 : k
            return (
              <g key={c.id}>
                <motion.path
                  d={c.d}
                  initial={false}
                  animate={{ fill: `rgba(220,38,38,${0.08 + level * 0.55})` }}
                  transition={{ duration: reduce ? 0 : 0.3 }}
                  stroke={isOpen ? svg.teal : svg.ink}
                  strokeOpacity={isOpen ? 1 : 0.45}
                  strokeWidth={isOpen ? 2 : 1.5}
                  strokeDasharray={isOpen ? '5 4' : undefined}
                />
                {/* nerve in the compartment */}
                <motion.circle cx={c.lx + 12} cy={c.ly + 12} r={4} initial={false} animate={{ fill: level > 0.7 ? '#9ca3af' : '#facc15' }} transition={{ duration: reduce ? 0 : 0.3 }} />
              </g>
            )
          })}
          {/* bones */}
          <path d="M120 44 L160 40 L162 80 C150 92 134 92 122 82 Z" fill="#e7dcc4" stroke="#c8b48a" strokeWidth={2} />
          <circle cx={234} cy={120} r={11} fill="#e7dcc4" stroke="#c8b48a" strokeWidth={2} />
          {open && (
            <g>
              <path d="M188 26 L200 44 L212 24" fill="none" stroke={svg.danger} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              <text x={226} y={22} fontSize={10} fontWeight={600} fill={svg.danger}>
                haava
              </text>
            </g>
          )}
          {COMPS.map((c) => (
            <text key={c.id} x={c.lx} y={c.ly} fontSize={8.5} fontWeight={600} fill={svg.ink} textAnchor="middle">
              {c.id === 'sup' ? 'Pinnallinen takim.' : c.id === 'deep' ? 'Syvä takim.' : c.label}
            </text>
          ))}
          <circle cx={30} cy={222} r={4} fill="#facc15" />
          <text x={38} y={225} fontSize={9} fill={svg.dim}>
            hermo
          </text>
          <text x={120} y={225} fontSize={9} fill={svg.dim}>
            sääriluu ja pohjeluu
          </text>
        </g>
      </svg>

      <div className="mt-1">
        <NumberField label="Turvotus aitioissa" value={swell} onChange={setSwell} min={0} max={100} step={5} unit="%" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-3 py-2">
        <span className="text-[13px] text-[var(--text)]">Avomurtuman haava etuaitiossa</span>
        <button
          role="switch"
          aria-checked={open}
          onClick={() => setOpen((o) => !o)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${open ? 'bg-teal-500' : 'bg-[var(--bg-raised)] ring-1 ring-[var(--border)]'}`}
        >
          <span className="sr-only">Avohaava</span>
          <motion.span className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow" initial={false} animate={{ x: open ? 20 : 0 }} transition={{ duration: reduce ? 0 : 0.18 }} />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Result tone={st.tone} title={st.title}>
          {st.text}
        </Result>
        {open && (
          <Result tone="warning" title="Avomurtuma ei suojaa">
            Säären neljästä aitiosta haava voi avata vain yhden – muut jäävät suljetuiksi ja voivat silti kehittää aitio-oireyhtymän.
          </Result>
        )}
      </div>
    </div>
  )
}
