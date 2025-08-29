import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Mail, 
  CheckCircle, 
  X,
  Bell,
  Calendar,
  User,
  FileText,
  ExternalLink
} from 'lucide-react';

// واجهة بيانات التنبيه
interface Alert {
  id: string;
  type: 'urgent' | 'overdue' | 'reminder' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  relatedEntity?: {
    type: 'task' | 'correspondence' | 'employee';
    id: string;
    name: string;
  };
}

import { useApp } from '../../context/AppContext';

// مكون التنبيهات والإشعارات
const AlertsNotifications: React.FC = () => {
  const { state } = useApp();
  
  // حساب التنبيهات من البيانات الفعلية
  const alerts = React.useMemo(() => {
    const alertsData: Alert[] = [];
    
    // تنبيهات المهام المتأخرة
    const overdueTasks = (state.tasks || []).filter(task => {
      const endDate = new Date(task.endDate);
      const now = new Date();
      return endDate < now && task.status !== 'مكتملة';
    });
    
    if (overdueTasks.length > 0) {
      alertsData.push({
        id: 'overdue-tasks',
        type: 'overdue',
        title: 'مهام متأخرة',
        message: `${overdueTasks.length} مهام تجاوزت الموعد المحدد`,
        timestamp: new Date(),
        isRead: false
      });
    }
    
    // تنبيهات المراسلات العاجلة
    const urgentCorr = (state.correspondence || []).filter(corr => 
      corr.urgency === 'عاجل' || corr.urgency === 'فوري'
    );
    
    if (urgentCorr.length > 0) {
      alertsData.push({
        id: 'urgent-correspondence',
        type: 'urgent',
        title: 'مراسلات عاجلة',
        message: `${urgentCorr.length} مراسلات تحتاج معالجة عاجلة`,
        timestamp: new Date(),
        isRead: false
      });
    }
    
    return alertsData;
  }, [state.tasks, state.correspondence]);
  
  const [showAll, setShowAll] = useState(false);

  // دالة إزالة التنبيه
  const dismissAlert = (alertId: string) => {
    // يمكن إضافة منطق حذف التنبيه هنا
  };

  // دالة تحديد التنبيه كمقروء
  const markAsRead = (alertId: string) => {
    // يمكن إضافة منطق تحديد كمقروء هنا
  };

  // دالة الحصول على أيقونة نوع التنبيه
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'overdue':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'reminder':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
        return <Mail className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // دالة الحصول على ألوان التنبيه
  const getAlertColors = (type: Alert['type']) => {
    switch (type) {
      case 'urgent':
        return 'border-red-200 bg-red-50';
      case 'overdue':
        return 'border-orange-200 bg-orange-50';
      case 'reminder':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // دالة تنسيق الوقت
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `منذ ${minutes} دقيقة`;
    } else if (hours < 24) {
      return `منذ ${hours} ساعة`;
    } else {
      return `منذ ${days} يوم`;
    }
  };

  // دالة الحصول على أيقونة الكيان المرتبط
  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'task':
        return <CheckCircle className="h-4 w-4" />;
      case 'correspondence':
        return <Mail className="h-4 w-4" />;
      case 'employee':
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const displayedAlerts = showAll ? alerts : alerts.slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      
      {/* العنوان */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">التنبيهات والإشعارات</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showAll ? 'عرض أقل' : 'عرض المزيد'}
        </button>
      </div>

      {/* قائمة التنبيهات */}
      <div className="space-y-3">
        {displayedAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>لا توجد تنبيهات جديدة</p>
          </div>
        ) : (
          displayedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`relative p-4 rounded-lg border transition-all duration-200 ${
                getAlertColors(alert.type)
              } ${!alert.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
            >
              
              {/* زر الإغلاق */}
              <button
                onClick={() => dismissAlert(alert.id)}
                className="absolute top-2 left-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-3 pr-6">
                
                {/* أيقونة التنبيه */}
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>

                {/* محتوى التنبيه */}
                <div className="flex-1 min-w-0">
                  
                  {/* العنوان والوقت */}
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-medium ${!alert.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {alert.title}
                    </h4>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>

                  {/* الرسالة */}
                  <p className="text-sm text-gray-600 mb-2">
                    {alert.message}
                  </p>

                  {/* الكيان المرتبط */}
                  {alert.relatedEntity && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {getEntityIcon(alert.relatedEntity.type)}
                      <span>{alert.relatedEntity.name}</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  )}

                  {/* الإجراءات */}
                  <div className="flex items-center gap-2 mt-3">
                    {!alert.isRead && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        تحديد كمقروء
                      </button>
                    )}
                    {alert.actionUrl && (
                      <button className="text-xs text-green-600 hover:text-green-800 transition-colors">
                        عرض التفاصيل
                      </button>
                    )}
                  </div>

                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* إحصائيات سريعة */}
      {alerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-4 text-center">
            
            <div className="p-2">
              <div className="text-lg font-bold text-red-600">
                {alerts.filter(a => a.type === 'urgent').length}
              </div>
              <div className="text-xs text-red-800">عاجل</div>
            </div>
            
            <div className="p-2">
              <div className="text-lg font-bold text-orange-600">
                {alerts.filter(a => a.type === 'overdue').length}
              </div>
              <div className="text-xs text-orange-800">متأخر</div>
            </div>
            
            <div className="p-2">
              <div className="text-lg font-bold text-blue-600">
                {alerts.filter(a => a.type === 'reminder').length}
              </div>
              <div className="text-xs text-blue-800">تذكير</div>
            </div>
            
            <div className="p-2">
              <div className="text-lg font-bold text-green-600">
                {alerts.filter(a => a.type === 'success').length}
              </div>
              <div className="text-xs text-green-800">مكتمل</div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AlertsNotifications;
