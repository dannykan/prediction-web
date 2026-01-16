"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { TrendingUp, Clock, Star, CheckCircle, Timer } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { PullToRefresh } from './PullToRefresh';
import { MarketCardUI } from './MarketCardUI';
import { SidebarUI } from './SidebarUI';
import { MobileHeaderUI } from './MobileHeaderUI';
import type { Market } from '@/features/market/types/market';
import type { Category } from '@/features/market/api/getCategories';

interface HomePageUIProps {
  markets: Market[];
  categories?: Category[];
  commentsCountMap?: Map<string, number>;
  onRefresh?: () => Promise<void>;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
  isLoggedIn?: boolean;
  user?: {
    name: string;
    avatar: string;
    totalAssets: number;
    inviteCode?: string;
  };
  onLogin?: () => void;
  onLogout?: () => void;
  unclaimedQuestsCount?: number;
  unreadNotificationsCount?: number;
}

// Figma 風格的分類篩選器（簡化版，僅 UI）
function CategoryFilterUI({ 
  categories, 
  selected, 
  onSelect 
}: { 
  categories: string[]; 
  selected: string; 
  onSelect: (category: string) => void;
}) {
  return (
    <div className="mt-3 sm:mt-4 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-full font-medium whitespace-nowrap transition-all ${
              selected === category
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

// Figma 風格的市場篩選器（簡化版，僅 UI）
function MarketFilterUI({ 
  selected, 
  onSelect, 
  isLoggedIn 
}: { 
  selected: string; 
  onSelect: (filter: string) => void; 
  isLoggedIn: boolean;
}) {
  const filters = isLoggedIn 
    ? [
        { id: '熱門', label: '熱門', icon: null as any, emoji: '🔥' },
        { id: '最新', label: '最新', icon: TrendingUp, emoji: null },
        { id: '倒數中', label: '倒數中', icon: Timer, emoji: null },
        { id: '已關注', label: '已關注', icon: Star, emoji: null },
        { id: '已下注', label: '已下注', icon: CheckCircle, emoji: null },
      ]
    : [
        { id: '熱門', label: '熱門', icon: null as any, emoji: '🔥' },
        { id: '最新', label: '最新', icon: TrendingUp, emoji: null },
        { id: '倒數中', label: '倒數中', icon: Timer, emoji: null },
      ];

  return (
    <div className="mt-2 sm:mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {filters.map(filter => {
        const Icon = filter.icon;
        
        return (
          <button
            key={filter.id}
            onClick={() => onSelect(filter.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-medium whitespace-nowrap transition-all ${
              selected === filter.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {filter.emoji ? (
              <span className="text-base sm:text-lg">{filter.emoji}</span>
            ) : Icon ? (
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : null}
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function HomePageUI({ 
  markets, 
  categories = [],
  commentsCountMap = new Map(), 
  onRefresh,
  searchQuery: externalSearchQuery,
  onSearchChange,
  selectedCategory: externalSelectedCategory,
  onCategoryChange,
  selectedFilter: externalSelectedFilter,
  onFilterChange,
  isLoggedIn: externalIsLoggedIn,
  user,
  onLogin,
  onLogout,
  unclaimedQuestsCount = 0,
  unreadNotificationsCount = 0,
}: HomePageUIProps) {
  const pathname = usePathname();
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [internalSelectedCategory, setInternalSelectedCategory] = useState('全部');
  const [internalSelectedFilter, setInternalSelectedFilter] = useState('熱門');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Touch gesture detection for mobile swipe to open sidebar
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isHomePage = pathname === '/home' || pathname === '/';
  
  useEffect(() => {
    // Only enable swipe gesture on mobile and home page
    if (!isHomePage || typeof window === 'undefined') return;
    
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    if (!isMobile) return;
    
    const EDGE_THRESHOLD = 20; // Pixels from left edge to trigger swipe
    const MIN_SWIPE_DISTANCE = 50; // Minimum horizontal distance for swipe
    const MAX_VERTICAL_DISTANCE = 100; // Maximum vertical movement allowed
    const MAX_SWIPE_TIME = 500; // Maximum time for swipe in ms
    
    const handleTouchStart = (e: TouchEvent) => {
      // Only handle touches starting from the left edge
      const touch = e.touches[0];
      if (touch.clientX <= EDGE_THRESHOLD && !sidebarOpen) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      
      // If swiping right and vertical movement is minimal, prevent default
      if (deltaX > 0 && deltaY < MAX_VERTICAL_DISTANCE) {
        // Prevent browser's back navigation gesture
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      // Check if it's a valid right swipe
      if (
        deltaX >= MIN_SWIPE_DISTANCE &&
        deltaY < MAX_VERTICAL_DISTANCE &&
        deltaTime < MAX_SWIPE_TIME &&
        !sidebarOpen
      ) {
        // Open sidebar
        setSidebarOpen(true);
        // Prevent any default browser behavior
        e.preventDefault();
      }
      
      touchStartRef.current = null;
    };
    
    // Add touch event listeners to document
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isHomePage, sidebarOpen]);
  
  // 使用外部狀態或內部狀態
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : internalSelectedCategory;
  
  // 將英文 filter 值映射回中文（用於顯示選中狀態）
  const filterNameMap: Record<string, string> = {
    'all': '熱門',
    'latest': '最新',
    'closingSoon': '倒數中',
    'followed': '已關注',
    'myBets': '已下注',
  };
  
  const externalFilterName = externalSelectedFilter ? filterNameMap[externalSelectedFilter] || externalSelectedFilter : undefined;
  const selectedFilter = externalFilterName !== undefined ? externalFilterName : internalSelectedFilter;
  const isLoggedIn = externalIsLoggedIn !== undefined ? externalIsLoggedIn : true;
  
  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchQuery(value);
    }
  };
  
  const handleCategoryChange = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    } else {
      setInternalSelectedCategory(category);
    }
  };
  
  const handleFilterChange = (filter: string) => {
    if (onFilterChange) {
      onFilterChange(filter);
    } else {
      setInternalSelectedFilter(filter);
    }
  };

  // 使用從資料庫獲取的分類列表，加上「全部」選項
  const categoryNames = ['全部', ...categories.map(cat => cat.name)];

  // 篩選市場（如果沒有外部控制，則使用內部篩選）
  const filteredMarkets = externalSearchQuery === undefined && externalSelectedCategory === undefined
    ? markets.filter(market => {
        const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             market.description.toLowerCase().includes(searchQuery.toLowerCase());
        const categoryName = market.category?.name || '其他';
        const matchesCategory = selectedCategory === '全部' || categoryName === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : markets;

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      // 模擬刷新
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('頁面已刷新');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 w-full overflow-x-hidden">
      {/* Mobile Header */}
      <MobileHeaderUI 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isLoggedIn={isLoggedIn}
        user={user ? {
          totalAssets: user.totalAssets,
          avatar: user.avatar,
        } : undefined}
        unclaimedQuestsCount={unclaimedQuestsCount}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      <div className="flex w-full">
        {/* Sidebar */}
        <SidebarUI 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isLoggedIn={isLoggedIn}
          user={user}
          onLogin={onLogin}
          onLogout={onLogout}
          unclaimedQuestsCount={unclaimedQuestsCount}
          unreadNotificationsCount={unreadNotificationsCount}
        />

        {/* Main Content */}
        <PullToRefresh onRefresh={handleRefresh} className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0 h-screen">
        <div className="w-full mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-8 lg:max-w-7xl lg:px-6">
          {/* Search Bar */}
          <SearchBar 
            value={searchQuery}
            onChange={handleSearchChange}
          />

          {/* Category Filter */}
          <CategoryFilterUI 
            categories={categoryNames}
            selected={selectedCategory}
            onSelect={handleCategoryChange}
          />

          {/* Market Filter */}
          <MarketFilterUI 
            selected={selectedFilter}
            onSelect={handleFilterChange}
            isLoggedIn={isLoggedIn}
          />

          {/* Market List */}
          <div className="mt-3 sm:mt-4 w-full max-w-4xl mx-auto">
            {filteredMarkets.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-400 text-lg">沒有找到相關市場</p>
                <p className="text-slate-300 mt-2">試試其他搜尋條件或分類</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 w-full">
                {filteredMarkets.map(market => {
                  const commentsCount = commentsCountMap.get(market.id) || 0;
                  return (
                    <MarketCardUI 
                      key={market.id} 
                      market={market}
                      commentsCount={commentsCount}
                    />
                  );
                })}
              </div>
            )}
          </div>
          </div>
        </PullToRefresh>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
