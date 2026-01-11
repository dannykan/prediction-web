/**
 * Comment Types
 * Based on backend Comment entity
 */

export interface Comment {
  id: string;
  content: string;
  userId: string;
  marketId: string;
  likes: number;
  createdAt: string;
  // Extended fields (may be populated by backend)
  user?: {
    id: string;
    displayName: string;
    username?: string;
    avatarUrl?: string | null;
  };
  isLiked?: boolean; // User's like status (if userId provided)
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}



