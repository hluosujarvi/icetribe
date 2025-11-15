#!/usr/bin/env node

const puppeteer = require('puppeteer');
const chalk = require('chalk');
const fs = require('fs-extra');

class PerformanceTester {
  constructor() {
    this.results = [];
    this.errors = [];
    this.testPages = [
      { name: 'Homepage', url: 'http://localhost:1313/' },
      { name: 'About', url: 'http://localhost:1313/about/' },
      { name: 'Biisit', url: 'http://localhost:1313/soitossa/' },
      { name: 'Kuulumiset', url: 'http://localhost:1313/posts/' },
      { name: 'Yhteystiedot', url: 'http://localhost:1313/yhteystiedot/' }
    ];
    this.thresholds = {
      firstContentfulPaint: 2000, // 2s
      largestContentfulPaint: 4000, // 4s
      cumulativeLayoutShift: 0.1,
      firstInputDelay: 100, // 100ms
      totalBlockingTime: 300 // 300ms
    };
  }

  log(type, message) {
    if (type === 'error') {
      this.errors.push(message);
      console.log(chalk.red(`❌ ${message}`));
    } else if (type === 'warning') {
      console.log(chalk.yellow(`⚠️  ${message}`));
    } else {
      console.log(chalk.green(`✅ ${message}`));
    }
  }

  async testPagePerformance(page, pageInfo) {
    console.log(chalk.blue(`\n🔍 Testing: ${pageInfo.name}`));
    
    try {
      // Enable performance monitoring
      await page.setCacheEnabled(false);
      
      // Navigate and measure
      const startTime = Date.now();
      
      await page.goto(pageInfo.url, { 
        waitUntil: 'networkidle0',
        timeout: 10000 
      });
      
      const loadTime = Date.now() - startTime;
      
      // Get Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const vitals = {};
            
            entries.forEach((entry) => {
              if (entry.entryType === 'paint') {
                if (entry.name === 'first-contentful-paint') {
                  vitals.firstContentfulPaint = entry.startTime;
                }
              }
              if (entry.entryType === 'largest-contentful-paint') {
                vitals.largestContentfulPaint = entry.startTime;
              }
              if (entry.entryType === 'layout-shift') {
                if (!vitals.cumulativeLayoutShift) {
                  vitals.cumulativeLayoutShift = 0;
                }
                vitals.cumulativeLayoutShift += entry.value;
              }
            });
            
            // Resolve after short delay to collect metrics
            setTimeout(() => resolve(vitals), 1000);
          });
          
          observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
        });
      });

      // Lighthouse-style metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalSize: navigation.transferSize || 0,
          resourceCount: performance.getEntriesByType('resource').length
        };
      });

      const result = {
        page: pageInfo.name,
        url: pageInfo.url,
        loadTime,
        metrics: {
          ...metrics,
          ...performanceMetrics
        },
        timestamp: new Date().toISOString()
      };

      this.results.push(result);
      this.validateMetrics(result);
      
      return result;
      
    } catch (error) {
      this.log('error', `Failed to test ${pageInfo.name}: ${error.message}`);
      return null;
    }
  }

  validateMetrics(result) {
    const { metrics } = result;
    
    // Check FCP
    if (metrics.firstContentfulPaint) {
      if (metrics.firstContentfulPaint <= this.thresholds.firstContentfulPaint) {
        this.log('pass', `${result.page}: FCP ${metrics.firstContentfulPaint.toFixed(0)}ms (Good)`);
      } else {
        this.log('warning', `${result.page}: FCP ${metrics.firstContentfulPaint.toFixed(0)}ms (Slow)`);
      }
    }

    // Check LCP  
    if (metrics.largestContentfulPaint) {
      if (metrics.largestContentfulPaint <= this.thresholds.largestContentfulPaint) {
        this.log('pass', `${result.page}: LCP ${metrics.largestContentfulPaint.toFixed(0)}ms (Good)`);
      } else {
        this.log('warning', `${result.page}: LCP ${metrics.largestContentfulPaint.toFixed(0)}ms (Slow)`);
      }
    }

    // Check CLS
    if (metrics.cumulativeLayoutShift !== undefined) {
      if (metrics.cumulativeLayoutShift <= this.thresholds.cumulativeLayoutShift) {
        this.log('pass', `${result.page}: CLS ${metrics.cumulativeLayoutShift.toFixed(3)} (Good)`);
      } else {
        this.log('warning', `${result.page}: CLS ${metrics.cumulativeLayoutShift.toFixed(3)} (Poor)`);
      }
    }

    // Check load time
    if (result.loadTime <= 3000) {
      this.log('pass', `${result.page}: Load time ${result.loadTime}ms (Fast)`);
    } else {
      this.log('warning', `${result.page}: Load time ${result.loadTime}ms (Slow)`);
    }

    // Check resource count
    if (metrics.resourceCount <= 50) {
      this.log('pass', `${result.page}: ${metrics.resourceCount} resources (Optimal)`);
    } else {
      this.log('warning', `${result.page}: ${metrics.resourceCount} resources (Many)`);
    }
  }

  async testResponsiveness(page) {
    console.log(chalk.blue('\n📱 Testing responsive design...'));
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.goto('http://localhost:1313/', { waitUntil: 'networkidle0' });
      
      // Check if content is visible and accessible
      const contentVisible = await page.evaluate(() => {
        const body = document.body;
        const content = document.querySelector('main, article, .content');
        return {
          bodyVisible: body.offsetWidth > 0 && body.offsetHeight > 0,
          contentVisible: content ? content.offsetWidth > 0 && content.offsetHeight > 0 : true,
          hasOverflow: body.scrollWidth > body.clientWidth
        };
      });

      if (contentVisible.bodyVisible && contentVisible.contentVisible) {
        this.log('pass', `${viewport.name} (${viewport.width}x${viewport.height}): Content visible`);
      } else {
        this.log('error', `${viewport.name}: Content not properly visible`);
      }
    }
  }

  async generateReport() {
    console.log(chalk.blue('\n📊 Performance Test Summary:'));
    
    if (this.results.length > 0) {
      const avgLoadTime = this.results.reduce((sum, r) => sum + r.loadTime, 0) / this.results.length;
      console.log(chalk.cyan(`Average load time: ${avgLoadTime.toFixed(0)}ms`));
      
      const totalResources = this.results.reduce((sum, r) => sum + (r.metrics.resourceCount || 0), 0);
      console.log(chalk.cyan(`Total resources tested: ${totalResources}`));
    }

    console.log(chalk.yellow(`⚠️  Warnings: ${this.results.filter(r => r.loadTime > 3000).length}`));
    console.log(chalk.red(`❌ Errors: ${this.errors.length}`));

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        pagesТested: this.results.length,
        errors: this.errors.length,
        avgLoadTime: this.results.length > 0 
          ? this.results.reduce((sum, r) => sum + r.loadTime, 0) / this.results.length 
          : 0
      },
      results: this.results,
      errors: this.errors,
      thresholds: this.thresholds
    };

    const reportPath = 'tests/performance-report.json';
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    return this.errors.length === 0;
  }

  async run() {
    console.log(chalk.blue('⚡ Starting performance tests...\n'));
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
      const page = await browser.newPage();
      
      // Test each page
      for (const pageInfo of this.testPages) {
        await this.testPagePerformance(page, pageInfo);
      }
      
      // Test responsiveness
      await this.testResponsiveness(page);
      
    } catch (error) {
      this.log('error', `Performance test failed: ${error.message}`);
    } finally {
      await browser.close();
    }

    const success = await this.generateReport();
    
    if (success) {
      console.log(chalk.green('\n🎉 Performance tests completed!'));
      process.exit(0);
    } else {
      console.log(chalk.red('\n💥 Performance tests found issues!'));
      process.exit(1);
    }
  }
}

if (require.main === module) {
  new PerformanceTester().run().catch(console.error);
}

module.exports = PerformanceTester;