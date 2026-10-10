import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Result, Segmented, svg } from '../ui'

/* The six immediately life-threatening thoracic injuries the breathing team must exclude
 * (European Trauma Course manual, ch. 4). Schematic front view: patient's right = viewer's left. */

type Kind = 'tension' | 'open' | 'haemo' | 'flail' | 'tamponade' | 'airway'

const DATA: Record<Kind, { label: string; title: string; signs: string; act: string }> = {
  tension: {
    label: 'Jänniteilmarinta',
    title: 'Venttiili päästää ilmaa vain sisään',
    signs:
      'Spontaanisti hengittävä: rintakipu ja hengenahdistus ensin – ei sokki. Puolen heikentyneet hengitysäänet ja takykardia 50–75 %:lla; henkitorven siirtymä ja hypotensio ovat epäluotettavia. Ventiloidulla SpO₂ ja verenpaine romahtavat nopeasti ja ventilaatiopaineet nousevat.',
    act: 'Välitön paineenpurku. ETC suosittaa lateraalista torakostomiaa; neulatorakosenteesi on viimeinen keino, jos osaavaa lääkäriä tai välineitä ei ole. Ventiloidulla potilaalla oireet kehittyvät nopeimmin.',
  },
  open: {
    label: 'Avoin ilmarinta',
    title: 'Ilma kulkee haavan kautta',
    signs: 'Rintakehän haava, jonka kautta ilma kulkee – mitä suurempi haava, sitä enemmän ilmaa menee haavasta eikä keuhkoihin. Tiivis sidos voi muuttaa sen jänniteilmarinnaksi.',
    act: 'Poista mahdollinen tiivis sidos, jotta ilma pääsee ulos, ja aseta yksisuuntainen venttiilitarra. Se antaa ilman ja veren poistua mutta estää ilman paluun.',
  },
  haemo: {
    label: 'Massiivinen veririnta',
    title: 'Yli 1 500 ml verta keuhkopussissa',
    signs: 'Hypovoleeminen sokki, vaimea koputusääni ja heikentyneet hengitysäänet vamman puolella, hypoksia. Syynä useimmiten kylkivälin tai sisemmän rintakehävaltimon repeämä.',
    act: 'Happi, suoniyhteydet, verituotteet ja massiivivuotoprotokolla. Dreeni voi irrottaa hyytymiä ja käynnistää vuodon uudelleen – varmista verenkierron tuki samanaikaisesti.',
  },
  flail: {
    label: 'Läppärintakehä',
    title: 'Irtonainen segmentti liikkuu väärään suuntaan',
    signs: 'Kaksi tai useampi vierekkäistä kylkiluuta murtunut kahdesta tai useammasta kohdasta. Kova kipu, nopea pinnallinen hengitys. Nuorella lihakset voivat aluksi tukea segmenttiä, jolloin paradoksaalinen liike näkyy vasta potilaan uupuessa. Alla on lähes aina keuhkoruhje.',
    act: 'Lämmin kostutettu happi, varovainen nesteytys (keuhkopöhön vaara) ja riittävä kivunhoito, jotta hengitys onnistuu. Muista samanaikainen ilmarinta – ventilaatio voi vaatia intubaatiota.',
  },
  tamponade: {
    label: 'Tamponaatio',
    title: 'Pieni määrä verta sydänpussissa riittää',
    signs: 'Beckin triadi – hypotensio, pullottavat kaulalaskimot ja vaimeat sydänäänet – näkyy vain noin kolmanneksella. Lisäksi pulsus paradoxus (systolinen lasku yli 10 mmHg sisäänhengityksessä). Diagnoosi varmistuu kaikukuvauksella.',
    act: 'Jalat koholle ja nopea nesteytys laskimopaluun tueksi. Lopullinen hoito on kirurginen; perikardiosenteesi vain, jos kukaan ei osaa torakotomiaa ja potilas on kuolemassa.',
  },
  airway: {
    label: 'Ilmatien repeämä',
    title: 'Henkitorvi tai keuhkoputki on revennyt',
    signs: 'Useimmat kuolevat jo tapahtumapaikalla. Voimakas ihonalainen ilma, ilmarinta, ilmavälikarsina. Epäile korkeaenergisessä vammassa (lapaluun, solisluun tai 1.–3. kylkiluun murtumat) tai suuren ilmavuodon yhteydessä.',
    act: 'Hoito on lähes aina kirurginen. Osaava lääkäri voi intuboida putken repeämän ohi; kiireellinen konsultaatio rintakirurgille.',
  },
}
const ORDER: Kind[] = ['tension', 'open', 'haemo', 'flail', 'tamponade', 'airway']

const LUNG_L = 'M118 70 C92 74 70 104 66 150 C64 176 76 192 100 190 C118 188 132 182 136 168 L136 92 C136 78 128 70 118 70 Z'
const LUNG_R = 'M202 70 C228 74 250 104 254 150 C256 176 244 192 220 190 C202 188 188 182 184 168 L184 92 C184 78 192 70 202 70 Z'

export default function ChestTrauma() {
  const [kind, setKind] = useState<Kind>('tension')
  const reduce = useReducedMotion()
  const d = DATA[kind]
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, duration: 0.7, bounce: 0.1 }

  const lungLScale = kind === 'haemo' ? 0.72 : kind === 'open' ? 0.78 : 1
  const lungRScale = kind === 'tension' ? 0.42 : 1
  const shift = kind === 'tension' ? -16 : 0

  return (
    <div>
      <Segmented layoutId="chest-trauma" size="sm" wrap value={kind} onChange={setKind} options={ORDER.map((k) => ({ value: k, label: DATA[k].label }))} />

      <svg viewBox="0 0 320 220" className="mt-3 h-auto w-full" role="img" aria-label={`${d.label}: ${d.title}`}>
        <g aria-hidden>
          {/* chest wall */}
          <path d="M60 50 Q160 26 260 50 L280 196 Q160 214 40 196 Z" fill={svg.raised} stroke={svg.ink} strokeOpacity={0.3} strokeWidth={2} />
          {[78, 100, 122, 144, 166].map((y) => (
            <g key={y}>
              <path d={`M50 ${y + 14} Q90 ${y} 140 ${y + 6}`} fill="none" stroke={svg.ink} strokeOpacity={0.18} strokeWidth={2} strokeLinecap="round" />
              <path d={`M180 ${y + 6} Q230 ${y} 270 ${y + 14}`} fill="none" stroke={svg.ink} strokeOpacity={0.18} strokeWidth={2} strokeLinecap="round" />
            </g>
          ))}

          {/* pleural air (tension) and blood (haemothorax) */}
          <motion.path d="M200 64 C236 66 262 104 266 152 C268 184 248 198 220 198 L182 196 L182 64 Z" fill={svg.airSoft} initial={false} animate={{ opacity: kind === 'tension' ? 1 : 0 }} />
          <motion.path d="M56 150 C58 182 76 198 100 198 L138 196 L138 140 C112 138 80 142 56 150 Z" fill={svg.dangerSoft} stroke={svg.danger} strokeWidth={1} initial={false} animate={{ opacity: kind === 'haemo' ? 1 : 0 }} />

          {/* lungs */}
          <motion.path d={LUNG_L} fill="rgba(224,120,156,0.28)" stroke="#e0789c" strokeWidth={2} initial={false} animate={{ scale: lungLScale }} style={{ transformBox: 'view-box', transformOrigin: '136px 92px' }} transition={spring} />
          <motion.path d={LUNG_R} fill="rgba(224,120,156,0.28)" stroke="#e0789c" strokeWidth={2} initial={false} animate={{ scale: lungRScale }} style={{ transformBox: 'view-box', transformOrigin: '184px 100px' }} transition={spring} />

          {/* mediastinum: trachea + heart (shifts away in tension pneumothorax) */}
          <motion.g initial={false} animate={{ x: shift }} transition={spring}>
            <path d="M160 20 L160 84 M160 84 L140 98 M160 84 L180 98" fill="none" stroke="#8fb3cf" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            {kind === 'airway' && (
              <g>
                <path d="M174 92 L184 86" stroke={svg.danger} strokeWidth={3} strokeLinecap="round" />
                {[
                  [186, 76],
                  [196, 64],
                  [178, 58],
                  [204, 82],
                  [192, 48],
                  [170, 42],
                ].map(([x, y], i) => (
                  <motion.circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={3}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth={1.5}
                    initial={{ opacity: 0 }}
                    animate={reduce ? { opacity: 1 } : { opacity: [0, 1, 0], y: [0, -6, -10] }}
                    transition={reduce ? { duration: 0 } : { duration: 1.8, repeat: Infinity, delay: i * 0.25 }}
                  />
                ))}
              </g>
            )}
            {/* pericardium */}
            <motion.ellipse cx={168} cy={146} fill={svg.dangerSoft} stroke={svg.danger} strokeWidth={1.5} initial={false} animate={{ rx: kind === 'tamponade' ? 34 : 26, ry: kind === 'tamponade' ? 30 : 23, opacity: kind === 'tamponade' ? 1 : 0.35 }} transition={spring} />
            <motion.ellipse cx={168} cy={146} fill="rgba(220,38,38,0.32)" stroke={svg.danger} strokeWidth={2} initial={false} animate={{ rx: kind === 'tamponade' ? 19 : 24, ry: kind === 'tamponade' ? 17 : 21 }} transition={spring} />
          </motion.g>

          {/* open chest wound with air moving through it */}
          {kind === 'open' && (
            <g>
              <ellipse cx={58} cy={128} rx={6} ry={9} fill={svg.danger} />
              {!reduce && (
                <motion.path
                  d="M30 128 L50 128"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  strokeLinecap="round"
                  initial={{ x: -6, opacity: 0 }}
                  animate={{ x: [-6, 10, -6], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </g>
          )}

          {/* flail segment: two fracture lines per rib, segment moves paradoxically */}
          {kind === 'flail' && (
            <motion.g animate={reduce ? { x: 0 } : { x: [0, 6, 0] }} transition={reduce ? { duration: 0 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
              {[122, 144, 166].map((y) => (
                <path key={y} d={`M66 ${y + 10} Q90 ${y + 2} 112 ${y + 3}`} fill="none" stroke={svg.brand} strokeWidth={3.5} strokeLinecap="round" />
              ))}
              {[122, 144, 166].map((y) => (
                <g key={`x${y}`}>
                  <line x1={64} y1={y + 6} x2={68} y2={y + 15} stroke={svg.danger} strokeWidth={2} />
                  <line x1={110} y1={y - 1} x2={114} y2={y + 8} stroke={svg.danger} strokeWidth={2} />
                </g>
              ))}
            </motion.g>
          )}
        </g>
        <text x={44} y={214} fontSize={10} fill={svg.dim}>
          potilaan oikea
        </text>
        <text x={276} y={214} fontSize={10} fill={svg.dim} textAnchor="end">
          vasen
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
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{d.signs}</p>
          </div>
          <Result tone="danger" title="Hoito">
            {d.act}
          </Result>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
