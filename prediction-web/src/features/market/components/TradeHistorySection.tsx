"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { TrendingUp, Clock, Circle, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { parseToTaipeiTime } from "@/utils/formatDate";
import { getAllPositions, type AllPosition } from "../api/getAllPositions";
import { getAllTrades, type Trade, type TradesResponse } from "../api/getAllTrades";
import { formatCurrency } from "@/shared/utils/format";
import type { MarketDetailData } from "../api/getMarketDetailData";

interface TradeHistorySectionProps {
  marketId: string;
  userId?: string;
  isSingle?: boolean;
  questionType?: 'YES_NO' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  loading?: boolean;
  marketDetailData?: MarketDetailData | null;
  dataLoading?: boolean;
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


export function TradeHistorySection({ marketId, isSingle, questionType: rawQuestionType, userId, marketDetailData, dataLoading = false }: TradeHistorySectionProps) {
  const [allPositions, setAllPositions] = useState<AllPosition[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positions' | 'trades'>('positions');
  const [positionsVisibleCount, setPositionsVisibleCount] = useState(5);
  const [tradesVisibleCount, setTradesVisibleCount] = useState(5);
  
  // Normalize questionType to internal format
  const questionType = normalizeQuestionType(rawQuestionType);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Use aggregated data if available
        if (marketDetailData?.marketData) {
          const trades = marketDetailData.marketData.trades || [];
          setAllTrades(trades);
          
          // Positions are not in aggregated data, so we still need to fetch them
          // But we can skip if data is still loading
          if (!dataLoading) {
            try {
              const positions = await getAllPositions(marketId, isSingle || false);
              setAllPositions(positions);
            } catch (error) {
              console.warn("Failed to load positions:", error);
              setAllPositions([]);
            }
          }
        } else if (!dataLoading) {
          // Fallback to individual API calls
          if (userId) {
            const [positions, tradesResult] = await Promise.all([
              getAllPositions(marketId, isSingle || false),
              getAllTrades(marketId, isSingle || false),
            ]);
            setAllPositions(positions);
            const trades = Array.isArray(tradesResult) 
              ? tradesResult 
              : (tradesResult as TradesResponse).trades || [];
            setAllTrades(trades);
          } else {
            try {
              const [positions, tradesResult] = await Promise.all([
                getAllPositions(marketId, isSingle || false),
                getAllTrades(marketId, isSingle || false),
              ]);
              setAllPositions(positions);
              const trades = Array.isArray(tradesResult) 
                ? tradesResult 
                : (tradesResult as TradesResponse).trades || [];
              setAllTrades(trades);
            } catch (error) {
              console.warn("Failed to load data for guest:", error);
              setAllPositions([]);
              setAllTrades([]);
            }
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
  }, [marketId, isSingle, userId, marketDetailData, dataLoading]);

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-4">
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
        <div className="space-y-2 md:space-y-3">
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
              const entryDate = parseToTaipeiTime(position.firstTradeAt) || parseTimeString(position.firstTradeAt);
              const normalizedOptionName = normalizeOptionName(position.optionName || '', questionType);
              const direction = position.side === 'YES' ? 'yes' : 'no';

              return (
                <div
                  key={`active-${position.positionId}-${position.userId}`}
                  className="p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {position.user.avatarUrl ? (
                        <Image
                          src={position.user.avatarUrl}
                          alt={position.user.displayName}
                          width={40}
                          height={40}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-600">
                          {position.user.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="font-bold text-slate-900 text-sm md:text-base">{position.user.displayName}</span>
                        <div className="flex items-center gap-1">
                          {questionType !== 'YES_NO' && normalizedOptionName && normalizedOptionName !== 'O' && normalizedOptionName !== 'X' && (
                            <span className="font-medium text-slate-900 text-xs md:text-sm">{normalizedOptionName}</span>
                          )}
                          <BetIcon direction={direction} size="sm" />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">成本</span>
                          <Image src="/images/G_coin_icon.png" alt="G coin" width={12} height={12} className="w-3 h-3" />
                          <span className="font-semibold text-slate-900">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">現值</span>
                          <Image src="/images/G_coin_icon.png" alt="G coin" width={12} height={12} className="w-3 h-3" />
                          <span className="font-semibold text-slate-900">{formatCurrency(currentValue)}</span>
                        </div>
                        <div className={`flex items-center gap-1 font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          {isProfit ? '+' : ''}{formatCurrency(profitLoss)}
                          <span className="text-xs font-normal">({isProfit ? '+' : ''}{profitLossPercent.toFixed(2)}%)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(entryDate, { locale: zhTW })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
      )}

      {/* Trades Tab */}
      {activeTab === 'trades' && (
        <div className="space-y-2">
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
              const tradeDate = parseToTaipeiTime(trade.createdAt) || parseTimeString(trade.createdAt);
              const normalizedOptionName = normalizeOptionName(trade.optionName || '', questionType);

              return (
                <div
                  key={trade.id}
                  className={`p-3 rounded-lg border ${
                    isBuy
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="font-bold text-slate-900 text-sm md:text-base">{trade.user.displayName}</span>
                        <span className="text-xs md:text-sm text-slate-500">
                          {isBuy ? '選擇' : '取消'}
                        </span>
                        {questionType !== 'YES_NO' && normalizedOptionName && normalizedOptionName !== 'O' && normalizedOptionName !== 'X' && (
                          <span className="font-medium text-slate-700 text-xs md:text-sm">{normalizedOptionName}</span>
                        )}
                        <BetIcon direction={direction} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <div className={`flex items-center gap-1 font-bold ${
                          isBuy ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {isBuy ? '-' : '+'}
                          <Image src="/images/G_coin_icon.png" alt="G coin" width={12} height={12} className="w-3 h-3" />
                          {isBuy ? formatCurrency(totalCost) : formatCurrency(Math.abs(parseFloat(trade.netAmount)))}
                        </div>
                        <span className="text-slate-600">{shares.toFixed(4)} shares</span>
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
      )}
    </div>
  );
}
