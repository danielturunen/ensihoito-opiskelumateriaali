import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import type { WidgetProps } from '../registry'
import { toneText, type Tone } from '../ui'

interface Item {
  time: string
  title: string
  text?: string
  tone?: Tone
}

const dotColor: Record<Tone, string> = {
  neutral: 'bg-[var(--text-dim)]',
  brand: 'bg-brand-500',
  ok: 'bg-teal-500',
  warning: 'bg-brand-500',
  danger: 'bg-danger-500',
  info: 'bg-[var(--text-dim)]',
}

export default function Timeline(props: WidgetProps) {
  const items = (props.items as Item[] | undefined) ?? []
  const ref = useRef<HTMLOListElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()

  return (
    <ol ref={ref} className="relative">
      <motion.span
        aria-hidden
        className="absolute left-[78px] top-2 bottom-2 w-0.5 origin-top rounded-full bg-[var(--border)]"
        initial={reduce ? false : { scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : undefined}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      />
      {items.map((item, i) => {
        const tone = item.tone ?? 'neutral'
        return (
          <motion.li
            key={i}
            className="relative grid grid-cols-[64px_28px_1fr] items-start py-2"
            initial={reduce ? false : { opacity: 0, x: -6 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.3, delay: reduce ? 0 : 0.08 + i * 0.06, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className="pt-0.5 text-right font-display text-[13px] font-bold leading-tight tabular-nums text-[var(--text)]">{item.time}</span>
            <span className="flex justify-center pt-1.5" aria-hidden>
              <span className={`h-3 w-3 rounded-full ring-4 ring-[var(--bg-raised)] ${dotColor[tone]}`} />
            </span>
            <span className="min-w-0">
              <span className={`block font-display text-[14px] font-semibold leading-snug ${toneText[tone]}`}>{item.title}</span>
              {item.text && <span className="mt-0.5 block text-[13px] leading-relaxed text-[var(--text-dim)]">{item.text}</span>}
            </span>
          </motion.li>
        )
      })}
    </ol>
  )
}
