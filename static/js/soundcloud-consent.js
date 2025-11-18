// SoundCloud analytics consent management
function enableAnalyticsAndSoundCloud() {
    // Aktivoi analytiikka-evästeet (sisältää SoundCloudin)
    const consent = JSON.parse(localStorage.getItem('icetribe_cookie_consent') || '{}');
    const newConsent = {
        timestamp: Date.now(),
        choices: {
            ...consent.choices,
            necessary: true,
            analytics: true
        }
    };
    
    localStorage.setItem('icetribe_cookie_consent', JSON.stringify(newConsent));
    
    // Piilota suostumusilmoitus
    const noticeElement = document.getElementById('soundcloud-consent-notice');
    if (noticeElement) noticeElement.style.display = 'none';
    
    // Luo ja näytä soittimet dynaamisesti
    loadSoundCloudPlayers();
    const playersElement = document.getElementById('soundcloud-players');
    if (playersElement) playersElement.style.display = 'block';
    
    // Lataa GA4 jos se ei ole vielä ladattu
    if (typeof gtag === 'undefined' && window.ICETRIBE_GA_ID) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${window.ICETRIBE_GA_ID}`;
        document.head.appendChild(script);
        
        script.onload = function() {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', window.ICETRIBE_GA_ID);
            window.gtag = gtag;
        };
    } else if (typeof gtag !== 'undefined') {
        // Päivitä GA4 consent
        gtag('consent', 'update', {
            'analytics_storage': 'granted'
        });
    }
    
    // Lähetä custom event että pää-evästejärjestelmä tietää muutoksesta
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
        detail: { choices: newConsent.choices } 
    }));
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

// Kuuntele evästeasetuksien muutoksia
function checkCookieConsent() {
    const cookieConsent = JSON.parse(localStorage.getItem('icetribe_cookie_consent') || '{}');
    
    const noticeElement = document.getElementById('soundcloud-consent-notice');
    const playersElement = document.getElementById('soundcloud-players');
    const containerElement = document.getElementById('soundcloud-player-container');
    
    // Jos analytiikkaevästeet on hyväksytty, näytä soittimet
    if (cookieConsent.choices && cookieConsent.choices.analytics) {
        if (noticeElement) noticeElement.style.display = 'none';
        if (playersElement) {
            loadSoundCloudPlayers(); // Luo soittimet dynaamisesti
            playersElement.style.display = 'block';
        }
    } else {
        // Jos analytiikkaevästeet on kielletty, piilota soittimet
        if (noticeElement) noticeElement.style.display = 'block';
        if (playersElement) playersElement.style.display = 'none';
        if (containerElement) containerElement.innerHTML = ''; // Tyhjennä soittimet
    }
}

// Tarkista sivun latautuessa, onko SoundCloud-suostumus jo annettu TÄSSÄ istunnossa
document.addEventListener('DOMContentLoaded', function() {
    checkCookieConsent();
    
    // Kuuntele localStorage muutoksia (jos käyttäjä vaihtaa evästeasetuksia toisessa ikkunassa)
    window.addEventListener('storage', function(e) {
        if (e.key === 'icetribe_cookie_consent') {
            checkCookieConsent();
        }
    });
    
    // Kuuntele myös custom eventejä jos evästeasetuksia muutetaan samassa ikkunassa
    window.addEventListener('cookieConsentChanged', function() {
        setTimeout(checkCookieConsent, 100); // Pieni viive että localStorage ehtii päivittyä
    });
});