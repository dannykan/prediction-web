"use client";

import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatNumber } from '@/utils/formatNumber';
import { GCoinIcon } from '@/components/GCoinIcon';

interface MobileHeaderUIProps {
  onMenuClick: () => void;
  isLoggedIn: boolean;
  user?: {
    totalAssets: number;
    avatar: string;
  };
  unclaimedQuestsCount?: number;
  unreadNotificationsCount?: number;
  onLogin?: () => void;
}

export function MobileHeaderUI({ 
  onMenuClick, 
  isLoggedIn, 
  user,
  unclaimedQuestsCount = 0,
  unreadNotificationsCount = 0,
  onLogin,
}: MobileHeaderUIProps) {
  // Calculate total unread items (quests + notifications)
  const hasUnreadItems = (unclaimedQuestsCount > 0) || (unreadNotificationsCount > 0);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-20 lg:hidden">
      <div className="flex items-center justify-between h-full px-4">
        <button 
          onClick={onMenuClick}
          className="relative p-2 text-slate-600 hover:text-slate-800"
        >
          <Menu className="w-6 h-6" />
          {/* Red dot indicator for unread items */}
          {hasUnreadItems && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
        
        <Link href="/home" className="flex items-center gap-2">
          <Image 
            src="/images/logo.png" 
            alt="神預測 Logo" 
            width={32} 
            height={32}
            className="w-8 h-8 object-contain rounded-lg"
            priority
          />
          <div>
            <h1 className="font-bold text-base text-slate-800 leading-tight">神預測</h1>
            <p className="text-[10px] text-slate-500 leading-tight">Prediction God</p>
          </div>
        </Link>

        {isLoggedIn && user ? (
          <div className="flex items-center gap-2">
            <GCoinIcon size={20} priority={true} />
            <span className="font-bold text-amber-600 text-sm">{formatNumber(user.totalAssets)}</span>
          </div>
        ) : onLogin ? (
          <button
            onClick={onLogin}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
          >
            登入
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </header>
  );
}
