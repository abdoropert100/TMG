/**
 * مكون لوحة الإشعارات المتقدمة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Clock, Mail, CheckSquare, User, Eye, Trash2, BookMarked as MarkAsRead } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// واجهة بيانات الإشعار
interface Notification {
  id: string;
  type: 'task' | 'correspondence' | 'employee' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedEntityId?: string;
  actionUrl?: string;
}

// واجهة خصائص لوحة الإشعارات
interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
}

/**
 * مكون لوحة الإشعارات المتقدمة
 */
const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}) => {
  const { actions } = useApp();

  // حالات المكون
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'task' | 'correspondence' | 'employee' | 'system'>('all');

  // فلترة الإشعارات
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;

    // فلتر حسب حالة القراءة
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // فلتر حسب النوع
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    // ترتيب حسب التاريخ (الأحدث أولاً)
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notifications, filter, typeFilter]);

  /**
   * دالة الحصول على أيقونة نوع الإشعار
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckSquare className="h-5 w-5 text-blue-600" />;
      case 'correspondence': return <Mail className="h-5 w-5 text-green-600" />;
      case 'employee': return <User className="h-5 w-5 text-purple-600" />;
      case 'system': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  /**
   * دالة الحصول على لون الأولوية
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-r-red-500 bg-red-50';
      case 'high': return 'border-r-orange-500 bg-orange-50';
      case 'medium': return 'border-r-blue-500 bg-blue-50';
      default: return 'border-r-gray-500 bg-gray-50';
    }
  };

  /**
   * دالة تنسيق الوقت النسبي
   */
  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  /**
   * دالة معالجة النقر على الإشعار
   */
  const handleNotificationClick = (notification: Notification) => {
    // تحديد الإشعار كمقروء
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // التنقل إلى الصفحة المرتبطة
    if (notification.relatedEntityId) {
      switch (notification.type) {
        case 'task':
          actions.setCurrentPage('tasks');
          break;
        case 'correspondence':
          actions.setCurrentPage('correspondence');
          break;
        case 'employee':
          actions.setCurrentPage('employees');
          break;
      }
    }
    
    // إغلاق لوحة الإشعارات
    onClose();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        
        {/* رأس لوحة الإشعارات */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">الإشعارات</h2>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* فلاتر الإشعارات */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'الكل' },
                { key: 'unread', label: 'غير مقروء' },
                { key: 'read', label: 'مقروء' }
              ].map(filterOption => (
                <button
                  type="button"
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="mr-auto text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>
        </div>

        {/* قائمة الإشعارات */}
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد إشعارات</p>
              <p className="text-sm mt-2">
                {filter === 'unread' ? 'جميع الإشعارات مقروءة' : 'لا توجد إشعارات لعرضها'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer border-r-4 ${
                  getPriorityColor(notification.priority)
                } ${!notification.isRead ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  
                  {/* أيقونة الإشعار */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* محتوى الإشعار */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {getRelativeTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    
                    {/* شارة عدم القراءة */}
                    {!notification.isRead && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-blue-600 font-medium">جديد</span>
                      </div>
                    )}
                  </div>

                  {/* إجراءات الإشعار */}
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="تحديد كمقروء"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNotification(notification.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* تذييل لوحة الإشعارات */}
        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                عرض {filteredNotifications.length} من {notifications.length} إشعار
              </p>
              <button
                onClick={() => {
                  // فتح صفحة الإشعارات الكاملة
                  actions.setCurrentPage('notifications');
                  onClose();
                }}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                عرض جميع الإشعارات
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default NotificationPanel;