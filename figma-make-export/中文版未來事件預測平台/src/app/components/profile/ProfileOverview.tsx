import { TrendingUp, TrendingDown, Wallet, Briefcase } from 'lucide-react';
import { useState } from 'react';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
}

type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';

export function ProfileOverview({ user }: ProfileOverviewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // Mock chart data for different time ranges
  const chartDataByRange = {
    day: [
      { date: '00:00', value: 14800 },
      { date: '04:00', value: 14900 },
      { date: '08:00', value: 14700 },
      { date: '12:00', value: 14850 },
      { date: '16:00', value: 14950 },
      { date: '20:00', value: 15000 },
    ],
    week: [
      { date: '週一', value: 14000 },
      { date: '週二', value: 14300 },
      { date: '週三', value: 14100 },
      { date: '週四', value: 14600 },
      { date: '週五', value: 14800 },
      { date: '週六', value: 14950 },
      { date: '週日', value: 15000 },
    ],
    month: [
      { date: '1/1', value: 10000 },
      { date: '1/4', value: 10500 },
      { date: '1/7', value: 10200 },
      { date: '1/10', value: 11000 },
      { date: '1/13', value: 11800 },
      { date: '1/16', value: 12500 },
      { date: '1/19', value: 13200 },
      { date: '1/22', value: 13800 },
      { date: '1/25', value: 14200 },
      { date: '1/28', value: 15000 },
    ],
    year: [
      { date: '1月', value: 10000 },
      { date: '2月', value: 10800 },
      { date: '3月', value: 11200 },
      { date: '4月', value: 11500 },
      { date: '5月', value: 12000 },
      { date: '6月', value: 12500 },
      { date: '7月', value: 13000 },
      { date: '8月', value: 13500 },
      { date: '9月', value: 14000 },
      { date: '10月', value: 14500 },
      { date: '11月', value: 14800 },
      { date: '12月', value: 15000 },
    ],
    all: [
      { date: '2024/1', value: 5000 },
      { date: '2024/4', value: 6000 },
      { date: '2024/7', value: 7500 },
      { date: '2024/10', value: 9000 },
      { date: '2025/1', value: 10000 },
      { date: '2025/4', value: 11500 },
      { date: '2025/7', value: 13000 },
      { date: '2025/10', value: 14000 },
      { date: '2026/1', value: 15000 },
    ],
  };

  const chartData = chartDataByRange[timeRange];

  // Format number with K/M suffix for Y axis
  const formatYAxis = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Format number with 2 decimal places
  const formatCoin = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const timeRangeButtons: { value: TimeRange; label: string }[] = [
    { value: 'day', label: '天' },
    { value: 'week', label: '週' },
    { value: 'month', label: '月' },
    { value: 'year', label: '年' },
    { value: 'all', label: '全部' },
  ];

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
              <img src={gcoinImage} alt="G coin" className="w-5 h-5 md:w-6 md:h-6" />
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
                <Wallet className="w-3.5 h-3.5 md:w-5 md:h-5 text-slate-600" />
                <span className="text-xs md:text-sm text-slate-600">餘額</span>
              </div>
              <div className="flex items-center gap-1.5">
                <img src={gcoinImage} alt="G coin" className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-base md:text-xl font-bold text-slate-900">
                  {formatCoin(user.balance)}
                </span>
              </div>
            </div>

            {/* Positions */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 md:w-5 md:h-5 text-slate-600" />
                <span className="text-xs md:text-sm text-slate-600">持倉</span>
              </div>
              <div className="flex items-center gap-1.5">
                <img src={gcoinImage} alt="G coin" className="w-4 h-4 md:w-5 md:h-5" />
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
                <img src={gcoinImage} alt="G coin" className="w-4 h-4 md:w-5 md:h-5" />
                <span className={`text-base md:text-xl font-bold ${user.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {user.unrealizedPnL >= 0 ? '+' : ''}{formatCoin(user.unrealizedPnL)}
                </span>
                <span className={`text-xs md:text-sm font-bold ${user.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({user.unrealizedPnL >= 0 ? '+' : ''}{user.unrealizedPnLPercent}%)
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
                <img src={gcoinImage} alt="G coin" className="w-4 h-4 md:w-5 md:h-5" />
                <span className={`text-base md:text-xl font-bold ${user.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {user.realizedPnL >= 0 ? '+' : ''}{formatCoin(user.realizedPnL)}
                </span>
                <span className={`text-xs md:text-sm font-bold ${user.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({user.realizedPnL >= 0 ? '+' : ''}{user.realizedPnLPercent}%)
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
                <img src={gcoinImage} alt="G coin" className="w-4 h-4 md:w-5 md:h-5" />
                <span className={`text-base md:text-xl font-bold ${user.seasonUnrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {user.seasonUnrealizedPnL >= 0 ? '+' : ''}{formatCoin(user.seasonUnrealizedPnL)}
                </span>
                <span className={`text-xs md:text-sm font-bold ${user.seasonUnrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({user.seasonUnrealizedPnL >= 0 ? '+' : ''}{user.seasonUnrealizedPnLPercent}%)
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
                <img src={gcoinImage} alt="G coin" className="w-4 h-4 md:w-5 md:h-5" />
                <span className={`text-base md:text-xl font-bold ${user.seasonRealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {user.seasonRealizedPnL >= 0 ? '+' : ''}{formatCoin(user.seasonRealizedPnL)}
                </span>
                <span className={`text-xs md:text-sm font-bold ${user.seasonRealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({user.seasonRealizedPnL >= 0 ? '+' : ''}{user.seasonRealizedPnLPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Assets Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-bold text-slate-900">總資產變化</h2>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto">
          {timeRangeButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setTimeRange(btn.value)}
              className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                timeRange === btn.value
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="h-48 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                style={{ fontSize: '10px' }}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '10px' }}
                tickFormatter={formatYAxis}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => ['G ' + formatCoin(value), '總資產']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}