/**
 * صفحة إدارة المهام - نظام إدارة مصلحة الري
 * وزارة الموارد المائية والري - جمهورية مصر العربية
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  Calendar,
  Users,
  AlertTriangle,
  RefreshCw,
  Repeat,
  X
} from 'lucide-react';
import { Task, Employee, Department, Division } from '../../types';
import { useApp } from '../../context/AppContext';
import { excelService } from '../../services/ExcelService';
import { databaseService } from '../../services/DatabaseService';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import IntegratedDashboard from '../Dashboard/IntegratedDashboard';
import RecurringTasks from './RecurringTasks';
import TaskTransfer from './TaskTransfer';

/**
 * واجهة خيارات الفلترة للمهام
 */
interface FilterOptions {
  search: string;
  status: string;
  priority: string;
  department: string;
  division: string;
  assignedTo: string;
  dateFrom: string;
  dateTo: string;
}

/**
 * مكون قائمة المهام المحسن
 * يوفر إدارة كاملة للمهام مع CRUD والفلترة والتصدير
 */
const TaskList: React.FC<{ page?: number, pageSize?: number, sortOrder?: 'asc' | 'desc' }> = ({ page = 1, pageSize = 20, sortOrder = 'desc' }) => {
  // استخدام السياق للحصول على البيانات والإجراءات
  const { state, actions } = useApp();

  // حالات المكون المحلية للبيانات
  const [tasks, setTasks] = useState<Task[]>(state.tasks);
  const [employees, setEmployees] = useState<Employee[]>(state.employees);
  const [departments, setDepartments] = useState<Department[]>(state.departments);
  const [divisions, setDivisions] = useState<Division[]>(state.divisions);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(state.tasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // حالات النوافذ المنبثقة والنماذج
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskTransfer, setShowTaskTransfer] = useState(false);
  const [transferTask, setTransferTask] = useState<Task | null>(null);
  const [showRecurringTasks, setShowRecurringTasks] = useState(false);
  const [showTasksDashboard, setShowTasksDashboard] = useState(false);

  // حالات الفلترة والبحث
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: '',
    priority: '',
    department: '',
    division: '',
    assignedTo: '',
    dateFrom: '',
    dateTo: ''
  });

  // حالة التبويب النشط
  const [activeTab, setActiveTab] = useState<'tasks' | 'recurring' | 'dashboard'>('tasks');

  /**
   * تحميل البيانات عند تحميل المكون
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * دالة تحميل البيانات
   */
  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        actions.loadTasks(),
        actions.loadEmployees(),
        actions.loadDepartments(),
        actions.loadDivisions()
      ]);
      setError(null);
    } catch (err) {
      setError('خطأ في تحميل البيانات');
      console.error('خطأ في تحميل البيانات:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * تحديث البيانات عند تغيير الحالة العامة
   */
  useEffect(() => {
    setTasks(state.tasks || []);
    setEmployees(state.employees || []);
    setDepartments(state.departments || []);
    setDivisions(state.divisions || []);
  }, [state.tasks, state.employees, state.departments, state.divisions]);

  /**
   * تطبيق الفلاتر عند تغيير المهام أو معايير الفلترة
   */
  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  /**
   * دالة تطبيق الفلاتر على قائمة المهام
   */
  const applyFilters = () => {
    let filtered = [...tasks];

    // تطبيق فلتر البحث النصي
    if (filters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // تطبيق فلتر الحالة
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // تطبيق فلتر الأولوية
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // تطبيق فلتر الإدارة
    if (filters.department) {
      filtered = filtered.filter(task => task.department === filters.department);
    }

    // تطبيق فلتر القسم
    if (filters.division) {
      filtered = filtered.filter(task => task.division === filters.division);
    }

    // تطبيق فلتر الموظف المسند إليه
    if (filters.assignedTo) {
      filtered = filtered.filter(task =>
        task.assignedTo && task.assignedTo.includes(filters.assignedTo)
      );
    }

    // تطبيق فلاتر التاريخ
    if (filters.dateFrom) {
      filtered = filtered.filter(task =>
        new Date(task.startDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(task =>
        new Date(task.endDate) <= new Date(filters.dateTo)
      );
    }

    setFilteredTasks(filtered);
  };

  /**
   * دالة حفظ المهمة (إضافة أو تعديل)
   * @param taskData بيانات المهمة
   */
  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (selectedTask) {
        // تحديث مهمة موجودة
        await actions.updateTask(selectedTask.id, {...taskData, updated_at: new Date()});
      } else {
        // إضافة مهمة جديدة
        const newTask: Task = {
          id: `task-${Date.now()}`,
          ...taskData,
          createdBy: state.currentUser.id,
          created_at: new Date(),
          updated_at: new Date()
        } as Task;
        await actions.addTask(newTask);
      }
      setShowTaskForm(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('خطأ في حفظ المهمة:', error);
      setError('خطأ في حفظ المهمة');
    }
  };

  /**
   * دالة حذف المهمة
   * @param taskId معرف المهمة
   */
  const handleDeleteTask = async (taskId: string) => {
    try {
      await actions.deleteTask(taskId);
    } catch (error) {
      console.error('خطأ في حذف المهمة:', error);
      setError('خطأ في حذف المهمة');
    }
  };

  /**
   * دالة تغيير حالة المهمة
   * @param taskId معرف المهمة
   * @param newStatus الحالة الجديدة
   */
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await actions.updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('خطأ في تحديث حالة المهمة:', error);
      setError('خطأ في تحديث حالة المهمة');
    }
  };

  /**
   * دالة تصدير المهام إلى Excel
   */
  const handleExportTasks = async () => {
    try {
      await excelService.exportTasks();
    } catch (error) {
      console.error('خطأ في تصدير المهام:', error);
      setError('خطأ في تصدير المهام');
    }
  };

  /**
   * دالة فتح نموذج إضافة مهمة جديدة
   */
  const handleAddTask = () => {
    setSelectedTask(null);
    setShowTaskForm(true);
  };

  /**
   * دالة فتح نموذج تعديل مهمة موجودة
   * @param task المهمة المراد تعديلها
   */
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  };

  /**
   * دالة عرض تفاصيل المهمة
   * @param task المهمة المراد عرض تفاصيلها
   */
  const handleViewDetails = (task: Task) => {
    alert(`تفاصيل المهمة: ${task.title}\nالحالة: ${task.status}\nالأولوية: ${task.priority}`);
  };

  /**
   * دالة تحويل المهمة إلى إدارة أخرى
   * @param task المهمة المراد تحويلها
   */
  const handleTransferTask = async (task: Task) => {
    setTransferTask(task);
    setShowTaskTransfer(true);
  };

  /**
   * دالة إنشاء مهمة متكررة
   */
  const handleCreateRecurringTask = async (task: Task) => {
    try {
      const recurringTask: Task = {
        ...task,
        id: `task-recurring-${Date.now()}`,
        isRecurring: true,
        recurringPattern: {
          frequency: 'weekly',
          interval: 1
        },
        recurringCount: 0,
        originalTaskId: task.id,
        status: 'جديدة',
        created_at: new Date(),
        updated_at: new Date()
      };

      await actions.addTask(recurringTask);
      alert('تم إنشاء المهمة المتكررة بنجاح');
    } catch (error) {
      console.error('خطأ في إنشاء المهمة المتكررة:', error);
      setError('خطأ في إنشاء المهمة المتكررة');
    }
  };

  /**
   * دالة ربط المهمة بمراسلة
   */
  const handleLinkToCorrespondence = async (task: Task) => {
    const correspondenceNumber = prompt('أدخل رقم المراسلة المراد ربطها بالمهمة:');
    if (correspondenceNumber) {
      try {
        // البحث عن المراسلة
        const correspondence = state.correspondence.find(c => c.number === correspondenceNumber);
        if (correspondence) {
          await actions.updateTask(task.id, {
            linkedCorrespondenceId: correspondence.id,
            updated_at: new Date()
          });
          await actions.updateCorrespondence(correspondence.id, {
            linkedTaskId: task.id,
            updated_at: new Date()
          });
          alert('تم ربط المهمة بالمراسلة بنجاح');
        } else {
          alert('لم يتم العثور على المراسلة بهذا الرقم');
        }
      } catch (error) {
        console.error('خطأ في ربط المهمة بالمراسلة:', error);
        setError('خطأ في ربط المهمة بالمراسلة');
      }
    }
  };

  /**
   * دالة تنفيذ التحويل
   */
  const handleExecuteTransfer = async (transferData: any) => {
    try {
      await actions.updateTask(selectedTask!.id, {
        department: transferData.toDepartment,
        division: transferData.toDivision,
        assignedTo: transferData.toEmployee ? [transferData.toEmployee] : selectedTask!.assignedTo,
        updated_at: new Date()
      });

      // تسجيل عملية التحويل
      actions.logActivity('tasks', 'transfer', 
        `تم تحويل المهمة ${selectedTask!.title} - السبب: ${transferData.reason}`
      );

      setShowTaskTransfer(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('خطأ في تحويل المهمة:', error);
      setError('خطأ في تحويل المهمة');
    }
  };

  /**
   * دالة تحديث حالة المهمة مع توزيع النقاط التلقائي
   */
  const handleStatusChangeWithPoints = async (taskId: string, newStatus: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // تحديث حالة المهمة
      const updateData: any = { status: newStatus };
      
      // إذا تم إكمال المهمة، توزيع النقاط تلقائياً
      if (newStatus === 'مكتملة' && task.assignedTo && task.assignedTo.length > 0) {
        // إذا لم يكن هناك منجزون محددون، استخدم المسند إليهم
        updateData.completedBy = task.completedBy && task.completedBy.length > 0 ? task.completedBy : task.assignedTo;
        updateData.completedAt = new Date();
        
        // توزيع النقاط على المنجزين
        const completedEmployees = updateData.completedBy;
        const pointsPerEmployee = Math.floor(task.points / completedEmployees.length);
        
        for (const employeeId of completedEmployees) {
          const employee = employees.find(emp => emp.id === employeeId);
          if (employee) {
            await actions.updateEmployee(employeeId, {
              points: (employee.points || 0) + pointsPerEmployee
            });
          }
        }
        
        // تسجيل توزيع النقاط
        actions.logActivity('tasks', 'points_distributed', 
          `تم توزيع ${pointsPerEmployee} نقطة على كل منجز للمهمة ${task.title}`
        );
      }

      await actions.updateTask(taskId, updateData);
    } catch (error) {
      console.error('خطأ في تحديث حالة المهمة:', error);
      setError('خطأ في تحديث حالة المهمة');
    }
  };

  /**
   * دالة استيراد المهام من Excel
   * @param event حدث اختيار الملف
   */
  const handleImportTasks = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        // استيراد المهام من Excel
        const result = await excelService.importTasks(file);
        if (result.success > 0) {
          await actions.loadTasks();
          alert(`تم استيراد ${result.success} مهمة بنجاح`);
        }
        if (result.errors.length > 0) {
          setError(`تم الاستيراد مع ${result.errors.length} خطأ`);
        }
        setError(null);
      } catch (error) {
        console.error('خطأ في استيراد المهام:', error);
        setError('خطأ في استيراد المهام');
      } finally {
        setLoading(false);
      }
    }
  };

  // حساب الإحصائيات السريعة من البيانات الفعلية
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'مكتملة').length,
    inProgress: tasks.filter(t => t.status === 'قيد التنفيذ').length,
    overdue: tasks.filter(t => t.status === 'متأخرة').length,
    recurring: tasks.filter(t => t.isRecurring).length
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل المهام...</span>
      </div>
    );
  }

  // ترتيب المهام
  const sortedTasks = [...(state.tasks || [])].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });
  // تقسيم المهام حسب الصفحة
  const startIdx = (page - 1) * pageSize;
  const pagedTasks = sortedTasks.slice(startIdx, startIdx + pageSize);

  // لا تعرض صفحة فارغة بالكامل، بل اعرض التبويب كاملاً مع رسالة "لا توجد مهام" فقط في منطقة عرض المهام

  return (
    <div className="space-y-6">

      {/* عرض رسائل الخطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
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

      {/* العنوان الرئيسي وأزرار الإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المهام</h1>
          <p className="text-gray-600">إدارة ومتابعة جميع المهام في النظام</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRecurringTasks(true)}
            className="flex items-center gap-2 px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <Repeat className="h-4 w-4" />
            <span>المهام المتكررة</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTasksDashboard(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>لوحة تحكم المهام</span>
          </button>
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>استيراد</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImportTasks}
            />
          </label>
          <button
            type="button"
            onClick={handleExportTasks}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </button>
          <button
            type="button"
            onClick={handleAddTask}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة مهمة جديدة</span>
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المهام</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">قيد التنفيذ</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مكتملة</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">متأخرة</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">متكررة</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.recurring}
                {stats.recurring > 0 && (
                  <span className="text-sm text-purple-500 block">
                    إجمالي التكرارات: {tasks.filter(t => t.isRecurring).reduce((sum, t) => sum + (t.recurringCount || 0), 0)}
                  </span>
                )}
              </p>
            </div>
            <Repeat className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* البحث */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في المهام..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* فلتر الحالة */}
          <div className="min-w-[150px]">
            <select
              title="اختيار حالة المهمة"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="فلتر الحالة"
            >
              <option value="">جميع الحالات</option>
              <option value="جديدة">جديدة</option>
              <option value="قيد التنفيذ">قيد التنفيذ</option>
              <option value="مكتملة">مكتملة</option>
              <option value="متأخرة">متأخرة</option>
            </select>
          </div>

          {/* فلتر الأولوية */}
          <div className="min-w-[150px]">
            <select
              title="اختيار أولوية المهمة"
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="فلتر الأولوية"
            >
              <option value="">جميع الأولويات</option>
              <option value="عاجل">عاجل</option>
              <option value="عالي">عالي</option>
              <option value="متوسط">متوسط</option>
              <option value="منخفض">منخفض</option>
            </select>
          </div>

          {/* فلتر الإدارة */}
          <div className="min-w-[150px]">
            <select
              title="اختيار إدارة المهمة"
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الإدارات</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            <span>المزيد من الفلاتر</span>
          </button>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-bold border ${activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
          onClick={() => setActiveTab('tasks')}
          title="عرض المهام العادية"
        >المهام</button>
        <button
          className={`px-4 py-2 rounded-lg font-bold border ${activeTab === 'recurring' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600'}`}
          onClick={() => setActiveTab('recurring')}
          title="عرض المهام المتكررة"
        >المهام المتكررة</button>
        <button
          className={`px-4 py-2 rounded-lg font-bold border ${activeTab === 'dashboard' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
          onClick={() => setActiveTab('dashboard')}
          title="عرض لوحة تحكم المهام"
        >لوحة تحكم المهام</button>
      </div>

      {/* منطقة العرض الرئيسية */}
      {activeTab === 'tasks' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                المهام ({filteredTasks.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>ترتيب حسب: التاريخ الأحدث</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                employees={employees}
                departments={departments}
                divisions={divisions}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChangeWithPoints}
                onTransfer={handleTransferTask}
                onViewDetails={handleViewDetails}
                onLinkToCorrespondence={handleLinkToCorrespondence}
              />
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="w-full min-h-[40vh] flex flex-col items-center justify-center text-gray-500 rtl">
              <RefreshCw className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg">لا توجد مهام تطابق معايير البحث</p>
              <p className="text-sm mt-2">جرب تغيير الفلاتر أو إضافة مهمة جديدة</p>
            </div>
          )}
        </div>
      )}
      {activeTab === 'recurring' && (
        <RecurringTasks />
      )}
      {activeTab === 'dashboard' && (
        <IntegratedDashboard />
      )}

      {/* نموذج إضافة/تعديل المهمة */}
      <TaskForm
        task={selectedTask}
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
      />

      {/* نافذة تحويل المهمة */}
      {showTaskTransfer && transferTask && (
        <TaskTransfer
          task={transferTask}
          isOpen={showTaskTransfer}
          onClose={() => {
            setShowTaskTransfer(false);
            setTransferTask(null);
          }}
          onTransfer={handleExecuteTransfer}
        />
      )}
    </div>
  );
};

export default TaskList;

// استخدم virtualization مثل react-window أو react-virtualized لعرض المهام بكفاءة
// أضف دعم pagination أو infinite scroll
// عند تحميل المهام، اجلب فقط جزء من المهام من قاعدة البيانات حسب الصفحة أو البحث