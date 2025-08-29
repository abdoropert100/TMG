/**
 * صفحة فحص النظام الرئيسية
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState } from 'react';
import { 
  TestTube, 
  Activity, 
  FileText, 
  Settings,
  Play,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import SystemTestRunner from './SystemTestRunner';
import SystemHealthMonitor from './SystemHealthMonitor';
import ComponentTester from './ComponentTester';
import TestReportViewer from './TestReportViewer';

// أنواع التبويبات المتاحة
type TestTab = 'runner' | 'health' | 'components' | 'reports';

/**
 * صفحة فحص النظام الرئيسية
 * تجمع جميع أدوات الفحص والمراقبة في مكان واحد
 */
const SystemTestPage: React.FC = () => {
  // حالات المكون
  const [activeTab, setActiveTab] = useState<TestTab>('runner');
  const [lastTestReport, setLastTestReport] = useState<any>(null);

  // قائمة التبويبات
  const tabs = [
    {
      key: 'runner',
      label: 'الفحص الشامل',
      icon: TestTube,
      description: 'تشغيل فحص شامل لجميع مكونات النظام'
    },
    {
      key: 'health',
      label: 'مراقب الصحة',
      icon: Activity,
      description: 'مراقبة مباشرة لحالة النظام والأداء'
    },
    {
      key: 'components',
      label: 'فحص المكونات',
      icon: Settings,
      description: 'فحص المكونات الفردية بشكل منفصل'
    },
    {
      key: 'reports',
      label: 'التقارير',
      icon: FileText,
      description: 'عرض تقارير الفحص السابقة'
    }
  ];

  /**
   * دالة عرض محتوى التبويب النشط
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'runner':
        return <SystemTestRunner />;
      case 'health':
        return <SystemHealthMonitor />;
      case 'components':
        return <ComponentTester />;
      case 'reports':
        return lastTestReport ? (
          <TestReportViewer report={lastTestReport} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>لا توجد تقارير فحص متاحة</p>
            <p className="text-sm mt-2">قم بتشغيل الفحص الشامل أولاً</p>
          </div>
        );
      default:
        return <div>محتوى غير متاح</div>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* العنوان الرئيسي */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">فحص النظام الشامل</h1>
          <p className="text-gray-600">أدوات فحص ومراقبة نظام إدارة مصلحة الري</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>النظام نشط</span>
          </div>
        </div>
      </div>

      {/* معلومات سريعة */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <TestTube className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">نظام الفحص والمراقبة</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-lg font-bold text-blue-600">8</div>
            <div className="text-sm text-blue-800">مكونات رئيسية</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-lg font-bold text-green-600">15</div>
            <div className="text-sm text-green-800">فحص متاح</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-lg font-bold text-purple-600">24/7</div>
            <div className="text-sm text-purple-800">مراقبة مستمرة</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-lg font-bold text-orange-600">تلقائي</div>
            <div className="text-sm text-orange-800">تقارير شاملة</div>
          </div>
        </div>
      </div>

      {/* التبويبات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TestTab)}
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

        {/* وصف التبويب النشط */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {tabs.find(tab => tab.key === activeTab)?.description}
          </p>
        </div>

        {/* محتوى التبويب */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الفحص</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-3">أنواع الفحص المتاحة:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• فحص شامل لجميع المكونات</li>
              <li>• مراقبة مباشرة للأداء</li>
              <li>• فحص المكونات الفردية</li>
              <li>• تقارير مفصلة قابلة للتصدير</li>
              <li>• مراقبة استخدام الموارد</li>
              <li>• فحص سلامة البيانات</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-3">الفوائد:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• اكتشاف المشاكل مبكراً</li>
              <li>• تحسين الأداء العام</li>
              <li>• ضمان سلامة البيانات</li>
              <li>• تقليل وقت التوقف</li>
              <li>• تحسين تجربة المستخدم</li>
              <li>• توثيق حالة النظام</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SystemTestPage;