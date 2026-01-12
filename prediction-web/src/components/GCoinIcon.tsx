'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface GCoinIconProps {
  size?: number;
  className?: string;
  priority?: boolean; // 用于关键位置的预加载
}

export function GCoinIcon({ size = 16, className = "", priority = false }: GCoinIconProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // 预加载关键位置的 icon
  useEffect(() => {
    if (priority) {
      const img = new window.Image();
      img.src = '/images/G_coin_icon.png';
      img.onload = () => setIsLoading(false);
      img.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
    }
  }, [priority]);
  
  if (hasError) {
    // 错误时显示占位符
    return (
      <span
        className={`inline-block bg-amber-200/30 rounded-full ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
        }}
        aria-label="G Coin"
      />
    );
  }
  
  return (
    <span
      className={`inline-block relative ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
      aria-label="G Coin"
    >
      {/* 占位符 - 淡入淡出效果，避免显示加载状态 */}
      {isLoading && (
        <span
          className="absolute inset-0 bg-amber-200/20 rounded-full"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      )}
      <Image
        src="/images/G_coin_icon.png"
        alt="G coin"
        width={size}
        height={size}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-150`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          objectFit: 'contain'
        }}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </span>
  );
}



