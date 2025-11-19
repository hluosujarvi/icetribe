# Icetribe – sisällöntuottajan opas

Tervetuloa Icetriben Hugo-sivuston sisältötiimiin! Tämä ohje keskittyy siihen, miten luot ja päivität sivuja, uutisia ja etusivun sisältöjä. Tekninen toteutus ja kehittäjäohjeet löytyvät erillisestä [Technical README:stä](./TECHNICAL_README.md).

## Pikalinkit
- **Live-sivusto:** https://icetribe.fi
- **Repository:** https://github.com/hluosujarvi/icetribe
- **Tekniset ohjeet:** [TECHNICAL_README.md](./TECHNICAL_README.md)

## Näin esikatselet muutokset
```bash
hugo server --disableFastRender
```
- Komento käynnistää esikatselun osoitteeseen <http://localhost:1313/>
- Paina `Ctrl+C`, kun olet valmis

## Uuden sivun luominen
1. Luo uusi Markdown-tiedosto `content/`-hakemistoon (esim. `content/arvostelut.md`).
2. Lisää alkuun front matter -lohko:
   ```markdown
   +++
   title = 'Arvostelut'
   draft = true          # Pidä true kunnes sivu on valmis
   featured_image = '/images/cover_arvostelut.jpg'
   description = 'Lyhyt kuvaus sivun sisällöstä (max ~160 merkkiä)'
   +++
   ```
3. Kirjoita varsinainen sisältö front matterin jälkeen Markdownilla.
4. Kun sivu on valmis julkaistavaksi, vaihda `draft = false`.

### Cover-kuvan lisääminen sivulle
1. Tallenna kannen kuva `static/images/` -hakemistoon (esim. `cover_arvostelut.jpg`).
2. Suositus: vaakasuuntainen kuva, vähintään 1600px leveä.
3. Viittaa kuvaan `featured_image = '/images/cover_arvostelut.jpg'`.

### Sisältöelementit sivuille
- Otsikoi sisällöt Markdown-otsikoilla (`#`, `##`, `###`...).
- Lisää kuvia Hugo-shortcodella:
  ```markdown
  {{< img src="kuva.jpg" alt="Kuvaus" >}}
  ```
- ➤ Pelkkä tiedostonimi toimii, kun kuva on saman sivun *page bundle* -kansiossa (`content/.../index.md` + kuvat) tai `assets/images/` -hakemistossa. Jos kuva on `static/images/`-hakemistossa, käytä koko polkua `src="/images/kuva.jpg"`.
- Korosta lainauksiin `quote`-shortcodea:
  ```markdown
  {{< quote >}}
  Yleisön palaute tähän.
  {{< /quote >}}
  ```
- SoundCloud-upotukset:
  ```markdown
  {{< soundcloud "https://soundcloud.com/icetribe/menevat-1" >}}
  ```
- Katso lisää esimerkkejä tiedostosta `content/example-content.md`.

## Uuden julkaisun (uutisen) luominen
Uutiset käyttävät Hugo page bundle -rakennetta (oma hakemisto sisällölle ja kuville).

1. Luo hakemisto ja index-tiedosto:
   ```bash
   mkdir -p content/posts/uusi-uutinen
   touch content/posts/uusi-uutinen/index.md
   ```
2. Lisää front matter -lohko:
   ```markdown
   +++
   title = 'Postauksen otsikko'
   date = '2025-11-19'   # Muoto YYYY-MM-DD
   draft = true          # Vaihda false, kun julkaiset
   featured_image = 'kuva.jpg'   # Kuva samassa hakemistossa
   tags = ['keikka', 'uutiset']   # 1–3 avainsanaa
   description = 'Lyhyt kuvaus uutisesta (meta-kuvaus)'
   +++
   ```
3. Kirjoita sisältö front matterin perään Markdownilla.
4. Tuo uutisen kuvat samaan hakemistoon (`content/posts/uusi-uutinen/`).
5. Käytä kuville shortcodea `{{< img src="kuva.jpg" alt="Kuvaus" >}}`.
6. ➤ Shortcode löytää kuvan pelkällä tiedostonimellä, koska postaus on page bundle. Jos käytät sivun yhteisiä kuvia `assets/images/` -kansiosta, pelkkä tiedostonimi riittää myös. `static/images/` -kansiosta haettaessa lisää aina `/images/`-alku.
7. Poista `draft` tai aseta `false`, kun haluat julkaisun näkyviin.

### Muistilista uutiselle
- **Otsikko:** Kerro uutisen ydin heti.
- **Päivämäärä:** Käytä tapahtuman tai julkaisun päivää.
- **Tagit:** Valitse 1–3 tagia (esim. `keikka`, `uutiset`, `media`).
- **Kuvat:** Pidä kuvat vaakasuuntaisina; aseta yksi `featured_image`ksi.
- **Ingressi:** Ensimmäinen kappale toimii tiivistelmänä uutislistauksessa.

## Etusivun CTA:n päivittäminen
Etusivun lopussa oleva CTA-osion sisältö haetaan `hugo.toml`-tiedostosta lohkosta `[params.band]`. Lisää tai muokkaa seuraavaa:
```toml
[params.band]
cta_title = 'Tilaa Icetribe tapahtumaasi'
cta_intro = 'Rakennamme kanssasi illan, joka jää mieleen.'
highlights = [
  'Seitsemän vuosikymmenen hittikattaus',
  'Oma äänentoisto ja bilevalot',
  'Yhteistyö ja toiveiden kuuntelu'
]
cta_button_text = 'Ota yhteyttä'
```
- `highlights` näkyy listana CTA-boksissa – valitse 2–4 iskevää pointtia.
- Jos lohkoa ei ole, etusivu käyttää layoutin oletustekstiä.

## Sivuston nimi ja perustiedot
- **Sivuston nimi:** `hugo.toml` → `title = 'Icetribe'`
- **Etusivun slogani & kuvaus:** `content/_index.md` → front matterin `title` ja `description`.
- **Sosiaalisen median linkit:** `hugo.toml` → `[params.ananke.social.*]`
  ```toml
  [params.ananke.social.facebook]
  profilelink = 'https://www.facebook.com/Icetribe'
  ```
- **Yhteystiedot-sivu:** päivitettävissä suoraan tiedostossa `content/yhteystiedot.md`.

## Metadata-checklist ennen julkaisua
### Sivut
- `title` – näkyy hero-alueella ja selaimen otsikossa.
- `description` – lyhyt meta-kuvaus hakukoneille.
- `featured_image` – cover-kuvan polku `static/images/` -hakemistoon.
- `draft` – vaihda `false`, kun sivu on valmis.

### Uutiset
- Kaikki yllä mainitut +
- `date` – julkaisu- tai tapahtumapäivä.
- `tags` – maksimissaan kolme hakusanaa.
- `featured_image` – tiedostonimi ilman `/images/`-polkua (kuva samassa hakemistossa).

## Julkaiseminen
1. Varmista, että julkaistavien sivujen `draft` on `false`.
2. Testaa paikallisesti komennolla `hugo server`.
3. Tallenna muutokset Gitillä:
   ```bash
   git add .
   git commit -m "Päivitä sisältö"
   git push origin main
   ```
4. GitHub Pages julkaisee sivuston automaattisesti 2–5 minuutissa.

---
Tekniset yksityiskohdat, värit ja testaus löytyvät tiedostosta [TECHNICAL_README.md](./TECHNICAL_README.md). Tarvitsetko apua? Pingaa kehitystiimiä GitHubin issueissa tai kysy suoraan. Yhdessä pidämme Icetriben tarinan elävänä! 🎸