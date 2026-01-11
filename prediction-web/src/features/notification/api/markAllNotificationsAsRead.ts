/**
 * Mark all notifications as read (client-side)
 */

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const response = await fetch("/api/notifications/read-all", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
    }
  } catch (error) {
    console.error("[markAllNotificationsAsRead] Failed to mark all notifications as read:", error);
    throw error;
  }
}
