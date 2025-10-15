# Icetribe - Hugo Website

Icetriben virallinen kotisivu, joka on rakennettu Hugo-generaattorilla ja Ananke-teemalla. Sisältää automaattisen WebP-kuvaoptimoinnin Cloudflare-hostingia varten.

## 🎸 Sivuston sisältö

- **Etusivu** - Tervetuloa Icetribeen
- **Tietoa yhtyeestä** - Bändin jäsenet ja historia
- **Repertuaari** - Kappaleet 7 vuosikymmeneltä (1960-2020)
- **Uutiset** - Keikkaraportit ja ajankohtaista
- **Yhteystiedot** - Keikkavaraukset ja yhteystiedot

## 🚀 Pika-aloitus

### Kehitysympäristö
```bash
# Kloonaa repository
git clone https://github.com/hluosujarvi/icetribe.git
cd icetribe

# Alusta submodulit (Ananke-teema)
git submodule update --init --recursive

# Käynnistä kehitysserveri
hugo server
```

Sivusto on nyt käytettävissä osoitteessa: **http://localhost:1313/**

### Tuotantoversio
```bash
# Rakenna staattinen sivusto
hugo

# Tiedostot löytyvät public/ kansiosta
```

## 📝 Sisällön muokkaus

### Sivujen muokkaus
- **Etusivu**: `content/_index.md`
- **Tietoa yhtyeestä**: `content/about.md`
- **Repertuaari**: `content/repertuaari.md`
- **Yhteystiedot**: `content/yhteystiedot.md`

### Uutisten/blogien lisääminen
1. Luo uusi kansio: `content/posts/postauksen-nimi/`
2. Luo tiedosto: `content/posts/postauksen-nimi/index.md`
3. Lisää front matter:
```markdown
+++
title = 'Postauksen otsikko'
date = '2025-10-15'
draft = false
tags = ['keikka', 'uutiset']
featured_image = 'kuva.jpg'  # valinnainen
+++

# Postauksen sisältö
Kirjoita sisältö markdown-muodossa...
```

## 📸 Kuvien käyttö ja optimointi

Sivusto optimoi kuvat automaattisesti WebP-muotoon Cloudflare-hostingia varten.

### 3 tapaa lisätä kuvia:

#### 1. 🏆 **Assets-kansio (SUOSITUS)**
```
assets/images/kuva.jpg
```
**Käyttö sisällössä:**
```markdown
{{< img src="kuva.jpg" alt="Kuvan kuvaus" >}}
```
✅ Automaattinen WebP-optimointi (q85, max 1200px)

#### 2. 📁 **Page Bundle**
```
content/posts/postaus/index.md
content/posts/postaus/kuva.jpg
```
**Käyttö:**
```markdown
{{< img src="kuva.jpg" alt="Kuvan kuvaus" >}}
```
✅ Automaattinen WebP-optimointi

#### 3. 📄 **Featured Image**
Lisää front matteriin:
```markdown
featured_image = 'kuva.jpg'  # Page bundlessa
# TAI
featured_image = '/images/kuva.jpg'  # Static-kansiossa
```
✅ Automaattinen WebP-optimointi (Page Bundle)

### Kuvaoptimoinnin hyödyt:
- 🚀 **25-50% pienempi tiedostokoko** (WebP vs JPEG)
- 📱 **Responsiivinen koko** (max 1200px)
- ⚡ **Lazy loading** (latautuu vain tarvittaessa)
- 🎯 **Cloudflare-optimoitu** laatu/koko -suhde

## 🎨 Teeman kustomointi

### Navigaatiovalikon muokkaus
Muokkaa `hugo.toml` tiedostoa:
```toml
[menu]
  [[menu.main]]
    name = "Sivun nimi"
    url = "/sivu/"
    weight = 1
```

### Sivuston asetukset
```toml
baseURL = 'https://icetribe.fi/'
languageCode = 'fi-fi'
title = 'Icetribe - Pop & Rock -bilebändi'
theme = 'ananke'

[params]
  read_more_copy = "Lue lisää"  # Suomenkielinen "Read more"
```

## 🗂️ Tiedostorakenne

```
icetribe/
├── content/
│   ├── _index.md              # Etusivu
│   ├── about.md               # Tietoa yhtyeestä
│   ├── repertuaari.md         # Kappalelista
│   ├── yhteystiedot.md        # Yhteystiedot
│   └── posts/                 # Blogipositukset
│       └── postaus/
│           ├── index.md       # Page Bundle
│           └── kuva.jpg       # Postauksen kuva
├── assets/
│   └── images/                # Optimoitavat kuvat (SUOSITUS)
├── static/
│   └── images/                # Staattiset kuvat (ei optimointia)
├── layouts/
│   ├── shortcodes/
│   │   └── img.html          # Kuvaoptimointi shortcode
│   └── partials/
│       └── func/
│           └── GetFeaturedImage.html  # WebP-optimointi
├── themes/
│   └── ananke/               # Git submodule
├── hugo.toml                 # Pääkonfiguraatio
└── README.md                # Tämä tiedosto
```

## 🔧 Teknologia

- **[Hugo](https://gohugo.io/)** - Staattinen sivustogeneraattori
- **[Ananke](https://github.com/theNewDynamic/gohugo-theme-ananke)** - Hugo-teema
- **[Tachyons CSS](https://tachyons.io/)** - Utility-first CSS framework
- **WebP Image Processing** - Automaattinen kuvaoptimointi
- **Cloudflare Pages** - Hosting (suositus)

## 🚀 Julkaisu

### Cloudflare Pages
1. Yhdistä GitHub repository Cloudflare Pagesiin
2. Build command: `hugo`
3. Output directory: `public`
4. Environment variable: `HUGO_VERSION = 0.151.0`

### GitHub Pages
```yaml
# .github/workflows/hugo.yml
name: Deploy Hugo site to Pages
on:
  push:
    branches: ["main"]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: '0.151.0'
          extended: true
      - name: Build
        run: hugo --minify
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

## 📞 Tuki

Jos tarvitset apua sivuston kanssa:
1. Tarkista Hugo-dokumentaatio: https://gohugo.io/documentation/
2. Ananke-teeman wiki: https://github.com/theNewDynamic/gohugo-theme-ananke/wiki
3. Ota yhteyttä kehittäjään

## 📄 Lisenssi

Tämä projekti käyttää MIT-lisenssiä. Ananke-teema on myös MIT-lisensoitu.