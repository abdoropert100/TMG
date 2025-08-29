/**
 * خطاف الإشعارات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { useState, useEffect } from 'react';
import { notificationService } from '../services/NotificationService';
import { useApp } from '../context/AppContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  priority: string;
  timestamp: Date;
}

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { state } = useApp();

  // تحميل الإشعارات
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const userNotificationsRaw = await notificationService.getUserNotifications(userId);
      // تحويل الحقول لتتوافق مع واجهة NotificationPanel
      const userNotifications = userNotificationsRaw.map(n => ({
        ...n,
        isRead: n.read,
        timestamp: n.createdAt
      }));
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('خطأ في تحميل الإشعارات:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحديد إشعار كمقروء
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('خطأ في تحديد الإشعار كمقروء:', error);
    }
  };

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('خطأ في تحديد جميع الإشعارات كمقروءة:', error);
    }
  };

  // حذف إشعار
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
    }
  };

  // تحميل الإشعارات عند التحميل الأول
  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId, state.tasks]);

  return {
    notifications,
    loading,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};