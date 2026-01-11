/**
 * Get user's followed markets
 * Calls BFF /api/users/[id]/markets/followed
 */

import type { Market } from "../types/market";
import { normalizeMarket } from "./normalizeMarket";
import { bffServerFetch } from "@/core/api/bffServerFetch";

interface BackendMarketListItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  options: Array<{
    id: string;
    name: string;
    volume?: number;
    votePercentage?: number;
    betCount?: number;
  }>;
  volume?: number;
  totalVolume?: number;
  tags?: string[];
  updatedAt: string;
  createdAt?: string;
  [key: string]: any;
}

export async function getFollowedMarkets(
  userId: string,
  revalidate: number | false = 60,
): Promise<Market[]> {
  try {
    const backendMarkets = await bffServerFetch<BackendMarketListItem[]>(
      `/api/users/${encodeURIComponent(userId)}/markets/followed`,
      {
        next: { revalidate },
      },
    );

    return backendMarkets.map((market) => normalizeMarket(market as any));
  } catch (error: any) {
    // If the error is 401, it means not authenticated, return empty array silently
    if (error.status === 401 || error.message?.includes("401")) {
      return [];
    }
    console.error("[getFollowedMarkets] Failed to fetch followed markets:", error);
    return [];
  }
}

