/**
 * Follow market API functions
 */

/**
 * Check if user is following a market
 */
export async function checkFollowStatus(
  marketId: string,
  userId: string,
): Promise<{ isFollowed: boolean }> {
  try {
    const response = await fetch(
      `/api/markets/${encodeURIComponent(marketId)}/follow/status?userId=${encodeURIComponent(userId)}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(
        `Failed to check follow status: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("[checkFollowStatus] Failed to check follow status:", error);
    throw error;
  }
}

/**
 * Follow a market
 */
export async function followMarket(
  marketId: string,
  userId: string,
): Promise<void> {
  try {
    const response = await fetch(
      `/api/markets/${encodeURIComponent(marketId)}/follow?userId=${encodeURIComponent(userId)}`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(`Failed to follow market: ${response.statusText}`);
    }
  } catch (error) {
    console.error("[followMarket] Failed to follow market:", error);
    throw error;
  }
}

/**
 * Unfollow a market
 */
export async function unfollowMarket(
  marketId: string,
  userId: string,
): Promise<void> {
  try {
    const response = await fetch(
      `/api/markets/${encodeURIComponent(marketId)}/follow?userId=${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(`Failed to unfollow market: ${response.statusText}`);
    }
  } catch (error) {
    console.error("[unfollowMarket] Failed to unfollow market:", error);
    throw error;
  }
}
