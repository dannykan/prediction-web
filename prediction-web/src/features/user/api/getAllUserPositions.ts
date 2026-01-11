/**
 * Get all user positions across all markets
 * Calls BFF /api/users/[id]/positions
 */

export interface UserPosition {
  positionId: string;
  marketId: string;
  marketTitle: string;
  marketShortcode?: string | null;
  questionType: string;
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
  avgPrice?: string;
  firstTradeAt: string;
  lastTradeAt: string;
  isBundle?: boolean;
}

export async function getAllUserPositions(
  userId: string,
): Promise<UserPosition[]> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}/positions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        return []; // Not authenticated
      }
      throw new Error(
        `Failed to fetch user positions: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[getAllUserPositions] Failed to fetch user positions:", error);
    return [];
  }
}
