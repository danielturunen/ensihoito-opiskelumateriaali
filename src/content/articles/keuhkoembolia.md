## Verenkierron ongelma, joka näyttää hengitysongelmalta

Keuhkoembolia (keuhkoveritulppa) syntyy, kun verihyytymä — tyypillisesti alaraajan syvästä laskimosta irronnut — kulkeutuu verenkierron mukana keuhkovaltimoon tai sen haaraan ja tukkii sen. Vaikka tila ilmenee usein äkillisenä hengenahdistuksena, kyseessä on ensisijaisesti verenkierron, ei hengityksen, ongelma.

> [!info] Tausta
> Tukos keuhkovaltimossa estää verenkierron osassa keuhkoja. Tämä tarkoittaa, että osa keuhkoista saa edelleen ilmaa (ventilaatio), mutta ei verta (perfuusio). Kaasujenvaihto tällä alueella estyy kokonaan — ilmiötä kutsutaan "dead space" -ilmiöksi. Samalla tukos nostaa jyrkästi painetta sydämen oikealla puolella, koska se joutuu pumppaamaan verta valtavaa vastusta vasten. Tämä voi johtaa akuuttiin oikean puolen vajaatoimintaan ja sokkiin.

```media
{"widget":"flow","title":"Hyytymän matka ja seuraukset","steps":[
{"title":"Syvä laskimotukos alaraajassa","text":"Riskitekijöinä mm. immobilisaatio, tuore iso leikkaus, syöpä, raskaus tai hormonaalinen ehkäisy, aiempi tukos."},
{"title":"Hyytymä irtoaa ja kulkeutuu verenkierron mukana","text":"Laskimoista sydämen oikealle puolelle ja sieltä keuhkovaltimoon."},
{"title":"Hyytymä tukkii keuhkovaltimon tai sen haaran","tone":"warning","branches":[
{"label":"Keuhkoissa","title":"Ilmaa mutta ei verta","text":"Dead space: kaasujenvaihto estyy alueella, joka saa edelleen ilmaa.","tone":"warning"},
{"label":"Sydämessä","title":"Oikean kammion kuormitus","text":"Pumppaus valtavaa vastusta vasten → oikean puolen vajaatoiminta ja sokki.","tone":"danger"}
]}
]}
```

## Oireet ja löydökset

Potilaan kuvaamia oireita ovat äkillisesti alkanut hengenahdistus, pleuratyyppinen rintakipu (terävä, pistävä, pahenee sisäänhengityksessä), yskä — joskus veriyskä — ja huimaus tai pyörtyminen. Toispuoleinen jalan turvotus ja kipu viittaavat taustalla olevaan syvään laskimotukokseen.

Kliinisessä tutkimuksessa potilas on usein ahdistunut, kalpea ja hikinen, hengitys on tihentynyt ja syke lähes aina tiheä.

> [!warning] Red flag
> Auskultaatiolöydös keuhkoemboliassa on usein täysin normaali. Tämä on tärkeä diagnostinen vihje: äkillinen hengenahdistus ja takykardia ilman selittävää auskultaatiolöydöstä on keuhkoembolia, kunnes toisin todistetaan.

SpO2 voi olla matala tai yllättäen normaali, verenpaine tyypillisesti normaali — mutta laskee massiivisessa emboliassa. EKG:ssä voi näkyä oikean puolen kuormituksen merkkejä, kuten niin kutsuttu S1Q3T3-kuvio (syvä S-aalto I-kytkennässä, Q-aalto ja T-inversio III-kytkennässä).

## Riskitekijät

Keuhkoemboliaa altistavia tekijöitä ovat aiempi keuhkoveritulppa, immobilisaatio (esimerkiksi pitkät matkat tai vuodelepo), raskaus tai hormonaalinen ehkäisy, iso leikkaus kahden edeltävän viikon aikana, syöpä ja tiedossa oleva syvä laskimotukos.

> [!tip] Muista tämä
> Kysy aina riskitekijät: pitkä paikallaanolo, tuore leikkaus, aiempi laskimotukos, syöpä tai raskaus tukevat vahvasti keuhkoembolian epäilyä, vaikka auskultaatio olisi normaali.

## Kriittisen keuhkoembolian red flagit

Massiivisesta, hengenvaarallisesta keuhkoemboliasta kertovat:

- SpO2 alle 90 %
- systolinen verenpaine alle 100 mmHg
- syke yli 110/min
- potilas voimaton, levoton, riuhtova tai pyörtyilevä
- tajunnanmenetys (synkopee)
- voimakas syanoosi
- sydänpysähdys, usein PEA-rytmillä (sykkeetön rytmi, jossa sydämen sähköinen toiminta jatkuu mutta pumppaustoiminta on pysähtynyt)

```media
{"widget":"checklist","title":"Kriittisen keuhkoembolian merkit","prompt":"Merkitse potilaalla havaitut löydökset.","rule":{"type":"any"},"items":[
{"label":"SpO₂ alle 90 %"},
{"label":"Systolinen verenpaine alle 100 mmHg"},
{"label":"Syke yli 110/min"},
{"label":"Voimaton, levoton, riuhtova tai pyörtyilevä"},
{"label":"Tajunnanmenetys (synkopee)"},
{"label":"Voimakas syanoosi"}
],
"met":{"title":"Massiivisen, hengenvaarallisen keuhkoembolian merkkejä","text":"Ennakoi elvytystilanne (usein PEA). Happi varaajamaskilla, nestettä vain varovasti hypotensiossa, verenkierron tuki ja ensihoitolääkärin konsultaatio liuotushoidosta.","tone":"danger"},
"notMet":{"title":"Ei kriittisiä merkkejä tällä hetkellä","text":"Keuhkoemboliaepäily edellyttää silti aina kuljetusta – potilas ei saa kävellä.","tone":"neutral"}}
```

> [!danger] Henkeä uhkaava
> Hypotensiivinen keuhkoemboliapotilas on äärimmäisen korkean riskin potilas. Elvytystilanteeseen kannattaa ennakoida: keuhkoembolia on korjattavissa oleva sydänpysähdyksen syy.

## Hoito

Ensihoidon yleiset periaatteet:

- **Happihoito** runsasvirtauksisena varaajamaskilla hypoksemian korjaamiseksi ja sydämen työmäärän vähentämiseksi.
- **Asentohoito:** puoli-istuva asento on yleensä mukavin, mutta hypotensiossa potilas asetetaan makuulle.
- **Nestehoito vain hypotensiossa:** varovainen nestebolus voi parantaa oikean kammion täyttöä, mutta liiallinen neste voi venyttää oikeaa kammiota entistä enemmän ja pahentaa tilannetta.
- **Verenkierron tuki:** matalan verenpaineen korjaamiseksi voidaan nesteytyksen lisäksi käyttää verenpainetta nostavaa lääkitystä (esim. noradrenaliini-infuusiota) hoito-ohjeen mukaan, tavoitteena riittävä systolinen verenpaine.
- **Kriittisessä tilanteessa** vahvan epäilyn ja hengenvaarallisen tilan yhdistyessä voidaan ensihoitolääkärin konsultaation jälkeen harkita liuotushoitoa ja antikoagulaatiota (esim. [enoksapariini](topic:enoksapariini)) paikallisen hoito-ohjeen mukaisesti.
- **Elvytys** aloitetaan välittömästi, jos potilas menee elottomaksi — keuhkoembolia on yksi korjattavista sydänpysähdyksen syistä.

## Erotusdiagnostiikka

| Sairaus | Keuhkoembolia | Sydäninfarkti | Jänniteilmarinta | Keuhkokuume |
|---|---|---|---|---|
| Alku | Äkillinen | Äkillinen | Äkillinen | Hitaampi |
| Auskultaatio | Tyypillisesti normaali | Normaali tai rahinoita | Toispuolisesti vaimentuneet äänet | Paikalliset rahinat |
| EKG | Oikean puolen kuormitus | ST-muutokset | Normaali | Normaali |
| Rintakipu | Pleuratyyppinen | Puristava | Terävä | Vähäinen |

Keuhkoemboliaa ja [jänniteilmarintaa](topic:ilmarinta) voi olla vaikea erottaa toisistaan pelkän oirekuvan perusteella, koska molemmat voivat aiheuttaa obstruktiivisen sokin — ratkaiseva ero löytyy usein auskultaatiosta.

## Kuljetus

Keuhkoemboliaepäily edellyttää aina kuljetusta, vaikka oireet olisivat hetkellisesti helpottaneet. Potilas ei saa kävellä — rasitus voi laukaista uuden embolisaation. Peruselintoimintoja seurataan tiiviisti kuljetuksen aikana.

> [!tip] Muista tämä
> Akuutin alkutilanteen jälkeen potilaan vointi voi korjaantua nopeasti ja hän voi vaikuttaa lähes oireettomalta ensihoidon saapuessa — huolellinen haastattelu ja riskitekijöiden kartoitus on siksi erityisen tärkeää.

## Muista tämä -kertaus

- Keuhkoembolia on ensisijaisesti verenkierron ongelma, joka ilmenee hengenahdistuksena.
- Auskultaatiolöydös on usein täysin normaali — älä sulje pois keuhkoemboliaa normaalin keuhkokuuntelun perusteella.
- Äkillinen hengenahdistus + takykardia ilman selittävää löydöstä = epäile keuhkoemboliaa.
- Riskitekijät (immobilisaatio, leikkaus, syöpä, raskaus, aiempi tukos) tukevat diagnoosia merkittävästi.
- Nestehoito on varovaista — liiallinen neste voi pahentaa oikean kammion kuormitusta.
- Keuhkoembolia on korjattavissa oleva sydänpysähdyksen syy — ennakoi elvytystilanne hypotensiivisellä potilaalla.
