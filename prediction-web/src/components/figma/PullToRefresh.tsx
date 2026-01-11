"use client";

import { useState, useRef, ReactNode } from 'react';
import { RotateCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80; // 下拉觸發刷新的距離
  const maxPullDistance = 120; // 最大下拉距離

  const handleTouchStart = (e: React.TouchEvent) => {
    // 只在頁面滾動到頂部時允許下拉刷新
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    // 只在向下拉且在頂部時更新
    if (distance > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
      // 使用阻尼效果，拉得越長阻力越大
      const dampedDistance = Math.min(distance * 0.5, maxPullDistance);
      setPullDistance(dampedDistance);
      
      // 防止頁面滾動
      if (dampedDistance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('刷新失敗:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setStartY(0);
      }
    } else {
      setPullDistance(0);
      setStartY(0);
    }
  };

  const getRefreshIndicatorStyle = () => {
    const rotation = isRefreshing ? 360 : (pullDistance / threshold) * 180;
    const opacity = Math.min(pullDistance / threshold, 1);
    const scale = Math.min(pullDistance / threshold, 1);
    
    return {
      transform: `translateY(${pullDistance}px) scale(${scale})`,
      opacity,
      transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease, opacity 0.3s ease' : 'none',
    };
  };

  const getIconRotation = () => {
    if (isRefreshing) return 'animate-spin';
    return '';
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-y-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        WebkitOverflowScrolling: 'touch',
        touchAction: pullDistance > 10 ? 'none' : 'auto',
      }}
    >
      {/* 刷新指示器 */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-50"
        style={getRefreshIndicatorStyle()}
      >
        <div className="bg-white rounded-full shadow-lg p-3 flex items-center gap-2">
          <RotateCw className={`w-5 h-5 text-indigo-600 ${getIconRotation()}`} />
          {isRefreshing ? (
            <span className="text-sm font-medium text-slate-700">刷新中...</span>
          ) : pullDistance >= threshold ? (
            <span className="text-sm font-medium text-slate-700">放開刷新</span>
          ) : pullDistance > 0 ? (
            <span className="text-sm font-medium text-slate-700">下拉刷新</span>
          ) : null}
        </div>
      </div>

      {/* 內容區域 */}
      <div style={{ 
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 && !isRefreshing ? 'transform 0.3s ease' : 'none',
      }}>
        {children}
      </div>
    </div>
  );
}
