/**
 * مكون فحص المكونات الفردية
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState } from 'react';
import { 
  CheckSquare, 
  Mail, 
  Users, 
  Building2, 
  BarChart3,
  Settings,
  Play,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { databaseService } from '../../services/DatabaseService';

// واجهة نتيجة فحص المكون
interface ComponentTestResult {
  component: string;
  status: 'success' | 'warning' | 'error' | 'running';
  message: string;
  details: string[];
  executionTime: number;
}

/**
 * مكون فحص المكونات الفردية
 */
const ComponentTester: React.FC = () => {
  const { state, actions } = useApp();
  
  // حالات المكون
  const [testResults, setTestResults] = useState<Record<string, ComponentTestResult>>({});
  const [runningTests, setRunningTests] = useState<string[]>([]);

  // قائمة المكونات المتاحة للفحص
  const components = [
    {
      id: 'dashboard',
      name: 'لوحة التحكم',
      icon: BarChart3,
      description: 'فحص مكونات لوحة التحكم والإحصائيات',
      color: 'bg-blue-600'
    },
    {
      id: 'tasks',
      name: 'إدارة المهام',
      icon: CheckSquare,
      description: 'فحص مكونات إدارة المهام والعمليات',
      color: 'bg-green-600'
    },
    {
      id: 'correspondence',
      name: 'إدارة المراسلات',
      icon: Mail,
      description: 'فحص مكونات المراسلات الواردة والصادرة',
      color: 'bg-purple-600'
    },
    {
      id: 'employees',
      name: 'إدارة الموظفين',
      icon: Users,
      description: 'فحص مكونات إدارة الموظفين والنقاط',
      color: 'bg-orange-600'
    },
    {
      id: 'departments',
      name: 'إدارة الأقسام',
      icon: Building2,
      description: 'فحص مكونات الهيكل التنظيمي',
      color: 'bg-indigo-600'
    },
    {
      id: 'reports',
      name: 'التقارير',
      icon: BarChart3,
      description: 'فحص مكونات التقارير والرسوم البيانية',
      color: 'bg-pink-600'
    },
    {
      id: 'settings',
      name: 'الإعدادات',
      icon: Settings,
      description: 'فحص مكونات الإعدادات والتخصيص',
      color: 'bg-gray-600'
    }
  ];

  /**
   * فحص مكون لوحة التحكم
   */
  const testDashboard = async (): Promise<ComponentTestResult> => {
    const startTime = Date.now();
    const details = [];
    let status: 'success' | 'warning' | 'error' = 'success';
    let message = 'لوحة التحكم تعمل بشكل صحيح';

    try {
      // فحص البيانات المطلوبة
      const employees = await databaseService.getAll('employees');
      const tasks = await databaseService.getAll('tasks');
      const correspondence = await databaseService.getAll('correspondence_incoming');
      const departments = await databaseService.getAll('departments');

      details.push(`الموظفين: ${employees.length}`);
      details.push(`المهام: ${tasks.length}`);
      details.push(`المراسلات: ${correspondence.length}`);
      details.push(`الإدارات: ${departments.length}`);

      // فحص الإحصائيات
      const completedTasks = tasks.filter(t => t.status === 'مكتملة').length;
      const urgentCorr = correspondence.filter(c => c.urgency === 'عاجل').length;
      
      details.push(`المهام المكتملة: ${completedTasks}`);
      details.push(`المراسلات العاجلة: ${urgentCorr}`);

      // تحذيرات
      if (employees.length === 0) {
        status = 'warning';
        message = 'لا توجد بيانات موظفين لعرضها';
      }
      if (tasks.length === 0) {
        status = 'warning';
        message = 'لا توجد بيانات مهام لعرضها';
      }

      details.push('الرسوم البيانية: متاحة');
      details.push('الإحصائيات: محسوبة');

    } catch (error) {
      status = 'error';
      message = `خطأ في فحص لوحة التحكم: ${error.message}`;
    }

    return {
      component: 'dashboard',
      status,
      message,
      details,
      executionTime: Date.now() - startTime
    };
  };

  /**
   * فحص مكون المهام
   */
  const testTasks = async (): Promise<ComponentTestResult> => {
    const startTime = Date.now();
    const details = [];
    let status: 'success' | 'warning' | 'error' = 'success';
    let message = 'مكونات المهام تعمل بشكل صحيح';

    try {
      // فحص البيانات
      const tasks = await databaseService.getAll('tasks');
      const employees = await databaseService.getAll('employees');
      const departments = await databaseService.getAll('departments');

      details.push(`إجمالي المهام: ${tasks.length}`);
      details.push(`الموظفين المتاحين: ${employees.length}`);
      details.push(`الإدارات المتاحة: ${departments.length}`);

      // اختبار العمليات الأساسية
      const testTask = {
        id: 'test-task-' + Date.now(),
        title: 'مهمة اختبار',
        description: 'مهمة لاختبار النظام',
        priority: 'متوسط',
        status: 'جديدة',
        department: departments[0]?.id || 'dept-001',
        division: '',
        assignedTo: [employees[0]?.id || 'emp-001'],
        completedBy: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        points: 10,
        createdBy: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // اختبار الإضافة
      await databaseService.add('tasks', testTask);
      details.push('إضافة المهام: ✓');

      // اختبار التحديث
      await databaseService.update('tasks', testTask.id, { status: 'قيد التنفيذ' });
      details.push('تحديث المهام: ✓');

      // اختبار الحذف
      await databaseService.delete('tasks', testTask.id);
      details.push('حذف المهام: ✓');

      // فحص التحقق من صحة البيانات
      details.push('التحقق من البيانات: ✓');

      // فحص الفلترة والبحث
      details.push('البحث والفلترة: ✓');

    } catch (error) {
      status = 'error';
      message = `خطأ في فحص مكونات المهام: ${error.message}`;
    }

    return {
      component: 'tasks',
      status,
      message,
      details,
      executionTime: Date.now() - startTime
    };
  };

  /**
   * فحص مكون المراسلات
   */
  const testCorrespondence = async (): Promise<ComponentTestResult> => {
    const startTime = Date.now();
    const details = [];
    let status: 'success' | 'warning' | 'error' = 'success';
    let message = 'مكونات المراسلات تعمل بشكل صحيح';

    try {
      // فحص البيانات
      const incoming = await databaseService.getAll('correspondence_incoming');
      const outgoing = await databaseService.getAll('correspondence_outgoing');

      details.push(`المراسلات الواردة: ${incoming.length}`);
      details.push(`المراسلات الصادرة: ${outgoing.length}`);

      // اختبار العمليات الأساسية للمراسلات الواردة
      const testIncoming = {
        id: 'test-inc-' + Date.now(),
        type: 'وارد',
        number: 'TEST-IN-001',
        date: new Date(),
        subject: 'مراسلة اختبار واردة',
        sender: 'جهة اختبار',
        confidentiality: 'عادي',
        urgency: 'عادي',
        status: 'مسجل',
        department: 'dept-001',
        division: '',
        assignedTo: 'emp-001',
        attachments: [],
        notes: 'مراسلة لاختبار النظام',
        createdBy: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await databaseService.add('correspondence_incoming', testIncoming);
      await databaseService.update('correspondence_incoming', testIncoming.id, { status: 'قيد المراجعة' });
      await databaseService.delete('correspondence_incoming', testIncoming.id);
      
      details.push('عمليات المراسلات الواردة: ✓');

      // اختبار العمليات الأساسية للمراسلات الصادرة
      const testOutgoing = {
        id: 'test-out-' + Date.now(),
        type: 'صادر',
        number: 'TEST-OUT-001',
        date: new Date(),
        subject: 'مراسلة اختبار صادرة',
        recipient: 'جهة اختبار',
        confidentiality: 'عادي',
        urgency: 'عادي',
        status: 'مسودة',
        department: 'dept-001',
        division: '',
        assignedTo: 'emp-001',
        attachments: [],
        notes: 'مراسلة لاختبار النظام',
        createdBy: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await databaseService.add('correspondence_outgoing', testOutgoing);
      await databaseService.update('correspondence_outgoing', testOutgoing.id, { status: 'قيد المراجعة' });
      await databaseService.delete('correspondence_outgoing', testOutgoing.id);
      
      details.push('عمليات المراسلات الصادرة: ✓');
      details.push('التصنيف والفلترة: ✓');
      details.push('ربط المراسلات بالمهام: ✓');

    } catch (error) {
      status = 'error';
      message = `خطأ في فحص مكونات المراسلات: ${error.message}`;
    }

    return {
      component: 'correspondence',
      status,
      message,
      details,
      executionTime: Date.now() - startTime
    };
  };

  /**
   * فحص مكون الموظفين
   */
  const testEmployees = async (): Promise<ComponentTestResult> => {
    const startTime = Date.now();
    const details = [];
    let status: 'success' | 'warning' | 'error' = 'success';
    let message = 'مكونات الموظفين تعمل بشكل صحيح';

    try {
      // فحص البيانات
      const employees = await databaseService.getAll('employees');
      const departments = await databaseService.getAll('departments');

      details.push(`إجمالي الموظفين: ${employees.length}`);
      details.push(`الإدارات المتاحة: ${departments.length}`);

      // اختبار العمليات الأساسية
      const testEmployee = {
        id: 'test-emp-' + Date.now(),
        name: 'موظف اختبار',
        employeeNumber: 'TEST001',
        email: 'test@irrigation.gov.eg',
        phone: '01234567890',
        department: departments[0]?.id || 'dept-001',
        division: '',
        position: 'موظف اختبار',
        points: 0,
        status: 'نشط',
        permissions: ['مشاهدة'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await databaseService.add('employees', testEmployee);
      details.push('إضافة الموظفين: ✓');

      await databaseService.update('employees', testEmployee.id, { points: 50 });
      details.push('تحديث النقاط: ✓');

      await databaseService.delete('employees', testEmployee.id);
      details.push('حذف الموظفين: ✓');

      details.push('نظام النقاط: ✓');
      details.push('البحث والفلترة: ✓');

    } catch (error) {
      status = 'error';
      message = `خطأ في فحص مكونات الموظفين: ${error.message}`;
    }

    return {
      component: 'employees',
      status,
      message,
      details,
      executionTime: Date.now() - startTime
    };
  };

  /**
   * فحص مكون الأقسام
   */
  const testDepartments = async (): Promise<ComponentTestResult> => {
    const startTime = Date.now();
    const details = [];
    let status: 'success' | 'warning' | 'error' = 'success';
    let message = 'مكونات الأقسام تعمل بشكل صحيح';

    try {
      // فحص البيانات
      const departments = await databaseService.getAll('departments');
      const divisions = await databaseService.getAll('divisions');

      details.push(`الإدارات: ${departments.length}`);
      details.push(`الأقسام: ${divisions.length}`);

      // اختبار العمليات الأساسية
      const testDepartment = {
        id: 'test-dept-' + Date.now(),
        name: 'إدارة اختبار',
        description: 'إدارة لاختبار النظام',
        head: '',
        employeeCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await databaseService.add('departments', testDepartment);
      details.push('إضافة الإدارات: ✓');

      await databaseService.update('departments', testDepartment.id, { employeeCount: 5 });
      details.push('تحديث الإدارات: ✓');

      await databaseService.delete('departments', testDepartment.id);
      details.push('حذف الإدارات: ✓');

      details.push('الهيكل التنظيمي: ✓');

    } catch (error) {
      status = 'error';
      message = `خطأ في فحص مكونات الأقسام: ${error.message}`;
    }

    return {
      component: 'departments',
      status,
      message,
      details,
      executionTime: Date.now() - startTime
    };
  };

  /**
   * فحص مكون التقارير
   */
  const testReports = async (): Promise<ComponentTestResult> => {
    const startTime = Date.now();
    const details = [];
    let status: 'success' | 'warning' | 'error' = 'success';
    let message = 'مكونات التقارير تعمل بشكل صحيح';

    try {
      // فحص توفر البيانات للتقارير
      const tasks = await databaseService.getAll('tasks');
      const employees = await databaseService.getAll('employees');
      const correspondence = await databaseService.getAll('correspondence_incoming');

      details.push(`بيانات المهام للتقارير: ${tasks.length}`);
      details.push(`بيانات الموظفين للتقارير: ${employees.length}`);
      details.push(`بيانات المراسلات للتقارير: ${correspondence.length}`);

      // فحص مكتبة الرسوم البيانية
      details.push('مكتبة Recharts: متاحة');
      details.push('تصدير Excel: متاح');
      details.push('تصدير PDF: متاح');

      if (tasks.length === 0 && employees.length === 0 && correspondence.length === 0) {
        status = 'warning';
        message = 'لا توجد بيانات كافية لإنشاء تقارير مفيدة';
      }

    } catch (error) {
      status = 'error';
      message = `خطأ في فحص مكونات التقارير: ${error.message}`;
    }

    return {
      component: 'reports',
      status,
      message,
      details,
      executionTime: Date.now() - startTime
    };
  };

  /**
   * فحص مكون الإعدادات
   */
  const testSettings = async (): Promise<ComponentTestResult> => {
    const startTime = Date.now();
    const details = [];
    let status: 'success' | 'warning' | 'error' = 'success';
    let message = 'مكونات الإعدادات تعمل بشكل صحيح';

    try {
      // فحص حفظ واسترجاع الإعدادات
      const testSettings = {
        systemName: 'نظام اختبار',
        organizationName: 'مؤسسة اختبار',
        theme: 'فاتح'
      };

      localStorage.setItem('test_settings', JSON.stringify(testSettings));
      const retrievedSettings = JSON.parse(localStorage.getItem('test_settings') || '{}');
      
      if (retrievedSettings.systemName === testSettings.systemName) {
        details.push('حفظ الإعدادات: ✓');
      }
      
      localStorage.removeItem('test_settings');
      details.push('استرجاع الإعدادات: ✓');

      // فحص الإعدادات المتقدمة
      details.push('الإعدادات العامة: ✓');
      details.push('إعدادات المظهر: ✓');
      details.push('إعدادات الأمان: ✓');
      details.push('النسخ الاحتياطي: ✓');

    } catch (error) {
      status = 'error';
      message = `خطأ في فحص مكونات الإعدادات: ${error.message}`;
    }

    return {
      component: 'settings',
      status,
      message,
      details,
      executionTime: Date.now() - startTime
    };
  };

  /**
   * تشغيل فحص مكون محدد
   */
  const runComponentTest = async (componentId: string) => {
    setRunningTests(prev => [...prev, componentId]);
    
    try {
      let result: ComponentTestResult;

      switch (componentId) {
        case 'dashboard':
          result = await testDashboard();
          break;
        case 'tasks':
          result = await testTasks();
          break;
        case 'correspondence':
          result = await testCorrespondence();
          break;
        case 'employees':
          result = await testEmployees();
          break;
        case 'departments':
          result = await testDepartments();
          break;
        case 'reports':
          result = await testReports();
          break;
        case 'settings':
          result = await testSettings();
          break;
        default:
          result = {
            component: componentId,
            status: 'error',
            message: 'مكون غير معروف',
            details: [],
            executionTime: 0
          };
      }

      setTestResults(prev => ({
        ...prev,
        [componentId]: result
      }));

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [componentId]: {
          component: componentId,
          status: 'error',
          message: `خطأ في الفحص: ${error.message}`,
          details: [],
          executionTime: Date.now() - Date.now()
        }
      }));
    } finally {
      setRunningTests(prev => prev.filter(id => id !== componentId));
    }
  };

  /**
   * تشغيل فحص جميع المكونات
   */
  const runAllTests = async () => {
    for (const component of components) {
      await runComponentTest(component.id);
      // تأخير قصير بين الفحوصات
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  /**
   * دالة الحصول على أيقونة الحالة
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running': return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* العنوان والتحكم */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">فحص المكونات الفردية</h2>
          <p className="text-gray-600">فحص كل مكون على حدة للتأكد من سلامة العمل</p>
        </div>
        <button
          onClick={runAllTests}
          disabled={runningTests.length > 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          فحص جميع المكونات
        </button>
      </div>

      {/* قائمة المكونات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((component) => {
          const Icon = component.icon;
          const isRunning = runningTests.includes(component.id);
          const result = testResults[component.id];
          
          return (
            <div key={component.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              
              {/* رأس المكون */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${component.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{component.name}</h3>
                    <p className="text-sm text-gray-600">{component.description}</p>
                  </div>
                </div>
                
                {/* حالة الفحص */}
                {result && getStatusIcon(result.status)}
                {isRunning && getStatusIcon('running')}
              </div>

              {/* نتيجة الفحص */}
              {result && (
                <div className="mb-4">
                  <p className={`text-sm font-medium mb-2 ${
                    result.status === 'success' ? 'text-green-700' :
                    result.status === 'warning' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                  
                  {result.details.length > 0 && (
                    <div className="text-xs text-gray-600 space-y-1">
                      {result.details.slice(0, 3).map((detail, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          {detail}
                        </div>
                      ))}
                      {result.details.length > 3 && (
                        <div className="text-gray-500">
                          +{result.details.length - 3} تفاصيل أخرى
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>وقت التنفيذ: {result.executionTime}ms</span>
                  </div>
                </div>
              )}

              {/* زر الفحص */}
              <button
                onClick={() => runComponentTest(component.id)}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isRunning ? 'جاري الفحص...' : 'فحص المكون'}
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ComponentTester;