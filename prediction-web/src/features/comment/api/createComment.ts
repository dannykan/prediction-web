/**
 * Create a comment for a market
 * Calls BFF /api/markets/[id]/comments
 */

import { clientFetch } from "@/core/api/client";
import type { Comment } from "./getComments";

export interface CreateCommentDto {
  content: string;
}

export async function createComment(
  marketId: string,
  content: string,
  userId?: string,
): Promise<Comment> {
  const params = userId ? new URLSearchParams({ userId }) : undefined;
  const url = `/api/markets/${encodeURIComponent(marketId)}/comments${params ? `?${params.toString()}` : ''}`;
  
  const response = await clientFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `Failed to create comment: ${response.statusText}`);
  }

  const data = await response.json() as Comment;
  return data;
}

