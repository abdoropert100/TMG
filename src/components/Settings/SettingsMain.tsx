import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Database, 
  Bell, 
  Palette,
  Globe,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle
} from 'lucide-react';
import { databaseService } from '../../services/DatabaseService';
import { excelService } from '../../services/ExcelService';
import UserSettings from './UserSettings';
import SecuritySettings from './SecuritySettings';
import DatabaseSettings from './DatabaseSettings';
import NotificationSettings from './NotificationSettings';
import AppearanceSettings from './AppearanceSettings';
import SystemSettings from './SystemSettings';

// أنواع الإعدادات المتاحة
type SettingsTab = 'user' | 'security' | 'database' | 'notifications' | 'appearance' | 'system';

// واجهة إعدادات النظام
interface SystemConfig {
  organizationName: string;
  organizationLogo: string;
  systemVersion: string;
  language: string;
  timezone: string;
  dateFormat: string;
  autoBackup: boolean;
  backupInterval: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  enableAuditLog: boolean;
  enableNotifications: boolean;
  enableTaskWeighting: boolean; // تفعيل وزن صعوبة المهمة في التقييم
  theme: 'light' | 'dark' | 'auto';
}

// مكون الإعدادات الرئيسي
const SettingsMain: React.FC = () => {
  // حالات المكون
  const [activeTab, setActiveTab] = useState<SettingsTab>('user');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // إعدادات النظام
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    organizationName: 'وزارة الموارد المائية والري',
    organizationLogo: '',
    systemVersion: '1.0.0',
    language: 'ar',
    timezone: 'Africa/Cairo',
    dateFormat: 'DD/MM/YYYY',
    autoBackup: true,
    backupInterval: 24,
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
    sessionTimeout: 30,
    enableAuditLog: true,
    enableNotifications: true,
    enableTaskWeighting: false, // تفعيل وزن صعوبة المهمة في التقييم (معطل افتراضيًا)
    theme: 'light'
  });

  // تحميل الإعدادات عند تحميل المكون
  useEffect(() => {
    loadSettings();
  }, []);

  // دالة تحميل الإعدادات
  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await databaseService.getSettings();
      if (settings) {
        setSystemConfig({ ...systemConfig, ...settings });
      }
      setError(null);
    } catch (err) {
      setError('خطأ في تحميل الإعدادات');
      console.error('خطأ في تحميل الإعدادات:', err);
    } finally {
      setLoading(false);
    }
  };

  // دالة حفظ الإعدادات
  const saveSettings = async () => {
    try {
      setSaving(true);
      await databaseService.saveSettings(systemConfig);
      setSuccess('تم حفظ الإعدادات بنجاح');
      setError(null);
      
      // إخفاء رسالة النجاح بعد 3 ثوان
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('خطأ في حفظ الإعدادات');
      console.error('خطأ في حفظ الإعدادات:', err);
    } finally {
      setSaving(false);
    }
  };

  // دالة تصدير الإعدادات
  const exportSettings = async () => {
    try {
      const settings = {
        systemConfig,
        exportDate: new Date().toISOString(),
        version: systemConfig.systemVersion
      };
      
      const blob = new Blob([JSON.stringify(settings, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess('تم تصدير الإعدادات بنجاح');
    } catch (err) {
      setError('خطأ في تصدير الإعدادات');
      console.error('خطأ في تصدير الإعدادات:', err);
    }
  };

  // دالة استيراد الإعدادات
  const importSettings = async (file: File) => {
    try {
      const text = await file.text();
      const importedSettings = JSON.parse(text);
      
      if (importedSettings.systemConfig) {
        setSystemConfig({ ...systemConfig, ...importedSettings.systemConfig });
        setSuccess('تم استيراد الإعدادات بنجاح');
      } else {
        setError('ملف الإعدادات غير صالح');
      }
    } catch (err) {
      setError('خطأ في استيراد الإعدادات');
      console.error('خطأ في استيراد الإعدادات:', err);
    }
  };

  // دالة إعادة تعيين الإعدادات للافتراضية
  const resetToDefaults = async () => {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات للقيم الافتراضية؟')) {
      const defaultConfig: SystemConfig = {
        organizationName: 'وزارة الموارد المائية والري',
        organizationLogo: '',
        systemVersion: '1.0.0',
        language: 'ar',
        timezone: 'Africa/Cairo',
        dateFormat: 'DD/MM/YYYY',
        autoBackup: true,
        backupInterval: 24,
        maxFileSize: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
        sessionTimeout: 30,
        enableAuditLog: true,
        enableNotifications: true,
        theme: 'light'
      };
      
      setSystemConfig(defaultConfig);
      setSuccess('تم إعادة تعيين الإعدادات للقيم الافتراضية');
    }
  };

  // قائمة التبويبات
  const tabs = [
    { key: 'user', label: 'إعدادات المستخدم', icon: User },
    { key: 'security', label: 'الأمان والخصوصية', icon: Shield },
    { key: 'database', label: 'قاعدة البيانات', icon: Database },
    { key: 'notifications', label: 'الإشعارات', icon: Bell },
    { key: 'appearance', label: 'المظهر', icon: Palette },
    { key: 'system', label: 'إعدادات النظام', icon: Globe }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل الإعدادات...</span>
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
          <button 
            type="button"
            onClick={() => setError(null)}
            className="mr-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <div className="h-5 w-5 text-green-600">✓</div>
          <span className="text-green-700">{success}</span>
          <button 
            type="button"
            onClick={() => setSuccess(null)}
            className="mr-auto text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
          <p className="text-gray-600">إدارة وتخصيص إعدادات النظام</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>استيراد</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importSettings(file);
              }}
            />
          </label>
          <button 
            type="button"
            onClick={exportSettings}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </button>
          <button 
            type="button"
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>إعادة تعيين</span>
          </button>
          <button 
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>
      </div>

      {/* التبويبات والمحتوى */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        
        {/* التبويبات */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as SettingsTab)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* محتوى التبويب */}
        <div className="p-6">
          {activeTab === 'user' && (
            <UserSettings 
              config={systemConfig}
              onConfigChange={setSystemConfig}
            />
          )}

          {activeTab === 'security' && (
            <SecuritySettings 
              config={systemConfig}
              onConfigChange={setSystemConfig}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseSettings 
              config={systemConfig}
              onConfigChange={setSystemConfig}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationSettings 
              config={systemConfig}
              onConfigChange={setSystemConfig}
            />
          )}

          {activeTab === 'appearance' && (
            <AppearanceSettings 
              config={systemConfig}
              onConfigChange={setSystemConfig}
            />
          )}

          {activeTab === 'system' && (
            <SystemSettings 
              config={systemConfig}
              onConfigChange={setSystemConfig}
            />
          )}
        </div>

      </div>

      {/* معلومات النظام */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات النظام</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">إصدار النظام:</span>
            <span className="mr-2 font-medium text-gray-900">{systemConfig.systemVersion}</span>
          </div>
          <div>
            <span className="text-gray-600">اللغة:</span>
            <span className="mr-2 font-medium text-gray-900">العربية</span>
          </div>
          <div>
            <span className="text-gray-600">المنطقة الزمنية:</span>
            <span className="mr-2 font-medium text-gray-900">{systemConfig.timezone}</span>
          </div>
          <div>
            <span className="text-gray-600">آخر نسخة احتياطية:</span>
            <span className="mr-2 font-medium text-gray-900">
              {new Date().toLocaleDateString('ar-EG')}
            </span>
          </div>
          <div>
            <span className="text-gray-600">حالة النظام:</span>
            <span className="mr-2 font-medium text-green-600">نشط</span>
          </div>
          <div>
            <span className="text-gray-600">المساحة المستخدمة:</span>
            <span className="mr-2 font-medium text-gray-900">2.5 جيجابايت</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsMain;
