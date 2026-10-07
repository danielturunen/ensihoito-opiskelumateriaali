## Vammamekanismin tulkinta liikenneonnettomuudessa

Liikenneonnettomuus on Suomessa suurin yksittäinen syy vakaviin [tylppiin vammoihin](topic:tylppa-vamma). Erityispiirteenä on, että itse tapahtumatiedot – törmäysnopeus, auton korin vaurio, sinkoutuminen, turvalaitteiden toiminta – antavat usein enemmän tietoa vamman vakavuudesta kuin ensivaikutelma potilaasta. Tämän takia liikenneonnettomuuden vammapotilasta arvioidaan aina myös tapahtumapaikan ja ajoneuvon kunnon perusteella, ei vain näkyvien vammojen mukaan.

## Korkeaenergisen vammapotilaan kriteerit

> [!warning] Potilas luokitellaan korkeaenergiseksi, jos yksikin kriteeri täyttyy

**Peruselintoiminnon häiriö:** GCS alle 14 (päihtymys huomioiden), systolinen verenpaine alle 90 mmHg, hengitystaajuus alle 10 tai yli 29/min.

**Korkeaenergisen vamman löydös:** varstarinta, vähintään kahden pitkän luun murtuma, murskautunut raaja tai voimakas ulkoinen verenvuoto, raajan amputoituminen, lantiokaaren murtuma, kallonmurtuma, para- tai tetrapareesioireisto, kallon/olkavarren/reiden lävistävä vamma, merkittävä kasvovamma.

**Korkeaenergisen mekanismin kriteeri:** putoaminen yli 4 metriä, sinkoutuminen ulos autosta, kanssamatkustajan kuolema, auton korin kasaanpainuminen yli 40 cm, jalankulkijan tai pyöräilijän sinkoutuminen törmäyksessä, auton alle jääminen, moottoripyöräonnettomuus yli 40 km/h, vartalon voimakas puristuminen, räjähdysonnettomuus.

```media
{"widget":"checklist","title":"Onko potilas korkeaenerginen?","prompt":"Merkitse täyttyvät kriteerit – yksikin riittää.","rule":{"type":"any"},"items":[
{"label":"GCS alle 14 (päihtymys huomioiden)","group":"Peruselintoiminnon häiriö"},
{"label":"Systolinen verenpaine alle 90 mmHg","group":"Peruselintoiminnon häiriö"},
{"label":"Hengitystaajuus alle 10 tai yli 29/min","group":"Peruselintoiminnon häiriö"},
{"label":"Varstarinta","group":"Vamman löydös"},
{"label":"Vähintään kahden pitkän luun murtuma","group":"Vamman löydös"},
{"label":"Murskautunut raaja, raajan amputoituminen tai voimakas ulkoinen vuoto","group":"Vamman löydös"},
{"label":"Lantiokaaren tai kallon murtuma","group":"Vamman löydös"},
{"label":"Para- tai tetrapareesioireisto","group":"Vamman löydös"},
{"label":"Kallon, olkavarren tai reiden lävistävä vamma / merkittävä kasvovamma","group":"Vamman löydös"},
{"label":"Putoaminen yli 4 m","group":"Mekanismi"},
{"label":"Sinkoutuminen ulos autosta tai kanssamatkustajan kuolema","group":"Mekanismi"},
{"label":"Korin kasaanpainuminen yli 40 cm","group":"Mekanismi"},
{"label":"Jalankulkijan/pyöräilijän sinkoutuminen tai auton alle jääminen","group":"Mekanismi"},
{"label":"Moottoripyöräonnettomuus yli 40 km/h","group":"Mekanismi"},
{"label":"Vartalon voimakas puristuminen tai räjähdysonnettomuus","group":"Mekanismi"}
],
"met":{"title":"Korkeaenerginen vammapotilas","text":"Hoidetaan ja kuljetetaan korkeaenergisenä – suurienergisessä tylpässä monivammassa harkitse PTT-protokollaa.","tone":"danger"},
"notMet":{"title":"Kriteerit eivät täyty","text":"Jos tapahtumatietoja ei saada selville, potilasta kohdellaan korkeaenergisenä, kunnes toisin voidaan osoittaa.","tone":"neutral"}}
```

## Ajalliset tavoitteet

```media
{"widget":"timeline","title":"Ajalliset tavoitteet","items":[
{"time":"1 min","title":"Henkeä uhkaavan ulkoisen verenvuodon tyrehdytys","tone":"danger"},
{"time":"2 min","title":"Hengitystien avoimuus ja hengitys","tone":"warning"},
{"time":"< 10 min","title":"PTT-protokollan aloitus","tone":"brand"},
{"time":"10 min","title":"Kuljetus ambulanssista","text":"PTT: kuljetus alkaa 10 minuutin sisällä ambulanssiin siirtymisestä.","tone":"ok"}
]}
```

## Monivammapotilas ja PTT-protokolla

Monivammapotilas on potilas, jolla on vähintään kaksi vammaa, joista ainakin toinen on henkeä uhkaava. Hoitotaktiikka jaetaan karkeasti kahteen linjaan: **load and go** (lävistävä vamma, sisäelinvuoto – nopea kuljetus ratkaisevampaa kuin kentällä tehtävät toimenpiteet) ja **stay and play** (tajuton potilas, aivovamma – tilanne vaatii enemmän kentällä tehtävää stabilointia).

> [!tip] PTT (Prehospital Trauma Team) -protokolla
> PTT on tarkoitettu potilaille, joilla epäillään suurienergistä tylppää monivammaa. Tavoitteena on aloittaa kuljetus 10 minuutin sisällä ambulanssiin siirtymisestä.
>
> **Ensiarviossa** tehdään vain välttämättömät toimenpiteet: massiivisen verenvuodon tyrehdytys, ilmatien avaus ja ventilointi (jos hengitystaajuus alle 8/min). Hoitoreppu, happireppu ja defibrillaattori otetaan mukaan.
>
> **Ambulanssissa** roolit jaetaan: hengitys, passari, verenkierto ja traumajohtaja, jotka työskentelevät samanaikaisesti matkan aikana kuljetuksen viivästymättä.

## RiVaLAiSeR – systemaattinen tutkimisjärjestys

Kehon alueet tutkitaan kriittisyysjärjestyksessä:

- **Rintakehä:** näkyvät vammat, stabiilius, aristukset, krepitaatio, hengitysmekaniikka ja -äänet. Tyypillisiä vammoja ovat kylkiluun murtuma, keuhkoruhje, ilmarinta ja jänniteilmarinta ([ilmarinta](topic:ilmarinta)).
- **Vatsa:** näkyvät vammat, tunnustelu kauttaaltaan myös kylkikaarilta, aristukset, onko vatsa pehmeä vai kova.
- **Lantio:** kipu lantion seudussa, näkyvät vammat, alaraajojen pituusero tai rotaatio.
- **Aivot:** kallon ja kasvojen palpaatio, murtumalinjat, verenvuoto korvasta/nenästä, kallonpohjanmurtuman merkit (likvorvuoto, molemminpuoliset silmänalus- tai korvantaustamustelmat) – ks. [pään vamma](topic:paan-vamma).
- **Selkä:** silmämääräinen tarkistus blokkikäännön aikana, rankakivut, neurologiset puutosoireet.
- **Raajat:** harvoin yksinään henkeä uhkaavia, mutta pitkän luun murtuma voi vuotaa useita litroja. KKK-periaate: kylmä, kohotus, kompressi.

```media
{"widget":"body-map","title":"RiVaLAiSeR kehokartalla"}
```

## Sokki-indeksi

Sokki-indeksi auttaa tunnistamaan piilevän sokin, kun verenpaine on vielä kompensoitunut normaaliksi:

> [!info] Laskukaava
> Sokki-indeksi = syke ÷ systolinen verenpaine. Normaali on alle 0,9. Esimerkiksi syke 120/min ja systolinen verenpaine 80 mmHg antaa indeksin 1,5 – potilas on todennäköisesti sokissa. Jos syke on suurempi kuin systolinen verenpaine, sokki on todennäköinen.

```media
{"widget":"shock-index","caption":"Kokeile artikkelin esimerkkiä (syke 120, systolinen 80) ja etsi raja, jossa indeksi ylittää 0,9."}
```

70 kg painavan aikuisen verivolyymi on noin 5 litraa, ja aikuinen voi menettää noin 30 % verivolyymista ennen kuin verenpaine alkaa laskea – verenpaineen lasku on siis usein myöhäinen sokin merkki.

## Hoito ja immobilisaatio

Henkeä uhkaava raajan vuoto tyrehdytetään painamisella ja tarvittaessa kiristyssiteellä raajan tyveen.

> [!warning] Kiristyssiteen aikarajat
> Alle 2 tuntia: ei merkittävää haittaa. Alle 6 tuntia: ei yleensä pysyvää haittaa. 8 tunnin jälkeen: merkittävä amputaatioriski. 12 tunnin jälkeen: amputaatio todennäköinen. Aika on siis kriittinen tekijä, kun kiristysside on paikallaan pitkän kuljetusmatkan ajan.

```media
{"widget":"timeline","title":"Kiristyssiteen aikarajat","items":[
{"time":"< 2 h","title":"Ei merkittävää haittaa","tone":"ok"},
{"time":"< 6 h","title":"Ei yleensä pysyvää haittaa","tone":"brand"},
{"time":"8 h","title":"Merkittävä amputaatioriski","tone":"warning"},
{"time":"12 h","title":"Amputaatio todennäköinen","tone":"danger"}
]}
```

NEXUS-kriteerien lisäksi liikenneonnettomuudessa huomioidaan immobilisaation lisäkriteereinä: ikä alle 8 tai yli 65 vuotta, solisluun yläpuoliset vammat, ajonopeus yli 80 km/h, auton pyöriminen katon kautta, ajoneuvosta ulos sinkoutuminen, kuollut matkustaja ajoneuvossa, pään aksiaalinen vamma, putoaminen yli 3 metriä, moottoripyörä- tai raideliikenneonnettomuus. Tukikauluria ei käytetä aivovammapotilaalla, jonka GCS on alle 9, koska se nostaa kallonsisäistä painetta.

## Kuoleman kolmio ja traumaelvytys

> [!danger] Kuoleman kolmio
> Runsas verenvuoto käynnistää itseään ruokkivan kehän: koagulopatia (hyytymistekijät vähenevät), asidoosi (laktaatti nousee ja heikentää sydämen pumppausta) ja hypotermia (heikentää hyytymistä ja pumppausta edelleen). Kaikkia kolmea torjutaan samanaikaisesti – siksi lämmönhukan esto on yhtä tärkeää kuin verenvuodon tyrehdytys.

```media
{"widget":"death-triad"}
```

```media
{"widget":"mnemonic","title":"HOTT – traumaperäisen sydänpysähdyksen korjattavat syyt","name":"HOTT","items":[
{"letter":"H","word":"Hypotensio","text":"Vuoto: kiristyssiteet vammautuneisiin raajoihin, useat suoniyhteydet nestehoitoa/verituotteita varten."},
{"letter":"O","word":"O₂ – hapenpuute","text":"Hengitystien varmistaminen maksimaalisella lisähapella."},
{"letter":"T","word":"Tensiopneumothorax","text":"Molemminpuolinen neulatorakosenteesi."},
{"letter":"T","word":"Tamponaatio","text":"Sydäntamponaatio – matala verenpaine, takykardia, pullottavat kaulalaskimot."}
]}
```

Traumaperäisen sydänpysähdyksen yleisimmät korjattavat syyt muistetaan HOTT-muistisäännöllä: **H**ypotensio, **O**₂ (hapenpuute), **T**ensiopneumothorax ja **T**amponaatio. Elvytystoimiin kuuluvat kiristyssiteet kaikkiin mahdollisesti vammautuneisiin raajoihin, useat suoniyhteydet nestehoitoa/verituotteita varten, molemminpuolinen neulatorakosenteesi ja hengitystien varmistaminen maksimaalisella lisähapella. Elvytystä harkitaan, kun elottomuudesta on kulunut alle 15 minuuttia ja keho ei ole tuhoutunut.

## Kivunhoito

| Antotapa | Lääke ja annos |
|---|---|
| Intranasaalinen (ensiapu) | Fentanyyli 100–200 µg tai esketamiini 50–100 mg, jaettuna molempiin sieraimiin |
| Suonensisäinen | Fentanyyli 50–150 µg, oksikodoni 2–4 mg tai morfiini 2–4 mg |
| Suonensisäinen (hypotensiivinen) | Esketamiini 12,5 mg, ensihoitolääkärin konsultaatiolla |

Kivunhoito on aiheellinen, kun kipu (NRS) on yli 4.

## Muista tämä -kertaus

- Liikenneonnettomuudessa tapahtumatiedot (nopeus, korin vaurio, sinkoutuminen) kertovat usein enemmän vamman vakavuudesta kuin ensivaikutelma.
- Korkeaenergisen potilaan kriteerit jakautuvat kolmeen ryhmään: peruselintoiminnon häiriö, korkeaenergisen vamman löydös ja korkeaenergisen mekanismin kriteeri – yksikin riittää luokitukseen.
- PTT-protokolla tähtää kuljetuksen aloittamiseen 10 minuutin sisällä suurienergisessä tylpässä monivammassa.
- RiVaLAiSeR-menetelmä tutkii kehon kriittisyysjärjestyksessä: rintakehä, vatsa, lantio, aivot, selkä, raajat.
- Sokki-indeksi (syke ÷ systolinen verenpaine) yli 0,9 viittaa piilevään sokkiin, vaikka verenpaine olisi vielä normaali.
- Kuoleman kolmio (koagulopatia, asidoosi, hypotermia) ja HOTT-muistisääntö (hypotensio, hapenpuute, tensiopneumothorax, tamponaatio) ohjaavat traumaelvytyksen ajattelua.
