import { useState } from 'react';
import { Users, Copy, Check, Gift, TrendingUp } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { MobileHeader } from '../components/MobileHeader';
import { PullToRefresh } from '../components/PullToRefresh';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';

interface Referral {
  id: string;
  name: string;
  avatar: string;
  joinDate: Date;
  totalBets: number;
  reward: number;
  status: 'active' | 'inactive';
}

export default function Referrals() {
  const [isLoggedIn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteCodeUsed, setInviteCodeUsed] = useState(false);
  const [inviteCodeError, setInviteCodeError] = useState('');
  const [inviteCodeSuccess, setInviteCodeSuccess] = useState(false);
  const [usedInviteCode, setUsedInviteCode] = useState(''); // Store the used invite code

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

  const referralLink = `https://神預測.com/invite/${mockUser.inviteCode}`;

  const handleCopy = async () => {
    try {
      // Try modern Clipboard API first
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for browsers that block Clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (fallbackErr) {
        console.error('Failed to copy:', fallbackErr);
      }
    }
  };

  const handleInviteCodeSubmit = () => {
    if (inviteCodeInput.trim() === '') {
      setInviteCodeError('請輸入邀請碼');
      return;
    }

    // Can't use own invite code
    if (inviteCodeInput === mockUser.inviteCode) {
      setInviteCodeError('不能使用自己的邀請碼');
      return;
    }

    // Simulate invite code validation - accept any non-empty code for demo
    if (inviteCodeInput.length >= 4) {
      setInviteCodeUsed(true);
      setInviteCodeSuccess(true);
      setUsedInviteCode(inviteCodeInput);
      setInviteCodeInput('');
      setInviteCodeError('');
    } else {
      setInviteCodeError('邀請碼格式錯誤');
    }
  };

  // Mock referrals data
  const referrals: Referral[] = [
    {
      id: '1',
      name: '小明',
      avatar: 'https://i.pravatar.cc/150?u=user1',
      joinDate: new Date('2026-01-05'),
      totalBets: 15,
      reward: 500,
      status: 'active',
    },
    {
      id: '2',
      name: '阿華',
      avatar: 'https://i.pravatar.cc/150?u=user2',
      joinDate: new Date('2026-01-08'),
      totalBets: 8,
      reward: 300,
      status: 'active',
    },
    {
      id: '3',
      name: '小美',
      avatar: 'https://i.pravatar.cc/150?u=user3',
      joinDate: new Date('2026-01-10'),
      totalBets: 3,
      reward: 100,
      status: 'active',
    },
  ];

  const totalReferrals = referrals.length;
  const activeReferrals = referrals.filter(r => r.status === 'active').length;
  const totalRewards = referrals.reduce((sum, r) => sum + r.reward, 0);

  const handleRefresh = async () => {
    // 模擬刷新邀請數據
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('邀請數據已刷新');
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
          <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
            {/* Page Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">邀請好友</h1>
              </div>
              <p className="text-sm text-slate-600">邀請好友一起預測，雙方都能獲得獎勵</p>
            </div>

            {/* Referral Stats */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 md:p-6 text-white mb-4">
              <h2 className="text-lg md:text-xl font-bold mb-4">邀請統計</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5" />
                    <span className="text-sm opacity-90">總邀請人數</span>
                  </div>
                  <p className="text-3xl font-bold">{totalReferrals}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm opacity-90">活躍用戶</span>
                  </div>
                  <p className="text-3xl font-bold">{activeReferrals}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Gift className="w-5 h-5" />
                    <span className="text-sm opacity-90">累計獲得</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={gcoinImage} alt="G coin" className="w-6 h-6" />
                    <p className="text-3xl font-bold">{totalRewards.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Link */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-4">
              <h3 className="font-bold text-slate-900 mb-3">你的邀請碼</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                />
                <button
                  onClick={handleCopy}
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="hidden md:inline">已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="hidden md:inline">複製連結</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Input Invite Code */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-4">
              <h3 className="font-bold text-slate-900 mb-3">輸入邀請碼</h3>
              
              {!inviteCodeUsed ? (
                <>
                  <p className="text-sm text-slate-600 mb-3">
                    輸入好友的邀請碼，雙方各獲得 <img src={gcoinImage} alt="G coin" className="w-4 h-4 inline" /> 1,000
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="請輸入邀請碼"
                      value={inviteCodeInput}
                      onChange={(e) => {
                        setInviteCodeInput(e.target.value);
                        setInviteCodeError('');
                      }}
                      className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleInviteCodeSubmit}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      送出
                    </button>
                  </div>
                  {inviteCodeError && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <span>❌</span>
                      {inviteCodeError}
                    </p>
                  )}
                </>
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-green-900 mb-1">邀請碼已使用</h4>
                      <p className="text-sm text-green-800 mb-2">
                        成功使用邀請碼 <span className="font-mono font-bold">{usedInviteCode}</span>
                      </p>
                      <div className="flex items-center gap-1 text-sm text-green-700">
                        <Gift className="w-4 h-4" />
                        <span>你和邀請人各獲得</span>
                        <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
                        <span className="font-bold">1,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rewards Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6 mb-4">
              <h3 className="font-bold text-blue-900 mb-3">獎勵規則</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0">🎁</span>
                  <p className="flex items-center gap-1">
                    好友使用你的邀請碼註冊，雙方各獲得 
                    <img src={gcoinImage} alt="G coin" className="w-4 h-4 inline mx-0.5" /> 
                    <span className="font-bold">1,000</span>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0">⭐</span>
                  <p className="flex items-center gap-1">
                    邀請 10 位好友，額外獲得 
                    <img src={gcoinImage} alt="G coin" className="w-4 h-4 inline mx-0.5" /> 
                    <span className="font-bold">10,000</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Referrals List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-bold text-slate-900">我的邀請 ({totalReferrals})</h3>
              </div>

              {referrals.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">還沒有邀請好友</h3>
                  <p className="text-sm text-slate-600">分享你的邀請連結，開始賺取獎勵吧！</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="p-4 flex items-center gap-3">
                      {/* Avatar */}
                      <img
                        src={referral.avatar}
                        alt={referral.name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900 text-sm md:text-base">{referral.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            referral.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {referral.status === 'active' ? '活躍' : '未活躍'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          加入於 {referral.joinDate.toLocaleDateString('zh-TW')} • {referral.totalBets} 次下注
                        </p>
                      </div>

                      {/* Reward */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Gift className="w-4 h-4 text-yellow-600" />
                        <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
                        <span className="text-sm md:text-base font-bold text-slate-900">
                          {referral.reward.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
}