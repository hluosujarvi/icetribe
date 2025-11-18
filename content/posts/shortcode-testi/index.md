+++
title = 'Shortcode-testi: Kaikki elementit toiminnassa'
date = '2025-01-15'
draft = true
featured_image = '/images/cover_about.jpg'
tags = ['testi', 'shortcode']
+++

Tämä on testipostaus jossa tarkistetaan että kaikki example-content:n elementit toimivat myös postauksissa.

## Kuvat ja WebP-optimointi

{{< img src="cover_about.jpg" alt="Icetribe-yhtyeen jäseniä" >}}

Kuva tulisi näkyä WebP-optimoituna ja responsiivisena.

## SoundCloud-integraatio evästeiden kanssa

{{< soundcloud "https://soundcloud.com/icetribe/menevat-1" >}}

SoundCloud-soitin tulisi näkyä GDPR-yhteensopivana evästeilmoituksen kanssa.

## Lainaukset

> **Icetribe tuo hauskan bilefiiliksesn jokaiseen tapahtumaan!**
> 
> *- Tyytyväinen asiakkasmme*

## Listat

### Tulevat keikat
- 25.1.2025 - Kulttuuritalo Tampere
- 15.2.2025 - Yökerho Jyväskylä  
- 8.3.2025 - Festivaali Helsinki

### Yhtyeen jäsenet
1. **Tiina** - Laulu
2. **Henry** - Rummut  
3. **Tomi** - Basso
4. **Kalle** - Koskettimet
5. **Jarmo** - Kitara

## Taulukot

| Vuosikymmen | Kappaleita | Suosituimmat |
|-------------|-----------|--------------|
| 1960s       | 25        | Dancing Queen, Waterloo |
| 1970s       | 30        | Hotel California, Bohemian Rhapsody |
| 1980s       | 35        | Sweet Child O' Mine, Livin' on a Prayer |
| 1990s       | 28        | Wonderwall, Smells Like Teen Spirit |
| 2000s       | 32        | Mr. Brightside, Seven Nation Army |
| 2010s       | 22        | Uptown Funk, Shape of You |
| 2020s       | 15        | Blinding Lights, Levitating |

## Koodiblokki (teknisille testauksille)

```javascript
// Cookie consent testi
if (localStorage.getItem('cookieConsent') === 'accepted') {
    console.log('Evästeet hyväksytty - ladataan analytiikka');
    loadAnalytics();
}
```

## Painotukset ja muotoilut

**Lihavoitu teksti** ja *kursivoitu teksti* sekä ***molemmat yhdistettynä***. 

`Kooditekstiä` rivin sisällä.

---

Tämä testipostaus varmistaa että kaikki example-content:n elementit toimivat identtisesti myös posts-kontekstissa.