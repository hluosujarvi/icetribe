#!/usr/bin/env node

// Simplified GA build validation.
// - Verifies public/index.html contains GA preload marker `data-icetribe-ga-loader` and `window.ICETRIBE_GA_ID`.
// - Verifies public/js/icetribe-simple-config.js exists and contains key function names used by tests.

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

function fail(msg) {
  console.error('GA simple validation failed:', msg);
  process.exit(1);
}

function ensureBuildArtifacts() {
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    fail('public/index.html puuttuu – suorita `hugo --gc --minify` ennen testiä');
  }
}

function run() {
  ensureBuildArtifacts();

  const indexHtml = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');

  if (!/window.ICETRIBE_GA_ID/.test(indexHtml)) {
    fail('window.ICETRIBE_GA_ID puuttuu index.html:stä');
  }

  if (!/data-icetribe-ga-loader/.test(indexHtml)) {
    fail('GA preload -skripti puuttuu minifioidusta index.html:stä');
  }

  const gaConfigPath = path.join(PUBLIC_DIR, 'js', 'icetribe-simple-config.js');
  if (!fs.existsSync(gaConfigPath)) {
    fail('public/js/icetribe-simple-config.js puuttuu');
  }

  const gaConfig = fs.readFileSync(gaConfigPath, 'utf8');

  const requiredSymbols = ['loadGoogleAnalytics', 'updateGoogleAnalyticsConsent', 'getCookieConsent'];
  const missing = requiredSymbols.filter(s => !new RegExp(s + '\\s*=').test(gaConfig) && !new RegExp('function\\s+' + s).test(gaConfig));
  if (missing.length) {
    fail('Seuraavat odotetut symbolit puuttuvat `icetribe-simple-config.js`: ' + missing.join(', '));
  }

  console.log('GA simple validation passed: preload markers and config symbols present');
}

run();
