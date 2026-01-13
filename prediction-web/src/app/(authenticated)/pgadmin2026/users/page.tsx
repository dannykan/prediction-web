"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface User {
  id: string;
  email: string;
  displayName: string;
  coinBalance: number;
  rankLevel: number;
  createdAt: string;
  avatarUrl?: string;
}

interface UserStats {
  totalUsers: number;
  newUsers24h: number;
  chartData: { date: string; count: number; total: number }[];
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [page, setPage] = useState(0);
  const [limit] = useState(50);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // 防抖處理：延遲更新 debouncedSearch
  useEffect(() => {
    // 如果正在輸入中文（composition），不觸發搜索
    if (isComposing) {
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // 重置到第一頁
    }, 500); // 500ms 延遲

    return () => clearTimeout(timer);
  }, [search, isComposing]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });
      
      // 只添加非空的搜索參數（使用 debouncedSearch）
      if (debouncedSearch && debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }

      const url = `/api/admin/users?${params.toString()}`;
      console.log("[AdminUsersPage] Fetching users:", url);

      const response = await fetch(url, {
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Failed to fetch users",
          message: `HTTP ${response.status}`,
        }));
        console.error("[AdminUsersPage] API error:", {
          status: response.status,
          error: errorData,
          url,
        });
        throw new Error(errorData.message || errorData.error || `Failed to fetch users (${response.status})`);
      }
      
      const data = await response.json();
      console.log("[AdminUsersPage] Received data:", data);
      
      // Backend returns { users: User[], total: number }
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data)) {
        // Fallback: if it's already an array
        setUsers(data);
      } else {
        console.error("Unexpected response format:", data);
        setUsers([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error("[AdminUsersPage] Error fetching users:", err);
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // 當 debouncedSearch 改變時，觸發搜索
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page]);

  // 獲取統計數據
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/admin/users/stats", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Stats data:", data);
        console.log("Chart data sample:", data.chartData?.[0]);
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // 組件加載時獲取統計數據
  useEffect(() => {
    fetchStats();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm("確定要刪除這個用戶嗎？此操作無法復原。")) {
      return;
    }

    const reason = prompt("請輸入刪除原因：");
    if (!reason) {
      return;
    }

    try {
      // TODO: Get adminId from auth context
      const adminId = "admin-user-id";
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ adminId, reason }),
      });

      if (response.ok) {
        alert("用戶已刪除");
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`刪除失敗: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("刪除失敗");
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">錯誤: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">用戶管理</h1>
          <p className="text-gray-600">查看和管理所有用戶</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← 返回上一頁
        </button>
      </div>

      {/* 統計資訊 */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">總用戶數</p>
              {statsLoading ? (
                <p className="text-2xl font-bold text-gray-400">載入中...</p>
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalUsers.toLocaleString() || 0}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">24小時內新增</p>
              {statsLoading ? (
                <p className="text-2xl font-bold text-gray-400">載入中...</p>
              ) : (
                <p className="text-3xl font-bold text-green-600">
                  {stats?.newUsers24h.toLocaleString() || 0}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">平均每日新增</p>
              {statsLoading ? (
                <p className="text-2xl font-bold text-gray-400">載入中...</p>
              ) : (
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.chartData
                    ? Math.round(
                        stats.chartData.reduce((sum, d) => sum + d.count, 0) /
                          stats.chartData.length
                      )
                    : 0}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 用戶增長圖表 */}
      {stats && !statsLoading && stats.chartData && stats.chartData.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">過去30天用戶註冊趨勢</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={stats.chartData} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                yAxisId="left"
                label={{ value: "每日新增", angle: -90, position: "insideLeft" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "用戶總量", angle: 90, position: "insideRight" }}
              />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("zh-TW");
                }}
                formatter={(value: any, name?: string) => {
                  if (name === "count") {
                    return [`${value} 人`, "每日新增"];
                  } else if (name === "total") {
                    return [`${Number(value).toLocaleString()} 人`, "用戶總量"];
                  }
                  return value;
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="count"
                name="每日新增"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="total"
                name="用戶總量"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
          {/* 調試信息 - 可以在生產環境中移除 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-500">
              <p>數據點數量: {stats.chartData.length}</p>
              <p>第一個數據點: {JSON.stringify(stats.chartData[0])}</p>
              <p>最後一個數據點: {JSON.stringify(stats.chartData[stats.chartData.length - 1])}</p>
            </div>
          )}
        </div>
      )}

      {/* 搜索和操作欄 */}
      <div className="mb-6 flex gap-4 items-center">
        <input
          type="text"
          placeholder="搜索用戶（姓名、郵箱、ID）..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          onCompositionStart={() => {
            // 開始輸入中文（包括注音符號）
            setIsComposing(true);
          }}
          onCompositionEnd={() => {
            // 完成中文輸入（選擇了候選字）
            setIsComposing(false);
          }}
          onKeyDown={(e) => {
            // 如果按下 Enter，立即觸發搜索（即使正在輸入中文）
            if (e.key === "Enter") {
              setIsComposing(false);
              setDebouncedSearch(search);
              setPage(0);
            }
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={() => {
            fetchUsers();
            fetchStats();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          重新載入
        </button>
      </div>

      {/* 用戶列表 */}
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
                餘額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                等級
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                註冊時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  沒有找到用戶
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.avatarUrl && (
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.displayName || "未設置"}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.coinBalance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Lv.{user.rankLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleString("zh-TW")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/pgadmin2026/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      查看
                    </Link>
                    <Link
                      href={`/pgadmin2026/users/${user.id}/edit`}
                      className="text-green-600 hover:text-green-900"
                    >
                      編輯
                    </Link>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* 分頁 */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
        >
          上一頁
        </button>
        <span className="text-sm text-gray-600">第 {page + 1} 頁</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={users.length < limit}
          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
        >
          下一頁
        </button>
      </div>
    </div>
  );
}
