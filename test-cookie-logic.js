#!/usr/bin/env node
/**
 * Icetribe Cookie System Logic Tests
 * 
 * Tests the core JavaScript logic without browser automation
 */

// Mock DOM ja localStorage browser-ympäristöä varten
global.window = {
  localStorage: {
    storage: {},
    getItem: function(key) { return this.storage[key] || null; },
    setItem: function(key, value) { this.storage[key] = value; },
    removeItem: function(key) { delete this.storage[key]; },
    clear: function() { this.storage = {}; }
  },
  ICETRIBE_GA_ID: 'G-8KK4BYHJKJ',
  dataLayer: [],
  gtag: undefined
};

global.localStorage = global.window.localStorage;
global.document = {
  createElement: () => ({ 
    async: null, 
    src: null, 
    onload: null,
    appendChild: () => {},
    head: { appendChild: () => {} }
  }),
  head: { appendChild: () => {} },
  body: { appendChild: () => {} },
  getElementById: () => null,
  querySelector: () => null
};
global.console = console;

// Lataa evästejärjestelmän koodi
const fs = require('fs');
const path = require('path');

const cookieSystemCode = fs.readFileSync(
  path.join(__dirname, 'static', 'js', 'icetribe-simple-config.js'), 
  'utf8'
);

// Poista DOMContentLoaded-event ja DOM-operaatiot testejä varten
const testableCode = cookieSystemCode
  .replace(/document\.addEventListener\('DOMContentLoaded'.*$/s, '')
  .replace(/document\.(getElementById|querySelector|createElement|body|head).*$/gm, '')
  .replace(/\.appendChild.*$/gm, '')
  .replace(/\.style\.display.*$/gm, '')
  .replace(/\.addEventListener.*$/gm, '');

// Suorita koodi
eval(testableCode);

class CookieLogicTester {
  constructor() {
    this.testResults = [];
  }

  async test(name, testFn) {
    console.log(`🧪 Testing: ${name}`);
    try {
      await testFn();
      console.log(`✅ PASS: ${name}\n`);
      this.testResults.push({ name, status: 'PASS' });
    } catch (error) {
      console.log(`❌ FAIL: ${name}`);
      console.log(`   Error: ${error.message}\n`);
      this.testResults.push({ name, status: 'FAIL', error: error.message });
    }
  }

  clearStorage() {
    global.localStorage.clear();
    global.window.gtag = undefined;
  }

  async runAllTests() {
    console.log('🚀 Starting Cookie System Logic Tests...\n');

    // Test 1: Cookie types are defined correctly
    await this.test('Cookie types are properly defined', async () => {
      if (!cookieTypes || typeof cookieTypes !== 'object') {
        throw new Error('cookieTypes should be defined as an object');
      }
      
      const requiredTypes = ['necessary', 'analytics', 'marketing'];
      requiredTypes.forEach(type => {
        if (!cookieTypes[type]) {
          throw new Error(`Cookie type '${type}' is missing`);
        }
        if (!cookieTypes[type].name || !cookieTypes[type].description) {
          throw new Error(`Cookie type '${type}' missing name or description`);
        }
      });
      
      if (!cookieTypes.necessary.required) {
        throw new Error('Necessary cookies should be required');
      }
    });

    // Test 2: hasUserMadeChoice function works
    await this.test('hasUserMadeChoice function works correctly', async () => {
      this.clearStorage();
      
      if (hasUserMadeChoice()) {
        throw new Error('Should return false when no choice made');
      }
      
      localStorage.setItem('icetribe_cookie_consent', '{"test": true}');
      
      if (!hasUserMadeChoice()) {
        throw new Error('Should return true when choice exists');
      }
    });

    // Test 3: saveCookieConsent function works
    await this.test('saveCookieConsent stores preferences correctly', async () => {
      this.clearStorage();
      
      const testChoices = {
        necessary: true,
        analytics: true,
        marketing: false
      };
      
      saveCookieConsent(testChoices);
      
      const stored = localStorage.getItem('icetribe_cookie_consent');
      if (!stored) {
        throw new Error('Consent should be stored in localStorage');
      }
      
      const parsed = JSON.parse(stored);
      if (!parsed.choices || !parsed.timestamp) {
        throw new Error('Stored consent should have choices and timestamp');
      }
      
      if (parsed.choices.analytics !== true || parsed.choices.marketing !== false) {
        throw new Error('Choices should match input');
      }
    });

    // Test 4: getCookieConsent function works
    await this.test('getCookieConsent retrieves preferences correctly', async () => {
      this.clearStorage();
      
      if (getCookieConsent() !== null) {
        throw new Error('Should return null when no consent stored');
      }
      
      const testData = {
        timestamp: Date.now(),
        choices: { necessary: true, analytics: false }
      };
      
      localStorage.setItem('icetribe_cookie_consent', JSON.stringify(testData));
      
      const retrieved = getCookieConsent();
      if (!retrieved || retrieved.choices.necessary !== true) {
        throw new Error('Should retrieve stored consent correctly');
      }
    });

    // Test 5: Google Analytics loading logic
    await this.test('Google Analytics loading logic works', async () => {
      this.clearStorage();
      
      // Mock gtag is undefined initially
      if (typeof window.gtag !== 'undefined') {
        window.gtag = undefined;
      }
      
      // Test that GA ID is configured
      if (window.ICETRIBE_GA_ID !== 'G-8KK4BYHJKJ') {
        throw new Error('Google Analytics ID should be configured');
      }
      
      // loadGoogleAnalytics function should exist
      if (typeof loadGoogleAnalytics !== 'function') {
        throw new Error('loadGoogleAnalytics function should be defined');
      }
    });

    // Test 6: Consent update logic
    await this.test('updateGoogleAnalyticsConsent function works', async () => {
      this.clearStorage();
      
      if (typeof updateGoogleAnalyticsConsent !== 'function') {
        throw new Error('updateGoogleAnalyticsConsent function should be defined');
      }
      
      // Test with analytics enabled
      const choices = { analytics: true, marketing: false };
      
      // Should not throw error
      updateGoogleAnalyticsConsent(choices);
    });

    // Test 7: Finnish localization
    await this.test('Finnish localization is correct', async () => {
      const finnishTexts = [
        cookieTypes.necessary.name,
        cookieTypes.analytics.name,
        cookieTypes.marketing.name
      ];
      
      const expectedTexts = [
        'Välttämättömät evästeet',
        'Analytiikkaevästeet', 
        'Markkinointievästeet'
      ];
      
      expectedTexts.forEach((expected, index) => {
        if (finnishTexts[index] !== expected) {
          throw new Error(`Expected '${expected}', got '${finnishTexts[index]}'`);
        }
      });
    });

    // Test 8: Cookie descriptions are informative
    await this.test('Cookie descriptions are informative', async () => {
      Object.keys(cookieTypes).forEach(type => {
        const desc = cookieTypes[type].description;
        if (!desc || desc.length < 20) {
          throw new Error(`Cookie type '${type}' should have informative description`);
        }
      });
      
      // Check specific content
      if (!cookieTypes.analytics.description.includes('Google Analytics')) {
        throw new Error('Analytics description should mention Google Analytics');
      }
    });

    this.printResults();
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('═'.repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.error) {
        console.log(`   ${result.error}`);
      }
    });
    
    console.log('═'.repeat(50));
    console.log(`Total: ${this.testResults.length} tests`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${Math.round((passed / this.testResults.length) * 100)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 All logic tests passed! Cookie system core functionality is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the implementation.');
    }
  }
}

// Run tests
const tester = new CookieLogicTester();
tester.runAllTests().catch(console.error);