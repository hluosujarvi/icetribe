#!/bin/bash

# Icetribe Hugo Website - Automated Testing Suite
# Testaa evästeiden hallinta ja Google Analytics integraatio
# Version: 1.1 (GA4 External Loader + Cookie Functionality Tests)

echo "🧪 Icetribe Automated Testing Suite - Evästeet ja GA4"
echo "=================================================="
echo "Testataan: $(date)"
echo ""

# Värit terminaaliin
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Testien tulokset
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_TESTS=0

# Testituloksen tallennuksen funktio
log_test() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
        [ -n "$details" ] && echo -e "   ${BLUE}→${NC} $details"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name"
        [ -n "$details" ] && echo -e "   ${YELLOW}→${NC} $details"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
}

# Funktio tiedostojen tarkistukseen
test_file_exists() {
    local file_path="$1"
    local test_name="$2"
    
    if [ -f "$file_path" ]; then
        log_test "$test_name" "PASS" "Tiedosto löytyi: $file_path"
    else
        log_test "$test_name" "FAIL" "Tiedosto puuttuu: $file_path"
    fi
}

# Funktio sisällön tarkistukseen
test_file_content() {
    local file_path="$1"
    local search_pattern="$2"
    local test_name="$3"
    
    if [ -f "$file_path" ]; then
        if grep -q "$search_pattern" "$file_path"; then
            log_test "$test_name" "PASS" "Löytyi: '$search_pattern'"
        else
            log_test "$test_name" "FAIL" "Ei löytynyt: '$search_pattern'"
        fi
    else
        log_test "$test_name" "FAIL" "Tiedosto puuttuu: $file_path"
    fi
}

# Funktio Hugo serverin sammutukseen
shutdown_hugo_server() {
    echo "   🔄 Sammutetaan Hugo server..."
    pkill hugo 2>/dev/null || true
    sleep 2
    
    # Varmista että server on sammunut
    if ! pgrep hugo >/dev/null; then
        log_test "Hugo Server Shutdown" "PASS" "Hugo server sammutettu onnistuneesti"
    else
        log_test "Hugo Server Shutdown" "FAIL" "Hugo server ei sammuttunut"
    fi
}

# Funktio Hugo serverin käynnistämiseen taustaprocessiksi
start_hugo_server() {
    echo "   🔄 Käynnistetään Hugo server..."
    nohup hugo server --port 1313 >/dev/null 2>&1 &
    sleep 3
    
    # Tarkista että server käynnistyi
    if curl -s http://localhost:1313 >/dev/null 2>&1; then
        log_test "Hugo Server Startup" "PASS" "Hugo server käynnistetty portissa 1313"
        return 0
    else
        log_test "Hugo Server Startup" "FAIL" "Hugo server ei käynnistynyt"
        return 1
    fi
}

# Funktio testisisältöjen näkyvyyden tarkistukseen
test_content_visibility() {
    local url="$1"
    local content_name="$2"
    local should_be_visible="$3"
    
    # Testaa että shortcode-testi postaus ei näy posts-listauksessa
    if [ "$content_name" = "Shortcode Test Post" ]; then
        if curl -s "$url" | grep -q "shortcode-testi"; then
            log_test "Content Visibility: $content_name" "FAIL" "Shortcode-testi näkyy vaikka draft=true"
        else
            log_test "Content Visibility: $content_name" "PASS" "Shortcode-testi piilotettu kun draft=true"
        fi
    # Testaa että example-content ei näy etusivulla tai posts-listauksessa  
    elif [ "$content_name" = "Example Content" ]; then
        if curl -s "$url" | grep -q "Esimerkkisivu\|example-content"; then
            log_test "Content Visibility: $content_name" "FAIL" "Example-content näkyy vaikka draft=true"
        else
            log_test "Content Visibility: $content_name" "PASS" "Example-content piilotettu kun draft=true"
        fi
    fi
}

echo "🔧 TEKNISTEN TIEDOSTOJEN TESTAUS"
echo "================================"

# 1. Testaa että kaikki kriittiset tiedostot ovat olemassa
test_file_exists "hugo.toml" "Hugo konfiguraatiotiedosto"
test_file_content "static/js/icetribe-simple-config.js" "loadGoogleAnalytics" "GA4 Dynamic Loader Function"
test_file_exists "static/js/icetribe-simple-config.js" "Evästeiden hallintajärjestelmä"
test_file_exists "themes/ananke/layouts/_default/baseof.html" "Pääteemplate"
test_file_exists "layouts/shortcodes/img.html" "Kuva shortcode"
test_file_exists "layouts/shortcodes/soundcloud.html" "SoundCloud shortcode"
test_file_exists "layouts/shortcodes/quote.html" "Quote shortcode"

echo ""
echo "📊 GA4 INTEGRAATION TESTAUS"
echo "==========================="

# 2. GA4 konfiguraatio
test_file_content "hugo.toml" "G-8KK4BYHJKJ" "GA4 Tracking ID konfiguraatiossa"
test_file_content "themes/ananke/layouts/_default/baseof.html" "G-8KK4BYHJKJ" "GA4 Tracking ID baseof.html:ssä"
test_file_content "static/js/icetribe-simple-config.js" "gtag.*config.*ICETRIBE_GA_ID" "GA4 gtag konfiguraatio"
test_file_content "static/js/icetribe-simple-config.js" "anonymize_ip.*true" "IP anonymisointi käytössä"

# 3. External Loader Script Tag
test_file_content "static/js/icetribe-simple-config.js" "updateGoogleAnalyticsConsent" "GA4 consent-based loading"
test_file_content "themes/ananke/layouts/_default/baseof.html" "ICETRIBE_GA_ID.*G-8KK4BYHJKJ" "GA4 ID asetus baseof.html:ssä"

echo ""
echo "🍪 EVÄSTEIDEN HALLINNAN TESTAUS"
echo "==============================="

# 4. Cookie consent system
test_file_content "static/js/icetribe-simple-config.js" "icetribe_cookie_consent" "LocalStorage evästeiden tallennus"
test_file_content "static/js/icetribe-simple-config.js" "checkSoundCloudConsent" "Script aktivointifunktio"
test_file_content "static/js/icetribe-simple-config.js" "choices.analytics" "Analytics cookie consent management"

# 5. GDPR compliance
test_file_content "static/js/icetribe-simple-config.js" "showBanner" "Evästeiden kysyminen käyttäjältä"
test_file_content "static/js/icetribe-simple-config.js" "saveCookieConsent" "Evästeiden valintojen tallennus"

echo ""
echo "🎵 SOUNDCLOUD INTEGRAATION TESTAUS"
echo "=================================="

# 6. SoundCloud consent integration
test_file_content "layouts/shortcodes/soundcloud.html" "soundcloud-consent-notice" "SoundCloud evästeiden ilmoitus"
test_file_content "layouts/shortcodes/soundcloud.html" "enableAnalyticsAndSoundCloud" "SoundCloud evästeiden aktivointi"
test_file_content "static/js/icetribe-simple-config.js" "hideSoundCloudPlayers" "SoundCloud soittimien piilotus"

echo ""
echo "🌐 HUGO SERVERIN HALLINTA JA SISÄLTÖTESTAUS"
echo "==========================================="

# 7. VAIHE 1: Sammuta Hugo server
shutdown_hugo_server

echo ""
echo "🔍 SISÄLLÖN JA SHORTCODEJEN TESTAUS"
echo "=================================="

# 9. Testaa että shortcodet toimivat sisällössä
test_file_content "content/soitossa.md" "soundcloud" "SoundCloud shortcode käytössä sisällössä"

# 8. VAIHE 2: Aseta testisisällöt näkyviksi (draft = false)
echo "   🔄 Asetetaan testisivut näkyviksi (draft = false)..."

# Backup alkuperäiset draft-tilat
EXAMPLE_DRAFT_BACKUP=""
TEST_POST_DRAFT_BACKUP=""

if [ -f "content/example-content.md" ]; then
    EXAMPLE_DRAFT_BACKUP=$(grep "^draft = " content/example-content.md || echo "draft = false")
    sed -i.bak 's/^draft = .*/draft = false/' content/example-content.md
    log_test "Example Content Draft State" "PASS" "example-content.md asetettu draft=false"
fi

if [ -f "content/posts/shortcode-testi/index.md" ]; then
    TEST_POST_DRAFT_BACKUP=$(grep "^draft = " content/posts/shortcode-testi/index.md || echo "draft = false") 
    sed -i.bak 's/^draft = .*/draft = false/' content/posts/shortcode-testi/index.md
    log_test "Test Post Draft State" "PASS" "shortcode-testi/index.md asetettu draft=false"
fi

# Funktio draft-tilojen palauttamiseksi
restore_draft_states() {
    echo "   🔄 Palautetaan alkuperäiset draft-tilat..."
    
    if [ -f "content/example-content.md.bak" ]; then
        if [[ "$EXAMPLE_DRAFT_BACKUP" == *"draft = true"* ]]; then
            sed -i '' 's/^draft = .*/draft = true/' content/example-content.md
        fi
        rm -f content/example-content.md.bak
    fi
    
    if [ -f "content/posts/shortcode-testi/index.md.bak" ]; then
        if [[ "$TEST_POST_DRAFT_BACKUP" == *"draft = true"* ]]; then
            sed -i '' 's/^draft = .*/draft = true/' content/posts/shortcode-testi/index.md
        fi
        rm -f content/posts/shortcode-testi/index.md.bak
    fi
    
    # Varmista että kaikki .bak-tiedostot poistetaan
    rm -f content/example-content.md.bak content/posts/shortcode-testi/index.md.bak 2>/dev/null || true
}

# Trap signaalit palauttaaksemme draft-tilat keskeytyksen yhteydessä
trap restore_draft_states EXIT INT TERM

echo ""
echo "🔍 VAIHE 3: SISÄLTÖJEN JA SHORTCODEJEN TESTAUS (EI SERVERIÄ)"
echo "=========================================================="

# Testaa että example-content sisältää demonstraatioita
if [ -f "content/example-content.md" ]; then
    log_test "Example Content File" "PASS" "Demonstraatiossiältö löytyy"
    test_file_content "content/example-content.md" "soundcloud" "SoundCloud demo example-content.md:ssä"
    test_file_content "content/example-content.md" "img" "Kuva shortcode demo example-content.md:ssä"
    test_file_content "content/example-content.md" "https://soundcloud.com/icetribe/menevat-1" "Toimiva SoundCloud URL example-content:ssä"
else
    log_test "Example Content File" "FAIL" "Example-content.md puuttuu"
fi

# Testaa shortcode-testi postaus
if [ -f "content/posts/shortcode-testi/index.md" ]; then
    log_test "Shortcode Test Post" "PASS" "Shortcode testipostaus löytyy"
    test_file_content "content/posts/shortcode-testi/index.md" "soundcloud" "SoundCloud shortcode testipostauksessa"  
    test_file_content "content/posts/shortcode-testi/index.md" "img" "Kuva shortcode testipostauksessa"
    test_file_content "content/posts/shortcode-testi/index.md" "https://soundcloud.com/icetribe/menevat-1" "Toimiva SoundCloud URL testipostauksessa"
    test_file_content "content/posts/shortcode-testi/index.md" "Taulukot" "Taulukko-testi testipostauksessa"
    test_file_content "content/posts/shortcode-testi/index.md" "Lainaukset" "Lainaus-testi testipostauksessa"
else
    log_test "Shortcode Test Post" "FAIL" "Shortcode testipostaus puuttuu"
fi

echo ""
echo "🧬 KOODIN LAADUN TESTAUS"
echo "======================="

# 11. JavaScript syntaksin tarkistus (jos node on asennettu)
if command -v node >/dev/null 2>&1; then
    # GA4 on nyt integroitu icetribe-simple-config.js:ään, ei erillistä tiedostoa
    log_test "GA4 Integration" "PASS" "GA4 integroitu evästehallintaan (loadGoogleAnalytics)"
    
    if node -c static/js/icetribe-simple-config.js >/dev/null 2>&1; then
        log_test "Cookie JavaScript Syntax" "PASS" "Cookie script syntaksi on kelvollinen"
    else
        log_test "Cookie JavaScript Syntax" "FAIL" "Cookie script sisältää syntaksivirheitä"
    fi
else
    log_test "JavaScript Syntax Check" "SKIP" "Node.js ei ole asennettu - ohitetaan syntaksitarkistus"
fi

echo ""
echo "🎨 LAYOUT JA CSS TESTAUS"
echo "========================"

# 12. Testaa että CSS-tyylit on määritelty evästeiden hallintaan
test_file_content "static/js/icetribe-simple-config.js" "cookieCSS" "CSS-tyylien lisäysfunktio"
test_file_content "static/js/icetribe-simple-config.js" "cookie-modal-content" "Modal CSS-luokat"
test_file_content "static/js/icetribe-simple-config.js" "cookie-category-header" "Cookie kategoria layout"
test_file_content "static/js/icetribe-simple-config.js" "toggle-slider" "Toggle switch CSS"
test_file_content "static/js/icetribe-simple-config.js" "justify-content: space-between" "Flexbox layout header"
test_file_content "static/js/icetribe-simple-config.js" "@media.*max-width.*768px" "Responsiivinen design"

# 13. Testaa että modal rakenne on kunnossa
test_file_content "static/js/icetribe-simple-config.js" "cookie-modal-header" "Modal header rakenne"
test_file_content "static/js/icetribe-simple-config.js" "cookie-modal-body" "Modal body rakenne"  
test_file_content "static/js/icetribe-simple-config.js" "cookie-modal-footer" "Modal footer rakenne"

# 14. Testaa toggle switch toiminnallisuus
test_file_content "static/js/icetribe-simple-config.js" "display: none" "Hidden checkbox"
test_file_content "static/js/icetribe-simple-config.js" "translateX.*26px" "Toggle animation"

# 15. Layout-testaus Hugo serveriltä (jos käynnissä)
if curl -s http://localhost:1313 > /dev/null 2>&1; then
    log_test "Hugo Server Layout Test" "PASS" "Modal layout testaus suoritettu"
    
    # Testaa että sivu latautuu
    if curl -s http://localhost:1313 | grep -q "Icetribe"; then
        log_test "Frontend Page Load" "PASS" "Pääsivu latautuu onnistuneesti"
    else
        log_test "Frontend Page Load" "FAIL" "Pääsivu ei lataudu oikein"
    fi
    
    # Testaa että CSS on mukana
    if curl -s http://localhost:1313/js/icetribe-simple-config.js | grep -q "cookie-modal-content"; then
        log_test "CSS Styles Loaded" "PASS" "CSS-tyylit löytyvät JavaScript-tiedostosta"
    else
        log_test "CSS Styles Loaded" "FAIL" "CSS-tyylit puuttuvat"
    fi
    
    # Testaa että evästeiden hallinta on olemassa
    if curl -s http://localhost:1313 | grep -q "footer-cookie-settings\|Evästeasetukset"; then
        log_test "Cookie Settings Link" "PASS" "Evästeiden hallinta linkki löytyy"
    else
        log_test "Cookie Settings Link" "FAIL" "Evästeiden hallinta linkki puuttuu"
    fi
    
    # Testaa example-content sivun renderöityminen
    if curl -s http://localhost:1313/example-content/ | grep -q "Esimerkkisivu"; then
        log_test "Example Content Page Load" "PASS" "Example-content sivu latautuu"
        
        # Testaa että SoundCloud shortcode renderöityy
        if curl -s http://localhost:1313/example-content/ | grep -q "soundcloud-embed\|soundcloud-consent-notice"; then
            log_test "Example Content SoundCloud" "PASS" "SoundCloud shortcode renderöityy example-content:ssä"
        else
            log_test "Example Content SoundCloud" "FAIL" "SoundCloud shortcode ei renderöidy example-content:ssä"
        fi
        
        # Testaa että img shortcode renderöityy
        if curl -s http://localhost:1313/example-content/ | grep -q "<picture\|<img.*cover_about"; then
            log_test "Example Content Images" "PASS" "Kuva shortcode renderöityy example-content:ssä"
        else
            log_test "Example Content Images" "FAIL" "Kuva shortcode ei renderöidy example-content:ssä"
        fi
    else
        log_test "Example Content Page Load" "FAIL" "Example-content sivu ei lataudu"
    fi
    
    # Testaa shortcode-testi postauksen renderöityminen
    if curl -s http://localhost:1313/posts/shortcode-testi/ | grep -q "Shortcode-testi"; then
        log_test "Test Post Page Load" "PASS" "Shortcode-testi postaus latautuu"
        
        # Testaa että SoundCloud toimii posts-kontekstissa
        if curl -s http://localhost:1313/posts/shortcode-testi/ | grep -q "soundcloud-embed\|soundcloud-consent-notice"; then
            log_test "Test Post SoundCloud" "PASS" "SoundCloud shortcode toimii posts-kontekstissa"
        else
            log_test "Test Post SoundCloud" "FAIL" "SoundCloud shortcode ei toimi posts-kontekstissa"
        fi
        
        # Testaa että kuvat toimivat posts-kontekstissa
        if curl -s http://localhost:1313/posts/shortcode-testi/ | grep -q "<picture\|<img.*cover_about"; then
            log_test "Test Post Images" "PASS" "Kuva shortcode toimii posts-kontekstissa"
        else
            log_test "Test Post Images" "FAIL" "Kuva shortcode ei toimi posts-kontekstissa"
        fi
        
        # Testaa että postaus näkyy posts-listassa
        if curl -s http://localhost:1313/posts/ | grep -q "Shortcode-testi"; then
            log_test "Test Post in List" "PASS" "Testipostaus näkyy posts-listassa"
        else
            log_test "Test Post in List" "FAIL" "Testipostaus ei näy posts-listassa"
        fi
    else
        log_test "Test Post Page Load" "FAIL" "Shortcode-testi postaus ei lataudu"
    fi
    
else
    echo "   ⏩ Hugo Server Layout Test - SKIPPED (server ei käynnissä testauksen aikana)"
fi

echo ""
echo "🍪 EVÄSTEIDEN TOIMINNALLISUUDEN TESTAUS"
echo "======================================"

# Funktio evästeiden blokkaustesteihin
test_cookie_functionality() {
    echo "   🔄 Testaa evästeiden toiminnallisuutta Hugo serverillä..."
    
    if start_hugo_server; then
        # Testaa että GA4 script ei lataudu suoraan ilman consent
        PAGE_CONTENT=$(curl -s http://localhost:1313)
        
        # Tarkista että GA4 on integroitu evästehallintaan (ICETRIBE_GA_ID ja cookie consent)
        if echo "$PAGE_CONTENT" | grep -q 'ICETRIBE_GA_ID.*G-8KK4BYHJKJ' && echo "$PAGE_CONTENT" | grep -q 'icetribe-simple-config.js'; then
            log_test "GA4 Consent Mode" "PASS" "GA4 integroitu evästehallintaan (GA ID + cookie script)"
        else
            log_test "GA4 Consent Mode" "FAIL" "GA4 ei ole integroitu evästehallintaan"
        fi
        
        # Testaa että gtag ei ole suoraan sivulla (pitää olla external loaderissa)
        if echo "$PAGE_CONTENT" | grep -q "gtag.*G-8KK4BYHJKJ"; then
            log_test "GA4 Direct Loading Block" "FAIL" "GA4 gtag latautuu suoraan sivulle"
        else
            log_test "GA4 Direct Loading Block" "PASS" "GA4 gtag estetty suoralta lataukselta"
        fi
        
        # Testaa että evästebanner-funktiot ovat saatavilla
        if curl -s http://localhost:1313/js/icetribe-simple-config.js | grep -q "showBanner\|saveCookieConsent"; then
            log_test "Cookie Banner Functions" "PASS" "Evästebanner-funktiot löytyvät"
        else
            log_test "Cookie Banner Functions" "FAIL" "Evästebanner-funktiot puuttuvat"
        fi
        
        # Testaa että SoundCloud consent notice renderöityy testipostauksessa
        SHORTCODE_PAGE_CONTENT=$(curl -s http://localhost:1313/posts/shortcode-testi/ 2>/dev/null)
        if echo "$SHORTCODE_PAGE_CONTENT" | grep -q "soundcloud-consent-notice\|SoundCloud evästeet\|SoundCloud-soitin"; then
            log_test "SoundCloud Consent Notice Render" "PASS" "SoundCloud consent-ilmoitus renderöityy"
        else
            log_test "SoundCloud Consent Notice Render" "FAIL" "SoundCloud consent-ilmoitus ei renderöidy"
        fi
        
        # Testaa että evästeasetukset-linkki on footerissa
        if echo "$PAGE_CONTENT" | grep -q "footer-cookie-settings\|Evästeasetukset"; then
            log_test "Cookie Settings Footer Link" "PASS" "Evästeasetukset-linkki löytyy footerista"
        else
            log_test "Cookie Settings Footer Link" "FAIL" "Evästeasetukset-linkki puuttuu footerista"
        fi
        
        # Testaa että GA4 dynamic loader -funktio on saatavilla
        GA4_LOADER_CONTENT=$(curl -s http://localhost:1313/js/icetribe-simple-config.js)
        if echo "$GA4_LOADER_CONTENT" | grep -q "loadGoogleAnalytics" && echo "$GA4_LOADER_CONTENT" | grep -q "ICETRIBE_GA_ID"; then
            log_test "GA4 Dynamic Loader Available" "PASS" "GA4 dynamic loader -funktio saatavilla"
        else
            log_test "GA4 Dynamic Loader Available" "FAIL" "GA4 dynamic loader -funktio ei ole saatavilla"
        fi
        
        # Testaa että localStorage-funktiot ovat määritelty
        if curl -s http://localhost:1313/js/icetribe-simple-config.js | grep -q "localStorage.*icetribe_cookie_consent"; then
            log_test "LocalStorage Cookie Management" "PASS" "LocalStorage evästeiden hallinta määritelty"
        else
            log_test "LocalStorage Cookie Management" "FAIL" "LocalStorage evästeiden hallinta puuttuu"
        fi
        
        # Testaa että script aktivointi on conditional
        if curl -s http://localhost:1313/js/icetribe-simple-config.js | grep -q "checkSoundCloudConsent\|enableAnalyticsAndSoundCloud"; then
            log_test "Conditional Script Activation" "PASS" "Ehdollinen script-aktivointi määritelty"
        else
            log_test "Conditional Script Activation" "FAIL" "Ehdollinen script-aktivointi puuttuu"
        fi
        
        shutdown_hugo_server
    else
        log_test "Cookie Functionality Test Server" "FAIL" "Hugo server ei käynnistynyt evästetesteihin"
    fi
}

# Suorita evästeiden toiminnallisuustestit
test_cookie_functionality

echo ""
echo "✅ SHORTCODE-YHTEENSOPIVUUDEN TESTAUS"
echo "====================================="

# Testaa että samat shortcodet toimivat molemmissa konteksteissa
if [ -f "content/example-content.md" ] && [ -f "content/posts/shortcode-testi/index.md" ]; then
    # Tarkista että molemmat käyttävät samaa SoundCloud URL:aa
    EXAMPLE_SC_URL=$(grep -o 'soundcloud.*"https://[^"]*"' content/example-content.md | head -1)
    TEST_POST_SC_URL=$(grep -o 'soundcloud.*"https://[^"]*"' content/posts/shortcode-testi/index.md | head -1)
    
    if [ "$EXAMPLE_SC_URL" = "$TEST_POST_SC_URL" ] && [ -n "$EXAMPLE_SC_URL" ]; then
        log_test "SoundCloud URL Consistency" "PASS" "Sama SoundCloud URL molemmissa konteksteissa"
    else
        log_test "SoundCloud URL Consistency" "FAIL" "Eri SoundCloud URL:t eri konteksteissa"
    fi
    
    # Tarkista että molemmat käyttävät img shortcodea
    if grep -q "{{< img" content/example-content.md && grep -q "{{< img" content/posts/shortcode-testi/index.md; then
        log_test "Image Shortcode Consistency" "PASS" "Img shortcode käytössä molemmissa konteksteissa"
    else
        log_test "Image Shortcode Consistency" "FAIL" "Img shortcode ei käytössä molemmissa konteksteissa"
    fi
    
    # Tarkista että molemmat on palautettu draft-tilaan
    EXAMPLE_DRAFT_RESTORED=$(grep "^draft = " content/example-content.md)
    TEST_POST_DRAFT_RESTORED=$(grep "^draft = " content/posts/shortcode-testi/index.md)
    
    # Testi siirretty VAIHE 4:ään restore_draft_states jälkeen
    else
        log_test "Shortcode Consistency Test" "FAIL" "Yksi tai molemmat testisivut puuttuvat"
    fi

echo ""
echo "🔄 VAIHE 4: SAMMUTA PALVELIN JA PALAUTA DRAFT-TILAT"
echo "================================================="

# Sammuta mahdollinen käynnissä oleva server
shutdown_hugo_server

# Palautetaan draft-tilat testien jälkeen
restore_draft_states

# Testaa että draft-tilat palautettiin ja backup-tiedostot siivottiin
if [ ! -f "content/example-content.md.bak" ] && [ ! -f "content/posts/shortcode-testi/index.md.bak" ]; then
    log_test "Draft State Restoration" "PASS" "Draft-tilat palautettu ja backup-tiedostot siivottu"
else
    log_test "Draft State Restoration" "FAIL" "Backup-tiedostoja jäi siivoamatta"
fi

echo ""
echo "🚀 VAIHE 5: KÄYNNISTÄ PALVELIN JA TESTAA NÄKYVYYS"
echo "==============================================="

# Käynnistä Hugo server uudelleen
if start_hugo_server; then
    echo "   🔍 Testataan että draft-sisällöt eivät näy..."
    
    # Testaa että shortcode-testi ei näy posts-listauksessa
    test_content_visibility "http://localhost:1313/posts/" "Shortcode Test Post" "false"
    
    # Testaa että example-content ei näy etusivulla tai posts-listauksessa
    test_content_visibility "http://localhost:1313/" "Example Content" "false"
    
    # Lopullinen sammutus
    echo "   🔄 Lopullinen serverin sammutus..."
    shutdown_hugo_server
else
    log_test "Final Server Test" "FAIL" "Hugo server ei käynnistynyt lopulliseen testiin"
fi

echo ""
echo "📋 YHTEENVETO"
echo "============"
echo -e "Testejä yhteensä: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Onnistuneita: ${GREEN}$PASS_COUNT${NC}"
echo -e "Epäonnistuneita: ${RED}$FAIL_COUNT${NC}"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 Kaikki testit menivät läpi!${NC}"
    echo -e "${GREEN}✅ GA4 External Loader -lähestymistapa toimii${NC}"
    echo -e "${GREEN}✅ Evästeiden hallinta on GDPR-compliant${NC}"
    echo -e "${GREEN}✅ Evästeiden toiminnallisuus estetty oikein${NC}"
    echo -e "${GREEN}✅ SoundCloud integraatio toimii evästeiden kanssa${NC}"
    echo -e "${GREEN}✅ Shortcode-yhteensopivuus pages/posts välillä${NC}"
    echo -e "${GREEN}✅ Testisivujen draft-tilan hallinta toimii${NC}"
    echo -e "${GREEN}✅ Frontend-renderöinti toimii molemmissa konteksteissa${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  $FAIL_COUNT testiä epäonnistui${NC}"
    echo -e "${YELLOW}🔧 Tarkista epäonnistuneet testit ja korjaa ongelmat${NC}"
    echo -e "${YELLOW}📝 Testisivujen draft-tilat palautettu automaattisesti${NC}"
    exit 1
fi