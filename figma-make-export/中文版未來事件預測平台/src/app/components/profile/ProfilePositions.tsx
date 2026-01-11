import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';
import { BetIcon } from '../market-detail/BetIcon';

interface Position {
  id: string;
  marketId: string;
  marketTitle: string;
  marketType: 'yes_no' | 'single_choice' | 'multiple_choice';
  optionName?: string;
  direction: 'yes' | 'no';
  shares: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

export function ProfilePositions() {
  const navigate = useNavigate();
  const [closingPosition, setClosingPosition] = useState<string | null>(null);

  const handleClosePosition = (e: React.MouseEvent, positionId: string, currentValue: number) => {
    e.stopPropagation(); // Prevent navigation
    setClosingPosition(positionId);
    // Simulate close position
    setTimeout(() => {
      alert(`成功平倉！獲得 ${currentValue.toLocaleString()} G Coin`);
      setClosingPosition(null);
    }, 500);
  };

  // Mock positions data
  const positions: Position[] = [
    {
      id: '1',
      marketId: '1',
      marketTitle: '2026 台灣總統大選，民進黨會繼續執政嗎？',
      marketType: 'yes_no',
      direction: 'yes',
      shares: 50,
      avgPrice: 65,
      currentPrice: 70,
      invested: 5000,
      currentValue: 5500,
      pnl: 500,
      pnlPercent: 10,
    },
    {
      id: '2',
      marketId: '5',
      marketTitle: 'NBA 2025-26 總冠軍',
      marketType: 'single_choice',
      optionName: '洛杉磯湖人',
      direction: 'yes',
      shares: 30,
      avgPrice: 35,
      currentPrice: 40,
      invested: 3000,
      currentValue: 3600,
      pnl: 600,
      pnlPercent: 20,
    },
    {
      id: '3',
      marketId: '5',
      marketTitle: 'NBA 2025-26 總冠軍',
      marketType: 'single_choice',
      optionName: '波士頓塞爾提克',
      direction: 'no',
      shares: 20,
      avgPrice: 28,
      currentPrice: 25,
      invested: 2000,
      currentValue: 1800,
      pnl: -200,
      pnlPercent: -10,
    },
  ];

  const totalInvested = positions.reduce((sum, p) => sum + p.invested, 0);
  const totalCurrentValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 md:p-6">
        <h3 className="text-sm font-medium text-slate-600 mb-3">持倉總覽</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-600 mb-1">總投入</p>
            <div className="flex items-center gap-1">
              <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
              <span className="text-lg font-bold text-slate-900">{totalInvested.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">當前價值</p>
            <div className="flex items-center gap-1">
              <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
              <span className="text-lg font-bold text-slate-900">{totalCurrentValue.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">未實現盈虧</p>
            <div className="flex items-center gap-1">
              <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
              <span className={`text-lg font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnl >= 0 ? '+' : ''}{totalPnl.toLocaleString()}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">盈虧比例</p>
            <div className="flex items-center gap-1">
              {totalPnl >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
              <span className={`text-lg font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnl >= 0 ? '+' : ''}{totalPnlPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">當前持倉 ({positions.length})</h3>
        </div>

        <div className="divide-y divide-slate-200">
          {positions.map((position) => (
            <div
              key={position.id}
              className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => navigate(`/market/${position.marketId}`)}
            >
              {/* Market Title */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <h4 className="text-sm font-medium text-slate-900 line-clamp-2 flex-1">
                  {position.marketTitle}
                </h4>
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  position.pnl >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%
                </div>
              </div>

              {/* Position Details */}
              <div className="flex items-center gap-2 mb-3 text-sm">
                {position.marketType !== 'yes_no' && position.optionName && (
                  <span className="font-medium text-slate-700">{position.optionName}</span>
                )}
                <BetIcon direction={position.direction} size="sm" />
                <span className="text-slate-600">•</span>
                <span className="text-slate-600">{position.shares} shares</span>
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-slate-500 mb-1">平均成本</p>
                  <p className="font-bold text-slate-900">{position.avgPrice}%</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">當前價格</p>
                  <p className="font-bold text-slate-900">{position.currentPrice}%</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">總投入</p>
                  <div className="flex items-center gap-1">
                    <img src={gcoinImage} alt="G coin" className="w-3 h-3" />
                    <span className="font-bold text-slate-900">{position.invested.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">當前價值</p>
                  <div className="flex items-center gap-1">
                    <img src={gcoinImage} alt="G coin" className="w-3 h-3" />
                    <span className={`font-bold ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {position.currentValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Position Button */}
              <div className="flex items-center justify-end mt-3">
                <button
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    closingPosition === position.id
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  }`}
                  onClick={(e) => handleClosePosition(e, position.id, position.currentValue)}
                  disabled={closingPosition === position.id}
                >
                  {closingPosition === position.id ? '處理中...' : '平倉'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}