/**
 * مكون البحث الشامل المتقدم
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  CheckSquare, 
  Mail, 
  Users, 
  Building2,
  FileText,
  Target,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// واجهة نتيجة البحث
interface SearchResult {
  id: string;
  type: 'task' | 'employee' | 'correspondence' | 'department' | 'division';
  title: string;
  subtitle: string;
  description: string;
  relevance: number;
  data: any;
}

// واجهة خصائص البحث الشامل
interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick?: (result: SearchResult) => void;
}

/**
 * مكون البحث الشامل المتقدم
 * يبحث في جميع أنواع البيانات في النظام مع فلترة متقدمة
 */
const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onResultClick
}) => {
  // استخدام السياق للحصول على البيانات
  const { state, actions } = useApp();

  // حالات المكون
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'type'>('relevance');

  // أنواع البحث المتاحة
  const searchTypes = [
    { id: 'all', label: 'الكل', icon: Search, color: 'text-gray-600' },
    { id: 'tasks', label: 'المهام', icon: CheckSquare, color: 'text-blue-600' },
    { id: 'employees', label: 'الموظفين', icon: Users, color: 'text-green-600' },
    { id: 'correspondence', label: 'المراسلات', icon: Mail, color: 'text-purple-600' },
    { id: 'departments', label: 'الأقسام', icon: Building2, color: 'text-orange-600' }
  ];

  /**
   * تنفيذ البحث عند تغيير النص أو الفلاتر
   */
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchTerm, selectedFilters, sortBy]);

  /**
   * دالة تنفيذ البحث الشامل
   */
  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      const term = searchTerm.toLowerCase();

      // البحث في المهام
      if (selectedFilters.includes('all') || selectedFilters.includes('tasks')) {
        (state.tasks || []).forEach(task => {
          const relevance = calculateRelevance(term, [
            task.title,
            task.description,
            task.status,
            task.priority
          ]);

          if (relevance > 0) {
            searchResults.push({
              id: task.id,
              type: 'task',
              title: task.title,
              subtitle: `مهمة - ${task.status} - ${task.priority}`,
              description: task.description,
              relevance,
              data: task
            });
          }
        });
      }

      // البحث في الموظفين
      if (selectedFilters.includes('all') || selectedFilters.includes('employees')) {
        (state.employees || []).forEach(employee => {
          const relevance = calculateRelevance(term, [
            employee.name,
            employee.employeeNumber,
            employee.email || '',
            employee.position,
            employee.phone || ''
          ]);

          if (relevance > 0) {
            searchResults.push({
              id: employee.id,
              type: 'employee',
              title: employee.name,
              subtitle: `موظف - ${employee.position}`,
              description: `${employee.employeeNumber} - ${employee.email || 'لا يوجد بريد'} - ${employee.points} نقطة`,
              relevance,
              data: employee
            });
          }
        });
      }

      // البحث في المراسلات
      if (selectedFilters.includes('all') || selectedFilters.includes('correspondence')) {
        (state.correspondence || []).forEach(corr => {
          const relevance = calculateRelevance(term, [
            corr.subject,
            corr.number,
            corr.sender || '',
            corr.recipient || '',
            corr.notes || ''
          ]);

          if (relevance > 0) {
            searchResults.push({
              id: corr.id,
              type: 'correspondence',
              title: corr.subject,
              subtitle: `مراسلة ${corr.type} - ${corr.status} - ${corr.urgency}`,
              description: `${corr.number} - ${corr.type === 'وارد' ? corr.sender : corr.recipient}`,
              relevance,
              data: corr
            });
          }
        });
      }

      // البحث في الأقسام والإدارات
      if (selectedFilters.includes('all') || selectedFilters.includes('departments')) {
        (state.departments || []).forEach(dept => {
          const relevance = calculateRelevance(term, [
            dept.name,
            dept.description || ''
          ]);

          if (relevance > 0) {
            searchResults.push({
              id: dept.id,
              type: 'department',
              title: dept.name,
              subtitle: `إدارة - ${dept.employeeCount} موظف`,
              description: dept.description || '',
              relevance,
              data: dept
            });
          }
        });

        (state.divisions || []).forEach(div => {
          const relevance = calculateRelevance(term, [
            div.name,
            div.description || ''
          ]);

          if (relevance > 0) {
            const department = (state.departments || []).find(d => d.id === div.departmentId);
            searchResults.push({
              id: div.id,
              type: 'division',
              title: div.name,
              subtitle: `قسم - ${department?.name || 'غير محدد'}`,
              description: div.description || '',
              relevance,
              data: div
            });
          }
        });
      }

      // ترتيب النتائج
      let sortedResults = [...searchResults];
      switch (sortBy) {
        case 'relevance':
          sortedResults.sort((a, b) => b.relevance - a.relevance);
          break;
        case 'date':
          sortedResults.sort((a, b) => {
            const dateA = new Date(a.data.createdAt || a.data.date || 0);
            const dateB = new Date(b.data.createdAt || b.data.date || 0);
            return dateB.getTime() - dateA.getTime();
          });
          break;
        case 'type':
          sortedResults.sort((a, b) => a.type.localeCompare(b.type));
          break;
      }

      setResults(sortedResults.slice(0, 50)); // أفضل 50 نتيجة

    } catch (error) {
      console.error('خطأ في البحث:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * حساب درجة الصلة
   */
  const calculateRelevance = (searchTerm: string, fields: string[]): number => {
    let relevance = 0;
    
    fields.forEach(field => {
      if (field && field.toLowerCase().includes(searchTerm)) {
        // زيادة النقاط حسب موقع المطابقة
        if (field.toLowerCase().startsWith(searchTerm)) {
          relevance += 10; // مطابقة في البداية
        } else if (field.toLowerCase().includes(` ${searchTerm}`)) {
          relevance += 7; // مطابقة كلمة كاملة
        } else {
          relevance += 3; // مطابقة جزئية
        }
      }
    });

    return relevance;
  };

  /**
   * دالة الحصول على أيقونة نوع النتيجة
   */
  const getResultIcon = (type: string) => {
    const searchType = searchTypes.find(t => t.id === type || (type === 'division' && t.id === 'departments'));
    if (searchType) {
      const Icon = searchType.icon;
      return <Icon className={`h-5 w-5 ${searchType.color}`} />;
    }
    return <FileText className="h-5 w-5 text-gray-600" />;
  };

  /**
   * دالة تبديل فلتر البحث
   */
  const toggleFilter = (filterId: string) => {
    if (filterId === 'all') {
      setSelectedFilters(['all']);
    } else {
      setSelectedFilters(prev => {
        const newFilters = prev.filter(f => f !== 'all');
        if (newFilters.includes(filterId)) {
          const filtered = newFilters.filter(f => f !== filterId);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newFilters, filterId];
        }
      });
    }
  };

  /**
   * دالة معالجة النقر على النتيجة
   */
  const handleResultClick = (result: SearchResult) => {
    // التنقل إلى الصفحة المناسبة
    switch (result.type) {
      case 'task':
        actions.setCurrentPage('tasks');
        break;
      case 'employee':
        actions.setCurrentPage('employees');
        break;
      case 'correspondence':
        actions.setCurrentPage('correspondence');
        break;
      case 'department':
      case 'division':
        actions.setCurrentPage('departments');
        break;
    }

    if (onResultClick) {
      onResultClick(result);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        
        {/* رأس البحث */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث الشامل في جميع أنحاء النظام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                autoFocus
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* فلاتر البحث */}
          <div className="flex items-center gap-2 mt-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">البحث في:</span>
            {searchTypes.map(type => {
              const Icon = type.icon;
              const isSelected = selectedFilters.includes(type.id);
              
              return (
                <button
                  key={type.id}
                  onClick={() => toggleFilter(type.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* خيارات الترتيب */}
          <div className="flex items-center gap-4 mt-4">
            <span className="text-sm text-gray-600">ترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date' | 'type')}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="relevance">الصلة</option>
              <option value="date">التاريخ</option>
              <option value="type">النوع</option>
            </select>
          </div>
        </div>

        {/* نتائج البحث */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-gray-600">جاري البحث...</span>
            </div>
          )}

          {!loading && searchTerm.length >= 2 && results.length === 0 && (
            <div className="text-center p-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد نتائج للبحث عن "{searchTerm}"</p>
              <p className="text-sm mt-2">جرب استخدام كلمات مختلفة أو تغيير الفلاتر</p>
            </div>
          )}

          {!loading && searchTerm.length < 2 && (
            <div className="text-center p-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>اكتب حرفين على الأقل للبحث</p>
              <p className="text-sm mt-2">يمكنك البحث في المهام، الموظفين، المراسلات، والأقسام</p>
            </div>
          )}

          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}-${index}`}
              onClick={() => handleResultClick(result)}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 text-right"
            >
              <div className="flex-shrink-0">
                {getResultIcon(result.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                <p className="text-xs text-gray-500 truncate">{result.description}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="text-xs text-gray-400">
                  صلة: {result.relevance}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  {result.type === 'task' && <Target className="h-3 w-3 inline mr-1" />}
                  {result.type === 'correspondence' && <Calendar className="h-3 w-3 inline mr-1" />}
                  {result.data.createdAt && new Date(result.data.createdAt).toLocaleDateString('ar-EG')}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* تذييل البحث */}
        {results.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                تم العثور على {results.length} نتيجة للبحث عن "{searchTerm}"
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>مرتب حسب: {sortBy === 'relevance' ? 'الصلة' : sortBy === 'date' ? 'التاريخ' : 'النوع'}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default GlobalSearch;