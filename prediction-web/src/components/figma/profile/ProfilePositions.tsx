"use client";

import { TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { UserPosition } from '@/features/user/api/getAllUserPositions';
import { BetIcon } from '@/features/market/components/market-detail/BetIcon';
import { 
  tradeExclusiveMarket, 
  tradeOptionMarket,
  getExclusiveMarketByMarketId 
} from "@/features/market/api/lmsr";
import { useState } from 'react';

interface ProfilePositionsProps {
  positions: UserPosition[];
  userId: string;
}

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("zh-TW", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ProfilePositions({ positions, userId }: ProfilePositionsProps) {
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);

  const handleClosePosition = async (position: UserPosition) => {
    const confirmMessage = `確認要平倉「${position.optionName}」的 ${position.side === 'YES' ? 'O' : 'X'} 持倉嗎？\n\n` +
      `持倉數量：${parseFloat(position.shares).toFixed(4)} shares\n` +
      `當前價值：${formatCurrency(position.currentValue)} G\n\n` +
      `平倉後將獲得 ${formatCurrency(position.currentValue)} G Coin。`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setClosingPositionId(position.positionId);
      
      // Determine market type and trade accordingly
      const questionType = position.questionType?.toUpperCase();
      
      if (questionType === 'SINGLE_CHOICE' || questionType === 'SINGLE') {
        // Single choice: use exclusive market
        const exclusiveMarket = await getExclusiveMarketByMarketId(position.marketId);
        if (!exclusiveMarket || !exclusiveMarket.exclusiveMarketId) {
          throw new Error('無法找到對應的獨佔市場');
        }
        
        // Find the outcome for this option
        const outcome = exclusiveMarket.outcomes?.find(
          o => o.optionId === position.optionId && o.type === 'OPTION'
        );
        
        if (!outcome || !outcome.outcomeId) {
          throw new Error('無法找到對應的選項');
        }
        
        // Sell all shares
        await tradeExclusiveMarket(
          exclusiveMarket.exclusiveMarketId,
          {
            outcomeId: outcome.outcomeId,
            side: position.side === 'YES' ? 'SELL_YES' : 'SELL_NO',
            amountType: 'SHARES',
            amount: position.shares,
          }
        );
      } else {
        // YES_NO or MULTIPLE_CHOICE: use option market
        if (!position.optionMarketId) {
          throw new Error('無法找到對應的選項市場');
        }
        
        // Sell all shares
        await tradeOptionMarket(
          position.optionMarketId,
          {
            side: position.side === 'YES' ? 'SELL_YES' : 'SELL_NO',
            amountType: 'SHARES',
            amount: position.shares,
          }
        );
      }
      
      // Reload page to refresh positions
      window.location.reload();
    } catch (err: any) {
      console.error("[ProfilePositions] Close position error:", err);
      alert(err.message || '平倉失敗');
    } finally {
      setClosingPositionId(null);
    }
  };

  if (positions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
        <p className="text-slate-500">目前沒有任何持倉</p>
      </div>
    );
  }

  const totalInvested = positions.reduce((sum, p) => sum + parseFloat(p.totalCost || "0"), 0);
  const totalCurrentValue = positions.reduce((sum, p) => sum + parseFloat(p.currentValue || "0"), 0);
  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 md:p-6">
        <h3 className="text-sm font-medium text-slate-600 mb-3">持倉總覽</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-600 mb-1">總投入</p>
            <div className="flex items-center gap-1">
              <Image
                src="/images/G_coin_icon.png"
                alt="G coin"
                width={16}
                height={16}
                className="w-4 h-4"
              />
              <span className="text-lg font-bold text-slate-900">{formatCurrency(totalInvested)}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">當前價值</p>
            <div className="flex items-center gap-1">
              <Image
                src="/images/G_coin_icon.png"
                alt="G coin"
                width={16}
                height={16}
                className="w-4 h-4"
              />
              <span className="text-lg font-bold text-slate-900">{formatCurrency(totalCurrentValue)}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">未實現盈虧</p>
            <div className="flex items-center gap-1">
              <Image
                src="/images/G_coin_icon.png"
                alt="G coin"
                width={16}
                height={16}
                className="w-4 h-4"
              />
              <span className={`text-lg font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">盈虧比例</p>
            <div className="flex items-center gap-1">
              {totalPnl >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className={`text-lg font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnl >= 0 ? '+' : ''}{totalPnlPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">當前持倉 ({positions.length})</h3>
        </div>

        <div className="divide-y divide-slate-200">
          {positions.map((position) => {
            const totalCost = parseFloat(position.totalCost || "0");
            const currentValue = parseFloat(position.currentValue || "0");
            const profitLoss = parseFloat(position.profitLoss || "0");
            const profitLossPercent = parseFloat(position.profitLossPercent || "0");
            const shares = parseFloat(position.shares || "0");
            // Calculate avgPrice from totalCost and shares if not provided
            const avgPrice = position.avgPrice 
              ? parseFloat(position.avgPrice) 
              : (shares > 0 ? (totalCost / shares) * 100 : 0);
            const currentPrice = parseFloat(position.currentProbability || "0");
            const isProfit = profitLoss >= 0;
            const marketShortcode = position.marketShortcode;

            return (
              <div
                key={`${position.positionId}-${position.side}`}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                {/* Market Title */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="text-sm font-medium text-slate-900 line-clamp-2 flex-1">
                    {marketShortcode ? (
                      <Link 
                        href={`/m/${marketShortcode}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {position.marketTitle}
                      </Link>
                    ) : (
                      position.marketTitle
                    )}
                  </h4>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                    isProfit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isProfit ? '+' : ''}{profitLossPercent.toFixed(1)}%
                  </div>
                </div>

                {/* Position Details */}
                <div className="flex items-center gap-2 mb-3 text-sm">
                  {position.optionName && (
                    <span className="font-medium text-slate-700">{position.optionName}</span>
                  )}
                  <BetIcon direction={position.side === 'YES' ? 'yes' : 'no'} size="sm" />
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-600">{shares.toFixed(4)} shares</span>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                  <div>
                    <p className="text-slate-500 mb-1">平均成本</p>
                    <p className="font-bold text-slate-900">{avgPrice.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">當前價格</p>
                    <p className="font-bold text-slate-900">{currentPrice.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">總投入</p>
                    <div className="flex items-center gap-1">
                      <Image
                        src="/images/G_coin_icon.png"
                        alt="G coin"
                        width={12}
                        height={12}
                        className="w-3 h-3"
                      />
                      <span className="font-bold text-slate-900">{formatCurrency(totalCost)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">當前價值</p>
                    <div className="flex items-center gap-1">
                      <Image
                        src="/images/G_coin_icon.png"
                        alt="G coin"
                        width={12}
                        height={12}
                        className="w-3 h-3"
                      />
                      <span className={`font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(currentValue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Close Position Button */}
                <div className="flex items-center justify-end mt-3">
                  <button
                    className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      closingPositionId === position.positionId
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    }`}
                    onClick={() => handleClosePosition(position)}
                    disabled={closingPositionId === position.positionId}
                  >
                    {closingPositionId === position.positionId ? '處理中...' : '平倉'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
