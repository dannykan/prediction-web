"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  content: string;
  likes: number;
  userId: string;
  marketId: string;
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

export default function AdminCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketIdFilter, setMarketIdFilter] = useState("");

  useEffect(() => {
    if (marketIdFilter) {
      fetchCommentsByMarket();
    } else {
      setComments([]);
    }
  }, [marketIdFilter]);

  const fetchCommentsByMarket = async () => {
    if (!marketIdFilter) {
      setComments([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/markets/${marketIdFilter}/comments`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      
      const data = await response.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("確定要刪除這個評論嗎？")) {
      return;
    }

    const reason = prompt("請輸入刪除原因：");
    if (!reason) {
      return;
    }

    try {
      // TODO: Get adminId from auth context
      const adminId = "admin-user-id";
      
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ adminId, reason }),
      });

      if (response.ok) {
        alert("評論已刪除");
        if (marketIdFilter) {
          fetchCommentsByMarket();
        }
      } else {
        const error = await response.json();
        alert(`刪除失敗: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("刪除失敗");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">評論管理</h1>
          <p className="text-gray-600">查看和管理所有評論</p>
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
          placeholder="輸入市場 ID 來查看該市場的評論..."
          value={marketIdFilter}
          onChange={(e) => setMarketIdFilter(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={fetchCommentsByMarket}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          查詢
        </button>
      </div>

      {!marketIdFilter && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            💡 提示：請輸入市場 ID 來查看該市場的所有評論。您也可以從市場詳情頁面查看評論。
          </p>
        </div>
      )}

      {/* 評論列表 */}
      {loading && marketIdFilter ? (
        <div className="text-center py-8">載入中...</div>
      ) : error ? (
        <div className="text-red-600">錯誤: {error}</div>
      ) : comments.length === 0 && marketIdFilter ? (
        <div className="text-center py-8 text-gray-500">沒有找到評論</div>
      ) : (
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
                  <Link
                    href={`/pgadmin2026/markets/${comment.market.id}`}
                    className="text-sm text-blue-600 hover:text-blue-900 mb-2 block"
                  >
                    市場: {comment.market.title}
                  </Link>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  <div className="text-sm text-gray-500">
                    👍 {comment.likes} 個讚
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="ml-4 text-red-600 hover:text-red-900"
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
