// Icetribe Cookie Consent Configuration - Yksinkertainen versio
// Finnish localization with Icetribe purple theme

// Varmista että consent manager on ladattu
document.addEventListener('DOMContentLoaded', function() {
  if (window.silktideCookieBannerManager) {
    window.silktideCookieBannerManager.updateCookieBannerConfig({
  // Position and appearance
  position: {
    banner: 'bottom' // Options: 'bottom', 'top', 'center'
  },
  
  cookieIcon: {
    position: 'bottom-right', // Options: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    colorScheme: 'purple' // Using default purple theme
  },

  // Background overlay
  background: {
    showBackground: true // Show semi-transparent overlay when banner is visible
  },

  // Finnish text configuration
  text: {
    banner: {
      description: `
        <p>Käytämme evästeitä parantaaksemme käyttökokemustasi ja analysoidaksemme sivuston käyttöä.</p>
      `,
      acceptAllButtonText: 'Hyväksy kaikki',
      acceptAllButtonAccessibleLabel: 'Hyväksy kaikki evästeet',
      rejectNonEssentialButtonText: 'Hylkää vapaavalintaiset', 
      rejectNonEssentialButtonAccessibleLabel: 'Hylkää vapaavalintaiset evästeet',
      preferencesButtonText: 'Asetukset',
      preferencesButtonAccessibleLabel: 'Avaa evästeiden asetukset'
    },
    
    preferences: {
      title: 'Muokkaa evästeasetuksiasi',
      description: `
        <p>Kunnioitamme yksityisyyttäsi. Voit valita, mitä evästeitä sallitaan. Evästeasetuksesi koskevat koko verkkosivustoamme. Klikkaamalla "Hyväksy kaikki" hyväksyt kaikkien evästeiden käytön. Klikkaamalla "Hylkää vapaavalintaiset" hyväksyt vain välttämättömät evästeet.</p>
      `,
      creditLinkText: 'Hanki tämä banneri ilmaiseksi',
      creditLinkAccessibleLabel: 'Siirry Silktide Consent Manager -sivulle'
    }
  },

  // Cookie types and categories
  cookieTypes: [
    {
      id: 'necessary',
      name: 'Välttämättömät evästeet',
      description: 'Nämä evästeet ovat välttämättömiä verkkosivuston perustoimintojen kannalta.',
      required: true,
      defaultValue: true,
      onAccept: function() {
        console.log('Necessary cookies accepted');
      }
    },
    
    {
      id: 'analytics',
      name: 'Analytiikkaevästeet', 
      description: 'Auttavat meitä ymmärtämään sivuston käyttöä ja parantamaan sisältöä.',
      required: false,
      defaultValue: false,
      onAccept: function() {
        console.log('Analytics cookies accepted');
        if (typeof gtag !== 'undefined') {
          gtag('consent', 'update', { 'analytics_storage': 'granted' });
        }
      },
      onReject: function() {
        console.log('Analytics cookies rejected');
        if (typeof gtag !== 'undefined') {
          gtag('consent', 'update', { 'analytics_storage': 'denied' });
        }
      }
    },
    
    {
      id: 'marketing',
      name: 'Markkinointievästeet',
      description: 'Mahdollistavat kohdistetun mainonnan ja sosiaalisen median ominaisuudet.',
      required: false,
      defaultValue: false,
      onAccept: function() {
        console.log('Marketing cookies accepted');
        if (typeof gtag !== 'undefined') {
          gtag('consent', 'update', {
            'ad_storage': 'granted',
            'ad_user_data': 'granted', 
            'ad_personalization': 'granted'
          });
        }
      },
      onReject: function() {
        console.log('Marketing cookies rejected');
        if (typeof gtag !== 'undefined') {
          gtag('consent', 'update', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
          });
        }
      }
    }
  ],

  // Unique identifier for this banner (useful if you have multiple sites)
  bannerSuffix: 'icetribe_fi',

  // Callback functions for custom behavior
  onBannerOpen: function() {
    console.log('Icetribe: Cookie banner opened');
    // Track banner view in analytics (if accepted)
  },
  
  onBannerClose: function() {
    console.log('Icetribe: Cookie banner closed');
  },
  
  onPreferencesOpen: function() {
    console.log('Icetribe: Cookie preferences modal opened');
    // Track preferences view
  },
  
  onPreferencesClose: function() {
    console.log('Icetribe: Cookie preferences modal closed');
  },
  
  onBackdropOpen: function() {
    // Optional: Pause any background videos or animations
  },
  
  onBackdropClose: function() {
    // Optional: Resume background videos or animations
  }
});

// Additional Icetribe-specific functions
window.IcetribeConsent = {
  // Check if specific cookie type is accepted
  isAccepted: function(cookieType) {
    return localStorage.getItem(`silktideCookieChoice_${cookieType}_icetribe_fi`) === 'true';
  },
  
  // Get all accepted cookies as object
  getAcceptedCookies: function() {
    return {
      necessary: true, // Always true
      analytics: this.isAccepted('analytics'),
      marketing: this.isAccepted('marketing'),
      functional: this.isAccepted('functional')
    };
  },
  
  // Programmatically open preferences modal
  openPreferences: function() {
    const cookieIcon = document.getElementById('silktide-cookie-icon');
    if (cookieIcon) {
      cookieIcon.click();
    }
  },
  
  // Reset all cookie preferences (for testing)
  resetPreferences: function() {
    const keys = [
      'silktideCookieChoice_necessary_icetribe_fi',
      'silktideCookieChoice_analytics_icetribe_fi', 
      'silktideCookieChoice_marketing_icetribe_fi',
      'silktideCookieChoice_functional_icetribe_fi',
      'silktideCookieBanner_InitialChoice_icetribe_fi'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    
    // Reload the page to show banner again
    if (confirm('Evästeasetukset nollattu. Haluatko päivittää sivun?')) {
      window.location.reload();
    }
  }
};

    });
  } else {
    console.error('Silktide Cookie Banner Manager not found');
  }
});

// Initialize Google Consent Mode if gtag is available
if (typeof gtag !== 'undefined') {
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted'
  });
}