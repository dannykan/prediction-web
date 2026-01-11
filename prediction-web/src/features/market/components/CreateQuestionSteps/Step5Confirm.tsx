"use client";

import type { QuestionType, Answer, TierConfig } from "../../types/create-question";
import type { Category } from "../../api/getCategoriesClient";

interface Step5ConfirmProps {
  questionType: QuestionType | null;
  title: string;
  description: string;
  closeDate: string;
  categories: Category[];
  selectedCategoryIds: string[];
  answers: Answer[];
  selectedTierConfig: TierConfig | null;
  selectedTier: number | null;
  selectedPredictions: number[];
  betAmount: number;
  betAmountPerAnswer: number;
  uploadedImageUrl: string | null;
}

export function Step5Confirm({
  questionType,
  title,
  description,
  closeDate,
  categories,
  selectedCategoryIds,
  answers,
  selectedTierConfig,
  selectedTier,
  selectedPredictions,
  betAmount,
  betAmountPerAnswer,
  uploadedImageUrl,
}: Step5ConfirmProps) {
  const selectedCategory = categories.find((c) => selectedCategoryIds.includes(c.id));

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleString("zh-TW");
    } catch {
      return dateStr;
    }
  };

  const getQuestionTypeLabel = () => {
    switch (questionType) {
      case "binary":
        return "是非題";
      case "single":
        return "單選題";
      case "multiple":
        return "多選題";
      default:
        return "";
    }
  };

  const getQuestionTypeEmoji = () => {
    switch (questionType) {
      case "binary":
        return "✅";
      case "single":
        return "🎲";
      case "multiple":
        return "🎯";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center mb-4 md:mb-6">
        <div className="text-4xl md:text-5xl mb-2 md:mb-3">🎉</div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">確認創建</h2>
        <p className="text-sm md:text-base text-gray-400">請確認以下資訊無誤</p>
      </div>

      {/* Image Preview */}
      {uploadedImageUrl && (
        <div className="rounded-lg overflow-hidden">
          <img src={uploadedImageUrl} alt="Preview" className="w-full h-48 object-cover" />
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-lg bg-[#0B0E1E]/50 border border-cyan-500/30 overflow-hidden">
        {/* Question Type Header */}
        <div className="px-5 py-3 bg-cyan-500/20 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getQuestionTypeEmoji()}</span>
            <span className="font-bold">{getQuestionTypeLabel()}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 md:p-5 space-y-3 md:space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">題目標題</p>
            <p className="font-bold">{title}</p>
          </div>

          {selectedCategory && (
            <div>
              <p className="text-xs text-gray-500 mb-1">題目分類</p>
              <div className="flex items-center gap-2">
                {selectedCategory.iconUrl ? (
                  <img src={selectedCategory.iconUrl} alt="" className="w-4 h-4" />
                ) : (
                  <span>📌</span>
                )}
                <span className="font-bold">{selectedCategory.name}</span>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-1">截止日期</p>
            <p className="font-bold">{formatDate(closeDate)}</p>
          </div>

          {questionType !== "binary" && (
            <div>
              <p className="text-xs text-gray-500 mb-1">答案選項</p>
              <ul className="space-y-1">
                {answers.map((answer) => (
                  <li key={answer.id} className="text-gray-300">
                    • {answer.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedTierConfig && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-xs text-gray-500 mb-1">創建級別</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedTierConfig.emoji}</span>
                  <span className="font-bold">{selectedTierConfig.name}</span>
                  <span className="text-yellow-400">
                    {selectedTier?.toLocaleString()} <span className="text-sm">G</span>
                  </span>
                </div>
                <span className="text-sm text-yellow-400">返佣: {selectedTierConfig.commissionRate}%</span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-xs text-gray-500 mb-1">你的預測</p>
            {questionType === "binary" ? (
              <div className="flex justify-between items-center">
                <span className="font-bold text-yellow-400">
                  {selectedPredictions.includes(1) ? "YES" : "NO"}
                </span>
                <span className="font-bold text-yellow-400">
                  {betAmount.toLocaleString()} <span className="text-sm">G</span>
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedPredictions.map((id) => {
                  const answer = answers.find((a) => a.id === id);
                  return (
                    <div key={id} className="flex justify-between items-center">
                      <span className="font-bold text-yellow-400">{answer?.text}</span>
                      <span className="font-bold text-yellow-400">
                        {betAmountPerAnswer.toLocaleString()} <span className="text-sm">G</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-lg bg-[#0B0E1E]/50 border border-cyan-500/30 p-3 md:p-5">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>創建費用</span>
            <span className="font-bold">
              {selectedTier?.toLocaleString()} <span className="text-sm">G</span>
            </span>
          </div>
          <div className="pl-4 flex justify-between text-sm text-gray-400">
            <span>初始流動性</span>
            <span>
              {selectedTier ? Math.round(selectedTier * 0.5).toLocaleString() : 0} <span className="text-sm">G</span>
            </span>
          </div>
          <div className="pl-4 flex justify-between text-sm text-gray-400">
            <span>首次下注</span>
            <span>
              {betAmount.toLocaleString()} <span className="text-sm">G</span>
            </span>
          </div>
          <div className="pt-3 border-t border-gray-600/30 flex justify-between font-bold">
            <span>實際扣除</span>
            <span className="text-red-400">
              -{selectedTier?.toLocaleString()} <span className="text-sm">G</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

