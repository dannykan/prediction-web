"use client";

import Link from "next/link";
import { Users, MessageCircle } from "lucide-react";
import type { Market } from "../types/market";
import { QuestionTypeBadge } from "./QuestionTypeBadge";
import { GCoinIcon } from "@/components/GCoinIcon";
import { formatVolume } from "@/shared/utils/format";
import { ImageWithFallback } from "./ImageWithFallback";
import { buildMarketUrl } from "../utils/marketUrl";

interface CompactMarketCardProps {
  market: Market;
  index: number;
}

export function CompactMarketCard({ market, index }: CompactMarketCardProps) {
  const isLargeBanner = index < 3;
  const marketUrl = buildMarketUrl(market.shortcode, market.slug);
  
  const questionType = market.questionType || 'YES_NO';
  const yesPercent = market.yesPercentage;
  const noPercent = market.noPercentage;
  const participants = market.participantsCount || 0;
  const comments = market.commentsCount || 0;
  const poolSize = formatVolume(market.totalVolume);
  
  // Get category color and icon
  const categoryColor = market.category ? getCategoryColor(market.category.name) : '#3B82F6';
  const categoryIcon = market.category ? getCategoryIcon(market.category.name) : '📊';
  
  const isHot = market.totalVolume > 50000;
  // 判斷是否為官方市場（isOfficial 為 true 或 creator 為 null）
  const isOfficial = market.isOfficial === true || !market.creator;
  const creatorName = isOfficial ? '官方' : (market.creator?.displayName || market.creator?.name || '創建者');
  const creatorAvatar = isOfficial ? '/images/logo.png' : market.creator?.avatarUrl;
  
  // Resolve image URL (handle relative URLs)
  // Note: In client components, we can't access process.env directly
  // The imageUrl should already be resolved on the server side
  const imageUrl = market.imageUrl;
  const resolvedCreatorAvatar = creatorAvatar;

  if (isLargeBanner) {
    return (
      <Link href={marketUrl} className="block">
        <div
          className="relative rounded-xl backdrop-blur-xl border overflow-hidden hover:scale-[1.01] transition-all"
          style={{
            background: 'rgba(11, 14, 30, 0.5)',
            borderColor: 'rgba(107, 116, 148, 0.2)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Top Banner Image */}
          <div className="relative w-full h-40 overflow-hidden">
            <ImageWithFallback
              src={imageUrl}
              alt={market.title}
              fill
              className="object-cover"
              fallback={<span style={{ fontSize: "48px" }}>{categoryIcon}</span>}
            />
            {/* Gradient Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, rgba(11, 14, 30, 0) 0%, rgba(11, 14, 30, 0.7) 100%)',
              }}
            />
            
            {/* Hot Badge - Top Right */}
            {isHot && (
              <div
                className="absolute top-2 right-2 px-2 py-1 rounded-lg backdrop-blur-xl border-2 flex items-center gap-1"
                style={{
                  background: 'rgba(255, 0, 85, 0.3)',
                  borderColor: 'rgba(255, 0, 85, 0.6)',
                  boxShadow: '0 0 12px rgba(255, 0, 85, 0.5)',
                }}
              >
                <span className="text-sm">🔥</span>
                <span
                  className="text-white text-xs font-bold"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  HOT
                </span>
              </div>
            )}
            
            {/* Category Badge - Top Left */}
            {market.category && (
              <div
                className="absolute top-2 left-2 px-2 py-1 rounded-lg backdrop-blur-xl border flex items-center gap-1"
                style={{
                  background: `${categoryColor}20`,
                  borderColor: `${categoryColor}60`,
                }}
              >
                <span className="text-sm">{categoryIcon}</span>
                <span
                  className="text-white text-xs font-bold"
                  style={{ fontFamily: 'Orbitron, sans-serif' }}
                >
                  {market.category.name}
                </span>
              </div>
            )}
            
            {/* Creator Info - Bottom Left of Image */}
            <div
              className="absolute bottom-2 left-2 flex items-center gap-1.5 backdrop-blur-xl px-2 py-1 rounded-lg border"
              style={{
                background: 'rgba(11, 14, 30, 0.6)',
                borderColor: 'rgba(107, 116, 148, 0.3)',
              }}
            >
              <div
                className="w-6 h-6 rounded-full border flex items-center justify-center overflow-hidden"
                style={{
                  background: isOfficial
                    ? 'transparent'
                    : 'linear-gradient(135deg, #00FFFF, #B620E0)',
                  borderColor: '#0B0E1E',
                  borderWidth: '1.5px',
                }}
              >
                {isOfficial ? (
                  <ImageWithFallback
                    src="/images/logo.png"
                    alt="官方"
                    width={24}
                    height={24}
                    className="rounded-full"
                    fallback={<span className="text-[10px]">👤</span>}
                  />
                ) : resolvedCreatorAvatar ? (
                  <ImageWithFallback
                    src={resolvedCreatorAvatar}
                    alt={creatorName}
                    width={24}
                    height={24}
                    className="rounded-full"
                    fallback={
                      <span className="text-[10px]">
                        {creatorName.charAt(0).toUpperCase()}
                      </span>
                    }
                  />
                ) : (
                  <span className="text-[10px]">
                    {creatorName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span
                className="text-white text-xs font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isOfficial ? '官方' : creatorName}
              </span>
              {(isOfficial || market.creator?.verified) && (
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #00FFFF, #00E5FF)',
                    boxShadow: '0 0 6px rgba(0, 255, 255, 0.5)',
                  }}
                >
                  <span className="text-[8px] text-black font-bold">✓</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-3">
            {/* Question Type Badge */}
            <div className="mb-2">
              <QuestionTypeBadge
                questionType={questionType}
                optionsCount={market.optionsCount}
                isCompact={false}
              />
            </div>

            {/* Title */}
            <h3
              className="text-white font-bold leading-tight mb-3"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '15px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {market.title}
            </h3>

            {/* Stats & Probability Row */}
            <div className="flex items-center justify-between mb-3">
              {/* Left - Stats */}
              <div className="flex items-center gap-3">
                {/* Pool Size */}
                <div className="flex items-center gap-1">
                  <GCoinIcon size={14} />
                  <span
                    className="text-[#FFD700] text-xs font-bold"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    {poolSize}
                  </span>
                </div>
                
                {/* Participants */}
                <div className="flex items-center gap-1 text-[#B0B8D4]">
                  <Users size={12} />
                  <span
                    className="text-xs font-medium"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    {participants}
                  </span>
                </div>
                
                {/* Comments */}
                <div className="flex items-center gap-1 text-[#B0B8D4]">
                  <MessageCircle size={12} />
                  <span
                    className="text-xs font-medium"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    {comments}
                  </span>
                </div>
              </div>
              
              {/* Right - Probability Bar */}
              {questionType === 'YES_NO' && (
                <div className="flex items-center gap-1">
                  <span
                    className="font-bold text-[#00FFFF]"
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '10px',
                    }}
                  >
                    {Math.round(yesPercent)}%
                  </span>
                  
                  <div
                    className="relative w-16 h-2 rounded-full overflow-hidden"
                    style={{ background: 'rgba(107, 116, 148, 0.3)' }}
                  >
                    <div
                      className="absolute left-0 h-full"
                      style={{
                        width: `${yesPercent}%`,
                        background: 'linear-gradient(90deg, #00FFFF, #00E5FF)',
                        boxShadow: '0 0 6px rgba(0, 255, 255, 0.6)',
                      }}
                    />
                    <div
                      className="absolute right-0 h-full"
                      style={{
                        width: `${noPercent}%`,
                        background: 'linear-gradient(270deg, #B620E0, #D946EF)',
                        boxShadow: '0 0 6px rgba(182, 32, 224, 0.6)',
                      }}
                    />
                  </div>
                  
                  <span
                    className="font-bold text-[#B620E0]"
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '10px',
                    }}
                  >
                    {Math.round(noPercent)}%
                  </span>
                </div>
              )}
            </div>
            
            {/* Bet Button - Full Width */}
            <Link
              href={marketUrl}
              className="block w-full py-2.5 rounded-lg backdrop-blur-xl border-2 hover:scale-[1.02] transition-transform text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.25), rgba(182, 32, 224, 0.2))',
                borderColor: 'rgba(0, 255, 255, 0.5)',
                boxShadow: '0 0 12px rgba(0, 255, 255, 0.35)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="text-[#00FFFF] text-sm font-bold"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  filter: 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.8))',
                }}
              >
                下注
              </span>
            </Link>
          </div>
        </div>
      </Link>
    );
  }

  // COMPACT STYLE - 4th card onwards
  return (
    <Link href={marketUrl} className="block">
      <div
        className="relative rounded-xl backdrop-blur-xl border overflow-hidden hover:scale-[1.01] transition-all"
        style={{
          background: 'rgba(11, 14, 30, 0.5)',
          borderColor: 'rgba(107, 116, 148, 0.2)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="p-3">
          <div className="flex gap-3">
            {/* Left - Square Image */}
            <div
              className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2"
              style={{ borderColor: 'rgba(107, 116, 148, 0.3)' }}
            >
              <ImageWithFallback
                src={imageUrl}
                alt={market.title}
                fill
                className="object-cover"
                fallback={<span style={{ fontSize: '32px' }}>{categoryIcon}</span>}
              />
              {/* Category Icon Overlay */}
              <div
                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-md backdrop-blur-xl border flex items-center justify-center"
                style={{
                  background: `${categoryColor}40`,
                  borderColor: `${categoryColor}80`,
                  fontSize: '12px',
                }}
              >
                {categoryIcon}
              </div>
            </div>
            
            {/* Right - Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* Question Type Badge */}
              <div className="mb-1">
                <QuestionTypeBadge
                  questionType={questionType}
                  optionsCount={market.optionsCount}
                  isCompact={true}
                />
              </div>

              {/* Title */}
              <div>
                <h3
                  className="text-white font-bold leading-tight mb-1"
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '13px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {market.title}
                </h3>
                
                {/* Stats Row */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex items-center gap-1">
                    <GCoinIcon size={10} />
                    <span
                      className="text-[#FFD700] text-[10px] font-bold"
                      style={{ fontFamily: 'Orbitron, monospace' }}
                    >
                      {poolSize}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[#B0B8D4]">
                    <Users size={10} />
                    <span
                      className="text-[10px] font-medium"
                      style={{ fontFamily: 'Orbitron, monospace' }}
                    >
                      {participants}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[#B0B8D4]">
                    <MessageCircle size={10} />
                    <span
                      className="text-[10px] font-medium"
                      style={{ fontFamily: 'Orbitron, monospace' }}
                    >
                      {comments}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Bottom Row - Probability & Bet Button */}
              <div className="flex items-center justify-between gap-2">
                {/* Probability Bar */}
                {questionType === 'YES_NO' ? (
                  <div className="flex items-center gap-1">
                    <span
                      className="font-bold text-[#00FFFF]"
                      style={{
                        fontFamily: 'Orbitron, monospace',
                        fontSize: '9px',
                      }}
                    >
                      {Math.round(yesPercent)}%
                    </span>
                    
                    <div
                      className="relative w-12 h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'rgba(107, 116, 148, 0.3)' }}
                    >
                      <div
                        className="absolute left-0 h-full"
                        style={{
                          width: `${yesPercent}%`,
                          background: 'linear-gradient(90deg, #00FFFF, #00E5FF)',
                          boxShadow: '0 0 4px rgba(0, 255, 255, 0.6)',
                        }}
                      />
                      <div
                        className="absolute right-0 h-full"
                        style={{
                          width: `${noPercent}%`,
                          background: 'linear-gradient(270deg, #B620E0, #D946EF)',
                          boxShadow: '0 0 4px rgba(182, 32, 224, 0.6)',
                        }}
                      />
                    </div>
                    
                    <span
                      className="font-bold text-[#B620E0]"
                      style={{
                        fontFamily: 'Orbitron, monospace',
                        fontSize: '9px',
                      }}
                    >
                      {Math.round(noPercent)}%
                    </span>
                  </div>
                ) : (
                  <div className="flex-1" />
                )}
                
                {/* Bet Button */}
                <Link
                  href={marketUrl}
                  className="block px-3 py-1 rounded-lg backdrop-blur-xl border hover:scale-105 transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.25), rgba(182, 32, 224, 0.2))',
                    borderColor: 'rgba(0, 255, 255, 0.5)',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span
                    className="text-[#00FFFF] text-[10px] font-bold"
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      filter: 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.8))',
                    }}
                  >
                    下注
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getCategoryColor(categoryName: string): string {
  const name = categoryName.toLowerCase();
  if (name.includes('政治') || name.includes('politics')) return '#3B82F6';
  if (name.includes('運動') || name.includes('sports')) return '#F97316';
  if (name.includes('娛樂') || name.includes('entertainment')) return '#EC4899';
  if (name.includes('加密') || name.includes('crypto')) return '#FFD700';
  if (name.includes('迷因') || name.includes('meme')) return '#8B5CF6';
  if (name.includes('股市') || name.includes('stock') || name.includes('finance')) return '#10B981';
  if (name.includes('科技') || name.includes('tech')) return '#8B5CF6';
  return '#3B82F6';
}

function getCategoryIcon(categoryName: string): string {
  const name = categoryName.toLowerCase();
  if (name.includes('政治') || name.includes('politics')) return '🇹🇼';
  if (name.includes('運動') || name.includes('sports')) return '⚽';
  if (name.includes('娛樂') || name.includes('entertainment')) return '🎬';
  if (name.includes('加密') || name.includes('crypto')) return '₿';
  if (name.includes('迷因') || name.includes('meme')) return '😄';
  if (name.includes('股市') || name.includes('stock') || name.includes('finance')) return '💰';
  if (name.includes('科技') || name.includes('tech')) return '📱';
  return '📊';
}

