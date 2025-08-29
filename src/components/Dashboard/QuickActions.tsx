import React from 'react';
import { 
  Plus, 
  Mail, 
  Users, 
  FileText, 
  CheckSquare, 
  Building2,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  Send,
  CheckCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * مكون الإجراءات السريعة
 * يوفر وصولاً سريعاً للعمليات الأساسية في النظام
 */
const QuickActions: React.FC = () => {
  const { state, actions } = useApp();
  
  /**
   * دالة التعامل مع النقر على الإجراءات السريعة
   * @param action نوع الإجراء المطلوب
   */
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'إضافة مهمة':
        actions.setCurrentPage('tasks');
        // تسجيل النشاط
        actions.logActivity('navigation', 'quick_action', 'انتقال سريع لإضافة مهمة');
        break;
      case 'إضافة مراسلة':
        actions.setCurrentPage('correspondence');
        actions.logActivity('navigation', 'quick_action', 'انتقال سريع لإضافة مراسلة');
        break;
      case 'إضافة موظف':
        actions.setCurrentPage('employees');
        actions.logActivity('navigation', 'quick_action', 'انتقال سريع لإضافة موظف');
        break;
      case 'إنشاء تقرير':
        actions.setCurrentPage('reports');
        actions.logActivity('navigation', 'quick_action', 'انتقال سريع لإنشاء تقرير');
        break;
      case 'إضافة قسم':
        actions.setCurrentPage('departments');
        actions.logActivity('navigation', 'quick_action', 'انتقال سريع لإضافة قسم');
        break;
      case 'إضافة مراسلة واردة':
        actions.setCurrentPage('correspondence');
        actions.logActivity('navigation', 'quick_action', 'انتقال سريع لإضافة مراسلة واردة');
        break;
      case 'إضافة مراسلة صادرة':
        actions.setCurrentPage('correspondence');
        actions.logActivity('navigation', 'quick_action', 'انتقال سريع لإضافة مراسلة صادرة');
        break;
      default:
        console.log(`تم النقر على: ${action}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">الإجراءات السريعة</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* إضافة مهمة جديدة */}
        <button
          onClick={() => handleQuickAction('إضافة مهمة')}
          className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-700 transition-colors">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-medium text-blue-900">إضافة مهمة</span>
        </button>

        {/* إضافة مراسلة واردة */}
        <button
          onClick={() => handleQuickAction('إضافة مراسلة واردة')}
          className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-700 transition-colors">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-medium text-blue-900">مراسلة واردة</span>
        </button>

        {/* إضافة مراسلة صادرة */}
        <button
          onClick={() => handleQuickAction('إضافة مراسلة صادرة')}
          className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group"
        >
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-700 transition-colors">
            <Send className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-medium text-green-900">مراسلة صادرة</span>
        </button>

        {/* إضافة مراسلة */}
        <button
          onClick={() => handleQuickAction('إضافة مراسلة')}
          className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group"
        >
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-700 transition-colors">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-medium text-green-900">إضافة مراسلة</span>
        </button>

        {/* إضافة موظف */}
        <button
          onClick={() => handleQuickAction('إضافة موظف')}
          className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group"
        >
          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-700 transition-colors">
            <Users className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-medium text-purple-900">إضافة موظف</span>
        </button>

        {/* إنشاء تقرير */}
        <button
          onClick={() => handleQuickAction('إنشاء تقرير')}
          className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors group"
        >
          <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-700 transition-colors">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-medium text-orange-900">إنشاء تقرير</span>
        </button>

        {/* إضافة قسم */}
        <button
          onClick={() => handleQuickAction('إضافة قسم')}
          className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors group"
        >
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-700 transition-colors">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-sm font-medium text-indigo-900">إضافة قسم</span>
        </button>

      </div>

      {/* إحصائيات سريعة */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h4 className="text-md font-medium text-gray-900 mb-4">إحصائيات سريعة</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* المهام العاجلة */}
          <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {(state.correspondence || []).filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length}
              </div>
              <div className="text-xs text-red-800">مراسلات عاجلة</div>
            </div>
          </div>

          {/* المهام المتأخرة */}
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center mr-3">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">
                {(state.correspondence || []).filter(c => c.status === 'قيد المراجعة' || c.status === 'محال').length}
              </div>
              <div className="text-xs text-yellow-800">مراسلات معلقة</div>
            </div>
          </div>

          {/* المهام المكتملة اليوم */}
          <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {(state.correspondence || []).filter(c => c.status === 'مغلق' || c.status === 'صادر').length}
              </div>
              <div className="text-xs text-green-800">مراسلات معالجة</div>
            </div>
          </div>

          {/* معدل الإنجاز */}
          <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {(state.tasks || []).length > 0 ? 
                  Math.round(((state.correspondence || []).filter(c => c.linkedTaskId).length / Math.max((state.correspondence || []).length, 1)) * 100) : 0
                }%
              </div>
              <div className="text-xs text-blue-800">معدل الربط</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default QuickActions;