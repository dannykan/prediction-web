"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { MessageCircle, BarChart3, Clock, Circle, X as XIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { Market } from '@/features/market/types/market';
import { formatCurrency } from '@/shared/utils/format';
import { 
  getOptionMarketsByMarketId, 
  type OptionMarketInfo,
  getExclusiveMarketByMarketId,
  type ExclusiveMarketInfo,
} from '@/features/market/api/lmsr';

interface MarketCardUIProps {
  market: Market;
  commentsCount?: number;
}

interface TopOption {
  optionId: string;
  optionName: string;
  yesProbability: number;
}

export function MarketCardUI({ market, commentsCount = 0 }: MarketCardUIProps) {
  const marketUrl = `/m/${market.shortcode}-${market.slug}`;
  const timeUntilClose = market.closeTime 
    ? formatDistanceToNow(new Date(market.closeTime), { addSuffix: true, locale: zhTW })
    : '';

  // 狀態：真實機率數據
  const [yesProbability, setYesProbability] = useState<number | null>(null);
  const [topOptions, setTopOptions] = useState<TopOption[]>([]);
  const [loading, setLoading] = useState(true);

  // 獲取真實的機率數據
  useEffect(() => {
    const fetchProbabilities = async () => {
      // Fetch real-time probabilities via API

      try {
        const questionType = market.questionType;
        
        if (questionType === 'YES_NO') {
          // YES_NO: 獲取第一個選項（通常是「是」選項）的 Yes 機率
          // 對於 LMSR 機制，必須從 option markets 獲取 priceYes
          if (market.mechanism === 'LMSR_V2') {
            try {
              const optionMarkets = await getOptionMarketsByMarketId(market.id);
              console.log(`[MarketCardUI] Fetched option markets for YES_NO market ${market.id}:`, {
                count: optionMarkets?.length || 0,
                markets: optionMarkets?.map(om => ({
                  id: om.id,
                  optionId: om.optionId,
                  optionName: om.optionName,
                  priceYes: om.priceYes,
                })),
              });
              
              if (optionMarkets && optionMarkets.length > 0) {
                // 使用第一個 option market 的 priceYes（代表「是」選項的 Yes 機率）
                const firstOption = optionMarkets[0];
                const priceYes = parseFloat(firstOption.priceYes || '0.5');
                if (!isNaN(priceYes) && priceYes >= 0 && priceYes <= 1) {
                  setYesProbability(priceYes * 100); // priceYes 是 0-1 之間的小數，需要乘以 100
                  console.log(`[MarketCardUI] Set YES probability for market ${market.id}:`, priceYes * 100);
                } else {
                  console.warn(`[MarketCardUI] Invalid priceYes for market ${market.id}:`, priceYes);
                  // 如果 priceYes 無效，保持 null 狀態，不設置默認值
                }
              } else {
                console.warn(`[MarketCardUI] No option markets found for LMSR market ${market.id}, keeping loading state`);
                // 保持 yesProbability 為 null，讓 UI 顯示「載入機率中...」
              }
            } catch (error) {
              console.error(`[MarketCardUI] Error fetching option markets for YES_NO market ${market.id}:`, error);
              // 對於 LMSR 機制，不設置默認值，保持 null
            }
          } else {
            // 非 LMSR 機制，可以使用 normalizeMarket 計算的機率
            // 但為了保持一致性，也嘗試從 option markets 獲取
            try {
              const optionMarkets = await getOptionMarketsByMarketId(market.id);
              if (optionMarkets && optionMarkets.length > 0) {
                const firstOption = optionMarkets[0];
                const priceYes = parseFloat(firstOption.priceYes || '0.5');
                if (!isNaN(priceYes) && priceYes >= 0 && priceYes <= 1) {
                  setYesProbability(priceYes * 100);
                } else {
                  // 使用 normalizeMarket 計算的機率作為後備
                  setYesProbability(market.yesPercentage || 50);
                }
              } else {
                // 使用 normalizeMarket 計算的機率
                setYesProbability(market.yesPercentage || 50);
              }
            } catch (error) {
              console.error(`[MarketCardUI] Error fetching option markets, using fallback:`, error);
              // 使用 normalizeMarket 計算的機率作為後備
              setYesProbability(market.yesPercentage || 50);
            }
          }
        } else if (questionType === 'SINGLE_CHOICE') {
          // 單選題: 從 exclusive market 獲取前兩高的機率
          try {
            const exclusiveMarket = await getExclusiveMarketByMarketId(market.id);
            if (exclusiveMarket && exclusiveMarket.outcomes && exclusiveMarket.outcomes.length > 0) {
              // 過濾掉 NONE 類型的 outcome
              const validOutcomes = exclusiveMarket.outcomes
                .filter(o => o.type === 'OPTION' && o.optionName)
                .map(o => ({
                  optionId: o.optionId || '',
                  optionName: o.optionName || '',
                  probability: parseFloat(o.price || '0'),
                }))
                .sort((a, b) => b.probability - a.probability)
                .slice(0, 2);
              
              if (validOutcomes.length > 0) {
                setTopOptions(validOutcomes.map(o => ({
                  optionId: o.optionId,
                  optionName: o.optionName,
                  yesProbability: o.probability * 100, // price 是 0-1 之間的小數，需要乘以 100
                })));
              }
            }
          } catch (error) {
            console.error(`[MarketCardUI] Failed to fetch exclusive market for market ${market.id}:`, error);
            // 繼續執行，不設置 topOptions，保持默認狀態
          }
        } else if (questionType === 'MULTIPLE_CHOICE') {
          // 多選題: 從 option markets 獲取前兩高的 Yes 機率
          const optionMarkets = await getOptionMarketsByMarketId(market.id);
          if (optionMarkets.length > 0) {
            const optionsWithProb = optionMarkets
              .map(om => ({
                optionId: om.optionId,
                optionName: om.optionName,
                yesProbability: parseFloat(om.priceYes || '0.5') * 100, // priceYes 是 0-1 之間的小數，需要乘以 100
              }))
              .sort((a, b) => b.yesProbability - a.yesProbability)
              .slice(0, 2);
            
            setTopOptions(optionsWithProb);
          }
        }
      } catch (error) {
        console.error(`[MarketCardUI] Failed to fetch probabilities for market ${market.id}:`, error);
        // 設置默認值
        if (market.questionType === 'YES_NO') {
          setYesProbability(50);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProbabilities();
  }, [market.id, market.mechanism, market.questionType]);

  // 獲取分類名稱
  const categoryName = market.category?.name || '其他';

  // 獲取創建者資訊
  // 如果是官方市場（isOfficial 為 true 或 creator 為 null），顯示「官方」和 logo
  const isOfficial = market.isOfficial === true || !market.creator;
  const creatorName = isOfficial ? '官方' : (market.creator?.displayName || market.creator?.name || '匿名');
  const creatorAvatar = isOfficial ? '/images/logo.png' : (market.creator?.avatarUrl || 'https://i.pravatar.cc/150?u=anonymous');

  // 獲取圖片
  const marketImage = market.imageUrl || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800';

  // 判斷市場類型
  const isYesNo = market.questionType === 'YES_NO' || !market.options || market.options.length === 0;
  const isMultipleChoice = !isYesNo && market.options && market.options.length > 0;

  const handleButtonClick = (e: React.MouseEvent, optionId?: string, side?: 'YES' | 'NO') => {
    e.preventDefault();
    e.stopPropagation();
    // 跳轉到詳情頁
    const url = `/m/${market.shortcode}-${market.slug}${optionId ? `?option=${optionId}&side=${side}` : ''}`;
    window.location.href = url;
  };

  return (
    <Link href={marketUrl} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group w-full overflow-hidden">
        <div className="p-3 sm:p-4 w-full">
          {/* Horizontal layout for all screen sizes */}
          <div className="flex gap-3 sm:gap-4 w-full">
            {/* Image - Square on left */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
              <div className="w-full h-full rounded-lg overflow-hidden relative">
                <img 
                  src={marketImage}
                  alt={market.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5">
                  <span className="px-1.5 py-0.5 sm:px-2 bg-indigo-600 text-white text-[10px] sm:text-xs font-medium rounded">
                    {categoryName}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 w-full min-w-0">
              {/* Title */}
              <h3 className="font-bold text-sm sm:text-base text-slate-800 mb-1 sm:mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {market.title}
              </h3>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 mb-2">
                <div className="flex items-center gap-1">
                  <img 
                    src={creatorAvatar}
                    alt={creatorName}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                  />
                  <span className="truncate max-w-[60px] sm:max-w-[80px]">{creatorName}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                  <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{commentsCount}</span>
                </div>
                {timeUntilClose && (
                  <>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="whitespace-nowrap">{timeUntilClose}結束</span>
                    </div>
                  </>
                )}
              </div>

              {/* Volume - More compact */}
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-600 mb-2">
                <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <img 
                  src="/images/G_coin_icon.png" 
                  alt="G coin" 
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0"
                />
                <span className="font-bold">{formatCurrency(market.totalVolume || 0)}</span>
              </div>

              {/* Prediction Buttons - Yes/No */}
              {isYesNo && (
                <div className="w-full">
                  {loading ? (
                    <div className="text-xs text-slate-400 py-2">載入機率中...</div>
                  ) : yesProbability !== null ? (
                    <div className="w-full flex items-center justify-between gap-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 border border-green-200">
                      <div className="flex-shrink-0">
                        <p className="text-xl sm:text-2xl font-bold text-green-600 leading-none">{Math.round(yesProbability)}%</p>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                        <button 
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-green-500 text-white rounded-md hover:bg-green-600 active:bg-green-700 transition-colors shadow-sm"
                          onClick={(e) => handleButtonClick(e, undefined, 'YES')}
                        >
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white rounded-full"></div>
                        </button>
                        <button 
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-red-500 text-white rounded-md hover:bg-red-600 active:bg-red-700 transition-colors shadow-sm"
                          onClick={(e) => handleButtonClick(e, undefined, 'NO')}
                        >
                          <XIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 py-2">無法載入機率</div>
                  )}
                </div>
              )}

              {/* Prediction Buttons - Multiple Choice */}
              {isMultipleChoice && (
                <div className="space-y-1.5 w-full">
                  {loading ? (
                    <div className="text-xs text-slate-400 py-2">載入機率中...</div>
                  ) : topOptions.length > 0 ? (
                    <>
                      {topOptions.map((option) => (
                        <div 
                          key={option.optionId} 
                          className="w-full flex items-center justify-between gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-2 border border-indigo-200"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] sm:text-xs text-slate-700 font-medium block truncate">{option.optionName}</span>
                            <span className="text-sm sm:text-base font-bold text-indigo-600 leading-none block">{Math.round(option.yesProbability)}%</span>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button 
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-green-500 text-white rounded-md hover:bg-green-600 active:bg-green-700 transition-colors"
                              onClick={(e) => handleButtonClick(e, option.optionId, 'YES')}
                            >
                              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white rounded-full"></div>
                            </button>
                            <button 
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-red-500 text-white rounded-md hover:bg-red-600 active:bg-red-700 transition-colors"
                              onClick={(e) => handleButtonClick(e, option.optionId, 'NO')}
                            >
                              <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {market.options && market.options.length > 2 && (
                        <p className="text-center text-[10px] sm:text-xs text-slate-400 pt-1">
                          +{market.options.length - 2} 個選項
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-slate-400 py-2">無法載入機率</div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
