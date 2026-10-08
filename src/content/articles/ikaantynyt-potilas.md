## Miksi iäkäs potilas on erilainen

Ikääntyneellä elimistön reservikapasiteetti pienenee ja haavoittuvuus lisääntyy. Monisairastavuus, runsas lääkitys (polyfarmasia) ja piilevät sairaudet ovat tavallisia, ja hoitojen haittavaikutukset voivat yllättää. Yksilölliset erot ovat kuitenkin suuria – kalenteri-ikä kertoo vähemmän kuin toimintakyky ja sairaudet (Duodecim Oppiportti, Geriatria).

Ensihoidossa tämä näkyy kolmella tavalla: **oireet ovat epätyypillisiä** (vakavakin infektio tai infarkti voi näkyä vain sekavuutena, kaatuiluna tai yleiskunnon laskuna), **kaatuminen on usein oire eikä vain tapaturma**, ja **lääkkeet ovat tavallinen syy** huimaukseen, kaatuiluun ja sekavuuteen. Katso myös [äkillinen yleistilan heikkeneminen ja pyörtyminen](topic:yleistilan-lasku-ja-pyortyminen).

## Gerastenia eli hauraus-raihnausoireyhtymä

Gerastenia (engl. frailty) on ikääntyneen elimistön heikkenemistä eri tasoilla: ulkoisten stressitekijöiden sietokyky on heikentynyt ja reservit vähentyneet. Siihen liittyy lisääntynyt alttius terveyden heikentymiselle, toiminnan vajeille, kaatuilulle, sairaala- ja pitkäaikaishoidolle sekä kuolemalle. Esiintyvyys on yli 80-vuotiailla jopa 25–40 %.

```media
{"widget":"checklist","title":"Gerastenia (Friedin kriteerit)","prompt":"Gerastenia on kyseessä, jos vähintään kolme viidestä täyttyy.","rule":{"type":"atLeast","n":3},"items":[
{"label":"Tahaton painon lasku"},
{"label":"Uupumus"},
{"label":"Pieni energiankulutus"},
{"label":"Hitaus"},
{"label":"Lihasheikkous"}
],
"met":{"title":"Gerastenia","text":"Hauras potilas: pienikin sairaus tai vamma voi romahduttaa toimintakyvyn. Huomioi tämä kuljetus- ja hoitopaikkaratkaisussa.","tone":"warning"},
"notMet":{"title":"Kriteerit eivät täyty","text":"Arvioi silti toimintakyky ja sen muutos.","tone":"neutral"}}
```

## Kaatuminen – oire, jonka syy pitää etsiä

Kotona asuvista yli 65-vuotiaista noin kolmannes ja yli 80-vuotiaista noin puolet kaatuu vähintään kerran vuodessa; naiset kaatuvat miehiä useammin. Noin 40 % kaatumisista tapahtuu sisätiloissa, ja laitoksessa riski on jopa viisinkertainen. Vakavimmat välittömät seuraukset ovat **päävammat ja luunmurtumat** – erityisesti lonkkamurtuma, koska iäkäs kaatuu usein suoraan lonkalleen ilman suojaavaa ojennusrefleksiä. Kaatuilu ennakoi toimintakyvyn heikkenemistä, kaksinkertaistaa kuolemanvaaran ja moninkertaistaa laitoshoitoon joutumisen riskin.

Kaatumisen syyt jaetaan **ulkoisiin** (liukkaat pinnat, esteet, häikäisy, heikko valaistus, irtomatot) ja **sisäisiin**. Yli 80-vuotiailla sisäiset syyt aiheuttavat noin 80 % kaatumisista.

```media
{"widget":"checklist","title":"Kaatumisen sisäiset riskitekijät","prompt":"Merkitse potilaalla todetut. Riski kasvaa riskitekijöiden kasautuessa.","rule":{"type":"atLeast","n":3},"items":[
{"label":"Lihasheikkous","hint":"vaarasuhde 4,4"},
{"label":"Aiempi kaatuminen","hint":"3,0"},
{"label":"Kävelyvaikeus","hint":"2,9"},
{"label":"Tasapainovaikeus","hint":"2,9"},
{"label":"Apuvälineen tarve","hint":"2,6"},
{"label":"Nivelrikko","hint":"2,4"},
{"label":"Heikentynyt päivittäinen toimintakyky (ADL)","hint":"2,3"},
{"label":"Depressio","hint":"2,2"},
{"label":"Muistihäiriö","hint":"1,8"},
{"label":"Ikä yli 80 vuotta","hint":"1,7"},
{"label":"Psyykenlääkkeet, verenpainelääkkeet tai diureetit"}
],
"met":{"title":"Kaatumisriski on suuri","text":"Kirjaa riskitekijät ja välitä tieto jatkohoitoon (kaatuiluselvitys). Mieti, oliko kaatuminen oire akuutista sairaudesta.","tone":"warning"},
"notMet":{"title":"Vähän riskitekijöitä","text":"Selvitä silti kaatumisen syy ja mahdolliset vammat.","tone":"neutral"}}
```

**Lääkkeet** lisäävät kaatumisriskiä aiheuttamalla ortostaattista hypotoniaa (nitraatit, diureetit, verenpainelääkkeet, trisykliset masennuslääkkeet) tai hidastamalla horjahduksen korjausliikettä (rauhoittavat). Joka viides iäkäs käyttää unilääkettä tai rauhoittavaa, ja psyykenlääkkeiden vähentämisellä kaatumiset ovat vähentyneet kolmanneksella.

### Kävelyn ja tasapainon pikatestaus

```media
{"widget":"flow","title":"Seitsemän kohdan testaus (mukaillen Geriatrics 1996)","steps":[
{"title":"1. Tuolilta ylösnousu","text":"Vaikeus viittaa alaraajojen toimintahäiriöön."},
{"title":"2. Seisominen 10–15 s ylösnousun jälkeen","text":"Huojahtelu tai huimaus → ortostaattinen hypotonia tai tasapainoelimen häiriö.","tone":"warning"},
{"title":"3. Seisominen silmät kiinni","text":"Tasapainon menetys ilman näköä viittaa asentotunnon vikaan."},
{"title":"4. Tönäisy rintakehään","text":"Normaalisti tasapaino säilyy pienellä korjausliikkeellä."},
{"title":"5. Esineen poiminen lattialta","text":"Vaikeus lisää kaatumisriskiä."},
{"title":"6. Kävely suoraa viivaa, käännökset","text":"Huono suoritus viittaa kävely- tai tasapainohäiriöön."},
{"title":"7. Lattialta ylösnousu","text":"Kyvyttömyys nousta ylös on vaarallinen – kaatunut voi jäädä lattialle pitkäksi aikaa.","tone":"danger"}
]}
```

> [!tip] Kotona kannattaa katsoa ympärilleen
> Valaistus (yövalo makuuhuoneesta vessaan), irtomatot, kynnykset, tukikahvat ja kengät kertovat kaatumisriskistä. Välitä havainnot jatkohoitoon – kotikäynti kuuluu kaatuilevan vanhuksen selvittelyyn.

## Huimaus

Huimaus on yleisimpiä oireita vanhuksilla. Tasapainojärjestelmät – asento- ja liikeaisti, sisäkorva ja näkö – heikkenevät, ja keskushermoston säätely hidastuu; huimausta esiintyy esimerkiksi pimeässä vessaan mennessä. Pitkäkestoisen huimauksen taustalla on tavallisimmin **sydän- ja verisuonisairaus** (noin 28 %), perifeerinen vestibulaarisairaus (18 %), keskushermostosairaus (14 %) tai monta syytä yhtä aikaa (18 %).

- **Hyvänlaatuinen asentohuimaus (BPPV)**: lyhyt (10–15 s) voimakas kiertohuimaus pään kääntyessä tai makuulle mennessä.
- **Takaverenkierron TIA/lakuunainfarkti**: huimaukseen liittyy muita neurologisia oireita – kaksoiskuvat, näkökenttäpuutokset, ataksia, puhehäiriö, tuntopuutokset. Katso [tajuttomuus](topic:tajuttomuus).
- **Ortostaattinen hypotonia**: systolisen paineen lasku yli 20 mmHg tai diastolisen yli 10 mmHg seisomaan noustessa – noin kolmanneksella ikääntyneistä. Mittaa paine makuulla ja seisten, ja kysy samalla, tuleeko huimaus juuri silloin.
- **Lääkkeet** ovat usein selitys: verenpainelääkkeet ja erityisesti diureetit, neuroleptit, trisykliset masennuslääkkeet ja levodopa.

Yhden syyn löytäminen ei välttämättä poista huimausta – vanhuksen huimaus on usein monen tekijän geriatrinen oireyhtymä.

## Lääkkeet ja ikääntyminen

| Muutos | Seuraus |
|---|---|
| Kehon vesimäärä pienenee, rasvan osuus kasvaa | Vesiliukoisten lääkkeiden pitoisuus kasvaa; rasvaliukoisten (esim. bentsodiatsepiinit) poistuminen hidastuu – vaikutus voi kestää yllättävän pitkään |
| Albumiini vähenee | Vapaan, vaikuttavan lääkkeen osuus kasvaa |
| Maksan aineenvaihdunta hidastuu | Maksassa metaboloituvat lääkkeet kertyvät |
| Munuaisten toiminta heikkenee | "80-vuotiaalla on yksi munuainen" – poistuminen hidastunut noin 50 %; kreatiniini voi olla harhaanjohtavasti normaali, koska lihasmassa on pieni |
| Keskushermoston herkkyys kasvaa | Psyykenlääkkeiden, rauhoittavien, antikolinergisten lääkkeiden ja opioidien teho **ja haitat** korostuvat |

Nyrkkisääntönä vanhuksen keskimääräinen lääkeannos on usein korkeintaan puolet työikäisen annoksesta. Iäkkäät saavat myös herkemmin vatsahaavan esimerkiksi tulehduskipulääkkeistä, ja suuret nesteenpoistolääkeannokset voivat aiheuttaa väsymystä, voimattomuutta, verenpaineen laskua ja kaatuilua. Munuaisten toiminta arvioidaan Cockcroft–Gaultin kaavalla: (140 − ikä) × paino / (72 × kreatiniini), naisilla tulos jaetaan 0,85:llä.

> [!info] Opioidi- ja sedaatioannokset ensihoidossa
> Titraa iäkkäälle pienin annoksin ja seuraa hengitystä ja tajuntaa – lääkkeen vaikutus alkaa ja loppuu hitaammin, ja keskushermostovaikutukset korostuvat.

## Infektiot iäkkäällä

Iän myötä sekä alttius infektioille että niiden vaikeusaste lisääntyvät – vaikuttavimpina perussairaudet. Yleisimmät ovat virtsatieinfektiot, keuhkokuume ja iho- ja pehmytkudosinfektiot. Riskiä lisäävät heikentynyt yskänrefleksi ja aspiraatiotaipumus, iho-ongelmat ja haavat, rakon tyhjenemishäiriöt ja katetrit.

- **Oireet ovat epämääräisiä**: vaikeassakin infektiossa kuume voi puuttua tai olla vähäinen. Infektio voi näkyä vain **sekavuutena, kaatuiluna tai yleiskunnon heikkenemisenä**.
- **Keuhkokuume**: kuumetta ja hengitystieoireita on vähemmän kuin nuorilla – hoito aloitetaan ripeästi, koska tila voi huonontua nopeasti.
- **Virtsatieinfektio**: oireeton bakteriuria on hyvin yleistä (yli 65-vuotiaista naisista ainakin 20 %, laitoksissa jopa 30–50 %), eikä sitä hoideta. Epäspesifiset oireet, kuten väsymys ja sekavuus kuumeettomalla potilaalla, johtuvat harvoin virtsatieinfektiosta – etsi muu syy.
- **Sepsis** on vanhuksilla huomattavasti yleisempi kuin nuorilla; tärkeimmät lähtökohdat ovat hengitystiet ja virtsatiet, ja kuolleisuus on suurempi. Katso [infektiosairaudet ja sepsis](topic:infektiosairaudet).

## Kipu ja muistisairas potilas

Kivun syynä on vanhallakin kudosvaurio tai neuropaattinen kipu – "ei vanhuus". Ikääntyminen muuttaa kipuaistimusta: perifeerinen kipukynnys nousee hieman, mutta **kivunsietokyky heikkenee**. **Viskeraalisen kivun** tunne vaimenee: akuutti vatsa on vanhuksen hoidossa vaikeimpia erotusdiagnostisia tilanteita – vatsanpeitteet eivät aina ole laudankovat edes suolen puhkeamassa, ja sydäninfarktin rintakipu voi puuttua tai olla vaimea. Lievää kipua vähätellään, voimakas kipu ahdistaa.

**Dementia ei todennäköisesti vähennä kipua**, mutta muistisairaiden kipuja diagnosoidaan ja hoidetaan harvemmin. Kommunikoimaan pystyvä osaa yleensä ilmaista kipunsa; vaikeasti dementoituneella turvaudutaan havainnointiin – hengitykseen, ääntelyyn, ilmeisiin, kehonkieleen ja lohdutettavuuteen. Käyttäytymisen muutoksen taustalla voi kivun sijaan tai ohella olla jano, virtsaamis- tai ulostamistarve, ali- tai ylistimulaatio, depressio, psykoosi tai epämukava vaatetus.

## Muistisairauden käytösoireet

Käytösoireita (BPSD) ovat mm. aggressiivisuus, levottomuus ja vaeltelu, estoton käytös, huutelu, levottomuuden lisääntyminen iltaa kohden, ahdistus, unihäiriöt, harhat ja virhetulkinnat. Ne ovat omaishoitajien suurin stressitekijä ja johtavat usein turhaan rauhoittavaan lääkitykseen.

Ympäristö ja kohtaaminen vaikuttavat paljon: **epäkunnioittava kohtelu, pakottaminen, kiire, liialliset ärsykkeet, melu ja alati vaihtuvat ihmiset lisäävät käytösoireita.** Toisaalta muistisairaan **äkillinen muutos voi olla deliriumin oire** – somaattinen tutkiminen (verenpaine, keuhkot, sydän, vatsa, lääkitys, kipu, näkö ja kuulo, suolen ja virtsarakon toiminta) on tärkeää. Esimerkiksi neuroleptit ja antikolinergiset lääkkeet voivat aiheuttaa tai pahentaa käytösoireita.

## Muista tämä -kertaus

- Iäkkään oireet ovat usein epätyypillisiä: infektio tai infarkti voi näkyä vain sekavuutena, kaatuiluna tai yleiskunnon laskuna.
- Kaatuminen on oire – etsi syy (sairaus, lääkkeet, ortostaattinen hypotonia) ja vammat (pää, lonkka).
- Gerastenia: vähintään 3/5 – painon lasku, uupumus, vähäinen aktiivisuus, hitaus, lihasheikkous.
- Lääkkeiden vaikutus pitkittyy ja keskushermostohaitat korostuvat – pienet, titratut annokset.
- Muistisairaan kipu on todellinen – havainnoi käyttäytymistä; äkillinen muutos voi olla delirium.
