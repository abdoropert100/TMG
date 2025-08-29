import React from 'react';
import { 
  Users, 
  Building2, 
  CheckSquare, 
  Mail, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';

import { useApp } from '../../context/AppContext';

// مكون ملخص النظام الشامل
const SystemOverview: React.FC = () => {
  const { state } = useApp();
  
  // حساب الإحصائيات من البيانات الفعلية
  const systemStats = React.useMemo(() => {
    const totalEmployees = (state.employees || []).length;
    const totalDepartments = (state.departments || []).length;
    const totalDivisions = (state.divisions || []).length;
    const totalTasks = (state.tasks || []).length;
    const completedTasks = (state.tasks || []).filter(t => t.status === 'مكتملة').length;
    const pendingTasks = (state.tasks || []).filter(t => t.status === 'قيد التنفيذ').length;
    const overdueTasks = (state.tasks || []).filter(t => t.status === 'متأخرة').length;
    const totalCorrespondence = (state.correspondence || []).length;
    const incomingMail = (state.correspondence || []).filter(c => c.type === 'وارد').length;
    const outgoingMail = (state.correspondence || []).filter(c => c.type === 'صادر').length;
    const urgentMail = (state.correspondence || []).filter(c => c.urgency === 'عاجل').length;
    const confidentialMail = (state.correspondence || []).filter(c => c.confidentiality === 'سري').length;
    
    return {
      totalEmployees,
      totalDepartments,
      totalDivisions,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalCorrespondence,
      incomingMail,
      outgoingMail,
      urgentMail,
      confidentialMail
    };
  }, [state]);

  // حساب النسب المئوية
  const taskCompletionRate = systemStats.totalTasks > 0 ? Math.round((systemStats.completedTasks / systemStats.totalTasks) * 100) : 0;
  const overdueRate = systemStats.totalTasks > 0 ? Math.round((systemStats.overdueTasks / systemStats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* الإحصائيات الرئيسية */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">ملخص النظام الشامل</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* إحصائيات الموظفين والأقسام */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">الهيكل التنظيمي</h4>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-900">إجمالي الموظفين</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{systemStats.totalEmployees}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm text-purple-900">الإدارات</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{systemStats.totalDepartments}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-indigo-600 mr-2" />
                <span className="text-sm text-indigo-900">الأقسام</span>
              </div>
              <span className="text-lg font-bold text-indigo-600">{systemStats.totalDivisions}</span>
            </div>
          </div>

          {/* إحصائيات المهام */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">إدارة المهام</h4>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-sm text-gray-900">إجمالي المهام</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{systemStats.totalTasks}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-900">مكتملة</span>
              </div>
              <span className="text-lg font-bold text-green-600">{systemStats.completedTasks}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-900">قيد التنفيذ</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{systemStats.pendingTasks}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-900">متأخرة</span>
              </div>
              <span className="text-lg font-bold text-red-600">{systemStats.overdueTasks}</span>
            </div>
          </div>

          {/* إحصائيات المراسلات */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">المراسلات</h4>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-sm text-gray-900">إجمالي المراسلات</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{systemStats.totalCorrespondence}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-900">واردة</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{systemStats.incomingMail}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-900">صادرة</span>
              </div>
              <span className="text-lg font-bold text-green-600">{systemStats.outgoingMail}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-sm text-orange-900">عاجلة</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{systemStats.urgentMail}</span>
            </div>
          </div>

          {/* مؤشرات الأداء */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">مؤشرات الأداء</h4>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">معدل إنجاز المهام</span>
                <span className="text-lg font-bold text-green-600">{taskCompletionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${taskCompletionRate}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">معدل التأخير</span>
                <span className="text-lg font-bold text-red-600">{overdueRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overdueRate}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <div className="text-sm text-yellow-900">متوسط النقاط</div>
                  <div className="text-lg font-bold text-yellow-600">742</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default SystemOverview;
