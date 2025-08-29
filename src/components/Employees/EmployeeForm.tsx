import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin,
  Camera,
  Upload,
  Calendar,
  Shield
} from 'lucide-react';
import { Employee, Department, Division } from '../../types';
import { databaseService } from '../../services/DatabaseService';

// واجهة خصائص نموذج الموظف
interface EmployeeFormProps {
  employee?: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Partial<Employee>) => void;
}

// مكون نموذج إضافة/تعديل الموظف
const EmployeeForm: React.FC<EmployeeFormProps> = ({ 
  employee, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  // حالات النموذج
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    employeeNumber: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    division: '',
    position: '',
    points: 0,
    status: 'نشط',
    permissions: ['مشاهدة'],
    hireDate: new Date(),
    birthDate: new Date(),
    nationalId: ''
  });

  // بيانات مساعدة
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // تحميل البيانات المساعدة
  useEffect(() => {
    const loadData = async () => {
      try {
        const [departmentsData, divisionsData] = await Promise.all([
          databaseService.getAll<Department>('departments'),
          databaseService.getAll<Division>('divisions')
        ]);

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

  // تحديث النموذج عند تغيير الموظف
  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        hireDate: employee.hireDate ? new Date(employee.hireDate) : new Date(),
        birthDate: employee.birthDate ? new Date(employee.birthDate) : new Date()
      });
      setAvatarPreview(employee.avatar || '');
    } else {
      // توليد رقم وظيفي جديد
      const newEmployeeNumber = `EMP${String(Date.now()).slice(-6)}`;
      setFormData({
        name: '',
        employeeNumber: newEmployeeNumber,
        email: '',
        phone: '',
        address: '',
        department: '',
        division: '',
        position: '',
        points: 0,
        status: 'نشط',
        permissions: ['مشاهدة'],
        hireDate: new Date(),
        birthDate: new Date(),
        nationalId: ''
      });
      setAvatarPreview('');
    }
    setErrors({});
  }, [employee]);

  // فلترة الأقسام حسب الإدارة المختارة
  useEffect(() => {
    if (formData.department) {
      const filtered = divisions.filter(div => div.departmentId === formData.department);
      setFilteredDivisions(filtered);
      
      if (formData.division && !filtered.find(div => div.id === formData.division)) {
        setFormData(prev => ({ ...prev, division: '' }));
      }
    } else {
      setFilteredDivisions([]);
    }
  }, [formData.department, divisions]);

  // دالة تحديث حقول النموذج
  const handleInputChange = (field: keyof Employee, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // دالة رفع الصورة الشخصية
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        handleInputChange('avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // دالة إدارة الصلاحيات
  const togglePermission = (permission: string) => {
    const currentPermissions = formData.permissions || [];
    const hasPermission = currentPermissions.includes(permission);
    
    if (hasPermission) {
      handleInputChange('permissions', currentPermissions.filter(p => p !== permission));
    } else {
      handleInputChange('permissions', [...currentPermissions, permission]);
    }
  };

  // دالة التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'اسم الموظف مطلوب';
    }

    if (!formData.employeeNumber?.trim()) {
      newErrors.employeeNumber = 'الرقم الوظيفي مطلوب';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    if (!formData.department) {
      newErrors.department = 'الإدارة مطلوبة';
    }

    if (!formData.position?.trim()) {
      newErrors.position = 'المنصب مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // دالة حفظ الموظف
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('خطأ في حفظ الموظف:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* رأس النموذج */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {employee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
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
          
          {/* الصورة الشخصية */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="الصورة الشخصية" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">الصورة الشخصية</h3>
              <p className="text-sm text-gray-600">انقر على الكاميرا لرفع صورة جديدة</p>
            </div>
          </div>

          {/* الصف الأول: الاسم والرقم الوظيفي */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* اسم الموظف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                اسم الموظف *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="الاسم الكامل"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* الرقم الوظيفي */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الرقم الوظيفي *
              </label>
              <input
                type="text"
                value={formData.employeeNumber || ''}
                onChange={(e) => handleInputChange('employeeNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.employeeNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="EMP001"
              />
              {errors.employeeNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.employeeNumber}</p>
              )}
            </div>
          </div>

          {/* الصف الثاني: البريد والهاتف */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="example@irrigation.gov.eg"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="01234567890"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* العنوان */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              العنوان
            </label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="العنوان الكامل"
            />
          </div>

          {/* الصف الثالث: الإدارة والقسم والمنصب */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* الإدارة */}
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

            {/* القسم */}
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

            {/* المنصب */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المنصب *
              </label>
              <input
                type="text"
                value={formData.position || ''}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.position ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="المنصب الوظيفي"
              />
              {errors.position && (
                <p className="text-red-500 text-sm mt-1">{errors.position}</p>
              )}
            </div>
          </div>

          {/* الصف الرابع: التواريخ والرقم القومي */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* تاريخ التعيين */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                تاريخ التعيين
              </label>
              <input
                type="date"
                value={formData.hireDate ? formData.hireDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('hireDate', new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* تاريخ الميلاد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الميلاد
              </label>
              <input
                type="date"
                value={formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleInputChange('birthDate', new Date(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* الرقم القومي */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الرقم القومي
              </label>
              <input
                type="text"
                value={formData.nationalId || ''}
                onChange={(e) => handleInputChange('nationalId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="14 رقم"
                maxLength={14}
              />
            </div>
          </div>

          {/* الصف الخامس: النقاط والحالة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* النقاط */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النقاط الحالية
              </label>
              <input
                type="number"
                min="0"
                value={formData.points || 0}
                onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>

            {/* الحالة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <select
                value={formData.status || 'نشط'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="نشط">نشط</option>
                <option value="معطل">معطل</option>
                <option value="إجازة">إجازة</option>
              </select>
            </div>
          </div>

          {/* الصلاحيات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Shield className="h-4 w-4 inline mr-1" />
              الصلاحيات
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['مشاهدة', 'إضافة', 'تعديل', 'حذف', 'تصدير', 'استيراد', 'طباعة', 'إدارة'].map(permission => (
                <label key={permission} className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    checked={formData.permissions?.includes(permission) || false}
                    onChange={() => togglePermission(permission)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{permission}</span>
                </label>
              ))}
            </div>
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
            {loading ? 'جاري الحفظ...' : 'حفظ الموظف'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmployeeForm;