import { ArrowUpRight, ArrowDownRight, Plus, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';
import { BetIcon } from '../market-detail/BetIcon';

interface Transaction {
  id: string;
  type: 'bet' | 'close' | 'reward' | 'deposit';
  marketTitle?: string;
  optionName?: string;
  direction?: 'yes' | 'no';
  amount: number;
  balance: number;
  timestamp: Date;
}

export function ProfileTransactions() {
  // Mock transaction data
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'bet',
      marketTitle: '2026 台灣總統大選，民進黨會繼續執政嗎？',
      direction: 'yes',
      amount: -5000,
      balance: 10000,
      timestamp: new Date('2026-01-10T14:30:00'),
    },
    {
      id: '2',
      type: 'close',
      marketTitle: 'NBA 2025-26 總冠軍',
      optionName: '洛杉磯湖人',
      direction: 'yes',
      amount: 6500,
      balance: 15000,
      timestamp: new Date('2026-01-09T18:20:00'),
    },
    {
      id: '3',
      type: 'reward',
      amount: 500,
      balance: 8500,
      timestamp: new Date('2026-01-09T10:00:00'),
    },
    {
      id: '4',
      type: 'bet',
      marketTitle: 'NBA 2025-26 總冠軍',
      optionName: '波士頓塞爾提克',
      direction: 'no',
      amount: -3000,
      balance: 8000,
      timestamp: new Date('2026-01-08T16:45:00'),
    },
    {
      id: '5',
      type: 'deposit',
      amount: 10000,
      balance: 11000,
      timestamp: new Date('2026-01-01T09:00:00'),
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bet':
        return <ArrowDownRight className="w-4 h-4" />;
      case 'close':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'reward':
        return <Plus className="w-4 h-4" />;
      case 'deposit':
        return <Plus className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (transaction: Transaction) => {
    if (transaction.type === 'bet') {
      if (transaction.optionName) {
        return `下注 ${transaction.optionName}`;
      }
      return '下注';
    } else if (transaction.type === 'close') {
      if (transaction.optionName) {
        return `平倉 ${transaction.optionName}`;
      }
      return '平倉';
    } else if (transaction.type === 'reward') {
      return '任務獎勵';
    } else if (transaction.type === 'deposit') {
      return '充值';
    }
    return transaction.type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bet':
        return 'text-red-600 bg-red-50';
      case 'close':
        return 'text-green-600 bg-green-50';
      case 'reward':
        return 'text-yellow-600 bg-yellow-50';
      case 'deposit':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">類型</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">詳情</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">金額</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">餘額</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">時間</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                {/* Type */}
                <td className="px-4 py-3">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                    {getTypeIcon(transaction.type)}
                    <span>{getTypeLabel(transaction)}</span>
                    {(transaction.type === 'bet' || transaction.type === 'close') && transaction.direction && (
                      <BetIcon direction={transaction.direction} size="sm" />
                    )}
                  </div>
                </td>

                {/* Details */}
                <td className="px-4 py-3">
                  {transaction.marketTitle ? (
                    <p className="text-sm text-slate-900 line-clamp-2">{transaction.marketTitle}</p>
                  ) : (
                    <p className="text-sm text-slate-500">-</p>
                  )}
                </td>

                {/* Amount */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
                    <span className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </td>

                {/* Balance */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
                    <span className="text-sm text-slate-900">{transaction.balance.toLocaleString()}</span>
                  </div>
                </td>

                {/* Time */}
                <td className="px-4 py-3 text-right">
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(transaction.timestamp, { addSuffix: true, locale: zhTW })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-200">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-3">
            {/* Type and Amount */}
            <div className="flex items-start justify-between mb-2">
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                {getTypeIcon(transaction.type)}
                <span>{getTypeLabel(transaction)}</span>
                {(transaction.type === 'bet' || transaction.type === 'close') && transaction.direction && (
                  <BetIcon direction={transaction.direction} size="sm" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <img src={gcoinImage} alt="G coin" className="w-3.5 h-3.5" />
                <span className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Market Title */}
            {transaction.marketTitle && (
              <p className="text-xs text-slate-700 mb-1.5 line-clamp-2">{transaction.marketTitle}</p>
            )}

            {/* Balance and Time */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {formatDistanceToNow(transaction.timestamp, { addSuffix: true, locale: zhTW })}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-slate-500">餘額</span>
                <img src={gcoinImage} alt="G coin" className="w-3 h-3" />
                <span className="text-slate-700 font-medium">{transaction.balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="border-t border-slate-200 p-3 text-center">
        <button className="px-4 py-2 text-sm bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors">
          載入更多
        </button>
      </div>
    </div>
  );
}