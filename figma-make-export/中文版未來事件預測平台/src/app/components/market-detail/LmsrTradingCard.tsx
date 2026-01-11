import { useState } from 'react';
import { Circle, X as XIcon, TrendingUp, AlertCircle } from 'lucide-react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';

interface Market {
  id: string;
  title: string;
  type: 'yes_no' | 'single_choice' | 'multiple_choice';
  probability?: number;
  options?: Array<{ id: string; name: string; probability: number }>;
}

interface LmsrTradingCardProps {
  market: Market;
  isLoggedIn: boolean;
}

interface SelectedBet {
  optionId: string;
  direction: 'yes' | 'no';
}

export function LmsrTradingCard({ market, isLoggedIn }: LmsrTradingCardProps) {
  const [selectedBet, setSelectedBet] = useState<SelectedBet | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [balance] = useState(10000); // Mock balance

  const handleQuickAdd = (value: number) => {
    setAmount(Math.min(amount + value, balance));
  };

  const handleAllIn = () => {
    setAmount(balance);
  };

  const handleSelectOption = (optionId: string, dir: 'yes' | 'no') => {
    // 如果點擊相同的選項，清除選擇
    if (selectedBet?.optionId === optionId && selectedBet?.direction === dir) {
      setSelectedBet(null);
      setAmount(0);
    } else {
      setSelectedBet({ optionId, direction: dir });
      setAmount(0);
    }
  };

  const calculateEstimate = () => {
    if (!amount || amount === 0 || !selectedBet) return null;
    
    const fee = Math.floor(amount * 0.02);
    const shares = amount - fee;
    const currentValue = Math.floor(shares * 0.98);
    
    let currentProb = 50;
    if (market.type === 'yes_no' && market.probability !== undefined) {
      currentProb = selectedBet.optionId === 'yes' ? market.probability : 100 - market.probability;
    } else if (market.options) {
      const option = market.options.find(o => o.id === selectedBet.optionId);
      currentProb = option?.probability || 50;
    }
    
    const newProbability = currentProb + (selectedBet.direction === 'yes' ? 2 : -2);

    return {
      fee,
      shares: (shares / 100).toFixed(2),
      currentValue,
      currentProb,
      newProbability: Math.max(1, Math.min(99, newProbability)),
    };
  };

  const estimate = calculateEstimate();

  if (!isLoggedIn) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">需要登入才能交易</h3>
        <p className="text-slate-600 mb-6">請先登入您的帳號以進行預測交易</p>
        <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all">
          使用 Google 登入
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6">下注預測</h2>

      {/* Type Hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
        <p className="text-blue-900 text-sm flex items-center gap-2 flex-wrap">
          <span>💡</span>
          {market.type === 'yes_no' && (
            <>
              <span>這是是非題，點擊</span>
              <Circle className="w-4 h-4 text-green-600 inline" />
              <span>或</span>
              <XIcon className="w-4 h-4 text-red-600 inline" />
              <span>進行預測</span>
            </>
          )}
          {market.type === 'single_choice' && (
            <>
              <span>這是單選題，每個選項都可以選</span>
              <Circle className="w-4 h-4 text-green-600 inline" />
              <span>或</span>
              <XIcon className="w-4 h-4 text-red-600 inline" />
            </>
          )}
          {market.type === 'multiple_choice' && (
            <>
              <span>這是多選題，每個選項都可以選</span>
              <Circle className="w-4 h-4 text-green-600 inline" />
              <span>或</span>
              <XIcon className="w-4 h-4 text-red-600 inline" />
            </>
          )}
        </p>
      </div>

      {/* Options Selection */}
      <div className="space-y-3">
        {/* Yes/No Question */}
        {market.type === 'yes_no' && market.probability !== undefined && (
          <div className="space-y-3">
            <div
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedBet?.optionId === 'yes'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200'
              }`}
            >
              {/* Selected Indicator */}
              {selectedBet?.optionId === 'yes' && (
                <div className={`mb-3 px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                  selectedBet.direction === 'yes' 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  <span>你正在選擇：</span>
                  {selectedBet.direction === 'yes' ? (
                    <Circle className="w-4 h-4" />
                  ) : (
                    <XIcon className="w-4 h-4" />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="text-3xl font-bold text-indigo-600">{market.probability}%</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSelectOption('yes', 'yes')}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg transition-all ${
                      selectedBet?.optionId === 'yes' && selectedBet?.direction === 'yes'
                        ? 'bg-green-600 shadow-lg scale-110'
                        : selectedBet?.optionId === 'yes' && selectedBet?.direction === 'no'
                        ? 'bg-green-500/40 hover:bg-green-500'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    <Circle className="w-7 h-7 text-white stroke-[2.5]" />
                  </button>
                  <button
                    onClick={() => handleSelectOption('yes', 'no')}
                    className={`w-14 h-14 flex items-center justify-center rounded-lg transition-all ${
                      selectedBet?.optionId === 'yes' && selectedBet?.direction === 'no'
                        ? 'bg-red-600 shadow-lg scale-110'
                        : selectedBet?.optionId === 'yes' && selectedBet?.direction === 'yes'
                        ? 'bg-red-500/40 hover:bg-red-500'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    <XIcon className="w-7 h-7 text-white stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Amount Input for this option */}
              {selectedBet?.optionId === 'yes' && (
                <AmountInput
                  amount={amount}
                  balance={balance}
                  onAmountChange={setAmount}
                  onQuickAdd={handleQuickAdd}
                  onAllIn={handleAllIn}
                />
              )}
            </div>
          </div>
        )}

        {/* Single/Multiple Choice Questions */}
        {(market.type === 'single_choice' || market.type === 'multiple_choice') && market.options && (
          <div className="space-y-3">
            {market.options.map((option) => (
              <div
                key={option.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedBet?.optionId === option.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200'
                }`}
              >
                {/* Selected Indicator */}
                {selectedBet?.optionId === option.id && (
                  <div className={`mb-3 px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                    selectedBet.direction === 'yes' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    <span>你正在選擇：{option.name}</span>
                    {selectedBet.direction === 'yes' ? (
                      <Circle className="w-4 h-4" />
                    ) : (
                      <XIcon className="w-4 h-4" />
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 mb-1">{option.name}</p>
                    <p className="text-2xl font-bold text-indigo-600">{option.probability}%</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSelectOption(option.id, 'yes')}
                      className={`w-14 h-14 flex items-center justify-center rounded-lg transition-all ${
                        selectedBet?.optionId === option.id && selectedBet?.direction === 'yes'
                          ? 'bg-green-600 shadow-lg scale-110'
                          : selectedBet?.optionId === option.id && selectedBet?.direction === 'no'
                          ? 'bg-green-500/40 hover:bg-green-500'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      <Circle className="w-7 h-7 text-white stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => handleSelectOption(option.id, 'no')}
                      className={`w-14 h-14 flex items-center justify-center rounded-lg transition-all ${
                        selectedBet?.optionId === option.id && selectedBet?.direction === 'no'
                          ? 'bg-red-600 shadow-lg scale-110'
                          : selectedBet?.optionId === option.id && selectedBet?.direction === 'yes'
                          ? 'bg-red-500/40 hover:bg-red-500'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      <XIcon className="w-7 h-7 text-white stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Amount Input for this option */}
                {selectedBet?.optionId === option.id && (
                  <AmountInput
                    amount={amount}
                    balance={balance}
                    onAmountChange={setAmount}
                    onQuickAdd={handleQuickAdd}
                    onAllIn={handleAllIn}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estimate */}
      {estimate && selectedBet && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">這筆交易會花你</p>
              <div className="flex items-center gap-2">
                <img src={gcoinImage} alt="G coin" className="w-5 h-5" />
                <span className="text-2xl font-bold text-slate-900">{amount.toLocaleString()}</span>
                <span className="text-sm text-slate-500">(含手續費 {estimate.fee})</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">將獲得 {estimate.shares} shares</p>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">如果現在反悔</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-lg font-bold text-green-600">
                  {estimate.currentValue.toLocaleString()} G Coin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">⚠️ 實際金額會隨市場變動</p>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">你對市場造成的影響</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-indigo-600">
                  {estimate.currentProb}% → {estimate.newProbability}%
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            disabled={!amount || amount === 0}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            確認交易
          </button>

          <p className="text-xs text-center text-slate-500">
            ⚠️ 這是虛擬貨幣交易，不可兌換現金
          </p>
        </div>
      )}
    </div>
  );
}

// Amount Input Component
interface AmountInputProps {
  amount: number;
  balance: number;
  onAmountChange: (amount: number) => void;
  onQuickAdd: (value: number) => void;
  onAllIn: () => void;
}

function AmountInput({ amount, balance, onAmountChange, onQuickAdd, onAllIn }: AmountInputProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-4 mt-3 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">錢包餘額</span>
        <div className="flex items-center gap-1">
          <img src={gcoinImage} alt="G coin" className="w-4 h-4" />
          <span className="font-bold text-slate-900">{balance.toLocaleString()}</span>
        </div>
      </div>

      <input
        type="number"
        value={amount || ''}
        onChange={(e) => onAmountChange(Math.min(parseInt(e.target.value) || 0, balance))}
        placeholder="輸入金額"
        className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      {/* Slider */}
      <div className="px-1 py-2">
        <SliderPrimitive.Root
          value={[amount]}
          onValueChange={(value) => onAmountChange(value[0])}
          max={balance}
          step={10}
          className="relative flex items-center select-none touch-none w-full h-5"
        >
          <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-slate-300">
            <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="block w-5 h-5 bg-white border-2 border-indigo-600 rounded-full shadow-md hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" />
        </SliderPrimitive.Root>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onQuickAdd(50)}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors"
        >
          +50
        </button>
        <button
          onClick={() => onQuickAdd(100)}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors"
        >
          +100
        </button>
        <button
          onClick={() => onQuickAdd(1000)}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors"
        >
          +1000
        </button>
        <button
          onClick={onAllIn}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all"
        >
          ALL IN
        </button>
      </div>
    </div>
  );
}