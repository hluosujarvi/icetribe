#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const glob = require('glob');
const matter = require('gray-matter');
const toml = require('toml');

const projectRoot = process.cwd();
const contentDir = path.join(projectRoot, 'content');
const reportPath = path.join('tests', 'markdown-assets-report.json');

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const results = {
  errors: [],
  warnings: [],
  passes: []
};

function log(type, message) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}]`;

  switch (type) {
    case 'error':
      results.errors.push(`${prefix} ${message}`);
      console.log(chalk.red(`❌ ${message}`));
      break;
    case 'warning':
      results.warnings.push(`${prefix} ${message}`);
      console.log(chalk.yellow(`⚠️  ${message}`));
      break;
    default:
      results.passes.push(`${prefix} ${message}`);
      console.log(chalk.green(`✅ ${message}`));
      break;
  }
}

function findMarkdownFiles() {
  return glob.sync('content/**/*.md', {
    nodir: true,
    absolute: true
  });
}

function isPostFile(relativePath) {
  if (!relativePath.startsWith('content/posts/')) {
    return false;
  }

  const filename = path.basename(relativePath).toLowerCase();
  if (filename === '_index.md') {
    return false;
  }

  // Page bundles have index.md inside the bundle directory
  if (filename === 'index.md') {
    return true;
  }

  // Allow single-file posts directly under content/posts
  return true;
}

function resolveAssetCandidates(assetPath, fileDir) {
  const cleaned = assetPath.split('?')[0].trim();
  if (!cleaned || cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return [];
  }

  const withoutLeadingSlash = cleaned.replace(/^\/+/, '');
  const searchPaths = new Set();

  // Page bundle / same directory
  searchPaths.add(path.resolve(fileDir, cleaned));
  searchPaths.add(path.resolve(fileDir, withoutLeadingSlash));

  // Static directory (with and without leading /)
  searchPaths.add(path.resolve(projectRoot, 'static', cleaned));
  searchPaths.add(path.resolve(projectRoot, 'static', withoutLeadingSlash));

  // Assets directory (for Hugo Pipes)
  searchPaths.add(path.resolve(projectRoot, 'assets', cleaned));
  searchPaths.add(path.resolve(projectRoot, 'assets', withoutLeadingSlash));

  // Common images folder fallbacks
  if (!withoutLeadingSlash.includes('/')) {
    searchPaths.add(path.resolve(projectRoot, 'static', 'images', withoutLeadingSlash));
    searchPaths.add(path.resolve(projectRoot, 'assets', 'images', withoutLeadingSlash));
  }

  if (withoutLeadingSlash.startsWith('images/')) {
    const stripped = withoutLeadingSlash.replace(/^images\//, '');
    searchPaths.add(path.resolve(projectRoot, 'static', 'images', stripped));
    searchPaths.add(path.resolve(projectRoot, 'assets', 'images', stripped));
  }

  return Array.from(searchPaths);
}

async function assetExists(assetPath, fileDir) {
  const candidates = resolveAssetCandidates(assetPath, fileDir);
  if (candidates.length === 0) {
    return true; // External assets are considered valid
  }

  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) {
      return true;
    }
  }

  return false;
}

async function validateFeaturedImage(data, fileDir, relativePath) {
  if (!('featured_image' in data)) {
    log('error', `${relativePath}: missing required front matter field "featured_image"`);
    return;
  }

  if (typeof data.featured_image !== 'string' || data.featured_image.trim() === '') {
    log('error', `${relativePath}: featured_image must be a non-empty string`);
    return;
  }

  const exists = await assetExists(data.featured_image, fileDir);
  if (!exists) {
    log('error', `${relativePath}: featured_image points to missing asset "${data.featured_image}"`);
  } else {
    log('pass', `${relativePath}: featured_image verified (${data.featured_image})`);
  }
}

async function validateInlineAssets(content, fileDir, relativePath) {
  const shortcodeRegex = /{{<\s*img\s+[^>]*src\s*=\s*["']([^"']+)["'][^>]*>}}/gim;
  const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/gim;

  let match;

  while ((match = shortcodeRegex.exec(content)) !== null) {
    const assetPathValue = match[1].trim();
    const exists = await assetExists(assetPathValue, fileDir);
    if (!exists) {
      log('error', `${relativePath}: shortcode image asset missing -> ${assetPathValue}`);
    } else {
      log('pass', `${relativePath}: shortcode image asset found (${assetPathValue})`);
    }
  }

  while ((match = markdownImageRegex.exec(content)) !== null) {
    const rawPath = match[1].split(' ')[0].trim();
    if (!rawPath) {
      continue;
    }

    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      log('pass', `${relativePath}: external markdown image (${rawPath})`);
      continue;
    }

    const exists = await assetExists(rawPath, fileDir);
    if (!exists) {
      log('error', `${relativePath}: markdown image asset missing -> ${rawPath}`);
    } else {
      log('pass', `${relativePath}: markdown image asset found (${rawPath})`);
    }
  }
}

function validateFrontMatterBasics(data, relativePath) {
  if (!('title' in data) || typeof data.title !== 'string' || data.title.trim() === '') {
    log('error', `${relativePath}: missing or empty "title" front matter field`);
  } else {
    log('pass', `${relativePath}: title present`);
  }

  if (!('draft' in data) || typeof data.draft !== 'boolean') {
    log('error', `${relativePath}: "draft" must be defined as true/false`);
  } else {
    log('pass', `${relativePath}: draft flag present`);
  }
}

function validatePostMetadata(data, relativePath) {
  if (!('date' in data)) {
    log('error', `${relativePath}: posts require a "date" field`);
  } else if (typeof data.date !== 'string' || !ISO_DATE_REGEX.test(data.date)) {
    log('error', `${relativePath}: post date must be in YYYY-MM-DD format`);
  } else {
    log('pass', `${relativePath}: date valid (${data.date})`);
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    log('error', `${relativePath}: posts require at least one tag`);
  } else {
    const invalidTags = data.tags.filter(tag => typeof tag !== 'string' || tag.trim() === '');
    if (invalidTags.length > 0) {
      log('error', `${relativePath}: tags must be non-empty strings`);
    } else {
      log('pass', `${relativePath}: tags present (${data.tags.length})`);
    }
  }
}

async function run() {
  console.log(chalk.blue('🔎 Starting Markdown front matter & asset validation...\n'));

  const markdownFiles = findMarkdownFiles();
  if (markdownFiles.length === 0) {
    throw new Error('No markdown files found in content directory');
  }

  for (const filePath of markdownFiles) {
    const relativePath = path.relative(projectRoot, filePath);
    const fileDir = path.dirname(filePath);

    let parsed;
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      parsed = matter(fileContent, {
        language: 'toml',
        delimiters: '+++',
        engines: {
          toml: (input) => toml.parse(input)
        }
      });

      validateFrontMatterBasics(parsed.data, relativePath);
  await validateFeaturedImage(parsed.data, fileDir, relativePath);

      if (isPostFile(relativePath)) {
        validatePostMetadata(parsed.data, relativePath);
      }

      await validateInlineAssets(parsed.content, fileDir, relativePath);
    } catch (error) {
      log('error', `${relativePath}: failed to parse front matter - ${error.message}`);
      continue;
    }
  }

  console.log(chalk.blue('\n📊 Validation summary:'));
  console.log(chalk.green(`Passed checks: ${results.passes.length}`));
  console.log(chalk.yellow(`Warnings: ${results.warnings.length}`));
  console.log(chalk.red(`Errors: ${results.errors.length}`));

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      filesScanned: markdownFiles.length,
      passes: results.passes.length,
      warnings: results.warnings.length,
      errors: results.errors.length,
      success: results.errors.length === 0
    },
    details: results
  };

  await fs.writeJson(reportPath, report, { spaces: 2 });
  log('pass', `Report saved to ${reportPath}`);

  if (results.errors.length > 0) {
    console.log(chalk.red('\n💥 Markdown validation failed. Fix the issues above.'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n🎉 Markdown validation passed!'));
    process.exit(0);
  }
}

if (require.main === module) {
  run().catch((error) => {
    console.error(chalk.red(`Markdown validation error: ${error.message}`));
    process.exit(1);
  });
}

module.exports = run;
