'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { QuoteResult, TradeSide } from '../api/lmsr';
import { formatPercentage } from '@/shared/utils/format';

interface LmsrOptionCardProps {
  optionId: string;
  optionName: string;
  optionMarketId: string;
  priceYes: number;
  priceNo: number;
  yesShares?: string;
  noShares?: string;
  onTrade: (side: TradeSide, amount: string, amountType: 'COIN' | 'SHARES') => Promise<void>;
  isLoading?: boolean;
}

export function LmsrOptionCard({
  optionId,
  optionName,
  optionMarketId,
  priceYes,
  priceNo,
  yesShares,
  noShares,
  onTrade,
  isLoading = false,
}: LmsrOptionCardProps) {
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeSide, setTradeSide] = useState<TradeSide | null>(null);
  const [amount, setAmount] = useState('');
  const [amountType, setAmountType] = useState<'COIN' | 'SHARES'>('COIN');
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  const handleQuote = async (side: TradeSide, inputAmount: string, inputType: 'COIN' | 'SHARES') => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setQuote(null);
      return;
    }

    setIsQuoting(true);
    try {
      // TODO: Call quote API
      // const result = await quoteOptionMarket(optionMarketId, {
      //   side,
      //   amountType: inputType,
      //   amount: inputAmount,
      // });
      // setQuote(result);
    } catch (error) {
      console.error('Quote error:', error);
      setQuote(null);
    } finally {
      setIsQuoting(false);
    }
  };

  const handleTrade = async () => {
    if (!tradeSide || !amount) return;

    try {
      await onTrade(tradeSide, amount, amountType);
      setShowTradeModal(false);
      setAmount('');
      setQuote(null);
    } catch (error) {
      console.error('Trade error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{optionName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Price Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">YES</div>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(priceYes)}
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">NO</div>
              <div className="text-2xl font-bold text-red-600">
                {formatPercentage(priceNo)}
              </div>
            </div>
          </div>

          {/* User Position */}
          {(yesShares || noShares) && (
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">我的持倉</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {yesShares && parseFloat(yesShares) > 0 && (
                  <div>
                    <span className="text-green-600">YES:</span> {parseFloat(yesShares).toFixed(2)}
                  </div>
                )}
                {noShares && parseFloat(noShares) > 0 && (
                  <div>
                    <span className="text-red-600">NO:</span> {parseFloat(noShares).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trade Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                setTradeSide('BUY_YES');
                setShowTradeModal(true);
              }}
              variant="outline"
              className="bg-green-50 hover:bg-green-100 dark:bg-green-950"
              disabled={isLoading}
            >
              買 YES
            </Button>
            <Button
              onClick={() => {
                setTradeSide('BUY_NO');
                setShowTradeModal(true);
              }}
              variant="outline"
              className="bg-red-50 hover:bg-red-100 dark:bg-red-950"
              disabled={isLoading}
            >
              買 NO
            </Button>
            {yesShares && parseFloat(yesShares) > 0 && (
              <Button
                onClick={() => {
                  setTradeSide('SELL_YES');
                  setShowTradeModal(true);
                }}
                variant="outline"
                disabled={isLoading}
              >
                賣 YES
              </Button>
            )}
            {noShares && parseFloat(noShares) > 0 && (
              <Button
                onClick={() => {
                  setTradeSide('SELL_NO');
                  setShowTradeModal(true);
                }}
                variant="outline"
                disabled={isLoading}
              >
                賣 NO
              </Button>
            )}
          </div>

          {/* Trade Modal (simplified - should be a proper modal component) */}
          {showTradeModal && tradeSide && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-bold mb-4">
                  {tradeSide === 'BUY_YES' && '買入 YES'}
                  {tradeSide === 'BUY_NO' && '買入 NO'}
                  {tradeSide === 'SELL_YES' && '賣出 YES'}
                  {tradeSide === 'SELL_NO' && '賣出 NO'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">金額類型</label>
                    <select
                      value={amountType}
                      onChange={(e) => {
                        setAmountType(e.target.value as 'COIN' | 'SHARES');
                        if (amount) {
                          handleQuote(tradeSide, amount, e.target.value as 'COIN' | 'SHARES');
                        }
                      }}
                      className="w-full p-2 border rounded"
                    >
                      <option value="COIN">G Coin</option>
                      <option value="SHARES">Shares</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {amountType === 'COIN' ? 'G Coin 金額' : 'Shares 數量'}
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        handleQuote(tradeSide, e.target.value, amountType);
                      }}
                      className="w-full p-2 border rounded"
                      placeholder="輸入金額"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {quote && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-sm space-y-1">
                        <div>可成交: {parseFloat(quote.shares).toFixed(4)} shares</div>
                        <div>總成本: {parseFloat(quote.grossAmount).toFixed(2)} G Coin</div>
                        <div>手續費: {parseFloat(quote.feeAmount).toFixed(2)} G Coin</div>
                        <div className="font-bold">
                          淨額: {parseFloat(quote.netAmount).toFixed(2)} G Coin
                        </div>
                        <div className="text-xs text-muted-foreground">
                          成交後 YES%: {formatPercentage(parseFloat(quote.priceYesAfter))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleTrade}
                      disabled={!amount || isQuoting || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? '處理中...' : '確認交易'}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowTradeModal(false);
                        setAmount('');
                        setQuote(null);
                      }}
                      variant="outline"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



