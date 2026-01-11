import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Clock, Users, MessageCircle, Share2, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Sidebar } from '../components/Sidebar';
import { MobileHeader } from '../components/MobileHeader';
import { LmsrTradingCard } from '../components/market-detail/LmsrTradingCard';
import { ProbabilityChart } from '../components/market-detail/ProbabilityChart';
import { CommentsSection } from '../components/market-detail/CommentsSection';
import { TradeHistorySection } from '../components/market-detail/TradeHistorySection';
import { PullToRefresh } from '../components/PullToRefresh';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';

export default function MarketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoggedIn] = useState(true); // Mock state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

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

  // Mock market data - 根據 id 決定題型
  const getMarketByType = () => {
    if (id === '1') {
      return {
        id: '1',
        title: '2026 台灣總統大選，民進黨會繼續執政嗎？',
        description: '這個市場預測 2026 年台灣總統大選中，民進黨是否能夠繼續執政。如果民進黨候選人當選總統，此市場將解決為「是」；如果其他政黨候選人當選，則解決為「否」。',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
        creator: '小明',
        creatorAvatar: 'https://i.pravatar.cc/150?u=creator1',
        createdAt: new Date('2025-01-01'),
        closingAt: new Date('2026-01-11'),
        status: 'OPEN',
        category: '政治',
        type: 'yes_no' as const,
        probability: 65,
        volume: 125000,
        trades: 342,
        holders: 89,
        comments: 156,
        rules: '此市場將根據 2026 年中央選舉委員會公布的正式選舉結果進行結算。',
      };
    } else if (id === '5') {
      return {
        id: '5',
        title: '哪支球隊會贏得 2026 NBA 總冠軍？',
        description: '預測 NBA 2025-26 賽季的總冠軍球隊。',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
        creator: 'NBA 迷',
        creatorAvatar: 'https://i.pravatar.cc/150?u=creator2',
        createdAt: new Date('2025-01-05'),
        closingAt: new Date('2026-06-20'),
        status: 'OPEN',
        category: '體育',
        type: 'single_choice' as const,
        options: [
          { id: 'lakers', name: '洛杉磯湖人', probability: 35 },
          { id: 'celtics', name: '波士頓塞爾提克', probability: 28 },
          { id: 'warriors', name: '金州勇士', probability: 15 },
          { id: 'nuggets', name: '丹佛金塊', probability: 12 },
          { id: 'bucks', name: '密爾瓦基公鹿', probability: 10 },
        ],
        volume: 178900,
        trades: 312,
        holders: 145,
        comments: 89,
        rules: '此市場將根據 2026 NBA 總決賽的官方結果進行結算。',
      };
    } else {
      return {
        id: id || '1',
        title: '2026 台灣總統大選，民進黨會繼續執政嗎？',
        description: '這個市場預測 2026 年台灣總統大選中，民進黨是否能夠繼續執政。',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
        creator: '小明',
        creatorAvatar: 'https://i.pravatar.cc/150?u=creator1',
        createdAt: new Date('2025-01-01'),
        closingAt: new Date('2026-01-11'),
        status: 'OPEN',
        category: '政治',
        type: 'yes_no' as const,
        probability: 65,
        volume: 125000,
        trades: 342,
        holders: 89,
        comments: 156,
        rules: '此市場將根據 2026 年中央選舉委員會公布的正式選舉結果進行結算。',
      };
    }
  };

  const market = getMarketByType();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: market.title,
          text: market.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('連結已複製到剪貼簿！');
      } catch (err) {
        // Fallback for browsers that block Clipboard API
        try {
          const textArea = document.createElement('textarea');
          textArea.value = window.location.href;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (successful) {
            alert('連結已複製到剪貼簿！');
          }
        } catch (fallbackErr) {
          console.error('Failed to copy:', fallbackErr);
        }
      }
    }
  };

  const handleRefresh = async () => {
    // 模擬刷新市場數據
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('市場詳情已刷新');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
          onLogin={() => {}}
          onLogout={() => {}}
        />

        {/* Main Content */}
        <PullToRefresh onRefresh={handleRefresh} className="flex-1 w-full min-w-0 lg:ml-64 pt-16 lg:pt-0 h-screen">
          <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6">
            {/* Header with Back Button */}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">返回市場列表</span>
                <span className="md:hidden">返回</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-sm rounded-lg font-medium transition-all ${
                    isFollowing
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFollowing ? 'fill-current' : ''}`} />
                  <span className="hidden md:inline">{isFollowing ? '已關注' : '關注'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-sm bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:border-indigo-400 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden md:inline">分享</span>
                </button>
              </div>
            </div>

            {/* Market Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-4">
              {/* Category Badge */}
              <div className="mb-3">
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs md:text-sm font-medium rounded-full">
                  {market.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-3 md:mb-4">
                {market.title}
              </h1>

              {/* Image */}
              {market.image && (
                <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden mb-4">
                  <img
                    src={market.image}
                    alt={market.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Description */}
              <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4">
                {market.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                  <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600 flex-shrink-0" />
                  <img src={gcoinImage} alt="G coin" className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="font-bold text-slate-900">{market.volume.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span>{market.holders} 持倉</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                  <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span>{market.comments} 評論</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-600">
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">{formatDistanceToNow(market.closingAt, { addSuffix: true, locale: zhTW })}結束</span>
                </div>
              </div>

              {/* Creator & Time Info */}
              <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500 pt-3 md:pt-4 border-t border-slate-200 flex-wrap">
                <div className="flex items-center gap-2">
                  <img
                    src={market.creatorAvatar}
                    alt={market.creator}
                    className="w-5 h-5 md:w-6 md:h-6 rounded-full"
                  />
                  <span>創建: {market.creator}</span>
                </div>
                <span className="hidden md:inline">•</span>
                <span>{market.createdAt.toLocaleDateString('zh-TW')}</span>
              </div>
            </div>

            {/* Settlement Rules */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 md:p-6 mb-4">
              <h2 className="text-base md:text-lg font-bold text-slate-900 mb-2 md:mb-3">結算規則</h2>
              <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                {market.rules}
              </p>
            </div>

            {/* Probability Chart */}
            <div className="mb-4">
              <ProbabilityChart marketId={market.id} type={market.type} />
            </div>

            {/* Trading Card */}
            <div className="mb-4">
              <LmsrTradingCard market={market} isLoggedIn={isLoggedIn} />
            </div>

            {/* Comments Section */}
            <div className="mb-4">
              <CommentsSection marketId={market.id} isLoggedIn={isLoggedIn} marketType={market.type} />
            </div>

            {/* Trade History */}
            <div className="mb-4">
              <TradeHistorySection marketId={market.id} isLoggedIn={isLoggedIn} marketType={market.type} />
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