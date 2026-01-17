"use client";

import { useState, useEffect } from "react";
import { Bug, MessageSquare, Lightbulb, AlertCircle } from "lucide-react";
import Image from "next/image";

interface Feedback {
  id: string;
  type: 'bug' | 'suggestion' | 'idea' | 'other';
  content: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

const typeConfig = {
  bug: { label: '程式Bug', icon: Bug, color: 'text-red-600', bgColor: 'bg-red-50' },
  suggestion: { label: '意見反饋', icon: MessageSquare, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  idea: { label: '題目靈感', icon: Lightbulb, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  other: { label: '其他問題', icon: AlertCircle, color: 'text-slate-600', bgColor: 'bg-slate-50' },
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/feedback', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to load feedbacks');
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-red-600">錯誤: {error}</div>
        <button
          onClick={loadFeedbacks}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          重試
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">問題反饋管理</h1>
        <p className="text-sm text-slate-500 mt-1">共 {feedbacks.length} 條反饋</p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-12 text-slate-500">暫無反饋</div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => {
            const config = typeConfig[feedback.type];
            const Icon = config.icon;
            return (
              <div
                key={feedback.id}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {feedback.user.avatarUrl ? (
                      <Image
                        src={feedback.user.avatarUrl}
                        alt={feedback.user.displayName}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full border-2 border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {feedback.user.displayName[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Feedback Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor}`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className={`text-sm font-medium ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatDate(feedback.createdAt)}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {feedback.user.displayName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {feedback.user.email}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                      {feedback.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
