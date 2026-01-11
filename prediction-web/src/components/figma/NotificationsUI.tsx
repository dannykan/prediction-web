"use client";

import { Bell, Check, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { Notification } from '@/features/notification/api/getNotifications';

interface NotificationsUIProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: number) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick?: (notification: Notification) => void;
  markingAsRead: number | null;
}

export function NotificationsUI({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  markingAsRead,
}: NotificationsUIProps) {
  const handleNotificationClick = (notification: Notification) => {
    if (notification.isNew) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.relatedId) {
      // Default navigation behavior
      if (notification.type === 'comment_reply' || notification.type === 'comment_like') {
        window.location.href = `/m/${notification.relatedId}`;
      } else if (notification.type === 'market_settlement') {
        window.location.href = `/m/${notification.relatedId}`;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
      {/* Page Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">通知</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">查看你的最新動態</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span className="hidden md:inline">全部標記為已讀</span>
            <span className="md:hidden">全部已讀</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">沒有通知</h3>
          <p className="text-sm text-slate-600">目前沒有新的通知訊息</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {notifications.map((notification) => {
              // Parse timestamp string to Date
              const notificationDate = new Date(notification.timestamp);
              const isInvalidDate = isNaN(notificationDate.getTime());
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors hover:bg-slate-50 cursor-pointer ${
                    notification.isNew ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.isNew ? 'bg-blue-100' : 'bg-slate-100'
                      }`}
                      style={{ color: notification.color }}
                    >
                      <span className="text-xl">{notification.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`text-sm md:text-base font-bold ${
                          notification.isNew ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {notification.title}
                        </h3>
                        {notification.isNew && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>
                          {isInvalidDate 
                            ? notification.timestamp 
                            : formatDistanceToNow(notificationDate, { addSuffix: true, locale: zhTW })
                          }
                        </span>
                        {notification.isNew && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification.id);
                            }}
                            disabled={markingAsRead === notification.id}
                            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            <Check className="w-3 h-3" />
                            標記為已讀
                          </button>
                        )}
                        {notification.relatedId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                          >
                            查看詳情
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info */}
      {notifications.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            通知會保留 30 天，過期後將自動刪除
          </p>
        </div>
      )}
    </div>
  );
}
