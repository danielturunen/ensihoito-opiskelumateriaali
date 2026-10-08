## Miksi rytmihäiriöitä syntyy

Kaikki rytmihäiriöt johtuvat joko sydämen sähköisen impulssin muodostumisen poikkeavuudesta, johtumisen häiriöstä, tai molemmista yhdessä.

### Poikkeava impulssin muodostuminen

Normaalisti sinussolmuke tahdistaa sydäntä nopeimmin, ja sitä alemmat tahdistinsolut (eteis-kammiosolmuke, Hisin kimppu, kammioiden johtoradat) toimivat varajärjestelmänä. Jos jokin näistä alkaa poikkeavasti kiihtyä – esimerkiksi hapenpuutteen (hypoksia) tai tiettyjen lääkkeiden vaikutuksesta – syntyy lisääntynyt automatismi, joka voi aiheuttaa rytmihäiriön, jos sen taajuus ylittää sinussolmukkeen taajuuden. Toinen mekanismi on triggeröity aktiivisuus, jossa solu depolarisoituu ylimääräisen kerran repolarisaation aikana (varhainen jälkidepolarisaatio) tai sen jälkeen (myöhäinen jälkidepolarisaatio). Varhainen jälkidepolarisaatio liittyy erityisesti kääntyvien kärkien kammiotakykardian syntyyn.

### Poikkeava impulssin johtuminen – kiertoaktivaatio

Valtaosa ensihoidossa kohdattavista rytmihäiriöistä syntyy kiertoaktivaatiolla (re-entry): sähköinen impulssi jää "pyörimään ympyrää" jonkin sydämen alueen sisällä, kunhan kierroksen kesto on pidempi kuin solujen palautumisaika (refraktaariaika). Kiertoaktivaatio voi olla anatominen (esim. WPW-oireyhtymän oikorata, eteislepatus trikuspidaaliläpän ympärillä) tai toiminnallinen, jolloin selkeää anatomista kiertoreittiä ei ole vaan sydänlihaksen alueet johtavat impulssia eri nopeudella – esimerkiksi iskeemisen alueen reunalla [akuutin sepelvaltimotautikohtauksen](topic:rintakipu-ja-aks) yhteydessä.

> [!tip] Kiertoaktivaation hoito
> Kiertoaktivaatio katkaistaan joko pysäyttämällä johtuminen eteis-kammiosolmukkeessa (adenosiini, defibrillaatio) tai pidentämällä solujen refraktaariaikaa lääkkeellä, kuten [amiodaroni](topic:amiodaroni).

```media
{"widget":"conduction","caption":"Seuraa impulssin kulkua ja vertaa normaalia johtumista kiertoaktivaatioon ja aberraatioon."}
```

### Aberraatio

Kun impulssi kulkee normaalia johtoratajärjestelmää pitkin, QRS-kompleksi on kapea. Jos rytmihäiriö syntyy kammioissa, tai korkealla sykkeellä toinen päähaara ei ehdi palautua johtokykyiseksi, QRS-kompleksi leventyy – tätä kutsutaan aberraatioksi. Siksi myös kammioiden yläpuolelta (supraventrikulaarisesti) alkava rytmihäiriö voi vaikuttaa leveäkompleksiselta.

## Nopeiden rytmihäiriöiden arviointi ja hoitoperiaatteet

Ensihoidossa tarkka rytmidiagnoosi ei ole aina välttämätön, mutta hyvälaatuinen EKG rytmihäiriön aikana on tärkeä jatkohoidon kannalta. Arviointi etenee kolmessa vaiheessa:

1. **Tarkennettu tilanarvio (ABCDE):** peruselintoiminnot ja korjattavissa olevat syyt (esim. hypovolemia, elektrolyyttihäiriö)
2. **Hengenvaaran merkkien tunnistus:** sokki, tajunnanmenetys, merkittävä sydänlihasiskemia, vaikea sydämen vajaatoiminta (keuhkopöhö)
3. **Hoidon valinta:**
   - Hengenvaara: sedaatiossa tehtävä synkronoitu kardioversio
   - Ei hengenvaaraa: arvioidaan QRS-leveys ja rytmin säännöllisyys, ja valitaan lääkehoito sen mukaan

```media
{"widget":"flow","title":"Nopea rytmihäiriö – hoitopäätös","steps":[
{"title":"Tarkennettu tilanarvio (ABCDE)","text":"Peruselintoiminnot ja korjattavat syyt, esim. hypovolemia tai elektrolyyttihäiriö. Hyvälaatuinen EKG rytmihäiriön aikana."},
{"title":"Onko hengenvaaran merkkejä?","text":"Sokki, tajunnanmenetys, merkittävä sydänlihasiskemia, vaikea vajaatoiminta (keuhkopöhö).","tone":"warning","branches":[
{"label":"Kyllä","title":"Synkronoitu kardioversio sedaatiossa","tone":"danger"},
{"label":"Ei","title":"Arvioi QRS-leveys ja säännöllisyys","text":"Valitse lääkehoito niiden mukaan.","tone":"ok"}
]}
]}
```

> [!tip] Vagaalinen stimulaatio
> Modifioitu Valsalvan menetelmä (puhallus ruiskuun 15 sekunnin ajan, sitten potilas käännetään selälleen ja jalat nostetaan koholle) voi katkaista eteis-kammiosolmukkeen kiertoaktivaation tai paljastaa piilevän eteisaktivaation. Adenosiinilla tavoitellaan samaa vaikutusta.

## Rytmin systemaattinen tulkinta

Arvioi ensin, onko potilas **vakaa vai epävakaa** – epävakaalla varmista elvytysvalmius ja valmistaudu kardioversioon tai tahdistukseen; vakaalla on hetki aikaa harkita lääkehoitoa. Kerää samalla esitiedot (ikä, sydän- ja keuhkosairaudet, aiemmat vastaavat kohtaukset, lääkitys, alkoholi, huumeet ja piristeet) ja mieti, voiko rytmi olla **kompensatorinen** – vuoto, vatsakipu, hartiapistos, hyvin matala saturaatio? (Kettunen, Duodecim-webinaari 2024)

```media
{"widget":"flow","title":"Rytmin tulkinta vaihe vaiheelta","steps":[
{"title":"1. Yleissilmäys","text":"Onko nauha tulkittavissa? Nopeus: alle 150/min on epätyypillistä kiertoaktivaatiotakykardialle (paitsi eteisvärinä), yli 60/min epätyypillistä AV-katkoksille. Erimuotoiset kompleksit = lisälyönnit tai poikkeava johtuminen.","tone":"neutral"},
{"title":"2. Tasaisuus","text":"Epätasainen → ensimmäisenä eteisvärinä. Tasainen ja nopea → kiertoaktivaatio. Tasainen ja hidas → korvausrytmi (aina tasainen). Epätasainen ja hidas → hidas eteisvärinä tai 2. asteen AV-katkos.","tone":"neutral"},
{"title":"3. P-aallot","text":"Positiiviset P:t → ainakin osa rytmistä sinussolmukkeesta. Ei P-aaltoja + söheröinen perusviiva → eteisvärinä. Sahalaitainen F-aalto alaseinässä → lepatus.","tone":"neutral"},
{"title":"4. P:n ja QRS:n suhde","text":"PQ yli 210 ms → 1. asteen katkos. Progressiivisesti pitenevä PQ ja johtumaton P → Mobitz I. Vakio PQ ja orpoja P-aaltoja → Mobitz II. Ei yhteyttä P:n ja QRS:n välillä → totaaliblokki.","tone":"warning"},
{"title":"5. QRS-kompleksi","text":"Yli 120 ms: kammioperäinen rytmi (VT, korvausrytmi), haarakatkos, hyperkalemia, hypotermia, WPW tai tahdistin.","tone":"warning"},
{"title":"6. ST ja T","text":"Onko iskemia rytmihäiriön syy vai seuraus? Korkea piikkimäinen T → iskemia tai hyperkalemia.","tone":"neutral"}
]}
```

Katso myös [EKG:n perusteet](topic:ekg-perusteet).

## Rytmikirjasto

Harjoittele rytmien tunnistamista monitorinäkymässä. Jokaisen rytmin alla ovat sen tunnistepiirteet ja ensihoidon keskeiset toimet.

```media
{"widget":"ecg-rhythms"}
```

## Eteisvärinä ja eteislepatus

Eteisvärinä on yleisin rytmihäiriö (2-4 % aikuisista): eteisten sähköinen toiminta on nopeaa ja järjestäytymätöntä, ja kammiotaajuus on tyypillisesti 100-180/min. Eteislepatuksessa eteisaktivaatio on järjestäytyneempää (noin 300/min), ja kammiovaste on usein melko vakiotaajuinen (esim. 2:1 tai 3:1 -johto).

- **Eteisvärinä**: ei P-aaltoja, epätasainen, kapea kompleksi – ensimmäinen vaihtoehto aina, kun rytmi on epätasainen ilman P-aaltoja. Tuoreena perusviiva on usein söheröinen, kroonisena tasainen. Nuorella "holiday heart" runsaan alkoholinkäytön jälkeen; voi liittyä myös sepsikseen tai sydänlihastulehdukseen.
- **Eteislepatus**: sahalaitainen F-aalto alaseinäkytkennöissä, eteistaajuus 250–300/min, ja kammiovaste on sen murto-osa: **2:1 = 150/min, 3:1 = 100/min, 4:1 = 75/min**. Johtuminen ei aina ole vakaa, ja lepatus voi vaihdella eteisvärinän kanssa. Tavallisempi keuhkosairailla. Tasainen 150/min kapeakompleksinen takykardia – muista lepatus.

> [!warning] Red flag
> Myös kohtauksittaiseen eteisvärinään liittyy aivohalvauksen riski. Tromboembolisten komplikaatioiden vaara arvioidaan CHA2DS2-VASc-pisteytyksellä, ja antikoagulaatiota suositellaan, kun pisteitä kertyy kaksi tai enemmän.

## PSVT ja WPW-oireyhtymä

Paroksysmaalinen supraventrikulaarinen takykardia (PSVT) on kohtauksittainen, kapeakompleksinen takykardia, joka johtuu yleisimmin eteis-kammiosolmukkeen sisäisestä kiertoaktivaatiosta. WPW-oireyhtymässä eteisten ja kammioiden välillä on ylimääräinen oikorata, joka voi näkyä normaalissa EKG:ssä delta-aaltona. PSVT pysäytetään vagaalisella stimulaatiolla ja tarvittaessa adenosiinilla.

- PSVT on **pienten lasten yleisin rytmihäiriö**, mutta sitä tavataan kaikenikäisillä. Kohtaus alkaa äkisti, usein lisälyönnin tai vagaalisen heijasteen laukaisemana, ja voi kestää sekunneista päiviin. Potilaalla on usein ollut kohtauksia aiemmin, ja hän voi osata omia "temppujaan" rytmin kääntämiseksi. Sydänsairaalla PSVT voi aiheuttaa rintakipua ja epävakautta.
- EKG: kapea, **hyvin säännöllinen** QRS, taajuus yleensä 150–200/min, P-aaltoja ei yleensä näy (tai ne ovat retrogradisia).
- **AVNRT**: kiertoaktivaatio AV-solmukkeen kahden radan (hidas ja nopea) välillä; tavallisimmassa muodossa (80–90 %) P-aalto piiloutuu QRS:ään. **AVRT/WPW**: ylimääräinen oikorata eteisten ja kammioiden välillä – kohtausten välillä lyhyt PQ ja delta-aalto (pre-eksitaatio).

> [!danger] WPW ja eteisvärinä
> Jos WPW-potilaalle tulee eteisvärinä (noin 20 %) tai -lepatus, oikorata ohittaa AV-solmukkeen jarrun: kammiotaajuus voi olla yli 200, hetkittäin jopa 300/min, QRS on leveä ja kompleksit voivat vaihdella muodoltaan.

## Kammiotakykardia

Kammiotakykardia tarkoittaa yli kolmen peräkkäisen leveän kammioperäisen kompleksin sarjaa taajuudella yli 100/min. Erityisesti sydäninfarktin jättämä arpi ja tuore iskemia altistavat sille; muita syitä ovat lääkeaineet, elektrolyyttihäiriöt, kardiomyopatiat ja läppäsairaudet.

- QRS on leveä (yleensä yli 140 ms), taajuus tavallisesti 150–200/min ja rytmi **säännöllinen**.
- Rintakytkennät ovat usein samansuuntaisia (**konkordanssi**), akseli voi olla äärimmäisen oikealla.
- Hitaammassa VT:ssä voi näkyä **fuusio- tai capture-lyöntejä**, kun sinuslyönti sulautuu kammiolyöntiin tai johtuu välissä.
- Monomorfinen VT on yleisin; polymorfisessa lyönnit ovat erimuotoisia.

> [!warning] Leveä takykardia on VT, kunnes toisin todistetaan
> Hoida kaikkia leveäkompleksisia takykardioita kammiotakykardioina, kunnes toisin todetaan hyvin vakuuttavasti.

> [!danger] Henkeä uhkaava
> Kammiotakykardia voi muuttua kammiovärinäksi ja johtaa sydänpysähdykseen, vaikka se ei itsessään romahduttaisi verenkiertoa.

Hoito riippuu potilaan tilasta:
- Eloton potilas: elvytysohjeiden mukainen defibrillaatio
- Hemodynaamisesti epävakaa: sähköinen kardioversio
- Vakaa potilas: [amiodaroni](topic:amiodaroni) infuusiona, ja jos teho on riittämätön, synkronoitu kardioversio sedaatiossa

## Pitkä QT-aika ja kääntyvien kärkien kammiotakykardia

Kääntyvien kärkien kammiotakykardia (torsades de pointes) syntyy varhaisen jälkidepolarisaation seurauksena pitkän QT-ajan pohjalta. QTc-aika on pidentynyt, kun se ylittää 440 ms miehillä ja 460 ms naisilla; yli 500 ms:n QTc liittyy jo merkittävään riskiin. Altistavia tekijöitä ovat synnynnäinen pitkä QT -oireyhtymä, useat lääkkeet (myös amiodaroni), sydänlihasvaurio ja elektrolyyttihäiriöt (matala kalium, magnesium tai kalsium).

> [!danger] Amiodaroni on vasta-aiheinen
> Koska kääntyvien kärkien kammiotakykardia liittyy pitkään QT-aikaan, QT-aikaa pidentäviä lääkkeitä, kuten amiodaronia, ei saa käyttää sen hoidossa. Spesifinen hoito on magnesium 2 g i.v., joka voidaan toistaa.

```media
{"widget":"qtc"}
```

## Hitaat rytmihäiriöt

Jos sinussolmukkeen toiminta tai eteis-kammiojohtuminen häiriintyy, syke voi laskea niin matalaksi, ettei iskutilavuus riitä ylläpitämään verenpainetta. Hoito etenee kahden kysymyksen kautta:

Hidaslyöntisyyden taustalla on yleensä sinus- tai AV-solmukkeen ongelma, mutta **sinusbradykardiaan** voi johtaa myös moni ei-sydänperäinen syy: kallonsisäisen paineen nousu, hapenpuute, vagaalinen heijaste, elektrolyyttihäiriöt, neurogeeninen sokki ja syvä hypotermia. Sairas sinus -oireyhtymässä (SSS) nopea ja hidas rytmi vaihtelevat.

| AV-katkos | EKG | Merkitys |
|---|---|---|
| 1. aste | PQ yli 210 ms, jokainen P johtuu | Hidastuma, ei varsinainen katkos |
| 2. aste, Mobitz I (Wenckebach) | PQ pitenee vähitellen, kunnes P jää johtumatta | Toiminnallinen, vagaalinen tonus, lääkkeet, hyvä kunto – hyvänlaatuinen |
| 2. aste, Mobitz II | Vakio PQ, mutta P jää ajoittain johtumatta | Rakenteellinen (His–Purkinje), usein etenevä |
| 3. aste (totaaliblokki) | Ei yhteyttä P:n ja QRS:n välillä, P-aaltoja enemmän kuin QRS:iä | Korvausrytmi on aina tasainen – mitä alempaa se lähtee, sitä leveämpi ja hitaampi |

Rakenteellisia syitä ovat akuutti sydäninfarkti (noin 40 % AV-katkoksista), sydänlihastulehdus, kardiomyopatiat, sarkoidoosi, amyloidoosi ja ikä; lisäksi lääkkeet, elektrolyytit ja hypotermia.

1. Onko hengenvaaran merkkejä (sokki, tajunnanmenetys, iskemia, vajaatoiminta)? Kyllä → [atropiini](topic:atropiini) 0,5 mg i.v. tai ulkoinen tahdistus. (Duodecimin Ensihoito-oppaan rintakipuohjeissa annos on 0,1 mg/10 kg, toistettavissa kokonaisannokseen 3 mg.)
2. Onko asystolen riskiä (Mobitz II -katkos, totaali AV-katkos, kammiotauko yli 3 s)? Kyllä → lääkehoito tai tahdistus on tarpeen; riittämättömällä atropiinivasteella harkitaan adrenaliini- tai isoprenaliini-infuusiota tai ulkoista tahdistusta. Muista, että atropiinille reagoimattoman, leveäkompleksisen bradykardian taustalla voi olla [hyperkalemia](topic:hyperkalemia-elektrolyytit).

```media
{"widget":"flow","title":"Hidas rytmihäiriö – kaksi kysymystä","steps":[
{"title":"Onko hengenvaaran merkkejä?","text":"Sokki, tajunnanmenetys, iskemia, vajaatoiminta.","tone":"warning","branches":[
{"label":"Kyllä","title":"Atropiini 0,5 mg i.v. tai ulkoinen tahdistus","tone":"danger"},
{"label":"Ei","title":"Siirry seuraavaan kysymykseen","tone":"neutral"}
]},
{"title":"Onko asystolen riskiä?","text":"Mobitz II -katkos, totaali AV-katkos tai kammiotauko yli 3 s.","tone":"warning","branches":[
{"label":"Kyllä","title":"Lääkehoito tai tahdistus","text":"Riittämätön atropiinivaste → adrenaliini- tai isoprenaliini-infuusio tai ulkoinen tahdistus. Muista hyperkalemia.","tone":"danger"},
{"label":"Ei","title":"Jatka arviota (ABCDE on jatkuva kehä)","tone":"ok"}
]}
]}
```

## Tahdistimet

Pysyviä tahdistimia käytetään bradykardian, eteis-kammiokatkosten, sydämen vajaatoiminnan (CRT) ja nopeiden rytmihäiriöiden (ICD) hoitoon. Tahdistinkoodi kertoo, mitä lokeroa tahdistin tahdistaa ja tunnistaa, ja millainen vaste tunnistukseen on ohjelmoitu. Kardioversiota tai defibrillaatiota tehdessä elektrodia ei saa sijoittaa tahdistimen tai ICD:n päälle, ja kammiotahdistus voi vaikeuttaa iskemian tunnistamista EKG:stä.

## Ensihoito-oppaan hoito-ohje

Duodecimin Ensihoito-oppaan (Silfvast 2023) mukaan hemodynamiikkaa haittaava rytmihäiriö hoidetaan välittömästi, ja 12–15-kytkentäinen EKG rekisteröidään sekä ennen hoitoa että sen jälkeen. Rytmihäiriötuntemuksen perusteella ei voi päätellä tilanteen vaarallisuutta – arvio tehdään EKG:n ja yleisoireiden perusteella.

| Rytmi | Ensihoito |
|---|---|
| Sinustakykardia | Ei rytmihäiriö – hoida syy (kuume, nestehukka, sepsis). Beetasalpaus vain lääkärin konsultaatiolla. |
| Eteisvärinä | Oireetonta ei rutiinisti hidasteta eikä käännetä. Nopean eteisvärinän aiheuttama iskemia, rintakipu tai vajaatoiminnan hengenahdistus: metoprololi 1–2 mg i.v. (ei, jos systolinen alle 100 mmHg). |
| SVT | Vagaalinen stimulaatio (oksennusheijaste, karotishieronta, Valsalva), adenosiini 5–6 mg nopeana boluksena suureen suoneen, jatkoannokset porrastetusti. Kääntymisen jälkeen kuljetusta ei aina tarvita. |
| Leveäkompleksinen takykardia | Sydänpotilaan yli 140/min leveä takykardia hoidetaan VT:nä. Epävakaa: sedaatio ja sähköinen rytminsiirto lääkärin ohjeella (ei opioidia kardioversiokipuun – hengityslama). Vakaa: amiodaroni 300 mg pieninä annoksina tai 10 min infuusiona. |
| Lisälyönnit | Kapeat eivät vaadi hoitoa. Leveät, monimuotoiset, sarjoina tai runsaina → hoito-ohjepyyntö. |
| Bradykardia | Vain oireinen hoidetaan: atropiini 0,1 mg/10 kg i.v. (ad 3 mg; tehoaa sitä paremmin mitä kapeampi QRS). Henkeä uhkaavassa adrenaliini 0,05 mg i.v. toistuvina boluksina, tarvittaessa ulkoinen tahdistus. |

**Tahdistin ja ICD**: jos tahdistinpiikit ja QRS-kompleksit eivät esiinny yhdessä, epäile tahdistinhäiriötä ja pyydä hoito-ohje. Jos sisäinen defibrillaattori on antanut yksittäisen iskun ja potilas on oireeton, hänet ohjataan ottamaan yhteyttä sairaalaan seuraavana arkipäivänä. Neuvova defibrillaattori tunnistaa nopean kammiotakykardian (yleensä yli 180/min) ja suosittaa iskua.

## Muista tämä -kertaus

- Rytmihäiriöt syntyvät poikkeavasta impulssin muodostumisesta, johtumisesta (useimmiten kiertoaktivaatio) tai molemmista
- Hengenvaaran merkit (sokki, tajunnanmenetys, iskemia, vajaatoiminta) ratkaisevat hoidon: niiden ilmetessä sedaatiossa tehtävä kardioversio
- Eteisvärinä on yleisin rytmihäiriö – muista aina aivohalvausriski ja CHA2DS2-VASc-pisteytys
- Kammiotakykardia voi muuttua kammiovärinäksi – hoito riippuu potilaan hemodynamiikasta
- Pitkä QT-aika altistaa kääntyvien kärkien kammiotakykardialle – amiodaroni on tässä vasta-aiheinen, hoitona magnesium
- Bradykardian ensilääke on atropiini, varalla ulkoinen tahdistus
