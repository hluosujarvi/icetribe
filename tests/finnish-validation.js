#!/usr/bin/env node

// Icetribe Finnish Language Validation Suite
// Testaa suomen kielen oikeinkirjoitusta ja formaatteja
// Version: 1.0

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FinnishValidator {
    constructor() {
        this.violations = [];
        this.warnings = [];
        this.passCount = 0;
        this.failCount = 0;
        this.totalTests = 0;
        
        // Suomen kielen yleisiä virheitä
        this.commonMistakes = [
            { pattern: /\bsivustolla\b/gi, correct: 'sivustolla', wrong: 'sivustolla' },
            { pattern: /\byhteyteen\b/gi, correct: 'yhteyteen', wrong: 'yhteyteen' },
            { pattern: /\bkeikkavaraukset\b/gi, correct: 'keikkavaraukset', wrong: 'keikkavaraukset' }
        ];
        
        // Oikeat päivämääräformaatit
        this.dateFormats = [
            { pattern: /^\d{4}-\d{2}-\d{2}$/, name: 'Hugo ISO date (YYYY-MM-DD)' },
            { pattern: /^\d{1,2}\.\d{1,2}\.\d{4}$/, name: 'Finnish date (DD.MM.YYYY)' }
        ];
        
        // Suomalaiset erikoismerkit
        this.finnishChars = /[äöåÄÖÅ]/;
    }

    log(type, message) {
        const timestamp = new Date().toLocaleString('fi-FI');
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
        
        this.totalTests++;
    }

    // Testaa sisältötiedostojen suomen kieltä
    async validateFinnishContent() {
        console.log('\n🇫🇮 Suomen kielen sisällön validointi');
        console.log('===================================');
        
        const contentFiles = this.findContentFiles();
        
        for (const file of contentFiles) {
            try {
                const content = fs.readFileSync(file, 'utf-8');
                await this.validateFileContent(file, content);
            } catch (error) {
                this.log('fail', `Tiedoston lukeminen epäonnistui: ${file} - ${error.message}`);
            }
        }
    }

    // Testaa päivämääräformaatteja
    async validateDateFormats() {
        console.log('\n📅 Päivämääräformaattien validointi');
        console.log('==================================');
        
        const contentFiles = this.findContentFiles();
        
        for (const file of contentFiles) {
            try {
                const content = fs.readFileSync(file, 'utf-8');
                this.validateDatesInFile(file, content);
            } catch (error) {
                this.log('fail', `Päivämäärävalidointi epäonnistui: ${file}`);
            }
        }
    }

    // Testaa Hugo-konfiguraation suomalaisia asetuksia
    async validateHugoConfig() {
        console.log('\n⚙️ Hugo-konfiguraation suomi-asetukset');
        console.log('=====================================');
        
        try {
            const configContent = fs.readFileSync('hugo.toml', 'utf-8');
            
            // Tarkista kieliasetukset
            if (configContent.includes('languageCode = \'fi\'') || configContent.includes('languageCode = "fi"')) {
                this.log('pass', 'Kielikoodi asetettu suomeksi (fi)');
            } else {
                this.log('fail', 'Kielikoodi ei ole asetettu suomeksi');
            }
            
            // Tarkista aikavyöhyke
            if (configContent.includes('Europe/Helsinki')) {
                this.log('pass', 'Aikavyöhyke asetettu Helsinkiin');
            } else {
                this.log('warning', 'Aikavyöhyke ei ole asetettu Europe/Helsinki');
            }
            
            // Tarkista suomalaiset menu-nimet
            const finnishMenuTerms = ['Etusivu', 'Tietoa', 'Soitossa', 'Uutiset', 'Yhteystiedot'];
            let finnishMenusFound = 0;
            
            finnishMenuTerms.forEach(term => {
                if (configContent.includes(term)) {
                    finnishMenusFound++;
                }
            });
            
            if (finnishMenusFound >= 3) {
                this.log('pass', `Suomalaisia menu-termejä löydetty: ${finnishMenusFound}/5`);
            } else {
                this.log('warning', `Vähän suomalaisia menu-termejä: ${finnishMenusFound}/5`);
            }
            
        } catch (error) {
            this.log('fail', 'Hugo.toml -tiedoston lukeminen epäonnistui');
        }
    }

    // Testaa yksittäisen tiedoston sisältöä
    async validateFileContent(filePath, content) {
        const fileName = path.basename(filePath);
        
        // Tarkista että sisällössä on suomalaisia merkkejä
        if (this.finnishChars.test(content)) {
            this.log('pass', `${fileName}: Sisältää suomalaisia erikoismerkkejä (ä, ö, å)`);
        } else {
            this.log('warning', `${fileName}: Ei suomalaisia erikoismerkkejä - tarkista kieli`);
        }
        
        // Tarkista yleisiä suomen kielen virheitä
        this.commonMistakes.forEach(mistake => {
            const matches = content.match(mistake.pattern);
            if (matches && matches.length > 0) {
                this.log('info', `${fileName}: ${matches.length} potentiaalista kielihuomiota`);
            }
        });
        
        // Tarkista että sisältö ei ole englantia
        const englishIndicators = ['the ', 'and ', 'or ', 'but ', 'with ', 'about '];
        let englishScore = 0;
        
        englishIndicators.forEach(indicator => {
            const matches = content.toLowerCase().match(new RegExp(indicator, 'g'));
            if (matches) englishScore += matches.length;
        });
        
        if (englishScore > 5) {
            this.log('warning', `${fileName}: Paljon englanninkielisiä sanoja (${englishScore}) - tarkista kieli`);
        } else {
            this.log('pass', `${fileName}: Pääasiassa suomenkielistä sisältöä`);
        }
        
        // Tarkista suomalaiset lainausmerkit
        if (content.includes('"') && !content.includes('\"')) {
            this.log('info', `${fileName}: Käyttää kansainvälisiä lainausmerkkejä (")`);
        }
    }

    // Validoi päivämäärät tiedostossa
    validateDatesInFile(filePath, content) {
        const fileName = path.basename(filePath);
        
        // Front matter -päivämäärät
        const frontMatterMatch = content.match(/^\+\+\+([\s\S]*?)\+\+\+/);
        if (frontMatterMatch) {
            const frontMatter = frontMatterMatch[1];
            const dateMatch = frontMatter.match(/date\s*=\s*['"](.*?)['"]/);
            
            if (dateMatch) {
                const dateStr = dateMatch[1];
                const isValidISODate = this.dateFormats[0].pattern.test(dateStr);
                
                if (isValidISODate) {
                    this.log('pass', `${fileName}: Päivämäärä oikeassa ISO-formaatissa (${dateStr})`);
                } else {
                    this.log('fail', `${fileName}: Päivämäärä väärässä formaatissa (${dateStr})`);
                }
            }
        }
        
        // Sisällön päivämäärät (suomalainen formaatti)
        const finnishDates = content.match(/\d{1,2}\.\d{1,2}\.\d{4}/g);
        if (finnishDates) {
            let validFinnishDates = 0;
            finnishDates.forEach(date => {
                if (this.dateFormats[1].pattern.test(date)) {
                    validFinnishDates++;
                }
            });
            
            if (validFinnishDates > 0) {
                this.log('pass', `${fileName}: ${validFinnishDates} suomalaista päivämääräformaattia löydetty`);
            }
        }
    }

    // Etsi kaikki sisältötiedostot
    findContentFiles() {
        const files = [];
        const scanDir = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            const entries = fs.readdirSync(dir);
            for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDir(fullPath);
                } else if (entry.endsWith('.md')) {
                    files.push(fullPath);
                }
            }
        };
        
        scanDir('content');
        return files;
    }

    // Luo raportti
    async generateReport() {
        console.log('\n📋 Suomen kielen validoinnin yhteenveto');
        console.log('======================================');
        
        const totalTests = this.passCount + this.failCount;
        const successRate = totalTests > 0 ? ((this.passCount / totalTests) * 100).toFixed(1) : 0;
        
        console.log(`Testejä yhteensä: ${totalTests}`);
        console.log(`\x1b[32mOnnistuneita: ${this.passCount}\x1b[0m`);
        console.log(`\x1b[31mEpäonnistuneita: ${this.failCount}\x1b[0m`);
        console.log(`\x1b[33mVaroituksia: ${this.warnings.length}\x1b[0m`);
        console.log(`Onnistumisprosentti: ${successRate}%`);
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                passed: this.passCount,
                failed: this.failCount,
                warnings: this.warnings.length,
                successRate: `${successRate}%`
            },
            violations: this.violations,
            warnings: this.warnings
        };
        
        fs.writeFileSync('tests/finnish-validation-report.json', JSON.stringify(report, null, 2));
        
        return this.failCount === 0;
    }

    // Suorita kaikki testit
    async run() {
        console.log('🇫🇮 Aloitetaan suomen kielen validointi...\n');
        
        try {
            await this.validateHugoConfig();
            await this.validateFinnishContent();
            await this.validateDateFormats();
            
            const success = await this.generateReport();
            
            if (success) {
                console.log('\n🎉 Suomen kielen validointi onnistui!');
                console.log('✅ Sisältö on pääasiassa kelvollista suomea');
                process.exit(0);
            } else {
                console.log('\n💥 Kieliongelmia löydetty!');
                console.log('🔧 Tarkista epäonnistuneet testit ja korjaa ongelmat');
                process.exit(1);
            }
        } catch (error) {
            console.error(`Validointivirhe: ${error.message}`);
            process.exit(1);
        }
    }
}

if (require.main === module) {
    // Varmista että tests-hakemisto on olemassa
    if (!fs.existsSync('tests')) {
        fs.mkdirSync('tests');
    }
    
    new FinnishValidator().run().catch(console.error);
}

module.exports = FinnishValidator;