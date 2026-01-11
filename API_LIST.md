# API 调用列表

以下是 `market_detail_screen.dart`、`home_page.dart`、`home_top_bar.dart` 和 `compact_market_card.dart` 中调用的所有 API：

## 1. Market Detail Screen (`market_detail_screen.dart`)

### Market Repository APIs
- **GET** `/markets/{marketId}` - 获取市场详情
  - 如果 marketId 是 shortCode（8位Base62），先调用 `/markets/by-code/{code}` 获取 UUID
  - 支持 `userId` 查询参数（用于获取 userSelectionId）

- **GET** `/markets/by-code/{code}` - 根据 shortCode 获取市场 UUID
  - 支持 `userId` 查询参数

- **GET** `/markets/{marketId}/bets` - 获取市场下注记录列表

- **POST** `/markets/{marketId}/options` - 新增市场答案选项
  - Body: `{ "name": "选项名称" }`
  - 费用：100 G coin

- **POST** `/markets/{marketId}/follow` - 关注市场
  - 支持 `userId` 查询参数

- **DELETE** `/markets/{marketId}/follow` - 取消关注市场
  - 支持 `userId` 查询参数

- **GET** `/markets/{marketId}/follow/status` - 检查市场关注状态
  - 支持 `userId` 查询参数

- **POST** `/markets/{marketId}/report` - 举报市场
  - 支持 `userId` 查询参数
  - Body: `{ "reason": "举报原因" }`

### Comment Repository APIs
- **GET** `/markets/{marketId}/comments` - 获取市场评论列表（分页）
  - Query Parameters:
    - `page` (默认: 1)
    - `limit` (默认: 20)
    - `userId` (可选，用于获取用户点赞状态)
    - `includeUserBets` (可选，是否包含用户下注信息)

- **POST** `/markets/{marketId}/comments` - 发布评论
  - Query Parameters: `userId`
  - Body: `{ "content": "评论内容" }`

- **POST** `/markets/{marketId}/comments/{commentId}/like` - 点赞评论
  - Query Parameters: `userId`

### Bet Provider APIs
- **GET** `/bets/my` - 获取用户下注列表
  - Query Parameters: `userId`

### Followed Markets Provider APIs
- **GET** `/markets/followed` - 获取用户关注的市场列表
  - Query Parameters: `userId`

### Wallet Provider APIs
- **GET** `/wallet` - 获取钱包余额
  - Query Parameters: `userId`

## 2. Home Page (`home_page.dart`)

### Market Provider APIs
- **GET** `/markets` - 获取市场列表
  - Query Parameters:
    - `categoryId` (可选)
    - `status` (可选，如 'OPEN')
    - `sort` (可选)
    - `search` (可选)
    - `userId` (可选，用于获取 userSelectionId)

- **GET** `/categories` - 获取分类列表

### User Providers APIs
- **GET** `/users/{userId}/profile` - 获取用户资料

- **GET** `/wallet` - 获取钱包余额
  - Query Parameters: `userId`

- **GET** `/bets/my` - 获取用户下注列表
  - Query Parameters: `userId`

- **GET** `/markets/followed` - 获取用户关注的市场列表
  - Query Parameters: `userId`

- **GET** `/daily-bonus/status` - 获取每日签到状态
  - Query Parameters: `userId`

## 3. Home Top Bar (`home_top_bar.dart`)

### User Profile APIs
- **GET** `/users/{userId}/profile` - 获取用户资料

- **GET** `/users/{userId}/statistics` - 获取用户统计数据（总资产等）

### Wallet APIs
- **GET** `/wallet` - 获取钱包余额
  - Query Parameters: `userId`

### Quest APIs
- **GET** `/quests` - 获取任务列表（每日任务和每周任务）
  - Query Parameters: `userId`

### Leaderboard APIs
- **GET** `/leaderboard/current-user` - 获取当前用户在神人榜的排名
  - Query Parameters:
    - `userId`
    - `type` = 'gods' (神人榜)
    - `timeframe` = 'season'
    - `season` = 'S1', 'S2', ... (当前赛季，动态计算)
    - `limit` = 100

### Category APIs
- **GET** `/categories` - 获取分类列表

## 4. Compact Market Card (`compact_market_card.dart`)

### Comment Provider APIs
- **GET** `/markets/{marketId}/comments` - 获取市场评论数量
  - Query Parameters:
    - `page` = 1
    - `limit` = 1 (仅用于获取总数)
    - `userId` (可选)

### Navigation
- 不直接调用 API，点击卡片后导航到市场详情页

## API 端点汇总表

| 端点 | 方法 | 用途 | 文件 |
|------|------|------|------|
| `/markets` | GET | 获取市场列表 | home_page, market_detail |
| `/markets/{marketId}` | GET | 获取市场详情 | market_detail |
| `/markets/by-code/{code}` | GET | 根据 shortCode 获取 UUID | market_detail |
| `/markets/{marketId}/bets` | GET | 获取市场下注记录 | market_detail |
| `/markets/{marketId}/comments` | GET | 获取评论列表 | market_detail, compact_market_card |
| `/markets/{marketId}/comments` | POST | 发布评论 | market_detail |
| `/markets/{marketId}/comments/{commentId}/like` | POST | 点赞评论 | market_detail |
| `/markets/{marketId}/options` | POST | 新增答案选项 | market_detail |
| `/markets/{marketId}/follow` | POST | 关注市场 | market_detail |
| `/markets/{marketId}/follow` | DELETE | 取消关注市场 | market_detail |
| `/markets/{marketId}/follow/status` | GET | 检查关注状态 | market_detail |
| `/markets/{marketId}/report` | POST | 举报市场 | market_detail |
| `/markets/followed` | GET | 获取关注的市场列表 | home_page, market_detail |
| `/categories` | GET | 获取分类列表 | home_page, home_top_bar |
| `/bets/my` | GET | 获取用户下注列表 | home_page, market_detail |
| `/wallet` | GET | 获取钱包余额 | home_page, home_top_bar, market_detail |
| `/users/{userId}/profile` | GET | 获取用户资料 | home_page, home_top_bar |
| `/users/{userId}/statistics` | GET | 获取用户统计数据 | home_top_bar |
| `/users/{userId}/markets/recent-viewed` | GET | 获取最近浏览的市场 | (在 repository 中定义) |
| `/quests` | GET | 获取任务列表 | home_top_bar |
| `/leaderboard/current-user` | GET | 获取神人榜排名 | home_top_bar |
| `/daily-bonus/status` | GET | 获取每日签到状态 | home_page |

## 注意事项

1. **userId 参数**: 大部分 API 支持可选的 `userId` 查询参数，用于：
   - 获取用户特定的数据（如 userSelectionId）
   - 获取用户的点赞状态
   - 过滤用户创建的市场

2. **shortCode 支持**: 市场详情 API 支持使用 shortCode（8位 Base62）或 UUID 作为 marketId：
   - 如果是 shortCode，先调用 `/markets/by-code/{code}` 获取 UUID
   - 如果是 UUID，直接调用 `/markets/{marketId}`

3. **分页支持**: 评论列表 API 支持分页：
   - `page`: 页码（默认: 1）
   - `limit`: 每页数量（默认: 20）

4. **错误处理**: 
   - 404 错误通常表示功能未实现（如评论功能）
   - 某些 API 返回空列表而不是抛出异常（如最近浏览的市场）



