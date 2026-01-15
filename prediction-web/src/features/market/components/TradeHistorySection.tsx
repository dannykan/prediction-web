"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { TrendingUp, Clock, Circle, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { getAllPositions, type AllPosition } from "../api/getAllPositions";
import { getAllTrades, type Trade, type TradesResponse } from "../api/getAllTrades";
import { formatCurrency } from "@/shared/utils/format";

interface TradeHistorySectionProps {
  marketId: string;
  userId?: string;
  isSingle?: boolean;
  questionType?: 'YES_NO' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  loading?: boolean;
}

// Convert questionType from API format to internal format
function normalizeQuestionType(
  questionType?: 'YES_NO' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'
): 'YES_NO' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | undefined {
  if (!questionType) return undefined;
  
  // Return as-is (already in correct format)
  return questionType;
}

// Convert option name: replace Yes/No with O/X
function normalizeOptionName(optionName: string, questionType?: 'YES_NO' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'): string {
  if (!optionName) return optionName;
  
  // Normalize to lowercase for comparison
  const nameLower = optionName.toLowerCase().trim();
  
  // For YES_NO type, if option name is exactly "Yes" or "No" (any case), replace with "O" or "X"
  if (questionType === 'YES_NO') {
    if (nameLower === 'yes' || nameLower === '是' || nameLower === '會') {
      return 'O';
    } else if (nameLower === 'no' || nameLower === '否' || nameLower === '不會') {
      return 'X';
    }
    // If it's not Yes/No, return as-is (user-defined option name)
    return optionName;
  }
  
  // For SINGLE_CHOICE and MULTIPLE_CHOICE, replace "Yes"/"No" within the option name
  // Replace whole word "Yes" with "O" and "No" with "X" (case-insensitive)
  let normalized = optionName;
  
  // Replace "Yes" (case-insensitive, whole word) - handles YES, Yes, yes, etc.
  normalized = normalized.replace(/\bYES\b/gi, 'O');
  normalized = normalized.replace(/\bYes\b/gi, 'O');
  normalized = normalized.replace(/\byes\b/gi, 'O');
  normalized = normalized.replace(/\b是\b/g, 'O');
  normalized = normalized.replace(/\b會\b/g, 'O');
  
  // Replace "No" (case-insensitive, whole word) - handles NO, No, no, etc.
  normalized = normalized.replace(/\bNO\b/gi, 'X');
  normalized = normalized.replace(/\bNo\b/gi, 'X');
  normalized = normalized.replace(/\bno\b/gi, 'X');
  normalized = normalized.replace(/\b否\b/g, 'X');
  normalized = normalized.replace(/\b不會\b/g, 'X');
  
  return normalized;
}

// Helper function to parse UTC time string to Date
function parseTimeString(timeValue: string | Date): Date {
  if (timeValue instanceof Date) {
    return timeValue;
  }

  const raw = String(timeValue).trim();
  const hasTimezone = raw.endsWith('Z') || raw.match(/[+-]\d{2}:?\d{2}$/);

  if (hasTimezone) {
    return new Date(raw);
  }

  // If backend returns a naive timestamp, treat it as local time.
  if (raw.includes('T')) {
    return new Date(raw);
  }

  return new Date(`${raw}T00:00:00`);
}

// BetIcon component - inline helper
function BetIcon({ direction, size = 'md' }: { direction: 'yes' | 'no' | 'YES' | 'NO'; size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };
  
  const isYes = direction === 'yes' || direction === 'YES';
  const colorClass = isYes ? 'text-green-600' : 'text-red-600';
  const Icon = isYes ? Circle : X;
  
  return <Icon className={`${sizeClasses[size]} ${colorClass} stroke-[2.5]`} />;
}


export function TradeHistorySection({ marketId, isSingle, questionType: rawQuestionType, userId }: TradeHistorySectionProps) {
  const [allPositions, setAllPositions] = useState<AllPosition[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [positionsVisibleCount, setPositionsVisibleCount] = useState(5);
  const [tradesVisibleCount, setTradesVisibleCount] = useState(5);
  
  // Normalize questionType to internal format
  const questionType = normalizeQuestionType(rawQuestionType);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (userId) {
          // Logged in users: load full data
          const [positions, tradesResult] = await Promise.all([
            getAllPositions(marketId, isSingle || false),
            getAllTrades(marketId, isSingle || false),
          ]);
          setAllPositions(positions);
          // Handle both array and object responses from getAllTrades
          const trades = Array.isArray(tradesResult) 
            ? tradesResult 
            : (tradesResult as TradesResponse).trades || [];
          setAllTrades(trades);
        } else {
          // Guest users: try to load data but don't show details
          try {
            const [positions, tradesResult] = await Promise.all([
              getAllPositions(marketId, isSingle || false),
              getAllTrades(marketId, isSingle || false),
            ]);
            setAllPositions(positions);
            // Handle both array and object responses from getAllTrades
            const trades = Array.isArray(tradesResult) 
              ? tradesResult 
              : (tradesResult as TradesResponse).trades || [];
            setAllTrades(trades);
          } catch (error) {
            // If API fails for guests, set empty arrays
            console.warn("Failed to load data for guest:", error);
            setAllPositions([]);
            setAllTrades([]);
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        setAllPositions([]);
        setAllTrades([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [marketId, isSingle, userId]);

  // Separate active positions (shares > 0) from all positions
  const activePositions = allPositions.filter(
    (p) => {
      const hasShares = parseFloat(p.shares || '0') > 0;
      return hasShares;
    }
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">持倉與交易</h2>
        </div>
        <div className="text-center text-slate-500 py-8">載入中...</div>
      </div>
    );
  }

  // Guest view - show login prompt
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">持倉與交易</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade History - Left */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">交易紀錄</h3>
          </div>
          <div className="space-y-3">
            {allTrades.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>目前沒有交易記錄</p>
              </div>
            ) : (
              allTrades.slice(0, tradesVisibleCount).map((trade) => {
                const totalCost = parseFloat(trade.totalCost);
                const shares = parseFloat(trade.shares);
                const isBuy = trade.isBuy;
                const side = trade.side;
                const direction = side.includes('YES') ? 'yes' : 'no';
                const tradeDate = parseTimeString(trade.createdAt);
                const normalizedOptionName = normalizeOptionName(trade.optionName || '', questionType);

                return (
                  <div
                    key={trade.id}
                    className={`p-4 rounded-lg border ${
                      isBuy
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {trade.user.avatarUrl ? (
                          <Image
                            src={trade.user.avatarUrl}
                            alt={trade.user.displayName}
                            width={40}
                            height={40}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-slate-600">
                            {trade.user.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-slate-900">{trade.user.displayName}</span>
                          <span className="text-sm text-slate-600">
                            {isBuy ? '選擇' : '取消選擇'}
                          </span>
                          {questionType !== 'YES_NO' && normalizedOptionName && normalizedOptionName !== 'O' && normalizedOptionName !== 'X' && (
                            <span className="font-medium text-slate-700">{normalizedOptionName}</span>
                          )}
                          <BetIcon direction={direction} size="md" />
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className={`flex items-center gap-1 font-bold ${
                            isBuy ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {isBuy ? '-' : '+'}
                            <Image src="/images/G_coin_icon.png" alt="G coin" width={12} height={12} className="w-3 h-3" />
                            {isBuy ? formatCurrency(totalCost) : formatCurrency(Math.abs(parseFloat(trade.netAmount)))}
                          </div>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-600">{shares.toFixed(4)} shares</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-500">
                            {formatDistanceToNow(tradeDate, { addSuffix: true, locale: zhTW })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {allTrades.length > 5 && (
            <div className="mt-4 flex items-center gap-2">
              {tradesVisibleCount < allTrades.length ? (
                <button
                  onClick={() =>
                    setTradesVisibleCount((prev) => Math.min(prev + 5, allTrades.length))
                  }
                  className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  載入更多
                </button>
              ) : (
                <button
                  onClick={() => setTradesVisibleCount(5)}
                  className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  收合
                </button>
              )}
              <span className="text-xs text-slate-500">
                顯示 {Math.min(tradesVisibleCount, allTrades.length)} / {allTrades.length}
              </span>
            </div>
          )}
        </div>

        {/* Positions - Right */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">持倉用戶</h3>
          </div>
          <div className="space-y-4">
            {activePositions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>目前沒有持倉</p>
              </div>
            ) : (
              activePositions.slice(0, positionsVisibleCount).map((position) => {
                const totalCost = parseFloat(position.totalCost);
                const currentValue = parseFloat(position.currentValue);
                const profitLoss = parseFloat(position.profitLoss);
                const profitLossPercent = parseFloat(position.profitLossPercent);
                const isProfit = profitLoss >= 0;
                const entryDate = parseTimeString(position.firstTradeAt);
                const normalizedOptionName = normalizeOptionName(position.optionName || '', questionType);
                const direction = position.side === 'YES' ? 'yes' : 'no';

                return (
                  <div
                    key={`active-${position.positionId}-${position.userId}`}
                    className="p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {position.user.avatarUrl ? (
                          <Image
                            src={position.user.avatarUrl}
                            alt={position.user.displayName}
                            width={48}
                            height={48}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-slate-600">
                            {position.user.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-slate-900">{position.user.displayName}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-slate-600">選項：</span>
                              <div className="flex items-center gap-1">
                                {questionType !== 'YES_NO' && normalizedOptionName && normalizedOptionName !== 'O' && normalizedOptionName !== 'X' && (
                                  <span className="font-medium text-slate-900">{normalizedOptionName}</span>
                                )}
                                <BetIcon direction={direction} size="md" />
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-slate-600">投入成本：</span>
                                <div className="flex items-center gap-1">
                                  <Image src="/images/G_coin_icon.png" alt="G coin" width={12} height={12} className="w-3 h-3" />
                                  <span className="font-bold">{formatCurrency(totalCost)}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-600">當前價值：</span>
                                <div className="flex items-center gap-1">
                                  <Image src="/images/G_coin_icon.png" alt="G coin" width={12} height={12} className="w-3 h-3" />
                                  <span className="font-bold">{formatCurrency(currentValue)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className={`w-5 h-5 ${isProfit ? 'text-green-600' : 'text-red-600'}`} />
                              <div>
                                <div className={`text-xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                  {isProfit ? '+' : ''}{formatCurrency(profitLoss)}
                                </div>
                                <div className={`text-sm ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                  ({isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>持倉 {formatDistanceToNow(entryDate, { locale: zhTW })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {activePositions.length > 5 && (
            <div className="mt-4 flex items-center gap-2">
              {positionsVisibleCount < activePositions.length ? (
                <button
                  onClick={() =>
                    setPositionsVisibleCount((prev) => Math.min(prev + 5, activePositions.length))
                  }
                  className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  載入更多
                </button>
              ) : (
                <button
                  onClick={() => setPositionsVisibleCount(5)}
                  className="px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  收合
                </button>
              )}
              <span className="text-xs text-slate-500">
                顯示 {Math.min(positionsVisibleCount, activePositions.length)} / {activePositions.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
