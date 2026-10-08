import type { TopicMeta } from './types'

// Single source of truth for every study page in the app.
// Each topic id maps to: content/articles/<id>.md (required),
// content/quizzes/<id>.json, content/flashcards/<id>.json (optional),
// content/scenarios/<id>.json (optional, case-based pages only).
export const topics: TopicMeta[] = [
  // --- perusteet ---
  { id: 'abcde-arviointi', moduleId: 'perusteet', title: 'ABCDE ja peruselintoimintojen arviointi', summary: 'Systemaattinen ensiarvio ja uhkien tunnistaminen.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'socrates-kivun-arviointi', moduleId: 'perusteet', title: 'SOCRATES – kivun jäsennelty arviointi', summary: 'Muistisääntö kivun systemaattiseen haastatteluun.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'konsultaatiomallit', moduleId: 'perusteet', title: 'Konsultaatiomallit ja kliiniset arviointityökalut', summary: 'ISBAR, NEWS2, GCS ja muut kentän pisteytysmenetelmät.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'patologiakertaus', moduleId: 'perusteet', title: 'Patologiakertaus – lääketieteellinen arviointi', summary: 'Keskeiset patofysiologian periaatteet ensihoitajan näkökulmasta.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'patofysiologian-perusteet', moduleId: 'perusteet', title: 'Patofysiologian perusteet', summary: 'Solujen sopeutuminen ja vaurio, tulehdus ja puolustus, kudosten paraneminen ja kasvaimet.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'sokki', moduleId: 'perusteet', title: 'Sokki eli verenkiertovajaus', summary: 'Sokkityypit, tunnistaminen, nestevaste ja yleishoito ensihoidossa.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'verikaasuanalyysi', moduleId: 'perusteet', title: 'Verikaasuanalyysin tulkinta', summary: 'Happo-emästasapaino, hapetus ja neljä perushäiriötä – tulkintaharjoitus.', readMinutes: 7, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'potilasviestinta-ruotsiksi', moduleId: 'perusteet', title: 'Potilasviestintä ruotsiksi', summary: 'Keskeiset fraasit potilaan kohtaamiseen ruotsiksi.', readMinutes: 6, hasQuiz: false, hasFlashcards: true, hasScenario: false },

  // --- hengitys ---
  { id: 'hengitysteiden-fysiologia', moduleId: 'hengitys', title: 'Hengitysteiden fysiologia ja hätätilat', summary: 'Hengityksen säätely ja hengitysvajauksen mekanismit.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'ylahengitystien-tukos-anafylaksia', moduleId: 'hengitys', title: 'Ylähengitystien tukokset ja anafylaksia', summary: 'Vierasesine, epiglottiitti ja allerginen reaktio.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'astma-ja-copd', moduleId: 'hengitys', title: 'Astma ja COPD', summary: 'Obstruktiivisten keuhkosairauksien ensihoito ja lääkitys.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'ilmarinta', moduleId: 'hengitys', title: 'Ilmarinta ja jänniteilmarinta', summary: 'Tunnistaminen ja neulatorakosenteesin periaatteet.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'keuhkoembolia', moduleId: 'hengitys', title: 'Keuhkoembolia', summary: 'Riskitekijät, oirekuva ja ensihoito.', readMinutes: 7, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'keuhkokuume', moduleId: 'hengitys', title: 'Keuhkokuume', summary: 'Pneumonian tunnistaminen ja vaikeusasteen arviointi.', readMinutes: 6, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'keuhkopoho', moduleId: 'hengitys', title: 'Sydänperäinen keuhkopöhö', summary: 'Akuutin vasemman kammion vajaatoiminnan ensihoito.', readMinutes: 7, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'case-hengitysvaikeus-703', moduleId: 'hengitys', title: 'Tapaus: Hengitysvaikeus', summary: 'Harjoittele hengitysvaikeuspotilaan kohtaamista vaihe vaiheelta.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '703' },

  // --- sydan ---
  { id: 'rintakipu-ja-aks', moduleId: 'sydan', title: 'Rintakipu ja akuutti sepelvaltimotautikohtaus', summary: 'Rintakivun syyt, EKG-löydökset ja ensihoito.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'sydanpotilaan-tutkiminen', moduleId: 'sydan', title: 'Sydänpotilaan haastattelu ja kliininen tutkiminen', summary: 'Haastattelutekniikka, NYHA/CCS, valtimot ja syke, ortostaattinen koe, kaulalaskimot ja turvotukset.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'ekg-perusteet', moduleId: 'sydan', title: 'EKG:n perusteet ja systemaattinen tulkinta', summary: 'Normaaliarvot, kytkennät, sähköinen akseli, haarakatkokset ja virhelähteet.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'ekg-ja-iskemia', moduleId: 'sydan', title: 'EKG:n iskemiatulkinta', summary: 'Kytkennät ja suonet, iskemian eteneminen, erityiset kuviot ja haarakatkokset.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'rytmihairiot', moduleId: 'sydan', title: 'Rytmihäiriöt', summary: 'Rytmihäiriömekanismit ja yleisimpien rytmien hoitoperiaatteet.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'hyperkalemia-elektrolyytit', moduleId: 'sydan', title: 'Elektrolyyttihäiriöt ja hyperkalemia', summary: 'EKG-muutokset, tyyppipotilaat ja hyperkalemian hoidon kulmakivet.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'case-rintakipu-704', moduleId: 'sydan', title: 'Tapaus: Rintakipu', summary: 'Harjoittele rintakipupotilaan arviointia ja päätöksentekoa.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '704' },

  // --- elvytys ---
  { id: 'elvytys-sairaalan-ulkopuolella', moduleId: 'elvytys', title: 'Sydänpysähdys, mekaaninen painelu ja elvyttäen kuljetus', summary: 'Selviytymisketju, syyn hoitaminen, LUCAS-laite ja milloin kuljettaa elvyttäen.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'anestesiaintubaatio', moduleId: 'elvytys', title: 'Anestesiaintubaatio ensihoidossa', summary: 'Vakioitu prosessi, esihappeutus, työnjako ja epäonnistuneen intubaation suunnitelma.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- neurologia ---
  { id: 'tajuttomuus', moduleId: 'neurologia', title: 'Tajuttomuus', summary: 'Tajunnan säätely, tajuttomuuden syyt ja tutkiminen kentällä.', readMinutes: 12, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'aivoverenkiertohairio', moduleId: 'neurologia', title: 'Aivoverenkiertohäiriö (AVH) ja SAV', summary: 'Tunnistaminen, aikaikkunat, liuotus ja trombektomia sekä lukinkalvonalainen verenvuoto.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'kouristelu', moduleId: 'neurologia', title: 'Kouristelu ja epilepsia', summary: 'Pitkittynyt kouristelu, lääkeportaat ja kuljetuskriteerit.', readMinutes: 6, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'yleistilan-lasku-ja-pyortyminen', moduleId: 'neurologia', title: 'Äkillinen yleistilan heikkeneminen ja pyörtyminen', summary: 'Epäspesifisen oireilun ja synkopeen erotusdiagnostiikka.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'case-tajuttomuus-702', moduleId: 'neurologia', title: 'Tapaus: Tajuton potilas', summary: 'Harjoittele tajuttoman potilaan systemaattista tutkimista.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '702' },

  // --- vatsa ---
  { id: 'akuutti-vatsa', moduleId: 'vatsa', title: 'Akuutti vatsa ja GI-verenvuoto', summary: 'Vatsakivun mekanismit, hälyttävät oireet ja verenvuodon tunnistus.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- sokeri ---
  { id: 'sokeritasapainon-hairiot', moduleId: 'sokeri', title: 'Hypoglykemia, hyperglykemia ja DKA', summary: 'Sokeritasapainon häiriöiden tunnistaminen ja hoito kentällä.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'case-sokeritasapaino-771', moduleId: 'sokeri', title: 'Tapaus: Sokeritasapainon häiriö', summary: 'Harjoittele diabeetikon akuutin tilanteen arviointia.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '771' },

  // --- myrkytys ---
  { id: 'intoksikaatiopotilaan-hoito', moduleId: 'myrkytys', title: 'Intoksikaatiopotilaan ensihoito', summary: 'Yleisimmät myrkytykset ja niiden tunnistaminen/hoito.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'alkoholin-vaarinkaytto', moduleId: 'myrkytys', title: 'Alkoholin väärinkäyttö ensihoidossa', summary: 'Akuutti alkoholimyrkytys ja vieroitusoireiden tunnistaminen.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'case-myrkytys-752', moduleId: 'myrkytys', title: 'Tapaus: Myrkytys', summary: 'Harjoittele myrkytyspotilaan kohtaamista ja hoitolinjauksia.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '752' },

  // --- trauma ---
  { id: 'traumapotilaan-tutkiminen', moduleId: 'trauma', title: 'Traumapotilaan tutkiminen ja hoito', summary: 'Vammamekaniikka ja systemaattinen vammapotilaan tutkiminen.', readMinutes: 14, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'tylppa-vamma', moduleId: 'trauma', title: 'Tylppä vamma', summary: 'Tylpän vamman mekanismit ja piilevät vammat.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'lavistavat-vammat', moduleId: 'trauma', title: 'Lävistävät vammat', summary: 'Lävistävän vamman erityispiirteet ja ensihoito.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'rajahdysvamma', moduleId: 'trauma', title: 'Räjähdysvamma', summary: 'Räjähdyksen vammamekanismit ja triage.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'palovamma', moduleId: 'trauma', title: 'Palovamma', summary: 'Palovamman laajuuden arviointi ja nestehoito.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'irtileikkautunut-raaja', moduleId: 'trauma', title: 'Irtileikkautunut raaja (amputaatio)', summary: 'Amputaatiovamman hoito ja irronneen osan käsittely.', readMinutes: 7, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'massiivinen-verenvuoto', moduleId: 'trauma', title: 'Massiivinen verenvuoto ja verensiirto ensihoidossa', summary: 'Vamman aiheuttama hyytymishäiriö, punasolut kentälle ja verenvuodon hallinnan kokonaisuus.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'paan-vamma', moduleId: 'trauma', title: 'Pään vamma', summary: 'Aivovamman vaikeusasteen arviointi ja sekundaarivaurion esto.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'liikenneonnettomuus', moduleId: 'trauma', title: 'Vamma-liikenneonnettomuus', summary: 'Vammamekanismin tulkinta ja potilaan irrotus ajoneuvosta.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: '40-traumavinkkia', moduleId: 'trauma', title: '40 muistisääntöä traumapotilaan hoitoon', summary: 'Kentältä opittuja käytännön vinkkejä trauman hoitoon.', readMinutes: 10, hasQuiz: false, hasFlashcards: true, hasScenario: false },
  { id: 'suuronnettomuus', moduleId: 'trauma', title: 'Suuronnettomuus ja potilasluokittelu', summary: 'Hälyttäminen, johtaminen, primaari- ja sekundaariluokittelu sekä kuljetus.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'case-vammapotilas-200', moduleId: 'trauma', title: 'Tapaus: Vammapotilas', summary: 'Harjoittele vammapotilaan systemaattista kohtaamista.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '200' },

  // --- ymparisto ---
  { id: 'hypotermia', moduleId: 'ymparisto', title: 'Hypotermia ja hypoterminen elvytys', summary: 'Luokittelu, elonmerkkien arviointi ja elvytyksen poikkeamat kylmässä potilaassa.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'lampohalvaus', moduleId: 'ymparisto', title: 'Lämpöhalvaus (hypertermia)', summary: 'Tunnistaminen, riskitekijät ja välitön viilennys.', readMinutes: 6, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'sukeltajantauti', moduleId: 'ymparisto', title: 'Sukeltajantauti', summary: 'Paineen fysiikka, oireet, riskitekijät ja ensihoito ennen painekammiota.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'hukkuminen-ja-sahkotapaturma', moduleId: 'ymparisto', title: 'Hukkuminen ja sähkötapaturma', summary: 'Hukkuneen elvytys, kylmän veden suoja, viivästynyt keuhkopöhö ja sähköiskun erityispiirteet.', readMinutes: 6, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- lapset ---
  { id: 'lapsi-ensihoidossa', moduleId: 'lapset', title: 'Lapsi ensihoidossa', summary: 'Lapsen fysiologiset erityispiirteet ja yleisimmät hätätilanteet.', readMinutes: 13, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- raskaus ---
  { id: 'raskaana-oleva-synnyttaja', moduleId: 'raskaus', title: 'Raskaana oleva ja synnyttäjä ensihoidossa', summary: 'Raskausajan hätätilanteet ja synnytyksen kohtaaminen kentällä.', readMinutes: 12, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'raskauden-verenvuodot', moduleId: 'raskaus', title: 'Raskaudenaikaiset verenvuodot ja hätätilanteet', summary: 'Kohdunulkoinen raskaus, ablaatio, etisistukka, pre-eklampsia ja napanuoran esiinluiskahdus.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- infektiot ---
  { id: 'infektiosairaudet', moduleId: 'infektiot', title: 'Infektiosairaudet ja sepsis', summary: 'Sepsiksen tunnistaminen ja tavallisimmat infektioperäiset hätätilanteet.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- geriatria ---
  { id: 'ikaantynyt-potilas', moduleId: 'geriatria', title: 'Ikääntynyt potilas ensihoidossa', summary: 'Kaatuilu, gerastenia, huimaus, lääkkeiden muuttunut vaikutus, infektiot ja muistisairaan kipu.', readMinutes: 12, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'muistisairaudet', moduleId: 'geriatria', title: 'Muistisairaudet', summary: 'Alzheimer, Lewy ja vaskulaarinen, hoidettavat syyt, delirium ja muistisairaan kohtaaminen.', readMinutes: 6, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'munuaisten-vajaatoiminta', moduleId: 'geriatria', title: 'Munuaisten vajaatoiminta, AKI ja dialyysipotilas', summary: 'Akuutin munuaisvaurion tyypit, munuaisille haitalliset lääkkeet, GFR-luokat ja loppuvaiheen hoito.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- laakkeet ---
  { id: 'amiodaroni', moduleId: 'laakkeet', title: 'Amiodaroni', summary: 'Käyttöaiheet, annostus ja huomioitavat haittavaikutukset.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'atropiini', moduleId: 'laakkeet', title: 'Atropiini', summary: 'Käyttöaiheet, annostus ja huomioitavat haittavaikutukset.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'enoksapariini', moduleId: 'laakkeet', title: 'Enoksapariini', summary: 'Käyttöaiheet, annostus ja huomioitavat haittavaikutukset.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'ondansetroni', moduleId: 'laakkeet', title: 'Ondansetroni', summary: 'Käyttöaiheet, annostus ja huomioitavat haittavaikutukset.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- ammatillinen ---
  { id: 'ensihoitajan-ydinosaaminen', moduleId: 'ammatillinen', title: 'Ensihoitajan ydinosaaminen ja sen kehittäminen', summary: 'Osaamisalueet, täydennyskoulutus ja osaamisen arviointi ensihoidossa.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'ensihoidon-johtaminen', moduleId: 'ammatillinen', title: 'Ensihoidon operatiivinen johtaminen', summary: 'Johtamistavat, johtamisprosessi, FOR-DEC, suljettu viestintä ja monipotilastilanteet.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
]

export function getTopic(id: string): TopicMeta | undefined {
  return topics.find((t) => t.id === id)
}

export function topicsByModule(moduleId: string): TopicMeta[] {
  return topics.filter((t) => t.moduleId === moduleId)
}
