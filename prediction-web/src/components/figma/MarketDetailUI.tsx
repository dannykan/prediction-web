"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, Clock, Users, MessageCircle, Share2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { parseToTaipeiTime, formatTaipeiTime } from '@/utils/formatDate';
import Image from 'next/image';
import type { Market } from '@/features/market/types/market';
import { LmsrTradingCard } from '@/features/market/components/LmsrTradingCard';
import { ProbabilityChart } from '@/features/market/components/ProbabilityChart';
import { MyPosition } from '@/features/market/components/MyPosition';
import { MobileHeaderUI } from './MobileHeaderUI';
import { PullToRefresh } from './PullToRefresh';
import { MarketDetailClient } from '@/features/market/components/MarketDetailClient';
import type { MarketDetailData } from '@/features/market/api/getMarketDetailData';

// Lazy load non-critical components for better initial page load
const CommentsSection = dynamic(
  () => import('@/features/comment/components/CommentsSection').then(mod => ({ default: mod.CommentsSection })),
  {
    loading: () => <div className="p-4 text-center text-slate-500">載入評論中...</div>,
    ssr: true, // Keep SSR for SEO
  }
);

const TradeHistorySection = dynamic(
  () => import('@/features/market/components/TradeHistorySection').then(mod => ({ default: mod.TradeHistorySection })),
  {
    loading: () => <div className="p-4 text-center text-slate-500">載入交易記錄中...</div>,
    ssr: true, // Keep SSR for SEO
  }
);

interface MarketDetailUIProps {
  market: Market;
  commentsCount?: number;
  onRefresh?: () => Promise<void>;
  onRefreshMarketData?: () => Promise<void>; // 新增：刷新市場詳情數據（用於下注後刷新）
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
  onCommentsCountChange?: (count: number) => void;
  marketDetailData?: MarketDetailData | null;
  dataLoading?: boolean;
}

export function MarketDetailUI({
  market,
  commentsCount = 0,
  onRefresh,
  onRefreshMarketData,
  isLoggedIn = false,
  user,
  onLogin,
  onLogout,
  onFollow,
  isFollowing = false,
  commentId,
  onCommentsCountChange,
  marketDetailData,
  dataLoading = false,
}: MarketDetailUIProps) {
  const router = useRouter();
  const [isResolutionRulesExpanded, setIsResolutionRulesExpanded] = useState(false);
  // For MULTIPLE_CHOICE: track which options are selected for chart display
  const [selectedOptionsForChart, setSelectedOptionsForChart] = useState<Set<string>>(new Set());

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
    router.push('/home');
  };

  // 獲取分類名稱
  const categoryName = market.category?.name || '其他';

  // 獲取創建者資訊
  // 如果是官方市場（isOfficial 為 true 或 creator 為 null），顯示「官方」和 logo
  const isOfficial = market.isOfficial === true || !market.creator;
  const creatorName = isOfficial ? '官方' : (market.creator?.displayName || market.creator?.name || '匿名');
  const creatorAvatar = isOfficial ? '/images/logo.png' : (market.creator?.avatarUrl || 'https://i.pravatar.cc/150?u=anonymous');

  // 獲取圖片
  const marketImage = market.imageUrl || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800';

  // 獲取截止時間（轉換為台北時間）
  const closeTimeTaipei = market.closeTime ? parseToTaipeiTime(market.closeTime) : null;
  const timeUntilClose = closeTimeTaipei 
    ? formatDistanceToNow(closeTimeTaipei, { addSuffix: true, locale: zhTW })
    : '';

  // 獲取創建時間（轉換為台北時間）
  const createdAt = market.createdAt 
    ? formatTaipeiTime(market.createdAt, { year: 'numeric', month: '2-digit', day: '2-digit' })
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Header - 使用全局 Sidebar context */}
      <MobileHeaderUI />

      <div className="flex w-full">

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
                <span>返回</span>
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
                <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden mb-4 relative">
                  <Image
                    src={marketImage}
                    alt={market.title}
                    fill
                    className="object-cover"
                    priority
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
                  <span className="font-bold text-slate-900">{(market.totalVolume || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                  selectedOptionIds={Array.from(selectedOptionsForChart)}
                  optionMarkets={marketDetailData?.marketData?.optionMarkets?.map(om => ({
                    id: om.id,
                    optionId: om.optionId,
                    optionName: om.optionName,
                  })) || []}
                  marketDetailData={marketDetailData}
                  dataLoading={dataLoading}
                />
              </MarketDetailClient>
            </div>

            {/* My Position */}
            <div className="mb-4">
              <MarketDetailClient marketId={market.id}>
                <MyPosition 
                  marketId={market.id}
                  isLoggedIn={isLoggedIn || false}
                  questionType={market.questionType}
                  marketDetailData={marketDetailData}
                  dataLoading={dataLoading}
                />
              </MarketDetailClient>
            </div>

            {/* Trading Card */}
            <div className="mb-4">
              <LmsrTradingCard 
                marketId={market.id} 
                market={market}
                onLogin={onLogin}
                marketDetailData={marketDetailData}
                dataLoading={dataLoading}
                selectedOptionsForChart={selectedOptionsForChart}
                onSelectedOptionsForChartChange={setSelectedOptionsForChart}
                onTradeSuccess={async () => {
                  // 交易成功後刷新市場詳情數據（包括持倉等）
                  if (onRefreshMarketData) {
                    await onRefreshMarketData();
                  } else {
                    // 回退方案：刷新整個頁面
                    window.location.reload();
                  }
                }}
              />
            </div>

            {/* Comments Section */}
            <div className="mb-4">
              <MarketDetailClient marketId={market.id}>
                <CommentsSection 
                  marketId={market.id} 
                  highlightCommentId={commentId} 
                  questionType={market.questionType}
                  onCommentsCountChange={onCommentsCountChange}
                />
              </MarketDetailClient>
            </div>

            {/* Trade History */}
            <div className="mb-4">
              <MarketDetailClient marketId={market.id}>
                <TradeHistorySection 
                  marketId={market.id} 
                  isSingle={market.questionType === 'SINGLE_CHOICE'}
                  questionType={market.questionType}
                  marketDetailData={marketDetailData}
                  dataLoading={dataLoading}
                />
              </MarketDetailClient>
            </div>
          </div>
        </PullToRefresh>
      </div>

    </div>
  );
}
