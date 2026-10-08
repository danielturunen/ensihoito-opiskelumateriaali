import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { Segmented, svg } from '../ui'
import { Bullets, FadeSwap, Stage, Swatch, useLoop } from '../parts/resp-kit'

type Mode = 'normal' | 'lack' | 'hypo'

const GLU = '#f59e0b'
const KETO = '#a855f7'
const KEY = '#0fb8ac'

const TEXT: Record<Mode, { title: string; tone: string; items: string[] }> = {
  normal: {
    title: 'Insuliini avaa oven',
    tone: 'text-teal-600',
    items: [
      'Insuliini avaa glukoosin pääsyn lihas- ja rasvasoluihin.',
      'Se hillitsee maksan omaa sokerintuotantoa ja estää rasvan hajottamisen ketoaineiksi.',
      'Aivot pääsevät glukoosiin käsiksi ilman insuliiniakin.',
    ],
  },
  lack: {
    title: 'Insuliinin puute → ketoasidoosi',
    tone: 'text-danger-500',
    items: [
      'Glukoosi ei pääse soluihin – verensokeri nousee, ja maksa tuottaa vielä lisää sokeria.',
      'Keho polttaa rasvaa → ketoaineita → veri happamoituu (metabolinen asidoosi) → Kussmaulin hengitys, asetonin haju.',
      'Tyypin 1 diabeteksessa insuliinin puute johtaa nopeasti ketoasidoosiin. Tyypin 2 diabeteksessa tyypillinen hätätilanne on HHS.',
    ],
  },
  hypo: {
    title: 'Hypoglykemia: aivot kärsivät ensin',
    tone: 'text-brand-600',
    items: [
      'Veressä on liian vähän glukoosia.',
      'Aivot ottavat glukoosia ilman insuliinia – siksi juuri aivot kärsivät ensimmäisenä, kun verensokeri laskee liikaa.',
    ],
  },
}

/* Tile geometry (viewBox 360 × 236) */
const VESSEL = { y: 16, h: 50 }
const TILES = [
  { id: 'liver', x: 8, label: 'Maksa' },
  { id: 'muscle', x: 95, label: 'Lihassolu' },
  { id: 'fat', x: 182, label: 'Rasvasolu' },
  { id: 'brain', x: 269, label: 'Aivot' },
] as const
const TW = 83
const TY = 104
const TH = 92

function Hex({ x, y, r = 5, fill = GLU }: { x: number; y: number; r?: number; fill?: string }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6
    return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
  return <polygon points={pts} fill={fill} />
}

function Key({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden>
      <circle cx={0} cy={0} r={4.5} fill="none" stroke={KEY} strokeWidth={2.2} />
      <path d="M4.5 0H14M10 0V4M13 0V3" stroke={KEY} strokeWidth={2.2} strokeLinecap="round" fill="none" />
    </g>
  )
}

/** Glucose molecules drifting through the vessel. */
function VesselFlow({ count, active, seed }: { count: number; active: boolean; seed: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const y = VESSEL.y + 12 + ((i * 37 + seed) % (VESSEL.h - 24))
        const startX = ((i * 71 + seed * 13) % 360) - 10
        const dur = 7 + ((i * 3) % 5)
        return (
          <motion.g
            key={i}
            initial={{ x: startX }}
            animate={active ? { x: [startX, 370, -20, startX] } : { x: startX }}
            transition={
              active
                ? { duration: dur, ease: 'linear', repeat: Infinity, times: [0, (370 - startX) / 390, (370 - startX) / 390 + 0.0001, 1] }
                : { duration: 0 }
            }
          >
            <Hex x={0} y={y} />
          </motion.g>
        )
      })}
    </g>
  )
}

/** Molecules moving between the vessel and a tile (down = into the cell, up = out of it). */
function Stream({ x, dir, color, shape, active, n = 3, period = 2.4 }: { x: number; dir: 'down' | 'up'; color: string; shape: 'hex' | 'tri'; active: boolean; n?: number; period?: number }) {
  const top = VESSEL.y + VESSEL.h - 8
  const bottom = TY + 34
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const from = dir === 'down' ? top : bottom
        const to = dir === 'down' ? bottom : top
        const staticY = from + ((to - from) * (i + 0.5)) / n
        return (
          <motion.g
            key={i}
            initial={{ y: staticY, opacity: 1 }}
            animate={active ? { y: [from, to], opacity: [0, 1, 1, 0] } : { y: staticY, opacity: 1 }}
            transition={active ? { duration: period, ease: 'easeInOut', repeat: Infinity, delay: (i * period) / n } : { duration: 0 }}
          >
            {shape === 'hex' ? (
              <Hex x={x + (i % 2 ? 4 : -4)} y={0} r={4.5} fill={color} />
            ) : (
              <path d={`M${x + (i % 2 ? 4 : -4)} -5L${x + (i % 2 ? 9 : 1)} 4H${x + (i % 2 ? -1 : -9)}Z`} fill={color} />
            )}
          </motion.g>
        )
      })}
    </g>
  )
}

export default function Insulin(_props: WidgetProps) {
  const [mode, setMode] = useState<Mode>('normal')
  const { ref, active } = useLoop<HTMLDivElement>()
  const t = TEXT[mode]
  const acid = mode === 'lack'
  const vesselCount = mode === 'lack' ? 17 : mode === 'hypo' ? 3 : 8

  return (
    <div ref={ref}>
      <Segmented
        layoutId="insulin-mode"
        size="sm"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'normal', label: 'Normaali' },
          { value: 'lack', label: 'Insuliinin puute' },
          { value: 'hypo', label: 'Hypoglykemia' },
        ]}
      />

      <Stage className="mt-3">
        <svg viewBox="0 0 360 252" className="h-auto w-full" role="img" aria-label={`${t.title}. ${t.items.join(' ')}`}>
          {/* vessel */}
          <motion.rect
            x={4}
            y={VESSEL.y}
            width={352}
            height={VESSEL.h}
            rx={22}
            animate={{ fill: acid ? 'rgba(168,85,247,0.22)' : 'rgba(220,38,38,0.13)' }}
            transition={{ duration: 0.6 }}
            stroke={acid ? KETO : 'rgba(220,38,38,0.45)'}
            strokeWidth={1.5}
          />
          <text x={16} y={VESSEL.y - 4} fontSize={11} fontWeight={600} fill={svg.dim}>
            {acid ? 'Veri: sokeri koholla, happamoituu' : mode === 'hypo' ? 'Veri: sokeri matala' : 'Veri'}
          </text>
          <VesselFlow key={mode} count={vesselCount} active={active} seed={mode === 'lack' ? 5 : 2} />
          {acid && <VesselKetones active={active} />}

          {TILES.map((tile) => {
            const cx = tile.x + TW / 2
            const isBrain = tile.id === 'brain'
            const isLiver = tile.id === 'liver'
            const needsKey = tile.id === 'muscle' || tile.id === 'fat'
            const open = isBrain || (needsKey && mode !== 'lack')
            const starving = isBrain && mode === 'hypo'
            return (
              <g key={tile.id}>
                <motion.rect
                  x={tile.x}
                  y={TY}
                  width={TW}
                  height={TH}
                  rx={16}
                  fill={svg.surface}
                  animate={{ stroke: starving ? svg.danger : svg.line, opacity: starving ? 0.75 : 1 }}
                  strokeWidth={starving ? 2 : 1.5}
                />
                <text x={cx} y={TY + TH - 12} textAnchor="middle" fontSize={11.5} fontWeight={600} fill={svg.ink}>
                  {tile.label}
                </text>
                {/* door on the vessel side */}
                {!isLiver && (
                  <g>
                    <line x1={cx - 11} y1={TY} x2={cx + 11} y2={TY} stroke={open ? KEY : svg.danger} strokeWidth={4} strokeLinecap="round" opacity={open ? 0.35 : 0.9} />
                    {!open && <path d={`M${cx - 5} ${TY - 13}l10 10m0 -10l-10 10`} stroke={svg.danger} strokeWidth={2.2} strokeLinecap="round" />}
                  </g>
                )}
                {needsKey && (
                  <AnimatePresence>
                    {mode !== 'lack' && (
                      <motion.g initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.3 }}>
                        <Key x={cx + 16} y={TY - 10} />
                      </motion.g>
                    )}
                  </AnimatePresence>
                )}
                <Glyph id={tile.id} x={cx} y={TY + 40} dim={starving} />
                {isBrain && (
                  <text x={cx} y={TY + TH + 16} textAnchor="middle" fontSize={11} fill={svg.dim}>
                    ilman insuliinia
                  </text>
                )}
                {starving && (
                  <motion.text
                    x={cx + 26}
                    y={TY + 30}
                    textAnchor="middle"
                    fontSize={26}
                    fontWeight={700}
                    fill={svg.danger}
                    animate={active ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
                    transition={{ duration: 1.4, repeat: active ? Infinity : 0 }}
                  >
                    !
                  </motion.text>
                )}
                {isLiver && (
                  <text x={cx} y={TY + TH + 16} textAnchor="middle" fontSize={11} fontWeight={mode === 'lack' ? 700 : 400} fill={mode === 'lack' ? svg.danger : svg.dim}>
                    {mode === 'lack' ? 'sokeria lisää ↑' : 'tuotanto hillitty'}
                  </text>
                )}
                {tile.id === 'fat' && mode === 'lack' && (
                  <text x={cx} y={TY + TH + 16} textAnchor="middle" fontSize={11} fontWeight={700} fill={KETO}>
                    ketoaineita ↑
                  </text>
                )}
              </g>
            )
          })}

          {/* molecule streams */}
          <Stream key={`liver-${mode}`} x={TILES[0].x + TW / 2} dir="up" color={GLU} shape="hex" active={active} n={mode === 'lack' ? 4 : 1} period={mode === 'lack' ? 1.6 : 3.2} />
          {mode !== 'lack' && (
            <>
              <Stream key={`mus-${mode}`} x={TILES[1].x + TW / 2} dir="down" color={GLU} shape="hex" active={active} n={mode === 'hypo' ? 1 : 3} />
              <Stream key={`fat-${mode}`} x={TILES[2].x + TW / 2} dir="down" color={GLU} shape="hex" active={active} n={mode === 'hypo' ? 1 : 3} />
            </>
          )}
          {mode === 'lack' && <Stream key="keto" x={TILES[2].x + TW / 2} dir="up" color={KETO} shape="tri" active={active} n={4} period={2} />}
          <Stream key={`brain-${mode}`} x={TILES[3].x + TW / 2} dir="down" color={GLU} shape="hex" active={active} n={mode === 'hypo' ? 1 : 3} period={mode === 'hypo' ? 4.5 : 2.4} />
        </svg>
      </Stage>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <Swatch color={GLU} label="Glukoosi" />
        <Swatch color={KEY} label="Insuliini (avain)" shape="ring" />
        <Swatch color={KETO} label="Ketoaineet" />
      </div>

      <FadeSwap k={mode} className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
        <p className={`mb-2 font-display text-[15px] font-semibold ${t.tone}`}>{t.title}</p>
        <Bullets items={t.items} />
      </FadeSwap>
    </div>
  )
}

/** Small schematic organ symbols. */
function Glyph({ id, x, y, dim }: { id: (typeof TILES)[number]['id']; x: number; y: number; dim: boolean }) {
  const stroke = dim ? svg.dim : svg.ink
  const common = { fill: 'none', stroke, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, opacity: dim ? 0.5 : 0.7 }
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden>
      {id === 'liver' && <path d="M-22 -6C-20 -14 0 -16 20 -12C26 -10 24 -2 18 4C8 12 -4 14 -12 10C-20 6 -24 2 -22 -6Z" {...common} fill="rgba(194,65,12,0.18)" />}
      {id === 'muscle' && (
        <>
          <path d="M-24 0C-14 -13 14 -13 24 0C14 13 -14 13 -24 0Z" {...common} fill="rgba(224,103,74,0.2)" />
          {[-12, -4, 4, 12].map((dx) => (
            <path key={dx} d={`M${dx} -8V8`} {...common} strokeWidth={1.1} />
          ))}
        </>
      )}
      {id === 'fat' &&
        [
          [-10, -5],
          [3, -8],
          [14, 0],
          [-4, 6],
          [9, 10],
          [-16, 6],
        ].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={6.5} {...common} fill="rgba(250,204,21,0.16)" />)}
      {id === 'brain' && (
        <>
          <path d="M-2 -14C-14 -16 -24 -8 -22 2C-24 10 -14 16 -2 13Z M2 -14C14 -16 24 -8 22 2C24 10 14 16 2 13Z" {...common} fill="rgba(236,72,153,0.14)" />
          <path d="M-14 -4C-9 -6 -7 -1 -11 3M14 -4C9 -6 7 -1 11 3" {...common} strokeWidth={1.2} />
        </>
      )}
    </g>
  )
}

function VesselKetones({ active }: { active: boolean }) {
  return (
    <g>
      {Array.from({ length: 6 }, (_, i) => {
        const y = VESSEL.y + 14 + ((i * 29) % (VESSEL.h - 26))
        const x0 = 200 + ((i * 53) % 150)
        return (
          <motion.path
            key={i}
            d={`M0 -5L5 4H-5Z`}
            fill={KETO}
            initial={{ x: x0, y }}
            animate={active ? { x: [x0, x0 + 40, x0], y: [y, y + 4, y] } : { x: x0, y }}
            transition={active ? { duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
          />
        )
      })}
    </g>
  )
}
