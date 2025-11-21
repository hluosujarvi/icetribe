#!/usr/bin/env node

/**
 * Validates that the minified Hugo build still loads Google Analytics
 * after the user accepts analytics cookies. The test spins up a tiny
 * static HTTP server that serves the contents of the "public" folder,
 * then uses Puppeteer to click the consent banner and verifies that
 * gtag.js is injected and initialised.
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const puppeteer = require('puppeteer');

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function ensureBuildArtifacts() {
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('public/index.html puuttuu – suorita `hugo --gc --minify` ennen testiä');
  }

  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  if (!indexHtml.includes('window.ICETRIBE_GA_ID')) {
    throw new Error('Ga ID -skripti puuttuu index.html:stä');
  }

  if (!indexHtml.includes('data-icetribe-ga-loader')) {
    throw new Error('GA preload -skripti puuttuu minifioidusta index.html:stä');
  }
}

function createStaticServer(rootDir) {
  const server = http.createServer(async (req, res) => {
    try {
      const requestPath = decodeURIComponent(req.url.split('?')[0] || '/');
      let relativePath = requestPath.replace(/^\/+/, '');
      if (relativePath === '' || relativePath.endsWith('/')) {
        relativePath += 'index.html';
      }
      const absolutePath = path.join(rootDir, relativePath);

      if (!absolutePath.startsWith(rootDir)) {
        res.statusCode = 403;
        res.end('Forbidden');
        return;
      }

      if (!fs.existsSync(absolutePath) || fs.statSync(absolutePath).isDirectory()) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }

      const data = fs.readFileSync(absolutePath);
      const ext = path.extname(absolutePath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    } catch (error) {
      res.statusCode = 500;
      res.end('Server error');
      console.error('Static server error:', error);
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address.port !== 'number') {
        reject(new Error('Static server failed to start'));
        return;
      }
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function run() {
  ensureBuildArtifacts();

  const { server, url } = await createStaticServer(PUBLIC_DIR);
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#cookie-accept-all', { timeout: 5000 });
    await page.click('#cookie-accept-all');

    await page.waitForFunction(() => typeof window.gtag === 'function', { timeout: 5000 });
    const gaScriptFound = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script[src]')).some(script =>
        script.src.includes('https://www.googletagmanager.com/gtag/js?id=')
      );
    });

    if (!gaScriptFound) {
      throw new Error('gtag.js ei latautunut vaikka analytiikkaevästeet hyväksyttiin');
    }

    console.log('GA build validation passed: gtag.js loaded after consent');
  } finally {
    if (browser) {
      await browser.close();
    }
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error('GA build validation failed:', error.message);
  process.exit(1);
});
