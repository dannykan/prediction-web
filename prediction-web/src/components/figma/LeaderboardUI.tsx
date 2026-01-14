"use client";

import { Trophy, Crown, Medal, Award, Skull, Coins, TrendingUp, Minus } from 'lucide-react';
import type { LeaderboardEntry } from '@/features/leaderboard/types/leaderboard';
import { GCoinIcon } from '@/components/GCoinIcon';
import { DEFAULT_SEASONS } from '@/features/leaderboard/utils/season';

type LeaderboardUIType = 'profit_rate' | 'profit_amount' | 'loss_amount';

interface LeaderboardUIProps {
  leaderboardType: LeaderboardUIType;
  onTypeChange: (type: LeaderboardUIType) => void;
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
  leaderboard: LeaderboardEntry[];
  currentUserRank: LeaderboardEntry | null;
  currentUserId?: string | null;
  timeUntilEnd: { days: number; hours: number; minutes: number };
  isLoading?: boolean;
  onRefresh: () => Promise<void>;
}

export function LeaderboardUI({
  leaderboardType,
  onTypeChange,
  selectedSeason,
  onSeasonChange,
  leaderboard,
  currentUserRank,
  currentUserId,
  timeUntilEnd,
  isLoading = false,
  onRefresh,
}: LeaderboardUIProps) {
  const currentSeason = DEFAULT_SEASONS.find(s => s.name === selectedSeason);
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 md:w-7 md:h-7 text-slate-400" />;
    if (rank === 3) return <Award className="w-6 h-6 md:w-7 md:h-7 text-amber-600" />;
    return (
      <div className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-slate-600 font-bold text-sm md:text-base">
        #{rank}
      </div>
    );
  };

  const getScoreDisplay = (entry: LeaderboardEntry) => {
    if (leaderboardType === 'profit_rate') {
      const profitRate = entry.profitRate ?? 0;
      const isPositive = profitRate >= 0;
      return (
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
          {isPositive ? '+' : ''}{profitRate.toFixed(1)}%
        </span>
      );
    } else if (leaderboardType === 'profit_amount') {
      const pnl = entry.pnl ?? 0;
      return (
        <div className="flex items-center gap-1">
          <GCoinIcon size={16} />
          <span className="text-green-600">+{Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      );
    } else {
      const loss = entry.loss ?? entry.totalLosses ?? 0;
      return (
        <div className="flex items-center gap-1">
          <GCoinIcon size={16} />
          <span className="text-red-600">-{Math.abs(loss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
      {/* Page Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">排行榜</h1>
        </div>
        <p className="text-sm text-slate-600">與頂尖預測者一較高下</p>
      </div>

      {/* Season Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
        <select
          value={selectedSeason}
          onChange={(e) => onSeasonChange(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          {DEFAULT_SEASONS.map((season) => (
            <option key={season.code} value={season.name}>
              {season.name}
            </option>
          ))}
        </select>
      </div>

      {/* Season Info Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3 md:p-4 text-white mb-4">
        <h2 className="text-lg md:text-xl font-bold mb-2">{currentSeason?.name || selectedSeason}</h2>
        
        {/* Rewards in one row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Crown className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-xs opacity-90">第一名</span>
            </div>
            <div className="flex items-center justify-center gap-0.5 md:gap-1">
              <span
                className="inline-block w-3 h-3 md:w-3.5 md:h-3.5"
                style={{
                  backgroundImage: "url('/images/G_coin_icon.png')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
                aria-label="G Coin"
              />
              <span className="font-bold text-xs md:text-sm">50,000</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Medal className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-xs opacity-90">第二名</span>
            </div>
            <div className="flex items-center justify-center gap-0.5 md:gap-1">
              <span
                className="inline-block w-3 h-3 md:w-3.5 md:h-3.5"
                style={{
                  backgroundImage: "url('/images/G_coin_icon.png')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
                aria-label="G Coin"
              />
              <span className="font-bold text-xs md:text-sm">30,000</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="text-xs opacity-90">第三名</span>
            </div>
            <div className="flex items-center justify-center gap-0.5 md:gap-1">
              <span
                className="inline-block w-3 h-3 md:w-3.5 md:h-3.5"
                style={{
                  backgroundImage: "url('/images/G_coin_icon.png')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
                aria-label="G Coin"
              />
              <span className="font-bold text-xs md:text-sm">15,000</span>
            </div>
          </div>
        </div>

        <div className="text-center py-2 bg-white/10 backdrop-blur-sm rounded-lg">
          <p className="text-xs md:text-sm opacity-90 mb-0.5">賽季結束倒計時</p>
          <p className="text-lg md:text-xl font-bold">
            {timeUntilEnd.days} 天 {timeUntilEnd.hours} 小時 {timeUntilEnd.minutes} 分鐘
          </p>
        </div>
      </div>

      {/* Leaderboard Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 mb-4">
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => onTypeChange('profit_rate')}
            className={`py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${
              leaderboardType === 'profit_rate'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs md:text-sm">神人榜</span>
            </div>
          </button>
          <button
            onClick={() => onTypeChange('profit_amount')}
            className={`py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${
              leaderboardType === 'profit_amount'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <Coins className="w-4 h-4" />
              <span className="text-xs md:text-sm">鯨魚榜</span>
            </div>
          </button>
          <button
            onClick={() => onTypeChange('loss_amount')}
            className={`py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${
              leaderboardType === 'loss_amount'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <Skull className="w-4 h-4" />
              <span className="text-xs md:text-sm">衰人榜</span>
            </div>
          </button>
        </div>
      </div>

      {/* Leaderboard List */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
          <div className="text-center">
            <Trophy className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 font-medium">暫無排行數據</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.id === currentUserId;
              return (
                <div
                  key={entry.id}
                  className={`p-2.5 md:p-3 hover:bg-slate-50 transition-colors ${
                    entry.rank && entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''
                  } ${isCurrentUser ? 'bg-indigo-50' : ''}`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    {/* Rank Icon */}
                    <div className="flex-shrink-0">
                      {getRankIcon(entry.rank || 0)}
                    </div>

                    {/* User Avatar */}
                    {entry.avatarUrl && entry.avatarUrl.trim() !== '' ? (
                      <img
                        src={entry.avatarUrl}
                        alt={entry.displayName || 'User'}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm md:text-base font-bold flex-shrink-0">
                        {(entry.displayName || 'U')[0]?.toUpperCase()}
                      </div>
                    )}

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm md:text-base truncate">
                        {entry.displayName || '匿名用戶'}
                      </h3>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0">
                      <div className="font-bold text-sm md:text-base">
                        {getScoreDisplay(entry)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
