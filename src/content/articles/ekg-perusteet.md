## Mitä EKG kuvaa

Sydämessä on kahdenlaisia soluja: **johtoratasoluja**, jotka tuottavat impulssin ja johtavat sen nopeasti ympäri sydäntä, ja **tavallisia sydänlihassoluja**, jotka supistuvat ja johtavat hitaasti. Sinussolmukkeen aktivaatio ei näy EKG:ssä, eikä johtoratajärjestelmän pieni solumassa myöskään – näkyvät heilahdukset syntyvät eteisten ja kammioiden lihaksesta (Nikus, Aro ja Mäkijärvi, Oppiportti; Kettunen 2024).

- **Sinussolmuke** oikean eteisen yläosassa tuottaa impulssin noin 60–80 kertaa minuutissa.
- **AV-solmuke** hidastaa impulssia, jotta eteiset ehtivät tyhjentyä, ja suojaa kammioita liian tiheiltä impulsseilta (esim. eteisvärinässä). Se voi toimia varatahdistajana noin 40–60/min (junktionaalinen rytmi).
- Pystysuunta kuvaa **jännitettä** (lihasmassaa), vaakasuunta **aikaa**.

| Heilahdus | Mitä kuvaa | Normaali |
|---|---|---|
| P-aalto | Eteisten aktivaatio (alkuosa oikea, loppuosa vasen eteinen) | Alle 120 ms, korkeintaan 2,5 mm; positiivinen I, II, aVF |
| PQ-aika | Johtuminen AV-solmukkeen läpi | 120–200 ms (yli 210 ms = 1. asteen katkos) |
| QRS | Kammioiden depolarisaatio | Alle 120 ms |
| ST-väli ja T-aalto | Kammioiden palautuminen (repolarisaatio) | ST perusviivalla; T yleensä samansuuntainen kuin QRS |
| QT-aika | QRS + ST + T | Korjattuna alle 440–460 ms |

Q-aalto on QRS:n alun negatiivinen heilahdus, R ensimmäinen positiivinen ja S sitä seuraava negatiivinen. T-aallon jälkeen voi näkyä pieni samansuuntainen **U-aalto**, joka voidaan vahingossa mitata mukaan QT-aikaan.

## Kytkennät ja elektrodien paikat

Tavallinen 12-kytkentäinen EKG rekisteröidään kymmenellä elektrodilla: **raajakytkennät** (I, II, III, aVR, aVL, aVF) katsovat sydäntä edestä frontaalitasossa, ja **rintakytkennät** (V1–V6) vaakatasossa. Akuuteissa tilanteissa lisätään **V4R** (oikea kammio) ja **V7–V9** (takaseinä). Kytkennät I, II ja III muodostavat Einthovenin kolmion; raajaelektrodien värit muistaa "liikennevalosäännöllä".

- **V1 ja V2**: 4. kylkiluuväli rintalastan oikealla ja vasemmalla puolella.
- **V4–V6**: 5. kylkiluuväli.
- **V3**: V2:n ja V4:n puoliväliin.

Kun impulssi kulkee katsovaa elektrodia kohti, poikkeama on positiivinen; poispäin negatiivinen; ohi kulkiessa kaksivaiheinen. Rintakytkennöissä R-aallon pitäisi kasvaa V1:stä ainakin V4:ään asti.

## Sydämen sähköinen akseli

```media
{"widget":"ecg-axis"}
```

## Rytmin nopeus ja säännöllisyys

Säännöllisen rytmin taajuus saadaan jakamalla **300 (paperinopeus 25 mm/s) tai 600 (50 mm/s)** kahden R-aallon välisten suurten ruutujen määrällä. Epätasaisessa rytmissä lasketaan pidemmältä nauhalta. Normaali sinusrytmi on aina säännöllinen; epäsäännöllisyyden yleisimmät syyt ovat sinusarytmia (hengitys), lisälyönnit ja eteisvärinä.

## Systemaattinen tulkinta

Ennen tulkintaa tarkistetaan laatu: kytkentämerkinnät, kalibraatio (1 mV = 10 mm) ja paperin nopeus. Tulkinta etenee aina samassa järjestyksessä – näin mikään ei jää huomaamatta:

```media
{"widget":"mnemonic","title":"EKG:n systemaattinen tulkinta","name":"Järjestys","items":[
{"letter":"1","word":"Yleissilmäys","text":"Hahmontunnistus: mikä pistää silmään? Onko nauha tulkittavissa?"},
{"letter":"2","word":"Kammiotaajuus","text":"Nopeus, tasainen vai vaihteleva."},
{"letter":"3","word":"P-aalto","text":"Onko P-aaltoja, ja ovatko ne positiivisia I, II ja aVF? Muoto ja kesto."},
{"letter":"4","word":"PQ-aika","text":"Kesto ja säännöllisyys – johtuuko jokainen P?"},
{"letter":"5","word":"QRS","text":"Leveys (yli 120 ms?), muoto (haarakatkos, Q-aallot) ja akseli."},
{"letter":"6","word":"ST-taso","text":"ST-nousu tai -lasku J-pisteestä mitattuna."},
{"letter":"7","word":"T- ja U-aalto","text":"Muoto ja suunta."},
{"letter":"8","word":"QT-aika","text":"Kesto korjattuna syketaajuudella."}
]}
```

Laitteen automaattinen tulkinta mittaa hyvin taajuuden, johtumisajat ja akselin, mutta sillä on heikkoutensa: rytmihäiriöiden (esim. eteisvärinän) ja tahdistin-EKG:n tunnistus sekä QT-aika. Algoritmit on myös tarkoituksella viritetty herkiksi iskemialle, mikä lisää ylidiagnostiikkaa. Katso [rytmihäiriöt](topic:rytmihairiot), [EKG:n iskemiatulkinta](topic:ekg-ja-iskemia) ja [QT-aika](topic:rytmihairiot).

## Haarakatkokset

Kun toinen johtoradan päähaara on katki, toinen kammio aktivoituu toisen kautta sydänlihassoluja pitkin – kompleksi on **leveä (yli 120 ms) ja poikkeavan näköinen**.

| | Vasen haarakatkos (LBBB) | Oikea haarakatkos (RBBB) |
|---|---|---|
| V1 | Syvä S-aalto, voi olla QS (alaspäin) | RSR' – "pupunkorvat", M-muoto |
| Lateraalikytkennät (I, aVL, V5–V6) | Leveä, solmuinen R ylöspäin, ei Q-aaltoja | Leventynyt S-aalto |
| ST ja T | Vastakkaiseen suuntaan kuin QRS – vaikeuttaa iskemiatulkintaa | V1:ssä T-inversio, V5–V6:ssa T normaali |
| Taustalla | Verenpainetauti, sepelvaltimotauti, vajaatoiminta, kardiomyopatiat | Nuorilla usein harmiton; iäkkäillä sydänsairaudet; akuutisti keuhkoembolia tai LAD-tukos |

Haarakatkos voi olla krooninen (potilas ei välttämättä tiedä siitä), akuutti (infarkti, keuhkoembolia) tai toiminnallinen, nopeaan rytmiin liittyvä. **Leveän QRS:n muita syitä** ovat kammioperäinen rytmi, hyperkalemia, hypotermia, WPW ja tahdistinrytmi.

## ST- ja T-muutosten muut syyt

ST-nousu ei aina ole infarkti, ja T-aaltomuutosten syynä on useammin muu kuin iskemia.

| Löydös | Muita syitä kuin iskemia |
|---|---|
| ST-nousu | Varhainen repolarisaatio (tervesydämisellä, usein V4–V6), akuutti perikardiitti (laaja-alainen, ei suonialueen logiikkaa), LVH ja LBBB, kammioaneurysma, keuhkoembolia (III, V1–V2), hypotermia (J- eli Osbornin aalto), sydänpysähdyksen jälkitila, Takotsubo, Brugadan oireyhtymä (V1–V2), hyper- tai hypokalemia |
| T-inversio | Aivoverenvuoto (syvät T-inversiot), vasemman puolen kuormitus (I, aVL, V5–V6), oikean puolen kuormitus (V1–V3), haarakatkokset, WPW, takykardian jälkitila, hyperventilaatio, hypokalemia, nuoruusiän normaali variantti |

## Virhelähteet – rekisteröinnin laatu on ensihoitajan vastuulla

Useimmiten häiriön syy on inhimillinen tai ympäristön tekijä, ei laite.

- **Käsielektrodit ristissä**: P-aallot ja QRS negatiivisia kytkennöissä I ja aVL – näyttää oikealle kääntyneeltä akselilta.
- **Rintaelektrodit väärässä järjestyksessä tai väärällä korkeudella**: R-aallon kasvu V1→V4 ei etene loogisesti; väärin sijoitettu V1 vääristää P-aaltoa. Merkitse elektrodien paikat kevyesti ihoon, jotta kontrolli-EKG on vertailukelpoinen.
- **Lihasjännitys, vapina, palelu**: nopea perusviivan heilahtelu, joka voi muistuttaa lepatusaaltoja – siirrä raajaelektrodit raajojen tyviin.
- **Liike ja voimakas hengitys** (astma, hyperventilaatio, hikka): perusviivan vaellus voi näyttää ST-muutokselta.
- **50 Hz:n vaihtovirtahäiriö**: hienojakoinen tärinä, esim. potilaan koskiessa metalliin – tarkista elektrodit ja johdot, tarvittaessa suodatin.
- **Väärä kalibraatio** (1 mV = 20 mm) voi aiheuttaa virheellisen hypertrofiatulkinnan.

Kirjaa, onko EKG otettu **kivun aikana**, ja uusi nauha hoidon aikana.

## Muista tämä -kertaus

- PQ 120–200 ms, QRS alle 120 ms, QTc alle 440–460 ms, P alle 120 ms ja enintään 2,5 mm.
- Taajuus: 300 tai 600 jaettuna suurilla ruuduilla R–R-välissä.
- Akseli: I ja aVF ylöspäin = normaali; I ylös + aVF alas = vasemmalle; I alas + aVF ylös = oikealle.
- Leveä QRS: haarakatkos, kammioperäinen rytmi, hyperkalemia, hypotermia, WPW tai tahdistin.
- Huono tekniikka tuottaa vääriä löydöksiä – tarkista elektrodit ennen tulkintaa.
