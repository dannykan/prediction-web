/**
 * Get all users' positions for a market
 * Calls /api/option-markets/market/:marketId/all-positions or /api/exclusive-markets/market/:marketId/all-positions
 */

import { clientFetch } from "@/core/api/client";

export interface PositionUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface AllPosition {
  positionId: string;
  userId: string;
  user: PositionUser;
  optionMarketId?: string;
  outcomeId?: string;
  optionId: string | null;
  optionName: string;
  side: 'YES' | 'NO';
  shares: string;
  totalCost: string;
  currentValue: string;
  profitLoss: string;
  profitLossPercent: string;
  probabilityChange: string;
  currentProbability: string;
  firstTradeAt: string;
  lastTradeAt: string;
}

export async function getAllPositions(
  marketId: string,
  isSingle: boolean = false,
): Promise<AllPosition[]> {
  const endpoint = isSingle
    ? `/api/exclusive-markets/market/${encodeURIComponent(marketId)}/all-positions`
    : `/api/option-markets/market/${encodeURIComponent(marketId)}/all-positions`;

  const response = await clientFetch(endpoint);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to fetch positions: ${response.statusText}`);
  }

  const data = await response.json() as AllPosition[];
  return data;
}


