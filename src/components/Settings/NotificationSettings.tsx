import React from 'react';
import { Bell, Mail, Smartphone, Monitor, CheckCircle, AlertTriangle } from 'lucide-react';

interface NotificationSettingsProps {
  config: any;
  onConfigChange: (config: any) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ config, onConfigChange }) => {
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSaveNotifications = () => {
    try {
      // حفظ إعدادات الإشعارات
      localStorage.setItem('notificationSettings', JSON.stringify(config));
      setSuccess('تم حفظ إعدادات الإشعارات بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('خطأ في حفظ إعدادات الإشعارات');
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

      {/* الإشعارات العامة */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">الإشعارات العامة</h3>
        
        <div className="space-y-4">
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
            <span className="text-sm text-gray-700">إشعارات المهام الجديدة</span>
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">إشعارات المراسلات الواردة</span>
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">إشعارات المواعيد النهائية</span>
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </label>
        </div>
      </div>

      {/* قنوات الإشعارات */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">قنوات الإشعارات</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">البريد الإلكتروني</p>
                <p className="text-sm text-gray-600">إشعارات عبر البريد الإلكتروني</p>
              </div>
            </div>
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">إشعارات المتصفح</p>
                <p className="text-sm text-gray-600">إشعارات فورية في المتصفح</p>
              </div>
            </div>
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">الهاتف المحمول</p>
                <p className="text-sm text-gray-600">رسائل نصية قصيرة</p>
              </div>
            </div>
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* زر حفظ الإعدادات */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveNotifications}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <CheckCircle className="h-4 w-4" />
          حفظ إعدادات الإشعارات
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
