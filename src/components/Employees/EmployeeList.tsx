import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Users,
  Award,
  Star,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { Employee, Department, Division } from '../../types';
import { useApp } from '../../context/AppContext';
import { excelService } from '../../services/ExcelService';
import EmployeeForm from './EmployeeForm';

/**
 * واجهة خيارات الفلترة للموظفين
 */
interface FilterOptions {
  search: string;
  status: string;
  department: string;
  division: string;
  position: string;
  pointsMin: string;
  pointsMax: string;
}

/**
 * مكون قائمة الموظفين
 */
const EmployeeList: React.FC = () => {
  const { state, actions } = useApp();

  // حالات المكون
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // حالات الفلترة
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: '',
    department: '',
    division: '',
    position: '',
    pointsMin: '',
    pointsMax: ''
  });

  // تحميل البيانات
  useEffect(() => {
    loadData();
  }, []);

  // تطبيق الفلاتر
  useEffect(() => {
    applyFilters();
  }, [employees, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        actions.loadEmployees(),
        actions.loadDepartments(),
        actions.loadDivisions()
      ]);
      setError(null);
    } catch (err) {
      setError('خطأ في تحميل الموظفين');
      console.error('خطأ في تحميل الموظفين:', err);
    } finally {
      setLoading(false);
    }
  };

  // تحديث البيانات عند تغيير الحالة العامة
  useEffect(() => {
    setEmployees(state.employees || []);
  }, [state.employees]);

  const applyFilters = () => {
    let filtered = [...employees];

    // البحث النصي
    if (filters.search) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        emp.employeeNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        emp.position.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // فلتر الحالة
    if (filters.status) {
      filtered = filtered.filter(emp => emp.status === filters.status);
    }

    // فلتر الإدارة
    if (filters.department) {
      filtered = filtered.filter(emp => emp.department === filters.department);
    }

    // فلتر القسم
    if (filters.division) {
      filtered = filtered.filter(emp => emp.division === filters.division);
    }

    // فلتر المنصب
    if (filters.position) {
      filtered = filtered.filter(emp => emp.position.toLowerCase().includes(filters.position.toLowerCase()));
    }

    // فلتر النقاط
    if (filters.pointsMin) {
      filtered = filtered.filter(emp => emp.points >= parseInt(filters.pointsMin));
    }
    if (filters.pointsMax) {
      filtered = filtered.filter(emp => emp.points <= parseInt(filters.pointsMax));
    }

    setFilteredEmployees(filtered);
  };

  const handleSaveEmployee = async (employeeData: Partial<Employee>) => {
    try {
      if (selectedEmployee) {
        await actions.updateEmployee(selectedEmployee.id, employeeData);
      } else {
        const newEmployee: Employee = {
          id: `emp-${Date.now()}`,
          ...employeeData,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Employee;
        await actions.addEmployee(newEmployee);
      }
      await loadData();
      setShowEmployeeForm(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('خطأ في حفظ الموظف:', error);
      setError('خطأ في حفظ الموظف');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        await actions.deleteEmployee(employeeId);
        await loadData();
      } catch (error) {
        console.error('خطأ في حذف الموظف:', error);
        setError('خطأ في حذف الموظف');
      }
    }
  };

  const handleExportEmployees = async () => {
    try {
      await excelService.exportEmployees();
    } catch (error) {
      console.error('خطأ في تصدير الموظفين:', error);
      setError('خطأ في تصدير الموظفين');
    }
  };

  const handleImportEmployees = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const result = await excelService.importEmployees(file);
        if (result.success > 0) {
          await loadData();
          alert(`تم استيراد ${result.success} موظف بنجاح`);
        }
        if (result.errors.length > 0) {
          setError(`تم الاستيراد مع ${result.errors.length} خطأ`);
        }
      } catch (error) {
        console.error('خطأ في استيراد الموظفين:', error);
        setError('خطأ في استيراد الموظفين');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowEmployeeForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    const details = `
      الاسم: ${employee.name}
      الرقم الوظيفي: ${employee.employeeNumber}
      البريد الإلكتروني: ${employee.email || 'غير محدد'}
      الهاتف: ${employee.phone || 'غير محدد'}
      المنصب: ${employee.position}
      النقاط: ${employee.points}
      الحالة: ${employee.status}
    `;
    alert(details);
  };

  // حساب الإحصائيات
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'نشط').length,
    onLeave: employees.filter(e => e.status === 'إجازة').length,
    inactive: employees.filter(e => e.status === 'معطل').length,
    avgPoints: employees.length > 0 ? Math.round(employees.reduce((sum, e) => sum + e.points, 0) / employees.length) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل الموظفين...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* رسائل الخطأ */}
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

      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموظفين</h1>
          <p className="text-gray-600">إدارة ومتابعة جميع الموظفين في النظام</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>استيراد</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImportEmployees}
            />
          </label>
          <button
            type="button"
            onClick={handleExportEmployees}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </button>
          <button
            type="button"
            onClick={handleAddEmployee}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة موظف جديد</span>
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الموظفين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">نشط</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <UserPlus className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">في إجازة</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.onLeave}</p>
            </div>
            <Users className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">معطل</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <Users className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">متوسط النقاط</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgPoints}</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الموظفين..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="نشط">نشط</option>
              <option value="معطل">معطل</option>
              <option value="إجازة">إجازة</option>
            </select>
          </div>

          <div className="min-w-[150px]">
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الإدارات</option>
              {state.departments.map(dept => (
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

      {/* قائمة الموظفين */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            الموظفين ({filteredEmployees.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموظف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الرقم الوظيفي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المنصب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإدارة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النقاط
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => {
                const department = state.departments.find(d => d.id === employee.department);
                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {employee.name.charAt(0)}
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.employeeNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {department?.name || employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">{employee.points}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.status === 'نشط' ? 'bg-green-100 text-green-800' :
                        employee.status === 'إجازة' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900"
                          title="عرض"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="text-green-600 hover:text-green-900"
                          title="تعديل"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-600 hover:text-red-900"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">لا توجد موظفين تطابق معايير البحث</p>
            <p className="text-sm mt-2">جرب تغيير الفلاتر أو إضافة موظف جديد</p>
          </div>
        )}
      </div>

      {/* نموذج إضافة/تعديل الموظف */}
      <EmployeeForm
        employee={selectedEmployee}
        isOpen={showEmployeeForm}
        onClose={() => {
          setShowEmployeeForm(false);
          setSelectedEmployee(null);
        }}
        onSave={handleSaveEmployee}
      />
    </div>
  );
};

export default EmployeeList;