import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { Result, Segmented } from '../ui'

/* Newborn resuscitation decision trainer. Content: Käypä hoito Elvytys (vastasyntynyt) 2022 and
 * Ensihoito-opas (Vastasyntyneen elvytystoimet). Each step is one 30-second assessment. */

interface Opt {
  text: string
  ok: boolean
  why: string
}
interface Step {
  time: string
  tone: string
  breath: string
  hr: string
  extra?: string
  q: string
  opts: Opt[]
}

const SCEN: Record<'weak' | 'absent', { label: string; intro: string; steps: Step[] }> = {
  weak: {
    label: 'Riittämätön transitio',
    intro: 'Matkasynnytys kotona, täysiaikainen raskaus. Lapsi syntyy ambulanssin saapuessa.',
    steps: [
      {
        time: 'syntymä',
        tone: 'jäntevyys vähentynyt',
        breath: 'yksittäisiä hengitysyrityksiä',
        hr: 'arvioimatta',
        q: 'Mitä teet ensimmäiseksi?',
        opts: [
          { text: 'Kuivaan ja stimuloin hieromalla selkää ja jalkoja, estän lämmönhukan ja asetan pään neutraaliasentoon', ok: true, why: 'Kuivaus on samalla stimulaatio. Lämpimänä pitäminen on tärkeää koko elvytyksen ajan – sairaalan ulkopuolella lapsi laitetaan kuivaamisen jälkeen muovipussiin kasvot näkyvillä.' },
          { text: 'Imen suun ja nenän ennen kuin teen mitään muuta', ok: false, why: 'Hengitysteitä ei puhdisteta rutiininomaisesti ennen ventilaatiota – se viivästyttää keuhkojen avaamista. Imu tehdään näkökontrollissa vain, jos ventilaatio ei onnistu.' },
          { text: 'Aloitan paineluelvytyksen', ok: false, why: 'Vastasyntyneen huonokuntoisuuden yleisin syy on hengitysvajaus. Painelua harkitaan vasta, jos syke on alle 60/min 30 sekunnin tehokkaan ventilaation jälkeen.' },
        ],
      },
      {
        time: 'noin 30 s',
        tone: 'veltto',
        breath: 'vähäiset hengitysyritykset',
        hr: '80/min (stetoskoopilla)',
        q: 'Stimulaatio ei käynnistänyt riittävää hengitystä. Mitä seuraavaksi?',
        opts: [
          { text: 'Viisi keuhkot avaavaa ventilaatiota naamaripalkeella huoneilmalla, kukin 2–3 sekuntia', ok: true, why: 'Täysiaikaisella ventilaatio aloitetaan huoneilmalla (21 %) ja 30 cmH₂O:n paineella. Suuri happipitoisuus voi heikentää oman hengityksen käynnistymistä.' },
          { text: 'Happiviikset 100 % hapella ja seuranta', ok: false, why: 'Lisähappi ei korvaa ventilaatiota. Kun hengitysyritykset ovat vähäiset ja syke alle 100/min, hengitystä avustetaan ylipaineella.' },
          { text: 'Painelu 3:1, koska syke on alle 100/min', ok: false, why: 'Syke 60–100/min on hidas ja viittaa hapenpuutteeseen – hoito on ventilaatio. Painelun raja on alle 60/min tehokkaasta ventilaatiosta huolimatta.' },
        ],
      },
      {
        time: 'noin 1 min',
        tone: 'veltto',
        breath: 'ei omaa hengitystä',
        hr: '80/min',
        extra: 'Rintakehä ei nouse puhallusten aikana.',
        q: 'Mikä on oikea toimenpide?',
        opts: [
          { text: 'Tarkistan pään asennon, nostan alaleukaa ja tiivistän maskin kahden hengen otteella, imen näkyvät eritteet – ja annan viisi avaavaa ventilaatiota uudelleen', ok: true, why: 'Jos rintakehä ei nouse, korjataan ventilaatiotekniikka: pään asento, maskin tiiviys, tarvittaessa suun ja nielun imu näkökontrollissa. Sitten viisi avaavaa ventilaatiota toistetaan.' },
          { text: 'Aloitan painelun, koska ventilaatio ei auttanut', ok: false, why: 'Ventilaation tulee olla tehokasta ennen painelua – painelu on tehotonta, jos keuhkot eivät ilmastoidu.' },
          { text: 'Pyydän adrenaliinin valmiiksi ja jatkan samalla tekniikalla', ok: false, why: 'Lääkkeitä harkitaan vasta, kun ilmatie on varmistettu ja ventilaatio sekä painelu ovat olleet tehokkaita. Nyt ongelma on ventilaatiotekniikassa.' },
        ],
      },
      {
        time: 'noin 2 min',
        tone: 'jäntevöityy',
        breath: 'yksittäisiä omia hengenvetoja',
        hr: '120/min (monitorilta)',
        extra: 'Rintakehä nousee hyvin.',
        q: 'Syke nousi. Miten jatkat?',
        opts: [
          { text: 'Jatkan ventilaatiota noin 30/min, kunnes oma hengitys on riittävää, ja arvioin sykkeen ja hengityksen 30 sekunnin välein', ok: true, why: 'Sykkeen nousu yli 100/min kertoo riittävästä ventilaatiosta. Ventilaatiota jatketaan keskeytyksettä, kunnes lapsi hengittää riittävästi. Ensihoito-oppaan mukaan lisähappi aloitetaan, jos ventilaatiotarve kestää yli 60 sekuntia – annos säädetään saturaation mukaan.' },
          { text: 'Lopetan ventilaation heti, koska syke on yli 100/min', ok: false, why: 'Riittävä syke ei vielä tarkoita riittävää omaa hengitystä. Ventilaatiota jatketaan, kunnes molemmat ehdot täyttyvät.' },
          { text: 'Keskeytän ventilaation ja imen hengitystiet perusteellisesti', ok: false, why: 'Rintakehä nousee hyvin, joten ilmatie on auki. Rutiininomaista imua ei suositella, ja ventilaatio jatkuu keskeytyksettä.' },
        ],
      },
      {
        time: '5 min',
        tone: 'jäntevä',
        breath: 'säännöllinen, itkee',
        hr: '140/min',
        extra: 'SpO₂ oikeasta kädestä 87 %.',
        q: 'Mitä teet saturaatiolle?',
        opts: [
          { text: 'En aloita lisähappea – tavoite viiden minuutin iässä on noin 85 %. Huolehdin lämmöstä ja seurannasta.', ok: true, why: 'Saturaatio nousee syntymän jälkeen asteittain: alaraja 65 % kahden, 85 % viiden ja 90 % kymmenen minuutin iässä.' },
          { text: 'Annan happea, kunnes saturaatio on 100 %', ok: false, why: 'Hyperoksiaa vältetään: lisähappea vähennetään, kun saturaatio ylittää 95 %.' },
          { text: 'Aloitan uudelleen ventilaation', ok: false, why: 'Lapsi hengittää itse ja syke on normaali. Ventilaatiolle ei ole aihetta.' },
        ],
      },
    ],
  },
  absent: {
    label: 'Puuttuva transitio',
    intro: 'Matkasynnytys ambulanssissa, raskausviikko 38. Lapsi syntyy veltoksi ja kalpeaksi.',
    steps: [
      {
        time: 'syntymä',
        tone: 'veltto, kalpea',
        breath: 'ei hengitysyrityksiä',
        hr: 'ei tunnu napanuoran tyvestä',
        q: 'Mikä on ensimmäinen prioriteetti?',
        opts: [
          { text: 'Kuivaus, lämpö ja ilmatien avaus – heti perään viisi keuhkot avaavaa ventilaatiota ja lisäavun hälytys', ok: true, why: 'Avoin ilmatie, keuhkojen avaaminen ja riittävä ventilaatio ovat vastasyntyneen elvytyksen kulmakivet – ne useimmiten riittävät korjaamaan tilanteen.' },
          { text: 'Painelu heti, koska syke puuttuu', ok: false, why: 'Vastasyntyneellä ventilaatio tulee ensin: jos ventilaatio ei onnistu, muillekaan elvytystoimille ei saada vastetta.' },
          { text: 'Suoniyhteys ja adrenaliini', ok: false, why: 'Vain noin 0,05 % vastasyntyneistä tarvitsee adrenaliinia. Lääkkeisiin edetään vasta tehokkaan ventilaation ja painelun jälkeen.' },
        ],
      },
      {
        time: 'noin 1 min',
        tone: 'veltto',
        breath: 'ei omaa hengitystä',
        hr: '50/min (monitorilta)',
        extra: 'Rintakehä nousee, ventilaatiota on jatkettu 30 sekuntia.',
        q: 'Syke on yhä alle 60/min tehokkaasta ventilaatiosta huolimatta. Mitä teet?',
        opts: [
          { text: 'Aloitan painelun 3:1 kahden peukalon tekniikalla, nostan hapen 100 %:iin ja konsultoin ensihoitolääkäriä', ok: true, why: 'Painelu aloitetaan, jos syke puuttuu tai on alle 60/min 30 sekunnin tehokkaan ventilaation jälkeen. Noin 15 sykliä 30 sekunnissa, syvyys 1/3 rintakehästä. Ensihoito-oppaan mukaan viimeistään tässä vaiheessa ollaan yhteydessä ensihoitolääkäriin.' },
          { text: 'Jatkan pelkkää ventilaatiota vielä minuutin', ok: false, why: 'Kun ventilaatio on tehokasta ja syke silti alle 60/min, painelu aloitetaan.' },
          { text: 'Annan 20 ml/kg nestebolusta', ok: false, why: 'Nestetäyttö (10 ml/kg) on aiheellinen akuutin verenvuodon aiheuttamassa hypovolemiassa – ei ensimmäinen toimenpide.' },
        ],
      },
      {
        time: 'noin 1,5 min',
        tone: 'veltto',
        breath: 'ei omaa hengitystä',
        hr: '50/min',
        extra: 'Painelua ja ventilaatiota 30 sekuntia.',
        q: 'Vastetta ei ole. Mitä seuraavaksi?',
        opts: [
          { text: 'Jatkan painelua ja ventilaatiota, ilmatie varmistetaan ja valmistaudutaan i.o.-yhteyteen ja adrenaliiniin lääkärin ohjeen mukaan', ok: true, why: 'Jos syke pysyy alle 60/min, jatketaan ja varmistetaan ilmatie. Lääkehoitoon siirrytään, kun auttajia on riittävästi – adrenaliini 0,01–0,03 mg/kg i.v. tai i.o. Ventilaatiosta ja painelusta huolehditaan koko ajan.' },
          { text: 'Lopetan elvytyksen', ok: false, why: 'Lopettamista harkitaan vasta, jos syke on puuttunut asianmukaisesta elvytyksestä huolimatta yli 20 minuuttia ja hoidettavat syyt on suljettu pois.' },
          { text: 'Vaihdan isomman lapsen elvytysrytmiin 15:2', ok: false, why: 'Vastasyntyneen elvytyksessä yksi puhallus ja kolme painallusta synkronoidaan myös ilmatien varmistamisen jälkeen.' },
        ],
      },
      {
        time: 'noin 3 min',
        tone: 'liikehtii',
        breath: 'haukkovia hengenvetoja',
        hr: '110/min',
        q: 'Syke nousi yli 100/min. Mitä teet?',
        opts: [
          { text: 'Lopetan painelun, jatkan ventilaatiota kunnes oma hengitys riittää, pidän lämpimänä ja säädän happea saturaation mukaan', ok: true, why: 'Syketaajuuden ja hiilidioksidin nousu ovat merkkejä verenkierron palautumisesta. Elvytetyn vastasyntyneen vointi voi huonontua uudelleen, joten seuranta jatkuu – ensihoitolääkäri ohjeistaa hoidon ja hoitopaikan.' },
          { text: 'Jatkan painelua varmuuden vuoksi vielä minuutin', ok: false, why: 'Painelu kuuluu, kun syke on alle 60/min. Nyt syke riittää.' },
          { text: 'Lopetan kaiken hoidon ja annan lapsen äidin syliin', ok: false, why: 'Riittävä syke ei vielä tarkoita riittävää omaa hengitystä – ventilaatiota jatketaan ja lämpötaloudesta huolehditaan.' },
        ],
      },
    ],
  },
}

export default function NlsSim() {
  const [scen, setScen] = useState<keyof typeof SCEN>('weak')
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const reduce = useReducedMotion()

  const s = SCEN[scen]
  const done = i >= s.steps.length
  const st = s.steps[Math.min(i, s.steps.length - 1)]

  function reset(k: keyof typeof SCEN) {
    setScen(k)
    setI(0)
    setPick(null)
    setScore(0)
  }
  function choose(n: number) {
    if (pick !== null) return
    setPick(n)
    if (st.opts[n].ok) setScore((v) => v + 1)
  }

  return (
    <div>
      <Segmented layoutId="nls-sim" size="sm" value={scen} onChange={(v) => reset(v as keyof typeof SCEN)} options={(Object.keys(SCEN) as (keyof typeof SCEN)[]).map((k) => ({ value: k, label: SCEN[k].label }))} />
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-dim)]">{s.intro}</p>

      {done ? (
        <div className="mt-3">
          <Result tone={score === s.steps.length ? 'ok' : 'warning'} title={`${score} / ${s.steps.length} arviota oikein`}>
            Ventilaatio ensin, painelu vasta alle 60/min sykkeellä tehokkaan ventilaation jälkeen – ja lämpö koko ajan.
          </Result>
          <button onClick={() => reset(scen)} className="mt-2 min-h-[44px] w-full rounded-xl bg-brand-500 text-[13px] font-semibold text-white active:scale-[0.98]">
            Aloita alusta
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`${scen}-${i}`} initial={reduce ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="mt-3">
            <div className="mb-2 flex items-baseline justify-between text-[12px]">
              <span className="font-semibold text-[var(--text)]">Arvio {i + 1}</span>
              <span className="tabular-nums text-[var(--text-dim)]">{st.time}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                ['Jäntevyys', st.tone],
                ['Hengitys', st.breath],
                ['Syke', st.hr],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-[var(--bg)] px-2.5 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-dim)]">{k}</p>
                  <p className="mt-0.5 text-[12px] font-semibold leading-snug text-[var(--text)]">{v}</p>
                </div>
              ))}
            </div>
            {st.extra && <p className="mt-2 text-[12px] font-medium text-[var(--text)]">{st.extra}</p>}
            <p className="mb-1.5 mt-3 text-[13px] font-semibold text-[var(--text)]">{st.q}</p>
            <div className="flex flex-col gap-1.5">
              {st.opts.map((o, n) => {
                let cls = 'border-[var(--border)]'
                if (pick !== null) cls = o.ok ? 'border-teal-500/50 bg-teal-500/10' : pick === n ? 'border-danger-500/45 bg-danger-500/10' : 'border-[var(--border)] opacity-60'
                return (
                  <button
                    key={n}
                    disabled={pick !== null}
                    onClick={() => choose(n)}
                    className={`flex min-h-[44px] items-start justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-[13px] leading-snug text-[var(--text)] transition-[background-color,border-color,opacity] duration-150 ${cls}`}
                  >
                    <span>{o.text}</span>
                    {pick !== null && (o.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" strokeWidth={3} /> : pick === n ? <X className="mt-0.5 h-4 w-4 shrink-0 text-danger-500" strokeWidth={3} /> : null)}
                  </button>
                )
              })}
            </div>
            {pick !== null && (
              <div className="mt-3">
                <Result tone={st.opts[pick].ok ? 'ok' : 'warning'} title={st.opts[pick].ok ? 'Oikein' : 'Ei aivan'}>
                  {st.opts[pick].ok ? st.opts[pick].why : `${st.opts[pick].why} Oikea toimi: ${st.opts.find((o) => o.ok)!.text.toLowerCase()}.`}
                </Result>
                <button onClick={() => { setI((v) => v + 1); setPick(null) }} className="mt-3 min-h-[44px] w-full rounded-xl bg-brand-500 text-[13px] font-semibold text-white active:scale-[0.98]">
                  {i === s.steps.length - 1 ? 'Näytä tulos' : 'Seuraava arvio (30 s)'}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
