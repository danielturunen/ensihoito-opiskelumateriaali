import { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg } from '../ui'

/* Portal hypertension and the decompensating complications of cirrhosis.
 * Facts: Käypä hoito Maksakirroosi 2025; Akuuttihoito-opas 2025 (GI-vuoto). */

type State = 'healthy' | 'cirrhosis'
type Comp = 'varix' | 'ascites' | 'sbp' | 'he' | 'hrs'

const COMPS: Record<Comp, { label: string; what: string; scene: string; focus: { cx: number; cy: number; r: number } }> = {
  varix: {
    label: 'Variksvuoto',
    what: 'Porttilaskimon paine nousee, ja veri ohjautuu ruokatorven laskimoihin, jotka laajenevat suonikohjuiksi. Neljäsosa kirroosipotilaista saa suonikohjuvuodon, ja sen kuolleisuus on 7–15 %.',
    scene: 'Verioksennus tai meleena ja sokin merkit. Hoito aloitetaan heti, kun vuotoa epäillään: verenkierron tukeminen, sairaalassa vasoaktiivinen lääke (oktreotidi tai terlipressiini), antibiootti ja gastroskopia 12 tunnin sisällä. Hb-tavoite 70–80 g/l.',
    focus: { cx: 166, cy: 98, r: 16 },
  },
  ascites: {
    label: 'Askites',
    what: 'Vatsaonteloon kertyy nestettä; vuotuinen riski on noin 5 %. Pinkeä askites voi aiheuttaa hengenahdistusta, ja nestettä voi karata myös keuhkopussiin, yleensä oikealle.',
    scene: 'Tulehduskipulääkkeet sekä ACE:n estäjät ja AT2-salpaajat lopetetaan askiteksen ilmaantuessa munuaisvaurion riskin vuoksi. Laiminlyöty albumiinikorvaus askitestyhjennyksessä voi laukaista dekompensaation.',
    focus: { cx: 160, cy: 210, r: 34 },
  },
  sbp: {
    label: 'Bakteeri­peritoniitti',
    what: 'Askitesnesteen bakteeri-infektio ilman kirurgista syytä – bakteerit siirtyvät suolesta askitesnesteeseen. Vuotuinen riski on 11 %, jos potilaalla on askites.',
    scene: 'Jopa kolmasosalla ei ole kuumetta eikä kipua. Kirroosipotilas, jolla on askites ja äkillinen voinnin huononeminen: epäile infektiota – sairaalassa askitesnäyte otetaan jo päivystyksessä.',
    focus: { cx: 160, cy: 200, r: 30 },
  },
  he: {
    label: 'Enkefalopatia',
    what: 'Hepaattinen enkefalopatia vaihtelee West Haven -asteikolla 0–4. Ilmeisessä enkefalopatiassa on asterixis (flapping tremor), desorientaatio, uneliaisuus ja lopulta kooma. Oireet vaihtelevat.',
    scene: 'Laukaisijoita ovat alkoholi, keskushermostoon vaikuttavat lääkkeet, GI-vuoto, infektio, elektrolyyttihäiriöt, kuivuminen ja ummetus. Aste 3–4 hoidetaan sairaalassa – varaudu intubaatioon. Opioidit ja rauhoittavat lisäävät riskiä.',
    focus: { cx: 160, cy: 26, r: 22 },
  },
  hrs: {
    label: 'Munuaiset',
    what: 'Hepatorenaalinen oireyhtymä on askitespotilaan toiminnallinen akuutti munuaisvaurio (vuotuinen riski 8 %). Alle kolmasosa kirroosipotilaan munuaisvaurioista on kuitenkin HRS – muita syitä ovat volyymivaje ja munuaistoksiset lääkkeet.',
    scene: 'Selvitä virtsaneritys, nesteenmenetykset (oksentelu, ripuli, vuoto) ja lääkitys, kuten diureetit ja tulehduskipulääkkeet. Dekompensoidussa kirroosissa lääkkeisiin liittyy suurentunut munuaisten vajaatoiminnan riski.',
    focus: { cx: 160, cy: 168, r: 70 },
  },
}

const ORDER: Comp[] = ['varix', 'ascites', 'sbp', 'he', 'hrs']

// Portal blood: gut → portal vein → liver (healthy) or backed up into the oesophageal veins (cirrhosis).
const TO_LIVER = { cx: [160, 158, 150, 132], cy: [196, 176, 152, 132] }
const TO_VARIX = { cx: [160, 158, 162, 166], cy: [196, 176, 140, 100] }

export default function Cirrhosis() {
  const [state, setState] = useState<State>('cirrhosis')
  const [comp, setComp] = useState<Comp | null>(null)
  const reduce = useReducedMotion()
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { amount: 0.3 })
  const sick = state === 'cirrhosis'
  const loop = !reduce && inView
  const c = comp && sick ? COMPS[comp] : null

  return (
    <div>
      <Segmented
        layoutId="cirrhosis"
        value={state}
        onChange={(v) => {
          setState(v)
          if (v === 'healthy') setComp(null)
        }}
        options={[
          { value: 'healthy', label: 'Terve maksa' },
          { value: 'cirrhosis', label: 'Kirroottinen maksa' },
        ]}
      />

      <svg ref={ref} viewBox="0 0 320 244" className="mt-3 h-auto w-full" role="img" aria-label={sick ? 'Kirroottinen maksa: porttilaskimon veri patoutuu ruokatorven suonikohjuihin, perna suurenee ja vatsaonteloon kertyy nestettä' : 'Terve maksa: suoliston laskimoveri virtaa porttilaskimoa pitkin maksaan'}>
        <g aria-hidden>
          {/* head and torso */}
          <circle cx={160} cy={26} r={18} fill={svg.raised} stroke={svg.line} strokeWidth={1.5} />
          <rect x={60} y={50} width={200} height={188} rx={34} fill={svg.raised} stroke={svg.line} strokeWidth={1.5} />

          {/* ascites */}
          <motion.path
            d="M66 196 Q113 186 160 194 T254 192 L254 206 Q254 232 228 232 L92 232 Q66 232 66 206 Z"
            fill="rgba(125,211,252,0.35)"
            stroke={svg.air}
            strokeWidth={1}
            initial={false}
            animate={{ opacity: sick ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* oesophagus and stomach */}
          <path d="M160 44 L166 112" stroke="rgba(224,120,156,0.55)" strokeWidth={9} strokeLinecap="round" fill="none" />
          <ellipse cx={186} cy={122} rx={22} ry={14} fill="rgba(224,120,156,0.22)" stroke="#de8aa2" strokeWidth={1.5} />

          {/* varices */}
          {[
            [161, 88],
            [168, 96],
            [162, 104],
          ].map(([x, y], i) => (
            <motion.circle key={i} cx={x} cy={y} fill="#6d5bd0" initial={false} animate={{ r: sick ? 3.6 : 0 }} transition={{ type: 'spring', duration: 0.5, bounce: 0.2, delay: i * 0.05 }} />
          ))}

          {/* liver (patient's right = viewer's left) */}
          <path d="M78 112 Q80 92 112 90 L168 94 Q176 100 162 116 Q140 142 98 144 Q78 142 78 112 Z" fill={sick ? 'rgba(194,140,60,0.35)' : 'rgba(150,60,50,0.32)'} stroke={sick ? '#b8901f' : '#9a3b30'} strokeWidth={2} />
          {sick &&
            [
              [96, 108],
              [112, 102],
              [128, 106],
              [146, 104],
              [104, 124],
              [122, 120],
              [140, 118],
              [96, 132],
              [116, 136],
            ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="none" stroke="#b8901f" strokeWidth={1.2} />)}

          {/* spleen */}
          <motion.ellipse cx={232} cy={118} fill="rgba(109,91,208,0.22)" stroke="#6d5bd0" strokeWidth={1.5} initial={false} animate={{ rx: sick ? 18 : 11, ry: sick ? 26 : 17 }} transition={{ type: 'spring', duration: 0.6, bounce: 0.15 }} />

          {/* kidneys */}
          <ellipse cx={104} cy={168} rx={9} ry={14} fill="rgba(220,38,38,0.12)" stroke={svg.danger} strokeWidth={1.2} opacity={0.7} />
          <ellipse cx={216} cy={168} rx={9} ry={14} fill="rgba(220,38,38,0.12)" stroke={svg.danger} strokeWidth={1.2} opacity={0.7} />

          {/* gut */}
          <path d="M118 186 q14 -14 28 0 t28 0 t28 0 M124 200 q12 -10 24 0 t24 0 t24 0" fill="none" stroke="#e0789c" strokeWidth={5} strokeLinecap="round" opacity={0.55} />

          {/* portal + splenic vein */}
          <path d="M160 196 L158 176 L150 152 L132 132" fill="none" stroke="#6b72d9" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M214 124 Q196 150 156 160" fill="none" stroke="#6b72d9" strokeWidth={3} strokeLinecap="round" />
          <motion.path
            d="M158 176 L162 140 L166 104"
            fill="none"
            stroke="#6b72d9"
            strokeWidth={2.5}
            strokeDasharray="4 4"
            strokeLinecap="round"
            initial={false}
            animate={{ opacity: sick ? 1 : 0 }}
          />

          {/* blood flow particles */}
          {[0, 1, 2].map((i) => {
            const path = sick && i > 0 ? TO_VARIX : TO_LIVER
            return (
              <motion.circle
                key={`${state}-${i}`}
                r={3.2}
                fill="#6b72d9"
                initial={{ cx: path.cx[0], cy: path.cy[0], opacity: 0 }}
                animate={loop ? { cx: path.cx, cy: path.cy, opacity: [0, 1, 1, 0] } : { cx: path.cx[2], cy: path.cy[2], opacity: 1 }}
                transition={loop ? { duration: sick ? 2.6 : 1.6, repeat: Infinity, delay: i * (sick ? 0.85 : 0.55), ease: 'linear' } : { duration: 0 }}
              />
            )
          })}

          {/* focus ring for the selected complication */}
          <AnimatePresence>
            {c && (
              <motion.circle
                key={comp}
                cx={c.focus.cx}
                cy={c.focus.cy}
                r={c.focus.r}
                fill="none"
                stroke={svg.brand}
                strokeWidth={2.5}
                strokeDasharray="5 4"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ transformOrigin: `${c.focus.cx}px ${c.focus.cy}px` }}
                transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
              />
            )}
          </AnimatePresence>
        </g>
        <text x={86} y={86} fontSize={11} fill={svg.ink} fontWeight={600}>
          maksa
        </text>
        <text x={254} y={84} fontSize={11} fill={svg.dim} textAnchor="end">
          perna
        </text>
        <text x={176} y={72} fontSize={11} fill={svg.dim}>
          ruokatorvi
        </text>
        <text x={66} y={226} fontSize={11} fill={svg.dim} opacity={sick ? 1 : 0}>
          askites
        </text>
      </svg>

      <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-dim)]">
        {sick
          ? 'Arpeutunut maksa vastustaa porttilaskimon virtausta. Paine nousee, veri hakeutuu ohitusreiteille (suonikohjut), perna suurenee ja vatsaonteloon kertyy nestettä.'
          : 'Suoliston ja pernan laskimoveri virtaa porttilaskimoa pitkin maksaan, joka puhdistaa sen.'}
      </p>

      {sick && (
        <>
          <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">Dekompensaation komplikaatiot</p>
          <div className="grid grid-cols-2 gap-1.5 min-[480px]:grid-cols-3">
            {ORDER.map((k) => {
              const active = comp === k
              return (
                <button
                  key={k}
                  onClick={() => setComp(active ? null : k)}
                  aria-pressed={active}
                  className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-[13px] font-medium leading-snug transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] ${
                    active ? 'border-brand-500 bg-brand-500/10 text-[var(--text)]' : 'border-[var(--border)] text-[var(--text)]'
                  }`}
                >
                  {COMPS[k].label}
                </button>
              )
            })}
          </div>
          <div className="mt-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={comp ?? 'none'}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col gap-2"
              >
                {c ? (
                  <>
                    <p className="text-[13px] leading-relaxed text-[var(--text)]">{c.what}</p>
                    <Result tone="warning" title="Kohteessa">
                      {c.scene}
                    </Result>
                  </>
                ) : (
                  <Result tone="neutral" title="Valitse komplikaatio">
                    Dekompensaatio tarkoittaa askiteksen, enkefalopatian tai variksvuodon ilmaantumista. Tavallisia laukaisijoita ovat verenvuoto, infektio ja runsas alkoholinkäyttö.
                  </Result>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}
