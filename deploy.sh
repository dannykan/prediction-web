#!/bin/bash

# 部署腳本 - Prediction God
# 此腳本會幫助你準備部署到 GitHub, Cloudflare Pages 和 Railway

set -e

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Prediction God 部署準備${NC}"
echo ""

# 檢查是否在正確的目錄
if [ ! -d "prediction-web" ] || [ ! -d "prediction-backend" ]; then
    echo -e "${RED}❌ 錯誤：請在專案根目錄執行此腳本${NC}"
    exit 1
fi

# 檢查 Git 狀態
echo -e "${YELLOW}📋 檢查 Git 狀態...${NC}"
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Git 倉庫已初始化${NC}"
    
    # 顯示未提交的更改
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  發現未提交的更改：${NC}"
        git status --short
        echo ""
        echo -e "${YELLOW}請執行以下命令提交更改：${NC}"
        echo "  git add ."
        echo "  git commit -m '你的提交訊息'"
        echo "  git push origin main"
    else
        echo -e "${GREEN}✅ 沒有未提交的更改${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Git 倉庫尚未初始化${NC}"
    echo -e "${YELLOW}請執行以下命令初始化：${NC}"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    echo "  git remote add origin <你的GitHub倉庫URL>"
    echo "  git push -u origin main"
fi

echo ""

# 檢查前端配置
echo -e "${YELLOW}📦 檢查前端配置...${NC}"
if [ -f "prediction-web/package.json" ]; then
    echo -e "${GREEN}✅ package.json 存在${NC}"
else
    echo -e "${RED}❌ package.json 不存在${NC}"
    exit 1
fi

# 檢查後端配置
echo -e "${YELLOW}📦 檢查後端配置...${NC}"
if [ -f "prediction-backend/package.json" ]; then
    echo -e "${GREEN}✅ package.json 存在${NC}"
else
    echo -e "${RED}❌ package.json 不存在${NC}"
    exit 1
fi

if [ -f "prediction-backend/railway.json" ]; then
    echo -e "${GREEN}✅ railway.json 存在${NC}"
else
    echo -e "${YELLOW}⚠️  railway.json 不存在（可選）${NC}"
fi

echo ""

# 顯示部署指南
echo -e "${BLUE}📚 部署步驟：${NC}"
echo ""
echo -e "${YELLOW}1. GitHub 部署：${NC}"
echo "   - 確保所有更改已提交並推送到 GitHub"
echo "   - 如果還沒有遠程倉庫，請先創建並連接"
echo ""
echo -e "${YELLOW}2. Cloudflare Pages 部署：${NC}"
echo "   - 訪問 https://dash.cloudflare.com"
echo "   - Pages → Create a project → Connect to Git"
echo "   - 選擇你的 GitHub 倉庫"
echo "   - 設置 Root directory: /prediction-web"
echo "   - 添加環境變數："
echo "     * NEXT_PUBLIC_API_BASE_URL=https://prediction-backend-production-8f6c.up.railway.app"
echo "     * NEXT_PUBLIC_SITE_URL=https://predictiongod.app"
echo ""
echo -e "${YELLOW}3. Railway 部署：${NC}"
echo "   - 訪問 https://railway.app"
echo "   - New Project → Deploy from GitHub repo"
echo "   - 選擇你的 GitHub 倉庫"
echo "   - 設置 Root Directory: prediction-backend"
echo "   - 添加環境變數："
echo "     * FRONTEND_URL=https://predictiongod.app"
echo "     * NODE_ENV=production"
echo "     * PORT=5001"
echo "   - 添加 PostgreSQL 資料庫服務"
echo ""
echo -e "${GREEN}✅ 準備完成！${NC}"
echo ""
echo -e "${BLUE}📖 詳細說明請參考：${NC}"
echo "   - DEPLOY_GUIDE.md (完整部署指南)"
echo "   - QUICK_DEPLOY.md (快速部署命令)"
echo "   - DEPLOYMENT_CHECKLIST.md (部署檢查清單)"
