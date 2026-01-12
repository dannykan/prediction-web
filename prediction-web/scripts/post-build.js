#!/usr/bin/env node

/**
 * Post-build script for Cloudflare Pages deployment
 *
 * This script performs the following operations:
 * 1. Copies static assets from .open-next/assets to .open-next root
 * 2. Renames worker.js to _worker.js
 * 3. Ensures proper file structure for Cloudflare Pages
 */

const fs = require('fs');
const path = require('path');

const OPEN_NEXT_DIR = path.join(process.cwd(), '.open-next');
const ASSETS_DIR = path.join(OPEN_NEXT_DIR, 'assets');
const WORKER_SRC = path.join(OPEN_NEXT_DIR, 'worker.js');
const WORKER_DEST = path.join(OPEN_NEXT_DIR, '_worker.js');

console.log('📦 Post-build processing for Cloudflare Pages...');

/**
 * Copy directory recursively
 */
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Source directory ${src} not found, skipping...`);
    return;
  }

  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    for (const file of files) {
      copyRecursive(
        path.join(src, file),
        path.join(dest, file)
      );
    }
  } else {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`   Copied: ${path.relative(OPEN_NEXT_DIR, dest)}`);
  }
}

/**
 * Move files from assets to root
 */
function moveAssetsToRoot() {
  console.log('\n1️⃣  Moving assets to root level...');

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('❌ Assets directory not found!');
    process.exit(1);
  }

  const files = fs.readdirSync(ASSETS_DIR);

  for (const file of files) {
    const src = path.join(ASSETS_DIR, file);
    const dest = path.join(OPEN_NEXT_DIR, file);

    // Skip if already exists at root (don't overwrite)
    if (fs.existsSync(dest)) {
      console.log(`   Skipped: ${file} (already exists)`);
      continue;
    }

    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
      copyRecursive(src, dest);
    } else {
      fs.copyFileSync(src, dest);
      console.log(`   Copied: ${file}`);
    }
  }

  console.log('✅ Assets moved successfully');
}

/**
 * Create _worker.js from worker.js
 */
function createWorkerFile() {
  console.log('\n2️⃣  Creating _worker.js...');

  if (!fs.existsSync(WORKER_SRC)) {
    console.error('❌ worker.js not found!');
    process.exit(1);
  }

  // Copy worker.js to _worker.js
  fs.copyFileSync(WORKER_SRC, WORKER_DEST);
  console.log(`   Created: _worker.js`);

  console.log('✅ Worker file created successfully');
}

/**
 * Verify deployment structure
 */
function verifyStructure() {
  console.log('\n3️⃣  Verifying deployment structure...');

  const requiredFiles = [
    '_worker.js',
    '_next',
    'BUILD_ID'
  ];

  let allPresent = true;

  for (const file of requiredFiles) {
    const filepath = path.join(OPEN_NEXT_DIR, file);
    if (fs.existsSync(filepath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} (missing)`);
      allPresent = false;
    }
  }

  if (!allPresent) {
    console.error('\n❌ Some required files are missing!');
    process.exit(1);
  }

  console.log('✅ All required files present');
}

/**
 * Main execution
 */
function main() {
  try {
    moveAssetsToRoot();
    createWorkerFile();
    verifyStructure();

    console.log('\n🎉 Post-build processing complete!');
    console.log('📁 Deployment directory: .open-next/');
    console.log('');
  } catch (error) {
    console.error('\n❌ Post-build processing failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
