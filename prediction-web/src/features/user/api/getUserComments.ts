/**
 * Get user comments
 * Calls BFF /api/users/[id]/comments
 */

export interface UserComment {
  id: string;
  marketId: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  content: string;
  likes: number;
  replies: number;
  userLiked: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    displayName: string;
    level: number;
    titleCn: string;
  };
  market: {
    id: string;
    title: string;
    imageUrl?: string | null;
    shortcode?: string | null;
  };
}

export interface UserCommentsResponse {
  comments: UserComment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function getUserComments(
  userId: string,
  options?: {
    page?: number;
    limit?: number;
    search?: string;
    currentUserId?: string;
  },
): Promise<UserCommentsResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.page) {
      params.append('page', options.page.toString());
    }
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.search) {
      params.append('search', options.search);
    }
    if (options?.currentUserId) {
      params.append('currentUserId', options.currentUserId);
    }

    const url = `/api/users/${encodeURIComponent(userId)}/comments${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error(
        `Failed to fetch user comments: ${response.statusText}`,
      );
    }

    const data = await response.json();
    
    // Handle both array and object responses
    if (Array.isArray(data)) {
      return {
        comments: data,
        total: data.length,
        page: options?.page || 1,
        limit: options?.limit || 20,
        hasMore: false,
      };
    }

    return data;
  } catch (error) {
    console.error("[getUserComments] Failed to fetch user comments:", error);
    throw error;
  }
}

