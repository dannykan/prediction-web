"use client";

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Circle, X as XIcon } from 'lucide-react';
import { getUserPositions, getExclusiveMarketPositions, type Position, type ExclusivePosition } from '../api/lmsr';
import { formatCurrency } from '@/shared/utils/format';
import Image from 'next/image';
import type { MarketDetailData } from '../api/getMarketDetailData';

interface MyPositionProps {
  marketId: string;
  isLoggedIn: boolean;
  questionType?: 'YES_NO' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  marketDetailData?: MarketDetailData | null;
  dataLoading?: boolean;
}

export function MyPosition({ marketId, isLoggedIn, questionType = 'YES_NO', marketDetailData, dataLoading = false }: MyPositionProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [exclusivePositions, setExclusivePositions] = useState<ExclusivePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);

  const isBinary = questionType === 'YES_NO';
  const isSingle = questionType === 'SINGLE_CHOICE';

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const loadPositions = async () => {
      try {
        setLoading(true);
        
        // Use aggregated data if available
        if (marketDetailData?.positions) {
          if (isSingle) {
            setExclusivePositions(marketDetailData.positions.exclusive || []);
            setPositions([]);
          } else {
            setPositions(marketDetailData.positions.regular || []);
            setExclusivePositions([]);
          }
        } else if (!dataLoading) {
          // Fallback to individual API calls
          if (isSingle) {
            const exclusivePos = await getExclusiveMarketPositions(marketId);
            setExclusivePositions(exclusivePos);
            setPositions([]);
          } else {
            const regularPos = await getUserPositions(marketId);
            setPositions(regularPos);
            setExclusivePositions([]);
          }
        }
      } catch (error) {
        console.error('[MyPosition] Failed to load positions:', error);
        setPositions([]);
        setExclusivePositions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPositions();
  }, [marketId, isLoggedIn, isSingle, marketDetailData, dataLoading]);

  const handleClosePosition = async (position: Position | ExclusivePosition, isExclusive: boolean) => {
    // TODO: Implement close position logic
    console.log('[MyPosition] Close position:', position, isExclusive);
    setClosingPositionId(position.positionId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setClosingPositionId(null);
  };

  // 訪客狀態下不顯示任何內容
  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
        <div className="text-sm text-slate-500 text-center">載入持倉中...</div>
      </div>
    );
  }

  const allPositions: Array<Position | ExclusivePosition & { isExclusive: boolean }> = [
    ...positions.map(p => ({ ...p, isExclusive: false })),
    ...exclusivePositions.map(p => ({ ...p, isExclusive: true })),
  ];

  if (allPositions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5 text-center">
        <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">你還沒有在這個市場下注</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-5">
      <h2 className="text-base md:text-lg font-bold text-slate-900 mb-3">我的持倉</h2>

      <div className="space-y-2">
        {allPositions.map((position, index) => {
          const totalCost = parseFloat(position.totalCost);
          const currentValue = parseFloat(position.currentValue);
          const profitLoss = parseFloat(position.profitLoss);
          const profitLossPercent = parseFloat(position.profitLossPercent);
          const shares = parseFloat(position.shares);
          const avgCost = totalCost > 0 && shares > 0 ? totalCost / shares : 0;
          const isProfit = profitLoss >= 0;
          const isExclusive = 'isExclusive' in position && position.isExclusive;
          const optionName = 'optionName' in position ? position.optionName : undefined;
          const side = position.side;

          return (
            <div
              key={`${position.positionId}-${index}`}
              className="p-3 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200"
            >
              {/* Top Row: Option + Direction + P&L */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {!isBinary && optionName && (
                    <span className="font-semibold text-slate-900 text-sm">{optionName}</span>
                  )}
                  {side === 'YES' ? (
                    <Circle className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
                  ) : (
                    <XIcon className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
                  )}
                </div>
                <div className={`text-right ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="text-base md:text-lg font-bold">
                    {isProfit ? '+' : ''}{formatCurrency(profitLoss)}
                  </div>
                  <div className="text-xs">
                    {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Middle Row: Cost & Current Value */}
              <div className="flex items-center gap-x-3 gap-y-1 text-xs text-slate-600 mb-1.5">
                <div className="flex items-center gap-1">
                  <span>成本</span>
                  <Image src="/images/G_coin_icon.png" alt="G coin" width={12} height={12} className="w-3 h-3" />
                  <span className="font-semibold text-slate-900">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>現值</span>
                  <Image src="/images/G_coin_icon.png" alt="G coin" width={12} height={12} className="w-3 h-3" />
                  <span className="font-semibold text-slate-900">{formatCurrency(currentValue)}</span>
                </div>
              </div>

              {/* Bottom Row: Shares & Avg Cost */}
              <div className="flex items-center gap-x-4 gap-y-1 text-xs text-slate-600 mb-2">
                <div>
                  <span>{shares.toFixed(4)} shares</span>
                </div>
                <div>
                  <span>均價 {avgCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleClosePosition(position as Position | ExclusivePosition, isExclusive)}
                disabled={closingPositionId === position.positionId}
                className="w-full py-2 text-xs md:text-sm bg-white border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {closingPositionId === position.positionId ? '平倉中...' : '一鍵平倉'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
