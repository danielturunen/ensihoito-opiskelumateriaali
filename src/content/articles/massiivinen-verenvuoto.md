## Miksi vuotava potilas on aikakriittinen

Vaikeasti vammautuneet kuolevat usein vuotosokkiin tai traumaattiseen aivovaurioon. Vuotavan potilaan ensihoidon keskeiset tavoitteet ovat **hapenkuljetuskyvyn, riittävän veritilavuuden ja hyytymiskyvyn ylläpito** siihen asti, että vuoto saadaan kirurgisesti loppumaan. Aika vammautumisesta leikkaussaliin voi pahimmillaan olla tunteja, ja monissa järjestelmissä vaikeasti vammautuneet viettävät suurimman osan ensimmäisestä tunnista sairaalan ulkopuolella – siksi verenvuotoon puututaan jo kentällä.

## Vamman aiheuttama hyytymishäiriö

Vamman aiheuttamassa hyytymishäiriössä antikoagulanttien, prokoagulanttien, verihiutaleiden, verisuonten endoteelin ja fibrinolyysin vuorovaikutus järkkyy. Massiivisen vuodon yhteydessä kehittyvä **hypotermia, asidoosi ja nestehoidon aiheuttama hyytymistekijöiden laimeneminen** pahentavat häiriötä – sama noidankehä, jota kutsutaan [kuoleman kolmioksi](topic:traumapotilaan-tutkiminen). Monivammaan liittyvä aivovamma voi pahentaa hyytymishäiriötä entisestään.

> [!warning] Kirkkaat nesteet eivät korvaa verta
> Nopeasti annettu nestehoito voi pahentaa hypotermiaa ja laimentaa hyytymistekijöitä. Kirkkaiden nesteiden runsas antaminen ensihoidossa saattaa olla yhteydessä vammapotilaan huonoon ennusteeseen. Lävistävässä vammassa lievää hypovolemiaa ja yli 80 mmHg:n systolista verenpainetta ei korjata, jotta hypotermiaa ja laimenemista ei syvennettäisi eikä verenpaine nousisi liikaa.

## Verenvuodon hallinnan kokonaisuus

Lontoon lääkärihelikopterin "verenvuodon hoitopaketti" (care bundle) yhdistää yksittäiset, hyödyllisiksi todetut toimet, koska yhdessä ne ovat tehokkaampia kuin erikseen. Perusasioiden laadun varmistaminen on yhtä tärkeää kuin uudet menetelmät.

```media
{"widget":"flow","title":"Verenvuodon hoitopaketti kentällä","steps":[
{"title":"Lyhyt kohdeaika ja oikea hoitopaikka","text":"Tavoitteena lyhyt aika vammasta lopulliseen hoitoon. Esimerkiksi hereillä olevalla lävistävän vamman potilaalla kohdeaika alle 10 min.","tone":"neutral"},
{"title":"Ulkoinen vuoto","text":"Painesidos, hemostaattiset sidokset ja kiristysside raajavuotoon. Pienetkin vuotokohdat (esim. päänahka) hoidetaan – vuoto kumuloituu.","tone":"warning"},
{"title":"Lantio ja raajat tueksi","text":"Lantiovyö lantiomurtumaepäilyssä, tehokkaat lastat.","tone":"warning"},
{"title":"Varovainen käsittely","text":"Vähennä potilaan kääntelyä, jotta hyytymät eivät irtoa – esim. kauhapaarit kääntämisen sijaan.","tone":"warning"},
{"title":"Traneksaamihappo","text":"Hyöty, kun annetaan 3 tunnin kuluessa vammasta – suurin hyöty ensimmäisen tunnin aikana. Annetaan kuljetuksen aikana.","tone":"ok"},
{"title":"Verivalmisteet ja ennakkoilmoitus","text":"Punasolut kentälle tai sairaalan massiivisen verensiirron protokollan aktivointi jo kentältä.","tone":"ok"}
]}
```

Pienen tilan vuodot, kuten **sydäntamponaatio** lävistävässä vammassa ja laajeneva kallonsisäinen verenvuoto, voivat tappaa nopeasti pienelläkin verimäärällä. Lävistävän vamman sydänpysähdyksessä ensihoitolääkärin tekemä torakotomia ja [tamponaation](topic:lavistavat-vammat) purku on tuottanut eloonjääneitä, kun aika sydänpysähdyksestä on lyhyt.

## Verensiirto ensihoidossa

Ideaalista olisi antaa kokoverta, kuten sotatilanteissa, mutta sitä ei ole Suomessa saatavilla. Sairaalan massiivisessa verensiirrossa punasolujen, jääplasman ja trombosyyttien suhteeksi suositellaan 1:1:1. Kentälle voidaan viedä **punasolutiivisteitä**; jääplasma ei aikaviiveiden vuoksi sovi ensihoitoon.

Useissa maissa ORh-negatiivisten punasolujen vieminen kentälle on todettu turvalliseksi: hävikki on ollut vähäinen eikä vakavia verensiirtoreaktioita ole juuri raportoitu. Suomessa esimerkiksi Satakunnassa on välitön valmius toimittaa kentälle 2–4 yksikköä ORh-negatiivisia punasoluja ensihoitolääkärin päätöksellä.

```media
{"widget":"checklist","title":"Punasolut kentälle? (esimerkki Satakunnasta)","prompt":"Merkitse täyttyvät kriteerit.","rule":{"type":"any"},"items":[
{"label":"Massiivinen vuoto ja pitkä kohdeaika (yli 20–30 min)"},
{"label":"Massiivinen vuoto ja pitkä kuljetus (yli 30 min)"},
{"label":"Hätäkirurginen toimenpide: torakotomia, amputaatio tai kenttäsektio"}
],
"met":{"title":"Kriteeri täyttyy","text":"Ensihoitolääkäri päättää punasolujen toimittamisesta; kenttäjohtaja järjestää nopeimman kuljetuksen. Hätäveripaketti: 2–4 yksikköä ORh-negatiivisia punasoluja, veriletku, verenlämmitin, näytteenottovälineet ja tilauskaavake.","tone":"danger"},
"notMet":{"title":"Ei kriteerejä","text":"Jatka verenvuodon hallintaa ja harkitse sairaalan massiivisen verensiirron protokollan ennakkoaktivointia.","tone":"neutral"}}
```

> [!tip] Ota näyte ennen verensiirtoa
> Ennen punasolujen antoa laskimosta otetaan verinäyte (esim. 20 ml) veriryhmän ja vasta-aineiden määritystä varten, ja se toimitetaan sairaalaan potilaan mukana. Käytetyt punasolupussit palautetaan verikeskukseen.

Lontoossa sairaalan "code red" -protokolla voidaan käynnistää kentältä, kun epäillään aktiivista vuotoa ja systolinen verenpaine on alle 90 mmHg (huomioiden myös vasteen puuttuminen nestebolukseen) – verivalmisteet ovat silloin valmiina potilaan saapuessa.

> [!info] Tapaus: ammuttu vatsaan
> Nuorta naista oli ammuttu oikeaan ylävatsaan, verenpaine 80/40 mmHg. Lääkäriyksikkö antoi traneksaamihappoa 1 g, otti verinäytteen ja pyysi kenttäjohtajaa tuomaan hätäveripaketin. Kaksi yksikköä ORh-negatiivisia punasoluja aloitettiin maantiellä yhtä aikaa, ja sairaalaan tehtiin ennakkoilmoitus. Leikkauksessa vuoto oli noin 5,5 litraa, ja maksa, perna, haima ja ohutsuoli olivat vaurioituneet – potilas selvisi vammanhallintaleikkaukseen ja tehohoitoon.

## Muista tämä -kertaus

- Tavoite: hapenkuljetus, veritilavuus ja hyytymiskyky turvataan, kunnes vuoto tyrehdytetään kirurgisesti.
- Hypotermia, asidoosi ja laimeneminen pahentavat vamman aiheuttamaa hyytymishäiriötä.
- Lävistävässä vammassa yli 80 mmHg:n systolista painetta ei nosteta – vältä runsaita kirkkaita nesteitä.
- Hoitopaketti: lyhyt kohdeaika, ulkoinen vuoto hallintaan, lantiovyö ja lastat, varovainen käsittely, traneksaamihappo 3 h:n sisällä.
- Punasoluja voidaan viedä kentälle; ota verinäyte ennen siirtoa. Jääplasma ei sovi ensihoitoon.
