/**
 * مدير الصلاحيات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { X, Shield, Save, Plus, Edit, Trash2 } from 'lucide-react';
import { Permission, UserRole } from '../../types/auth';
import { databaseService } from '../../services/DatabaseService';

interface PermissionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PermissionsManager: React.FC<PermissionsManagerProps> = ({ isOpen, onClose }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<{ [role: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'permissions' | 'roles'>('permissions');

  // تحميل البيانات
  useEffect(() => {
    if (isOpen) {
      loadPermissions();
      loadRolePermissions();
    }
  }, [isOpen]);

  const loadPermissions = async () => {
    try {
      // تحميل الصلاحيات من قاعدة البيانات أو إنشاء افتراضية
      const defaultPermissions: Permission[] = [
        // صلاحيات المهام
        { id: 'tasks_view', name: 'عرض المهام', description: 'عرض قائمة المهام', module: 'tasks', action: 'view' },
        { id: 'tasks_create', name: 'إنشاء المهام', description: 'إنشاء مهام جديدة', module: 'tasks', action: 'create' },
        { id: 'tasks_edit', name: 'تعديل المهام', description: 'تعديل المهام الموجودة', module: 'tasks', action: 'edit' },
        { id: 'tasks_delete', name: 'حذف المهام', description: 'حذف المهام', module: 'tasks', action: 'delete' },
        { id: 'tasks_transfer', name: 'تحويل المهام', description: 'تحويل المهام بين الأقسام', module: 'tasks', action: 'transfer' },
        
        // صلاحيات المراسلات
        { id: 'correspondence_view', name: 'عرض المراسلات', description: 'عرض المراسلات', module: 'correspondence', action: 'view' },
        { id: 'correspondence_create', name: 'إنشاء المراسلات', description: 'إنشاء مراسلات جديدة', module: 'correspondence', action: 'create' },
        { id: 'correspondence_edit', name: 'تعديل المراسلات', description: 'تعديل المراسلات', module: 'correspondence', action: 'edit' },
        { id: 'correspondence_approve', name: 'اعتماد المراسلات', description: 'اعتماد المراسلات الصادرة', module: 'correspondence', action: 'approve' },
        
        // صلاحيات الموظفين
        { id: 'employees_view', name: 'عرض الموظفين', description: 'عرض قائمة الموظفين', module: 'employees', action: 'view' },
        { id: 'employees_create', name: 'إضافة الموظفين', description: 'إضافة موظفين جدد', module: 'employees', action: 'create' },
        { id: 'employees_edit', name: 'تعديل الموظفين', description: 'تعديل بيانات الموظفين', module: 'employees', action: 'edit' },
        { id: 'employees_delete', name: 'حذف الموظفين', description: 'حذف الموظفين', module: 'employees', action: 'delete' },
        
        // صلاحيات الأقسام
        { id: 'departments_view', name: 'عرض الأقسام', description: 'عرض الهيكل التنظيمي', module: 'departments', action: 'view' },
        { id: 'departments_create', name: 'إنشاء الأقسام', description: 'إنشاء أقسام وإدارات جديدة', module: 'departments', action: 'create' },
        { id: 'departments_edit', name: 'تعديل الأقسام', description: 'تعديل الأقسام والإدارات', module: 'departments', action: 'edit' },
        
        // صلاحيات التقارير
        { id: 'reports_view', name: 'عرض التقارير', description: 'عرض التقارير', module: 'reports', action: 'view' },
        { id: 'reports_export', name: 'تصدير التقارير', description: 'تصدير التقارير', module: 'reports', action: 'export' },
        { id: 'reports_print', name: 'طباعة التقارير', description: 'طباعة التقارير', module: 'reports', action: 'print' },
        
        // صلاحيات النظام
        { id: 'system_settings', name: 'إعدادات النظام', description: 'الوصول لإعدادات النظام', module: 'system', action: 'edit' },
        { id: 'system_users', name: 'إدارة المستخدمين', description: 'إدارة حسابات المستخدمين', module: 'system', action: 'edit' },
        { id: 'system_backup', name: 'النسخ الاحتياطي', description: 'إنشاء واستعادة النسخ الاحتياطية', module: 'system', action: 'edit' }
      ];

      setPermissions(defaultPermissions);
    } catch (error) {
      console.error('خطأ في تحميل الصلاحيات:', error);
    }
  };

  const loadRolePermissions = async () => {
    try {
      // تحميل صلاحيات الأدوار من الإعدادات
      const settings = await databaseService.getSettings();
      const rolePerms = settings?.rolePermissions || {};
      setRolePermissions(rolePerms);
    } catch (error) {
      console.error('خطأ في تحميل صلاحيات الأدوار:', error);
    }
  };

  const saveRolePermissions = async () => {
    try {
      setLoading(true);
      const settings = await databaseService.getSettings() || {};
      await databaseService.saveSettings({
        ...settings,
        rolePermissions: rolePermissions
      });
      setLoading(false);
      alert('تم حفظ الصلاحيات بنجاح');
    } catch (error) {
      console.error('خطأ في حفظ الصلاحيات:', error);
      setLoading(false);
    }
  };

  const toggleRolePermission = (role: string, permissionId: string) => {
    setRolePermissions(prev => {
      const rolePerms = prev[role] || [];
      const hasPermission = rolePerms.includes(permissionId);
      
      return {
        ...prev,
        [role]: hasPermission 
          ? rolePerms.filter(p => p !== permissionId)
          : [...rolePerms, permissionId]
      };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">إدارة الصلاحيات</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* التبويبات */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6">
            {[
              { key: 'permissions', label: 'الصلاحيات المتاحة' },
              { key: 'roles', label: 'صلاحيات الأدوار' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* محتوى التبويبات */}
        <div className="p-6">
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">الصلاحيات المتاحة في النظام</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map(permission => (
                  <div key={permission.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">{permission.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{permission.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {permission.module}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {permission.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">صلاحيات الأدوار</h3>
                <button
                  onClick={saveRolePermissions}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>

              <div className="space-y-4">
                {[
                  'ادمن', 'رئيس_المصلحة', 'رئيس_قطاع', 'رئيس_إدارة_مركزية',
                  'مدير_إدارة_عامة', 'مدير_إدارة', 'مهندس', 'موظف', 'مشرف', 'فني'
                ].map(role => (
                  <div key={role} className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{role.replace(/_/g, ' ')}</h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {permissions.map(permission => (
                        <label key={permission.id} className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="checkbox"
                            checked={rolePermissions[role]?.includes(permission.id) || false}
                            onChange={() => toggleRolePermission(role, permission.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PermissionsManager;