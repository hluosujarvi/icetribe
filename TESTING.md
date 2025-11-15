# Icetribe Hugo Site - Test Documentation

## Testiympäristön yleiskatsaus

Tämä testiympäristö varmistaa että Icetribe-sivusto toimii oikein ja päivitykset eivät riko olemassa olevaa toiminnallisuutta.

## Testien kategoriat

### 1. Hugo Build Tests
- **Hugo version compatibility**: Varmistaa että Hugo Extended v0.100+ on käytössä
- **Clean build**: Testaa että sivusto kääntyy ilman virheitä
- **Output validation**: Tarkistaa että tarvittavat tiedostot generoidaan

### 2. Content Structure Tests  
- **Required pages**: Varmistaa että kaikki tärkeät sivut löytyvät
- **Posts structure**: Tarkistaa posts-hakemiston rakenteen
- **Minimum content**: Varmistaa että sivustolla on vähintään 2 julkaisua

### 3. Front Matter Validation
- **Required fields**: Tarkistaa että title, date, draft -kentät löytyvät
- **Featured images**: Validoi kuvien määrittelyn
- **Tags structure**: Tarkistaa tagien muotoilun

### 4. Layout and Template Tests
- **Custom layouts**: Varmistaa että mukautetut layoutit löytyvät
- **Shortcodes**: Tarkistaa quote, img, soundcloud shortcodejen olemassaolon
- **Partials**: Validoi apufunktioiden löytymisen

### 5. Configuration Tests
- **TOML validation**: Varmistaa että hugo.toml on validi
- **Required settings**: Tarkistaa baseURL, language, theme -asetukset  
- **Menu structure**: Validoi navigaation määrittelyn
- **Image processing**: Tarkistaa WebP-asetukset

### 6. Asset and Static File Tests
- **CSS files**: Varmistaa että tyylitiedostot löytyvät
- **Static assets**: Tarkistaa CNAME ja kuvat
- **Build assets**: Validoi että assetit käännetään oikein

### 7. Content Quality Tests
- **Finnish language**: Tarkistaa että sisältö on suomeksi
- **Shortcode usage**: Validoi shortcodejen käytön
- **Internal links**: Etsii rikkinäisiä sisäisiä linkkejä

### 8. Build Output Validation  
- **HTML structure**: Tarkistaa HTML:n rakenteen
- **Meta tags**: Validoi SEO-metatagit
- **Performance**: Testaa WebP-optimoinnin ja minifioinnin

### 9. Performance and SEO Tests
- **SEO basics**: Title, description, og-tagit
- **Structured data**: JSON-LD datan läsnäolo
- **Language attributes**: Suomen kielen merkintä

## Testien suorittaminen

### Nopeat kehitystestit
```bash
# Nopea tarkistus kehityksen aikana
./quick-test.sh

# tai Makefilen kautta
make quick-test
```

### Kattavat testit
```bash
# Täydellinen testisarja
./test-suite.sh

# tai Makefilen kautta  
make test
```

### Kehitystyönkulku
```bash
# Testaa ja käynnistä dev-server
make dev

# Pelkkä tarkistus
make check

# Tilan katsominen
make status
```

## CI/CD Integration

GitHub Actions ajaa testit automaattisesti:
- **Push to main/test**: Suorittaa kaikki testit
- **Pull request**: Validoi muutokset ennen mergea
- **Deploy**: Testit must pass ennen deploymenttia

## Testien tulkinta

### Onnistuneet testit ✅
- Vihreä `[PASS]` merkintä
- Kaikki testit läpäisty = sivusto on valmis deploymenttiin

### Epäonnistuneet testit ❌  
- Punainen `[FAIL]` merkintä
- Korjaa ongelmat ennen jatkamista
- Katso yksityiskohtaiset virheilmoitukset

### Varoitukset ⚠️
- Keltainen `[WARN]` merkintä  
- Ei kriittinen, mutta kannattaa tarkistaa

## Uusien testien lisääminen

### Uusi testifunktio
```bash
test_uusi_kategoria() {
    log_info "=== Uusi testiryhmä ==="
    
    run_test "Testin nimi" "komento_tai_funktio"
}
```

### Testien lisääminen pääfunktioon
```bash
main() {
    # ... olemassa olevat testit ...
    test_uusi_kategoria
}
```

## Testikonfiguraatio

Testien asetukset löytyvät `test-config.json` tiedostosta:
- Required files ja paths
- Minimum requirements
- Performance thresholds
- Content validation rules

## Paikallinen kehitys

### Git hooks
```bash  
# Asenna pre-commit hook
make setup-hooks
```

Nyt testit ajetaan automaattisesti ennen jokaista committia.

### Suositellut workflow

1. **Kehitä** → `make quick-test` 
2. **Testaa** → `make test`
3. **Commit** → Automaattiset testit
4. **Push** → GitHub Actions CI

## Troubleshooting

### Yleiset ongelmat

**"Hugo not found"**
- Asenna Hugo Extended v0.100+
- Tarkista PATH-muuttuja

**"Build fails"**  
- Tarkista hugo.toml syntaksi
- Validoi front matter YAML/TOML
- Katso puuttuvat tiedostot

**"Tests fail on CI"**
- Varmista että kaikki tiedostot on committoitu
- Tarkista että paths ovat oikein
- Katso GitHub Actions lokit

**"WebP processing fails"**
- Varmista Hugo Extended version
- Tarkista imaging-asetukset hugo.toml

### Debug-vinkit

```bash
# Verbose Hugo build
hugo --verbose --debug

# Test specific category
./test-suite.sh | grep "=== Category ==="

# Check generated files
ls -la public/
```