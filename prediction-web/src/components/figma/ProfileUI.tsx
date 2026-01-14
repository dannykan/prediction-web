"use client";

import { TrendingUp, Briefcase, MessageCircle, Mail, Edit2, X, Check, Camera, Loader2, FileText, Layers } from 'lucide-react';
import { ProfileOverview } from './profile/ProfileOverview';
import { ProfileTransactions } from './profile/ProfileTransactions';
import { ProfilePositions } from './profile/ProfilePositions';
import { ProfileComments } from './profile/ProfileComments';
import type { User } from '@/features/user/types/user';
import type { UserStatistics } from '@/features/user/types/user-statistics';
import type { Transaction } from '@/features/user/api/getUserTransactions';
import type { UserPosition } from '@/features/user/api/getAllUserPositions';
import type { UserComment } from '@/features/user/api/getUserComments';
import Image from 'next/image';

type TabType = 'overview' | 'transactions' | 'positions' | 'comments';

interface ProfileUIProps {
  user: User;
  statistics: UserStatistics | null;
  transactions: Transaction[];
  positions: UserPosition[];
  comments: UserComment[];
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isEditing: boolean;
  onEditClick: () => void;
  onSave: (name: string, avatarUrl?: string) => void;
  onCancel: () => void;
  editName: string;
  onEditNameChange: (name: string) => void;
  editAvatarUrl: string | null;
  onAvatarChange: (file: File) => void;
  onRefresh: () => Promise<void>;
  isUploading?: boolean;
}

export function ProfileUI({
  user,
  statistics,
  transactions,
  positions,
  comments,
  activeTab,
  onTabChange,
  isEditing,
  onEditClick,
  onSave,
  onCancel,
  editName,
  onEditNameChange,
  editAvatarUrl,
  onAvatarChange,
  isUploading = false,
}: ProfileUIProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('avatar-upload')?.click();
  };

  const handleSave = () => {
    if (editName.trim()) {
      onSave(editName, editAvatarUrl || undefined);
    }
  };

  // Calculate user data for display
  const balance = statistics?.statistics?.profitRate?.total?.coinBalance || 0;
  
  // Calculate positions value and cost from positions data
  const positionsCurrentValue = positions.reduce((sum, pos) => sum + parseFloat(pos.currentValue || "0"), 0);
  const positionsTotalCost = positions.reduce((sum, pos) => sum + parseFloat(pos.totalCost || "0"), 0);
  
  // Total assets = balance + positions current value (持倉當前價值)
  const totalAssets = balance + positionsCurrentValue;
  
  // Calculate unrealized PnL from positions (currentValue - totalCost)
  const unrealizedPnL = positions.reduce((sum, pos) => sum + parseFloat(pos.profitLoss || "0"), 0);
  const unrealizedPnLPercent = positionsTotalCost > 0 ? (unrealizedPnL / positionsTotalCost) * 100 : 0;
  
  // Get realized PnL from statistics
  const realizedPnL = statistics?.statistics?.profitRate?.total?.profit || 0;
  const backendRate = statistics?.statistics?.profitRate?.total?.rate;
  const initialBalance = statistics?.statistics?.profitRate?.total?.initialBalance || 0;
  const realizedPnLPercent = backendRate !== undefined 
    ? backendRate 
    : (initialBalance > 0 ? (realizedPnL / initialBalance) * 100 : 0);

  // Calculate season unrealized PnL
  const seasonStartDate = statistics?.statistics?.profitRate?.season?.seasonStartDate 
    ? new Date(statistics.statistics.profitRate.season.seasonStartDate)
    : new Date("2026-01-01");
  const seasonPositions = positions.filter(pos => {
    const firstTradeDate = new Date(pos.firstTradeAt);
    return firstTradeDate >= seasonStartDate;
  });
  const seasonUnrealizedPnL = seasonPositions.reduce((sum, pos) => sum + parseFloat(pos.profitLoss || "0"), 0);
  const seasonTotalCost = seasonPositions.reduce((sum, pos) => sum + parseFloat(pos.totalCost || "0"), 0);
  const seasonUnrealizedPnLPercent = seasonTotalCost > 0 ? (seasonUnrealizedPnL / seasonTotalCost) * 100 : 0;
  
  // Get season realized PnL
  const seasonRealizedPnL = statistics?.statistics?.profitRate?.season?.profit || 0;
  const backendSeasonRate = statistics?.statistics?.profitRate?.season?.rate;
  const seasonStartBalance = statistics?.statistics?.profitRate?.season?.seasonStartBalance || 0;
  const seasonRewards = statistics?.statistics?.profitRate?.season?.seasonRewards || 0;
  const seasonTotalCapital = seasonStartBalance + seasonRewards;
  const seasonRealizedPnLPercent = backendSeasonRate !== undefined
    ? backendSeasonRate
    : (seasonTotalCapital > 0 ? (seasonRealizedPnL / seasonTotalCapital) * 100 : 0);

  const userData = {
    totalAssets,
    balance,
    positions: positionsTotalCost, // 持倉投入成本總和
    unrealizedPnL,
    unrealizedPnLPercent,
    realizedPnL,
    realizedPnLPercent,
    seasonUnrealizedPnL,
    seasonUnrealizedPnLPercent,
    seasonRealizedPnL,
    seasonRealizedPnLPercent,
  };

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-4 py-3 md:py-6">
      {/* User Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-6 mb-3">
        {!isEditing ? (
          <div 
            className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors group"
            onClick={onEditClick}
          >
            {/* Avatar */}
            {user.avatarUrl && typeof user.avatarUrl === 'string' && user.avatarUrl.trim() !== '' ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || user.username || 'User'}
                className="w-12 h-12 md:w-20 md:h-20 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  console.error("[ProfileUI] Avatar image load error:", user.avatarUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg md:text-3xl font-bold flex-shrink-0">
                {getInitials(user.displayName || user.username || 'User')}
              </div>
            )}

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-2xl font-bold text-slate-900">
                  {user.displayName || user.username || '用戶'}
                </h1>
                <Edit2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-slate-500 mt-1">
                <Mail className="w-3 h-3 md:w-4 md:h-4" />
                <span className="truncate">{user.email || '未設定電子郵件'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Hidden file input */}
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
            
            <div className="flex items-start gap-3">
              {/* Avatar Preview - Clickable */}
              <div 
                onClick={triggerFileInput}
                className="relative cursor-pointer group/avatar w-12 h-12 md:w-20 md:h-20 flex-shrink-0"
              >
                {editAvatarUrl && typeof editAvatarUrl === 'string' && editAvatarUrl.trim() !== '' ? (
                  <>
                    <img
                      src={editAvatarUrl}
                      alt={editName || user.displayName || 'User'}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        console.error("[ProfileUI] Edit avatar image load error:", editAvatarUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/50 rounded-full flex items-center justify-center transition-all pointer-events-none">
                      <Camera className="w-4 h-4 md:w-6 md:h-6 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg md:text-3xl font-bold">
                    {getInitials(editName || user.displayName || 'User')}
                  </div>
                )}
              </div>

              {/* Edit Form */}
              <div className="flex-1 space-y-2">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">名稱</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => onEditNameChange(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="輸入您的名稱"
                  />
                </div>
                <div className="text-xs text-slate-500">
                  點擊頭像可上傳新圖片
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isUploading}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 disabled:from-indigo-400 disabled:to-purple-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-shadow"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>上傳中...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>儲存</span>
                  </>
                )}
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-1.5 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>取消</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 mb-3">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => onTabChange('overview')}
            className={`py-2 px-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex flex-row items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">總覽</span>
            </div>
          </button>
          <button
            onClick={() => onTabChange('transactions')}
            className={`py-2 px-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'transactions'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex flex-row items-center justify-center gap-1">
              <FileText className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">記錄</span>
            </div>
          </button>
          <button
            onClick={() => onTabChange('positions')}
            className={`py-2 px-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'positions'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex flex-row items-center justify-center gap-1">
              <Layers className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">持倉</span>
            </div>
          </button>
          <button
            onClick={() => onTabChange('comments')}
            className={`py-2 px-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'comments'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex flex-row items-center justify-center gap-1">
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">評論</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <ProfileOverview 
          user={userData} 
          statistics={statistics} 
          userCreatedAt={user.createdAt} 
          userId={user.id} 
        />
      )}
      {activeTab === 'transactions' && (
        <ProfileTransactions transactions={transactions} />
      )}
      {activeTab === 'positions' && (
        <ProfilePositions positions={positions} userId={user.id} />
      )}
      {activeTab === 'comments' && (
        <ProfileComments comments={comments} />
      )}
    </div>
  );
}
