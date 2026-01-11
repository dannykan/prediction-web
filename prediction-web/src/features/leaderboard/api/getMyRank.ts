import { bffServerFetch } from "@/core/api/bffServerFetch";
import type { LeaderboardEntry, LeaderboardType, LeaderboardTimeframe } from "../types/leaderboard";

export interface GetMyRankParams {
  type: LeaderboardType;
  timeframe: LeaderboardTimeframe;
  season?: string;
}

/**
 * Get current user's rank from Server Components
 * Calls BFF /api/users/leaderboard/my-rank
 */
export async function getMyRank(
  params: GetMyRankParams,
): Promise<LeaderboardEntry | null> {
  const { type, timeframe, season } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("type", type);
  queryParams.append("timeframe", timeframe);
  if (season) queryParams.append("season", season);

  const queryString = queryParams.toString();
  const url = `/api/users/leaderboard/my-rank${queryString ? `?${queryString}` : ""}`;

  try {
    const data = await bffServerFetch<LeaderboardEntry | null>(url, {
      next: { revalidate: 0 }, // Always revalidate for user rank
    });

    return data;
  } catch (error: any) {
    if (error.status === 401 || error.status === 404) {
      return null; // User not authenticated or not ranked
    }
    console.error("[getMyRank] Failed to fetch my rank:", error);
    return null;
  }
}



