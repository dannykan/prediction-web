"use client";

import { TrendingUp, TrendingDown, Wallet, Briefcase, FileText, Layers } from 'lucide-react';
import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TotalAssetsChart } from '@/features/user/components/TotalAssetsChart';
import Image from 'next/image';

interface ProfileOverviewProps {
  user: {
    totalAssets: number;
    balance: number;
    positions: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
    realizedPnL: number;
    realizedPnLPercent: number;
    seasonUnrealizedPnL: number;
    seasonUnrealizedPnLPercent: number;
    seasonRealizedPnL: number;
    seasonRealizedPnLPercent: number;
  };
  statistics: any;
  userCreatedAt?: string;
  userId: string;
}

export function ProfileOverview({ user, statistics, userCreatedAt, userId }: ProfileOverviewProps) {
  // Format number with 2 decimal places
  const formatCoin = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-3">
      {/* G Coin Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-6">
        <div className="space-y-2 md:space-y-3">
          {/* Total Assets - Full Width */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Wallet className="w-3.5 h-3.5 md:w-5 md:h-5 text-indigo-600" />
              <span className="text-xs md:text-sm text-slate-600">總資產</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Image
                src="/images/G_coin_icon.png"
                alt="G coin"
                width={24}
                height={24}
                className="w-5 h-5 md:w-6 md:h-6"
              />
              <span className="text-2xl md:text-3xl font-bold text-slate-900">
                {formatCoin(user.totalAssets)}
              </span>
            </div>
          </div>

          {/* Other Stats - 2 columns */}
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            {/* Balance */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 md:w-5 md:h-5 text-slate-600" />
                <span className="text-xs md:text-sm text-slate-600">餘額</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Image
                  src="/images/G_coin_icon.png"
                  alt="G coin"
                  width={20}
                  height={20}
                  className="w-4 h-4 md:w-5 md:h-5"
                />
                <span className="text-base md:text-xl font-bold text-slate-900">
                  {formatCoin(user.balance)}
                </span>
              </div>
            </div>

            {/* Positions */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Layers className="w-3.5 h-3.5 md:w-5 md:h-5 text-slate-600" />
                <span className="text-xs md:text-sm text-slate-600">持倉</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Image
                  src="/images/G_coin_icon.png"
                  alt="G coin"
                  width={20}
                  height={20}
                  className="w-4 h-4 md:w-5 md:h-5"
                />
                <span className="text-base md:text-xl font-bold text-slate-900">
                  {formatCoin(user.positions)}
                </span>
              </div>
            </div>

            {/* Unrealized PnL */}
            <div className={`${user.unrealizedPnL >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-3`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                {user.unrealizedPnL >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 md:w-5 md:h-5 text-red-600" />
                )}
                <span className="text-xs md:text-sm text-slate-600">未實現盈虧</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Image
                  src="/images/G_coin_icon.png"
                  alt="G coin"
                  width={20}
                  height={20}
                  className="w-4 h-4 md:w-5 md:h-5"
                />
                <span className={`text-base md:text-xl font-bold ${user.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {user.unrealizedPnL >= 0 ? '+' : ''}{formatCoin(user.unrealizedPnL)}
                </span>
                <span className={`text-xs md:text-sm font-bold ${user.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({user.unrealizedPnL >= 0 ? '+' : ''}{user.unrealizedPnLPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Realized PnL */}
            <div className={`${user.realizedPnL >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-3`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                {user.realizedPnL >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 md:w-5 md:h-5 text-red-600" />
                )}
                <span className="text-xs md:text-sm text-slate-600">已實現盈虧</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Image
                  src="/images/G_coin_icon.png"
                  alt="G coin"
                  width={20}
                  height={20}
                  className="w-4 h-4 md:w-5 md:h-5"
                />
                <span className={`text-base md:text-xl font-bold ${user.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {user.realizedPnL >= 0 ? '+' : ''}{formatCoin(user.realizedPnL)}
                </span>
                <span className={`text-xs md:text-sm font-bold ${user.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({user.realizedPnL >= 0 ? '+' : ''}{user.realizedPnLPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Season Unrealized PnL */}
            <div className={`${user.seasonUnrealizedPnL >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-3`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                {user.seasonUnrealizedPnL >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 md:w-5 md:h-5 text-red-600" />
                )}
                <span className="text-xs md:text-sm text-slate-600">賽季未實現</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Image
                  src="/images/G_coin_icon.png"
                  alt="G coin"
                  width={20}
                  height={20}
                  className="w-4 h-4 md:w-5 md:h-5"
                />
                <span className={`text-base md:text-xl font-bold ${user.seasonUnrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {user.seasonUnrealizedPnL >= 0 ? '+' : ''}{formatCoin(user.seasonUnrealizedPnL)}
                </span>
                <span className={`text-xs md:text-sm font-bold ${user.seasonUnrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({user.seasonUnrealizedPnL >= 0 ? '+' : ''}{user.seasonUnrealizedPnLPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Season Realized PnL */}
            <div className={`${user.seasonRealizedPnL >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-3`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                {user.seasonRealizedPnL >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 md:w-5 md:h-5 text-red-600" />
                )}
                <span className="text-xs md:text-sm text-slate-600">賽季已實現</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Image
                  src="/images/G_coin_icon.png"
                  alt="G coin"
                  width={20}
                  height={20}
                  className="w-4 h-4 md:w-5 md:h-5"
                />
                <span className={`text-base md:text-xl font-bold ${user.seasonRealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {user.seasonRealizedPnL >= 0 ? '+' : ''}{formatCoin(user.seasonRealizedPnL)}
                </span>
                <span className={`text-xs md:text-sm font-bold ${user.seasonRealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({user.seasonRealizedPnL >= 0 ? '+' : ''}{user.seasonRealizedPnLPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Assets Chart */}
      {userCreatedAt && (
        <TotalAssetsChart
          userId={userId}
          userCreatedAt={userCreatedAt}
          currentTotalAssets={user.totalAssets}
        />
      )}
    </div>
  );
}
