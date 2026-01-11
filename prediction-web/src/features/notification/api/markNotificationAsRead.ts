/**
 * Mark a notification as read (client-side)
 */

export async function markNotificationAsRead(
  notificationId: number,
  userId: string,
): Promise<void> {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.statusText}`);
    }
  } catch (error) {
    console.error("[markNotificationAsRead] Failed to mark notification as read:", error);
    throw error;
  }
}
