"use client";

import { ArrowUpRight, ArrowDownRight, Plus, Minus, Activity } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import Image from 'next/image';
import type { Transaction } from '@/features/user/api/getUserTransactions';
import Link from 'next/link';
import { Circle, X as XIcon } from 'lucide-react';

interface ProfileTransactionsProps {
  transactions: Transaction[];
}

// Helper function to parse LMSR trade description
const parseLMSRTradeDescription = (transaction: Transaction) => {
  const description = transaction.description || "";
  const isLMSRTrade = description.includes("LMSR Trade:") || description.includes("Exclusive Market Trade:");
  
  if (!isLMSRTrade) {
    return null;
  }

  let action = "";
  if (description.includes("BUY_") || description.match(/Buy/i)) {
    action = "下注";
  } else if (description.includes("SELL_") || description.match(/Sell/i)) {
    action = "平倉";
  }
  
  return { action };
};

// Format transaction type for display - 返回 action 和題目/選項的拆分信息
const formatTransactionType = (transaction: Transaction): { action: string; title?: string; optionName?: string } => {
  const isLMSRTrade = transaction.description?.includes("LMSR Trade:") || 
                     transaction.description?.includes("Exclusive Market Trade:");
  
  if (transaction.marketInfo && isLMSRTrade) {
    const lmsrInfo = parseLMSRTradeDescription(transaction);
    if (!lmsrInfo) {
      return { action: transaction.type };
    }

    const { action } = lmsrInfo;
    const { marketTitle, questionType, optionName } = transaction.marketInfo;
    
    return {
      action,
      title: marketTitle,
      optionName: optionName || undefined,
    };
  }
  
  const lmsrInfo = parseLMSRTradeDescription(transaction);
  if (lmsrInfo) {
    return { action: lmsrInfo.action };
  }
  
  // 處理 BET_WIN 類型：解析描述以提取市場標題和選項名稱
  if (transaction.type === "BET_WIN") {
    const description = transaction.description || "";
    // 描述格式：市場結算獲勝: [市場標題] - [選項名稱] (持有 X shares)
    const match = description.match(/市場結算獲勝:\s*(.+?)\s*-\s*(.+?)\s*\(/);
    if (match) {
      const marketTitle = match[1].trim();
      const optionNames = match[2].trim();
      // 如果有多個選項（逗號分隔），只取第一個
      const firstOptionName = optionNames.split(',')[0].trim();
      
      return {
        action: "投注獲勝",
        title: marketTitle,
        optionName: firstOptionName,
      };
    }
    // 如果解析失敗，返回基本格式
    return { action: "投注獲勝" };
  }
  
  const typeMap: Record<string, string> = {
    BET_STAKE: "投注扣款",
    BET_WIN: "投注獲勝",
    BET_LOSS: "投注失敗",
    DAILY_BONUS: "每日簽到",
    AD_REWARD: "廣告獎勵",
    NEW_USER_GIFT: "新用戶禮包",
    NEWCOMER_REWARD: "新手禮包",
    REFERRAL_BONUS: "推薦獎金",
    REFERRAL_REWARD: "推薦獎勵",
    VIP_REWARD: "VIP獎勵",
    QUEST_REWARD: "任務獎勵",
    BANKRUPTCY_REWARD: "破產補助",
    MARKET_REFUND: "市場退款",
    MARKET_CREATION_FEE: "創建市場",
    CREATOR_COMMISSION: "創作者佣金",
    ADMIN_ADJUSTMENT: "管理員調整",
    DEPOSIT_IAP: "儲值",
  };
  
  return { action: typeMap[transaction.type] || transaction.type || "未知交易" };
};

const getTypeIcon = (transaction: Transaction) => {
  const isLMSRTrade = transaction.description?.includes("LMSR Trade:") || 
                     transaction.description?.includes("Exclusive Market Trade:");
  
  if (isLMSRTrade) {
    const lmsrInfo = parseLMSRTradeDescription(transaction);
    if (lmsrInfo?.action === "下注") {
      return <span className="text-base">🚀</span>; // 下注
    } else if (lmsrInfo?.action === "平倉") {
      return <span className="text-base">🧾</span>; // 平倉
    }
  }
  
  const type = transaction.type || "";
  
  // 任務獎勵類型
  if (type.includes("REWARD") || type.includes("BONUS") || 
      type === "DAILY_BONUS" || type === "AD_REWARD" || 
      type === "NEW_USER_GIFT" || type === "NEWCOMER_REWARD" ||
      type === "REFERRAL_BONUS" || type === "REFERRAL_REWARD" ||
      type === "VIP_REWARD" || type === "QUEST_REWARD" ||
      type === "BANKRUPTCY_REWARD") {
    return <span className="text-base">🎁</span>; // 任務獎勵
  }
  
  // 系統調整
  if (type === "ADMIN_ADJUSTMENT") {
    return <span className="text-base">🛠️</span>; // 系統調整
  }
  
  // 其他類型保持原樣
  if (type.includes("WIN")) {
    return <ArrowUpRight className="w-4 h-4 text-green-600" />;
  }
  if (type.includes("STAKE") || type.includes("LOSS") || transaction.amount < 0) {
    return <ArrowDownRight className="w-4 h-4 text-red-600" />;
  }
  return <Activity className="w-4 h-4 text-slate-500" />;
};

const getTypeColor = (transaction: Transaction) => {
  const type = transaction.type || "";
  if (type.includes("WIN") || type.includes("REWARD") || type.includes("BONUS") || transaction.amount > 0) {
    return 'text-green-600 bg-green-50';
  }
  if (type.includes("STAKE") || type.includes("LOSS") || transaction.amount < 0) {
    return 'text-red-600 bg-red-50';
  }
  return 'text-slate-600 bg-slate-50';
};

// 獲取任務獎勵的詳情文字
const getQuestDetailText = (transaction: Transaction): string | null => {
  const type = transaction.type || "";
  const typeMap: Record<string, string> = {
    DAILY_BONUS: "每日簽到",
    AD_REWARD: "廣告獎勵",
    NEW_USER_GIFT: "新用戶禮包",
    NEWCOMER_REWARD: "新手禮包",
    REFERRAL_BONUS: "推薦獎金",
    REFERRAL_REWARD: "推薦獎勵",
    VIP_REWARD: "VIP獎勵",
    QUEST_REWARD: "任務獎勵",
    BANKRUPTCY_REWARD: "破產補助",
  };
  
  if (typeMap[type]) {
    return typeMap[type];
  }
  return null;
};

// 格式化時間顯示：超過1小時顯示完整日期時間格式
const formatTransactionTime = (createdAt: string): string => {
  const transactionDate = new Date(createdAt);
  const now = new Date();
  const diffInHours = (now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours >= 1) {
    // 超過1小時，顯示完整格式：YYYY/MM/DD HH:mm:ss
    return format(transactionDate, 'yyyy/MM/dd HH:mm:ss', { locale: zhTW });
  } else {
    // 1小時內，顯示相對時間
    return formatDistanceToNow(transactionDate, { addSuffix: true, locale: zhTW });
  }
};

const getBetIcon = (transaction: Transaction) => {
  // 對於 BET_WIN，從 optionName 判斷是 YES 還是 NO
  if (transaction.type === "BET_WIN") {
    const optionName = transaction.marketInfo?.optionName || 
                       (transaction.description?.match(/-\s*(.+?)\s*\(/) || [])[1] || "";
    const optionNameLower = optionName.toLowerCase().trim();
    
    // 判斷選項是 YES 還是 NO
    if (optionNameLower === 'yes' || optionNameLower === '是' || optionNameLower === '會' || 
        optionNameLower.includes('yes') || optionNameLower.includes('是')) {
      return <Circle className="w-3 h-3 text-green-600" />;
    } else if (optionNameLower === 'no' || optionNameLower === '否' || optionNameLower === '不會' ||
               optionNameLower.includes('no') || optionNameLower.includes('否')) {
      return <XIcon className="w-3 h-3 text-red-600" />;
    }
    // 對於單選/多選題，如果選項名稱不是 Yes/No，不顯示圖標（或可以根據市場類型判斷）
    // 暫時返回 null，如果需要可以根據 marketInfo.questionType 判斷
    return null;
  }
  
  // 對於 LMSR Trade，使用 marketInfo.side
  if (transaction.marketInfo) {
    const side = transaction.marketInfo.side;
    if (side === 'YES') {
      return <Circle className="w-3 h-3 text-green-600" />;
    } else if (side === 'NO') {
      return <XIcon className="w-3 h-3 text-red-600" />;
    }
  }
  return null;
};

export function ProfileTransactions({ transactions }: ProfileTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
        <p className="text-slate-500">目前沒有交易紀錄</p>
      </div>
    );
  }

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
            {transactions.map((transaction) => {
              const typeInfo = formatTransactionType(transaction);
              const isLMSRTrade = transaction.description?.includes("LMSR Trade:") || 
                                 transaction.description?.includes("Exclusive Market Trade:");
              const marketShortcode = transaction.marketInfo?.marketShortcode;
              const questDetailText = getQuestDetailText(transaction);
              
              return (
                <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                  {/* Type */}
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction)}`}>
                      {getTypeIcon(transaction)}
                      <span>{typeInfo.action}</span>
                      {/* 題目和選項名稱使用預設顏色顯示 */}
                      {typeInfo.title && (
                        <span className="text-slate-900 font-normal">
                          {typeInfo.title}
                          {typeInfo.optionName && ` ${typeInfo.optionName}`}
                          {/* 圈圈叉叉圖標要接著答案選項後面顯示 */}
                          {(isLMSRTrade || transaction.type === "BET_WIN") && getBetIcon(transaction)}
                        </span>
                      )}
                      {/* 如果沒有題目但有選項名稱，圖標也要顯示在選項名稱後面 */}
                      {!typeInfo.title && typeInfo.optionName && (
                        <span className="text-slate-900 font-normal">
                          {typeInfo.optionName}
                          {(isLMSRTrade || transaction.type === "BET_WIN") && getBetIcon(transaction)}
                        </span>
                      )}
                      {/* 如果既沒有題目也沒有選項名稱，但需要顯示圖標（LMSR Trade） */}
                      {!typeInfo.title && !typeInfo.optionName && isLMSRTrade && getBetIcon(transaction)}
                    </div>
                  </td>

                  {/* Details */}
                  <td className="px-4 py-3">
                    {/* 下注、平倉不顯示題目內容（避免重複） */}
                    {isLMSRTrade ? (
                      <p className="text-sm text-slate-500">-</p>
                    ) : questDetailText ? (
                      // 任務獎勵類型顯示任務詳情
                      <p className="text-sm text-slate-900">{questDetailText}</p>
                    ) : transaction.marketInfo?.marketTitle ? (
                      marketShortcode ? (
                        <Link 
                          href={`/m/${marketShortcode}`}
                          className="text-sm text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors"
                        >
                          {transaction.marketInfo.marketTitle}
                        </Link>
                      ) : (
                        <p className="text-sm text-slate-900 line-clamp-2">{transaction.marketInfo.marketTitle}</p>
                      )
                    ) : (
                      <p className="text-sm text-slate-500">-</p>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Image
                        src="/images/G_coin_icon.png"
                        alt="G coin"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                      <span className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </td>

                  {/* Balance */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Image
                        src="/images/G_coin_icon.png"
                        alt="G coin"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-900">{transaction.balanceAfter.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}</span>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-slate-500">
                      {formatTransactionTime(transaction.createdAt)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-200">
        {transactions.map((transaction) => {
          const typeInfo = formatTransactionType(transaction);
          const isLMSRTrade = transaction.description?.includes("LMSR Trade:") || 
                             transaction.description?.includes("Exclusive Market Trade:");
          const marketShortcode = transaction.marketInfo?.marketShortcode;
          const questDetailText = getQuestDetailText(transaction);
          
          return (
            <div key={transaction.id} className="p-3">
              {/* Type and Amount */}
              <div className="flex items-start justify-between mb-2">
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction)}`}>
                  {getTypeIcon(transaction)}
                  <span>{typeInfo.action}</span>
                  {/* 題目和選項名稱使用預設顏色顯示 */}
                  {typeInfo.title && (
                    <span className="text-slate-900 font-normal">
                      {typeInfo.title}
                      {typeInfo.optionName && ` ${typeInfo.optionName}`}
                      {/* 圈圈叉叉圖標要接著答案選項後面顯示 */}
                      {(isLMSRTrade || transaction.type === "BET_WIN") && getBetIcon(transaction)}
                    </span>
                  )}
                  {/* 如果沒有題目但有選項名稱，圖標也要顯示在選項名稱後面 */}
                  {!typeInfo.title && typeInfo.optionName && (
                    <span className="text-slate-900 font-normal">
                      {typeInfo.optionName}
                      {(isLMSRTrade || transaction.type === "BET_WIN") && getBetIcon(transaction)}
                    </span>
                  )}
                  {/* 如果既沒有題目也沒有選項名稱，但需要顯示圖標（LMSR Trade） */}
                  {!typeInfo.title && !typeInfo.optionName && isLMSRTrade && getBetIcon(transaction)}
                </div>
                <div className="flex items-center gap-1">
                  <Image
                    src="/images/G_coin_icon.png"
                    alt="G coin"
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5"
                  />
                  <span className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Details - 下注、平倉不顯示題目內容（避免重複），任務獎勵顯示任務詳情 */}
              {isLMSRTrade ? null : questDetailText ? (
                <p className="text-xs text-slate-700 mb-1.5">{questDetailText}</p>
              ) : transaction.marketInfo?.marketTitle ? (
                <p className="text-xs text-slate-700 mb-1.5 line-clamp-2">
                  {marketShortcode ? (
                    <Link 
                      href={`/m/${marketShortcode}`}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {transaction.marketInfo.marketTitle}
                    </Link>
                  ) : (
                    transaction.marketInfo.marketTitle
                  )}
                </p>
              ) : null}

              {/* Balance and Time */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {formatTransactionTime(transaction.createdAt)}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">餘額</span>
                  <Image
                    src="/images/G_coin_icon.png"
                    alt="G coin"
                    width={12}
                    height={12}
                    className="w-3 h-3"
                  />
                  <span className="text-slate-700 font-medium">{transaction.balanceAfter.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</span>
                </div>
              </div>
            </div>
          );
        })}
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
