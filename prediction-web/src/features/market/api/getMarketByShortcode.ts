import type { Market } from "../types/market";
import { normalizeMarket } from "./normalizeMarket";
import { bffServerFetch } from "@/core/api/bffServerFetch";

/**
 * Backend market detail response type
 */
interface BackendMarketDetail {
  id: string;
  shortCode?: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  volume: number;
  tags: string[];
  updatedAt: string;
  options: Array<{
    id: string;
    name: string;
    betCount: number;
    volume: number;
    yesVolume?: number;
    noVolume?: number;
  }>;
  votePercentage?: Record<string, number>;
  // Statistics fields
  tradeCount?: number;
  usersWithPositions?: number;
  commentsCount?: number;
  totalVolume?: number;
}

/**
 * Get market by shortcode from Railway backend API
 * 
 * @param shortcode - Market shortcode
 * @param revalidate - ISR revalidation time in seconds (default: 60)
 * @returns Normalized Market object or null if not found
 */
export async function getMarketByShortcode(
  shortcode: string,
  revalidate: number | false = 60,
): Promise<Market | null> {
  try {
    const backendMarket = await bffServerFetch<BackendMarketDetail>(
      `/api/markets/by-code/${encodeURIComponent(shortcode)}`,
      {
        method: "GET",
        next: { revalidate },
      },
    );

    // Debug log to check if statistics data is present
    if (process.env.NODE_ENV === 'development') {
      console.log('[getMarketByShortcode] Backend market data (stats):', {
        tradeCount: backendMarket.tradeCount,
        usersWithPositions: backendMarket.usersWithPositions,
        commentsCount: backendMarket.commentsCount,
        totalVolume: backendMarket.totalVolume,
      });
      console.log('[getMarketByShortcode] Backend market full object keys:', Object.keys(backendMarket));
      console.log('[getMarketByShortcode] Backend market full object:', JSON.stringify(backendMarket).substring(0, 500));
    }

    // Normalize backend market to frontend format
    return normalizeMarket(backendMarket);
  } catch (error) {
    // Check if it's a 404 error
    if (error instanceof Error && (error as any).status === 404) {
      return null;
    }
    console.error(
      `[getMarketByShortcode] Failed to fetch market with shortcode ${shortcode}:`,
      error,
    );
    // Return null on error (404 or other errors)
    return null;
  }
}
