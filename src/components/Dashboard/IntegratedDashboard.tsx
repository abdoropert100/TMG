/**
 * لوحة التحكم المتكاملة المحسنة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/AuthService';
import EnhancedStatsCards from './EnhancedStatsCards';
import RecentActivity from './RecentActivity';
import PerformanceMetrics from './PerformanceMetrics';
import AdvancedCharts from './AdvancedCharts';
import QuickActions from './QuickActions';
import SystemOverview from './SystemOverview';
import TopPerformers from './TopPerformers';
import AlertsNotifications from './AlertsNotifications';
import TasksChart from './TasksChart';
import CorrespondenceChart from './CorrespondenceChart';
import EmployeesChart from './EmployeesChart';
import CorrespondenceWidget from './CorrespondenceWidget';

/**
 * مكون لوحة التحكم المتكاملة المحسنة
 * يدمج جميع أنظمة المؤسسة في واجهة موحدة
 */
const IntegratedDashboard: React.FC = () => {
  const { state } = useApp();
  const currentUser = authService.getCurrentUser();
  
  /**
   * حساب الإحصائيات المتكاملة من جميع الأنظمة
   */
  const integratedStats = React.useMemo(() => {
    // فلترة البيانات حسب صلاحيات المستخدم
    let visibleTasks = state.tasks || [];
    let visibleCorrespondence = state.correspondence || [];
    let visibleEmployees = state.employees || [];
    let visibleDepartments = state.departments || [];

    // تطبيق فلاتر الرؤية حسب الدور
    if (currentUser && currentUser.role !== 'ادمن' && currentUser.role !== 'رئيس_المصلحة') {
      if (currentUser.role === 'رئيس_قطاع') {
        visibleTasks = visibleTasks.filter(t => t.sectorId === currentUser.sectorId);
        visibleCorrespondence = visibleCorrespondence.filter(c => c.sectorId === currentUser.sectorId);
        visibleEmployees = visibleEmployees.filter(e => e.sectorId === currentUser.sectorId);
        visibleDepartments = visibleDepartments.filter(d => d.sectorId === currentUser.sectorId);
      } else if (currentUser.role === 'مدير_إدارة') {
        visibleTasks = visibleTasks.filter(t => t.department === currentUser.departmentId);
        visibleCorrespondence = visibleCorrespondence.filter(c => c.department === currentUser.departmentId);
        visibleEmployees = visibleEmployees.filter(e => e.department === currentUser.departmentId);
        visibleDepartments = visibleDepartments.filter(d => d.id === currentUser.departmentId);
      } else if (currentUser.role === 'موظف' || currentUser.role === 'فني') {
        visibleTasks = visibleTasks.filter(t => 
          t.assignedTo?.includes(currentUser.employeeId || '') || 
          t.createdBy === currentUser.employeeId
        );
        visibleCorrespondence = visibleCorrespondence.filter(c => 
          c.assignedTo === currentUser.employeeId || 
          c.createdBy === currentUser.employeeId
        );
        visibleEmployees = visibleEmployees.filter(e => e.id === currentUser.employeeId);
      }
    }
    
    const totalTasks = visibleTasks.length;
    const completedTasks = visibleTasks.filter(t => t.status === 'مكتملة').length;
    const inProgressTasks = visibleTasks.filter(t => t.status === 'قيد التنفيذ').length;
    const overdueTasks = visibleTasks.filter(t => t.status === 'متأخرة').length;
    
    const totalCorr = visibleCorrespondence.length;
    const incomingCorr = visibleCorrespondence.filter(c => c.type === 'وارد').length;
    const outgoingCorr = visibleCorrespondence.filter(c => c.type === 'صادر').length;
    const urgentCorr = visibleCorrespondence.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length;
    
    const totalEmployees = visibleEmployees.length;
    const activeEmployees = visibleEmployees.filter(e => e.status === 'نشط').length;
    
    // حساب المراسلات المرتبطة بالمهام
    const linkedCorrespondences = visibleCorrespondence.filter(c => c.linkedTaskId).length;
    const linkedTasks = visibleTasks.filter(t => t.linkedCorrespondenceId).length;
    
    // حساب معدل الربط بين المهام والمراسلات
    const integrationRate = totalTasks > 0 ? Math.round((linkedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalCorr,
      incomingCorr,
      outgoingCorr,
      urgentCorr,
      totalEmployees,
      activeEmployees,
      totalDepartments: visibleDepartments.length,
      totalDivisions: (state.divisions || []).filter(d => 
        visibleDepartments.some(dept => dept.id === d.departmentId)
      ).length,
      linkedCorrespondences,
      linkedTasks,
      integrationRate,
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      correspondenceProcessingRate: totalCorr > 0 ? Math.round(((totalCorr - urgentCorr) / totalCorr) * 100) : 0
    };
  }, [state, currentUser]);

  return (
    <div className="space-y-8">
      
      {/* بانر الترحيب المتكامل */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              مرحباً بك في {state.systemSettings.systemName}
            </h1>
            <p className="text-blue-100 text-lg mb-2">
              {state.systemSettings.organizationName}
            </p>
            <p className="text-blue-200 mt-2 flex items-center gap-2">
              <span>👤</span>
              <span>مرحباً {currentUser?.fullName || state.currentUser.name} - {currentUser?.role || state.currentUser.role}</span>
            </p>
            <p className="text-blue-200 mt-2 flex items-center gap-2">
              <span>📅</span>
              <span>
                تاريخ اليوم: {new Date().toLocaleDateString('ar-EG', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </p>
            
            {/* إحصائيات متكاملة في البانر */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{integratedStats.totalTasks}</div>
                <div className="text-sm text-blue-200">إجمالي المهام</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{integratedStats.totalCorr}</div>
                <div className="text-sm text-blue-200">إجمالي المراسلات</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{integratedStats.totalEmployees}</div>
                <div className="text-sm text-blue-200">إجمالي الموظفين</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{integratedStats.totalDepartments}</div>
                <div className="text-sm text-blue-200">إجمالي الإدارات</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-2xl font-bold">{integratedStats.integrationRate}%</div>
                <div className="text-sm text-blue-200">معدل الربط</div>
              </div>
            </div>
          </div>
          
          {/* شعار النظام */}
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/20">
              {state.systemSettings.logo ? (
                <img 
                  src={state.systemSettings.logo} 
                  alt="شعار النظام" 
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold">🏛️</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* الإحصائيات الرئيسية المحسنة */}
      <EnhancedStatsCards />

      {/* الإجراءات السريعة المتكاملة */}
      <QuickActions />

      {/* الصف الأول: المهام والمراسلات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksChart />
        <CorrespondenceWidget />
      </div>

      {/* الصف الثاني: تحليلات المراسلات والموظفين */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CorrespondenceChart />
        <EmployeesChart />
      </div>

      {/* الصف الثالث: أفضل الموظفين والتنبيهات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformers />
        <AlertsNotifications />
      </div>

      {/* الصف الرابع: التحليلات المتقدمة */}

      {/* الصف الخامس: الرسوم البيانية المتقدمة ومقاييس الأداء */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdvancedCharts />
        <PerformanceMetrics />
      </div>

      {/* الصف السادس: النشاطات الأخيرة وملخص النظام */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <SystemOverview />
      </div>

      {/* ملخص التكامل بين الأنظمة */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص التكامل بين الأنظمة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{integratedStats.linkedTasks}</div>
            <div className="text-sm text-blue-800">مهام مرتبطة بمراسلات</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">{integratedStats.linkedCorrespondences}</div>
            <div className="text-sm text-green-800">مراسلات مرتبطة بمهام</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{integratedStats.integrationRate}%</div>
            <div className="text-sm text-purple-800">معدل الربط العام</div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round((integratedStats.taskCompletionRate + integratedStats.correspondenceProcessingRate) / 2)}%
            </div>
            <div className="text-sm text-orange-800">الكفاءة العامة</div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default IntegratedDashboard;