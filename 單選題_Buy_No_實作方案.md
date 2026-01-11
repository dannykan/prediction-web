# 單選題 Buy No(i) 最小改動實作方案

## ⚠️ 重要修正說明

**核心修正**: Buy No(i) 的 bundle 必須使用**等量 shares**，而非金額比例分配。

**正確語義**:
- Buy No(i) = BUY_NO(option i) 的 shares = S
- 同時對所有其他 option j≠i 執行 BUY_YES，shares 也必須 = S
- 金額可不同，但 shares 必須等量，才能近似 N-outcome LMSR 語義

## 📋 實作改進建議（Production 必做）

### 1. UI 顯示註記
- ✅ 單選題 NO 顯示為 `1 - priceYes(i)`（僅顯示層）
- ⚠️ **必須加註記**：「單選題的 NO 代表：『不是此選項（包含其他選項或都不是）』」
- 📍 位置：Bottom sheet 小字說明

### 2. Bundle Quote 二分搜尋保護
- ✅ (a) Upper bound 自動擴張（最多 20 次）
- ✅ (b) TargetCoin 太小時回傳 shares=0（避免 0.0000000001 shares）

### 3. Bundle Trade 價格變動顯示
- ✅ 預設只顯示總效果
- ✅ 「展開更多」才顯示各 component 詳情

### 4. Positions 頁平倉群組
- ✅ 使用 bundleGroupId 群組顯示
- ✅ 「一鍵平 bundle」UI

### 5. 前端 Fallback 策略
- ❌ 不要用 Parimutuel 邏輯當 LMSR 的 fallback
- ✅ 若 mechanism == LMSR 但價格 API 失敗：顯示 50% + 提示

### 6. E2E 人類驗收腳本
- ✅ 完整驗收流程（見文檔末尾）

## 約束條件
1. ✅ 不新增新的 market/outcome 表
2. ✅ 保留現有 OptionMarket / Trade / Position / Transaction 結構
3. ✅ Buy No(i) 必須支援（bundle，等量 shares）
4. ✅ 前端只顯示「買」與「平倉」，不顯示 Sell
5. ✅ 同一 option 不允許同時持有 YES 與 NO（需先平倉）

---

## A. 單選題 Bundle 的定義

### A.1 Buy Yes(i) 對應的 optionMarket

**定義**:
- `Buy Yes(i)` = 買入選項 i 的 YES
- 對應的 `optionMarketId` = 選項 i 的 `OptionMarket.id`
- 交易類型: `BUY_YES`
- 邏輯: 認為選項 i 是正確答案

**範例**:
```
市場: "誰會贏得選舉？"
選項: A, B, C

Buy Yes(A) → OptionMarket(optionId=A).BUY_YES
```

### A.2 Buy No(i) 會涉及的 optionMarket

**定義**:
- `Buy No(i)` = 買入選項 i 的 NO（認為 i 不是正確答案）
- 在單選題中，由於選項互斥，如果 i 不是正確答案，則其他選項中必有一個是正確答案
- **Bundle 策略**: 同時買入**所有其他選項的 YES**，**shares 必須等量**（金額可以不同）

**涉及的 optionMarket**:
1. 選項 i 的 `OptionMarket` → `BUY_NO`，shares = S
2. 所有其他選項的 `OptionMarket` → `BUY_YES`，每個 shares = S（等量）

**關鍵約束**: 所有 component 的 **shares 必須相等**，金額可以不同。

**範例**:
```
市場: "誰會贏得選舉？"
選項: A, B, C

Buy No(A) 涉及:
1. OptionMarket(optionId=A) → BUY_NO，shares = 100
2. OptionMarket(optionId=B) → BUY_YES，shares = 100（等量）
3. OptionMarket(optionId=C) → BUY_YES，shares = 100（等量）

成本可能不同（因為價格不同）:
- A NO: 成本 300 coin（shares=100）
- B YES: 成本 350 coin（shares=100）
- C YES: 成本 350 coin（shares=100）
總成本: 1000 coin
```

**Shares 等量策略**:
- **核心原則**: 所有 component 的 shares 必須相等（S）
- **輸入類型**:
  - 如果 `amountType = 'SHARES'`: 直接使用輸入的 shares
  - 如果 `amountType = 'COIN'`: 使用二分搜尋找到合適的 shares，使得總成本接近輸入金額
- **為什麼正確**: 符合 N-outcome LMSR 語義，表達「選項 i 不是正確答案」的邏輯

### A.3 None（全部 No 正確）在結算時的處理

**定義**:
- `None` = 所有選項都不是正確答案
- 結算時: `winningOptionIds: []`（空陣列）

**處理邏輯**:
1. 所有選項的 `OptionResolution` 設為 `NO`
2. 所有持有「選項 i 的 NO」的用戶獲勝
3. 所有持有「選項 i 的 YES」的用戶失敗

**結算流程**:
```typescript
// 當 winningOptionIds = [] 時
for (const option of market.options) {
  const optionMarket = await getOptionMarketByOptionId(option.id);
  
  // 建立 OptionResolution
  await createOptionResolution({
    optionMarketId: optionMarket.id,
    outcome: 'NO', // 所有選項都是 NO
    resolvedAt: settlementTime
  });
  
  // 計算用戶收益
  // 持有該選項 NO 的用戶獲勝
  // 持有該選項 YES 的用戶失敗
}
```

**已實現位置**:
- `prediction-backend/src/markets/markets.service.ts` 第 2166-2173 行
- `settleMarketWithNoAnswer()` 方法

---

## B. Bundle Quote API 設計

### B.1 Endpoint

```typescript
POST /option-markets/bundle/quote
```

**認證**: ❌ 不需要（公開端點，用於預覽）

### B.2 Request Body

```typescript
{
  marketId: string;                    // 市場 ID
  bundleType: 'BUY_YES' | 'BUY_NO';   // Bundle 類型
  targetOptionId: string;              // 目標選項 ID（Buy Yes(i) 或 Buy No(i) 的 i）
  amountType: 'COIN' | 'SHARES';      // 金額類型
  amount: string;                      // 金額（decimal string）
}
```

**範例**:
```json
{
  "marketId": "market-123",
  "bundleType": "BUY_NO",
  "targetOptionId": "option-a",
  "amountType": "COIN",
  "amount": "1000.00"
}
```

### B.3 Response 結構

```typescript
{
  bundleType: 'BUY_YES' | 'BUY_NO';
  targetOptionId: string;
  amountType: 'COIN' | 'SHARES';
  inputAmount: string;
  
  // 總計
  totalShares: string;                 // 總股數（如果 amountType=SHARES，則等於 inputAmount）
  totalGrossAmount: string;            // 總成本（所有 component 的 grossAmount 總和）
  totalFeeAmount: string;              // 總手續費
  totalNetAmount: string;              // 總淨額（用戶錢包變動，負數=支出）
  
  // 各 component 詳情
  components: Array<{
    optionMarketId: string;            // OptionMarket.id
    optionId: string;                  // 選項 ID
    optionName: string;                 // 選項名稱
    side: 'BUY_YES' | 'BUY_NO';        // 交易方向
    allocatedAmount: string;           // 分配給此 component 的金額
    shares: string;                    // 此 component 的股數
    grossAmount: string;               // 此 component 的成本
    feeAmount: string;                 // 此 component 的手續費
    netAmount: string;                 // 此 component 的淨額
    priceYesBefore: string;           // 交易前 YES 價格
    priceYesAfter: string;             // 交易後 YES 價格
    qYesBefore: string;               // 交易前 qYes
    qYesAfter: string;                 // 交易後 qYes
    qNoBefore: string;                 // 交易前 qNo
    qNoAfter: string;                  // 交易後 qNo
  }>;
  
  // 價格摘要（用於前端顯示）
  summary: {
    averagePriceYes: string;          // 平均 YES 價格（加權平均）
    averagePriceNo: string;            // 平均 NO 價格
    totalCost: string;                 // 總成本（totalGrossAmount + totalFeeAmount）
    estimatedPayout: string;           // 預估收益（如果全部正確）
  };
}
```

**範例 Response**:
```json
{
  "bundleType": "BUY_NO",
  "targetOptionId": "option-a",
  "amountType": "COIN",
  "inputAmount": "1000.00",
  "totalShares": "500.00",
  "totalGrossAmount": "950.00",
  "totalFeeAmount": "47.50",
  "totalNetAmount": "-997.50",
  "components": [
    {
      "optionMarketId": "om-a-id",
      "optionId": "option-a",
      "optionName": "選項 A",
      "side": "BUY_NO",
      "allocatedAmount": "333.33",
      "shares": "150.00",
      "grossAmount": "316.67",
      "feeAmount": "15.83",
      "netAmount": "-332.50",
      "priceYesBefore": "0.45",
      "priceYesAfter": "0.44",
      "qYesBefore": "1000.00",
      "qYesAfter": "1150.00",
      "qNoBefore": "800.00",
      "qNoAfter": "950.00"
    },
    {
      "optionMarketId": "om-b-id",
      "optionId": "option-b",
      "optionName": "選項 B",
      "side": "BUY_YES",
      "allocatedAmount": "333.33",
      "shares": "175.00",
      "grossAmount": "316.67",
      "feeAmount": "15.83",
      "netAmount": "-332.50",
      "priceYesBefore": "0.30",
      "priceYesAfter": "0.32",
      "qYesBefore": "500.00",
      "qYesAfter": "675.00",
      "qNoBefore": "1200.00",
      "qNoAfter": "1200.00"
    },
    {
      "optionMarketId": "om-c-id",
      "optionId": "option-c",
      "optionName": "選項 C",
      "side": "BUY_YES",
      "allocatedAmount": "333.34",
      "shares": "175.00",
      "grossAmount": "316.66",
      "feeAmount": "15.84",
      "netAmount": "-332.50",
      "priceYesBefore": "0.25",
      "priceYesAfter": "0.27",
      "qYesBefore": "400.00",
      "qYesAfter": "575.00",
      "qNoBefore": "1200.00",
      "qNoAfter": "1200.00"
    }
  ],
  "summary": {
    "averagePriceYes": "0.33",
    "averagePriceNo": "0.67",
    "totalCost": "997.50",
    "estimatedPayout": "1500.00"
  }
}
```

### B.4 前端顯示需求

**需要顯示的資訊**:
1. **總成本**: `totalCost = totalGrossAmount + totalFeeAmount`
2. **各 component 影響**:
   - 選項 A: 買入 NO，成本 XXX
   - 選項 B: 買入 YES，成本 XXX
   - 選項 C: 買入 YES，成本 XXX
3. **預估收益**: 如果全部正確，可獲得多少收益

---

## C. Bundle Trade 執行流程（逐步）

### C.1 整體流程

```typescript
async bundleTrade(
  marketId: string,
  userId: string,
  dto: BundleQuoteDto
): Promise<BundleQuoteResult> {
  // 1. 驗證市場類型
  // 2. 計算 bundle quote
  // 3. 開啟 Transaction
  // 4. Lock 所有相關 OptionMarket
  // 5. Lock User
  // 6. 驗證餘額
  // 7. 驗證 positions（不允許同時持有 YES 和 NO）
  // 8. 執行所有 component trades
  // 9. 更新所有 positions
  // 10. 更新 User balance
  // 11. 建立所有 Trade 記錄
  // 12. 建立 Transaction 記錄
  // 13. Commit Transaction
}
```

### C.2 逐步詳解

#### Step 1: 驗證市場類型

```typescript
const market = await this.marketRepo.findOne({
  where: { id: marketId },
  select: ['id', 'questionType', 'mechanism', 'options', 'status']
});

if (market.questionType !== 'SINGLE_CHOICE') {
  throw new BadRequestException('Bundle trade only supports SINGLE_CHOICE');
}

if (market.mechanism !== MarketMechanism.LMSR_V1) {
  throw new BadRequestException('Bundle trade only supports LMSR mechanism');
}

if (market.status !== MarketStatus.OPEN) {
  throw new BadRequestException('Market is not open');
}
```

#### Step 2: 計算 Bundle Quote

```typescript
// 先計算 quote（不執行交易）
const quote = await this.bundleQuote(marketId, userId, dto);
```

#### Step 3: 開啟 Transaction

```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
```

#### Step 4: Lock 所有相關 OptionMarket

**Lock 順序**（避免死鎖）:
1. 按 `optionMarketId` 排序（確保順序一致）
2. 使用 `SELECT ... FOR UPDATE` 鎖定所有相關的 OptionMarket

```typescript
// 收集所有需要 lock 的 optionMarketId
const optionMarketIds = quote.components.map(c => c.optionMarketId).sort();

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

// 建立 optionMarketId -> OptionMarket 的映射
const optionMarketMap = new Map(
  optionMarkets.map(om => [om.id, om])
);
```

#### Step 5: Lock User

```typescript
const user = await queryRunner.manager
  .getRepository(User)
  .createQueryBuilder('u')
  .setLock('pessimistic_write')
  .where('u.id = :userId', { userId })
  .getOneOrFail();
```

#### Step 6: 驗證餘額

```typescript
const totalNetAmount = new Decimal(quote.totalNetAmount);
const currentBalance = new Decimal(user.coinBalance.toString());

if (totalNetAmount.lt(0)) {
  // 買入：需要足夠餘額
  const required = totalNetAmount.abs();
  if (currentBalance.lt(required)) {
    throw new BadRequestException(
      `Insufficient balance. Required: ${required.toString()}, Available: ${currentBalance.toString()}`
    );
  }
}
```

#### Step 7: 驗證 Positions（不允許同時持有 YES 和 NO）

```typescript
// 載入所有相關 positions
const positions = await queryRunner.manager
  .getRepository(Position)
  .find({
    where: {
      userId,
      optionMarketId: In(optionMarketIds)
    }
  });

// 建立 optionMarketId -> Position 的映射
const positionMap = new Map(
  positions.map(p => [p.optionMarketId, p])
);

// 驗證：對於每個 component，如果已有相反方向的 position，則需要先平倉
for (const component of quote.components) {
  const position = positionMap.get(component.optionMarketId);
  if (position) {
    if (component.side === 'BUY_YES' && new Decimal(position.noShares).gt(0)) {
      throw new BadRequestException(
        `Cannot buy YES for option ${component.optionId}: already holding NO shares. Please close position first.`
      );
    }
    if (component.side === 'BUY_NO' && new Decimal(position.yesShares).gt(0)) {
      throw new BadRequestException(
        `Cannot buy NO for option ${component.optionId}: already holding YES shares. Please close position first.`
      );
    }
  }
}
```

#### Step 8: 執行所有 Component Trades

```typescript
const trades: Trade[] = [];
const updatedPositions: Position[] = [];

for (const component of quote.components) {
  const optionMarket = optionMarketMap.get(component.optionMarketId)!;
  
  // 更新 OptionMarket state
  optionMarket.qYes = component.qYesAfter;
  optionMarket.qNo = component.qNoAfter;
  
  // 建立 Trade 記錄
  const trade = queryRunner.manager.getRepository(Trade).create({
    userId,
    optionMarketId: component.optionMarketId,
    side: component.side,
    shares: component.shares,
    grossAmount: component.grossAmount,
    feeAmount: component.feeAmount,
    netAmount: component.netAmount,
    priceYesBefore: component.priceYesBefore,
    priceYesAfter: component.priceYesAfter,
    qYesBefore: component.qYesBefore,
    qYesAfter: component.qYesAfter,
    qNoBefore: component.qNoBefore,
    qNoAfter: component.qNoAfter,
  });
  const savedTrade = await queryRunner.manager.getRepository(Trade).save(trade);
  trades.push(savedTrade);
  
  // 更新或建立 Position
  let position = positionMap.get(component.optionMarketId);
  if (!position) {
    position = queryRunner.manager.getRepository(Position).create({
      userId,
      optionMarketId: component.optionMarketId,
      yesShares: '0',
      noShares: '0',
    });
  }
  
  const sharesDecimal = new Decimal(component.shares);
  if (component.side === 'BUY_YES') {
    position.yesShares = new Decimal(position.yesShares)
      .plus(sharesDecimal)
      .toString();
  } else if (component.side === 'BUY_NO') {
    position.noShares = new Decimal(position.noShares)
      .plus(sharesDecimal)
      .toString();
  }
  
  const savedPosition = await queryRunner.manager.getRepository(Position).save(position);
  updatedPositions.push(savedPosition);
  positionMap.set(component.optionMarketId, savedPosition);
}
```

#### Step 9: 更新 User Balance

```typescript
const newBalance = currentBalance.plus(totalNetAmount);
await queryRunner.manager.update(User, { id: userId }, {
  coinBalance: parseFloat(newBalance.toString()),
});
```

#### Step 10: 建立 Transaction 記錄

```typescript
const transaction = queryRunner.manager.getRepository(Transaction).create({
  userId,
  type: TransactionType.BET_STAKE, // 或新增 LMSR_BUNDLE_TRADE
  amount: parseFloat(totalNetAmount.toString()),
  description: `LMSR Bundle Trade: ${dto.bundleType} ${dto.targetOptionId} (${trades.length} components)`,
  balanceAfter: parseFloat(newBalance.toString()),
  referenceId: trades[0].id, // 指向第一個 trade（或可以建立一個 bundle trade ID）
});
await queryRunner.manager.getRepository(Transaction).save(transaction);
```

#### Step 11: 保存所有 OptionMarket

```typescript
for (const optionMarket of optionMarkets) {
  await queryRunner.manager.getRepository(OptionMarket).save(optionMarket);
}
```

#### Step 12: Commit Transaction

```typescript
await queryRunner.commitTransaction();
return quote;
```

#### Step 13: Error Handling

```typescript
catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

### C.3 Bundle Quote 計算邏輯

```typescript
async bundleQuote(
  marketId: string,
  userId: string | null,
  dto: BundleQuoteDto
): Promise<BundleQuoteResult> {
  // 1. 載入市場
  const market = await this.marketRepo.findOne({
    where: { id: marketId },
    select: ['id', 'questionType', 'options']
  });
  
  // 2. 載入所有 option markets
  const optionIds = market.options.map(opt => opt.id);
  const optionMarkets = await this.optionMarketRepo.find({
    where: optionIds.map(optionId => ({ optionId }))
  });
  
  // 3. 建立 optionId -> OptionMarket 的映射
  const optionMarketMap = new Map(
    optionMarkets.map(om => [om.optionId, om])
  );
  
  // 4. 載入用戶 positions（如果 userId 存在）
  let positions: Position[] = [];
  if (userId) {
    const optionMarketIds = optionMarkets.map(om => om.id);
    positions = await this.positionRepo.find({
      where: {
        userId,
        optionMarketId: In(optionMarketIds)
      }
    });
  }
  const positionMap = new Map(
    positions.map(p => [p.optionMarketId, p])
  );
  
  // 5. 計算 components
  const components: BundleComponent[] = [];
  const totalAmount = new Decimal(dto.amount);
  
  if (dto.bundleType === 'BUY_YES') {
    // Buy Yes(i): 只買入目標選項的 YES
    const targetOptionMarket = optionMarketMap.get(dto.targetOptionId);
    if (!targetOptionMarket) {
      throw new NotFoundException(`Option ${dto.targetOptionId} not found`);
    }
    
    const position = positionMap.get(targetOptionMarket.id) || null;
    const quote = this.quoteFromState(targetOptionMarket, position, {
      side: 'BUY_YES',
      amountType: dto.amountType,
      amount: dto.amount
    });
    
    components.push({
      optionMarketId: targetOptionMarket.id,
      optionId: dto.targetOptionId,
      optionName: market.options.find(opt => opt.id === dto.targetOptionId)?.name || 'Unknown',
      side: 'BUY_YES',
      allocatedAmount: dto.amount,
      ...quote
    });
    
  } else if (dto.bundleType === 'BUY_NO') {
    // Buy No(i): 買入目標選項的 NO + 所有其他選項的 YES
    // 關鍵：所有 component 的 shares 必須相等（等量 shares bundle）
    const targetOptionMarket = optionMarketMap.get(dto.targetOptionId);
    if (!targetOptionMarket) {
      throw new NotFoundException(`Option ${dto.targetOptionId} not found`);
    }
    
    // 其他選項（排除目標選項）
    const otherOptions = market.options.filter(opt => opt.id !== dto.targetOptionId);
    const otherOptionsCount = otherOptions.length;
    
    if (dto.amountType === 'SHARES') {
      // 如果輸入是 shares，直接使用
      const targetShares = new Decimal(dto.amount);
      
      // 1. 計算目標選項的 NO quote（shares = targetShares）
      const targetPosition = positionMap.get(targetOptionMarket.id) || null;
      const targetNoQuote = this.quoteFromState(targetOptionMarket, targetPosition, {
        side: 'BUY_NO',
        amountType: 'SHARES',
        amount: targetShares.toString()
      });
      
      components.push({
        optionMarketId: targetOptionMarket.id,
        optionId: dto.targetOptionId,
        optionName: market.options.find(opt => opt.id === dto.targetOptionId)?.name || 'Unknown',
        side: 'BUY_NO',
        allocatedAmount: targetNoQuote.grossAmount, // 實際成本
        ...targetNoQuote
      });
      
      // 2. 對所有其他選項執行 BUY_YES，shares = targetShares
      for (const otherOption of otherOptions) {
        const otherOptionMarket = optionMarketMap.get(otherOption.id);
        if (!otherOptionMarket) continue;
        
        const otherPosition = positionMap.get(otherOptionMarket.id) || null;
        const otherYesQuote = this.quoteFromState(otherOptionMarket, otherPosition, {
          side: 'BUY_YES',
          amountType: 'SHARES',
          amount: targetShares.toString() // 等量 shares
        });
        
        components.push({
          optionMarketId: otherOptionMarket.id,
          optionId: otherOption.id,
          optionName: otherOption.name,
          side: 'BUY_YES',
          allocatedAmount: otherYesQuote.grossAmount, // 實際成本
          ...otherYesQuote
        });
      }
      
    } else {
      // 如果輸入是 COIN，需要反推 shares
      // 使用二分搜尋找到合適的 shares，使得總成本接近 totalAmount
      
      // 二分搜尋範圍
      let minShares = new Decimal(0);
      let maxShares = totalAmount.times(10); // 假設最壞情況價格
      let bestShares = new Decimal(0);
      let bestTotalCost = new Decimal(Infinity);
      const tolerance = new Decimal('0.01'); // 容差 0.01 coin
      const maxIterations = 50;
      
      for (let i = 0; i < maxIterations; i++) {
        const testShares = minShares.plus(maxShares).div(2);
        
        // 計算此 shares 下的總成本
        let totalCost = new Decimal(0);
        
        // 1. 目標選項的 NO
        const targetPosition = positionMap.get(targetOptionMarket.id) || null;
        const targetNoQuote = this.quoteFromState(targetOptionMarket, targetPosition, {
          side: 'BUY_NO',
          amountType: 'SHARES',
          amount: testShares.toString()
        });
        totalCost = totalCost.plus(new Decimal(targetNoQuote.grossAmount));
        totalCost = totalCost.plus(new Decimal(targetNoQuote.feeAmount));
        
        // 2. 所有其他選項的 YES
        for (const otherOption of otherOptions) {
          const otherOptionMarket = optionMarketMap.get(otherOption.id);
          if (!otherOptionMarket) continue;
          
          const otherPosition = positionMap.get(otherOptionMarket.id) || null;
          const otherYesQuote = this.quoteFromState(otherOptionMarket, otherPosition, {
            side: 'BUY_YES',
            amountType: 'SHARES',
            amount: testShares.toString() // 等量 shares
          });
          totalCost = totalCost.plus(new Decimal(otherYesQuote.grossAmount));
          totalCost = totalCost.plus(new Decimal(otherYesQuote.feeAmount));
        }
        
        const diff = totalCost.minus(totalAmount).abs();
        if (diff.lt(bestTotalCost.minus(totalAmount).abs())) {
          bestShares = testShares;
          bestTotalCost = totalCost;
        }
        
        if (diff.lte(tolerance)) {
          break;
        }
        
        if (totalCost.lt(totalAmount)) {
          minShares = testShares;
        } else {
          maxShares = testShares;
        }
      }
      
      // 使用最佳 shares 計算最終 quote
      const finalShares = bestShares;
      
      // 1. 目標選項的 NO
      const targetPosition = positionMap.get(targetOptionMarket.id) || null;
      const targetNoQuote = this.quoteFromState(targetOptionMarket, targetPosition, {
        side: 'BUY_NO',
        amountType: 'SHARES',
        amount: finalShares.toString()
      });
      
      components.push({
        optionMarketId: targetOptionMarket.id,
        optionId: dto.targetOptionId,
        optionName: market.options.find(opt => opt.id === dto.targetOptionId)?.name || 'Unknown',
        side: 'BUY_NO',
        allocatedAmount: targetNoQuote.grossAmount,
        ...targetNoQuote
      });
      
      // 2. 所有其他選項的 YES
      for (const otherOption of otherOptions) {
        const otherOptionMarket = optionMarketMap.get(otherOption.id);
        if (!otherOptionMarket) continue;
        
        const otherPosition = positionMap.get(otherOptionMarket.id) || null;
        const otherYesQuote = this.quoteFromState(otherOptionMarket, otherPosition, {
          side: 'BUY_YES',
          amountType: 'SHARES',
          amount: finalShares.toString() // 等量 shares
        });
        
        components.push({
          optionMarketId: otherOptionMarket.id,
          optionId: otherOption.id,
          optionName: otherOption.name,
          side: 'BUY_YES',
          allocatedAmount: otherYesQuote.grossAmount,
          ...otherYesQuote
        });
      }
    }
  }
  
  // 6. 計算總計
  const totalGrossAmount = components.reduce(
    (sum, c) => sum.plus(new Decimal(c.grossAmount)),
    new Decimal(0)
  );
  const totalFeeAmount = components.reduce(
    (sum, c) => sum.plus(new Decimal(c.feeAmount)),
    new Decimal(0)
  );
  const totalNetAmount = components.reduce(
    (sum, c) => sum.plus(new Decimal(c.netAmount)),
    new Decimal(0)
  );
  
  // 7. 計算 summary
  const totalShares = components.reduce(
    (sum, c) => sum.plus(new Decimal(c.shares)),
    new Decimal(0)
  );
  
  // 加權平均價格
  let weightedPriceYesSum = new Decimal(0);
  let totalWeight = new Decimal(0);
  for (const component of components) {
    const weight = new Decimal(component.shares);
    const priceYes = new Decimal(component.priceYesAfter);
    weightedPriceYesSum = weightedPriceYesSum.plus(weight.times(priceYes));
    totalWeight = totalWeight.plus(weight);
  }
  const averagePriceYes = totalWeight.gt(0)
    ? weightedPriceYesSum.div(totalWeight)
    : new Decimal(0.5);
  const averagePriceNo = new Decimal(1).minus(averagePriceYes);
  
  return {
    bundleType: dto.bundleType,
    targetOptionId: dto.targetOptionId,
    amountType: dto.amountType,
    inputAmount: dto.amount,
    totalShares: totalShares.toString(),
    totalGrossAmount: totalGrossAmount.toString(),
    totalFeeAmount: totalFeeAmount.toString(),
    totalNetAmount: totalNetAmount.toString(),
    components,
    summary: {
      averagePriceYes: averagePriceYes.toString(),
      averagePriceNo: averagePriceNo.toString(),
      totalCost: totalGrossAmount.plus(totalFeeAmount).toString(),
      estimatedPayout: totalShares.toString(), // 簡化：假設全部正確時可獲得 shares 數量的收益
    }
  };
}
```

---

## D. Position 與平倉設計

### D.1 單選題 Yes(i) / No(i) 在 Positions 頁的呈現

**Position 結構**:
```typescript
{
  id: string;
  userId: string;
  optionMarketId: string;
  yesShares: string;  // YES 股數
  noShares: string;    // NO 股數
  updatedAt: Date;
}
```

**前端顯示邏輯**:

#### 情況 1: Buy Yes(i)
```
選項 A: 持有 100 YES 股
選項 B: 無持倉
選項 C: 無持倉

顯示:
- 選項 A: "買入 YES" | 100 股 | 當前價值: XXX | [平倉]
- 選項 B: "未持有"
- 選項 C: "未持有"
```

#### 情況 2: Buy No(i)
```
選項 A: 持有 50 NO 股
選項 B: 持有 25 YES 股
選項 C: 持有 25 YES 股

顯示:
- 選項 A: "買入 NO" | 50 股 | 當前價值: XXX | [平倉]
- 選項 B: "買入 YES" | 25 股 | 當前價值: XXX | [平倉]
- 選項 C: "買入 YES" | 25 股 | 當前價值: XXX | [平倉]

或顯示為 Bundle:
- Bundle "買入 A 的 NO": 
  - 選項 A: 50 NO 股
  - 選項 B: 25 YES 股
  - 選項 C: 25 YES 股
  - 總價值: XXX
  - [平倉全部]
```

**推薦顯示方式**:
- **方案 1（推薦）**: 分別顯示每個 option 的 position
  - 優點: 簡單直觀，易於理解
  - 缺點: 無法看出是 bundle 交易
- **方案 2**: 顯示 bundle 群組
  - 優點: 可以看出是 bundle 交易
  - 缺點: 需要額外的 bundle 標記（可能需要新增欄位）

**最小改動建議**: 使用方案 1，分別顯示每個 option 的 position。

### D.2 平倉時如何反向計算 Payout

**平倉邏輯**:
- 平倉 = 賣出持有的 shares
- 使用現有的 `SELL_YES` 或 `SELL_NO` side

**計算流程**:

#### 情況 1: 平倉單一 Option 的 YES
```typescript
// 用戶持有選項 A 的 100 YES 股
// 平倉 = SELL_YES

const quote = await this.quote(optionMarketId, userId, {
  side: 'SELL_YES',
  amountType: 'SHARES',
  amount: '100' // 全部平倉
});

// quote.netAmount 是正數（收入）
// quote.grossAmount 是賣出收益
// quote.feeAmount 是手續費
```

#### 情況 2: 平倉單一 Option 的 NO
```typescript
// 用戶持有選項 A 的 50 NO 股
// 平倉 = SELL_NO

const quote = await this.quote(optionMarketId, userId, {
  side: 'SELL_NO',
  amountType: 'SHARES',
  amount: '50' // 全部平倉
});
```

#### 情況 3: 平倉 Bundle（Buy No(i) 的完整平倉）
```typescript
// 用戶持有:
// - 選項 A: 50 NO 股
// - 選項 B: 25 YES 股
// - 選項 C: 25 YES 股

// 需要分別平倉每個 option
const quotes = await Promise.all([
  this.quote(optionMarketAId, userId, {
    side: 'SELL_NO',
    amountType: 'SHARES',
    amount: '50'
  }),
  this.quote(optionMarketBId, userId, {
    side: 'SELL_YES',
    amountType: 'SHARES',
    amount: '25'
  }),
  this.quote(optionMarketCId, userId, {
    side: 'SELL_YES',
    amountType: 'SHARES',
    amount: '25'
  })
]);

// 總收益 = 所有 quote.netAmount 的總和
const totalPayout = quotes.reduce(
  (sum, q) => sum.plus(new Decimal(q.netAmount)),
  new Decimal(0)
);
```

**平倉 API 設計**:

```typescript
POST /option-markets/:optionMarketId/close-position
- 認證: ✅ 需要
- Body: {
    closeType: 'CLOSE_ALL' | 'CLOSE_PARTIAL',
    closeYesShares?: string,  // CLOSE_PARTIAL 時指定
    closeNoShares?: string,   // CLOSE_PARTIAL 時指定
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
```typescript
async closePosition(
  optionMarketId: string,
  userId: string,
  dto: ClosePositionDto
): Promise<ClosePositionResult> {
  // 1. 載入 position
  const position = await this.positionRepo.findOne({
    where: { userId, optionMarketId }
  });
  
  if (!position) {
    throw new NotFoundException('Position not found');
  }
  
  // 2. 決定要平倉的股數
  let closeYesShares = new Decimal(0);
  let closeNoShares = new Decimal(0);
  
  if (dto.closeType === 'CLOSE_ALL') {
    closeYesShares = new Decimal(position.yesShares);
    closeNoShares = new Decimal(position.noShares);
  } else {
    closeYesShares = new Decimal(dto.closeYesShares || '0');
    closeNoShares = new Decimal(dto.closeNoShares || '0');
  }
  
  // 3. 驗證股數
  if (closeYesShares.gt(position.yesShares) || closeNoShares.gt(position.noShares)) {
    throw new BadRequestException('Insufficient shares');
  }
  
  // 4. 開啟 Transaction
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    // 5. Lock OptionMarket 和 User
    const optionMarket = await queryRunner.manager
      .getRepository(OptionMarket)
      .createQueryBuilder('om')
      .setLock('pessimistic_write')
      .where('om.id = :id', { id: optionMarketId })
      .getOneOrFail();
    
    const user = await queryRunner.manager
      .getRepository(User)
      .createQueryBuilder('u')
      .setLock('pessimistic_write')
      .where('u.id = :userId', { userId })
      .getOneOrFail();
    
    // 6. 執行平倉交易
    const trades: Trade[] = [];
    let totalPayout = new Decimal(0);
    let totalFee = new Decimal(0);
    
    if (closeYesShares.gt(0)) {
      const quote = this.quoteFromState(optionMarket, position, {
        side: 'SELL_YES',
        amountType: 'SHARES',
        amount: closeYesShares.toString()
      });
      
      // 更新 OptionMarket
      optionMarket.qYes = quote.qYesAfter;
      optionMarket.qNo = quote.qNoAfter;
      
      // 更新 Position
      position.yesShares = new Decimal(position.yesShares)
        .minus(closeYesShares)
        .toString();
      
      // 建立 Trade
      const trade = await this.createTradeRecord(
        queryRunner,
        userId,
        optionMarketId,
        'SELL_YES',
        quote
      );
      trades.push(trade);
      
      totalPayout = totalPayout.plus(new Decimal(quote.grossAmount));
      totalFee = totalFee.plus(new Decimal(quote.feeAmount));
    }
    
    if (closeNoShares.gt(0)) {
      const quote = this.quoteFromState(optionMarket, position, {
        side: 'SELL_NO',
        amountType: 'SHARES',
        amount: closeNoShares.toString()
      });
      
      // 更新 OptionMarket
      optionMarket.qYes = quote.qYesAfter;
      optionMarket.qNo = quote.qNoAfter;
      
      // 更新 Position
      position.noShares = new Decimal(position.noShares)
        .minus(closeNoShares)
        .toString();
      
      // 建立 Trade
      const trade = await this.createTradeRecord(
        queryRunner,
        userId,
        optionMarketId,
        'SELL_NO',
        quote
      );
      trades.push(trade);
      
      totalPayout = totalPayout.plus(new Decimal(quote.grossAmount));
      totalFee = totalFee.plus(new Decimal(quote.feeAmount));
    }
    
    // 7. 更新 User balance
    const netPayout = totalPayout.minus(totalFee);
    const newBalance = new Decimal(user.coinBalance.toString()).plus(netPayout);
    await queryRunner.manager.update(User, { id: userId }, {
      coinBalance: parseFloat(newBalance.toString())
    });
    
    // 8. 建立 Transaction
    await queryRunner.manager.getRepository(Transaction).save({
      userId,
      type: TransactionType.BET_STAKE,
      amount: parseFloat(netPayout.toString()),
      description: `Close Position: ${closeYesShares.toString()} YES + ${closeNoShares.toString()} NO`,
      balanceAfter: parseFloat(newBalance.toString()),
      referenceId: trades[0]?.id || null
    });
    
    // 9. 保存所有變更
    await queryRunner.manager.getRepository(OptionMarket).save(optionMarket);
    await queryRunner.manager.getRepository(Position).save(position);
    
    await queryRunner.commitTransaction();
    
    return {
      closedYesShares: closeYesShares.toString(),
      closedNoShares: closeNoShares.toString(),
      totalPayout: totalPayout.toString(),
      totalFee: totalFee.toString(),
      netPayout: netPayout.toString(),
      trades
    };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

---

## A. 修正後的 Buy No(i) Bundle Quote 流程（逐步）

### A.1 輸入處理

**輸入類型**:
- `amountType = 'SHARES'`: 直接指定 shares 數量
- `amountType = 'COIN'`: 指定總金額，需要反推 shares

### A.2 流程 Step-by-Step

#### Step 1: 載入市場與 OptionMarkets

```typescript
// 1. 載入市場
const market = await this.marketRepo.findOne({
  where: { id: marketId },
  select: ['id', 'questionType', 'options']
});

// 2. 載入所有 option markets
const optionIds = market.options.map(opt => opt.id);
const optionMarkets = await this.optionMarketRepo.find({
  where: optionIds.map(optionId => ({ optionId }))
});

// 3. 建立 optionId -> OptionMarket 的映射
const optionMarketMap = new Map(
  optionMarkets.map(om => [om.optionId, om])
);

// 4. 載入用戶 positions（如果 userId 存在）
let positions: Position[] = [];
if (userId) {
  const optionMarketIds = optionMarkets.map(om => om.id);
  positions = await this.positionRepo.find({
    where: {
      userId,
      optionMarketId: In(optionMarketIds)
    }
  });
}
const positionMap = new Map(
  positions.map(p => [p.optionMarketId, p])
);
```

#### Step 2: 決定 Shares 數量

**情況 A: amountType = 'SHARES'**
```typescript
// 直接使用輸入的 shares
const targetShares = new Decimal(dto.amount);
```

**情況 B: amountType = 'COIN'**
```typescript
// 使用二分搜尋找到合適的 shares
const totalAmount = new Decimal(dto.amount);

// ⚠️ 保護 1: TargetCoin 太小時回傳 shares=0
const MIN_COIN_THRESHOLD = new Decimal('0.001'); // 最小 0.001 coin
if (totalAmount.lt(MIN_COIN_THRESHOLD)) {
  // 回傳所有 component 的 shares = 0
  return {
    // ... 所有 component shares = '0'
  };
}

let minShares = new Decimal(0);
let initialMaxShares = totalAmount.times(10); // 初始 upper bound
let maxShares = initialMaxShares;
let bestShares = new Decimal(0);
let bestTotalCost = new Decimal(Infinity);
const tolerance = new Decimal('0.01'); // 容差 0.01 coin
const maxIterations = 50;
const maxExpansions = 20; // 最多擴張 20 次

// ⚠️ 保護 2: Upper bound 自動擴張
let expansionCount = 0;
let foundUpperBound = false;

while (!foundUpperBound && expansionCount < maxExpansions) {
  // 測試當前 upper bound 是否足夠
  let testTotalCost = new Decimal(0);
  
  // 計算此 upper bound 下的總成本
  const targetPosition = positionMap.get(targetOptionMarket.id) || null;
  const targetNoQuote = this.quoteFromState(targetOptionMarket, targetPosition, {
    side: 'BUY_NO',
    amountType: 'SHARES',
    amount: maxShares.toString()
  });
  testTotalCost = testTotalCost.plus(new Decimal(targetNoQuote.grossAmount));
  testTotalCost = testTotalCost.plus(new Decimal(targetNoQuote.feeAmount));
  
  for (const otherOption of otherOptions) {
    const otherOptionMarket = optionMarketMap.get(otherOption.id);
    if (!otherOptionMarket) continue;
    
    const otherPosition = positionMap.get(otherOptionMarket.id) || null;
    const otherYesQuote = this.quoteFromState(otherOptionMarket, otherPosition, {
      side: 'BUY_YES',
      amountType: 'SHARES',
      amount: maxShares.toString()
    });
    testTotalCost = testTotalCost.plus(new Decimal(otherYesQuote.grossAmount));
    testTotalCost = testTotalCost.plus(new Decimal(otherYesQuote.feeAmount));
  }
  
  if (testTotalCost.gte(totalAmount)) {
    foundUpperBound = true;
  } else {
    maxShares = maxShares.times(2);
    expansionCount++;
  }
}

if (!foundUpperBound) {
  throw new BadRequestException(
    `Cannot find suitable shares for amount ${totalAmount.toString()}. Market may be too skewed.`
  );
}

for (let i = 0; i < maxIterations; i++) {
  const testShares = minShares.plus(maxShares).div(2);
  
  // 計算此 shares 下的總成本
  let totalCost = new Decimal(0);
  
  // 1. 目標選項的 NO
  const targetPosition = positionMap.get(targetOptionMarket.id) || null;
  const targetNoQuote = this.quoteFromState(targetOptionMarket, targetPosition, {
    side: 'BUY_NO',
    amountType: 'SHARES',
    amount: testShares.toString()
  });
  totalCost = totalCost.plus(new Decimal(targetNoQuote.grossAmount));
  totalCost = totalCost.plus(new Decimal(targetNoQuote.feeAmount));
  
  // 2. 所有其他選項的 YES（等量 shares）
  for (const otherOption of otherOptions) {
    const otherOptionMarket = optionMarketMap.get(otherOption.id);
    if (!otherOptionMarket) continue;
    
    const otherPosition = positionMap.get(otherOptionMarket.id) || null;
    const otherYesQuote = this.quoteFromState(otherOptionMarket, otherPosition, {
      side: 'BUY_YES',
      amountType: 'SHARES',
      amount: testShares.toString() // 等量 shares
    });
    totalCost = totalCost.plus(new Decimal(otherYesQuote.grossAmount));
    totalCost = totalCost.plus(new Decimal(otherYesQuote.feeAmount));
  }
  
  const diff = totalCost.minus(totalAmount).abs();
  if (diff.lt(bestTotalCost.minus(totalAmount).abs())) {
    bestShares = testShares;
    bestTotalCost = totalCost;
  }
  
  if (diff.lte(tolerance)) {
    break;
  }
  
  if (totalCost.lt(totalAmount)) {
    minShares = testShares;
  } else {
    maxShares = testShares;
  }
}

const finalShares = bestShares;
```

#### Step 3: 計算各 Component Quote

```typescript
const components: BundleComponent[] = [];
const otherOptions = market.options.filter(opt => opt.id !== dto.targetOptionId);

// 1. 目標選項的 NO（shares = finalShares）
const targetPosition = positionMap.get(targetOptionMarket.id) || null;
const targetNoQuote = this.quoteFromState(targetOptionMarket, targetPosition, {
  side: 'BUY_NO',
  amountType: 'SHARES',
  amount: finalShares.toString()
});

components.push({
  optionMarketId: targetOptionMarket.id,
  optionId: dto.targetOptionId,
  optionName: market.options.find(opt => opt.id === dto.targetOptionId)?.name || 'Unknown',
  side: 'BUY_NO',
  allocatedAmount: targetNoQuote.grossAmount, // 實際成本
  shares: finalShares.toString(), // 等量 shares
  ...targetNoQuote
});

// 2. 所有其他選項的 YES（shares = finalShares，等量）
for (const otherOption of otherOptions) {
  const otherOptionMarket = optionMarketMap.get(otherOption.id);
  if (!otherOptionMarket) continue;
  
  const otherPosition = positionMap.get(otherOptionMarket.id) || null;
  const otherYesQuote = this.quoteFromState(otherOptionMarket, otherPosition, {
    side: 'BUY_YES',
    amountType: 'SHARES',
    amount: finalShares.toString() // 等量 shares
  });
  
  components.push({
    optionMarketId: otherOptionMarket.id,
    optionId: otherOption.id,
    optionName: otherOption.name,
    side: 'BUY_YES',
    allocatedAmount: otherYesQuote.grossAmount, // 實際成本
    shares: finalShares.toString(), // 等量 shares
    ...otherYesQuote
  });
}
```

#### Step 4: 計算總計與 Summary

```typescript
// 計算總計
const totalGrossAmount = components.reduce(
  (sum, c) => sum.plus(new Decimal(c.grossAmount)),
  new Decimal(0)
);
const totalFeeAmount = components.reduce(
  (sum, c) => sum.plus(new Decimal(c.feeAmount)),
  new Decimal(0)
);
const totalNetAmount = components.reduce(
  (sum, c) => sum.plus(new Decimal(c.netAmount)),
  new Decimal(0)
);

// 計算 summary（以 shares 為權重）
const totalShares = components.reduce(
  (sum, c) => sum.plus(new Decimal(c.shares)),
  new Decimal(0)
);

// 加權平均價格（以 shares 為權重）
let weightedPriceYesSum = new Decimal(0);
let totalWeight = new Decimal(0);
for (const component of components) {
  const weight = new Decimal(component.shares);
  const priceYes = new Decimal(component.priceYesAfter);
  weightedPriceYesSum = weightedPriceYesSum.plus(weight.times(priceYes));
  totalWeight = totalWeight.plus(weight);
}
const averagePriceYes = totalWeight.gt(0)
  ? weightedPriceYesSum.div(totalWeight)
  : new Decimal(0.5);
const averagePriceNo = new Decimal(1).minus(averagePriceYes);

return {
  bundleType: dto.bundleType,
  targetOptionId: dto.targetOptionId,
  amountType: dto.amountType,
  inputAmount: dto.amount,
  totalShares: totalShares.toString(),
  totalGrossAmount: totalGrossAmount.toString(),
  totalFeeAmount: totalFeeAmount.toString(),
  totalNetAmount: totalNetAmount.toString(),
  components,
  summary: {
    averagePriceYes: averagePriceYes.toString(),
    averagePriceNo: averagePriceNo.toString(),
    totalCost: totalGrossAmount.plus(totalFeeAmount).toString(),
    estimatedPayout: totalShares.toString(),
  }
};
```

### A.3 關鍵差異

**修正前（錯誤）**:
- 使用金額比例分配（30%/70% 或平均分配）
- 各 component 的 shares 可能不同

**修正後（正確）**:
- 所有 component 的 shares 必須相等
- 金額可以不同（因為價格不同）
- 符合 N-outcome LMSR 語義

---

## B. 修正後的 Bundle Trade 實作重點

### B.1 需要修改的程式碼段

#### 1. `bundleQuote()` 方法中的 Buy No(i) 邏輯

**檔案**: `prediction-backend/src/lmsr/services/lmsr.service.ts`

**修改位置**: `bundleQuote()` 方法中的 `else if (dto.bundleType === 'BUY_NO')` 區塊

**修改內容**:
- ❌ 移除金額比例分配邏輯（30%/70% 或平均分配）
- ✅ 新增等量 shares 邏輯
- ✅ 新增二分搜尋（當 amountType = 'COIN' 時）

**具體修改**:
```typescript
// 舊邏輯（錯誤）:
const targetNoAmount = totalAmount.times(0.3);
const remainingAmount = totalAmount.times(0.7);
const amountPerOtherOption = remainingAmount.div(otherOptionsCount);

// 新邏輯（正確）:
// 1. 決定 shares（等量）
const finalShares = dto.amountType === 'SHARES' 
  ? new Decimal(dto.amount)
  : await binarySearchShares(totalAmount, ...); // 二分搜尋

// 2. 所有 component 使用相同的 shares
const targetNoQuote = this.quoteFromState(..., {
  side: 'BUY_NO',
  amountType: 'SHARES',
  amount: finalShares.toString()
});

for (const otherOption of otherOptions) {
  const otherYesQuote = this.quoteFromState(..., {
    side: 'BUY_YES',
    amountType: 'SHARES',
    amount: finalShares.toString() // 等量
  });
}
```

#### 2. 驗證邏輯（無需修改）

**檔案**: `prediction-backend/src/lmsr/services/lmsr.service.ts`

**位置**: `bundleTrade()` 方法中的 Step 7（驗證 positions）

**說明**: 驗證邏輯無需修改，因為邏輯不變（仍然檢查不允許同時持有 YES 和 NO）。

#### 3. 執行交易邏輯（無需修改）

**檔案**: `prediction-backend/src/lmsr/services/lmsr.service.ts`

**位置**: `bundleTrade()` 方法中的 Step 8（執行所有 component trades）

**說明**: 執行邏輯無需修改，因為仍然對每個 component 執行 trade，只是 shares 現在是等量的。

### B.2 新增輔助方法

#### 二分搜尋 Shares 方法

```typescript
/**
 * 使用二分搜尋找到合適的 shares，使得總成本接近目標金額
 */
private async binarySearchSharesForBuyNo(
  totalAmount: Decimal,
  targetOptionMarket: OptionMarket,
  otherOptionMarkets: OptionMarket[],
  positionMap: Map<string, Position>,
  tolerance: Decimal = new Decimal('0.01'),
  maxIterations: number = 50
): Promise<Decimal> {
  let minShares = new Decimal(0);
  let maxShares = totalAmount.times(10);
  let bestShares = new Decimal(0);
  let bestTotalCost = new Decimal(Infinity);
  
  for (let i = 0; i < maxIterations; i++) {
    const testShares = minShares.plus(maxShares).div(2);
    
    // 計算總成本
    let totalCost = new Decimal(0);
    
    // 1. 目標選項的 NO
    const targetPosition = positionMap.get(targetOptionMarket.id) || null;
    const targetNoQuote = this.quoteFromState(targetOptionMarket, targetPosition, {
      side: 'BUY_NO',
      amountType: 'SHARES',
      amount: testShares.toString()
    });
    totalCost = totalCost.plus(new Decimal(targetNoQuote.grossAmount));
    totalCost = totalCost.plus(new Decimal(targetNoQuote.feeAmount));
    
    // 2. 所有其他選項的 YES
    for (const otherOptionMarket of otherOptionMarkets) {
      const otherPosition = positionMap.get(otherOptionMarket.id) || null;
      const otherYesQuote = this.quoteFromState(otherOptionMarket, otherPosition, {
        side: 'BUY_YES',
        amountType: 'SHARES',
        amount: testShares.toString()
      });
      totalCost = totalCost.plus(new Decimal(otherYesQuote.grossAmount));
      totalCost = totalCost.plus(new Decimal(otherYesQuote.feeAmount));
    }
    
    const diff = totalCost.minus(totalAmount).abs();
    if (diff.lt(bestTotalCost.minus(totalAmount).abs())) {
      bestShares = testShares;
      bestTotalCost = totalCost;
    }
    
    if (diff.lte(tolerance)) {
      break;
    }
    
    if (totalCost.lt(totalAmount)) {
      minShares = testShares;
    } else {
      maxShares = testShares;
    }
  }
  
  return bestShares;
}
```

### B.3 測試重點

**需要測試的場景**:
1. ✅ `amountType = 'SHARES'` 時，所有 component 的 shares 相等
2. ✅ `amountType = 'COIN'` 時，二分搜尋找到合適的 shares
3. ✅ 各 component 的成本可能不同（因為價格不同）
4. ✅ 總成本接近輸入金額（當 amountType = 'COIN' 時）

---

## C. 為什麼 Shares-Equal Bundle 比 Amount-Split 正確

### C.1 N-outcome LMSR 語義

在 N-outcome LMSR 中，如果要表達「選項 i 不是正確答案」，正確的語義是：
- 選項 i 的 NO shares 增加 S
- 所有其他選項 j 的 YES shares 各增加 S

這樣，總的 shares 增加是：
- S (NO for i) + (N-1) × S (YES for others) = N × S

### C.2 為什麼 Shares 必須等量

**原因 1: 邏輯一致性**
- 在單選題中，如果「選項 i 不是正確答案」，則其他選項中必有一個是正確答案
- 等量 shares 確保了「選項 i 的 NO」和「其他選項的 YES」在邏輯上等價
- 如果 shares 不等量，則無法表達這種等價關係

**原因 2: 結算一致性**
- 當結算時，如果選項 i 確實不是正確答案（NO），則：
  - 選項 i 的 NO shares 獲勝
  - 其他選項中，正確答案的 YES shares 獲勝
- 如果 shares 等量，則獲勝的 shares 數量相同，收益分配更公平

**原因 3: 價格一致性**
- 在 LMSR 中，價格是根據 shares 數量計算的
- 如果 shares 不等量，則不同 component 的價格影響不同，無法正確反映「選項 i 不是正確答案」的語義

### C.3 Amount-Split 的問題

**問題 1: 邏輯不一致**
- 如果使用金額比例分配（例如 30%/70%），則不同 component 的 shares 可能不同
- 這導致「選項 i 的 NO」和「其他選項的 YES」在邏輯上不等價

**問題 2: 結算不公平**
- 如果 shares 不等量，結算時獲勝的 shares 數量不同，收益分配不公平

**問題 3: 無法表達 N-outcome LMSR 語義**
- N-outcome LMSR 要求所有 outcome 的 shares 變化量相同
- Amount-split 無法滿足這個要求

### C.4 範例說明

**場景**: 市場有 3 個選項（A, B, C），用戶想表達「A 不是正確答案」

**Amount-Split（錯誤）**:
```
輸入: 1000 coin
分配: A NO: 300 coin → 可能得到 100 shares
      B YES: 350 coin → 可能得到 120 shares
      C YES: 350 coin → 可能得到 130 shares

問題: shares 不等量（100 vs 120 vs 130），無法表達等價關係
```

**Shares-Equal（正確）**:
```
輸入: 1000 coin（或直接指定 shares）
分配: A NO: 100 shares → 成本 300 coin
      B YES: 100 shares → 成本 350 coin
      C YES: 100 shares → 成本 350 coin
總成本: 1000 coin

優點: shares 等量（100 = 100 = 100），正確表達等價關係
```

---

## E. 前端改動建議

### E.1 Market Detail 頁單選題應顯示哪個機率？

**當前問題**:
- 前端使用 Parimutuel 邏輯計算機率（`_getYesVolume()` / `_getNoVolume()`）
- 這些欄位不適用於 LMSR 系統

**正確做法**:

#### Step 1: 調用 LMSR API 取得價格

```dart
// 在 market_detail_screen.dart 或相關 provider 中
Future<void> loadLmsrPrices(String marketId) async {
  try {
    final response = await apiClient.dio.get(
      '/option-markets/market/$marketId'
    );
    
    // response.data 是 Array<{
    //   id, optionId, optionName, priceYes, priceNo, ...
    // }>
    
    // 建立 optionId -> priceYes 的映射
    final priceMap = <String, double>{};
    for (final item in response.data) {
      priceMap[item['optionId']] = double.parse(item['priceYes']);
    }
    
    // 更新 market model 或 state
    // ...
  } catch (e) {
    // 處理錯誤
  }
}
```

#### Step 2: 顯示機率

**單選題 Buy Yes(i)**:
```dart
// 選項 A 的 YES 機率 = priceYes(A) * 100
final priceYes = priceMap[option.id] ?? 0.5;
final probability = priceYes * 100; // 0-100%
```

**單選題 Buy No(i)**:
```dart
// 選項 A 的 NO 機率 = priceNo(A) * 100 = (1 - priceYes(A)) * 100
final priceYes = priceMap[option.id] ?? 0.5;
final priceNo = 1.0 - priceYes;
final probability = priceNo * 100; // 0-100%
```

**重要**: 在單選題中，所有選項的 `priceYes` 加總應該接近 100%（因為只能有一個正確答案）。

#### Step 3: 更新機率計算函式

**檔案**: `prediction-app/lib/features/market/widgets/neo_betting_bottom_sheet.dart`

**修改位置**: 第 226-261 行的 `_calculateCurrentProbability()` 方法

```dart
double _calculateCurrentProbability(MarketOption option) {
  final questionType = _getQuestionType();
  
  // 如果是 LMSR 機制，使用 priceYes/priceNo
  if (widget.market.mechanism == 'LMSR_V1') {
    // 從 market model 或 state 取得 priceYes
    final priceYes = option.priceYes ?? 0.5; // 需要從 API 取得
    final priceNo = 1.0 - priceYes;
    
    if (_isYesSide) {
      return priceYes * 100;
    } else {
      return priceNo * 100;
    }
  }
  
  // 舊的 Parimutuel 邏輯（保留向後兼容）
  if (questionType == 'binary') {
    // ... 舊邏輯
  }
  // ...
}
```

### E.2 哪些舊的 Parimutuel 機率計算必須移除？

**需要移除或標記為 deprecated**:

#### 1. `_getYesVolume()` 和 `_getNoVolume()` 方法

**檔案**: `neo_betting_bottom_sheet.dart`

**問題**: 這些方法從 `MarketOption.volume` 或 `MarketOption.yesVolume` / `MarketOption.noVolume` 取得數據，這些欄位是 Parimutuel 系統的。

**建議**: 
- 保留方法（向後兼容），但標記為 deprecated
- 新增 `_getLmsrPriceYes()` 和 `_getLmsrPriceNo()` 方法

#### 2. `_calculateCurrentProbability()` 中的 Parimutuel 邏輯

**檔案**: `neo_betting_bottom_sheet.dart` 第 226-261 行

**需要修改**:
```dart
double _calculateCurrentProbability(MarketOption option) {
  final questionType = _getQuestionType();
  final mechanism = widget.market.mechanism;
  
  // 優先使用 LMSR 價格
  if (mechanism == 'LMSR_V1') {
    return _calculateLmsrProbability(option);
  }
  
  // 向後兼容：Parimutuel 邏輯
  return _calculateParimutuelProbability(option, questionType);
}

double _calculateLmsrProbability(MarketOption option) {
  final priceYes = option.priceYes ?? 0.5;
  final priceNo = 1.0 - priceYes;
  return _isYesSide ? priceYes * 100 : priceNo * 100;
}

double _calculateParimutuelProbability(MarketOption option, String questionType) {
  // 舊的邏輯（保留向後兼容）
  if (questionType == 'binary') {
    // ...
  }
  // ...
}
```

#### 3. `_calculateNewProbability()` 方法

**檔案**: `neo_betting_bottom_sheet.dart` 第 264 行開始

**需要修改**: 類似於 `_calculateCurrentProbability()`，優先使用 LMSR quote API。

**建議**:
```dart
Future<double> _calculateNewProbability() async {
  final mechanism = widget.market.mechanism;
  
  if (mechanism == 'LMSR_V1') {
    // 調用 quote API 取得交易後的價格
    return await _calculateLmsrNewProbability();
  }
  
  // 向後兼容：Parimutuel 邏輯
  return _calculateParimutuelNewProbability();
}

Future<double> _calculateLmsrNewProbability() async {
  // 調用 POST /option-markets/:id/quote
  // 取得交易後的 priceYesAfter
  // 返回 priceYesAfter * 100 或 priceNoAfter * 100
}
```

#### 4. `_calculateOdds()` 方法

**檔案**: `neo_betting_bottom_sheet.dart` 第 1300 行左右

**問題**: 此方法使用 Parimutuel 邏輯計算賠率。

**建議**: 
- 對於 LMSR 系統，賠率 = `1 / priceYes`（買入 YES）或 `1 / priceNo`（買入 NO）
- 或直接顯示價格，不顯示賠率

### E.3 前端需要新增的功能

#### 1. 調用 Bundle Quote API

```dart
Future<BundleQuoteResult> getBundleQuote({
  required String marketId,
  required String bundleType, // 'BUY_YES' | 'BUY_NO'
  required String targetOptionId,
  required String amountType, // 'COIN' | 'SHARES'
  required String amount,
}) async {
  final response = await apiClient.dio.post(
    '/option-markets/bundle/quote',
    data: {
      'marketId': marketId,
      'bundleType': bundleType,
      'targetOptionId': targetOptionId,
      'amountType': amountType,
      'amount': amount,
    },
  );
  return BundleQuoteResult.fromJson(response.data);
}
```

#### 2. 調用 Bundle Trade API

```dart
Future<BundleQuoteResult> executeBundleTrade({
  required String marketId,
  required String bundleType,
  required String targetOptionId,
  required String amountType,
  required String amount,
}) async {
  final response = await apiClient.dio.post(
    '/option-markets/bundle/trade',
    data: {
      'marketId': marketId,
      'bundleType': bundleType,
      'targetOptionId': targetOptionId,
      'amountType': amountType,
      'amount': amount,
    },
  );
  return BundleQuoteResult.fromJson(response.data);
}
```

#### 3. 顯示 Bundle Quote 結果

在 `neo_betting_bottom_sheet.dart` 中，當用戶選擇「買入 NO」時：
- 顯示總成本
- 顯示各 component 的影響（選項 A: 買入 NO，選項 B: 買入 YES，...）
- 顯示預估收益

---

## 總結

### 最小改動要點

1. **後端**:
   - ✅ 新增 `POST /option-markets/bundle/quote` API
   - ✅ 新增 `POST /option-markets/bundle/trade` API
   - ✅ 新增 `POST /option-markets/:optionMarketId/close-position` API（可選，可用現有 SELL API）
   - ✅ 不新增表，使用現有 Trade / Position / Transaction 結構

2. **前端**:
   - ✅ 調用 `GET /option-markets/market/:marketId` 取得價格
   - ✅ 修改機率計算邏輯，優先使用 LMSR 價格
   - ✅ 新增 Bundle Quote/Trade 調用
   - ✅ 移除或標記 Parimutuel 機率計算為 deprecated

3. **資料流**:
   - ✅ Buy Yes(i) → 單一 Trade 記錄
   - ✅ Buy No(i) → 多個 Trade 記錄（1 個 NO + N-1 個 YES）
   - ✅ 平倉 → 使用現有 SELL_YES / SELL_NO

### 實作優先順序

1. **Phase 1**: Bundle Quote API（後端）
2. **Phase 2**: Bundle Trade API（後端）
3. **Phase 3**: 前端機率顯示修正（調用 LMSR API）
4. **Phase 4**: 前端 Bundle 交易 UI
5. **Phase 5**: 平倉功能（可選）

---

**報告完成時間**: 2025-01-XX
**報告作者**: AI Assistant (NestJS/TypeORM 架構師)

