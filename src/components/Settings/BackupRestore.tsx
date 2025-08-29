/**
 * مكون النسخ الاحتياطي والاستعادة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  FileText,
  Trash2,
  Eye
} from 'lucide-react';
import { databaseService } from '../../services/DatabaseService';
import { excelService } from '../../services/ExcelService';
import { useApp } from '../../context/AppContext';

/**
 * مكون النسخ الاحتياطي والاستعادة الشامل
 */
const BackupRestore: React.FC = () => {
  const { state, actions } = useApp();

  // حالات المكون
  const [loading, setLoading] = useState(false);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * تحميل تاريخ النسخ الاحتياطية عند تحميل المكون
   */
  useEffect(() => {
    loadBackupHistory();
  }, []);

  /**
   * دالة تحميل تاريخ النسخ الاحتياطية
   */
  const loadBackupHistory = async () => {
    try {
      // محاكاة تاريخ النسخ الاحتياطية
      const history = [
        {
          id: '1',
          name: 'نسخة احتياطية تلقائية',
          date: new Date(),
          size: '2.5 MB',
          type: 'تلقائي',
          status: 'مكتملة'
        },
        {
          id: '2',
          name: 'نسخة احتياطية يدوية',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          size: '2.3 MB',
          type: 'يدوي',
          status: 'مكتملة'
        }
      ];
      setBackupHistory(history);
    } catch (error) {
      console.error('خطأ في تحميل تاريخ النسخ الاحتياطية:', error);
    }
  };

  /**
   * دالة إنشاء نسخة احتياطية كاملة
   */
  const handleCreateFullBackup = async () => {
    try {
      setLoading(true);
      setError(null);

      // جمع جميع البيانات
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        systemSettings: state.systemSettings,
        employees: state.employees,
        departments: state.departments,
        divisions: state.divisions,
        tasks: state.tasks,
        correspondence: state.correspondence,
        metadata: {
          totalRecords: state.employees.length + state.departments.length + 
                      state.divisions.length + state.tasks.length + state.correspondence.length,
          creator: state.currentUser.name
        }
      };

      // تحويل إلى JSON وتحميل
      const jsonData = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `نسخة-احتياطية-كاملة-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // تسجيل العملية
      actions.logActivity('backup', 'create_full', 'تم إنشاء نسخة احتياطية كاملة');
      
      setSuccess('تم إنشاء النسخة الاحتياطية وتحميلها بنجاح');
      setTimeout(() => setSuccess(null), 3000);
      
      await loadBackupHistory();
    } catch (error) {
      setError('خطأ في إنشاء النسخة الاحتياطية');
      console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * دالة استعادة النسخة الاحتياطية
   */
  const handleRestoreBackup = async (file: File) => {
    if (!confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // قراءة الملف
      const text = await file.text();
      const backupData = JSON.parse(text);

      // التحقق من صحة البيانات
      if (!backupData.timestamp || !backupData.employees || !backupData.departments) {
        throw new Error('ملف النسخة الاحتياطية غير صالح');
      }

      // استعادة البيانات
      await databaseService.importFromJSON(text);

      // تسجيل العملية
      actions.logActivity('backup', 'restore', 'تم استعادة النسخة الاحتياطية');

      setSuccess('تم استعادة النسخة الاحتياطية بنجاح. سيتم إعادة تحميل الصفحة.');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setError('خطأ في استعادة النسخة الاحتياطية');
      console.error('خطأ في استعادة النسخة الاحتياطية:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * دالة تصدير البيانات إلى Excel
   */
  const handleExportToExcel = async (dataType: string) => {
    try {
      setLoading(true);
      
      switch (dataType) {
        case 'employees':
          await excelService.exportEmployees();
          break;
        case 'tasks':
          await excelService.exportTasks();
          break;
        case 'correspondence':
          await excelService.exportCorrespondence();
          break;
        case 'departments':
          await excelService.exportDepartments();
          break;
        case 'all':
          await excelService.exportFullReport();
          break;
      }

      setSuccess(`تم تصدير ${dataType === 'all' ? 'جميع البيانات' : dataType} بنجاح`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('خطأ في التصدير');
      console.error('خطأ في التصدير:', error);
    } finally {
      setLoading(false);
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">النسخ الاحتياطي</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* إنشاء نسخة احتياطية */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">إنشاء نسخة احتياطية</h4>
            <p className="text-sm text-gray-600">
              إنشاء نسخة احتياطية كاملة من جميع بيانات النظام
            </p>
            
            <button
              onClick={handleCreateFullBackup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {loading ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية كاملة'}
            </button>
          </div>

          {/* استعادة نسخة احتياطية */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">استعادة نسخة احتياطية</h4>
            <p className="text-sm text-gray-600">
              استعادة البيانات من ملف نسخة احتياطية
            </p>
            
            <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-gray-400 px-4 py-3 rounded-lg transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>اختيار ملف النسخة الاحتياطية</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleRestoreBackup(file);
                }}
              />
            </label>
          </div>

        </div>
      </div>

      {/* تصدير البيانات إلى Excel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">تصدير البيانات إلى Excel</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <button
            onClick={() => handleExportToExcel('employees')}
            disabled={loading}
            className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FileText className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium">الموظفين</span>
          </button>

          <button
            onClick={() => handleExportToExcel('tasks')}
            disabled={loading}
            className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FileText className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium">المهام</span>
          </button>

          <button
            onClick={() => handleExportToExcel('correspondence')}
            disabled={loading}
            className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium">المراسلات</span>
          </button>

          <button
            onClick={() => handleExportToExcel('departments')}
            disabled={loading}
            className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FileText className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium">الأقسام</span>
          </button>

          <button
            onClick={() => handleExportToExcel('attachments')}
            disabled={loading}
            className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FileText className="h-8 w-8 text-pink-600 mb-2" />
            <span className="text-sm font-medium">المرفقات</span>
          </button>

          <button
            onClick={() => handleExportToExcel('all')}
            disabled={loading}
            className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Database className="h-8 w-8 text-red-600 mb-2" />
            <span className="text-sm font-medium">جميع البيانات</span>
          </button>

        </div>
      </div>

      {/* النسخ الاحتياطي المتخصص */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">النسخ الاحتياطي المتخصص</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <h4 className="font-medium text-gray-900">نسخة احتياطية للمهام</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">جميع المهام والمرفقات المرتبطة</p>
            <button
              onClick={() => console.log('تصدير المهام')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              تصدير المهام
            </button>
          </div>

          <div className="border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-6 w-6 text-green-600" />
              <h4 className="font-medium text-gray-900">نسخة احتياطية للمراسلات</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">جميع المراسلات والمرفقات المرتبطة</p>
            <button
              onClick={() => console.log('تصدير المراسلات')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              تصدير المراسلات
            </button>
          </div>

          <div className="border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Database className="h-6 w-6 text-purple-600" />
              <h4 className="font-medium text-gray-900">نسخة احتياطية شاملة</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">جميع بيانات النظام مع المرفقات</p>
            <button
              onClick={() => excelService.exportFullSystemBackup()}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              تصدير شامل
            </button>
          </div>

        </div>
      </div>

      {/* الاستعادة المتخصصة */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">الاستعادة المتخصصة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">استعادة المهام فقط</h4>
            <p className="text-sm text-gray-600 mb-4">استعادة المهام دون التأثير على باقي البيانات</p>
            <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 hover:border-blue-400 px-4 py-2 rounded-lg transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>اختيار ملف المهام</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) console.log('استعادة المهام:', file.name);
                }}
              />
            </label>
          </div>

          <div className="border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">استعادة المراسلات فقط</h4>
            <p className="text-sm text-gray-600 mb-4">استعادة المراسلات دون التأثير على باقي البيانات</p>
            <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-green-300 hover:border-green-400 px-4 py-2 rounded-lg transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>اختيار ملف المراسلات</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) console.log('استعادة المراسلات:', file.name);
                }}
              />
            </label>
          </div>

          <div className="border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">استعادة شاملة</h4>
            <p className="text-sm text-gray-600 mb-4">استعادة جميع بيانات النظام</p>
            <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-purple-300 hover:border-purple-400 px-4 py-2 rounded-lg transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>اختيار النسخة الشاملة</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleRestoreBackup(file);
                }}
              />
            </label>
          </div>

        </div>
      </div>

      {/* تاريخ النسخ الاحتياطية */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">تاريخ النسخ الاحتياطية</h3>
          <button
            onClick={loadBackupHistory}
            className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </button>
        </div>

        {backupHistory.length > 0 ? (
          <div className="space-y-3">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{backup.name}</h4>
                    <p className="text-sm text-gray-600">
                      {backup.date.toLocaleDateString('ar-EG')} • {backup.size} • {backup.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    {backup.status}
                  </span>
                  <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>لا توجد نسخ احتياطية</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default BackupRestore;