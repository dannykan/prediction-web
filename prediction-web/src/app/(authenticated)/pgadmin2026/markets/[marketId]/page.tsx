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
  side: string; // 'BUY_YES', 'BUY_NO', 'SELL_YES', 'SELL_NO', 'BUY', 'SELL'
  isBuy: boolean;
  shares: string;
  grossAmount: string;
  feeAmount: string;
  netAmount: string;
  totalCost: string;
  // Price fields (YES_NO/MULTIPLE_CHOICE)
  priceYesBefore?: string;
  priceYesAfter?: string;
  // Price fields (SINGLE_CHOICE)
  priceBefore?: string;
  priceAfter?: string;
  allPricesAfter?: Array<{
    outcomeId: string;
    optionId: string | null;
    price: string;
    optionName?: string | null;
  }>;
  createdAt: string | Date;
}

interface Comment {
  id: string;
  content: string;
  likes: number;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
  createdAt: string;
}

interface Market {
  id: string;
  title: string;
  status: string;
  questionType?: "YES_NO" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  options?: Array<{ id: string; name: string }>;
}

export default function AdminMarketDetailPage({
  params,
}: {
  params: Promise<{ marketId: string }>;
}) {
  const router = useRouter();
  const [marketId, setMarketId] = useState<string>("");
  const [market, setMarket] = useState<Market | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bets" | "comments">("bets");
  const [deleteReason, setDeleteReason] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleWinningOptions, setSettleWinningOptions] = useState<string[]>([]);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setMarketId(p.marketId);
    });
  }, [params]);

  useEffect(() => {
    if (marketId) {
      fetchData();
    }
  }, [marketId]);

  const fetchData = async () => {
    if (!marketId) return;
    
    try {
      setLoading(true);
      
      // 先獲取市場基本信息
      try {
        const marketRes = await fetch(`/api/markets/${marketId}`, {
          credentials: "include",
        });
        if (marketRes.ok) {
          const marketData = await marketRes.json();
          setMarket(marketData.market || marketData);
        }
      } catch (err) {
        console.error("Error fetching market:", err);
      }

      // 嘗試獲取下注和評論（如果API不存在，忽略錯誤）
      const [betsRes, commentsRes] = await Promise.allSettled([
        fetch(`/api/admin/markets/${marketId}/bets`, { credentials: "include" }),
        fetch(`/api/admin/markets/${marketId}/comments`, { credentials: "include" }),
      ]);

      if (betsRes.status === "fulfilled" && betsRes.value.ok) {
        try {
          const tradesData = await betsRes.value.json();
          if (Array.isArray(tradesData)) {
            setTrades(tradesData);
          } else if (tradesData && Array.isArray(tradesData.trades)) {
            setTrades(tradesData.trades);
          } else if (tradesData && Array.isArray(tradesData.bets)) {
            // Fallback for old format
            setTrades(tradesData.bets);
          } else {
            setTrades([]);
          }
        } catch (err) {
          console.error("Error parsing trades data:", err);
          setTrades([]);
        }
      } else {
        console.warn("Trades API not available or failed:", betsRes.status === "rejected" ? betsRes.reason : betsRes.value.status);
        setTrades([]);
      }

      if (commentsRes.status === "fulfilled" && commentsRes.value.ok) {
        try {
          const commentsData = await commentsRes.value.json();
          if (Array.isArray(commentsData)) {
            setComments(commentsData);
          } else if (commentsData && Array.isArray(commentsData.comments)) {
            setComments(commentsData.comments);
          } else {
            setComments([]);
          }
        } catch (err) {
          console.error("Error parsing comments data:", err);
          setComments([]);
        }
      } else {
        console.warn("Comments API not available or failed:", commentsRes.status === "rejected" ? commentsRes.reason : commentsRes.value.status);
        setComments([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    // Note: LMSR trades cannot be deleted like old bets
    // This functionality may not be available for LMSR trades
    alert("LMSR 交易記錄無法刪除。如需處理問題交易，請聯繫技術團隊。");
    setShowDeleteModal(null);
    setDeleteReason("");
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!deleteReason.trim()) {
      alert("請輸入刪除原因");
      return;
    }

    try {
      // TODO: Get adminId from auth context
      const adminId = "admin-user-id"; // Replace with actual admin ID
      
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          adminId,
          reason: deleteReason,
        }),
      });

      if (response.ok) {
        alert("評論已刪除");
        setShowDeleteModal(null);
        setDeleteReason("");
        fetchData();
      } else {
        const error = await response.json();
        alert(`刪除失敗: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("刪除失敗");
    }
  };

  const handleSettleMarket = async () => {
    if (!market) return;

    // 驗證選擇
    if (settleWinningOptions.length === 0) {
      alert("請選擇正確答案");
      return;
    }

    // 單選題只能選一個
    if (market.questionType === "SINGLE_CHOICE" && settleWinningOptions.length > 1) {
      alert("單選題只能選擇一個正確答案");
      return;
    }

    const confirmMessage = market.status === "SETTLED"
      ? "確定要重新結算這個市場嗎？這將覆蓋之前的結算結果。"
      : "確定要結算這個市場嗎？此操作無法撤銷。";
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setSettling(true);
      
      // 處理"以上皆非"：如果是 NONE，則發送空數組
      let winningOptionIds = settleWinningOptions;
      if (settleWinningOptions.includes("NONE")) {
        // "以上皆非"表示沒有正確答案，發送空數組
        winningOptionIds = [];
      }
      
      const response = await fetch(`/api/admin/markets/${marketId}/settle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          winningOptionIds: winningOptionIds,
        }),
      });

      if (response.ok) {
        alert("市場已成功結算");
        setShowSettleModal(false);
        setSettleWinningOptions([]);
        fetchData();
      } else {
        const error = await response.json();
        alert(`結算失敗: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error settling market:", err);
      alert("結算失敗");
    } finally {
      setSettling(false);
    }
  };

  const handleSettleOptionChange = (optionId: string, checked: boolean) => {
    if (!market) return;

    if (market.questionType === "SINGLE_CHOICE") {
      // 單選題：只能選一個
      setSettleWinningOptions(checked ? [optionId] : []);
    } else {
      // 多選題：可以選多個
      if (checked) {
        setSettleWinningOptions([...settleWinningOptions, optionId]);
      } else {
        setSettleWinningOptions(settleWinningOptions.filter(id => id !== optionId));
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-900 mb-4 inline-block"
        >
          ← 返回上一頁
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {market?.title || "市場詳情"}
            </h1>
            <p className="text-gray-600">市場 ID: {marketId}</p>
            {market?.status && (
              <p className="text-sm text-gray-500 mt-1">
                狀態: <span className="font-semibold">{market.status}</span>
              </p>
            )}
          </div>
          {market && (
            <button
              onClick={() => setShowSettleModal(true)}
              className={`px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 ${
                market.status === "SETTLED"
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {market.status === "SETTLED" ? "重新結算市場" : "結算市場"}
            </button>
          )}
        </div>
      </div>

      {/* 標籤頁 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("bets")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "bets"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            交易記錄 ({trades.length})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "comments"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            評論 ({comments.length})
          </button>
        </nav>
      </div>

      {/* 下注列表 */}
      {activeTab === "bets" && (
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
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    暫無交易記錄
                  </td>
                </tr>
              ) : (
                trades.map((trade) => {
                  // Format side display
                  const getSideDisplay = (side: string, isBuy: boolean) => {
                    if (side === 'BUY_YES' || (side === 'BUY' && isBuy)) {
                      return market?.questionType === 'YES_NO' ? '〇 買入' : '買入';
                    } else if (side === 'BUY_NO') {
                      return '✕ 買入';
                    } else if (side === 'SELL_YES' || (side === 'SELL' && !isBuy)) {
                      return market?.questionType === 'YES_NO' ? '〇 賣出' : '賣出';
                    } else if (side === 'SELL_NO') {
                      return '✕ 賣出';
                    }
                    return side;
                  };

                  // Get option name
                  const optionName = trade.optionName || 'N/A';
                  
                  // Format numbers
                  const shares = parseFloat(trade.shares || '0');
                  const totalCost = parseFloat(trade.totalCost || '0');
                  const netAmount = parseFloat(trade.netAmount || '0');

                  return (
                    <tr key={trade.id}>
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
                })
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* 評論列表 */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.user.displayName}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {comment.user.email}
                    </span>
                    <span className="ml-4 text-sm text-gray-400">
                      {new Date(comment.createdAt).toLocaleString("zh-TW")}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  <div className="text-sm text-gray-500">
                    👍 {comment.likes} 個讚
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(comment.id)}
                  className="ml-4 text-red-600 hover:text-red-900"
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 刪除確認對話框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">確認刪除</h3>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="請輸入刪除原因..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              rows={3}
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(null);
                  setDeleteReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (activeTab === "bets") {
                    handleDeleteTrade(showDeleteModal);
                  } else {
                    handleDeleteComment(showDeleteModal);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {activeTab === "bets" ? "確認（LMSR 交易無法刪除）" : "確認刪除"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 結算市場對話框 */}
      {showSettleModal && market && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">結算市場</h3>
            <p className="text-gray-600 mb-4">{market.title}</p>

            {/* 是非題：顯示圈圈和叉叉 */}
            {market.questionType === "YES_NO" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">選擇正確答案：</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      const yesOption = market.options?.find(opt => opt.id === "yes" || opt.name === "是");
                      if (yesOption) {
                        setSettleWinningOptions([yesOption.id]);
                      }
                    }}
                    className={`flex-1 px-6 py-4 border-2 rounded-lg text-2xl font-bold transition-all ${
                      settleWinningOptions.includes(market.options?.find(opt => opt.id === "yes" || opt.name === "是")?.id || "")
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    ✓ 是
                  </button>
                  <button
                    onClick={() => {
                      const noOption = market.options?.find(opt => opt.id === "no" || opt.name === "否");
                      if (noOption) {
                        setSettleWinningOptions([noOption.id]);
                      }
                    }}
                    className={`flex-1 px-6 py-4 border-2 rounded-lg text-2xl font-bold transition-all ${
                      settleWinningOptions.includes(market.options?.find(opt => opt.id === "no" || opt.name === "否")?.id || "")
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    ✗ 否
                  </button>
                </div>
              </div>
            )}

            {/* 單選題：顯示單選按鈕，包括"以上皆非" */}
            {market.questionType === "SINGLE_CHOICE" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">選擇正確答案（只能選一個）：</p>
                <div className="space-y-2">
                  {market.options?.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        settleWinningOptions.includes(option.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="settle-option"
                        checked={settleWinningOptions.includes(option.id)}
                        onChange={(e) => handleSettleOptionChange(option.id, e.target.checked)}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-lg">{option.name}</span>
                    </label>
                  ))}
                  {/* 以上皆非選項 */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      settleWinningOptions.includes("NONE")
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="settle-option"
                      checked={settleWinningOptions.includes("NONE")}
                      onChange={(e) => handleSettleOptionChange("NONE", e.target.checked)}
                      className="mr-3 w-5 h-5"
                    />
                    <span className="text-lg">以上皆非</span>
                  </label>
                </div>
              </div>
            )}

            {/* 多選題：顯示多選複選框，包括"以上皆非" */}
            {market.questionType === "MULTIPLE_CHOICE" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">選擇正確答案（可選多個）：</p>
                <div className="space-y-2">
                  {market.options?.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        settleWinningOptions.includes(option.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settleWinningOptions.includes(option.id)}
                        onChange={(e) => handleSettleOptionChange(option.id, e.target.checked)}
                        className="mr-3 w-5 h-5"
                      />
                      <span className="text-lg">{option.name}</span>
                    </label>
                  ))}
                  {/* 以上皆非選項 */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      settleWinningOptions.includes("NONE")
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={settleWinningOptions.includes("NONE")}
                      onChange={(e) => handleSettleOptionChange("NONE", e.target.checked)}
                      className="mr-3 w-5 h-5"
                    />
                    <span className="text-lg">以上皆非</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowSettleModal(false);
                  setSettleWinningOptions([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={settling}
              >
                取消
              </button>
              <button
                onClick={handleSettleMarket}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={settling || settleWinningOptions.length === 0}
              >
                {settling ? "結算中..." : "確認結算"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
