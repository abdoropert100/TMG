import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Building2, 
  User, 
  FileText
} from 'lucide-react';
import { Division, Department, Employee } from '../../types';
import { databaseService } from '../../services/DatabaseService';

// واجهة خصائص نموذج القسم
interface DivisionFormProps {
  division?: Division | null;
  selectedDepartment?: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (division: Partial<Division>) => void;
}

// مكون نموذج إضافة/تعديل القسم
const DivisionForm: React.FC<DivisionFormProps> = ({ 
  division, 
  selectedDepartment,
  isOpen, 
  onClose, 
  onSave 
}) => {
  // حالات النموذج
  const [formData, setFormData] = useState<Partial<Division>>({
    name: '',
    description: '',
    departmentId: '',
    head: '',
    employeeCount: 0
  });

  // بيانات مساعدة
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // تحميل البيانات المساعدة
  useEffect(() => {
    const loadData = async () => {
      try {
        const [departmentsData, employeesData] = await Promise.all([
          databaseService.getAll<Department>('departments'),
          databaseService.getAll<Employee>('employees')
        ]);

        setDepartments(departmentsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // تحديث النموذج عند تغيير القسم أو الإدارة المختارة
  useEffect(() => {
    if (division) {
      setFormData(division);
    } else {
      setFormData({
        name: '',
        description: '',
        departmentId: selectedDepartment?.id || '',
        head: '',
        employeeCount: 0
      });
    }
    setErrors({});
  }, [division, selectedDepartment]);

  // دالة تحديث حقول النموذج
  const handleInputChange = (field: keyof Division, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // دالة التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'اسم القسم مطلوب';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'وصف القسم مطلوب';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'الإدارة التابعة مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // دالة حفظ القسم
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('خطأ في حفظ القسم:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        
        {/* رأس النموذج */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {division ? 'تعديل القسم' : 'إضافة قسم جديد'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* محتوى النموذج */}
        <div className="p-6 space-y-6">
          
          {/* اسم القسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              اسم القسم *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="اسم القسم"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* وصف القسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              وصف القسم *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="وصف مختصر لمهام ونشاطات القسم"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* الإدارة التابعة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              الإدارة التابعة *
            </label>
            <select
              value={formData.departmentId || ''}
              onChange={(e) => handleInputChange('departmentId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.departmentId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">اختر الإدارة</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="text-red-500 text-sm mt-1">{errors.departmentId}</p>
            )}
          </div>

          {/* رئيس القسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              رئيس القسم
            </label>
            <select
              value={formData.head || ''}
              onChange={(e) => handleInputChange('head', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">اختر رئيس القسم</option>
              {employees
                .filter(emp => emp.department === formData.departmentId)
                .map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
              ))}
            </select>
          </div>

        </div>

        {/* أزرار الإجراءات */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'جاري الحفظ...' : 'حفظ القسم'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DivisionForm;