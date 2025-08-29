import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  MailOpen,
  Shield,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileText,
  Send,
  BarChart3,
  Eye,
  X
} from 'lucide-react';
import { Correspondence, Employee, Department, Division } from '../../types';
import { databaseService } from '../../services/DatabaseService';
import { excelService } from '../../services/ExcelService';
import { useApp } from '../../context/AppContext';
import CorrespondenceCard from './CorrespondenceCard';
import { isValidDate, formatDate } from '../../utils/dateUtils';
import IncomingForm from './IncomingForm';
import OutgoingForm from './OutgoingForm';

/**
 * واجهة خيارات الفلترة للمراسلات
 */
interface FilterOptions {
  search: string;
  status: string;
  confidentiality: string;
  urgency: string;
  department: string;
  division: string;
  assignedTo: string;
  dateFrom: string;
  dateTo: string;
}

/**
 * مكون قائمة المراسلات
 * يوفر إدارة كاملة للمراسلات الواردة والصادرة
 */
const CorrespondenceList: React.FC = () => {
  // استخدام السياق للحصول على البيانات والإجراءات
  const { state, actions } = useApp();

  // حالات المكون للبيانات والواجهة
  const [correspondences, setCorrespondences] = useState<Correspondence[]>(state.correspondence);
  const [filteredCorrespondences, setFilteredCorrespondences] = useState<Correspondence[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(state.employees);
  const [departments, setDepartments] = useState<Department[]>(state.departments);
  const [divisions, setDivisions] = useState<Division[]>(state.divisions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // حالات النوافذ المنبثقة والنماذج
  const [showIncomingForm, setShowIncomingForm] = useState(false);
  const [showOutgoingForm, setShowOutgoingForm] = useState(false);
  const [selectedCorrespondence, setSelectedCorrespondence] = useState<Correspondence | null>(null);

  // حالات الفلترة والعرض والتبويبات
  const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [advancedFilters, setAdvancedFilters] = useState({
    search: '',
    type: 'all' as 'all' | 'incoming' | 'outgoing',
    status: '',
    confidentiality: '',
    urgency: '',
    department: '',
    division: '',
    assignedTo: '',
    dateFrom: '',
    dateTo: '',
    hasAttachments: false,
    hasLinkedTasks: false,
    isRepeated: false,
    tags: [] as string[],
    senderOrganization: '',
    recipientOrganization: ''
  });

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
        actions.loadCorrespondence(),
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
    setCorrespondences(state.correspondence || []);
    setEmployees(state.employees || []);
    setDepartments(state.departments || []);
    setDivisions(state.divisions || []);
  }, [state.correspondence, state.employees, state.departments, state.divisions]);

  /**
   * تطبيق الفلاتر عند تغيير المراسلات أو معايير الفلترة
   */
  useEffect(() => {
    applyFilters();
  }, [correspondences, advancedFilters, activeTab]);


  /**
   * دالة تطبيق الفلاتر على قائمة المراسلات
   */
  const applyFilters = () => {
    let filtered = [...correspondences];

    // تطبيق فلتر نوع المراسلة (وارد/صادر)
    if (activeTab === 'incoming' || advancedFilters.type === 'incoming') {
      filtered = filtered.filter(c => c.type === 'وارد');
    } else if (activeTab === 'outgoing' || advancedFilters.type === 'outgoing') {
      filtered = filtered.filter(c => c.type === 'صادر');
    }

    // تطبيق فلتر البحث النصي
    if (advancedFilters.search) {
      filtered = filtered.filter(corr =>
        corr.subject.toLowerCase().includes(advancedFilters.search.toLowerCase()) ||
        corr.number.toLowerCase().includes(advancedFilters.search.toLowerCase()) ||
        (corr.sender && corr.sender.toLowerCase().includes(advancedFilters.search.toLowerCase())) ||
        (corr.recipient && corr.recipient.toLowerCase().includes(advancedFilters.search.toLowerCase()))
      );
    }

    // تطبيق باقي الفلاتر
    if (advancedFilters.status) {
      filtered = filtered.filter(corr => corr.status === advancedFilters.status);
    }

    if (advancedFilters.confidentiality) {
      filtered = filtered.filter(corr => corr.confidentiality === advancedFilters.confidentiality);
    }

    if (advancedFilters.urgency) {
      filtered = filtered.filter(corr => corr.urgency === advancedFilters.urgency);
    }

    if (advancedFilters.department) {
      filtered = filtered.filter(corr => corr.department === advancedFilters.department);
    }

    if (advancedFilters.division) {
      filtered = filtered.filter(corr => corr.division === advancedFilters.division);
    }

    if (advancedFilters.assignedTo) {
      filtered = filtered.filter(corr => corr.assignedTo === advancedFilters.assignedTo);
    }

    if (advancedFilters.dateFrom) {
  filtered = filtered.filter(corr => isValidDate(new Date(corr.date)) && isValidDate(new Date(advancedFilters.dateFrom)) && new Date(corr.date) >= new Date(advancedFilters.dateFrom));
    }

    if (advancedFilters.dateTo) {
  filtered = filtered.filter(corr => isValidDate(new Date(corr.date)) && isValidDate(new Date(advancedFilters.dateTo)) && new Date(corr.date) <= new Date(advancedFilters.dateTo));
    }

    if (advancedFilters.senderOrganization) {
      filtered = filtered.filter(corr => 
        corr.senderOrganization?.toLowerCase().includes(advancedFilters.senderOrganization.toLowerCase())
      );
    }

    if (advancedFilters.recipientOrganization) {
      filtered = filtered.filter(corr => 
        corr.recipientOrganization?.toLowerCase().includes(advancedFilters.recipientOrganization.toLowerCase())
      );
    }
    // ترتيب المراسلات حسب التاريخ (الأحدث أولاً)
  filtered = filtered.filter(corr => isValidDate(new Date(corr.date)));
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredCorrespondences(filtered);
  };

  /**
   * دالة حفظ المراسلة الواردة
   * @param correspondenceData بيانات المراسلة
   */
  const handleSaveIncomingCorrespondence = async (correspondenceData: Partial<Correspondence>) => {
    try {
      if (selectedCorrespondence) {
        // تحديث مراسلة موجودة
        await actions.updateCorrespondence(selectedCorrespondence.id, correspondenceData);
      } else {
        // إضافة مراسلة واردة جديدة
        const newCorrespondence: Correspondence = {
          id: `inc-${Date.now()}`,
          type: 'وارد',
          ...correspondenceData,
          createdBy: state.currentUser.id,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Correspondence;
        await actions.addCorrespondence(newCorrespondence);
      }
      setShowIncomingForm(false);
      setSelectedCorrespondence(null);
    } catch (error) {
      console.error('خطأ في حفظ المراسلة:', error);
      setError('خطأ في حفظ المراسلة');
    }
  };

  /**
   * دالة حفظ المراسلة الصادرة
   * @param correspondenceData بيانات المراسلة
   */
  const handleSaveOutgoingCorrespondence = async (correspondenceData: Partial<Correspondence>) => {
    try {
      if (selectedCorrespondence) {
        // تحديث مراسلة موجودة
        await actions.updateCorrespondence(selectedCorrespondence.id, correspondenceData);
      } else {
        // إضافة مراسلة صادرة جديدة
        const newCorrespondence: Correspondence = {
          id: `out-${Date.now()}`,
          type: 'صادر',
          ...correspondenceData,
          createdBy: state.currentUser.id,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Correspondence;
        await actions.addCorrespondence(newCorrespondence);
      }
      setShowOutgoingForm(false);
      setSelectedCorrespondence(null);
    } catch (error) {
      console.error('خطأ في حفظ المراسلة:', error);
      setError('خطأ في حفظ المراسلة');
    }
  };

  /**
   * دالة حذف المراسلة
   * @param correspondenceId معرف المراسلة
   */
  const handleDeleteCorrespondence = async (correspondenceId: string) => {
    try {
      await actions.deleteCorrespondence(correspondenceId);
    } catch (error) {
      console.error('خطأ في حذف المراسلة:', error);
      setError('خطأ في حذف المراسلة');
    }
  };

  /**
   * دالة تغيير حالة المراسلة
   * @param correspondenceId معرف المراسلة
   * @param newStatus الحالة الجديدة
   */
  const handleStatusChange = async (correspondenceId: string, newStatus: string) => {
    try {
      await actions.updateCorrespondence(correspondenceId, { status: newStatus });
    } catch (error) {
      console.error('خطأ في تحديث حالة المراسلة:', error);
      setError('خطأ في تحديث حالة المراسلة');
    }
  };

  /**
   * دالة تصدير المراسلات إلى Excel
   */
  const handleExportCorrespondences = async () => {
    try {
      const exportType = activeTab === 'incoming' ? 'incoming' :
                        activeTab === 'outgoing' ? 'outgoing' : 'both';
      await excelService.exportCorrespondence(exportType);
    } catch (error) {
      console.error('خطأ في تصدير المراسلات:', error);
      setError('خطأ في تصدير المراسلات');
    }
  };

  /**
   * دالة استيراد المراسلات من Excel
   * @param event حدث اختيار الملف
   */
  const handleImportCorrespondences = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const type = activeTab === 'incoming' ? 'incoming' : 'outgoing';
        const result = await excelService.importCorrespondence(file, type);
        if (result.success > 0) {
          await actions.loadCorrespondence();
          alert(`تم استيراد ${result.success} مراسلة بنجاح`);
        }
        if (result.errors.length > 0) {
          setError(`تم الاستيراد مع ${result.errors.length} خطأ`);
        }
        setError(null);
      } catch (error) {
        console.error('خطأ في استيراد المراسلات:', error);
        setError('خطأ في استيراد المراسلات');
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * دالة فتح نموذج إضافة مراسلة واردة جديدة
   */
  const handleAddIncoming = () => {
    setSelectedCorrespondence(null);
    setShowIncomingForm(true);
  };

  /**
   * دالة فتح نموذج إضافة مراسلة صادرة جديدة
   */
  const handleAddOutgoing = () => {
    setSelectedCorrespondence(null);
    setShowOutgoingForm(true);
  };

  /**
   * دالة فتح نموذج تعديل مراسلة موجودة
   * @param correspondence المراسلة المراد تعديلها
   */
  const handleEditCorrespondence = (correspondence: Correspondence) => {
    setSelectedCorrespondence(correspondence);
    if (correspondence.type === 'وارد') {
      setShowIncomingForm(true);
    } else {
      setShowOutgoingForm(true);
    }
  };

  /**
   * دالة عرض تفاصيل المراسلة
   * @param correspondence المراسلة المراد عرض تفاصيلها
   */
  const handleViewDetails = (correspondence: Correspondence) => {
    alert(`تفاصيل المراسلة: ${correspondence.subject}\nالرقم: ${correspondence.number}\nالحالة: ${correspondence.status}`);
  };

  /**
   * دالة تحويل المراسلة إلى إدارة أخرى
   * @param correspondence المراسلة المراد تحويلها
   */
  const handleTransferCorrespondence = (correspondence: Correspondence) => {
    alert('ميزة التحويل قيد التطوير');
  };

  /**
   * دالة تنفيذ التحويل الفعلي
   */
  const handleExecuteTransfer = async (transferData: any) => {
    alert('ميزة التحويل قيد التطوير');
  };
  /**
   * دالة إنشاء مهمة مرتبطة بالمراسلة
   * @param correspondence المراسلة المراد ربطها بمهمة
   */
  const handleCreateTask = (correspondence: Correspondence) => {
    const taskTitle = prompt('أدخل عنوان المهمة:', `معالجة مراسلة: ${correspondence.subject}`);
    if (taskTitle) {
      const newTask = {
        id: `task-${Date.now()}`,
        title: taskTitle,
        description: `مهمة مرتبطة بالمراسلة رقم ${correspondence.number}`,
        priority: correspondence.urgency === 'فوري' ? 'عاجل' : correspondence.urgency === 'عاجل' ? 'عالي' : 'متوسط',
        status: 'جديدة',
        department: correspondence.department,
        division: correspondence.division,
        assignedTo: [correspondence.assignedTo],
        completedBy: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // أسبوع من الآن
        points: 20,
        createdBy: state.currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      actions.addTask(newTask);
      actions.updateCorrespondence(correspondence.id, { linkedTaskId: newTask.id });
      alert('تم إنشاء المهمة وربطها بالمراسلة بنجاح');
    }
  };

  // حساب الإحصائيات السريعة من البيانات الفعلية
  const stats = {
    total: correspondences.length,
    incoming: correspondences.filter(c => c.type === 'وارد').length,
    outgoing: correspondences.filter(c => c.type === 'صادر').length,
    urgent: correspondences.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length,
    confidential: correspondences.filter(c => c.confidentiality === 'سري' || c.confidentiality === 'سري جداً').length
  };

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل المراسلات...</span>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">إدارة المراسلات</h1>
          <p className="text-gray-600">إدارة المراسلات الواردة والصادرة</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => alert('لوحة تحكم المراسلات قيد التطوير')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>لوحة التحكم</span>
          </button>
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>استيراد</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImportCorrespondences}
            />
          </label>
          <button
            type="button"
            onClick={handleExportCorrespondences}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </button>
          <button
            type="button"
            onClick={handleAddOutgoing}
            className="flex items-center gap-2 px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>مراسلة صادرة</span>
          </button>
          <button
            type="button"
            onClick={handleAddIncoming}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>مراسلة واردة</span>
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المراسلات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">واردة</p>
              <p className="text-2xl font-bold text-blue-600">{stats.incoming}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">صادرة</p>
              <p className="text-2xl font-bold text-green-600">{stats.outgoing}</p>
            </div>
            <MailOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">عاجلة</p>
              <p className="text-2xl font-bold text-orange-600">{stats.urgent}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">سرية</p>
              <p className="text-2xl font-bold text-red-600">{stats.confidential}</p>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6">
            {[
              { key: 'all', label: 'جميع المراسلات', count: stats.total },
              { key: 'incoming', label: 'واردة', count: stats.incoming },
              { key: 'outgoing', label: 'صادرة', count: stats.outgoing }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as 'all' | 'incoming' | 'outgoing')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      {/* لوحة تحكم المراسلات */}
      {/* تم إزالة لوحة التحكم مؤقتاً */}

      {/* فلاتر المراسلات المتقدمة */}
      {/* شريط البحث والفلاتر البسيط */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في المراسلات..."
                value={advancedFilters.search}
                onChange={(e) => setAdvancedFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <select
              value={advancedFilters.status}
              onChange={(e) => setAdvancedFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="مسجل">مسجل</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="محال">محال</option>
              <option value="مغلق">مغلق</option>
              <option value="مؤرشف">مؤرشف</option>
              <option value="مسودة">مسودة</option>
              <option value="صادر">صادر</option>
            </select>
          </div>

          <div className="min-w-[150px]">
            <select
              value={advancedFilters.urgency}
              onChange={(e) => setAdvancedFilters(prev => ({ ...prev, urgency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الدرجات</option>
              <option value="عادي">عادي</option>
              <option value="عاجل">عاجل</option>
              <option value="فوري">فوري</option>
            </select>
          </div>

          <div className="min-w-[150px]">
            <select
              value={advancedFilters.department}
              onChange={(e) => setAdvancedFilters(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الإدارات</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* قائمة المراسلات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              المراسلات ({filteredCorrespondences.length})
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredCorrespondences.map((corr) => (
            <CorrespondenceCard
              key={corr.id}
              correspondence={corr}
              employees={employees}
              departments={departments}
              divisions={divisions}
              type={corr.type === 'وارد' ? 'incoming' : 'outgoing'}
              onEdit={handleEditCorrespondence}
              onDelete={handleDeleteCorrespondence}
              onStatusChange={handleStatusChange}
              onTransfer={handleTransferCorrespondence}
              onViewDetails={handleViewDetails}
              onCreateTask={handleCreateTask}
            />
          ))}
        </div>

        {filteredCorrespondences.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">لا توجد مراسلات تطابق معايير البحث</p>
            <p className="text-sm mt-2">جرب تغيير الفلاتر أو إضافة مراسلة جديدة</p>
          </div>
        )}
      </div>

      {/* نموذج إضافة/تعديل المراسلة الواردة */}
      <IncomingForm
        correspondence={selectedCorrespondence}
        isOpen={showIncomingForm}
        onClose={() => {
          setShowIncomingForm(false);
          setSelectedCorrespondence(null);
        }}
        onSave={handleSaveIncomingCorrespondence}
      />

      {/* نموذج إضافة/تعديل المراسلة الصادرة */}
      <OutgoingForm
        correspondence={selectedCorrespondence}
        isOpen={showOutgoingForm}
        onClose={() => {
          setShowOutgoingForm(false);
          setSelectedCorrespondence(null);
        }}
        onSave={handleSaveOutgoingCorrespondence}
      />

      {/* نافذة تحويل المراسلة */}

      {/* نافذة تفاصيل المراسلة */}

      {/* نافذة لوحة تحكم المراسلات */}

    </div>
  );
};

export default CorrespondenceList;