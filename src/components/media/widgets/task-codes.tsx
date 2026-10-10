import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getTopic } from '../../../content/topics'
import { Segmented } from '../ui'

/* Index of Finnish EMS task codes (Ensihoito-opas: Kootut ohjeet, updated 19.6.2026; EH-Info 2024)
 * mapped to the site's own topics. "vaste" = urgency classes the dispatch centre may use. */

interface Code {
  code: string
  name: string
  vaste?: string
  topics: string[]
  note?: string
}
interface Group {
  id: string
  title: string
  codes: Code[]
}

const GROUPS: Group[] = [
  {
    id: '7',
    title: 'Ensihoitotehtävät (7)',
    codes: [
      { code: '700', name: 'Peruselintoiminnan häiriö: eloton', vaste: 'A, B', topics: ['elvytys'] },
      { code: '701', name: 'Peruselintoiminnan häiriö: elvytys', vaste: 'A', topics: ['elvytys', 'elvytys-sairaalan-ulkopuolella'] },
      { code: '702', name: 'Peruselintoiminnan häiriö: tajuttomuus', vaste: 'A, B', topics: ['tajuttomuus', 'case-tajuttomuus-702'] },
      { code: '703', name: 'Peruselintoiminnan häiriö: hengitysvaikeus', vaste: 'A, B, C', topics: ['hengitysteiden-fysiologia', 'astma-ja-copd', 'keuhkopoho', 'keuhkokuume', 'keuhkoembolia', 'case-hengitysvaikeus-703'] },
      { code: '704', name: 'Peruselintoiminnan häiriö: rintakipu', vaste: 'A, B, C', topics: ['rintakipu-ja-aks', 'case-rintakipu-704'] },
      { code: '705', name: 'Peruselintoiminnan häiriö: muu (äkillisesti heikentynyt yleistila)', vaste: 'A, B, C', topics: ['yleistilan-lasku-ja-pyortyminen', 'rytmihairiot'], note: 'EH-Infon (2024) listassa 705 on "rytmihäiriö".' },
      { code: '706', name: 'Peruselintoiminnan häiriö: aivoverenkiertohäiriö', vaste: 'B, C', topics: ['aivoverenkiertohairio'] },
      { code: '711', name: 'Hapenpuute: ilmatie-este', vaste: 'A, B', topics: ['ylahengitystien-tukos-anafylaksia', 'lapsi-ensihoidossa'] },
      { code: '713', name: 'Hapenpuute: hirttyminen, kuristuminen', vaste: 'A, B', topics: ['elvytys'], note: 'Ei omaa sivua – lähteissä ei tehtäväkohtaista ohjetta.' },
      { code: '714', name: 'Hapenpuute: hukkuminen', vaste: 'A, B', topics: ['hukkuminen-ja-sahkotapaturma'] },
      { code: '741', name: 'Vamma: putoaminen', vaste: 'A, B', topics: ['traumapotilaan-tutkiminen', 'tylppa-vamma', 'selkaranka-ja-selkaydinvamma'] },
      { code: '744', name: 'Vamma: haava', vaste: 'A, B, C, D', topics: ['raajavammat', 'lavistavat-vammat', 'massiivinen-verenvuoto'] },
      { code: '745', name: 'Vamma: kaatuminen', vaste: 'A, B, C, D', topics: ['ikaantynyt-potilas', 'paan-vamma', 'vatsan-ja-lantion-vammat'] },
      { code: '746', name: 'Vamma: isku', vaste: 'A, B, C', topics: ['tylppa-vamma', 'paan-vamma'] },
      { code: '747', name: 'Vamma: muu', vaste: 'A, B, C', topics: ['traumapotilaan-tutkiminen', 'rintakehavammat', 'irtileikkautunut-raaja'] },
      { code: '751', name: 'Onnettomuus: kaasumyrkytys', vaste: 'A, B, C', topics: ['intoksikaatiopotilaan-hoito', 'altistuminen-vaarallisille-aineille'] },
      { code: '752', name: 'Onnettomuus: myrkytys', vaste: 'A, B, C, D', topics: ['intoksikaatiopotilaan-hoito', 'alkoholin-vaarinkaytto', 'case-myrkytys-752'] },
      { code: '753', name: 'Onnettomuus: sähköisku', vaste: 'A, B, C', topics: ['hukkuminen-ja-sahkotapaturma'] },
      { code: '754', name: 'Onnettomuus: palovamma', vaste: 'A, B, C', topics: ['palovamma'] },
      { code: '755', name: 'Onnettomuus: ylilämpöisyys', vaste: 'A, B, C', topics: ['lampohalvaus'] },
      { code: '756', name: 'Onnettomuus: paleltuminen, alilämpöisyys', vaste: 'A, B, C', topics: ['hypotermia'] },
      { code: '761', name: 'Verenvuoto (ilman vammaa): suusta', vaste: 'A, B, C', topics: ['akuutti-vatsa', 'verenvuoto-ilman-vammaa'] },
      { code: '762', name: 'Verenvuoto (ilman vammaa): gynekologinen tai urologinen', vaste: 'A, B, C, D', topics: ['raskauden-verenvuodot', 'verenvuoto-ilman-vammaa'] },
      { code: '763', name: 'Verenvuoto (ilman vammaa): korva tai nenä', vaste: 'B, C, D', topics: ['verenvuoto-ilman-vammaa'] },
      { code: '764', name: 'Verenvuoto (ilman vammaa): säärihaava tai muu', vaste: 'B, C, D', topics: ['verenvuoto-ilman-vammaa'] },
      { code: '770', name: 'Sairaus: sairauskohtaus', vaste: 'B', topics: ['yleistilan-lasku-ja-pyortyminen'] },
      { code: '771', name: 'Sairaus: sokeritasapainon häiriö', vaste: 'A, B, C', topics: ['sokeritasapainon-hairiot', 'case-sokeritasapaino-771'] },
      { code: '772', name: 'Sairaus: kouristelu', vaste: 'A, B, C', topics: ['kouristelu'] },
      { code: '773', name: 'Sairaus: yliherkkyysreaktio', vaste: 'A, B, C', topics: ['ylahengitystien-tukos-anafylaksia'] },
      { code: '774', name: 'Sairaus: muu sairastuminen', vaste: 'C, D', topics: ['yleistilan-lasku-ja-pyortyminen', 'infektiosairaudet', 'ikaantynyt-potilas'] },
      { code: '775', name: 'Sairaus: oksentelu, ripuli', vaste: 'C, D', topics: ['akuutti-vatsa', 'ondansetroni'], note: 'Ei omaa sivua – lähteissä ei tehtäväkohtaista ohjetta.' },
      { code: '781', name: 'Oire: vatsakipu', vaste: 'A, B, C, D', topics: ['akuutti-vatsa'] },
      { code: '782', name: 'Oire: pää- tai niskasärky', vaste: 'A, B, C, D', topics: ['paansarky-ja-migreeni'] },
      { code: '783', name: 'Oire: selkä-, raaja- tai vartalokipu', vaste: 'B, C, D', topics: ['kivunhoito', 'patologiakertaus'], note: 'Ei omaa sivua – selkäkivun vaaranmerkit (cauda equina, aortan aneurysma) ovat patologiakertauksessa.' },
      { code: '785', name: 'Oire: mielenterveysongelma', vaste: 'C, D', topics: ['mielenterveyden-hairio'] },
      { code: '790', name: 'Sairaankuljetus: hälytys puhelun aikana', vaste: 'B', topics: [] },
      { code: '791', name: 'Sairaankuljetus: synnytys', vaste: 'A, B, C, D', topics: ['raskaana-oleva-synnyttaja'] },
      { code: '792', name: 'Sairaankuljetus: varautuminen ensihoitotehtävään', vaste: 'C', topics: [] },
      { code: '793', name: 'Sairaankuljetus: hoitolaitossiirto', vaste: 'A, B, C, D', topics: [], note: 'Ei omaa sivua.' },
      { code: '794', name: 'Sairaankuljetus: muu', vaste: 'D', topics: [] },
    ],
  },
  {
    id: '0',
    title: 'Poliisijohtoiset (0)',
    codes: [
      { code: '031', name: 'Pahoinpitely: ampuminen', vaste: 'A, B', topics: ['lavistavat-vammat'] },
      { code: '032', name: 'Pahoinpitely: puukotus', vaste: 'A, B, C', topics: ['lavistavat-vammat', 'rintakehavammat'] },
      { code: '033', name: 'Pahoinpitely: potkiminen, hakkaaminen', vaste: 'A, B, C', topics: ['tylppa-vamma', 'paan-vamma'] },
      { code: '034', name: 'Pahoinpitely: tekotapa epäselvä', vaste: 'B', topics: ['traumapotilaan-tutkiminen'] },
    ],
  },
  {
    id: '24',
    title: 'Pelastusjohtoiset (2, 4)',
    codes: [
      { code: '200–208', name: 'Tieliikenneonnettomuus', vaste: 'A, B, C', topics: ['liikenneonnettomuus', 'case-vammapotilas-200'] },
      { code: '210–218', name: 'Raideliikenneonnettomuus', vaste: 'A, B', topics: ['liikenneonnettomuus', 'suuronnettomuus'] },
      { code: '222–223', name: 'Vesiliikenneonnettomuus', vaste: 'A', topics: ['hukkuminen-ja-sahkotapaturma', 'suuronnettomuus'] },
      { code: '231–236', name: 'Ilmaliikenneonnettomuus tai -vaara', vaste: 'A, B', topics: ['suuronnettomuus'] },
      { code: '271', name: 'Maastoliikenneonnettomuus', vaste: 'A, B, C', topics: ['liikenneonnettomuus'] },
      { code: '401–413', name: 'Rakennus- tai liikennevälinepalo', topics: ['palovamma', 'intoksikaatiopotilaan-hoito'] },
      { code: '441–444', name: 'Räjähdys tai sortuma', topics: ['rajahdysvamma'] },
      { code: '451–453', name: 'Vaarallisen aineen onnettomuus', topics: ['altistuminen-vaarallisille-aineille'] },
      { code: '480–487', name: 'Ihmisen pelastaminen (vedestä, puristuksista, ylhäältä/alhaalta)', topics: ['hukkuminen-ja-sahkotapaturma', 'raajavammat', 'traumapotilaan-tutkiminen'] },
      { code: '492–493', name: 'Onnettomuus maan alla', topics: ['suuronnettomuus'] },
    ],
  },
  {
    id: 'x',
    title: 'X-koodit',
    codes: [
      { code: 'X-0', name: 'Tehtävän suorittaminen estyy (X-01–X-06)', topics: ['kuljettamatta-jattaminen'] },
      { code: 'X-1', name: 'Potilas kuollut (X-11, X-12)', topics: ['kuljettamatta-jattaminen', 'elvytys'] },
      { code: 'X-2', name: 'Siirtyy poliisin valvontaan (X-21)', topics: ['kuljettamatta-jattaminen'] },
      { code: 'X-3', name: 'Pyydetty kohteeseen muuta apua (X-31)', topics: ['kuljettamatta-jattaminen'] },
      { code: 'X-4', name: 'Muu kuljetus (X-41–X-44)', topics: ['kuljettamatta-jattaminen'] },
      { code: 'X-5', name: 'Ei tarvetta ensihoitoon (X-51)', topics: ['kuljettamatta-jattaminen'] },
      { code: 'X-6', name: 'Potilas kieltäytyi (X-61, X-62)', topics: ['kuljettamatta-jattaminen'] },
      { code: 'X-7', name: 'Ei potilasta (X-71)', topics: ['kuljettamatta-jattaminen'] },
      { code: 'X-8', name: 'Potilas hoidettu kohteessa (X-81, X-82)', topics: ['kuljettamatta-jattaminen'] },
      { code: 'X-9', name: 'Tehtävän peruutus (X-91–X-97)', topics: ['kuljettamatta-jattaminen'] },
    ],
  },
]

export default function TaskCodes() {
  const [group, setGroup] = useState('7')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const src = needle ? GROUPS.flatMap((g) => g.codes) : GROUPS.find((g) => g.id === group)!.codes
    return needle ? src.filter((c) => c.code.toLowerCase().includes(needle) || c.name.toLowerCase().includes(needle)) : src
  }, [group, q])

  const ownTotal = GROUPS[0].codes.filter((c) => c.topics.length > 0 && !c.note?.startsWith('Ei omaa')).length

  return (
    <div>
      <label className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3">
        <Search className="h-4 w-4 shrink-0 text-[var(--text-dim)]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Hae koodilla tai nimellä, esim. 703 tai synnytys" className="w-full bg-transparent py-2 text-[14px] text-[var(--text)] outline-none placeholder:text-[var(--text-dim)]" />
      </label>
      {!q && (
        <div className="mt-2">
          <Segmented layoutId="task-codes" size="sm" wrap value={group} onChange={setGroup} options={GROUPS.map((g) => ({ value: g.id, label: g.title }))} />
        </div>
      )}
      <p className="mb-1.5 mt-2 text-[12px] text-[var(--text-dim)]">
        {q ? `${list.length} osumaa` : group === '7' ? `${ownTotal} / ${GROUPS[0].codes.length} ensihoitotehtävälle löytyy sivustolta oma sivu tai kokonaisuus.` : 'Napauta sivun nimeä siirtyäksesi.'}
      </p>
      <ul className="flex flex-col gap-1.5">
        {list.map((c) => (
          <li key={c.code} className="rounded-xl border border-[var(--border)] px-3 py-2">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[14px] font-bold tabular-nums text-brand-600">{c.code}</span>
              <span className="flex-1 text-[13px] font-medium leading-snug text-[var(--text)]">{c.name}</span>
              {c.vaste && <span className="shrink-0 rounded-md bg-[var(--bg-raised)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--text-dim)]">{c.vaste}</span>}
            </div>
            {c.topics.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {c.topics.map((id) => {
                  const t = getTopic(id)
                  return t ? (
                    <Link key={id} to={`/aihe/${id}`} className="rounded-full bg-brand-500/10 px-2.5 py-1 text-[12px] font-medium text-brand-600 hover:bg-brand-500/20">
                      {t.title}
                    </Link>
                  ) : null
                })}
              </div>
            )}
            {c.note && <p className="mt-1 text-[11.5px] leading-snug text-[var(--text-dim)]">{c.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
