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
  { id: 'monitorointi-ja-hoitolaitteet', moduleId: 'perusteet', title: 'Monitorointi ja hoitolaitteet', summary: 'Pulssioksimetrin ja kapnometrin tulkinta, CPAP ja happivarojen laskenta.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'verikaasuanalyysi', moduleId: 'perusteet', title: 'Verikaasuanalyysin tulkinta', summary: 'Happo-emästasapaino, hapetus ja neljä perushäiriötä – tulkintaharjoitus.', readMinutes: 7, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'patofysiologian-perusteet', moduleId: 'perusteet', title: 'Patofysiologian perusteet', summary: 'Solujen sopeutuminen ja vaurio, tulehdus ja puolustus, kudosten paraneminen ja kasvaimet.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'patologiakertaus', moduleId: 'perusteet', title: 'Patologiakertaus – lääketieteellinen arviointi', summary: 'Keskeiset patofysiologian periaatteet ensihoitajan näkökulmasta.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- ammatillinen ---
  { id: 'ensihoidon-tehtavakoodit', moduleId: 'ammatillinen', title: 'Ensihoidon tehtäväkoodit', summary: 'Tehtäväsarjat, kiireellisyysvasteet ja hakemisto: mistä kunkin tehtävän hoito löytyy.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'kuljettamatta-jattaminen', moduleId: 'ammatillinen', title: 'Kuljettamatta jättäminen ja X-koodit', summary: 'X-51- ja X-81-päätösten edellytykset, kieltäytyminen, muu kuljetus ja toisen yksikön peruuttaminen.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'ensihoidon-johtaminen', moduleId: 'ammatillinen', title: 'Ensihoidon operatiivinen johtaminen', summary: 'Johtamistavat, johtamisprosessi, FOR-DEC, suljettu viestintä ja monipotilastilanteet.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'suuronnettomuus', moduleId: 'ammatillinen', title: 'Suuronnettomuus ja potilasluokittelu', summary: 'Hälyttäminen, johtaminen, primaari- ja sekundaariluokittelu sekä kuljetus.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'potilasviestinta-ruotsiksi', moduleId: 'ammatillinen', title: 'Potilasviestintä ruotsiksi', summary: 'Keskeiset fraasit potilaan kohtaamiseen ruotsiksi.', readMinutes: 6, hasQuiz: false, hasFlashcards: true, hasScenario: false },
  { id: 'ensihoitajan-ydinosaaminen', moduleId: 'ammatillinen', title: 'Ensihoitajan ydinosaaminen ja sen kehittäminen', summary: 'Osaamisalueet, täydennyskoulutus ja osaamisen arviointi ensihoidossa.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- elvytys ---
  { id: 'elvytys', moduleId: 'elvytys', title: 'Aikuisen elvytys', summary: 'Tunnistaminen, painelu, hoitoelvytys, hoidettavat syyt, ROSC-hoito ja elvytyksen lopettaminen.', readMinutes: 12, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'lapsen-ja-vastasyntyneen-elvytys', moduleId: 'elvytys', title: 'Lapsen ja vastasyntyneen elvytys', summary: 'Lapsen peruselvytys 15:2, painon mukaiset annokset ja vastasyntyneen elvytystoimet: lämpö, ventilaatio ja syke.', readMinutes: 14, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'elvytys-sairaalan-ulkopuolella', moduleId: 'elvytys', title: 'Elvytyksen erityistilanteet', summary: 'Vammapotilaan sydänpysähdys, mekaaninen painelu, kuljetus elvyttäen, hukkunut ja raskaana oleva.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'hengitystien-hallinta', moduleId: 'elvytys', title: 'Hengitystien hallinta ja hätäkrikotyreotomia', summary: 'Tukoksen tunnistaminen, avausotteet, apuvälineet, naamari-palje, supraglottinen väline ja kirurginen hengitystie.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'anestesiaintubaatio', moduleId: 'elvytys', title: 'Anestesiaintubaatio ensihoidossa', summary: 'Vakioitu prosessi, esihappeutus, työnjako ja epäonnistuneen intubaation suunnitelma.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'rytminsiirto-ja-tahdistus', moduleId: 'elvytys', title: 'Rytminsiirto ja ulkoinen tahdistus', summary: 'Synkronoitu rytminsiirto ja ulkoinen tahdistus: aiheet, laitteen valmistelu, sedaatio ja ongelmatilanteet.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'case-elvytys-701', moduleId: 'elvytys', title: 'Tapaus: Sydänpysähdys', summary: 'Harjoittele nähdyn kammiovärinäpysähdyksen hoitoa ensimmäisestä iskusta ROSC-hoitoon.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '701' },

  // --- hengitys ---
  { id: 'hengitysteiden-fysiologia', moduleId: 'hengitys', title: 'Hengitysteiden fysiologia ja hätätilat', summary: 'Hengityksen säätely ja hengitysvajauksen mekanismit.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'ylahengitystien-tukos-anafylaksia', moduleId: 'hengitys', title: 'Ylähengitystien tukokset ja anafylaksia', summary: 'Vierasesine, epiglottiitti, anafylaksia myös lapsella ja angioedeema.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
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
  { id: 'eteisvarina', moduleId: 'sydan', title: 'Eteisvärinä', summary: 'Kesto, CHA₂DS₂-VA, sykkeenhallinta ja rytminsiirron edellytykset.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'sokki', moduleId: 'sydan', title: 'Sokki eli verenkiertovajaus', summary: 'Sokkityypit, tunnistaminen, nestevaste, sydämen tamponaatio ja yleishoito ensihoidossa.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'case-rintakipu-704', moduleId: 'sydan', title: 'Tapaus: Rintakipu', summary: 'Harjoittele rintakipupotilaan arviointia ja päätöksentekoa.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '704' },

  // --- neurologia ---
  { id: 'tajuttomuus', moduleId: 'neurologia', title: 'Tajuttomuus', summary: 'Tajunnan säätely, tajuttomuuden syyt ja tutkiminen kentällä.', readMinutes: 12, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'aivoverenkiertohairio', moduleId: 'neurologia', title: 'Aivoverenkiertohäiriö (AVH), TIA ja SAV', summary: 'Tunnistaminen, aikaikkunat, liuotus ja trombektomia, ohimenevä TIA sekä lukinkalvonalainen verenvuoto.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'kouristelu', moduleId: 'neurologia', title: 'Kouristelu ja epilepsia', summary: 'Pitkittynyt kouristelu, lääkeportaat, erotusdiagnostiikka ja kuljetuskriteerit.', readMinutes: 6, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'paansarky-ja-migreeni', moduleId: 'neurologia', title: 'Päänsärky ja migreeni', summary: 'Vaaranmerkit, särkyn piirteet, migreeni ja aura sekä Hortonin päänsärky.', readMinutes: 7, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'huimaus', moduleId: 'neurologia', title: 'Huimaus', summary: 'Vaarallisen huimauksen tunnistaminen, asentohuimaus, vestibulaarineuriitti ja Ménièren tauti.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'yleistilan-lasku-ja-pyortyminen', moduleId: 'neurologia', title: 'Äkillinen yleistilan heikkeneminen ja pyörtyminen', summary: 'Epäspesifisen oireilun ja synkopeen erotusdiagnostiikka.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'case-tajuttomuus-702', moduleId: 'neurologia', title: 'Tapaus: Tajuton potilas', summary: 'Harjoittele tajuttoman potilaan systemaattista tutkimista.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '702' },

  // --- vatsa ---
  { id: 'akuutti-vatsa', moduleId: 'vatsa', title: 'Akuutti vatsa ja GI-verenvuoto', summary: 'Vatsakivun mekanismit, hälyttävät oireet ja verenvuodon tunnistus.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'maksakirroosi', moduleId: 'vatsa', title: 'Maksakirroosi ja sen komplikaatiot', summary: 'Portahypertensio, variksvuoto, askites, bakteeriperitoniitti ja hepaattinen enkefalopatia.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'verenvuoto-ilman-vammaa', moduleId: 'vatsa', title: 'Verenvuoto ilman vammaa', summary: 'Nenä-, suu-, gynekologiset ja leikkauksen jälkeiset vuodot: vaarallisuuden arvio, nestehoito ja jatkohoito.', readMinutes: 6, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- sokeri ---
  { id: 'sokeritasapainon-hairiot', moduleId: 'sokeri', title: 'Hypoglykemia, hyperglykemia ja DKA', summary: 'Sokeritasapainon häiriöiden tunnistaminen ja hoito kentällä.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'hyperkalemia-elektrolyytit', moduleId: 'sokeri', title: 'Elektrolyyttihäiriöt ja hyperkalemia', summary: 'EKG-muutokset, tyyppipotilaat ja hyperkalemian hoidon kulmakivet.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'munuaisten-vajaatoiminta', moduleId: 'sokeri', title: 'Munuaisten vajaatoiminta, AKI ja dialyysipotilas', summary: 'Akuutin munuaisvaurion tyypit, munuaisille haitalliset lääkkeet, GFR-luokat ja loppuvaiheen hoito.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'case-sokeritasapaino-771', moduleId: 'sokeri', title: 'Tapaus: Sokeritasapainon häiriö', summary: 'Harjoittele diabeetikon akuutin tilanteen arviointia.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '771' },

  // --- infektiot ---
  { id: 'infektiosairaudet', moduleId: 'infektiot', title: 'Infektiosairaudet ja sepsis', summary: 'Sepsiksen tunnistaminen ja tavallisimmat infektioperäiset hätätilanteet.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- myrkytys ---
  { id: 'intoksikaatiopotilaan-hoito', moduleId: 'myrkytys', title: 'Intoksikaatiopotilaan ensihoito', summary: 'Yleisimmät myrkytykset ja niiden tunnistaminen/hoito.', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'alkoholin-vaarinkaytto', moduleId: 'myrkytys', title: 'Alkoholin väärinkäyttö ensihoidossa', summary: 'Akuutti alkoholimyrkytys ja vieroitusoireiden tunnistaminen.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'mielenterveyden-hairio', moduleId: 'myrkytys', title: 'Mielenterveyden häiriö ja kiihtynyt potilas', summary: 'Kohtaaminen, rauhoittava lääkitys, tahdosta riippumaton hoito (M1) ja virka-apu.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'case-myrkytys-752', moduleId: 'myrkytys', title: 'Tapaus: Myrkytys', summary: 'Harjoittele myrkytyspotilaan kohtaamista ja hoitolinjauksia.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '752' },

  // --- trauma ---
  { id: 'traumapotilaan-tutkiminen', moduleId: 'trauma', title: 'Traumapotilaan tutkiminen ja hoito', summary: 'Vammamekaniikka ja systemaattinen vammapotilaan tutkiminen.', readMinutes: 14, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'massiivinen-verenvuoto', moduleId: 'trauma', title: 'Massiivinen verenvuoto ja verensiirto ensihoidossa', summary: 'Vamman aiheuttama hyytymishäiriö, punasolut kentälle ja verenvuodon hallinnan kokonaisuus.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'paan-vamma', moduleId: 'trauma', title: 'Pään vamma', summary: 'Aivovamman vaikeusaste, sekundaarivaurion esto ja kallonsisäisen paineen hallinta.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'selkaranka-ja-selkaydinvamma', moduleId: 'trauma', title: 'Selkäranka- ja selkäydinvamma', summary: 'Rangan tuenta, neurogeeninen sokki, kaularankasäännöt ja epätäydelliset selkäydinvammat (ETC).', readMinutes: 11, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'rintakehavammat', moduleId: 'trauma', title: 'Rintakehävammat', summary: 'Kuusi välittömästi henkeä uhkaavaa rintakehävammaa ja niiden tunnistaminen (ETC).', readMinutes: 12, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'vatsan-ja-lantion-vammat', moduleId: 'trauma', title: 'Vatsan ja lantion vammat', summary: 'Epäluotettava vatsan tutkimus, lantiorenkaan murtumatyypit ja lantiovyö (ETC).', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'raajavammat', moduleId: 'trauma', title: 'Raajavammat', summary: 'Raajan vuoto, murtumien oikaisu, raajaa uhkaavat vammat ja aitio-oireyhtymä (ETC).', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'irtileikkautunut-raaja', moduleId: 'trauma', title: 'Irtileikkautunut raaja (amputaatio)', summary: 'Amputaatiovamman hoito ja irronneen osan käsittely.', readMinutes: 7, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'tylppa-vamma', moduleId: 'trauma', title: 'Tylppä vamma', summary: 'Tylpän vamman mekanismit ja piilevät vammat.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'lavistavat-vammat', moduleId: 'trauma', title: 'Lävistävät vammat', summary: 'Lävistävän vamman erityispiirteet ja ensihoito.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'rajahdysvamma', moduleId: 'trauma', title: 'Räjähdysvamma', summary: 'Räjähdyksen vammamekanismit ja triage.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'palovamma', moduleId: 'trauma', title: 'Palovamma', summary: 'Palovamman laajuuden arviointi ja nestehoito.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'liikenneonnettomuus', moduleId: 'trauma', title: 'Vamma-liikenneonnettomuus', summary: 'Vammamekanismin tulkinta ja potilaan irrotus ajoneuvosta.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: '40-traumavinkkia', moduleId: 'trauma', title: '40 muistisääntöä traumapotilaan hoitoon', summary: 'Kentältä opittuja käytännön vinkkejä trauman hoitoon.', readMinutes: 10, hasQuiz: false, hasFlashcards: true, hasScenario: false },
  { id: 'case-vammapotilas-200', moduleId: 'trauma', title: 'Tapaus: Vammapotilas', summary: 'Harjoittele vammapotilaan systemaattista kohtaamista.', readMinutes: 10, hasQuiz: false, hasFlashcards: false, hasScenario: true, dispatchCode: '200' },

  // --- ymparisto ---
  { id: 'hypotermia', moduleId: 'ymparisto', title: 'Hypotermia ja hypoterminen elvytys', summary: 'Luokittelu, elonmerkkien arviointi ja elvytyksen poikkeamat kylmässä potilaassa.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'lampohalvaus', moduleId: 'ymparisto', title: 'Lämpöhalvaus (hypertermia)', summary: 'Tunnistaminen, riskitekijät ja välitön viilennys.', readMinutes: 6, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'sukeltajantauti', moduleId: 'ymparisto', title: 'Sukeltajantauti', summary: 'Paineen fysiikka, oireet, riskitekijät ja ensihoito ennen painekammiota.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'hukkuminen-ja-sahkotapaturma', moduleId: 'ymparisto', title: 'Hukkuminen ja sähkötapaturma', summary: 'Hukkuneen elvytys, kylmän veden suoja, viivästynyt keuhkopöhö ja sähköiskun erityispiirteet.', readMinutes: 6, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'altistuminen-vaarallisille-aineille', moduleId: 'ymparisto', title: 'Altistuminen kemikaalille, säteilylle tai taudinaiheuttajalle', summary: 'Suojautuminen, dekontaminaatio, kemikaalionnettomuuden vasta-aineet, säteily ja tartuntavaarallinen potilas.', readMinutes: 9, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- lapset ---
  { id: 'lapsi-ensihoidossa', moduleId: 'lapset', title: 'Lapsi ensihoidossa', summary: 'Lapsen fysiologiset erityispiirteet ja yleisimmät hätätilanteet.', readMinutes: 13, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- raskaus ---
  { id: 'raskaana-oleva-synnyttaja', moduleId: 'raskaus', title: 'Raskaana oleva ja synnyttäjä ensihoidossa', summary: 'Raskausajan hätätilanteet ja synnytyksen kohtaaminen kentällä.', readMinutes: 12, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'raskauden-verenvuodot', moduleId: 'raskaus', title: 'Raskaudenaikaiset verenvuodot ja hätätilanteet', summary: 'Kohdunulkoinen raskaus, ablaatio, etisistukka, pre-eklampsia ja napanuoran esiinluiskahdus.', readMinutes: 10, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- geriatria ---
  { id: 'ikaantynyt-potilas', moduleId: 'geriatria', title: 'Ikääntynyt potilas ensihoidossa', summary: 'Kaatuilu, gerastenia, huimaus, lääkkeiden muuttunut vaikutus, infektiot ja muistisairaan kipu.', readMinutes: 12, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'muistisairaudet', moduleId: 'geriatria', title: 'Muistisairaudet', summary: 'Alzheimer, Lewy ja vaskulaarinen, hoidettavat syyt, delirium ja muistisairaan kohtaaminen.', readMinutes: 6, hasQuiz: true, hasFlashcards: true, hasScenario: false },

  // --- laakkeet ---
  { id: 'kivunhoito', moduleId: 'laakkeet', group: 'Kivunhoito ja sedaatio', title: 'Kivunhoito ensihoidossa', summary: 'Kiputyypit, NRS-arvio, opioidit, esketamiini ja erityisryhmät.', readMinutes: 8, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'fentanyyli', moduleId: 'laakkeet', group: 'Kivunhoito ja sedaatio', title: 'Fentanyyli', summary: 'Lyhytvaikutteinen opioidi laskimoon ja nenään: annokset, käyttö ja haitat.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'morfiini', moduleId: 'laakkeet', group: 'Kivunhoito ja sedaatio', title: 'Morfiini', summary: 'Pitkävaikutteinen perusopioidi: annokset, AKS-varoitus ja haitat.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 's-ketamiini', moduleId: 'laakkeet', group: 'Kivunhoito ja sedaatio', title: 'S-ketamiini (esketamiini)', summary: 'Verenkierron säilyttävä kipu- ja anestesialääke epävakaalle potilaalle.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'metoksifluraani', moduleId: 'laakkeet', group: 'Kivunhoito ja sedaatio', title: 'Metoksifluraani', summary: 'Hengitettävä, potilaan itse annostelema kipulääke vammapotilaalle.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'midatsolaami', moduleId: 'laakkeet', group: 'Kivunhoito ja sedaatio', title: 'Midatsolaami', summary: 'Bentsodiatsepiini kouristeluun, sedaatioon ja kiihtyneelle potilaalle.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'adrenaliini', moduleId: 'laakkeet', group: 'Elvytys ja verenkierto', title: 'Adrenaliini', summary: 'Elvytyksen ja anafylaksian päälääke: annokset, ajoitus ja haitat.', readMinutes: 6, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'noradrenaliini', moduleId: 'laakkeet', group: 'Elvytys ja verenkierto', title: 'Noradrenaliini', summary: 'Ensisijainen vasopressori nestehoidolle reagoimattomaan hypotensioon.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'amiodaroni', moduleId: 'laakkeet', group: 'Elvytys ja verenkierto', title: 'Amiodaroni', summary: 'Käyttöaiheet, annostus ja huomioitavat haittavaikutukset.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'adenosiini', moduleId: 'laakkeet', group: 'Elvytys ja verenkierto', title: 'Adenosiini', summary: 'SVT:n kääntö hetkellisellä eteis-kammiosolmukkeen salpauksella.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'atropiini', moduleId: 'laakkeet', group: 'Elvytys ja verenkierto', title: 'Atropiini', summary: 'Käyttöaiheet, annostus ja huomioitavat haittavaikutukset.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'asetyylisalisyylihappo', moduleId: 'laakkeet', group: 'Sepelvaltimotautikohtaus ja sydän', title: 'Asetyylisalisyylihappo (ASA)', summary: 'Sepelvaltimotautikohtauksen peruslääke: annokset ja vuotoriski.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'klopidogreeli', moduleId: 'laakkeet', group: 'Sepelvaltimotautikohtaus ja sydän', title: 'Klopidogreeli', summary: 'ADP-reseptorin salpaaja suuren vuotoriskin potilaalle.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'tikagrelori', moduleId: 'laakkeet', group: 'Sepelvaltimotautikohtaus ja sydän', title: 'Tikagrelori', summary: 'Nopeavaikutteinen ADP-reseptorin salpaaja – ja miksi lataus estää liuotuksen.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'enoksapariini', moduleId: 'laakkeet', group: 'Sepelvaltimotautikohtaus ja sydän', title: 'Enoksapariini', summary: 'Käyttöaiheet, annostus ja huomioitavat haittavaikutukset.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'glyseryylitrinitraatti', moduleId: 'laakkeet', group: 'Sepelvaltimotautikohtaus ja sydän', title: 'Glyseryylitrinitraatti (nitro)', summary: 'Nitraatti rintakipuun ja keuhkopöhöön – ja milloin se on vaarallinen.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'isosorbididinitraatti', moduleId: 'laakkeet', group: 'Sepelvaltimotautikohtaus ja sydän', title: 'Isosorbididinitraatti', summary: 'Nitraattisuihke korkeapainepöhön hoidossa.', readMinutes: 3, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'metoprololi', moduleId: 'laakkeet', group: 'Sepelvaltimotautikohtaus ja sydän', title: 'Metoprololi', summary: 'Beeta1-salpaaja takykardiaan, AKS:aan ja nopeaan eteisvärinään.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'tenekteplaasi', moduleId: 'laakkeet', group: 'Liuotushoito', title: 'Tenekteplaasi', summary: 'Ensihoidon liuotuslääke ST-nousuinfarktiin ja hengenvaaralliseen keuhkoemboliaan: painon mukainen bolus.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'alteplaasi', moduleId: 'laakkeet', group: 'Liuotushoito', title: 'Alteplaasi', summary: 'Bolus ja infuusio: aivoinfarktin, keuhkoembolian ja STEMI:n liuotus sairaalassa.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'ipratropium-salbutamoli', moduleId: 'laakkeet', group: 'Hengitys ja allergia', title: 'Ipratropiumbromidi + salbutamoli', summary: 'Inhaloitava yhdistelmä: kaksi tapaa avata keuhkoputket.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'metyyliprednisoloni', moduleId: 'laakkeet', group: 'Hengitys ja allergia', title: 'Metyyliprednisoloni', summary: 'Kortikosteroidi astmaan, COPD:hen ja anafylaksiaan.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'naloksoni', moduleId: 'laakkeet', group: 'Vastalääkkeet ja myrkytykset', title: 'Naloksoni', summary: 'Opioidien vastalääke – ja miksi potilas kuljetetaan silti.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'flumatseniili', moduleId: 'laakkeet', group: 'Vastalääkkeet ja myrkytykset', title: 'Flumatseniili', summary: 'Bentsodiatsepiinien vastalääke ja sen kouristusriski.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'laakehiili', moduleId: 'laakkeet', group: 'Vastalääkkeet ja myrkytykset', title: 'Lääkehiili', summary: 'Imeytymisen esto: annos, aikaikkuna ja milloin hiili ei tehoa.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'ondansetroni', moduleId: 'laakkeet', group: 'Pahoinvointi ja verenvuoto', title: 'Ondansetroni', summary: 'Käyttöaiheet, annostus ja huomioitavat haittavaikutukset.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'traneksaamihappo', moduleId: 'laakkeet', group: 'Pahoinvointi ja verenvuoto', title: 'Traneksaamihappo', summary: 'Hyytymää vakauttava lääke vuotavalle – hyöty vain 3 tunnin sisällä.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'glukoosi-g10', moduleId: 'laakkeet', group: 'Infuusionesteet', title: 'Glukoosi G10', summary: 'Hypoglykemian hoito ja glukoosi insuliinin rinnalla.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'natriumbikarbonaatti', moduleId: 'laakkeet', group: 'Infuusionesteet', title: 'Natriumbikarbonaatti', summary: 'Emäs hyperkalemiaan ja trisyklisten masennuslääkkeiden myrkytykseen.', readMinutes: 4, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'natriumkloridi', moduleId: 'laakkeet', group: 'Infuusionesteet', title: 'Natriumkloridi 0,9 %', summary: 'Fysiologinen keittosuola: nesteytys, laimennus ja rajoitukset.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
  { id: 'ringerin-liuos', moduleId: 'laakkeet', group: 'Infuusionesteet', title: 'Ringerin liuos', summary: 'Ensihoidon yleisin nesteytysliuos: määrät ja varoitukset.', readMinutes: 5, hasQuiz: true, hasFlashcards: true, hasScenario: false },
]

export function getTopic(id: string): TopicMeta | undefined {
  return topics.find((t) => t.id === id)
}

export function topicsByModule(moduleId: string): TopicMeta[] {
  return topics.filter((t) => t.moduleId === moduleId)
}
