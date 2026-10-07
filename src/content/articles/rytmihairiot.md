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

## Rytmikirjasto

Harjoittele rytmien tunnistamista monitorinäkymässä. Jokaisen rytmin alla ovat sen tunnistepiirteet ja ensihoidon keskeiset toimet.

```media
{"widget":"ecg-rhythms"}
```

## Eteisvärinä ja eteislepatus

Eteisvärinä on yleisin rytmihäiriö (2-4 % aikuisista): eteisten sähköinen toiminta on nopeaa ja järjestäytymätöntä, ja kammiotaajuus on tyypillisesti 100-180/min. Eteislepatuksessa eteisaktivaatio on järjestäytyneempää (noin 300/min), ja kammiovaste on usein melko vakiotaajuinen (esim. 2:1 tai 3:1 -johto).

> [!warning] Red flag
> Myös kohtauksittaiseen eteisvärinään liittyy aivohalvauksen riski. Tromboembolisten komplikaatioiden vaara arvioidaan CHA2DS2-VASc-pisteytyksellä, ja antikoagulaatiota suositellaan, kun pisteitä kertyy kaksi tai enemmän.

## PSVT ja WPW-oireyhtymä

Paroksysmaalinen supraventrikulaarinen takykardia (PSVT) on kohtauksittainen, kapeakompleksinen takykardia, joka johtuu yleisimmin eteis-kammiosolmukkeen sisäisestä kiertoaktivaatiosta. WPW-oireyhtymässä eteisten ja kammioiden välillä on ylimääräinen oikorata, joka voi näkyä normaalissa EKG:ssä delta-aaltona. PSVT pysäytetään vagaalisella stimulaatiolla ja tarvittaessa adenosiinilla.

## Kammiotakykardia

Kammiotakykardia tarkoittaa yli kolmen peräkkäisen leveän kammioperäisen kompleksin sarjaa taajuudella yli 100/min. Erityisesti sydäninfarktin jättämä arpi ja tuore iskemia altistavat sille.

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

1. Onko hengenvaaran merkkejä (sokki, tajunnanmenetys, iskemia, vajaatoiminta)? Kyllä → [atropiini](topic:atropiini) 0,5 mg i.v. tai ulkoinen tahdistus.
2. Onko asystolen riskiä (Mobitz II -katkos, totaali AV-katkos, kammiotauko yli 3 s)? Kyllä → lääkehoito tai tahdistus on tarpeen; riittämättömällä atropiinivasteella harkitaan adrenaliini-infuusiota tai ulkoista tahdistusta.

```media
{"widget":"flow","title":"Hidas rytmihäiriö – kaksi kysymystä","steps":[
{"title":"Onko hengenvaaran merkkejä?","text":"Sokki, tajunnanmenetys, iskemia, vajaatoiminta.","tone":"warning","branches":[
{"label":"Kyllä","title":"Atropiini 0,5 mg i.v. tai ulkoinen tahdistus","tone":"danger"},
{"label":"Ei","title":"Siirry seuraavaan kysymykseen","tone":"neutral"}
]},
{"title":"Onko asystolen riskiä?","text":"Mobitz II -katkos, totaali AV-katkos tai kammiotauko yli 3 s.","tone":"warning","branches":[
{"label":"Kyllä","title":"Lääkehoito tai tahdistus","text":"Riittämätön atropiinivaste → adrenaliini-infuusio tai ulkoinen tahdistus.","tone":"danger"},
{"label":"Ei","title":"Jatka arviota (ABCDE on jatkuva kehä)","tone":"ok"}
]}
]}
```

## Tahdistimet

Pysyviä tahdistimia käytetään bradykardian, eteis-kammiokatkosten, sydämen vajaatoiminnan (CRT) ja nopeiden rytmihäiriöiden (ICD) hoitoon. Tahdistinkoodi kertoo, mitä lokeroa tahdistin tahdistaa ja tunnistaa, ja millainen vaste tunnistukseen on ohjelmoitu. Kardioversiota tai defibrillaatiota tehdessä elektrodia ei saa sijoittaa tahdistimen tai ICD:n päälle, ja kammiotahdistus voi vaikeuttaa iskemian tunnistamista EKG:stä.

## Muista tämä -kertaus

- Rytmihäiriöt syntyvät poikkeavasta impulssin muodostumisesta, johtumisesta (useimmiten kiertoaktivaatio) tai molemmista
- Hengenvaaran merkit (sokki, tajunnanmenetys, iskemia, vajaatoiminta) ratkaisevat hoidon: niiden ilmetessä sedaatiossa tehtävä kardioversio
- Eteisvärinä on yleisin rytmihäiriö – muista aina aivohalvausriski ja CHA2DS2-VASc-pisteytys
- Kammiotakykardia voi muuttua kammiovärinäksi – hoito riippuu potilaan hemodynamiikasta
- Pitkä QT-aika altistaa kääntyvien kärkien kammiotakykardialle – amiodaroni on tässä vasta-aiheinen, hoitona magnesium
- Bradykardian ensilääke on atropiini, varalla ulkoinen tahdistus
