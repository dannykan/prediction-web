"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { getMe } from "@/features/user/api/getMe";
import { getComments, type Comment } from "../api/getComments";
import { createComment } from "../api/createComment";
import { likeComment } from "../api/likeComment";
import { formatCurrency } from "@/shared/utils/format";
import Image from "next/image";

interface CommentsSectionProps {
  marketId: string;
  userId?: string;
  loading?: boolean;
  highlightCommentId?: string; // Comment ID to scroll to and highlight
}

export function CommentsSection({ marketId, userId, highlightCommentId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false); // For guest users to toggle view
  const [userAvatar, setUserAvatar] = useState<string>('https://i.pravatar.cc/150?u=currentuser');

  const loadComments = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await getComments(marketId, {
        page: pageNum,
        limit: 20,
        userId,
        includeUserBets: true,
      });
      
      if (pageNum === 1) {
        // Replace all comments with fresh data from server
        setComments(response.comments || []);
      } else {
        setComments((prev) => [...prev, ...(response.comments || [])]);
      }
      setHasMore(response.hasMore || false);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load only comment count for guests
  const loadCommentCount = async () => {
    try {
      setLoading(true);
      const response = await getComments(marketId, {
        page: 1,
        limit: 1,
        userId: undefined, // Don't pass userId for guests
        includeUserBets: false,
      });
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Failed to load comment count:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Always reload comments when component mounts or dependencies change
    // This ensures fresh data after page refresh
    // Add timestamp to force fresh fetch
    if (userId) {
      // Logged in users: load full comments and user info
      const loadFreshComments = async () => {
        await loadComments(1);
        setPage(1);
        setShowComments(true); // Auto-show for logged in users
        
        // Load user avatar
        try {
          const user = await getMe();
          if (user?.avatarUrl) {
            setUserAvatar(user.avatarUrl);
          }
        } catch (error) {
          // User not logged in or error, use default avatar
        }
      };
      loadFreshComments();
    } else {
      // Guest users: only load comment count
      loadCommentCount();
      setShowComments(false); // Hide comments for guests
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketId, userId]);

  // Scroll to comment when highlightCommentId is provided and comments are loaded
  useEffect(() => {
    if (highlightCommentId && comments.length > 0 && showComments) {
      // Wait a bit for DOM to render
      const timer = setTimeout(() => {
        const commentElement = document.getElementById(`comment-${highlightCommentId}`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight class
          commentElement.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'rounded-lg', 'p-2');
          // Remove highlight after 3 seconds
          setTimeout(() => {
            commentElement.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'rounded-lg', 'p-2');
          }, 3000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [highlightCommentId, comments, showComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !userId) return;

    try {
      setSubmitting(true);
      const newComment = await createComment(marketId, commentText.trim(), userId);
      setComments((prev) => [newComment, ...prev]);
      setTotal((prev) => prev + 1);
      setCommentText("");
    } catch (error) {
      console.error("Failed to create comment:", error);
      alert("發布評論失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!userId) {
      alert("請先登入");
      return;
    }

    // Prevent duplicate clicks
    if (likingCommentId === commentId) {
      return;
    }

    try {
      setLikingCommentId(commentId);
      
      // Call API to toggle like - wait for server response before updating UI
      const response = await likeComment(marketId, commentId, userId);
      
      // Update with server response only
      // Use functional update to ensure we're working with the latest state
      setComments((prev) => {
        const commentIndex = prev.findIndex((c) => c.id === commentId);
        if (commentIndex === -1) {
          return prev;
        }

        const updated = [...prev];
        const oldComment = updated[commentIndex];

        // Ensure likes is a number
        const newLikes = typeof response.likes === 'number' ? response.likes : parseInt(String(response.likes), 10);
        const newUserLiked = Boolean(response.userLiked);

        // Create new object to ensure React detects the change
        updated[commentIndex] = {
          ...oldComment,
          likes: newLikes,
          userLiked: newUserLiked,
        };

        return updated;
      });
    } catch (error) {
      console.error("Failed to like comment:", error);
      alert("操作失敗，請稍後再試");
      
      // Reload comments to get correct state on error
      await loadComments(1);
    } finally {
      setLikingCommentId(null);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments(nextPage);
  };

  const handleViewComments = () => {
    if (!userId) {
      alert("⚠️ 請先註冊或登入後才能查看評論內容");
      return;
    }
    setShowComments(true);
    if (comments.length === 0) {
      loadComments(1);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">
          評論討論 <span className="text-slate-500">({total})</span>
        </h2>
      </div>
      <div className="space-y-4">
        {/* Guest View - Only show count */}
        {!userId && !showComments && (
          <div className="mb-6 p-4 md:p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <p className="text-sm text-slate-600 mb-3">登入後即可參與討論</p>
            <button className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all">
              登入
            </button>
          </div>
        )}

        {/* Comment Form - Only for logged in users */}
        {userId && (
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="flex gap-2 md:gap-3">
              <Image
                src={userAvatar}
                alt="Your avatar"
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="分享你的看法..."
                  className="w-full px-3 py-2 md:px-4 md:py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                  disabled={submitting}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    發布評論
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments List - Only show if logged in or guest clicked view */}
        {showComments && (
          <>
            {loading && comments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">載入評論中...</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">尚無評論</div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
              <div
                id={`comment-${comment.id}`}
                key={`comment-${comment.id}-${comment.likes}-${comment.userLiked}`}
                className="pb-4 border-b border-slate-200 last:border-0 last:pb-0"
              >
                <div className="flex gap-2 md:gap-3">
                  <Image
                    src={comment.user.avatarUrl || 'https://i.pravatar.cc/150?u=anonymous'}
                    alt={comment.user.displayName}
                    width={40}
                    height={40}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    {/* User Info */}
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{comment.user.displayName}</span>
                      {comment.userBet && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 rounded text-xs">
                          <span className="text-slate-600">押注</span>
                          {comment.userBet.optionName && (
                            <span className="font-medium text-slate-700">{comment.userBet.optionName}</span>
                          )}
                          <span className={comment.userBet.side === 'YES' ? 'text-green-600' : 'text-red-600'}>
                            {comment.userBet.side === 'YES' ? 'O' : 'X'}
                          </span>
                          <Image 
                            src="/images/G_coin_icon.png" 
                            alt="G coin" 
                            width={12} 
                            height={12}
                            className="w-3 h-3 ml-0.5"
                          />
                          <span className="font-bold text-indigo-700">{formatCurrency(comment.userBet.stakeAmount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Comment Content */}
                    <p className="text-slate-700 text-sm leading-relaxed mb-2">{comment.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          comment.userLiked
                            ? 'text-indigo-600 font-medium'
                            : 'text-slate-500 hover:text-indigo-600'
                        }`}
                        disabled={!userId || likingCommentId === comment.id}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${comment.userLiked ? 'fill-current' : ''}`} />
                        <span key={`likes-${comment.id}-${comment.likes}`}>{comment.likes}</span>
                        {likingCommentId === comment.id && (
                          <span className="text-xs ml-1">...</span>
                        )}
                      </button>
                      <span className="text-slate-400">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: zhTW })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

                {/* Load More */}
                {hasMore && (
                  <div className="mt-4 text-center">
                    <button 
                      onClick={loadMore}
                      className="px-4 py-2 text-sm bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                      disabled={loading}
                    >
                      {loading ? "載入中..." : "載入更多評論"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

