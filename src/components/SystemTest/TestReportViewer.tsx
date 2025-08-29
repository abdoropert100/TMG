/**
 * مكون عارض تقرير الفحص
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  Download,
  Eye,
  Filter,
  Search,
  Calendar,
  BarChart3,
  TrendingUp,
  Target
} from 'lucide-react';

// واجهة خصائص عارض التقرير
interface TestReportViewerProps {
  report: any;
  onClose?: () => void;
}

/**
 * مكون عارض تقرير الفحص المفصل
 */
const TestReportViewer: React.FC<TestReportViewerProps> = ({ report, onClose }) => {
  // حالات المكون
  const [activeFilter, setActiveFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedResults, setExpandedResults] = useState<string[]>([]);

  /**
   * فلترة النتائج حسب الحالة والبحث
   */
  const filteredResults = React.useMemo(() => {
    let filtered = report.results || [];

    // فلترة حسب الحالة
    if (activeFilter !== 'all') {
      filtered = filtered.filter((result: any) => result.status === activeFilter);
    }

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter((result: any) =>
        result.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [report.results, activeFilter, searchTerm]);

  /**
   * دالة توسيع/طي النتيجة
   */
  const toggleExpanded = (resultId: string) => {
    setExpandedResults(prev =>
      prev.includes(resultId)
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  /**
   * دالة الحصول على أيقونة الحالة
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  /**
   * دالة الحصول على لون الحالة
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  /**
   * دالة تصدير التقرير
   */
  const exportReport = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const reportData = JSON.stringify(report, null, 2);
      const blob = new Blob([reportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `تقرير-فحص-النظام-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvContent = [
        ['المكون', 'الحالة', 'الرسالة', 'وقت التنفيذ'],
        ...report.results.map((result: any) => [
          result.component,
          result.status,
          result.message,
          result.executionTime || 0
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `تقرير-فحص-النظام-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* العنوان والإحصائيات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">تقرير فحص النظام</h2>
            <p className="text-gray-600">
              تم إنشاؤه في {new Date(report.timestamp).toLocaleString('ar-EG')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportReport('json')}
              className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              JSON
            </button>
            <button
              onClick={() => exportReport('csv')}
              className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              CSV
            </button>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{report.passedTests}</div>
            <div className="text-sm text-green-800">نجح</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{report.warningTests}</div>
            <div className="text-sm text-yellow-800">تحذير</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{report.failedTests}</div>
            <div className="text-sm text-red-800">فشل</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{report.totalTests}</div>
            <div className="text-sm text-blue-800">إجمالي</div>
          </div>
        </div>
      </div>

      {/* فلاتر البحث */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* البحث */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في النتائج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* فلاتر الحالة */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'الكل', count: report.totalTests },
              { key: 'success', label: 'نجح', count: report.passedTests },
              { key: 'warning', label: 'تحذير', count: report.warningTests },
              { key: 'error', label: 'فشل', count: report.failedTests }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                <span className="bg-white px-2 py-0.5 rounded-full text-xs">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* النتائج المفلترة */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            النتائج ({filteredResults.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredResults.map((result: any, index: number) => {
            const isExpanded = expandedResults.includes(result.component);
            
            return (
              <div key={index} className={`p-6 ${getStatusColor(result.status)}`}>
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpanded(result.component)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{result.component}</h4>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.executionTime && (
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {result.executionTime}ms
                      </span>
                    )}
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* التفاصيل الموسعة */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    
                    {result.details && result.details.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-800 mb-2">التفاصيل:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {result.details.map((detail: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.errors && result.errors.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-red-800 mb-2">الأخطاء:</h5>
                        <ul className="text-sm text-red-600 space-y-1">
                          {result.errors.map((error: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <XCircle className="h-3 w-3" />
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.warnings && result.warnings.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-yellow-800 mb-2">التحذيرات:</h5>
                        <ul className="text-sm text-yellow-600 space-y-1">
                          {result.warnings.map((warning: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.suggestions && result.suggestions.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-blue-800 mb-2">الاقتراحات:</h5>
                        <ul className="text-sm text-blue-600 space-y-1">
                          {result.suggestions.map((suggestion: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <Target className="h-3 w-3" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredResults.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>لا توجد نتائج تطابق معايير البحث</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default TestReportViewer;