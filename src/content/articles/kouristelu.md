## Kouristelu ensihoidossa

Kouristelu on yksi tavallisimmista ensihoidon hälytyssyistä. Yleensä kohtaus on lyhyt, enintään muutamia minuutteja, ja epilepsiaan liittyy muutaman minuutin jälkiunivaihe, jonka jälkeen potilas orientoituu. **Pitkittyneenä kouristeluna pidetään yli viiden minuutin jatkuvaa koko kehon kouristelua** – se on aina välitöntä hoitoa vaativa tilanne, koska se aiheuttaa hapenpuutetta, metabolista asidoosia ja aspiraation ja vammautumisen riskin, ja aivot ovat alttiina hapenpuutteen aiheuttamalle vauriolle (Lund, Duodecim Ensihoito-opas 2023).

- Sydänpysähdyksen alkuun ja tavalliseen pyörtymiseen voi liittyä muutaman sekunnin raajojen nykinää – se ei ole epileptinen kohtaus.
- Kohtaus voi olla myös poissaolo tai yhden raajan nykiminen (paikallisalkuinen).
- **Pitkittyneen kohtauksen** erottaminen jälkiunesta voi olla vaikeaa: silmäterät ovat usein laajat, silmissä on epätarkoituksenmukaista liikettä, värvettä tai luomien nykinää.
- Primaari epilepsia alkaa yleensä lapsena tai nuorena. **Aikuisen ensimmäisen kouristuksen** taustalla on yleensä muu syy: aivoverenkiertohäiriö, vieroitusoireet, myrkytys, hypoglykemia, elektrolyyttihäiriö tai infektio.
- **Kuumekouristus** on tyypillinen 0,5–4-vuotiaalla.

## Hoito portaittain

```media
{"widget":"timeline","title":"Kouristelun lääkehoito (Ensihoito-opas)","items":[
{"time":"0–5 min","title":"Ensiarvio ja verensokeri","text":"Hengitystie auki, happi (SpO₂ yli 94 %), suojaa vammoilta. Verensokeri – tavoite yli 3 mmol/l.","tone":"neutral"},
{"time":"1. vaihe","title":"Midatsolaami limakalvolle","text":"Bukkaalisesti tai nenään: aikuiselle 10 mg, lapselle painon mukaan.","tone":"warning"},
{"time":"2. vaihe","title":"Bentsodiatsepiini i.v. tai i.m.","text":"Midatsolaami 2,5–5 mg i.v. tai loratsepaami 0,1 mg/kg (enintään 4 mg) i.v. tai i.m.","tone":"warning"},
{"time":"3. vaihe","title":"Levetirasetaami","text":"Aikuiselle 60 mg/kg (2–4,5 g), lapselle (6 kk–16 v) 40 mg/kg (enintään 2 g).","tone":"danger"},
{"time":"Ellei vastetta","title":"Anestesiaintubaatio","text":"Lääkäriyksikkö – lopettaa kouristelun ja turvaa hengityksen.","tone":"danger"}
]}
```

Tarkennetussa tutkimuksessa selvitetään tapahtumatiedot (epilepsia, infektio-oireet, edeltävä päänsärky, päihteet), neurologiset puolierot, pupillat ja Babinskin heijaste sekä mahdollisuuksien mukaan elektrolyytit (Na, K, ionisoitu Ca) vieritestinä. Katso myös [tajuttomuus](topic:tajuttomuus) ja [alkoholin väärinkäyttö](topic:alkoholin-vaarinkaytto).

## Kuljetus vai kotiin?

**Kuljetetaan**:
- tuntemattomasta syystä tai pitkään kouristellut tai yhä kouristeleva → vähintään keskussairaala
- **ensimmäisen kouristuskohtauksensa saanut**, vaikka olisi jo oireeton
- vieroituskouristus, jos uusiutumisen riski tai kyvyttömyys huolehtia itsestä on ilmeinen.

**Voidaan jättää kotiin** epilepsiapotilas tai alkoholin vieroitukseen liittyvän kohtauksen saanut, jos kaikki täyttyvät: kohtaus oli lyhyt (alle 5 min), meni ohi itsestään tai alkulääkkeellä, potilas on orientoitunut ja hänellä on aikuista seuraa, ja uusiutumisriski on vähäinen. Kuumekouristuksen saanut lapsi voidaan jättää kotiin samoin ehdoin, jos hän on kouristellut aiemminkin eikä infektio vaadi lääkärin tutkimusta. Kuumekouristuksessa, jossa kouristelu ei täysin lopu tai tajunta jää alentuneeksi, lapsi kuljetetaan kylkiasennossa lisähapen kanssa.

```media
{"widget":"checklist","title":"Voiko epilepsia- tai vieroituskouristuksen saaneen jättää kotiin?","prompt":"Ehtojen on täytyttävä kaikkien. Merkitse ne, jotka täyttyvät.","rule":{"type":"atLeast","n":5},"items":[
{"label":"Diagnosoitu epilepsia tai alkoholin vieroitukseen liittyvä kohtaus"},
{"label":"Kouristus oli lyhyt (alle 5 min)"},
{"label":"Meni ohi itsestään tai alkulääkkeellä ennen ensihoidon saapumista"},
{"label":"Potilas on orientoitunut ja hänellä on aikuista seuraa"},
{"label":"Uusiutumisen riski arvioidaan vähäiseksi"}
],
"met":{"title":"Kotiin jättäminen on mahdollista","text":"Selvitä vielä hoidon olosuhteet: yhteys hoitavaan lääkäriin, kotihoito-ohjeet ja ohje hakeutua hoitoon kohtausten toistuessa. Kirjaa arvio.","tone":"ok"},
"notMet":{"title":"Kuljeta päivystykseen","text":"Jos yksikin ehto puuttuu – tai kyseessä on ensimmäinen kohtaus, tuntematon syy tai pitkittynyt kouristelu – potilas kuljetetaan.","tone":"warning"}}
```

```media
{"widget":"scene-card","id":"kouristelu","title":"Kohteessa: kouristeleva potilas","know":[
{"label":"Yli 5 min jatkuva koko kehon kouristelu = pitkittynyt"},
{"label":"Lääkeportaat","detail":"Midatsolaami limakalvolle 10 mg → bentsodiatsepiini i.v./i.m. → levetirasetaami → anestesiaintubaatio."},
{"label":"Aikuisen ensimmäinen kohtaus","detail":"Syy on yleensä muu kuin epilepsia: AVH, vieroitus, myrkytys, hypoglykemia, hyponatremia, aivovamma, kasvain, infektio."},
{"label":"Lyhyt nykinä pyörtymisen tai sydänpysähdyksen alussa ei ole epileptinen kohtaus"},
{"label":"Ajalliset tavoitteet","detail":"Ensiarvio ja verensokeri alle 5 min, kouristelu loppuu 6–15 min, kuljetus alkaa 16–30 min."}
],"examine":[
{"label":"Hengitystie, SpO₂, hengitys"},
{"label":"Verensokeri heti","detail":"Tavoite yli 3 mmol/l."},
{"label":"Jatkuuko kohtaus?","detail":"Laajat pupillat, epätarkoituksenmukaiset silmänliikkeet, silmävärve, luomien nykinä."},
{"label":"Tapahtumatiedot silminnäkijöiltä","detail":"Kesto, alku, epilepsia, infektio-oireet, edeltävä päänsärky, päihteet."},
{"label":"Neurologiset puolierot, pupillat, Babinski"},
{"label":"Vammat; elektrolyytit (Na, K, Ca) vieritestinä"}
],"do":[
{"label":"Kylkiasento, pää suorassa, nieluputki tai manuaalinen aukipito"},
{"label":"Lisähappi, tarvittaessa ventilaatio palkeella"},
{"label":"Bukkaalinen tai nasaalinen midatsolaami"},
{"label":"Suoniyhteys ja seuraavat lääkeportaat"},
{"label":"Hypoglykemian korjaus"},
{"label":"Kuljetuspäätös kriteerien mukaan"}
],"redFlags":["Kouristelu jatkuu yli 5 minuuttia tai uusii","Tajunta ei palaudu kohtauksen jälkeen","Ensimmäinen kohtaus, infektio-oireet tai edeltävä päänsärky","Puoliero kohtauksen jälkeen"]}
```

## Muista tämä -kertaus

- Yli 5 min jatkuva kouristelu = pitkittynyt, hoidetaan heti.
- Mittaa aina verensokeri.
- Midatsolaami limakalvolle 10 mg → bentsodiatsepiini i.v./i.m. → levetirasetaami → intubaatio.
- Aikuisen ensimmäinen kouristus: etsi syy ja kuljeta aina.
- Lyhytkestoinen nykinä pyörtymisen tai sydänpysähdyksen alussa ei ole epileptinen kohtaus.
