/**
 * Get comments count for a market
 * Calls BFF /api/markets/[id]/comments?limit=1
 */

import { bffServerFetch } from "@/core/api/bffServerFetch";

interface CommentsResponse {
  comments: Array<{ id: string }>;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function getCommentsCount(
  marketId: string,
  revalidate: number | false = 60,
): Promise<number> {
  try {
    const data = await bffServerFetch<CommentsResponse>(
      `/api/markets/${encodeURIComponent(marketId)}/comments?limit=1&page=1`,
      {
        next: { revalidate },
      },
    );

    return data.total || 0;
  } catch (error) {
    console.error(
      `[getCommentsCount] Failed to fetch comments count for market ${marketId}:`,
      error,
    );
    return 0;
  }
}



