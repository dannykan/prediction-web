"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Bet {
  id: string;
  userId: string;
  marketId: string;
  selectionId: string;
  stakeAmount: number;
  potentialWin: number;
  status: string;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
  market: {
    id: string;
    title: string;
  };
  createdAt: string;
}

export default function AdminBetsPage() {
  const router = useRouter();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketIdFilter, setMarketIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    // 由於沒有全局下注列表 API，我們需要從市場獲取下注
    // 這裡先顯示提示，讓用戶選擇市場
  }, []);

  const handleDelete = async (betId: string) => {
    if (!confirm("確定要刪除這個下注嗎？將退還下注金額。")) {
      return;
    }

    const reason = prompt("請輸入刪除原因：");
    if (!reason) {
      return;
    }

    try {
      // TODO: Get adminId from auth context
      const adminId = "admin-user-id";
      
      const response = await fetch(`/api/admin/bets/${betId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ adminId, reason }),
      });

      if (response.ok) {
        alert("下注已刪除並退款");
        // Refresh if we have a market filter
        if (marketIdFilter) {
          fetchBetsByMarket();
        }
      } else {
        const error = await response.json();
        alert(`刪除失敗: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting bet:", err);
      alert("刪除失敗");
    }
  };

  const fetchBetsByMarket = async () => {
    if (!marketIdFilter) {
      setBets([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/markets/${marketIdFilter}/bets`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch bets");
      }
      
      const data = await response.json();
      let filteredBets = data;
      
      if (statusFilter) {
        filteredBets = data.filter((bet: Bet) => bet.status === statusFilter);
      }
      
      setBets(filteredBets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (marketIdFilter) {
      fetchBetsByMarket();
    } else {
      setBets([]);
    }
  }, [marketIdFilter, statusFilter]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">下注管理</h1>
          <p className="text-gray-600">查看和管理所有下注</p>
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
          placeholder="輸入市場 ID 來查看該市場的下注..."
          value={marketIdFilter}
          onChange={(e) => setMarketIdFilter(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">全部狀態</option>
          <option value="PENDING">待處理</option>
          <option value="WON">已獲勝</option>
          <option value="LOST">已失敗</option>
          <option value="REFUNDED">已退款</option>
        </select>
        <button
          onClick={fetchBetsByMarket}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          查詢
        </button>
      </div>

      {!marketIdFilter && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            💡 提示：請輸入市場 ID 來查看該市場的所有下注。您也可以從市場詳情頁面查看下注。
          </p>
        </div>
      )}

      {/* 下注列表 */}
      {loading && marketIdFilter ? (
        <div className="text-center py-8">載入中...</div>
      ) : error ? (
        <div className="text-red-600">錯誤: {error}</div>
      ) : bets.length === 0 && marketIdFilter ? (
        <div className="text-center py-8 text-gray-500">沒有找到下注</div>
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
                  市場
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  選擇
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  下注金額
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  潛在收益
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bets.map((bet) => (
                <tr key={bet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {bet.user.displayName}
                    </div>
                    <div className="text-sm text-gray-500">{bet.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/pgadmin2026/markets/${bet.market.id}`}
                      className="text-sm text-blue-600 hover:text-blue-900"
                    >
                      {bet.market.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bet.selectionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bet.stakeAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bet.potentialWin.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {bet.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {bet.status !== "REFUNDED" && bet.status !== "WON" && (
                      <button
                        onClick={() => handleDelete(bet.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        刪除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
