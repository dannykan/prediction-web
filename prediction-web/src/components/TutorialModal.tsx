'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Sparkles, CheckCircle2, ArrowRight, Clock, Zap, Trophy, Timer } from 'lucide-react';
import Image from 'next/image';
import { signInWithGooglePopup } from '@/core/auth/googleSignIn';
import { getMe } from '@/features/user/api/getMe';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'intro' | 'choice' | 'amount' | 'result' | 'time_progress' | 'early_exit' | 'final_settlement' | 'final_result' | 'complete';

export function TutorialModal({ isOpen, onClose, onComplete }: TutorialModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('intro');
  const [selectedChoice, setSelectedChoice] = useState<'yes' | 'no' | null>(null);
  const [betAmount, setBetAmount] = useState('50');
  const [showAnimation, setShowAnimation] = useState(false);
  const [settlementPath, setSettlementPath] = useState<'early' | 'final' | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Demo question data - initial state
  const demoQuestion = {
    title: '2026 年台灣會下雪嗎？',
    description: '預測 2026 年台灣本島是否會出現降雪',
    yesOdds: 2.5,
    noOdds: 1.6,
    yesPercentage: 35,
    noPercentage: 65,
    // After time progress - probability shifts
    newYesPercentage: 48,
    newNoPercentage: 52,
    newYesOdds: 2.1,
    newNoOdds: 1.9,
  };

  // Calculate potential profit
  const calculateProfit = (useNewOdds = false) => {
    const amount = parseInt(betAmount) || 0;
    let odds: number;
    
    if (useNewOdds) {
      odds = selectedChoice === 'yes' ? demoQuestion.newYesOdds : demoQuestion.newNoOdds;
    } else {
      odds = selectedChoice === 'yes' ? demoQuestion.yesOdds : demoQuestion.noOdds;
    }
    
    const profit = Math.round(amount * odds);
    const netProfit = profit - amount;
    return { profit, netProfit };
  };

  const initialProfit = calculateProfit(false);
  const earlyExitProfit = calculateProfit(true);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setSelectedChoice(null);
      setBetAmount('50');
      setShowAnimation(false);
      setSettlementPath(null);
    }
  }, [isOpen]);

  const handleChoiceSelect = (choice: 'yes' | 'no') => {
    setSelectedChoice(choice);
    setTimeout(() => setStep('amount'), 300);
  };

  const handleBetSubmit = () => {
    setStep('result');
    setShowAnimation(true);
  };

  const handleResultContinue = () => {
    setShowAnimation(false);
    setTimeout(() => {
      setStep('time_progress');
      setShowAnimation(true);
    }, 300);
  };

  const handleEarlyExit = () => {
    setSettlementPath('early');
    setShowAnimation(false);
    setTimeout(() => {
      setStep('early_exit');
      setShowAnimation(true);
    }, 300);
  };

  const handleWaitForFinal = () => {
    setSettlementPath('final');
    setShowAnimation(false);
    setTimeout(() => {
      setStep('final_settlement');
      setShowAnimation(true);
    }, 300);
  };

  // Auto-advance from final_settlement to final_result after 2 seconds
  useEffect(() => {
    if (step === 'final_settlement' && showAnimation) {
      const timer = setTimeout(() => {
        setShowAnimation(false);
        setTimeout(() => {
          setStep('final_result');
          setShowAnimation(true);
        }, 300);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [step, showAnimation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Content */}
        <div className="p-6 sm:p-8">
          
          {/* Step 1: Intro */}
          {step === 'intro' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                歡迎來到神預測！
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                在這裡，你可以預測未來事件的結果，<br />
                <span className="font-semibold text-indigo-600">答對就能賺取 G Coin！</span>
              </p>

              {/* Demo coin display */}
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-full mb-6">
                <Image src="/images/G_coin_icon.png" alt="G coin" width={24} height={24} className="w-6 h-6" />
                <span className="text-lg font-bold text-amber-700">100 G Coin</span>
                <span className="text-sm text-amber-600">(試玩)</span>
              </div>

              <p className="text-sm text-slate-500 mb-8">
                讓我們用 100 個試玩幣體驗一下吧！
              </p>

              <button
                onClick={() => setStep('choice')}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                開始體驗
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={async () => {
                  if (isSigningIn) return;
                  
                  setIsSigningIn(true);
                  try {
                    await signInWithGooglePopup(
                      async () => {
                        // 登入成功 - 標記為已看過教學並刷新頁面
                        try {
                          await getMe(); // 驗證登入成功
                          onComplete(); // 標記為已看過教學
                          onClose(); // 關閉教學
                          router.refresh(); // 刷新頁面以更新所有組件
                        } catch (error) {
                          console.error('[TutorialModal] Failed to reload user after login:', error);
                          onComplete(); // 仍然標記為已看過
                          onClose();
                          router.refresh(); // 仍然刷新頁面
                        }
                      },
                      (error) => {
                        // 登入失敗
                        alert(`登入失敗: ${error}`);
                        setIsSigningIn(false);
                      }
                    );
                  } catch (error) {
                    console.error('[TutorialModal] Sign in error:', error);
                    alert(`登入錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
                    setIsSigningIn(false);
                  }
                }}
                disabled={isSigningIn}
                className="w-full py-3 mt-3 text-slate-600 text-sm font-medium hover:text-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? '登入中...' : '直接登入 開始預測'}
              </button>
            </div>
          )}

          {/* Step 2: Choice Selection */}
          {step === 'choice' && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full mb-4">
                  <Sparkles className="w-4 h-4" />
                  步驟 1/2
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {demoQuestion.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {demoQuestion.description}
                </p>
              </div>

              {/* Choice buttons */}
              <div className="space-y-3 mb-6">
                {/* Yes option */}
                <button
                  onClick={() => handleChoiceSelect('yes')}
                  className="w-full p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-green-300 hover:bg-green-50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">O</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-lg">會下雪</p>
                        <p className="text-sm text-slate-500">Yes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{demoQuestion.yesOdds}x</p>
                      <p className="text-xs text-slate-500">賠率</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                        style={{ width: `${demoQuestion.yesPercentage}%` }}
                      />
                    </div>
                    <span className="ml-3 text-sm font-semibold text-slate-600">{demoQuestion.yesPercentage}%</span>
                  </div>
                </button>

                {/* No option */}
                <button
                  onClick={() => handleChoiceSelect('no')}
                  className="w-full p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-red-300 hover:bg-red-50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">X</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-lg">不會下雪</p>
                        <p className="text-sm text-slate-500">No</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{demoQuestion.noOdds}x</p>
                      <p className="text-xs text-slate-500">賠率</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all"
                        style={{ width: `${demoQuestion.noPercentage}%` }}
                      />
                    </div>
                    <span className="ml-3 text-sm font-semibold text-slate-600">{demoQuestion.noPercentage}%</span>
                  </div>
                </button>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700 leading-relaxed">
                  <span className="font-semibold">💡 提示：</span> 賠率越高，代表獲利越多！選擇你認為會發生的結果吧。
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Amount Input */}
          {step === 'amount' && (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full mb-4">
                  <Sparkles className="w-4 h-4" />
                  步驟 2/2
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  投入多少 G Coin？
                </h3>
                <p className="text-sm text-slate-500">
                  決定你要投入的金額
                </p>
              </div>

              {/* Selected choice display */}
              <div className={`p-4 rounded-xl mb-6 ${
                selectedChoice === 'yes' 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedChoice === 'yes'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                        : 'bg-gradient-to-br from-red-500 to-rose-600'
                    }`}>
                      <span className="text-xl font-bold text-white">
                        {selectedChoice === 'yes' ? 'O' : 'X'}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-800">
                        {selectedChoice === 'yes' ? '會下雪' : '不會下雪'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      selectedChoice === 'yes' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedChoice === 'yes' ? demoQuestion.yesOdds : demoQuestion.noOdds}x
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  投入金額
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-2xl font-bold text-center border-2 border-slate-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                    min="10"
                    max="100"
                  />
                  <Image 
                    src="/images/G_coin_icon.png" 
                    alt="G coin" 
                    width={24}
                    height={24}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6"
                  />
                </div>

                {/* Quick amount buttons */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[25, 50, 75, 100].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount.toString())}
                      className={`py-2 rounded-lg font-medium transition-all ${
                        betAmount === amount.toString()
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profit calculation */}
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <p className="font-semibold text-slate-800">預期收益</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">投入金額</span>
                    <span className="font-semibold text-slate-800">{betAmount} G Coin</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">賠率</span>
                    <span className="font-semibold text-slate-800">
                      {selectedChoice === 'yes' ? demoQuestion.yesOdds : demoQuestion.noOdds}x
                    </span>
                  </div>
                  <div className="h-px bg-indigo-200 my-2" />
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">如果答對可獲得</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{initialProfit.profit}</p>
                      <p className="text-xs text-green-600 font-semibold">+{initialProfit.netProfit} 淨利</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBetSubmit}
                disabled={!betAmount || parseInt(betAmount) < 10}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                確認下注
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setStep('choice')}
                className="w-full py-3 mt-2 text-slate-600 text-sm font-medium hover:text-slate-800 transition-colors"
              >
                返回選擇
              </button>
            </div>
          )}

          {/* Step 4: Bet Result */}
          {step === 'result' && (
            <div className="text-center py-6">
              {showAnimation && (
                <div>
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full animate-ping opacity-75" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    下注成功！🎉
                  </h3>
                  <p className="text-slate-600 mb-6">
                    你預測：<span className="font-bold text-indigo-600">
                      {selectedChoice === 'yes' ? '會下雪' : '不會下雪'}
                    </span>
                  </p>

                  <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 mb-6">
                    <p className="text-sm text-slate-600 mb-2">投入金額</p>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Image src="/images/G_coin_icon.png" alt="G coin" width={32} height={32} className="w-8 h-8" />
                      <span className="text-4xl font-bold text-slate-800">{betAmount}</span>
                    </div>
                    <p className="text-sm text-indigo-600 font-semibold">
                      賠率 {selectedChoice === 'yes' ? demoQuestion.yesOdds : demoQuestion.noOdds}x
                    </p>
                  </div>

                  <button
                    onClick={handleResultContinue}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
                  >
                    繼續
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Time Progress - Probability Change */}
          {step === 'time_progress' && (
            <div className="text-center py-4">
              {showAnimation && (
                <div>
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center relative">
                    <Clock className="w-10 h-10 text-white animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    一段時間後...
                  </h3>
                  <p className="text-slate-600 mb-6">
                    市場走勢發生變化！
                  </p>

                  {/* Probability change display */}
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <p className="font-bold text-slate-800">你的預測機率上升了！</p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Show selected option probability change */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              selectedChoice === 'yes'
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                : 'bg-gradient-to-br from-red-500 to-rose-600'
                            }`}>
                              <span className="text-lg font-bold text-white">
                                {selectedChoice === 'yes' ? 'O' : 'X'}
                              </span>
                            </div>
                            <span className="font-semibold text-slate-700">
                              {selectedChoice === 'yes' ? '會下雪' : '不會下雪'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-500">機率變化</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-600 line-through">
                              {selectedChoice === 'yes' ? demoQuestion.yesPercentage : demoQuestion.noPercentage}%
                            </span>
                            <ArrowRight className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-600">
                              {selectedChoice === 'yes' ? demoQuestion.newYesPercentage : demoQuestion.newNoPercentage}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">目前價值</span>
                          <div className="flex items-center gap-2">
                            <Image src="/images/G_coin_icon.png" alt="G coin" width={20} height={20} className="w-5 h-5" />
                            <span className="font-bold text-green-600">{earlyExitProfit.profit}</span>
                            <span className="text-xs text-green-600">(+{earlyExitProfit.netProfit})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Two choices */}
                  <div className="space-y-3 mb-4">
                    <button
                      onClick={handleEarlyExit}
                      className="w-full p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-xl transition-all"
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Zap className="w-5 h-5" />
                        <span className="font-bold text-lg">立即平倉</span>
                      </div>
                      <p className="text-sm text-amber-100">
                        現在獲利 +{earlyExitProfit.netProfit} G Coin
                      </p>
                    </button>

                    <button
                      onClick={handleWaitForFinal}
                      className="w-full p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all"
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Timer className="w-5 h-5" />
                        <span className="font-bold text-lg">等待最終結算</span>
                      </div>
                      <p className="text-sm text-indigo-100">
                        答對可獲得 +{initialProfit.netProfit} G Coin
                      </p>
                    </button>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      💡 平倉可以提前鎖定獲利，但放棄了答對的完整獎勵
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6a: Early Exit Result */}
          {step === 'early_exit' && (
            <div className="text-center py-6">
              {showAnimation && (
                <div>
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full animate-ping opacity-75" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                      <Zap className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    平倉成功！⚡
                  </h3>
                  <p className="text-slate-600 mb-6">
                    你選擇提前鎖定獲利
                  </p>

                  <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 mb-6">
                    <p className="text-sm text-slate-600 mb-2">獲利金額</p>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Image src="/images/G_coin_icon.png" alt="G coin" width={40} height={40} className="w-10 h-10" />
                      <span className="text-5xl font-bold text-amber-600">{earlyExitProfit.profit}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 px-4 py-2 bg-green-100 rounded-full">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-green-600">+{earlyExitProfit.netProfit}</span>
                      <span className="text-sm text-green-600">G Coin</span>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 mb-6">
                    <p className="text-sm text-purple-700 leading-relaxed">
                      <span className="font-semibold">✨ 聰明的選擇！</span><br />
                      平倉讓你在市場變化時靈活應對，提前鎖定獲利！
                    </p>
                  </div>

                  <button
                    onClick={() => setStep('complete')}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
                  >
                    太棒了！
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 6b: Final Settlement Animation */}
          {step === 'final_settlement' && (
            <div className="text-center py-8">
              {showAnimation && (
                <div>
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-spin" 
                         style={{ animationDuration: '2s' }}>
                      <div className="w-full h-full rounded-full border-4 border-white border-t-transparent" />
                    </div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Timer className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    時間快轉中...
                  </h3>
                  <p className="text-slate-600 mb-8">
                    等待最終結果公布
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6c: Final Result */}
          {step === 'final_result' && (
            <div className="text-center py-6">
              {showAnimation && (
                <div>
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full animate-ping opacity-75" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    預測正確！🏆
                  </h3>
                  <p className="text-slate-600 mb-6">
                    結果公布：<span className="font-bold text-green-600">
                      {selectedChoice === 'yes' ? '確實下雪了' : '沒有下雪'}
                    </span>
                  </p>

                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300 mb-6">
                    <p className="text-sm text-slate-600 mb-2">最終獲利</p>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Image src="/images/G_coin_icon.png" alt="G coin" width={40} height={40} className="w-10 h-10" />
                      <span className="text-5xl font-bold text-green-600">{initialProfit.profit}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 px-4 py-2 bg-green-200 rounded-full">
                      <Trophy className="w-4 h-4 text-green-700" />
                      <span className="text-lg font-bold text-green-700">+{initialProfit.netProfit}</span>
                      <span className="text-sm text-green-700">G Coin</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
                    <p className="text-sm text-blue-700 leading-relaxed">
                      <span className="font-semibold">🎯 恭喜！</span><br />
                      耐心等待獲得完整獎勵，你的判斷力很準確！
                    </p>
                  </div>

                  <button
                    onClick={() => setStep('complete')}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
                  >
                    太棒了！
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 7: Complete */}
          {step === 'complete' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                準備好開始了嗎？
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                現在你已經了解神預測的玩法了！<br />
                <span className="font-semibold text-indigo-600">
                  登入後即可開始真正的預測之旅
                </span>
              </p>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 mb-6">
                <p className="text-sm text-slate-600 mb-2">🎁 新用戶註冊禮</p>
                <div className="flex items-center justify-center gap-2">
                  <Image src="/images/G_coin_icon.png" alt="G coin" width={28} height={28} className="w-7 h-7" />
                  <span className="text-3xl font-bold text-green-600">1000</span>
                  <span className="text-slate-700 font-semibold">G Coin</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">首次登入即可獲得</p>
              </div>

              <button
                onClick={async () => {
                  if (isSigningIn) return;
                  
                  setIsSigningIn(true);
                  try {
                    await signInWithGooglePopup(
                      async () => {
                        // 登入成功 - 標記為已看過教學並刷新頁面
                        try {
                          await getMe(); // 驗證登入成功
                          onComplete(); // 標記為已看過教學
                          onClose(); // 關閉教學
                          router.refresh(); // 刷新頁面以更新所有組件
                        } catch (error) {
                          console.error('[TutorialModal] Failed to reload user after login:', error);
                          onComplete(); // 仍然標記為已看過
                          onClose();
                          router.refresh(); // 仍然刷新頁面
                        }
                      },
                      (error) => {
                        // 登入失敗
                        alert(`登入失敗: ${error}`);
                        setIsSigningIn(false);
                      }
                    );
                  } catch (error) {
                    console.error('[TutorialModal] Sign in error:', error);
                    alert(`登入錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
                    setIsSigningIn(false);
                  }
                }}
                disabled={isSigningIn}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningIn ? '登入中...' : '立即領取開始預測'}
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 text-slate-600 text-sm font-medium hover:text-slate-800 transition-colors"
              >
                稍後再說
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
