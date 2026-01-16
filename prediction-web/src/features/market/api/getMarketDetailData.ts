/**
 * Get aggregated market detail data (reduces API calls)
 * This endpoint combines market info, trades, option markets, positions, and user data
 */

import { clientFetch } from "@/core/api/client";
import type { Market } from "../types/market";
import type { Trade, TradesResponse } from "./getAllTrades";
import type { OptionMarketInfo } from "./lmsr";
import type { Position, ExclusivePosition } from "./lmsr";
import type { ExclusiveMarketInfo } from "./lmsr";

export interface MarketDetailData {
  // Market basic information
  market: Market;

  // User information (if logged in)
  user?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    statistics?: {
      profitRate: {
        total: {
          totalAssets: number;
        };
      };
    };
    followStatus?: boolean;
  };

  // Market data
  marketData: {
    // Trades for chart and history
    trades: Trade[];

    // Initial prices (for single choice charts)
    initialPrices?: Array<{
      outcomeId: string;
      optionId: string | null;
      price: string;
      optionName?: string | null;
    }>;

    // Exclusive market info (for single choice questions)
    exclusiveMarket?: ExclusiveMarketInfo;

    // Option markets info (for YES_NO and MULTIPLE_CHOICE questions)
    optionMarkets?: OptionMarketInfo[];
  };

  // User positions (if logged in)
  positions?: {
    regular: Position[];
    exclusive: ExclusivePosition[];
  };
}

/**
 * Get aggregated market detail data
 * This reduces API calls from 8-10 to 1-2 calls
 */
export async function getMarketDetailData(
  marketId: string
): Promise<MarketDetailData> {
  const response = await clientFetch(
    `/api/markets/${encodeURIComponent(marketId)}/detail-data`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch market detail data: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
