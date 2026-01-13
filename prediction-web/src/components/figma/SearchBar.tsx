"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const isComposingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 同步外部 value 變化到內部狀態
  useEffect(() => {
    if (value !== inputValue && !isComposingRef.current) {
      setInputValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // 清理 timeout 當組件卸載時
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    
    // 如果正在使用 IME 輸入（注音等），不立即觸發 onChange
    if (isComposingRef.current) {
      // 清除之前的 timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // 清除之前的 timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 使用防抖來延遲觸發 onChange
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 500); // 500ms 防抖延遲，適合中文輸入
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
    // 清除之前的 timeout，避免在輸入過程中觸發搜尋
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    // IME 輸入完成後，立即觸發 onChange
    const finalValue = e.currentTarget.value;
    setInputValue(finalValue);
    onChange(finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 如果按下 Enter，立即觸發搜尋（不等待防抖）
    if (e.key === 'Enter') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onChange(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onChange('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        placeholder="搜尋市場、關鍵字..."
        className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base bg-white border border-slate-200 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
}
