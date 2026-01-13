# 後端需要檢查：YES_NO 市場的 Option Markets 創建

## 問題描述

前端是非題（YES_NO）市場詳情頁面顯示「此市場沒有 LMSR 選項」，無法進行下注。

## 問題分析

1. **前端邏輯**：
   - 是非題（YES_NO）使用 `option markets`（不是 exclusive markets）
   - 前端調用 `/api/option-markets/market/:marketId` 獲取選項市場
   - 如果返回空數組，前端顯示「此市場沒有 LMSR 選項」

2. **可能的原因**：
   - 後端在創建 YES_NO 市場時沒有自動創建對應的 option markets
   - 或者 option markets 創建失敗但沒有報錯
   - 或者 API 端點有問題

## 需要檢查的後端邏輯

### 1. 市場創建時是否自動創建 Option Markets

**位置**：`src/markets/markets.service.ts` - `create` 方法

**檢查點**：
- ✅ 創建市場後，是否為每個選項創建對應的 option market？
- ✅ 對於 YES_NO 題型，是否創建了兩個 option markets（對應「是」和「否」）？
- ✅ 創建 option markets 時是否正確設置了 `optionId`（"yes" 和 "no"）？

**預期行為**：
```typescript
// 對於 YES_NO 市場，應該創建：
// 1. Option Market for "yes" (optionId: "yes")
// 2. Option Market for "no" (optionId: "no")
```

### 2. API 端點是否正確

**端點**：`GET /option-markets/market/:marketId`

**檢查點**：
- ✅ 端點是否存在？
- ✅ 是否正確查詢該市場的所有 option markets？
- ✅ 對於 YES_NO 市場，是否返回兩個 option markets？

**預期響應**：
```json
[
  {
    "id": "option-market-uuid-1",
    "optionId": "yes",
    "optionName": "是",
    "priceYes": "0.5",
    "priceNo": "0.5",
    ...
  },
  {
    "id": "option-market-uuid-2",
    "optionId": "no",
    "optionName": "否",
    "priceYes": "0.5",
    "priceNo": "0.5",
    ...
  }
]
```

### 3. 市場機制檢查

**檢查點**：
- ✅ 市場的 `mechanism` 字段是否設置為 `LMSR_V2`？
- ✅ 前端創建市場時是否正確傳遞了 `mechanism: "LMSR_V2"`？

## 前端已實施的修復

1. ✅ 改進了錯誤處理，不會因為 API 錯誤而崩潰
2. ✅ 添加了詳細的調試日誌
3. ✅ 改進了錯誤提示信息，顯示市場 ID、題型、機制等信息
4. ✅ 對於是非題，如果沒有 option markets，會顯示友好的錯誤提示

## 調試步驟

1. **檢查市場數據**：
   - 確認市場的 `questionType` 為 `YES_NO`
   - 確認市場的 `mechanism` 為 `LMSR_V2`

2. **檢查 Option Markets**：
   - 查詢數據庫中該市場的 option markets
   - 確認是否有兩個 option markets（對應「是」和「否」）

3. **檢查 API 響應**：
   - 直接調用 `GET /option-markets/market/:marketId`
   - 查看返回的數據結構

## 預期修復

後端應該確保：
1. ✅ 創建 YES_NO 市場時，自動創建兩個 option markets
2. ✅ Option markets 的 `optionId` 正確設置為 "yes" 和 "no"
3. ✅ API 端點正確返回這些 option markets

## 當前狀態

- ✅ 前端代碼已改進錯誤處理
- ✅ 前端創建市場時已添加 `mechanism: "LMSR_V2"`
- ✅ 後端 `createMarket` 方法會為 LMSR_V2 市場創建 option markets（第 1985-2012 行）
- ⚠️ 需要檢查已存在的市場是否缺少 option markets

## 可能的原因

1. **舊市場沒有 option markets**：
   - 如果市場是在修復之前創建的，可能沒有 option markets
   - 需要為這些市場手動創建 option markets

2. **創建失敗但沒有報錯**：
   - Option markets 創建可能失敗但沒有拋出錯誤
   - 需要檢查後端日誌

3. **API 查詢問題**：
   - `/option-markets/market/:marketId` API 可能查詢條件有誤
   - 需要檢查查詢邏輯

## 建議的檢查步驟

1. **檢查特定市場**：
   ```sql
   -- 查詢市場的 option markets
   SELECT om.*, m.title, m.question_type, m.mechanism
   FROM option_markets om
   JOIN markets m ON om."optionId" = ANY(
     SELECT jsonb_array_elements(m.options)->>'id'::text
   )
   WHERE m.id = '2125e0fb-a016-4d16-80f0-77ba430b9dc9';
   ```

2. **檢查市場的選項 ID**：
   ```sql
   -- 查看市場的選項
   SELECT id, title, question_type, mechanism, options
   FROM markets
   WHERE id = '2125e0fb-a016-4d16-80f0-77ba430b9dc9';
   ```

3. **檢查 option markets 是否正確關聯**：
   - 確認 `option_markets.optionId` 是否匹配 `markets.options[].id`
   - 對於 YES_NO 市場，應該有兩個 option markets（optionId: "yes" 和 "no"）
