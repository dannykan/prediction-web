# 测试市场详情聚合 API

## 测试步骤

### 1. 在浏览器控制台测试（最简单）

打开市场详情页面，然后在浏览器控制台运行：

```javascript
// 测试聚合 API
async function testMarketDetailData() {
  const marketId = '630a44c2-0fef-444b-9956-d681f180c5ef'; // 替换为实际的市场 ID
  
  try {
    const response = await fetch(`/api/markets/${marketId}/detail-data`, {
      credentials: 'include',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('❌ API 错误:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('错误详情:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API 调用成功！');
    console.log('📊 返回数据结构:');
    console.log('- Market:', data.market ? '✅' : '❌');
    console.log('- Market Data:', data.marketData ? '✅' : '❌');
    console.log('  - Trades:', data.marketData?.trades?.length || 0, '笔');
    console.log('  - Option Markets:', data.marketData?.optionMarkets?.length || 0, '个');
    console.log('  - Exclusive Market:', data.marketData?.exclusiveMarket ? '✅' : '❌');
    console.log('- User:', data.user ? '✅ (已登录)' : '❌ (未登录)');
    console.log('- Positions:', data.positions ? '✅' : '❌');
    
    console.log('\n📦 完整数据:', data);
    
    // 验证数据完整性
    const issues = [];
    if (!data.market) issues.push('缺少 market 数据');
    if (!data.marketData) issues.push('缺少 marketData 数据');
    if (!data.marketData?.trades) issues.push('缺少 trades 数据');
    
    if (issues.length > 0) {
      console.warn('⚠️ 数据不完整:', issues);
    } else {
      console.log('✅ 所有必需数据都存在！');
    }
    
    return data;
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testMarketDetailData();
```

### 2. 使用 curl 测试后端 API（直接测试后端）

```bash
# 替换 MARKET_ID 为实际的市场 ID
MARKET_ID="630a44c2-0fef-444b-9956-d681f180c5ef"

# 测试未登录状态
curl -X GET "http://localhost:3001/api/markets/${MARKET_ID}/detail-data" \
  -H "Content-Type: application/json"

# 如果已登录，可以带上 cookie
curl -X GET "http://localhost:3001/api/markets/${MARKET_ID}/detail-data" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie-here"
```

### 3. 检查网络请求

在浏览器开发者工具的 Network 标签中：
1. 刷新市场详情页面
2. 查找 `/api/markets/[id]/detail-data` 请求
3. 检查：
   - Status Code 应该是 200
   - Response 应该包含完整的市场数据
   - 检查响应时间（应该比多个单独请求快）

## 预期结果

### 成功响应应该包含：

```json
{
  "market": {
    "id": "...",
    "title": "...",
    "questionType": "YES_NO",
    // ... 其他市场信息
  },
  "marketData": {
    "trades": [...],  // 交易记录数组
    "optionMarkets": [...],  // 选项市场（如果是 YES_NO 或 MULTIPLE_CHOICE）
    "exclusiveMarket": {...},  // 独家市场（如果是 SINGLE_CHOICE）
    "initialPrices": [...]  // 初始价格（如果是 SINGLE_CHOICE）
  },
  "user": {  // 如果已登录
    "id": "...",
    "displayName": "...",
    "statistics": {...},
    "followStatus": false
  },
  "positions": {  // 如果已登录
    "regular": [...],
    "exclusive": [...]
  }
}
```

## 常见问题排查

1. **404 错误**：检查路由顺序，确保 `/detail-data` 在 `/:id` 之前
2. **500 错误**：检查后端日志，可能是服务依赖问题
3. **数据缺失**：检查后端 `getMarketDetailData` 方法的实现
