# 修復 prediction-web Submodule 問題

## 🔍 問題診斷

`prediction-web` 目錄是一個 git submodule（有自己的 `.git` 目錄），但根目錄的 git 倉庫沒有正確配置它。這導致：

1. GitHub Actions checkout 時，`prediction-web` 目錄不存在
2. 無法訪問 `prediction-web/package.json` 等文件

## ✅ 解決方案

有兩種方式可以解決這個問題：

### 方案 1: 將 prediction-web 內容直接包含在根目錄（推薦）

如果根目錄和 `prediction-web` 應該在同一個倉庫中，應該移除 submodule 狀態：

```bash
# 1. 移除 submodule 的 .git 目錄
cd /Users/dannykan/Prediction-God
rm -rf prediction-web/.git

# 2. 添加 prediction-web 的內容到根目錄的 git 倉庫
git add prediction-web/
git commit -m "chore: Include prediction-web content directly in repository"
git push origin main
```

### 方案 2: 正確配置 Submodule

如果 `prediction-web` 應該是一個獨立的倉庫，需要正確配置：

```bash
# 1. 創建 .gitmodules 文件
cat > .gitmodules << EOF
[submodule "prediction-web"]
    path = prediction-web
    url = https://github.com/dannykan/prediction-web.git
EOF

# 2. 添加 .gitmodules
git add .gitmodules
git commit -m "chore: Add prediction-web submodule configuration"
git push origin main
```

## 🎯 推薦方案

根據你的需求（根目錄連接到 `prediction-web.git`），**推薦使用方案 1**，將 `prediction-web` 的內容直接包含在根目錄的 git 倉庫中。

## 📋 執行步驟（方案 1）

1. **備份 prediction-web 的 git 歷史**（如果需要保留）：
   ```bash
   cd prediction-web
   git log --oneline > ../prediction-web-git-history.txt
   cd ..
   ```

2. **移除 submodule 狀態**：
   ```bash
   rm -rf prediction-web/.git
   ```

3. **添加 prediction-web 內容到根目錄**：
   ```bash
   git add prediction-web/
   git commit -m "chore: Include prediction-web content directly in repository"
   git push origin main
   ```

4. **驗證**：
   ```bash
   git ls-files prediction-web/package.json
   # 應該顯示：prediction-web/package.json
   ```

## ⚠️ 注意事項

- 移除 `.git` 目錄後，`prediction-web` 的 git 歷史會丟失（但代碼不會）
- 如果之後需要恢復 git 歷史，可以使用備份的 `prediction-web-git-history.txt`
- 執行後，GitHub Actions 應該可以正常訪問 `prediction-web` 目錄
