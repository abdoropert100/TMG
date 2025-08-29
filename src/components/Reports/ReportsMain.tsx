import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Calendar,
  Users,
  FileText,
  Mail,
  Target,
  Clock,
  Filter,
  RefreshCw,
  Printer,
  Share2
} from 'lucide-react';
import { Task, Employee, Correspondence, Department, Division } from '../../types';
import { databaseService } from '../../services/DatabaseService';
import { excelService } from '../../services/ExcelService';
import TasksReport from './TasksReport';
import EmployeesReport from './EmployeesReport';
import CorrespondenceReport from './CorrespondenceReport';
import DepartmentsReport from './DepartmentsReport';

// أنواع التقارير المتاحة
type ReportType = 'overview' | 'tasks' | 'employees' | 'correspondence' | 'departments';

// واجهة فترة التقرير
interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  preset: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

// مكون التقارير الرئيسي
const ReportsMain: React.FC = () => {
  // حالات المكون
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // البيانات
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);

  // فترة التقرير
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
    preset: 'month'
  });

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    loadData();
  }, []);

  // دالة تحميل البيانات
  const loadData = async () => {
    try {
      setLoading(true);
      const [
        tasksData,
        employeesData,
        incomingCorr,
        outgoingCorr,
        departmentsData,
        divisionsData
      ] = await Promise.all([
        databaseService.getAll<Task>('tasks'),
        databaseService.getAll<Employee>('employees'),
        databaseService.getAll<Correspondence>('correspondence_incoming'),
        databaseService.getAll<Correspondence>('correspondence_outgoing'),
        databaseService.getAll<Department>('departments'),
        databaseService.getAll<Division>('divisions')
      ]);

      setTasks(tasksData);
      setEmployees(employeesData);
      setCorrespondences([...incomingCorr, ...outgoingCorr]);
      setDepartments(departmentsData);
      setDivisions(divisionsData);
      setError(null);
    } catch (err) {
      setError('خطأ في تحميل البيانات');
      console.error('خطأ في تحميل البيانات:', err);
    } finally {
      setLoading(false);
    }
  };

  // دالة تغيير فترة التقرير
  const handlePeriodChange = (preset: ReportPeriod['preset']) => {
    const today = new Date();
    let startDate: Date;
    let endDate = new Date();

    switch (preset) {
      case 'today':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        break;
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    setReportPeriod({ startDate, endDate, preset });
  };

  // دالة تصدير التقرير
  const handleExportReport = async (format: 'excel' | 'pdf') => {
    try {
      if (format === 'excel') {
        await excelService.exportReport(activeReport, reportPeriod);
      } else {
        // تصدير PDF - يمكن إضافة مكتبة PDF هنا
        console.log('تصدير PDF قيد التطوير');
      }
    } catch (error) {
      console.error('خطأ في تصدير التقرير:', error);
      setError('خطأ في تصدير التقرير');
    }
  };

  // دالة طباعة التقرير
  const handlePrintReport = () => {
    window.print();
  };

  // حساب الإحصائيات العامة
  const getOverviewStats = () => {
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.startDate);
      return taskDate >= reportPeriod.startDate && taskDate <= reportPeriod.endDate;
    });

    const filteredCorrespondences = correspondences.filter(corr => {
      const corrDate = new Date(corr.date);
      return corrDate >= reportPeriod.startDate && corrDate <= reportPeriod.endDate;
    });

    return {
      totalTasks: filteredTasks.length,
      completedTasks: filteredTasks.filter(t => t.status === 'مكتملة').length,
      overdueTasks: filteredTasks.filter(t => t.status === 'متأخرة').length,
      totalCorrespondences: filteredCorrespondences.length,
      incomingCorrespondences: filteredCorrespondences.filter(c => c.type === 'incoming').length,
      outgoingCorrespondences: filteredCorrespondences.filter(c => c.type === 'outgoing').length,
      urgentCorrespondences: filteredCorrespondences.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length,
      totalEmployees: employees.length,
      activeDepartments: departments.length,
      activeDivisions: divisions.length
    };
  };

  const stats = getOverviewStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل التقارير...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* رسالة الخطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <div className="h-5 w-5 text-red-600">⚠️</div>
          <span className="text-red-700">{error}</span>
          <button 
            type="button"
            onClick={() => setError(null)}
            className="mr-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
          <p className="text-gray-600">تقارير شاملة عن أداء النظام والعمليات</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => loadData()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>تحديث</span>
          </button>
          <button 
            type="button"
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>طباعة</span>
          </button>
          <button 
            type="button"
            onClick={() => handleExportReport('excel')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* فترة التقرير */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">فترة التقرير</h2>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {reportPeriod.startDate.toLocaleDateString('ar-EG')} - {reportPeriod.endDate.toLocaleDateString('ar-EG')}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'today', label: 'اليوم' },
            { key: 'week', label: 'آخر أسبوع' },
            { key: 'month', label: 'هذا الشهر' },
            { key: 'quarter', label: 'هذا الربع' },
            { key: 'year', label: 'هذا العام' }
          ].map(period => (
            <button
              key={period.key}
              type="button"
              onClick={() => handlePeriodChange(period.key as ReportPeriod['preset'])}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                reportPeriod.preset === period.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* أنواع التقارير */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6">
            {[
              { key: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { key: 'tasks', label: 'تقرير المهام', icon: Target },
              { key: 'employees', label: 'تقرير الموظفين', icon: Users },
              { key: 'correspondence', label: 'تقرير المراسلات', icon: Mail },
              { key: 'departments', label: 'تقرير الأقسام', icon: FileText }
            ].map(report => {
              const Icon = report.icon;
              return (
                <button
                  key={report.key}
                  type="button"
                  onClick={() => setActiveReport(report.key as ReportType)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeReport === report.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {report.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* محتوى التقرير */}
        <div className="p-6">
          {activeReport === 'overview' && (
            <div className="space-y-6">
              {/* الإحصائيات العامة */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">إجمالي المهام</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalTasks}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">المهام المكتملة</p>
                      <p className="text-2xl font-bold text-green-900">{stats.completedTasks}</p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600">إجمالي المراسلات</p>
                      <p className="text-2xl font-bold text-orange-900">{stats.totalCorrespondences}</p>
                    </div>
                    <Mail className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">إجمالي الموظفين</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.totalEmployees}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* رسائل تحليلية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">أداء المهام</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">معدل الإنجاز</span>
                      <span className="font-semibold text-green-600">
                        {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">المراسلات</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">واردة</span>
                      <span className="font-semibold text-blue-600">{stats.incomingCorrespondences}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">صادرة</span>
                      <span className="font-semibold text-green-600">{stats.outgoingCorrespondences}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">عاجلة</span>
                      <span className="font-semibold text-red-600">{stats.urgentCorrespondences}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'tasks' && (
            <TasksReport 
              tasks={tasks} 
              employees={employees} 
              departments={departments}
              divisions={divisions}
              reportPeriod={reportPeriod} 
            />
          )}

          {activeReport === 'employees' && (
            <EmployeesReport 
              employees={employees} 
              tasks={tasks}
              departments={departments}
              divisions={divisions}
              reportPeriod={reportPeriod} 
            />
          )}

          {activeReport === 'correspondence' && (
            <CorrespondenceReport 
              correspondences={correspondences} 
              employees={employees}
              departments={departments}
              divisions={divisions}
              reportPeriod={reportPeriod} 
            />
          )}

          {activeReport === 'departments' && (
            <DepartmentsReport 
              departments={departments}
              divisions={divisions}
              employees={employees}
              tasks={tasks}
              correspondences={correspondences}
              reportPeriod={reportPeriod} 
            />
          )}
        </div>
      </div>

    </div>
  );
};

export default ReportsMain;