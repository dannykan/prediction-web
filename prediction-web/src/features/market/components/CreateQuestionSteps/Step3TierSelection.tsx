"use client";

import type { TierConfig } from "../../types/create-question";

interface Step3TierSelectionProps {
  tiers: TierConfig[];
  selectedTier: number | null;
  onSelectTier: (tier: number) => void;
  userBalance: number;
}

export function Step3TierSelection({ tiers, selectedTier, onSelectTier, userBalance }: Step3TierSelectionProps) {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2">選擇創建級別</h2>
        <p className="text-sm md:text-base text-gray-400">投入越高，返傭比例越高</p>
      </div>

      {/* User Balance */}
      <div className="p-3 md:p-4 rounded-lg bg-[#0B0E1E]/50 border border-gray-600/30">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">可用餘額</span>
          <span className="text-xl font-bold text-yellow-400">
            {userBalance.toLocaleString()} <span className="text-sm">G</span>
          </span>
        </div>
      </div>

      {/* Tier Cards */}
      {tiers.map((tier) => {
        const isSelected = selectedTier === tier.value;
        const canAfford = userBalance >= tier.value;
        const commissionIncrease = tier.commissionRate - 1.5;

        return (
          <button
            key={tier.value}
            onClick={() => canAfford && onSelectTier(tier.value)}
            disabled={!canAfford}
            className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all text-left ${
              isSelected
                ? "bg-yellow-500/20 border-yellow-500"
                : canAfford
                  ? "bg-[#0B0E1E]/50 border-gray-600/30 hover:border-gray-500/50"
                  : "bg-[#0B0E1E]/30 border-gray-600/20 opacity-40 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tier.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{tier.name}</h3>
                    {tier.highlight && (
                      <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                        {tier.highlight}
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-yellow-400 mt-1">
                    {tier.value.toLocaleString()} <span className="text-sm">G</span>
                  </p>
                </div>
              </div>
              {isSelected && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>

            {/* Commission Rate */}
            <div className="p-3 rounded-lg bg-yellow-500/15 border border-yellow-500/30 mb-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-yellow-400">返佣比例</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-400">{tier.commissionRate}%</span>
                  {commissionIncrease > 0 && (
                    <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-bold">
                      +{commissionIncrease}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {tier.stats && (
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <span>📊</span> {tier.stats}
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-gray-600/30 flex justify-between text-xs text-gray-500">
              <span>預期回本交易量</span>
              <span className="text-gray-400">{tier.breakEvenVolume.toLocaleString()} G</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

