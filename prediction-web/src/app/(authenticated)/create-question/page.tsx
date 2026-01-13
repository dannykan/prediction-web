"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/features/user/api/getMe";
import { createMarket } from "@/features/market/api/createMarket";
import type { User } from "@/features/user/types/user";
import { getCategoriesClient, type Category } from "@/features/market/api/getCategoriesClient";

export default function CreateQuestionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questionType, setQuestionType] = useState<"YES_NO" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE">("YES_NO");
  const mechanism: "LMSR_V2" = "LMSR_V2"; // Always use LMSR_V2
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [closeDate, setCloseDate] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [creationFee, setCreationFee] = useState<number>(100);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [userData, categoriesData] = await Promise.all([
          getMe(),
          getCategoriesClient(),
        ]);

        if (userData) {
          setUser(userData);
        } else {
          router.push("/");
          return;
        }

        setCategories(categoriesData);
        
        // Set default close date (7 days from now)
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        setCloseDate(defaultDate.toISOString().slice(0, 16));
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;

    // Validation
    if (!title.trim()) {
      alert("請輸入題目");
      return;
    }

    if (!selectedCategoryId) {
      alert("請選擇分類");
      return;
    }

    if (!closeDate) {
      alert("請選擇截止時間");
      return;
    }

    if (questionType !== "YES_NO") {
      const validOptions = options.filter((opt) => opt.trim().length > 0);
      if (validOptions.length < 2) {
        alert("至少需要2個選項");
        return;
      }
    }

    setIsCreating(true);
    try {
      // Build market options
      let marketOptions: Array<{ id: string; name: string }> = [];
      if (questionType === "YES_NO") {
        marketOptions = [
          { id: "yes", name: "是" },
          { id: "no", name: "否" },
        ];
      } else {
        marketOptions = options
          .filter((opt) => opt.trim().length > 0)
          .map((opt, index) => ({
            id: `option_${index + 1}`,
            name: opt.trim(),
          }));
      }

      const result = await createMarket({
        title: title.trim(),
        description: description.trim() || undefined,
        questionType,
        mechanism,
        options: marketOptions,
        categoryId: selectedCategoryId,
        closeTime: new Date(closeDate).toISOString(),
        creationFee,
      });

      // Redirect to market detail page
      if (result.market.shortcode) {
        // Use the slug from the backend (preserves Chinese characters)
        const slug = result.market.slug || result.market.title.trim().replace(/\s+/g, "-");
        router.push(`/m/${result.market.shortcode}-${slug}`);
      } else {
        router.push("/home");
      }
    } catch (error) {
      console.error("Failed to create market:", error);
      alert(error instanceof Error ? error.message : "創建失敗，請重試");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">創建問題</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">題目 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="輸入問題標題"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            rows={4}
            placeholder="輸入問題描述（可選）"
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium mb-2">問題類型 *</label>
          <select
            value={questionType}
            onChange={(e) => {
              setQuestionType(e.target.value as typeof questionType);
              if (e.target.value === "YES_NO") {
                setOptions(["", ""]);
              }
            }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="YES_NO">是非題</option>
            <option value="SINGLE_CHOICE">單選題</option>
            <option value="MULTIPLE_CHOICE">多選題</option>
          </select>
        </div>


        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">分類 *</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="">選擇分類</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Close Date */}
        <div>
          <label className="block text-sm font-medium mb-2">截止時間 *</label>
          <input
            type="datetime-local"
            value={closeDate}
            onChange={(e) => setCloseDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Options (for single/multiple choice) */}
        {questionType !== "YES_NO" && (
          <div>
            <label className="block text-sm font-medium mb-2">選項 *</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                    placeholder={`選項 ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                      刪除
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                + 新增選項
              </button>
            </div>
          </div>
        )}

        {/* Creation Fee */}
        <div>
          <label className="block text-sm font-medium mb-2">創建費用 (G Coin) *</label>
          <select
            value={creationFee}
            onChange={(e) => setCreationFee(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value={100}>100 G Coin</option>
            <option value={1000}>1,000 G Coin</option>
            <option value={10000}>10,000 G Coin</option>
            <option value={100000}>100,000 G Coin</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 border rounded-lg"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            {isCreating ? "創建中..." : "創建問題"}
          </button>
        </div>
      </form>
    </div>
  );
}
