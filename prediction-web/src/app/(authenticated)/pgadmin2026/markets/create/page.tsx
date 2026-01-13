"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

export default function AdminCreateMarketPage() {
  const router = useRouter();
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

  // 根據題型獲取結算規則模板
  const getResolutionRulesTemplate = (questionType: "YES_NO" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE", closeTime: string): string => {
    const closeTimeText = closeTime ? new Date(closeTime).toLocaleString('zh-TW') : "【填入】";
    
    switch (questionType) {
      case "YES_NO":
        return `① 結算依據（Resolution Source）
本市場將依據以下 公開、可驗證資訊來源 進行結算：
	•	主要來源：【填入】
	•	備用來源：【填入（選填）】
若主要來源無法取得，將依序採用備用來源。

② ◯ 判定邏輯
只要在 市場有效期間內，任一結算依據 明確顯示 題目所描述之事件成立，即結算為 ◯。

③ ✕ 判定邏輯
若截至 結算時間點，無任何結算依據顯示事件成立，或事件被正式否認，則結算為 ✕。

④ 結算時間
	•	結算時間：${closeTimeText}
	•	所有判定皆以該時間點前已公開之資訊為準。

⑤ 模糊與爭議處理（固定）
以下情況，將由 Prediction God 官方依本模板精神進行判定：
	•	資料來源延遲、缺失或不一致
	•	事件部分發生但未完全符合題意
	•	官方公告語意模糊或後續修正
👉 官方保留最終結算與解釋權。

⑥ 市場失效
若事件於市場期間內：
	•	題目本身產生重大歧義
	•	結算依據無法取得且無替代方案
	•	發生不可抗力或系統性錯誤
市場將判定為 無效（Invalid），並退還所有投入。`;

      case "SINGLE_CHOICE":
        return `① 結算依據
	•	主要來源：【填入】
	•	備用來源：【填入（選填）】

② 結算邏輯
在結算時間點，僅能有一個選項被判定為正確：
	•	以結算依據中 最終、明確結果 為準
	•	該選項結算為 ◯
	•	其餘所有選項結算為 ✕

③ 無法判定情況
若：
	•	無任何選項符合條件
	•	或結果無法明確歸屬於單一選項
則市場將判定為 無效（Invalid） 並退款。

④ 結算時間
	•	結算時間：${closeTimeText}
	•	所有判定皆以該時間點前已公開之資訊為準。

⑤ 模糊與爭議處理（固定）
以下情況，將由 Prediction God 官方依本模板精神進行判定：
	•	資料來源延遲、缺失或不一致
	•	事件部分發生但未完全符合題意
	•	官方公告語意模糊或後續修正
👉 官方保留最終結算與解釋權。

⑥ 市場失效
若事件於市場期間內：
	•	題目本身產生重大歧義
	•	結算依據無法取得且無替代方案
	•	發生不可抗力或系統性錯誤
市場將判定為 無效（Invalid），並退還所有投入。`;

      case "MULTIPLE_CHOICE":
        return `① 結算依據
	•	主要來源：【填入】
	•	備用來源：【填入（選填）】

② 結算邏輯
在結算時間點：
	•	每個選項獨立判定
	•	符合條件者結算為 ◯
	•	不符合條件者結算為 ✕

③ 特殊說明
	•	選項之間互不影響
	•	可同時出現多個 ◯ 或全部 ✕

④ 結算時間
	•	結算時間：${closeTimeText}
	•	所有判定皆以該時間點前已公開之資訊為準。

⑤ 模糊與爭議處理（固定）
以下情況，將由 Prediction God 官方依本模板精神進行判定：
	•	資料來源延遲、缺失或不一致
	•	事件部分發生但未完全符合題意
	•	官方公告語意模糊或後續修正
👉 官方保留最終結算與解釋權。

⑥ 市場失效
若事件於市場期間內：
	•	題目本身產生重大歧義
	•	結算依據無法取得且無替代方案
	•	發生不可抗力或系統性錯誤
市場將判定為 無效（Invalid），並退還所有投入。`;

      default:
        return "";
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
    lmsrBeta: getDefaultBeta("YES_NO"), // 根據題型設置默認Beta值
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

  // 當題型改變時，重置選項、更新Beta值，並自動填入結算規則模板
  useEffect(() => {
    setFormData((prev) => {
      const defaultBeta = getDefaultBeta(prev.questionType);
      const template = getResolutionRulesTemplate(prev.questionType, prev.closeTime);
      
      if (prev.questionType === "YES_NO") {
        return {
          ...prev,
          options: ["", ""],
          lmsrBeta: defaultBeta,
          resolutionRules: template,
        };
      } else {
        return {
          ...prev,
          lmsrBeta: defaultBeta,
          resolutionRules: template,
        };
      }
    });
  }, [formData.questionType]);

  // 當結算時間改變時，更新結算規則模板中的結算時間
  useEffect(() => {
    if (formData.closeTime && formData.resolutionRules) {
      // 檢查是否包含模板標記，如果包含則更新結算時間
      if (formData.resolutionRules.includes("結算時間：") || formData.resolutionRules.includes("【填入】")) {
        setFormData((prev) => {
          const template = getResolutionRulesTemplate(prev.questionType, prev.closeTime);
          // 只有在結算規則看起來像是模板時才更新（避免覆蓋用戶自定義內容）
          if (prev.resolutionRules.includes("結算依據") || prev.resolutionRules.includes("判定邏輯")) {
            return {
              ...prev,
              resolutionRules: template,
            };
          }
          return prev;
        });
      }
    }
  }, [formData.closeTime]);

  // 當描述或結算規則內容改變時，自動調整textarea高度
  useEffect(() => {
    adjustTextareaHeight(descriptionTextareaRef.current);
  }, [formData.description]);

  useEffect(() => {
    adjustTextareaHeight(resolutionRulesTextareaRef.current);
  }, [formData.resolutionRules]);

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

    // 防止重複提交
    if (saving) {
      console.warn("Already saving, ignoring duplicate submit");
      return;
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
        const validOptions = formData.options.filter((opt) => opt && opt.trim().length > 0);
        if (validOptions.length < 2) {
          alert("至少需要2個選項");
          return;
        }
        marketOptions = validOptions.map((opt, index) => {
          const trimmedName = opt.trim();
          if (!trimmedName) {
            console.error(`[createMarket] Invalid option at index ${index}:`, opt);
          }
          return {
            id: `option-${index}`,
            name: trimmedName,
          };
        }).filter((opt) => opt.name && opt.name.length > 0);
        
        if (marketOptions.length < 2) {
          alert("至少需要2個有效選項");
          return;
        }
      }
      
      console.log("Prepared market options:", marketOptions);

      // 3. 創建市場
      // 準備請求數據，將空字符串轉換為 null/undefined
      const requestData: any = {
        title: formData.title.trim(),
        questionType: formData.questionType,
        closeTime: new Date(formData.closeTime).toISOString(),
        options: marketOptions,
        mechanism: "LMSR_V2", // 所有市場都是LMSR
        lmsrBeta: formData.lmsrBeta,
      };

      // 可選字段：只在有值時添加
      if (formData.description.trim()) {
        requestData.description = formData.description.trim();
      }
      if (formData.resolutionRules.trim()) {
        requestData.resolutionRules = formData.resolutionRules.trim();
      }
      if (formData.categoryId) {
        requestData.categoryId = formData.categoryId;
      }
      if (finalImageUrl) {
        requestData.imageUrl = finalImageUrl;
      }

      console.log("Creating market with data:", requestData);

      const response = await fetch("/api/admin/markets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        alert("市場已創建");
        router.push(`/pgadmin2026/markets`);
      } else {
        const error = await response.json();
        alert(`創建失敗: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating market:", err);
      alert("創建失敗");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-900 mb-4 inline-block"
        >
          ← 返回上一頁
        </button>
        <h1 className="text-3xl font-bold mb-2">創建市場</h1>
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
            {/* 快捷符號按鈕（僅在是非題時顯示） */}
            {formData.questionType === "YES_NO" && (
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">快捷插入符號：</span>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = resolutionRulesTextareaRef.current;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = formData.resolutionRules;
                      const newText = text.substring(0, start) + "◯" + text.substring(end);
                      setFormData({ ...formData, resolutionRules: newText });
                      // 恢復游標位置
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 1, start + 1);
                        adjustTextareaHeight(textarea);
                      }, 0);
                    }
                  }}
                  className="px-3 py-1 text-lg border-2 border-green-500 rounded hover:bg-green-50 transition-colors"
                  title="插入圈圈符號（〇）"
                >
                  ◯
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = resolutionRulesTextareaRef.current;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = formData.resolutionRules;
                      const newText = text.substring(0, start) + "✕" + text.substring(end);
                      setFormData({ ...formData, resolutionRules: newText });
                      // 恢復游標位置
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + 1, start + 1);
                        adjustTextareaHeight(textarea);
                      }, 0);
                    }
                  }}
                  className="px-3 py-1 text-lg border-2 border-red-500 rounded hover:bg-red-50 transition-colors"
                  title="插入叉叉符號（✕）"
                >
                  ✕
                </button>
                <span className="text-xs text-gray-500 ml-2">
                  （點擊按鈕在游標位置插入符號，或直接複製貼上：◯ ✕）
                </span>
              </div>
            )}
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
              required={!formData.imageUrl}
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving || isUploadingImage ? "創建中..." : "創建市場"}
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
