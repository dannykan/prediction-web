# Admin 介面本地測試指南

## 🚀 快速開始

### 1. 啟動本地開發服務器

```bash
cd prediction-web
npm run dev
```

應用將在 `http://localhost:3001` 運行（根據 `package.json` 中的配置）

### 2. 訪問 Admin 介面

在瀏覽器中訪問：
```
http://localhost:3001/admin
```

---

## 📋 功能清單

### ✅ 已實現的功能

1. **Admin 主頁** (`/admin`)
   - 顯示所有管理功能的入口
   - 包括：用戶管理、市場管理、下注管理、評論管理、任務管理、獎勵配置

2. **市場管理** (`/admin/markets`)
   - 查看所有市場列表
   - 按狀態篩選（OPEN, LOCKED, SETTLED）
   - 查看市場詳情

3. **市場詳情** (`/admin/markets/[marketId]`)
   - 查看市場的所有下注記錄
   - 查看市場的所有評論
   - 刪除下注（會退款）
   - 刪除評論

### 🔧 API 路由（BFF）

已創建的 API 路由：

- `GET /api/admin/markets/[marketId]/bets` - 獲取市場下注
- `GET /api/admin/markets/[marketId]/comments` - 獲取市場評論
- `DELETE /api/admin/bets/[betId]` - 刪除下注
- `DELETE /api/admin/comments/[commentId]` - 刪除評論
- `PATCH /api/admin/comments/[commentId]` - 編輯評論

---

## ⚙️ 環境配置

### 必需環境變量

確保 `.env.local` 文件包含：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

或者如果後端運行在其他端口：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:YOUR_BACKEND_PORT
```

---

## 🧪 測試步驟

### 1. 測試市場列表

1. 訪問 `http://localhost:3001/admin/markets`
2. 應該看到所有市場的列表
3. 嘗試使用狀態篩選器
4. 點擊「查看詳情」進入市場詳情頁

### 2. 測試市場詳情

1. 從市場列表點擊「查看詳情」
2. 切換到「下注記錄」標籤
3. 應該看到該市場的所有下注
4. 切換到「評論」標籤
5. 應該看到該市場的所有評論

### 3. 測試刪除功能

#### 刪除下注：
1. 在市場詳情頁的「下注記錄」標籤中
2. 點擊某個下注的「刪除」按鈕
3. 輸入刪除原因
4. 確認刪除
5. 下注應該被刪除並退款給用戶

#### 刪除評論：
1. 在市場詳情頁的「評論」標籤中
2. 點擊某個評論的「刪除」按鈕
3. 輸入刪除原因
4. 確認刪除
5. 評論應該被刪除

---

## ⚠️ 注意事項

### 1. 認證

目前 admin 介面使用與普通用戶相同的認證機制。在生產環境中，應該：
- 添加 admin 權限檢查
- 只有具有 admin 角色的用戶才能訪問

### 2. Admin ID

在刪除操作中，目前使用硬編碼的 `admin-user-id`：

```typescript
const adminId = "admin-user-id"; // Replace with actual admin ID
```

**需要修改**：
- 從認證上下文獲取當前用戶 ID
- 或從 JWT token 中提取

### 3. 後端 API

確保後端服務器正在運行，並且：
- 後端運行在 `http://localhost:3000`（或你配置的端口）
- Admin API 端點已實現並可用

---

## 🐛 常見問題

### Q: 訪問 `/admin` 時出現 404

**A**: 確保：
1. 開發服務器正在運行
2. 文件結構正確：
   ```
   src/app/(authenticated)/admin/page.tsx
   ```

### Q: API 請求失敗（401 或 500）

**A**: 檢查：
1. 是否已登入（需要有效的認證 token）
2. `NEXT_PUBLIC_API_BASE_URL` 是否正確設置
3. 後端服務器是否正在運行

### Q: 刪除操作失敗

**A**: 檢查：
1. 後端 API 是否正常運行
2. 市場是否已結算（已結算的市場不能刪除下注）
3. 刪除原因是否已填寫

---

## 📝 待辦事項

- [ ] 添加用戶管理頁面 (`/admin/users`)
- [ ] 添加下注管理頁面 (`/admin/bets`)
- [ ] 添加評論管理頁面 (`/admin/comments`)
- [ ] 添加任務管理頁面 (`/admin/tasks`)
- [ ] 添加獎勵配置頁面 (`/admin/reward-configs`)
- [ ] 實現 admin 權限檢查
- [ ] 從認證上下文獲取 admin ID（而不是硬編碼）
- [ ] 添加編輯評論功能（UI）
- [ ] 添加市場結算功能
- [ ] 添加審計日誌查看功能

---

## 🔗 相關文檔

- 後端 Admin API 文檔：`prediction-backend/ADMIN_API_QUICK_START.md`
- 後端 Admin API 需求：`prediction-backend/ADMIN_API_REQUIREMENTS.md`
