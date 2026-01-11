"use client";

import { useState, useEffect } from "react";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import type { LeaderboardEntry, LeaderboardType } from "../types/leaderboard";
import { getTimeLeft, getSeasonCode, DEFAULT_SEASONS } from "../utils/season";
import { RankBadge } from "./RankBadge";
import { Avatar } from "./Avatar";
import { ScoreDisplay } from "./ScoreDisplay";

interface LeaderboardPageProps {
  initialData: {
    leaderboard: LeaderboardEntry[];
    currentUserRank: LeaderboardEntry | null;
  };
  currentUserId?: string | null;
}

export function LeaderboardPage({ initialData, currentUserId }: LeaderboardPageProps) {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("gods");
  const [selectedSeason, setSelectedSeason] = useState(DEFAULT_SEASONS[0]!.name);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [leaderboard, setLeaderboard] = useState(initialData.leaderboard);
  const [currentUserRank, setCurrentUserRank] = useState(initialData.currentUserRank);
  const [currentSeasonInfo, setCurrentSeasonInfo] = useState<{ name: string; timeLeft: { days: number; hours: number; minutes: number } } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(selectedSeason));

  // Update countdown every minute
  useEffect(() => {
    const timer = setInterval(() => {
      // Use currentSeasonInfo from API if available, otherwise use calculated timeLeft
      if (currentSeasonInfo && selectedSeason === currentSeasonInfo.name) {
        setTimeLeft(currentSeasonInfo.timeLeft);
      } else {
        setTimeLeft(getTimeLeft(selectedSeason));
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [selectedSeason, currentSeasonInfo]);

  // Fetch leaderboard when type or season changes
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const seasonCode = getSeasonCode(selectedSeason);
        const queryParams = new URLSearchParams();
        queryParams.append("type", leaderboardType);
        queryParams.append("timeframe", "season");
        if (seasonCode) queryParams.append("season", seasonCode);
        queryParams.append("limit", "50");
        if (currentUserId) queryParams.append("userId", currentUserId);

        const response = await fetch(`/api/users/leaderboard?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setLeaderboard(data);
            setCurrentUserRank(null);
            setCurrentSeasonInfo(null);
          } else {
            setLeaderboard(data.leaderboard || []);
            // Handle currentUserRank structure: it can be either { rank, entry: {...} } or direct entry object
            let userRank = data.currentUserRank || null;
            if (userRank && userRank.entry) {
              // If it's the nested structure, extract the entry
              userRank = { ...userRank.entry, rank: userRank.rank };
            }
            setCurrentUserRank(userRank);
            // Store current season info if provided by API
            if (data.currentSeason) {
              setCurrentSeasonInfo({
                name: data.currentSeason.name,
                timeLeft: data.currentSeason.timeLeft || getTimeLeft(data.currentSeason.name),
              });
              // Update selected season if it matches current season
              if (selectedSeason !== data.currentSeason.name && getSeasonCode(selectedSeason) === data.currentSeason.code) {
                setSelectedSeason(data.currentSeason.name);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [leaderboardType, selectedSeason, currentUserId]);

  const isLoserBoard = leaderboardType === "losers";

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white relative overflow-x-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% -80%, rgba(255, 140, 0, 0.3) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at -100% 100%, rgba(0, 255, 255, 0.2) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl border-b border-[#FF8C00] bg-[#0A0E27]/95">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <h1 className="text-xl md:text-2xl font-black text-center bg-gradient-to-r from-[#FF8C00] to-[#FFA500] bg-clip-text text-transparent">
            排行榜
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-6 pb-32 md:pb-8">
        {/* Season Selector */}
        <div className="mb-4 md:mb-6">
          <label className="block text-xs font-bold text-[#6B7494] mb-2">當前賽季</label>
          <div className="relative">
            <button
              onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
              className="w-full px-4 py-3 rounded-xl bg-[#00FFFF]/10 border-2 border-[#00FFFF]/40 flex items-center justify-between hover:border-[#00FFFF]/60 transition-colors"
            >
              <span className="text-sm md:text-base font-black text-[#00FFFF]">{selectedSeason}</span>
              <svg
                className={`w-4 h-4 text-[#00FFFF] transition-transform ${showSeasonDropdown ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showSeasonDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#0A0E27]/98 border-2 border-[#00FFFF]/40 shadow-lg z-50">
                {DEFAULT_SEASONS.map((season) => (
                  <button
                    key={season.code}
                    onClick={() => {
                      setSelectedSeason(season.name);
                      setShowSeasonDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left border-b border-[#00FFFF]/10 last:border-b-0 ${
                      selectedSeason === season.name ? "bg-[#00FFFF]/5" : ""
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${
                        selectedSeason === season.name ? "text-[#00FFFF]" : "text-[#B0B8D4]"
                      }`}
                    >
                      {season.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Season Info Banner */}
        <div className="mb-4 md:mb-6 p-4 rounded-xl bg-[#FF8C00]/10 border-2 border-[#FF8C00]/30">
          <p className="text-sm text-[#E0E0FF] mb-2">
            前三名可<span className="font-black text-[#FFD700]">贏取專屬勳章</span>！
          </p>
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-[#FFD700]" />
            <span className="text-xs text-[#B0B8D4]">賽季結束倒計時：</span>
            <span className="text-xs font-black text-[#00FFFF]">
              {timeLeft.days}天 {timeLeft.hours}時 {timeLeft.minutes}分
            </span>
          </div>
          {currentSeasonInfo && (
            <div className="mt-2 pt-2 border-t border-[#FF8C00]/20">
              <span className="text-xs text-[#B0B8D4]">當前賽季：</span>
              <span className="text-xs font-black text-[#00FFFF] ml-1">{currentSeasonInfo.name}</span>
            </div>
          )}
        </div>

        {/* Leaderboard Type Tabs */}
        <div className="mb-4 md:mb-6 grid grid-cols-3 gap-2">
          {[
            { type: "gods" as LeaderboardType, label: "神人榜", emoji: "🏆", color: "FFD700" },
            { type: "whales" as LeaderboardType, label: "鯨魚榜", emoji: "🐋", color: "00F0FF" },
            { type: "losers" as LeaderboardType, label: "衰人榜", emoji: "💀", color: "EF4444" },
          ].map((tab) => {
            const isActive = leaderboardType === tab.type;
            // Convert hex color to RGB for rgba
            const r = parseInt(tab.color.slice(0, 2), 16);
            const g = parseInt(tab.color.slice(2, 4), 16);
            const b = parseInt(tab.color.slice(4, 6), 16);
            
            return (
              <button
                key={tab.type}
                onClick={() => setLeaderboardType(tab.type)}
                className={`px-3 md:px-4 py-2 md:py-3 rounded-xl border-2 transition-all ${
                  isActive ? "" : "bg-[#0B0E1E]/50 border-[#6B7494]/30"
                }`}
                style={
                  isActive
                    ? {
                        background: `rgba(${r}, ${g}, ${b}, 0.2)`,
                        borderColor: `rgba(${r}, ${g}, ${b}, 0.6)`,
                      }
                    : undefined
                }
              >
                <div className="text-xl mb-1">{tab.emoji}</div>
                <div
                  className={`text-xs font-black ${isActive ? "" : "text-[#6B7494]"}`}
                  style={isActive ? { color: `#${tab.color}` } : undefined}
                >
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Table Header */}
        <div className="mb-2 px-4 flex justify-between items-center">
          <span className="text-xs font-bold text-[#6B7494]">玩家</span>
          <div className="flex items-center gap-1">
            <span className="text-xs">💰</span>
            <span className="text-xs font-bold text-[#6B7494]">
              {leaderboardType === "gods" ? "獲利率" : leaderboardType === "whales" ? "盈利" : "虧損"}
            </span>
          </div>
        </div>

        {/* Leaderboard List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00FFFF]"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-20 h-20 mx-auto text-[#6B7494] mb-4" />
            <p className="text-lg font-semibold text-[#6B7494]">暫無排行數據</p>
          </div>
        ) : (
          <div className="space-y-2 mb-24 md:mb-8">
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.id === currentUserId;
              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-xl border-2 ${
                    isCurrentUser
                      ? isLoserBoard
                        ? "bg-[#EF4444]/15 border-[#EF4444]/60"
                        : "bg-[#00FFFF]/15 border-[#00FFFF]/60"
                      : isLoserBoard
                        ? "bg-[#141414]/80 border-[#3C3C3C]/40"
                        : "bg-[#0B0E1E]/50 border-[#6B7494]/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RankBadge rank={entry.rank || 0} isLoserBoard={isLoserBoard} />
                    <Avatar entry={entry} isLoserBoard={isLoserBoard} rank={entry.rank || 0} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white truncate">
                          {entry.displayName || "匿名用戶"}
                        </span>
                        {entry.rank && entry.rank <= 3 && !isLoserBoard && (
                          <Trophy className="w-3 h-3 text-[#FFD700]" />
                        )}
                      </div>
                      {entry.level && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs font-black text-[#00F0FF]">LV. {entry.level}</span>
                          {entry.levelTitle && (
                            <span className="text-xs font-bold text-white">{entry.levelTitle}</span>
                          )}
                        </div>
                      )}
                      {entry.trend && entry.trend !== "same" && !isLoserBoard && (
                        <div className="flex items-center gap-1">
                          {entry.trend === "up" ? (
                            <TrendingUp className="w-2.5 h-2.5 text-[#10B981]" />
                          ) : (
                            <TrendingDown className="w-2.5 h-2.5 text-[#EF4444]" />
                          )}
                          <span
                            className={`text-xs font-bold ${
                              entry.trend === "up" ? "text-[#10B981]" : "text-[#EF4444]"
                            }`}
                          >
                            {entry.trendChange?.toString() || "0"}
                          </span>
                        </div>
                      )}
                    </div>
                    <ScoreDisplay
                      entry={entry}
                      rank={entry.rank || 0}
                      leaderboardType={leaderboardType}
                      isLoserBoard={isLoserBoard}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fixed Current User Card */}
      {currentUserRank && (
        <div className="fixed bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-auto md:max-w-2xl md:mx-auto z-30">
          <div
            className={`p-3 rounded-xl border-2 ${
              isLoserBoard
                ? "bg-[#141414]/95 border-[#EF4444]/50"
                : "bg-[#0A0E27]/90 border-[#00FFFF]/50"
            } shadow-lg`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold ${
                  isLoserBoard ? "text-[#A0A0A0]" : "text-[#00FFFF]"
                }`}
              >
                我的排名
              </span>
              {currentUserRank.trend && currentUserRank.trend !== "same" && !isLoserBoard && (
                <div className="flex items-center gap-1">
                  {currentUserRank.trend === "up" ? (
                    <TrendingUp className="w-2.5 h-2.5 text-[#10B981]" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 text-[#EF4444]" />
                  )}
                  <span
                    className={`text-xs font-bold ${
                      currentUserRank.trend === "up" ? "text-[#10B981]" : "text-[#EF4444]"
                    }`}
                  >
                    {currentUserRank.trendChange?.toString() || "0"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <RankBadge rank={currentUserRank.rank || 0} isLoserBoard={isLoserBoard} size="lg" />
              <Avatar entry={currentUserRank} isLoserBoard={isLoserBoard} rank={currentUserRank.rank || 0} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-white block truncate">
                  {currentUserRank.displayName || "匿名用戶"}
                </span>
                {currentUserRank.level && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs font-black text-[#00F0FF]">LV. {currentUserRank.level}</span>
                    {currentUserRank.levelTitle && (
                      <span className="text-xs font-bold text-white">{currentUserRank.levelTitle}</span>
                    )}
                  </div>
                )}
              </div>
              <ScoreDisplay
                entry={currentUserRank}
                rank={currentUserRank.rank || 0}
                leaderboardType={leaderboardType}
                isLoserBoard={isLoserBoard}
                isFixedCard
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

