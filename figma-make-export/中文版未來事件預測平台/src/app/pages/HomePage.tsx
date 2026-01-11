import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { MarketFilter } from '../components/MarketFilter';
import { MarketCard } from '../components/MarketCard';
import { MobileHeader } from '../components/MobileHeader';
import { SEOHead } from '../components/SEOHead';
import { PullToRefresh } from '../components/PullToRefresh';

// Mock data
const categories = [
  '全部',
  '政治',
  '娛樂',
  '體育',
  '科技',
  '加密貨幣',
  '財經',
  '社會',
  '國際',
  '其他'
];

const markets = [
  {
    id: '1',
    title: '2026年總統大選民進黨會勝出嗎？',
    description: '預測2026年台灣總統大選結果',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
    creator: '政治觀察家',
    creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    comments: 234,
    volume: 125600,
    probability: 65,
    category: '政治',
    type: 'yes_no' as const,
    createdAt: new Date('2025-01-08'),
    closingAt: new Date('2026-11-24')
  },
  {
    id: '2',
    title: 'Threads會在2026年超越X(Twitter)用戶數嗎？',
    description: '預測Meta的Threads社交平台是否能超越X的活躍用戶數',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    creator: 'Tech鄉民',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    comments: 189,
    volume: 89400,
    probability: 42,
    category: '科技',
    type: 'yes_no' as const,
    createdAt: new Date('2025-01-07'),
    closingAt: new Date('2026-12-31')
  },
  {
    id: '3',
    title: 'BTC會在2026年Q1突破10萬美金嗎？',
    description: '預測比特幣價格走勢',
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
    creator: '幣圈老韭菜',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    comments: 567,
    volume: 234500,
    probability: 78,
    category: '加密貨幣',
    type: 'yes_no' as const,
    createdAt: new Date('2025-01-09'),
    closingAt: new Date('2026-03-31')
  },
  {
    id: '4',
    title: '台北大巨蛋會成功舉辦演唱會嗎？',
    description: '預測台北大巨蛋2026年演唱會舉辦情況',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    creator: '演唱會狂粉',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    comments: 145,
    volume: 56700,
    probability: 85,
    category: '娛樂',
    type: 'yes_no' as const,
    createdAt: new Date('2025-01-06'),
    closingAt: new Date('2026-06-30')
  },
  {
    id: '5',
    title: '哪支球隊會贏得2026 NBA總冠軍？',
    description: '預測NBA 2025-26賽季總冠軍',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    creator: 'NBA迷',
    creatorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    comments: 312,
    volume: 178900,
    category: '體育',
    type: 'multiple_choice' as const,
    options: [
      { id: 'a', name: '洛杉磯湖人', probability: 35 },
      { id: 'b', name: '波士頓塞爾提克', probability: 28 },
      { id: 'c', name: '金州勇士', probability: 15 },
      { id: 'd', name: '丹佛金塊', probability: 12 },
      { id: 'e', name: '其他', probability: 10 }
    ],
    createdAt: new Date('2025-01-05'),
    closingAt: new Date('2026-06-20')
  },
  {
    id: '6',
    title: 'ChatGPT會推出GPT-5嗎？',
    description: '預測OpenAI在2026年是否會發布GPT-5',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    creator: 'AI狂熱者',
    creatorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100',
    comments: 423,
    volume: 198700,
    probability: 68,
    category: '科技',
    type: 'yes_no' as const,
    createdAt: new Date('2025-01-10'),
    closingAt: new Date('2026-12-31')
  }
];

const mockUser = {
  name: '神預測玩家',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
  totalAssets: 15000,
  totalInvested: 8500,
  profitRate: 76.5,
  dailyQuests: 3,
  weeklyQuests: 5,
  unclaimedRewards: 2,
  followedMarkets: 12,
  inviteCode: 'PRED2026'
};

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock login state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedFilter, setSelectedFilter] = useState('熱門');

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         market.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || market.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRefresh = async () => {
    // 模擬刷新數據
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('頁面已刷新');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 w-full overflow-x-hidden">
      <SEOHead />
      
      {/* Mobile Header */}
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isLoggedIn={isLoggedIn}
        user={mockUser}
      />

      <div className="flex w-full">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isLoggedIn={isLoggedIn}
          user={mockUser}
          onLogin={() => setIsLoggedIn(true)}
          onLogout={() => setIsLoggedIn(false)}
        />

        {/* Main Content */}
        <PullToRefresh onRefresh={handleRefresh} className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0 h-screen">
          <div className="w-full mx-auto px-3 sm:px-4 py-3 sm:py-4 lg:py-8 lg:max-w-7xl lg:px-6">
            {/* Search Bar */}
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
            />

            {/* Category Filter */}
            <CategoryFilter 
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />

            {/* Market Filter */}
            <MarketFilter 
              selected={selectedFilter}
              onSelect={setSelectedFilter}
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
                  {filteredMarkets.map(market => (
                    <MarketCard key={market.id} market={market} />
                  ))}
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