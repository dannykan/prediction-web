const fs = require('fs');
const content = fs.readFileSync('.open-next/worker.js', 'utf8');

// Add static asset handling before middleware
const modified = content.replace(
  'export default {\n    async fetch(request, env, ctx) {\n        return runWithCloudflareRequestContext(request, env, ctx, async () => {',
  `export default {\n    async fetch(request, env, ctx) {\n        const url = new URL(request.url);\n        \n        // Handle static assets first\n        if ((url.pathname.startsWith("/_next/") || \n             url.pathname.startsWith("/images/") || \n             url.pathname.match(/\\.(woff2|woff|ttf|png|jpg|jpeg|gif|svg|ico|css|js)$/)) && \n            env.ASSETS) {\n            const assetResponse = await env.ASSETS.fetch(request);\n            if (assetResponse.status !== 404) {\n                return assetResponse;\n            }\n        }\n        \n        return runWithCloudflareRequestContext(request, env, ctx, async () => {`
);

fs.writeFileSync('.open-next/_worker.js', modified);
console.log('Created _worker.js with static asset handling');
