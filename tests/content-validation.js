#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const chalk = require('chalk');

// Test configuration
const config = {
  contentDir: 'content',
  publicDir: 'public',
  requiredPages: [
    '/',
    '/about/',
    '/soitossa/',
    '/posts/',
    '/yhteystiedot/'
  ],
  requiredContent: {
    '/': ['Icetribe', 'Tuomme klassikot tuoreella otteella nykypäivään!', 'bilebändi'],
    '/about/': ['Tampere', 'Icetribe on Tamperelainen pop ', 'jäsenet'],
    '/soitossa/': ['Soitossa', 'Alla näet esimerkkejä biiseistä, joita soitamme'],
    '/posts/': ['Kuulumiset', 'Icetribe'],
    '/yhteystiedot/': ['yhteystiedot', 'keikkavaraukset']
  },
  requiredStructure: {
    navigation: ['Etusivu', 'Bändi', 'Biisit', 'Kuulumiset', 'Yhteystiedot'],
    social: ['facebook', 'instagram', 'soundcloud']
  }
};

class ContentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    if (type === 'error') {
      this.errors.push(`[${timestamp}] ${message}`);
      console.log(chalk.red(`❌ ${message}`));
    } else if (type === 'warning') {
      this.warnings.push(`[${timestamp}] ${message}`);
      console.log(chalk.yellow(`⚠️  ${message}`));
    } else {
      this.passed.push(`[${timestamp}] ${message}`);
      console.log(chalk.green(`✅ ${message}`));
    }
  }

  async validateHugoBuild() {
    console.log(chalk.blue('\n🔧 Validating Hugo build...'));
    
    if (!fs.existsSync(config.publicDir)) {
      this.log('error', 'Public directory not found - Hugo build failed');
      return false;
    }

    const indexExists = fs.existsSync(path.join(config.publicDir, 'index.html'));
    if (!indexExists) {
      this.log('error', 'index.html not generated');
      return false;
    }

    this.log('pass', 'Hugo build successful');
    return true;
  }

  async validatePages() {
    console.log(chalk.blue('\n📄 Validating required pages...'));
    
    for (const pagePath of config.requiredPages) {
      const filePath = pagePath === '/' 
        ? path.join(config.publicDir, 'index.html')
        : path.join(config.publicDir, pagePath, 'index.html');
      
      if (fs.existsSync(filePath)) {
        this.log('pass', `Page exists: ${pagePath}`);
        await this.validatePageContent(pagePath, filePath);
      } else {
        this.log('error', `Missing page: ${pagePath}`);
      }
    }
  }

  async validatePageContent(pagePath, filePath) {
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    
    // Check required content
    if (config.requiredContent[pagePath]) {
      for (const content of config.requiredContent[pagePath]) {
        const found = html.toLowerCase().includes(content.toLowerCase());
        if (found) {
          this.log('pass', `Content found on ${pagePath}: "${content}"`);
        } else {
          this.log('error', `Missing content on ${pagePath}: "${content}"`);
        }
      }
    }

    // Check page structure
    const title = $('title').text();
    const h1 = $('h1').length;
    
    if (!title) {
      this.log('error', `Missing title on ${pagePath}`);
    } else {
      this.log('pass', `Page has title: ${pagePath}`);
    }

    if (h1 === 0) {
      this.log('warning', `No H1 tag found on ${pagePath}`);
    }
  }

  async validateNavigation() {
    console.log(chalk.blue('\n🧭 Validating navigation...'));
    
    const indexPath = path.join(config.publicDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
      this.log('error', 'Cannot validate navigation - index.html missing');
      return;
    }

    const html = fs.readFileSync(indexPath, 'utf8');
    const $ = cheerio.load(html);
    
    for (const navItem of config.requiredStructure.navigation) {
      const found = html.includes(navItem);
      if (found) {
        this.log('pass', `Navigation item found: ${navItem}`);
      } else {
        this.log('error', `Missing navigation item: ${navItem}`);
      }
    }
  }

  async validateSocialMedia() {
    console.log(chalk.blue('\n📱 Validating social media links...'));
    
    const indexPath = path.join(config.publicDir, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8');
    
    for (const social of config.requiredStructure.social) {
      const found = html.toLowerCase().includes(social);
      if (found) {
        this.log('pass', `Social media link found: ${social}`);
      } else {
        this.log('warning', `Social media link missing: ${social}`);
      }
    }
  }

  async validateQuoteBlocks() {
    console.log(chalk.blue('\n💬 Validating quote blocks...'));
    
    const postsDir = path.join(config.publicDir, 'posts');
    if (!fs.existsSync(postsDir)) {
      this.log('warning', 'Posts directory not found');
      return;
    }

    // Check if quote shortcode CSS is loaded
    const indexPath = path.join(config.publicDir, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8');
    
    if (html.includes('quote-block.css') || html.includes('.quote-block')) {
      this.log('pass', 'Quote block CSS found');
    } else {
      this.log('error', 'Quote block CSS not loaded');
    }
  }

  async validateImages() {
    console.log(chalk.blue('\n🖼️  Validating images...'));
    
    const imagesDir = path.join('static', 'images');
    if (!fs.existsSync(imagesDir)) {
      this.log('error', 'Images directory not found');
      return;
    }

    const requiredImages = [
      'cover_index.jpg',
      'cover_about.jpg', 
      'cover_soitossa.jpg',
      'cover_posts.jpg',
      'cover_yhteystiedot.jpg'
    ];

    for (const img of requiredImages) {
      const imgPath = path.join(imagesDir, img);
      if (fs.existsSync(imgPath)) {
        this.log('pass', `Cover image found: ${img}`);
      } else {
        this.log('error', `Missing cover image: ${img}`);
      }
    }
  }

  async validateResponsiveness() {
    console.log(chalk.blue('\n📱 Validating responsive design...'));
    
    const indexPath = path.join(config.publicDir, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf8');
    const $ = cheerio.load(html);
    
    // Check for viewport meta tag
    const viewport = $('meta[name="viewport"]').length;
    if (viewport > 0) {
      this.log('pass', 'Viewport meta tag found');
    } else {
      this.log('error', 'Missing viewport meta tag');
    }

    // Check for responsive classes (Tachyons)
    const responsiveClasses = ['flex-l', 'w-100', 'w-55-l', 'w-40-l'];
    let foundResponsive = false;
    
    for (const className of responsiveClasses) {
      if (html.includes(className)) {
        foundResponsive = true;
        break;
      }
    }

    if (foundResponsive) {
      this.log('pass', 'Responsive CSS classes found');
    } else {
      this.log('warning', 'No responsive CSS classes detected');
    }
  }

  async generateReport() {
    console.log(chalk.blue('\n📊 Test Summary:'));
    console.log(chalk.green(`✅ Passed: ${this.passed.length}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${this.warnings.length}`));
    console.log(chalk.red(`❌ Errors: ${this.errors.length}`));

    const reportPath = 'tests/content-validation-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.passed.length,
        warnings: this.warnings.length,
        errors: this.errors.length,
        success: this.errors.length === 0
      },
      details: {
        passed: this.passed,
        warnings: this.warnings,
        errors: this.errors
      }
    };

    await fs.writeJson(reportPath, report, { spaces: 2 });
    this.log('pass', `Report saved to ${reportPath}`);

    return this.errors.length === 0;
  }

  async run() {
    console.log(chalk.blue('🧪 Starting content validation tests...\n'));
    
    const buildSuccess = await this.validateHugoBuild();
    if (!buildSuccess) {
      console.log(chalk.red('\n💥 Hugo build validation failed - stopping tests'));
      process.exit(1);
    }

    await this.validatePages();
    await this.validateNavigation();
    await this.validateSocialMedia();
    await this.validateQuoteBlocks();
    await this.validateImages();
    await this.validateResponsiveness();

    const success = await this.generateReport();
    
    if (success) {
      console.log(chalk.green('\n🎉 All content validation tests passed!'));
      process.exit(0);
    } else {
      console.log(chalk.red('\n💥 Content validation tests failed!'));
      process.exit(1);
    }
  }
}

// Run tests
if (require.main === module) {
  new ContentValidator().run().catch(console.error);
}

module.exports = ContentValidator;