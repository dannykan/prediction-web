import { MessageCircle, BarChart3, Clock, Circle, X as XIcon } from 'lucide-react';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale/zh-TW';

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

interface MarketCardWideProps {
  market: Market;
}

export function MarketCardWide({ market }: MarketCardWideProps) {
  const timeUntilClose = formatDistanceToNow(market.closingAt, { addSuffix: true, locale: zhTW });
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
      {/* Image - 16:9 ratio */}
      <div className="relative w-full aspect-video overflow-hidden">
        <img 
          src={market.image} 
          alt={market.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-medium rounded shadow-lg">
            {market.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-base text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {market.title}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1">
            <img 
              src={market.creatorAvatar} 
              alt={market.creator}
              className="w-4 h-4 rounded-full"
            />
            <span className="truncate max-w-[80px]">{market.creator}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{market.comments}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="truncate">{timeUntilClose}結束</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1 text-xs text-slate-600 mb-3">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>交易量:</span>
          <img src={gcoinImage} alt="G coin" className="w-3.5 h-3.5" />
          <span className="font-bold">{market.volume.toLocaleString()}</span>
        </div>

        {/* Prediction Buttons */}
        {market.type === 'yes_no' && market.probability !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2.5 border border-green-200">
              <div className="flex-1">
                <span className="text-xs text-green-700 font-medium">YES</span>
                <p className="text-xl font-bold text-green-600">{market.probability}%</p>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                  <Circle className="w-5 h-5 fill-current" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm">
                  <XIcon className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {market.type === 'multiple_choice' && market.options && (
          <div className="space-y-2">
            {market.options.slice(0, 2).map(option => (
              <div 
                key={option.id} 
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-2.5 border border-indigo-200"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-700 font-medium truncate block">{option.name}</span>
                  <span className="text-base font-bold text-indigo-600">{option.probability}%</span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="w-9 h-9 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                    <Circle className="w-4 h-4 fill-current" />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm">
                    <XIcon className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
            {market.options.length > 2 && (
              <p className="text-center text-xs text-slate-400 pt-1">
                +{market.options.length - 2} 個選項
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}