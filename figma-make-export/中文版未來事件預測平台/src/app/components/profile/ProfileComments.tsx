import { MessageCircle, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';
import { BetIcon } from '../market-detail/BetIcon';

interface Comment {
  id: string;
  marketId: string;
  marketTitle: string;
  content: string;
  timestamp: Date;
  likes: number;
  bet?: {
    amount: number;
    optionName?: string;
    direction: 'yes' | 'no';
  };
}

export function ProfileComments() {
  const navigate = useNavigate();

  // Mock comments data
  const comments: Comment[] = [
    {
      id: '1',
      marketId: '1',
      marketTitle: '2026 台灣總統大選，民進黨會繼續執政嗎？',
      content: '從最近的民調來看，執政黨支持度確實有上升趨勢，但距離選舉還有很長時間，變數還很多。我認為經濟表現會是關鍵因素。',
      timestamp: new Date('2026-01-10T14:30:00'),
      likes: 12,
      bet: {
        amount: 5000,
        direction: 'yes',
      },
    },
    {
      id: '2',
      marketId: '5',
      marketTitle: 'NBA 2025-26 總冠軍',
      content: '湖人隊這個賽季的陣容很強，加上主場優勢，我看好他們能奪冠。',
      timestamp: new Date('2026-01-09T18:20:00'),
      likes: 8,
      bet: {
        amount: 3000,
        optionName: '洛杉磯湖人',
        direction: 'yes',
      },
    },
    {
      id: '3',
      marketId: '5',
      marketTitle: 'NBA 2025-26 總冠軍',
      content: '塞爾提克的傷病問題太嚴重了，這個賽季可能很難走遠。',
      timestamp: new Date('2026-01-08T16:45:00'),
      likes: 5,
      bet: {
        amount: 2000,
        optionName: '波士頓塞爾提克',
        direction: 'no',
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900">我的評論 ({comments.length})</h3>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => navigate(`/market/${comment.marketId}`)}
          >
            {/* Market Title */}
            <h4 className="text-sm font-medium text-slate-900 mb-2 line-clamp-1">
              {comment.marketTitle}
            </h4>

            {/* Bet Info */}
            {comment.bet && (
              <div className="flex items-center gap-1 mb-2 px-2 py-1 bg-indigo-50 rounded text-xs w-fit">
                <span className="text-slate-600">押注</span>
                {comment.bet.optionName && (
                  <span className="font-medium text-slate-700">{comment.bet.optionName}</span>
                )}
                <BetIcon direction={comment.bet.direction} size="sm" />
                <img src={gcoinImage} alt="G coin" className="w-3 h-3 ml-0.5" />
                <span className="font-bold text-indigo-700">{comment.bet.amount.toLocaleString()}</span>
              </div>
            )}

            {/* Comment Content */}
            <p className="text-sm text-slate-700 leading-relaxed mb-3 line-clamp-3">
              {comment.content}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{comment.likes}</span>
              </div>
              <span>•</span>
              <span>{formatDistanceToNow(comment.timestamp, { addSuffix: true, locale: zhTW })}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="border-t border-slate-200 p-4 text-center">
        <button className="px-4 py-2 text-sm bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors">
          載入更多
        </button>
      </div>
    </div>
  );
}
