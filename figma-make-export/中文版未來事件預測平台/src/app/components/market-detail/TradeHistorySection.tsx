import { useState } from 'react';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';
import { BetIcon } from './BetIcon';

interface TradeHistorySectionProps {
  marketId: string;
  isLoggedIn: boolean;
  marketType?: 'yes_no' | 'single_choice' | 'multiple_choice';
}

interface Position {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  option: string;
  direction: 'yes' | 'no';
  profitLoss: number;
  profitLossPercent: number;
  cost: number;
  currentValue: number;
  shares: number;
  entryTime: Date;
}

interface Trade {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: 'buy' | 'sell';
  option: string;
  direction: 'yes' | 'no';
  amount: number;
  shares: number;
  time: Date;
}

export function TradeHistorySection({ marketId, isLoggedIn, marketType = 'yes_no' }: TradeHistorySectionProps) {
  const [activeTab, setActiveTab] = useState<'positions' | 'trades'>('positions');

  const positions: Position[] = [
    {
      id: '1',
      user: {
        name: '投資達人',
        avatar: 'https://i.pravatar.cc/150?u=trader1',
      },
      option: marketType === 'yes_no' ? '' : '洛杉磯湖人',
      direction: 'yes',
      profitLoss: 1250,
      profitLossPercent: 25,
      cost: 5000,
      currentValue: 6250,
      shares: 52.4,
      entryTime: new Date('2026-01-05T10:00:00'),
    },
    {
      id: '2',
      user: {
        name: '預測高手',
        avatar: 'https://i.pravatar.cc/150?u=trader2',
      },
      option: marketType === 'yes_no' ? '' : '洛杉磯湖人',
      direction: 'no',
      profitLoss: -500,
      profitLossPercent: -10,
      cost: 5000,
      currentValue: 4500,
      shares: 45.2,
      entryTime: new Date('2026-01-06T14:30:00'),
    },
    {
      id: '3',
      user: {
        name: '市場觀察者',
        avatar: 'https://i.pravatar.cc/150?u=trader3',
      },
      option: marketType === 'yes_no' ? '' : '波士頓塞爾提克',
      direction: 'yes',
      profitLoss: 800,
      profitLossPercent: 20,
      cost: 4000,
      currentValue: 4800,
      shares: 41.8,
      entryTime: new Date('2026-01-07T09:15:00'),
    },
  ];

  const trades: Trade[] = [
    {
      id: '1',
      user: {
        name: '投資達人',
        avatar: 'https://i.pravatar.cc/150?u=trader1',
      },
      action: 'buy',
      option: marketType === 'yes_no' ? '' : '洛杉磯湖人',
      direction: 'yes',
      amount: 5000,
      shares: 52.4,
      time: new Date('2026-01-10T14:30:00'),
    },
    {
      id: '2',
      user: {
        name: '小明',
        avatar: 'https://i.pravatar.cc/150?u=trader4',
      },
      action: 'sell',
      option: marketType === 'yes_no' ? '' : '洛杉磯湖人',
      direction: 'no',
      amount: 2500,
      shares: 25.1,
      time: new Date('2026-01-10T13:15:00'),
    },
    {
      id: '3',
      user: {
        name: '預測高手',
        avatar: 'https://i.pravatar.cc/150?u=trader2',
      },
      action: 'buy',
      option: marketType === 'yes_no' ? '' : '波士頓塞爾提克',
      direction: 'no',
      amount: 3000,
      shares: 30.5,
      time: new Date('2026-01-10T11:00:00'),
    },
  ];

  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">需要登入才能查看交易記錄</h3>
        <p className="text-slate-600 mb-4">登入後即可查看所有持倉和交易歷史</p>
        <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all">
          使用 Google 登入
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">持倉與交易</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('positions')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'positions'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          當前持倉
        </button>
        <button
          onClick={() => setActiveTab('trades')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'trades'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          交易記錄
        </button>
      </div>

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="space-y-4">
          {positions.map((position) => (
            <div
              key={position.id}
              className="p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <img
                  src={position.user.avatar}
                  alt={position.user.name}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-900">{position.user.name}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-slate-600">選項：</span>
                        <div className="flex items-center gap-1">
                          {marketType !== 'yes_no' && position.option && (
                            <span className="font-medium text-slate-900">{position.option}</span>
                          )}
                          <BetIcon direction={position.direction} size="md" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">投入成本：</span>
                          <div className="flex items-center gap-1">
                            <img src={gcoinImage} alt="G coin" className="w-3 h-3" />
                            <span className="font-bold">{position.cost.toLocaleString()}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-600">當前價值：</span>
                          <div className="flex items-center gap-1">
                            <img src={gcoinImage} alt="G coin" className="w-3 h-3" />
                            <span className="font-bold">{position.currentValue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className={`w-5 h-5 ${position.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        <div>
                          <div className={`text-xl font-bold ${position.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {position.profitLoss >= 0 ? '+' : ''}{position.profitLoss.toLocaleString()}
                          </div>
                          <div className={`text-sm ${position.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({position.profitLoss >= 0 ? '+' : ''}{position.profitLossPercent}%)
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>持倉 {formatDistanceToNow(position.entryTime, { locale: zhTW })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {positions.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>目前沒有持倉</p>
            </div>
          )}
        </div>
      )}

      {/* Trades Tab */}
      {activeTab === 'trades' && (
        <div className="space-y-3">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className={`p-4 rounded-lg border ${
                trade.action === 'buy'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={trade.user.avatar}
                  alt={trade.user.name}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-slate-900">{trade.user.name}</span>
                    <span className="text-sm text-slate-600">
                      {trade.action === 'buy' ? '選擇' : '取消選擇'}
                    </span>
                    {marketType !== 'yes_no' && trade.option && (
                      <span className="font-medium text-slate-700">{trade.option}</span>
                    )}
                    <BetIcon direction={trade.direction} size="md" />
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className={`flex items-center gap-1 font-bold ${
                      trade.action === 'buy' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {trade.action === 'buy' ? '-' : '+'}
                      <img src={gcoinImage} alt="G coin" className="w-3 h-3" />
                      {trade.amount.toLocaleString()}
                    </div>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-600">{trade.shares} shares</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-500">
                      {formatDistanceToNow(trade.time, { addSuffix: true, locale: zhTW })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {trades.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>目前沒有交易記錄</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}