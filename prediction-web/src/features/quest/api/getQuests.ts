/**
 * Get user quests
 * Calls BFF /api/users/[id]/quests
 */

import type { QuestsResponse } from "../types/quest";

export async function getQuests(userId: string): Promise<QuestsResponse | null> {
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}/quests`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache authenticated requests
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null; // Not authenticated
      }
      throw new Error(`Failed to fetch quests: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[getQuests] Failed to fetch quests:", error);
    return null;
  }
}



