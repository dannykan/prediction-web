import { bffServerFetch } from "@/core/api/bffServerFetch";
import type { Market } from "../types/market";
import { normalizeMarket } from "./normalizeMarket";
import type { HomeData } from "./getHomeDataClient";

// Re-export HomeData type for convenience
export type { HomeData } from "./getHomeDataClient";

/**
 * Get aggregated home page data (Server Component version)
 * Uses bffServerFetch for server-side rendering
 * 
 * @param params - Query parameters (filter, search, categoryId)
 * @param revalidate - ISR revalidation time in seconds (default: 60)
 * @returns Aggregated home page data
 */
export async function getHomeData(
  params?: {
    filter?: 'all' | 'latest' | 'closingSoon' | 'followed' | 'myBets';
    search?: string;
    categoryId?: string;
  },
  revalidate: number | false = 60,
): Promise<HomeData> {
  // Build query string
  const queryParams = new URLSearchParams();
  if (params?.filter) queryParams.append("filter", params.filter);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.categoryId) queryParams.append("categoryId", params.categoryId);

  const queryString = queryParams.toString();
  const url = `/api/markets/home-data${queryString ? `?${queryString}` : ""}`;

  try {
    const data = await bffServerFetch<{
      user: any;
      userStatistics: any;
      quests: any;
      unreadNotificationsCount: number;
      markets: any[];
      categories: any[];
      followedMarkets: any[];
      marketsWithPositions: any[];
    }>(url, {
      method: "GET",
      next: { revalidate },
    });

    // Normalize markets
    return {
      ...data,
      markets: data.markets.map(normalizeMarket),
      followedMarkets: data.followedMarkets.map(normalizeMarket),
      marketsWithPositions: data.marketsWithPositions.map(normalizeMarket),
    };
  } catch (error) {
    console.error("[getHomeData] Failed to fetch home data:", error);
    // Return empty data on error (graceful degradation)
    return {
      user: null,
      userStatistics: null,
      quests: null,
      unreadNotificationsCount: 0,
      markets: [],
      categories: [],
      followedMarkets: [],
      marketsWithPositions: [],
    };
  }
}

