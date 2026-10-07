## Miksi strukturoituja malleja tarvitaan

Kiireellisessä tilanteessa tiedon on kulettava nopeasti ja virheettömästi ensihoitajalta toiselle, hätäkeskukseen, konsultoivalle lääkärille ja vastaanottavaan hoitoyksikköön. Ilman yhteistä rakennetta olennaista tietoa jää helposti kertomatta, ja sama asia saatetaan kysyä moneen kertaan. Strukturoidut mallit – SOAP, AMPLE, ISBAR, NEWS2 ja GCS – ovat kieliä, jotka kaikki terveydenhuollon ammattilaiset ymmärtävät samalla tavalla riippumatta siitä, missä yksikössä he työskentelevät.

## SOAP – potilaskertomuksen ja ajattelun runko

SOAP jäsentää sekä kliinisen päättelyn että kirjaamisen neljään osaan:

- **S – Subjektiivinen:** se mitä potilas itse kertoo – oireet, niiden kulku, lääkitys, allergiat
- **O – Objektiivinen:** se mitä mitataan tai havaitaan – vitaalit, tutkimuslöydökset, EKG, verensokeri
- **A – Analyysi:** subjektiivisen ja objektiivisen tiedon yhdistäminen erotusdiagnostisiksi vaihtoehdoiksi ja riskiarvioksi
- **P – Suunnitelma:** mitä tehdään seuraavaksi – hoito, kuljetuspäätös, seuranta, turvaverkko

> [!info] Tausta
> SOAP ei ole vain raportointimalli – se pakottaa etenemään järjestyksessä tiedon keruusta johtopäätökseen, eikä anna hypätä suoraan "tuntumaan" ennen kuin tiedot on käyty läpi.

## AMPLE – nopea esitietojen kartoitus

AMPLE täydentää oirekohtaista haastattelua (ks. [SOCRATES](topic:socrates-kivun-arviointi)) laajemmalla potilastaustalla:

| Kirjain | Tarkoittaa | Mitä selvitetään |
|---|---|---|
| A | Allergiat | Lääke-, ruoka- ja muut allergiat, aiempi reaktio |
| M | Medikaatio | Säännölliset ja äskettäin otetut lääkkeet, muutokset annoksissa |
| P | Potilashistoria | Krooniset sairaudet, leikkaukset, psykiatrinen ja sukuhistoria |
| L | Last meal | Viimeisin ateria – tärkeä diabeetikoilla ja ennen mahdollista toimenpidettä |
| E | Events | Mitä tapahtui juuri ennen oireiden alkua |

## ISBAR – strukturoitu raportointi

ISBAR on vakiintunut tapa välittää potilastieto suullisesti niin, että vastaanottaja saa olennaisen tiedon oikeassa järjestyksessä – käytetään hätäkeskusilmoituksissa, lääkärikonsultaatioissa ja potilaan luovutuksessa vastaanottavaan yksikköön.

- **I – Identify:** kuka olet, mistä soitat/raportoit, kuka potilas on
- **S – Situation:** mikä on tilanne juuri nyt lyhyesti ("miksi soitan")
- **B – Background:** olennainen tausta – esitiedot, tapahtuman kulku, lääkitys
- **A – Assessment:** omat löydökset ja arvio tilanteesta (ABCDE-löydökset, epäilty syy)
- **R – Recommendation:** mitä toivot tapahtuvan seuraavaksi – konsultaatio, vastaanottava yksikkö, kiireellisyys

```media
{"widget":"mnemonic","title":"ISBAR – harjoittele raportin rakenne","name":"ISBAR","items":[
{"letter":"I","word":"Identify – tunnistaminen","text":"Kuka olet, mistä raportoit, kuka potilas on."},
{"letter":"S","word":"Situation – tilanne","text":"Mikä on tilanne juuri nyt lyhyesti – miksi soitat."},
{"letter":"B","word":"Background – tausta","text":"Esitiedot, tapahtuman kulku, lääkitys."},
{"letter":"A","word":"Assessment – arvio","text":"Omat löydökset (ABCDE) ja epäilty syy."},
{"letter":"R","word":"Recommendation – toive","text":"Mitä toivot seuraavaksi: konsultaatio, vastaanottava yksikkö, kiireellisyys. Sano ääneen."}
]}
```

> [!tip] Muista tämä
> ISBAR-raportti kannattaa harjoitella niin, että Assessment- ja Recommendation-osat ovat selkeät ja lyhyet. Kuulija muistaa raportin alun ja lopun parhaiten – siksi juuri lopussa esitetty suositus on tärkeä sanoa ääneen, ei vain vihjata.

## NEWS2 – varhaisen hälytyksen pisteytys

NEWS2 (National Early Warning Score 2) on pisteytysjärjestelmä, joka yhdistää kuusi vitaaliparametria yhdeksi kokonaispisteeksi ja auttaa tunnistamaan elintoimintojen heikkenemisen ennen kuin potilas on silminnähden huonokuntoinen. Pisteet annetaan hengitystaajuudesta, happisaturaatiosta, lisähapen käytöstä, verenpaineesta, sykkeestä, tajunnan tasosta ja lämpötilasta – mitä kauempana parametri on normaalista, sitä enemmän pisteitä se saa.

| Parametri | Matala poikkeama | Normaali | Korkea poikkeama |
|---|---|---|---|
| Hengitystaajuus | ≤8/min (3 p) | 12–20/min (0 p) | ≥25/min (3 p) |
| Happisaturaatio | ≤91 % (3 p) | ≥96 % (0 p) | – |
| Systolinen verenpaine | ≤90 mmHg (3 p) | 111–219 mmHg (0 p) | ≥220 mmHg (3 p) |
| Syke | ≤40/min (3 p) | 51–90/min (0 p) | ≥131/min (3 p) |
| Tajunta | – | Hereillä (0 p) | Uusi sekavuus (3 p) |
| Lämpötila | ≤35,0 °C (3 p) | 36,1–38,0 °C (0 p) | ≥39,1 °C (2 p) |

Kokonaispisteet ohjaavat toimintaa: matala pistemäärä tarkoittaa normaalia seurantaväliä, keskitason pistemäärä tihennettyä seurantaa ja lääkärin konsultaatiota, ja korkea pistemäärä edellyttää välitöntä arviota ja usein kiireellistä kuljetusta.

```media
{"widget":"news2","caption":"Kokeile: muuta yhtä parametria kerrallaan ja katso, miten pisteet ja toimintasuositus muuttuvat."}
```

> [!warning] Red flag
> Yksittäinenkin parametri, joka saa korkeimman pistemäärän (esim. hengitystaajuus ≥25/min), riittää nostamaan koko tilanteen kiireelliseksi – vaikka kokonaispistemäärä muuten näyttäisi maltilliselta. Tarkat pisterajat ja toimintaohjeet voivat vaihdella käytössä olevan hoito-ohjeen mukaan.

## GCS – tajunnan tason pisteytys

Glasgow Coma Scale (GCS) tarkentaa AVPU-seulan antaman kuvan tajunnasta kolmella osa-alueella: silmien avaaminen (1–4 pistettä), puhevaste (1–5 pistettä) ja liikevaste (1–6 pistettä). Kokonaispisteet vaihtelevat 3:sta (ei reagoi lainkaan) 15:een (täysin orientoitunut).

| Osa-alue | Parhaat pisteet | Huonoimmat pisteet |
|---|---|---|
| Silmien avaaminen (4) | Avaa spontaanisti | Ei avaa lainkaan |
| Puhevaste (5) | Orientoitunut | Ei äänteitä |
| Liikevaste (6) | Noudattaa kehotuksia | Ei liikevastetta |

> [!danger] Henkeä uhkaava
> GCS 8 tai alle tarkoittaa, että potilas ei kykene itse pitämään hengitystietään auki luotettavasti – tämä on raja, jolloin hengitystien hallinta nousee ensisijaiseksi huoleksi ([ABCDE](topic:abcde-arviointi)).

GCS on herkkä muutoksille: pisteiden lasku jo kahdella pisteellä tunnin aikana on merkittävä hälytysmerkki, vaikka kokonaispistemäärä pysyisi vielä kohtuullisena.

```media
{"widget":"gcs"}
```

## Muita oirekohtaisia arviointimalleja

Monille yksittäisille oireille on omat, kyseiseen oireeseen räätälöidyt muistisäännöt, jotka täydentävät yleisiä malleja. Niitä ei kannata opetella päällekkäin SOCRATES:in kanssa, mutta on hyvä tietää, että niitä on olemassa:

| Oire | Muistisääntö |
|---|---|
| Hengenahdistus | BREATH (tausta, oireiden alku, pahentavat/helpottavat tekijät, liitännäisoireet, ajoitus, hoitohistoria) |
| Tajunnanmenetys/kollapsi | FAINT (tapahtuman piirteet, liitännäisoireet, vammat, neurologinen historia, laukaisijat) |
| Allerginen reaktio | RACER (reaktion alku, hengitystien osallistuminen, verenkierto-oireet, altistus, hengitysoireet) |
| Kouristus | CAPTURED (piirteet, toiminta ennen/jälkeen, historia, ajoitus, virtsaamiseen liittyvät merkit, lääkitys, interventiot, todistajat) |
| Heikkous/aivohalvaus | STROKE (oireen alku, tyyppi, riskitekijät, muut oireet, taustasairaudet, löydökset) |
| Lapsipotilas | PAEDIATRIC (asento, ulkonäkö, hengitystyö, nestetasapaino, infektion merkit, hengitystie, lämpötila, hengitystaajuus, nesteytys, verenkierto) |
| Raskaus | PREGNANT (synnytyshistoria, oireet, tapahtumat, gestaatio, oireiden luonne, taustasairaudet, neurologiset oireet, ajoitus) |

```media
{"widget":"matching","title":"Yhdistä malli käyttötarkoitukseen","pairs":[
{"left":"SOAP","right":"Kliinisen päättelyn ja kirjaamisen runko"},
{"left":"AMPLE","right":"Nopea esitietojen kartoitus"},
{"left":"ISBAR","right":"Suullinen raportointi ja konsultaatio"},
{"left":"NEWS2","right":"Elintoimintojen heikkenemisen varhainen tunnistus"},
{"left":"GCS","right":"Tajunnan tason pisteytys"},
{"left":"SOCRATES","right":"Kivun jäsennelty haastattelu"}
]}
```

## Muista tämä -kertaus

- SOAP jäsentää ajattelun ja kirjaamisen: Subjektiivinen, Objektiivinen, Analyysi, Suunnitelma.
- AMPLE kartoittaa nopeasti potilaan taustan: Allergiat, Medikaatio, Potilashistoria, Last meal, Events.
- ISBAR jäsentää suullisen raportoinnin: Identify, Situation, Background, Assessment, Recommendation.
- NEWS2 yhdistää kuusi vitaaliparametria yhdeksi pistemääräksi, joka ohjaa seurannan ja konsultaation kiireellisyyttä.
- Yksittäinenkin NEWS2-parametrin äärilukema voi riittää nostamaan tilanteen kiireelliseksi, vaikka kokonaispisteet olisivat maltilliset.
- GCS tarkentaa tajunnan tasoa kolmella osa-alueella (silmät, puhe, liike); GCS ≤8 on raja, jolloin hengitystien hallinta nousee ensisijaiseksi.
