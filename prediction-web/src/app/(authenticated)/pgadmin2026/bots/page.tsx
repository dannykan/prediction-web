"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { uploadAvatar } from "@/features/user/api/uploadAvatar";

interface BotGroup {
  id: string;
  name: string;
  description: string;
  type: string;
  tradingFrequencyMinutes: number;
  closePositionFrequencyMinutes: number;
  minTradeAmount: number;
  maxTradeAmount: number;
}

interface Bot {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  status: "ACTIVE" | "PAUSED" | "ERROR";
  tradingEnabled: boolean;
  totalTrades: number;
  lastTradeAt: string | null;
  nextTradeAt: string | null;
  createdAt: string;
  group?: BotGroup;
}

interface BotStats {
  totalBots: number;
  activeBots: number;
  pausedBots: number;
  errorBots: number;
  totalTrades24h: number;
  totalVolume24h: number;
}

export default function BotsManagementPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [stats, setStats] = useState<BotStats | null>(null);
  const [groups, setGroups] = useState<BotGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBatchAvatarModal, setShowBatchAvatarModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [botCount, setBotCount] = useState(10);
  const [initialBalance, setInitialBalance] = useState(10000);
  const [creating, setCreating] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [batchGroupId, setBatchGroupId] = useState("");
  const [batchAvatarUrl, setBatchAvatarUrl] = useState("");
  const [batchUpdating, setBatchUpdating] = useState(false);
  const [batchAvatarUploading, setBatchAvatarUploading] = useState(false);
  const [globalPause, setGlobalPause] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PAUSED" | "ERROR">("ALL");

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [botsRes, statsRes, groupsRes, configRes] = await Promise.all([
        fetch(`/api/admin/bots${filter !== "ALL" ? `?status=${filter}` : ""}`, {
          credentials: "include",
        }),
        fetch("/api/admin/bots/stats", { credentials: "include" }),
        fetch("/api/admin/bot-groups", { credentials: "include" }),
        fetch("/api/admin/bots/global-config", { credentials: "include" }),
      ]);

      const [botsData, statsData, groupsData, configData] = await Promise.all([
        botsRes.json(),
        statsRes.json(),
        groupsRes.json(),
        configRes.json(),
      ]);

      console.log("Loaded data:", { botsData, statsData, groupsData, configData });
      console.log("Response statuses:", {
        botsStatus: botsRes.status,
        statsStatus: statsRes.status,
        groupsStatus: groupsRes.status,
        configStatus: configRes.status,
      });

      // 檢查是否所有API都返回404（表示後端尚未部署）
      const allNotFound =
        botsRes.status === 404 &&
        statsRes.status === 404 &&
        groupsRes.status === 404 &&
        configRes.status === 404;

      if (allNotFound) {
        console.error("❌ 後端API尚未部署或正在部署中");
        alert(
          "機器人系統後端API尚未部署完成\n\n" +
          "請等待3-5分鐘讓Railway完成部署，然後重新整理頁面。\n\n" +
          "如果問題持續，請聯繫管理員。"
        );
      }

      // 確保數據格式正確
      const resolvedBots = Array.isArray(botsData)
        ? botsData
        : Array.isArray(botsData?.bots)
        ? botsData.bots
        : [];
      setBots(resolvedBots);
      setStats(statsData && !statsData.error && !statsData.message ? statsData : null);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setGlobalPause(configData?.globalPause || false);
    } catch (error) {
      console.error("Failed to load bot data:", error);
      // 設置默認值避免錯誤
      setBots([]);
      setGroups([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBots = async () => {
    if (!selectedGroup) {
      alert("請選擇機器人群組");
      return;
    }

    try {
      setCreating(true);
      const response = await fetch("/api/admin/bots/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          count: botCount,
          groupId: selectedGroup,
          initialBalance: initialBalance,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "創建失敗");
      }

      alert(`成功創建 ${botCount} 個機器人！`);
      setShowCreateModal(false);
      loadData();
    } catch (error: any) {
      alert(`創建失敗: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleGlobalPause = async () => {
    try {
      const response = await fetch("/api/admin/bots/global-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ globalPause: !globalPause }),
      });

      if (!response.ok) throw new Error("操作失敗");

      setGlobalPause(!globalPause);
      alert(globalPause ? "已恢復全部機器人" : "已暫停全部機器人");
    } catch (error) {
      alert("操作失敗");
    }
  };

  const handleToggleBot = async (botId: string, currentStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bots/${botId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE",
        }),
      });

      if (!response.ok) throw new Error("操作失敗");
      loadData();
    } catch (error) {
      alert("操作失敗");
    }
  };

  const handleDeleteBot = async (botId: string) => {
    if (!confirm("確定要刪除這個機器人嗎？")) return;

    try {
      const response = await fetch(`/api/admin/bots/${botId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("刪除失敗");

      alert("刪除成功");
      loadData();
    } catch (error) {
      alert("刪除失敗");
    }
  };

  const openEditModal = (bot: Bot) => {
    setEditingBot(bot);
    setEditDisplayName(bot.displayName || "");
    setEditAvatarUrl(bot.avatarUrl || "");
    setShowEditModal(true);
  };

  const handleSaveBotProfile = async () => {
    if (!editingBot) return;
    try {
      const response = await fetch(`/api/admin/bots/${editingBot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          displayName: editDisplayName.trim(),
          avatarUrl: editAvatarUrl.trim() || null,
        }),
      });

      if (!response.ok) throw new Error("更新失敗");

      alert("更新成功");
      setShowEditModal(false);
      setEditingBot(null);
      loadData();
    } catch (error) {
      alert("更新失敗");
    }
  };

  const handleAvatarUpload = async (file: File, mode: "single" | "batch") => {
    try {
      if (mode === "single") {
        setAvatarUploading(true);
      } else {
        setBatchAvatarUploading(true);
      }

      const url = await uploadAvatar(file);

      if (mode === "single") {
        setEditAvatarUrl(url);
      } else {
        setBatchAvatarUrl(url);
      }
    } catch (error: any) {
      alert(`上傳失敗: ${error.message || "未知錯誤"}`);
    } finally {
      if (mode === "single") {
        setAvatarUploading(false);
      } else {
        setBatchAvatarUploading(false);
      }
    }
  };

  const handleBatchAvatarUpdate = async () => {
    try {
      setBatchUpdating(true);
      const response = await fetch("/api/admin/bots/batch/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          groupId: batchGroupId || undefined,
          avatarUrl: batchAvatarUrl.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "批量更新失敗");

      alert(`更新成功：${data?.updated ?? 0} 個機器人`);
      setShowBatchAvatarModal(false);
      setBatchAvatarUrl("");
      setBatchGroupId("");
      loadData();
    } catch (error: any) {
      alert(`批量更新失敗: ${error.message || "未知錯誤"}`);
    } finally {
      setBatchUpdating(false);
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">機器人管理</h1>
            <p className="text-gray-600">管理自動交易機器人</p>
          </div>
          <Link
            href="/pgadmin2026"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            返回主頁
          </Link>
          <Link
            href="/pgadmin2026/bot-trades"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            交易紀錄
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-600">總機器人數</div>
              <div className="text-2xl font-bold">{stats.totalBots}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <div className="text-sm text-green-600">活躍中</div>
              <div className="text-2xl font-bold text-green-700">{stats.activeBots}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <div className="text-sm text-yellow-600">已暫停</div>
              <div className="text-2xl font-bold text-yellow-700">{stats.pausedBots}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow">
              <div className="text-sm text-red-600">錯誤</div>
              <div className="text-2xl font-bold text-red-700">{stats.errorBots}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            批量創建機器人
          </button>
          <button
            onClick={() => setShowBatchAvatarModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            批量修改頭像
          </button>
          <button
            onClick={handleToggleGlobalPause}
            className={`px-4 py-2 rounded-lg text-white ${
              globalPause
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {globalPause ? "恢復全部" : "暫停全部"}
          </button>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-2 rounded-lg ${
                filter === "ALL" ? "bg-gray-800 text-white" : "bg-gray-200"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter("ACTIVE")}
              className={`px-3 py-2 rounded-lg ${
                filter === "ACTIVE" ? "bg-green-600 text-white" : "bg-gray-200"
              }`}
            >
              活躍
            </button>
            <button
              onClick={() => setFilter("PAUSED")}
              className={`px-3 py-2 rounded-lg ${
                filter === "PAUSED" ? "bg-yellow-600 text-white" : "bg-gray-200"
              }`}
            >
              暫停
            </button>
            <button
              onClick={() => setFilter("ERROR")}
              className={`px-3 py-2 rounded-lg ${
                filter === "ERROR" ? "bg-red-600 text-white" : "bg-gray-200"
              }`}
            >
              錯誤
            </button>
          </div>
        </div>
      </div>

      {/* Bots List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">頭像</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名稱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">群組</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">交易次數</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">下次交易</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bots.map((bot) => (
              <tr key={bot.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {bot.avatarUrl ? (
                    <img
                      src={bot.avatarUrl}
                      alt={bot.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {bot.displayName[0]}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{bot.displayName}</div>
                  <div className="text-xs text-gray-500">{bot.id.substring(0, 8)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">{bot.group?.name || "無群組"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      bot.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : bot.status === "PAUSED"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {bot.status === "ACTIVE" ? "活躍" : bot.status === "PAUSED" ? "暫停" : "錯誤"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{bot.totalTrades}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {bot.nextTradeAt
                    ? new Date(bot.nextTradeAt).toLocaleString("zh-TW")
                    : "未設定"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleBot(bot.id, bot.status)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {bot.status === "ACTIVE" ? "暫停" : "啟動"}
                    </button>
                    <button
                      onClick={() => openEditModal(bot)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDeleteBot(bot.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bots.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            沒有找到機器人，點擊上方按鈕創建新的機器人
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">批量創建機器人</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">選擇群組</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">請選擇...</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} - {group.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">數量</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={botCount}
                  onChange={(e) => setBotCount(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">初始餘額 (G coin)</label>
                <input
                  type="number"
                  min="1000"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateBots}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "創建中..." : "確認創建"}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingBot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">編輯機器人資料</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">名稱</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">頭像網址</label>
                <input
                  type="text"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <div className="mt-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    或上傳本機圖片
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={avatarUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAvatarUpload(file, "single");
                      }
                    }}
                  />
                  {avatarUploading && (
                    <div className="text-xs text-gray-500 mt-1">上傳中...</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveBotProfile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showBatchAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">批量修改頭像</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">群組</label>
                <select
                  value={batchGroupId}
                  onChange={(e) => setBatchGroupId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">全部群組</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">頭像網址</label>
                <input
                  type="text"
                  value={batchAvatarUrl}
                  onChange={(e) => setBatchAvatarUrl(e.target.value)}
                  placeholder="留空可清除頭像"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <div className="mt-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    或上傳本機圖片
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={batchAvatarUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAvatarUpload(file, "batch");
                      }
                    }}
                  />
                  {batchAvatarUploading && (
                    <div className="text-xs text-gray-500 mt-1">上傳中...</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBatchAvatarUpdate}
                disabled={batchUpdating}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {batchUpdating ? "更新中..." : "確認更新"}
              </button>
              <button
                onClick={() => setShowBatchAvatarModal(false)}
                disabled={batchUpdating}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
