"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// LMSR Trade record (replaces old Bet structure)
interface Trade {
  id: string;
  userId: string;
  user: {
    id: string;
    displayName: string;
    email?: string;
    avatarUrl?: string | null;
  };
  // For YES_NO/MULTIPLE_CHOICE (OptionMarket)
  optionMarketId?: string;
  optionId?: string | null;
  optionName?: string;
  // For SINGLE_CHOICE (ExclusiveMarket)
  outcomeId?: string;
  // Common fields
  side: string;
  isBuy: boolean;
  shares: string;
  grossAmount: string;
  feeAmount: string;
  netAmount: string;
  totalCost: string;
  priceYesBefore?: string;
  priceYesAfter?: string;
  priceBefore?: string;
  priceAfter?: string;
  createdAt: string | Date;
}

export default function AdminBetsPage() {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketIdFilter, setMarketIdFilter] = useState("");
  const [marketInfo, setMarketInfo] = useState<{ id: string; title: string; questionType?: string } | null>(null);

  useEffect(() => {
    // 由於沒有全局下注列表 API，我們需要從市場獲取下注
    // 這裡先顯示提示，讓用戶選擇市場
  }, []);

  // Note: LMSR trades cannot be deleted like old bets
  const handleDelete = async (tradeId: string) => {
    alert("LMSR 交易記錄無法刪除。如需處理問題交易，請聯繫技術團隊。");
  };

  const fetchTradesByMarket = async () => {
    if (!marketIdFilter) {
      setTrades([]);
      setMarketInfo(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch market info first
      try {
        const marketRes = await fetch(`/api/markets/${marketIdFilter}`, {
          credentials: "include",
        });
        if (marketRes.ok) {
          const marketData = await marketRes.json();
          const market = marketData.market || marketData;
          setMarketInfo({
            id: market.id,
            title: market.title,
            questionType: market.questionType,
          });
        }
      } catch (err) {
        console.error("Error fetching market info:", err);
      }
      
      // Fetch trades
      const response = await fetch(`/api/admin/markets/${marketIdFilter}/bets`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch trades");
      }
      
      const data = await response.json();
      const tradesData = Array.isArray(data) ? data : (data.trades || []);
      
      setTrades(tradesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (marketIdFilter) {
      fetchTradesByMarket();
    } else {
      setTrades([]);
      setMarketInfo(null);
    }
  }, [marketIdFilter]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">交易記錄管理</h1>
          <p className="text-gray-600">查看市場的 LMSR 交易記錄</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← 返回上一頁
        </button>
      </div>

      {/* 篩選器 */}
      <div className="mb-6 flex gap-4 items-center">
        <input
          type="text"
          placeholder="輸入市場 ID 來查看該市場的交易記錄..."
          value={marketIdFilter}
          onChange={(e) => setMarketIdFilter(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={fetchTradesByMarket}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          查詢
        </button>
      </div>

      {!marketIdFilter && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            💡 提示：請輸入市場 ID 來查看該市場的所有交易記錄。您也可以從市場詳情頁面查看交易記錄。
          </p>
        </div>
      )}

      {marketInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>市場：</strong>{marketInfo.title} ({marketInfo.questionType || 'YES_NO'})
          </p>
        </div>
      )}

      {/* 交易記錄列表 */}
      {loading && marketIdFilter ? (
        <div className="text-center py-8">載入中...</div>
      ) : error ? (
        <div className="text-red-600">錯誤: {error}</div>
      ) : trades.length === 0 && marketIdFilter ? (
        <div className="text-center py-8 text-gray-500">沒有找到交易記錄</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 移動設備上可水平滾動，桌面設備上正常顯示 */}
          <div className="overflow-x-auto md:overflow-x-visible">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  用戶
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  選項
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  方向
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  數量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  總成本
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  淨金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  時間
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trades.map((trade) => {
                // Format side display
                const getSideDisplay = (side: string, isBuy: boolean) => {
                  if (side === 'BUY_YES' || (side === 'BUY' && isBuy)) {
                    return marketInfo?.questionType === 'YES_NO' ? '〇 買入' : '買入';
                  } else if (side === 'BUY_NO') {
                    return '✕ 買入';
                  } else if (side === 'SELL_YES' || (side === 'SELL' && !isBuy)) {
                    return marketInfo?.questionType === 'YES_NO' ? '〇 賣出' : '賣出';
                  } else if (side === 'SELL_NO') {
                    return '✕ 賣出';
                  }
                  return side;
                };

                const optionName = trade.optionName || 'N/A';
                const shares = parseFloat(trade.shares || '0');
                const totalCost = parseFloat(trade.totalCost || '0');
                const netAmount = parseFloat(trade.netAmount || '0');

                return (
                  <tr key={trade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {trade.user?.displayName || 'Unknown'}
                      </div>
                      {trade.user?.email && (
                        <div className="text-sm text-gray-500">{trade.user.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {optionName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.isBuy 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {getSideDisplay(trade.side, trade.isBuy)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shares.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {netAmount >= 0 ? '+' : ''}
                      {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(trade.createdAt).toLocaleString('zh-TW')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
