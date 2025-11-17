#!/usr/bin/env node
/**
 * Automated Cookie System Test Suite for Icetribe
 * 
 * Tests the complete cookie consent functionality including:
 * - Initial banner display
 * - Modal functionality  
 * - Cookie preferences storage
 * - Google Analytics integration
 * - Footer settings link
 */

const { chromium } = require('playwright');

class CookieSystemTester {
  constructor() {
    this.baseUrl = 'http://localhost:1315';
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async setup() {
    console.log('🚀 Starting Cookie System Tests...\n');
    this.browser = await chromium.launch({ headless: false, slowMo: 500 });
    this.page = await this.browser.newPage();
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async clearStorage() {
    // Clear localStorage and cookies
    await this.page.evaluate(() => {
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    });
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

  async runAllTests() {
    await this.setup();

    // Test 1: Initial banner appears for new users
    await this.test('Initial banner displays for new users', async () => {
      await this.clearStorage();
      await this.page.goto(this.baseUrl);
      await this.page.waitForSelector('#cookie-banner', { timeout: 3000 });
      
      const bannerText = await this.page.textContent('#cookie-banner h3');
      if (bannerText !== 'Evästeet') {
        throw new Error(`Expected banner title 'Evästeet', got '${bannerText}'`);
      }
    });

    // Test 2: Accept all cookies functionality
    await this.test('Accept all cookies works correctly', async () => {
      await this.clearStorage();
      await this.page.goto(this.baseUrl);
      await this.page.waitForSelector('#cookie-accept-all');
      await this.page.click('#cookie-accept-all');
      
      // Check banner is hidden
      const bannerVisible = await this.page.isVisible('#cookie-banner');
      if (bannerVisible) {
        throw new Error('Banner should be hidden after accepting cookies');
      }
      
      // Check localStorage
      const consent = await this.page.evaluate(() => {
        return JSON.parse(localStorage.getItem('icetribe_cookie_consent') || '{}');
      });
      
      if (!consent.choices || !consent.choices.analytics || !consent.choices.necessary) {
        throw new Error('All cookies should be accepted in localStorage');
      }
    });

    // Test 3: Reject optional cookies functionality
    await this.test('Reject optional cookies works correctly', async () => {
      await this.clearStorage();
      await this.page.goto(this.baseUrl);
      await this.page.waitForSelector('#cookie-reject-all');
      await this.page.click('#cookie-reject-all');
      
      const consent = await this.page.evaluate(() => {
        return JSON.parse(localStorage.getItem('icetribe_cookie_consent') || '{}');
      });
      
      if (!consent.choices || consent.choices.analytics !== false || consent.choices.necessary !== true) {
        throw new Error('Only necessary cookies should be accepted');
      }
    });

    // Test 4: Cookie settings modal opens and works
    await this.test('Cookie settings modal functionality', async () => {
      await this.clearStorage();
      await this.page.goto(this.baseUrl);
      await this.page.waitForSelector('#cookie-settings');
      await this.page.click('#cookie-settings');
      
      // Check modal is visible
      await this.page.waitForSelector('#cookie-modal', { state: 'visible' });
      
      // Check modal content
      const modalTitle = await this.page.textContent('#cookie-modal h2');
      if (modalTitle !== 'Evästeasetukset') {
        throw new Error(`Expected modal title 'Evästeasetukset', got '${modalTitle}'`);
      }
      
      // Test close button
      await this.page.click('#cookie-modal-close');
      await this.page.waitForSelector('#cookie-modal', { state: 'hidden' });
    });

    // Test 5: Footer link appears after choice is made
    await this.test('Footer cookie settings link appears', async () => {
      await this.clearStorage();
      await this.page.goto(this.baseUrl);
      await this.page.waitForSelector('#cookie-accept-all');
      await this.page.click('#cookie-accept-all');
      
      // Wait for footer link to appear
      await this.page.waitForTimeout(200); // Allow for setTimeout in code
      await this.page.waitForSelector('#footer-cookie-settings', { state: 'visible' });
      
      const linkText = await this.page.textContent('#footer-cookie-settings');
      if (!linkText.includes('Evästeasetukset')) {
        throw new Error(`Footer link should contain 'Evästeasetukset', got '${linkText}'`);
      }
    });

    // Test 6: Google Analytics integration
    await this.test('Google Analytics loads when analytics accepted', async () => {
      await this.clearStorage();
      await this.page.goto(this.baseUrl);
      await this.page.waitForSelector('#cookie-accept-all');
      await this.page.click('#cookie-accept-all');
      
      // Wait for GA to potentially load
      await this.page.waitForTimeout(2000);
      
      const gaLoaded = await this.page.evaluate(() => {
        return typeof window.gtag !== 'undefined';
      });
      
      if (!gaLoaded) {
        throw new Error('Google Analytics should be loaded when analytics cookies are accepted');
      }
    });

    // Test 7: Cookie policy page exists
    await this.test('Cookie policy page is accessible', async () => {
      await this.page.goto(`${this.baseUrl}/cookies/`);
      
      const pageTitle = await this.page.textContent('h1');
      if (pageTitle !== 'Evästeet') {
        throw new Error(`Expected page title 'Evästeet', got '${pageTitle}'`);
      }
      
      // Check for cookie categories
      const categories = await this.page.$$eval('h3', elements => elements.map(el => el.textContent));
      const hasNecessary = categories.some(cat => cat.includes('Välttämättömät'));
      const hasAnalytics = categories.some(cat => cat.includes('Analytiikka'));
      
      if (!hasNecessary || !hasAnalytics) {
        throw new Error('Cookie policy should contain necessary and analytics categories');
      }
    });

    // Test 8: Modal buttons work correctly
    await this.test('All modal buttons function correctly', async () => {
      await this.clearStorage();
      await this.page.goto(this.baseUrl);
      await this.page.waitForSelector('#cookie-settings');
      await this.page.click('#cookie-settings');
      await this.page.waitForSelector('#cookie-modal', { state: 'visible' });
      
      // Test "Accept all" in modal
      await this.page.click('#cookie-accept-all-modal');
      await this.page.waitForSelector('#cookie-modal', { state: 'hidden' });
      
      const consent = await this.page.evaluate(() => {
        return JSON.parse(localStorage.getItem('icetribe_cookie_consent') || '{}');
      });
      
      if (!consent.choices || !consent.choices.analytics) {
        throw new Error('Accept all in modal should accept analytics cookies');
      }
    });

    await this.teardown();
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
      console.log('\n🎉 All tests passed! Cookie system is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the implementation.');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new CookieSystemTester();
  tester.runAllTests().catch(console.error);
}

module.exports = CookieSystemTester;