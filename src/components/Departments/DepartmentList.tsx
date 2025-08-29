import React, { useState } from 'react';
import { 
  Plus, Search, Edit, Trash2, Building2, Users, 
  Eye, ChevronDown, ChevronRight, User, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Department, Division } from '../../types';
import { useApp } from '../../context/AppContext';
import DepartmentForm from './DepartmentForm';
import DivisionForm from './DivisionForm';

/**
 * مكون قائمة الأقسام والإدارات
 * يوفر إدارة كاملة للهيكل التنظيمي مع عرض شجري
 */
const DepartmentList: React.FC = () => {
  // استخدام السياق للحصول على البيانات والإجراءات
  const { state, actions } = useApp();

  // حالات المكونات المحلية للبيانات والواجهة
  const [departments, setDepartments] = useState<Department[]>(state.departments);
  const [divisions, setDivisions] = useState<Division[]>(state.divisions);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDepartments, setExpandedDepartments] = useState<string[]>([]);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddDivisionModal, setShowAddDivisionModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * تحديث البيانات عند تغيير الحالة العامة
   */
  React.useEffect(() => {
    loadData();
  }, [state.departments, state.divisions]);

  /**
   * دالة تحميل البيانات
   */
  const loadData = async () => {
    try {
      await Promise.all([
        actions.loadDepartments(),
        actions.loadDivisions()
      ]);
      setDepartments(state.departments || []);
      setDivisions(state.divisions || []);
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      setError('خطأ في تحميل البيانات');
    }
  };

  /**
   * دالة حفظ الإدارة (إضافة أو تعديل)
   * @param departmentData بيانات الإدارة
   */
  const handleSaveDepartment = async (departmentData: Partial<Department>) => {
    try {
      if (selectedDepartment) {
        // تحديث إدارة موجودة
        await actions.updateDepartment(selectedDepartment.id, departmentData);
      } else {
        // إضافة إدارة جديدة
        const newDepartment: Department = {
          id: `dept-${Date.now()}`,
          ...departmentData,
          employeeCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Department;
        await actions.addDepartment(newDepartment);
      }
      setShowAddDepartmentModal(false);
      setSelectedDepartment(null);
    } catch (error) {
      console.error('خطأ في حفظ الإدارة:', error);
      setError('خطأ في حفظ الإدارة');
    }
  };

  /**
   * دالة حفظ القسم (إضافة أو تعديل)
   * @param divisionData بيانات القسم
   */
  const handleSaveDivision = async (divisionData: Partial<Division>) => {
    try {
      if (selectedDivision) {
        // تحديث قسم موجود
        await actions.updateDivision(selectedDivision.id, divisionData);
      } else {
        // إضافة قسم جديد
        const newDivision: Division = {
          id: `div-${Date.now()}`,
          ...divisionData,
          employeeCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Division;
        await actions.addDivision(newDivision);
      }
      setShowAddDivisionModal(false);
      setSelectedDivision(null);
      setSelectedDepartment(null);
    } catch (error) {
      console.error('خطأ في حفظ القسم:', error);
      setError('خطأ في حفظ القسم');
    }
  };

  /**
   * دالة حذف الإدارة
   * @param departmentId معرف الإدارة
   */
  const handleDeleteDepartment = async (departmentId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الإدارة؟ سيتم حذف جميع الأقسام التابعة لها.')) {
      try {
        await actions.deleteDepartment(departmentId);
      } catch (error) {
        console.error('خطأ في حذف الإدارة:', error);
        setError('خطأ في حذف الإدارة');
      }
    }
  };

  /**
   * دالة حذف القسم
   * @param divisionId معرف القسم
   */
  const handleDeleteDivision = async (divisionId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      try {
        await actions.deleteDivision(divisionId);
      } catch (error) {
        console.error('خطأ في حذف القسم:', error);
        setError('خطأ في حذف القسم');
      }
    }
  };

  /**
   * دالة فتح نموذج تعديل الإدارة
   * @param department الإدارة المراد تعديلها
   */
  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setShowAddDepartmentModal(true);
  };

  /**
   * دالة فتح نموذج تعديل القسم
   * @param division القسم المراد تعديله
   */
  const handleEditDivision = (division: Division) => {
    setSelectedDivision(division);
    setShowAddDivisionModal(true);
  };

  /**
   * دالة توسيع/طي الإدارة لعرض الأقسام التابعة
   * @param departmentId معرف الإدارة
   */
  const toggleDepartmentExpansion = (departmentId: string) => {
    setExpandedDepartments(prev => 
      prev.includes(departmentId)
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  /**
   * دالة الحصول على أقسام إدارة معينة
   * @param departmentId معرف الإدارة
   */
  const getDepartmentDivisions = (departmentId: string) => {
    return divisions.filter(div => div.departmentId === departmentId);
  };

  // فلترة الإدارات حسب نص البحث
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">إدارة الأقسام والإدارات</h1>
          <p className="text-gray-600">إدارة الهيكل التنظيمي للمؤسسة والأقسام التابعة</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setSelectedDivision(null);
              setSelectedDepartment(null);
              setShowAddDivisionModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة قسم</span>
          </button>
          <button 
            onClick={() => {
              setSelectedDepartment(null);
              setShowAddDepartmentModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة إدارة</span>
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-900">{departments.length}</p>
              <p className="text-sm text-blue-600">إدارة</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-900">{divisions.length}</p>
              <p className="text-sm text-green-600">قسم</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {departments.reduce((total, dept) => total + dept.employeeCount, 0)}
              </p>
              <p className="text-sm text-purple-600">إجمالي الموظفين</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-900">
                {Math.round(departments.reduce((total, dept) => total + dept.employeeCount, 0) / departments.length)}
              </p>
              <p className="text-sm text-orange-600">متوسط الموظفين</p>
            </div>
          </div>
        </div>
      </div>

      {/* شريط البحث */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في الإدارات والأقسام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <span>توسيع الكل</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* قائمة الإدارات والأقسام */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            الهيكل التنظيمي ({departments.length} إدارة, {divisions.length} قسم)
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredDepartments.map((department) => {
            const departmentDivisions = getDepartmentDivisions(department.id);
            const isExpanded = expandedDepartments.includes(department.id);

            return (
              <div key={department.id} className="border-b border-gray-100 last:border-b-0">
                
                {/* صف الإدارة */}
                <div className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      
                      {/* زر التوسيع */}
                      <button
                        onClick={() => toggleDepartmentExpansion(department.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        )}
                      </button>

                      {/* أيقونة الإدارة */}
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>

                      {/* معلومات الإدارة */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                        <p className="text-gray-600 mb-2">{department.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>المدير: {department.head}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{department.employeeCount} موظف</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span>{departmentDivisions.length} قسم</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* إجراءات الإدارة */}
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="عرض">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditDepartment(department)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDepartment(department.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* الأقسام التابعة (تظهر عند التوسيع) */}
                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-100">
                    {departmentDivisions.length > 0 ? (
                      <div className="divide-y divide-gray-200">
                        {departmentDivisions.map((division) => (
                          <div key={division.id} className="p-4 pr-16 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <Building2 className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{division.name}</h4>
                                  <p className="text-sm text-gray-600">{division.description}</p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    <span>المدير: {division.head}</span>
                                    <span>•</span>
                                    <span>{division.employeeCount} موظف</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="عرض">
                                  <Eye className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleEditDivision(division)}
                                  className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                  title="تعديل"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteDivision(division.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                  title="حذف"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">لا توجد أقسام في هذه الإدارة</p>
                        <button 
                          onClick={() => {
                            setSelectedDepartment(department);
                            setShowAddDivisionModal(true);
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          إضافة قسم جديد
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* رسالة عدم وجود نتائج */}
        {filteredDepartments.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">لا توجد إدارات تطابق معايير البحث</p>
            <p className="text-sm mt-2">جرب تغيير كلمات البحث أو إضافة إدارة جديدة</p>
          </div>
        )}
      </div>

      {/* نموذج إضافة/تعديل الإدارة */}
      <DepartmentForm
        department={selectedDepartment}
        isOpen={showAddDepartmentModal}
        onClose={() => {
          setShowAddDepartmentModal(false);
          setSelectedDepartment(null);
        }}
        onSave={handleSaveDepartment}
      />

      {/* نموذج إضافة/تعديل القسم */}
      <DivisionForm
        division={selectedDivision}
        selectedDepartment={selectedDepartment}
        isOpen={showAddDivisionModal}
        onClose={() => {
          setShowAddDivisionModal(false);
          setSelectedDivision(null);
          setSelectedDepartment(null);
        }}
        onSave={handleSaveDivision}
      />
    </div>
  );
};

export default DepartmentList;