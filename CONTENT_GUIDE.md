# Sisällöntuotanto-ohje (content authoring guide)

Tämä ohje määrittää, miten opiskelusisältö kirjoitetaan tähän projektiin. Lue tämä kokonaan ennen kirjoittamista.

## Kohderyhmä ja sävy

Kirjoitat ensihoitaja (AMK) -opiskelijalle. Kieli on selkeää suomea. Lääketieteelliset termit saa säilyttää, mutta selitä ne heti ymmärrettävästi (esim. "takykardia (tihentynyt syke)"). Tavoite: opiskelija ymmärtää ilmiön patofysiologian pääpiirteet, osaa tunnistaa hälyttävät löydökset (red flags) ja tietää ensihoidon toimintaperiaatteet. Älä kirjoita kuin oppikirja luennolle — kirjoita kuin hyvä opiskeluopas: tiivis, jäsennelty, helppo silmäillä ja kerrata.

## Lähteet ja tekijänoikeus — TÄRKEÄÄ

Saat lukemiisi lähdetiedostoihin kuuluu myös otteita julkaistuista oppikirjoista ja kursseista (esim. "Vammautuminen" Peräjoki & Azbel, European Trauma Course -käsikirja, "Peanut Paramedic" -blogin vinkkilistat). **Älä koskaan kopioi näiden tekstiä sellaisenaan.** Lue lähde, ymmärrä asiasisältö, ja kirjoita se kokonaan omin sanoin, omaan rakenteeseesi. Faktat (esim. hoitoperiaatteet, raja-arvot) eivät ole tekijänoikeuden alaisia — vain tekstin tarkka ilmaisu on. Sama koskee kaikkea muuta lähdeaineistoa: syntetisoi, älä kopioi liuskakaupalla.

Jos eri lähdetiedostoissa on ristiriitaisia lukuarvoja tai käytäntöjä (esim. eri annosmäärä), valitse yleisimmin toistuva/maininta, ja jos et pysty ratkaisemaan ristiriitaa, mainitse asia lyhyesti tekstissä ("käytäntö voi vaihdella hoito-ohjeen mukaan") sen sijaan että keksit tarkkaa lukua. Älä keksi uusia lääketieteellisiä faktoja joita lähteissä ei ole eikä jotka eivät ole yleisesti tunnettua ensihoito-oppia.

## Tiedostorakenne per aihe

Jokaiselle `src/content/topics.ts`-rekisterin aihe-id:lle kirjoitat 1-4 tiedostoa. Käytä **täsmälleen** rekisterissä annettua id:tä tiedostonimenä.

### 1. Artikkeli (pakollinen kaikille) — `src/content/articles/<id>.md`

Puhdasta Markdownia, EI frontmatteria (otsikko/kuvaus tulee jo rekisteristä). Rakenne:

- Aloita `## `-tason otsikoilla (ei `#`, koska sivun oma H1 renderöidään erikseen otsikkotiedoista).
- Käytä lyhyitä kappaleita, luetteloita ja **taulukoita** kun data on vertailevaa (esim. lääkeannokset, erotusdiagnostiikka).
- Erikoislaatikot (callout) Obsidian-tyylisellä syntaksilla, jonka sovellus osaa renderöidä:
  ```
  > [!tip] Muista tämä
  > Lyhyt, iskevä muistisääntö tai kliininen helmi.

  > [!warning] Red flag
  > Hälyttävä löydös, joka vaatii välitöntä reagointia.

  > [!danger] Henkeä uhkaava
  > Tila joka vaatii peruselintoimintoja turvaavan toimenpiteen heti.

  > [!info] Tausta
  > Patofysiologinen tausta tai lisätieto joka ei ole kriittistä muistaa heti.
  ```
  Käytä noin 2-5 calloutia per artikkeli, siellä missä ne oikeasti auttavat — älä täytä joka kappaletta laatikolla.
- Jos viittaat toiseen opastosivuun, käytä linkkimuotoa `[näkyvä teksti](topic:<toisen-sivun-id>)` (EI tavallista URL:ia, sovellus kääntää tämän sisäiseksi reitiksi). Käytä vain id:tä jotka löytyvät `src/content/topics.ts`-tiedostosta.
- Pituus: noin 600-1400 sanaa per artikkeli riippuen aiheen laajuudesta (lyhyemmät lääkekortit n. 250-400 sanaa).
- Lopeta artikkeli **aina** `## Muista tämä -kertaus`-osiolla: 3-6 ranskalaista viivaa tiivistäen koko sivun tärkeimmät pointit nopeaan kertaukseen.

### 2. Monivalintatehtävät — `src/content/quizzes/<id>.json`

```json
[
  {
    "id": "<id>-q1",
    "type": "mcq",
    "question": "Kysymysteksti?",
    "options": ["Vaihtoehto A", "Vaihtoehto B", "Vaihtoehto C", "Vaihtoehto D"],
    "correctIndex": 2,
    "explanation": "Lyhyt selitys miksi tämä on oikein ja miksi muut ovat vääriä."
  },
  {
    "id": "<id>-q2",
    "type": "truefalse",
    "question": "Väittämä joka on tosi tai epätosi.",
    "options": ["Oikein", "Väärin"],
    "correctIndex": 0,
    "explanation": "Lyhyt selitys."
  }
]
```

Tee **8-12 kysymystä** per aihe, sekoitus `mcq` (4 vaihtoehtoa) ja `truefalse`. Vaihtele vaikeustasoa. `explanation`-kenttä on pakollinen ja opettavainen, ei vain "Oikein koska näin on".

### 3. Flashcardit — `src/content/flashcards/<id>.json`

```json
[
  { "id": "<id>-f1", "front": "Termi tai kysymys", "back": "Selitys tai vastaus" }
]
```

Tee **10-18 korttia** per aihe. `front` on lyhyt (termi, kysymys, tai "Mikä on X:n annos?"), `back` on tiivis vastaus (1-3 lausetta).

### 4. Skenaario (vain case-sivuille, ks. rekisteri `hasScenario: true`) — `src/content/scenarios/<id>.json`

```json
{
  "id": "<id>",
  "title": "Tapauksen otsikko",
  "dispatchCode": "703",
  "intro": "Hälytystiedot: mitä hätäkeskus kertoo yksikölle matkalla kohteeseen.",
  "steps": [
    {
      "id": "step1",
      "situation": "Mitä ensihoitaja havaitsee/löytää tässä vaiheessa (esim. ensivaikutelma, tilannekuva).",
      "question": "Mitä teet seuraavaksi / mikä on tärkein havainto nyt?",
      "choices": [
        { "text": "Vaihtoehto", "correct": true, "feedback": "Miksi tämä on paras valinta." },
        { "text": "Vaihtoehto", "correct": false, "feedback": "Miksi tämä ei ole paras valinta / mitä riskiä se sisältää." },
        { "text": "Vaihtoehto", "correct": false, "feedback": "..." }
      ]
    }
  ],
  "debrief": "Yhteenveto tapauksen opetuksesta, 3-5 lausetta."
}
```

Tee **4-6 askelta** per skenaario, jotka etenevät loogisesti (hälytys → ensivaikutelma → ABCDE-löydökset → hoitopäätös → kuljetuspäätös/konsultaatio). Jokaisessa askeleessa 3 vaihtoehtoa, tasan yksi `correct: true`.

## Tyyli- ja laatuvaatimukset

- Älä käytä samaa sanamuotoa kuin lähdetiedosto pitkissä pätkissä — kirjoita uudelleen.
- Yhtenäistä termistö koko sivuston laajuudelta: käytä esim. aina "ensihoitaja" (ei "sairaankuljettaja" paitsi historiallisessa kontekstissa), "potilas", "ABCDE", "GCS", "ensihoitopalvelu".
- Tarkista lukujen järkevyys (esim. lääkeannokset mg/kg) ennen kirjoittamista — jos lähde on epäselvä, ilmaise se tekstissä sen sijaan että arvaat tarkan luvun.
- JSON-tiedostojen täytyy olla validia JSON:ia (ei kommentteja, ei trailing commaa).
- Kirjoita tiedostot UTF-8:lla, suomen kielen erikoismerkit (ä, ö, å) suoraan, ei HTML-entiteetteinä.

## Kun olet valmis

Kun olet kirjoittanut kaikki sinulle määrätyt sivut, tarkista:
- Jokaiselle id:lle löytyy `articles/<id>.md`
- `hasQuiz: true` id:ille löytyy `quizzes/<id>.json`
- `hasFlashcards: true` id:ille löytyy `flashcards/<id>.json`
- `hasScenario: true` id:ille löytyy `scenarios/<id>.json`
- Kaikki JSON validoituu (esim. `node -e "JSON.parse(require('fs').readFileSync('tiedosto.json','utf8'))"`)
