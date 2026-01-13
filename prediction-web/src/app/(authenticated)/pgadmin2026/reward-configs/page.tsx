"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/admin/AdminGuard";

interface RewardConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

function RewardConfigsPageContent() {
  const router = useRouter();
  const [configs, setConfigs] = useState<RewardConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 從後端獲取獎勵配置
    setLoading(false);
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">獎勵配置</h1>
          <p className="text-gray-600">管理獎勵配置和規則</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← 返回上一頁
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="text-center py-8">載入中...</div>
        ) : configs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>暫無獎勵配置</p>
            <p className="text-sm mt-2">獎勵配置功能將在未來添加。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
              <div key={config.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{config.name}</h3>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      config.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {config.enabled ? "啟用" : "停用"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RewardConfigsPage() {
  return (
    <AdminGuard>
      <RewardConfigsPageContent />
    </AdminGuard>
  );
}
