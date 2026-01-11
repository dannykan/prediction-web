/**
 * Get user statistics from Server Components
 * Calls BFF /api/users/[id]/statistics
 */

import type { UserStatistics } from "../types/user-statistics";
import { bffServerFetch } from "@/core/api/bffServerFetch";

export async function getUserStatisticsServer(
  userId: string,
): Promise<UserStatistics | null> {
  try {
    const data = await bffServerFetch<UserStatistics>(
      `/api/users/${encodeURIComponent(userId)}/statistics`,
      {
        next: { revalidate: 0 }, // Always revalidate for user data
      },
    );
    return data;
  } catch (error: any) {
    // If the error is 401, it means not authenticated, return null silently
    if (error.status === 401 || error.message?.includes("401")) {
      return null;
    }
    console.error("[getUserStatisticsServer] Failed to fetch user statistics:", error);
    return null;
  }
}

