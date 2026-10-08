## Mitä hypotermia tarkoittaa

Hypotermialla tarkoitetaan ydinlämmön laskua alle 35 °C:een. Tahattomalle hypotermialle altistavat vanhuus, kognitiivisten toimintojen heikkeneminen, päihteiden käyttö ja vammautuminen. Suomessa kylmäaltistukseen kuolee vuosittain kymmeniä ihmisiä. Myös vammapotilaan hypotermia on vaarallinen, koska se ruokkii [kuoleman kolmiota](topic:traumapotilaan-tutkiminen).

```media
{"widget":"scale","title":"Ydinlämpö – mitä se tarkoittaa?","label":"Ydinlämpö","unit":"°C","step":0.5,"value":31,"bands":[
{"from":13,"to":20,"label":"Syvä hypotermia","tone":"danger","text":"Alin lämpötila, josta potilas on selviytynyt, on 13,7 °C. Alle 20 °C: aivot sietävät verenkierron pysähtymistä jopa kymmenkertaisesti normaaliin verrattuna. Ajoittainen painelu mahdollinen (PPE-jakso 5 min, tauko enintään 10 min)."},
{"from":20,"to":25,"label":"Vaikea – elottomuus","tone":"danger","text":"Alle 25 °C seuraa yleensä kammiovärinä ja lopulta asystole. Kammiovärinä on resistentti defibrillaatiolle."},
{"from":25,"to":30,"label":"Vaikea","tone":"danger","text":"Alle 30 °C vaikeat rytmihäiriöt ovat mahdollisia ja varomaton liikuttelu voi laukaista kammiovärinän. Pysyvää pulsoivaa rytmiä ei todennäköisesti saada defibrilloimalla."},
{"from":30,"to":32,"label":"Kohtalainen","tone":"warning","text":"30–32 °C. Syke ja hengitys hidastuvat. Elvytyksessä yli 30 °C:ssa adrenaliinin antoväliä pidennetään 6–10 minuuttiin."},
{"from":32,"to":35,"label":"Lievä","tone":"warning","text":"32–35 °C. Estä lisäjäähtyminen ja lämmitä."},
{"from":35,"to":38,"label":"Ei hypotermiaa","tone":"ok","text":"Ydinlämpö 35 °C tai yli."}
]}
```

## Kylmä hidastaa – ja suojaa

Hypotermian syvetessä syke harvenee, ja ydinlämmön laskiessa alle 30 °C:n vaikeat rytmihäiriöt ovat mahdollisia. Alle 25 °C:ssa seuraa yleensä kammiovärinä ja lopulta asystole. Samalla kylmä vähentää hapenkulutusta ja suojaa aivoja: aivosolujen hapentarve vähenee lineaarisesti ydinlämmön laskiessa, ja 20 °C:ssa aivojen kyky sietää verenkierron pysähtymistä on jopa kymmenkertainen normaaliin verrattuna.

Siksi hypotermiasta tai kylmään veteen hukkumisesta johtuvasta sydänpysähdyksestä voi selvitä hyvin **pitkänkin elvytyksen** jälkeen. Pisin dokumentoitu elvytys, josta potilas toipui neurologisesti täysin, kesti 6,5 tuntia. Verenkierrollisesti vakaat vaikeasti hypotermiset potilaat selviävät hyvällä neurologisella lopputuloksella lähes aina, ja sydänpysähdyksen saaneista noin puolet, kun lämmitys tehdään sydän-keuhkokoneella.

## Elonmerkkien ja lämpötilan arviointi

> [!warning] Tarkkaile elonmerkkejä minuutin ajan
> Vaikeasti hypotermisen potilaan syke voi olla niin harva, että lyhyellä tarkastelulla äärimmäistä bradykardiaa tai PEA:ta voidaan luulla asystoliaksi. Elonmerkkejä tarkkaillaan tarvittaessa minuutin ajan ennen hoitopäätöksiä, apuna EKG ja kaikututkimus. Laajat pupillit eivät hypotermiassa tarkoita huonoa ennustetta.

- **Lämpötila mitataan** alhaisia lukemia mittaavalla lämpömittarilla **korvakäytävästä**, jos potilas hengittää itse, ja **ruokatorvesta**, jos potilaalla on intubaatioputki tai ruokatorvikanavallinen kurkunpäänaamari (Käypä hoito: Elvytys 2021).
- **Uhkaavan sydänpysähdyksen riskitekijät** – ydinlämpö alle 30 °C, kammioperäinen rytmihäiriö tai systolinen paine alle 90 mmHg – ohjaavat kuljetuksen suoraan sairaalaan, jossa on ECMO-valmius.
- **Käsittele varovasti.** Alle 30 °C:n ydinlämmössä varomaton liikuttelu voi laukaista kammiovärinän – varaudu aloittamaan elvytys välittömästi.
- Elintoiminnot voivat muistuttaa elottomuutta, vaikka käynnissä olisi perfusoiva rytmi; harvakin syke voi riittää verenkierron ylläpitoon.

## Elvytetäänkö?

Hypotermista sydänpysähdyspotilasta elvytetään, ellei elvytykselle ole selvää estettä.

```media
{"widget":"checklist","title":"Onko elvytykselle estettä?","prompt":"Merkitse, jos jokin seuraavista pitää paikkansa.","rule":{"type":"any"},"items":[
{"label":"Kuolemaan johtava vamma"},
{"label":"Tiedossa kuolemaan johtava perussairaus"},
{"label":"Elottomuus johtuu pitkittyneestä hapenpuutteesta"},
{"label":"Rintakehä on niin jäykkä, ettei sitä voi painella"},
{"label":"Auttajan oma turvallisuus ei ole varmistettavissa (esim. heikko jää)"}
],
"met":{"title":"Elvytyksestä voidaan pidättäytyä","text":"Arvio tehdään yhdessä ensihoitolääkärin kanssa. Sairaalassa apuna voi olla kalium: jos se on alle 8 mmol/l, elvytyksen jatkaminen voi olla mielekästä.","tone":"warning"},
"notMet":{"title":"Aloita elvytys","text":"Hypotermisesta sydänpysähdyksestä voi toipua pitkänkin elvytyksen jälkeen. Lämmitä aktiivisesti ja harkitse kuljetusta elvyttäen sairaalaan, jossa on sydän-keuhkokone tai ECMO.","tone":"ok"}}
```

## Elvytyksen erityispiirteet

| Asia | Hypotermisessa elvytyksessä |
|---|---|
| Defibrillaatio | Jos kammiovärinä jatkuu **kolmannen iskun jälkeen**, uusista iskuista pidättäydytään, kunnes ydinlämpö on yli 30 °C (Käypä hoito 2021). |
| Lääkkeet | Lääkevaste on heikentynyt ja vaikutusaika pitkittyy. **Adrenaliinista pidättäydytään alle 30 °C:ssa**; yli 30 °C:ssa adrenaliinin antoväli pidennetään **6–10 minuuttiin**. |
| Hengitystie | Rintakehän jäykkyyden vuoksi ventilointi voi olla vaikeaa – välitön intubaatio on perusteltua. |
| Painelu | Rintakehä voi olla jäykkä. [Mekaaninen paineluelvytyslaite](topic:elvytys-sairaalan-ulkopuolella) on suositeltava ja helpottaa kuljetusta. |
| Ajoittainen painelu | Jos laitetta ei ole ja painelijoita on vähän: ydinlämpö alle 28 °C tai tuntematon → 5 min PPE ja enintään 5 min tauko. Alle 20 °C → 5 min PPE ja tauko enintään 10 min. |

```media
{"widget":"flow","title":"Hypoterminen sydänpysähdys","steps":[
{"title":"Turvallisuus ja varovainen käsittely","text":"Älä mene heikolle jäälle ilman suojavarustusta. Siirrä potilasta varoen – liikuttelu voi laukaista kammiovärinän.","tone":"warning"},
{"title":"Elonmerkit minuutin ajan","text":"EKG ja kaikututkimus apuna. Harva syke voi näyttää asystolelta.","tone":"neutral"},
{"title":"Elvytys ja ydinlämmön mittaus","text":"Elonmerkit enintään 1 min. Lämpö ruokatorvesta (intuboitu). Normaali painelu ja ventilaatio, mekaaninen paineluelvytys kuljetusta varten.","tone":"neutral"},
{"title":"Alle 30 °C: rajoita iskut ja lääkkeet","text":"Enintään 3 iskua, ei adrenaliinia. Yli 30 °C: iskut jatkuvat, adrenaliini 6–10 min välein.","tone":"danger"},
{"title":"Kuljetus elvyttäen lämmitykseen","text":"Sairaalaan, jossa on ECMO (ensisijainen) tai sydän-keuhkokone. Ennakkoilmoitus hyvissä ajoin.","tone":"ok"}
]}
```

## Lämmittäminen

Sydänpysähdykseen johtaneen hypotermian ensisijainen hoito on verenkierron ylläpito ja lämmitys ensisijaisesti **ECMO:lla** ja toissijaisesti **sydän-keuhkokoneella** (Käypä hoito 2021). Hypotermian korjauduttua spontaani verenkierto palaa usein. Aktiivinen lämmittäminen aloitetaan ajoissa, ja tarvittaessa siirrytään elvytystä jatkaen yliopistosairaalaan.

Jos kehonulkoista verenkiertoa ei ole saatavilla, potilasta voidaan lämmittää myös rinta- ja vatsaontelon lämpimillä huuhteluilla, hemodialyysillä, lämpöelementeillä, peitteillä ja puhaltimilla sekä lämpimillä infuusioilla. Suomessa on kuvattu useita tapauksia, joissa potilas on toipunut ilman kehonulkoista verenkiertoa avoimen sydänhieronnan ja rintaontelon huuhtelun avulla.

> [!tip] Tapaus järveltä
> Pilkkijät kuulivat avunhuutoja: kaatuneen soutuveneen laidasta roikkui kolme miestä. Yksi vajosi veden alle, ja elvytys aloitettiin rannassa noin 10 minuutin elottomuuden jälkeen. Rytmi oli kammiovärinä, ruokatorvesta mitattu lämpö 20 °C. Kolmen kierroksen jälkeen potilas kuljetettiin mekaanisella paineluelvytyslaitteella yliopistosairaalaan, jossa hänet lämmitettiin ECMO:lla. 31 °C:ssa kammiovärinä kääntyi yhdellä iskulla, ja potilas kotiutui seitsemän viikon kuluttua neurologisesti täysin toipuneena.

## Muista tämä -kertaus

- Hypotermia: ydinlämpö alle 35 °C – lievä 32–35, kohtalainen 30–32, vaikea alle 30 °C.
- Alle 30 °C rytmihäiriöt ovat mahdollisia ja liikuttelu voi laukaista kammiovärinän; alle 25 °C seuraa yleensä kammiovärinä ja asystole.
- Elonmerkkejä tarkkaillaan enintään minuutin ajan; lämpö korvakäytävästä (hengittää) tai ruokatorvesta (intuboitu).
- Alle 30 °C: enintään kolme iskua, ei adrenaliinia; yli 30 °C adrenaliini 6–10 min välein.
- Mekaaninen paineluelvytyslaite ja kuljetus elvyttäen ECMO- (tai sydän-keuhkokone-) lämmitykseen.
- Kylmä suojaa aivoja – pitkästäkin elottomuudesta voi toipua hyvin.
