import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Palette, 
  Globe, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Settings: React.FC = () => {
  const { state, actions } = useApp();
  
  // حالات المكون
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'security'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // إعدادات النظام المحلية
  const [localSettings, setLocalSettings] = useState({
    systemName: state.systemSettings.systemName,
    organizationName: state.systemSettings.organizationName,
    theme: state.systemSettings.theme,
    language: state.systemSettings.language,
    dateFormat: state.systemSettings.dateFormat,
    currency: state.systemSettings.currency,
    notifications: {
      email: true,
      browser: true,
      mobile: false
    },
    security: {
      sessionTimeout: 30,
      twoFactorAuth: false,
      passwordExpiry: 90
    }
  });

  // قائمة التبويبات
  const tabs = [
    { key: 'general', label: 'الإعدادات العامة', icon: SettingsIcon },
    { key: 'appearance', label: 'المظهر', icon: Palette },
    { key: 'notifications', label: 'الإشعارات', icon: Bell },
    { key: 'security', label: 'الأمان', icon: Shield }
  ];

  // دالة تحديث الإعدادات المحلية
  const updateLocalSetting = (category: string, field: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: typeof prev[category as keyof typeof prev] === 'object' 
        ? { ...prev[category as keyof typeof prev], [field]: value }
        : value
    }));
  };

  // دالة حفظ الإعدادات
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // تحديث إعدادات النظام في السياق العام
      actions.updateSystemSettings({
        systemName: localSettings.systemName,
        organizationName: localSettings.organizationName,
        theme: localSettings.theme,
        language: localSettings.language,
        dateFormat: localSettings.dateFormat,
        currency: localSettings.currency
      });

      // حفظ الإعدادات في التخزين المحلي
      localStorage.setItem('userSettings', JSON.stringify(localSettings));

      setSuccess('تم حفظ الإعدادات بنجاح');
      setError(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('خطأ في حفظ الإعدادات');
      console.error('خطأ في حفظ الإعدادات:', err);
    } finally {
      setLoading(false);
    }
  };

  // دالة استعادة الإعدادات الافتراضية
  const handleResetSettings = () => {
    if (confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟')) {
      const defaultSettings = {
        systemName: 'نظام إدارة مصلحة الري',
        organizationName: 'وزارة الموارد المائية والري - جمهورية مصر العربية',
        theme: 'فاتح',
        language: 'ar',
        dateFormat: 'DD/MM/YYYY',
        currency: 'EGP',
        notifications: {
          email: true,
          browser: true,
          mobile: false
        },
        security: {
          sessionTimeout: 30,
          twoFactorAuth: false,
          passwordExpiry: 90
        }
      };
      
      setLocalSettings(defaultSettings);
      setSuccess('تم استعادة الإعدادات الافتراضية');
    }
  };

  // دالة تصدير الإعدادات
  const handleExportSettings = () => {
    const dataStr = JSON.stringify(localSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `إعدادات-النظام-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // دالة استيراد الإعدادات
  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setLocalSettings({ ...localSettings, ...importedSettings });
          setSuccess('تم استيراد الإعدادات بنجاح');
        } catch (error) {
          setError('ملف الإعدادات غير صالح');
        }
      };
      reader.readAsText(file);
    }
  };

  // عرض محتوى التبويب النشط
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم النظام</label>
              <input
                type="text"
                value={localSettings.systemName}
                onChange={(e) => updateLocalSetting('systemName', '', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم المؤسسة</label>
              <input
                type="text"
                value={localSettings.organizationName}
                onChange={(e) => updateLocalSetting('organizationName', '', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اللغة</label>
                <select
                  value={localSettings.language}
                  onChange={(e) => updateLocalSetting('language', '', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تنسيق التاريخ</label>
                <select
                  value={localSettings.dateFormat}
                  onChange={(e) => updateLocalSetting('dateFormat', '', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">السمة</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateLocalSetting('theme', '', 'فاتح')}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                    localSettings.theme === 'فاتح' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-white border border-gray-300 rounded mb-2 mx-auto"></div>
                    <span className="text-sm">فاتح</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => updateLocalSetting('theme', '', 'داكن')}
                  className={`flex items-center justify-center p-4 border-2 rounded-lg transition-colors ${
                    localSettings.theme === 'داكن' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-800 rounded mb-2 mx-auto"></div>
                    <span className="text-sm">داكن</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">إشعارات البريد الإلكتروني</span>
                <input
                  type="checkbox"
                  checked={localSettings.notifications.email}
                  onChange={(e) => updateLocalSetting('notifications', 'email', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">إشعارات المتصفح</span>
                <input
                  type="checkbox"
                  checked={localSettings.notifications.browser}
                  onChange={(e) => updateLocalSetting('notifications', 'browser', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">إشعارات الهاتف المحمول</span>
                <input
                  type="checkbox"
                  checked={localSettings.notifications.mobile}
                  onChange={(e) => updateLocalSetting('notifications', 'mobile', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مهلة انتهاء الجلسة (دقيقة)</label>
              <input
                type="number"
                min="5"
                max="480"
                value={localSettings.security.sessionTimeout}
                onChange={(e) => updateLocalSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">انتهاء صلاحية كلمة المرور (أيام)</label>
              <input
                type="number"
                min="30"
                max="365"
                value={localSettings.security.passwordExpiry}
                onChange={(e) => updateLocalSetting('security', 'passwordExpiry', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">تفعيل المصادقة الثنائية</span>
              <input
                type="checkbox"
                checked={localSettings.security.twoFactorAuth}
                onChange={(e) => updateLocalSetting('security', 'twoFactorAuth', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        );

      default:
        return <div>محتوى غير متاح</div>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* رسائل النجاح والخطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
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
          <CheckCircle className="h-5 w-5 text-green-600" />
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
          <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-gray-600">إدارة إعدادات النظام والتفضيلات</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>استيراد</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportSettings}
            />
          </label>
          <button 
            type="button"
            onClick={handleExportSettings}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </button>
          <button 
            type="button"
            onClick={handleResetSettings}
            className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>إعادة تعيين</span>
          </button>
          <button 
            type="button"
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
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
                  onClick={() => setActiveTab(tab.key as any)}
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
          {renderTabContent()}
        </div>

      </div>

      {/* معلومات النظام */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات النظام</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">إصدار النظام:</span>
            <span className="mr-2 font-medium text-gray-900">1.0.0</span>
          </div>
          <div>
            <span className="text-gray-600">آخر تحديث:</span>
            <span className="mr-2 font-medium text-gray-900">{new Date().toLocaleDateString('ar-EG')}</span>
          </div>
          <div>
            <span className="text-gray-600">حالة النظام:</span>
            <span className="mr-2 font-medium text-green-600">نشط</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;