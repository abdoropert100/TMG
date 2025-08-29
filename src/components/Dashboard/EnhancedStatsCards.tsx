/**
 * بطاقات الإحصائيات المحسنة والمتكاملة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Mail, Users, Building2, TrendingUp, Clock,
  AlertCircle, CheckCircle, Target, Award, Calendar, Activity,
  Shield, MailOpen, ArrowUpRight, ArrowDownRight, Minus,
  Link, FileText, BarChart3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { correspondenceService } from '../../services/CorrespondenceService';

// واجهة خصائص بطاقة الإحصائيات المحسنة
interface EnhancedStatCardProps {
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
    color?: string;
  }[];
  trend?: 'up' | 'down' | 'stable';
  linkedItems?: number;
  onClick?: () => void;
}

/**
 * مكون بطاقة الإحصائيات المحسنة
 */
const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  title, value, change, changeType, icon: Icon, color, subtitle, 
  progress, details, trend, linkedItems, onClick
}) => {
  // دالة الحصول على لون التغيير
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // دالة الحصول على أيقونة الاتجاه
  const getTrendIcon = () => {
    switch (trend || changeType) {
      case 'positive':
      case 'up': return <ArrowUpRight className="h-4 w-4" />;
      case 'negative':
      case 'down': return <ArrowDownRight className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >

      {/* الصف العلوي: العنوان والأيقونة */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} shadow-md relative`}>
          <Icon className="h-6 w-6 text-white" />
          {linkedItems !== undefined && linkedItems > 0 && (
            <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              <Link className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>

      {/* القيمة الرئيسية */}
      <div className="mb-3">
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>

        {/* مؤشر التغيير */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${getChangeColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{change}</span>
          </div>
          <span className="text-sm text-gray-500">من الشهر الماضي</span>
        </div>
      </div>

      {/* شريط التقدم */}
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

      {/* التفاصيل الإضافية */}
      {details && details.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            {details.map((detail, index) => (
              <div key={index} className="text-center">
                <div className={`text-sm font-semibold ${detail.color || 'text-gray-900'}`}>
                  {detail.value}
                </div>
                <div className="text-xs text-gray-500">{detail.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* مؤشر العناصر المرتبطة */}
      {linkedItems !== undefined && linkedItems > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
            <Link className="h-3 w-3" />
            <span>{linkedItems} عنصر مرتبط</span>
          </div>
        </div>
      )}

    </div>
  );
};

/**
 * مكون بطاقات الإحصائيات المحسنة والمتكاملة
 */
const EnhancedStatsCards: React.FC = () => {
  // استخدام السياق للحصول على البيانات الفعلية
  const { state, actions } = useApp();
  
  // حالات المكون
  const [correspondenceStats, setCorrespondenceStats] = useState({
    total: 0,
    incoming: 0,
    outgoing: 0,
    urgent: 0,
    confidential: 0,
    processed: 0,
    pending: 0,
    overdue: 0
  });

  /**
   * تحميل إحصائيات المراسلات عند تحميل المكون
   */
  useEffect(() => {
    loadCorrespondenceStats();
  }, [state.correspondence]);

  /**
   * دالة تحميل إحصائيات المراسلات
   */
  const loadCorrespondenceStats = async () => {
    try {
      const stats = await correspondenceService.getCorrespondenceStats();
      setCorrespondenceStats(stats);
    } catch (error) {
      console.error('خطأ في تحميل إحصائيات المراسلات:', error);
    }
  };

  // حساب الإحصائيات المتكاملة من البيانات الفعلية
  const integratedStats = React.useMemo(() => {
    const totalTasks = state.tasks?.length || 0;
    const completedTasks = state.tasks?.filter(t => t.status === 'مكتملة').length || 0;
    const inProgressTasks = state.tasks?.filter(t => t.status === 'قيد التنفيذ').length || 0;
    const overdueTasks = state.tasks?.filter(t => t.status === 'متأخرة').length || 0;
    
    const totalEmployees = state.employees?.length || 0;
    const activeEmployees = state.employees?.filter(e => e.status === 'نشط').length || 0;
    const onLeaveEmployees = state.employees?.filter(e => e.status === 'إجازة').length || 0;
    
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const correspondenceProcessingRate = correspondenceStats.total > 0 ? Math.round((correspondenceStats.processed / correspondenceStats.total) * 100) : 0;
    
    // حساب العناصر المرتبطة
    const linkedTasks = state.tasks?.filter(t => t.linkedCorrespondenceId).length || 0;
    const linkedCorrespondences = state.correspondence?.filter(c => c.linkedTaskId).length || 0;
    
    // حساب التغيير الشهري (محاكاة)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const thisMonthTasks = state.tasks?.filter(t => new Date(t.createdAt) >= thisMonth).length || 0;
    const thisMonthCorr = correspondenceStats.total > 0 ? Math.round((correspondenceStats.total * 0.3)) : 0; // محاكاة
    const thisMonthEmployees = state.employees?.filter(e => new Date(e.createdAt) >= thisMonth).length || 0;
    
    const taskChange = totalTasks > 0 ? `+${Math.round((thisMonthTasks / totalTasks) * 100)}%` : '0%';
    const corrChange = correspondenceStats.total > 0 ? `+${Math.round((thisMonthCorr / correspondenceStats.total) * 100)}%` : '0%';
    const empChange = totalEmployees > 0 ? `+${Math.round((thisMonthEmployees / totalEmployees) * 100)}%` : '0%';
    
    return [
      {
        title: 'إجمالي المهام',
        subtitle: 'في جميع الأقسام',
        value: totalTasks.toString(),
        change: taskChange,
        changeType: 'positive' as const,
        icon: CheckSquare,
        color: 'bg-blue-600',
        progress: taskCompletionRate,
        linkedItems: linkedTasks,
        details: [
          { label: 'مكتملة', value: completedTasks.toString(), color: 'text-green-600' },
          { label: 'قيد التنفيذ', value: inProgressTasks.toString(), color: 'text-blue-600' },
          { label: 'متأخرة', value: overdueTasks.toString(), color: 'text-red-600' }
        ],
        onClick: () => actions.setCurrentPage('tasks')
      },
      {
        title: 'المراسلات النشطة',
        subtitle: 'وارد وصادر',
        value: correspondenceStats.total.toString(),
        change: corrChange,
        changeType: 'positive' as const,
        icon: Mail,
        color: 'bg-green-600',
        progress: correspondenceProcessingRate,
        linkedItems: linkedCorrespondences,
        details: [
          { label: 'واردة', value: correspondenceStats.incoming.toString(), color: 'text-blue-600' },
          { label: 'صادرة', value: correspondenceStats.outgoing.toString(), color: 'text-green-600' },
          { label: 'عاجلة', value: correspondenceStats.urgent.toString(), color: 'text-orange-600' },
          { label: 'سرية', value: correspondenceStats.confidential.toString(), color: 'text-red-600' }
        ],
        onClick: () => actions.setCurrentPage('correspondence')
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
          { label: 'متاحون', value: activeEmployees.toString(), color: 'text-green-600' },
          { label: 'في إجازة', value: onLeaveEmployees.toString(), color: 'text-yellow-600' }
        ],
        onClick: () => actions.setCurrentPage('employees')
      },
      {
        title: 'الكفاءة العامة',
        subtitle: 'للنظام المتكامل',
        value: `${Math.round((taskCompletionRate + correspondenceProcessingRate) / 2)}%`,
        change: `${taskCompletionRate}%`,
        changeType: 'positive' as const,
        icon: Target,
        color: 'bg-orange-600',
        progress: Math.round((taskCompletionRate + correspondenceProcessingRate) / 2),
        details: [
          { label: 'إنجاز المهام', value: `${taskCompletionRate}%`, color: 'text-blue-600' },
          { label: 'معالجة المراسلات', value: `${correspondenceProcessingRate}%`, color: 'text-green-600' }
        ],
        onClick: () => actions.setCurrentPage('reports')
      },
      {
        title: 'التكامل بين الأنظمة',
        subtitle: 'ربط المهام والمراسلات',
        value: `${linkedTasks + linkedCorrespondences}`,
        change: `${totalTasks > 0 ? Math.round((linkedTasks / totalTasks) * 100) : 0}%`,
        changeType: 'positive' as const,
        icon: Link,
        color: 'bg-indigo-600',
        progress: totalTasks > 0 ? Math.round(((linkedTasks + linkedCorrespondences) / (totalTasks + correspondenceStats.total)) * 100) : 0,
        details: [
          { label: 'مهام مرتبطة', value: linkedTasks.toString(), color: 'text-blue-600' },
          { label: 'مراسلات مرتبطة', value: linkedCorrespondences.toString(), color: 'text-green-600' }
        ]
      }
    ];
  }, [state.tasks, state.correspondence, state.employees, correspondenceStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {integratedStats.map((stat, index) => (
        <EnhancedStatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default EnhancedStatsCards;