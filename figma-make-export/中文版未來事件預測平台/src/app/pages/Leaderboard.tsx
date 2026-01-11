import { useState } from 'react';
import { Trophy, Crown, Medal, Award, Skull, Coins, TrendingUp } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { MobileHeader } from '../components/MobileHeader';
import { PullToRefresh } from '../components/PullToRefresh';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';

type LeaderboardType = 'profit_rate' | 'profit_amount' | 'loss_amount';

interface LeaderboardUser {
  rank: number;
  previousRank: number;
  user: {
    name: string;
    avatar: string;
    level: number;
    title?: string;
  };
  score: number;
  trend: 'up' | 'down' | 'same';
}

export default function Leaderboard() {
  const [isLoggedIn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('2026-Q1');
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('profit_rate');

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

  const seasons = [
    { id: '2026-Q1', name: '2026 第一季', endDate: new Date('2026-03-31') },
    { id: '2025-Q4', name: '2025 第四季', endDate: new Date('2025-12-31') },
  ];

  const currentSeason = seasons.find(s => s.id === selectedSeason);
  
  // Calculate time until end
  const getTimeUntilEnd = () => {
    if (!currentSeason) return { days: 0, hours: 0, minutes: 0 };
    
    const now = new Date().getTime();
    const end = currentSeason.endDate.getTime();
    const diff = end - now;
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };
  
  const timeUntilEnd = getTimeUntilEnd();

  // Mock leaderboard data
  const getLeaderboardData = (): LeaderboardUser[] => {
    if (leaderboardType === 'profit_rate') {
      return [
        {
          rank: 1,
          previousRank: 2,
          user: { name: '預測之神', avatar: 'https://i.pravatar.cc/150?u=user1', level: 15 },
          score: 185.5,
          trend: 'up',
        },
        {
          rank: 2,
          previousRank: 1,
          user: { name: '分析大師', avatar: 'https://i.pravatar.cc/150?u=user2', level: 12 },
          score: 162.3,
          trend: 'down',
        },
        {
          rank: 3,
          previousRank: 4,
          user: { name: '投資高手', avatar: 'https://i.pravatar.cc/150?u=user3', level: 10 },
          score: 145.8,
          trend: 'up',
        },
        {
          rank: 4,
          previousRank: 3,
          user: { name: '市場觀察者', avatar: 'https://i.pravatar.cc/150?u=user4', level: 8 },
          score: 128.4,
          trend: 'down',
        },
        {
          rank: 5,
          previousRank: 5,
          user: { name: '幸運星', avatar: 'https://i.pravatar.cc/150?u=user5', level: 7 },
          score: 115.2,
          trend: 'same',
        },
      ];
    } else if (leaderboardType === 'profit_amount') {
      return [
        {
          rank: 1,
          previousRank: 1,
          user: { name: '大鯨魚', avatar: 'https://i.pravatar.cc/150?u=whale1', level: 18 },
          score: 250000,
          trend: 'same',
        },
        {
          rank: 2,
          previousRank: 3,
          user: { name: '富豪玩家', avatar: 'https://i.pravatar.cc/150?u=whale2', level: 14 },
          score: 185000,
          trend: 'up',
        },
        {
          rank: 3,
          previousRank: 2,
          user: { name: '資金大戶', avatar: 'https://i.pravatar.cc/150?u=whale3', level: 11 },
          score: 162000,
          trend: 'down',
        },
      ];
    } else {
      return [
        {
          rank: 1,
          previousRank: 2,
          user: { name: '衰神附身', avatar: 'https://i.pravatar.cc/150?u=loss1', level: 3 },
          score: -45000,
          trend: 'up',
        },
        {
          rank: 2,
          previousRank: 1,
          user: { name: '預測失準', avatar: 'https://i.pravatar.cc/150?u=loss2', level: 5 },
          score: -38000,
          trend: 'down',
        },
        {
          rank: 3,
          previousRank: 3,
          user: { name: '運氣不佳', avatar: 'https://i.pravatar.cc/150?u=loss3', level: 4 },
          score: -32000,
          trend: 'same',
        },
      ];
    }
  };

  const leaderboardData = getLeaderboardData();

  // Mock current user ranking
  const myRanking = {
    rank: 42,
    previousRank: 38,
    score: leaderboardType === 'profit_rate' ? 45.6 : 12000,
    trend: 'down' as const,
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 md:w-7 md:h-7 text-slate-400" />;
    if (rank === 3) return <Award className="w-6 h-6 md:w-7 md:h-7 text-amber-600" />;
    return <div className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-slate-600 font-bold text-sm md:text-base">#{rank}</div>;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getScoreDisplay = (score: number) => {
    if (leaderboardType === 'profit_rate') {
      return <span className="text-green-600">+{score}%</span>;
    } else if (leaderboardType === 'profit_amount') {
      return (
        <div className="flex items-center gap-1">
          <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
          <span className="text-green-600">+{score.toLocaleString()}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
          <span className="text-red-600">{score.toLocaleString()}</span>
        </div>
      );
    }
  };

  const handleRefresh = async () => {
    // 模擬刷新排行榜數據
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('排行榜已刷新');
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

        <PullToRefresh onRefresh={handleRefresh} className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0 h-screen">
          <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6 pb-32">
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
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Season Info Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3 md:p-4 text-white mb-4">
              <h2 className="text-lg md:text-xl font-bold mb-2">{currentSeason?.name}</h2>
              
              {/* Rewards in one row */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Crown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs opacity-90">第一名</span>
                  </div>
                  <div className="flex items-center justify-center gap-0.5 md:gap-1">
                    <img src={gcoinImage} alt="G coin" className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span className="font-bold text-xs md:text-sm">50,000</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Medal className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs opacity-90">第二名</span>
                  </div>
                  <div className="flex items-center justify-center gap-0.5 md:gap-1">
                    <img src={gcoinImage} alt="G coin" className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span className="font-bold text-xs md:text-sm">30,000</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="text-xs opacity-90">第三名</span>
                  </div>
                  <div className="flex items-center justify-center gap-0.5 md:gap-1">
                    <img src={gcoinImage} alt="G coin" className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    <span className="font-bold text-xs md:text-sm">15,000</span>
                  </div>
                </div>
              </div>

              <div className="text-center py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-xs md:text-sm opacity-90 mb-0.5">賽季結束倒計時</p>
                <p className="text-lg md:text-xl font-bold">{timeUntilEnd.days} 天 {timeUntilEnd.hours} 小時 {timeUntilEnd.minutes} 分鐘</p>
              </div>
            </div>

            {/* Leaderboard Type Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 mb-4">
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setLeaderboardType('profit_rate')}
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
                  onClick={() => setLeaderboardType('profit_amount')}
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
                  onClick={() => setLeaderboardType('loss_amount')}
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-200">
                {leaderboardData.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`p-2.5 md:p-3 hover:bg-slate-50 transition-colors ${
                      entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      {/* Rank Icon */}
                      <div className="flex-shrink-0">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* User Avatar */}
                      <img
                        src={entry.user.avatar}
                        alt={entry.user.name}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0"
                      />

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm md:text-base truncate">
                          {entry.user.name}
                        </h3>
                      </div>

                      {/* Score */}
                      <div className="flex-shrink-0">
                        <div className="font-bold text-sm md:text-base">
                          {getScoreDisplay(entry.score)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* My Ranking - Fixed Bottom */}
          {isLoggedIn && (
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-200 shadow-lg z-20">
              <div className="max-w-4xl mx-auto px-3 md:px-4 py-2.5">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-slate-600 font-bold text-sm md:text-base">
                      #{myRanking.rank}
                    </div>
                  </div>
                  <img
                    src={mockUser.avatar}
                    alt={mockUser.name}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm md:text-base truncate">我的排名</h3>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="font-bold text-sm md:text-base">
                      {getScoreDisplay(myRanking.score)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </PullToRefresh>
      </div>
    </div>
  );
}