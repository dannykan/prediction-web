"use client";

import { useEffect, useState } from "react";
import { getAllUserPositions, type UserPosition } from "../api/getAllUserPositions";
import { 
  tradeExclusiveMarket, 
  tradeOptionMarket,
  getExclusiveMarketByMarketId 
} from "@/features/market/api/lmsr";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UserPositionsListProps {
  userId: string;
}

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("zh-TW", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function UserPositionsList({ userId }: UserPositionsListProps) {
  const [positions, setPositions] = useState<UserPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPositions() {
      try {
        setLoading(true);
        const data = await getAllUserPositions(userId);
        setPositions(data);
      } catch (error) {
        console.error("[UserPositionsList] Failed to load positions:", error);
        setPositions([]);
      } finally {
        setLoading(false);
      }
    }

    loadPositions();
  }, [userId]);

  const handleClosePosition = async (position: UserPosition) => {
    // First confirmation
    const confirmMessage = `確認要平倉「${position.optionName}」的 ${position.side === 'YES' ? 'O' : 'X'} 持倉嗎？\n\n` +
      `持倉數量：${parseFloat(position.shares).toFixed(4)} shares\n` +
      `當前價值：${formatCurrency(parseFloat(position.currentValue))} G Coin\n` +
      `未實現盈虧：${parseFloat(position.profitLoss) >= 0 ? '+' : ''}${formatCurrency(parseFloat(position.profitLoss))} G Coin\n\n` +
      `此操作將賣出所有持倉，無法復原。`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // Second confirmation
    if (!confirm('⚠️ 再次確認：確定要平倉此持倉嗎？')) {
      return;
    }

    try {
      setClosingPositionId(position.positionId);

      if (position.questionType === 'SINGLE_CHOICE' && position.outcomeId) {
        // Close exclusive market position (single choice)
        const exclusiveMarket = await getExclusiveMarketByMarketId(position.marketId);
        const sellSide = position.side === 'YES' ? 'SELL_YES' : 'SELL_NO';
        
        await tradeExclusiveMarket(
          exclusiveMarket.exclusiveMarketId,
          {
            outcomeId: position.outcomeId,
            side: sellSide,
            amountType: 'SHARES',
            amount: position.shares, // Sell all shares
          },
        );
      } else if (position.optionMarketId) {
        // Close option market position (YES_NO or MULTIPLE_CHOICE)
        const sellSide = position.side === 'YES' ? 'SELL_YES' : 'SELL_NO';
        
        await tradeOptionMarket(
          position.optionMarketId,
          {
            side: sellSide,
            amountType: 'SHARES',
            amount: position.shares, // Sell all shares
          },
        );
      } else {
        alert('無法識別持倉類型，無法平倉');
        return;
      }
      
      alert('平倉成功！');
      
      // Reload positions
      const data = await getAllUserPositions(userId);
      setPositions(data);
    } catch (err: any) {
      console.error("[UserPositionsList] Close position error:", err);
      alert(err.message || '平倉失敗');
    } finally {
      setClosingPositionId(null);
    }
  };

  if (loading) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-sm text-gray-500 text-center">載入持倉中...</div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-sm text-gray-500 text-center">目前沒有任何持倉</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map((position) => {
        const totalCost = parseFloat(position.totalCost);
        const currentValue = parseFloat(position.currentValue);
        const profitLoss = parseFloat(position.profitLoss);
        const profitLossPercent = parseFloat(position.profitLossPercent);
        const shares = parseFloat(position.shares);
        const probabilityChange = parseFloat(position.probabilityChange);
        const currentProbability = parseFloat(position.currentProbability);

        const isProfit = profitLoss >= 0;

        return (
          <div
            key={`${position.positionId}-${position.side}`}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3"
          >
            {/* Market Title */}
            <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
              <Link 
                href={`/m/${position.marketId}`}
                className="font-semibold text-base text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {position.marketTitle}
              </Link>
            </div>

            {/* Position Info */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-base">{position.optionName}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {position.side === 'YES' ? '✅ 支持' : '❌ 反對'}
                  {position.isBundle && ' • Bundle'}
                </div>
                {position.firstTradeAt && (
                  <div className="text-xs text-gray-400 mt-1">
                    進場時間：{new Date(position.firstTradeAt).toLocaleString("zh-TW", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
              <div className={`text-right ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                <div className="text-lg font-bold">
                  {isProfit ? '+' : ''}{formatCurrency(profitLoss)}
                </div>
                <div className="text-xs">
                  {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Main Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">當前價值</div>
                <div className="font-semibold">{formatCurrency(currentValue)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">投入成本</div>
                <div className="font-semibold">{formatCurrency(totalCost)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">持有 Shares</div>
                <div className="font-mono font-semibold">{shares.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">當前機率</div>
                <div className="font-semibold">{currentProbability.toFixed(1)}%</div>
              </div>
            </div>

            {/* Probability Change */}
            {probabilityChange !== 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500">
                  投入後機率變化：
                  <span className={`font-semibold ml-1 ${probabilityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {probabilityChange > 0 ? '+' : ''}{probabilityChange.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            {/* Close Position Button */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => handleClosePosition(position)}
                disabled={closingPositionId === position.positionId}
                variant="outline"
                className="w-full text-sm"
                size="sm"
              >
                {closingPositionId === position.positionId ? '平倉中...' : '平倉'}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

