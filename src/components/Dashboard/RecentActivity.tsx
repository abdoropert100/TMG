/**
 * مكون النشاطات الأخيرة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React from 'react';
import { 
  Activity, 
  User, 
  CheckSquare, 
  Mail, 
  Building2, 
  Clock,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * مكون النشاطات الأخيرة في النظام
 * يعرض آخر الأنشطة والتحديثات من جميع أقسام النظام
 */
const RecentActivity: React.FC = () => {
  const { state, actions } = useApp();

  // حساب النشاطات الأخيرة من البيانات الفعلية
  const recentActivities = React.useMemo(() => {
    const activities = [];

    // إضافة نشاطات المهام الأخيرة
    (state.tasks || []).slice(0, 3).forEach(task => {
      activities.push({
        id: `task-${task.id}`,
        type: 'task',
        icon: CheckSquare,
        title: 'مهمة جديدة',
        description: task.title,
        user: (state.employees || []).find(emp => emp.id === task.createdBy)?.name || 'مستخدم النظام',
        timestamp: new Date(task.createdAt),
        color: 'text-blue-600 bg-blue-100'
      });
    });

    // إضافة نشاطات المراسلات الأخيرة
    (state.correspondence || []).slice(0, 3).forEach(corr => {
      activities.push({
        id: `corr-${corr.id}`,
        type: 'correspondence',
        icon: Mail,
        title: `مراسلة ${corr.type}`,
        description: corr.subject,
        user: (state.employees || []).find(emp => emp.id === corr.createdBy)?.name || 'مستخدم النظام',
        timestamp: new Date(corr.createdAt),
        color: 'text-green-600 bg-green-100'
      });
    });

    // إضافة نشاطات الموظفين الأخيرة
    (state.employees || []).slice(0, 2).forEach(emp => {
      activities.push({
        id: `emp-${emp.id}`,
        type: 'employee',
        icon: User,
        title: 'موظف جديد',
        description: `تم إضافة ${emp.name}`,
        user: 'مدير النظام',
        timestamp: new Date(emp.createdAt),
        color: 'text-purple-600 bg-purple-100'
      });
    });

    // ترتيب النشاطات حسب التاريخ (الأحدث أولاً)
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8); // أحدث 8 نشاطات
  }, [state.tasks, state.correspondence, state.employees]);

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
   * دالة الحصول على أيقونة النشاط
   */
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'correspondence': return Mail;
      case 'employee': return User;
      case 'department': return Building2;
      default: return Activity;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Activity className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">النشاطات الأخيرة</h3>
            <p className="text-sm text-gray-500">آخر التحديثات في النظام</p>
          </div>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
          <span onClick={() => actions.setCurrentPage('reports')} className="cursor-pointer">عرض الكل</span>
        </button>
      </div>

      <div className="space-y-4">
        {recentActivities.length > 0 ? recentActivities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              
              {/* أيقونة النشاط */}
              <div className={`p-2 rounded-lg ${activity.color}`}>
                <Icon className="h-4 w-4" />
              </div>

              {/* تفاصيل النشاط */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                  <span className="text-xs text-gray-500">{getRelativeTime(activity.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">بواسطة: {activity.user}</p>
              </div>

              {/* زر عرض التفاصيل */}
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          );
        }) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>لا توجد نشاطات حديثة</p>
            <p className="text-sm mt-1">ابدأ بإضافة البيانات لرؤية النشاطات</p>
          </div>
        )}
      </div>

      {/* إحصائيات سريعة */}
      {recentActivities.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            
            <div className="p-2">
              <div className="text-lg font-bold text-blue-600">
                {recentActivities.filter(a => a.type === 'task').length}
              </div>
              <div className="text-xs text-blue-800">مهام</div>
            </div>
            
            <div className="p-2">
              <div className="text-lg font-bold text-green-600">
                {recentActivities.filter(a => a.type === 'correspondence').length}
              </div>
              <div className="text-xs text-green-800">مراسلات</div>
            </div>
            
            <div className="p-2">
              <div className="text-lg font-bold text-purple-600">
                {recentActivities.filter(a => a.type === 'employee').length}
              </div>
              <div className="text-xs text-purple-800">موظفين</div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default RecentActivity;