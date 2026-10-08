# Ensihoito-opas

Interaktiivinen opiskelumateriaali ensihoitaja (AMK) -opiskelijalle. Sisältää aihekohtaiset opasartikkelit, kertauskortit (flashcardit), tietovisat, potilastapausharjoitukset ja tenttitilan — kaikki selaimessa, offline-tuella.

🔗 **Sivusto:** https://danielturunen.github.io/ensihoito-opiskelumateriaali/

## Mitä sisältää

- 16 aihealuetta, 57 aihesivua (hengitysvaikeus, trauma ja suuronnettomuus, sydän ja verenkierto, sokki, verikaasut, EKG:n iskemiatulkinta, elvytys ja anestesiaintubaatio, ympäristöperäiset hätätilat, tajuttomuus, lapsi ensihoidossa, raskaus ja synnytys, ikääntynyt potilas, ensihoidon johtaminen, lääkehoito ym.)
- Tietovisat jokaiselle aiheelle + erillinen **tenttitila**, jossa oikeat vastaukset paljastuvat vasta lopussa
- Kertauskortit yksinkertaisella Leitner-tyyppisellä kertausaikataululla
- Potilastapausharjoitukset (skenaariot), joissa edetään hälytystiedoista hoitopäätökseen
- Koko sisällön kattava haku
- **Oppimista tukeva multimedia** artikkelien sisällä (146 elementtiä, 61 tyyppiä): animoidut anatomia- ja mekanismikuvat (johtoratajärjestelmä, ilmarinta, keuhkorakkula, hengitystiet, sepelvaltimotauti, aortokavaalinen kompressio, insuliini ja ketoasidoosi, nitraatti + CPAP, sydäntamponaatio, atropiini, ondansetroni, lämmin vs. kylmä sokki, hengityskuviot), toimenpidesarjat (synnytyksen avustaminen, jälkeisvaihe), raskaudenaikaisten vuotojen kuvitus, Frank–Starling-nestevaste, iskemian eteneminen EKG:ssä, hoitoelvytyksen syklit, verikaasujen tulkinta- ja primaariluokitteluharjoitukset, EKG-rytmikirjasto tunnistusharjoituksella, laskurit (GCS, NEWS2, sokki-indeksi, QTc, CPP, Apgar, 9:n sääntö), annoslaskuharjoitukset, hoitokaaviot, aikajanat, muistisäännöt, yhdistelytehtävät ja ruotsin fraasisanasto ääntämisineen
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
