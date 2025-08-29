import React from 'react';
import {
  CheckSquare, Mail, Users, Building2, TrendingUp, Clock,
  AlertCircle, CheckCircle, Target, Award, Calendar, Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// واجهة خصائص بطاقة الإحصائيات
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  progress?: number;
  details?: {
    label: string;
    value: string;
  }[];
}

// مكون بطاقة الإحصائيات المحسن
const StatCard: React.FC<StatCardProps> = ({
  title, value, change, changeType, icon: Icon, color, subtitle, progress, details
}) => {
  // دالة الحصول على لون التغيير
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // دالة الحصول على أيقونة التغيير
  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return <TrendingUp className="h-4 w-4" />;
      case 'negative': return <TrendingUp className="h-4 w-4 transform rotate-180" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200">

      {/* الصف العلوي: العنوان والأيقونة */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} shadow-md`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* القيمة الرئيسية */}
      <div className="mb-3">
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>

        {/* مؤشر التغيير */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${getChangeColor()}`}>
            {getChangeIcon()}
            <span className="text-sm font-medium">{change}</span>
          </div>
          <span className="text-sm text-gray-500">من الشهر الماضي</span>
        </div>
      </div>

      {/* شريط التقدم (اختياري) */}
      {progress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>التقدم</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${color.replace('bg-', 'bg-')}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* التفاصيل الإضافية (اختياري) */}
      {details && details.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            {details.map((detail, index) => (
              <div key={index} className="text-center">
                <div className="text-sm font-semibold text-gray-900">{detail.value}</div>
                <div className="text-xs text-gray-500">{detail.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

// مكون بطاقات الإحصائيات الرئيسية
const StatsCards: React.FC = () => {
  // استخدام السياق للحصول على البيانات الفعلية
  const { state } = useApp();

  // حساب الإحصائيات من البيانات الفعلية
  const stats = React.useMemo(() => {
    const totalTasks = state.tasks?.length || 0;
    const completedTasks = state.tasks?.filter(t => t.status === 'مكتملة').length || 0;
    const inProgressTasks = state.tasks?.filter(t => t.status === 'قيد التنفيذ').length || 0;
    const overdueTasks = state.tasks?.filter(t => t.status === 'متأخرة').length || 0;
    
    const totalCorr = state.correspondence?.length || 0;
    const incomingCorr = state.correspondence?.filter(c => c.type === 'وارد').length || 0;
    const outgoingCorr = state.correspondence?.filter(c => c.type === 'صادر').length || 0;
    
    const totalEmployees = state.employees?.length || 0;
    const activeEmployees = state.employees?.filter(e => e.status === 'نشط').length || 0;
    const onLeaveEmployees = state.employees?.filter(e => e.status === 'إجازة').length || 0;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // حساب التغيير الشهري (من البيانات الفعلية)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const thisMonthTasks = state.tasks.filter(t => new Date(t.createdAt) >= thisMonth).length;
    const thisMonthCorr = state.correspondence.filter(c => new Date(c.createdAt) >= thisMonth).length;
    const thisMonthEmployees = state.employees.filter(e => new Date(e.createdAt) >= thisMonth).length;
    
    const taskChange = totalTasks > 0 ? `+${Math.round((thisMonthTasks / totalTasks) * 100)}%` : '0%';
    const corrChange = totalCorr > 0 ? `+${Math.round((thisMonthCorr / totalCorr) * 100)}%` : '0%';
    const empChange = totalEmployees > 0 ? `+${Math.round((thisMonthEmployees / totalEmployees) * 100)}%` : '0%';
    const completionChange = completionRate > 0 ? `${completionRate}%` : '0%';
    
    return [
      {
        title: 'إجمالي المهام',
        subtitle: 'في جميع الأقسام',
        value: totalTasks.toString(),
        change: taskChange,
        changeType: 'positive' as const,
        icon: CheckSquare,
        color: 'bg-blue-600',
        progress: completionRate,
        details: [
          { label: 'مكتملة', value: completedTasks.toString() },
          { label: 'قيد التنفيذ', value: inProgressTasks.toString() }
        ]
      },
      {
        title: 'المراسلات النشطة',
        subtitle: 'وارد وصادر',
        value: totalCorr.toString(),
        change: corrChange,
        changeType: 'positive' as const,
        icon: Mail,
        color: 'bg-green-600',
        progress: totalCorr > 0 ? Math.round((incomingCorr + outgoingCorr) / totalCorr * 100) : 0,
        details: [
          { label: 'واردة', value: incomingCorr.toString() },
          { label: 'صادرة', value: outgoingCorr.toString() }
        ]
      },
      {
        title: 'الموظفون النشطون',
        subtitle: 'في النظام',
        value: totalEmployees.toString(),
        change: empChange,
        changeType: 'positive' as const,
        icon: Users,
        color: 'bg-purple-600',
        progress: totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0,
        details: [
          { label: 'متاحون', value: activeEmployees.toString() },
          { label: 'في إجازة', value: onLeaveEmployees.toString() }
        ]
      },
      {
        title: 'معدل الإنجاز',
        subtitle: 'هذا الشهر',
        value: `${completionRate}%`,
        change: completionChange,
        changeType: 'positive' as const,
        icon: Target,
        color: 'bg-orange-600',
        progress: completionRate,
        details: [
          { label: 'في الوقت', value: completedTasks.toString() },
          { label: 'متأخرة', value: overdueTasks.toString() }
        ]
      }
    ];
  }, [state.tasks, state.correspondence, state.employees]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsCards;