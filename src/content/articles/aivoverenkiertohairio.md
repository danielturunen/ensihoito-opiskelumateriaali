## Aika on aivoja

Ensihoidon päätavoite on tunnistaa ne aivoverenkiertohäiriöpotilaat, jotka hyötyvät kiireellisestä hoidosta, ja kuljettaa heidät mahdollisimman nopeasti sairaalaan, jossa on pään kuvantaminen ja neurologinen osaaminen. Korjaavaa hoitoa – liuotusta tai trombektomiaa – ei voi antaa ennen pään tietokonekuvausta, joten **kohteessa käytetty aika pidetään minimissä: alle 20 minuuttia** (Martikainen, Duodecim Ensihoito-opas 2023).

- **Liuotushoito** pyritään aloittamaan **90 minuutin kuluessa** oireiden alusta lähimmässä liuotusta antavassa päivystyksessä.
- **Trombektomia** kohdennetaan ensisijaisesti omatoimisille (mRS ≤ 3) potilaille, joilla epäillään suuren suonen tukosta, sekä tilanteisiin, joissa liuotuksen aikaikkuna (9 h) on sulkeutunut. Hoitopaikkana on yliopistosairaala.
- **Halvausoireisiin herännyt** omatoiminen potilas on hoitoon soveltuva aikaikkunasta riippumatta (enintään 24 h oireiden epäillystä alusta).
- Jos kuljetus kestää yli tunnin, harkitaan **helikopteria** – sitä ei kuitenkaan jäädä odottamaan kohteeseen, ellei siitä erikseen sovita.

Uudet AVH-löydökset saanut, aiemmin omatoiminen potilas kuljetetaan kiireellisesti (varausaste A). Oleellista jatkohoidon kannalta on selvittää **oireiden alkamisaika** (milloin potilas on viimeksi nähty oireettomana) ja **aiempi toimintakyky**.

```media
{"widget":"stroke-window","caption":"Säädä aikaa ja potilaan tietoja – näet, mihin Ensihoito-opas ohjaa potilaan."}
```

## Tunnistaminen

Keskeistä on toispuolisen raajojen ja kasvolihasten heikkouden sekä puheentuottohäiriön havaitseminen. Lisäksi tutkitaan tajunnan taso, pupillien koko ja valoreaktio sekä kipureaktion puolierot.

```media
{"widget":"checklist","title":"Neurologinen pikatutkimus","prompt":"Merkitse havaitut löydökset.","rule":{"type":"any"},"items":[
{"label":"Suupieli roikkuu – \"Irvistäkää.\""},
{"label":"Yläraaja painuu – kädet ylös 10 s (makuulla 45°, istuen 90°), puristusvoima"},
{"label":"Puheentuotto häiriintynyt – \"Sanokaa: Mustan kissan paksut posket.\""},
{"label":"Alaraaja painuu – makuulla jalka suorana 30° kulmaan 5 s"},
{"label":"Katsedeviaatio (silmät kääntyneet sivulle)"}
],
"met":{"title":"AVH-epäily","text":"Selvitä oireiden alkamisaika ja aiempi toimintakyky, mittaa verensokeri. Toispuolihalvaus + katsedeviaatio → konsultoi aina lääkäriä: ensisijainen hoito on trombektomia ja hoitopaikka yliopistosairaala.","tone":"danger"},
"notMet":{"title":"Ei toispuolisia löydöksiä","text":"Muista ohimenneet oireet (TIA): liuotus- ja trombektomiapotilaiden tapaan myös ohimenneet AVH-oireet kuljetetaan hoitoon kykenevään paikkaan.","tone":"neutral"}}
```

> [!warning] Mittaa verensokeri
> Hypoglykemia voi aiheuttaa halvauksen kaltaisia oireita. Kouristelu tai nykinä hoidetaan normaalisti. Katso [sokeritasapainon häiriöt](topic:sokeritasapainon-hairiot) ja [kouristelu](topic:kouristelu).

## Hoito ensihoidossa

```media
{"widget":"flow","title":"AVH-potilaan hoito (Ensihoito-opas)","steps":[
{"title":"Peruselintoiminnot","text":"Hengitys, verenkierto ja tajunta. Selvitä oireet ja alkamisaika.","tone":"neutral"},
{"title":"Aspiraation ehkäisy","text":"Pääty 20–30° koholla, ei mitään suun kautta. Pahoinvointiin ondansetroni 4 mg i.v.","tone":"neutral"},
{"title":"Suoniyhteys ja nesteet","text":"500 ml kristalloidia ensimmäisen tunnin aikana. Toinen laskimoyhteys matkalla.","tone":"neutral"},
{"title":"Verenpaine","text":"Vain jos systolinen yli 220 mmHg: labetaloli 10 mg i.v. toistaen, tavoite systolinen yli 160 mmHg. Älä laske liian alas.","tone":"warning"},
{"title":"Lämpö ja verensokeri","text":"Kuume yli 38 °C → parasetamoli 1 g i.v. (edellisestä yli 6 h). Hypoglykemian korjaus.","tone":"neutral"},
{"title":"Kuljetus A-kiireellisenä","text":"Suoraan liuotus- tai trombektomiasairaalaan ennakkoilmoituksin. Ei-omatoimiset lähimpään päivystykseen lääkärikonsultaation perusteella.","tone":"ok"}
]}
```

## Lukinkalvonalainen verenvuoto (SAV)

SAV:n taustalla on yleensä aivovaltimon pullistuman (aneurysman) puhkeaminen; Suomessa sen saa vuosittain noin 300–400 ihmistä. Veri leviää lukinkalvon alle, ei aivokudokseen, joten oireet poikkeavat aivoverenvuodosta: **äkkiä alkava kova, hellittämätön päänsärky**, pahoinvointi ja oksentelu, niskajäykkyys ja valonarkuus; joskus kouristelu ja tajuttomuus, harvoin halvausoireet. Kirjo on laaja – syvästä tajuttomuudesta taksilla saapuvaan hyväkuntoiseen potilaaseen. Riskitekijöitä ovat kohonnut verenpaine, tupakointi ja runsas alkoholinkäyttö; aneurysmat puhkeavat useimmiten levossa (Terveyskirjasto).

Ensihoidossa hoidetaan päänsärkyä ja pahoinvointia ja tarvittaessa lasketaan verenpainetta, ja potilas kuljetetaan nopeasti sairaalaan, jossa on päivystävä TT. Noin neljäsosa potilaista kuolee vuoden kuluessa. Tajuttomalla SAV- tai aivoverenvuotopotilaalla on usein edeltävä päänsärky, koukistus- tai ojennusreaktio kipuun, nykinää ja pupillien poikkeavuuksia – katso [tajuttomuus](topic:tajuttomuus).

```media
{"widget":"scene-card","id":"avh","title":"Kohteessa: AVH-epäily","know":[
{"label":"Kohdeaika alle 20 minuuttia"},
{"label":"Liuotus 90 min kuluessa oireiden alusta, aikaikkuna 9 h"},
{"label":"Trombektomia: omatoiminen ja suuren suonen tukoksen epäily","detail":"Toispuolihalvaus + katsedeviaatio → yliopistosairaala, konsultoi."},
{"label":"Herännyt oireisiin: soveltuu hoitoon enintään 24 h"},
{"label":"SAV: äkillinen kova päänsärky, niskajäykkyys, oksentelu"}
],"examine":[
{"label":"Viimeksi nähty oireettomana – kellonaika"},
{"label":"Aiempi toimintakyky (mRS)"},
{"label":"Suupieli, yläraaja, puhe, alaraaja, katsedeviaatio"},
{"label":"Tajunta, pupillat, kipureaktion puolierot"},
{"label":"Verensokeri"},
{"label":"Verenpaine ja lämpö"},
{"label":"Kouristelu tai nykinä – hoidetaan normaalisti"}
],"do":[
{"label":"Pääty 20–30° koholla, ei mitään suun kautta"},
{"label":"Suoniyhteys, kristalloidia 500 ml ensimmäisen tunnin aikana"},
{"label":"Verenpainetta lasketaan vain, jos systolinen yli 220 mmHg"},
{"label":"Ennakkoilmoitus ja A-kiireellinen kuljetus oikeaan sairaalaan"},
{"label":"Toinen laskimoyhteys matkalla"}
],"redFlags":["Toispuolihalvaus ja katsedeviaatio","Tajunnan lasku","Äkillinen kova päänsärky","Systolinen paine yli 220 mmHg"]}
```

## Muista tämä -kertaus

- Kohdeaika alle 20 min; liuotus 90 min kuluessa oireiden alusta, trombektomian aikaikkuna pidempi.
- Selvitä aina oireiden alkamisaika ja aiempi toimintakyky – halvausoireisiin herännyt omatoiminen on hoitoon soveltuva (24 h).
- Suupieli, yläraaja, puhe, alaraaja; toispuolihalvaus + katsedeviaatio → lääkärikonsultaatio, trombektomia.
- Pääty 20–30°, ei mitään suun kautta, verenpainetta lasketaan vain yli 220 mmHg.
- SAV: äkillinen kova päänsärky, niskajäykkyys, oksentelu – nopea kuljetus TT:hen.
