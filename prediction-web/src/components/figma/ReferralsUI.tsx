"use client";

import { Copy, Check, Gift, Users, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import type { ReferralStats } from '@/features/referrals/api/getReferralStats';
import type { ReferralDetail } from '@/features/referrals/api/getReferralDetails';
import { GCoinIcon } from '@/components/GCoinIcon';

interface ReferralsUIProps {
  stats: ReferralStats;
  details: ReferralDetail[];
  onCopyCode: () => void;
  onShare: () => void;
  copied: boolean;
  inviteCodeUsed: boolean;
  inviteCodeInput: string;
  onInviteCodeInputChange: (value: string) => void;
  onInviteCodeSubmit: () => void;
  inviteCodeError: string | null;
  inviteCodeSuccess: boolean;
  usedInviteCode: string;
}

export function ReferralsUI({ 
  stats, 
  details, 
  onCopyCode, 
  onShare, 
  copied,
  inviteCodeUsed,
  inviteCodeInput,
  onInviteCodeInputChange,
  onInviteCodeSubmit,
  inviteCodeError,
  inviteCodeSuccess,
  usedInviteCode,
}: ReferralsUIProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const referralLink = stats.shareUrl || `https://predictiongod.app/home?ref=${stats.referralCode}`;

  // Calculate active referrals (status is not 'pending')
  const activeReferrals = details.filter(d => d.status !== 'pending').length;
  const totalReferrals = details.length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
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
              <Image
                src="/images/G_coin_icon.png"
                alt="G coin"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <p className="text-3xl font-bold">{formatNumber(stats.totalEarned)}</p>
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
            onClick={onCopyCode}
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
      {!inviteCodeUsed && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-4">
          <h3 className="font-bold text-slate-900 mb-3">輸入邀請碼</h3>
          
          {!inviteCodeSuccess ? (
            <>
              <p className="text-sm text-slate-600 mb-3 flex items-center gap-1">
                輸入好友的邀請碼，雙方各獲得 
                <GCoinIcon size={16} />
                <span className="font-bold">1,000</span>
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="請輸入邀請碼"
                  value={inviteCodeInput}
                  onChange={(e) => {
                    onInviteCodeInputChange(e.target.value.toUpperCase());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inviteCodeInput.trim()) {
                      onInviteCodeSubmit();
                    }
                  }}
                  className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={onInviteCodeSubmit}
                  disabled={!inviteCodeInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <GCoinIcon size={16} />
                    <span className="font-bold">50,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rewards Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6 mb-4">
        <h3 className="font-bold text-blue-900 mb-3">獎勵規則</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0">🎁</span>
            <p className="flex items-center gap-1">
              好友使用你的邀請碼註冊，雙方各獲得 
              <GCoinIcon size={16} />
              <span className="font-bold">1,000</span>
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="flex-shrink-0">⭐</span>
            <p className="flex items-center gap-1">
              邀請 10 位好友，額外獲得 
              <GCoinIcon size={16} />
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

        {details.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">還沒有邀請好友</h3>
            <p className="text-sm text-slate-600">分享你的邀請連結，開始賺取獎勵吧！</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {details.map((detail) => {
              const isActive = detail.status !== 'pending';
              const joinDate = new Date(detail.createdAt);
              
              return (
                <div key={detail.id} className="p-4 flex items-center gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {detail.refereeAvatar ? (
                      <img
                        src={detail.refereeAvatar}
                        alt={detail.refereeName}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const next = e.currentTarget.nextElementSibling as HTMLElement;
                          if (next) next.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm md:text-base font-bold ${detail.refereeAvatar ? 'hidden' : ''}`}
                    >
                      {getInitials(detail.refereeName)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-sm md:text-base">{detail.refereeName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isActive ? '活躍' : '待解鎖'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      加入於 {joinDate.toLocaleDateString('zh-TW')} • Lv.{detail.refereeLevel}
                      {detail.status === 'unlocked' || detail.status === 'claimed' ? ` • 已解鎖獎勵` : ` • 需達到 Lv.${detail.requiredLevel}`}
                    </p>
                  </div>

                  {/* Reward */}
                  {(detail.status === 'unlocked' || detail.status === 'claimed') && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Gift className="w-4 h-4 text-yellow-600" />
                      <GCoinIcon size={16} />
                      <span className="text-sm md:text-base font-bold text-slate-900">
                        {formatNumber(detail.rewardAmount)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
