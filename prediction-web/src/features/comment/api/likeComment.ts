/**
 * Like or unlike a comment
 * Calls BFF /api/markets/[id]/comments/[commentId]/like
 */

import { clientFetch } from "@/core/api/client";

export interface LikeCommentResponse {
  likes: number;
  userLiked: boolean;
}

export async function likeComment(
  marketId: string,
  commentId: string,
  userId?: string,
): Promise<LikeCommentResponse> {
  const params = userId ? new URLSearchParams({ userId }) : undefined;
  const url = `/api/markets/${encodeURIComponent(marketId)}/comments/${encodeURIComponent(commentId)}/like${params ? `?${params.toString()}` : ''}`;
  
  const response = await clientFetch(url, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to like comment: ${response.statusText}`);
  }

  const data = await response.json() as LikeCommentResponse;
  return data;
}

