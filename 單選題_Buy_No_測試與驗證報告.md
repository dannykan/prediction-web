# 單選題 Buy No(i) Bundle 測試與驗證報告

## 1. Bundle Quote 單元測試

### 1.1 測試檔案

**檔案**: `prediction-backend/src/lmsr/services/bundle-quote.spec.ts`

**主要函式**: `LmsrService.bundleQuote()`

### 1.2 測試場景

#### 基本場景矩陣

| N (選項數) | b (流動性) | coin (金額) | 初始狀態 | 測試目的 |
|-----------|-----------|------------|---------|---------|
| 2 | 80 | 0.01 | 平衡 (100/100) | 極小金額 |
| 2 | 80 | 10 | 平衡 (100/100) | 正常金額 |
| 2 | 80 | 100000 | 平衡 (100/100) | 極大金額 |
| 3 | 80 | 10 | 平衡 (100/100) | 3選項 |
| 5 | 80 | 10 | 平衡 (100/100) | 5選項 |
| 10 | 80 | 10 | 平衡 (100/100) | 10選項 |
| 3 | 500 | 10 | 平衡 (100/100) | 高流動性 |
| 3 | 80 | 10 | 極端偏斜 (1000/10) | yesPrice ~0.99 |
| 3 | 80 | 10 | 極端偏斜 (10/1000) | yesPrice ~0.01 |

### 1.3 斷言檢查

每個測試案例都會驗證：

#### 1.3.1 精度檢查
```typescript
const epsilon = new Decimal('0.0001'); // 1e-4
const totalCost = new Decimal(result.totalGrossAmount).plus(
  new Decimal(result.totalFeeAmount),
);
const inputCoin = new Decimal(testCase.coin);
const diff = totalCost.minus(inputCoin).abs();

expect(diff.lte(epsilon)).toBe(true);
```

**說明**: 總成本與輸入金額的差異必須 ≤ 0.0001

#### 1.3.2 Shares 等量檢查
```typescript
const firstShares = new Decimal(result.components[0].shares);
for (let i = 1; i < result.components.length; i++) {
  const currentShares = new Decimal(result.components[i].shares);
  expect(currentShares.eq(firstShares)).toBe(true);
}
```

**說明**: 所有 component 的 shares 必須完全相等（使用 Decimal 比較）

#### 1.3.3 Shares 非負檢查
```typescript
for (const component of result.components) {
  expect(new Decimal(component.shares).gte(0)).toBe(true);
}
```

**說明**: 所有 shares 必須 ≥ 0

#### 1.3.4 收斂檢查
```typescript
// 隱式檢查：如果測試完成，說明在迭代上限內收斂
expect(result.components.length).toBe(testCase.optionCount);
```

**說明**: 測試完成即表示在迭代上限（50次）內收斂

### 1.4 邊界案例測試

#### 極小金額 (0.0001)
- 測試二分搜尋在極小金額下的穩定性
- 驗證 shares 仍然等量

#### 極大金額 (1000000)
- 測試二分搜尋在極大金額下的穩定性
- 驗證不會溢出或計算錯誤

### 1.5 執行方式

```bash
cd prediction-backend
npm test -- bundle-quote.spec.ts
```

---

## 2. Bundle Trade 併發測試

### 2.1 測試檔案

**檔案**: `prediction-backend/src/lmsr/services/bundle-trade-concurrency.spec.ts`

**主要函式**: `LmsrService.bundleTrade()`

### 2.2 Lock 順序驗證

#### 2.2.1 驗證邏輯

```typescript
// 在 bundleTrade() 中，必須按 optionMarketId 排序後 lock
const optionMarketIds = quote.components
  .map(c => c.optionMarketId)
  .sort(); // 關鍵：必須排序

// Lock 所有 OptionMarket（按 ID 排序，避免死鎖）
const optionMarkets = await Promise.all(
  optionMarketIds.map(id =>
    queryRunner.manager
      .getRepository(OptionMarket)
      .createQueryBuilder('om')
      .setLock('pessimistic_write')
      .where('om.id = :id', { id })
      .getOneOrFail()
  )
);
```

#### 2.2.2 測試檢查點

1. **Lock 順序檢查**:
   - 記錄所有 lock 的 optionMarketId
   - 驗證 lock 順序是排序後的（升序）

2. **程式碼位置**:
   - `prediction-backend/src/lmsr/services/lmsr.service.ts`
   - `bundleTrade()` 方法中的 Step 4

### 2.3 併發測試

#### 2.3.1 測試場景

- **迭代次數**: 100 次
- **併發交易**: 同時執行 100 個 `bundleTrade()` 調用
- **目標選項**: 輪流選擇不同的 option (option-1 到 option-5)
- **用戶**: 每個交易使用不同的用戶 ID

#### 2.3.2 驗證點

```typescript
// 1. 所有 promise 都應該 settle（不會 hang）
const results = await Promise.allSettled(promises);
expect(results.length).toBe(iterations);

// 2. 不應該有未處理的 rejection（deadlock）
const rejected = results.filter((r) => r.status === 'rejected');
expect(rejected.length).toBe(0);
```

#### 2.3.3 預期行為

- ✅ 所有 100 個交易都應該完成或優雅失敗
- ✅ 不應該出現 deadlock（hang 超過 30 秒）
- ✅ 不應該有未處理的 rejection

### 2.4 執行方式

```bash
cd prediction-backend
npm test -- bundle-trade-concurrency.spec.ts
```

---

## 3. 前端顯示規則建議

### 3.1 單選題顯示規則

#### 3.1.1 No 顯示為 1-Yes（僅顯示層）

**規則**:
- 前端顯示時，將「選項 i 的 NO」顯示為 `1 - priceYes(i)`
- 但實際交易仍使用 `bundleQuote` 計算成本（等量 shares bundle）

**原因**:
- 單選題中，所有選項的 `priceYes` 加總應該接近 100%
- 顯示 `1 - priceYes(i)` 更直觀，符合「其他選項中必有一個是正確答案」的邏輯

#### 3.1.2 需要修改的檔案

**檔案**: `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart`

**函式**: `_calculateCurrentProbability()` (約第 226 行)

**修改內容**:
```dart
double _calculateCurrentProbability(MarketOption option) {
  final questionType = _getQuestionType();
  final mechanism = widget.market.mechanism;
  
  // 如果是 LMSR 機制
  if (mechanism == 'LMSR_V1') {
    // 從 API 取得 priceYes（需要先調用 GET /option-markets/market/:marketId）
    final priceYes = option.priceYes ?? 0.5;
    
    if (questionType == 'single') {
      // 單選題：NO 顯示為 1 - YES
      if (_isYesSide) {
        return priceYes * 100;
      } else {
        // 顯示層：NO = 1 - YES
        return (1.0 - priceYes) * 100;
      }
    } else if (questionType == 'multiple') {
      // 多選題：各 option 顯示各自 yesPrice/noPrice
      final priceNo = 1.0 - priceYes;
      return _isYesSide ? priceYes * 100 : priceNo * 100;
    }
  }
  
  // 向後兼容：Parimutuel 邏輯
  // ... 舊邏輯
}
```

#### 3.1.3 需要新增的 API 調用

**檔案**: `prediction-app/lib/features/market/data/market_repository.dart`

**新增方法**:
```dart
/// 取得市場的所有 option markets（含價格）
Future<List<OptionMarketPrice>> getOptionMarketsPrices(String marketId) async {
  try {
    final response = await apiClient.dio.get(
      '/option-markets/market/$marketId'
    );
    
    return (response.data as List)
        .map((item) => OptionMarketPrice.fromJson(item))
        .toList();
  } catch (e) {
    throw Exception('Failed to get option markets prices: $e');
  }
}

class OptionMarketPrice {
  final String id;
  final String optionId;
  final String optionName;
  final double priceYes;
  final double priceNo;
  
  OptionMarketPrice({
    required this.id,
    required this.optionId,
    required this.optionName,
    required this.priceYes,
    required this.priceNo,
  });
  
  factory OptionMarketPrice.fromJson(Map<String, dynamic> json) {
    return OptionMarketPrice(
      id: json['id'],
      optionId: json['optionId'],
      optionName: json['optionName'],
      priceYes: double.parse(json['priceYes']),
      priceNo: double.parse(json['priceNo']),
    );
  }
}
```

**在 market detail 頁面載入時調用**:
```dart
// 在 market_detail_screen.dart 或相關 provider 中
Future<void> loadLmsrPrices(String marketId) async {
  try {
    final prices = await repository.getOptionMarketsPrices(marketId);
    
    // 更新 market model 或 state
    // 將 priceYes 映射到對應的 option
    for (final price in prices) {
      final option = market.options.firstWhere(
        (opt) => opt.id == price.optionId,
        orElse: () => null,
      );
      if (option != null) {
        option.priceYes = price.priceYes;
        option.priceNo = price.priceNo;
      }
    }
  } catch (e) {
    // 處理錯誤
  }
}
```

### 3.2 多選題顯示規則

#### 3.2.1 各 option 顯示各自 yesPrice/noPrice

**規則**:
- 多選題中，每個 option 獨立顯示 `priceYes` 和 `priceNo`
- 不需要 bundle 邏輯，因為每個 option 是獨立的

**修改位置**:
- 同一個檔案：`neo_betting_bottom_sheet.dart`
- 同一個函式：`_calculateCurrentProbability()`

**修改內容**:
```dart
if (questionType == 'multiple') {
  // 多選題：各 option 顯示各自 yesPrice/noPrice
  final priceYes = option.priceYes ?? 0.5;
  final priceNo = 1.0 - priceYes;
  return _isYesSide ? priceYes * 100 : priceNo * 100;
}
```

### 3.3 需要移除的 Parimutuel 邏輯

#### 3.3.1 需要標記為 deprecated 的方法

**檔案**: `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart`

**方法**:
1. `_getYesVolume()` (約第 150 行)
2. `_getNoVolume()` (約第 160 行)

**建議**:
```dart
@Deprecated('Use priceYes/priceNo from LMSR API instead')
double _getYesVolume(MarketOption option) {
  // 舊的 Parimutuel 邏輯
  // ...
}

@Deprecated('Use priceYes/priceNo from LMSR API instead')
double _getNoVolume(MarketOption option) {
  // 舊的 Parimutuel 邏輯
  // ...
}
```

#### 3.3.2 需要修改的機率計算

**檔案**: `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart`

**函式**: `_calculateCurrentProbability()` (約第 226 行)

**舊邏輯（需要移除或標記為 deprecated）**:
```dart
if (questionType == 'single') {
  // ❌ 舊邏輯：使用 Parimutuel 的 volume 計算
  final totalYesVolume = widget.market.options.fold<double>(
    0.0,
    (sum, opt) => sum + _getYesVolume(opt),
  );
  final yes = _getYesVolume(option);
  final yesProb = ((yes / totalYesVolume) * 100);
  // ...
}
```

**新邏輯（優先使用）**:
```dart
if (questionType == 'single' && mechanism == 'LMSR_V1') {
  // ✅ 新邏輯：使用 LMSR 的 priceYes
  final priceYes = option.priceYes ?? 0.5;
  if (_isYesSide) {
    return priceYes * 100;
  } else {
    // 顯示層：NO = 1 - YES
    return (1.0 - priceYes) * 100;
  }
}
```

### 3.4 前端檔案位置總結

| 檔案 | 函式/位置 | 修改內容 |
|------|----------|---------|
| `neo_betting_bottom_sheet.dart` | `_calculateCurrentProbability()` (第 226 行) | 優先使用 LMSR priceYes/priceNo |
| `neo_betting_bottom_sheet.dart` | `_getYesVolume()` (第 150 行) | 標記為 @Deprecated |
| `neo_betting_bottom_sheet.dart` | `_getNoVolume()` (第 160 行) | 標記為 @Deprecated |
| `market_repository.dart` | 新增 `getOptionMarketsPrices()` | 調用 GET /option-markets/market/:marketId |
| `market_detail_screen.dart` | 載入時調用 | 在頁面載入時調用 `getOptionMarketsPrices()` |

---

## 4. 測試執行指令

### 4.1 執行所有測試

```bash
cd prediction-backend
npm test -- bundle-quote.spec.ts bundle-trade-concurrency.spec.ts
```

### 4.2 執行單一測試

```bash
# Bundle Quote 測試
npm test -- bundle-quote.spec.ts

# 併發測試
npm test -- bundle-trade-concurrency.spec.ts
```

### 4.3 執行並顯示覆蓋率

```bash
npm test -- --coverage bundle-quote.spec.ts bundle-trade-concurrency.spec.ts
```

---

## 5. 驗證檢查清單

### 5.1 Bundle Quote 驗證

- [ ] 所有測試案例通過
- [ ] 精度檢查：`abs(totalCost - inputCoin) <= 1e-4`
- [ ] Shares 等量：所有 component 的 shares 相等
- [ ] Shares 非負：所有 shares >= 0
- [ ] 收斂檢查：在 50 次迭代內收斂

### 5.2 Bundle Trade 驗證

- [ ] Lock 順序：按 optionMarketId 排序後 lock
- [ ] 併發測試：100 次併發交易無 deadlock
- [ ] 所有交易都 settle（完成或優雅失敗）

### 5.3 前端顯示驗證

- [ ] 單選題：NO 顯示為 `1 - priceYes`
- [ ] 多選題：各 option 顯示各自 `priceYes`/`priceNo`
- [ ] 調用 LMSR API 取得價格
- [ ] 移除或標記 Parimutuel 邏輯為 deprecated

---

## 6. 實作改進建議（Production 必做）

### 6.1 UI 顯示註記

**問題**: 用戶可能誤解單選題的 NO 為「此選項的反向合約」，實際上是「其他集合」的部位。

**解決方案**: 在 Bottom sheet 加入小字說明

**檔案**: `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart`

**位置**: 在 NO 選項下方加入說明文字

**建議程式碼**:
```dart
if (questionType == 'single' && !_isYesSide) {
  // 顯示註記
  Text(
    '單選題的 NO 代表：「不是此選項（包含其他選項或都不是）」',
    style: TextStyle(
      fontSize: 10,
      color: Colors.grey[600],
      fontStyle: FontStyle.italic,
    ),
  ),
}
```

### 6.2 Bundle Quote 二分搜尋保護

#### 6.2.1 Upper Bound 自動擴張

**問題**: 極端偏斜市場，固定 upper bound 可能找不到 shares。

**解決方案**: 在二分搜尋前自動擴張 upper bound

**檔案**: `prediction-backend/src/lmsr/services/lmsr.service.ts`

**位置**: `bundleQuote()` 方法中的二分搜尋邏輯

**已加入保護**（見實作方案 Step 2）:
- 最多擴張 20 次
- 每次擴張 2 倍
- 如果仍找不到，拋出明確錯誤

#### 6.2.2 TargetCoin 太小時回傳 shares=0

**問題**: 避免出現「0.0000000001 shares」但 UI 顯示成 0 造成體驗怪。

**解決方案**: 設定最小 coin 閾值

**檔案**: `prediction-backend/src/lmsr/services/lmsr.service.ts`

**位置**: `bundleQuote()` 方法開始處

**已加入保護**（見實作方案 Step 2）:
```typescript
const MIN_COIN_THRESHOLD = new Decimal('0.001');
if (totalAmount.lt(MIN_COIN_THRESHOLD)) {
  // 回傳所有 component 的 shares = 0
}
```

### 6.3 Bundle Trade 價格變動顯示

**問題**: 用戶可能困惑「我明明是買 No(i)，為什麼其他 YES 都上升？」

**解決方案**: 分層顯示

**檔案**: `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart`

**顯示邏輯**:

**預設顯示**:
- 總花費（含 fee）
- 你會獲得的 bundle shares（同一數字）
- 你選的目標選項（i）會變多少（p_yes before/after）

**「展開更多」才顯示**:
- 其他 options 的 p_yes before/after
- 各 component 的詳細成本

**建議 UI 結構**:
```dart
// 預設顯示
Column(
  children: [
    Text('總花費: ${totalCost}'),
    Text('Bundle Shares: ${totalShares}'),
    Text('選項 ${targetOption.name}: ${priceYesBefore} → ${priceYesAfter}'),
    // 「展開更多」按鈕
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

### 6.4 Positions 頁平倉群組

**問題**: 一次 Buy No(i) 會生成多個 component positions，用戶會看到一排持倉，很像 bug。

**解決方案**: 使用 bundleGroupId 群組顯示

#### 6.4.1 後端修改

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

#### 6.4.2 Positions API 修改

**檔案**: `prediction-backend/src/lmsr/lmsr.controller.ts`

**新增端點**:
```typescript
@Get(':marketId/positions-grouped')
@UseGuards(JwtAuthGuard)
async getUserPositionsGrouped(
  @Param('marketId') marketId: string,
  @Request() req: { user: { id: string } },
) {
  return this.lmsrService.getUserPositionsGrouped(req.user.id, marketId);
}
```

**Service 方法**:
```typescript
async getUserPositionsGrouped(userId: string, marketId: string) {
  const positions = await this.getUserPositions(userId, marketId);
  
  // 取得所有相關的 trades
  const optionMarketIds = positions.map(p => p.optionMarketId);
  const trades = await this.tradeRepo.find({
    where: {
      userId,
      optionMarketId: In(optionMarketIds),
    },
    order: { createdAt: 'DESC' },
  });
  
  // 按 bundleGroupId 分組
  const grouped = new Map<string, {
    bundleGroupId: string;
    createdAt: Date;
    components: Array<{
      optionId: string;
      optionName: string;
      side: 'BUY_YES' | 'BUY_NO';
      shares: string;
      priceYesBefore: string;
      priceYesAfter: string;
    }>;
    totalShares: string;
    totalCost: string;
  }>();
  
  for (const trade of trades) {
    if (!trade.bundleGroupId) continue;
    
    if (!grouped.has(trade.bundleGroupId)) {
      grouped.set(trade.bundleGroupId, {
        bundleGroupId: trade.bundleGroupId,
        createdAt: trade.createdAt,
        components: [],
        totalShares: '0',
        totalCost: '0',
      });
    }
    
    const group = grouped.get(trade.bundleGroupId)!;
    // 加入 component 資訊
    // ...
  }
  
  return Array.from(grouped.values());
}
```

#### 6.4.3 前端 UI 顯示

**檔案**: `prediction-app/lib/features/market/screens/positions_screen.dart` (需要新建)

**顯示邏輯**:
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

### 6.5 前端 Fallback 策略

**問題**: 不要用 Parimutuel 邏輯當 LMSR 的 fallback（會重新引入錯誤）。

**解決方案**: 更安全的 fallback 策略

**檔案**: `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart`

**修改 `_calculateCurrentProbability()`**:
```dart
double _calculateCurrentProbability(MarketOption option) {
  final questionType = _getQuestionType();
  final mechanism = widget.market.mechanism;
  
  // ✅ 正確的 fallback 策略
  if (mechanism == 'LMSR_V1') {
    // 嘗試使用 LMSR 價格
    final priceYes = option.priceYes;
    
    if (priceYes != null) {
      // 成功取得價格
      if (questionType == 'single') {
        return _isYesSide ? priceYes * 100 : (1.0 - priceYes) * 100;
      } else if (questionType == 'multiple') {
        final priceNo = 1.0 - priceYes;
        return _isYesSide ? priceYes * 100 : priceNo * 100;
      }
    } else {
      // ❌ 價格 API 失敗：顯示 50% + 提示
      // 不要用 Parimutuel 邏輯！
      if (kDebugMode) {
        print('⚠️ LMSR price not available, showing 50% with warning');
      }
      // 可以顯示一個小提示：「價格載入失敗，請重試」
      return 50.0; // 中性值
    }
  }
  
  // 只有當 mechanism != LMSR 時才使用 Parimutuel
  if (mechanism != 'LMSR_V1') {
    // 舊的 Parimutuel 邏輯
    // ...
  }
  
  // 最後 fallback
  return 50.0;
}
```

**顯示提示**:
```dart
if (mechanism == 'LMSR_V1' && option.priceYes == null) {
  // 顯示小提示
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

---

## 7. E2E 人類驗收腳本

### 7.1 驗收流程

**市場設定**: 單選題（3~5 個選項），LMSR 機制

#### Step 1: 開新市場（LMSR）
- [ ] 創建單選題市場（3~5 個選項）
- [ ] 確認機制為 LMSR_V1
- [ ] 確認所有選項初始價格合理（總和接近 100%）

#### Step 2: 進入 Bottom Sheet，確認顯示
- [ ] 選擇某選項，打開 bottom sheet
- [ ] 確認 YES + NO 顯示互補（四捨五入可差 0.1%）
- [ ] 確認有註記：「單選題的 NO 代表：『不是此選項（包含其他選項或都不是）』」

#### Step 3: Buy Yes(i)
- [ ] 投入 10 coin 買入選項 i 的 YES
- [ ] 確認交易成功
- [ ] 回到列表，確認：
  - [ ] 選項 i 的 YES% 上升
  - [ ] 其他選項的 YES% 下降（正常）

#### Step 4: Buy No(i)
- [ ] 投入 10 coin 買入選項 i 的 NO
- [ ] 確認交易成功
- [ ] 回到列表，確認：
  - [ ] 選項 i 的 YES% 下降（或 NO 顯示上升）
  - [ ] 其他選項的 YES% 上升（正常）

#### Step 5: 檢查 Positions 頁
- [ ] 進入「當前持倉」頁
- [ ] 確認：
  - [ ] 看得到 bundle 群組（若已實作）
  - [ ] 可以一鍵平倉（或逐筆平倉）
  - [ ] 顯示正確的 shares 和價值

#### Step 6: 壓力測試
- [ ] 重複快速連點 5 次 Buy Yes(i)
- [ ] 重複快速連點 5 次 Buy No(i)
- [ ] 確認：
  - [ ] 無 race condition
  - [ ] 所有交易都成功
  - [ ] 價格變動合理

### 7.2 驗收檢查清單

- [ ] ✅ 機率顯示正確（YES + NO = 100%，誤差 < 0.1%）
- [ ] ✅ Bundle Quote 計算正確（總成本接近輸入金額）
- [ ] ✅ Bundle Trade 執行成功（無 deadlock）
- [ ] ✅ Positions 群組顯示正確
- [ ] ✅ 平倉功能正常
- [ ] ✅ 無 race condition
- [ ] ✅ UI 註記清楚
- [ ] ✅ Fallback 策略安全（不會用 Parimutuel 當 LMSR fallback）

### 7.3 驗收腳本檔案

**檔案**: `prediction-backend/scripts/e2e-bundle-trade-validation.sh`

```bash
#!/bin/bash

# E2E Bundle Trade 驗收腳本
# 需要手動執行，並在 App 中驗證

echo "=== E2E Bundle Trade 驗收腳本 ==="
echo ""
echo "請按照以下步驟在 App 中驗證："
echo ""
echo "1. 開新市場（LMSR，單選題，3~5 個選項）"
echo "2. 進入某選項 bottom sheet，確認："
echo "   - YES + NO 顯示互補（誤差 < 0.1%）"
echo "   - 有註記說明"
echo "3. Buy Yes(i) 投入 10 coin"
echo "4. 回到列表，確認："
echo "   - i 的 YES% 上升"
echo "   - 其他選項 YES% 下降"
echo "5. Buy No(i) 投入 10 coin"
echo "6. 回到列表，確認："
echo "   - i 的 YES% 下降"
echo "   - 其他選項 YES% 上升"
echo "7. 到「當前持倉」頁："
echo "   - 看得到 bundle 群組"
echo "   - 可以一鍵平倉"
echo "8. 重複快速連點 5 次（測 race condition）"
echo ""
echo "驗收完成後，請記錄結果。"
```

---

## 8. 注意事項

### 6.1 測試環境

- 需要 Mock 所有資料庫操作
- 需要 Mock `quoteFromState()` 方法（或使用真實的 LMSR 計算）
- 併發測試可能需要較長時間（30 秒 timeout）

### 6.2 前端整合

- 需要確保 `GET /option-markets/market/:marketId` API 已實現
- 需要更新 `MarketModel` 或 `MarketOption` 以包含 `priceYes`/`priceNo` 欄位
- 需要處理 API 調用失敗的情況（fallback 到 Parimutuel 邏輯）

### 6.3 向後兼容

- 保留 Parimutuel 邏輯作為 fallback
- 標記為 deprecated，但不立即移除
- 確保舊市場（Parimutuel）仍能正常顯示

---

**報告完成時間**: 2025-01-XX
**報告作者**: AI Assistant

