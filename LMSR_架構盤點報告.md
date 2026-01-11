# 現有市場與 LMSR 交易架構盤點報告

## 目標
支援 3 種題型：
- **是非題**：二元 YES/NO
- **單選題**：多個選項互斥 + 需支援每個選項 Buy Yes / Buy No(i)，且可能 None（全部 No 正確）
- **多選題**：多真，每個選項獨立 YES/NO

---

## 1. 現有 Entity/DB 盤點

### 1.1 核心 Entity 檔案路徑

#### Market Entity
**檔案**: `prediction-backend/src/markets/entities/market.entity.ts`

**關鍵欄位**:
```typescript
- id: uuid (PK)
- title: string
- description: text (nullable)
- questionType: 'YES_NO' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' (varchar(20))
- mechanism: MarketMechanism (varchar(20), default: 'PARIMUTUEL_V1')
- options: jsonb (Array<{ id: string; name: string }>)
- winningOptionId: string (nullable) // 舊欄位，單一答案
- winningOptionIds: string[] (text array) // 新欄位，支援多選
- status: MarketStatus (enum: OPEN, LOCKED, SETTLED, VOID, DELETED)
- createdBy: uuid (nullable)
- volume: decimal(20,2) // 總交易量
- rules: jsonb // 規則物件
- shortCode: varchar(12) (unique, NOT NULL)
```

**關聯**:
- `bets`: OneToMany → Bet[]
- `comments`: OneToMany → Comment[]
- `category`: ManyToOne → Category

#### OptionMarket Entity (LMSR 核心)
**檔案**: `prediction-backend/src/lmsr/entities/option-market.entity.ts`

**關鍵欄位**:
```typescript
- id: uuid (PK)
- optionId: uuid (unique) // 對應 Market.options[].id
- b: numeric(36,18) // LMSR liquidity parameter
- qYes: numeric(36,18) // Quantity of YES shares
- qNo: numeric(36,18) // Quantity of NO shares
- status: OptionMarketStatus (enum: OPEN, CLOSED, RESOLVED)
- version: number // Optimistic locking (VersionColumn)
```

**索引**:
- `IDX_option_markets_optionId` (unique on optionId)

**重要發現**:
- ✅ **每個 option 有獨立的 LMSR state** (qYes, qNo, b)
- ✅ **使用 optimistic lock** (version column)
- ✅ **使用 PostgreSQL numeric** (precision: 36, scale: 18)

#### Trade Entity
**檔案**: `prediction-backend/src/lmsr/entities/trade.entity.ts`

**關鍵欄位**:
```typescript
- id: uuid (PK)
- userId: uuid
- optionMarketId: uuid // 指向 OptionMarket.id
- side: TradeSide ('BUY_YES' | 'SELL_YES' | 'BUY_NO' | 'SELL_NO')
- shares: numeric(36,18) // 交易股數
- grossAmount: numeric(36,18) // 成本或收益（正數）
- feeAmount: numeric(36,18) // 手續費
- netAmount: numeric(36,18) // 用戶錢包變動：buy=-(gross+fee), sell=+(gross-fee)
- priceYesBefore: numeric(36,18) // 交易前 YES 價格
- priceYesAfter: numeric(36,18) // 交易後 YES 價格
- qYesBefore/qYesAfter: numeric(36,18) // 交易前後 qYes
- qNoBefore/qNoAfter: numeric(36,18) // 交易前後 qNo
- createdAt: timestamp
```

**索引**:
- `IDX_trades_userId`
- `IDX_trades_optionMarketId`
- `IDX_trades_createdAt`

#### Position Entity
**檔案**: `prediction-backend/src/lmsr/entities/position.entity.ts`

**關鍵欄位**:
```typescript
- id: uuid (PK)
- userId: uuid
- optionMarketId: uuid // 指向 OptionMarket.id
- yesShares: numeric(36,18) // 用戶持有的 YES 股數
- noShares: numeric(36,18) // 用戶持有的 NO 股數
- updatedAt: timestamp
```

**索引**:
- `UQ_positions_userId_optionMarketId` (unique on userId + optionMarketId)

#### OptionResolution Entity
**檔案**: `prediction-backend/src/lmsr/entities/option-resolution.entity.ts`

**關鍵欄位**:
```typescript
- id: uuid (PK)
- optionMarketId: uuid (unique) // 指向 OptionMarket.id
- outcome: OptionOutcome ('YES' | 'NO')
- resolvedAt: timestamp
```

#### Bet Entity (舊系統，Parimutuel)
**檔案**: `prediction-backend/src/bets/entities/bet.entity.ts`

**關鍵欄位**:
```typescript
- id: uuid (PK)
- userId: uuid
- marketId: uuid // 指向 Market.id
- selectionId: string // 選項 ID
- side: BetSide ('YES' | 'NO')
- stakeAmount: decimal(20,2) // 下注金額
- potentialWin: decimal(20,2) // 潛在收益
- status: BetStatus (enum: PENDING, WON, LOST, REFUNDED)
```

**注意**: 此 Entity 用於舊的 Parimutuel 機制，LMSR 系統使用 Trade Entity。

#### User Entity
**檔案**: `prediction-backend/src/users/entities/user.entity.ts`

**關鍵欄位**:
```typescript
- id: uuid (PK)
- coinBalance: decimal(20,2) // 用戶餘額
- totalTurnover: bigint // 總轉換點（用於等級計算）
- rankLevel: int // 等級
```

#### Transaction Entity (Wallet Ledger)
**檔案**: `prediction-backend/src/transactions/entities/transaction.entity.ts`

**關鍵欄位**:
```typescript
- id: uuid (PK)
- userId: uuid
- amount: decimal(15,2) // 交易金額（正數=收入，負數=支出）
- type: TransactionType (enum)
- description: text
- balanceAfter: decimal(15,2) // 交易後餘額
- referenceId: uuid (nullable) // 關聯的 Trade.id 或 Bet.id
- createdAt: timestamp
```

**重要發現**:
- ✅ **有完整的 wallet ledger** (Transaction Entity)
- ✅ **每次交易都會記錄 balanceAfter**，可用於對帳

### 1.2 Migration 檔案

**LMSR 相關 Migration**:
- `prediction-backend/src/migrations/1770000000000-AddLmsrTables.ts`
  - 建立 `option_markets` 表
  - 建立 `positions` 表
  - 建立 `trades` 表
  - 建立 `option_resolutions` 表
  - 在 `markets` 表新增 `mechanism` 欄位

---

## 2. LMSR State 存儲位置

### 2.1 存儲結構

**LMSR 參數存儲在 `option_markets` 表**:
- `b`: numeric(36,18) - 流動性參數
- `qYes`: numeric(36,18) - YES 股數
- `qNo`: numeric(36,18) - NO 股數

### 2.2 存儲粒度

**✅ 每個 option 有獨立的 LMSR state**

**證據**:
- `OptionMarket` Entity 中 `optionId` 是 unique
- 每個 `Market.options[]` 中的選項，對應一個 `OptionMarket` 記錄
- 每個 `OptionMarket` 有獨立的 `qYes`, `qNo`, `b`

**範例**:
```
Market: "誰會贏得選舉？"
  - Option A: { id: "opt_a", name: "候選人A" }
    → OptionMarket { optionId: "opt_a", qYes: 100, qNo: 50, b: 1000 }
  - Option B: { id: "opt_b", name: "候選人B" }
    → OptionMarket { optionId: "opt_b", qYes: 80, qNo: 70, b: 1000 }
```

### 2.3 數據類型

**✅ 使用 PostgreSQL numeric(36,18)**
- 高精度，避免浮點誤差
- 適合金融計算

---

## 3. API Endpoints

### 3.1 LMSR Controller

**檔案**: `prediction-backend/src/lmsr/lmsr.controller.ts`
**Base Path**: `/option-markets`

#### Quote API
```typescript
POST /option-markets/:id/quote
- 功能: 取得報價（不執行交易）
- 認證: ❌ 不需要（公開端點）
- Service: LmsrService.quote()
- DTO: QuoteDto { side, amountType, amount }
- 返回: QuoteResult { shares, grossAmount, feeAmount, netAmount, priceYesBefore, priceYesAfter, ... }
```

#### Trade API
```typescript
POST /option-markets/:id/trade
- 功能: 執行交易
- 認證: ✅ 需要 (JwtAuthGuard)
- Service: LmsrService.trade()
- DTO: QuoteDto { side, amountType, amount }
- 返回: QuoteResult
```

#### Get Option Markets by Market ID
```typescript
GET /option-markets/market/:marketId
- 功能: 取得市場的所有 option markets（含價格）
- 認證: ❌ 不需要
- Service: LmsrService.getOptionMarketsByMarketId()
- 返回: Array<{ id, optionId, optionName, b, qYes, qNo, priceYes, priceNo, status }>
```

#### Get User Positions
```typescript
GET /option-markets/:marketId/positions
- 功能: 取得用戶在該市場的所有 positions
- 認證: ✅ 需要 (JwtAuthGuard)
- Service: LmsrService.getUserPositions()
- 返回: Position[]
```

### 3.2 Service 函式

**檔案**: `prediction-backend/src/lmsr/services/lmsr.service.ts`

#### quote()
```typescript
async quote(optionMarketId: string, userId: string | null, dto: QuoteDto): Promise<QuoteResult>
- 位置: 第 45-71 行
- 功能: 計算報價（不執行交易）
- 邏輯:
  1. 載入 OptionMarket
  2. 載入用戶 Position (如果 userId 存在)
  3. 調用 quoteFromState() 計算報價
```

#### trade()
```typescript
async trade(optionMarketId: string, userId: string, dto: QuoteDto): Promise<QuoteResult>
- 位置: 第 76-251 行
- 功能: 執行交易（原子操作）
- 邏輯:
  1. 開啟 Transaction
  2. Lock OptionMarket (pessimistic_write)
  3. Lock User (pessimistic_write)
  4. 載入/建立 Position
  5. 計算 quote
  6. 驗證餘額/持股
  7. 計算手續費
  8. 更新 OptionMarket state
  9. 更新 Position
  10. 更新 User balance
  11. 建立 Trade 記錄
  12. 建立 Transaction 記錄
  13. Commit Transaction
```

#### quoteFromState()
```typescript
private quoteFromState(market: OptionMarket, position: Position | null, dto: QuoteDto): QuoteResult
- 位置: 第 256-339 行
- 功能: 從當前市場狀態計算報價
- 邏輯:
  1. 計算交易前價格 (priceYesBefore)
  2. 根據 amountType (COIN/SHARES) 計算 shares
  3. 根據 side 計算 grossAmount 和新的 qYes/qNo
  4. 計算手續費
  5. 計算 netAmount
  6. 計算交易後價格 (priceYesAfter)
```

### 3.3 重要發現

**✅ 有完整的 quote 設計**
- `POST /option-markets/:id/quote` 提供報價預覽
- 前端可以先調用 quote 顯示預期結果，再調用 trade 執行

**✅ Trade 支援 4 種 side**:
- `BUY_YES`: 買入 YES 股
- `SELL_YES`: 賣出 YES 股
- `BUY_NO`: 買入 NO 股
- `SELL_NO`: 賣出 NO 股

**❌ 目前沒有 bundle 交易設計**
- 單選題的 "Buy No(i)" 需要同時買入多個選項的 NO，目前沒有 API 支援

---

## 4. 交易一致性

### 4.1 Transaction 使用

**✅ Trade 使用 Transaction**

**證據** (`lmsr.service.ts` 第 81-250 行):
```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  // ... 所有操作都在 transaction 內
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

### 4.2 Lock 機制

**✅ 使用 Pessimistic Write Lock**

**證據**:
```typescript
// Lock OptionMarket
const market = await queryRunner.manager
  .getRepository(OptionMarket)
  .createQueryBuilder('m')
  .setLock('pessimistic_write')
  .where('m.id = :id', { id: optionMarketId })
  .getOneOrFail();

// Lock User
const user = await queryRunner.manager
  .getRepository(User)
  .createQueryBuilder('u')
  .setLock('pessimistic_write')
  .where('u.id = :userId', { userId })
  .getOneOrFail();
```

**✅ OptionMarket 有 Optimistic Lock**
- `version` column (VersionColumn)
- 但 trade() 中使用的是 pessimistic lock，更安全

### 4.3 數據類型

**✅ 使用 PostgreSQL numeric**

**證據**:
- `OptionMarket`: `b`, `qYes`, `qNo` → `numeric(36,18)`
- `Trade`: `shares`, `grossAmount`, `feeAmount`, `netAmount` → `numeric(36,18)`
- `Position`: `yesShares`, `noShares` → `numeric(36,18)`

**❌ User.coinBalance 使用 decimal(20,2)**
- 精度較低，但對餘額顯示足夠

### 4.4 Wallet Ledger

**✅ 有完整的 Transaction 記錄**

**證據** (`lmsr.service.ts` 第 228-236 行):
```typescript
const transaction = queryRunner.manager.getRepository(Transaction).create({
  userId,
  type: TransactionType.BET_STAKE, // 使用現有類型
  amount: parseFloat(netAmountDecimal.toString()),
  description: `LMSR Trade: ${dto.side} ${quote.shares} shares`,
  balanceAfter: parseFloat(newBalance.toString()),
  referenceId: trade.id,
});
await queryRunner.manager.getRepository(Transaction).save(transaction);
```

**重要發現**:
- ✅ 每次交易都會記錄 Transaction
- ✅ 記錄 `balanceAfter`，可用於對帳
- ✅ 記錄 `referenceId` 指向 Trade.id

---

## 5. 前端資料綁定

### 5.1 Market Detail 頁面機率計算

**檔案**: `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart`

#### 機率計算邏輯 (第 226-261 行)

**是非題 (binary)**:
```dart
double _calculateCurrentProbability(MarketOption option) {
  if (questionType == 'binary') {
    final total = _resolvedMarketTotalPoolsVolume();
    if (total <= 0) return 50.0;
    final selectedVol = (option.volume ?? 0.0);
    return ((selectedVol / total) * 100).clamp(0.0, 100.0);
  }
}
```
- **問題**: 使用 `option.volume`，這是 Parimutuel 系統的欄位
- **LMSR 系統應該使用**: `priceYes = e^(qYes/b) / (e^(qYes/b) + e^(qNo/b))`

**單選題 (single)**:
```dart
if (questionType == 'single') {
  // 答案A-yes機率 = 投注答案A-yes G coin / (投注答案A-yes G coin + 投注答案B-yes G coin + ...)
  final totalYesVolume = widget.market.options.fold<double>(
    0.0,
    (sum, opt) => sum + _getYesVolume(opt),
  );
  final yes = _getYesVolume(option);
  final yesProb = ((yes / totalYesVolume) * 100);
  final selectedProb = _isYesSide ? yesProb : (100.0 - yesProb);
  return selectedProb;
}
```
- **問題**: 使用 `_getYesVolume(opt)`，這是 Parimutuel 系統的欄位
- **LMSR 系統應該使用**: 每個 option 的 `priceYes`（從 `GET /option-markets/market/:marketId` 取得）

**多選題 (multiple)**:
```dart
// multiple
final yes = _getYesVolume(option);
final no = _getNoVolume(option);
final denom = yes + no;
if (denom <= 0) return 50.0;
final yesProb = ((yes / denom) * 100);
final selectedProb = _isYesSide ? yesProb : (100.0 - yesProb);
return selectedProb;
```
- **問題**: 使用 `_getYesVolume()` 和 `_getNoVolume()`，這是 Parimutuel 系統的欄位
- **LMSR 系統應該使用**: 每個 option 的 `priceYes` 和 `priceNo`

### 5.2 機率不加總 100% 的可能原因

**原因 1: 前端使用 Parimutuel 邏輯計算 LMSR 市場**
- 前端使用 `option.volume` 或 `_getYesVolume()` 計算機率
- 這些欄位是 Parimutuel 系統的，不適用於 LMSR
- **位置**: `neo_betting_bottom_sheet.dart` 第 226-261 行

**原因 2: 單選題機率計算邏輯錯誤**
- 單選題應該顯示「該選項是正確答案的機率」
- 但前端計算的是「該選項 YES 佔所有 YES 的比例」
- 這會導致所有選項的 YES 機率加總 = 100%，但每個選項的 NO 機率沒有考慮

**原因 3: 前端沒有調用 LMSR quote API**
- 前端應該調用 `GET /option-markets/market/:marketId` 取得每個 option 的 `priceYes` 和 `priceNo`
- 但前端目前使用 `MarketModel` 的 `options[].volume` 欄位

### 5.3 前端如何取得機率

**應該的流程**:
1. 調用 `GET /option-markets/market/:marketId` 取得所有 option markets
2. 從返回的資料中取得每個 option 的 `priceYes` 和 `priceNo`
3. 顯示機率 = `priceYes * 100` (YES) 或 `priceNo * 100` (NO)

**目前問題**:
- ❌ 前端沒有調用此 API
- ❌ 前端使用 `MarketModel.options[].volume` 計算機率

---

## 6. 最小改動建議

### 6.1 支援多選題

**現狀**:
- ✅ 每個 option 已有獨立的 LMSR state (`OptionMarket`)
- ✅ 每個 option 可獨立交易 YES/NO
- ✅ 前端 `questionType` 已支援 `MULTIPLE_CHOICE`

**需要改動**:
1. **前端機率顯示**:
   - 調用 `GET /option-markets/market/:marketId` 取得每個 option 的 `priceYes`/`priceNo`
   - 使用 `priceYes * 100` 顯示 YES 機率，`priceNo * 100` 顯示 NO 機率
   - **檔案**: `neo_betting_bottom_sheet.dart` 第 226-261 行

2. **結算邏輯**:
   - 後端 `settleMarket()` 已支援 `winningOptionIds: string[]`（多選）
   - 需要確認每個 option 的 `OptionResolution` 正確建立
   - **檔案**: `markets.service.ts` 第 1947 行

### 6.2 支援單選題 + Buy No(i) + None

**現狀**:
- ✅ 每個 option 可獨立交易 YES/NO
- ❌ 沒有 bundle 交易 API（同時買入多個 option 的 NO）

**需要改動**:

#### 6.2.1 新增 Bundle Quote API

**新增端點**:
```typescript
POST /option-markets/bundle/quote
- Body: {
    marketId: string,
    bundleType: 'BUY_NO_ALL_EXCEPT' | 'BUY_NO_SELECTED',
    exceptOptionIds?: string[], // BUY_NO_ALL_EXCEPT 時排除的選項
    selectedOptionIds?: string[], // BUY_NO_SELECTED 時選中的選項
    amountType: 'COIN' | 'SHARES',
    amount: string
  }
- 返回: {
    totalShares: string,
    totalGrossAmount: string,
    totalFeeAmount: string,
    totalNetAmount: string,
    components: Array<{
      optionMarketId: string,
      optionId: string,
      optionName: string,
      shares: string,
      grossAmount: string,
      priceYesBefore: string,
      priceYesAfter: string
    }>
  }
```

**實作位置**: `prediction-backend/src/lmsr/services/lmsr.service.ts`

#### 6.2.2 新增 Bundle Trade API

**新增端點**:
```typescript
POST /option-markets/bundle/trade
- 認證: ✅ 需要
- Body: 同 bundle/quote
- 返回: 同 bundle/quote
```

**實作邏輯**:
1. 開啟 Transaction
2. 對每個 option market 執行 quote
3. 驗證總 netAmount（用戶餘額足夠）
4. Lock 所有相關的 OptionMarket (pessimistic_write)
5. Lock User
6. 對每個 option market 執行 trade（更新 state、position）
7. 更新 User balance（總 netAmount）
8. 建立多個 Trade 記錄（每個 option 一個）
9. 建立一個 Transaction 記錄（總金額）
10. Commit Transaction

**實作位置**: `prediction-backend/src/lmsr/services/lmsr.service.ts`

#### 6.2.3 支援 None（全部 No 正確）

**現狀**:
- ✅ 後端 `settleMarket()` 已支援 `winningOptionIds: []`（無正確答案）
- ✅ 前端已支援 "無正確答案" 選項

**需要確認**:
- 當 `winningOptionIds: []` 時，所有 option 的 `OptionResolution` 應該設為 `NO`
- **檔案**: `markets.service.ts` 第 2166-2173 行（`settleMarketWithNoAnswer`）

### 6.3 平倉在 Positions 頁面

**現狀**:
- ✅ 有 `GET /option-markets/:marketId/positions` API
- ❌ 沒有專門的「平倉」API（但可以通過 SELL_YES/SELL_NO 實現）

**需要改動**:

#### 6.3.1 新增 Close Position API

**新增端點**:
```typescript
POST /option-markets/:optionMarketId/close-position
- 認證: ✅ 需要
- Body: {
    closeType: 'CLOSE_ALL' | 'CLOSE_YES' | 'CLOSE_NO' | 'CLOSE_PARTIAL',
    closeYesShares?: string, // CLOSE_PARTIAL 時指定
    closeNoShares?: string,  // CLOSE_PARTIAL 時指定
    amountType: 'COIN' | 'SHARES'
  }
- 返回: {
    closedYesShares: string,
    closedNoShares: string,
    totalPayout: string,
    totalFee: string,
    netPayout: string,
    trades: Trade[] // 建立的交易記錄
  }
```

**實作邏輯**:
1. 載入用戶 Position
2. 根據 `closeType` 決定要平倉的股數
3. 如果 `closeType === 'CLOSE_ALL'`:
   - 如果 `yesShares > 0`: 調用 `trade()` with `SELL_YES`
   - 如果 `noShares > 0`: 調用 `trade()` with `SELL_NO`
4. 返回總收益

**實作位置**: `prediction-backend/src/lmsr/services/lmsr.service.ts`

#### 6.3.2 前端 Positions 頁面

**需要新增**:
- 顯示用戶所有 positions（從 `GET /option-markets/:marketId/positions`）
- 顯示每個 position 的：
  - Option 名稱
  - YES 股數 / NO 股數
  - 當前價值（根據當前 priceYes/priceNo 計算）
  - 平倉按鈕

**檔案**: 需要新建或修改現有的 positions 頁面

### 6.4 需要新增/修改的表與欄位

#### 6.4.1 不需要新增表
- ✅ 現有表結構已足夠支援所有需求

#### 6.4.2 可能需要新增的欄位

**OptionMarket 表**:
- ❌ 不需要新增欄位

**Trade 表**:
- 可選: `bundleTradeId: uuid (nullable)` - 如果是 bundle 交易的一部分，指向 bundle 交易的 ID
- 可選: `bundleIndex: int (nullable)` - 在 bundle 中的順序

**建議**: 先不新增，等 bundle 交易實作後再決定是否需要

#### 6.4.3 Migration 檔案

**新建 Migration**:
```typescript
// prediction-backend/src/migrations/1771000000000-AddBundleTradeFields.ts
// 如果需要 bundleTradeId 和 bundleIndex 欄位
```

---

## 7. 關鍵發現總結

### 7.1 ✅ 已有且完善的設計

1. **LMSR State 存儲**:
   - ✅ 每個 option 有獨立的 LMSR state
   - ✅ 使用 PostgreSQL numeric(36,18)，高精度
   - ✅ 使用 optimistic lock (version column)

2. **交易一致性**:
   - ✅ Trade 使用 Transaction
   - ✅ 使用 Pessimistic Write Lock
   - ✅ 有完整的 Wallet Ledger (Transaction Entity)

3. **Quote 設計**:
   - ✅ 有完整的 quote API (`POST /option-markets/:id/quote`)
   - ✅ 支援 4 種 side (BUY_YES, SELL_YES, BUY_NO, SELL_NO)

4. **Wallet Ledger**:
   - ✅ 每次交易都記錄 Transaction
   - ✅ 記錄 balanceAfter，可用於對帳
   - ✅ 記錄 referenceId 指向 Trade.id

### 7.2 ❌ 需要改動的地方

1. **前端機率顯示**:
   - ❌ 前端使用 Parimutuel 邏輯計算 LMSR 市場機率
   - ❌ 前端沒有調用 `GET /option-markets/market/:marketId` 取得價格
   - **位置**: `neo_betting_bottom_sheet.dart` 第 226-261 行

2. **Bundle 交易**:
   - ❌ 沒有 bundle quote API
   - ❌ 沒有 bundle trade API
   - **需要**: 新增 `POST /option-markets/bundle/quote` 和 `POST /option-markets/bundle/trade`

3. **平倉功能**:
   - ❌ 沒有專門的 close position API
   - **需要**: 新增 `POST /option-markets/:optionMarketId/close-position`

### 7.3 ⚠️ 需要注意的事項

1. **單選題機率計算**:
   - 單選題應該顯示「該選項是正確答案的機率」
   - 但 LMSR 系統中，每個 option 的 `priceYes` 是「該 option 為 YES 的機率」
   - 對於單選題，所有 option 的 `priceYes` 加總應該 = 100%
   - 如果不等於 100%，可能是初始流動性分配不均

2. **None（全部 No 正確）**:
   - 後端已支援 `winningOptionIds: []`
   - 需要確認所有 option 的 `OptionResolution` 正確設為 `NO`

3. **前端資料綁定**:
   - 前端 `MarketModel` 可能需要新增欄位來存儲 LMSR 價格
   - 或前端在顯示時動態調用 `GET /option-markets/market/:marketId`

---

## 8. 不確定的地方（需要確認）

1. **前端是否已調用 LMSR API**:
   - 需要確認前端是否有調用 `GET /option-markets/market/:marketId`
   - 需要確認前端是否有調用 `POST /option-markets/:id/quote`

2. **Market.mechanism 欄位**:
   - 需要確認現有市場的 `mechanism` 欄位值
   - 需要確認如何區分 Parimutuel 和 LMSR 市場

3. **初始流動性分配**:
   - 需要確認創建 LMSR 市場時，如何分配初始流動性到每個 option
   - 需要確認 `b` 參數如何設定

4. **結算邏輯**:
   - 需要確認 LMSR 市場結算時，如何處理 `OptionResolution`
   - 需要確認如何計算用戶收益

---

## 附錄：關鍵檔案路徑

### Backend
- `prediction-backend/src/lmsr/entities/option-market.entity.ts`
- `prediction-backend/src/lmsr/entities/trade.entity.ts`
- `prediction-backend/src/lmsr/entities/position.entity.ts`
- `prediction-backend/src/lmsr/entities/option-resolution.entity.ts`
- `prediction-backend/src/lmsr/lmsr.controller.ts`
- `prediction-backend/src/lmsr/services/lmsr.service.ts`
- `prediction-backend/src/lmsr/services/lmsr-math.service.ts`
- `prediction-backend/src/lmsr/dto/quote.dto.ts`
- `prediction-backend/src/markets/entities/market.entity.ts`
- `prediction-backend/src/transactions/entities/transaction.entity.ts`
- `prediction-backend/src/migrations/1770000000000-AddLmsrTables.ts`

### Frontend
- `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart` (機率計算)
- `prediction-app/lib/features/market/screens/market_detail_screen.dart`

---

**報告完成時間**: 2025-01-XX
**報告作者**: AI Assistant (NestJS/TypeORM 架構師)



