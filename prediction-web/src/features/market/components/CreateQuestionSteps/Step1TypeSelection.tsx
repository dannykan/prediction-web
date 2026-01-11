"use client";

import type { QuestionType } from "../../types/create-question";

interface Step1TypeSelectionProps {
  questionType: QuestionType | null;
  onSelectType: (type: QuestionType) => void;
}

export function Step1TypeSelection({ questionType, onSelectType }: Step1TypeSelectionProps) {
  const types: Array<{ type: QuestionType; emoji: string; title: string; description: string; color: string }> = [
    {
      type: "binary",
      emoji: "✅",
      title: "是非題",
      description: "只有兩種結果：Yes 或 No",
      color: "cyan",
    },
    {
      type: "single",
      emoji: "🎲",
      title: "單選題",
      description: "多個選項，只有一個正確答案",
      color: "yellow",
    },
    {
      type: "multiple",
      emoji: "🎯",
      title: "多選題",
      description: "多個選項，可以有多個正確答案",
      color: "purple",
    },
  ];

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2">選擇題目類型</h2>
        <p className="text-sm md:text-base text-gray-400">不同類型適合不同的預測場景</p>
      </div>

      {types.map((type) => (
        <button
          key={type.type}
          onClick={() => onSelectType(type.type)}
          className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all text-left ${
            questionType === type.type
              ? type.color === "cyan"
                ? "bg-cyan-500/20 border-cyan-500"
                : type.color === "yellow"
                  ? "bg-yellow-500/20 border-yellow-500"
                  : "bg-purple-500/20 border-purple-500"
              : "bg-[#0B0E1E]/50 border-gray-600/30 hover:border-gray-500/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">{type.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold">{type.title}</h3>
                {questionType === type.type && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-gray-400">{type.description}</p>
            </div>
          </div>
        </button>
      ))}

      {/* Creator Rules Warning */}
      <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/40">
        <div className="flex items-start gap-3">
          <span className="text-red-400">⚠️</span>
          <div className="flex-1 space-y-2 text-sm">
            <h4 className="font-bold text-red-400">創建者須知</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• 截止時間後 24小時內 必須提交正確答案</li>
              <li>• 未按時提交答案將 取消創建資格 並扣除押金</li>
              <li>• 答案必須 誠實準確，官方系統將進行驗證</li>
              <li>• 建議創建 可公開查證 的題目（如新聞、數據等）</li>
              <li>• 若被檢舉或內容違規，將 取消創建資格</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

