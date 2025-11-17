#!/usr/bin/env node
/**
 * Icetribe Cookie System Manual Tests
 * 
 * Yksinkertaiset testit evästejärjestelmälle
 */

console.log('🚀 Icetribe Cookie System Tests\n');

// Test 1: Tarkista että tarvittavat tiedostot löytyvät
console.log('📁 Checking files...');

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'static/js/icetribe-simple-config.js',
  'assets/css/simple-consent.css', 
  'content/cookies.md',
  'layouts/_default/baseof.html'
];

let filesOk = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - EXISTS`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    filesOk = false;
  }
});

if (!filesOk) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

console.log('\n🔍 Checking JavaScript configuration...');

// Test 2: Tarkista JavaScript-konfiguraatio
const jsCode = fs.readFileSync(path.join(__dirname, 'static/js/icetribe-simple-config.js'), 'utf8');

const tests = [
  {
    name: 'Cookie types defined',
    check: () => jsCode.includes('cookieTypes') && jsCode.includes('necessary') && jsCode.includes('analytics')
  },
  {
    name: 'Finnish localization',
    check: () => jsCode.includes('Välttämättömät evästeet') && jsCode.includes('Analytiikkaevästeet')
  },
  {
    name: 'Google Analytics integration',
    check: () => jsCode.includes('loadGoogleAnalytics') && jsCode.includes('ICETRIBE_GA_ID')
  },
  {
    name: 'Modal functionality',
    check: () => jsCode.includes('showModal') && jsCode.includes('hideModal') && jsCode.includes('setupModalEventListeners')
  },
  {
    name: 'localStorage usage',
    check: () => jsCode.includes('localStorage.getItem') && jsCode.includes('icetribe_cookie_consent')
  }
];

let jsTestsPassed = 0;
tests.forEach(test => {
  if (test.check()) {
    console.log(`✅ ${test.name}`);
    jsTestsPassed++;
  } else {
    console.log(`❌ ${test.name}`);
  }
});

console.log('\n🎨 Checking CSS configuration...');

const cssCode = fs.readFileSync(path.join(__dirname, 'assets/css/simple-consent.css'), 'utf8');

const cssTests = [
  {
    name: 'Icetribe purple branding',
    check: () => cssCode.includes('--icetribe-purple') && cssCode.includes('#8A42A8')
  },
  {
    name: 'Cookie banner styles',
    check: () => cssCode.includes('#cookie-banner') && cssCode.includes('position: fixed')
  },
  {
    name: 'Modal styles', 
    check: () => cssCode.includes('#cookie-modal') && cssCode.includes('display: flex')
  },
  {
    name: 'Toggle switches',
    check: () => cssCode.includes('.toggle-slider') && cssCode.includes('border-radius')
  },
  {
    name: 'Responsive design',
    check: () => cssCode.includes('@media') && cssCode.includes('max-width')
  }
];

let cssTestsPassed = 0;
cssTests.forEach(test => {
  if (test.check()) {
    console.log(`✅ ${test.name}`);
    cssTestsPassed++;
  } else {
    console.log(`❌ ${test.name}`);
  }
});

console.log('\n📄 Checking Hugo templates...');

const baseof = fs.readFileSync(path.join(__dirname, 'layouts/_default/baseof.html'), 'utf8');

const templateTests = [
  {
    name: 'Google Analytics configuration',
    check: () => baseof.includes('ICETRIBE_GA_ID') && baseof.includes('G-8KK4BYHJKJ')
  },
  {
    name: 'CSS inclusion',
    check: () => baseof.includes('simple-consent.css')
  },
  {
    name: 'JavaScript inclusion',
    check: () => baseof.includes('icetribe-simple-config.js')
  }
];

let templateTestsPassed = 0;
templateTests.forEach(test => {
  if (test.check()) {
    console.log(`✅ ${test.name}`);
    templateTestsPassed++;
  } else {
    console.log(`❌ ${test.name}`);
  }
});

console.log('\n🍪 Checking cookie policy page...');

const cookiesPage = fs.readFileSync(path.join(__dirname, 'content/cookies.md'), 'utf8');

const policyTests = [
  {
    name: 'Finnish content',
    check: () => cookiesPage.includes('Evästeet') && cookiesPage.includes('GDPR')
  },
  {
    name: 'Cookie categories explained',
    check: () => cookiesPage.includes('Välttämättömät evästeet') && cookiesPage.includes('Analytiikkaevästeet')
  },
  {
    name: 'Google Analytics details',
    check: () => cookiesPage.includes('Google Analytics') && cookiesPage.includes('_ga')
  },
  {
    name: 'Contact information',
    check: () => cookiesPage.includes('yhteystiedot') || cookiesPage.includes('info@icetribe')
  }
];

let policyTestsPassed = 0;
policyTests.forEach(test => {
  if (test.check()) {
    console.log(`✅ ${test.name}`);
    policyTestsPassed++;
  } else {
    console.log(`❌ ${test.name}`);
  }
});

// Yhteenveto
console.log('\n📊 Test Results Summary:');
console.log('═'.repeat(50));
console.log(`JavaScript Tests: ${jsTestsPassed}/${tests.length} passed`);
console.log(`CSS Tests: ${cssTestsPassed}/${cssTests.length} passed`);
console.log(`Template Tests: ${templateTestsPassed}/${templateTests.length} passed`);
console.log(`Policy Tests: ${policyTestsPassed}/${policyTests.length} passed`);

const totalTests = tests.length + cssTests.length + templateTests.length + policyTests.length;
const totalPassed = jsTestsPassed + cssTestsPassed + templateTestsPassed + policyTestsPassed;
const successRate = Math.round((totalPassed / totalTests) * 100);

console.log('═'.repeat(50));
console.log(`Total: ${totalPassed}/${totalTests} tests passed (${successRate}%)`);

if (totalPassed === totalTests) {
  console.log('\n🎉 All tests passed! Cookie system is ready for production.');
  console.log('\n📋 Manual testing checklist:');
  console.log('   1. Visit http://localhost:1315');
  console.log('   2. Check cookie banner appears');
  console.log('   3. Test "Hyväksy kaikki" button');
  console.log('   4. Test "Hylkää vapaavalintaiset" button'); 
  console.log('   5. Test "Asetukset" modal');
  console.log('   6. Check footer settings link appears');
  console.log('   7. Visit /cookies/ page');
  console.log('   8. Check console for GA loading');
} else {
  console.log('\n⚠️  Some tests failed. Check the implementation before deployment.');
}

console.log('\n🔗 Test manually at: http://localhost:1315');