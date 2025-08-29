import React from 'react';
import { Palette, Sun, Moon, Monitor, CheckCircle, AlertTriangle, Save } from 'lucide-react';

interface AppearanceSettingsProps {
  config: any;
  onConfigChange: (config: any) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ config, onConfigChange }) => {
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSaveAppearance = () => {
    try {
      // حفظ إعدادات المظهر
      localStorage.setItem('appearanceSettings', JSON.stringify(config));
      setSuccess('تم حفظ إعدادات المظهر بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('خطأ في حفظ إعدادات المظهر');
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

      {/* المظهر العام */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">المظهر العام</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">السمة</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onConfigChange({ ...config, theme: 'light' })}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                  config.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Sun className="h-6 w-6 mb-2" />
                <span className="text-sm">فاتح</span>
              </button>
              
              <button
                type="button"
                onClick={() => onConfigChange({ ...config, theme: 'dark' })}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                  config.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Moon className="h-6 w-6 mb-2" />
                <span className="text-sm">داكن</span>
              </button>
              
              <button
                type="button"
                onClick={() => onConfigChange({ ...config, theme: 'auto' })}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                  config.theme === 'auto' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Monitor className="h-6 w-6 mb-2" />
                <span className="text-sm">تلقائي</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اللون الأساسي</label>
            <div className="flex gap-3">
              {['blue', 'green', 'purple', 'red', 'orange'].map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full bg-${color}-600 border-2 border-gray-300 hover:scale-110 transition-transform`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* إعدادات العرض */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">إعدادات العرض</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">حجم الخط</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="small">صغير</option>
              <option value="medium">متوسط</option>
              <option value="large">كبير</option>
            </select>
          </div>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">عرض الشريط الجانبي مطوياً</span>
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">إظهار الرسوم المتحركة</span>
            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          </label>
        </div>
      </div>

      {/* زر حفظ الإعدادات */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveAppearance}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save className="h-4 w-4" />
          حفظ إعدادات المظهر
        </button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
