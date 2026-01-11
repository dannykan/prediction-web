/**
 * Get all trades (transaction history) for a market
 */

import { clientFetch } from "@/core/api/client";

export interface TradeUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Trade {
  id: string;
  userId: string;
  user: TradeUser;
  outcomeId?: string;
  optionId: string | null;
  optionName: string;
  side: string;
  isBuy: boolean;
  shares: string;
  grossAmount: string;
  feeAmount: string;
  netAmount: string;
  totalCost: string;
  priceBefore?: string;
  priceAfter?: string;
  priceYesBefore?: string;
  priceYesAfter?: string;
  createdAt: string;
  allPricesAfter?: Array<{ // For single choice questions: all outcome prices after this trade
    outcomeId: string;
    optionId: string | null;
    price: string;
    optionName?: string | null; // Option name for display
  }>;
}

export interface TradesResponse {
  trades: Trade[];
  initialPrices?: Array<{
    outcomeId: string;
    optionId: string | null;
    price: string;
    optionName?: string | null;
  }>;
}

export async function getAllTrades(
  marketId: string,
  isSingle: boolean
): Promise<Trade[] | TradesResponse> {
  const endpoint = isSingle
    ? `/api/exclusive-markets/market/${encodeURIComponent(marketId)}/all-trades`
    : `/api/option-markets/market/${encodeURIComponent(marketId)}/all-trades`;

  const response = await clientFetch(endpoint, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch trades: ${response.statusText}`);
  }

  const data = await response.json();
  
  // For single choice, return object with trades and initialPrices
  // For YES_NO, return array for backward compatibility
  if (isSingle) {
    // Single choice: always return object format
    if (data && typeof data === 'object' && Array.isArray(data.trades)) {
      return data;
    } else if (Array.isArray(data)) {
      // Fallback: convert array to object format
      return { trades: data, initialPrices: [] };
    }
    return { trades: [], initialPrices: [] };
  } else {
    // YES_NO: return array for backward compatibility
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.trades)) {
      return data.trades;
    }
    return [];
  }
}

