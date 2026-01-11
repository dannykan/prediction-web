/**
 * Creator Info Component
 * Displays creator avatar and name for markets
 */

"use client";

import Image from "next/image";
import { useState } from "react";
import type { Market } from "../types/market";

interface CreatorInfoProps {
  market: Market;
  size?: "sm" | "md" | "lg";
  showVerified?: boolean;
  className?: string;
}

export function CreatorInfo({
  market,
  size = "md",
  showVerified = true,
  className = "",
}: CreatorInfoProps) {
  const [imageError, setImageError] = useState(false);
  
  if (!market.creator) {
    return null;
  }

  const creator = market.creator;
  const avatarSize = size === "sm" ? 24 : size === "lg" ? 48 : 32;
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
  const displayName = creator.displayName || creator.name || creator.username || "創建者";
  const initials = displayName[0].toUpperCase();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {creator.avatarUrl && !imageError ? (
          <Image
            src={creator.avatarUrl}
            alt={displayName}
            width={avatarSize}
            height={avatarSize}
            className="rounded-full object-cover border-2 border-gray-300"
            style={{ width: avatarSize, height: avatarSize }}
            onError={() => setImageError(true)}
            unoptimized={creator.avatarUrl?.startsWith("http")}
          />
        ) : (
          <div
            className="rounded-full flex items-center justify-center text-white font-bold border-2 border-gray-300"
            style={{
              width: avatarSize,
              height: avatarSize,
              background: "linear-gradient(135deg, #00FFFF, #B620E0)",
              fontSize: avatarSize * 0.5,
            }}
          >
            {initials}
          </div>
        )}
        {/* Verified badge */}
        {showVerified && creator.verified && (
          <div
            className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
            style={{
              width: avatarSize * 0.4,
              height: avatarSize * 0.4,
              background: "linear-gradient(135deg, #00FFFF, #00E5FF)",
              border: "2px solid white",
            }}
          >
            <svg
              width={avatarSize * 0.2}
              height={avatarSize * 0.2}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )}
      </div>
      {/* Name */}
      <span className={`${textSize} font-medium text-gray-700`} itemProp="author">
        {displayName}
      </span>
    </div>
  );
}

