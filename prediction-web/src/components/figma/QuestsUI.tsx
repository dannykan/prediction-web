"use client";

import { Trophy, Calendar, Target, Gift, Check, Lock, ChevronRight, Users } from 'lucide-react';
import type { QuestsResponse, Quest, DayReward } from '@/features/quests/types/quest';
import { GCoinIcon } from '@/components/GCoinIcon';

interface QuestsUIProps {
  quests: QuestsResponse;
  onClaimDailyDay: (questId: number, dayIndex: number) => void;
  onClaimWeekly: (questId: number) => void;
  onClaimCompletionBonus: () => void;
  onResetQuests: () => void;
  claimingQuestIds: Set<string>;
  isResetting: boolean;
}

export function QuestsUI({
  quests,
  onClaimDailyDay,
  onClaimWeekly,
  onClaimCompletionBonus,
  onResetQuests,
  claimingQuestIds,
  isResetting,
}: QuestsUIProps) {
  // Calculate progress
  const getTotalCompletedDaily = () => {
    let completed = 0;
    for (const quest of quests.dailyQuests) {
      if (quest.days) {
        completed += quest.days.filter(day => day.claimed).length;
      }
    }
    return completed;
  };

  const getTotalDaily = () => {
    let total = 0;
    for (const quest of quests.dailyQuests) {
      if (quest.days) {
        total += quest.days.length;
      }
    }
    return total;
  };

  const getTotalCompletedWeekly = () => {
    return quests.weeklyQuests.filter(q => q.claimed).length;
  };

  const getDayStatus = (day: DayReward) => {
    if (day.claimed) {
      return 'bg-green-500 text-white';
    } else if (day.completed) {
      return 'bg-indigo-500 text-white animate-pulse';
    } else {
      return 'bg-slate-200 text-slate-400';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
      {/* Page Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">任務中心</h1>
        </div>
        <p className="text-sm text-slate-600">完成任務賺取 G Coin 獎勵</p>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 md:p-6 text-white mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm opacity-90">每日任務</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${getTotalDaily() > 0 ? (getTotalCompletedDaily() / getTotalDaily()) * 100 : 0}%` }}
                />
              </div>
              <span className="text-lg font-bold">{getTotalCompletedDaily()}/{getTotalDaily()}</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5" />
              <span className="text-sm opacity-90">每週任務</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all"
                  style={{ width: `${quests.weeklyQuests.length > 0 ? (getTotalCompletedWeekly() / quests.weeklyQuests.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-lg font-bold">{getTotalCompletedWeekly()}/{quests.weeklyQuests.length}</span>
            </div>
          </div>
        </div>

        {/* Completion Bonus */}
        {quests.completionBonusReward > 0 && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                <span className="text-sm opacity-90">完成所有任務獎勵</span>
              </div>
              {quests.completionBonusClaimed ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className="text-sm font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    已領取 +{quests.completionBonusReward}
                  </span>
                </div>
              ) : quests.canClaimCompletionBonus ? (
                <button
                  onClick={onClaimCompletionBonus}
                  disabled={claimingQuestIds.has("completion_bonus")}
                  className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 hover:bg-white/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <span className="text-sm font-bold">
                    {claimingQuestIds.has("completion_bonus") ? "領取中..." : `領取 +${quests.completionBonusReward}`}
                  </span>
                </button>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <span className="text-sm font-bold opacity-70">+{quests.completionBonusReward}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Daily Quests */}
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          每日任務
        </h2>
        <div className="space-y-3">
          {quests.dailyQuests.map((quest) => (
            <div key={quest.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{quest.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm md:text-base mb-1">{quest.title}</h3>
                  <p className="text-xs text-slate-600 mb-2">{quest.description}</p>
                  <div className="flex items-center gap-1">
                    <Gift className="w-4 h-4 text-yellow-600" />
                    <GCoinIcon size={14} />
                    <span className="text-sm font-bold text-slate-900">{quest.reward}</span>
                  </div>
                </div>
              </div>

              {/* 5-day Progress Grid */}
              {quest.days && quest.days.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {quest.days.map((day, index) => {
                    const questKey = `daily_${quest.id}_${index}`;
                    const isClaiming = claimingQuestIds.has(questKey);
                    const canClaim = day.completed && !day.claimed && !isClaiming;
                    
                    return (
                      <div key={index} className="text-center">
                        <div className="text-xs text-slate-500 mb-1">
                          {day.day}
                        </div>
                        <button
                          onClick={() => onClaimDailyDay(quest.id, index)}
                          disabled={!canClaim || isClaiming}
                          className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${getDayStatus(day)} ${
                            canClaim ? 'hover:scale-105 cursor-pointer' : ''
                          } disabled:cursor-not-allowed`}
                        >
                          {day.claimed && <Check className="w-4 h-4" />}
                          {canClaim && !day.claimed && <Gift className="w-4 h-4" />}
                          {!day.completed && !day.claimed && <Lock className="w-4 h-4" />}
                          {isClaiming && <span className="text-xs font-bold">領取中</span>}
                          {!isClaiming && (
                            <span className="text-xs font-bold">
                              {day.claimed ? '已領' : canClaim ? '領取' : day.reward}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Quests */}
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          每週任務
        </h2>
        <div className="space-y-3">
          {quests.weeklyQuests.map((quest) => {
            const isCompleted = quest.progress >= quest.total;
            const isClaimed = quest.claimed === true;
            const canClaim = isCompleted && !isClaimed;
            const questKey = `weekly_${quest.id}`;
            const isClaiming = claimingQuestIds.has(questKey);

            return (
              <div key={quest.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{quest.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm md:text-base mb-1">{quest.title}</h3>
                    <p className="text-xs text-slate-600 mb-3">{quest.description}</p>
                    
                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>進度</span>
                        <span className="font-bold">
                          {quest.progress}/{quest.total}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isCompleted || isClaimed ? 'bg-green-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${Math.min((quest.progress / quest.total) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Reward & Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Gift className="w-4 h-4 text-yellow-600" />
                        <GCoinIcon size={16} />
                        <span className="font-bold text-slate-900">{quest.reward.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      {isClaiming ? (
                        <div className="px-4 py-2 bg-slate-100 text-slate-400 text-sm font-bold rounded-lg flex items-center gap-1">
                          <span>領取中...</span>
                        </div>
                      ) : canClaim ? (
                        <button
                          onClick={() => onClaimWeekly(quest.id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-1"
                        >
                          <Gift className="w-4 h-4" />
                          領取獎勵
                        </button>
                      ) : isClaimed ? (
                        <div className="px-4 py-2 bg-slate-100 text-slate-500 text-sm font-bold rounded-lg flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          已領取
                        </div>
                      ) : (
                        <div className="px-4 py-2 bg-slate-100 text-slate-400 text-sm font-bold rounded-lg flex items-center gap-1">
                          <Lock className="w-4 h-4" />
                          未完成
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
