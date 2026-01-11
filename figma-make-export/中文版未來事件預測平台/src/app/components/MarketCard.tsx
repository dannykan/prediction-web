import { MessageCircle, BarChart3, Clock, Circle, X as XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface Market {
  id: string;
  title: string;
  description: string;
  image: string;
  creator: string;
  creatorAvatar: string;
  comments: number;
  volume: number;
  probability?: number;
  category: string;
  type: 'yes_no' | 'multiple_choice';
  options?: Array<{ id: string; name: string; probability: number }>;
  createdAt: Date;
  closingAt: Date;
}

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const timeUntilClose = formatDistanceToNow(market.closingAt, { addSuffix: true, locale: zhTW });
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group w-full overflow-hidden" onClick={() => navigate(`/market/${market.id}`)}>
      <div className="p-3 sm:p-4 w-full">
        {/* Horizontal layout for all screen sizes */}
        <div className="flex gap-3 sm:gap-4 w-full">
          {/* Image - Square on left */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
            <div className="w-full h-full rounded-lg overflow-hidden relative">
              <img 
                src={market.image} 
                alt={market.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5">
                <span className="px-1.5 py-0.5 sm:px-2 bg-indigo-600 text-white text-[10px] sm:text-xs font-medium rounded">
                  {market.category}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 w-full min-w-0">
            {/* Title */}
            <h3 className="font-bold text-sm sm:text-base text-slate-800 mb-1 sm:mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {market.title}
            </h3>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 mb-2">
              <div className="flex items-center gap-1">
                <img 
                  src={market.creatorAvatar} 
                  alt={market.creator}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                />
                <span className="truncate max-w-[60px] sm:max-w-[80px]">{market.creator}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{market.comments}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="whitespace-nowrap">{timeUntilClose}結束</span>
              </div>
            </div>

            {/* Volume - More compact */}
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-600 mb-2">
              <BarChart3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <img src={gcoinImage} alt="G coin" className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="font-bold">{market.volume.toLocaleString()}</span>
            </div>

            {/* Prediction Buttons - Yes/No */}
            {market.type === 'yes_no' && market.probability !== undefined && (
              <div className="w-full">
                <div className="w-full flex items-center justify-between gap-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 border border-green-200">
                  <div className="flex-shrink-0">
                    <p className="text-xl sm:text-2xl font-bold text-green-600 leading-none">{market.probability}%</p>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                    <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-green-500 text-white rounded-md hover:bg-green-600 active:bg-green-700 transition-colors shadow-sm">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white rounded-full"></div>
                    </button>
                    <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-red-500 text-white rounded-md hover:bg-red-600 active:bg-red-700 transition-colors shadow-sm">
                      <XIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Prediction Buttons - Multiple Choice */}
            {market.type === 'multiple_choice' && market.options && (
              <div className="space-y-1.5 w-full">
                {market.options.slice(0, 2).map(option => (
                  <div 
                    key={option.id} 
                    className="w-full flex items-center justify-between gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-2 border border-indigo-200"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] sm:text-xs text-slate-700 font-medium block truncate">{option.name}</span>
                      <span className="text-sm sm:text-base font-bold text-indigo-600 leading-none block">{option.probability}%</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-green-500 text-white rounded-md hover:bg-green-600 active:bg-green-700 transition-colors">
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white rounded-full"></div>
                      </button>
                      <button className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-red-500 text-white rounded-md hover:bg-red-600 active:bg-red-700 transition-colors">
                        <XIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ))}
                {market.options.length > 2 && (
                  <p className="text-center text-[10px] sm:text-xs text-slate-400 pt-1">
                    +{market.options.length - 2} 個選項
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}