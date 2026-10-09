## Mitä sokki tarkoittaa

Kudosten normaali hapensaanti vaatii riittävän kaasujenvaihdon, riittävän sydämen minuuttitilavuuden, esteettömän verenkierron sekä riittävästi punasoluja ja kiertävää verta. Kun jokin näistä pettää, elimistö yrittää ensin kompensoida. **Sokki eli verenkiertovajaus** syntyy, kun kompensaatio ei enää riitä ja kudosten hapensaanti on uhattuna. Solut siirtyvät anaerobiseen aineenvaihduntaan, laktaattia kertyy ja elimistö happamoituu.

Sokki jaetaan syntymekanismin mukaan neljään tyyppiin. Mekanismit eivät sulje toisiaan pois – samalla potilaalla voi olla useamman tyypin piirteitä. Tehohoidossa noin kaksi kolmesta sokista on septisiä, ja septisen ja kardiogeenisen sokin kuolleisuus on jopa 40–60 %.

| Tyyppi | Mekanismi | Esimerkkejä |
|---|---|---|
| **Hypovoleeminen** | Veri- tai plasmavolyymin menetys | Verenvuoto, oksentelu ja ripuli, palovamma |
| **Kardiogeeninen** | Sydämen pumppaustoiminnan pettäminen | Laaja infarkti, rytmihäiriö, sydänlihassairaus, myrkytys, elvytyksen jälkitila |
| **Obstruktiivinen** | Este verenkierrossa | Keuhkoembolia, sydäntamponaatio, jänniteilmarinta |
| **Distributiivinen** | Suonten laajeneminen ja vuotavuus – nestettä on, mutta väärässä paikassa | Sepsis, anafylaksia, palovamma, neurogeeninen (selkäydinvamma) |

## Tunnistaminen

Alkavaa sokkia elimistö kompensoi nostamalla sykettä ja iskutilavuutta, kiihdyttämällä hengitystä ja keskittämällä verenkierron: iho viilenee, kapillaaritäyttö hidastuu ja virtsaa erittyy vähemmän. Huonontunut aivoperfuusio näkyy levottomuutena, pelkona ja hermostuneisuutena. Kun kompensaatio pettää, seuraavat takykardia, hypotensio, hikinen ja viileä iho, korkea hengitystaajuus, jano, heikotus, pahoinvointi ja tajunnan tason lasku.

> [!warning] Normaali verenpaine ei sulje pois sokkia
> Nuorella kompensaatio ylläpitää verenpainetta pitkään, ja verenpainetautisella "normaali" lukema voi olla jo matala. Verenkiertovajaukseen liittyy aina kudosperfuusion häiriö – tutki iho, kapillaaritäyttö, tajunta ja polvien **marmoroituminen** (mottling).

```media
{"widget":"shock-skin"}
```

**Sokki-indeksi** on syke jaettuna systolisella verenpaineella. Normaalisti se on noin 0,5–0,7; 0,8–0,9 viittaa uhkaavaan sokkiin ja yli 1,0 sokkiin, jolloin syke on noussut systolista painetta korkeammaksi. **Laktaatti** kuvaa anaerobista aineenvaihduntaa, ja sitä käytetään sekä diagnostiikassa että hoitovasteen seurannassa.

```media
{"widget":"shock-index"}
```

## Mihin hoidolla vaikutetaan

Kudosten hapentarjonta riippuu veren happisaturaatiosta, hemoglobiinista ja sydämen minuuttitilavuudesta (syketaajuus × iskutilavuus). Iskutilavuuteen vaikuttavat täyttö (esikuorma), vastus (jälkikuorma) ja supistuvuus.

```media
{"widget":"matching","title":"Mihin hoito vaikuttaa?","pairs":[
{"left":"Happisaturaatio","right":"Lisähappi (FiO₂), CPAP / PEEP"},
{"left":"Hemoglobiini","right":"Punasolut"},
{"left":"Täyttö (esikuorma)","right":"Nestebolus"},
{"left":"Vastus (jälkikuorma)","right":"Noradrenaliini (alfa-reseptorit)"},
{"left":"Supistuvuus","right":"Dobutamiini (inotrooppi)"},
{"left":"Syketaajuus","right":"Dopamiini, adrenaliini (beeta₁-reseptorit)"}
]}
```

### Nesteytys ja nestevaste

Verenkiertovajauksen ensilinjan hoito on viiveetön suonensisäinen nesteytys – alkuvaiheessa kirkasta balansoitua liuosta noin 20 ml/kg (Wilkman ja Kuitunen 2018). Ensihoidossa nestettä annetaan **Ringeriä 250–500 ml nopeasti, minkä jälkeen vaste arvioidaan** ja tarvittaessa toistetaan. Nestehoidon tarkoitus on lisätä sydämen täyttöä, jotta iskutilavuus kasvaisi – mutta vain noin puolet sokkipotilaista on **nestevasteisia**. Kun sydän on Frank–Starlingin käyrän laakealla osalla, lisäneste ei enää kasvata iskutilavuutta vaan aiheuttaa turvotuksia ja jopa keuhkopöhön.

```media
{"widget":"frank-starling"}
```

Jos nestekokeilun vaste jää vajaaksi, aloitetaan **noradrenaliini-infuusio** tavoitteena keskiverenpaine (MAP) noin 65 mmHg. Pumppausvajauksessa harkitaan inotrooppia (dobutamiini).

## Sokin yleishoito ensihoidossa

```media
{"widget":"flow","title":"Sokkipotilaan yleishoito","steps":[
{"title":"1. Etsi syy","text":"Mekanismi, anamneesi, oireet ja löydökset – syy ohjaa hoitoa.","tone":"neutral"},
{"title":"2. Hapentarjonta","text":"Lisähappi varaajamaskilla, tarvittaessa CPAP tai NIV.","tone":"neutral"},
{"title":"3. Nestekokeilu","text":"Ringer 250–500 ml nopeasti → arvioi vaste ja toista tarvittaessa. Vuotava potilas: verituotteet, ei runsaasti kirkkaita, TXA.","tone":"warning"},
{"title":"4. Asentohoito","text":"Jalat koholle.","tone":"neutral"},
{"title":"5. Vajaa vaste → noradrenaliini","text":"Infuusio esim. 5–20 (–50) ml/h hoito-ohjeen mukaan, tavoite MAP 65 mmHg.","tone":"warning"},
{"title":"6.–8. Vähennä hapenkulutusta","text":"Rauhoittaminen ja ponnistelun välttäminen, lämpötalous, kivunhoito.","tone":"neutral"},
{"title":"Syyn mukainen hoito ja kuljetus","text":"Lantiovyö, kardioversio, torakostomia… Monitoroitu kuljetus lopulliseen hoitopaikkaan.","tone":"ok"}
]}
```

## Sokkityyppien erityispiirteet

### Hypovoleeminen sokki

Taustalla on verenvuoto (ulkoinen tai sisäinen) tai kuivuminen. Aikuisella noin litran vuoto (yli 20 % verimäärästä) aiheuttaa jo sokin oireita. Vuodossa menetetään myös hemoglobiinia – **vuotava potilas tarvitsee korvaukseksi verta**. Kirkkailla nesteillä ei "läträtä": suonensisäinen nesteytys on olennainen osa hoitoa vasta, kun vuoto on hallinnassa.

- **Ulkoiset vuodot**: kiristysside, painesidos, hemostaattinen side, haavan pakkaaminen.
- **Sisäiset vuodot**: maltillinen nestehoito verituotteilla, lantiovyö, traneksaamihappo ja välitön kuljetus kirurgiseen hemostaasiin.
- **Vammapotilaan verenpainetavoitteet** (Kettunen): lävistävässä vammassa systolinen noin 80 mmHg (radialispulssi tuntuu), jopa 60–70 mmHg voi riittää; tylpässä vammassa noin 80 mmHg. **Poikkeus on aivovamma**: MAP yli 80 mmHg (systolinen 110–120).
- Muista **kuoleman kolmio**: asidoosi, hypotermia ja koagulopatia ruokkivat toisiaan.

```media
{"widget":"death-triad"}
```

Katso myös [massiivinen verenvuoto ja verensiirto](topic:massiivinen-verenvuoto).

### Kardiogeeninen sokki

Sydämen pumppausvoima pettää: sydäninfarkti, hidas tai nopea rytmihäiriö, sydänvamma, myrkytys tai elvytyksen jälkeinen sydänlihaksen lamaantuminen. Tunnistamisessa korostuvat EKG ja anamneesi; etuseinäinfarktiin liittyvä uusi haarakatkos ennakoi usein sokkia. Iskemiassa tärkeintä on sydänlihaksen perfuusion palauttaminen (PCI). Rytmihäiriössä palautetaan riittävä syke kardioversiolla tai ulkoisella tahdistuksella. Lamaantuneen sydänlihaksen tukena varovaiset nesteboluksia ja inotrooppia. **Ei beetasalpausta eikä nitroa.** Katso [rintakipu ja AKS](topic:rintakipu-ja-aks).

### Obstruktiivinen sokki

Este verenkierrossa: massiivinen keuhkoembolia, sydäntamponaatio tai jänniteilmarinta. Muista poiketen **kaulalaskimot ovat usein pullottavat**, koska laskimopaluu estyy. Hoitona esteen poisto – neulatorakosenteesi tai torakostomia, perikardiosenteesi tai torakotomia, keuhkoembolian liuotushoito – ja verenkierron tukeminen. Katso [ilmarinta](topic:ilmarinta) ja [keuhkoembolia](topic:keuhkoembolia).

### Distributiivinen sokki

Nestettä on, mutta väärässä paikassa: suonet laajenevat, niiden läpäisevyys kasvaa ja neste karkaa kudoksiin. Yhteistä on mahdollinen **lämmin periferia** ("lämmin sokki"), joka ei kuitenkaan toteudu läheskään aina.

| | Hoidon ydin |
|---|---|
| **Anafylaktinen** | Altistuksen poisto, ilmatie ja happi, adrenaliini 0,5 mg i.m. (vaikeassa tilanteessa lääkärin ohjeella 0,05 mg i.v. boluksina), nesteet, kortisoni. Ks. [anafylaksia](topic:ylahengitystien-tukos-anafylaksia). |
| **Septinen** | Happi, CPAP/NIV, runsas i.v.-nesteytys alkuvaiheessa, noradrenaliini, varhaiset antibiootit. Ks. [sepsis](topic:infektiosairaudet). |
| **Palovamma** | Turvotus ja haihtuminen ihon läpi, mahdollinen häkä- tai palokaasumyrkytys. Happi 100 %, i.v.-nesteytys (esim. 1000 ml/h kahden ensimmäisen tunnin ajan), lämpötalous, kivunhoito. Ks. [palovamma](topic:palovamma). |
| **Neurogeeninen** | Selkäydinvammaan liittyvä harvinaisempi muoto. ETC:n mukaan se syntyy yli T6-tason vammassa: sympaattinen hermotus katoaa, ääreissuonet laajenevat ja verenpaine laskee. Yli T2-tason vammassa mukana on myös **bradykardia**, koska sydämen sympaattinen hermotus menetetään. Ei sekoiteta selkäydinsokkiin. Hoitona voidaan tarvita vasopressoreita; glukoosia sisältäviä nesteitä ei anneta. |

```media
{"widget":"scene-card","id":"sokki","title":"Kohteessa: sokkipotilas","know":[
{"label":"Neljä tyyppiä","detail":"Hypovoleeminen, kardiogeeninen, obstruktiivinen, distributiivinen."},
{"label":"Normaali verenpaine ei sulje pois sokkia"},
{"label":"Vain noin puolet on nestevasteisia"},
{"label":"Kardiogeenisessä ei beetasalpausta eikä nitroa"}
],"examine":[
{"label":"Iho, kapillaaritäyttö, polvien marmoroituminen"},
{"label":"Tajunta ja levottomuus"},
{"label":"Sokki-indeksi (syke / systolinen)"},
{"label":"Kaulalaskimot – pullottavat obstruktiivisessa"},
{"label":"Syyn etsintä: vuoto, EKG, infektio, allergia, vamma"}
],"do":[
{"label":"Happi ja tarvittaessa CPAP tai NIV"},
{"label":"Nestekokeilu 250–500 ml ja vasteen arvio"},
{"label":"Vajaa vaste → noradrenaliini, tavoite MAP 65 mmHg"},
{"label":"Vuotava potilas: verta, ei runsaasti kirkkaita"},
{"label":"Syyn mukainen hoito ja lämpötalous"}
],"redFlags":["Sokki-indeksi yli 1","Marmoroituminen","Tajunnan lasku","Pullottavat kaulalaskimot ja hypotensio"]}
```

## Muista tämä -kertaus

- Sokki = kudosten riittämätön hapensaanti; tyypit hypovoleeminen, kardiogeeninen, obstruktiivinen ja distributiivinen.
- Normaali verenpaine ei sulje pois sokkia – katso iho, kapillaaritäyttö, tajunta, marmoroituminen ja sokki-indeksi.
- Nestekokeilu 250–500 ml ja vasteen arvio; vain noin puolet on nestevasteisia – vajaa vaste → noradrenaliini, MAP 65.
- Vuotava potilas tarvitsee verta, ei runsaasti kirkkaita; aivovammassa MAP yli 80.
- Kardiogeeninen: ei beetasalpausta eikä nitroa. Obstruktiivinen: pullottavat kaulalaskimot, poista este.
