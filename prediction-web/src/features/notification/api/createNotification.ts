/**
 * Create a notification for a user
 * Calls BFF /api/notifications/create
 */

export interface CreateNotificationParams {
  userId: string;
  type: string;
  icon: string;
  title: string;
  message: string;
  color: string;
  relatedId?: string | null;
}

export interface CreateNotificationResponse {
  success: boolean;
  notificationId?: number;
  message?: string;
}

export async function createNotification(
  params: CreateNotificationParams,
): Promise<CreateNotificationResponse> {
  try {
    const response = await fetch(`/api/notifications/create?userId=${encodeURIComponent(params.userId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        type: params.type,
        icon: params.icon,
        title: params.title,
        message: params.message,
        color: params.color,
        relatedId: params.relatedId || null,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "創建通知失敗",
      }));
      throw new Error(errorData.message || `創建通知失敗: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[createNotification] Failed to create notification:", error);
    throw error;
  }
}
