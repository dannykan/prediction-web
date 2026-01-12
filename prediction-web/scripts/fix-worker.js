const fs = require('fs');
const path = require('path');

// Copy worker.js to _worker.js
const workerContent = fs.readFileSync('.open-next/worker.js', 'utf8');
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
