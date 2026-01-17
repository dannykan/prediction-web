# 储值功能配置总结

## ✅ 已实现的功能

1. ✅ 后端 API 完整实现
2. ✅ 前端 UI 完整实现
3. ✅ 功能开关机制
4. ✅ "审核中"状态提示

## 📋 当前配置建议

### 阶段 1: 审核期间（当前）

**后端环境变量（Railway/生产环境）：**

```env
# 绿界支付配置
ECPAY_MERCHANT_ID=3487530
ECPAY_HASH_KEY=l79vBQ690KRZIXZT
ECPAY_HASH_IV=S9jXHiYYrIsNSndS
ECPAY_ENV=production
ECPAY_ENABLED=false  # ⚠️ 审核期间设为 false
ECPAY_STATUS=pending  # 显示"审核中"提示

# URL 配置
FRONTEND_URL=https://predictiongod.app
ECPAY_RETURN_URL=https://predictiongod.app/api/topup/callback
ECPAY_ORDER_RESULT_URL=https://predictiongod.app/topup/success
```

**效果：**
- 用户访问储值页面时，会看到"储值功能审核中"的提示
- 无法创建订单（API 会返回 503 Service Unavailable）
- 功能开关已实现，前端会自动检查状态

### 阶段 2: 审核通过后

**更新环境变量：**

```env
ECPAY_ENABLED=true   # 启用功能
ECPAY_STATUS=approved  # 状态改为已批准
```

**操作步骤：**
1. 在 Railway Dashboard 中更新环境变量
2. 重新部署或等待自动重启
3. 验证功能是否正常

## 🧪 本地测试（推荐）

### 为什么要先本地测试？

1. **避免影响生产环境** - 审核期间不应该有真实交易
2. **可以自由测试** - 使用绿界测试环境，不会产生实际费用
3. **调试方便** - 本地环境更容易排查问题

### 本地测试步骤

#### 1. 获取测试环境参数

1. 登录绿界后台：https://vendor.ecpay.com.tw/
2. 进入「系统开发管理」→「系统介接测试」
3. 复制测试环境的：
   - MerchantID
   - HashKey
   - HashIV

#### 2. 配置本地环境变量

在 `prediction-backend/.env.local` 中添加：

```env
# 绿界支付 - 测试环境
ECPAY_MERCHANT_ID=你的测试MerchantID
ECPAY_HASH_KEY=你的测试HashKey
ECPAY_HASH_IV=你的测试HashIV
ECPAY_ENV=test
ECPAY_ENABLED=true
ECPAY_STATUS=approved

# URL 配置（本地）
FRONTEND_URL=http://localhost:3001
ECPAY_RETURN_URL=http://localhost:3000/api/topup/callback
ECPAY_ORDER_RESULT_URL=http://localhost:3001/topup/success
```

在 `prediction-web/.env.local` 中添加：

```env
NEXT_PUBLIC_ECPAY_URL=https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5
```

#### 3. 运行本地服务

```bash
# 终端 1: 后端
cd prediction-backend
npm run start:dev

# 终端 2: 前端
cd prediction-web
npm run dev
```

#### 4. 测试流程

1. 访问 `http://localhost:3001/topup`
2. 选择储值方案
3. 使用绿界测试卡号完成支付
4. 验证回调接收和余额增加

## 🔄 正式环境部署流程

### 步骤 1: 审核期间配置

1. 在 Railway 环境变量中设置：
   ```env
   ECPAY_ENABLED=false
   ECPAY_STATUS=pending
   ```

2. 部署代码

3. 验证：访问 https://predictiongod.app/topup，应该显示"审核中"提示

### 步骤 2: 审核通过后配置

1. 在 Railway 环境变量中更新：
   ```env
   ECPAY_ENABLED=true
   ECPAY_STATUS=approved
   ```

2. 重新部署或等待自动重启

3. 测试完整支付流程

## 📝 API 端点

### GET /api/topup/status-check

检查储值功能状态（前端调用）

**响应：**
```json
{
  "enabled": false,
  "status": "pending",
  "message": "储值功能审核中，敬请期待"
}
```

### POST /api/topup/create

创建储值订单（需要认证）

**如果未启用，返回 503：**
```json
{
  "statusCode": 503,
  "message": "储值功能审核中，敬请期待"
}
```

## 🔍 功能开关机制

### 后端检查

- `TopupController.create()` - 检查 `ECPAY_ENABLED`，如果为 `false` 则返回 503
- `TopupController.getStatusCheck()` - 返回当前功能状态

### 前端检查

- `TopupUIClient` 组件在加载时调用 `/api/topup/status-check`
- 如果 `enabled: false`，显示"审核中"提示，隐藏储值方案卡片

## ✅ 检查清单

### 审核期间
- [ ] 后端环境变量 `ECPAY_ENABLED=false`
- [ ] 后端环境变量 `ECPAY_STATUS=pending`
- [ ] 前端显示"审核中"提示
- [ ] 无法创建订单（API 返回 503）

### 审核通过后
- [ ] 更新 `ECPAY_ENABLED=true`
- [ ] 更新 `ECPAY_STATUS=approved`
- [ ] 重启服务
- [ ] 验证可以创建订单
- [ ] 测试支付流程
- [ ] 验证回调接收
- [ ] 验证余额增加

## 📚 相关文档

- [ECPay 整合指南](./prediction-backend/ECPAY_INTEGRATION_GUIDE.md)
- [环境变量配置](./prediction-backend/ECPAY_ENV_SETUP.md)
- [模块实现报告](./prediction-backend/TOPUP_MODULE_IMPLEMENTATION.md)

---

**当前建议：** 

✅ **先在本地使用测试环境进行开发和测试**  
⏳ **生产环境保持 `ECPAY_ENABLED=false`，显示"审核中"提示**  
🚀 **审核通过后，更新环境变量即可立即启用功能**

---

**最后更新：** 2026-01-17
