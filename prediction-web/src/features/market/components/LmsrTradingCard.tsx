"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { Circle, X as XIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  getOptionMarketsByMarketId, 
  getExclusiveMarketByMarketId,
  quoteOptionMarket, 
  tradeOptionMarket,
  quoteExclusiveMarket,
  tradeExclusiveMarket,
  bundleQuote,
  bundleTrade,
  getUserPositions,
  getExclusiveMarketPositions,
  type OptionMarketInfo,
  type ExclusiveMarketInfo,
  type ExclusiveOutcomeInfo,
  type ExclusiveQuoteResult,
  type QuoteResult,
  type BundleQuoteResult,
  type TradeSide,
  type AmountType,
  type BundleQuoteDto,
  type Position,
  type ExclusivePosition,
} from "../api/lmsr";
import { getAllTrades } from "../api/getAllTrades";
import { formatPercentage, formatCurrency } from "@/shared/utils/format";
import type { Market } from "../types/market";
import { getMe } from "@/features/user/api/getMe";
import type { User } from "@/features/user/types/user";
import { ProbabilityChart } from "./ProbabilityChart";
import { MarketDetailClient } from "./MarketDetailClient";

interface LmsrTradingCardProps {
  marketId: string;
  market?: Market; // 傳入 market 對象以獲取 questionType 和 options
  onLogin?: () => void | Promise<void>; // 登入回調函數
  onTradeSuccess?: () => void | Promise<void>; // 交易成功後的回調函數
}

export function LmsrTradingCard({ marketId, market, onLogin, onTradeSuccess }: LmsrTradingCardProps) {
  const [optionMarkets, setOptionMarkets] = useState<OptionMarketInfo[]>([]);
  const [exclusiveMarket, setExclusiveMarket] = useState<ExclusiveMarketInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentYesProbability, setCurrentYesProbability] = useState<number | null>(null); // 當前 YES 機率（從最後一筆交易獲取）
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionMarket, setSelectedOptionMarket] = useState<string | null>(null);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(null); // For exclusive markets
  const [selectedSide, setSelectedSide] = useState<TradeSide>("BUY_YES"); // 新增：選擇 YES 或 NO
  const [amountType, setAmountType] = useState<AmountType>("COIN");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<QuoteResult | BundleQuoteResult | ExclusiveQuoteResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [trading, setTrading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [exclusivePositions, setExclusivePositions] = useState<ExclusivePosition[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null); // Track which position is being closed
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [selectedOptionsForChart, setSelectedOptionsForChart] = useState<Set<string>>(new Set()); // For multiple choice: track which options are selected for chart display
  
  const questionType = market?.questionType || 'YES_NO';
  const isBinary = questionType === 'YES_NO';
  const isSingle = questionType === 'SINGLE_CHOICE';
  const isMultiple = questionType === 'MULTIPLE_CHOICE';

  // Helper function to render amount input section
  const renderAmountInputSection = () => {
    if (!currentUser) {
      return (
        <div className="mt-3 pt-3 border-t">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
            <div className="mb-2">⚠️ 請先註冊或登入後才能進行交易</div>
            {onLogin && (
              <Button
                onClick={async () => {
                  if (onLogin) {
                    await onLogin();
                  }
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
              >
                立即登入
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-3 pt-3 border-t">
        <Label className="text-base font-semibold">你想投入多少？</Label>
        <div className="mt-2 space-y-3">
          {/* Wallet Balance */}
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
            <span>錢包餘額：</span>
            <NextImage 
              src="/images/G_coin_icon.png" 
              alt="G coin" 
              width={16} 
              height={16}
              className="w-4 h-4 flex-shrink-0"
            />
            <strong className="text-green-600 dark:text-green-400">{formatCurrency(currentUser.coinBalance || 0)}</strong>
          </div>

          {/* Input Field */}
          <Input
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (parseFloat(value) >= 0 && Number.isInteger(parseFloat(value)))) {
                setAmount(value);
              }
            }}
            placeholder="輸入數量"
            className="text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          {/* Slider */}
          {(() => {
            const balance = Math.max(1, Math.floor(currentUser.coinBalance || 0));
            const currentAmount = Math.min(parseFloat(amount) || 0, balance);
            const percentage = (currentAmount / balance) * 100;
            
            return (
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={balance}
                  step="1"
                  value={currentAmount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 0) {
                      setAmount(value.toString());
                    }
                  }}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0</span>
                  <span>{formatCurrency(balance)}</span>
                </div>
              </div>
            );
          })()}

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const balance = Math.floor(currentUser.coinBalance || 0);
                const currentAmount = Math.floor(parseFloat(amount) || 0);
                const newAmount = Math.min(currentAmount + 50, balance);
                setAmount(newAmount.toString());
              }}
              disabled={(parseFloat(amount) || 0) >= Math.floor(currentUser.coinBalance || 0)}
            >
              +50
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const balance = Math.floor(currentUser.coinBalance || 0);
                const currentAmount = Math.floor(parseFloat(amount) || 0);
                const newAmount = Math.min(currentAmount + 100, balance);
                setAmount(newAmount.toString());
              }}
              disabled={(parseFloat(amount) || 0) >= Math.floor(currentUser.coinBalance || 0)}
            >
              +100
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const balance = Math.floor(currentUser.coinBalance || 0);
                const currentAmount = Math.floor(parseFloat(amount) || 0);
                const newAmount = Math.min(currentAmount + 1000, balance);
                setAmount(newAmount.toString());
              }}
              disabled={(parseFloat(amount) || 0) >= Math.floor(currentUser.coinBalance || 0)}
            >
              +1000
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const balance = Math.floor(currentUser.coinBalance || 0);
                setAmount(balance.toString());
              }}
              disabled={(parseFloat(amount) || 0) >= Math.floor(currentUser.coinBalance || 0)}
            >
              ALL IN
            </Button>
          </div>

          {/* Validation Message */}
          {amount && parseFloat(amount) > 0 && (
            (() => {
              const amountNum = parseFloat(amount);
              const balance = currentUser.coinBalance || 0;
              // 如果不是整數，自動修正為整數
              if (!Number.isInteger(amountNum)) {
                const rounded = Math.floor(amountNum);
                if (rounded > 0) {
                  setAmount(rounded.toString());
                  return null;
                }
              }
              // 驗證整數（如果用戶手動輸入非整數，會在上面的邏輯中自動修正）
              if (!Number.isInteger(amountNum)) {
                return (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    請輸入整數數量
                  </div>
                );
              }
              if (amountNum > balance) {
                return (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    輸入數量不能超過餘額 {formatCurrency(balance)} G Coin
                  </div>
                );
              }
              return null;
            })()
          )}
        </div>
      </div>
    );
  };

  // Helper function to render quote preview and trade button
  const renderQuoteAndTrade = () => {
    if (!currentUser) return null;

    return (
      <>
        {/* Error message */}
        {error && !quote && amount && parseFloat(amount) > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          </div>
        )}

        {/* Loading state */}
        {quoteLoading && amount && parseFloat(amount) > 0 && (
          <div className="mt-3 pt-3 border-t text-center text-sm text-gray-500">
            計算中...
          </div>
        )}
        
        {/* Real-time Preview */}
        {quote && !quoteLoading && (
          <div className="mt-3 pt-3 border-t space-y-4">
            {/* ✅ 單選題 Exclusive Market 的顯示 */}
            {isExclusiveQuote && isSingle && currentOutcome ? (
              <>
                {/* 🧠 區塊 1：你正在做什麼 */}
                <div className="space-y-2">
                  <div className="font-semibold text-lg">
                    {selectedSide === "BUY_YES"
                      ? `你正在押注：「${currentOutcome.optionName || '未知選項'}」`
                      : `你正在押注：不是「${currentOutcome.optionName || '未知選項'}」`}
                  </div>
                  {selectedSide === "BUY_NO" && (
                    <div className="text-sm text-gray-600">
                      表示你認為最後的正確答案 <strong>不會是 {currentOutcome.optionName || '未知選項'}</strong>
                      <br />
                      （可能是其他選項，或以上皆非）
                    </div>
                  )}
                </div>
                
                {/* 💰 區塊 2：這筆交易會花你多少 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="text-base font-semibold">
                    花費：{formatCurrency(Math.abs(parseFloat((quote as ExclusiveQuoteResult).netAmount)))} G Coin
                  </div>
                  <div className="text-sm text-gray-600">
                    你將獲得 {parseFloat((quote as ExclusiveQuoteResult).shares).toFixed(4)} 份部位
                    <br />
                    <span className="text-xs">（這代表你在此市場中的影響力）</span>
                  </div>
                </div>
                
                {/* 🔁 區塊 3：如果你現在反悔 */}
                {(() => {
                  const exclusiveQuote = quote as ExclusiveQuoteResult;
                  const shares = parseFloat(exclusiveQuote.shares);
                  const grossAmount = parseFloat(exclusiveQuote.grossAmount);
                  
                  return shares > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">若交易後立即平倉，約可拿回：</div>
                      <div className="text-lg font-semibold text-green-700">
                        {formatCurrency(grossAmount)} G Coin
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        實際可拿回數量會隨市場價格變動
                      </div>
                    </div>
                  );
                })()}
                
                {/* 📉 區塊 4：你對市場造成的影響 */}
                {(() => {
                  const exclusiveQuote = quote as ExclusiveQuoteResult;
                  const priceBefore = parseFloat(exclusiveQuote.priceBefore) * 100;
                  const priceAfter = parseFloat(exclusiveQuote.priceAfter) * 100;
                  
                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-sm mb-2">
                        你將使「{currentOutcome.optionName || '未知選項'}」成為答案的機率
                      </div>
                      <div className="text-lg font-semibold">
                        {priceBefore.toFixed(1)}% → {priceAfter.toFixed(1)}%
                      </div>
                      {selectedSide === "BUY_NO" && (
                        <div className="text-xs text-gray-500 mt-2">
                          在單選題中，反對某一選項代表你認為「其他結果更有可能發生」
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            ) : isBundleQuote && isSingle ? (
              <>
                {/* 🧠 區塊 1：你正在做什麼 */}
                <div className="space-y-2">
                  <div className="font-semibold text-lg">
                    你正在押注：不是「{currentMarket?.optionName}」
                  </div>
                  <div className="text-sm text-gray-600">
                    表示你認為最後的正確答案 <strong>不會是 {currentMarket?.optionName}</strong>
                    <br />
                    （可能是其他選項，或以上皆非）
                  </div>
                </div>
                
                {/* 💰 區塊 2：這筆交易會花你多少 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="text-base font-semibold">
                    花費：{formatCurrency(Math.abs(parseFloat((quote as BundleQuoteResult).totalNetAmount)))} G Coin
                  </div>
                  <div className="text-sm text-gray-600">
                    你將獲得 {parseFloat((quote as BundleQuoteResult).totalShares).toFixed(4)} 份部位
                    <br />
                    <span className="text-xs">（這代表你在此市場中的影響力）</span>
                  </div>
                </div>
                
                {/* 🔁 區塊 3：如果你現在反悔 */}
                {(() => {
                  const totalShares = parseFloat((quote as BundleQuoteResult).totalShares);
                  const totalGrossAmount = parseFloat((quote as BundleQuoteResult).totalGrossAmount);
                  
                  return totalShares > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">若交易後立即平倉，約可拿回：</div>
                      <div className="text-lg font-semibold text-green-700">
                        {formatCurrency(totalGrossAmount)} G Coin
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        實際可拿回數量會隨市場價格變動
                      </div>
                    </div>
                  );
                })()}
                
                {/* 📉 區塊 4：你對市場造成的影響（只顯示 target 選項） */}
                {(() => {
                  const bundleQuote = quote as BundleQuoteResult;
                  const targetComponent = bundleQuote.components.find(c => c.optionId === currentMarket?.optionId);
                  
                  if (targetComponent) {
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-sm mb-2">
                          你將使「{currentMarket?.optionName}」成為答案的機率
                        </div>
                        <div className="text-lg font-semibold">
                          {formatPercentage(parseFloat(targetComponent.priceYesBefore) * 100)} → {formatPercentage(parseFloat(targetComponent.priceYesAfter) * 100)}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          在單選題中，反對某一選項
                          <br />
                          代表你認為「其他結果更有可能發生」
                        </div>
                      </div>
                    );
                  }
                })()}
              </>
            ) : (
              <>
                {/* 普通交易顯示（YES 或多選題的 NO） */}
                <div className="font-semibold text-base">這筆交易會發生什麼？</div>
                
                {/* 1. 結果總結 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="font-semibold text-lg">
                    {selectedSide === "BUY_YES" 
                      ? `你將支持「${currentMarket?.optionName}」`
                      : `你將反對「${currentMarket?.optionName}」`}
                  </div>
                  <div className="text-base">
                    花費：{formatCurrency(parseFloat(amount))} G Coin
                  </div>
                </div>

                {/* 2. 如果現在退出 - 使用當前價格估算 */}
                {(() => {
                  const shares = parseFloat((quote as QuoteResult).shares);
                  const grossAmount = parseFloat((quote as QuoteResult).grossAmount);
                  
                  return shares > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">若交易後立即平倉，約可拿回：</div>
                      <div className="text-lg font-semibold text-green-700">
                        {formatCurrency(grossAmount)} G Coin
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        實際可拿回數量會隨市場價格變動
                      </div>
                    </div>
                  );
                })()}

                {/* 3. 市場影響 */}
                {(() => {
                  const regularQuote = quote as QuoteResult;
                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-sm mb-2">你將讓「{currentMarket?.optionName}」的支持率</div>
                      <div className="text-lg font-semibold">
                        {formatPercentage(parseFloat(regularQuote.priceYesBefore) * 100)} → {formatPercentage(parseFloat(regularQuote.priceYesAfter) * 100)}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        大額交易會對市場造成較大影響
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* ✅ 區塊 6：確認按鈕 */}
            <Button
              onClick={handleTrade}
              disabled={trading || quoteLoading || !quote}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
            >
              {trading ? "交易中..." : "確認交易"}
            </Button>
            <p className="text-xs text-center text-gray-500">
              此為平台內虛擬貨幣交易，不可兌換現金
            </p>
          </div>
        )}
      </>
    );
  };

  // Debug logging
  useEffect(() => {
    console.log('[LmsrTradingCard] Market info:', {
      marketId,
      questionType,
      isBinary,
      isSingle,
      isMultiple,
      hasMarket: !!market,
      mechanism: market?.mechanism,
    });
  }, [marketId, questionType, isBinary, isSingle, isMultiple, market]);

  // 檢查是否已經持有相反方向的持倉（option markets）
  const hasConflictingPosition = (optionMarketId: string, side: 'BUY_YES' | 'BUY_NO'): boolean => {
    const position = positions.find(p => p.optionMarketId === optionMarketId);
    if (!position) return false;
    
    if (side === 'BUY_YES') {
      // 想買 YES，但已經持有 NO
      return parseFloat(position.shares) > 0 && position.side === 'NO';
    } else {
      // 想買 NO，但已經持有 YES
      return parseFloat(position.shares) > 0 && position.side === 'YES';
    }
  };

  // 獲取衝突持倉的資訊（option markets）
  const getConflictingPositionInfo = (optionMarketId: string, side: 'BUY_YES' | 'BUY_NO'): Position | null => {
    const position = positions.find(p => p.optionMarketId === optionMarketId);
    if (!position) return null;
    
    if (side === 'BUY_YES' && position.side === 'NO' && parseFloat(position.shares) > 0) {
      return position;
    }
    if (side === 'BUY_NO' && position.side === 'YES' && parseFloat(position.shares) > 0) {
      return position;
    }
    return null;
  };

  // 檢查 exclusive market 的衝突持倉
  const hasExclusiveConflict = (outcomeId: string, side: 'BUY_YES' | 'BUY_NO'): boolean => {
    if (!isSingle) return false;
    
    const position = exclusivePositions.find(p => p.outcomeId === outcomeId && p.side === (side === 'BUY_YES' ? 'NO' : 'YES'));
    if (position && parseFloat(position.shares) > 0) {
      // 已經持有同一 outcome 的相反方向
      return true;
    }
    
    // 對於 BUY_YES，檢查是否已經持有其他 outcome 的 YES
    if (side === 'BUY_YES') {
      return exclusivePositions.some(p => 
        p.outcomeId !== outcomeId && p.side === 'YES' && parseFloat(p.shares) > 0
      );
    }
    
    return false;
  };

  // 獲取 exclusive market 衝突持倉的資訊
  const getExclusiveConflictInfo = (outcomeId: string, side: 'BUY_YES' | 'BUY_NO'): { type: 'same_outcome' | 'other_yes'; position: ExclusivePosition; message: string } | null => {
    if (!isSingle) return null;
    
    // 檢查是否持有同一 outcome 的相反方向
    const oppositePosition = exclusivePositions.find(p => 
      p.outcomeId === outcomeId && p.side === (side === 'BUY_YES' ? 'NO' : 'YES')
    );
    
    if (oppositePosition && parseFloat(oppositePosition.shares) > 0) {
      return {
        type: 'same_outcome',
        position: oppositePosition,
                        message: `您已經持有此選項的 ${oppositePosition.side === 'YES' ? 'O' : 'X'} 持倉（${parseFloat(oppositePosition.shares).toFixed(4)} shares），請先平倉後再下新單`,
      };
    }
    
    // 對於 BUY_YES，檢查是否持有其他 outcome 的 YES
    if (side === 'BUY_YES') {
      const otherYesPosition = exclusivePositions.find(p => 
        p.outcomeId !== outcomeId && p.side === 'YES' && parseFloat(p.shares) > 0
      );
      if (otherYesPosition) {
        return {
          type: 'other_yes',
          position: otherYesPosition,
          message: `您已經持有「${otherYesPosition.optionName || '另一個選項'}」的 O 持倉（${parseFloat(otherYesPosition.shares).toFixed(4)} shares）。在單選題中，您只能支持一個選項，請先平倉後再下新單`,
        };
      }
    }
    
    return null;
  };
  
  // 判斷是否使用 bundle trade（單選題的 Buy No(i)）
  const useBundleTrade = isSingle && selectedSide === "BUY_NO";

  useEffect(() => {
    loadMarkets();
    loadPositions();
    loadUser();
  }, [marketId]);

  const loadUser = async () => {
    try {
      setUserLoading(true);
      const user = await getMe();
      setCurrentUser(user);
    } catch (err) {
      console.error('[LmsrTradingCard] Failed to load user:', err);
      setCurrentUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  const loadPositions = async () => {
    try {
      setPositionsLoading(true);
      if (isSingle) {
        // 單選題使用 exclusive market positions
        console.log('[LmsrTradingCard] Loading exclusive market positions for single choice');
        const data = await getExclusiveMarketPositions(marketId);
        console.log('[LmsrTradingCard] Exclusive positions loaded:', data.length);
        setExclusivePositions(data);
        setPositions([]); // Clear option market positions
      } else {
        // 其他題型使用 option market positions
        console.log('[LmsrTradingCard] Loading option market positions for', isBinary ? 'YES_NO' : 'MULTIPLE_CHOICE');
        const data = await getUserPositions(marketId);
        console.log('[LmsrTradingCard] Option positions loaded:', data.length, data);
        setPositions(data);
        setExclusivePositions([]); // Clear exclusive positions
      }
    } catch (err: any) {
      // 靜默處理錯誤，未登入時返回空陣列
      console.warn('[LmsrTradingCard] Failed to load positions (user may not be logged in):', err.message);
      setPositions([]);
      setExclusivePositions([]);
    } finally {
      setPositionsLoading(false);
    }
  };

  const loadMarkets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[LmsrTradingCard] Loading markets:', {
        marketId,
        isSingle,
        isBinary,
        isMultiple,
        questionType,
        mechanism: market?.mechanism,
      });
      
      // 單選題使用 exclusive markets，其他（是非題、多選題）使用 option markets
      if (isSingle) {
        console.log('[LmsrTradingCard] Fetching exclusive market for single choice question');
        try {
          const data = await getExclusiveMarketByMarketId(marketId);
          console.log('[LmsrTradingCard] Exclusive market loaded:', {
            exclusiveMarketId: data.exclusiveMarketId,
            outcomesCount: data.outcomes.length,
            outcomes: data.outcomes.map(o => ({
              outcomeId: o.outcomeId,
              optionName: o.optionName,
              type: o.type,
              price: o.price,
              pricePercent: (parseFloat(o.price) * 100).toFixed(2) + '%',
              q: o.q,
            })),
            priceSum: data.outcomes.reduce((sum, o) => sum + parseFloat(o.price), 0).toFixed(6),
          });
          setExclusiveMarket(data);
        } catch (err: any) {
          console.error('[LmsrTradingCard] Failed to load exclusive market:', err);
          setExclusiveMarket(null);
          setError(`無法載入單選題市場數據: ${err.message || '未知錯誤'}`);
        }
        // Don't auto-select any outcome - let user choose
      } else {
        // 是非題和多選題都使用 option markets
        console.log('[LmsrTradingCard] Fetching option markets for', isBinary ? 'YES_NO' : 'MULTIPLE_CHOICE', 'question');
        try {
          const data = await getOptionMarketsByMarketId(marketId);
          console.log('[LmsrTradingCard] Option markets loaded:', {
            count: data.length,
            markets: data.map(om => ({
              id: om.id,
              optionId: om.optionId,
              optionName: om.optionName,
              priceYes: om.priceYes,
            })),
          });
          
          if (data.length === 0) {
            console.warn('[LmsrTradingCard] No option markets found for market:', marketId);
            setError('此市場尚未初始化 LMSR 選項市場，請聯繫管理員');
          } else {
            setOptionMarkets(data);
            // Auto-select first option market for binary questions if none selected
            if (isBinary && !selectedOptionMarket && data.length > 0) {
              setSelectedOptionMarket(data[0].id);
            }
            
            // 對於是非題，從交易記錄獲取最新機率
            if (isBinary) {
              try {
                const trades = await getAllTrades(marketId, false);
                const tradesArray = Array.isArray(trades) ? trades : (trades?.trades || []);
                if (tradesArray.length > 0) {
                  // 獲取最後一筆交易
                  const sortedTrades = [...tradesArray].sort((a, b) => 
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  );
                  const lastTrade = sortedTrades[sortedTrades.length - 1];
                  if (lastTrade.priceYesAfter) {
                    const probability = parseFloat(lastTrade.priceYesAfter) * 100;
                    setCurrentYesProbability(probability);
                    console.log('[LmsrTradingCard] Set current YES probability from last trade:', probability);
                  } else if (lastTrade.priceAfter) {
                    const probability = parseFloat(lastTrade.priceAfter) * 100;
                    setCurrentYesProbability(probability);
                    console.log('[LmsrTradingCard] Set current YES probability from last trade (fallback):', probability);
                  } else {
                    // 如果沒有交易記錄，使用 option market 的 priceYes
                    const priceYes = parseFloat(data[0].priceYes || '0.5') * 100;
                    setCurrentYesProbability(priceYes);
                    console.log('[LmsrTradingCard] Set current YES probability from option market:', priceYes);
                  }
                } else {
                  // 如果沒有交易記錄，使用 option market 的 priceYes
                  const priceYes = parseFloat(data[0].priceYes || '0.5') * 100;
                  setCurrentYesProbability(priceYes);
                  console.log('[LmsrTradingCard] No trades found, using option market priceYes:', priceYes);
                }
              } catch (err) {
                console.error('[LmsrTradingCard] Failed to load trades for probability:', err);
                // 使用 option market 的 priceYes 作為後備
                const priceYes = parseFloat(data[0].priceYes || '0.5') * 100;
                setCurrentYesProbability(priceYes);
              }
            }
          }
        } catch (err: any) {
          console.error('[LmsrTradingCard] Failed to load option markets:', err);
          setOptionMarkets([]);
          setError(`無法載入選項市場數據: ${err.message || '未知錯誤'}`);
        }
        // Don't auto-select any option market - let user choose
      }
    } catch (err: any) {
      const errorMessage = err.message || "載入失敗";
      setError(errorMessage);
      console.error('[LmsrTradingCard] Load markets error:', {
        error: errorMessage,
        marketId,
        isSingle,
        isBinary,
        questionType,
        mechanism: market?.mechanism,
        stack: err.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch quote when amount changes (real-time preview)
  useEffect(() => {
    const amountNum = parseFloat(amount);
    
    // 單選題使用 exclusive markets，其他使用 option markets
    const hasSelection = isSingle 
      ? selectedOutcomeId 
      : selectedOptionMarket;
    
    // If user is not logged in, don't fetch quote
    if (!currentUser) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }
    
    if (!hasSelection || !amount || isNaN(amountNum) || amountNum <= 0) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }

    // Validate amount: must be positive integer and less than balance
    const balance = currentUser.coinBalance || 0;
    if (amountNum <= 0 || amountNum > balance || !Number.isInteger(amountNum)) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }

    const fetchQuote = async () => {
      try {
        setQuoteLoading(true);
        setError(null); // Clear previous errors
        
        // ✅ 單選題使用 exclusive markets
        if (isSingle && exclusiveMarket) {
          const result = await quoteExclusiveMarket(
            exclusiveMarket.exclusiveMarketId,
            {
              outcomeId: selectedOutcomeId!,
              side: selectedSide,
              amountType: amountType,
              amount: amount,
            },
          );
          setQuote(result);
        } else if (useBundleTrade) {
          // ✅ 單選題的 Buy No(i) 使用 bundle quote（舊邏輯，保留兼容性）
          const currentOm = optionMarkets.find(om => om.id === selectedOptionMarket);
          if (!currentOm || !market) {
            setQuote(null);
            return;
          }
          
          const result = await bundleQuote({
            marketId: marketId,
            bundleType: "BUY_NO",
            targetOptionId: currentOm.optionId,
            amountType: amountType,
            amount: amount,
          });
          setQuote(result);
        } else {
          // 普通 quote（YES 或 多選題的 NO）
          const result = await quoteOptionMarket(
            selectedOptionMarket!,
            {
              side: selectedSide,
              amountType: amountType,
              amount: amount,
            },
          );
          setQuote(result);
        }
      } catch (err: any) {
        console.error('[LmsrTradingCard] Quote error:', err);
        // Show error but don't block UI
        const errorMessage = err.message || "獲取報價失敗";
        // 如果是衝突錯誤，顯示更友好的提示
        if (errorMessage.includes('Cannot buy') && errorMessage.includes('holding')) {
          setError("您已經持有相反方向的持倉，請先平倉後再下新單");
        } else {
          setError(errorMessage);
        }
        setQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    };

    // Debounce quote fetching (300ms delay)
    const timer = setTimeout(fetchQuote, 300);
    return () => clearTimeout(timer);
  }, [selectedOptionMarket, selectedOutcomeId, selectedSide, amount, amountType, useBundleTrade, marketId, market, optionMarkets, exclusiveMarket, isSingle, currentUser]);

  // Handle close position (sell all shares)
  const handleClosePosition = async (
    position: Position | ExclusivePosition,
    isExclusive: boolean,
  ) => {
    // First confirmation
    const confirmMessage = isExclusive
      ? `確認要平倉「${position.optionName}」的 ${position.side === 'YES' ? 'O' : 'X'} 持倉嗎？\n\n` +
        `持倉數量：${parseFloat(position.shares).toFixed(4)} shares\n` +
        `當前價值：${formatCurrency(parseFloat(position.currentValue))} G Coin\n\n` +
        `此操作將賣出所有持倉，無法復原。`
      : `確認要平倉「${position.optionName}」的 ${position.side === 'YES' ? 'O' : 'X'} 持倉嗎？\n\n` +
        `持倉數量：${parseFloat(position.shares).toFixed(4)} shares\n` +
        `當前價值：${formatCurrency(parseFloat(position.currentValue))} G Coin\n\n` +
        `此操作將賣出所有持倉，無法復原。`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // Second confirmation
    if (!confirm('⚠️ 再次確認：確定要平倉此持倉嗎？')) {
      return;
    }

    try {
      setClosingPositionId(position.positionId);
      
      if (isExclusive && exclusiveMarket) {
        // Close exclusive market position
        const exclusivePosition = position as ExclusivePosition;
        const sellSide = exclusivePosition.side === 'YES' ? 'SELL_YES' : 'SELL_NO';
        
        await tradeExclusiveMarket(
          exclusiveMarket.exclusiveMarketId,
          {
            outcomeId: exclusivePosition.outcomeId,
            side: sellSide,
            amountType: 'SHARES',
            amount: exclusivePosition.shares, // Sell all shares
          },
        );
      } else {
        // Close option market position
        const optionPosition = position as Position;
        const sellSide = optionPosition.side === 'YES' ? 'SELL_YES' : 'SELL_NO';
        
        // Find the option market
        const optionMarket = optionMarkets.find(om => om.id === optionPosition.optionMarketId);
        if (!optionMarket) {
          alert('無法找到對應的市場');
          return;
        }
        
        await tradeOptionMarket(
          optionPosition.optionMarketId,
          {
            side: sellSide,
            amountType: 'SHARES',
            amount: optionPosition.shares, // Sell all shares
          },
        );
      }
      
      alert('平倉成功！');
      
      // Reload positions and markets
      await loadPositions();
      await loadMarkets();
    } catch (err: any) {
      console.error('[LmsrTradingCard] Close position error:', err);
      alert(err.message || '平倉失敗');
    } finally {
      setClosingPositionId(null);
    }
  };

  const handleTrade = async () => {
    // 單選題使用 exclusive markets，其他使用 option markets
    const hasSelection = isSingle 
      ? selectedOutcomeId 
      : selectedOptionMarket;
    
    if (!hasSelection || !amount || !quote) {
      alert("請輸入數量");
      return;
    }

    // 檢查是否有衝突的持倉（僅對 BUY 操作）
    if ((selectedSide === 'BUY_YES' || selectedSide === 'BUY_NO')) {
      if (isSingle && selectedOutcomeId) {
        // 單選題：檢查 exclusive market 衝突
        const conflictInfo = getExclusiveConflictInfo(selectedOutcomeId, selectedSide);
        if (conflictInfo) {
          alert(conflictInfo.message);
          return;
        }
      } else if (!isSingle && selectedOptionMarket) {
        // 其他題型：檢查 option market 衝突
        const conflicting = getConflictingPositionInfo(selectedOptionMarket, selectedSide);
        if (conflicting) {
          alert(
            `無法執行交易：您已經持有 ${conflicting.side === 'YES' ? 'O' : 'X'} 方向的持倉（${parseFloat(conflicting.shares).toFixed(4)} shares）。\n` +
            `請先平倉現有持倉後再下新單。`
          );
          return;
        }
      }
    }

    if (!confirm("確認執行交易？")) {
      return;
    }

    try {
      setTrading(true);
      
      // ✅ 單選題使用 exclusive markets
      if (isSingle && exclusiveMarket) {
        console.log('[LmsrTradingCard] Executing exclusive market trade:', {
          exclusiveMarketId: exclusiveMarket.exclusiveMarketId,
          outcomeId: selectedOutcomeId,
          side: selectedSide,
          amount,
          amountType,
        });
        
        const result = await tradeExclusiveMarket(
          exclusiveMarket.exclusiveMarketId,
          {
            outcomeId: selectedOutcomeId!,
            side: selectedSide,
            amountType: amountType,
            amount: amount,
          },
        );
        
        console.log('[LmsrTradingCard] Trade result:', {
          priceBefore: result.priceBefore,
          priceAfter: result.priceAfter,
          probBefore: result.probBefore,
          probAfter: result.probAfter,
          allPricesBefore: result.allPricesBefore,
          allPricesAfter: result.allPricesAfter,
        });
        
        alert("交易成功！");
        setQuote(result);
      } else if (useBundleTrade) {
        // ✅ 單選題的 Buy No(i) 使用 bundle trade（舊邏輯，保留兼容性）
        const currentOm = optionMarkets.find(om => om.id === selectedOptionMarket);
        if (!currentOm || !market) {
          alert("無法執行交易：缺少必要資訊");
          return;
        }
        
        const result = await bundleTrade({
          marketId: marketId,
          bundleType: "BUY_NO",
          targetOptionId: currentOm.optionId,
          amountType: amountType,
          amount: amount,
        });
        alert("交易成功！");
        setQuote(result);
      } else {
        // 普通 trade（YES 或 多選題的 NO）
        const result = await tradeOptionMarket(
          selectedOptionMarket!,
          {
            side: selectedSide,
            amountType: amountType,
            amount: amount,
          },
        );
        alert("交易成功！");
        setQuote(result);
      }
      
      // Reload markets to get updated prices (this will also update currentYesProbability)
      await loadMarkets();
      // Reload positions to show updated holdings
      await loadPositions();
      // Reset amount after successful trade
      setAmount("");
      
      // 調用交易成功回調，觸發頁面刷新
      if (onTradeSuccess) {
        await onTradeSuccess();
      }
    } catch (err: any) {
      alert(err.message || "交易失敗");
    } finally {
      setTrading(false);
    }
  };

  if (loading) {
    return <Card><CardContent className="p-6">載入中...</CardContent></Card>;
  }

  // Don't block UI for quote errors, show them inline
  // if (error && !quote) {
  //   return <Card><CardContent className="p-6 text-red-500">{error}</CardContent></Card>;
  // }

  // 對於單選題，檢查 exclusiveMarket；對於其他題型，檢查 optionMarkets
  if (isSingle) {
    if (!exclusiveMarket || exclusiveMarket.outcomes.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="text-red-600 font-semibold">此市場沒有 LMSR 選項</p>
              {error && (
                <p className="text-sm text-gray-600">{error}</p>
              )}
              <p className="text-xs text-gray-500">
                市場 ID: {marketId}
                <br />
                題型: {questionType}
                <br />
                機制: {market?.mechanism || '未設置'}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
  } else {
    if (optionMarkets.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="text-red-600 font-semibold">此市場沒有 LMSR 選項</p>
              {error && (
                <p className="text-sm text-gray-600">{error}</p>
              )}
              <p className="text-xs text-gray-500">
                市場 ID: {marketId}
                <br />
                題型: {questionType} {isBinary ? '(是非題)' : '(多選題)'}
                <br />
                機制: {market?.mechanism || '未設置'}
                <br />
                {!loading && (
                  <span className="text-orange-600">
                    ⚠️ 此市場可能尚未初始化 LMSR 選項市場，請聯繫管理員檢查後端配置
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  const currentMarket = optionMarkets.find(om => om.id === selectedOptionMarket);
  const currentOutcome = exclusiveMarket?.outcomes.find(o => o.outcomeId === selectedOutcomeId);
  const isBundleQuote = quote && 'bundleType' in quote;
  const isExclusiveQuote = quote && 'outcomeId' in quote && !isBundleQuote;

  return (
    <Card>
      <CardContent className="space-y-4">

        {/* 我的持倉 */}
        {(() => {
          if (positionsLoading) {
            return (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <div className="text-sm text-gray-500 text-center">載入持倉中...</div>
              </div>
            );
          }

          // 檢查是否有持倉（option markets 或 exclusive markets）
          const hasOptionPositions = positions.length > 0;
          const hasExclusivePositions = isSingle && exclusivePositions.length > 0;
          
          if (!hasOptionPositions && !hasExclusivePositions) {
            return null;
          }

          return (
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
              <div className="text-sm font-semibold mb-3 text-blue-700 dark:text-blue-300">
                📊 我的持倉
              </div>
              <div className="space-y-4">
                {/* Option Market Positions */}
                {positions.map((position) => {
                  const totalCost = parseFloat(position.totalCost);
                  const currentValue = parseFloat(position.currentValue);
                  const profitLoss = parseFloat(position.profitLoss);
                  const profitLossPercent = parseFloat(position.profitLossPercent);
                  const shares = parseFloat(position.shares);
                  const probabilityChange = parseFloat(position.probabilityChange);
                  const currentProbability = parseFloat(position.currentProbability);
                  
                  const isProfit = profitLoss >= 0;
                  
                  return (
                    <div key={`${position.positionId}-${position.side}`} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                      {/* 標題：選項名稱和方向 */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-base">{position.optionName}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            {position.side === 'YES' ? (
                              <Circle className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
                            ) : (
                              <XIcon className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
                            )}
                            {position.isBundle && ' • Bundle'}
                          </div>
                        </div>
                        <div className={`text-right ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          <div className="text-lg font-bold">
                            {isProfit ? '+' : ''}{formatCurrency(profitLoss)}
                          </div>
                          <div className="text-xs">
                            {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* 主要資訊：當前價值、投入成本、shares */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">當前價值</div>
                          <div className="font-semibold">{formatCurrency(currentValue)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">投入成本</div>
                          <div className="font-semibold">{formatCurrency(totalCost)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">持有 Shares</div>
                          <div className="font-mono font-semibold">{shares.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">當前機率</div>
                          <div className="font-semibold">{currentProbability.toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      {/* 機率變化 */}
                      {probabilityChange !== 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-500">
                            投入後機率變化：
                            <span className={`font-semibold ml-1 ${probabilityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {probabilityChange > 0 ? '+' : ''}{probabilityChange.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* 一鍵平倉按鈕 */}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={() => handleClosePosition(position, false)}
                          disabled={closingPositionId === position.positionId}
                          variant="outline"
                          className="w-full text-sm"
                          size="sm"
                        >
                          {closingPositionId === position.positionId ? '平倉中...' : '一鍵平倉'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {/* Exclusive Market Positions */}
                {isSingle && exclusivePositions.map((position) => {
                  const totalCost = parseFloat(position.totalCost);
                  const currentValue = parseFloat(position.currentValue);
                  const profitLoss = parseFloat(position.profitLoss);
                  const profitLossPercent = parseFloat(position.profitLossPercent);
                  const shares = parseFloat(position.shares);
                  const probabilityChange = parseFloat(position.probabilityChange);
                  const currentProbability = parseFloat(position.currentProbability);
                  
                  const isProfit = profitLoss >= 0;
                  
                  return (
                    <div key={`${position.positionId}-${position.side}`} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-3">
                      {/* 標題：選項名稱和方向 */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-base">{position.optionName}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            {position.side === 'YES' ? (
                              <Circle className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
                            ) : (
                              <XIcon className="w-3.5 h-3.5 text-red-600 stroke-[2.5]" />
                            )}
                          </div>
                        </div>
                        <div className={`text-right ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          <div className="text-lg font-bold">
                            {isProfit ? '+' : ''}{formatCurrency(profitLoss)}
                          </div>
                          <div className="text-xs">
                            {isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* 主要資訊：當前價值、投入成本、shares */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">當前價值</div>
                          <div className="font-semibold">{formatCurrency(currentValue)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">投入成本</div>
                          <div className="font-semibold">{formatCurrency(totalCost)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">持有 Shares</div>
                          <div className="font-mono font-semibold">{shares.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">當前機率</div>
                          <div className="font-semibold">{currentProbability.toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      {/* 機率變化 */}
                      {probabilityChange !== 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-500">
                            投入後機率變化：
                            <span className={`font-semibold ml-1 ${probabilityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {probabilityChange > 0 ? '+' : ''}{probabilityChange.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* 一鍵平倉按鈕 */}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={() => handleClosePosition(position, true)}
                          disabled={closingPositionId === position.positionId}
                          variant="outline"
                          className="w-full text-sm"
                          size="sm"
                        >
                          {closingPositionId === position.positionId ? '平倉中...' : '一鍵平倉'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Option Markets List - 你的立場是？ */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">你的選擇是？</Label>
          
          {/* ✅ 是非題：提示框 */}
          {isBinary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>這是是非題，點擊</span>
                <Circle className="w-4 h-4 text-green-600" />
                <span>或</span>
                <XIcon className="w-4 h-4 text-red-600" />
                <span>進行預測</span>
              </div>
            </div>
          )}

          {/* ✅ 單選題：提示框 */}
          {isSingle && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>這是單選題，每個選項都可以選</span>
                <Circle className="w-4 h-4 text-green-600" />
                <span>或</span>
                <XIcon className="w-4 h-4 text-red-600" />
              </div>
            </div>
          )}

          {/* ✅ 多選題：提示框 */}
          {isMultiple && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span>💡</span>
                <span>這是多選題，每個選項都可以選</span>
                <Circle className="w-4 h-4 text-green-600" />
                <span>或</span>
                <XIcon className="w-4 h-4 text-red-600" />
              </div>
            </div>
          )}
          
          {/* ✅ 是非題：只有一個選項框，包含機率和兩個按鈕（Circle 和 XIcon） */}
          {isBinary && optionMarkets.length > 0 && (() => {
            const yesOptionMarket = optionMarkets[0]; // 第一個（也是唯一一個）OptionMarket
            
            // 使用從交易記錄獲取的最新機率，如果沒有則使用 option market 的 priceYes
            const yesPrice = currentYesProbability !== null 
              ? currentYesProbability 
              : (parseFloat(yesOptionMarket.priceYes || '0.5') * 100);
            
            console.log('[LmsrTradingCard] YES_NO market probability:', {
              marketId,
              optionMarketId: yesOptionMarket.id,
              optionName: yesOptionMarket.optionName,
              currentYesProbability,
              optionMarketPriceYes: yesOptionMarket.priceYes,
              finalYesPrice: yesPrice.toFixed(1) + '%',
            });
            const isSelected = selectedOptionMarket === yesOptionMarket.id;
            const hasYesConflict = hasConflictingPosition(yesOptionMarket.id, 'BUY_YES');
            const hasNoConflict = hasConflictingPosition(yesOptionMarket.id, 'BUY_NO');
            const yesConflictInfo = getConflictingPositionInfo(yesOptionMarket.id, 'BUY_YES');
            const noConflictInfo = getConflictingPositionInfo(yesOptionMarket.id, 'BUY_NO');
            
            return (
              <div
                className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200'
                }`}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className={`mb-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm flex items-center gap-2 ${
                    selectedSide === "BUY_YES" 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}>
                    <span>你正在選擇：</span>
                    {selectedSide === "BUY_YES" ? (
                      <Circle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-2xl md:text-3xl font-bold text-indigo-600">{yesPrice.toFixed(0)}%</p>
                  </div>
                  <div className="flex gap-2 md:gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasYesConflict) {
                          alert(
                            `您已經持有 X 方向的持倉（${parseFloat(yesConflictInfo!.shares).toFixed(4)} shares）。\n` +
                            `請先平倉現有持倉後再下新單。`
                          );
                          return;
                        }
                        setSelectedOptionMarket(yesOptionMarket.id);
                        setSelectedSide("BUY_YES");
                        setQuote(null);
                      }}
                      className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg transition-all ${
                        isSelected && selectedSide === "BUY_YES"
                          ? 'bg-green-600 shadow-lg scale-110'
                          : isSelected && selectedSide === "BUY_NO"
                          ? 'bg-green-500/40 hover:bg-green-500'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      <Circle className="w-6 h-6 md:w-7 md:h-7 text-white stroke-[2.5]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasNoConflict) {
                          alert(
                            `您已經持有 O 方向的持倉（${parseFloat(noConflictInfo!.shares).toFixed(4)} shares）。\n` +
                            `請先平倉現有持倉後再下新單。`
                          );
                          return;
                        }
                        setSelectedOptionMarket(yesOptionMarket.id);
                        setSelectedSide("BUY_NO");
                        setQuote(null);
                      }}
                      className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg transition-all ${
                        isSelected && selectedSide === "BUY_NO"
                          ? 'bg-red-600 shadow-lg scale-110'
                          : isSelected && selectedSide === "BUY_YES"
                          ? 'bg-red-500/40 hover:bg-red-500'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      <XIcon className="w-6 h-6 md:w-7 md:h-7 text-white stroke-[2.5]" />
                    </button>
                  </div>
                </div>
                
                {/* Amount Input - Show below selected option */}
                {isSelected && (
                  <>
                    {renderAmountInputSection()}
                    {renderQuoteAndTrade()}
                  </>
                )}
              </div>
            );
          })()}
          
          {/* ✅ 多選題：為每個選項顯示 YES/NO 按鈕 */}
          {isMultiple && optionMarkets.map((om) => {
            const yesPrice = parseFloat(om.priceYes) * 100;
            const noPrice = 100 - yesPrice;
            const isSelected = selectedOptionMarket === om.id;
            const hasYesConflict = hasConflictingPosition(om.id, 'BUY_YES');
            const hasNoConflict = hasConflictingPosition(om.id, 'BUY_NO');
            const yesConflictInfo = getConflictingPositionInfo(om.id, 'BUY_YES');
            const noConflictInfo = getConflictingPositionInfo(om.id, 'BUY_NO');
            const isInChart = selectedOptionsForChart.has(om.id);
            
            return (
              <div key={om.id} className="space-y-2">
                <div
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className={`mb-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm flex items-center gap-2 ${
                      selectedSide === "BUY_YES" 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      <span>你正在選擇：{om.optionName}</span>
                      {selectedSide === "BUY_YES" ? (
                        <Circle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      ) : (
                        <XIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => {
                        // Toggle option in chart selection
                        setSelectedOptionsForChart(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(om.id)) {
                            newSet.delete(om.id);
                          } else {
                            newSet.add(om.id);
                          }
                          return newSet;
                        });
                      }}
                      title={isInChart ? '點擊移除圖表' : '點擊加入圖表'}
                    >
                      <p className={`font-bold text-slate-900 mb-1 text-sm md:text-base ${isInChart ? 'text-blue-600 underline' : ''}`}>
                        {om.optionName} {isInChart && '📈'}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-indigo-600">{yesPrice.toFixed(0)}%</p>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasYesConflict) {
                            alert(
                              `您已經持有 X 方向的持倉（${parseFloat(yesConflictInfo!.shares).toFixed(4)} shares）。\n` +
                              `請先平倉現有持倉後再下新單。`
                            );
                            return;
                          }
                          setSelectedOptionMarket(om.id);
                          setSelectedSide("BUY_YES");
                          setQuote(null);
                        }}
                        className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg transition-all ${
                          isSelected && selectedSide === "BUY_YES"
                            ? 'bg-green-600 shadow-lg scale-110'
                            : isSelected && selectedSide === "BUY_NO"
                            ? 'bg-green-500/40 hover:bg-green-500'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        <Circle className="w-6 h-6 md:w-7 md:h-7 text-white stroke-[2.5]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasNoConflict) {
                            alert(
                              `您已經持有 O 方向的持倉（${parseFloat(noConflictInfo!.shares).toFixed(4)} shares）。\n` +
                              `請先平倉現有持倉後再下新單。`
                            );
                            return;
                          }
                          setSelectedOptionMarket(om.id);
                          setSelectedSide("BUY_NO");
                          setQuote(null);
                        }}
                        className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg transition-all ${
                          isSelected && selectedSide === "BUY_NO"
                            ? 'bg-red-600 shadow-lg scale-110'
                            : isSelected && selectedSide === "BUY_YES"
                            ? 'bg-red-500/40 hover:bg-red-500'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        <XIcon className="w-6 h-6 md:w-7 md:h-7 text-white stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Amount Input - Show below selected option */}
                  {isSelected && (
                    <>
                      {renderAmountInputSection()}
                      {renderQuoteAndTrade()}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* ✅ 單選題：使用 exclusive markets，為每個 outcome 顯示 YES/NO 按鈕 */}
          {isSingle && exclusiveMarket && exclusiveMarket.outcomes.map((outcome) => {
            // ✅ 使用 outcomes.price（來自 N-outcome LMSR 計算，sum=100%）
            const price = parseFloat(outcome.price) * 100;
            const noPrice = 100 - price; // NO 的機率 = 1 - YES 機率
            
            // Debug: 驗證 price 是否有效
            if (isNaN(price) || price < 0 || price > 100) {
              console.error('[LmsrTradingCard] Invalid price for outcome:', {
                outcomeId: outcome.outcomeId,
                optionName: outcome.optionName,
                price: outcome.price,
                parsedPrice: price,
              });
            }
            
            const isSelected = selectedOutcomeId === outcome.outcomeId;
            const outcomeName = outcome.optionName || (outcome.type === 'NONE' ? '以上皆非' : '未知選項');
            
            // 檢查衝突
            const hasYesConflict = hasExclusiveConflict(outcome.outcomeId, 'BUY_YES');
            const hasNoConflict = hasExclusiveConflict(outcome.outcomeId, 'BUY_NO');
            const yesConflictInfo = getExclusiveConflictInfo(outcome.outcomeId, 'BUY_YES');
            const noConflictInfo = getExclusiveConflictInfo(outcome.outcomeId, 'BUY_NO');
            
            return (
              <div key={outcome.outcomeId} className="space-y-2">
                <div
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className={`mb-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm flex items-center gap-2 ${
                      selectedSide === "BUY_YES" 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      <span>你正在選擇：{outcomeName}</span>
                      {selectedSide === "BUY_YES" ? (
                        <Circle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      ) : (
                        <XIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 mb-1 text-sm md:text-base">{outcomeName}</p>
                      <p className="text-xl md:text-2xl font-bold text-indigo-600">{price.toFixed(1)}%</p>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasYesConflict && yesConflictInfo) {
                            alert(yesConflictInfo.message);
                            return;
                          }
                          setSelectedOutcomeId(outcome.outcomeId);
                          setSelectedSide("BUY_YES");
                          setQuote(null);
                        }}
                        className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg transition-all ${
                          isSelected && selectedSide === "BUY_YES"
                            ? 'bg-green-600 shadow-lg scale-110'
                            : isSelected && selectedSide === "BUY_NO"
                            ? 'bg-green-500/40 hover:bg-green-500'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        <Circle className="w-6 h-6 md:w-7 md:h-7 text-white stroke-[2.5]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasNoConflict && noConflictInfo) {
                            alert(noConflictInfo.message);
                            return;
                          }
                          setSelectedOutcomeId(outcome.outcomeId);
                          setSelectedSide("BUY_NO");
                          setQuote(null);
                        }}
                        className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg transition-all ${
                          isSelected && selectedSide === "BUY_NO"
                            ? 'bg-red-600 shadow-lg scale-110'
                            : isSelected && selectedSide === "BUY_YES"
                            ? 'bg-red-500/40 hover:bg-red-500'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        <XIcon className="w-6 h-6 md:w-7 md:h-7 text-white stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Amount Input - Show below selected option */}
                  {isSelected && (
                    <>
                      {renderAmountInputSection()}
                      {renderQuoteAndTrade()}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Multiple Choice Chart - Only show if options are selected */}
        {isMultiple && selectedOptionsForChart.size > 0 && (
          <div className="mt-6">
            <MarketDetailClient marketId={marketId}>
              <ProbabilityChart 
                marketId={marketId}
                isSingle={false}
                questionType="MULTIPLE_CHOICE"
                marketOptions={market?.options || []}
                selectedOptionIds={Array.from(selectedOptionsForChart)}
                optionMarkets={optionMarkets.map(om => ({
                  id: om.id,
                  optionId: om.optionId,
                  optionName: om.optionName,
                }))}
              />
            </MarketDetailClient>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

