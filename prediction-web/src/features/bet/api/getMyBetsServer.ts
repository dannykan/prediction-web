/**
 * Get user's bets from Server Components
 * Calls BFF /api/bets/my?userId={userId}
 */

import type { Bet } from "../types/bet";
import { bffServerFetch } from "@/core/api/bffServerFetch";

export async function getMyBetsServer(userId: string): Promise<Bet[]> {
  try {
    const data = await bffServerFetch<Bet[]>(
      `/api/bets/my?userId=${encodeURIComponent(userId)}`,
      {
        next: { revalidate: 0 }, // Always revalidate for user data
      },
    );
    // Backend may return array directly or wrapped in object
    return Array.isArray(data) ? data : (data as any).bets || [];
  } catch (error: any) {
    // If the error is 401, it means not authenticated, return empty array silently
    if (error.status === 401 || error.message?.includes("401")) {
      return [];
    }
    console.error("[getMyBetsServer] Failed to fetch bets:", error);
    return [];
  }
}

