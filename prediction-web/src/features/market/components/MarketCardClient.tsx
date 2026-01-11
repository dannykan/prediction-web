"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Market } from "../types/market";
import { MarketImage } from "./MarketImage";
import { CreatorInfo } from "./CreatorInfo";
import { 
  getOptionMarketsByMarketId, 
  type OptionMarketInfo,
  getExclusiveMarketByMarketId,
  type ExclusiveMarketInfo,
} from "../api/lmsr";

interface MarketCardClientProps {
  market: Market;
  commentsCount: number;
}

interface TopOption {
  optionId: string;
  optionName: string;
  yesProbability: number;
}

export function MarketCardClient({ market, commentsCount }: MarketCardClientProps) {
  const [yesProbability, setYesProbability] = useState<number | null>(null);
  const [topOptions, setTopOptions] = useState<TopOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProbabilities = async () => {
      // Fetch real-time probabilities via API

      try {
        const questionType = market.questionType;
        
        if (questionType === 'YES_NO') {
          // YES_NO: 獲取第一個選項（通常是「是」選項）的 Yes 機率
          // YES_NO 市場的每個選項都有自己的 option market
          const optionMarkets = await getOptionMarketsByMarketId(market.id);
          if (optionMarkets && optionMarkets.length > 0) {
            // 使用第一個 option market 的 priceYes（代表「是」選項的 Yes 機率）
            // 如果市場有 options，也可以通過 optionId 匹配找到「是」選項
            const firstOption = optionMarkets[0];
            const priceYes = parseFloat(firstOption.priceYes || '0.5');
            setYesProbability(priceYes * 100);
          } else {
            setYesProbability(50); // 默認值
          }
        } else if (questionType === 'SINGLE_CHOICE') {
          // 單選題: 從 exclusive market 獲取前兩高的機率
          const exclusiveMarket = await getExclusiveMarketByMarketId(market.id);
          if (exclusiveMarket.outcomes && exclusiveMarket.outcomes.length > 0) {
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
            
            setTopOptions(validOutcomes.map(o => ({
              optionId: o.optionId,
              optionName: o.optionName,
              yesProbability: o.probability * 100,
            })));
          }
        } else if (questionType === 'multiple' || questionType === 'MULTIPLE_CHOICE') {
          // 多選題: 從 option markets 獲取前兩高的 Yes 機率
          const optionMarkets = await getOptionMarketsByMarketId(market.id);
          if (optionMarkets.length > 0) {
            const optionsWithProb = optionMarkets
              .map(om => ({
                optionId: om.optionId,
                optionName: om.optionName,
                yesProbability: parseFloat(om.priceYes || '0.5') * 100,
              }))
              .sort((a, b) => b.yesProbability - a.yesProbability)
              .slice(0, 2);
            
            setTopOptions(optionsWithProb);
          }
        }
      } catch (error) {
        console.error(`[MarketCardClient] Failed to fetch probabilities for market ${market.id}:`, error);
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

  const handleButtonClick = (e: React.MouseEvent, optionId?: string, side?: 'YES' | 'NO') => {
    e.preventDefault();
    e.stopPropagation();
    // 跳轉到詳情頁，點擊按鈕時不觸發卡片的 Link
    // TODO: 未來可以實現快速下注功能，跳轉到詳情頁並預選該選項
    window.location.href = `/m/${market.shortcode}-${market.slug}${optionId ? `?option=${optionId}&side=${side}` : ''}`;
  };

  const questionType = market.questionType;
  const isYES_NO = questionType === 'YES_NO';
  const isSingle = questionType === 'SINGLE_CHOICE';
  const isMultiple = questionType === 'MULTIPLE_CHOICE';

  return (
    <article
      className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
      itemScope
      itemType="https://schema.org/Question"
    >
      <div className="flex flex-col md:flex-row">
        {/* Market Image - Clickable */}
        <Link
          href={`/m/${market.shortcode}-${market.slug}`}
          className="block"
        >
          <MarketImage
            market={market}
            priority={false}
          />
        </Link>

        {/* Market Content */}
        <div className="flex-1 p-3 md:p-6">
          <Link
            href={`/m/${market.shortcode}-${market.slug}`}
            className="block"
          >
            <h2
              className="font-bold text-lg md:text-xl mb-2 hover:text-blue-600 transition-colors"
              itemProp="name"
            >
              {market.title}
            </h2>
            <p
              className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 line-clamp-2"
              itemProp="description"
            >
              {market.description}
            </p>
          </Link>
          
          {/* Statistics Row */}
          <div className="flex flex-wrap gap-3 text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3">
            <span>
              <strong>創建者:</strong> {market.creator?.displayName || '官方創建'}
            </span>
            <span>
              <strong>留言評論:</strong> {commentsCount} 則
            </span>
            {market.totalVolume !== undefined && (
              <span>
                <strong>交易量:</strong> {market.totalVolume.toFixed(3)} G
              </span>
            )}
          </div>

          {/* Probability Display */}
          {!loading && (
            <div className="mb-3">
              {isYES_NO && yesProbability !== null && (
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Yes機率: </span>
                    <span className="font-bold text-lg text-green-600">
                      {yesProbability.toFixed(1)}%
                    </span>
                  </div>
                  {/* O/X Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleButtonClick(e, undefined, 'YES')}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                      O
                    </button>
                    <button
                      onClick={(e) => handleButtonClick(e, undefined, 'NO')}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                      X
                    </button>
                  </div>
                </div>
              )}
              {(isSingle || isMultiple) && topOptions.length > 0 && (
                <div className="space-y-2">
                  {topOptions.map((option) => (
                    <div key={option.optionId} className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {option.optionName}:
                        </span>
                        <span className="font-bold text-lg text-blue-600">
                          {option.yesProbability.toFixed(1)}%
                        </span>
                      </div>
                      {/* O/X Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleButtonClick(e, option.optionId, 'YES')}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                          O
                        </button>
                        <button
                          onClick={(e) => handleButtonClick(e, option.optionId, 'NO')}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              載入機率中...
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

