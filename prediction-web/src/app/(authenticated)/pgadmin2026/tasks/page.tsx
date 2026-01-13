"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/admin/AdminGuard";

function TasksPageContent() {
  const router = useRouter();
  const [executing, setExecuting] = useState(false);

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
