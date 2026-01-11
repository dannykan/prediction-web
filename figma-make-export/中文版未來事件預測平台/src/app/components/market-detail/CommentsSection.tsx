import { useState } from 'react';
import { MessageCircle, ThumbsUp, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import gcoinImage from 'figma:asset/815824d9c86b41bb7e8aa0f765dd2b20dee5b8ab.png';
import { BetIcon } from './BetIcon';

interface CommentsSectionProps {
  marketId: string;
  isLoggedIn: boolean;
  marketType?: 'yes_no' | 'single_choice' | 'multiple_choice';
}

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
    badge?: string;
  };
  content: string;
  createdAt: Date;
  likes: number;
  isLiked: boolean;
  bet?: {
    amount: number;
    option: string;
    direction: 'yes' | 'no';
    change: number;
  };
}

export function CommentsSection({ marketId, isLoggedIn, marketType = 'yes_no' }: CommentsSectionProps) {
  const [comment, setComment] = useState('');
  const [comments] = useState<Comment[]>([
    {
      id: '1',
      user: {
        name: '政治觀察家',
        avatar: 'https://i.pravatar.cc/150?u=user1',
        badge: '🏅 資深預測師',
      },
      content: '從最近的民調來看，執政黨支持度確實有上升趨勢，但距離選舉還有很長時間，變數還很多。',
      createdAt: new Date('2026-01-09T10:30:00'),
      likes: 24,
      isLiked: false,
      bet: {
        amount: 5000,
        option: marketType === 'yes_no' ? '' : '洛杉磯湖人',
        direction: 'yes',
        change: 3,
      },
    },
    {
      id: '2',
      user: {
        name: '小華',
        avatar: 'https://i.pravatar.cc/150?u=user2',
      },
      content: '我覺得經濟議題會是關鍵，看未來一年的經濟表現如何。',
      createdAt: new Date('2026-01-09T14:20:00'),
      likes: 12,
      isLiked: true,
    },
    {
      id: '3',
      user: {
        name: '數據分析師',
        avatar: 'https://i.pravatar.cc/150?u=user3',
        badge: '📊 數據專家',
      },
      content: '根據歷史數據，執政黨連任的機率通常在選前半年會有明顯變化，現在下注還太早。',
      createdAt: new Date('2026-01-10T09:15:00'),
      likes: 18,
      isLiked: false,
      bet: {
        amount: 3000,
        option: marketType === 'yes_no' ? '' : '波士頓塞爾提克',
        direction: 'no',
        change: -2,
      },
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      console.log('提交評論:', comment);
      setComment('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">
          評論討論 <span className="text-slate-500">({comments.length})</span>
        </h2>
      </div>

      {/* Comment Input */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2 md:gap-3">
            <img
              src="https://i.pravatar.cc/150?u=currentuser"
              alt="Your avatar"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="分享你的看法..."
                className="w-full px-3 py-2 md:px-4 md:py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  發布評論
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 md:p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
          <p className="text-sm text-slate-600 mb-3">登入後即可參與討論</p>
          <button className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all">
            登入
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2 md:gap-3 pb-4 border-b border-slate-200 last:border-0 last:pb-0">
            <img
              src={comment.user.avatar}
              alt={comment.user.name}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              {/* User Info */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-bold text-slate-900 text-sm">{comment.user.name}</span>
                {comment.bet && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 rounded text-xs">
                    <span className="text-slate-600">押注</span>
                    {marketType !== 'yes_no' && comment.bet.option && (
                      <span className="font-medium text-slate-700">{comment.bet.option}</span>
                    )}
                    <BetIcon direction={comment.bet.direction} size="sm" />
                    <img src={gcoinImage} alt="G coin" className="w-3 h-3 ml-0.5" />
                    <span className="font-bold text-indigo-700">{comment.bet.amount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <p className="text-slate-700 text-sm leading-relaxed mb-2">{comment.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-3 text-xs">
                <button
                  className={`flex items-center gap-1 transition-colors ${
                    comment.isLiked
                      ? 'text-indigo-600 font-medium'
                      : 'text-slate-500 hover:text-indigo-600'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                  <span>{comment.likes}</span>
                </button>
                <span className="text-slate-400">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: zhTW })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {comments.length > 0 && (
        <div className="mt-4 text-center">
          <button className="px-4 py-2 text-sm bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors">
            載入更多評論
          </button>
        </div>
      )}
    </div>
  );
}