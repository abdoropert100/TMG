/**
 * مكون تشغيل فحص النظام
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Download,
  RefreshCw,
  FileText,
  Clock,
  Target,
  Database,
  Settings,
  Users,
  Mail,
  BarChart3
} from 'lucide-react';
import { runSystemTest } from '../../utils/systemTester';

// واجهة نتيجة الفحص
interface TestResult {
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string[];
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
  executionTime?: number;
}

/**
 * مكون تشغيل فحص النظام
 */
const SystemTestRunner: React.FC = () => {
  // حالات المكون
  const [isRunning, setIsRunning] = useState(false);
  const [testReport, setTestReport] = useState<any>(null);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);

  /**
   * دالة تشغيل الفحص الشامل
   */
  const handleRunTest = async () => {
    setIsRunning(true);
    setTestReport(null);
    setProgress(0);

    try {
      // محاكاة تقدم الفحص
      const testSteps = [
        'فحص قاعدة البيانات...',
        'فحص الخدمات...',
        'فحص مكونات لوحة التحكم...',
        'فحص مكونات المهام...',
        'فحص مكونات المراسلات...',
        'فحص مكونات الموظفين...',
        'فحص مكونات الأقسام...',
        'فحص مكونات التقارير...',
        'فحص مكونات الإعدادات...',
        'فحص واجهة المستخدم...',
        'فحص التكامل...',
        'فحص الأداء...',
        'إنشاء التقرير النهائي...'
      ];

      for (let i = 0; i < testSteps.length; i++) {
        setCurrentTest(testSteps[i]);
        setProgress(Math.round(((i + 1) / testSteps.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 500)); // تأخير للعرض
      }

      // تشغيل الفحص الفعلي
      const report = await runSystemTest();
      setTestReport(report);

    } catch (error) {
      console.error('خطأ في تشغيل الفحص:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
      setProgress(100);
    }
  };

  /**
   * دالة الحصول على أيقونة الحالة
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  /**
   * دالة الحصول على لون الحالة
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  /**
   * دالة الحصول على أيقونة المكون
   */
  const getComponentIcon = (component: string) => {
    if (component.includes('database')) return <Database className="h-4 w-4" />;
    if (component.includes('task')) return <Target className="h-4 w-4" />;
    if (component.includes('correspondence')) return <Mail className="h-4 w-4" />;
    if (component.includes('employee')) return <Users className="h-4 w-4" />;
    if (component.includes('department')) return <Settings className="h-4 w-4" />;
    if (component.includes('report')) return <BarChart3 className="h-4 w-4" />;
    if (component.includes('settings')) return <Settings className="h-4 w-4" />;
    if (component.includes('ui')) return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      
      {/* العنوان والتحكم */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">فحص النظام الشامل</h1>
          <p className="text-gray-600">فحص جميع مكونات النظام للتأكد من سلامة العمل</p>
        </div>
        <div className="flex items-center gap-3">
          {testReport && (
            <button
              onClick={() => {
                const reportData = JSON.stringify(testReport, null, 2);
                const blob = new Blob([reportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `تقرير-فحص-النظام-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              تحميل التقرير
            </button>
          )}
          <button
            onClick={handleRunTest}
            disabled={isRunning}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'جاري الفحص...' : 'بدء الفحص الشامل'}
          </button>
        </div>
      </div>

      {/* شريط التقدم */}
      {isRunning && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">جاري تشغيل الفحص</h3>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-600">{currentTest}</p>
        </div>
      )}

      {/* نتائج الفحص */}
      {testReport && (
        <div className="space-y-6">
          
          {/* ملخص النتائج */}
          <div className={`rounded-xl border p-6 ${getStatusColor(testReport.overallStatus)}`}>
            <div className="flex items-center gap-3 mb-4">
              {getStatusIcon(testReport.overallStatus)}
              <h2 className="text-xl font-semibold">
                نتيجة الفحص: {testReport.overallStatus === 'healthy' ? 'سليم' : 
                              testReport.overallStatus === 'warning' ? 'تحذيرات' : 'مشاكل حرجة'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testReport.passedTests}</div>
                <div className="text-sm">اختبارات ناجحة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{testReport.warningTests}</div>
                <div className="text-sm">تحذيرات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testReport.failedTests}</div>
                <div className="text-sm">أخطاء</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testReport.executionTime}ms</div>
                <div className="text-sm">وقت التنفيذ</div>
              </div>
            </div>
          </div>

          {/* التوصيات */}
          {testReport.recommendations && testReport.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 التوصيات</h3>
              <ul className="space-y-2">
                {testReport.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-blue-800">
                    <span className="text-blue-600 font-bold">{index + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* نتائج مفصلة */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">نتائج الفحص المفصلة</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {testReport.results.map((result: TestResult, index: number) => (
                <div key={index} className="p-6">
                  <div className="flex items-start gap-3">
                    
                    {/* أيقونة الحالة */}
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(result.status)}
                    </div>

                    {/* محتوى النتيجة */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getComponentIcon(result.component)}
                        <h4 className="font-medium text-gray-900">{result.component}</h4>
                        {result.executionTime && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {result.executionTime}ms
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3">{result.message}</p>

                      {/* التفاصيل */}
                      {result.details && result.details.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-800 mb-1">التفاصيل:</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {result.details.map((detail, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* الأخطاء */}
                      {result.errors && result.errors.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-red-800 mb-1">الأخطاء:</h5>
                          <ul className="text-sm text-red-600 space-y-1">
                            {result.errors.map((error, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <XCircle className="h-3 w-3" />
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* التحذيرات */}
                      {result.warnings && result.warnings.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-yellow-800 mb-1">التحذيرات:</h5>
                          <ul className="text-sm text-yellow-600 space-y-1">
                            {result.warnings.map((warning, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3" />
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* الاقتراحات */}
                      {result.suggestions && result.suggestions.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-blue-800 mb-1">الاقتراحات:</h5>
                          <ul className="text-sm text-blue-600 space-y-1">
                            {result.suggestions.map((suggestion, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <Target className="h-3 w-3" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* معلومات الفحص */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الفحص</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">ما يتم فحصه:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                قاعدة البيانات والاتصال
              </li>
              <li className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                مكونات إدارة المهام
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                مكونات إدارة المراسلات
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                مكونات إدارة الموظفين
              </li>
              <li className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                مكونات الإعدادات
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                مكونات التقارير
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">الفحوصات المتقدمة:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• فحص سلامة البيانات</li>
              <li>• اختبار العمليات الأساسية (CRUD)</li>
              <li>• فحص التكامل بين المكونات</li>
              <li>• اختبار الأداء وسرعة الاستجابة</li>
              <li>• فحص دعم المتصفح</li>
              <li>• اختبار الخدمات والواجهات</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SystemTestRunner;