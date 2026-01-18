"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/admin/AdminGuard";

function TasksPageContent() {
  const router = useRouter();
  const [executing, setExecuting] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState<{
    success: boolean;
    message: string;
    usersProcessed?: number;
    snapshotsCreated?: number;
  } | null>(null);
  const [targetUserId, setTargetUserId] = useState("");

  const handleSeasonReset = async () => {
    if (!confirm("確定要執行賽季重置嗎？此操作將重置所有用戶的賽季數據。")) {
      return;
    }

    try {
      setExecuting(true);
      // TODO: 實現賽季重置 API 調用
      alert("賽季重置功能尚未實現");
    } catch (err) {
      console.error("Error executing season reset:", err);
      alert("執行失敗");
    } finally {
      setExecuting(false);
    }
  };

  const handleRecoverHistoricalSnapshots = async () => {
    const confirmMessage = targetUserId
      ? `確定要恢復用戶 ${targetUserId} 的歷史資產快照嗎？`
      : "確定要恢復所有用戶的歷史資產快照嗎？此操作可能需要較長時間。";
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setRecovering(true);
      setRecoveryResult(null);
      
      const url = `/api/admin/tasks/recover-historical-snapshots${targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : ''}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setRecoveryResult(data);
      
      if (data.success) {
        alert(
          `恢復完成！\n` +
          `處理用戶數：${data.usersProcessed || 0}\n` +
          `創建快照數：${data.snapshotsCreated || 0}`
        );
      } else {
        alert(`恢復失敗：${data.message}`);
      }
    } catch (err) {
      console.error("Error recovering historical snapshots:", err);
      const errorMessage = err instanceof Error ? err.message : "執行失敗";
      setRecoveryResult({
        success: false,
        message: errorMessage,
      });
      alert(`恢復失敗：${errorMessage}`);
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">任務管理</h1>
          <p className="text-gray-600">執行系統任務</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← 返回上一頁
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">系統任務</h2>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">賽季重置</h3>
            <p className="text-sm text-gray-600 mb-4">
              重置所有用戶的賽季數據，包括賽季開始餘額、賽季投入、賽季盈虧等。
            </p>
            <button
              onClick={handleSeasonReset}
              disabled={executing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {executing ? "執行中..." : "執行賽季重置"}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">恢復歷史資產快照</h3>
            <p className="text-sm text-gray-600 mb-4">
              從交易歷史中重建歷史資產快照，用於顯示用戶總資產圖表的歷史數據。
              如果不指定用戶 ID，將為所有真實用戶恢復歷史數據。
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用戶 ID（可選，留空則恢復所有用戶）
              </label>
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="留空則恢復所有用戶"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={handleRecoverHistoricalSnapshots}
              disabled={recovering}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {recovering ? "恢復中..." : targetUserId ? "恢復指定用戶" : "恢復所有用戶"}
            </button>
            
            {recoveryResult && (
              <div className={`mt-4 p-3 rounded-lg ${recoveryResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-sm font-medium ${recoveryResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {recoveryResult.success ? '✓ 恢復成功' : '✗ 恢復失敗'}
                </p>
                <p className="text-xs text-gray-600 mt-1">{recoveryResult.message}</p>
                {recoveryResult.success && (
                  <div className="mt-2 text-xs text-gray-600">
                    <p>處理用戶數：{recoveryResult.usersProcessed || 0}</p>
                    <p>創建快照數：{recoveryResult.snapshotsCreated || 0}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">更多任務</h3>
            <p className="text-sm text-gray-600">
              更多系統任務將在未來添加。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <AdminGuard>
      <TasksPageContent />
    </AdminGuard>
  );
}
