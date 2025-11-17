// Yksinkertainen evästebanner Icetribelle

console.log('Loading simple cookie banner...');

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
  },
  marketing: {
    name: 'Markkinointievästeet',
    description: 'Ei tällä hetkellä käytössä. Varaus tulevaisuuden mainontaa varten.',
    required: false
  }
};

// Tarkista onko evästeet jo asetettu
function hasUserMadeChoice() {
  return localStorage.getItem('icetribe_cookie_consent') !== null;
}

// Hae käyttäjän valinnat
function getCookieConsent() {
  const saved = localStorage.getItem('icetribe_cookie_consent');
  return saved ? JSON.parse(saved) : null;
}

// Tallenna valinnat
function saveCookieConsent(choices) {
  const consent = {
    timestamp: Date.now(),
    choices: choices
  };
  localStorage.setItem('icetribe_cookie_consent', JSON.stringify(consent));
  console.log('Cookie preferences saved:', choices);
  
  // Päivitä Google Analytics consent
  updateGoogleAnalyticsConsent(choices);
}

// Lataa Google Analytics dynaamisesti
function loadGoogleAnalytics() {
  if (typeof window.ICETRIBE_GA_ID === 'undefined') {
    console.log('Google Analytics ID ei ole määritelty');
    return;
  }
  
  if (typeof gtag !== 'undefined') {
    console.log('Google Analytics on jo ladattu');
    return;
  }
  
  console.log('Ladataan Google Analytics:', window.ICETRIBE_GA_ID);
  
  // Luo script-elementti GA:lle
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${window.ICETRIBE_GA_ID}`;
  document.head.appendChild(script);
  
  // Alusta gtag kun script on ladattu
  script.onload = function() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag; // Tee gtag globaaliksi
    
    gtag('js', new Date());
    gtag('config', window.ICETRIBE_GA_ID, {
      'anonymize_ip': true,
      'cookie_flags': 'max-age=7200;secure;samesite=strict',
      'send_page_view': true
    });
    
    console.log('Google Analytics ladattu ja konfiguroitu');
  };
}

// Google Analytics consent management
function updateGoogleAnalyticsConsent(choices) {
  if (choices.analytics && typeof gtag === 'undefined') {
    // Jos analytics hyväksytty mutta GA ei ole ladattu, lataa se
    loadGoogleAnalytics();
  } else if (typeof gtag !== 'undefined') {
    // Jos GA on ladattu, päivitä consent
    gtag('consent', 'update', {
      'analytics_storage': choices.analytics ? 'granted' : 'denied',
      'ad_storage': choices.marketing ? 'granted' : 'denied'
    });
    console.log('Google Analytics consent päivitetty:', {
      analytics: choices.analytics ? 'granted' : 'denied',
      marketing: choices.marketing ? 'granted' : 'denied'
    });
  }
}

// Alusta Google Analytics jos käyttäjä on jo antanut suostumuksen
function initGoogleAnalyticsConsent() {
  const consent = getCookieConsent();
  if (consent && consent.choices && consent.choices.analytics) {
    console.log('Käyttäjä on jo hyväksynyt analytiikan, ladataan GA');
    loadGoogleAnalytics();
  } else {
    console.log('Analytics ei hyväksytty, GA:ta ei ladata');
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
  if (footerLink) {
    footerLink.style.display = 'inline-block';
    footerLink.addEventListener('click', function(e) {
      e.preventDefault();
      showModal();
    });
  }
}

// Piilota footer-linkki
function hideFooterLink() {
  const footerLink = document.getElementById('footer-cookie-settings');
  if (footerLink) {
    footerLink.style.display = 'none';
  }
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
  if (consent && consent.choices) {
    Object.keys(consent.choices).forEach(key => {
      const checkbox = document.querySelector(`[data-cookie-type="${key}"]`);
      if (checkbox && !checkbox.disabled) {
        checkbox.checked = consent.choices[key];
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
    console.log('Lisätään event listener: Sulje modal');
    closeBtn.onclick = function() {
      console.log('Sulje modal painettu');
      hideModal();
    };
  }
  
  // Tallenna asetukset
  const saveBtn = document.getElementById('cookie-save-preferences');
  if (saveBtn) {
    console.log('Lisätään event listener: Tallenna asetukset');
    saveBtn.onclick = function() {
      console.log('Tallenna asetukset painettu');
      // Tallenna valinnat suoraan
      const choices = {};
      Object.keys(cookieTypes).forEach(key => {
        const checkbox = document.querySelector(`[data-cookie-type="${key}"]`);
        choices[key] = checkbox ? checkbox.checked : cookieTypes[key].required;
      });
      saveCookieConsent(choices);
      // Sulje modal suoraan
      document.getElementById('cookie-modal').style.display = 'none';
      setTimeout(() => {
        setupFooterLink();
      }, 100);
    };
  }
  
  // Hyväksy kaikki
  const acceptAllBtn = document.getElementById('cookie-accept-all-modal');
  if (acceptAllBtn) {
    console.log('Lisätään event listener: Hyväksy kaikki');
    acceptAllBtn.onclick = function() {
      console.log('Hyväksy kaikki painettu');
      // Hyväksy kaikki suoraan
      const choices = {};
      Object.keys(cookieTypes).forEach(key => {
        choices[key] = true;
      });
      saveCookieConsent(choices);
      // Sulje modal suoraan
      document.getElementById('cookie-modal').style.display = 'none';
      setTimeout(() => {
        setupFooterLink();
      }, 100);
    };
  }
  
  // Hyväksy välttämättömät
  const acceptNecessaryBtn = document.getElementById('cookie-accept-necessary-modal');
  if (acceptNecessaryBtn) {
    console.log('Lisätään event listener: Hyväksy välttämättömät');
    acceptNecessaryBtn.onclick = function() {
      console.log('Hyväksy välttämättömät painettu');
      // Hyväksy vain välttämättömät suoraan
      const choices = {};
      Object.keys(cookieTypes).forEach(key => {
        choices[key] = cookieTypes[key].required;
      });
      saveCookieConsent(choices);
      // Sulje modal suoraan
      document.getElementById('cookie-modal').style.display = 'none';
      setTimeout(() => {
        setupFooterLink();
      }, 100);
    };
  }
  
  console.log('Modal event listenerit asetettu');
}

// Piilota modal
function hideModal() {
  console.log('Suljetaan modal...');
  const modal = document.getElementById('cookie-modal');
  if (modal) {
    modal.style.display = 'none';
    console.log('Modal suljettu');
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
  console.log('Initializing cookie banner...');
  
  // Alusta Google Analytics consent mode
  initGoogleAnalyticsConsent();
  
  // Tarkista onko käyttäjä jo valinnut
  if (hasUserMadeChoice()) {
    console.log('User has already made cookie choice');
    // Näytä footer-linkki ja aseta modal
    setupFooterLink();
    createModal(); // Modal tarvitaan footer-linkille (event listenerit asetetaan siellä)
    
    return;
  }
  
  // Piilota footer-linkki jos ei ole vielä tehty valintaa
  hideFooterLink();
  
  // Luo banner ja modal ensimmäiselle vierailulle
  createBanner();
  createModal();
  
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

// Testifunktiot
window.resetCookies = function() {
  localStorage.removeItem('icetribe_cookie_consent');
  console.log('Cookie preferences cleared');
  location.reload();
};

window.showCookiePreferences = function() {
  const consent = getCookieConsent();
  if (consent) {
    console.log('Current cookie preferences:', consent);
  } else {
    console.log('No cookie preferences set');
  }
};