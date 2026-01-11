#!/bin/bash

# Railway 後端部署修復腳本
# 專門用於推送後端改動到 GitHub，觸發 Railway 重新部署

set -e  # 遇到錯誤立即退出

echo "🚀 Railway 後端部署修復腳本"
echo "======================================"
echo ""

# 切換到後端目錄
BACKEND_DIR="/Users/dannykan/Prediction-God/prediction-backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ 錯誤：找不到後端目錄"
    echo "   預期路徑：$BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"
echo "📍 切換到後端目錄：$(pwd)"

# 檢查是否在 Git repository 中
if [ ! -d ".git" ]; then
    echo "❌ 錯誤：後端目錄不是 Git repository"
    echo "   請確認 prediction-backend 是否已初始化 Git"
    exit 1
fi

echo "📍 Git 分支：$(git branch --show-current)"
echo "📍 Git Remote: $(git remote get-url origin)"
echo ""

# 顯示當前狀態
echo "1️⃣ 檢查 Git 狀態..."
git status --short
echo ""

# 詢問用戶是否繼續
read -p "是否要提交並推送後端改動？這會觸發 Railway 重新部署 (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消操作"
    exit 0
fi

# 添加所有改動
echo "2️⃣ 添加改動到 Git..."
git add .
echo "   ✅ 已添加所有改動"
echo ""

# 顯示將要提交的檔案
echo "3️⃣ 將要提交的檔案："
git status --short
echo ""

# 提交改動
echo "4️⃣ 提交改動..."
COMMIT_MSG="fix: 強制 Railway 重新部署以修復 Admin 路由 404 問題

診斷發現 Admin 路由返回 404，推測是構建快取問題。

新增診斷工具：
- scripts/railway-diagnostic.sh - 完整 API 診斷
- scripts/test-admin-endpoints.sh - Admin 端點測試

修復措施：
- 更新 .railway-version 觸發重新構建
- 強制清除構建快取

預期結果：
- Admin 路由從 404 → 200/403
- 修復創建市場、下注等功能"

git commit -m "$COMMIT_MSG"
echo "   ✅ 已創建提交"
echo ""

# 獲取當前分支
BRANCH=$(git branch --show-current)

# 推送到 GitHub
echo "5️⃣ 推送到 GitHub (分支: $BRANCH)..."
echo "   遠端倉庫: https://github.com/dannykan/prediction-backend.git"
git push origin "$BRANCH"
echo "   ✅ 已推送到 GitHub"
echo ""

echo "======================================"
echo "✅ 後端部署觸發成功！"
echo "======================================"
echo ""
echo "📊 接下來會發生什麼："
echo ""
echo "   1. GitHub 接收到推送"
echo "   2. Railway 接收到 webhook 通知"
echo "   3. Railway 開始構建（約 1-2 分鐘）"
echo "      • npm install"
echo "      • npm run build"
echo "   4. Railway 部署新版本（約 30-60 秒）"
echo "      • npm run start:prod"
echo "      • 健康檢查 /health"
echo ""
echo "⏱️  預計 2-3 分鐘後完成"
echo ""
echo "📍 監控部署狀態："
echo "   • Railway: https://railway.app"
echo "   • GitHub: https://github.com/dannykan/prediction-backend"
echo ""
echo "🧪 驗證修復（請在 3 分鐘後執行）："
echo ""
echo "   ./scripts/railway-diagnostic.sh"
echo ""
echo "======================================"
echo ""

# 詢問是否自動等待並驗證
read -p "是否等待 3 分鐘後自動執行驗證？(y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⏳ 等待 3 分鐘讓 Railway 部署完成..."
    echo "   💡 你可以在此期間前往 Railway Dashboard 監控部署狀態"
    echo ""

    # 倒數計時
    for i in {180..1}; do
        printf "\r   ⏱️  剩餘時間：%02d:%02d   " $((i/60)) $((i%60))
        sleep 1
    done
    echo ""
    echo ""

    echo "🧪 執行驗證..."
    ./scripts/railway-diagnostic.sh

    echo ""
    echo "======================================"
    echo "驗證完成！請查看上方結果。"
    echo ""
    echo "✅ 成功標準："
    echo "   • Admin 端點返回 200 或 403（不是 404）"
    echo "   • 健康檢查通過"
    echo "   • CORS 設定正常"
    echo ""
    echo "❌ 如果仍看到 404 錯誤："
    echo "   1. 檢查 Railway Dashboard 的部署日誌"
    echo "   2. 確認環境變數（參考 /Users/dannykan/Prediction-God/RAILWAY_ENV_SETUP.md）"
    echo "   3. 在 Railway Dashboard 中手動清除快取並 Redeploy"
    echo "======================================"
else
    echo "💡 提示：請在 3 分鐘後手動執行驗證："
    echo ""
    echo "   cd $BACKEND_DIR"
    echo "   ./scripts/railway-diagnostic.sh"
    echo ""
fi

echo ""
echo "🎉 完成！"
