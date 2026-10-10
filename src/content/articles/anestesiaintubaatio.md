## Ensihoitajan ja lääkärin yhteinen toimenpide

Perus- ja hoitotason ensihoitajat avaavat tajuttoman potilaan hengitystien manuaalisesti, kääntävät kylkiasentoon, asettavat nieluputken ja tukevat hengitystä naamari-paljeventilaatiolla; tarvittaessa käytetään supraglottista välinettä. Ensihoitajien tutkimuksissa ilmatie on varmistettu luotettavammin supraglottisilla välineillä kuin intubaatioputkella, koska yksittäiselle ensihoitajalle kertyy intubaatiotoistoja harvoin. **Anestesiaintubaatio** on Suomessa pyritty keskittämään lääkäriyksiköille, ja se on niiden yleisin vaativa toimenpide – lääkärihelikopterin potilaista noin viidesosa intuboidaan.

Ensihoitajalla on prosessissa keskeinen rooli: valmistautuminen, esihappeutus, lääkkeet, monitorointi ja avustaminen.

## Miksi toimenpide on riskialtis

Potilaat ovat heterogeeninen ja kriittisesti sairas joukko: neurologisia hätätiloja noin 31 %, sydänpysähdyksestä elvytettyjä 23 %, traumapotilaita 23 % ja muita (myrkytykset, hukuksiin joutuminen, vaikea hengitysvajaus) 23 %. Noin neljäsosalla on merkittävä hypoksia ja neljäsosalla verenkiertosokki.

Hengitystien varmistaminen nykymenetelmillä onnistuu harvoin huonosti – suurin haaste on **elintoimintojen vakaus**. Anesteetti ja mekaanisen ventilaation aloitus horjuttavat verenkiertoa, ja potilas on altis hypoksialle. Aivovammapotilaalla verenpaineen lasku ensihoidon aikana liittyy vahvasti huonoon selviytymiseen, ja huonosti toteutettu toimenpide on lisännyt aivovammapotilaiden kuolleisuutta. **Neurokriittisellä potilaalla** tärkeintä on hemodynamiikan vakaus ja normoventilaatio.

## Vakioitu prosessi

Anestesiaintubaatio on kokonaisuus, joka alkaa ensimmäisen yksikön kohdattua potilaan ja päättyy vasta luovutukseen sairaalassa. Vakioitu protokolla ja tarkistuslistat ovat parantaneet laatua merkittävästi: suomalaisessa lääkärihelikopterissa intubaatio onnistuu ensimmäisellä yrityksellä 98 %:ssa.

```media
{"widget":"flow","title":"Anestesiaintubaation vaiheet","steps":[
{"title":"Päätös ja taktiikka","text":"Intuboidaanko kohteessa, ambulanssissa vai matkalla? Ensihoitajat valitsevat intubaatiopaikan ja valmistautuvat työlistan mukaan.","tone":"neutral"},
{"title":"Monitorointi","text":"EKG, SpO₂ eri käteen kuin verenpainemansetti, NIBP 2–3 min välein tai kajoava paine (neurokriittisillä aina ennen induktiota). Kapnografi valmiina.","tone":"neutral"},
{"title":"Esihappeutus vähintään 3 min","text":"100 % happi tiiviillä maskilla (palkeessa PEEP-venttiili ja varaajapussi, 15 l/min) tai NIV. Jos SpO₂ jää alle 98 % suurellakin happipitoisuudella, NIV. Happiviikset 15 l/min koko intubaation ajan.","tone":"warning"},
{"title":"Tarkistuslista ja induktio","text":"Verenkierron tuki valmiiksi (noradrenaliini). Esim. esketamiini 1 mg/kg (sokkiselle vähemmän) tai propofoli, neurokriittiselle fentanyyli n. 3 µg/kg, rokuroni 1 mg/kg.","tone":"warning"},
{"title":"Intubaatio","text":"40–60 s rokuronista. Videolaryngoskooppi ja bougie, imu tarvittaessa (SALAD). Keskeytä, jos näkymää ei saada tai SpO₂ laskee alle 93 %.","tone":"danger"},
{"title":"Varmista ja vakauta","text":"Putken paikka aina kapnografialla. Kiinnitys laskimopaluuta estämättä. Ventilaattori, jatkosedaatio, normoventilaatio CO₂-ohjatusti.","tone":"ok"}
]}
```

## Tarkistuslista

Tarkistuslista käydään läpi juuri ennen induktiota haaste–vastaus-periaatteella. Se vie harvoin yli 30 sekuntia, ja se on osoittautunut tehokkaaksi virheiden pysäyttäjäksi (Sydney HEMS -manuaali).

```media
{"widget": "checklist", "title": "Anestesiaintubaation tarkistuslista (FinnHEMS 16.5.2020)", "prompt": "Käy lista läpi haaste–vastaus-periaatteella: yksi lukee kohdan, vastuuhenkilö vastaa.", "rule": {"type": "atLeast", "n": 20}, "items": [{"label": "Tutkimus – huomioitu"}, {"label": "Neurologia – huomioitu"}, {"label": "Taktiikka – 2 yritystä, saturaatioraja 93 %, varalla i-Gel, hätäsuunnitelma kriko / poikkeava suunnitelma"}, {"label": "Esihappeutus – käynnissä / happiviikset / NIV"}, {"label": "Asento – optimoitu / korjataan"}, {"label": "EKG – rytmi ja taajuus / vaatii toimenpiteitä"}, {"label": "Verenpaine – systolinen ja automaatilla / vaatii toimenpiteitä"}, {"label": "Happisaturaatio – arvo / vaatii toimenpiteitä"}, {"label": "Kapnometri – valmiina"}, {"label": "Hengityspalje – testattu"}, {"label": "Imu – testattu"}, {"label": "Intubaatioputki – koko, liukastettu ja testattu"}, {"label": "Laryngoskooppi – valmiina, kieli"}, {"label": "Viejä – bougie / kara / ei tarvetta"}, {"label": "Varmistusvälineet – UÄ / stetoskooppi / kapno"}, {"label": "Kiinnitys – teippi / kanttinauha / muu"}, {"label": "Happi – riittävästi"}, {"label": "Lääkereitti – toimiva IV / toimiva IO"}, {"label": "Lääkkeet – vedetyt lääkkeet, ruiskut merkitty"}, {"label": "Työnjako – intubaatio, avustaja, lääkkeet, monitori, imu, kaularanka, muu?"}], "met": {"title": "Kenelläkään lisättävää? – Tarkistuslista valmis", "text": "Ilmoita induktion aika ääneen. Kirjaa poikkeamat.", "tone": "ok"}, "notMet": {"title": "Tarkistuslista kesken", "text": "Älä aloita induktiota ennen kuin jokainen kohta on kuitattu.", "tone": "warning"}}
```

## Esihappeutus – kriittinen potilasturvallisuusasia

Induktion ja onnistuneen intubaation välillä potilas on keuhkojen happivaraston varassa. Esihappeutus kestää vähintään 3 minuuttia; jos se keskeytyy ja potilas hengittää välillä huoneilmaa, laskenta aloitetaan alusta.

- **Positiivinen paine** avaa atelektaaseja ja on ainoa tehokas keino, jos potilaalla on merkittävä ventilaatio-perfuusioepäsuhta (SpO₂ alle 98 % suurellakin happipitoisuudella). Siksi NIV on hyvä esihappeutusmenetelmä.
- Naamari-paljesysteemissä on oltava **PEEP-venttiili** – ilman sitä useimmat kertakäyttöpalkeet eivät anna spontaanisti hengittävälle potilaalle korkeaa happifraktiota.
- **Neurokriittistä potilasta ventiloidaan** esihappeutuksen aikana, koska hiilidioksidin nousu nostaa kallonsisäistä painetta.
- Pääpuolen kohottaminen noin 30 astetta (jos verenpaine sallii) tehostaa esihappeutusta ja alentaa kallonsisäistä painetta.
- Hengitystien on pysyttävä auki – ensihoitaja pitää maskia kaksin käsin lääkärin ohjeiden mukaan.

## Ensimmäisen yrityksen optimointi

| Tekniikka | Miksi |
|---|---|
| Videolaryngoskooppi | Parantaa ensimmäisen yrityksen onnistumista ja vähentää komplikaatioita |
| Bougie (pitkä viejä) | Parempi kuin jäykkä kara – putki liu'utetaan bougieta pitkin |
| Lihasrelaksaatio | Kaikille elossa oleville intuboitaville – parhaat olosuhteet |
| Asento | Koroke pään alle, lihavalla myös hartioiden alle – korvakäytävä rintalastan tasolle |
| Imu (SALAD) | Epäonnistumisen yleisin syy ei ole anatomia vaan veri, oksennus tai vierasesine – iso imukatetri jätetään ruokatorveen |
| Hiilidioksidi | Putken sijainti varmistetaan aina kapnografialla |

> [!danger] Kapnografi ei piirrä?
> Havaitsematta jäänyt ruokatorvi-intubaatio on epätodennäköinen mutta todennäköisesti kuolemaan johtava. Ellei kapnografi piirrä eikä teknistä syytä löydy heti, tehdään uusi laryngoskopia – ja ellei varmuutta saada, putki poistetaan ja palataan naamari- tai NIV-ventilaatioon.

```media
{"widget":"flow","title":"Kun intubaatio ei onnistu","steps":[
{"title":"1. yritys keskeytetään","text":"Ei näkyvyyttä korjaavista toimista huolimatta tai SpO₂ alle 93 %. Ventiloi (NIV/naamari-palje) ja korjaa asento.","tone":"warning"},
{"title":"2. yritys","text":"Enintään kaksi intubaatioyritystä.","tone":"warning"},
{"title":"Varasuunnitelma: i-gel","text":"Ventilointi supraglottisen välineen kautta koko ensihoitovaiheen ajan.","tone":"warning"},
{"title":"Naamari-palje tai NIV","text":"Jos i-gel ei tiivisty.","tone":"danger"},
{"title":"Hätäsuunnitelma: kirurginen hengitystie","text":"Kun potilasta ei saada intuboitua eikä ventiloitua.","tone":"danger"}
]}
```

## Käsiventilaatio – perustaito, joka pelastaa

Davies (Respiratory Care) korostaa, että naamari-paljeventilaatio on epäonnistuneen intubaation varasuunnitelman ydin – ja vaikea taito: noviisi tarvitsee 25–30 harjoituskertaa.

- **Kahden käden ote** on tehokkaampi kuin yhden hengen tekniikka, jos auttajia on riittävästi – erityisesti lihavilla.
- **Kertatilavuus noin 500–600 ml** riittää ja vähentää ilman pääsyä mahalaukkuun. Elvytyspalkeet voivat antaa jopa 2 litraa, jos ne puristetaan tyhjiksi – liiallinen tilavuus ja paine täyttävät mahalaukun, nostavat palleaa ja lisäävät aspiraatioriskiä.
- **Nenänieluputki** sopii myös potilaalle, jolla on nieluheijaste, trismus tai suun vamma. Pituus mitataan nenänpäästä korvalehden tasolle tai leukakulmaan.
- **Vaikean maskiventilaation riskit (MOANS)**: Mask seal (parta, veri, kasvovammat), Obesity/Obstruction (myös loppuraskaus), Age, No teeth, Stiff lungs.

## European Trauma Course: vammapotilaan hengitystie

### Vortex – ajattelutapa vaikeaan hengitystiehen

ETC suosittaa vaikean hengitystien algoritmiksi brittiläisen DAS-ohjeen ja muistuttaa, että koko tiimin on tunnettava oman alueen algoritmi. Minkä tahansa algoritmin päälle sopii **Vortex-ajattelutapa**: hengitystien hoito on kuin suppilo. Sen yläreuna on **vihreä alue**, jossa potilas hapettuu ja ventiloi itse. Kun anestesia alkaa, vihreältä alueelta poistutaan ja happeutus kiertää suppiloa alaspäin. Takaisin pääsee kolmella keinolla – **intubaatio, supraglottinen väline ja naamari-palje** – ja kullakin on enintään kolme yritystä. Kun keinolla on tehty "paras yritys", sitä ei kannata jatkaa, vaikka yritys olisi ollut ensimmäinen. Jos kaikki kolme epäonnistuvat, tilanne on **CICO** (ei voi intuboida, ei voi happeuttaa), ja tarvitaan kirurginen hengitystie.

```media
{"widget":"vortex","caption":"Kokeile: merkitse yrityksiä epäonnistuneiksi ja seuraa, miten happeutus kiertää kohti suppilon pohjaa. Onnistunut keino palauttaa vihreälle alueelle."}
```

> [!important] Lähteiden ero yritysten määrässä
> Vortex-mallissa kullakin kolmella keinolla on enintään kolme yritystä. Sivuston suomalaisessa (FinnHEMS) ohjeessa intubaatioyrityksiä on **enintään kaksi**, minkä jälkeen siirrytään i-geliin. Noudata oman alueen ohjetta – periaate on sama: älä jumitu yhteen keinoon.

ETC:n tarkistuslistan suunnitelmat: **A** nopea induktio ja intubaatio, **B** naamari-paljeventilaatio, **C** supraglottinen väline, **D** kaulan etuosan kautta tehtävä hengitystie. Ennen kirurgista hengitystietä pidetään lyhyt aikalisä (**10 sekuntia 10 minuutin edestä**), ja päätös sanotaan ääneen ja toteutetaan heti.

### Pulssioksimetrin rajoitukset

- Saturaatio 100 % vastaa noin 12 kPa:n PaO₂:ta, mutta **90 % vain noin 8 kPa:ta** – 10 %:n lasku saturaatiossa on 40 %:n lasku happiosapaineessa. Tätä alempana veren happisisältö laskee vielä nopeammin.
- **Häkämyrkytyksessä** (savu) mittari näyttää liian korkeaa saturaatiota.
- **Methemoglobiini** saa mittarin näyttämään liian matalaa arvoa, kun todellinen saturaatio on yli 85 %.
- Mittari aliarvioi saturaatiota sitä enemmän, mitä alempi hemoglobiini on.
- Ulkoinen valo ja potilaan liike heikentävät luotettavuutta.

Pulssioksimetri kertoo hapetuksesta, mutta **ventilaatio varmistetaan kapnografialla** ja lopulta verikaasuilla.

### Välineet ja vammapotilaan erityispiirteet

- **Nenänieluputki** sopii potilaalle, joka ei ole syvästi tajuton, ja voi pelastaa hengen kasvojen luiden murtumissa tai leukalukossa. **Sitä ei käytetä, jos kallonpohjan murtumaa tiedetään tai epäillään.** Yleinen virhe on työntää putki ylöspäin – se viedään nenän pohjaa pitkin.
- **Kurkunpääputken koko** valitaan pituuden mukaan: koko 5 yli 180 cm, koko 4 155–180 cm ja koko 3 alle 155 cm. Larynksimaskin koko on tyypillisesti 5 miehille ja 4 naisille.
- **Kaularangan käsin tuenta (MILS)** intubaation aikana: kaulus avataan, koska se rajoittaa suun avaamista ja vaikeuttaa laryngoskopiaa. Kolme ihmistä tarvitaan: yksi tukee kaularankaa, yksi avaa kauluksen ja intuboija. Tajuttoman liikenneonnettomuus- tai putoamispotilaan kaularankavamman riski on 5–10 %.
- **Ylipaineventilaatio heikentää laskimopaluuta** ja pahentaa hypotensiota erityisesti hypovoleemisella potilaalla. Pienet kertatilavuudet ja hidas taajuus auttavat; tavoite on normokapnia kapnografian ohjaamana.

## Kansainvälinen vertailu

| | FinnHEMS (Suomi) | Sydney HEMS (2016) | AAGBI (2009) |
|---|---|---|---|
| Induktio | Esketamiini 1 mg/kg (sokkiselle vähemmän) tai propofoli | Ketamiini 1,5–2 mg/kg, hypovolemiassa 0,5–1 mg/kg | Kuten sairaalassa, mahdollisimman yksinkertainen |
| Relaksantti | Rokuroni 1 mg/kg | Rokuroni 1,5 mg/kg | – |
| Yritykset | Enintään 2 | Uusi yritys vain korjaavien "30 sekunnin" toimien jälkeen | Enintään 3 |
| Krikoidipaine | – | Ei rutiinisti (heikentää näkymää) | Käytössä, löysätään tarvittaessa |
| Bougie | Suositeltu | Kaikissa intubaatioissa | Harkittava rutiinikäyttöä |
| Putken paikka | Aina kapnografialla | Aina EtCO₂:lla | – |

Sydneyn manuaalin intubaation aiheet ovat hengitystien aukipysymisen pettäminen, suojaavien refleksien puuttuminen, ventilaation tai hapetuksen pettäminen, ennakoitava kliininen kulku (esim. inhalaatiopalovamma, pään vamma) ja turvallisen kuljetuksen mahdollistaminen. **Sydänpysähdyksessä tai agonaalisesti hengittävällä** intuboidaan ilman lääkkeitä lyhennetyn ("cold intubation") listan mukaan. Kohteessa tehtävää anestesiaa vastaan puhuvat esimerkiksi aikakriittinen kirurginen vamma (lävistävä vamma ja sokki), lyhyt matka sopivaan sairaalaan ja vihamielinen ympäristö.

> [!tip] Intubaation jälkeinen "suvanto"
> Intubaation jälkeen tempo ja valppaus helposti laskevat – juuri silloin putki irtoaa, monitorointi katkeaa, jatkosedaatio unohtuu tai hypotensio ja jänniteilmarinta kehittyvät huomaamatta. Putkea pitää kädessään yksi tiimin jäsen jokaisen siirron ajan.

## Työnjako

```media
{"widget":"matching","title":"Kuka tekee mitäkin? (lääkärihelikopterin malli)","pairs":[
{"left":"Lääkäri (DOC)","right":"Intubaatio ja putken kiinnitys"},
{"left":"HEMS-ensihoitaja (HCM)","right":"Avustaa intubaatiossa, täyttää kuffin, kytkee ventilaattorin"},
{"left":"Ensihoitaja 1","right":"Lääkkeet ohjeen mukaan ja monitorin seuranta – ilmoittaa kaikki saturaatiomuutokset"},
{"left":"Ensihoitaja 2","right":"Lisäkädet intubaatioon ja imun kanssa avustaminen"},
{"left":"Ensihoitaja 3","right":"Kaularangan tuenta"}
]}
```

Intubaation aikana yhteistä tilannetietoisuutta pidetään yllä selvällä kommunikaatiolla: lääkäri ilmoittaa laryngoskopian alkamisen, näkymän, pyytää bougien ja putken sekä kertoo, milloin kuffin saa täyttää ja bougien poistaa.

> [!tip] Putki ja syvyys
> Ellei erityistä syytä ole, naiselle valitaan 7 mm ja miehelle 8 mm putki (lapselle muistikirjan mukaan). Tavallinen syvyys on naisilla 20 cm ja miehillä 22 cm. Putki kiinnitetään teipillä tai kanttinauhalla niin, ettei kiinnitys estä laskimopaluuta – tärkeää neurokriittisellä potilaalla.

## Agitoitunut potilas

Jos potilasta ei saada monitoroitua tai esihappeutettua levottomuuden vuoksi, sedaatio ennen induktiota on yleensä turvallisempaa kuin edetä ilman kunnollista monitorointia – esimerkiksi esketamiini 25 mg i.v. toistaen. Suunnitelma on oltava valmis: esihappeutus ja hengitystien aukipito alkavat heti potilaan sedatoiduttua, eikä aivovammapotilas saa hypoventiloida.

## Muista tämä -kertaus

- Anestesiaintubaatio on kokonaisuus, jonka laatu ratkaisee hyödyn – elintoimintojen vakaus on vaikein osa.
- Esihappeutus vähintään 3 min; NIV tai PEEP-venttiili, kun SpO₂ ei nouse 98 %:iin; happiviikset 15 l/min apnean ajan.
- Ensimmäisen yrityksen optimointi: videolaryngoskooppi, bougie, relaksantti, asento, imu.
- Putken paikka varmistetaan aina kapnografialla.
- Enintään kaksi yritystä → i-gel → naamari/NIV → kirurginen hengitystie.
- Neurokriittinen potilas: vakaa verenpaine ja normoventilaatio, ventilointi jo esihappeutuksen aikana.
- Tarkistuslista haaste–vastaus-periaatteella ennen jokaista induktiota.
- Käsiventilaatio kahden käden otteella, kertatilavuus noin 500–600 ml – vältä mahalaukun täyttymistä.
- Vortex: kolme keinoa (intubaatio, supraglottinen, naamari-palje), paras yritys kullakin – kaikkien epäonnistuessa CICO ja kirurginen hengitystie. Pulssioksimetri näyttää häkämyrkytyksessä liian hyvää.
