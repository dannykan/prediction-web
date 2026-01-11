/**
 * Get notifications (client-side)
 */

export interface Notification {
  id: number;
  type: string;
  icon: string;
  title: string;
  message: string;
  timestamp: string;
  isNew: boolean;
  color: string;
  relatedId: string | null;
}

export async function getNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20,
): Promise<Notification[]> {
  try {
    const queryParams = new URLSearchParams({
      userId,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`/api/notifications?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    const notifications: Notification[] = await response.json();
    return notifications;
  } catch (error) {
    console.error("[getNotifications] Failed to fetch notifications:", error);
    return [];
  }
}
