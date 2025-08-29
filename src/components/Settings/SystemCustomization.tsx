/**
 * مكون تخصيص النظام المتقدم
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Eye, 
  Upload,
  Building2,
  Type,
  Palette,
  Globe,
  Monitor,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * مكون تخصيص النظام الشامل
 * يتيح تغيير جميع أسماء النظام والمؤسسة والشعارات
 */
const SystemCustomization: React.FC = () => {
  const { state, actions } = useApp();

  // حالات التخصيص
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
    dashboardTitle: 'لوحة التحكم الرئيسية',
    developerInfo: {
      name: 'م. عبدالعال محمد',
      phone: '+201000731116',
      email: 'abdelaalmiti@gmail.com'
    }
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * تحديث التخصيص عند تغيير الحالة العامة
   */
  useEffect(() => {
    setCustomization(prev => ({
      ...prev,
      systemName: state.systemSettings.systemName,
      organizationName: state.systemSettings.organizationName,
      logo: state.systemSettings.logo,
      theme: state.systemSettings.theme,
      language: state.systemSettings.language
    }));
  }, [state.systemSettings]);

  /**
   * دالة تحديث قيم التخصيص
   */
  const handleCustomizationChange = (field: string, value: any) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * دالة رفع الشعار
   */
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        handleCustomizationChange('logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * دالة حفظ التخصيصات
   */
  const handleSaveCustomization = () => {
    try {
      // تحديث إعدادات النظام في السياق العام
      actions.updateSystemSettings({
        systemName: customization.systemName,
        organizationName: customization.organizationName,
        logo: customization.logo,
        theme: customization.theme,
        language: customization.language
      });

      // حفظ التخصيصات الإضافية في التخزين المحلي
      localStorage.setItem('systemCustomization', JSON.stringify(customization));

      setSuccess('تم حفظ التخصيصات بنجاح!');
      setError(null);
      
      // تطبيق التغييرات فوراً بدون إعادة تحميل
      document.title = customization.systemName;
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('خطأ في حفظ التخصيصات:', error);
      setError('خطأ في حفظ التخصيصات');
    }
  };

  /**
   * دالة استعادة الإعدادات الافتراضية
   */
  const handleResetToDefaults = () => {
    if (confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟ سيتم فقدان جميع التخصيصات.')) {
      const defaultCustomization = {
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
        dashboardTitle: 'لوحة التحكم الرئيسية',
        developerInfo: {
          name: 'م. عبدالعال محمد',
          phone: '+201000731116',
          email: 'abdelaalmiti@gmail.com'
        }
      };

      setCustomization(defaultCustomization);
      setLogoPreview('');
      setSuccess('تم استعادة الإعدادات الافتراضية!');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-8">
      
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
          <h2 className="text-xl font-semibold text-gray-900">تخصيص النظام</h2>
          <p className="text-gray-600">تخصيص أسماء النظام والمؤسسة والشعارات</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'إخفاء المعاينة' : 'معاينة مباشرة'}
          </button>
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            استعادة افتراضي
          </button>
          <button
            onClick={handleSaveCustomization}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Save className="h-4 w-4" />
            حفظ التغييرات
          </button>
        </div>
      </div>

      {/* معاينة مباشرة */}
      {previewMode && (
        <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">معاينة مباشرة للتغييرات</h3>
          
          {/* معاينة الشريط الجانبي */}
          <div className="bg-blue-900 text-white p-4 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              {logoPreview && (
                <img src={logoPreview} alt="شعار" className="w-8 h-8 rounded" />
              )}
              <div>
                <h4 className="font-bold">{customization.sidebarTitle}</h4>
                <p className="text-xs text-blue-200">{customization.organizationName}</p>
              </div>
            </div>
          </div>

          {/* معاينة الرأس */}
          <div className="bg-white border rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900">{customization.headerTitle}</h4>
            <p className="text-sm text-gray-600">{customization.welcomeMessage}</p>
          </div>

          {/* معاينة لوحة التحكم */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">{customization.dashboardTitle}</h4>
            <p className="text-sm text-gray-600 mt-2">{customization.footerText}</p>
          </div>
        </div>
      )}

      {/* تخصيص الأسماء */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">تخصيص أسماء النظام</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Type className="h-4 w-4 inline mr-1" />
                اسم النظام الرئيسي
              </label>
              <input
                type="text"
                value={customization.systemName}
                onChange={(e) => handleCustomizationChange('systemName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="نظام إدارة مصلحة الري"
              />
              <p className="text-xs text-gray-500 mt-1">يظهر في الشريط الجانبي والرأس</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="h-4 w-4 inline mr-1" />
                اسم المؤسسة
              </label>
              <input
                type="text"
                value={customization.organizationName}
                onChange={(e) => handleCustomizationChange('organizationName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="وزارة الموارد المائية والري - جمهورية مصر العربية"
              />
              <p className="text-xs text-gray-500 mt-1">يظهر في التذييل والتقارير</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الشريط الجانبي
              </label>
              <input
                type="text"
                value={customization.sidebarTitle}
                onChange={(e) => handleCustomizationChange('sidebarTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان لوحة التحكم
              </label>
              <input
                type="text"
                value={customization.dashboardTitle}
                onChange={(e) => handleCustomizationChange('dashboardTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رسالة الترحيب
              </label>
              <textarea
                value={customization.welcomeMessage}
                onChange={(e) => handleCustomizationChange('welcomeMessage', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نص التذييل
              </label>
              <textarea
                value={customization.footerText}
                onChange={(e) => handleCustomizationChange('footerText', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شعار النظام
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {logoPreview || customization.logo ? (
                    <img 
                      src={logoPreview || customization.logo} 
                      alt="شعار النظام" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span>رفع شعار جديد</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* تخصيص المظهر */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">تخصيص المظهر</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="h-4 w-4 inline mr-1" />
                السمة
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="فاتح"
                    checked={customization.theme === 'فاتح'}
                    onChange={(e) => handleCustomizationChange('theme', e.target.value)}
                    className="mr-2"
                  />
                  <span>فاتح</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="داكن"
                    checked={customization.theme === 'داكن'}
                    onChange={(e) => handleCustomizationChange('theme', e.target.value)}
                    className="mr-2"
                  />
                  <span>داكن</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="h-4 w-4 inline mr-1" />
                اللغة
              </label>
              <select
                value={customization.language}
                onChange={(e) => handleCustomizationChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللون الأساسي
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customization.primaryColor}
                  onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customization.primaryColor}
                  onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللون الثانوي
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customization.secondaryColor}
                  onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customization.secondaryColor}
                  onChange={(e) => handleCustomizationChange('secondaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* معلومات المطور */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">معلومات المطور</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم المطور</label>
            <input
              type="text"
              value={customization.developerInfo.name}
              onChange={(e) => handleCustomizationChange('developerInfo', {
                ...customization.developerInfo,
                name: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
            <input
              type="text"
              value={customization.developerInfo.phone}
              onChange={(e) => handleCustomizationChange('developerInfo', {
                ...customization.developerInfo,
                phone: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={customization.developerInfo.email}
              onChange={(e) => handleCustomizationChange('developerInfo', {
                ...customization.developerInfo,
                email: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* تطبيق التخصيصات */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Monitor className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">ملاحظة مهمة</h4>
            <p className="text-sm text-blue-700 mt-1">
              سيتم تطبيق التغييرات على جميع أجزاء النظام فوراً بعد الحفظ. 
              تأكد من مراجعة جميع الأسماء قبل الحفظ.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SystemCustomization;