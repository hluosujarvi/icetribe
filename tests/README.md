# Testaus - Icetribe Website

Tämä hakemisto sisältää kattavan testausframeworkin Icetribe Hugo -sivustolle. Testit varmistavat että sivuston päivitykset eivät riko sisältöä tai toiminallisuuksia.

## Testien rakenne

### 🧪 Päätestaaja
- **`run-tests.js`** - Suorittaa kaikki testit järjestyksessä ja hallinnoi Hugo-serveriä

### 📄 Sisältötestit
- **`content-validation.js`** - Tarkistaa sivuston sisällön eheyden
  - Hugo build-validointi 
  - Pakollisten sivujen tarkistus
  - Navigaation toimivuus
  - Sosiaalisen median linkit
  - Quote-blockit ja kuvat

### 🔗 Linkkitestit  
- **`link-checker.js`** - Validoi kaikki linkit
  - Sisäiset linkit ja ankkurit
  - Navigaation johdonmukaisuus
  - Kuvien lähteet
  - Sosiaalisen median linkit

### ⚡ Suorituskykytestit
- **`performance-test.js`** - Mittaa sivuston suorituskykyä
  - Latausajat ja Web Vitals
  - FCP, LCP, CLS -mittarit
  - Resurssilaskenta
  - Responsiivinen suunnittelu

### ♿ Saavutettavuustestit
- **`accessibility-test.js`** - Tarkistaa WCAG-yhteensopivuuden
  - Alt-tekstit kuville
  - Otsikkohierarkia (h1-h6)
  - Linkkien kuvaukset  
  - Lomakkeiden labelit
  - Näppäimistönavigaatio

## Käyttöönotto

### 1. Asenna riippuvuudet
```bash
npm install
```

### 2. Suorita kaikki testit
```bash
npm test
```

### 3. Suorita yksittäisiä testejä
```bash
# Sisältötestit
npm run test:content

# Linkkitestit  
npm run test:links

# Suorituskykytestit
npm run test:performance

# Saavutettavuustestit
node tests/accessibility-test.js
```

### 4. Jatkuva testaus kehityksen aikana
```bash
npm run test:watch
```

## Testiraportit

Testit luovat JSON-raportit `tests/`-hakemistoon:
- `test-report.json` - Yleiset testitulokset
- `content-report.json` - Sisältövalidoinnin tulokset  
- `link-report.json` - Linkkitarkistuksen tulokset
- `performance-report.json` - Suorituskykymetriikat
- `accessibility-report.json` - Saavutettavuusauditointi

## Hugo-serverin hallinta

Testausframework käynnistää ja pysäyttää Hugo-serverin automaattisesti:
- Portti: 1313
- URL: http://localhost:1313/
- Odotusaika: 10 sekuntia käynnistymiselle
- Graceful shutdown testien päätteeksi

## Testien kynnysarvot

### Suorituskyky
- **First Contentful Paint**: ≤ 2000ms
- **Largest Contentful Paint**: ≤ 4000ms  
- **Cumulative Layout Shift**: ≤ 0.1
- **Kokonaislatausaika**: ≤ 3000ms
- **Resurssimäärä**: ≤ 50 per sivu

### Saavutettavuus
- Kaikki kuvat tarvitsevat alt-tekstin
- Otsikkohierarkian tulee olla looginen (h1→h2→h3)
- Linkkien tekstin tulee olla kuvaavaa
- Lomakekenttien tulee olla labeled

## Kehittäjille

### Uuden testin lisääminen
1. Luo uusi testi `tests/`-hakemistoon
2. Noudata olemassa olevaa rakennetta:
   - Chalk-värikoodit lokitukseen
   - JSON-raportit tuloksille
   - Proper error handling
3. `run-tests.js` löytää automaattisesti `.js`-päätteiset tiedostot

### CI/CD integraatio
Testit on suunniteltu toimimaan GitHub Actionsissa:
```yaml
- name: Run tests
  run: npm test
```

### Ongelmanratkaisu
- **Hugo server ei käynnisty**: Tarkista että Hugo on asennettu ja PATH:issa
- **Riippuvuudet puuttuvat**: Suorita `npm install`
- **Testit timeout**: Tarkista Hugo-serverin lokitiedostot
- **Performance-testit epäonnistuvat**: Varmista että localhost:1313 on vapaana

## Testien kattavuus

✅ **Hugo build-validointi**  
✅ **Sisältöeheeys**  
✅ **Linkkien toimivuus**  
✅ **Navigaation johdonmukaisuus**  
✅ **Suorituskykymetriikat**  
✅ **Responsiivinen suunnittelu**  
✅ **Saavutettavuusstandardit**  
✅ **Sosiaalisen median integraatio**  
✅ **Kuvien optimointi**  
✅ **Quote-blokit**

Tämä testausframework varmistaa että Icetribe-sivusto pysyy laadukkaana ja toimivana kaikissa päivityksissä.