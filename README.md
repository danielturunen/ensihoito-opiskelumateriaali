# Ensihoito-opas

Interaktiivinen opiskelumateriaali ensihoitaja (AMK) -opiskelijalle. Sisältää aihekohtaiset opasartikkelit, kertauskortit (flashcardit), tietovisat, potilastapausharjoitukset ja tenttitilan — kaikki selaimessa, offline-tuella.

🔗 **Sivusto:** https://danielturunen.github.io/ensihoito-opiskelumateriaali/

## Mitä sisältää

- 16 aihealuetta, 111 aihesivua (ensihoidon tehtäväkoodit ja kuljettamatta jättäminen (X-koodit), aikuisen, lapsen ja vastasyntyneen elvytys, hengitystien hallinta ja hätäkrikotyreotomia, rytminsiirto ja ulkoinen tahdistus, elvytystapaus 701, huimaus, TIA, hengitysvaikeus, trauma ja suuronnettomuus, rintakehä-, selkäranka-, vatsa-, lantio- ja raajavammat (European Trauma Course), sydän ja verenkierto, sokki, verikaasut, monitorointi ja hoitolaitteet, EKG:n iskemiatulkinta, elvytyksen erityistilanteet, anestesiaintubaatio, ympäristöperäiset hätätilat, altistuminen kemikaalille ja säteilylle, mielenterveyden häiriö ja kiihtynyt potilas, verenvuoto ilman vammaa, tajuttomuus, lapsi ensihoidossa, raskaus ja synnytys, ikääntynyt potilas, ensihoidon johtaminen, eteisvärinä, päänsärky ja migreeni, maksakirroosi, kivunhoito, lääkehoito ym.); lääkeosiossa 30 lääkeaineen ja infuusionesteen pikaopas käyttöryhmittäin (kivunhoito ja sedaatio, elvytys ja verenkierto, sepelvaltimotautikohtaus, liuotushoito, hengitys, vastalääkkeet, pahoinvointi ja verenvuoto, infuusionesteet) – ensihoidon annokset Akuuttihoidon lääkkeiden (Duodecim 2025) ja Ensihoito-oppaan mukaan, lähteiden erot merkitty, ja muut sivut linkittävät lääkesivuille
- Tietovisat jokaiselle aiheelle + erillinen **tenttitila**, jossa oikeat vastaukset paljastuvat vasta lopussa
- Kertauskortit yksinkertaisella Leitner-tyyppisellä kertausaikataululla
- Potilastapausharjoitukset (skenaariot), joissa edetään hälytystiedoista hoitopäätökseen
- Koko sisällön kattava haku
- **Oppimista tukeva multimedia** artikkelien sisällä (343 elementtiä, 129 tyyppiä): animoidut kliiniset tutkimukset (Dix–Hallpike ja vaakakaarikäytävän testi, HINTS, Romberg, sokkokävely ja WRW, AVH:n pikatutkimus, GCS-liikevaste, niskajäykkyys, kapillaaritäyttö, kaulalaskimopaine, kuoppaturvotus, akuutin vatsan tutkiminen, blokkikääntö ja rangan palpaatio, avainlihakset ja lihasvoiman asteikko), animoidut anatomia- ja mekanismikuvat (kielen aiheuttama nielun tukos ja avausotteet, painelu pumppuna, hyytymän matka keuhkovaltimoon, asentohuimauksen sakka kaarikäytävässä, migreeniaura, hiilidioksidi ja aivoverisuonet, lämmönsäätelyn pettäminen, neurogeeninen sokki vamman tason mukaan, hidastuvuusvamma, kylmä sydän, johtoratajärjestelmä, ilmarinta, keuhkorakkula, hengitystiet, sepelvaltimotauti, aortokavaalinen kompressio, insuliini ja ketoasidoosi, nitraatti + CPAP, sydäntamponaatio, rintakehävammojen kuusi välitöntä uhkaa, epätäydelliset selkäydinvammat, lantiorengasvammat ja lantiovyö, traumaattisen sydänpysähdyksen syyt, nestevasteen kolme kulkua, viestinnän portaat, Vortex-hengitystiesuppilo, aitio-oireyhtymä, atropiini, ondansetroni, lämmin vs. kylmä sokki, hengityskuviot), toimenpidesarjat (synnytyksen avustaminen, jälkeisvaihe), raskaudenaikaisten vuotojen kuvitus, Frank–Starling-nestevaste, iskemian eteneminen EKG:ssä, hoitoelvytyksen syklit ja päätösharjoitus, vastasyntyneen elvytyksen päätösharjoitus, lapsen elvytyksen annos- ja välinelaskuri, ulkoisen tahdistuksen kynnysvirtaharjoitus, hätäkrikotyreotomian maamerkit, painelutahdin harjoittelu, verikaasujen tulkinta- ja primaariluokitteluharjoitukset, traumatiimin arviointikolmio, EKG-rytmikirjasto tunnistusharjoituksella, laskurit (GCS, NEWS2, sokki-indeksi, QTc, CPP, Apgar, 9:n sääntö, kanadalainen kaularankasääntö, happivarat, kudosten hapentarjonta), kapnometrin ja CPAP-venttiilin tulkinta, synkronoitu rytminsiirto, kliinisen päättelyn monivalintaharjoitukset, annoslaskuharjoitukset, hoitokaaviot, aikajanat, muistisäännöt, yhdistelytehtävät ruotsin fraasisanasto ääntämisineen sekä jokaisen keskeisen aiheen Kohteessa-kortti (mitä pitää tietää, tutkia ja osata kohteessa)
- **Potilasmonitori** tapausharjoituksissa: pulssi- ja hengityskäyrä sekä vitaaliarvot vaihe vaiheelta tapauksen tekstin mukaan, hälytysvärit NEWS2-rajoista
- **Kuuntele**-toiminto: artikkelin voi kuunnella ääneen (laitteen oma puhesynteesi, toimii offline)
- Opiskelun eteneminen, suosikit ja tietovisatulokset tallentuvat laitteen `localStorage`iin — ei kirjautumista
- Asennettava PWA: toimii offline kerran ladattuasi sivuston, responsiivinen mobiilista työpöydälle

## Teknologia

- [Vite](https://vite.dev) + [React](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [react-router-dom](https://reactrouter.com) (HashRouter — toimii suoraan GitHub Pagesissa ilman palvelinkonfigurointia)
- [react-markdown](https://github.com/remarkjs/react-markdown) + `remark-gfm` artikkelien renderöintiin (mukautetut infolaatikot/calloutit)
- [Fuse.js](https://www.fusejs.io) sumeaan hakuun
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) offline-tukeen ja asennettavuuteen
- [lucide-react](https://lucide.dev) ikoneihin

Sisältö on kirjoitettu Markdownina ja JSON:ina `src/content/`-hakemistoon — ei erillistä CMS:ää tai backendia, koko sivusto on staattinen.

## Kehitys

```bash
npm install
npm run dev
```

## Tuotantoversion rakentaminen

```bash
npm run build
npm run preview   # esikatsele tuotantoversiota paikallisesti
```

Tuotantoversio syntyy `dist/`-hakemistoon.

## Julkaisu

Sivusto julkaistaan automaattisesti GitHub Pagesiin GitHub Actions -workflowlla (`.github/workflows/deploy.yml`) aina kun `main`-haaraan pushataan. Workflow buildaa projektin ja julkaisee `dist/`-kansion sisällön.

Jos haluat julkaista toiseen osoitteeseen tai forkata projektin, muuta `vite.config.ts`-tiedoston `base`-asetus vastaamaan omaa repositoriosi nimeä.

## Sisällön rakenne

```
src/content/
  types.ts        # TypeScript-tyypit
  modules.ts       # Aihealueiden (pääaiheiden) rekisteri
  topics.ts         # Kaikkien opassivujen rekisteri (id, otsikko, moduuli, ...)
  loader.ts          # Lataa artikkelit/tietovisat/kertauskortit/skenaariot
  articles/<id>.md    # Opasartikkeli per aihe (Markdown)
  quizzes/<id>.json    # Tietovisakysymykset per aihe
  flashcards/<id>.json  # Kertauskortit per aihe
  scenarios/<id>.json    # Potilastapausharjoitukset (vain tapaussivuille)
```

Artikkeleihin upotetaan interaktiivisia elementtejä ```` ```media ```` -lohkoilla, esim. `{"widget": "gcs"}`. Elementit ovat kansiossa `src/components/media/widgets/` (yksi tiedosto per elementti, ladataan vasta tarvittaessa) ja ne rekisteröidään tiedostoon `src/components/media/registry.ts`. Kirjoitusohjeet: `src/components/media/WIDGET_GUIDE.md`. `node scripts/validate-content.mjs` tarkistaa myös media-lohkot.

Uuden aiheen lisääminen: lisää rivi `src/content/topics.ts`-tiedostoon ja luo vastaavat tiedostot yllä olevaan rakenteeseen samalla `id`:llä.

## Lähdeaineisto ja tekijänoikeus

Sisältö on koottu ja kirjoitettu uudelleen opiskelijan omien Obsidian-muistiinpanojen pohjalta ensihoitaja (AMK) -opintoja varten. Julkaistuista oppikirjoista/kursseista peräisin olevaa materiaalia ei ole kopioitu sellaisenaan, vaan asiasisältö on syntetisoitu ja kirjoitettu omin sanoin. Materiaali ei korvaa virallista opetusta, hoito-ohjeita tai kliinistä harkintaa.
