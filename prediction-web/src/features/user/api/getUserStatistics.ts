/**
 * Get user statistics
 * Calls BFF /api/users/[id]/statistics
 */

import type { UserStatistics } from "../types/user-statistics";

export async function getUserStatistics(
  userId: string,
): Promise<UserStatistics | null> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}/statistics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache authenticated requests
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null; // Not authenticated
      }
      throw new Error(
        `Failed to fetch user statistics: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[getUserStatistics] Failed to fetch user statistics:", error);
    return null;
  }
}



