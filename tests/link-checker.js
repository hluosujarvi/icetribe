#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const chalk = require('chalk');

class LinkChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
    this.checkedLinks = new Set();
  }

  log(type, message) {
    if (type === 'error') {
      this.errors.push(message);
      console.log(chalk.red(`❌ ${message}`));
    } else if (type === 'warning') {
      this.warnings.push(message);
      console.log(chalk.yellow(`⚠️  ${message}`));
    } else {
      this.passed.push(message);
      console.log(chalk.green(`✅ ${message}`));
    }
  }

  async findAllHtmlFiles() {
    const glob = require('glob');
    return new Promise((resolve, reject) => {
      glob('public/**/*.html', (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
  }

  async checkInternalLinks() {
    console.log(chalk.blue('\n🔗 Checking internal links...'));
    
    const htmlFiles = await this.findAllHtmlFiles();
    const internalLinks = new Set();
    
    // Collect all internal links
    for (const file of htmlFiles) {
      const html = fs.readFileSync(file, 'utf8');
      const $ = cheerio.load(html);
      
      $('a[href]').each((i, link) => {
        const href = $(link).attr('href');
        if (href && this.isInternalLink(href)) {
          internalLinks.add(href);
        }
      });
    }

    // Check each internal link
    for (const link of internalLinks) {
      await this.validateInternalLink(link);
    }
  }

  isInternalLink(href) {
    return href.startsWith('/') && 
           !href.startsWith('//') && 
           !href.startsWith('http') &&
           !href.includes('mailto:');
  }

  async validateInternalLink(link) {
    if (this.checkedLinks.has(link)) return;
    this.checkedLinks.add(link);

    // Convert link to file path
    let filePath;
    if (link === '/') {
      filePath = path.join('public', 'index.html');
    } else if (link.endsWith('/')) {
      filePath = path.join('public', link, 'index.html');
    } else if (link.includes('#')) {
      // Handle anchor links
      const [pathPart] = link.split('#');
      filePath = pathPart === '' 
        ? path.join('public', 'index.html')
        : path.join('public', pathPart, 'index.html');
    } else {
      filePath = path.join('public', link);
    }

    if (fs.existsSync(filePath)) {
      this.log('pass', `Internal link valid: ${link}`);
      
      // Check for anchor if present
      if (link.includes('#')) {
        await this.validateAnchor(link, filePath);
      }
    } else {
      this.log('error', `Broken internal link: ${link} (${filePath})`);
    }
  }

  async validateAnchor(link, filePath) {
    const [, anchor] = link.split('#');
    if (!anchor) return;

    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    
    // Check for id or name attribute
    const hasAnchor = $(`#${anchor}, [name="${anchor}"]`).length > 0;
    
    if (hasAnchor) {
      this.log('pass', `Anchor found: ${link}`);
    } else {
      this.log('warning', `Anchor not found: ${link}#${anchor}`);
    }
  }

  async checkNavigation() {
    console.log(chalk.blue('\n🧭 Checking navigation consistency...'));
    
    const htmlFiles = await this.findAllHtmlFiles();
    const navStructures = new Map();
    
    for (const file of htmlFiles) {
      const html = fs.readFileSync(file, 'utf8');
      const $ = cheerio.load(html);
      
      // Extract navigation links
      const navLinks = [];
      $('nav a, .menu a, header a').each((i, link) => {
        const href = $(link).attr('href');
        const text = $(link).text().trim();
        if (href && text) {
          navLinks.push({ href, text });
        }
      });
      
      navStructures.set(file, navLinks);
    }

    // Check consistency
    const firstNav = Array.from(navStructures.values())[0];
    let consistent = true;
    
    for (const [file, nav] of navStructures) {
      if (nav.length !== firstNav.length) {
        this.log('warning', `Navigation length differs in ${file}`);
        consistent = false;
      }
    }

    if (consistent) {
      this.log('pass', 'Navigation structure consistent across pages');
    }
  }

  async checkImageSources() {
    console.log(chalk.blue('\n🖼️  Checking image sources...'));
    
    const htmlFiles = await this.findAllHtmlFiles();
    
    for (const file of htmlFiles) {
      const html = fs.readFileSync(file, 'utf8');
      const $ = cheerio.load(html);
      
      $('img[src]').each((i, img) => {
        const src = $(img).attr('src');
        if (src && this.isInternalLink(src)) {
          const imgPath = path.join('public', src);
          if (fs.existsSync(imgPath)) {
            this.log('pass', `Image found: ${src}`);
          } else {
            this.log('error', `Missing image: ${src}`);
          }
        }
      });
    }
  }

  async checkSocialLinks() {
    console.log(chalk.blue('\n📱 Checking social media links...'));
    
    const socialDomains = [
      'facebook.com',
      'instagram.com', 
      'soundcloud.com',
      'twitter.com',
      'youtube.com'
    ];

    const indexPath = path.join('public', 'index.html');
    if (!fs.existsSync(indexPath)) {
      this.log('error', 'Cannot check social links - index.html missing');
      return;
    }

    const html = fs.readFileSync(indexPath, 'utf8');
    const $ = cheerio.load(html);
    
    $('a[href]').each((i, link) => {
      const href = $(link).attr('href');
      if (href && socialDomains.some(domain => href.includes(domain))) {
        this.log('pass', `Social link found: ${href}`);
      }
    });
  }

  async generateReport() {
    console.log(chalk.blue('\n📊 Link Check Summary:'));
    console.log(chalk.green(`✅ Passed: ${this.passed.length}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${this.warnings.length}`));
    console.log(chalk.red(`❌ Errors: ${this.errors.length}`));

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

    const reportPath = 'tests/link-check-report.json';
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    return this.errors.length === 0;
  }

  async run() {
    console.log(chalk.blue('🔗 Starting link validation tests...\n'));
    
    await this.checkInternalLinks();
    await this.checkNavigation();
    await this.checkImageSources();
    await this.checkSocialLinks();

    const success = await this.generateReport();
    
    if (success) {
      console.log(chalk.green('\n🎉 All link validation tests passed!'));
      process.exit(0);
    } else {
      console.log(chalk.red('\n💥 Link validation tests failed!'));
      process.exit(1);
    }
  }
}

if (require.main === module) {
  new LinkChecker().run().catch(console.error);
}

module.exports = LinkChecker;