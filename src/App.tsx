/**
 * التطبيق الرئيسي لنظام إدارة مصلحة الري
 * وزارة الموارد المائية والري - جمهورية مصر العربية
 * م. عبدالعال محمد - abdelaalmiti@gmail.com - +201000731116
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/UI/ErrorBoundary';
import LoginForm from './components/Auth/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import IntegratedDashboard from './components/Dashboard/IntegratedDashboard';
import TaskList from './components/Tasks/TaskList';
import CorrespondenceList from './components/Correspondence/CorrespondenceList';
import EmployeeList from './components/Employees/EmployeeList';
import DepartmentList from './components/Departments/DepartmentList';
import Reports from './components/Reports/Reports';
import AttachmentsPage from './pages/AttachmentsPage';
import SystemLogPage from './pages/SystemLogPage';
import Settings from './components/Settings/Settings';
import AdvancedSettings from './components/Settings/AdvancedSettings';
import SystemTestPage from './components/SystemTest/SystemTestPage';

/**
 * مكون التطبيق الداخلي
 * يدير عرض المحتوى حسب الصفحة المختارة
 */
const AppContent: React.FC = () => {
  const { state, actions } = useApp();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  // فحص حالة المصادقة عند تحميل التطبيق
  React.useEffect(() => {
    const checkAuthentication = () => {
      const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
      
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          const now = new Date().getTime();
          
          if (now < session.expiresAt) {
            // الجلسة صالحة
            actions.updateCurrentUser({
              id: session.userId,
              name: session.name,
              role: session.role
            });
            setIsAuthenticated(true);
          } else {
            // الجلسة منتهية الصلاحية
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('خطأ في فحص الجلسة:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setCheckingAuth(false);
    };

    // تأخير فحص المصادقة حتى تكتمل تهيئة قاعدة البيانات
    setTimeout(checkAuthentication, 1000);
  }, []);

  // عرض شاشة التحميل أثناء فحص المصادقة
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري فحص الجلسة...</p>
        </div>
      </div>
    );
  }

  // عرض شاشة تسجيل الدخول إذا لم يكن المستخدم مصادق عليه
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  /**
   * دالة عرض المحتوى حسب الصفحة المختارة
   * @returns المكون المناسب للصفحة الحالية
   */
  const renderCurrentPage = () => {
    switch (state.currentPage) {
      case 'dashboard':
        return <IntegratedDashboard />;
      case 'tasks':
        return <TaskList />;
      case 'correspondence':
        return <CorrespondenceList />;
      case 'employees':
        return <EmployeeList />;
      case 'departments':
        return <DepartmentList />;
      case 'reports':
        return <Reports />;
      case 'attachments':
        return <AttachmentsPage />;
      case 'system-log':
        return <SystemLogPage />;
      case 'settings':
        return <Settings />;
      case 'advanced-settings':
        return <AdvancedSettings />;
      case 'system-test':
        return <SystemTestPage />;
      default:
        return <IntegratedDashboard />;
    }
  };

  // عرض شاشة التحميل أثناء تهيئة النظام
  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  // عرض شاشة الخطأ في حالة فشل التهيئة
  if (state.error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">خطأ في النظام</h2>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      </div>
    );
  }

  // عرض التخطيط الرئيسي للنظام بعد التحميل الناجح
  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* الشريط الجانبي للتنقل بين أقسام النظام */}
      <Sidebar
        currentPage={state.currentPage}
        onPageChange={actions.setCurrentPage}
        isCollapsed={state.sidebarCollapsed}
        onToggleCollapse={actions.toggleSidebar}
        systemName={state.systemSettings.systemName}
      />

      {/* منطقة المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* شريط الرأس العلوي مع البحث والإشعارات */}
        <Header
          currentUser={state.currentUser}
          onToggleSidebar={actions.toggleSidebar}
          systemName={state.systemSettings.systemName}
          organizationName={state.systemSettings.organizationName}
          notifications={state.notifications}
        />

        {/* منطقة عرض محتوى الصفحة المختارة */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

/**
 * مكون التطبيق الرئيسي مع مزود السياق
 * نقطة الدخول الرئيسية للتطبيق
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;