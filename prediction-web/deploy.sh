#!/bin/bash
set -e

echo "🚀 开始部署到 Cloudflare Pages..."

cd "$(dirname "$0")"

# 构建
echo "📦 构建项目..."
npm run build:cloudflare

# 验证构建输出
echo "🔍 验证构建输出..."
if [ ! -f ".open-next/_worker.js" ]; then
    echo "❌ 错误: _worker.js 不存在"
    exit 1
fi

if [ ! -d ".open-next/_next" ]; then
    echo "❌ 错误: _next 目录不存在"
    exit 1
fi

echo "✅ 构建输出验证通过"

# 部署
echo "☁️  部署到 Cloudflare Pages..."
wrangler pages deploy .open-next \
  --project-name=predictiongod \
  --branch=main \
  --commit-dirty=true

echo "✅ 部署完成！"
echo "🌐 访问: https://predictiongod.pages.dev"
echo "🌐 访问: https://predictiongod.app"
