import React from 'react';
import { Globe, Clock, Calendar, Building2, Save, CheckCircle, AlertTriangle } from 'lucide-react';

interface SystemSettingsProps {
  config: any;
  onConfigChange: (config: any) => void;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ config, onConfigChange }) => {
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSaveSystem = () => {
    try {
      // حفظ إعدادات النظام
      localStorage.setItem('systemSettings', JSON.stringify(config));
      setSuccess('تم حفظ إعدادات النظام بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('خطأ في حفظ إعدادات النظام');
    }
  };

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

      {/* معلومات المؤسسة */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">معلومات المؤسسة</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم المؤسسة</label>
            <input
              type="text"
              value={config.organizationName}
              onChange={(e) => onConfigChange({ ...config, organizationName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">شعار المؤسسة</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                تغيير الشعار
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* الإعدادات الإقليمية */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">الإعدادات الإقليمية</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اللغة الافتراضية</label>
            <select
              value={config.language}
              onChange={(e) => onConfigChange({ ...config, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المنطقة الزمنية</label>
            <select
              value={config.timezone}
              onChange={(e) => onConfigChange({ ...config, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Africa/Cairo">القاهرة (GMT+2)</option>
              <option value="Asia/Riyadh">الرياض (GMT+3)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تنسيق التاريخ</label>
            <select
              value={config.dateFormat}
              onChange={(e) => onConfigChange({ ...config, dateFormat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مهلة انتهاء الجلسة (دقيقة)</label>
            <input
              type="number"
              min="5"
              max="480"
              value={config.sessionTimeout}
              onChange={(e) => onConfigChange({ ...config, sessionTimeout: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* إعدادات النظام */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">إعدادات النظام</h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تفعيل سجل التدقيق</span>
            <input
              type="checkbox"
              checked={config.enableAuditLog}
              onChange={(e) => onConfigChange({ ...config, enableAuditLog: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تفعيل الإشعارات</span>
            <input
              type="checkbox"
              checked={config.enableNotifications}
              onChange={(e) => onConfigChange({ ...config, enableNotifications: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">النسخ الاحتياطي التلقائي</span>
            <input
              type="checkbox"
              checked={config.autoBackup}
              onChange={(e) => onConfigChange({ ...config, autoBackup: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-700">تفعيل وزن صعوبة المهمة في التقييم</span>
              <p className="text-xs text-gray-500">عند التفعيل، ستؤثر نقاط الإنجاز على ترتيب الموظفين في لوحة الشرف</p>
            </div>
            <input
              type="checkbox"
              checked={config.enableTaskWeighting || false}
              onChange={(e) => onConfigChange({ ...config, enableTaskWeighting: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* معلومات الإصدار */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">معلومات الإصدار</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">إصدار النظام:</span>
            <span className="mr-2 font-medium text-gray-900">{config.systemVersion}</span>
          </div>
          <div>
            <span className="text-gray-600">تاريخ الإصدار:</span>
            <span className="mr-2 font-medium text-gray-900">يناير 2024</span>
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

      {/* زر حفظ إعدادات النظام */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSystem}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save className="h-4 w-4" />
          حفظ إعدادات النظام
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;
