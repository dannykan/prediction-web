# 單選題 Buy No(i) 實作改進總結

## 📋 改進項目清單

### ✅ 1. UI 顯示註記（必做）

**問題**: 用戶可能誤解單選題的 NO 為「此選項的反向合約」，實際上是「其他集合」的部位。

**解決方案**: 在 Bottom sheet 加入小字說明

**檔案**: `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart`

**位置**: 在 NO 選項下方

**建議程式碼**:
```dart
if (questionType == 'single' && !_isYesSide) {
  Padding(
    padding: EdgeInsets.only(top: 4),
    child: Text(
      '單選題的 NO 代表：「不是此選項（包含其他選項或都不是）」',
      style: TextStyle(
        fontSize: 10,
        color: Colors.grey[600],
        fontStyle: FontStyle.italic,
      ),
    ),
  ),
}
```

**狀態**: ✅ 已加入文檔

---

### ✅ 2. Bundle Quote 二分搜尋保護（必做）

#### 2.1 Upper Bound 自動擴張

**問題**: 極端偏斜市場，固定 upper bound 可能找不到 shares。

**解決方案**: 在二分搜尋前自動擴張 upper bound（最多 20 次）

**檔案**: `prediction-backend/src/lmsr/services/lmsr.service.ts`

**位置**: `bundleQuote()` 方法中的二分搜尋邏輯

**已實作**（見 `單選題_Buy_No_實作方案.md` Step 2）:
```typescript
// 保護 2: Upper bound 自動擴張
let expansionCount = 0;
let foundUpperBound = false;

while (!foundUpperBound && expansionCount < maxExpansions) {
  // 測試當前 upper bound 是否足夠
  // ...
  if (testTotalCost.gte(totalAmount)) {
    foundUpperBound = true;
  } else {
    maxShares = maxShares.times(2);
    expansionCount++;
  }
}
```

**測試**: ✅ 已加入 `bundle-quote.spec.ts` 的 "Upper Bound Expansion" 測試

#### 2.2 TargetCoin 太小時回傳 shares=0

**問題**: 避免出現「0.0000000001 shares」但 UI 顯示成 0 造成體驗怪。

**解決方案**: 設定最小 coin 閾值（0.001）

**檔案**: `prediction-backend/src/lmsr/services/lmsr.service.ts`

**位置**: `bundleQuote()` 方法開始處

**已實作**（見 `單選題_Buy_No_實作方案.md` Step 2）:
```typescript
const MIN_COIN_THRESHOLD = new Decimal('0.001');
if (totalAmount.lt(MIN_COIN_THRESHOLD)) {
  // 回傳所有 component 的 shares = 0
}
```

**測試**: ✅ 已加入 `bundle-quote.spec.ts` 的 edge case 測試

**狀態**: ✅ 已加入文檔與測試

---

### ✅ 3. Bundle Trade 價格變動顯示（必做）

**問題**: 用戶可能困惑「我明明是買 No(i)，為什麼其他 YES 都上升？」

**解決方案**: 分層顯示（預設只顯示總效果，「展開更多」才顯示各 component）

**檔案**: `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart`

**顯示邏輯**:

**預設顯示**:
- 總花費（含 fee）
- 你會獲得的 bundle shares（同一數字）
- 你選的目標選項（i）會變多少（p_yes before/after）

**「展開更多」才顯示**:
- 其他 options 的 p_yes before/after
- 各 component 的詳細成本

**建議 UI 結構**（見 `單選題_Buy_No_測試與驗證報告.md` 6.3）:
```dart
// 預設顯示
Column(
  children: [
    Text('總花費: ${totalCost}'),
    Text('Bundle Shares: ${totalShares}'),
    Text('選項 ${targetOption.name}: ${priceYesBefore} → ${priceYesAfter}'),
    if (!_expanded)
      TextButton(
        onPressed: () => setState(() => _expanded = true),
        child: Text('展開更多'),
      ),
  ],
)

// 展開後顯示
if (_expanded)
  Column(
    children: [
      for (final component in quote.components)
        if (component.optionId != targetOptionId)
          Text('${component.optionName}: ${component.priceYesBefore} → ${component.priceYesAfter}'),
    ],
  ),
```

**狀態**: ✅ 已加入文檔

---

### ✅ 4. Positions 頁平倉群組（必做）

**問題**: 一次 Buy No(i) 會生成多個 component positions，用戶會看到一排持倉，很像 bug。

**解決方案**: 使用 bundleGroupId 群組顯示

#### 4.1 後端修改

**檔案**: `prediction-backend/src/lmsr/entities/trade.entity.ts`

**新增欄位**:
```typescript
@Column({ type: 'uuid', nullable: true })
bundleGroupId: string | null; // 如果是 bundle 交易的一部分
```

**Migration 檔案**: `prediction-backend/src/migrations/1772000000000-AddBundleGroupIdToTrades.ts`

**在 bundleTrade() 中設定**:
```typescript
const bundleGroupId = uuidv4(); // 為整個 bundle 生成唯一 ID

for (const component of quote.components) {
  const trade = queryRunner.manager.getRepository(Trade).create({
    // ...
    bundleGroupId, // 所有 component 使用相同的 bundleGroupId
  });
}
```

#### 4.2 Positions API 修改

**檔案**: `prediction-backend/src/lmsr/lmsr.controller.ts`

**新增端點**: `GET /option-markets/:marketId/positions-grouped`

**Service 方法**: `getUserPositionsGrouped()`（見 `單選題_Buy_No_測試與驗證報告.md` 6.4.2）

#### 4.3 前端 UI 顯示

**檔案**: `prediction-app/lib/features/market/screens/positions_screen.dart` (需要新建)

**顯示邏輯**（見 `單選題_Buy_No_測試與驗證報告.md` 6.4.3）:
```dart
// 群組顯示
for (final bundle in groupedPositions) {
  ExpansionTile(
    title: Text('單選題：No on ${bundle.targetOptionName}（Bundle）'),
    subtitle: Text('可平倉拿回 ${bundle.currentValue}'),
    children: [
      for (final component in bundle.components)
        ListTile(
          title: Text('${component.optionName}: ${component.side}'),
          subtitle: Text('${component.shares} shares'),
        ),
      ElevatedButton(
        onPressed: () => _closeBundle(bundle.bundleGroupId),
        child: Text('一鍵平倉'),
      ),
    ],
  );
}
```

**狀態**: ✅ 已加入文檔

---

### ✅ 5. 前端 Fallback 策略（必做）

**問題**: 不要用 Parimutuel 邏輯當 LMSR 的 fallback（會重新引入錯誤）。

**解決方案**: 更安全的 fallback 策略

**檔案**: `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart`

**修改 `_calculateCurrentProbability()`**（見 `單選題_Buy_No_測試與驗證報告.md` 6.5）:
```dart
if (mechanism == 'LMSR_V1') {
  final priceYes = option.priceYes;
  
  if (priceYes != null) {
    // 成功取得價格
    // ...
  } else {
    // ❌ 價格 API 失敗：顯示 50% + 提示
    // 不要用 Parimutuel 邏輯！
    return 50.0; // 中性值
  }
}

// 只有當 mechanism != LMSR 時才使用 Parimutuel
if (mechanism != 'LMSR_V1') {
  // 舊的 Parimutuel 邏輯
  // ...
}
```

**顯示提示**:
```dart
if (mechanism == 'LMSR_V1' && option.priceYes == null) {
  Container(
    padding: EdgeInsets.all(4),
    decoration: BoxDecoration(
      color: Colors.orange[100],
      borderRadius: BorderRadius.circular(4),
    ),
    child: Text(
      '價格載入失敗，請重試',
      style: TextStyle(fontSize: 10, color: Colors.orange[900]),
    ),
  ),
}
```

**狀態**: ✅ 已加入文檔

---

### ✅ 6. E2E 人類驗收腳本（必做）

**檔案**: `prediction-backend/scripts/e2e-bundle-trade-validation.sh`

**驗收流程**（見腳本內容）:
1. 開新市場（LMSR，單選題，3~5 個選項）
2. 進入 Bottom Sheet，確認顯示
3. Buy Yes(i)
4. Buy No(i)
5. 檢查 Positions 頁
6. 壓力測試（快速連點 5 次）

**執行方式**:
```bash
cd prediction-backend
./scripts/e2e-bundle-trade-validation.sh
```

**狀態**: ✅ 已建立腳本

---

## 📝 實作優先順序

### Phase 1: 後端核心功能（必做）
1. ✅ Bundle Quote 二分搜尋保護（upper bound 擴張 + 最小 coin 檢查）
2. ✅ Bundle Trade lock 順序驗證
3. ⏳ Bundle Trade bundleGroupId 支援（需要 migration）

### Phase 2: 測試與驗證（必做）
1. ✅ Bundle Quote 單元測試
2. ✅ Bundle Trade 併發測試
3. ✅ E2E 驗收腳本

### Phase 3: 前端顯示（必做）
1. ⏳ UI 顯示註記
2. ⏳ Bundle Trade 價格變動分層顯示
3. ⏳ 前端 Fallback 策略修正
4. ⏳ Positions 頁平倉群組

---

## 🔍 檢查清單

### 後端
- [ ] Bundle Quote 二分搜尋保護（upper bound 擴張）
- [ ] Bundle Quote 最小 coin 檢查（回傳 shares=0）
- [ ] Bundle Trade bundleGroupId 支援
- [ ] Positions Grouped API
- [ ] 所有單元測試通過
- [ ] 併發測試通過

### 前端
- [ ] UI 顯示註記（單選題 NO 說明）
- [ ] Bundle Trade 價格變動分層顯示
- [ ] 前端 Fallback 策略修正（不用 Parimutuel 當 LMSR fallback）
- [ ] Positions 頁平倉群組顯示
- [ ] 一鍵平倉功能

### 驗收
- [ ] E2E 驗收腳本執行
- [ ] 所有檢查項目通過

---

**文件更新時間**: 2025-01-XX
**狀態**: ✅ 所有改進建議已整合到文檔



