# 後端需要添加的通知創建 API

## 需求

前端已實現新手禮包通知功能，需要在應用邀請碼成功後創建通知。後端需要添加對應的 API 端點。

## 需要添加的 API 端點

### POST /notifications/create

**功能描述**: 創建一個新的通知

**請求參數**:
- Query Parameter: `userId` (string, required) - 接收通知的用戶 ID
- Body:
  ```json
  {
    "type": "string",        // 通知類型（如 "gift", "follow", "comment" 等）
    "icon": "string",       // 圖標（表情符號，如 "🎁"）
    "title": "string",      // 通知標題
    "message": "string",    // 通知內容
    "color": "string",      // 顏色 Hex 值（如 "#FF6B35"）
    "relatedId": "string | null"  // 相關 ID（可選，用於導航）
  }
  ```

**請求範例**:
```
POST /notifications/create?userId=123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "type": "gift",
  "icon": "🎁",
  "title": "新手禮包",
  "message": "歡迎加入神預測！您已成功領取新手禮包，快去查看您的獎勵吧！",
  "color": "#FF6B35",
  "relatedId": null
}
```

**響應格式**:
```json
{
  "success": true,
  "notificationId": 123,
  "message": "Notification created successfully"
}
```

**錯誤響應**:
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

## 後端實現建議

在 `notifications.controller.ts` 中添加：

```typescript
import { Post, Body } from '@nestjs/common';

@Post('create')
async createNotification(
  @Query('userId') userId: string,
  @Body() createNotificationDto: {
    type: string;
    icon: string;
    title: string;
    message: string;
    color: string;
    relatedId?: string | null;
  },
) {
  if (!userId) {
    throw new Error('userId is required');
  }

  const notification = await this.notificationsService.createNotification({
    userId,
    type: createNotificationDto.type as NotificationType,
    icon: createNotificationDto.icon,
    title: createNotificationDto.title,
    message: createNotificationDto.message,
    color: createNotificationDto.color,
    relatedId: createNotificationDto.relatedId || null,
  });

  return {
    success: true,
    notificationId: notification.id,
    message: 'Notification created successfully',
  };
}
```

## 前端已實現的功能

1. ✅ 創建通知的 API 函數 (`createNotification.ts`)
2. ✅ BFF 路由 (`/api/notifications/create/route.ts`)
3. ✅ 在應用邀請碼成功後自動創建新手禮包通知
4. ✅ 手機版紅點提示功能

## 當前狀態

- ✅ 前端代碼已完成
- ⚠️ 等待後端添加 `POST /notifications/create` 端點

## 測試

後端端點添加後，可以通過以下方式測試：

1. 新用戶註冊並應用邀請碼
2. 檢查是否成功創建新手禮包通知
3. 在通知列表中查看通知
4. 手機版左上角菜單圖標應顯示紅點提示
