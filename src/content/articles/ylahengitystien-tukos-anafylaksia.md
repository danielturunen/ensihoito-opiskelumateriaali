## Miksi tämä aihekokonaisuus on vaarallinen

Ylähengitystien tukos ja anafylaksia (vaikea allerginen yleisreaktio) ovat tyypillisiä tilanteita, joissa potilas voi huonontua minuuteissa, vaikka alkutilanne näyttäisi vielä hallittavalta. Molemmissa ongelma voi edetä täydelliseksi ilmatien sulkeutumiseksi, ja anafylaksiassa siihen yhdistyy samanaikaisesti verenkierron romahdus. Ensihoitajan tärkein tehtävä on tunnistaa riski ajoissa, rauhoittaa tilanne ja käynnistää oikea hoito viivyttelemättä.

> [!danger] Henkeä uhkaava
> Näissä tiloissa kysymys ei ole vain "onko ilmatie auki nyt", vaan "pysyykö se auki seuraavat minuutit". Tilanne voi muuttua katastrofaaliseksi hyvinkin nopeasti.

## Epiglottiitti — kurkunkannen turvotus

Epiglottiitissa kurkunkansi (epiglottis) ja sitä ympäröivät kudokset turpoavat, usein infektion seurauksena. Ongelma ei ole vain kipu, vaan nopeasti etenevä riski ylähengitystien täydellisestä tukkeutumisesta.

Tyypillisiä löydöksiä: kova kurkkukipu, nielemisvaikeus, kuolaaminen, äänen muutos, stridor, voimakas ahdistuneisuus. Potilas haluaa usein istua pystyasennossa, koska se helpottaa hengitystä.

> [!warning] Red flag
> Epiglottiitissa vältä turhaa ilmatien ärsyttämistä, potilaan pakottamista makuulle ja kaikkia toimenpiteitä, jotka lisäävät ahdistusta — ahdistus ja itku voivat nopeuttaa tukkeutumista.

Ensihoidon painopiste on rauhoittaa ympäristö, antaa potilaan olla itselleen parhaassa asennossa, valmistautua nopeaan huononemiseen ja kuljettaa päivystykseen, jossa on valmius vaativaan ilmatiehoitoon.

## Vierasesine hengitysteissä

Täydellinen tukos estää ilman kulun lähes kokonaan, kun osittaisessa tukoksessa potilas voi yskiä ja saada edelleen jonkin verran ilmaa. Täydellisen tukoksen merkkejä ovat äkillinen alku, tukehtumisen eleet, puhumattomuus tai erittäin heikko puhe, tehoton yskiminen ja syanoosi.

Ensihoidossa arvioidaan nopeasti, onko tukos täydellinen vai osittainen, ja toimitaan tilanteen vaikeusasteen mukaan. Tajuttoman potilaan kohdalla siirrytään elvytys- ja ilmatiealgoritmien mukaisesti. Kuljetus päivystykseen on tarpeen myös onnistuneen vierasesineen poiston jälkeen, jos epäillään jäännösmateriaalia tai aspiraatiota.

```media
{"widget":"choking"}
```

## Anafylaksia — ilmatie- ja verenkiertohätätila yhtä aikaa

Anafylaksia on äkillinen, nopeasti etenevä ja hengenvaarallinen yleistynyt allerginen reaktio. Se syntyy, kun elimistö altistuu aineelle, jolle se on herkistynyt, ja syöttösolut vapauttavat hetkessä suuren määrän histamiinia ja muita välittäjäaineita. Tästä seuraa kolme samanaikaista ilmiötä:

1. Laaja-alainen verisuonten laajeneminen ja läpäisevyyden lisääntyminen → verenpaine laskee (distributiivinen sokki, eli verisuonten liiallisesta laajenemisesta johtuva verenkierron romahdus).
2. Keuhkoputkien supistuminen (bronkospasmi) → hengitys vaikeutuu.
3. Voimakas turvotus iholla ja limakalvoilla, erityisesti ylähengitysteissä → kurkunpää voi turvota lähes kiinni.

```media
{"widget":"flow","title":"Anafylaksian mekanismi","steps":[
{"title":"Altistus aineelle, jolle elimistö on herkistynyt","tone":"neutral"},
{"title":"Syöttösolut vapauttavat hetkessä histamiinia ja muita välittäjäaineita","tone":"warning","branches":[
{"label":"Verisuonet","title":"Laajenevat ja vuotavat","text":"Verenpaine laskee – distributiivinen sokki.","tone":"danger"},
{"label":"Keuhkoputket","title":"Bronkospasmi","text":"Hengitys vaikeutuu, vinkuna.","tone":"danger"},
{"label":"Iho ja limakalvot","title":"Voimakas turvotus","text":"Kurkunpää voi turvota lähes kiinni.","tone":"danger"}
]},
{"title":"Adrenaliini katkaisee kaikki kolme","text":"Supistaa verisuonia (nostaa verenpainetta), laajentaa keuhkoputkia, vähentää turvotusta ja estää lisävälittäjäaineiden vapautumista. Annos hoito-ohjeen ja painon mukaan.","tone":"ok"}
]}
```

Tyypillisiä oireita ovat kurkun turvotuksen tunne, äänen muutos, hengenahdistus, nokkosihottuma (urtikaria) ja muut ihoreaktiot, verenpaineen lasku, huimaus tai kollapsi.

Diagnoosi perustuu oireisiin vähintään kahdessa elinjärjestelmässä (iho, hengitys, verenkierto, maha-suolikanava).

```media
{"widget":"checklist","title":"Täyttyykö anafylaksian kriteeri?","prompt":"Merkitse potilaalla havaitut oireet.","rule":{"type":"groups","n":2},"items":[
{"label":"Nokkosihottuma (urtikaria) tai muu ihoreaktio","group":"Iho ja limakalvot"},
{"label":"Kasvojen tai limakalvojen turvotus","group":"Iho ja limakalvot"},
{"label":"Kurkun turvotuksen tunne, äänen muutos tai stridor","group":"Hengitys"},
{"label":"Hengenahdistus tai vinkuna","group":"Hengitys"},
{"label":"Verenpaineen lasku, huimaus tai kollapsi","group":"Verenkierto"},
{"label":"Maha-suolikanavan oireet","group":"Maha-suolikanava"}
],
"met":{"title":"Oireita vähintään kahdessa elinjärjestelmässä – epäile anafylaksiaa","text":"Anna adrenaliini viipymättä – älä odota kaikkien oireiden ilmaantumista. Kaikki anafylaksiapotilaat kuljetetaan seurantaan (bifaasinen reaktio).","tone":"danger"},
"notMet":{"title":"Oireita alle kahdessa elinjärjestelmässä","text":"Seuraa tiiviisti – tila voi edetä minuuteissa.","tone":"neutral"}}
```

> [!danger] Henkeä uhkaava
> Anafylaksiassa potilas voi puhua vielä alkuvaiheessa, mutta tila voi romahtaa nopeasti. Hengitystien ja verenkierron tilaa on seurattava jatkuvasti.

### Hoito vaikeusasteen mukaan

Anafylaksian hoito porrastetaan oirekuvan mukaan:

| Vaikeusaste | Keskeisiä löydöksiä | Hoidon painopiste |
|---|---|---|
| Lievä | Urtikaria, limakalvojen kutina, ei hengitys- tai verenkierto-oireita | Antihistamiini ja kortisoni, seuranta |
| Keskivaikas | Vinkuna, hengenahdistus, verenpaine normaali | Inhaloitava keuhkoputkia avaava lääke, kortisoni, adrenaliini i.m. jos oireet pahenevat |
| Vaikea (anafylaksia) | Hypotensio, stridor tai vaikea hengitysvaikeus, tajunnan lasku | Adrenaliini välittömästi lihakseen, nesteytys, happi, kortisoni, antihistamiini |

> [!tip] Muista tämä
> Jos epäilet anafylaksiaa, anna adrenaliini viipymättä — älä odota kaikkien oireiden ilmaantumista. Adrenaliinin viivästyttäminen tai sen korvaaminen antihistamiinilla ja kortisonilla on yleisin ja vaarallisin virhe anafylaksian hoidossa.

Adrenaliini on anafylaksian tärkein lääke, koska se supistaa verisuonia (nostaa verenpainetta), laajentaa keuhkoputkia ja vähentää turvotusta sekä estää lisävälittäjäaineiden vapautumista. Annostelu ja tarkka annos vaihtelevat hoito-ohjeen ja potilaan painon mukaan — toimi aina paikallisen hoito-ohjeen mukaisesti.

Asentohoito valitaan oirekuvan mukaan: matalassa verenpaineessa potilas makuulle jalat koholla, hengitysvaikeudessa vakaalla verenpaineella puoli-istuvaan asentoon.

### Bifaasinen reaktio ja kuljetus

Anafylaksian oireet voivat uusiutua useita tunteja alkuoireiden helpottamisen jälkeen (bifaasinen reaktio). Tämän vuoksi kaikki anafylaksiapotilaat kuljetetaan sairaalaseurantaan vaikeusasteesta riippumatta — myös silloin, kun oireet ovat hetkellisesti helpottaneet.

## Yleinen lähestymistapa kentällä: ABCD

Ylähengitystien tukoksen ja anafylaksian arviointi kannattaa käydä systemaattisesti läpi:

- **Hengitystie:** Stridor? Käheys? Nielemisvaikeus? Turvotus?
- **Hengitys:** Vinkuna? Hengenahdistus? Syanoosi? Saturaatio?
- **Verenkierto:** Hypotensio? Takykardia? Sokin merkit? Kalpeus?
- **Tajunta/iho:** Tajunnantaso? Ihottuma? Kasvojen turvotus?

Tarkemman peruselintoimintojen arviointimallin löydät sivulta [ABCDE ja peruselintoimintojen arviointi](topic:abcde-arviointi).

## Kuljetuspäätös

Selvä ylähengitystien uhka — stridor, kuolaaminen, äänen muutos, nielemiskyvyttömyys, epäily anafylaksiasta, tajunnantason lasku ilmatien suojauksen pettäessä, merkittävästi lisääntynyt hengitystyö, syanoosi tai nopeasti paheneva oirekuva — kuuluu aina päivystykseen, ei terveysasemalle. Terveysasematasoinen arvio voi tulla kyseeseen ainoastaan, jos oire on lievä, hengitystie on varmasti avoin ja potilas pysyy vakaana koko arvion ajan.

## Muista tämä -kertaus

- Epiglottiitissa vältä ilmatien ärsyttämistä ja potilaan pakottamista makuulle.
- Vierasesinetukoksessa arvioi nopeasti, onko tukos täydellinen vai osittainen, ja toimi algoritmin mukaan.
- Anafylaksia on sekä ilmatie- että verenkiertohätätila — oireet vähintään kahdessa elinjärjestelmässä.
- Adrenaliini on anafylaksian tärkein lääke, anna se viipymättä vaikeassa reaktiossa.
- Bifaasinen reaktio voi tulla tuntien viiveellä — kaikki anafylaksiapotilaat kuljetetaan seurantaan.
- Selvä yläilmatien uhka kuuluu aina päivystykseen.
