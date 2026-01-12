const fs = require('fs');
const path = require('path');

// Copy worker.js to _worker.js
let workerContent = fs.readFileSync('.open-next/worker.js', 'utf8');

// Add static asset handling before middleware
// This ensures CSS, JS, images, and fonts are served correctly
const staticAssetHandling = `            // Serve static assets first (CSS, JS, images, fonts, etc.)
            // This ensures static files are served before middleware/routing
            if (url.pathname.startsWith("/_next/static/") || 
                url.pathname.startsWith("/images/") ||
                url.pathname.match(/\\.(woff2|woff|ttf|png|jpg|jpeg|gif|svg|ico|css|js|map)$/)) {
                if (env.ASSETS) {
                    const assetResponse = await env.ASSETS.fetch(request);
                    if (assetResponse.status !== 404) {
                        return assetResponse;
                    }
                }
            }
            
            `;

// Insert static asset handling after the URL creation and before image handling
// Match: "const url = new URL(request.url);" followed by optional whitespace and then "// Serve images"
const pattern = /(const url = new URL\(request\.url\);\s*)(\/\/ Serve images in development\.)/;
if (pattern.test(workerContent)) {
    workerContent = workerContent.replace(pattern, `$1${staticAssetHandling}$2`);
    console.log('Added static asset handling to _worker.js');
} else {
    console.warn('Warning: Could not find insertion point for static asset handling');
    // Fallback: try to insert after URL creation
    workerContent = workerContent.replace(
        /(const url = new URL\(request\.url\);\s*)/,
        `$1${staticAssetHandling}`
    );
    console.log('Added static asset handling using fallback method');
}

fs.writeFileSync('.open-next/_worker.js', workerContent);

// Move assets to root level so they're accessible at the correct paths
// Next.js expects /_next/static/ but OpenNext puts them in assets/_next/static/
const assetsDir = '.open-next/assets';
const targetDir = '.open-next';

// Copy _next directory from assets to root
if (fs.existsSync(path.join(assetsDir, '_next'))) {
  const nextDir = path.join(targetDir, '_next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
  }
  fs.cpSync(path.join(assetsDir, '_next'), nextDir, { recursive: true });
  console.log('Copied _next directory from assets to root');
}

// Copy images directory
if (fs.existsSync(path.join(assetsDir, 'images'))) {
  const imagesDir = path.join(targetDir, 'images');
  if (fs.existsSync(imagesDir)) {
    fs.rmSync(imagesDir, { recursive: true, force: true });
  }
  fs.cpSync(path.join(assetsDir, 'images'), imagesDir, { recursive: true });
  console.log('Copied images directory from assets to root');
}

// Copy other root-level files from assets
const rootFiles = ['favicon.ico', '_redirects', 'BUILD_ID'];
rootFiles.forEach(file => {
  const src = path.join(assetsDir, file);
  const dest = path.join(targetDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} from assets to root`);
  }
});

console.log('Created _worker.js and moved static assets to root level');
