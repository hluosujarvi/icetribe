+++
title = 'Google Analytics Debug'
draft = false
featured_image = '/images/cover_posts.jpg'
+++

# Google Analytics Debug-sivu

Tämä sivu auttaa debuggaamaan Google Analytics -toimintaa.

<div style="border: 2px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 8px; background: #f9fff9;">
  <h3>🔍 GA4 Debuggaustyökalut</h3>
  
  <button onclick="debugGA()" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
    Testaa GA4 yhteyttä
  </button>
  
  <button onclick="sendTestEvent()" style="background: #2196F3; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
    Lähetä testieventti
  </button>
  
  <button onclick="checkConsent()" style="background: #FF9800; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">
    Tarkista consent mode
  </button>
</div>

<div id="debug-results" style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; font-family: monospace; min-height: 200px;">
  <strong>Debug tulokset näkyvät tässä...</strong><br><br>
  Varmista että Developer Tools Console on auki nähdäksesi kaikki viestit.
</div>

<script>
function debugGA() {
  const results = document.getElementById('debug-results');
  results.innerHTML = '<strong>🔍 Debuggataan GA4...</strong><br><br>';
  
  // Tarkista GA ID
  results.innerHTML += `GA ID: ${window.ICETRIBE_GA_ID || 'EI MÄÄRITELTY'}<br>`;
  
  // Tarkista gtag
  results.innerHTML += `gtag funktio: ${typeof gtag !== 'undefined' ? 'LÖYDETTY ✅' : 'EI LÖYDY ❌'}<br>`;
  
  // Tarkista dataLayer
  results.innerHTML += `dataLayer: ${window.dataLayer ? 'LÖYDETTY ✅' : 'EI LÖYDY ❌'}<br>`;
  
  if (window.dataLayer) {
    results.innerHTML += `dataLayer events: ${window.dataLayer.length} kpl<br>`;
  }
  
  // Tarkista GA script (dynaaminen + staattinen)
  const gaScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
  const dynamicLoadingDetected = typeof window.gtag !== 'undefined' && window.ICETRIBE_GA_ID;
  const scriptStatus = gaScript ? 'LADATTU ✅' : 
                     dynamicLoadingDetected ? 'DYNAAMINEN LATAUS ✅' : 'EI LADATTU ❌';
  results.innerHTML += `GA script: ${scriptStatus}<br>`;
  
  // Tarkista Google Analytics libtrary
  const gtagAvailable = typeof window.gtag === 'function';
  results.innerHTML += `Google Analytics library: ${gtagAvailable ? 'AKTIIVINEN ✅' : 'EI AKTIIVINEN ❌'}<br>`;
  
  // Tarkista consent
  const consent = JSON.parse(localStorage.getItem('icetribe_cookie_consent') || '{}');
  results.innerHTML += `Analytics consent: ${consent.choices && consent.choices.analytics ? 'GRANTED ✅' : 'DENIED ❌'}<br>`;
  
  // Tarkista onko Google Analytics valmis käyttöön
  const readyForAnalytics = gtagAvailable && window.ICETRIBE_GA_ID && window.dataLayer;
  results.innerHTML += `<br><strong>GA4 valmis käyttöön: ${readyForAnalytics ? '✅ KYLLÄ' : '❌ EI'}</strong><br><br>`;
  
  console.log('🔍 GA4 Debug:', {
    gaId: window.ICETRIBE_GA_ID,
    gtag: typeof gtag,
    dataLayer: window.dataLayer,
    consent: consent,
    gaScript: !!gaScript,
    dynamicDetected: dynamicLoadingDetected,
    ready: readyForAnalytics
  });
}

function sendTestEvent() {
  const results = document.getElementById('debug-results');
  
  if (typeof gtag === 'undefined') {
    results.innerHTML += '<br><strong>❌ Ei voi lähettää - gtag ei saatavilla</strong><br>';
    return;
  }
  
  // Lähetä test event
  gtag('event', 'debug_test', {
    'event_category': 'debug',
    'event_label': 'manual_test',
    'value': 1
  });
  
  results.innerHTML += '<br><strong>✅ Testieventti lähetetty!</strong><br>';
  results.innerHTML += 'Event: debug_test (category: debug, label: manual_test)<br>';
  
  console.log('📊 GA4 Test Event sent:', {
    event: 'debug_test',
    category: 'debug', 
    label: 'manual_test'
  });
}

function checkConsent() {
  const results = document.getElementById('debug-results');
  
  results.innerHTML += '<br><strong>🍪 Consent Mode Status:</strong><br>';
  
  if (typeof gtag !== 'undefined') {
    // Pyydä consent status (voi näkyä consolessa)
    gtag('get', window.ICETRIBE_GA_ID, 'cookie_domain', function(value) {
      console.log('GA4 cookie domain:', value);
    });
    
    results.innerHTML += 'Consent mode commands lähetetty - tarkista console<br>';
  } else {
    results.innerHTML += '❌ gtag ei saatavilla<br>';
  }
  
  console.log('🍪 Current consent state check requested');
}

// Auto-debug when page loads (odotetaan dynaamista latausta)
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(debugGA, 2000); // Annetaan enemmän aikaa dynaamiselle lataukselle
  
  // Lisätään myös event listener gtag.js latautumiselle
  const checkForGtag = setInterval(function() {
    if (typeof window.gtag === 'function') {
      clearInterval(checkForGtag);
      setTimeout(debugGA, 500); // Päivitetään debug kun gtag on valmis
    }
  }, 100);
  
  // Lopetetaan tarkistus 10 sekunnin kuluttua
  setTimeout(() => clearInterval(checkForGtag), 10000);
});
</script>