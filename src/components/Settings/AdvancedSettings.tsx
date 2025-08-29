import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Database, 
  Code, 
  Palette, 
  Globe, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  RefreshCw, 
  User,
  Monitor,
  Key,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * مكون الإعدادات المتقدمة
 * يوفر تخصيص شامل للنظام والإعدادات المتقدمة
 */
const AdvancedSettings: React.FC = () => {
  // استخدام السياق للحصول على البيانات والإجراءات
  const { state, actions } = useApp();

  // حالات محلية للإعدادات المتقدمة والواجهة
  const [localSettings, setLocalSettings] = useState(state.systemSettings);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [activeSection, setActiveSection] = useState('customization');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // إعدادات التخصيص
  const [customization, setCustomization] = useState({
    systemName: state.systemSettings.systemName,
    organizationName: state.systemSettings.organizationName,
    logo: state.systemSettings.logo,
    theme: state.systemSettings.theme,
    language: state.systemSettings.language,
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    headerTitle: 'نظام إدارة مصلحة الري',
    footerText: 'وزارة الموارد المائية والري - جمهورية مصر العربية',
    welcomeMessage: 'مرحباً بك في نظام إدارة مصلحة الري',
    sidebarTitle: 'نظام إدارة مصلحة الري',
    dashboardTitle: 'لوحة التحكم الرئيسية'
  });

  // إعدادات قاعدة البيانات المحلية
  const [dbSettings, setDbSettings] = useState({
    host: 'localhost',
    port: '5432',
    database: 'irrigation_system',
    username: 'admin',
    password: '••••••••',
    maxConnections: '50',
    timeout: '30'
  });

  // إعدادات النظام المتقدمة المحلية
  const [advancedOptions, setAdvancedOptions] = useState({
    debugMode: false,
    maintenanceMode: false,
    autoBackup: true,
    logLevel: 'info',
    cacheEnabled: true,
    compressionEnabled: true,
    apiRateLimit: '1000'
  });

  // إعدادات الأمان المتقدمة
  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiry: 90,
      preventReuse: 5
    },
    sessionSettings: {
      sessionTimeout: 30,
      maxConcurrentSessions: 3,
      requireReauth: true,
      logoutOnClose: false
    },
    accessControl: {
      enableTwoFactor: false,
      allowRememberDevice: true,
      ipWhitelist: [],
      blockSuspiciousActivity: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15
    }
  });

  /**
   * تحديث الإعدادات المحلية عند تغيير الحالة العامة
   */
  React.useEffect(() => {
    setLocalSettings(state.systemSettings);
    setCustomization(prev => ({
      ...prev,
      systemName: state.systemSettings.systemName,
      organizationName: state.systemSettings.organizationName,
      logo: state.systemSettings.logo,
      theme: state.systemSettings.theme,
      language: state.systemSettings.language
    }));
  }, [state.systemSettings]);

  // قائمة الأقسام المتاحة في الإعدادات المتقدمة
  const sections = [
    { id: 'customization', name: 'تخصيص النظام', icon: Settings },
    { id: 'users', name: 'إدارة المستخدمين', icon: User },
    { id: 'database', name: 'قاعدة البيانات', icon: Database },
    { id: 'backup', name: 'النسخ الاحتياطي', icon: Download },
    { id: 'security', name: 'الأمان المتقدم', icon: Shield },
    { id: 'advanced', name: 'خيارات متقدمة', icon: Code }
  ];

  /**
   * دالة حفظ الإعدادات المحدثة
   */
  const handleSaveSettings = () => {
    try {
      setLoading(true);
      
      // تحديث إعدادات النظام في السياق العام
      actions.updateSystemSettings({
        systemName: customization.systemName,
        organizationName: customization.organizationName,
        logo: customization.logo,
        theme: customization.theme,
        language: customization.language
      });

      // حفظ التخصيصات الإضافية في التخزين المحلي
      localStorage.setItem('advancedSettings', JSON.stringify({
        customization,
        dbSettings,
        advancedOptions,
        securitySettings
      }));

      setSuccess('تم حفظ الإعدادات المتقدمة بنجاح!');
      setError(null);
      
      // تطبيق التغييرات فوراً
      document.title = customization.systemName;
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('خطأ في حفظ الإعدادات');
      console.error('خطأ في حفظ الإعدادات:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * دالة استعادة الإعدادات الافتراضية
   */
  const handleResetToDefaults = () => {
    if (confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟ سيتم فقدان جميع التخصيصات الحالية.')) {
      const defaultSettings = {
        systemName: 'نظام إدارة مصلحة الري',
        organizationName: 'وزارة الموارد المائية والري - جمهورية مصر العربية',
        logo: '',
        theme: 'فاتح',
        language: 'ar',
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        headerTitle: 'نظام إدارة مصلحة الري',
        footerText: 'وزارة الموارد المائية والري - جمهورية مصر العربية',
        welcomeMessage: 'مرحباً بك في نظام إدارة مصلحة الري',
        sidebarTitle: 'نظام إدارة مصلحة الري',
        dashboardTitle: 'لوحة التحكم الرئيسية'
      };

      setCustomization(defaultSettings);
      setSuccess('تم استعادة الإعدادات الافتراضية!');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  /**
   * دالة تصدير النسخة الاحتياطية للإعدادات
   */
  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      systemSettings: localSettings,
      customization,
      dbSettings,
      advancedOptions,
      securitySettings
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `إعدادات-متقدمة-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  /**
   * دالة استيراد الإعدادات
   */
  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          if (importedData.customization) {
            setCustomization({ ...customization, ...importedData.customization });
          }
          if (importedData.dbSettings) {
            setDbSettings({ ...dbSettings, ...importedData.dbSettings });
          }
          if (importedData.advancedOptions) {
            setAdvancedOptions({ ...advancedOptions, ...importedData.advancedOptions });
          }
          if (importedData.securitySettings) {
            setSecuritySettings({ ...securitySettings, ...importedData.securitySettings });
          }
          
          setSuccess('تم استيراد الإعدادات بنجاح');
        } catch (error) {
          setError('ملف الإعدادات غير صالح');
        }
      };
      reader.readAsText(file);
    }
  };

  /**
   * دالة عرض محتوى القسم النشط
   */
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'customization':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">تخصيص أسماء النظام</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم النظام الرئيسي</label>
                  <input
                    type="text"
                    value={customization.systemName}
                    onChange={(e) => setCustomization(prev => ({ ...prev, systemName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="نظام إدارة مصلحة الري"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المؤسسة</label>
                  <input
                    type="text"
                    value={customization.organizationName}
                    onChange={(e) => setCustomization(prev => ({ ...prev, organizationName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="وزارة الموارد المائية والري"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الشريط الجانبي</label>
                  <input
                    type="text"
                    value={customization.sidebarTitle}
                    onChange={(e) => setCustomization(prev => ({ ...prev, sidebarTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رسالة الترحيب</label>
                  <textarea
                    value={customization.welcomeMessage}
                    onChange={(e) => setCustomization(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نص التذييل</label>
                  <textarea
                    value={customization.footerText}
                    onChange={(e) => setCustomization(prev => ({ ...prev, footerText: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">شعار النظام</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {customization.logo ? (
                        <img src={customization.logo} alt="شعار" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Monitor className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span>رفع شعار</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setCustomization(prev => ({ ...prev, logo: event.target?.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">إدارة المستخدمين</h3>
              <p className="text-sm text-blue-700">
                إدارة حسابات المستخدمين وتعيين الصلاحيات والأدوار المختلفة في النظام
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">المستخدمون النشطون</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">مدير النظام</span>
                    <span className="text-xs text-green-600">نشط</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">مدير الإدارة</span>
                    <span className="text-xs text-green-600">نشط</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">موظف عادي</span>
                    <span className="text-xs text-green-600">نشط</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">الصلاحيات</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>مديري النظام:</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مديري الإدارات:</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الموظفين:</span>
                    <span className="font-medium">1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">إعدادات قاعدة البيانات</h3>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">تحذير</h4>
                  <p className="text-sm text-red-700 mt-1">
                    تغيير إعدادات قاعدة البيانات قد يؤثر على استقرار النظام. لا تقم بالتغيير إلا إذا كنت متأكداً.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">الاتصال</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان (Host)</label>
                  <input
                    type="text"
                    value={dbSettings.host}
                    onChange={(e) => setDbSettings(prev => ({ ...prev, host: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المنفذ (Port)</label>
                  <input
                    type="text"
                    value={dbSettings.port}
                    onChange={(e) => setDbSettings(prev => ({ ...prev, port: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم قاعدة البيانات</label>
                  <input
                    type="text"
                    value={dbSettings.database}
                    onChange={(e) => setDbSettings(prev => ({ ...prev, database: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">المصادقة والأداء</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
                  <input
                    type="text"
                    value={dbSettings.username}
                    onChange={(e) => setDbSettings(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    value={dbSettings.password}
                    onChange={(e) => setDbSettings(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأقصى للاتصالات</label>
                  <input
                    type="number"
                    value={dbSettings.maxConnections}
                    onChange={(e) => setDbSettings(prev => ({ ...prev, maxConnections: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>اختبار الاتصال</span>
              </button>
              <button 
                type="button"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>تحديث الاتصال</span>
              </button>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">النسخ الاحتياطي والاستعادة</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">إنشاء نسخة احتياطية</h4>
                <p className="text-sm text-gray-600 mb-4">
                  إنشاء نسخة احتياطية كاملة من جميع بيانات النظام
                </p>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  إنشاء نسخة احتياطية
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">استعادة نسخة احتياطية</h4>
                <p className="text-sm text-gray-600 mb-4">
                  استعادة البيانات من ملف نسخة احتياطية
                </p>
                <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-gray-400 px-4 py-3 rounded-lg transition-colors cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span>اختيار ملف النسخة الاحتياطية</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">الأمان المتقدم</h3>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">سياسة كلمات المرور</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى للطول</label>
                    <input
                      type="number"
                      min="6"
                      max="32"
                      value={securitySettings.passwordPolicy.minLength}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">انتهاء الصلاحية (أيام)</label>
                    <input
                      type="number"
                      min="30"
                      max="365"
                      value={securitySettings.passwordPolicy.passwordExpiry}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, passwordExpiry: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">يجب أن تحتوي على أحرف كبيرة</span>
                    <input
                      type="checkbox"
                      checked={securitySettings.passwordPolicy.requireUppercase}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireUppercase: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">يجب أن تحتوي على أرقام</span>
                    <input
                      type="checkbox"
                      checked={securitySettings.passwordPolicy.requireNumbers}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireNumbers: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">يجب أن تحتوي على رموز خاصة</span>
                    <input
                      type="checkbox"
                      checked={securitySettings.passwordPolicy.requireSpecialChars}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        passwordPolicy: { ...prev.passwordPolicy, requireSpecialChars: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">إعدادات الجلسة</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">مهلة انتهاء الجلسة (دقيقة)</label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={securitySettings.sessionSettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        sessionSettings: { ...prev.sessionSettings, sessionTimeout: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">طلب إعادة المصادقة للعمليات الحساسة</span>
                    <input
                      type="checkbox"
                      checked={securitySettings.sessionSettings.requireReauth}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        sessionSettings: { ...prev.sessionSettings, requireReauth: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">خيارات متقدمة</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">وضع الصيانة</h5>
                  <p className="text-sm text-gray-600">تعطيل النظام مؤقتاً للصيانة</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={advancedOptions.maintenanceMode}
                    onChange={(e) => setAdvancedOptions(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">وضع التطوير</h5>
                  <p className="text-sm text-gray-600">عرض معلومات إضافية للمطورين</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={advancedOptions.debugMode}
                    onChange={(e) => setAdvancedOptions(prev => ({ ...prev, debugMode: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">النسخ الاحتياطي التلقائي</h5>
                  <p className="text-sm text-gray-600">إنشاء نسخ احتياطية تلقائية</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={advancedOptions.autoBackup}
                    onChange={(e) => setAdvancedOptions(prev => ({ ...prev, autoBackup: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return <div>محتوى القسم غير متاح</div>;
    }
  };

  // عرض رسائل النجاح والخطأ
  const renderMessages = () => (
    <>
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
    </>
  );

  return (
    <div className="space-y-6">
      
      {/* رسائل النجاح والخطأ */}
      {renderMessages()}

      {/* العنوان الرئيسي */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-gray-600">إدارة إعدادات النظام والتفضيلات</p>
        </div>
        <div className="flex gap-3">
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
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>تصدير</span>
          </button>
          <button 
            type="button"
            onClick={handleResetToDefaults}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* قائمة الأقسام الجانبية */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* محتوى الإعدادات المتقدمة */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;