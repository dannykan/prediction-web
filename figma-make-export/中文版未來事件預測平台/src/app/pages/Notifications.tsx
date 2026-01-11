import { useState } from 'react';
import { Bell, Check, X, Circle, X as XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { MobileHeader } from '../components/MobileHeader';
import { PullToRefresh } from '../components/PullToRefresh';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';

interface Notification {
  id: string;
  type: 'comment_reply' | 'comment_like' | 'market_settlement' | 'achievement';
  icon: typeof Bell;
  iconColor: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  link?: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [isLoggedIn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'comment_reply',
      icon: Bell,
      iconColor: 'text-blue-600',
      title: '評論回覆',
      message: '小明 回覆了你的評論："我也這麼認為！"',
      timestamp: new Date('2026-01-10T14:30:00'),
      isRead: false,
      link: '/market/1',
    },
    {
      id: '2',
      type: 'comment_like',
      icon: Bell,
      iconColor: 'text-pink-600',
      title: '評論被按讚',
      message: '你的評論獲得了 5 個讚',
      timestamp: new Date('2026-01-10T12:15:00'),
      isRead: false,
      link: '/market/1',
    },
    {
      id: '3',
      type: 'market_settlement',
      icon: Bell,
      iconColor: 'text-green-600',
      title: '市場結算',
      message: '「2025 NBA 總冠軍預測」已結算，你獲得了 1,250 G Coin！',
      timestamp: new Date('2026-01-09T18:00:00'),
      isRead: true,
      link: '/market/5',
    },
    {
      id: '4',
      type: 'achievement',
      icon: Bell,
      iconColor: 'text-yellow-600',
      title: '成就解鎖',
      message: '恭喜！你解鎖了「交易新手」成就，獲得 100 G Coin 獎勵',
      timestamp: new Date('2026-01-09T10:20:00'),
      isRead: true,
    },
    {
      id: '5',
      type: 'comment_reply',
      icon: Bell,
      iconColor: 'text-blue-600',
      title: '評論回覆',
      message: '數據分析師 回覆了你的評論："有道理，數據支持你的觀點。"',
      timestamp: new Date('2026-01-08T16:45:00'),
      isRead: true,
      link: '/market/1',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleRefresh = async () => {
    // 模擬刷新通知數據
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('通知已刷新');
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
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">通知</h1>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">查看你的最新動態</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden md:inline">全部標記為已讀</span>
                  <span className="md:hidden">全部已讀</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">沒有通知</h3>
                <p className="text-sm text-slate-600">目前沒有新的通知訊息</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors hover:bg-slate-50 ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full ${
                          !notification.isRead ? 'bg-blue-100' : 'bg-slate-100'
                        } flex items-center justify-center flex-shrink-0`}>
                          <notification.icon className={`w-5 h-5 ${notification.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`text-sm md:text-base font-bold ${
                              !notification.isRead ? 'text-slate-900' : 'text-slate-700'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: zhTW })}
                            </span>
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                標記為已讀
                              </button>
                            )}
                            {notification.link && (
                              <button
                                onClick={() => handleNotificationClick(notification)}
                                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                              >
                                查看詳情
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            {notifications.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500">
                  通知會保留 30 天，過期後將自動刪除
                </p>
              </div>
            )}
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
}