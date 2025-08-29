/**
 * مكون إدارة المستخدمين
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Edit, Trash2, Eye, Shield, Key, Lock, Unlock,
  Search, Filter, Download, Upload, RefreshCw, AlertTriangle,
  CheckCircle, XCircle, Clock, UserPlus, Settings
} from 'lucide-react';
import { SystemUser, UserRole } from '../../types/auth';
import { authService } from '../../services/AuthService';
import { databaseService } from '../../services/DatabaseService';
import UserForm from './UserForm';
import PermissionsManager from './PermissionsManager';

const UserManagement: React.FC = () => {
  // حالات المكون
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // حالات النوافذ المنبثقة
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPermissionsManager, setShowPermissionsManager] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  // حالات الفلترة
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    department: '',
    lastLoginFrom: '',
    lastLoginTo: ''
  });

  // تحميل البيانات
  useEffect(() => {
    loadUsers();
  }, []);

  // تطبيق الفلاتر
  useEffect(() => {
    applyFilters();
  }, [users, filters]);

  /**
   * تحميل المستخدمين
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
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
   * تطبيق الفلاتر
   */
  const applyFilters = () => {
    let filtered = [...users];

    // فلتر البحث
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    // فلتر الدور
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // فلتر الحالة
    if (filters.status) {
      if (filters.status === 'active') {
        filtered = filtered.filter(user => user.isActive);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(user => !user.isActive);
      } else if (filters.status === 'locked') {
        filtered = filtered.filter(user => user.lockedUntil && user.lockedUntil > new Date());
      }
    }

    setFilteredUsers(filtered);
  };

  /**
   * إنشاء مستخدم جديد
   */
  const handleCreateUser = async (userData: Partial<SystemUser>) => {
    try {
      await authService.createUser(userData, 'current-user');
      await loadUsers();
      setShowUserForm(false);
      setSuccess('تم إنشاء المستخدم بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('خطأ في إنشاء المستخدم');
      console.error('خطأ في إنشاء المستخدم:', error);
    }
  };

  /**
   * تحديث مستخدم
   */
  const handleUpdateUser = async (userId: string, userData: Partial<SystemUser>) => {
    try {
      await databaseService.update('system_users', userId, {
        ...userData,
        updatedAt: new Date()
      });
      await loadUsers();
      setShowUserForm(false);
      setSelectedUser(null);
      setSuccess('تم تحديث المستخدم بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('خطأ في تحديث المستخدم');
      console.error('خطأ في تحديث المستخدم:', error);
    }
  };

  /**
   * تفعيل/تعطيل مستخدم
   */
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await databaseService.update('system_users', userId, {
        isActive: !currentStatus,
        updatedAt: new Date()
      });
      await loadUsers();
      setSuccess(`تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} المستخدم بنجاح`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('خطأ في تغيير حالة المستخدم');
      console.error('خطأ في تغيير حالة المستخدم:', error);
    }
  };

  /**
   * إعادة تعيين كلمة المرور
   */
  const handleResetPassword = async (userId: string) => {
    if (confirm('هل أنت متأكد من إعادة تعيين كلمة المرور؟')) {
      try {
        await databaseService.update('system_users', userId, {
          mustChangePassword: true,
          loginAttempts: 0,
          lockedUntil: null,
          updatedAt: new Date()
        });
        setSuccess('تم إعادة تعيين كلمة المرور بنجاح');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setError('خطأ في إعادة تعيين كلمة المرور');
        console.error('خطأ في إعادة تعيين كلمة المرور:', error);
      }
    }
  };

  /**
   * حذف مستخدم
   */
  const handleDeleteUser = async (userId: string) => {
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
   * الحصول على لون الدور
   */
  const getRoleColor = (role: UserRole): string => {
    const colors = {
      'ادمن': 'bg-red-100 text-red-800',
      'رئيس_المصلحة': 'bg-purple-100 text-purple-800',
      'رئيس_قطاع': 'bg-indigo-100 text-indigo-800',
      'رئيس_إدارة_مركزية': 'bg-blue-100 text-blue-800',
      'مدير_إدارة_عامة': 'bg-cyan-100 text-cyan-800',
      'مدير_إدارة': 'bg-green-100 text-green-800',
      'مهندس': 'bg-yellow-100 text-yellow-800',
      'موظف': 'bg-gray-100 text-gray-800',
      'مشرف': 'bg-orange-100 text-orange-800',
      'فني': 'bg-pink-100 text-pink-800'
    };

    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  /**
   * الحصول على أيقونة حالة المستخدم
   */
  const getUserStatusIcon = (user: SystemUser) => {
    if (!user.isActive) return <XCircle className="h-5 w-5 text-red-500" />;
    if (user.lockedUntil && user.lockedUntil > new Date()) return <Lock className="h-5 w-5 text-orange-500" />;
    if (user.lastLogin && (Date.now() - user.lastLogin.getTime()) < 24 * 60 * 60 * 1000) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-500" />;
  };

  // حساب الإحصائيات
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    locked: users.filter(u => u.lockedUntil && u.lockedUntil > new Date()).length,
    admins: users.filter(u => u.role === 'ادمن').length
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
          <button onClick={() => setError(null)} className="mr-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700">{success}</span>
          <button onClick={() => setSuccess(null)} className="mr-auto text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-gray-600">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPermissionsManager(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Shield className="h-4 w-4" />
            إدارة الصلاحيات
          </button>
          <button
            onClick={() => {
              setSelectedUser(null);
              setShowUserForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            إضافة مستخدم جديد
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
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
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">معطل</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مقفل</p>
              <p className="text-2xl font-bold text-orange-600">{stats.locked}</p>
            </div>
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">مديري النظام</p>
              <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
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
                placeholder="البحث في المستخدمين..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الأدوار</option>
              <option value="ادمن">مدير النظام</option>
              <option value="رئيس_المصلحة">رئيس المصلحة</option>
              <option value="رئيس_قطاع">رئيس قطاع</option>
              <option value="مدير_إدارة">مدير إدارة</option>
              <option value="مهندس">مهندس</option>
              <option value="موظف">موظف</option>
              <option value="فني">فني</option>
            </select>
          </div>

          <div className="min-w-[150px]">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">معطل</option>
              <option value="locked">مقفل</option>
            </select>
          </div>

          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </button>
        </div>
      </div>

      {/* جدول المستخدمين */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            المستخدمين ({filteredUsers.length})
          </h2>
        </div>

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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.fullName.charAt(0)}
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getUserStatusIcon(user)}
                      <span className="text-sm text-gray-900">
                        {!user.isActive ? 'معطل' : 
                         user.lockedUntil && user.lockedUntil > new Date() ? 'مقفل' : 'نشط'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-EG') : 'لم يدخل بعد'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.isActive ? 'تعطيل' : 'تفعيل'}
                      >
                        {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-orange-600 hover:text-orange-900"
                        title="إعادة تعيين كلمة المرور"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">لا توجد مستخدمين تطابق معايير البحث</p>
            <p className="text-sm mt-2">جرب تغيير الفلاتر أو إضافة مستخدم جديد</p>
          </div>
        )}
      </div>

      {/* نموذج إضافة/تعديل المستخدم */}
      <UserForm
        user={selectedUser}
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setSelectedUser(null);
        }}
        onSave={selectedUser ? 
          (userData) => handleUpdateUser(selectedUser.id, userData) : 
          handleCreateUser
        }
      />

      {/* مدير الصلاحيات */}
      <PermissionsManager
        isOpen={showPermissionsManager}
        onClose={() => setShowPermissionsManager(false)}
      />

    </div>
  );
};

export default UserManagement;