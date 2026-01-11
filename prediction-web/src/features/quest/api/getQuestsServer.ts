/**
 * Get user quests from Server Components
 * Calls BFF /api/users/[id]/quests
 */

import type { QuestsResponse } from "../types/quest";
import { bffServerFetch } from "@/core/api/bffServerFetch";

export async function getQuestsServer(
  userId: string,
): Promise<QuestsResponse | null> {
  try {
    const data = await bffServerFetch<QuestsResponse>(
      `/api/users/${encodeURIComponent(userId)}/quests`,
      {
        next: { revalidate: 0 }, // Always revalidate for user data
      },
    );
    return data;
  } catch (error: any) {
    // If the error is 401, it means not authenticated, return null silently
    if (error.status === 401 || error.message?.includes("401")) {
      return null;
    }
    console.error("[getQuestsServer] Failed to fetch quests:", error);
    return null;
  }
}

