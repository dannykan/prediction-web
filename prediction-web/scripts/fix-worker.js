const fs = require('fs');
const content = fs.readFileSync('.open-next/worker.js', 'utf8');

// For Cloudflare Pages, static assets are automatically served
// We just need to copy worker.js to _worker.js
// The middleware handler should handle routing correctly
fs.writeFileSync('.open-next/_worker.js', content);
console.log('Created _worker.js from worker.js');
