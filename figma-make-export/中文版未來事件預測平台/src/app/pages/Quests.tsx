import { useState } from 'react';
import { Trophy, Calendar, Target, Gift, Check, Lock, ChevronRight, Users } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { MobileHeader } from '../components/MobileHeader';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';

type QuestStatus = 'incomplete' | 'completed' | 'claimed';

interface DailyQuest {
  id: string;
  icon: typeof Calendar;
  title: string;
  description: string;
  reward: number;
  progress: Record<number, QuestStatus>; // 0-4 for 5 days
}

interface WeeklyQuest {
  id: string;
  icon: typeof Trophy;
  title: string;
  description: string;
  reward: number;
  current: number;
  target: number;
  status: QuestStatus;
}

export default function Quests() {
  const [isLoggedIn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRewardBanner, setShowRewardBanner] = useState(false);
  const [lastReward, setLastReward] = useState(0);

  const mockUser = {
    name: '神預測玩家',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    totalAssets: 15000,
    totalInvested: 8500,
    profitRate: 76.5,
    dailyQuests: 3,
    weeklyQuests: 5,
    unclaimedRewards: 2,
    followedMarkets: 12,
    inviteCode: 'PRED2026'
  };

  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([
    {
      id: 'daily_trade',
      icon: Target,
      title: '每日交易',
      description: '進行至少 1 筆交易',
      reward: 50,
      progress: {
        0: 'claimed',
        1: 'claimed',
        2: 'completed',
        3: 'incomplete',
        4: 'incomplete',
      },
    },
    {
      id: 'daily_comment',
      icon: Calendar,
      title: '每日評論',
      description: '在任意市場發表評論',
      reward: 30,
      progress: {
        0: 'claimed',
        1: 'completed',
        2: 'incomplete',
        3: 'incomplete',
        4: 'incomplete',
      },
    },
  ]);

  const [weeklyQuests, setWeeklyQuests] = useState<WeeklyQuest[]>([
    {
      id: 'weekly_trades',
      icon: Trophy,
      title: '本週交易達人',
      description: '完成 10 筆交易',
      reward: 500,
      current: 7,
      target: 10,
      status: 'incomplete',
    },
    {
      id: 'weekly_profit',
      icon: Gift,
      title: '獲利目標',
      description: '本週累計獲利達 1,000 G Coin',
      reward: 300,
      current: 1200,
      target: 1000,
      status: 'completed',
    },
    {
      id: 'weekly_invite',
      icon: Users,
      title: '邀請好友',
      description: '邀請 3 位新朋友加入',
      reward: 1000,
      current: 1,
      target: 3,
      status: 'incomplete',
    },
  ]);

  const handleClaimDaily = (questId: string, day: number) => {
    setDailyQuests(quests =>
      quests.map(q => {
        if (q.id === questId && q.progress[day] === 'completed') {
          setLastReward(q.reward);
          setShowRewardBanner(true);
          setTimeout(() => setShowRewardBanner(false), 3000);
          return {
            ...q,
            progress: { ...q.progress, [day]: 'claimed' },
          };
        }
        return q;
      })
    );
  };

  const handleClaimWeekly = (questId: string) => {
    setWeeklyQuests(quests =>
      quests.map(q => {
        if (q.id === questId && q.status === 'completed') {
          setLastReward(q.reward);
          setShowRewardBanner(true);
          setTimeout(() => setShowRewardBanner(false), 3000);
          return { ...q, status: 'claimed' };
        }
        return q;
      })
    );
  };

  const handleResetQuests = () => {
    setDailyQuests(quests =>
      quests.map(q => ({
        ...q,
        progress: {
          0: 'incomplete',
          1: 'incomplete',
          2: 'incomplete',
          3: 'incomplete',
          4: 'incomplete',
        },
      }))
    );
    setWeeklyQuests(quests =>
      quests.map(q => ({
        ...q,
        current: 0,
        status: 'incomplete',
      }))
    );
  };

  const getTotalCompletedDaily = () => {
    return dailyQuests.reduce((total, quest) => {
      return total + Object.values(quest.progress).filter(s => s === 'claimed').length;
    }, 0);
  };

  const getTotalCompletedWeekly = () => {
    return weeklyQuests.filter(q => q.status === 'claimed').length;
  };

  const getDayStatus = (status: QuestStatus) => {
    if (status === 'claimed') {
      return 'bg-green-500 text-white';
    } else if (status === 'completed') {
      return 'bg-indigo-500 text-white animate-pulse';
    } else {
      return 'bg-slate-200 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isLoggedIn={isLoggedIn}
        user={mockUser}
      />

      <div className="flex w-full">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isLoggedIn={isLoggedIn}
          user={mockUser}
          onLogin={() => {}}
          onLogout={() => {}}
        />

        <main className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0">
          <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
            {/* Reward Banner */}
            {showRewardBanner && (
              <div className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 shadow-lg animate-bounce">
                <div className="flex items-center gap-3">
                  <Gift className="w-6 h-6" />
                  <div className="flex-1">
                    <p className="font-bold">恭喜！領取獎勵成功</p>
                    <div className="flex items-center gap-1 mt-1">
                      <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
                      <span className="text-lg font-bold">+{lastReward.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                        style={{ width: `${(getTotalCompletedDaily() / (dailyQuests.length * 5)) * 100}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold">{getTotalCompletedDaily()}/{dailyQuests.length * 5}</span>
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
                        style={{ width: `${(getTotalCompletedWeekly() / weeklyQuests.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold">{getTotalCompletedWeekly()}/{weeklyQuests.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Quests */}
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                每日任務
              </h2>
              <div className="space-y-3">
                {dailyQuests.map((quest) => (
                  <div key={quest.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <quest.icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm md:text-base mb-1">{quest.title}</h3>
                        <p className="text-xs text-slate-600 mb-2">{quest.description}</p>
                        <div className="flex items-center gap-1">
                          <Gift className="w-4 h-4 text-yellow-600" />
                          <img src={gcoinImage} alt="G coin" className="w-3.5 h-3.5" />
                          <span className="text-sm font-bold text-slate-900">{quest.reward}</span>
                        </div>
                      </div>
                    </div>

                    {/* 5-day Progress Grid */}
                    <div className="grid grid-cols-5 gap-2">
                      {[0, 1, 2, 3, 4].map((day) => {
                        const status = quest.progress[day];
                        return (
                          <div key={day} className="text-center">
                            <div className={`text-xs text-slate-500 mb-1`}>
                              Day {day + 1}
                            </div>
                            <button
                              onClick={() => handleClaimDaily(quest.id, day)}
                              disabled={status !== 'completed'}
                              className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${getDayStatus(status)} ${
                                status === 'completed' ? 'hover:scale-105 cursor-pointer' : ''
                              } disabled:cursor-not-allowed`}
                            >
                              {status === 'claimed' && <Check className="w-4 h-4" />}
                              {status === 'completed' && <Gift className="w-4 h-4" />}
                              {status === 'incomplete' && <Lock className="w-4 h-4" />}
                              <span className="text-xs font-bold">
                                {status === 'claimed' ? '已領' : status === 'completed' ? '領取' : quest.reward}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
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
                {weeklyQuests.map((quest) => (
                  <div key={quest.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <quest.icon className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm md:text-base mb-1">{quest.title}</h3>
                        <p className="text-xs text-slate-600 mb-3">{quest.description}</p>
                        
                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                            <span>進度</span>
                            <span className="font-bold">
                              {quest.current}/{quest.target}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                quest.status === 'completed' || quest.status === 'claimed'
                                  ? 'bg-green-500'
                                  : 'bg-indigo-500'
                              }`}
                              style={{ width: `${Math.min((quest.current / quest.target) * 100, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Reward & Button */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Gift className="w-4 h-4 text-yellow-600" />
                            <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
                            <span className="font-bold text-slate-900">{quest.reward.toLocaleString()}</span>
                          </div>
                          {quest.status === 'completed' && (
                            <button
                              onClick={() => handleClaimWeekly(quest.id)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-1"
                            >
                              <Gift className="w-4 h-4" />
                              領取獎勵
                            </button>
                          )}
                          {quest.status === 'claimed' && (
                            <div className="px-4 py-2 bg-slate-100 text-slate-500 text-sm font-bold rounded-lg flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              已領取
                            </div>
                          )}
                          {quest.status === 'incomplete' && (
                            <div className="px-4 py-2 bg-slate-100 text-slate-400 text-sm font-bold rounded-lg flex items-center gap-1">
                              <Lock className="w-4 h-4" />
                              未完成
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Button (for testing) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">測試功能</h3>
                  <p className="text-xs text-slate-600">重置所有任務進度（僅供測試）</p>
                </div>
                <button
                  onClick={handleResetQuests}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4" />
                  重置
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
