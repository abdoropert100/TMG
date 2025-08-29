import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Lock, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  Download,
  Save
} from 'lucide-react';

// واجهة خصائص مكون إعدادات الأمان
interface SecuritySettingsProps {
  config: any;
  onConfigChange: (config: any) => void;
}

// واجهة سجل الأنشطة
interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
}

// مكون إعدادات الأمان
const SecuritySettings: React.FC<SecuritySettingsProps> = ({ config, onConfigChange }) => {
  // حالات المكون
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'تسجيل دخول ناجح',
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success'
    },
    {
      id: '2',
      action: 'محاولة تسجيل دخول فاشلة',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'failed'
    },
    {
      id: '3',
      action: 'تغيير كلمة المرور',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: 'success'
    }
  ]);

  // إعدادات الأمان
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
    },
    auditSettings: {
      enableAuditLog: true,
      logRetentionDays: 365,
      logFailedAttempts: true,
      logSuccessfulLogins: true,
      logDataChanges: true,
      logSystemEvents: true
    }
  });

  // دالة تحديث إعدادات الأمان
  const updateSecuritySetting = (category: string, field: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // دالة حفظ إعدادات الأمان
  const handleSaveSecurity = () => {
    try {
      // حفظ إعدادات الأمان
      localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
      setSuccess('تم حفظ إعدادات الأمان بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('خطأ في حفظ إعدادات الأمان');
    }
  };

  // دالة الحصول على لون حالة النشاط
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // دالة تصدير سجل الأنشطة
  const exportActivityLog = () => {
    const csvContent = [
      ['التاريخ', 'النشاط', 'عنوان IP', 'الحالة'],
      ...activityLogs.map(log => [
        new Date(log.timestamp).toLocaleString('ar-EG'),
        log.action,
        log.ipAddress,
        log.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

      {/* سياسة كلمات المرور */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">سياسة كلمات المرور</h3>
          <button
            type="button"
            onClick={() => setShowPasswordPolicy(!showPasswordPolicy)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {showPasswordPolicy ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPasswordPolicy ? 'إخفاء' : 'عرض'} التفاصيل
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأدنى لطول كلمة المرور</label>
            <input
              type="number"
              min="6"
              max="32"
              value={securitySettings.passwordPolicy.minLength}
              onChange={(e) => updateSecuritySetting('passwordPolicy', 'minLength', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">انتهاء صلاحية كلمة المرور (أيام)</label>
            <input
              type="number"
              min="30"
              max="365"
              value={securitySettings.passwordPolicy.passwordExpiry}
              onChange={(e) => updateSecuritySetting('passwordPolicy', 'passwordExpiry', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {showPasswordPolicy && (
          <div className="mt-6 space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">يجب أن تحتوي على أحرف كبيرة</span>
              <input
                type="checkbox"
                checked={securitySettings.passwordPolicy.requireUppercase}
                onChange={(e) => updateSecuritySetting('passwordPolicy', 'requireUppercase', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">يجب أن تحتوي على أحرف صغيرة</span>
              <input
                type="checkbox"
                checked={securitySettings.passwordPolicy.requireLowercase}
                onChange={(e) => updateSecuritySetting('passwordPolicy', 'requireLowercase', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">يجب أن تحتوي على أرقام</span>
              <input
                type="checkbox"
                checked={securitySettings.passwordPolicy.requireNumbers}
                onChange={(e) => updateSecuritySetting('passwordPolicy', 'requireNumbers', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">يجب أن تحتوي على رموز خاصة</span>
              <input
                type="checkbox"
                checked={securitySettings.passwordPolicy.requireSpecialChars}
                onChange={(e) => updateSecuritySetting('passwordPolicy', 'requireSpecialChars', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        )}
      </div>

      {/* إعدادات الجلسة */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">إعدادات الجلسة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مهلة انتهاء الجلسة (دقيقة)</label>
            <input
              type="number"
              min="5"
              max="480"
              value={securitySettings.sessionSettings.sessionTimeout}
              onChange={(e) => updateSecuritySetting('sessionSettings', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأقصى للجلسات المتزامنة</label>
            <input
              type="number"
              min="1"
              max="10"
              value={securitySettings.sessionSettings.maxConcurrentSessions}
              onChange={(e) => updateSecuritySetting('sessionSettings', 'maxConcurrentSessions', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">طلب إعادة المصادقة للعمليات الحساسة</span>
            <input
              type="checkbox"
              checked={securitySettings.sessionSettings.requireReauth}
              onChange={(e) => updateSecuritySetting('sessionSettings', 'requireReauth', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تسجيل خروج تلقائي عند إغلاق المتصفح</span>
            <input
              type="checkbox"
              checked={securitySettings.sessionSettings.logoutOnClose}
              onChange={(e) => updateSecuritySetting('sessionSettings', 'logoutOnClose', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* التحكم في الوصول */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">التحكم في الوصول</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأقصى لمحاولات تسجيل الدخول</label>
            <input
              type="number"
              min="3"
              max="10"
              value={securitySettings.accessControl.maxLoginAttempts}
              onChange={(e) => updateSecuritySetting('accessControl', 'maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مدة الحظر (دقيقة)</label>
            <input
              type="number"
              min="5"
              max="60"
              value={securitySettings.accessControl.lockoutDuration}
              onChange={(e) => updateSecuritySetting('accessControl', 'lockoutDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تفعيل المصادقة الثنائية</span>
            <input
              type="checkbox"
              checked={securitySettings.accessControl.enableTwoFactor}
              onChange={(e) => updateSecuritySetting('accessControl', 'enableTwoFactor', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">السماح بتذكر الجهاز</span>
            <input
              type="checkbox"
              checked={securitySettings.accessControl.allowRememberDevice}
              onChange={(e) => updateSecuritySetting('accessControl', 'allowRememberDevice', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">حظر الأنشطة المشبوهة تلقائياً</span>
            <input
              type="checkbox"
              checked={securitySettings.accessControl.blockSuspiciousActivity}
              onChange={(e) => updateSecuritySetting('accessControl', 'blockSuspiciousActivity', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* إعدادات التدقيق */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">إعدادات التدقيق والمراقبة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مدة الاحتفاظ بالسجلات (أيام)</label>
            <input
              type="number"
              min="30"
              max="3650"
              value={securitySettings.auditSettings.logRetentionDays}
              onChange={(e) => updateSecuritySetting('auditSettings', 'logRetentionDays', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تفعيل سجل التدقيق</span>
            <input
              type="checkbox"
              checked={securitySettings.auditSettings.enableAuditLog}
              onChange={(e) => updateSecuritySetting('auditSettings', 'enableAuditLog', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تسجيل محاولات الدخول الفاشلة</span>
            <input
              type="checkbox"
              checked={securitySettings.auditSettings.logFailedAttempts}
              onChange={(e) => updateSecuritySetting('auditSettings', 'logFailedAttempts', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تسجيل عمليات الدخول الناجحة</span>
            <input
              type="checkbox"
              checked={securitySettings.auditSettings.logSuccessfulLogins}
              onChange={(e) => updateSecuritySetting('auditSettings', 'logSuccessfulLogins', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تسجيل تغييرات البيانات</span>
            <input
              type="checkbox"
              checked={securitySettings.auditSettings.logDataChanges}
              onChange={(e) => updateSecuritySetting('auditSettings', 'logDataChanges', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تسجيل أحداث النظام</span>
            <input
              type="checkbox"
              checked={securitySettings.auditSettings.logSystemEvents}
              onChange={(e) => updateSecuritySetting('auditSettings', 'logSystemEvents', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* سجل الأنشطة */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">سجل الأنشطة الأخيرة</h3>
          <button
            type="button"
            onClick={exportActivityLog}
            className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-white transition-colors"
          >
            <Download className="h-4 w-4" />
            تصدير السجل
          </button>
        </div>

        <div className="space-y-3">
          {activityLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(log.status).replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[1]}`}></div>
                <div>
                  <p className="font-medium text-gray-900">{log.action}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString('ar-EG')} • {log.ipAddress}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                {log.status === 'success' ? 'نجح' : log.status === 'failed' ? 'فشل' : 'تحذير'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* زر حفظ إعدادات الأمان */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSecurity}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save className="h-4 w-4" />
          حفظ إعدادات الأمان
        </button>
      </div>

      {/* تحذيرات الأمان */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">تنبيهات الأمان</h4>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• تأكد من تفعيل المصادقة الثنائية لحماية إضافية</li>
              <li>• راجع سجل الأنشطة بانتظام للتأكد من عدم وجود أنشطة مشبوهة</li>
              <li>• استخدم كلمات مرور قوية ومعقدة</li>
              <li>• لا تشارك بيانات تسجيل الدخول مع أي شخص آخر</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SecuritySettings;
