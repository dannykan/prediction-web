"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, Clock, Users, MessageCircle, Share2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import Image from 'next/image';
import type { Market } from '@/features/market/types/market';
import { LmsrTradingCard } from '@/features/market/components/LmsrTradingCard';
import { ProbabilityChart } from '@/features/market/components/ProbabilityChart';
import { CommentsSection } from '@/features/comment/components/CommentsSection';
import { TradeHistorySection } from '@/features/market/components/TradeHistorySection';
import { SidebarUI } from './SidebarUI';
import { MobileHeaderUI } from './MobileHeaderUI';
import { PullToRefresh } from './PullToRefresh';
import { MarketDetailClient } from '@/features/market/components/MarketDetailClient';

interface MarketDetailUIProps {
  market: Market;
  commentsCount?: number;
  onRefresh?: () => Promise<void>;
  isLoggedIn?: boolean;
  user?: {
    name: string;
    avatar: string;
    totalAssets: number;
    inviteCode?: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
  commentId?: string;
}

export function MarketDetailUI({
  market,
  commentsCount = 0,
  onRefresh,
  isLoggedIn = false,
  user,
  onLogin,
  onLogout,
  onFollow,
  isFollowing = false,
  commentId,
}: MarketDetailUIProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isResolutionRulesExpanded, setIsResolutionRulesExpanded] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: market.title,
          text: market.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('連結已複製到剪貼簿！');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      // 模擬刷新
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.refresh();
    }
  };

  const handleBack = () => {
    router.back();
  };

  // 獲取分類名稱
  const categoryName = market.category?.name || '其他';

  // 獲取創建者資訊
  const creatorName = market.creator?.displayName || market.creator?.name || '匿名';
  const creatorAvatar = market.creator?.avatarUrl || 'https://i.pravatar.cc/150?u=anonymous';

  // 獲取圖片
  const marketImage = market.imageUrl || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800';

  // 獲取截止時間
  const timeUntilClose = market.closeTime 
    ? formatDistanceToNow(new Date(market.closeTime), { addSuffix: true, locale: zhTW })
    : '';

  // 獲取創建時間
  const createdAt = market.createdAt 
    ? new Date(market.createdAt).toLocaleDateString('zh-TW')
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header */}
      <MobileHeaderUI 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isLoggedIn={isLoggedIn}
        user={user ? {
          totalAssets: user.totalAssets,
          avatar: user.avatar,
        } : undefined}
      />

      <div className="flex w-full">
        {/* Sidebar */}
        <SidebarUI 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isLoggedIn={isLoggedIn}
          user={user}
          onLogin={onLogin}
          onLogout={onLogout}
        />

        {/* Main Content */}
        <PullToRefresh onRefresh={handleRefresh} className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0 h-screen">
          <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6">
            {/* Header with Back Button */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">返回市場列表</span>
                <span className="md:hidden">返回</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onFollow}
                  className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-sm rounded-lg font-medium transition-all ${
                    isFollowing
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFollowing ? 'fill-current' : ''}`} />
                  <span className="hidden md:inline">{isFollowing ? '已關注' : '關注'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-sm bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:border-indigo-400 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden md:inline">分享</span>
                </button>
              </div>
            </div>

            {/* Market Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-4">
              {/* Category Badge */}
              <div className="mb-3">
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs md:text-sm font-medium rounded-full">
                  {categoryName}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 md:mb-4">
                {market.title}
              </h1>

              {/* Image */}
              {marketImage && (
                <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden mb-4">
                  <img
                    src={marketImage}
                    alt={market.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                  <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600 flex-shrink-0" />
                  <Image 
                    src="/images/G_coin_icon.png" 
                    alt="G coin" 
                    width={16} 
                    height={16}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0"
                  />
                  <span className="font-bold text-slate-900">{(market.totalVolume || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span>{market.usersWithPositions || 0} 持倉</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                  <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span>{commentsCount} 評論</span>
                </div>
                {timeUntilClose && (
                  <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">{timeUntilClose}結束</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="text-sm md:text-base text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">
                {market.description}
              </div>

              {/* Creator & Time Info */}
              <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500 pt-3 md:pt-4 border-t border-slate-200 flex-wrap">
                <div className="flex items-center gap-2">
                  <Image 
                    src={creatorAvatar}
                    alt={creatorName}
                    width={24}
                    height={24}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full"
                  />
                  <span>創建: {creatorName}</span>
                </div>
                {createdAt && (
                  <>
                    <span className="hidden md:inline">•</span>
                    <span>{createdAt}</span>
                  </>
                )}
              </div>
            </div>

            {/* Settlement Rules */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 md:p-6 mb-4">
              <button
                onClick={() => setIsResolutionRulesExpanded(!isResolutionRulesExpanded)}
                className="w-full flex items-center justify-between text-left mb-2 md:mb-3"
              >
                <h2 className="text-base md:text-lg font-bold text-slate-900">結算規則</h2>
                {isResolutionRulesExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
                )}
              </button>
              {isResolutionRulesExpanded && (
                <div className="text-sm md:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {market.resolutionRules || '本市場將根據實際結果進行結算。結算時，選擇正確答案的參與者將獲得相應的獎勵。具體結算方式將在市場截止後由系統自動處理。'}
                </div>
              )}
            </div>

            {/* Probability Chart */}
            <div className="mb-4">
              <MarketDetailClient marketId={market.id}>
                <ProbabilityChart 
                  marketId={market.id}
                  isSingle={market.questionType === 'SINGLE_CHOICE'}
                  questionType={market.questionType}
                  marketOptions={market.options || []}
                />
              </MarketDetailClient>
            </div>

            {/* Trading Card */}
            <div className="mb-4">
              <LmsrTradingCard marketId={market.id} market={market} />
            </div>

            {/* Comments Section */}
            <div className="mb-4">
              <MarketDetailClient marketId={market.id}>
                <CommentsSection marketId={market.id} highlightCommentId={commentId} />
              </MarketDetailClient>
            </div>

            {/* Trade History */}
            <div className="mb-4">
              <MarketDetailClient marketId={market.id}>
                <TradeHistorySection 
                  marketId={market.id} 
                  isSingle={market.questionType === 'SINGLE_CHOICE'}
                  questionType={market.questionType}
                />
              </MarketDetailClient>
            </div>
          </div>
        </PullToRefresh>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
