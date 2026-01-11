/**
 * Get unread notifications count (client-side)
 */

export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const response = await fetch(`/api/notifications/unread-count?userId=${encodeURIComponent(userId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unread count: ${response.statusText}`);
    }

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error("[getUnreadCount] Failed to fetch unread count:", error);
    return 0;
  }
}
