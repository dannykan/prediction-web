import { CheckSquare, Bell, Trophy, TrendingUp } from 'lucide-react';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';

interface MobileUserStatsProps {
  user: {
    name: string;
    totalAssets: number;
    totalInvested: number;
    profitRate: number;
    dailyQuests: number;
    unclaimedRewards: number;
  };
}

export function MobileUserStats({ user }: MobileUserStatsProps) {
  const hasNewQuests = user.dailyQuests > 0;
  const hasNewRewards = user.unclaimedRewards > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2.5 sm:p-3">
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Total Assets */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-2 sm:p-2.5 border border-amber-200">
          <img src={gcoinImage} alt="G coin" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-slate-600">總資產</p>
            <p className="font-bold text-amber-600 text-xs sm:text-sm truncate">{user.totalAssets.toLocaleString()}</p>
          </div>
        </div>

        {/* Profit Rate */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 sm:p-2.5 border border-green-200">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-slate-600">勝率</p>
            <p className="font-bold text-green-600 text-xs sm:text-sm truncate">{user.profitRate}%</p>
          </div>
        </div>

        {/* Quests */}
        <button className="relative flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-2 sm:p-2.5 border border-indigo-200 hover:border-indigo-300 transition-colors">
          <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 flex-shrink-0" />
          <div className="min-w-0 text-left flex-1">
            <p className="text-[10px] sm:text-xs text-slate-600">任務</p>
            <p className="font-bold text-indigo-600 text-xs sm:text-sm truncate">{user.dailyQuests} 個待完成</p>
          </div>
          {hasNewQuests && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {/* Rewards */}
        <button className="relative flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-2 sm:p-2.5 border border-rose-200 hover:border-rose-300 transition-colors">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 flex-shrink-0" />
          <div className="min-w-0 text-left flex-1">
            <p className="text-[10px] sm:text-xs text-slate-600">獎勵</p>
            <p className="font-bold text-rose-600 text-xs sm:text-sm truncate">{user.unclaimedRewards} 個待領取</p>
          </div>
          {hasNewRewards && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>
    </div>
  );
}