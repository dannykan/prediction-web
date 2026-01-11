"use client";

import { useState, useRef } from "react";
import type { QuestionType, Answer } from "../../types/create-question";
import type { Category } from "../../api/getCategoriesClient";

interface Step2BasicInfoProps {
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  closeDate: string;
  onCloseDateChange: (date: string) => void;
  categories: Category[];
  selectedCategoryIds: string[];
  onCategoryToggle: (categoryId: string) => void;
  questionType: QuestionType | null;
  answers: Answer[];
  onAnswersChange: (answers: Answer[]) => void;
  nextAnswerId: number;
  onNextAnswerIdChange: (id: number) => void;
  imageFile: File | null;
  uploadedImageUrl: string | null;
  isUploadingImage: boolean;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
}

export function Step2BasicInfo({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  closeDate,
  onCloseDateChange,
  categories,
  selectedCategoryIds,
  onCategoryToggle,
  questionType,
  answers,
  onAnswersChange,
  nextAnswerId,
  onNextAnswerIdChange,
  imageFile,
  uploadedImageUrl,
  isUploadingImage,
  onImageUpload,
  onImageRemove,
}: Step2BasicInfoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const addAnswer = () => {
    onAnswersChange([...answers, { id: nextAnswerId, text: "" }]);
    onNextAnswerIdChange(nextAnswerId + 1);
  };

  const removeAnswer = (id: number) => {
    if (answers.length > 2) {
      onAnswersChange(answers.filter((a) => a.id !== id));
    }
  };

  const updateAnswer = (id: number, text: string) => {
    onAnswersChange(answers.map((a) => (a.id === id ? { ...a, text } : a)));
  };

  // Format date for input (yyyy-MM-ddTHH:mm)
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCloseDateChange(e.target.value);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2">填寫題目內容</h2>
        <p className="text-sm md:text-base text-gray-400">清晰明確的題目更容易吸引參與</p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-bold mb-2">
          題目標題 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={30}
          placeholder="例如：2025年哪個AI模型會最受歡迎？"
          className="w-full px-4 py-3 rounded-lg bg-[#0B0E1E]/50 border border-gray-600/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />
        <div className="text-right text-xs text-gray-500 mt-1">{title.length}/30</div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-bold mb-2">
          題目分類 <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {categories.map((category) => {
            const isSelected = selectedCategoryIds.includes(category.id);
            return (
              <button
                key={category.id}
                onClick={() => onCategoryToggle(category.id)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-500"
                    : "bg-[#0B0E1E]/50 border-gray-600/30 hover:border-gray-500/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {category.iconUrl ? (
                    <img src={category.iconUrl} alt="" className="w-4 h-4" />
                  ) : (
                    <span>📌</span>
                  )}
                  <span className="text-sm font-medium flex-1 truncate">{category.name}</span>
                  {isSelected && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Close Date */}
      <div>
        <label className="block text-sm font-bold mb-2">
          截止日期 <span className="text-red-400">*</span>
        </label>
        <input
          type="datetime-local"
          value={formatDateForInput(closeDate)}
          onChange={handleDateChange}
          min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)} // 1 hour from now
          max={new Date(Date.now() + 365 * 24 * 3600000).toISOString().slice(0, 16)} // 1 year from now
          className="w-full px-4 py-3 rounded-lg bg-[#0B0E1E]/50 border border-gray-600/30 text-white focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-bold mb-2">題目配圖</label>
        {uploadedImageUrl ? (
          <div className="relative">
            <img src={uploadedImageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            <button
              onClick={onImageRemove}
              className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-500/90 flex items-center justify-center hover:bg-red-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 rounded-lg bg-[#0B0E1E]/50 border-2 border-dashed border-gray-600/30 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors"
          >
            {isUploadingImage ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-400">上傳中...</p>
              </div>
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mb-2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <p className="text-sm text-gray-400">點擊上傳配圖</p>
                <p className="text-xs text-gray-500 mt-1">建議尺寸：1200×675 (16:9) | 最大：5MB</p>
              </>
            )}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold mb-2">詳細資訊</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="提供關於你的題目的背景或詳細資訊..."
          className="w-full px-4 py-3 rounded-lg bg-[#0B0E1E]/50 border border-gray-600/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
        />
        <div className="text-right text-xs text-gray-500 mt-1">{description.length}/1000</div>
      </div>

      {/* Answers (for single/multiple choice) */}
      {questionType !== "binary" && (
        <div>
          <label className="block text-sm font-bold mb-2">
            答案選項 <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {answers.map((answer, index) => (
              <div key={answer.id} className="flex gap-2">
                <input
                  type="text"
                  value={answer.text}
                  onChange={(e) => updateAnswer(answer.id, e.target.value)}
                  maxLength={20}
                  placeholder={`選項 ${index + 1}`}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#0B0E1E]/50 border border-gray-600/30 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
                {answers.length > 2 && (
                  <button
                    onClick={() => removeAnswer(answer.id)}
                    className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    刪除
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addAnswer}
              className="w-full py-2 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            >
              + 添加選項 (目前 {answers.length} 個)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

