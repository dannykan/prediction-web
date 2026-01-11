import { TrendingUp, Wallet, Target, CheckCircle2, Gift, Star } from 'lucide-react';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';

interface UserInfoCardProps {
  user: {
    name: string;
    avatar: string;
    totalAssets: number;
    totalInvested: number;
    profitRate: number;
    dailyQuests: number;
    weeklyQuests: number;
    unclaimedRewards: number;
    followedMarkets: number;
  };
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
          />
          <div>
            <h3 className="font-bold text-lg">{user.name}</h3>
            <p className="text-indigo-100 text-sm">預測大師</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm mb-1">總資產</p>
            <div className="flex items-center gap-2">
              <img src={gcoinImage} alt="G coin" className="w-6 h-6" />
              <span className="font-bold text-2xl">{user.totalAssets.toLocaleString()}</span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full ${user.profitRate >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold">{user.profitRate > 0 ? '+' : ''}{user.profitRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-slate-600">總投入</span>
          </div>
          <div className="flex items-center gap-1">
            <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
            <span className="font-bold text-slate-800">{user.totalInvested.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-slate-600">每日任務</span>
            </div>
            <p className="font-bold text-lg text-slate-800">{user.dailyQuests}</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-600">每周任務</span>
            </div>
            <p className="font-bold text-lg text-slate-800">{user.weeklyQuests}</p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-600">未領獎勵</span>
            </div>
            <p className="font-bold text-lg text-slate-800">{user.unclaimedRewards}</p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-slate-600">關注市場</span>
            </div>
            <p className="font-bold text-lg text-slate-800">{user.followedMarkets}</p>
          </div>
        </div>

        {user.unclaimedRewards > 0 && (
          <button className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg">
            領取獎勵 ({user.unclaimedRewards})
          </button>
        )}
      </div>
    </div>
  );
}
