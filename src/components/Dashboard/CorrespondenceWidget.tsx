/**
 * مكون ودجت المراسلات في لوحة التحكم
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MailOpen, 
  AlertTriangle, 
  Clock, 
  Shield,
  TrendingUp,
  ArrowRight,
  Eye,
  Plus,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { correspondenceService } from '../../services/CorrespondenceService';

/**
 * مكون ودجت المراسلات المتقدم في لوحة التحكم
 */
const CorrespondenceWidget: React.FC = () => {
  const { state, actions } = useApp();
  
  // حالات المكون
  const [stats, setStats] = useState({
    total: 0,
    incoming: 0,
    outgoing: 0,
    urgent: 0,
    confidential: 0,
    processed: 0,
    pending: 0,
    overdue: 0
  });
  
  const [urgentCorrespondences, setUrgentCorrespondences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * تحميل البيانات عند تحميل المكون
   */
  useEffect(() => {
    loadCorrespondenceData();
  }, [state.correspondence]);

  /**
   * دالة تحميل بيانات المراسلات
   */
  const loadCorrespondenceData = async () => {
    try {
      setLoading(true);
      
      // تحميل الإحصائيات
      // حساب الإحصائيات من البيانات المحلية
      const correspondence = state.correspondence || [];
      const calculatedStats = {
        total: correspondence.length,
        incoming: correspondence.filter(c => c.type === 'وارد').length,
        outgoing: correspondence.filter(c => c.type === 'صادر').length,
        urgent: correspondence.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length,
        confidential: correspondence.filter(c => c.confidentiality === 'سري' || c.confidentiality === 'سري جداً').length,
        processed: correspondence.filter(c => c.status === 'مغلق' || c.status === 'مؤرشف' || c.status === 'صادر').length,
        pending: correspondence.filter(c => c.status === 'قيد المراجعة' || c.status === 'محال').length,
        overdue: 0
      };
      setStats(calculatedStats);

      // تحميل المراسلات العاجلة
      const urgent = correspondence.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').slice(0, 5);
      setUrgentCorrespondences(urgent);

    } catch (error) {
      console.error('خطأ في تحميل بيانات المراسلات:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * دالة الانتقال إلى صفحة المراسلات
   */
  const navigateToCorrespondence = (filter?: string) => {
    actions.setCurrentPage('correspondence');
    // يمكن إضافة فلتر محدد هنا
  };

  /**
   * دالة تنسيق التاريخ النسبي
   */
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays === 0) {
      if (diffHours === 0) return 'الآن';
      return `منذ ${diffHours} ساعة`;
    }
    if (diffDays === 1) return 'أمس';
    return `منذ ${diffDays} يوم`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      
      {/* العنوان والإحصائيات الرئيسية */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Mail className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">المراسلات</h3>
            <p className="text-sm text-gray-500">إجمالي {stats.total} مراسلة</p>
          </div>
        </div>
        <button
          onClick={() => navigateToCorrespondence()}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          عرض الكل
        </button>
      </div>

      {/* بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        
        {/* المراسلات الواردة */}
        <div 
          className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => navigateToCorrespondence('incoming')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">واردة</p>
              <p className="text-xl font-bold text-blue-900">{stats.incoming}</p>
            </div>
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* المراسلات الصادرة */}
        <div 
          className="p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => navigateToCorrespondence('outgoing')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">صادرة</p>
              <p className="text-xl font-bold text-green-900">{stats.outgoing}</p>
            </div>
            <MailOpen className="h-6 w-6 text-green-600" />
          </div>
        </div>

        {/* المراسلات العاجلة */}
        <div 
          className="p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
          onClick={() => navigateToCorrespondence('urgent')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">عاجلة</p>
              <p className="text-xl font-bold text-orange-900">{stats.urgent}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
        </div>

        {/* المراسلات السرية */}
        <div 
          className="p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
          onClick={() => navigateToCorrespondence('confidential')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">سرية</p>
              <p className="text-xl font-bold text-red-900">{stats.confidential}</p>
            </div>
            <Shield className="h-6 w-6 text-red-600" />
          </div>
        </div>

      </div>

      {/* المراسلات العاجلة */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">المراسلات العاجلة</h4>
          {urgentCorrespondences.length > 0 && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              {urgentCorrespondences.length} عاجل
            </span>
          )}
        </div>

        {urgentCorrespondences.length > 0 ? (
          <div className="space-y-2">
            {urgentCorrespondences.map((corr) => (
              <div 
                key={corr.id} 
                className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                onClick={() => navigateToCorrespondence()}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {corr.type === 'وارد' ? (
                      <Mail className="h-4 w-4 text-orange-600" />
                    ) : (
                      <MailOpen className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {corr.subject}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{corr.number}</span>
                      <span>•</span>
                      <span>{corr.type === 'وارد' ? corr.sender : corr.recipient}</span>
                      <span>•</span>
                      <span>{getRelativeTime(new Date(corr.date))}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    corr.urgency === 'فوري' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {corr.urgency}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">لا توجد مراسلات عاجلة</p>
          </div>
        )}
      </div>

      {/* إجراءات سريعة */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">إجراءات سريعة</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={() => {
              actions.setCurrentPage('correspondence');
              // فتح نموذج إضافة مراسلة واردة
            }}
            className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <Plus className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-900">مراسلة واردة</span>
          </button>
          
          <button
            onClick={() => {
              actions.setCurrentPage('correspondence');
              // فتح نموذج إضافة مراسلة صادرة
            }}
            className="flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
          >
            <Plus className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-900">مراسلة صادرة</span>
          </button>
        </div>
      </div>

      {/* مؤشرات الأداء */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0}%
            </div>
            <div className="text-xs text-green-800">معدل المعالجة</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {stats.pending}
            </div>
            <div className="text-xs text-blue-800">قيد المعالجة</div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CorrespondenceWidget;