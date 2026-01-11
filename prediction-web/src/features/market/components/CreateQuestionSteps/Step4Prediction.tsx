"use client";

import type { QuestionType, Answer } from "../../types/create-question";

interface Step4PredictionProps {
  questionType: QuestionType | null;
  answers: Answer[];
  selectedPredictions: number[];
  onSelectPrediction: (id: number) => void;
  betAmount: number;
  betAmountPerAnswer: number;
}

export function Step4Prediction({
  questionType,
  answers,
  selectedPredictions,
  onSelectPrediction,
  betAmount,
  betAmountPerAnswer,
}: Step4PredictionProps) {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2">選擇你的預測</h2>
        <p className="text-sm md:text-base text-gray-400">系統將自動用創建費的50%下注你的預測</p>
      </div>

      {/* Auto Bet Amount */}
      <div className="p-3 md:p-4 rounded-lg bg-cyan-500/15 border border-cyan-500/30">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-cyan-400">自動下注金額</span>
          <span className="text-xl font-bold text-cyan-400">
            {betAmount.toLocaleString()} <span className="text-sm">G</span>
          </span>
        </div>
      </div>

      {/* Binary Options */}
      {questionType === "binary" && (
        <>
          <button
            onClick={() => onSelectPrediction(1)}
            className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all text-left ${
              selectedPredictions.includes(1)
                ? "bg-cyan-500/20 border-cyan-500"
                : "bg-[#0B0E1E]/50 border-gray-600/30 hover:border-gray-500/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPredictions.includes(1) ? "bg-cyan-500 border-cyan-500" : "border-gray-500"
                  }`}
                >
                  {selectedPredictions.includes(1) && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">YES</h3>
                  <p className="text-sm text-gray-400">我預測會發生</p>
                </div>
              </div>
              {selectedPredictions.includes(1) && (
                <span className="text-lg font-bold text-cyan-400">
                  {betAmount.toLocaleString()} <span className="text-sm">G</span>
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => onSelectPrediction(2)}
            className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all text-left ${
              selectedPredictions.includes(2)
                ? "bg-purple-500/20 border-purple-500"
                : "bg-[#0B0E1E]/50 border-gray-600/30 hover:border-gray-500/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPredictions.includes(2) ? "bg-purple-500 border-purple-500" : "border-gray-500"
                  }`}
                >
                  {selectedPredictions.includes(2) && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold">NO</h3>
                  <p className="text-sm text-gray-400">我預測不會發生</p>
                </div>
              </div>
              {selectedPredictions.includes(2) && (
                <span className="text-lg font-bold text-purple-400">
                  {betAmount.toLocaleString()} <span className="text-sm">G</span>
                </span>
              )}
            </div>
          </button>
        </>
      )}

      {/* Single/Multiple Choice Options */}
      {(questionType === "single" || questionType === "multiple") && (
        <>
          {answers.map((answer, index) => {
            const isSelected = selectedPredictions.includes(answer.id);
            const letter = String.fromCharCode(65 + index); // A, B, C, ...

              return (
                <button
                  key={answer.id}
                  onClick={() => onSelectPrediction(answer.id)}
                  className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "bg-purple-500/20 border-purple-500"
                    : "bg-[#0B0E1E]/50 border-gray-600/30 hover:border-gray-500/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "bg-purple-500 border-purple-500" : "border-gray-500"
                      }`}
                    >
                      {isSelected ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold">{letter}</span>
                      )}
                    </div>
                    <span className="text-base font-medium">{answer.text || `選項 ${index + 1}`}</span>
                  </div>
                  {isSelected && (
                    <span className="text-lg font-bold text-yellow-400">
                      {betAmountPerAnswer.toLocaleString()} <span className="text-sm">G</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {questionType === "multiple" && selectedPredictions.length > 1 && (
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-sm text-gray-300">
              <p>
                你的 {betAmount.toLocaleString()} G 將平均分配到 {selectedPredictions.length} 個選項，每個{" "}
                {betAmountPerAnswer.toLocaleString()} G
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

