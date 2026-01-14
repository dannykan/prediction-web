"use client";

import { MessageCircle, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import type { UserComment } from '@/features/user/api/getUserComments';
import { BetIcon } from '@/features/market/components/market-detail/BetIcon';

interface ProfileCommentsProps {
  comments: UserComment[];
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

export function ProfileComments({ comments }: ProfileCommentsProps) {
  if (comments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
        <p className="text-slate-500">目前沒有任何評論</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900">我的評論 ({comments.length})</h3>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {comments.map((comment) => {
          const shortcode = comment.market.shortcode;
          const userBet = (comment as any).userBet;
          // Generate slug from title if not available (preserves Chinese characters)
          const slug = (comment.market as any).slug || comment.market.title.trim().replace(/\s+/g, "-");
          const marketUrl = shortcode ? `/m/${shortcode}-${slug}?comment=${comment.id}` : null;
          
          return (
            <div
              key={comment.id}
              className="p-4 hover:bg-slate-50 transition-colors"
            >
              {/* Market Title */}
              <h4 className="text-sm font-medium text-slate-900 mb-2 line-clamp-1">
                {marketUrl ? (
                  <Link 
                    href={marketUrl}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {comment.market.title}
                  </Link>
                ) : (
                  comment.market.title
                )}
              </h4>

              {/* Bet Info */}
              {userBet && (() => {
                // 檢查市場是否為是非題類型
                const marketQuestionType = (comment.market as any)?.questionType;
                const isYesNoMarket = marketQuestionType === 'YES_NO';
                
                return (
                  <div className="flex items-center gap-1 mb-2 px-2 py-1 bg-indigo-50 rounded text-xs w-fit">
                    <span className="text-slate-600">押注</span>
                    {/* 對於是非題，不顯示 optionName（是/否），只顯示圖標 */}
                    {userBet.optionName && !isYesNoMarket && (
                      <span className="font-medium text-slate-700">{userBet.optionName}</span>
                    )}
                    <BetIcon direction={userBet.direction === 'YES' ? 'yes' : 'no'} size="sm" />
                    <Image
                      src="/images/G_coin_icon.png"
                      alt="G coin"
                      width={12}
                      height={12}
                      className="w-3 h-3 ml-0.5"
                    />
                    <span className="font-bold text-indigo-700">{Math.abs(parseFloat(userBet.stakeAmount || "0")).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                );
              })()}

              {/* Comment Content */}
              <p className="text-sm text-slate-700 leading-relaxed mb-3 line-clamp-3">
                {comment.content}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{comment.likes}</span>
                </div>
                <span>•</span>
                <span>{formatTimeAgo(comment.createdAt)}</span>
                {marketUrl && (
                  <>
                    <span>•</span>
                    <Link 
                      href={marketUrl}
                      className="text-indigo-600 hover:underline"
                    >
                      前往市場
                    </Link>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      <div className="border-t border-slate-200 p-4 text-center">
        <button className="px-4 py-2 text-sm bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors">
          載入更多
        </button>
      </div>
    </div>
  );
}
