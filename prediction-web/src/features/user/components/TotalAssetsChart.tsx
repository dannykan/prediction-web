"use client";

import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getUserTransactions, type Transaction } from "../api/getUserTransactions";
import { getUserStatistics } from "../api/getUserStatistics";

interface TotalAssetsChartProps {
  userId: string;
  userCreatedAt: string; // User registration date
  currentTotalAssets: number; // Current total assets from statistics
}

type TimeRange = "day" | "week" | "month" | "year" | "all";

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  totalAssets: number;
  timestamp: number;
}

const NEW_USER_REWARD = 1000; // Initial balance from newcomer reward

export function TotalAssetsChart({ userId, userCreatedAt, currentTotalAssets }: TotalAssetsChartProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [currentPending, setCurrentPending] = useState<number>(0); // Current pending bets

  // Get current pending amount from statistics
  useEffect(() => {
    async function loadPending() {
      try {
        const stats = await getUserStatistics(userId);
        const pending = stats?.statistics?.profitRate?.total?.totalPending || 0;
        setCurrentPending(pending);
      } catch (error) {
        console.error("[TotalAssetsChart] Failed to load pending:", error);
      }
    }
    loadPending();
  }, [userId]);

  // Calculate date range based on timeRange
  const getDateRange = (range: TimeRange, registrationDate: Date): { start: Date; end: Date } => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    const start = new Date();
    switch (range) {
      case "day":
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case "month":
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case "year":
        start.setFullYear(start.getFullYear() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case "all":
        // Use registration date as start
        start.setTime(registrationDate.getTime());
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
    }
    
    // Ensure start date is not before registration
    if (start < registrationDate) {
      start.setTime(registrationDate.getTime());
      start.setHours(0, 0, 0, 0);
    }
    
    return { start, end };
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load ALL transactions (not filtered by date range)
        // We need all transactions to find the starting balance for any time range
        const allTransactions = await getUserTransactions(userId);
        
        // Sort by date
        allTransactions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        setTransactions(allTransactions);
      } catch (error) {
        console.error("[TotalAssetsChart] Failed to load transactions:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, userCreatedAt]); // Remove timeRange dependency - load all transactions once

  // Transform transactions to total assets history
  const chartData = useMemo(() => {
    const registrationDate = new Date(userCreatedAt);
    const { start } = getDateRange(timeRange, registrationDate);
    const dataPoints: ChartDataPoint[] = [];

    // Find the balance at the start date by looking at transactions before or at that date
    // If start date is registration date, initial balance is 1000
    // Otherwise, find the last transaction before or at the start date
    let startingBalance = NEW_USER_REWARD; // Default to 1000 (newcomer reward)
    
    // Sort transactions by date (ascending)
    const sortedTxs = [...transactions].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Find the last transaction at or before the start date
    // We need to find the transaction that occurred on or before the start date
    // Start from the end and go backwards to find the most recent one
    let foundStartingBalance = false;
    for (let i = sortedTxs.length - 1; i >= 0; i--) {
      const tx = sortedTxs[i];
      const txDate = new Date(tx.createdAt);
      const txTimestamp = txDate.getTime();
      
      // Compare dates at day level (ignore time)
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
      
      if (txDateOnly.getTime() <= startDateOnly.getTime()) {
        startingBalance = tx.balanceAfter;
        foundStartingBalance = true;
        console.log(`[TotalAssetsChart] Found starting balance for ${start.toISOString()}: ${startingBalance} from transaction at ${tx.createdAt}`);
        break;
      }
    }
    
    if (!foundStartingBalance && start.getTime() > registrationDate.getTime()) {
      // If start date is after registration but no transaction found,
      // this shouldn't happen normally, but use default 1000
      console.warn(`[TotalAssetsChart] No transaction found before start date ${start.toISOString()}, using default ${NEW_USER_REWARD}`);
    }

    // Group transactions by date and get the latest balanceAfter for each date
    // Only include transactions within the time range (after start date)
    const dateMap = new Map<string, { balance: number; timestamp: number }>();
    
    sortedTxs.forEach((tx) => {
      const date = new Date(tx.createdAt);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const timestamp = date.getTime();
      
      // Only include transactions after the start date (or on the start date if it has transactions)
      if (timestamp < start.getTime()) {
        return; // Skip transactions before the start date
      }
      
      // Keep the latest transaction for each date
      const existing = dateMap.get(dateKey);
      if (!existing || timestamp > existing.timestamp) {
        // balanceAfter already includes all effects:
        // - Initial balance (1000 from newcomer reward)
        // - PnL from trades
        // - System adjustments (admin adjustments, rewards, etc.)
        dateMap.set(dateKey, { balance: tx.balanceAfter, timestamp });
      }
    });

    // Add starting point with the correct balance at that date
    const startDateKey = start.toISOString().split('T')[0];
    let startDateLabel: string;
    switch (timeRange) {
      case "day":
        startDateLabel = start.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
        break;
      case "week":
      case "month":
        startDateLabel = start.toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
        break;
      case "year":
      case "all":
        startDateLabel = start.toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });
        break;
      default:
        startDateLabel = start.toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
    }

    // Check if there's a transaction on the start date
    const hasStartDateData = dateMap.has(startDateKey);
    
    // Add starting point if:
    // 1. There's no transaction on the start date (need to show the starting balance)
    // We always want to show the starting point to establish the baseline
    if (!hasStartDateData) {
      // Total assets at start = starting balance + current pending (approximation)
      const startTotalAssets = startingBalance + currentPending;
      dataPoints.push({
        date: startDateKey,
        dateLabel: startDateLabel,
        totalAssets: Number(startTotalAssets.toFixed(2)),
        timestamp: start.getTime(),
      });
    } else {
      // If there's a transaction on the start date, we should still add a starting point
      // before the first transaction to show the balance at the start of that day
      // But for simplicity, we'll use the starting balance for the first data point
      // Actually, let's not add a duplicate - the transaction data will show the balance
      // But we need to ensure the first transaction shows the correct balance
      // The transaction's balanceAfter should already be correct, so we're good
    }

    // Add transaction-based data points within the time range
    Array.from(dateMap.entries()).forEach(([date, { balance }]) => {
      const dateObj = new Date(date);
      const dateTimestamp = dateObj.getTime();
      
      let dateLabel: string;
      switch (timeRange) {
        case "day":
          dateLabel = dateObj.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
          break;
        case "week":
        case "month":
          dateLabel = dateObj.toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
          break;
        case "year":
        case "all":
          dateLabel = dateObj.toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });
          break;
        default:
          dateLabel = dateObj.toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
      }

      // Total assets = balanceAfter + pending bets
      // Note: We use currentPending for all historical points as an approximation
      // (In reality, pending bets change over time, but we don't have that historical data)
      const totalAssets = balance + currentPending;

      dataPoints.push({
        date,
        dateLabel,
        totalAssets: Number(totalAssets.toFixed(2)),
        timestamp: dateTimestamp,
      });
    });

    // Sort by timestamp
    dataPoints.sort((a, b) => a.timestamp - b.timestamp);

    // Remove duplicate dates (keep the one with actual transaction data)
    const finalDataPoints: ChartDataPoint[] = [];
    const seenDates = new Set<string>();
    dataPoints.forEach((point) => {
      if (!seenDates.has(point.date)) {
        seenDates.add(point.date);
        finalDataPoints.push(point);
      }
    });

    // Add current total assets as the last point if not already included
    const today = new Date().toISOString().split('T')[0];
    const hasToday = finalDataPoints.some((p) => p.date === today);
    if (!hasToday && currentTotalAssets > 0) {
      const todayObj = new Date();
      let dateLabel: string;
      switch (timeRange) {
        case "day":
          dateLabel = todayObj.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
          break;
        case "week":
        case "month":
          dateLabel = todayObj.toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
          break;
        case "year":
        case "all":
          dateLabel = todayObj.toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });
          break;
        default:
          dateLabel = todayObj.toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
      }
      finalDataPoints.push({
        date: today,
        dateLabel,
        totalAssets: Number(currentTotalAssets.toFixed(2)),
        timestamp: todayObj.getTime(),
      });
    }

    return finalDataPoints;
  }, [transactions, timeRange, currentTotalAssets, currentPending, userCreatedAt]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatCurrencyShort = (value: number): string => {
    if (value >= 1000000000) {
      // 10億以上顯示為 "X.Xb"
      return `${(value / 1000000000).toFixed(1)}b`;
    } else if (value >= 1000000) {
      // 100萬以上顯示為 "X.Xm"
      return `${(value / 1000000).toFixed(1)}m`;
    } else if (value >= 1000) {
      // 1000以上顯示為 "X.Xk"
      return `${(value / 1000).toFixed(1)}k`;
    } else {
      // 1000以下顯示完整數字，保留2位小數
      return value.toFixed(2);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">載入圖表中...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">目前沒有數據</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base md:text-lg font-bold text-slate-900">總資產變化</h2>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto">
        {(["day", "week", "month", "year", "all"] as TimeRange[]).map((range) => {
          const labels: Record<TimeRange, string> = {
            day: "天",
            week: "週",
            month: "月",
            year: "年",
            all: "全部",
          };
          
          return (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                timeRange === range
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {labels[range]}
            </button>
          );
        })}
      </div>

      <div className="h-48 md:h-80 w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="dateLabel" 
              stroke="#64748b"
              style={{ fontSize: '10px' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '10px' }}
              tickFormatter={(value) => formatCurrencyShort(value)}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => ['G ' + formatCurrency(value), '總資產']}
            />
            <Line
              type="monotone"
              dataKey="totalAssets"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

