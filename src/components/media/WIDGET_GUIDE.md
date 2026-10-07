# Media widget guide

Media widgets are interactive/visual learning elements embedded into the Markdown articles
(`src/content/articles/*.md`) with a fenced block:

````md
```media
{"widget": "pneumothorax", "title": "Optional title override", "caption": "Optional caption"}
```
````

`MediaBlock` (`src/components/media/MediaBlock.tsx`) parses the block, draws the frame (title bar,
kind badge, caption, error boundary, Suspense skeleton) and renders the widget. **A widget only
renders its own inner content** — never its own outer card/border/title.

## File contract

- One file per widget: `src/components/media/widgets/<name>.tsx` (kebab-case, must match the
  name in `registry.ts` → `widgetMeta`). It is auto-discovered with `import.meta.glob` and
  lazy-loaded, so nothing else needs registering.
- `export default function Widget(props: WidgetProps)` where `WidgetProps = Record<string, unknown>`
  (import the type from `../registry`). Any extra JSON keys in the media block arrive as props.
  Bespoke illustration widgets usually take no props — hardcode their content.
- No new npm dependencies. Available: `react`, `motion/react` (springs/gestures), `lucide-react`.
- No network, no external images/fonts. Everything must work offline (PWA).
- TypeScript strict, `noUnusedLocals`/`noUnusedParameters` are on. Run `npx tsc -b` before finishing.

## Look & feel

- Reuse primitives from `../ui` (`Segmented`, `Result`, `Stat`, `NumberField`, `OptionList`,
  `Caption`, `svg` color constants, `Tone`).
- Colors come from CSS variables so light/dark themes both work:
  `var(--text)`, `var(--text-dim)`, `var(--border)`, `var(--bg)`, `var(--bg-card)`, `var(--bg-raised)`.
  Accents: brand orange `#f8690a` (Tailwind `brand-500`), teal `#0fb8ac` (`teal-500`),
  danger red `#dc2626` (`danger-500`). In SVG use the `svg.*` constants from `../ui`.
  Never hardcode white/black backgrounds inside SVG — use `svg.surface` / `svg.raised`.
- Typography: Tailwind `font-display` for headings/numbers, body 13–15px. Finnish UI text.
- SVG: always `viewBox` + `className="h-auto w-full"`, `role="img"` and an `aria-label`.
  Must look right from 340px to 720px wide. Keep labels ≥ 11px at 360px width
  (i.e. don't put 6px text in a 400-unit viewBox; prefer HTML labels next to the SVG).
- Schematic, clean, flat illustration style (think Apple Health / medical textbook diagrams
  redrawn minimally): rounded strokes (`strokeLinecap="round"`), 1.5–2.5 unit strokes,
  soft tinted fills. Not cartoonish, not photorealistic. Clarity over detail.

## Interaction & motion (Apple HIG + Emil Kowalski rules)

- Every interactive control is a real `<button>` (or input) with ≥ 44px touch height.
  No hover-only information — this is used mostly on an iPhone.
- Prefer `Segmented` tabs for switching states/scenarios and tap-to-select hotspots.
- Animate only `transform`, `opacity` (and SVG attributes via motion where needed).
  Use springs: `{ type: 'spring', duration: 0.4–0.6, bounce: 0–0.2 }`. UI transitions < 300 ms.
- Explanatory loops (ECG strips, conduction impulses, airflow) are fine — they are the content.
  Pause them when off-screen if cheap (`useInView` from `motion/react`).
- **Always** honour reduced motion: `const reduce = useReducedMotion()` → render a static
  (but still informative) frame and skip loops/large movement.
- Mark purely decorative SVG parts `aria-hidden`.

## Content rules — IMPORTANT

- Medical facts, numbers, labels and thresholds must come from the article text you were
  given in your brief. Do not invent new clinical facts, doses or thresholds.
  Anatomy/physiology drawn schematically (e.g. where the SA node is) is fine.
- Finnish language throughout, same terminology as the articles.
- Keep text inside widgets short; the article carries the explanation.
