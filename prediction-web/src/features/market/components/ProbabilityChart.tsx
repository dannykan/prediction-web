"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getAllTrades, type Trade } from "../api/getAllTrades";
import { getExclusiveMarketByMarketId, type ExclusiveOutcomeInfo } from "../api/lmsr";
import { clientFetch } from "@/core/api/client";
import type { MarketDetailData } from "../api/getMarketDetailData";

interface ProbabilityChartProps {
  marketId: string;
  isSingle?: boolean;
  questionType?: 'YES_NO' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  marketOptions?: Array<{ id: string; name: string }>; // Pass market options from parent
  selectedOptionIds?: string[]; // For multiple choice: which options to show in chart
  optionMarkets?: Array<{ id: string; optionId: string; optionName: string }>; // For multiple choice: option market info
  marketDetailData?: MarketDetailData | null; // Aggregated market data
  dataLoading?: boolean; // Whether aggregated data is loading
}

interface ChartDataPoint {
  time: string;
  [key: string]: string | number; // Dynamic keys for each outcome
  timestamp: number; // For sorting
}

interface InitialPrices {
  outcomeId: string;
  optionId: string | null;
  price: string;
  optionName?: string | null;
}

export function ProbabilityChart({ 
  marketId, 
  isSingle, 
  questionType, 
  marketOptions: propMarketOptions = [],
  selectedOptionIds = [],
  optionMarkets = [],
  marketDetailData,
  dataLoading = false,
}: ProbabilityChartProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [exclusiveMarket, setExclusiveMarket] = useState<{ outcomes: ExclusiveOutcomeInfo[] } | null>(null);
  const [initialPrices, setInitialPrices] = useState<InitialPrices[]>([]);
  const [multipleChoiceTrades, setMultipleChoiceTrades] = useState<Map<string, Trade[]>>(new Map()); // For multiple choice: optionMarketId -> trades
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false); // Detect mobile device

  const isYesNo = questionType === 'YES_NO';
  const isSingleChoice = questionType === 'SINGLE_CHOICE';
  const isMultipleChoice = questionType === 'MULTIPLE_CHOICE';

  // Chart colors for different lines
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];

  // Use optionMarkets from props first, then from aggregated data
  const availableOptionMarkets = optionMarkets.length > 0 
    ? optionMarkets 
    : (marketDetailData?.marketData?.optionMarkets?.map(om => ({
        id: om.id,
        optionId: om.optionId,
        optionName: om.optionName,
      })) || []);

  // Detect mobile device (client-side only)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use aggregated data if available, otherwise fallback to individual API calls
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // If we have aggregated data, use it
        if (marketDetailData?.marketData) {
          const { trades: tradesArray, exclusiveMarket: exclusiveMarketData, initialPrices: initialPricesArray, optionMarkets: optionMarketsData } = marketDetailData.marketData;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[ProbabilityChart] Using aggregated data:', {
              tradesCount: tradesArray?.length || 0,
              hasExclusiveMarket: !!exclusiveMarketData,
              hasInitialPrices: (initialPricesArray?.length || 0) > 0,
              optionMarketsCount: optionMarketsData?.length || 0,
              isYesNo,
              isSingleChoice,
              isMultipleChoice,
            });
          }
          
          if (isYesNo || isMultipleChoice) {
            // For YES_NO and MULTIPLE_CHOICE, use trades from aggregated data
            const sortedTrades = [...(tradesArray || [])].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setTrades(sortedTrades);
            setExclusiveMarket(null);
            setInitialPrices([]);
          } else if (isSingleChoice) {
            // For single choice, use exclusive market and initial prices
            setExclusiveMarket(exclusiveMarketData || null);
            const sortedTrades = [...(tradesArray || [])].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setTrades(sortedTrades);
            setInitialPrices(initialPricesArray || []);
          }
        } else if (!dataLoading) {
          // Fallback to individual API calls if aggregated data is not available
          if (isYesNo) {
            const data = await getAllTrades(marketId, false);
            const tradesArray = Array.isArray(data) ? data : (data?.trades || []);
            const sortedTrades = [...tradesArray].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setTrades(sortedTrades);
            setExclusiveMarket(null);
            setInitialPrices([]);
          } else if (isSingleChoice) {
            const [marketData, tradesResponse] = await Promise.all([
              getExclusiveMarketByMarketId(marketId),
              getAllTrades(marketId, true),
            ]);
            setExclusiveMarket(marketData);
            
            let tradesArray: Trade[] = [];
            let initialPricesArray: InitialPrices[] = [];
            
            if (Array.isArray(tradesResponse)) {
              tradesArray = tradesResponse;
            } else if (tradesResponse && typeof tradesResponse === 'object') {
              tradesArray = tradesResponse.trades || [];
              initialPricesArray = tradesResponse.initialPrices || [];
            }
            
            const sortedTrades = [...tradesArray].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setTrades(sortedTrades);
            setInitialPrices(initialPricesArray);
          } else if (isMultipleChoice) {
            setTrades([]);
            setExclusiveMarket(null);
            setInitialPrices([]);
            setMultipleChoiceTrades(new Map());
          }
        }
      } catch (error) {
        console.error("Failed to load data for chart:", error);
        setTrades([]);
        setExclusiveMarket(null);
        setInitialPrices([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [marketId, isYesNo, isSingleChoice, isMultipleChoice, marketDetailData, dataLoading]);

  // Create stable string representations for dependency comparison using useMemo with proper deps
  const selectedOptionIdsKey = useMemo(() => {
    if (selectedOptionIds.length === 0) return '';
    return [...selectedOptionIds].sort().join(',');
  }, [selectedOptionIds]);
  
  const optionMarketsKey = useMemo(() => {
    if (availableOptionMarkets.length === 0) return '';
    const sorted = [...availableOptionMarkets]
      .map(om => ({ id: om.id, optionId: om.optionId, optionName: om.optionName }))
      .sort((a, b) => a.id.localeCompare(b.id));
    return JSON.stringify(sorted);
  }, [availableOptionMarkets]);

  // Use refs to track previous values and prevent infinite loops
  const prevSelectedOptionIdsRef = useRef<string>('');
  const prevOptionMarketsRef = useRef<string>('');

  // For multiple choice: load trades for selected options
  useEffect(() => {
    if (!isMultipleChoice || selectedOptionIds.length === 0) {
      // Only update state if it was not already empty
      if (multipleChoiceTrades.size > 0) {
        setMultipleChoiceTrades(new Map());
        prevSelectedOptionIdsRef.current = '';
        prevOptionMarketsRef.current = '';
      }
      return;
    }

    const selectedOptionIdsKey = selectedOptionIds.sort().join(',');
    
    // Skip if values haven't changed
    if (prevSelectedOptionIdsRef.current === selectedOptionIdsKey && prevOptionMarketsRef.current === optionMarketsKey) {
      return;
    }

    // Update refs
    prevSelectedOptionIdsRef.current = selectedOptionIdsKey;
    prevOptionMarketsRef.current = optionMarketsKey;

    const loadMultipleChoiceTrades = async () => {
      try {
        setLoading(true);
        const tradesMap = new Map<string, Trade[]>();
        
        // Use aggregated data if available, otherwise fetch from API
        let allTrades: Trade[] = [];
        if (marketDetailData?.marketData?.trades) {
          allTrades = marketDetailData.marketData.trades;
        } else if (!dataLoading) {
          const data = await getAllTrades(marketId, false);
          allTrades = Array.isArray(data) ? data : (data?.trades || []);
        }
        
        // For each selected option, filter trades for that specific option market
        selectedOptionIds.forEach(optionMarketId => {
          const optionMarket = availableOptionMarkets.find(om => om.id === optionMarketId);
          if (!optionMarket) {
            tradesMap.set(optionMarketId, []);
            return;
          }
          
          // Filter trades for this specific option market
          // Match by optionId or optionName (need to check what field is available in Trade)
          const optionTrades = allTrades
            .filter((trade: Trade) => {
              // Try matching by optionId first
              if (optionMarket.optionId && trade.optionId) {
                return trade.optionId === optionMarket.optionId;
              }
              // Fallback: match by optionName
              if (trade.optionName && optionMarket.optionName) {
                return trade.optionName === optionMarket.optionName;
              }
              return false;
            })
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          
          tradesMap.set(optionMarketId, optionTrades);
        });
        
        setMultipleChoiceTrades(tradesMap);
      } catch (error) {
        console.error("[ProbabilityChart] Failed to load multiple choice trades:", error);
        setMultipleChoiceTrades(new Map());
      } finally {
        setLoading(false);
      }
    };

    loadMultipleChoiceTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketId, isMultipleChoice, selectedOptionIds, optionMarketsKey, marketDetailData, dataLoading]);

  // Create outcomeId to optionName mapping for tooltip display
  const outcomeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    
    if (isSingleChoice && exclusiveMarket) {
      // Build optionId to optionName map from prop market options (most reliable)
      const optionIdToNameMap = new Map<string, string>();
      propMarketOptions.forEach((opt) => {
        optionIdToNameMap.set(opt.id, opt.name);
      });
      
      // First, build a complete map for all outcomes from exclusiveMarket
      exclusiveMarket.outcomes.forEach((outcome) => {
        let optionName: string | undefined = undefined;
        
        // Priority 1: Check initialPrices first
        const initialPrice = initialPrices.find(ip => ip.outcomeId === outcome.outcomeId);
        if (initialPrice?.optionName) {
          optionName = initialPrice.optionName;
        }
        
        // Priority 2: Check outcome's own optionName
        if (!optionName && outcome.optionName) {
          optionName = outcome.optionName;
        }
        
        // Priority 3: Handle NONE type
        if (!optionName && outcome.type === 'NONE') {
          optionName = '以上皆非';
        }
        
        // Priority 4: Lookup from propMarketOptions using optionId
        if (!optionName && outcome.optionId && optionIdToNameMap.has(outcome.optionId)) {
          optionName = optionIdToNameMap.get(outcome.optionId);
        }
        
        // Only set if we found a name
        if (optionName) {
          map.set(outcome.outcomeId, optionName);
        }
      });
      
      // Also check trades' allPricesAfter as a fallback
      if (trades.length > 0) {
        const firstTrade = trades.find(t => t.allPricesAfter && t.allPricesAfter.length > 0);
        if (firstTrade?.allPricesAfter) {
          firstTrade.allPricesAfter.forEach((priceData) => {
            if (!map.has(priceData.outcomeId)) {
              if (priceData.optionName) {
                map.set(priceData.outcomeId, priceData.optionName);
              } else if (priceData.optionId && optionIdToNameMap.has(priceData.optionId)) {
                map.set(priceData.outcomeId, optionIdToNameMap.get(priceData.optionId)!);
              }
            }
          });
        }
      }
      
      // Debug: Log the mapping with detailed info
      if (process.env.NODE_ENV === 'development') {
        console.log('[ProbabilityChart] ===== DEBUG INFO =====');
        console.log('[ProbabilityChart] outcomeNameMap entries:', Array.from(map.entries()));
        console.log('[ProbabilityChart] initialPrices:', initialPrices.map(ip => ({ 
          outcomeId: ip.outcomeId, 
          optionId: ip.optionId, 
          optionName: ip.optionName 
        })));
        console.log('[ProbabilityChart] exclusiveMarket.outcomes:', exclusiveMarket.outcomes.map(o => ({ 
          outcomeId: o.outcomeId, 
          optionId: o.optionId, 
          optionName: o.optionName, 
          type: o.type 
        })));
        console.log('[ProbabilityChart] propMarketOptions:', propMarketOptions);
        console.log('[ProbabilityChart] optionIdToNameMap:', Array.from(optionIdToNameMap.entries()));
        
        // Verify mapping for each outcome
        exclusiveMarket.outcomes.forEach(outcome => {
          const mappedName = map.get(outcome.outcomeId);
          console.log(`[ProbabilityChart] Outcome ${outcome.outcomeId}: mappedName="${mappedName}", optionId="${outcome.optionId}", type="${outcome.type}"`);
        });
        console.log('[ProbabilityChart] =======================');
      }
    }
    
    return map;
  }, [isSingleChoice, exclusiveMarket, trades, initialPrices, propMarketOptions]);

  // Process trades to create chart data
  const chartData = useMemo(() => {
    if (isYesNo) {
      // YES_NO questions: single line for Yes probability
      const dataPoints: ChartDataPoint[] = [];
      
      if (trades.length === 0) {
        // No trades yet, show initial 50% state
        const now = new Date();
        dataPoints.push({
          time: now.toLocaleString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          probability: 50,
          timestamp: now.getTime(),
        });
        return dataPoints;
      }

      // Start with 50% (initial state for YES_NO questions)
      const firstTradeTime = new Date(trades[0].createdAt);
      const initialTime = new Date(firstTradeTime);
      initialTime.setSeconds(initialTime.getSeconds() - 1); // 1 second before first trade
      
      dataPoints.push({
        time: initialTime.toLocaleString('zh-TW', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        probability: 50,
        timestamp: initialTime.getTime(),
      });

      // Process each trade - use priceYesAfter as the probability after the trade
      trades.forEach((trade) => {
        // For YES_NO questions, use priceYesAfter as the probability
        // priceYesAfter is the probability of YES after this trade
        let probability = 50; // Default fallback
        
        if (trade.priceYesAfter) {
          probability = parseFloat(trade.priceYesAfter) * 100;
        } else if (trade.priceAfter) {
          // Fallback to priceAfter if priceYesAfter is not available
          probability = parseFloat(trade.priceAfter) * 100;
        }
        
        // Ensure probability is within valid range [0, 100]
        probability = Math.max(0, Math.min(100, probability));
        
        const tradeTime = new Date(trade.createdAt);
        
        dataPoints.push({
          time: tradeTime.toLocaleString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          probability: Math.round(probability * 10) / 10, // Round to 1 decimal
          timestamp: tradeTime.getTime(),
        });
      });

      return dataPoints;
    } else if (isSingleChoice && exclusiveMarket) {
      // Single choice questions: one line per outcome showing Yes probability
      const dataPoints: ChartDataPoint[] = [];
      
      // Build initial prices map from backend data or calculate default
      const initialPricesMap = new Map<string, number>();
      const numOutcomes = exclusiveMarket.outcomes.length;
      const defaultProbabilityPerOutcome = numOutcomes > 0 ? 100 / numOutcomes : 0;
      
      // Use backend initialPrices if available, otherwise use calculated defaults
      if (initialPrices.length > 0) {
        initialPrices.forEach((ip) => {
          const prob = parseFloat(ip.price || '0') * 100;
          initialPricesMap.set(ip.outcomeId, Math.max(0, Math.min(100, prob)));
        });
      } else {
        // Fallback: use calculated default (100/N)
        exclusiveMarket.outcomes.forEach((outcome) => {
          initialPricesMap.set(outcome.outcomeId, defaultProbabilityPerOutcome);
        });
      }

      // Ensure all outcomes are in the map
      exclusiveMarket.outcomes.forEach((outcome) => {
        if (!initialPricesMap.has(outcome.outcomeId)) {
          initialPricesMap.set(outcome.outcomeId, defaultProbabilityPerOutcome);
        }
      });

      if (trades.length === 0) {
        // No trades yet, show initial state
        const now = new Date();
        const initialPoint: ChartDataPoint = {
          time: now.toLocaleString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: now.getTime(),
        };
        
        // Add initial probability for each outcome
        exclusiveMarket.outcomes.forEach((outcome) => {
          const outcomeKey = `outcome_${outcome.outcomeId}`;
          const prob = initialPricesMap.get(outcome.outcomeId) || defaultProbabilityPerOutcome;
          initialPoint[outcomeKey] = Math.round(prob * 10) / 10;
        });
        
        dataPoints.push(initialPoint);
        return dataPoints;
      }

      // Start with initial prices (before first trade)
      const firstTradeTime = new Date(trades[0].createdAt);
      const initialTime = new Date(firstTradeTime);
      initialTime.setSeconds(initialTime.getSeconds() - 1); // 1 second before first trade
      
      const initialPoint: ChartDataPoint = {
        time: initialTime.toLocaleString('zh-TW', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: initialTime.getTime(),
      };
      
      // Add initial probability for each outcome
      exclusiveMarket.outcomes.forEach((outcome) => {
        const outcomeKey = `outcome_${outcome.outcomeId}`;
        const prob = initialPricesMap.get(outcome.outcomeId) || defaultProbabilityPerOutcome;
        initialPoint[outcomeKey] = Math.round(prob * 10) / 10;
      });
      
      dataPoints.push(initialPoint);

      // Process each trade - use allPricesAfter to get all outcome prices
      trades.forEach((trade) => {
        if (!trade.allPricesAfter || trade.allPricesAfter.length === 0) {
          return; // Skip if no price data
        }

        const tradeTime = new Date(trade.createdAt);
        const tradePoint: ChartDataPoint = {
          time: tradeTime.toLocaleString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: tradeTime.getTime(),
        };

        // Add probability for each outcome after this trade
        trade.allPricesAfter.forEach((priceData) => {
          const outcomeKey = `outcome_${priceData.outcomeId}`;
          const probability = Math.max(0, Math.min(100, parseFloat(priceData.price || '0') * 100));
          tradePoint[outcomeKey] = Math.round(probability * 10) / 10;
        });

        dataPoints.push(tradePoint);
      });

      return dataPoints;
    } else if (isMultipleChoice && selectedOptionIds.length > 0) {
      // Multiple choice questions: one line per selected option showing YES probability
      const dataPoints: ChartDataPoint[] = [];
      
      // Collect all unique timestamps from all selected options' trades
      const allTimestamps = new Set<number>();
      selectedOptionIds.forEach(optionMarketId => {
        const optionTrades = multipleChoiceTrades.get(optionMarketId) || [];
        optionTrades.forEach(trade => {
          allTimestamps.add(new Date(trade.createdAt).getTime());
        });
      });
      
      if (allTimestamps.size === 0) {
        // No trades yet, show initial state (50% for each option)
        const now = new Date();
        const initialPoint: ChartDataPoint = {
          time: now.toLocaleString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: now.getTime(),
        };
        
        selectedOptionIds.forEach(optionMarketId => {
          const optionMarket = availableOptionMarkets.find(om => om.id === optionMarketId);
          if (optionMarket) {
            const optionKey = `option_${optionMarketId}`;
            initialPoint[optionKey] = 50; // Initial 50% probability
          }
        });
        
        dataPoints.push(initialPoint);
        return dataPoints;
      }
      
      // Sort all timestamps
      const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);
      
      // Add initial point at 50% before the first trade (like YES_NO and SINGLE_CHOICE)
      if (sortedTimestamps.length > 0) {
        const firstTradeTime = sortedTimestamps[0];
        const initialTime = new Date(firstTradeTime);
        initialTime.setSeconds(initialTime.getSeconds() - 1); // 1 second before first trade
        
        const initialPoint: ChartDataPoint = {
          time: initialTime.toLocaleString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: initialTime.getTime(),
        };
        
        selectedOptionIds.forEach(optionMarketId => {
          const optionMarket = availableOptionMarkets.find(om => om.id === optionMarketId);
          if (optionMarket) {
            const optionKey = `option_${optionMarketId}`;
            initialPoint[optionKey] = 50; // Initial 50% probability
          }
        });
        
        dataPoints.push(initialPoint);
      }
      
      // For each timestamp, calculate probability for each selected option
      sortedTimestamps.forEach(timestamp => {
        const point: ChartDataPoint = {
          time: new Date(timestamp).toLocaleString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp,
        };
        
        selectedOptionIds.forEach(optionMarketId => {
          const optionTrades = multipleChoiceTrades.get(optionMarketId) || [];
          const optionMarket = availableOptionMarkets.find(om => om.id === optionMarketId);
          if (!optionMarket) return;
          
          // Find the most recent trade before or at this timestamp
          const relevantTrades = optionTrades.filter(trade => 
            new Date(trade.createdAt).getTime() <= timestamp
          );
          
          let probability = 50; // Default initial probability
          
          if (relevantTrades.length > 0) {
            // Use the last trade's priceYesAfter
            const lastTrade = relevantTrades[relevantTrades.length - 1];
            if (lastTrade.priceYesAfter) {
              probability = parseFloat(lastTrade.priceYesAfter) * 100;
            } else if (lastTrade.priceAfter) {
              probability = parseFloat(lastTrade.priceAfter) * 100;
            }
          }
          
          // Ensure probability is within valid range [0, 100]
          probability = Math.max(0, Math.min(100, probability));
          
          const optionKey = `option_${optionMarketId}`;
          point[optionKey] = Math.round(probability * 10) / 10;
        });
        
        dataPoints.push(point);
      });
      
      return dataPoints;
    }

    return [];
  }, [trades, isYesNo, isSingleChoice, exclusiveMarket, isMultipleChoice, selectedOptionIds, multipleChoiceTrades, availableOptionMarkets]);

  // Calculate X axis tick count and format (must be before any conditional returns)
  const xAxisConfig = useMemo(() => {
    const dataLength = chartData.length;
    
    // Mobile: always show 4 ticks
    if (isMobile) {
      return {
        tickCount: 4,
        tickFormatter: (value: string) => {
          // Extract date part only (MM/DD)
          const parts = value.split(' ');
          return parts[0] || value;
        },
      };
    }
    
    // Desktop: if data points > 10, show only date; otherwise show date + time
    if (dataLength > 10) {
      return {
        tickCount: Math.min(6, dataLength),
        tickFormatter: (value: string) => {
          // Extract date part only (MM/DD)
          const parts = value.split(' ');
          return parts[0] || value;
        },
      };
    }
    
    // Desktop with few data points: show date + time, auto tick count
    return {
      tickCount: undefined, // Let Recharts decide
      tickFormatter: undefined, // Use original format
    };
  }, [chartData.length, isMobile]);

  // Don't render chart for MULTIPLE_CHOICE if no options are selected
  if (isMultipleChoice && selectedOptionIds.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 pt-4 md:pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-bold text-slate-900">機率變化</h2>
          {chartData.length > 0 && (
            <p className="text-2xl md:text-3xl font-bold text-indigo-600">
              {(() => {
                const lastPoint = chartData[chartData.length - 1];
                if (isYesNo) {
                  return `${(lastPoint.probability as number).toFixed(0)}%`;
                } else if (isSingleChoice && exclusiveMarket) {
                  // For single choice, show the highest probability option
                  let maxProb = 0;
                  exclusiveMarket.outcomes.forEach((outcome) => {
                    const outcomeKey = `outcome_${outcome.outcomeId}`;
                    const prob = lastPoint[outcomeKey] as number;
                    if (prob && prob > maxProb) {
                      maxProb = prob;
                    }
                  });
                  return `${maxProb.toFixed(0)}%`;
                } else if (isMultipleChoice && selectedOptionIds.length > 0) {
                  // For multiple choice, show the highest probability among selected options
                  let maxProb = 0;
                  selectedOptionIds.forEach(optionMarketId => {
                    const optionKey = `option_${optionMarketId}`;
                    const prob = lastPoint[optionKey] as number;
                    if (prob && prob > maxProb) {
                      maxProb = prob;
                    }
                  });
                  return `${maxProb.toFixed(0)}%`;
                }
                return '0%';
              })()}
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-3">
        <div className="w-full" style={{ height: '240px', minHeight: '240px' }}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                tickMargin={8}
                tickCount={xAxisConfig.tickCount}
                tickFormatter={xAxisConfig.tickFormatter}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                width={35}
                tickCount={6}
              />
              <Tooltip
                formatter={(value: number | undefined, name: string | undefined) => {
                  if (value === undefined) return ['', ''];
                  if (isYesNo) {
                    return [`${value.toFixed(2)}%`, '機率'];
                  } else {
                    const displayName = name || '未知';
                    return [`${value.toFixed(2)}%`, displayName];
                  }
                }}
                labelFormatter={(label) => `時間: ${label}`}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#e2e8f0', fontSize: '12px', marginBottom: '4px' }}
                itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}
              />
              {isYesNo ? (
                <Line 
                  type="monotone" 
                  dataKey="probability" 
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ 
                    r: 5, 
                    fill: '#6366f1',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              ) : isSingleChoice ? (
                // For single choice: one line per outcome
                exclusiveMarket?.outcomes.map((outcome, index) => {
                  const outcomeKey = `outcome_${outcome.outcomeId}`;
                  const color = colors[index % colors.length];
                  // Use outcomeNameMap for consistent naming
                  const outcomeName = outcomeNameMap.get(outcome.outcomeId) || 
                    outcome.optionName || 
                    (outcome.type === 'NONE' ? '以上皆非' : '未知選項');
                  
                  return (
                    <Line
                      key={outcome.outcomeId}
                      type="monotone"
                      dataKey={outcomeKey}
                      stroke={color}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ 
                        r: 5, 
                        fill: color,
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                      name={outcomeName}
                    />
                  );
                })
              ) : isMultipleChoice ? (
                // For multiple choice: one line per selected option
                selectedOptionIds.map((optionMarketId, index) => {
                  const optionMarket = availableOptionMarkets.find(om => om.id === optionMarketId);
                  if (!optionMarket) return null;
                  
                  const optionKey = `option_${optionMarketId}`;
                  const color = colors[index % colors.length];
                  const optionName = optionMarket.optionName || '未知選項';
                  
                  return (
                    <Line
                      key={optionMarketId}
                      type="monotone"
                      dataKey={optionKey}
                      stroke={color}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ 
                        r: 5, 
                        fill: color,
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                      name={optionName}
                    />
                  );
                }).filter(Boolean)
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

