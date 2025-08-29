/**
 * خدمة الإشعارات والتنبيهات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { databaseService } from './DatabaseService';

// واجهة بيانات الإشعار
interface Notification {
  id: string;
  type: 'task_assigned' | 'task_completed' | 'task_overdue' | 'correspondence_received' | 'correspondence_urgent' | 'system_alert';
  title: string;
  message: string;
  userId: string;
  read: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedEntityId?: string;
  relatedEntityType?: 'task' | 'correspondence' | 'employee';
  actionUrl?: string;
  actionText?: string;
  channels: ('browser' | 'email' | 'sms')[];
  createdAt: Date;
  expiresAt?: Date;
}

class NotificationService {
  /**
   * إنشاء إشعار جديد
   */
  async createNotification(notificationData: Partial<Notification>): Promise<string> {
    try {
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'system_alert',
        title: '',
        message: '',
        userId: '',
        read: false,
        priority: 'medium',
        channels: ['browser'],
        createdAt: new Date(),
        ...notificationData
      } as Notification;

      await databaseService.add('notifications', notification);
      
      // إرسال الإشعار عبر القنوات المحددة
      await this.sendNotification(notification);
      
      return notification.id;
    } catch (error) {
      console.error('خطأ في إنشاء الإشعار:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار عبر القنوات المختلفة
   */
  private async sendNotification(notification: Notification): Promise<void> {
    try {
      // إرسال عبر المتصفح
      if (notification.channels.includes('browser')) {
        this.sendBrowserNotification(notification);
      }

      // إرسال عبر البريد الإلكتروني
      if (notification.channels.includes('email')) {
        await this.sendEmailNotification(notification);
      }

      // إرسال عبر الرسائل النصية
      if (notification.channels.includes('sms')) {
        await this.sendSMSNotification(notification);
      }
    } catch (error) {
      console.error('خطأ في إرسال الإشعار:', error);
    }
  }

  /**
   * إرسال إشعار المتصفح
   */
  private sendBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: notification.id
      });
    }
  }

  /**
   * إرسال إشعار البريد الإلكتروني
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    // محاكاة إرسال البريد الإلكتروني
    console.log('إرسال إشعار بريد إلكتروني:', notification);
  }

  /**
   * إرسال رسالة نصية
   */
  private async sendSMSNotification(notification: Notification): Promise<void> {
    // محاكاة إرسال رسالة نصية
    console.log('إرسال رسالة نصية:', notification);
  }

  /**
   * الحصول على إشعارات المستخدم
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const allNotifications = await databaseService.getAll<Notification>('notifications');
      return allNotifications
        .filter(notif => notif.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
      return [];
    }
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await databaseService.update('notifications', notificationId, {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error('خطأ في تحديد الإشعار كمقروء:', error);
    }
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const userNotifications = await this.getUserNotifications(userId);
      const unreadNotifications = userNotifications.filter(n => !n.read);
      
      for (const notification of unreadNotifications) {
        await this.markAsRead(notification.id);
      }
    } catch (error) {
      console.error('خطأ في تحديد جميع الإشعارات كمقروءة:', error);
    }
  }

  /**
   * حذف إشعار
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await databaseService.delete('notifications', notificationId);
    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
    }
  }

  /**
   * إنشاء إشعار لمهمة جديدة
   */
  async notifyTaskAssigned(taskId: string, taskTitle: string, assignedToIds: string[]): Promise<void> {
    for (const userId of assignedToIds) {
      await this.createNotification({
        type: 'task_assigned',
        title: 'مهمة جديدة مسندة إليك',
        message: `تم إسناد مهمة "${taskTitle}" إليك`,
        userId,
        priority: 'medium',
        relatedEntityId: taskId,
        relatedEntityType: 'task',
        channels: ['browser', 'email']
      });
    }
  }

  /**
   * إنشاء إشعار لمراسلة عاجلة
   */
  async notifyUrgentCorrespondence(correspondenceId: string, subject: string, assignedTo: string): Promise<void> {
    await this.createNotification({
      type: 'correspondence_urgent',
      title: 'مراسلة عاجلة تحتاج متابعة',
      message: `مراسلة عاجلة: ${subject}`,
      userId: assignedTo,
      priority: 'high',
      relatedEntityId: correspondenceId,
      relatedEntityType: 'correspondence',
      channels: ['browser', 'email', 'sms']
    });
  }

  /**
   * إنشاء إشعار لمهمة متأخرة
   */
  async notifyOverdueTask(taskId: string, taskTitle: string, assignedToIds: string[]): Promise<void> {
    for (const userId of assignedToIds) {
      await this.createNotification({
        type: 'task_overdue',
        title: 'مهمة متأخرة',
        message: `المهمة "${taskTitle}" تجاوزت الموعد المحدد`,
        userId,
        priority: 'high',
        relatedEntityId: taskId,
        relatedEntityType: 'task',
        channels: ['browser', 'email']
      });
    }
  }

  /**
   * طلب إذن الإشعارات من المتصفح
   */
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

export const notificationService = new NotificationService();
export default NotificationService;