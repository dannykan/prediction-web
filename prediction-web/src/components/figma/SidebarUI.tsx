"use client";

import { Home, Trophy, PlusCircle, CheckSquare, Bell, User, Users, LogOut, Copy, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { formatNumber } from '@/utils/formatNumber';
import { GCoinIcon } from '@/components/GCoinIcon';

interface SidebarUIProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  user?: {
    name: string;
    avatar?: string;
    totalAssets: number;
    inviteCode?: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
  unclaimedQuestsCount?: number;
  unreadNotificationsCount?: number;
}

const menuItems = [
  { id: 'home', label: '首頁', labelEn: 'Home', icon: Home, path: '/home', requireLogin: false },
  { id: 'leaderboard', label: '排行榜', labelEn: 'Leaderboard', icon: Trophy, path: '/leaderboard', requireLogin: false },
  { id: 'create', label: '創建問題', labelEn: 'Create', icon: PlusCircle, path: '/create-question', requireLogin: true },
  { id: 'quests', label: '任務', labelEn: 'Quests', icon: CheckSquare, path: '/quests', requireLogin: true },
  { id: 'notifications', label: '通知', labelEn: 'Notifications', icon: Bell, path: '/notifications', requireLogin: true },
  { id: 'referrals', label: '邀請好友', labelEn: 'Referrals', icon: Users, path: '/referrals', requireLogin: true },
  { id: 'profile', label: '我的', labelEn: 'Profile', icon: User, path: '/profile', requireLogin: true },
];

export function SidebarUI({ isOpen, onClose, isLoggedIn, user, onLogin, onLogout, unclaimedQuestsCount = 0, unreadNotificationsCount = 0 }: SidebarUIProps) {
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  const handleCopyInviteCode = async () => {
    if (user?.inviteCode) {
      try {
        await navigator.clipboard.writeText(user.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        try {
          const textArea = document.createElement('textarea');
          textArea.value = user.inviteCode;
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
    }
  };

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home' || pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <aside 
      className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <Link href="/home" className="flex items-center gap-3">
              <Image 
                src="/images/logo.png" 
                alt="神預測 Logo" 
                width={40} 
                height={40}
                className="w-10 h-10 object-contain rounded-lg"
                priority
              />
              <div>
                <h1 className="font-bold text-xl text-slate-800">神預測</h1>
                <p className="text-xs text-slate-500">Prediction God</p>
              </div>
            </Link>
            <button 
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info - Mobile/Sidebar */}
        {isLoggedIn && user && (
          <div className="py-4 px-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center gap-3">
              {user.avatar && user.avatar.trim() !== '' ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full border-2 border-white shadow object-cover"
                  onError={(e) => {
                    console.error("[SidebarUI] Avatar image load error:", user.avatar);
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-white shadow">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{user.name}</p>
                <div className="flex items-center gap-1 text-sm">
                  <GCoinIcon size={16} priority={true} />
                  <span className="font-bold text-amber-600">{formatNumber(user.totalAssets)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.filter(item => item.id !== 'create').map(item => {
              const Icon = item.icon;
              const isDisabled = item.requireLogin && !isLoggedIn;
              const active = isActive(item.path);
              
              // Get badge count for specific items
              let badgeCount: number | undefined = undefined;
              if (item.id === 'quests' && unclaimedQuestsCount > 0) {
                badgeCount = unclaimedQuestsCount;
              } else if (item.id === 'notifications' && unreadNotificationsCount > 0) {
                badgeCount = unreadNotificationsCount;
              }
              
              return (
                <li key={item.id}>
                  <Link
                    href={isDisabled ? '#' : item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      isDisabled 
                        ? 'text-slate-300 cursor-not-allowed'
                        : active
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium">{item.label}</span>
                        <span className={`text-xs ${active ? 'text-indigo-100' : 'text-slate-400'}`}>{item.labelEn}</span>
                      </div>
                    </div>
                    {badgeCount !== undefined && !isDisabled && (
                      <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full font-bold">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Invite Code Section */}
          {isLoggedIn && user?.inviteCode && (
            <div className="mt-6 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <h3 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-1">
                <span>🎁</span>
                邀請碼
              </h3>
              
              {/* My Invite Code */}
              <div className="mb-2">
                <label className="text-xs text-slate-600 mb-1 block">我的邀請碼</label>
                <div className="flex gap-1">
                  <input 
                    type="text" 
                    value={user.inviteCode} 
                    readOnly 
                    className="flex-1 min-w-0 px-2 py-1.5 text-xs bg-white border border-slate-200 rounded font-mono text-center"
                  />
                  <button 
                    onClick={handleCopyInviteCode}
                    className="flex-shrink-0 px-2 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {copied && <p className="text-xs text-green-600 mt-1">✓ 已複製！</p>}
              </div>
            </div>
          )}
        </nav>

        {/* Login/Logout */}
        <div className="p-4 border-t border-slate-200">
          {!isLoggedIn ? (
            <button 
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google 登入
            </button>
          ) : (
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              登出
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
