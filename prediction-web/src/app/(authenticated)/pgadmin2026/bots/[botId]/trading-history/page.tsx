"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface BotTradingHistoryData {
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    coinBalance: number;
    isBot: boolean;
  };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: string;
    referenceId: string | null;
    balanceAfter?: number;
    tradeSide?: string | null;
    marketInfo?: {
      marketId: string;
      marketTitle: string;
      questionType: string;
      optionName?: string | null;
      side: 'YES' | 'NO';
    } | null;
  }>;
  trades: Array<{
    id: string;
    side: string;
    shares: string;
    grossAmount: string;
    feeAmount: string;
    netAmount: string;
    priceYesBefore: string;
    priceYesAfter: string;
    createdAt: string;
    marketId?: string;
    marketTitle?: string;
    optionName?: string;
  }>;
  exclusiveTrades: Array<{
    id: string;
    side: string;
    shares: string;
    grossAmount: string;
    feeAmount: string;
    netAmount: string;
    priceBefore: string;
    priceAfter: string;
    createdAt: string;
    marketId?: string;
    marketTitle?: string;
    outcomeName?: string;
  }>;
  statistics: {
    currentBalance: number;
    totalAssets: number;
    totalInvested: number;
    totalPnL: number;
    seasonPnL: number;
    seasonInvested: number;
    seasonRate: number;
  };
}

export default function BotTradingHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params.botId as string;
  const [data, setData] = useState<BotTradingHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'trades' | 'exclusiveTrades'>('transactions');

  useEffect(() => {
    loadData();
  }, [botId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/bots/${botId}/trading-history`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to load bot trading history:", error);
      alert("載入失敗，請檢查後端是否已部署");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">載入中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12 text-red-500">載入失敗</div>
      </div>
    );
  }

  const formatNumber = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">機器人交易詳情</h1>
            <div className="flex items-center gap-3">
              {data.user.avatarUrl ? (
                <img
                  src={data.user.avatarUrl}
                  alt={data.user.displayName}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                  {data.user.displayName[0]}
                </div>
              )}
              <div>
                <div className="font-medium text-lg">{data.user.displayName}</div>
                <div className="text-sm text-gray-500">ID: {data.user.id.substring(0, 8)}...</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/pgadmin2026/bots"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              返回機器人管理
            </Link>
            <Link
              href="/pgadmin2026"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              返回主頁
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">當前餘額</div>
            <div className="text-2xl font-bold">{formatNumber(data.statistics.currentBalance)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">總資產</div>
            <div className="text-2xl font-bold">{formatNumber(data.statistics.totalAssets)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">賽季已實現盈虧</div>
            <div className={`text-2xl font-bold ${data.statistics.seasonPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.statistics.seasonPnL >= 0 ? '+' : ''}{formatNumber(data.statistics.seasonPnL)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">賽季獲利率</div>
            <div className={`text-2xl font-bold ${data.statistics.seasonRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.statistics.seasonRate >= 0 ? '+' : ''}{formatNumber(data.statistics.seasonRate)}%
            </div>
          </div>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">總投入</div>
            <div className="text-xl font-bold">{formatNumber(data.statistics.totalInvested)}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">總已實現盈虧</div>
            <div className={`text-xl font-bold ${data.statistics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.statistics.totalPnL >= 0 ? '+' : ''}{formatNumber(data.statistics.totalPnL)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">賽季投入</div>
            <div className="text-xl font-bold">{formatNumber(data.statistics.seasonInvested)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-4">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              交易記錄 ({data.transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'trades'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              普通交易 ({data.trades.length})
            </button>
            <button
              onClick={() => setActiveTab('exclusiveTrades')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'exclusiveTrades'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              獨占市場交易 ({data.exclusiveTrades.length})
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">交易類型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">餘額變化</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">市場</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">描述</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.transactions.map((tx) => {
                const getTradeAction = (tradeSide: string | null | undefined) => {
                  if (!tradeSide) return null;
                  if (tradeSide.includes('BUY')) return { text: '買入', color: 'text-blue-600', bg: 'bg-blue-50' };
                  if (tradeSide.includes('SELL')) return { text: '平倉', color: 'text-orange-600', bg: 'bg-orange-50' };
                  return null;
                };
                const tradeAction = getTradeAction(tx.tradeSide);
                return (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tradeAction ? (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tradeAction.bg} ${tradeAction.color}`}>
                          {tradeAction.text}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.amount >= 0 ? '+' : ''}{formatNumber(tx.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.balanceAfter !== undefined ? formatNumber(tx.balanceAfter) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.marketInfo?.marketTitle || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm max-w-md truncate">
                      {tx.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.transactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">尚無交易記錄</div>
          )}
        </div>
      )}

      {/* Trades Table */}
      {activeTab === 'trades' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">方向</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">份額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">總金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手續費</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">淨金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">價格變化</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">市場</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.trades.map((trade) => {
                const netAmount = parseFloat(trade.netAmount);
                const priceChange = (parseFloat(trade.priceYesAfter) - parseFloat(trade.priceYesBefore)) * 100;
                return (
                  <tr key={trade.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(trade.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{trade.side}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatNumber(trade.shares)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatNumber(trade.grossAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatNumber(trade.feeAmount)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {netAmount >= 0 ? '+' : ''}{formatNumber(trade.netAmount)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {priceChange >= 0 ? '+' : ''}{formatNumber(priceChange)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>{trade.marketTitle || '-'}</div>
                      {trade.optionName && (
                        <div className="text-xs text-gray-500">{trade.optionName}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.trades.length === 0 && (
            <div className="text-center py-12 text-gray-500">尚無普通交易記錄</div>
          )}
        </div>
      )}

      {/* Exclusive Trades Table */}
      {activeTab === 'exclusiveTrades' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">方向</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">份額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">總金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手續費</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">淨金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">價格變化</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">市場</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.exclusiveTrades.map((trade) => {
                const netAmount = parseFloat(trade.netAmount);
                const priceChange = (parseFloat(trade.priceAfter) - parseFloat(trade.priceBefore)) * 100;
                return (
                  <tr key={trade.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(trade.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{trade.side}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatNumber(trade.shares)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatNumber(trade.grossAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatNumber(trade.feeAmount)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {netAmount >= 0 ? '+' : ''}{formatNumber(trade.netAmount)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {priceChange >= 0 ? '+' : ''}{formatNumber(priceChange)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>{trade.marketTitle || '-'}</div>
                      {trade.outcomeName && (
                        <div className="text-xs text-gray-500">{trade.outcomeName}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.exclusiveTrades.length === 0 && (
            <div className="text-center py-12 text-gray-500">尚無獨占市場交易記錄</div>
          )}
        </div>
      )}
    </div>
  );
}
