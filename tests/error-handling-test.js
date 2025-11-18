#!/usr/bin/env node

// Icetribe Error Handling & Resilience Testing Suite
// Testaa virheskenaariot ja sivuston vikasietoisuus
// Version: 1.0

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const { execSync } = require('child_process');

class ErrorHandlingTester {
    constructor() {
        this.violations = [];
        this.warnings = [];
        this.passCount = 0;
        this.failCount = 0;
        
        this.testScenarios = [
            { name: '404 Not Found', path: '/non-existent-page' },
            { name: 'Broken internal link', path: '/broken-link' },
            { name: 'Invalid image source', element: 'img[src="/non-existent.jpg"]' },
            { name: 'Missing JavaScript file', script: '/js/non-existent.js' }
        ];
    }

    log(type, message) {
        const timestamp = new Date().toLocaleTimeString('fi-FI');
        const colors = {
            pass: '\x1b[32m✅ PASS\x1b[0m',
            fail: '\x1b[31m❌ FAIL\x1b[0m',
            warning: '\x1b[33m⚠️  WARNING\x1b[0m',
            info: '\x1b[34mℹ️  INFO\x1b[0m'
        };
        
        console.log(`${colors[type] || colors.info}: ${message}`);
        
        if (type === 'pass') this.passCount++;
        if (type === 'fail') {
            this.failCount++;
            this.violations.push(message);
        }
        if (type === 'warning') this.warnings.push(message);
    }

    // Testaa 404-sivun toimivuus
    async test404Page(page) {
        console.log('\n🚫 404 Error Page Testing');
        console.log('=========================');
        
        try {
            // Testaa 404-sivu
            const response = await page.goto('http://localhost:1313/non-existent-page', {
                waitUntil: 'networkidle0',
                timeout: 10000
            });
            
            if (response.status() === 404) {
                this.log('pass', '404-sivu palauttaa oikean HTTP-statuskoodin');
                
                // Tarkista että 404-sivu sisältää sisältöä
                const pageContent = await page.content();
                if (pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('Sivua ei löydy')) {
                    this.log('pass', '404-sivu sisältää asiallista sisältöä');
                } else {
                    this.log('fail', '404-sivu ei sisällä selkeää virheilmoitusta');
                }
                
                // Tarkista että navigaatio toimii 404-sivullakin
                const navigationExists = await page.$('nav') || await page.$('.menu') || await page.$('header');
                if (navigationExists) {
                    this.log('pass', '404-sivulla on navigaatio');
                } else {
                    this.log('warning', '404-sivulta puuttuu navigaatio');
                }
                
            } else {
                this.log('fail', `404-sivu palauttaa väärän statuskoodin: ${response.status()}`);
            }
            
        } catch (error) {
            this.log('fail', `404-sivun testaus epäonnistui: ${error.message}`);
        }
    }

    // Testaa rikkinäisten kuvien käsittely
    async testBrokenImages(page) {
        console.log('\n🖼️ Broken Image Handling');
        console.log('=======================');
        
        try {
            await page.goto('http://localhost:1313/', { waitUntil: 'networkidle0' });
            
            // Testaa kuvan lataus rikkinäisellä src:llä
            await page.evaluate(() => {
                const img = document.createElement('img');
                img.src = '/non-existent-image.jpg';
                img.alt = 'Test broken image';
                img.id = 'test-broken-image';
                document.body.appendChild(img);
            });
            
            // Odota hetki että kuva yrittää ladata
            await page.waitForTimeout(2000);
            
            // Tarkista miten rikkinäinen kuva käsitellään
            const brokenImageHandled = await page.evaluate(() => {
                const img = document.getElementById('test-broken-image');
                return img && (img.complete === false || img.naturalWidth === 0);
            });
            
            if (brokenImageHandled) {
                this.log('pass', 'Rikkinäiset kuvat tunnistetaan oikein');
            } else {
                this.log('warning', 'Rikkinäisten kuvien käsittely epäselvää');
            }
            
            // Testaa että WebP fallback toimii
            const webpSupported = await page.evaluate(() => {
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            });
            
            if (webpSupported) {
                this.log('info', 'Selain tukee WebP:tä');
            } else {
                this.log('info', 'Selain ei tue WebP:tä - fallback tarpeen');
            }
            
        } catch (error) {
            this.log('fail', `Rikkinäisten kuvien testaus epäonnistui: ${error.message}`);
        }
    }

    // Testaa offline-käyttäytyminen
    async testOfflineBehavior(page) {
        console.log('\n📡 Offline Behavior Testing');
        console.log('==========================');
        
        try {
            // Testaa normaalikäyttäytyminen ensin
            await page.goto('http://localhost:1313/', { waitUntil: 'networkidle0' });
            
            const onlineContent = await page.title();
            this.log('pass', `Sivusto latautuu normaalisti: "${onlineContent}"`);
            
            // Simuloi verkko-ongelmat (offline)
            await page.setOfflineMode(true);
            
            try {
                await page.goto('http://localhost:1313/about/', { 
                    waitUntil: 'networkidle0', 
                    timeout: 5000 
                });
                this.log('warning', 'Sivu latautui offline-tilassa - mahdollisesti cache');
            } catch (error) {
                this.log('pass', 'Offline-tila estetään oikein');
            }
            
            // Palauta verkkoyhteys
            await page.setOfflineMode(false);
            
            // Testaa että yhteys palaa
            await page.goto('http://localhost:1313/', { waitUntil: 'networkidle0' });
            const backOnlineTitle = await page.title();
            
            if (backOnlineTitle === onlineContent) {
                this.log('pass', 'Sivusto toipuu verkko-ongelmista');
            } else {
                this.log('warning', 'Sivuston toipuminen verkko-ongelmista epäselvää');
            }
            
        } catch (error) {
            this.log('fail', `Offline-testaus epäonnistui: ${error.message}`);
        }
    }

    // Testaa slow network simulation
    async testSlowNetwork(page) {
        console.log('\n🐌 Slow Network Simulation');
        console.log('==========================');
        
        try {
            // Simuloi hidasta verkkoyhteyttä
            const client = await page.target().createCDPSession();
            await client.send('Network.emulateNetworkConditions', {
                offline: false,
                downloadThroughput: 100 * 1024, // 100 KB/s
                uploadThroughput: 100 * 1024,
                latency: 2000 // 2s latency
            });
            
            const startTime = Date.now();
            
            try {
                await page.goto('http://localhost:1313/', { 
                    waitUntil: 'networkidle0', 
                    timeout: 15000 
                });
                
                const loadTime = Date.now() - startTime;
                
                if (loadTime > 5000) {
                    this.log('info', `Sivu latautui hitaassa verkossa: ${loadTime}ms`);
                } else {
                    this.log('pass', `Sivu latautuu nopeasti hitaassakin verkossa: ${loadTime}ms`);
                }
                
                // Tarkista että sisältö on käyttökelpoista
                const title = await page.title();
                if (title && title.length > 0) {
                    this.log('pass', 'Sisältö latautuu hitaassa verkossa');
                } else {
                    this.log('fail', 'Sisältö ei lataudu hitaassa verkossa');
                }
                
            } catch (error) {
                this.log('fail', `Sivusto ei toimi hitaassa verkossa: ${error.message}`);
            }
            
            // Palauta normaali verkko
            await client.send('Network.emulateNetworkConditions', {
                offline: false,
                downloadThroughput: -1,
                uploadThroughput: -1,
                latency: 0
            });
            
        } catch (error) {
            this.log('fail', `Hitaan verkon simulointi epäonnistui: ${error.message}`);
        }
    }

    // Testaa JavaScript-virheiden käsittely
    async testJavaScriptErrors(page) {
        console.log('\n💥 JavaScript Error Handling');
        console.log('============================');
        
        const jsErrors = [];
        
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });
        
        page.on('requestfailed', request => {
            if (request.url().endsWith('.js')) {
                jsErrors.push(`Failed to load JS: ${request.url()}`);
            }
        });
        
        try {
            await page.goto('http://localhost:1313/', { waitUntil: 'networkidle0' });
            
            // Odota mahdollisia JS-virheitä
            await page.waitForTimeout(3000);
            
            if (jsErrors.length === 0) {
                this.log('pass', 'Ei JavaScript-virheitä löydetty');
            } else {
                jsErrors.forEach(error => {
                    this.log('warning', `JavaScript-virhe: ${error}`);
                });
            }
            
            // Testaa että cookie-toiminnallisuus toimii vaikka olisi virheitä
            const cookieSystemWorks = await page.evaluate(() => {
                return typeof window.showBanner === 'function' || 
                       typeof window.enableAnalyticsAndSoundCloud === 'function';
            });
            
            if (cookieSystemWorks) {
                this.log('pass', 'Cookie-järjestelmä toimii');
            } else {
                this.log('fail', 'Cookie-järjestelmä ei toimi - kriittinen virhe');
            }
            
        } catch (error) {
            this.log('fail', `JavaScript-virheiden testaus epäonnistui: ${error.message}`);
        }
    }

    // Generoi raportti
    async generateReport() {
        console.log('\n📋 Error Handling Test Summary');
        console.log('==============================');
        
        const totalTests = this.passCount + this.failCount;
        const successRate = totalTests > 0 ? ((this.passCount / totalTests) * 100).toFixed(1) : 0;
        
        console.log(`Testejä yhteensä: ${totalTests}`);
        console.log(`\x1b[32mOnnistuneita: ${this.passCount}\x1b[0m`);
        console.log(`\x1b[31mEpäonnistuneita: ${this.failCount}\x1b[0m`);
        console.log(`\x1b[33mVaroituksia: ${this.warnings.length}\x1b[0m`);
        console.log(`Vikasietoisuus: ${successRate}%`);
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                passed: this.passCount,
                failed: this.failCount,
                warnings: this.warnings.length,
                resilience: `${successRate}%`
            },
            violations: this.violations,
            warnings: this.warnings,
            recommendations: [
                'Varmista että 404-sivu sisältää selkeän virheilmoituksen',
                'Lisää proper fallback-kuvat rikkinäisille kuville',
                'Testaa sivusto offline-tilassa säännöllisesti',
                'Optimoi latausaikoja hidaille verkkoyhteyksille',
                'Seuraa JavaScript-virheitä tuotannossa'
            ]
        };
        
        await fs.ensureDir('tests');
        await fs.writeJson('tests/error-handling-report.json', report, { spaces: 2 });
        
        return this.failCount === 0;
    }

    // Suorita kaikki testit
    async run() {
        console.log('💥 Aloitetaan virhekäsittelyn ja vikasietoisuuden testaus...\n');
        
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
        
        try {
            const page = await browser.newPage();
            
            // Aseta viewport
            await page.setViewport({ width: 1920, height: 1080 });
            
            // Suorita testit
            await this.test404Page(page);
            await this.testBrokenImages(page);
            await this.testOfflineBehavior(page);
            await this.testSlowNetwork(page);
            await this.testJavaScriptErrors(page);
            
        } catch (error) {
            this.log('fail', `Testien suoritus epäonnistui: ${error.message}`);
        } finally {
            await browser.close();
        }
        
        const success = await this.generateReport();
        
        if (success) {
            console.log('\n🎉 Vikasietoisuustestit onnistuivat!');
            console.log('✅ Sivusto käsittelee virhetilanteet hyvin');
            process.exit(0);
        } else {
            console.log('\n💥 Vikasietoisuusongelmia löydetty!');
            console.log('🔧 Tarkista epäonnistuneet testit ja paranna virhekäsittelyä');
            process.exit(1);
        }
    }
}

if (require.main === module) {
    new ErrorHandlingTester().run().catch(console.error);
}

module.exports = ErrorHandlingTester;