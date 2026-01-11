"use client";

import { ArrowUpRight, ArrowDownRight, Plus, Minus, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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

// Format transaction type for display
const formatTransactionType = (transaction: Transaction) => {
  const isLMSRTrade = transaction.description?.includes("LMSR Trade:") || 
                     transaction.description?.includes("Exclusive Market Trade:");
  
  if (transaction.marketInfo && isLMSRTrade) {
    const lmsrInfo = parseLMSRTradeDescription(transaction);
    if (!lmsrInfo) {
      return transaction.type;
    }

    const { action } = lmsrInfo;
    const { marketTitle, questionType, optionName, side } = transaction.marketInfo;
    
    const sideDisplay = side === 'YES' ? 'O' : 'X';
    const normalizedQuestionType = questionType?.toUpperCase();
    
    if (normalizedQuestionType === 'YES_NO') {
      return `${action} ${marketTitle} ${sideDisplay}`;
    } else if (
      normalizedQuestionType === 'SINGLE_CHOICE' || 
      normalizedQuestionType === 'MULTIPLE_CHOICE' ||
      normalizedQuestionType === 'SINGLE' ||
      normalizedQuestionType === 'MULTIPLE'
    ) {
      if (optionName) {
        return `${action} ${marketTitle} ${optionName} ${sideDisplay}`;
      } else {
        return `${action} ${marketTitle} ${sideDisplay}`;
      }
    } else {
      if (optionName) {
        return `${action} ${marketTitle} ${optionName} ${sideDisplay}`;
      } else {
        return `${action} ${marketTitle} ${sideDisplay}`;
      }
    }
  }
  
  const lmsrInfo = parseLMSRTradeDescription(transaction);
  if (lmsrInfo) {
    const description = transaction.description || "";
    const yesMatch = description.match(/\bYES\b/i);
    const noMatch = description.match(/\bNO\b/i);
    const side = yesMatch ? "O" : noMatch ? "X" : "";
    return side ? `${lmsrInfo.action} ${side}` : lmsrInfo.action;
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
    PLATFORM_FEE: "平台手續費",
    ADMIN_ADJUSTMENT: "管理員調整",
    DEPOSIT_IAP: "儲值",
  };
  
  return typeMap[transaction.type] || transaction.type || "未知交易";
};

const getTypeIcon = (transaction: Transaction) => {
  const type = transaction.type || "";
  if (type.includes("WIN") || type.includes("REWARD") || type.includes("BONUS")) {
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

const getBetIcon = (transaction: Transaction) => {
  if (!transaction.marketInfo) return null;
  const side = transaction.marketInfo.side;
  if (side === 'YES') {
    return <Circle className="w-3 h-3 text-green-600" />;
  } else if (side === 'NO') {
    return <XIcon className="w-3 h-3 text-red-600" />;
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
              const displayText = formatTransactionType(transaction);
              const isLMSRTrade = transaction.description?.includes("LMSR Trade:") || 
                                 transaction.description?.includes("Exclusive Market Trade:");
              const marketShortcode = transaction.marketInfo?.marketShortcode;
              
              return (
                <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                  {/* Type */}
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction)}`}>
                      {getTypeIcon(transaction)}
                      <span>{displayText}</span>
                      {isLMSRTrade && getBetIcon(transaction)}
                    </div>
                  </td>

                  {/* Details */}
                  <td className="px-4 py-3">
                    {transaction.marketInfo?.marketTitle ? (
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
                      {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true, locale: zhTW })}
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
          const displayText = formatTransactionType(transaction);
          const isLMSRTrade = transaction.description?.includes("LMSR Trade:") || 
                             transaction.description?.includes("Exclusive Market Trade:");
          const marketShortcode = transaction.marketInfo?.marketShortcode;
          
          return (
            <div key={transaction.id} className="p-3">
              {/* Type and Amount */}
              <div className="flex items-start justify-between mb-2">
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction)}`}>
                  {getTypeIcon(transaction)}
                  <span>{displayText}</span>
                  {isLMSRTrade && getBetIcon(transaction)}
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

              {/* Market Title */}
              {transaction.marketInfo?.marketTitle && (
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
              )}

              {/* Balance and Time */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true, locale: zhTW })}
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
