## Huimaus on oire, ei diagnoosi

Huimaus on epämiellyttävä tunne tasapainon häiriintymisestä tai liikkeen havaintoharha. Potilaat kutsuvat huimaukseksi monenlaisia tuntemuksia – pyörryttävää, keinuttavaa, kiertävää tai kaatavaa – joten **oireen tarkka kuvaus on arvion tärkein osa** (Akuuttihoito-opas 2025). Huimaus on enimmäkseen hyvänlaatuinen oire, mutta akuuttia hoitoa vaativa, mahdollisesti hengenvaarallinen huimaus on tunnistettava (Lääkärin käsikirja 2025).

- **Aivoverenkiertohäiriö ja epäily vakavasta sydän- tai verenkiertoperäisestä syystä vaativat päivystyksellisen arvion erikoissairaanhoidossa.** Muut huimauksen syyt ovat hoidettavissa perusterveydenhuollossa.
- Jos huimaukseen liittyy muita aivoverenkiertohäiriöön viittaavia neurologisia oireita, jotka ovat alkaneet alle kaksi viikkoa sitten, potilas lähetetään sairaalatutkimuksiin päivystyksellisesti.
- Jos huimaukseen liittyy **akuutti kuulon heikkeneminen**, potilas tarvitsee korvalääkärin arvion viimeistään seuraavana arkipäivänä.
- **Lääkkeiden aiheuttama huimaus on erittäin yleistä** – lääkelista selvitetään aina. Laajoistakaan tutkimuksista huolimatta syy jää epäselväksi noin 10 %:lla.

```media
{"widget":"flow","title":"Huimauspotilaan arvio kentällä","steps":[
{"title":"ABCDE, verensokeri ja EKG","text":"Huimauksen taustalla voi olla myös hypoglykemia tai rytmihäiriö.","tone":"warning"},
{"title":"Neurologisia oireita tai löydöksiä?","text":"Halvaus, kömpelyys, kaksoiskuvat, puhehäiriö, kaatava huimaus.","tone":"danger","branches":[
{"label":"Kyllä","title":"Aivoverenkiertohäiriön epäily","text":"Päivystyksellinen erikoissairaanhoito – AVH-polku ja aikaikkunat.","tone":"danger"},
{"label":"Ei","title":"Jatka arviota","tone":"neutral"}
]},
{"title":"Pyörtyminen, esipyörtyminen, tykytys tai rasitukseen liittyvä oire?","tone":"danger","branches":[
{"label":"Kyllä","title":"Sydänperäisen syyn epäily","text":"Rytmihäiriö, ortostatismi – päivystyksellinen arvio.","tone":"danger"},
{"label":"Ei","title":"Jatka arviota","tone":"neutral"}
]},
{"title":"Kuulo-oireet tai asentoon liittyvä lyhyt kiertohuimaus?","text":"Korvaperäinen syy todennäköisempi – akuutti kuulon heikkeneminen korvalääkärin arvioon viimeistään seuraavana arkipäivänä.","tone":"ok"}
]}
```

## Mitä kysyt: aika, laukaisija ja luonne

Diagnostiikassa tärkeintä on perusteellinen haastattelu: onko huimaus alkanut äkillisesti vai kestänyt pitkään, onko se kohtauksellista vai jatkuvaa ja onko sillä selvä laukaiseva tekijä.

| Alku ja kulku | Tavallisia syitä (Lääkärin käsikirja) |
|---|---|
| **Äkillinen, kohtauksellinen, selvä laukaisija** | Hyvänlaatuinen asentohuimaus (asennon vaihto), ortostatismi (ylösnousu), lääkkeet tai toksiset tekijät. Rasitukseen liittyvä huimaus voi olla vagaalinen heijaste tai rytmihäiriön merkki. |
| **Äkillinen, kohtauksellinen, ei laukaisijaa** | TIA (usein minuutteja), Ménièren tauti (20 min–12 t), vestibulaarimigreeni, paniikkikohtaus, rytmihäiriö, hypoglykemia, epilepsia |
| **Äkillinen, jatkuva** | Vestibulaarineuriitti (päiviä–viikkoja), äkilliseen kuulonmenetykseen liittyvä huimaus, aivoverenkiertohäiriö, trauma, myrkytys |
| **Pitkäkestoinen** (viikkoja–vuosia) | Lääkkeiden haittavaikutukset, ikääntyminen, niska- ja kaularankaperäinen huimaus, psyykkiset syyt, pikkuaivojen rappeuma |

**Huimauksen luonne:**

- **Kiertävä** (karusellimainen) huimaus on ensisijaisesti **sisäkorvaperäinen**.
- **Oikealle tai vasemmalle kaatava** huimaus on Akuuttihoito-oppaan mukaan yleensä **aivorunko- tai pikkuaivoperäinen**. Lääkärin käsikirjan mukaan kaatava huimaus voi vaikeusasteesta riippuen johtua myös jännitysniskasta tai kaularangasta.
- **Keinuttava, epämääräinen** huimaus johtuu muista syistä, ja huimaus ilman selvää alkamishetkeä on yleensä hyvänlaatuista (esim. kaularankaperäinen).
- **Huimaus yhdessä pyörtymisen tai esipyörtymisen** (silmien musteneminen) kanssa viittaa sydän- ja verenkiertoperäiseen syyhyn, mahdollisesti rytmihäiriöön.

**Liitännäisoireet** ohjaavat: halvaus, koordinaatiovaikeus, kaksoiskuvat ja puheen tuoton ongelmat viittaavat **aivoverenkiertohäiriöön**; toisen korvan kuulon heikkeneminen, tinnitus, paineen tunne tai korvasärky **korvaperäiseen syyhyn**; sydämentykytys, hengenahdistus ja rintatuntemukset **rytmihäiriöön, keuhkoemboliaan tai paniikkikohtaukseen**. Lisäksi selvitetään lääkitys ja sen muutokset, alkoholi ja päihteet, infektiot, vammat, aivoverenkiertohäiriön riskitekijät ja aiemmat samanlaiset kohtaukset.

```media
{"widget":"matching","title":"Kuvaus ja todennäköinen syy","pairs":[
{"left":"Voimakas kiertohuimaus ja oksentelu kääntyessä sängyssä, rauhoittuu minuutissa","right":"Hyvänlaatuinen asentohuimaus"},
{"left":"Kiertohuimaus, korvan soiminen ja kuulon heikkeneminen, kohtaus tunteja","right":"Ménièren tauti"},
{"left":"Äkillinen jatkuva kiertohuimaus päiviä, ei kuulo- eikä muita neurologisia oireita","right":"Vestibulaarineuriitti"},
{"left":"Kaatava huimaus ja epäselvä puhe tai kaksoiskuvat","right":"Takaverenkierron aivoverenkiertohäiriö"},
{"left":"Kohtauksellinen, ei-kiertävä huimaus ja silmien musteneminen","right":"Rytmihäiriö"},
{"left":"Huimaus pahin aamulla ja aterian jälkeen, verenpainelääkitys","right":"Ortostaattinen hypotensio"}
]}
```

## Tutkiminen

- **Verenkierto**: verenpaine ja syke, sydämen auskultaatio ja EKG. Ortostatismia epäiltäessä paine ja syke mitataan makuulla ja potilaan noustua seisomaan heti sekä yhden ja kolmen minuutin kuluttua. Akuuttihoito-oppaan mukaan löydös on positiivinen, jos **systolinen paine laskee vähintään 20 mmHg, diastolinen vähintään 10 mmHg tai systolinen paine laskee 90 mmHg:aan tai alle**. Ks. [sydänpotilaan tutkiminen](topic:sydanpotilaan-tutkiminen).
- **Neurologia**: aivohermot ja raajat, erityisesti **koordinaatiokokeet**, Rombergin koe (kaataako, mihin suuntaan, toistuuko), kävely ja puhe. Ks. [aivoverenkiertohäiriö](topic:aivoverenkiertohairio).
- **Nystagmus** eli silmävärve viittaa korva- tai aivoperäiseen syyhyn. Huomioi suunta ja kiertävä komponentti – **pystysuuntainen nystagmus on yleensä merkki aivorungon alueen häiriöstä**.
- Lisäksi niska (lihaskireys) ja korvat (välikorvatulehdus, vammat) sekä **verensokeri**.

> [!info] HINTS ja asentotestit – mitä ne kertovat
> **HINTS**-testi (pään nykäisykoe, nystagmus, silmien vertikaalinen poikkeama) on tarkoitettu tutkimushetkellä oireiselle potilaalle, jolla on nystagmus ja äkillisesti alkanut huimaus. Se erottaa aivoperäisen syyn tasapainoelimen häiriöstä. **Aivoverenkiertohäiriöön viittaavat normaali pään nykäisykoe, katseen suuntaan lyövä ja suuntaa vaihtava nystagmus sekä silmien pystysuuntainen yhteisliikkeen häiriö.** Jos katse ei nykäisyssä pysy kohteessa ja tulee viiveinen korjausliike, syy on sisäkorvassa.
> **Dix–Hallpiken kokeessa** istuvan potilaan päätä käännetään 45 astetta ja hänet ohjataan nopeasti selinmakuulle niska hieman ojennettuna. Viiveellä (noin 5–20 s) tuleva, väsyvä nystagmus ja huimaus viittaavat takimmaisen kaarikäytävän asentohuimaukseen.

## Tyypilliset taudinkuvat

| | Tunnusmerkit |
|---|---|
| **Hyvänlaatuinen asentohuimaus (BPPV)** | Yleisin tasapainoelimen häiriö, noin neljäsosa huimauspotilaista. Alkaa usein aamulla tai yöllä makuulle mennessä tai vuoteessa kääntyessä parin sekunnin viiveellä; rauhoittuu yleensä noin minuutissa, kun pää pysyy paikallaan. Sakka kulkeutuu kaarikäytävään, useimmiten takimmaiseen. Hoito on asentohoito, ei lääkitys; kohtaukset häviävät 90 %:lla kolmessa kuukaudessa, mutta voivat uusiutua. |
| **Vestibulaarineuriitti** | Tasapainohermon tulehdus. Nopeasti alkava voimakas kiertohuimaus ja pahoinvointi, **ei kuulon heikkenemistä tai tinnitusta**, spontaani nystagmus terveeseen korvaan päin, ei muita neurologisia oireita. Helpottaa parista päivästä kahteen viikkoon; hoitona mahdollisimman nopea liikkeelle lähtö. |
| **Ménièren tauti** | Oirekolmikko: kiertohuimaus- ja pahoinvointikohtaukset, korvan soiminen tai paineen tunne ja sisäkorvatyyppinen kuulon heikkeneminen. Kohtaus kestää yleensä muutaman tunnin (20 min–12 t). Tajunta on normaali eikä halvausoireita ole. |
| **Takaverenkierron AVH** | Pikkuaivojen tai aivorungon TIA, infarkti tai verenvuoto. Kaatava huimaus, joka toistuu Rombergin kokeessa tai istuen, ja **neurologisia liitännäisoireita**: dysartria, kasvohalvaus, silmän liikehäiriö, raajahalvaus, tuntohäiriö tai kömpelyys. Pahoinvointi on yleensä lievempää kuin Ménièressä. Äkillinen jalkojen pettäminen voi olla takaverenkierron TIA:n oire. Löydös ei välttämättä näy ensimmäisessä TT-kuvassa. |
| **Sydän ja verenkierto** | Rytmihäiriö: kohtauksellinen, ei-kiertävä huimaus, esipyörtyminen tai pyörtyminen, voi liittyä rasitukseen. Ortostatismi: pahimmillaan aamulla ja aterian jälkeen, yleensä verenpainetta laskeva lääkitys. |
| **Lääkkeet ja alkoholi** | Bentsodiatsepiinit; ortostaattista hypotensiota aiheuttavat verenpaine- ja parkinsonlääkkeet, trisykliset masennuslääkkeet ja fentiatsiinit; karbamatsepiini ja fenytoiini (pikkuaivoperäinen huimaus, ataksia, nystagmus). Pitkäaikainen alkoholinkäyttö aiheuttaa pikkuaivorappeumaa ja polyneuropatiaa. |
| **Hyperventilaatio ja paniikki** | Yleensä nuorilla, jatkuva tai tilannesidonnainen (jonot, kauppa), ei-kiertävä; status normaali. Diagnoosi edellyttää elimellisten syiden riittävää poissulkua. |
| **Niska ja ikääntyminen** | Niskaperäinen: keinuttava, epämääräinen olo, kireät niska-hartialihakset, ei nystagmusta. Ikääntyneen huimaus on usein monen tekijän summa: aistit, verenpaineen säätely ja lääkkeet. Ks. [ikääntynyt potilas](topic:ikaantynyt-potilas). |

```media
{"widget":"select-all","title":"Mikä tekee huimauksesta vaarallisen?","prompt":"Valitse kaikki, jotka vaativat päivystyksellisen arvion erikoissairaanhoidossa.","items":[
{"q":"72-vuotias kuvaa äkillistä huimausta. Mitkä löydökset siirtävät hänet päivystyspolulle?","options":[
{"label":"Puhe on epäselvää","correct":true},
{"label":"Kaatuu Rombergin kokeessa aina samaan suuntaan ja toisella kädellä on kömpelyyttä","correct":true},
{"label":"Huimaukseen liittyy silmien musteneminen ja tykytys","correct":true},
{"label":"Pystysuuntainen nystagmus","correct":true},
{"label":"Lyhyt kiertohuimaus aina vuoteessa kääntyessä, status muuten normaali","correct":false,"note":"Sopii hyvänlaatuiseen asentohuimaukseen."},
{"label":"Keinuttava olo ja kireät niskalihakset ilman nystagmusta","correct":false,"note":"Sopii niskaperäiseen huimaukseen."}
],"explain":"Neurologiset liitännäisoireet viittaavat aivoverenkiertohäiriöön ja (esi)pyörtyminen sydänperäiseen syyhyn – molemmat vaativat päivystyksellisen arvion erikoissairaanhoidossa."}
]}
```

## Hoito ja jatkohoito

- Hoito on **syyn mukainen**. Yleensä huimausta ei kannata hoitaa lääkkeillä, mutta voimakkaaseen pahoinvointiin voidaan antaa pahoinvointilääkettä (Akuuttihoito-opas: metoklopramidi, droperidoli tai [ondansetroni](topic:ondansetroni)) ja tarvittaessa nesteitä suonensisäisesti.
- **Asentohuimaus** hoidetaan asentohoidolla, eikä lääkitystä tarvita – tasapainoelintä lamaavista ja rauhoittavista lääkkeistä on enemmän haittaa kuin hyötyä. Vestibulaarineuriitissa potilas mobilisoidaan mahdollisimman nopeasti.
- **Liikkuminen nopeuttaa toipumista**, ja tasapainoharjoittelu estää uusiutumista: huono tasapaino johtaa vähäiseen liikkumiseen, mikä heikentää tasapainoa edelleen.
- **Aivoverenkiertohäiriöepäily** hoidetaan AVH-polun mukaan; ks. myös [TIA](topic:aivoverenkiertohairio). Sydänperäisen syyn epäilyssä EKG ja rytmin seuranta, ks. [pyörtyminen](topic:yleistilan-lasku-ja-pyortyminen) ja [rytmihäiriöt](topic:rytmihairiot).
- Hyvänlaatuisessa asentohuimauksessa potilaalle kerrotaan taudin hyvänlaatuisuudesta ja hyvästä ennusteesta ja häntä rohkaistaan liikkumaan.

```media
{"widget":"scene-card","id":"huimaus","title":"Kohteessa: huimaava potilas","know":[
{"label":"Vaaralliset syyt: aivoverenkiertohäiriö ja sydän","detail":"Molemmat päivystykselliseen arvioon erikoissairaanhoitoon."},
{"label":"Kiertävä = yleensä sisäkorva; kaatava = aivorunko tai pikkuaivot"},
{"label":"Huimaus ja (esi)pyörtyminen = sydän ja verenkierto"},
{"label":"Lääkkeet ovat erittäin yleinen syy"}
],"examine":[
{"label":"Alku, kesto, laukaisija ja luonne"},
{"label":"Neurologia: puhe, koordinaatio, Romberg, kävely"},
{"label":"Nystagmus: suunta – pystysuuntainen viittaa aivorunkoon"},
{"label":"Verenpaine ja syke, tarvittaessa ortostaattinen koe, EKG"},
{"label":"Verensokeri ja lääkelista"},
{"label":"Kuulo-oireet: tinnitus, paine, kuulon heikkeneminen"}
],"do":[
{"label":"Pahoinvointilääke ja nesteet tarvittaessa"},
{"label":"AVH-epäily: AVH-polku ja aikaikkunat"},
{"label":"Rytmihäiriöepäily: monitorointi ja päivystys"},
{"label":"Asentohuimaus: kerro hyvänlaatuisuudesta, rohkaise liikkumaan"}
],"redFlags":["Puhe-, näkö- tai liikehäiriö","Kaatava huimaus, joka toistuu samaan suuntaan","Pyörtyminen, tykytys tai rintakipu","Akuutti kuulon heikkeneminen","Pystysuuntainen nystagmus"]}
```

## Muista tämä -kertaus

- Huimaus on oire – selvitä tuntemuksen kuvaus, alku, kesto, laukaisija ja liitännäisoireet.
- Aivoverenkiertohäiriö ja vakava sydänperäinen syy vaativat päivystyksellisen arvion erikoissairaanhoidossa; muut syyt hoituvat perusterveydenhuollossa.
- Kiertävä huimaus on yleensä sisäkorvaperäinen; kaatava huimaus ja neurologiset liitännäisoireet viittaavat aivorunkoon tai pikkuaivoihin; huimaus ja (esi)pyörtyminen sydämeen.
- Pystysuuntainen nystagmus viittaa aivorungon häiriöön. HINTS-testissä normaali pään nykäisykoe viittaa aivoverenkiertohäiriöön.
- Asentohuimaus: lyhyt kiertohuimaus asennon vaihdossa parin sekunnin viiveellä, hoitona asentohoito – ei lääkitystä.
- Vestibulaarineuriitti: äkillinen jatkuva kiertohuimaus ilman kuulo-oireita; Ménière: huimaus, tinnitus ja kuulon heikkeneminen, kohtaus tunteja.
- Ortostaattinen koe: makuulla, heti seisomaan, 1 ja 3 min – positiivinen, jos systolinen laskee ≥ 20 mmHg, diastolinen ≥ 10 mmHg tai systolinen ≤ 90 mmHg.
- Lääkelista aina: lääkkeiden aiheuttama huimaus on erittäin yleistä.
