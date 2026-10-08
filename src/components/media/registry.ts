import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type MediaKind = 'Laskuri' | 'Interaktiivinen kuva' | 'Animaatio' | 'Kaavio' | 'Harjoitus' | 'Ääni' | 'Itsearviointi' | 'Aikajana'

export interface WidgetMeta {
  title: string
  kind: MediaKind
}

/* Every widget lives in ./widgets/<name>.tsx with a default export. Files are
 * discovered with import.meta.glob so each one is code-split and only loaded
 * when an article actually embeds it. */
const loaders = import.meta.glob('./widgets/*.tsx') as Record<string, () => Promise<{ default: ComponentType<WidgetProps> }>>

export type WidgetProps = Record<string, unknown>

export const widgetMeta: Record<string, WidgetMeta> = {
  // generic, data-driven
  flow: { title: 'Toimintakaavio', kind: 'Kaavio' },
  timeline: { title: 'Aikajana', kind: 'Aikajana' },
  mnemonic: { title: 'Muistisääntö', kind: 'Harjoitus' },
  checklist: { title: 'Kriteerien tarkistus', kind: 'Laskuri' },
  matching: { title: 'Yhdistelytehtävä', kind: 'Harjoitus' },
  scale: { title: 'Viitearvot', kind: 'Interaktiivinen kuva' },
  targets: { title: 'Tavoitearvot', kind: 'Interaktiivinen kuva' },
  // calculators
  gcs: { title: 'GCS-laskuri', kind: 'Laskuri' },
  news2: { title: 'NEWS2-laskuri', kind: 'Laskuri' },
  'shock-index': { title: 'Sokki-indeksi', kind: 'Laskuri' },
  icp: { title: 'Kallonsisäinen paine ja CPP', kind: 'Laskuri' },
  qtc: { title: 'QTc-tulkinta', kind: 'Laskuri' },
  apgar: { title: 'Apgar-pisteet', kind: 'Laskuri' },
  'dose-practice': { title: 'Lapsen annoslaskut', kind: 'Harjoitus' },
  'rule-of-nines': { title: '9:n sääntö', kind: 'Laskuri' },
  // audio & reflection
  phrasebook: { title: 'Fraasit ääntämisineen', kind: 'Ääni' },
  'self-assessment': { title: 'Osaamisen itsearviointi', kind: 'Itsearviointi' },
  // illustrations & animations
  'ecg-rhythms': { title: 'Rytmikirjasto', kind: 'Animaatio' },
  conduction: { title: 'Sydämen johtoratajärjestelmä', kind: 'Animaatio' },
  'action-potential': { title: 'Toimintapotentiaali', kind: 'Kaavio' },
  'ecg-territories': { title: 'Infarktin paikantaminen', kind: 'Interaktiivinen kuva' },
  atherosclerosis: { title: 'Sepelvaltimotaudin eteneminen', kind: 'Interaktiivinen kuva' },
  'coag-cascade': { title: 'Hyytymisen esto', kind: 'Kaavio' },
  pneumothorax: { title: 'Ilmarinta, jänniteilmarinta ja veririnta', kind: 'Animaatio' },
  alveolus: { title: 'Keuhkorakkula eri tiloissa', kind: 'Interaktiivinen kuva' },
  bronchus: { title: 'Ahtautunut keuhkoputki', kind: 'Interaktiivinen kuva' },
  'airway-anatomy': { title: 'Hengitystiet', kind: 'Interaktiivinen kuva' },
  'airway-child': { title: 'Lapsen hengitystie', kind: 'Interaktiivinen kuva' },
  'abdomen-map': { title: 'Vatsakivun sijainti', kind: 'Interaktiivinen kuva' },
  'body-map': { title: 'Vammapotilaan kehokartta', kind: 'Interaktiivinen kuva' },
  'burn-depth': { title: 'Palovamman syvyys', kind: 'Interaktiivinen kuva' },
  'death-triad': { title: 'Kuoleman kolmio', kind: 'Kaavio' },
  blast: { title: 'Räjähdyksen vammamekanismit', kind: 'Interaktiivinen kuva' },
  pupils: { title: 'Pupillilöydökset', kind: 'Interaktiivinen kuva' },
  toxidrome: { title: 'Toksidromin tunnistus', kind: 'Harjoitus' },
  aortocaval: { title: 'Vasen kylkiasento', kind: 'Interaktiivinen kuva' },
  'newborn-spo2': { title: 'Vastasyntyneen SpO₂-tavoitteet', kind: 'Kaavio' },
  // mechanisms
  insulin: { title: 'Insuliinin tehtävä', kind: 'Animaatio' },
  'cpap-nitro': { title: 'Keuhkopöhön hoito: nitraatti ja CPAP', kind: 'Interaktiivinen kuva' },
  tamponade: { title: 'Sydäntamponaatio', kind: 'Animaatio' },
  'vagal-brake': { title: 'Atropiini ja vagaalinen jarru', kind: 'Animaatio' },
  antiemetic: { title: 'Miten ondansetroni estää pahoinvointia', kind: 'Animaatio' },
  'shock-skin': { title: 'Lämmin vai kylmä sokki?', kind: 'Interaktiivinen kuva' },
  'breathing-patterns': { title: 'Hengityskuviot', kind: 'Animaatio' },
  // procedures & recognition
  delivery: { title: 'Synnytyksen avustaminen vaihe vaiheelta', kind: 'Kaavio' },
  postpartum: { title: 'Jälkeisvaihe: kohdun supistuminen ja vuoto', kind: 'Interaktiivinen kuva' },
  choking: { title: 'Täydellinen vai osittainen tukos?', kind: 'Harjoitus' },
  'infection-routes': { title: 'Tartuntatiet ja suojautuminen', kind: 'Interaktiivinen kuva' },
  'airway-threats': { title: 'Neljä tapaa, joilla hengitystie pettää', kind: 'Interaktiivinen kuva' },
  'child-compensation': { title: 'Lapsen vuotosokki: verenpaine pettää viimeisenä', kind: 'Kaavio' },
  'alcohol-organs': { title: 'Alkoholin aiheuttamat elinvauriot', kind: 'Interaktiivinen kuva' },
  'gi-bleed': { title: 'GI-verenvuoto: mistä veri tulee?', kind: 'Animaatio' },
  'heat-loss': { title: 'Lämpötalous kentällä', kind: 'Interaktiivinen kuva' },
  'hyperkalemia-ecg': { title: 'Hyperkalemia EKG:ssä', kind: 'Animaatio' },
  'dive-pressure': { title: 'Paine, keuhkot ja liuennut typpi', kind: 'Interaktiivinen kuva' },
  'als-cycle': { title: 'Hoitoelvytyksen syklit', kind: 'Harjoitus' },
  'pregnancy-bleeding': { title: 'Raskaudenaikaisen verenvuodon syyt', kind: 'Interaktiivinen kuva' },
}

const cache = new Map<string, LazyExoticComponent<ComponentType<WidgetProps>>>()

export function getWidget(name: string): LazyExoticComponent<ComponentType<WidgetProps>> | null {
  const loader = loaders[`./widgets/${name}.tsx`]
  if (!loader) return null
  let cmp = cache.get(name)
  if (!cmp) {
    cmp = lazy(loader)
    cache.set(name, cmp)
  }
  return cmp
}

export function hasWidget(name: string): boolean {
  return Boolean(loaders[`./widgets/${name}.tsx`])
}
