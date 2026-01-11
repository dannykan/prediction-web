import { useState } from 'react';
import { TrendingUp, Briefcase, MessageCircle, Mail, Edit2, X, Check, Camera } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { MobileHeader } from '../components/MobileHeader';
import { ProfileOverview } from '../components/profile/ProfileOverview';
import { ProfileTransactions } from '../components/profile/ProfileTransactions';
import { ProfilePositions } from '../components/profile/ProfilePositions';
import { ProfileComments } from '../components/profile/ProfileComments';
import { PullToRefresh } from '../components/PullToRefresh';

type TabType = 'overview' | 'transactions' | 'positions' | 'comments';

export default function Profile() {
  const [isLoggedIn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const mockUser = {
    name: '神預測玩家',
    username: 'prediction_god',
    email: 'user@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    totalAssets: 15000,
    balance: 6500,
    positions: 8500,
    unrealizedPnL: 2500,
    unrealizedPnLPercent: 29.4,
    realizedPnL: 3500,
    realizedPnLPercent: 45.2,
    seasonUnrealizedPnL: 1800,
    seasonUnrealizedPnLPercent: 21.2,
    seasonRealizedPnL: 2200,
    seasonRealizedPnLPercent: 28.5,
    totalInvested: 8500,
    profitRate: 76.5,
    dailyQuests: 3,
    weeklyQuests: 5,
    unclaimedRewards: 2,
    followedMarkets: 12,
    inviteCode: 'PRED2026'
  };

  const [userName, setUserName] = useState(mockUser.name);
  const [userAvatar, setUserAvatar] = useState(mockUser.avatar);

  const handleEditClick = () => {
    setEditName(userName);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editName.trim()) {
      setUserName(editName);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('avatar-upload')?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRefresh = async () => {
    // 模擬刷新個人資料數據
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('個人資料已刷新');
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
          <div className="max-w-5xl mx-auto px-3 md:px-4 py-3 md:py-6">
            {/* User Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-6 mb-3">
              {!isEditing ? (
                <div 
                  className="flex items-start gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors group"
                  onClick={handleEditClick}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg md:text-3xl font-bold flex-shrink-0">
                      {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(userName)
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full flex items-center justify-center transition-all">
                      <Camera className="w-4 h-4 md:w-6 md:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg md:text-2xl font-bold text-slate-900">{userName}</h1>
                      <Edit2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs md:text-sm text-slate-500 mt-1">
                      <Mail className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="truncate">{mockUser.email}</span>
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
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  
                  <div className="flex items-start gap-3">
                    {/* Avatar Preview - Clickable */}
                    <div 
                      onClick={triggerFileInput}
                      className="relative cursor-pointer group/avatar"
                    >
                      <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg md:text-3xl font-bold flex-shrink-0">
                        {userAvatar ? (
                          <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          getInitials(editName || userName)
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/avatar:bg-opacity-50 rounded-full flex items-center justify-center transition-all">
                        <Camera className="w-4 h-4 md:w-6 md:h-6 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Edit Form */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">名稱</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
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
                      className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-shadow"
                    >
                      <Check className="w-4 h-4" />
                      <span>儲存</span>
                    </button>
                    <button
                      onClick={handleCancel}
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
                  onClick={() => setActiveTab('overview')}
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
                  onClick={() => setActiveTab('transactions')}
                  className={`py-2 px-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'transactions'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex flex-row items-center justify-center gap-1">
                    <Briefcase className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">餘額</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('positions')}
                  className={`py-2 px-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'positions'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex flex-row items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">持倉</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
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
            {activeTab === 'overview' && <ProfileOverview user={mockUser} />}
            {activeTab === 'transactions' && <ProfileTransactions />}
            {activeTab === 'positions' && <ProfilePositions />}
            {activeTab === 'comments' && <ProfileComments />}
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
}