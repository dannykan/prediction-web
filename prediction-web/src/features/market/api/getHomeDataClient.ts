import type { Market } from "../types/market";
import type { Category } from "./getCategories";
import { normalizeMarket } from "./normalizeMarket";

/**
 * Home page data response type
 */
export interface HomeData {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    coinBalance: number;
    isVip: boolean;
    rank: {
      level: number;
      name: string;
      title: string;
      totalTurnover: number;
    };
    rankLevel: number;
  } | null;
  userStatistics: {
    userId: string;
    statistics: {
      profitRate: {
        total: {
          profit: number;
          coinBalance: number;
          totalInvested: number;
          totalPending: number;
          totalAssets: number;
          rate: number;
        };
        season: {
          profit: number;
          seasonStartBalance: number;
          seasonInvested: number;
          seasonPending: number;
          rate: number;
          seasonId: string;
          seasonStartDate: string;
        };
      };
    };
  } | null;
  quests: {
    dailyQuests: any[];
    weeklyQuests: any[];
    canClaimCompletionBonus: boolean;
    completionBonusClaimed: boolean;
    completionBonusReward: number;
    totalQuests: number;
    completedQuests: number;
  } | null;
  unreadNotificationsCount: number;
  markets: Market[];
  categories: Category[];
  followedMarkets: Market[];
  marketsWithPositions: Market[];
}

/**
 * Get aggregated home page data (Client Component version)
 * Uses fetch for client-side requests
 * 
 * @param params - Query parameters (filter, search, categoryId)
 * @returns Aggregated home page data
 */
export async function getHomeDataClient(
  params?: {
    filter?: 'all' | 'latest' | 'closingSoon' | 'followed' | 'myBets';
    search?: string;
    categoryId?: string;
  },
): Promise<HomeData> {
  // Build query string
  const queryParams = new URLSearchParams();
  if (params?.filter) queryParams.append("filter", params.filter);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.categoryId) queryParams.append("categoryId", params.categoryId);

  const queryString = queryParams.toString();
  const url = `/api/markets/home-data${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: 'include', // Include cookies for authentication
      cache: 'no-store', // Don't cache client-side requests
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch home data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as {
      user: any;
      userStatistics: any;
      quests: any;
      unreadNotificationsCount: number;
      markets: any[];
      categories: any[];
      followedMarkets: any[];
      marketsWithPositions: any[];
    };

    // Normalize markets
    return {
      ...data,
      markets: data.markets.map(normalizeMarket),
      followedMarkets: data.followedMarkets.map(normalizeMarket),
      marketsWithPositions: data.marketsWithPositions.map(normalizeMarket),
    };
  } catch (error) {
    console.error("[getHomeDataClient] Failed to fetch home data:", error);
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
