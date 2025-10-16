# 🎸 Icetribe - Hugo Website

Icetriben virallinen kotisivu, joka on rakennettu Hugo-generaattorilla ja Ananke-teemalla. Sivusto sisältää automaattisen WebP-kuvaoptimoinnin ja on käytössä GitHub Pages -palvelussa.

## 🌐 Sivusto

- **Live-sivusto**: https://hluosujarvi.github.io/icetribe/
- **Repository**: https://github.com/hluosujarvi/icetribe

## � Sivuston sisältö

- **Etusivu** - Tervetuloa Icetribeen
- **Tietoa yhtyeestä** - Bändin jäsenet ja historia  
- **Repertuaari** - Kappaleet 7 vuosikymmeneltä (1960-2020)
- **Uutiset** - Keikkaraportit ja ajankohtaista
- **Yhteystiedot** - Keikkavaraukset ja yhteystiedot

## 📱 Sosiaalinen media

Icetribe löytyy myös sosiaalisesta mediasta:
- **Facebook**: https://www.facebook.com/Icetribe
- **Instagram**: @icetribe_official
- **SoundCloud**: https://soundcloud.com/icetribe

## 🚀 Pika-aloitus

### Kehitysympäristö
```bash
# Kloonaa repository
git clone https://github.com/hluosujarvi/icetribe.git
cd icetribe

# Käynnistä kehitysserveri (Hugo Extended vaaditaan!)
hugo server

# Sivusto näkyy osoitteessa: http://localhost:1313/
```

### Tuotantoversio
Sivusto päivittyy automaattisesti GitHub Pages:iin kun teet muutoksia `main`-branchiin. GitHub Actions käyttää Hugo Extended 0.151.0 versiota.

## 📝 Sisällön muokkaus

### Sivujen muokkaus
- **Etusivu**: `content/_index.md`
- **Tietoa yhtyeestä**: `content/about.md`
- **Repertuaari**: `content/repertuaari.md`
- **Yhteystiedot**: `content/yhteystiedot.md`

### Hugo Front Matter -esimerkki
```markdown
+++
title = 'Sivun otsikko'
date = '2025-10-16'
draft = false
featured_image = '/images/kuva.jpg'  # Valinnainen herokuva
+++

# Sivun sisältö Markdownilla
```

## 📸 Kuvien lisääminen

### 1. Sivutason kuvat (etusivut, taustakuvat)
```
static/images/
├── Front.jpg          # Etusivun herokuva  
├── band-photo.jpg     # Yhtyeen kuva
├── logo.png           # Logo
└── background.jpg     # Taustakuva
```

**Käyttö sivuilla:**
```markdown
+++
featured_image = '/images/band-photo.jpg'
+++
```

### 2. Postauksen kuvat (Page Bundle -rakenne)
```
content/posts/
└── uusi-postaus/
    ├── index.md       # Postauksen sisältö
    ├── herokuva.jpg   # Postauksen herokuva
    └── sisaltokuva.jpg # Sisältökuva
```

**Käyttö postauksessa:**
```markdown
+++
title = 'Uusi postaus'
featured_image = 'herokuva.jpg'    # Ei /images/ polkua!
+++

Postauksen sisältö...

{{< img "sisaltokuva.jpg" "Kuvan kuvaus" >}}
```

### WebP-optimointi
Kaikki kuvat muunnetaan automaattisesti WebP-muotoon laadulla 85%. Alkuperäiset kuvat säilyvät fallback-vaihtoehtona.

## 📰 Uuden postauksen luominen

### 1. Luo hakemisto ja tiedostot
```bash
# Luo postauksen hakemisto
mkdir -p content/posts/postauksen-nimi

# Luo index.md tiedosto
touch content/posts/postauksen-nimi/index.md
```

### 2. Lisää sisältö
```markdown
+++
title = 'Postauksen otsikko'
date = '2025-10-16'
draft = false
featured_image = 'herokuva.jpg'  # Jos haluat herokuvan
+++

# Postauksen otsikko

Postauksen sisältö Markdownilla...

## Alataso-otsikko

Lisää tekstiä ja kuvia:

{{< img "kuva1.jpg" "Kuvan kuvaus" >}}
```

### 3. Lisää kuvat
```bash
# Kopioi kuvat postauksen hakemistoon
cp ~/Downloads/kuva.jpg content/posts/postauksen-nimi/
```

### 4. Tallenna ja julkaise
```bash
# Lisää muutokset Gitiin
git add .
git commit -m "Lisää uusi postaus: Postauksen nimi"
git push origin main
```

Sivusto päivittyy automaattisesti GitHub Pages:iin noin 2-5 minuutissa.

## 🛠️ Tekninen toteutus

### Hugo-versio ja teema
- **Hugo Extended 0.151.0** (vaaditaan WebP-käsittelyyn)
- **Ananke-teema** (suora kopio, ei submodule)
- **WebP-optimointi** automaattisesti kaikille kuville
- **Responsiiviset kuvat** {{< img >}} shortcodella

### Tiedostorakenne
```
icetribe/
├── hugo.toml              # Pääkonfiguraatio
├── content/               # Sivujen sisältö
│   ├── _index.md         # Etusivu
│   ├── about.md          # Tietoa yhtyeestä
│   └── posts/            # Blogiposts
│       └── postaus/      # Page Bundle -rakenne
├── static/images/        # Sivutason kuvat
├── layouts/              # Mukautetut layoutit
│   └── shortcodes/
│       └── img.html      # WebP-optimoitu kuva-shortcode
├── themes/ananke/        # Teema (suora kopio)
└── .github/workflows/    # GitHub Actions CI/CD
```

### Deployment
- **GitHub Actions** automaattinen deployment
- **GitHub Pages** hosting Hugo Extended -tuella
- **WebP-optimointi** käytössä tuotannossa
- **Automaattinen HTTPS** ja CDN GitHub Pages:in kautta

## � Konfiguraatio

### hugo.toml - tärkeimmät asetukset
```toml
# WebP-optimointi
[imaging]
  quality = 85
  
[imaging.webp]
  quality = 85
  lossless = false

# Sosiaalinen media
[params.ananke.social.follow]
  networks = ["facebook", "instagram", "soundcloud"]
```

### Shortcodet
- `{{< img "kuva.jpg" "Kuvaus" >}}` - WebP-optimoitu responsiivinen kuva
- Luo automaattisesti `<picture>`-elementit WebP + JPEG fallback

## 🐛 Yleisiä ongelmia

### Hugo Extended puuttuu
```bash
# macOS (Homebrew)
brew install hugo

# Tarkista versio
hugo version  # Pitää näyttää "extended"
```

### Kuvat eivät näy
- Tarkista polut: `/images/` sivutason kuville, ei polkua Page Bundle -kuville
- Varmista että kuvat ovat oikeassa hakemistossa

### Sivusto ei päivity
- Tarkista GitHub Actions: https://github.com/hluosujarvi/icetribe/actions
- Odota 2-5 minuuttia deployment:in valmistumista

## 📞 Tuki

Jos tarvitset apua sivuston kanssa:
1. Tarkista tämä README.md
2. Katso GitHub Issues: https://github.com/hluosujarvi/icetribe/issues
3. Ota yhteyttä ylläpitäjään

---

**Icetribe** - Pop & Rock -bilebändi | 🎵 Seitsemän vuosikymmenen hitit nykyaikaan