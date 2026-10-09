## Miksi insuliinin ymmärtäminen auttaa ensihoidossa

Diabeetikon kohtaaminen on yksi ensihoidon yleisimmistä tehtävistä. Insuliini ei ole vain "sokerin laskija" – se avaa glukoosin pääsyn lihas- ja rasvasoluihin, hillitsee maksan omaa sokerintuotantoa ja estää rasvan hajottamisen ketoaineiksi. Aivot pääsevät glukoosiin käsiksi ilman insuliiniakin, minkä takia nimenomaan aivot kärsivät ensimmäisenä, kun verensokeri laskee liikaa.

Tyypin 1 diabeteksessa insuliinia ei muodostu lainkaan – potilas on täysin riippuvainen pistettävästä insuliinista, ja sen puute johtaa nopeasti ketoasidoosiin. Tyypin 2 diabeteksessa kyse on insuliiniresistenssistä; tyypillinen hätätilanne on tällöin hyperosmolaarinen oireyhtymä (HHS), ei ketoasidoosi.

```media
{"widget":"insulin"}
```

## Hypoglykemia – diabeetikon kiireisin hätätilanne

> [!danger] Henkeä uhkaava
> Epäile hypoglykemiaa aina ensimmäisenä, kun diabeetikon tajunta tai käytös on poikkeavaa. Tila on nopeasti korjattavissa, mutta hoitamattomana se voi johtaa kouristuksiin ja tajuttomuuteen.

Hypoglykemia tarkoittaa verensokeria ≤3,9 mmol/l, merkittävänä sitä pidetään alle 3,0 mmol/l ja vaikeat keskushermosto-oireet ilmaantuvat usein alle 2,5 mmol/l. Oireet etenevät kahdessa vaiheessa:

- **Autonomiset oireet** (kehon hälytys): vapina, hikoilu, sydämentykytys, ahdistuneisuus – näiden tarkoitus on saada potilas syömään.
- **Neuroglykopeeniset oireet** (aivojen energiavaje): sekavuus, puhevaikeudet, näköhäiriöt, poikkeava käytös, kouristelu, tajuttomuus.

Osa potilaista ei tunnista varoitusoireita lainkaan (hypoglykemian tiedostamattomuus), jolloin tila voi edetä suoraan vaikeisiin oireisiin.

```media
{"widget":"scale","title":"Verensokeri – mitä arvo tarkoittaa?","label":"Verensokeri","unit":"mmol/l","step":0.1,"value":3.4,"bands":[
{"from":1.0,"to":2.5,"label":"Vaikea hypo","tone":"danger","text":"Alle 2,5 mmol/l ilmaantuu usein vaikeita keskushermosto-oireita (sekavuus, kouristelu, tajuttomuus). Glukoosia suonensisäisesti (esim. 100 ml 10 %); ilman suoniyhteyttä glukagoni 1 mg i.m."},
{"from":2.5,"to":2.8,"label":"Erittäin matala","tone":"danger","text":"Alle 2,8 mmol/l: siirry suoraan suonensisäiseen hoitoon, vaikka potilas olisi tajuissaan."},
{"from":2.8,"to":3.0,"label":"Merkittävä","tone":"warning","text":"Alle 3,0 mmol/l on merkittävä hypoglykemia. Tajuissaan oleva, nielevä potilas: nopeat hiilihydraatit suun kautta ja uusintamittaus."},
{"from":3.0,"to":4.0,"label":"Hypoglykemia","tone":"warning","text":"Enintään 3,9 mmol/l. Autonomiset oireet: vapina, hikoilu, sydämentykytys, ahdistuneisuus. Nopeat hiilihydraatit suun kautta – ja selvitä syy."},
{"from":4.0,"to":15.0,"label":"Ei hypoglykemiaa","tone":"ok","text":"Ei hypoglykemiaa. Jos diabeetikon tila on silti poikkeava, etsi muu syy – ja muista ketoaineet, jos sokeri on koholla."},
{"from":15.0,"to":30.0,"label":"Koholla – DKA?","tone":"warning","text":"DKA:ssa verensokeri on yleensä yli 15 mmol/l. Mittaa veren ketoaineet: yli 3,0 mmol/l viittaa vahvasti DKA:han. Nesteytys on kiireellisin hoito."},
{"from":30.0,"to":45.0,"label":"Erittäin korkea – HHS?","tone":"danger","text":"Yli 30 mmol/l ja vähäiset ketoaineet viittaavat HHS:ään (iäkäs tyypin 2 diabeetikko, äärimmäinen kuivuminen, neurologiset oireet). Nesteytys aina ennen insuliinia."}
]}
```

```media
{"widget":"flow","title":"Hypoglykemian hoito","steps":[
{"title":"Mittaa verensokeri – epäile hypoa aina ensin","text":"Kun diabeetikon tajunta tai käytös on poikkeavaa."},
{"title":"Pystyykö potilas nielemään turvallisesti?","tone":"warning","branches":[
{"label":"Kyllä","title":"Nopeat hiilihydraatit suun kautta","text":"Sokerijuoma, glukoositabletit tai -geeli. Jos sokeri alle 2,8 mmol/l → suoraan suonensisäinen hoito.","tone":"ok"},
{"label":"Ei","title":"Glukoosi suonensisäisesti","text":"Esim. 100 ml 10 % glukoosia. Ei suoniyhteyttä → glukagoni 1 mg i.m. (ei tehoa, jos glykogeenivarastot ovat tyhjät).","tone":"danger"}
]},
{"title":"Uusintamittaus ja syyn selvittäminen","text":"Pitkävaikutteinen insuliini (esim. kesto 24–42 h) = suuri uusiutumisriski."},
{"title":"Kotiin vain, jos kaikki täyttyy","text":"Täysin oireeton ja neurologisesti normaali, syy selvillä ja hallinnassa, ruokaa saatavilla, joku paikalla – eikä kyse ole ensimmäisestä vakavasta hypoglykemiasta tai alle kouluikäisestä lapsesta.","tone":"ok"}
]}
```

**Hoito:**
- Tajuissaan oleva potilas: nopeat hiilihydraatit suun kautta (sokerijuoma, glukoositabletit, sokerigeeli). Jos verensokeri on erittäin matala (alle 2,8 mmol/l), siirry suoraan suonensisäiseen hoitoon.
- Tajuton tai nielemiskyvytön potilas: glukoosia suonensisäisesti (esim. 100 ml 10 % glukoosiliuosta), tarkista verensokeri uudelleen hoidon jälkeen.
- Jos suoniyhteyttä ei saada: glukagoni 1 mg lihakseen. Vaikutus on hitaampi, ja se ei tehoa, jos potilaan glykogeenivarastot ovat tyhjät (pitkä paasto, aliravitsemus, runsas alkoholinkäyttö).

> [!tip] Muista tämä
> Selvitä aina hypoglykemian syy. Pitkävaikutteinen insuliini (esim. Tresiba, kesto 24–42 h) tarkoittaa korkeaa uusiutumisriskiä, ja silloin kotiin jättäminen ei ole turvallista, vaikka verensokeri olisi hetkellisesti korjautunut.

Kotiin voi jättää vain, kun potilas on täysin oireeton ja neurologisesti normaali, syy on selvillä ja hallinnassa, ruokaa on saatavilla, joku on paikalla ja kyse ei ole ensimmäisestä vakavasta hypoglykemiasta tai alle kouluikäisestä lapsesta.

## Diabeettinen ketoasidoosi (DKA)

DKA syntyy, kun insuliinia ei ole käytännössä lainkaan. Solut eivät pääse käyttämään glukoosia, keho alkaa polttaa rasvaa energiaksi ja tuottaa sivutuotteena happamia ketoaineita. Veri happamoituu (metabolinen asidoosi), ja korkea verensokeri vetää nestettä virtsaan, mikä kuivattaa potilaan nopeasti. Tyypillisiä laukaisevia tekijöitä ovat infektiot, insuliinihoidon laiminlyönti tai pumppuvika, sekä tyypin 1 diabeteksen ensi-ilmeneminen.

```media
{"widget":"flow","title":"Miten ketoasidoosi syntyy","steps":[
{"title":"Insuliinia ei ole käytännössä lainkaan","text":"Infektio, insuliinihoidon laiminlyönti tai pumppuvika, tyypin 1 diabeteksen ensi-ilmeneminen.","tone":"warning"},
{"title":"Solut eivät pääse käyttämään glukoosia","branches":[
{"label":"Rasva","title":"Keho polttaa rasvaa → ketoaineita","text":"Veri happamoituu (metabolinen asidoosi) → Kussmaulin hengitys, asetonin haju.","tone":"danger"},
{"label":"Sokeri","title":"Korkea sokeri vetää nestettä virtsaan","text":"Runsas virtsaaminen → nopea kuivuminen → takykardia, myöhemmin hypotensio.","tone":"danger"}
]},
{"title":"Hoidon järjestys","text":"1. Nesteytys (esim. 1 litra ensimmäisen puolen tunnin aikana) · 2. insuliini vain hoito-ohjeen ja konsultaation mukaan · 3. elektrolyytit sairaalassa.","tone":"ok"}
]}
```

> [!warning] Red flag
> Pumppupotilaalla ei ole pitkävaikutteista "turvaverkkoa". Jos pumppu lakkaa toimimasta, DKA voi kehittyä jo 3–5 tunnissa.

**Oireet:**
- Hyperglykemian oireet: runsas virtsaaminen, jano, väsymys.
- Kussmaulin hengitys (syvä, työläs hengitys, jolla keho kompensoi asidoosia) ja asetonin haju hengityksessä.
- Pahoinvointi, oksentelu ja vatsakipu – voi muistuttaa [akuuttia vatsaa](topic:akuutti-vatsa).
- Takykardia, lämmin mutta kuiva iho, myöhemmin hypotensio.
- Sekavuus, tajunnan heikkeneminen, vaikeassa tilassa kooma.

```media
{"widget":"breathing-patterns","initial":"kussmaul"}
```

> [!danger] Henkeä uhkaava
> Älä hoida DKA:n hyperventilaatiota paperipussilla – se on elimistön yritys kompensoida asidoosia, ei paniikkikohtaus.

**Diagnoosi kentällä:** verensokeri (yleensä yli 15 mmol/l) ja veren ketoaineet ovat ratkaisevat mittaukset. Ketoaineet yli 3,0 mmol/l viittaavat vahvasti DKA:han.

**Hoidon kulmakivet:**
1. **Nesteytys on tärkein ja kiireellisin toimenpide** – isotoninen suolaliuos tai Ringer, esim. 1 litra ensimmäisen puolen tunnin aikana, sitten 1 litra/tunti ja edelleen hidastaen.
2. **Insuliini** annetaan vain alueellisen hoito-ohjeen ja lääkärikonsultaation mukaan – ei ihon alle sokkipotilaalle, koska imeytyminen on epävarmaa.
3. **Elektrolyyttien korjaus** (erityisesti kalium) tehdään sairaalassa.

Natriumbikarbonaattia käytetään ensihoidossa vain harvoin ja varoen – ainoastaan erittäin vaikeassa asidoosissa tai hengenvaarallisissa rytmihäiriöissä, koska se lisää hiilidioksidikuormaa ja hengitystyötä.

## Hyperosmolaarinen hyperglykeeminen tila (HHS)

HHS kehittyy tyypillisesti iäkkäällä tyypin 2 diabeetikolla, usein infektion tai kuivumisen laukaisemana. Insuliinia on jäljellä sen verran, että ketoaineiden muodostus pysyy vähäisenä, mutta ei tarpeeksi hallitsemaan verensokeria, joka voi nousta yli 30 mmol/l:aan. Tästä seuraa äärimmäinen kuivuminen, kun veri muuttuu "siirapimaiseksi" ja munuaiset vetävät nestettä mukaansa virtsaan.

Toisin kuin DKA:ssa, HHS:ssä ei ole merkittävää asidoosia eikä Kussmaulin hengitystä – oirekuvassa korostuvat sekavuudesta koomaan etenevät neurologiset oireet, jotka voivat muistuttaa aivoinfarktia.

> [!tip] Muista tämä
> HHS:ssä nesteytys tulee aina ennen insuliinia. Insuliini siirtää vettä soluihin ja voi pahentaa kuivumista sekä aiheuttaa aivoödeemaa, jos nestetasapainoa ei ole korjattu ensin.

## Erotusdiagnostiikka tiivistettynä

| Tila | Ketoaineet | Asidoosi | Verensokeri | Tyypillinen potilas |
|---|---|---|---|---|
| DKA | Korkeat (>3) | Kyllä | Koholla | Tyypin 1 diabetes |
| HHS | Vähäiset | Vähäinen/ei | Erittäin korkea (>30) | Iäkäs tyypin 2 diabetes |
| Paastoketoosi | Koholla | Ei | Ei koholla | Aliravittu, vähähiilihydraattinen ruokavalio |
| Laktaattiasidoosi | Normaalit | Kyllä | Vaihtelee | Sokki, sepsis, metformiinin käyttäjä |

Muista myös, että alkoholi voi aiheuttaa tai pahentaa hypoglykemiaa estämällä maksan glukoosin tuotantoa – vaikutus voi kestää yli vuorokauden alkoholin nauttimisesta ([alkoholin väärinkäyttö](topic:alkoholin-vaarinkaytto)).

## Ensihoito-oppaan hoito-ohje: hypoglykemia

Tajuton tai yhteistyökyvytön: **G10 100–200 ml nopeana infuusiona** (lapsi 1–2 ml/kg); jos suoni- tai luuydinyhteys ei onnistu, glukagoni 1 mg i.m. (alle kouluikäinen 0,5 mg). Herännyt potilas saa mehua tai maitoa ja hitaasti imeytyvää hiilihydraattia. Jos tajunta ei palaa, vaikka verensokeri on korjautunut, etsi muu syy (Lund, Ensihoito-opas 2023).

**Kotiin voi jäädä vain, jos kaikki täyttyvät**: tyypin 1 diabetes, hypoglykemialle on järkevä selitys, potilas ei ole päihtynyt, on orientoitunut ja asiallinen ja hänellä on aikuista seuraa, hän on syönyt ja verensokeri pysyy normaalina – ja lääkäriä on konsultoitu. **Lapsi kuljetetaan aina**, samoin jos hypoglykemialle on muu syy.

```media
{"widget":"scene-card","id":"sokeri","title":"Kohteessa: diabeetikko, jonka vointi on poikkeava","know":[
{"label":"Epäile ensin hypoglykemiaa","detail":"Verensokeri enintään 3,9 mmol/l; vaikeat keskushermosto-oireet usein alle 2,5."},
{"label":"Pitkävaikutteinen insuliini = suuri uusiutumisriski"},
{"label":"DKA: nesteytys on kiireellisempi kuin insuliini"},
{"label":"Pumppuvika voi johtaa DKA:han 3–5 tunnissa"},
{"label":"HHS: nesteytys aina ennen insuliinia"}
],"examine":[
{"label":"Verensokeri heti"},
{"label":"Veren ketoaineet, jos sokeri koholla","detail":"Yli 3,0 mmol/l viittaa vahvasti DKA:han."},
{"label":"Hengitys: Kussmaul ja asetonin haju"},
{"label":"Nestetila: kuiva iho, takykardia, hypotensio"},
{"label":"Tajunta ja nielemiskyky"},
{"label":"Insuliinit ja pumppu, syöminen, infektio"}
],"do":[
{"label":"Tajuissaan ja nielee: nopeat hiilihydraatit suun kautta"},
{"label":"Tajuton tai alle 2,8 mmol/l: glukoosi i.v.","detail":"Esim. 100 ml 10 %; ilman suoniyhteyttä glukagoni 1 mg i.m."},
{"label":"Uusintamittaus ja syyn selvitys"},
{"label":"DKA: nesteytys, esim. 1 litra ensimmäisen puolen tunnin aikana"},
{"label":"Kotiin vain, jos kaikki kotiinjättökriteerit täyttyvät"}
],"redFlags":["Kouristelu tai tajuttomuus","Kussmaulin hengitys","Hypotensio ja kuivuma","Ensimmäinen vakava hypoglykemia tai alle kouluikäinen lapsi"]}
```

## Muista tämä -kertaus

- Epäile aina ensin hypoglykemiaa, kun diabeetikon tila on poikkeava – se on nopeasti korjattavissa.
- Tajuissaan oleva potilas saa hiilihydraatteja suun kautta, tajuton tai nielemiskyvytön suonensisäistä glukoosia; glukagoni on varavaihtoehto, kun suoniyhteyttä ei saada.
- DKA:ssa nesteytys on kiireellisempi kuin insuliini – se pelastaa hengen.
- Kussmaulin hengitys ja asetonin haju eivät ole paniikkikohtaus, vaan kehon keino kompensoida asidoosia.
- HHS:ssä nesteytys aina ennen insuliinia, jotta vältetään aivoödeema.
- Pumppupotilaalla ei ole pitkävaikutteista varajärjestelmää – pumppuvika voi johtaa DKA:han muutamassa tunnissa.
