/**
 * نموذج إضافة/تعديل المستخدم
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Shield, Building2, Eye, EyeOff } from 'lucide-react';
import { SystemUser, UserRole } from '../../types/auth';
import { databaseService } from '../../services/DatabaseService';

interface UserFormProps {
  user?: SystemUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<SystemUser>) => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<SystemUser>>({
    username: '',
    email: '',
    phone: '',
    fullName: '',
    role: 'موظف',
    isActive: true,
    mustChangePassword: true,
    twoFactorEnabled: false,
    preferredLanguage: 'ar',
    theme: 'light'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // تحميل البيانات المساعدة
  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesData, departmentsData] = await Promise.all([
          databaseService.getAll('employees'),
          databaseService.getAll('departments')
        ]);
        setEmployees(employeesData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // تحديث النموذج عند تغيير المستخدم
  useEffect(() => {
    if (user) {
      setFormData(user);
      setPassword('');
      setConfirmPassword('');
    } else {
      setFormData({
        username: '',
        email: '',
        phone: '',
        fullName: '',
        role: 'موظف',
        isActive: true,
        mustChangePassword: true,
        twoFactorEnabled: false,
        preferredLanguage: 'ar',
        theme: 'light'
      });
      setPassword('');
      setConfirmPassword('');
    }
    setErrors({});
  }, [user]);

  // تحديث حقول النموذج
  const handleInputChange = (field: keyof SystemUser, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username?.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب';
    }

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!user && !password) {
      newErrors.password = 'كلمة المرور مطلوبة للمستخدم الجديد';
    }

    if (password && password !== confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    if (password && password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // حفظ المستخدم
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData = { ...formData };
      if (password) {
        // في التطبيق الحقيقي، يجب تشفير كلمة المرور
        userData.passwordHash = password; // مؤقت للتجربة
      }
      
      await onSave(userData);
      onClose();
    } catch (error) {
      console.error('خطأ في حفظ المستخدم:', error);
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
            {user ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* محتوى النموذج */}
        <div className="p-6 space-y-6">
          
          {/* الصف الأول: المعلومات الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                الاسم الكامل *
              </label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="الاسم الكامل"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم *
              </label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="اسم المستخدم"
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>
          </div>

          {/* الصف الثاني: الاتصال */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                البريد الإلكتروني *
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
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+201234567890"
              />
            </div>
          </div>

          {/* الصف الثالث: الدور والصلاحيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="h-4 w-4 inline mr-1" />
                الدور *
              </label>
              <select
                value={formData.role || 'موظف'}
                onChange={(e) => handleInputChange('role', e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="موظف">موظف</option>
                <option value="فني">فني</option>
                <option value="مهندس">مهندس</option>
                <option value="مشرف">مشرف</option>
                <option value="مدير_إدارة">مدير إدارة</option>
                <option value="مدير_إدارة_عامة">مدير إدارة عامة</option>
                <option value="رئيس_إدارة_مركزية">رئيس إدارة مركزية</option>
                <option value="رئيس_قطاع">رئيس قطاع</option>
                <option value="رئيس_المصلحة">رئيس المصلحة</option>
                <option value="ادمن">مدير النظام</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ربط بموظف
              </label>
              <select
                value={formData.employeeId || ''}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">اختر موظف (اختياري)</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                ))}
              </select>
            </div>
          </div>

          {/* كلمات المرور */}
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تأكيد كلمة المرور *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="تأكيد كلمة المرور"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {/* الإعدادات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive || false}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="mr-2 text-sm text-gray-700">
                حساب نشط
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="mustChangePassword"
                checked={formData.mustChangePassword || false}
                onChange={(e) => handleInputChange('mustChangePassword', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="mustChangePassword" className="mr-2 text-sm text-gray-700">
                يجب تغيير كلمة المرور
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactorEnabled"
                checked={formData.twoFactorEnabled || false}
                onChange={(e) => handleInputChange('twoFactorEnabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="twoFactorEnabled" className="mr-2 text-sm text-gray-700">
                المصادقة الثنائية
              </label>
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
            {loading ? 'جاري الحفظ...' : 'حفظ المستخدم'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserForm;