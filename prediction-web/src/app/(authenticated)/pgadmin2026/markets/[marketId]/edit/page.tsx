"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Market {
  id: string;
  title: string;
  description: string;
  resolutionRules?: string;
  questionType: "YES_NO" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  categoryId?: string;
  category?: { id: string; name: string };
  closeTime: string;
  imageUrl?: string;
  options: Array<{ id: string; name: string }>;
  lmsrBeta?: number;
}

interface Category {
  id: string;
  name: string;
}

// 根據題型獲取默認Beta值
const getDefaultBeta = (questionType: "YES_NO" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE"): number => {
  switch (questionType) {
    case "YES_NO":
      return 10000;
    case "SINGLE_CHOICE":
      return 15000;
    case "MULTIPLE_CHOICE":
      return 10000;
    default:
      return 10000;
  }
};

export default function AdminMarketEditPage() {
  const router = useRouter();
  const params = useParams();
  const marketId = params?.marketId as string;

  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Refs for auto-resizing textareas
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const resolutionRulesTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 自動調整textarea高度
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resolutionRules: "",
    questionType: "YES_NO" as "YES_NO" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE",
    categoryId: "",
    closeTime: "",
    imageUrl: "",
    options: ["", ""] as string[],
    lmsrBeta: getDefaultBeta("YES_NO"),
  });

  // 載入分類列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch("/api/categories", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (marketId) {
      fetchMarket();
    }
  }, [marketId]);

  const fetchMarket = async () => {
    try {
      setLoading(true);
      // 使用管理員 API 獲取市場數據
      const response = await fetch(`/api/admin/markets/${marketId}?t=${Date.now()}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        const marketData = data.market || data;
        setMarket(marketData);
        
        // 處理選項數據
        let optionsArray: string[] = [];
        if (marketData.options && Array.isArray(marketData.options)) {
          if (marketData.questionType === "YES_NO") {
            optionsArray = ["", ""];
          } else {
            optionsArray = marketData.options.map((opt: any) => opt.name || "");
          }
        } else {
          optionsArray = ["", ""];
        }
        
        console.log("Fetched market data:", marketData);
        console.log("ResolutionRules from API:", marketData.resolutionRules);
        
        const questionType = marketData.questionType || "YES_NO";
        setFormData({
          title: marketData.title || "",
          description: marketData.description || "",
          resolutionRules: marketData.resolutionRules ?? "",
          questionType: questionType as "YES_NO" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE",
          categoryId: marketData.categoryId || marketData.category?.id || "",
          closeTime: marketData.closeTime
            ? new Date(marketData.closeTime).toISOString().slice(0, 16)
            : "",
          imageUrl: marketData.imageUrl || "",
          options: optionsArray,
          lmsrBeta: marketData.lmsrBeta || getDefaultBeta(questionType as "YES_NO" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE"),
        });
        
        // 載入數據後調整textarea高度
        setTimeout(() => {
          adjustTextareaHeight(descriptionTextareaRef.current);
          adjustTextareaHeight(resolutionRulesTextareaRef.current);
        }, 100);
      } else {
        // 處理錯誤響應
        const errorData = await response.json().catch(() => ({
          error: "無法獲取市場數據",
        }));
        console.error("Error fetching market:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        alert(`載入市場失敗: ${errorData.error || errorData.message || "未知錯誤"} (狀態碼: ${response.status})`);
      }
    } catch (err) {
      console.error("Error fetching market:", err);
      alert(`載入市場時發生錯誤: ${err instanceof Error ? err.message : "未知錯誤"}`);
    } finally {
      setLoading(false);
    }
  };

  // 當描述或結算規則內容改變時，自動調整textarea高度
  useEffect(() => {
    adjustTextareaHeight(descriptionTextareaRef.current);
  }, [formData.description]);

  useEffect(() => {
    adjustTextareaHeight(resolutionRulesTextareaRef.current);
  }, [formData.resolutionRules]);

  // 處理圖片選擇
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 上傳圖片
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) {
      return null;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("/api/uploads/market-image", {
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
      console.error("Error uploading image:", err);
      alert(`圖片上傳失敗: ${err instanceof Error ? err.message : "Unknown error"}`);
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 處理選項變更
  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index),
      });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  // 當題型改變時，重置選項
  useEffect(() => {
    if (formData.questionType === "YES_NO") {
      setFormData({
        ...formData,
        options: ["", ""],
      });
    }
  }, [formData.questionType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 驗證必填字段
    if (!formData.title.trim()) {
      alert("請輸入標題");
      return;
    }
    
    if (!formData.description.trim()) {
      alert("請輸入描述");
      return;
    }
    
    if (!formData.resolutionRules.trim()) {
      alert("請輸入結算規則");
      return;
    }
    
    if (!formData.categoryId) {
      alert("請選擇分類");
      return;
    }
    
    if (!formData.closeTime) {
      alert("請選擇結算時間");
      return;
    }
    
    if (!imageFile && !formData.imageUrl) {
      alert("請上傳圖片");
      return;
    }
    
    // 驗證選項（非YES_NO題型）
    if (formData.questionType !== "YES_NO") {
      const validOptions = formData.options.filter((opt) => opt.trim().length > 0);
      if (validOptions.length < 2) {
        alert("至少需要2個選項");
        return;
      }
    }

    setSaving(true);

    try {
      // 1. 如果有圖片上傳，先上傳圖片
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          setSaving(false);
          return; // 上傳失敗，停止提交
        }
        finalImageUrl = uploadedUrl;
      }

      // 2. 準備選項數據
      let marketOptions: Array<{ id: string; name: string }> = [];
      
      if (formData.questionType === "YES_NO") {
        marketOptions = [
          { id: "yes", name: "是" },
          { id: "no", name: "否" },
        ];
      } else {
        const validOptions = formData.options.filter((opt) => opt.trim().length > 0);
        // 保持現有選項的ID，如果有的話
        if (market?.options && market.options.length === validOptions.length) {
          marketOptions = validOptions.map((opt, index) => ({
            id: market.options[index]?.id || `option-${index}`,
            name: opt.trim(),
          }));
        } else {
          marketOptions = validOptions.map((opt, index) => ({
            id: `option-${index}`,
            name: opt.trim(),
          }));
        }
      }

      // 3. 更新市場
      const updatePayload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        questionType: formData.questionType,
        categoryId: formData.categoryId,
        closeTime: new Date(formData.closeTime).toISOString(),
        imageUrl: finalImageUrl,
        options: marketOptions,
      };

      // 確保 resolutionRules 字段正確發送
      // 後端邏輯：如果值存在且非空，則trim；否則設為null
      const trimmedRules = formData.resolutionRules?.trim();
      updatePayload.resolutionRules = trimmedRules && trimmedRules.length > 0 ? trimmedRules : null;
      
      // 添加 lmsrBeta
      updatePayload.lmsrBeta = formData.lmsrBeta;

      console.log("Updating market with payload:", updatePayload);
      console.log("ResolutionRules value:", updatePayload.resolutionRules);

      const response = await fetch(`/api/admin/markets/${marketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Market update response:", responseData);
        alert("市場已更新");
        router.push(`/pgadmin2026/markets`);
      } else {
        const error = await response.json();
        console.error("Market update error:", error);
        alert(`更新失敗: ${error.message || error.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error updating market:", err);
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

  if (!market) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600">市場不存在</div>
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
        <h1 className="text-3xl font-bold mb-2">編輯市場</h1>
        <p className="text-gray-600">所有市場都使用 LMSR 機制</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          {/* 標題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              標題 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="輸入市場標題"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={descriptionTextareaRef}
              required
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                adjustTextareaHeight(e.target);
              }}
              onInput={(e) => {
                adjustTextareaHeight(e.target as HTMLTextAreaElement);
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none overflow-hidden"
              placeholder="輸入市場描述"
              style={{ minHeight: "100px" }}
            />
          </div>

          {/* 題型選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              題型 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.questionType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  questionType: e.target.value as typeof formData.questionType,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="YES_NO">是非題</option>
              <option value="SINGLE_CHOICE">單選題</option>
              <option value="MULTIPLE_CHOICE">多選題</option>
            </select>
          </div>

          {/* 結算時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結算時間 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.closeTime}
              onChange={(e) =>
                setFormData({ ...formData, closeTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* 結算規則 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結算規則 <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={resolutionRulesTextareaRef}
              required
              value={formData.resolutionRules}
              onChange={(e) => {
                setFormData({ ...formData, resolutionRules: e.target.value });
                adjustTextareaHeight(e.target);
              }}
              onInput={(e) => {
                adjustTextareaHeight(e.target as HTMLTextAreaElement);
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none overflow-hidden"
              placeholder="輸入結算規則，說明如何判斷市場結果"
              style={{ minHeight: "200px" }}
            />
          </div>

          {/* 圖片 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              圖片 <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="預覽"
                  className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
            {formData.imageUrl && !imagePreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">當前圖片：</p>
                <img
                  src={formData.imageUrl}
                  alt="當前圖片"
                  className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>

          {/* 選項（非YES_NO題型） */}
          {formData.questionType !== "YES_NO" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選項 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder={`選項 ${index + 1}`}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        刪除
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  + 新增選項
                </button>
              </div>
            </div>
          )}

          {/* 分類 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分類 <span className="text-red-500">*</span>
            </label>
            {loadingCategories ? (
              <div className="px-3 py-2 text-gray-500">載入分類中...</div>
            ) : (
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">選擇分類</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* LMSR Beta值 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LMSR Beta值
            </label>
            <input
              type="number"
              min="1"
              max="100000"
              value={formData.lmsrBeta}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lmsrBeta: parseInt(e.target.value) || getDefaultBeta(formData.questionType),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={getDefaultBeta(formData.questionType).toString()}
            />
            <p className="mt-1 text-sm text-gray-500">
              Beta值控制市場流動性：值越高，流動性越好，價格變化更平滑
              <br />
              {formData.questionType === "YES_NO" && "（默認：10000，範圍：1-100000）"}
              {formData.questionType === "SINGLE_CHOICE" && "（默認：15000，範圍：1-100000）"}
              {formData.questionType === "MULTIPLE_CHOICE" && "（默認：10000，範圍：1-100000）"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={saving || isUploadingImage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving || isUploadingImage ? "保存中..." : "保存"}
          </button>
          <button
            type="button"
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
