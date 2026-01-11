import { bffServerFetch } from "@/core/api/bffServerFetch";
import type { LeaderboardEntry, LeaderboardResponse, LeaderboardType, LeaderboardTimeframe } from "../types/leaderboard";

export interface GetLeaderboardParams {
  type: LeaderboardType;
  timeframe: LeaderboardTimeframe;
  season?: string; // e.g., "S1", "S2"
  limit?: number;
  userId?: string; // For getting current user rank
}

/**
 * Get leaderboard from Server Components
 * Calls BFF /api/users/leaderboard
 */
export async function getLeaderboard(
  params: GetLeaderboardParams,
): Promise<LeaderboardResponse> {
  const { type, timeframe, season, limit = 50, userId } = params;

  const queryParams = new URLSearchParams();
  queryParams.append("type", type);
  queryParams.append("timeframe", timeframe);
  if (season) queryParams.append("season", season);
  queryParams.append("limit", limit.toString());
  if (userId) queryParams.append("userId", userId);

  const queryString = queryParams.toString();
  const url = `/api/users/leaderboard${queryString ? `?${queryString}` : ""}`;

  try {
    const data = await bffServerFetch<LeaderboardResponse | LeaderboardEntry[]>(url, {
      next: { revalidate: 0 }, // Always revalidate for leaderboard data
    });

    // Handle both response formats:
    // 1. Direct array: [{...}, {...}]
    // 2. Object: {leaderboard: [...], currentUserRank: {...}}
    if (Array.isArray(data)) {
      return {
        leaderboard: data,
        currentUserRank: null,
      };
    }

    return data;
  } catch (error) {
    console.error("[getLeaderboard] Failed to fetch leaderboard:", error);
    throw error;
  }
}



