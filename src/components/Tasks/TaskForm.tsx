import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  User, 
  Building2, 
  AlertCircle,
  Target,
  FileText,
  Clock,
  Repeat,
  Tag,
  Link,
  CheckCircle
} from 'lucide-react';
import { Task, Employee, Department, Division } from '../../types';
import { databaseService } from '../../services/DatabaseService';
import { useApp } from '../../context/AppContext';

/**
 * واجهة خصائص نموذج المهمة المحسن
 */
interface TaskFormProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}

/**
 * مكون نموذج إضافة/تعديل المهمة المحسن
 * يوفر واجهة شاملة لإدارة بيانات المهام مع الميزات المتقدمة
 */
const TaskForm: React.FC<TaskFormProps> = ({ task, isOpen, onClose, onSave }) => {
  const { state } = useApp();

  // حالات النموذج الأساسية
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'متوسط',
    status: 'جديدة',
    department: '',
    division: '',
    assignedTo: [],
    completedBy: [],
    startDate: new Date(),
    endDate: new Date(),
    points: 0,
    isRecurring: false,
    recurringPattern: {
      frequency: 'weekly',
      interval: 1
    },
    estimatedHours: 0,
    tags: [],
    notes: ''
  });

  // بيانات مساعدة للقوائم المنسدلة
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * تحميل البيانات المساعدة عند فتح النموذج
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesData, departmentsData, divisionsData] = await Promise.all([
          databaseService.getAll<Employee>('employees'),
          databaseService.getAll<Department>('departments'),
          databaseService.getAll<Division>('divisions')
        ]);

        setEmployees(employeesData);
        setDepartments(departmentsData);
        setDivisions(divisionsData);
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  /**
   * تحديث النموذج عند تغيير المهمة المحددة
   */
  useEffect(() => {
    if (task) {
      // تحميل بيانات المهمة للتعديل
      setFormData({
        ...task,
        startDate: new Date(task.startDate),
        endDate: new Date(task.endDate)
      });
    } else {
      // إعادة تعيين النموذج للإضافة
      setFormData({
        title: '',
        description: '',
        priority: 'متوسط',
        status: 'جديدة',
        department: '',
        division: '',
        assignedTo: [],
        completedBy: [],
        startDate: new Date(),
        endDate: new Date(),
        points: 0,
        isRecurring: false,
        recurringPattern: {
          frequency: 'weekly',
          interval: 1
        },
        estimatedHours: 0,
        tags: [],
        notes: ''
      });
    }
    setErrors({});
  }, [task]);

  /**
   * فلترة الأقسام حسب الإدارة المختارة
   */
  useEffect(() => {
    if (formData.department) {
      const filtered = divisions.filter(div => div.departmentId === formData.department);
      setFilteredDivisions(filtered);
      
      // إعادة تعيين القسم إذا لم يعد متاحاً في الإدارة الجديدة
      if (formData.division && !filtered.find(div => div.id === formData.division)) {
        setFormData(prev => ({ ...prev, division: '' }));
      }
    } else {
      setFilteredDivisions([]);
    }
  }, [formData.department, divisions]);

  /**
   * فلترة الموظفين حسب الإدارة والقسم
   */
  useEffect(() => {
    let filtered = employees;
    
    if (formData.department) {
      filtered = filtered.filter(emp => emp.department === formData.department);
    }
    
    if (formData.division) {
      filtered = filtered.filter(emp => emp.division === formData.division);
    }
    
    setFilteredEmployees(filtered);
  }, [formData.department, formData.division, employees]);

  /**
   * دالة تحديث حقول النموذج
   * @param field اسم الحقل
   * @param value القيمة الجديدة
   */
  const handleInputChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // إزالة رسالة الخطأ عند تعديل الحقل
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * دالة إضافة/إزالة موظف من قائمة المسند إليهم
   * @param employeeId معرف الموظف
   */
  const toggleAssignedEmployee = (employeeId: string) => {
    const currentAssigned = formData.assignedTo || [];
    const isAssigned = currentAssigned.includes(employeeId);
    
    if (isAssigned) {
      // إزالة الموظف من القائمة
      handleInputChange('assignedTo', currentAssigned.filter(id => id !== employeeId));
    } else {
      // إضافة الموظف إلى القائمة
      handleInputChange('assignedTo', [...currentAssigned, employeeId]);
    }
  };

  /**
   * دالة إضافة/إزالة علامة
   */
  const toggleTag = (tag: string) => {
    const currentTags = formData.tags || [];
    const hasTag = currentTags.includes(tag);
    
    if (hasTag) {
      handleInputChange('tags', currentTags.filter(t => t !== tag));
    } else {
      handleInputChange('tags', [...currentTags, tag]);
    }
  };

  /**
   * دالة التحقق من صحة البيانات المدخلة
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'عنوان المهمة مطلوب';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'وصف المهمة مطلوب';
    }

    if (!formData.department) {
      newErrors.department = 'الإدارة مطلوبة';
    }

    if (!formData.assignedTo || formData.assignedTo.length === 0) {
      newErrors.assignedTo = 'يجب إسناد المهمة لموظف واحد على الأقل';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';
    }

    if (formData.points && formData.points < 0) {
      newErrors.points = 'النقاط يجب أن تكون رقماً موجباً';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * دالة حفظ المهمة بعد التحقق من صحة البيانات
   */
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('خطأ في حفظ المهمة:', error);
    } finally {
      setLoading(false);
    }
  };

  // عدم عرض النموذج إذا لم يكن في حالة مفتوح
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* رأس النموذج مع العنوان وزر الإغلاق */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* محتوى النموذج الرئيسي */}
        <div className="p-6 space-y-6">
          
          {/* الصف الأول: عنوان المهمة والأولوية */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* حقل عنوان المهمة */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                عنوان المهمة *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="أدخل عنوان المهمة"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* قائمة اختيار الأولوية */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                الأولوية
              </label>
              <select
                value={formData.priority || 'متوسط'}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="منخفض">منخفض</option>
                <option value="متوسط">متوسط</option>
                <option value="عالي">عالي</option>
                <option value="عاجل">عاجل</option>
              </select>
            </div>
          </div>

          {/* حقل وصف المهمة التفصيلي */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف المهمة *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="أدخل وصف تفصيلي للمهمة"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* الصف الثاني: اختيار الإدارة والقسم */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* قائمة اختيار الإدارة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1" />
                الإدارة *
              </label>
              <select
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">اختر الإدارة</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
            </div>

            {/* قائمة اختيار القسم (مفلترة حسب الإدارة) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القسم
              </label>
              <select
                value={formData.division || ''}
                onChange={(e) => handleInputChange('division', e.target.value)}
                disabled={!formData.department}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !formData.department ? 'bg-gray-100' : 'border-gray-300'
                }`}
              >
                <option value="">اختر القسم</option>
                {filteredDivisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* الصف الثالث: تواريخ المهمة والنقاط والساعات */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* حقل تاريخ بداية المهمة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                تاريخ البداية
              </label>
              <input
                type="date"
                value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* حقل تاريخ انتهاء المهمة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                تاريخ النهاية
              </label>
              <input
                type="date"
                value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('endDate', new Date(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>

            {/* حقل نقاط المهمة - معدل بناءً على الإنجاز */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="h-4 w-4 inline mr-1" />
                نقاط الإنجاز
              </label>
              <input
                type="number"
                min="0"
                value={formData.points || 0}
                onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.points ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.points && (
                <p className="text-red-500 text-sm mt-1">{errors.points}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                <span className="font-semibold">تقييم الجودة:</span> تؤثر النقاط على ترتيب الموظفين في لوحة الشرف عند تفعيل وزن صعوبة المهمة من الإعدادات، لكن التقييم الأساسي يعتمد على نسبة الإنجاز (المهام المكتملة ÷ المهام المسندة) × 100
              </p>
            </div>

            {/* حقل الساعات المقدرة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                الساعات المقدرة
              </label>
              <input
                type="number"
                min="0"
                value={formData.estimatedHours || 0}
                onChange={(e) => handleInputChange('estimatedHours', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* قسم اختيار الموظفين المسند إليهم المهمة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              الموظفون المسند إليهم *
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(employee => (
                  <label key={employee.id} className="flex items-center space-x-2 space-x-reverse mb-2">
                    <input
                      type="checkbox"
                      checked={formData.assignedTo?.includes(employee.id) || false}
                      onChange={() => toggleAssignedEmployee(employee.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {employee.name} - {employee.position}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-sm">لا توجد موظفين متاحين في هذا القسم</p>
              )}
            </div>
            {errors.assignedTo && (
              <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>
            )}
          </div>

          {/* قسم اختيار الموظفين المنجزين للمهمة */}
          {/* قسم اختيار الموظفين المنجزين للمهمة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CheckCircle className="h-4 w-4 inline mr-1" />
              الموظفون المنجزون
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(employee => (
                  <label key={employee.id} className="flex items-center space-x-2 space-x-reverse mb-2">
                    <input
                      type="checkbox"
                      checked={formData.completedBy?.includes(employee.id) || false}
                      onChange={() => {
                        const currentCompleted = formData.completedBy || [];
                        const isCompleted = currentCompleted.includes(employee.id);
                        if (isCompleted) {
                          handleInputChange('completedBy', currentCompleted.filter(id => id !== employee.id));
                        } else {
                          handleInputChange('completedBy', [...currentCompleted, employee.id]);
                        }
                      }}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">
                      {employee.name} - {employee.position}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-sm">لا توجد موظفين متاحين</p>
              )}
            </div>
          </div>

          {/* قسم المهام المتكررة */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring || false}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                <Repeat className="h-4 w-4 inline mr-1" />
                مهمة متكررة
              </label>
            </div>

            {formData.isRecurring && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التكرار</label>
                  <select
                    value={formData.recurringPattern?.frequency || 'weekly'}
                    onChange={(e) => handleInputChange('recurringPattern', {
                      ...formData.recurringPattern,
                      frequency: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">يومي</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="monthly">شهري</option>
                    <option value="yearly">سنوي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كل</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.recurringPattern?.interval || 1}
                    onChange={(e) => handleInputChange('recurringPattern', {
                      ...formData.recurringPattern,
                      interval: parseInt(e.target.value) || 1
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={formData.recurringPattern?.endDate ? formData.recurringPattern.endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleInputChange('recurringPattern', {
                      ...formData.recurringPattern,
                      endDate: e.target.value ? new Date(e.target.value) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* قسم العلامات والملاحظات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* العلامات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 inline mr-1" />
                العلامات
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['مهم', 'عاجل', 'مشروع', 'صيانة', 'تطوير'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.tags?.includes(tag)
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* الملاحظات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
          </div>

        </div>

        {/* أزرار الإجراءات في أسفل النموذج */}
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
            {loading ? 'جاري الحفظ...' : 'حفظ المهمة'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TaskForm;