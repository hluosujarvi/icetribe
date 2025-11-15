#!/usr/bin/env node

const puppeteer = require('puppeteer');
const chalk = require('chalk');
const fs = require('fs-extra');

class AccessibilityTester {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.testPages = [
      { name: 'Etusivu', url: 'http://localhost:1313/' },
      { name: 'Tietoa', url: 'http://localhost:1313/about/' },
      { name: 'Soitossa', url: 'http://localhost:1313/soitossa/' },
      { name: 'Kuulumiset', url: 'http://localhost:1313/posts/' },
      { name: 'Yhteystiedot', url: 'http://localhost:1313/yhteystiedot/' }
    ];
  }

  log(type, message) {
    if (type === 'error') {
      this.violations.push(message);
      console.log(chalk.red(`❌ ${message}`));
    } else if (type === 'warning') {
      this.warnings.push(message);
      console.log(chalk.yellow(`⚠️  ${message}`));
    } else {
      console.log(chalk.green(`✅ ${message}`));
    }
  }

  async testPageAccessibility(page, pageInfo) {
    console.log(chalk.blue(`\n♿ Testing accessibility: ${pageInfo.name}`));
    
    try {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle0' });
      
      // Test 1: Alt text for images
      const imageIssues = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        const issues = [];
        
        images.forEach((img, index) => {
          if (!img.alt && !img.getAttribute('role') === 'presentation') {
            issues.push(`Image ${index + 1}: Missing alt text`);
          }
        });
        
        return issues;
      });

      if (imageIssues.length === 0) {
        this.log('pass', `${pageInfo.name}: All images have alt text`);
      } else {
        imageIssues.forEach(issue => this.log('error', `${pageInfo.name}: ${issue}`));
      }

      // Test 2: Heading hierarchy
      const headingIssues = await page.evaluate(() => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const issues = [];
        let previousLevel = 0;
        
        headings.forEach((heading, index) => {
          const level = parseInt(heading.tagName.charAt(1));
          
          if (index === 0 && level !== 1) {
            issues.push('First heading should be h1');
          }
          
          if (level > previousLevel + 1) {
            issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
          }
          
          previousLevel = level;
        });
        
        return issues;
      });

      if (headingIssues.length === 0) {
        this.log('pass', `${pageInfo.name}: Proper heading hierarchy`);
      } else {
        headingIssues.forEach(issue => this.log('warning', `${pageInfo.name}: ${issue}`));
      }

      // Test 3: Links with descriptive text
      const linkIssues = await page.evaluate(() => {
        const links = document.querySelectorAll('a[href]');
        const issues = [];
        const genericTexts = ['click here', 'read more', 'here', 'more', 'link'];
        
        links.forEach((link, index) => {
          const text = link.textContent.trim().toLowerCase();
          const ariaLabel = link.getAttribute('aria-label');
          const title = link.getAttribute('title');
          
          if (!text && !ariaLabel && !title) {
            issues.push(`Link ${index + 1}: No accessible text`);
          } else if (genericTexts.includes(text) && !ariaLabel && !title) {
            issues.push(`Link ${index + 1}: Generic link text "${text}"`);
          }
        });
        
        return issues;
      });

      if (linkIssues.length === 0) {
        this.log('pass', `${pageInfo.name}: All links have descriptive text`);
      } else {
        linkIssues.forEach(issue => this.log('warning', `${pageInfo.name}: ${issue}`));
      }

      // Test 4: Form labels
      const formIssues = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input:not([type="submit"]):not([type="button"]), textarea, select');
        const issues = [];
        
        inputs.forEach((input, index) => {
          const id = input.id;
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledby = input.getAttribute('aria-labelledby');
          const placeholder = input.getAttribute('placeholder');
          
          let hasLabel = false;
          
          if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            hasLabel = !!label;
          }
          
          if (!hasLabel && !ariaLabel && !ariaLabelledby) {
            issues.push(`Form field ${index + 1}: No accessible label (placeholder-only labels are insufficient)`);
          }
        });
        
        return issues;
      });

      if (formIssues.length === 0) {
        this.log('pass', `${pageInfo.name}: Form fields properly labeled`);
      } else {
        formIssues.forEach(issue => this.log('error', `${pageInfo.name}: ${issue}`));
      }

      // Test 5: Color contrast (basic check)
      const contrastIssues = await page.evaluate(() => {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span');
        const issues = [];
        
        textElements.forEach((element, index) => {
          const styles = window.getComputedStyle(element);
          const color = styles.color;
          const backgroundColor = styles.backgroundColor;
          
          // Basic check for very light text on light backgrounds (simplified)
          if (color.includes('rgb(255, 255, 255)') && 
              (backgroundColor.includes('rgb(255, 255, 255)') || backgroundColor === 'rgba(0, 0, 0, 0)')) {
            issues.push(`Element ${index + 1}: Potential contrast issue - white text on light background`);
          }
        });
        
        return issues.slice(0, 5); // Limit to prevent spam
      });

      if (contrastIssues.length === 0) {
        this.log('pass', `${pageInfo.name}: No obvious contrast issues detected`);
      } else {
        contrastIssues.forEach(issue => this.log('warning', `${pageInfo.name}: ${issue}`));
      }

      // Test 6: Keyboard navigation
      await page.keyboard.press('Tab');
      const focusableElements = await page.evaluate(() => {
        const focusables = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        return focusables.length;
      });

      if (focusableElements > 0) {
        this.log('pass', `${pageInfo.name}: ${focusableElements} focusable elements for keyboard navigation`);
      } else {
        this.log('warning', `${pageInfo.name}: No focusable elements detected`);
      }

    } catch (error) {
      this.log('error', `${pageInfo.name}: Failed to test accessibility - ${error.message}`);
    }
  }

  async generateReport() {
    console.log(chalk.blue('\n♿ Accessibility Test Summary:'));
    
    const totalViolations = this.violations.length;
    const totalWarnings = this.warnings.length;
    
    console.log(chalk.cyan(`Pages tested: ${this.testPages.length}`));
    console.log(chalk.red(`Violations (WCAG failures): ${totalViolations}`));
    console.log(chalk.yellow(`Warnings (improvements): ${totalWarnings}`));

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        pagesТested: this.testPages.length,
        violations: totalViolations,
        warnings: totalWarnings,
        accessibilityScore: totalViolations === 0 ? 'Good' : totalViolations <= 5 ? 'Fair' : 'Poor'
      },
      violations: this.violations,
      warnings: this.warnings,
      recommendations: [
        'Ensure all images have descriptive alt text',
        'Maintain proper heading hierarchy (h1 -> h2 -> h3)',
        'Use descriptive link text instead of "click here"',
        'Provide proper labels for all form fields',
        'Test with screen readers and keyboard-only navigation',
        'Verify color contrast meets WCAG AA standards (4.5:1 ratio)'
      ]
    };

    const reportPath = 'tests/accessibility-report.json';
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    return totalViolations === 0;
  }

  async run() {
    console.log(chalk.blue('♿ Starting accessibility tests...\n'));
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
      const page = await browser.newPage();
      
      // Enable accessibility
      await page.setBypassCSP(true);
      
      for (const pageInfo of this.testPages) {
        await this.testPageAccessibility(page, pageInfo);
      }
      
    } catch (error) {
      this.log('error', `Accessibility test failed: ${error.message}`);
    } finally {
      await browser.close();
    }

    const success = await this.generateReport();
    
    if (success) {
      console.log(chalk.green('\n🎉 Accessibility tests passed!'));
      process.exit(0);
    } else {
      console.log(chalk.red('\n💥 Accessibility violations found!'));
      process.exit(1);
    }
  }
}

if (require.main === module) {
  new AccessibilityTester().run().catch(console.error);
}

module.exports = AccessibilityTester;