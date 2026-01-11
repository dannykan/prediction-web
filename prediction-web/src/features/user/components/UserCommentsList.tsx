"use client";

import { useEffect, useState, useMemo } from "react";
import { getUserComments, type UserComment } from "../api/getUserComments";
import { getMarketShortcodeById } from "@/features/market/api/getMarketShortcodeById";
import Link from "next/link";
import Image from "next/image";

interface UserCommentsListProps {
  userId: string;
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "剛剛";
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  if (diffDays < 30) return `${diffDays} 天前`;
  return then.toLocaleDateString('zh-TW');
}

export function UserCommentsList({ userId }: UserCommentsListProps) {
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [shortcodeMap, setShortcodeMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    async function loadComments() {
      try {
        setLoading(true);
        const data = await getUserComments(userId, {
          page: 1,
          limit: 20,
          currentUserId: userId,
        });
        setComments(data.comments);
        setHasMore(data.hasMore);
        setTotal(data.total);

        // Fetch shortcodes for comments that don't have them
        const missingShortcodes = data.comments.filter(
          (c) => !c.market.shortcode && c.market.id
        );
        if (missingShortcodes.length > 0) {
          const shortcodePromises = missingShortcodes.map(async (comment) => {
            const shortcode = await getMarketShortcodeById(comment.market.id);
            if (shortcode) {
              return { marketId: comment.market.id, shortcode };
            }
            return null;
          });
          const results = await Promise.all(shortcodePromises);
          const newMap = new Map(shortcodeMap);
          results.forEach((result) => {
            if (result) {
              newMap.set(result.marketId, result.shortcode);
            }
          });
          setShortcodeMap(newMap);
        }
      } catch (error) {
        console.error("[UserCommentsList] Failed to load comments:", error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    loadComments();
  }, [userId]);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    
    try {
      const nextPage = page + 1;
      const data = await getUserComments(userId, {
        page: nextPage,
        limit: 20,
        currentUserId: userId,
      });
      setComments((prev) => [...prev, ...data.comments]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error("[UserCommentsList] Failed to load more comments:", error);
    }
  };

  if (loading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-sm text-gray-500 text-center">載入評論中...</div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-sm text-gray-500 text-center">目前沒有任何評論</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        共 {total} 則評論
      </div>
      
      {comments.map((comment) => {
        // Get shortcode from comment data or from fetched map
        const shortcode = comment.market.shortcode || shortcodeMap.get(comment.market.id);
        // Only use shortcode if available, otherwise skip this comment (shouldn't happen)
        if (!shortcode) {
          console.warn(`[UserCommentsList] No shortcode found for market ${comment.market.id}, skipping link`);
          return (
            <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="pb-2 border-b border-gray-200 dark:border-gray-700 mb-3">
                <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                  {comment.market.title}
                </h3>
              </div>
              <div className="mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>👍 {comment.likes}</span>
                  {comment.replies > 0 && <span>💬 {comment.replies}</span>}
                  <span>{formatTimeAgo(comment.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        }
        
        return (
        <Link
          key={comment.id}
          href={`/m/${shortcode}?comment=${comment.id}`}
          className="block"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            {/* Market Title */}
            <div className="pb-2 border-b border-gray-200 dark:border-gray-700 mb-3">
              <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {comment.market.title}
              </h3>
            </div>

            {/* Comment Content */}
            <div className="mb-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>

            {/* Comment Meta */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>👍 {comment.likes}</span>
                {comment.replies > 0 && <span>💬 {comment.replies}</span>}
                <span>{formatTimeAgo(comment.createdAt)}</span>
              </div>
              <span className="text-blue-600 dark:text-blue-400 hover:underline">
                前往市場 →
              </span>
            </div>
          </div>
        </Link>
        );
      })}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              loadMore();
            }}
            className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            載入更多...
          </button>
        </div>
      )}
    </div>
  );
}

