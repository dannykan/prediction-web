"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  displayName: string;
  coinBalance: number;
  rankLevel: number;
  avatarUrl?: string;
}

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    rankLevel: 1,
    avatarUrl: "",
  });
  const [balanceAdjustment, setBalanceAdjustment] = useState("");
  const [avatarUploadMethod, setAvatarUploadMethod] = useState<"url" | "upload">("url");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data;
        setUser(userData);
        setFormData({
          displayName: userData.displayName || "",
          rankLevel: userData.rankLevel || 1,
          avatarUrl: userData.avatarUrl || "",
        });
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (): Promise<string | null> => {
    if (!avatarFile) {
      return null;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", avatarFile);

      const response = await fetch("/api/uploads/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "上傳失敗");
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error("Error uploading avatar:", err);
      alert(`頭像上傳失敗: ${err instanceof Error ? err.message : "Unknown error"}`);
      return null;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("用戶數據未加載，請刷新頁面重試");
      return;
    }

    // 檢查是否有任何變更
    const hasDisplayNameChange = formData.displayName !== (user.displayName || "");
    const hasRankLevelChange = formData.rankLevel !== (user.rankLevel || 1);
    const hasBalanceChange = balanceAdjustment && parseFloat(balanceAdjustment) !== 0;
    const hasAvatarChange = 
      (avatarUploadMethod === "url" && formData.avatarUrl && formData.avatarUrl !== (user.avatarUrl || "")) ||
      (avatarUploadMethod === "upload" && avatarFile !== null);

    if (!hasDisplayNameChange && !hasRankLevelChange && !hasBalanceChange && !hasAvatarChange) {
      alert("沒有變更需要保存");
      return;
    }

    // 要求輸入原因
    if (!reason.trim()) {
      alert("請輸入修改原因");
      return;
    }

    setSaving(true);

    try {
      // 1. 如果有頭像上傳，先上傳頭像
      let finalAvatarUrl = formData.avatarUrl;
      if (avatarUploadMethod === "upload" && avatarFile) {
        const uploadedUrl = await handleAvatarUpload();
        if (!uploadedUrl) {
          setSaving(false);
          return; // 上傳失敗，停止提交
        }
        finalAvatarUrl = uploadedUrl;
      }

      // 2. 更新用戶基本信息（不包括餘額）
      const updatePromises: Promise<any>[] = [];
      
      if (hasDisplayNameChange || hasRankLevelChange || hasAvatarChange) {
        const updateBody: any = {
          reason: reason.trim(),
        };
        
        if (hasDisplayNameChange) {
          updateBody.displayName = formData.displayName;
        }
        if (hasRankLevelChange) {
          updateBody.rankLevel = formData.rankLevel;
        }
        if (hasAvatarChange) {
          updateBody.avatarUrl = finalAvatarUrl;
        }
        
        updatePromises.push(
          fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(updateBody),
          })
        );
      }

      // 3. 如果有餘額調整，使用 adjust-balance API
      if (hasBalanceChange) {
        const adjustmentAmount = parseFloat(balanceAdjustment);
        if (!isNaN(adjustmentAmount) && adjustmentAmount !== 0) {
          updatePromises.push(
            fetch(`/api/admin/users/${userId}/adjust-balance`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                adjustmentAmount: adjustmentAmount,
                reason: reason.trim(),
              }),
            })
          );
        }
      }

      // 等待所有更新完成
      const results = await Promise.all(updatePromises);
      const allSuccess = results.every((res) => res.ok);

      if (allSuccess) {
        alert("用戶已更新，通知已發送給用戶");
        router.push(`/pgadmin2026/users/${userId}`);
      } else {
        const errors = await Promise.all(
          results
            .filter((res) => !res.ok)
            .map((res) => res.json().catch(() => ({ message: "Unknown error" })))
        );
        alert(`更新失敗: ${errors.map((e) => e.message).join(", ")}`);
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("更新失敗");
    } finally {
      setSaving(false);
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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-900 mb-4 inline-block"
        >
          ← 返回上一頁
        </button>
        <h1 className="text-3xl font-bold mb-2">編輯用戶</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              顯示名稱
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              當前餘額
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              {user.coinBalance.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              餘額調整
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={balanceAdjustment}
                onChange={(e) => setBalanceAdjustment(e.target.value)}
                placeholder="輸入調整金額（正數=增加，負數=減少）"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              例如：輸入 100 表示增加 100，輸入 -50 表示減少 50
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              等級
            </label>
            <input
              type="number"
              min="1"
              value={formData.rankLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rankLevel: parseInt(e.target.value) || 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              頭像
            </label>
            
            {/* 選擇上傳方式 */}
            <div className="mb-3 flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="url"
                  checked={avatarUploadMethod === "url"}
                  onChange={(e) => setAvatarUploadMethod(e.target.value as "url" | "upload")}
                  className="mr-2"
                />
                使用 URL
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="upload"
                  checked={avatarUploadMethod === "upload"}
                  onChange={(e) => setAvatarUploadMethod(e.target.value as "url" | "upload")}
                  className="mr-2"
                />
                本地上傳
              </label>
            </div>

            {/* URL 輸入 */}
            {avatarUploadMethod === "url" && (
              <div>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, avatarUrl: e.target.value })
                  }
                  placeholder="輸入頭像 URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {formData.avatarUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.avatarUrl}
                      alt="預覽"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 文件上傳 */}
            {avatarUploadMethod === "upload" && (
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      // 預覽圖片
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setFormData({ ...formData, avatarUrl: event.target.result as string });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {avatarFile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">預覽：</p>
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      alt="預覽"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      檔案：{avatarFile.name} ({(avatarFile.size / 1024).toFixed(2)} KB)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              修改原因 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="請輸入修改此用戶資訊的原因，此原因將發送給用戶作為通知..."
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <p className="mt-1 text-sm text-gray-500">
              此原因將作為通知訊息發送給用戶
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={saving || isUploadingAvatar}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving || isUploadingAvatar ? "保存中..." : "保存"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
