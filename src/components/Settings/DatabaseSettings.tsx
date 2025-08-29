import React, { useState } from 'react';
import { Database, Download, Upload, RefreshCw, Trash2, AlertTriangle, CheckCircle, Save } from 'lucide-react';

interface DatabaseSettingsProps {
  config: any;
  onConfigChange: (config: any) => void;
}

const DatabaseSettings: React.FC<DatabaseSettingsProps> = ({ config, onConfigChange }) => {
  const [backupStatus, setBackupStatus] = useState('idle');
  const [restoreStatus, setRestoreStatus] = useState('idle');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBackup = async () => {
    setBackupStatus('loading');
    // محاكاة عملية النسخ الاحتياطي
    setTimeout(() => {
      setBackupStatus('success');
      setSuccess('تم إنشاء النسخة الاحتياطية بنجاح');
      setTimeout(() => setBackupStatus('idle'), 3000);
      setTimeout(() => setSuccess(null), 3000);
    }, 2000);
  };

  const handleRestore = async () => {
    if (confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.')) {
      setRestoreStatus('loading');
      setTimeout(() => {
        setRestoreStatus('success');
        setSuccess('تم استعادة النسخة الاحتياطية بنجاح');
        setTimeout(() => setRestoreStatus('idle'), 3000);
        setTimeout(() => setSuccess(null), 3000);
      }, 2000);
    }
  };

  const handleSaveDatabase = () => {
    try {
      // حفظ إعدادات قاعدة البيانات
      localStorage.setItem('databaseSettings', JSON.stringify(config));
      setSuccess('تم حفظ إعدادات قاعدة البيانات بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('خطأ في حفظ إعدادات قاعدة البيانات');
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

      {/* النسخ الاحتياطي */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">النسخ الاحتياطي</h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">تفعيل النسخ الاحتياطي التلقائي</span>
            <input
              type="checkbox"
              checked={config.autoBackup}
              onChange={(e) => onConfigChange({ ...config, autoBackup: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">فترة النسخ الاحتياطي (ساعة)</label>
            <input
              type="number"
              min="1"
              max="168"
              value={config.backupInterval}
              onChange={(e) => onConfigChange({ ...config, backupInterval: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBackup}
              disabled={backupStatus === 'loading'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {backupStatus === 'loading' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {backupStatus === 'loading' ? 'جاري النسخ...' : 'إنشاء نسخة احتياطية'}
            </button>

          </div>
        </div>
      </div>

      {/* الاستعادة */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">استعادة البيانات</h3>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">تحذير</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  استعادة النسخة الاحتياطية ستستبدل جميع البيانات الحالية. تأكد من إنشاء نسخة احتياطية قبل المتابعة.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>اختيار ملف النسخة الاحتياطية</span>
              <input type="file" accept=".json,.sql" className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleRestore}
              disabled={restoreStatus === 'loading'}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {restoreStatus === 'loading' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {restoreStatus === 'loading' ? 'جاري الاستعادة...' : 'استعادة البيانات'}
            </button>

          </div>
        </div>
      </div>

      {/* إعدادات قاعدة البيانات */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">إعدادات قاعدة البيانات</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحد الأقصى لحجم الملف (ميجابايت)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.maxFileSize}
              onChange={(e) => onConfigChange({ ...config, maxFileSize: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">أنواع الملفات المسموحة</label>
            <input
              type="text"
              value={config.allowedFileTypes?.join(', ') || ''}
              onChange={(e) => onConfigChange({ 
                ...config, 
                allowedFileTypes: e.target.value.split(',').map(type => type.trim()) 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="pdf, doc, docx, jpg, png"
            />
          </div>
        </div>
      </div>

      {/* تنظيف البيانات */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">تنظيف البيانات</h3>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">حذف البيانات القديمة</h4>
                <p className="text-sm text-red-700 mt-1">
                  حذف البيانات المؤرشفة والسجلات القديمة لتوفير مساحة التخزين.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              حذف السجلات الأقدم من سنة
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              حذف الملفات المؤقتة
            </button>
          </div>
        </div>
      </div>

      {/* زر حفظ إعدادات قاعدة البيانات */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveDatabase}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save className="h-4 w-4" />
          حفظ إعدادات قاعدة البيانات
        </button>
      </div>
    </div>
  );
};

export default DatabaseSettings;
