"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Market {
  id: string;
  title: string;
  status: string;
  closeTime: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  iconUrl?: string;
}

export default function AdminMarketsPage() {
  const router = useRouter();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // 分類管理相關狀態
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    fetchMarkets();
  }, [statusFilter]);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const url = `/api/markets${statusFilter ? `?status=${statusFilter}` : ""}`;
      const response = await fetch(url, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch markets");
      }
      
      const data = await response.json();
      setMarkets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (marketId: string) => {
    if (!confirm("確定要刪除這個市場嗎？所有未結算的下注將被退款。")) {
      return;
    }

    const reason = prompt("請輸入刪除原因：");
    if (!reason) {
      return;
    }

    try {
      // TODO: Get adminId from auth context
      const adminId = "admin-user-id";
      
      const response = await fetch(`/api/admin/markets/${marketId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ adminId, reason }),
      });

      if (response.ok) {
        alert("市場已刪除");
        fetchMarkets();
      } else {
        const error = await response.json();
        alert(`刪除失敗: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting market:", err);
      alert("刪除失敗");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-800";
      case "LOCKED":
        return "bg-yellow-100 text-yellow-800";
      case "SETTLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 載入分類列表
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch("/api/categories", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        const sortedCategories = Array.isArray(data) 
          ? [...data].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          : [];
        setCategories(sortedCategories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // 打開分類管理時載入分類
  useEffect(() => {
    if (showCategoryManagement) {
      fetchCategories();
    }
  }, [showCategoryManagement]);

  // 創建新分類
  const handleCreateCategory = async () => {
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      alert("請輸入分類名稱");
      return;
    }

    // 生成 slug（從名稱自動生成）
    // 先轉換為小寫，替換空格為連字符，移除特殊字符
    let slug = trimmedName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-") // 將多個連字符替換為單個
      .replace(/^-|-$/g, ""); // 移除開頭和結尾的連字符

    // 如果 slug 為空（例如名稱全是特殊字符），使用默認值
    if (!slug) {
      slug = `category-${Date.now()}`;
    }

    setIsCreatingCategory(true);
    try {
      const requestBody = {
        name: trimmedName,
        slug: slug,
        sortOrder: categories.length + 1,
      };

      console.log('[handleCreateCategory] Request body:', requestBody);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[handleCreateCategory] Category created:', data);
        alert("分類已創建");
        setNewCategoryName("");
        fetchCategories();
      } else {
        const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        console.error('[handleCreateCategory] Error response:', {
          status: response.status,
          statusText: response.statusText,
          error,
        });
        alert(`創建失敗: ${error.message || error.error || `HTTP ${response.status}`}`);
      }
    } catch (err) {
      console.error("[handleCreateCategory] Error creating category:", err);
      alert(`創建失敗: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // 移動分類順序
  const moveCategory = (index: number, direction: "up" | "down") => {
    const newCategories = [...categories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newCategories.length) {
      return;
    }

    // 交換位置
    [newCategories[index], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[index],
    ];

    setCategories(newCategories);
  };

  // 保存排序
  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const reorderData = {
        categories: categories.map((cat, index) => ({
          id: cat.id,
          sortOrder: index + 1,
        })),
      };

      const response = await fetch("/api/admin/categories/reorder", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(reorderData),
      });

      if (response.ok) {
        alert("排序已保存");
        fetchCategories();
      } else {
        const error = await response.json();
        alert(`保存失敗: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error saving order:", err);
      alert("保存失敗");
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold mb-2">市場管理</h1>
          <p className="text-gray-600">查看和管理所有市場（所有市場均使用 LMSR 機制）</p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          ← 返回上一頁
        </button>
      </div>

      {/* 篩選器和操作欄 */}
      <div className="mb-6 flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">全部狀態</option>
          <option value="OPEN">開放中</option>
          <option value="LOCKED">已鎖定</option>
          <option value="SETTLED">已結算</option>
        </select>
        <button
          onClick={fetchMarkets}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          重新載入
        </button>
        <Link
          href="/pgadmin2026/markets/create"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + 創建市場
        </Link>
        <button
          onClick={() => setShowCategoryManagement(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          管理分類
        </button>
      </div>

      {/* 市場列表 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* 移動設備上可水平滾動，桌面設備上正常顯示 */}
        <div className="overflow-x-auto md:overflow-x-visible">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                標題
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                關閉時間
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {markets.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  沒有找到市場
                </td>
              </tr>
            ) : (
              markets.map((market) => (
                <tr key={market.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {market.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        market.status
                      )}`}
                    >
                      {market.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(market.closeTime).toLocaleString("zh-TW")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/pgadmin2026/markets/${market.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      查看
                    </Link>
                    <Link
                      href={`/pgadmin2026/markets/${market.id}/edit`}
                      className="text-green-600 hover:text-green-900"
                    >
                      編輯
                    </Link>
                    {market.status !== "SETTLED" && (
                      <button
                        onClick={() => handleDelete(market.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        刪除
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* 分類管理模態框 */}
      {showCategoryManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">分類管理</h2>
              <button
                onClick={() => setShowCategoryManagement(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* 新增分類 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">新增分類</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="輸入分類名稱"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateCategory();
                    }
                  }}
                />
                <button
                  onClick={handleCreateCategory}
                  disabled={isCreatingCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isCreatingCategory ? "創建中..." : "創建"}
                </button>
              </div>
            </div>

            {/* 分類列表 */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3">分類列表（拖拽或使用箭頭調整順序）</h3>
              {loadingCategories ? (
                <div className="text-center py-4">載入中...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-4 text-gray-500">沒有分類</div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveCategory(index, "up")}
                          disabled={index === 0}
                          className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="上移"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveCategory(index, "down")}
                          disabled={index === categories.length - 1}
                          className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="下移"
                        >
                          ↓
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-500">
                          排序: {category.sortOrder || index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveOrder}
                disabled={isSavingOrder || categories.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSavingOrder ? "保存中..." : "保存排序"}
              </button>
              <button
                onClick={() => setShowCategoryManagement(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
