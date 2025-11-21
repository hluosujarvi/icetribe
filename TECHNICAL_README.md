# Icetribe – tekninen README

Tämä dokumentti toimii kehittäjien ja Copilotin teknisenä ohjenuorana. Se kuvaa sivuston rakenteen, värien hallinnan, kuvien optimoinnin sekä testausprosessin. Pidä tämä tiedosto ajan tasalla aina, kun rakenteellisia muutoksia tehdään.

---

## 1. Sivukartta ja rakenteet

### Navigaatio ja sisällöt
- **Päävalikko** (määritelty `hugo.toml`-tiedostossa):
  1. `/` – Etusivu (`content/_index.md`)
  2. `/about/` – Bändi (`content/about.md`)
  3. `/soitossa/` – Biisit (`content/soitossa.md`)
  4. `/posts/` – Kuulumiset (`content/posts/_index.md`)
  5. `/yhteystiedot/` – Yhteystiedot (`content/yhteystiedot.md`)
- **Lisäsivut**: `content/arvostelut.md`, `content/cookies.md`, `content/example-content.md`, `content/ga-debug.md` ovat tukisivuja tai esimerkkimateriaalia (usein `draft = true`).
- **Blogipostaukset**: jokainen postaus on *page bundle* -rakenteessa `content/posts/<slug>/index.md`, samassa kansiossa sijaitsevat postauksen kuvat.

### Templatet ja osat
- **Perusteemat**: Hugo-teema Ananke (`themes/ananke`).
- **Sivukohtaiset layoutit**: `layouts/index.html` (etusivun hero + CTA + sivupalkki), `layouts/posts/list.html` ja `layouts/posts/single.html` (uutislistaukset ja artikkelit), `layouts/_default/single.html` (muut yksittäiset sivut).
- **Partialit**: 
  - `layouts/partials/image-preloads.html` (preload-linkit hero-kuville). 
  - `layouts/partials/func/GetFeaturedImage.html` (enhanced) valitsee ja optimoi sivun hero-kuvan Hugo-prosessoinnilla (hyödyntää front matter -kenttää `featured_image`).
- **Shortcodet**: `layouts/shortcodes/img.html` (WebP-optimoitu kuvasisältö), `quote.html`, `soundcloud.html`. Käytä shortcodeja aina kuvien ja SoundCloud-soittimien lisäämiseen.

### Staattiset resurssit
- **Kuvat**: `assets/images/` sisältää optimoitavat hero-kuvat (cover_*.jpg). `static/images/` toimii fallbackina. Postien kuvat pysyvät omissa page bundle -kansioissaan.
- **JavaScript**: `static/js/icetribe-simple-config.js` hallitsee evästekysyä, GA4:n dynaamista latausta ja SoundCloud-suostumuksia. Skripti normalisoi myös mahdolliset legacy-localStorage-arvot (esim. merkkijonot "accepted"/"rejected") booleaneiksi ennen consent-logiikan ajamista, jotta palaavat kävijät saavat oikeat asetukset heti sovellettua.

---

## 2. Värien hallinta

### Paletin lähde
- **Ainoa totuuslähde väreille** on `assets/css/colors.css`. Kaikki uudet värit lisätään sinne CSS-muuttujina (`--color-*`).
- Paletissa on seuraavat ydinmuuttujat: 
  - `--color-accent`, `--color-accent-dark`, `--color-accent-light`
  - `--color-bg-page`, `--color-bg-card`
  - `--color-text-primary`, `--color-text-secondary`
  - `--color-border-subtle`, `--color-overlay`, `--color-shadow`

### Käyttö ja riippuvuudet
- Seuraavat tyylitiedostot käyttävät vain edellä mainittuja muuttujia: 
  - `assets/css/homepage-layout.css`
  - `assets/css/simple-consent.css`
  - `assets/css/consent-manager.css`
  - `assets/css/image-optimization.css`
- Muista lisätä `colors.css` aina ensimmäiseksi listaan `params.custom_css` -asetuksessa (`hugo.toml`), jotta muuttujat ovat käytettävissä muissa tyylitiedostoissa.

### Poikkeukset ja erikoistapaukset
- `assets/css/quote-block.css` sisältää SoundCloud-brändiä mukailevat oranssit sävyt kovakoodattuina. Jos värejä halutaan yhdenmukaistaa, siirrä sävyt `colors.css` -tiedostoon ja päivitä quote-tyylit käyttämään muuttujia.
- Älä lisää uusia väriarvoja muihin CSS-tiedostoihin. Jos tarvitset uuden sävyn, laajenna palettia `colors.css`-tiedostossa ja käytä muuttujaa.

---

## 3. Kuvien optimointi

### Lähestymistapa
- Hugo Extended (versio ≥ 0.151.0) tuottaa WebP-versiot automaattisesti infran avulla, koska `hugo.toml` määrittää `imaging`-asetukset laadulla 85 ja Lanczos-resamplella.
- `layouts/shortcodes/img.html` käsittelee kuvat:
  - Etsii kuvan ensin sivun *page bundle*sta, muuten `assets/images/`-polusta.
  - Luo 800px leveät WebP- ja JPEG-versiot (`Resize`-komennot) ja palauttaa `<picture>`-elementin lazy-loadingilla.
- Hero-kuvat (featuredit) asetetaan front matterin `featured_image` -kentässä pelkällä tiedostonimellä (esim. `cover_index.jpg`). Enhanced `GetFeaturedImage.html` etsii kuvan `assets/images/`-hakemistosta, optimoi sen Hugo-prosessoinnilla (1600px WebP q85) ja palauttaa optimoidun version polun. Fallback `static/images/`-hakemistoon säilyy yhteensopivuuden vuoksi.
- `layouts/partials/image-preloads.html` preloadaa nykyisen sivun hero-kuvan korkealla prioriteetilla ja muut päävalikon kannet matalalla prioriteetilla – näin estetään headerin "vilkkuminen" sivunvaihdossa.
- `assets/css/image-optimization.css` varmistaa, että taustakuvat ja hover-tilaan liittyvät resurssit ovat valmiiksi selaimen välimuistissa.

### Käyttöohjeet kehittäjille
- **Hero-kuvat**: Sijoita `assets/images/`-hakemistoon ja viittaa front matterissa pelkällä tiedostonimellä: `featured_image = 'cover_index.jpg'`. Hugo optimoi automaattisesti WebP-muotoon.
- **Postikuvat**: Sijoitetaan page bundleen ja referoidaan shortcoden kautta: `{{< img src="hero.jpg" alt="Kuvaus" >}}`.
- **Backup-sijainti**: `static/images/` toimii fallbackina hero-kuville, jos `assets/images/` -versiota ei löydy.
- Muista lisätä uusi hero-kuva myös `image-preloads.html`-tiedoston `slice`-listaan.
- Älä lataa kuvia suoraan Markdownissa (esim. `![alt](/path.jpg)`), koska silloin WebP-optimointi ja lazy-loading jäävät pois.

---

## 4. Testaus

### Välttämättömät työkalut
- Node.js ≥ 16 (testit käyttävät Puppeteeria).
- Hugo Extended ≥ 0.151.0 (WebP-käsittely). Varmista `hugo version` -komennolla.

### npm-skriptit (`package.json` juurihakemistossa)
- `npm install` – asentaa testikehikon riippuvuudet.
- `npm test` – ajaa `tests/run-tests.js`:in, joka kutsuu sisältö-, linkki-, metadata-/kuva-, suorituskyky- ja saavutettavuustestit järjestyksessä.
- `npm run test:content`, `test:links`, `test:performance`, `test:accessibility` – aja yksittäisiä testejä.
- `npm run test:watch` – nodemon-pohjainen jatkuva testaus kehityksen aikana.

### Shell-skriptit
- `quick-test.sh` – nopea sanity check (Hugo-config, perussisältö, layoutit, kevyt build).
- `test-suite.sh` – laaja Bash-pohjainen regressiotesti (build, sisällöt, front matter, layoutit, output-validointi, SEO-metriikat). Skripti olettaa, että `layouts/partials/func/GetFeaturedImage.html` on olemassa; jos käytetään teeman versiota, päivitä polku tai kopioi partial `layouts/partials/func/` -hakemistoon.
- `automated-test.sh` – cookie consentin ja GA4:n integroinnin erikoistestaaja. Käynnistää ja pysäyttää Hugo-serverin, tarkistaa evästebannerin, GA4:n consent-pohjaisen latauksen ja SoundCloudin suostumuslogiikan.

### Lisätestit (`tests/`-hakemisto)
- `finnish-validation.js`, `finnish-validation-report.json` – varmistavat suomen kielen laadun.
- `error-handling-test.js` – tarkistaa virheenkäsittelyn consent-skriptissä.
- `markdown-asset-validation.js`, `markdown-assets-report.json` – varmistavat front matter -kenttien sekä kuvaviittausten oikeellisuuden (featured image + shortcode- ja Markdown-kuvat).
- `tests/package.json` – erillinen paketti lisätestejä varten (`npm run test:finnish`, `npm run test:errors`).

### Raportointi ja tulokset
- JSON-raportit sijoitetaan automaattisesti `tests/`-hakemistoon (`test-report.json`, `content-report.json`, `markdown-assets-report.json`, …).
- Testit käynnistävät Hugo-serverin porttiin 1313. Varmista, ettei porttia käytä muu prosessi; skriptit yrittävät kyllä tappaa aiemmat instanssit.

---

## 5. Ohjeistus Copilotille ja uusille kehittäjille

- Älä levitä uusia väriarvoja muihin tiedostoihin – kaikki värit on määriteltävä `assets/css/colors.css`-tiedostossa ja hyödynnettävä CSS-muuttujia.
- **Hero-kuvien lisääminen**: Sijoita kuva `assets/images/`-hakemistoon, viittaa front matterissa pelkällä tiedostonimellä (`featured_image = 'cover_new.jpg'`), ja lisää `layouts/partials/image-preloads.html`-tiedoston `slice`-listaan.
- Käytä kuville ja SoundCloud-upotuksille aina annettuja shortcoden toteutuksia – näin WebP-optimointi ja consent-logiikka pysyvät voimassa.
- Suorita vähintään `npm test` tai `quick-test.sh` ennen commitointia. Cookie- ja GA4-muutoksiin liittyen aja `automated-test.sh` varmistaaksesi consent-käytöksen.
- GA4-taustalataus: `themes/ananke/layouts/_default/baseof.html` sisältää kevyen preloader-skriptin, joka tarkistaa localStoragesta (legacy-muodot huomioiden) onko analytiikka jo hyväksytty ja liittää `gtag.js`-loaderin heti sivun renderöityessä ennen varsinaista consent-skriptin alustusta.
- Jos teet muutoksia evästebanneriin tai GA4-integraatioon, tarkista `static/js/icetribe-simple-config.js` sekä siihen liittyvät testit (`automated-test.sh`, `tests/error-handling-test.js`).

### Testauskomennot (terminaalista)

```bash
# Nopea sanity check
./quick-test.sh

# Consent/GA4/SoundCloud-integraation erikoistestaus
./automated-test.sh

# Pipeline-tason regressio (sisältää GA build -validaation)
./test-suite.sh

# Node-pohjainen testipaketti (luo JSON-raportit tests/-hakemistoon)
npm test

# Yksittäiset Puppeteer-/GA-tarkistukset
node tests/ga-build-validation.js
```

Pidä tämä dokumentti referenssinä, kun rakennat uusia ominaisuuksia tai käytät Copilotia muutosten ehdottamiseen. Dokumenttiin kirjatut rajaukset auttavat varmistamaan, että automaatiotyökalut kohdistavat muutokset oikeisiin tiedostoihin ja säilyttävät sivuston rakenteen yhtenäisenä.
