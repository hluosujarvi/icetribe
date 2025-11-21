// Yksinkertainen evästebanner Icetribelle

// CSS-tyylit (violet theme to match SoundCloud boxes)
const cookieCSS = `
.soundcloud-embed {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background: #8A42A8;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(138, 66, 168, 0.3);
}

#cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #8A42A8;
    color: white;
    padding: 20px;
    box-shadow: 0 -2px 10px rgba(138, 66, 168, 0.3);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.cookie-banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    gap: 20px;
}

.cookie-text h3 {
    margin: 0 0 5px 0;
    font-size: 18px;
    color: white;
}

.cookie-text p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
}

.cookie-buttons {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
}

.cookie-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.cookie-btn-primary {
    background: white;
    color: #8A42A8;
}

.cookie-btn-primary:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
}

.cookie-btn-secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.cookie-btn-secondary:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}

.cookie-btn-link {
    background: transparent;
    color: white;
    text-decoration: underline;
}

.cookie-btn-link:hover {
    color: rgba(255, 255, 255, 0.8);
}

#cookie-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(138, 66, 168, 0.8);
    backdrop-filter: blur(5px);
    z-index: 10000;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.cookie-modal-content {
    background: white;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(138, 66, 168, 0.3);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}

.cookie-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 25px 30px 15px;
    border-bottom: 1px solid #eee;
}

.cookie-modal-header h2 {
    margin: 0;
    font-size: 24px;
    color: #8A42A8;
}

.cookie-close {
    background: none;
    border: none;
    font-size: 30px;
    cursor: pointer;
    color: #8A42A8;
    line-height: 1;
    padding: 0;
    margin: 0;
}

.cookie-close:hover {
    color: #6B2F7F;
}

.cookie-modal-body {
    padding: 25px 30px;
}

.cookie-modal-body p {
    margin-bottom: 25px;
    color: #333;
    line-height: 1.5;
}

.cookie-category {
    margin-bottom: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #8A42A8;
}

.cookie-category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.cookie-category-header h4 {
    margin: 0;
    color: #8A42A8;
    font-size: 16px;
}

.cookie-category-description {
    margin: 0;
    color: #666;
    font-size: 14px;
    line-height: 1.4;
}

.cookie-toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.cookie-toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .3s;
    border-radius: 24px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
}

input:checked + .toggle-slider {
    background-color: #8A42A8;
}

input:checked + .toggle-slider:before {
    transform: translateX(26px);
}

input:disabled + .toggle-slider {
    background-color: #8A42A8;
    cursor: not-allowed;
}

.cookie-info-link {
    margin-top: 20px;
    text-align: center;
}

.cookie-info-link a {
    color: #8A42A8;
    text-decoration: none;
    font-size: 14px;
}

.cookie-info-link a:hover {
    text-decoration: underline;
}

.cookie-modal-footer {
    padding: 20px 30px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.cookie-modal-footer .cookie-btn {
    font-size: 14px;
}

.cookie-modal-footer .cookie-btn-primary {
    background: #8A42A8;
    color: white;
}

.cookie-modal-footer .cookie-btn-primary:hover {
    background: #6B2F7F;
}

.cookie-modal-footer .cookie-btn-secondary {
    background: #f8f9fa;
    color: #8A42A8;
    border: 1px solid #8A42A8;
}

.cookie-modal-footer .cookie-btn-secondary:hover {
    background: #8A42A8;
    color: white;
}

@media (max-width: 768px) {
    .cookie-banner-content {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
    
    .cookie-buttons {
        flex-wrap: wrap;
        justify-content: center;
    }
    
    #cookie-modal {
        padding: 10px;
    }
    
    .cookie-modal-header,
    .cookie-modal-body,
    .cookie-modal-footer {
        padding-left: 20px;
        padding-right: 20px;
    }
    
    .cookie-modal-footer {
        flex-direction: column;
    }
    
    .cookie-category-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
}
`;

// Lisää CSS-tyylit sivulle
if (!document.getElementById('cookie-css')) {
    const style = document.createElement('style');
    style.id = 'cookie-css';
    style.textContent = cookieCSS;
    document.head.appendChild(style);
}

// Evästetyypit
const cookieTypes = {
  necessary: {
    name: 'Välttämättömät evästeet',
    description: 'Sivuston toiminta, käyttäjäasetukset ja kuvien välimuisti. Nämä ovat pakollisia.',
    required: true
  },
  analytics: {
    name: 'Analytiikkaevästeet', 
    description: 'Google Analytics kerää tietoa sivuston käytöstä parantaaksemme sisältöä.',
    required: false
  }
  // MARKKINOINTIEVÄSTEET - Kommentoitu pois koska ei vielä käytössä Icetribella
  /*
  ,marketing: {
    name: 'Markkinointievästeet',
    description: 'Ei tällä hetkellä käytössä. Varaus tulevaisuuden mainontaa varten.',
    required: false
  }
  */
};

// Varmista että myös vanhat tallennusmuodot toimivat uudella consent-lomakkeella
function toBoolean(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (['true', 'hyväksytty', 'accepted', 'all', 'granted'].includes(lowered)) {
      return true;
    }
    if (['false', 'hylätty', 'rejected', 'necessary', 'denied', 'required-only', 'minimal'].includes(lowered)) {
      return false;
    }
  }
  if (typeof value === 'number') {
    return value > 0;
  }
  return fallback;
}

function parseLegacyConsentString(value) {
  const lowered = value.trim().toLowerCase();
  if (!lowered) {
    return null;
  }

  if (['accepted', 'all', 'true', 'hyväksytty', 'granted'].includes(lowered)) {
    return { necessary: true, analytics: true };
  }

  if (['rejected', 'false', 'denied', 'necessary', 'required-only', 'minimal', 'hylätty'].includes(lowered)) {
    return { necessary: true, analytics: false };
  }

  return null;
}

function normalizeConsentObject(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  if (raw.choices && typeof raw.choices === 'object') {
    return {
      timestamp: raw.timestamp || Date.now(),
      choices: {
        necessary: toBoolean(raw.choices.necessary, true),
        analytics: toBoolean(raw.choices.analytics, false)
      }
    };
  }

  if ('necessary' in raw || 'analytics' in raw) {
    return {
      timestamp: raw.timestamp || Date.now(),
      choices: {
        necessary: toBoolean(raw.necessary, true),
        analytics: toBoolean(raw.analytics, false)
      }
    };
  }

  return null;
}

// Tarkista onko evästeet jo asetettu
function hasUserMadeChoice() {
  return localStorage.getItem('icetribe_cookie_consent') !== null;
}

// Hae käyttäjän valinnat
function getCookieConsent() {
  const saved = localStorage.getItem('icetribe_cookie_consent');
  if (!saved) return null;

  let parsed;

  try {
    parsed = JSON.parse(saved);
  } catch (error) {
    const legacyChoices = parseLegacyConsentString(saved);
    if (legacyChoices) {
      const normalizedLegacy = {
        timestamp: Date.now(),
        choices: legacyChoices
      };
      localStorage.setItem('icetribe_cookie_consent', JSON.stringify(normalizedLegacy));
      console.log('Päivitettiin legacy-evästeasetukset uuteen formaattiin');
      return normalizedLegacy;
    }

    console.warn('Tuntematon evästeformaatin arvo, poistetaan consent ja aloitetaan alusta:', saved, error);
    localStorage.removeItem('icetribe_cookie_consent');
    return null;
  }

  const normalized = normalizeConsentObject(parsed);
  if (normalized) {
    if (!parsed.choices || parsed.timestamp !== normalized.timestamp) {
      localStorage.setItem('icetribe_cookie_consent', JSON.stringify(normalized));
    }
    return normalized;
  }

  console.warn('Evästeasetusten formaatti ei ollut odotettu, nollataan tallennus');
  localStorage.removeItem('icetribe_cookie_consent');
  return null;
}

// Tallenna valinnat
function saveCookieConsent(choices) {
  const consent = {
    timestamp: Date.now(),
    choices: choices
  };
  localStorage.setItem('icetribe_cookie_consent', JSON.stringify(consent));
  console.log('Evästevalinat tallennettu:', consent);
  
  // Päivitä Google Analytics consent
  updateGoogleAnalyticsConsent(choices);
  
  // Lähetä custom event että muut komponentit voivat reagoida
  window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
    detail: { choices: choices } 
  }));
}

// Lataa Google Analytics dynaamisesti
function loadGoogleAnalytics() {
  if (!window.ICETRIBE_GA_ID) {
    console.log('GA ID ei asetettu, ohitetaan Analytics');
    return;
  }
  
  if (window.gtag) {
    console.log('GA on jo ladattu');
    return;
  }
  
  console.log('Ladataan Google Analytics dynaamisesti...');
  
  // Luo script-elementti GA:lle
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${window.ICETRIBE_GA_ID}`;
  
  script.onload = function() {
    console.log('Google Analytics gtag.js ladattu onnistuneesti');
    
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag; // Tee gtag globaaliksi
    
    gtag('js', new Date());
    gtag('config', window.ICETRIBE_GA_ID, {
      'anonymize_ip': true,
      'cookie_flags': 'max-age=7200;secure;samesite=strict',
      'send_page_view': true
    });
    
    console.log('Google Analytics konfiguroitu ja alustettu, ID:', window.ICETRIBE_GA_ID);
    
    // Testaa että GA toimii lähettämällä test event
    setTimeout(() => {
      if (window.gtag) {
        gtag('event', 'test_analytics_loaded', {
          'event_category': 'analytics',
          'event_label': 'consent_enabled'
        });
        console.log('Google Analytics test event lähetetty');
      }
    }, 1000);
  };
  
  script.onerror = function() {
    console.error('Google Analytics gtag.js lataus epäonnistui');
  };
  
  document.head.appendChild(script);
}

// Poista Google Analytics evästeet
function removeGoogleAnalyticsCookies() {
  const gaCookies = [
    '_ga', '_ga_' + (window.ICETRIBE_GA_ID || '').replace('G-', ''), '_gid', '_gat', '_gat_gtag_' + (window.ICETRIBE_GA_ID || ''),
    '_gcl_au', '_gcl_aw', '_gcl_dc', '_gcl_gb', '_gcl_gf', '_gcl_ha'
  ];
  
  const domains = [
    window.location.hostname,
    '.' + window.location.hostname,
    '.icetribe.fi',
    'icetribe.fi'
  ];
  
  gaCookies.forEach(cookieName => {
    domains.forEach(domain => {
          // Poista evästeet eri domain-vaihtoehdoilla
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  });
  
  console.log('Google Analytics evästeet poistettu');

}

// Piilota SoundCloud-soittimet kun suostumus peruutetaan
function hideSoundCloudPlayers() {
  // Piilota soittimet ja näytä suostumusilmoitus
  const noticeElement = document.getElementById('soundcloud-consent-notice');
  const playersElement = document.getElementById('soundcloud-players');
  const containerElement = document.getElementById('soundcloud-player-container');
  
  if (noticeElement) noticeElement.style.display = 'block';
  if (playersElement) playersElement.style.display = 'none';
  if (containerElement) containerElement.innerHTML = ''; // Tyhjennä soittimet
  
  console.log('SoundCloud-soittimet piilotettu');

}

// Google Analytics consent management (käyttää consent mode updateja)
function updateGoogleAnalyticsConsent(choices) {
  if (typeof gtag !== 'undefined') {
    // GA4 on ladattu, päivitä consent mode
    gtag('consent', 'update', {
      'analytics_storage': choices.analytics ? 'granted' : 'denied',
      'ad_storage': choices.analytics ? 'granted' : 'denied' // SoundCloud tarvitsee myös ad_storage
    });
    
    // Jos analytiikka kielletään, poista evästeet ja piilota SoundCloud
    if (!choices.analytics) {
      removeGoogleAnalyticsCookies();
      hideSoundCloudPlayers();
    }
  } else {

    // Jos GA ei ole vielä ladattu mutta analytiikka kielletään, piilota SoundCloud silti
    if (!choices.analytics) {
      hideSoundCloudPlayers();
    } else {
      // Lataa Analytics kun evästeet hyväksytään
      loadGoogleAnalytics();
    }
  }
}

// Alusta Google Analytics consent mode käyttäjän valintojen mukaan
function initGoogleAnalyticsConsent() {
  const consent = getCookieConsent();
  if (consent && consent.choices) {
    // GA4 on jo ladattu consent modessa, päivitä sen tilaa
    updateGoogleAnalyticsConsent(consent.choices);
  } else {
  }
}

// Luo banner HTML
function createBanner() {
  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-banner-content">
      <div class="cookie-text">
        <h3>Evästeet</h3>
        <p>Käytämme evästeitä parantaaksemme käyttökokemustasi.</p>
      </div>
      <div class="cookie-buttons">
        <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">Hyväksy kaikki</button>
        <button id="cookie-reject-all" class="cookie-btn cookie-btn-secondary">Hylkää vapaavalintaiset</button>
        <button id="cookie-settings" class="cookie-btn cookie-btn-link">Asetukset</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);
}

// Aseta footer-linkin toiminnallisuus
function setupFooterLink() {
  const footerLink = document.getElementById('footer-cookie-settings');
  if (!footerLink) {
    return;
  }

  footerLink.style.display = 'inline-block';
  footerLink.setAttribute('role', 'button');
  footerLink.setAttribute('aria-haspopup', 'dialog');
  footerLink.onclick = function(e) {
    e.preventDefault();
    showModal();
  };
}

// Luo modal HTML
function createModal() {
  const modal = document.createElement('div');
  modal.id = 'cookie-modal';
  modal.innerHTML = `
    <div class="cookie-modal-content">
      <div class="cookie-modal-header">
        <h2>Evästeasetukset</h2>
        <button id="cookie-modal-close" class="cookie-close">×</button>
      </div>
      <div class="cookie-modal-body">
        <p>Valitse, mitä evästeitä haluat sallia. Asetuksesi tallentuvat selaimeesi.</p>
        <div id="cookie-preferences"></div>
        <div class="cookie-info-link">
          <a href="/cookies/#cookie-settings" target="_blank">📋 Lue lisää käyttämistämme evästeistä</a>
        </div>
      </div>
      <div class="cookie-modal-footer">
        <button id="cookie-save-preferences" class="cookie-btn cookie-btn-primary">Tallenna asetukset</button>
        <button id="cookie-accept-all-modal" class="cookie-btn cookie-btn-secondary">Hyväksy kaikki</button>
        <button id="cookie-accept-necessary-modal" class="cookie-btn cookie-btn-secondary">Hyväksy vain välttämättömät</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Sulje modal klikkaamalla taustaa
  modal.addEventListener('click', function(e) {
    if (e.target.id === 'cookie-modal') {
      hideModal();
    }
  });

  // Luo evästevaihtoehdot
  const cookiePrefs = document.getElementById('cookie-preferences');
  Object.keys(cookieTypes).forEach(key => {
    const type = cookieTypes[key];
    const div = document.createElement('div');
    div.className = 'cookie-category';
    div.innerHTML = `
      <div class="cookie-category-header">
        <h4>${type.name}</h4>
        <label class="cookie-toggle">
          <input type="checkbox" ${type.required ? 'checked disabled' : ''} data-cookie-type="${key}">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <p class="cookie-category-description">${type.description}</p>
    `;
    cookiePrefs.appendChild(div);
  });
  
  // Aseta event listenerit heti kun modal on luotu
  setupModalEventListeners();
}

// Näytä banner
function showBanner() {
  document.getElementById('cookie-banner').style.display = 'block';
}

// Piilota banner
function hideBanner() {
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

// Näytä modal
function showModal() {
  document.getElementById('cookie-modal').style.display = 'flex';
  
  // Aseta nykyiset valinnat
  const consent = getCookieConsent();
  console.log('Modal avataan, ladattu consent:', consent);
  
  if (consent && consent.choices) {
    Object.keys(consent.choices).forEach(key => {
      const checkbox = document.querySelector(`[data-cookie-type="${key}"]`);
      if (checkbox && !checkbox.disabled) {
        checkbox.checked = consent.choices[key];
        console.log(`Asetetaan ${key}: ${consent.choices[key]}`);
      }
    });
  }
  
  // Event listenerit on asetettu createModal()-funktiossa
}

// Aseta modal-nappien event listenerit
function setupModalEventListeners() {
  console.log('Asetetaan modal event listenerit...');
  
  // Sulje-nappi (ruksi)
  const closeBtn = document.getElementById('cookie-modal-close');
  if (closeBtn) {
    closeBtn.onclick = function() {
      hideModal();
    };
  }
  
  // Tallenna asetukset
  const saveBtn = document.getElementById('cookie-save-preferences');
  if (saveBtn) {
    saveBtn.onclick = function() {
      console.log('Tallennetaan käyttäjän valinnat...');
      // Tallenna valinnat suoraan
      const choices = {};
      Object.keys(cookieTypes).forEach(key => {
        const checkbox = document.querySelector(`[data-cookie-type="${key}"]`);
        choices[key] = checkbox ? checkbox.checked : cookieTypes[key].required;
      });
      console.log('Valinnat:', choices);
      saveCookieConsent(choices);
      // Sulje sekä modal että banner
      hideModal();
      hideBanner();
      setTimeout(() => {
        setupFooterLink();
      }, 100);
    };
  }
  
  // Hyväksy kaikki
  const acceptAllBtn = document.getElementById('cookie-accept-all-modal');
  if (acceptAllBtn) {
    acceptAllBtn.onclick = function() {
      // Hyväksy kaikki suoraan
      const choices = {};
      Object.keys(cookieTypes).forEach(key => {
        choices[key] = true;
      });
      saveCookieConsent(choices);
      // Sulje sekä modal että banner
      hideModal();
      hideBanner();
      setTimeout(() => {
        setupFooterLink();
      }, 100);
    };
  }
  
  // Hyväksy välttämättömät
  const acceptNecessaryBtn = document.getElementById('cookie-accept-necessary-modal');
  if (acceptNecessaryBtn) {
    acceptNecessaryBtn.onclick = function() {
      // Hyväksy vain välttämättömät suoraan
      const choices = {};
      Object.keys(cookieTypes).forEach(key => {
        choices[key] = cookieTypes[key].required;
      });
      saveCookieConsent(choices);
      // Sulje sekä modal että banner
      hideModal();
      hideBanner();
      setTimeout(() => {
        setupFooterLink();
      }, 100);
    };
  }
  

}

// Piilota modal
function hideModal() {
  const modal = document.getElementById('cookie-modal');
  if (modal) {
    modal.style.display = 'none';
  } else {
    console.error('Modal-elementtiä ei löytynyt');
  }
}

// Hyväksy kaikki evästeet
function acceptAll() {
  const choices = {};
  Object.keys(cookieTypes).forEach(key => {
    choices[key] = true;
  });
  saveCookieConsent(choices);
  hideBanner();
  hideModal();
}

// Hylkää vapaavalintaiset evästeet
function rejectAll() {
  const choices = {};
  Object.keys(cookieTypes).forEach(key => {
    choices[key] = cookieTypes[key].required;
  });
  
  // Poista evästeet heti ennen tallennusta
  removeGoogleAnalyticsCookies();
  hideSoundCloudPlayers();
  
  saveCookieConsent(choices);
  hideBanner();
  hideModal();
}

// Hyväksy vain välttämättömät evästeet
function acceptNecessaryOnly() {
  const choices = {};
  Object.keys(cookieTypes).forEach(key => {
    choices[key] = cookieTypes[key].required;
  });
  
  // Poista evästeet heti ennen tallennusta
  removeGoogleAnalyticsCookies();
  hideSoundCloudPlayers();
  
  saveCookieConsent(choices);
  hideBanner();
  hideModal();
}

// Tallenna käyttäjän valinnat
function savePreferences() {
  const choices = {};
  Object.keys(cookieTypes).forEach(key => {
    const checkbox = document.querySelector(`[data-cookie-type="${key}"]`);
    choices[key] = checkbox ? checkbox.checked : cookieTypes[key].required;
  });
  saveCookieConsent(choices);
  hideBanner();
  hideModal();
}

// Alustus
document.addEventListener('DOMContentLoaded', function() {
  console.log('Evästehallinta alustetaan...');
  
  // Alusta Google Analytics consent mode
  initGoogleAnalyticsConsent();
  
  // Tarkista SoundCloud-soittimien tila
  checkSoundCloudConsent();
  
  // Kuuntele localStorage muutoksia
  window.addEventListener('storage', function(e) {
    if (e.key === 'icetribe_cookie_consent') {
      checkSoundCloudConsent();
    }
  });
  
  // Kuuntele custom eventejä
  window.addEventListener('cookieConsentChanged', function() {
    setTimeout(checkSoundCloudConsent, 100);
  });
  
  // Tarkista onko käyttäjä jo valinnut
  if (hasUserMadeChoice()) {
    console.log('Käyttäjä on jo tehnyt evästevlinnat');
    
    // Lataa Analytics jos se on hyväksytty
    const consent = getCookieConsent();
    if (consent && consent.choices && consent.choices.analytics) {
      loadGoogleAnalytics();
    }
    
    // Näytä footer-linkki ja aseta modal
    setupFooterLink();
    createModal(); // Modal tarvitaan footer-linkille (event listenerit asetetaan siellä)
    
    return;
  }
  
  // Luo banner ja modal ensimmäiselle vierailulle
  createBanner();
  createModal();
  setupFooterLink();
  
  // Näytä banner
  showBanner();
  
  // Event listenerit bannerille
  document.getElementById('cookie-accept-all').addEventListener('click', function() {
    acceptAll();
    // Näytä footer-linkki kun valinta tehty
    setTimeout(() => {
      setupFooterLink();
    }, 100);
  });
  
  document.getElementById('cookie-reject-all').addEventListener('click', function() {
    rejectAll();
    // Näytä footer-linkki kun valinta tehty
    setTimeout(() => {
      setupFooterLink();
    }, 100);
  });
  
  document.getElementById('cookie-settings').addEventListener('click', showModal);
  
  // Modal-napit asetetaan showModal-funktiossa
  
  // Sulje modal klikkaamalla taustaa (asetetaan createModal-funktiossa)
});

// SoundCloud-soittimien hallinta (osa analytiikka-evästeitä)
function enableAnalyticsAndSoundCloud() {
    // Aktivoi analytiikka-evästeet (sisältää SoundCloudin)
    const choices = {};
    Object.keys(cookieTypes).forEach(key => {
        choices[key] = key === 'analytics' || key === 'necessary' ? true : cookieTypes[key].required;
    });
    
    saveCookieConsent(choices);
    
    // Piilota kaikki suostumusilmoitukset ja näytä soittimet
    showAllSoundCloudPlayers();
    
    // Vanhat elementit (soitossa-sivulle)
    loadSoundCloudPlayers();
    const playersElement = document.getElementById('soundcloud-players');
    if (playersElement) playersElement.style.display = 'block';
    
    hideBanner();
    hideModal();
    setTimeout(() => {
        setupFooterLink();
    }, 100);
}

// Näytä kaikki SoundCloud-soittimet sivulla (uusi shortcode)
function showAllSoundCloudPlayers() {
    // Piilota consent-ilmoitukset
    const notices = document.querySelectorAll('.soundcloud-consent-notice');
    notices.forEach(notice => notice.style.display = 'none');
    
    // Näytä soittimet
    const players = document.querySelectorAll('.soundcloud-player');
    players.forEach(player => player.style.display = 'block');
    
    // Vanha ID-pohjainen (taaksepäin yhteensopivuus)
    const oldNotice = document.getElementById('soundcloud-consent-notice');
    if (oldNotice) oldNotice.style.display = 'none';
}

// Luo SoundCloud-soittimet dynaamisesti
function loadSoundCloudPlayers() {
    const container = document.getElementById('soundcloud-player-container');
    if (!container || container.innerHTML.trim() !== '') {
        return; // Soittimet on jo luotu
    }

    const players = [
        {
            trackId: 'soundcloud%253Atracks%253A2213165969',
            title: 'Menevät',
            url: 'menevat-1'
        },
        {
            trackId: 'soundcloud%253Atracks%253A2213165972', 
            title: 'Rauhalliset',
            url: 'rauhalliset-2'
        }
    ];

    players.forEach((player, index) => {
        // Luo iframe
        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '300';
        iframe.scrolling = 'no';
        iframe.frameBorder = 'no';
        iframe.allow = 'autoplay';
        iframe.src = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${player.trackId}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;

        // Luo credit-div
        const creditDiv = document.createElement('div');
        creditDiv.style.cssText = 'font-size: 10px; color: #cccccc; line-break: anywhere; word-break: normal; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif; font-weight: 100; margin-top: 5px;';
        creditDiv.innerHTML = `<a href="https://soundcloud.com/icetribe" title="Icetribe" target="_blank" style="color: #cccccc; text-decoration: none;">Icetribe</a> · <a href="https://soundcloud.com/icetribe/${player.url}" title="${player.title}" target="_blank" style="color: #cccccc; text-decoration: none;">${player.title}</a>`;

        // Lisää elementit containeriin
        container.appendChild(iframe);
        container.appendChild(creditDiv);
        
        // Lisää väliin <br> paitsi viimeisen jälkeen
        if (index < players.length - 1) {
            container.appendChild(document.createElement('br'));
        }
    });
}

// SoundCloud-tilan tarkistus
function checkSoundCloudConsent() {
    const cookieConsent = JSON.parse(localStorage.getItem('icetribe_cookie_consent') || '{}');
    
    // Vanhat elementit (soitossa-sivu)
    const noticeElement = document.getElementById('soundcloud-consent-notice');
    const playersElement = document.getElementById('soundcloud-players');
    const containerElement = document.getElementById('soundcloud-player-container');
    
    // Uudet shortcode-elementit (postaukset)
    const newNotices = document.querySelectorAll('.soundcloud-consent-notice');
    const newPlayers = document.querySelectorAll('.soundcloud-player');
    
    // Jos analytiikkaevästeet on hyväksytty, näytä soittimet
    if (cookieConsent.choices && cookieConsent.choices.analytics) {
        // Vanhat elementit
        if (noticeElement) noticeElement.style.display = 'none';
        if (playersElement) {
            loadSoundCloudPlayers(); // Luo soittimet dynaamisesti
            playersElement.style.display = 'block';
        }
        
        // Uudet shortcode-elementit
        newNotices.forEach(notice => notice.style.display = 'none');
        newPlayers.forEach(player => player.style.display = 'block');
        
    } else {
        // Jos analytiikkaevästeet on kielletty, piilota soittimet
        if (noticeElement) noticeElement.style.display = 'block';
        if (playersElement) playersElement.style.display = 'none';
        if (containerElement) containerElement.innerHTML = ''; // Tyhjennä soittimet
        
        // Uudet shortcode-elementit  
        newNotices.forEach(notice => notice.style.display = 'block');
        newPlayers.forEach(player => player.style.display = 'none');
    }
}

// Testifunktiot
window.resetCookies = function() {
  localStorage.removeItem('icetribe_cookie_consent');
  console.log('Evästeet resetoitu, lataa sivu uudelleen...');
  location.reload();
};

window.showCookiePreferences = function() {
  const consent = getCookieConsent();
  if (consent) {
    console.log('Nykyiset evästevalinat:', consent.choices);
  } else {
    console.log('Evästeitä ei ole asetettu');
  }
};

window.testGoogleAnalytics = function() {
  if (window.gtag) {
    console.log('Google Analytics on ladattu, lähetetään testiviesti...');
    gtag('event', 'manual_test', {
      'event_category': 'test',
      'event_label': 'manual_trigger',
      'value': 1
    });
    console.log('Testiviesti lähetetty Google Analyticsiin');
    
    // Tarkista dataLayer
    if (window.dataLayer) {
      console.log('DataLayer sisältö:', window.dataLayer.slice(-5)); // Viimeiset 5 tapahtumaa
    }
  } else {
    console.log('Google Analytics ei ole ladattu. Hyväksy ensin analytiikka-evästeet.');
  }
};