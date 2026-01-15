"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BotActivityLog {
  id: string;
  botId: string;
  actionType: "TRADE" | "CLOSE_POSITION" | "ERROR" | "STATUS_CHANGE" | "TOP_UP";
  marketId?: string | null;
  details?: {
    amount?: number;
    side?: string;
    action?: string;
  };
  success: boolean;
  errorMessage?: string | null;
  createdAt: string;
  bot?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    group?: { id: string; name: string };
  } | null;
  user?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  market?: {
    id: string;
    title: string;
  } | null;
}

export default function BotTradesPage() {
  const [logs, setLogs] = useState<BotActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "TRADE" | "CLOSE_POSITION" | "ERROR" | "TOP_UP" | "STATUS_CHANGE"
  >("ALL");

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const query = filter === "ALL" ? "" : `?actionType=${filter}`;
      const response = await fetch(`/api/admin/bots/activity${query}`, {
        credentials: "include",
      });
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load bot activity logs:", error);
      setLogs([]);
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">機器人交易紀錄</h1>
            <p className="text-gray-600">查看所有機器人每一筆交易</p>
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

        <div className="flex flex-wrap gap-2">
          {(
            [
              "ALL",
              "TRADE",
              "CLOSE_POSITION",
              "TOP_UP",
              "STATUS_CHANGE",
              "ERROR",
            ] as const
          ).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-2 rounded-lg ${
                filter === value ? "bg-gray-800 text-white" : "bg-gray-200"
              }`}
            >
              {value === "ALL"
                ? "全部"
                : value === "TRADE"
                ? "交易"
                : value === "CLOSE_POSITION"
                ? "平倉"
                : value === "TOP_UP"
                ? "補充餘額"
                : value === "STATUS_CHANGE"
                ? "狀態變更"
                : "錯誤"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                用戶 / 機器人
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                市場
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                動作
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                方向
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                金額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                成功
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                時間
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {log.user?.avatarUrl ? (
                      <img
                        src={log.user.avatarUrl}
                        alt={log.user.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {(log.user?.displayName || log.bot?.displayName || "B")[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {log.user?.displayName || log.bot?.displayName || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.bot?.displayName || "未設定機器人名稱"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {log.market?.title || log.marketId || "未知市場"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {log.actionType === "TRADE"
                    ? "交易"
                    : log.actionType === "CLOSE_POSITION"
                    ? "平倉"
                    : log.actionType === "TOP_UP"
                    ? "補充餘額"
                    : log.actionType === "STATUS_CHANGE"
                    ? "狀態變更"
                    : "錯誤"}
                  {log.details?.action ? ` (${log.details.action})` : ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {log.details?.side || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {log.details?.amount ?? "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      log.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {log.success ? "成功" : "失敗"}
                  </span>
                  {!log.success && log.errorMessage ? (
                    <div className="text-xs text-red-500 mt-1">{log.errorMessage}</div>
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(log.createdAt).toLocaleString("zh-TW")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">尚無交易紀錄</div>
        )}
      </div>
    </div>
  );
}
