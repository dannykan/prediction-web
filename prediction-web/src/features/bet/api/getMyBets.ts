/**
 * Get user's bets
 * Calls BFF /api/bets/my?userId={userId}
 */

import type { Bet } from "../types/bet";

export async function getMyBets(userId: string): Promise<Bet[]> {
  try {
    const response = await fetch(
      `/api/bets/my?userId=${encodeURIComponent(userId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Don't cache authenticated requests
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        return []; // Not authenticated, return empty array
      }
      throw new Error(`Failed to fetch bets: ${response.statusText}`);
    }

    const data = await response.json();
    // Backend may return array directly or wrapped in object
    return Array.isArray(data) ? data : data.bets || [];
  } catch (error) {
    console.error("[getMyBets] Failed to fetch bets:", error);
    return [];
  }
}



