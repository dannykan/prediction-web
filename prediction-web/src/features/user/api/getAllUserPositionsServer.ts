/**
 * Get all user positions (server-side)
 * Calls BFF /api/users/[id]/positions
 */

import { bffServerFetch } from "@/core/api/bffServerFetch";
import type { UserPosition } from "./getAllUserPositions";

export async function getAllUserPositionsServer(
  userId: string,
): Promise<UserPosition[]> {
  try {
    const positions = await bffServerFetch<UserPosition[]>(
      `/api/users/${encodeURIComponent(userId)}/positions`,
      {
        method: "GET",
        next: { revalidate: 60 },
      }
    );

    return Array.isArray(positions) ? positions : [];
  } catch (error) {
    console.error("[getAllUserPositionsServer] Failed to fetch user positions:", error);
    return [];
  }
}
