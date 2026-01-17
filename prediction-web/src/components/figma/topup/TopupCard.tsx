"use client";

import { Check } from "lucide-react";
import { GCoinIcon } from "@/components/GCoinIcon";

interface TopupCardProps {
  gcoins: number;
  price: number;
  isPopular?: boolean;
  isBestValue?: boolean;
  bonusPercent?: number;
  onSelect: () => void;
}

export function TopupCard({ 
  gcoins, 
  price, 
  isPopular, 
  isBestValue, 
  bonusPercent,
  onSelect 
}: TopupCardProps) {
  return (
    <div 
      onClick={onSelect}
      className={`relative bg-white rounded-2xl p-5 md:p-6 border-2 transition-all cursor-pointer hover:scale-105 hover:shadow-xl ${
        isBestValue 
          ? "border-indigo-500 shadow-lg shadow-indigo-100" 
          : "border-slate-200 hover:border-indigo-300"
      }`}
    >
      {/* Badge */}
      {(isPopular || isBestValue) && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
          isBestValue 
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" 
            : "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
        }`}>
          {isBestValue ? "🔥 超值推薦" : "⭐ 人氣方案"}
        </div>
      )}

      {/* Bonus Badge */}
      {bonusPercent && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
          +{bonusPercent}%
        </div>
      )}

      {/* G Coin Amount */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <GCoinIcon size={48} priority={false} />
        <div className="text-3xl md:text-4xl font-bold text-slate-900">
          {gcoins.toLocaleString()}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-4" />

      {/* Price */}
      <div className="text-center mb-4">
        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          NT$ {price}
        </div>
      </div>

      {/* Button */}
      <button className={`w-full py-3 rounded-xl font-semibold text-sm md:text-base transition-all ${
        isBestValue
          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}>
        選擇方案
      </button>

      {/* Features (optional) */}
      {isBestValue && (
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-indigo-600">
          <Check className="w-3.5 h-3.5" />
          <span>最划算的選擇</span>
        </div>
      )}
    </div>
  );
}
