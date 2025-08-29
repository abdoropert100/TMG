/**
 * مكون إدارة المستخدمين
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  User,
  Shield,
  Key,
  Save,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Users,
  Lock
} from 'lucide-react';
import { databaseService } from '../../services/DatabaseService';
import Modal from '../UI/Modal';
import { useApp } from '../../context/AppContext';

// واجهة بيانات المستخدم
interface SystemUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'مدير النظام' | 'مدير إدارة' | 'رئيس قسم' | 'مهندس' | 'موظف';
  department: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

/**
 * مكون إدارة المستخدمين
 */
const UserManagement: React.FC = () => {
  const { state } = useApp();
  
  // حالات المكون
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  // حالات النموذج
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'موظف' as SystemUser['role'],
    department: '',
    permissions: ['read'],
    isActive: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // الأدوار المتاحة مع الصلاحيات الافتراضية
  const availableRoles = [
    { 
      key: 'مدير النظام', 
      label: 'مدير النظام', 
      permissions: ['admin', 'read', 'write', 'delete', 'export', 'import', 'settings', 'users'],
      color: 'bg-red-100 text-red-800'
    },
    { 
      key: 'مدير إدارة', 
      label: 'مدير إدارة', 
      permissions: ['read', 'write', 'export', 'manage_department'],
      color: 'bg-blue-100 text-blue-800'
    },
    { 
      key: 'رئيس قسم', 
      label: 'رئيس قسم', 
      permissions: ['read', 'write', 'export'],
      color: 'bg-green-100 text-green-800'
    },
    { 
      key: 'مهندس', 
      label: 'مهندس', 
      permissions: ['read', 'write'],
      color: 'bg-purple-100 text-purple-800'
    },
    { 
      key: 'موظف', 
      label: 'موظف', 
      permissions: ['read'],
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  // الصلاحيات المتاحة
  const availablePermissions = [
    { key: 'read', label: 'مشاهدة', description: 'عرض البيانات' },
    { key: 'write', label: 'إضافة وتعديل', description: 'إنشاء وتعديل البيانات' },
    { key: 'delete', label: 'حذف', description: 'حذف البيانات' },
    { key: 'export', label: 'تصدير', description: 'تصدير البيانات' },
    { key: 'import', label: 'استيراد', description: 'استيراد البيانات' },
    { key: 'settings', label: 'الإعدادات', description: 'تعديل إعدادات النظام' },
    { key: 'users', label: 'إدارة المستخدمين', description: 'إدارة حسابات المستخدمين' },
    { key: 'admin', label: 'إدارة النظام', description: 'صلاحيات كاملة' }
  ];

  // تحميل المستخدمين عند تحميل المكون
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * دالة تحميل المستخدمين
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // تهيئة المستخدمين الافتراضيين إذا لم يكونوا موجودين
      await initializeDefaultUsers();
      
      const usersData = await databaseService.getAll<SystemUser>('system_users');
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError('خطأ في تحميل المستخدمين');
      console.error('خطأ في تحميل المستخدمين:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * تهيئة المستخدمين الافتراضيين
   */
  const initializeDefaultUsers = async () => {
    try {
      const existingUsers = await databaseService.getAll('system_users');
      if (existingUsers.length > 0) return;

      const defaultUsers: SystemUser[] = [
        {
          id: 'admin-001',
          username: 'admin',
          password: btoa('admin123'),
          name: 'مدير النظام',
          role: 'مدير النظام',
          department: 'إدارة تقنية المعلومات',
          permissions: ['admin', 'read', 'write', 'delete', 'export', 'import', 'settings', 'users'],
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'manager-001',
          username: 'manager',
          password: btoa('manager123'),
          name: 'مدير الإدارة الهندسية',
          role: 'مدير إدارة',
          department: 'الإدارة الهندسية',
          permissions: ['read', 'write', 'export', 'manage_department'],
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'engineer-001',
          username: 'engineer',
          password: btoa('engineer123'),
          name: 'مهندس أول',
          role: 'مهندس',
          department: 'الإدارة الهندسية',
          permissions: ['read', 'write'],
          isActive: true,
          createdAt: new Date()
        },
        {
          id: 'employee-001',
          username: 'employee',
          password: btoa('employee123'),
          name: 'موظف عادي',
          role: 'موظف',
          department: 'الشؤون الإدارية',
          permissions: ['read'],
          isActive: true,
          createdAt: new Date()
        }
      ];

      for (const user of defaultUsers) {
        await databaseService.add('system_users', user);
      }
    } catch (error) {
      console.error('خطأ في تهيئة المستخدمين:', error);
    }
  };

  /**
   * دالة فتح نموذج إضافة مستخدم جديد
   */
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'موظف',
      department: '',
      permissions: ['read'],
      isActive: true
    });
    setErrors({});
    setShowUserForm(true);
  };

  /**
   * دالة فتح نموذج تعديل مستخدم
   */
  const handleEditUser = (user: SystemUser) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      name: user.name,
      role: user.role,
      department: user.department,
      permissions: user.permissions,
      isActive: user.isActive
    });
    setErrors({});
    setShowUserForm(true);
  };

  /**
   * دالة التحقق من صحة البيانات
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب';
    }

    if (!selectedUser && !formData.password.trim()) {
      newErrors.password = 'كلمة المرور مطلوبة';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'اسم المستخدم مطلوب';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'الإدارة مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * دالة حفظ المستخدم
   */
  const handleSaveUser = async () => {
    if (!validateForm()) return;

    try {
      if (selectedUser) {
        // تحديث مستخدم موجود
        const updates: any = {
          username: formData.username,
          name: formData.name,
          role: formData.role,
          department: formData.department,
          permissions: formData.permissions,
          isActive: formData.isActive
        };

        if (formData.password) {
          updates.password = btoa(formData.password);
        }

        await databaseService.update('system_users', selectedUser.id, updates);
        setSuccess('تم تحديث المستخدم بنجاح');
      } else {
        // إضافة مستخدم جديد
        const newUser: SystemUser = {
          id: `user-${Date.now()}`,
          username: formData.username,
          password: btoa(formData.password),
          name: formData.name,
          role: formData.role,
          department: formData.department,
          permissions: formData.permissions,
          isActive: formData.isActive,
          createdAt: new Date()
        };

        await databaseService.add('system_users', newUser);
        setSuccess('تم إضافة المستخدم بنجاح');
      }

      await loadUsers();
      setShowUserForm(false);
      setSelectedUser(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('خطأ في حفظ المستخدم');
      console.error('خطأ في حفظ المستخدم:', error);
    }
  };

  /**
   * دالة حذف المستخدم
   */
  const handleDeleteUser = async (userId: string) => {
    if (userId === 'admin-001') {
      setError('لا يمكن حذف مدير النظام الرئيسي');
      return;
    }

    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await databaseService.delete('system_users', userId);
        await loadUsers();
        setSuccess('تم حذف المستخدم بنجاح');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setError('خطأ في حذف المستخدم');
        console.error('خطأ في حذف المستخدم:', error);
      }
    }
  };

  /**
   * دالة تبديل الصلاحية
   */
  const togglePermission = (permission: string) => {
    const currentPermissions = formData.permissions;
    const hasPermission = currentPermissions.includes(permission);

    if (hasPermission) {
      setFormData(prev => ({
        ...prev,
        permissions: currentPermissions.filter(p => p !== permission)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: [...currentPermissions, permission]
      }));
    }
  };

  /**
   * دالة تحديث الصلاحيات حسب الدور
   */
  const updatePermissionsByRole = (role: SystemUser['role']) => {
    const roleConfig = availableRoles.find(r => r.key === role);
    if (roleConfig) {
      setFormData(prev => ({
        ...prev,
        role,
        permissions: roleConfig.permissions
      }));
    }
  };

  /**
   * دالة الحصول على لون الدور
   */
  const getRoleColor = (role: string) => {
    const roleConfig = availableRoles.find(r => r.key === role);
    return roleConfig?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل المستخدمين...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* رسائل النجاح والخطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="mr-auto text-red-600">×</button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700">{success}</span>
          <button onClick={() => setSuccess(null)} className="mr-auto text-green-600">×</button>
        </div>
      )}

      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">إدارة المستخدمين</h2>
          <p className="text-gray-600">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </button>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            إضافة مستخدم
          </button>
        </div>
      </div>

      {/* إحصائيات المستخدمين */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">نشط</p>
              <p className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مديري النظام</p>
              <p className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'مدير النظام').length}</p>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مديري الإدارات</p>
              <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'مدير إدارة').length}</p>
            </div>
            <User className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">موظفين</p>
              <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'موظف' || u.role === 'مهندس').length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* قائمة المستخدمين */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  اسم المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإدارة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الصلاحيات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر دخول
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.slice(0, 3).map(permission => (
                        <span key={permission} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {availablePermissions.find(p => p.key === permission)?.label || permission}
                        </span>
                      ))}
                      {user.permissions.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{user.permissions.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل دخول'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.id !== 'admin-001' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* نموذج إضافة/تعديل المستخدم */}
      <Modal
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        title={selectedUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
        size="lg"
      >
        <div className="p-6 space-y-6">
          
          {/* معلومات المستخدم الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* اسم المستخدم */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستخدم *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* الاسم الكامل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="الاسم الكامل"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* كلمة المرور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور {!selectedUser && '*'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={selectedUser ? 'اتركها فارغة للاحتفاظ بالحالية' : 'كلمة المرور'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* الدور والإدارة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* الدور */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الدور *
              </label>
              <select
                value={formData.role}
                onChange={(e) => updatePermissionsByRole(e.target.value as SystemUser['role'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableRoles.map(role => (
                  <option key={role.key} value={role.key}>{role.label}</option>
                ))}
              </select>
            </div>

            {/* الإدارة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الإدارة *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">اختر الإدارة</option>
                {state.departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
                <option value="إدارة تقنية المعلومات">إدارة تقنية المعلومات</option>
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
            </div>
          </div>

          {/* الصلاحيات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              الصلاحيات
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availablePermissions.map(permission => (
                <label key={permission.key} className="flex items-start space-x-2 space-x-reverse p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.key)}
                    onChange={() => togglePermission(permission.key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{permission.label}</span>
                    <p className="text-xs text-gray-500">{permission.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* الحالة */}
          <div>
            <label className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">حساب نشط</span>
            </label>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowUserForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveUser}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              حفظ
            </button>
          </div>

        </div>
      </Modal>

    </div>
  );
};

export default UserManagement;