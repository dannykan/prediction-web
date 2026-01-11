/**
 * Get comments for a market
 * Calls BFF /api/markets/[id]/comments
 */

import { clientFetch } from "@/core/api/client";

export interface CommentUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  leveling?: {
    rank_title_display: string;
    current_tier_max_bet: number;
    xp_to_next_level: number;
    level_progress_percent: number;
    max_bet_limit: number;
    title_cn: string;
    title_en: string;
    gift_pack: any;
    xp_to_next_milestone: number;
    next_milestone_level: number | null;
  };
  rankLevel: number;
  level: number;
}

export interface UserBet {
  id: string;
  selectionId: string;
  side?: string;
  stakeAmount: number;
  potentialWin: number;
  status: string;
  userId: string;
  marketId: string;
  appliedEffects: Array<Record<string, any>>;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    rank: {
      level: number;
      name: string;
      title: string;
    };
  };
  // Position-specific fields (for LMSR markets)
  optionName?: string;
  probabilityChange?: number;
  currentProbability?: number;
  optionId?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  marketId: string;
  likes: number;
  createdAt: string;
  user: CommentUser;
  userLiked: boolean;
  userBet?: UserBet | null;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function getComments(
  marketId: string,
  options?: {
    page?: number;
    limit?: number;
    userId?: string;
    includeUserBets?: boolean;
  },
): Promise<CommentsResponse> {
  const { page = 1, limit = 20, userId, includeUserBets = true } = options || {};
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    includeUserBets: includeUserBets.toString(),
  });
  
  if (userId) {
    params.append('userId', userId);
  }

  // Backend returns array directly, not wrapped
  // Add cache: 'no-store' and timestamp to ensure fresh data on refresh
  const timestamp = Date.now();
  const url = `/api/markets/${encodeURIComponent(marketId)}/comments?${params.toString()}&_t=${timestamp}`;
  const response = await clientFetch(url, {
    cache: 'no-store', // Always fetch fresh data, don't use cache
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.statusText}`);
  }
  
  const comments = await response.json() as Comment[];

  // Construct response format
  // Note: Backend doesn't return total/page/limit in the response for this endpoint
  // We'll use the array length as a fallback
  return {
    comments: comments || [],
    total: comments?.length || 0,
    page,
    limit,
    hasMore: (comments?.length || 0) >= limit, // Estimate based on returned count
  };
}

