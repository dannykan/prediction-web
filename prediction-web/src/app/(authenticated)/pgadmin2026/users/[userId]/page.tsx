"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  displayName: string;
  coinBalance: number;
  rankLevel: number;
  createdAt: string;
  avatarUrl?: string;
}

interface Activity {
  bets: any[];
  transactions: any[];
}

interface Comment {
  id: string;
  content: string;
  marketId: string;
  market: { title: string };
  createdAt: string;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "activity" | "comments">("info");

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, activityRes, commentsRes] = await Promise.all([
        fetch(`/api/admin/users/${userId}`, { credentials: "include" }),
        fetch(`/api/admin/users/${userId}/activity`, { credentials: "include" }),
        fetch(`/api/admin/users/${userId}/comments`, { credentials: "include" }),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user || userData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivity(activityData);
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        // Ensure comments is always an array
        if (Array.isArray(commentsData)) {
          setComments(commentsData);
        } else if (commentsData && Array.isArray(commentsData.comments)) {
          setComments(commentsData.comments);
        } else {
          setComments([]);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">用戶不存在</div>
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
            <h1 className="text-3xl font-bold mb-2">用戶詳情</h1>
            <p className="text-gray-600">{user.displayName || user.email}</p>
          </div>
          <Link
            href={`/pgadmin2026/users/${userId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            編輯用戶
          </Link>
        </div>
      </div>

      {/* 標籤頁 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "info"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            基本信息
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "activity"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            活動記錄
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "comments"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            評論 ({comments.length})
          </button>
        </nav>
      </div>

      {/* 基本信息 */}
      {activeTab === "info" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用戶 ID
              </label>
              <p className="text-sm text-gray-900">{user.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                郵箱
              </label>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                顯示名稱
              </label>
              <p className="text-sm text-gray-900">{user.displayName || "未設置"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                餘額
              </label>
              <p className="text-sm text-gray-900">{user.coinBalance.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                等級
              </label>
              <p className="text-sm text-gray-900">Lv.{user.rankLevel}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                註冊時間
              </label>
              <p className="text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleString("zh-TW")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 活動記錄 */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">下注記錄</h3>
            {activity?.bets && activity.bets.length > 0 ? (
              <div className="space-y-2">
                {activity.bets.slice(0, 10).map((bet: any) => (
                  <div key={bet.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span>下注 {bet.stakeAmount} 到 {bet.selectionId}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(bet.createdAt).toLocaleString("zh-TW")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">沒有下注記錄</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">交易記錄</h3>
            {activity?.transactions && activity.transactions.length > 0 ? (
              <div className="space-y-2">
                {activity.transactions.slice(0, 10).map((tx: any) => (
                  <div key={tx.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span>{tx.type}: {tx.amount}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleString("zh-TW")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">沒有交易記錄</p>
            )}
          </div>
        </div>
      )}

      {/* 評論 */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
              沒有評論
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-2">
                  <Link
                    href={`/pgadmin2026/markets/${comment.marketId}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {comment.market.title}
                  </Link>
                </div>
                <p className="text-gray-700 mb-2">{comment.content}</p>
                <p className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleString("zh-TW")}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
