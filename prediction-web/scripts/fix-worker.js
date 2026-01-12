#!/usr/bin/env node

/**
 * Fix _worker.js to properly serve static assets
 *
 * This script adds static asset handling to the _worker.js file
 * to ensure _next/static/* files are served directly from ASSETS
 */

const fs = require('fs');
const path = require('path');

const WORKER_PATH = path.join(process.cwd(), '.open-next', '_worker.js');

console.log('🔧 Fixing _worker.js to serve static assets...');

if (!fs.existsSync(WORKER_PATH)) {
  console.error('❌ _worker.js not found!');
  process.exit(1);
}

// Read the current worker file
let workerContent = fs.readFileSync(WORKER_PATH, 'utf8');

// Check if already patched
if (workerContent.includes('// Static asset handling')) {
  console.log('✅ _worker.js already patched');
  process.exit(0);
}

// Create the static asset handling code
const staticAssetHandler = `
            // Static asset handling - serve from ASSETS binding
            if (url.pathname.startsWith("/_next/static/") ||
                url.pathname.startsWith("/images/") ||
                url.pathname.match(/\\.(css|js|woff2?|png|jpg|jpeg|gif|svg|ico)$/)) {
                return env.ASSETS?.fetch(request) || new Response("Not Found", { status: 404 });
            }
`;

// Find the insertion point (after the skew protection check)
const insertAfter = `if (response) {
                return response;
            }`;

if (!workerContent.includes(insertAfter)) {
  console.error('❌ Could not find insertion point in _worker.js');
  process.exit(1);
}

// Insert the static asset handler
workerContent = workerContent.replace(
  insertAfter,
  insertAfter + staticAssetHandler
);

// Write the modified worker file
fs.writeFileSync(WORKER_PATH, workerContent, 'utf8');

console.log('✅ _worker.js patched successfully');
console.log('📝 Added static asset handling for:');
console.log('   - /_next/static/*');
console.log('   - /images/*');
console.log('   - .css, .js, .woff2, .png, etc.');
