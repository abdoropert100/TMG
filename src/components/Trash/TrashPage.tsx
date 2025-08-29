/**
 * صفحة سلة المحذوفات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import {
  Trash2, RotateCcw, X, Search, Filter, AlertTriangle,
  CheckCircle, Clock, Database, FileText, Users, Building2,
  RefreshCw, Download, Eye, Calendar
} from 'lucide-react';
import { TrashItem, TrashStats } from '../../types/trash';
import { trashService } from '../../services/TrashService';

const TrashPage: React.FC = () => {
  // حالات المكون
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<TrashItem[]>([]);
  const [stats, setStats] = useState<TrashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // حالات الفلترة
  const [filters, setFilters] = useState({
    search: '',
    entityType: '',
    deletedBy: '',
    dateFrom: '',
    dateTo: '',
    canRestore: ''
  });

  // حالات التحديد المتعدد
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // تحميل البيانات
  useEffect(() => {
    loadTrashData();
  }, []);

  // تطبيق الفلاتر
  useEffect(() => {
    applyFilters();
  }, [trashItems, filters]);

  /**
   * تحميل بيانات سلة المحذوفات
   */
  const loadTrashData = async () => {
    try {
      setLoading(true);
      const [items, statistics] = await Promise.all([
        trashService.getTrashItems(),
        trashService.getTrashStats()
      ]);
      setTrashItems(items);
      setStats(statistics);
      setError(null);
    } catch (err) {
      setError('خطأ في تحميل سلة المحذوفات');
      console.error('خطأ في تحميل سلة المحذوفات:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * تطبيق الفلاتر
   */
  const applyFilters = () => {
    let filtered = [...trashItems];

    // فلتر البحث
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.entityName.toLowerCase().includes(searchTerm) ||
        item.entityDescription?.toLowerCase().includes(searchTerm) ||
        item.deletedByName.toLowerCase().includes(searchTerm)
      );
    }

    // فلتر نوع العنصر
    if (filters.entityType) {
      filtered = filtered.filter(item => item.entityType === filters.entityType);
    }

    // فلتر من حذف
    if (filters.deletedBy) {
      filtered = filtered.filter(item => item.deletedBy === filters.deletedBy);
    }

    // فلتر التاريخ
    if (filters.dateFrom) {
      filtered = filtered.filter(item => item.deletedAt >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(item => item.deletedAt <= new Date(filters.dateTo));
    }

    // فلتر قابلية الاستعادة
    if (filters.canRestore) {
      filtered = filtered.filter(item => 
        filters.canRestore === 'yes' ? item.canRestore : !item.canRestore
      );
    }

    setFilteredItems(filtered);
  };

  /**
   * استعادة عنصر واحد
   */
  const handleRestoreItem = async (itemId: string) => {
    try {
      const result = await trashService.restoreFromTrash(itemId, 'current-user', 'استعادة من واجهة المستخدم');
      if (result.success) {
        await loadTrashData();
        setSuccess('تم استعادة العنصر بنجاح');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'خطأ في الاستعادة');
      }
    } catch (error) {
      setError('خطأ في استعادة العنصر');
      console.error('خطأ في الاستعادة:', error);
    }
  };

  /**
   * حذف نهائي لعنصر واحد
   */
  const handlePermanentDelete = async (itemId: string) => {
    if (confirm('هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        await trashService.permanentDelete(itemId, 'current-user');
        await loadTrashData();
        setSuccess('تم الحذف النهائي بنجاح');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setError('خطأ في الحذف النهائي');
        console.error('خطأ في الحذف النهائي:', error);
      }
    }
  };

  /**
   * استعادة متعددة
   */
  const handleBulkRestore = async () => {
    if (selectedItems.length === 0) return;
    
    if (confirm(`هل أنت متأكد من استعادة ${selectedItems.length} عنصر؟`)) {
      try {
        let successCount = 0;
        let errorCount = 0;

        for (const itemId of selectedItems) {
          try {
            const result = await trashService.restoreFromTrash(itemId, 'current-user', 'استعادة جماعية');
            if (result.success) successCount++;
            else errorCount++;
          } catch {
            errorCount++;
          }
        }

        await loadTrashData();
        setSelectedItems([]);
        setSelectAll(false);
        
        if (errorCount === 0) {
          setSuccess(`تم استعادة ${successCount} عنصر بنجاح`);
        } else {
          setError(`تم استعادة ${successCount} عنصر، فشل في ${errorCount} عنصر`);
        }
        
        setTimeout(() => { setSuccess(null); setError(null); }, 3000);
      } catch (error) {
        setError('خطأ في الاستعادة الجماعية');
        console.error('خطأ في الاستعادة الجماعية:', error);
      }
    }
  };

  /**
   * حذف نهائي متعدد
   */
  const handleBulkPermanentDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (confirm(`هل أنت متأكد من الحذف النهائي لـ ${selectedItems.length} عنصر؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      try {
        for (const itemId of selectedItems) {
          await trashService.permanentDelete(itemId, 'current-user');
        }

        await loadTrashData();
        setSelectedItems([]);
        setSelectAll(false);
        setSuccess(`تم الحذف النهائي لـ ${selectedItems.length} عنصر`);
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setError('خطأ في الحذف النهائي الجماعي');
        console.error('خطأ في الحذف النهائي الجماعي:', error);
      }
    }
  };

  /**
   * تحديد/إلغاء تحديد جميع العناصر
   */
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  /**
   * تحديد/إلغاء تحديد عنصر واحد
   */
  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const isSelected = prev.includes(itemId);
      if (isSelected) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  /**
   * الحصول على أيقونة نوع العنصر
   */
  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'employee': return <Users className="h-5 w-5 text-purple-600" />;
      case 'task': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'correspondence': return <FileText className="h-5 w-5 text-green-600" />;
      case 'department': return <Building2 className="h-5 w-5 text-orange-600" />;
      case 'division': return <Building2 className="h-5 w-5 text-indigo-600" />;
      case 'attachment': return <Database className="h-5 w-5 text-gray-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  /**
   * تنسيق حجم الملف
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * حساب الأيام المتبقية قبل الحذف النهائي
   */
  const getDaysUntilPermanentDelete = (autoDeleteAt: Date): number => {
    const now = new Date();
    const diffTime = autoDeleteAt.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="mr-2 text-gray-600">جاري تحميل سلة المحذوفات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* رسائل النجاح والخطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button onClick={() => setError(null)} className="mr-auto text-red-600 hover:text-red-800">×</button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-700">{success}</span>
          <button onClick={() => setSuccess(null)} className="mr-auto text-green-600 hover:text-green-800">×</button>
        </div>
      )}

      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">سلة المحذوفات</h1>
          <p className="text-gray-600">إدارة العناصر المحذوفة واستعادتها</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <>
              <button
                onClick={handleBulkRestore}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                استعادة المحدد ({selectedItems.length})
              </button>
              <button
                onClick={handleBulkPermanentDelete}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                حذف نهائي ({selectedItems.length})
              </button>
            </>
          )}
          <button
            onClick={loadTrashData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </button>
        </div>
      </div>

      {/* إحصائيات سلة المحذوفات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي العناصر</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <Trash2 className="h-8 w-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قابل للاستعادة</p>
                <p className="text-2xl font-bold text-green-600">{stats.restorableItems}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قريب الانتهاء</p>
                <p className="text-2xl font-bold text-orange-600">{stats.itemsNearExpiry}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الحجم الإجمالي</p>
                <p className="text-2xl font-bold text-blue-600">{formatFileSize(stats.totalSize)}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* شريط البحث والفلاتر */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في سلة المحذوفات..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="min-w-[150px]">
            <select
              value={filters.entityType}
              onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الأنواع</option>
              <option value="employee">موظفين</option>
              <option value="task">مهام</option>
              <option value="correspondence">مراسلات</option>
              <option value="department">إدارات</option>
              <option value="division">أقسام</option>
              <option value="attachment">مرفقات</option>
            </select>
          </div>

          <div className="min-w-[150px]">
            <select
              value={filters.canRestore}
              onChange={(e) => setFilters(prev => ({ ...prev, canRestore: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع العناصر</option>
              <option value="yes">قابل للاستعادة</option>
              <option value="no">غير قابل للاستعادة</option>
            </select>
          </div>
        </div>
      </div>

      {/* قائمة العناصر المحذوفة */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              العناصر المحذوفة ({filteredItems.length})
            </h2>
            
            {filteredItems.length > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">تحديد الكل</label>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تحديد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العنصر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  حُذف بواسطة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الحذف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ينتهي خلال
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const daysUntilDelete = getDaysUntilPermanentDelete(item.autoDeleteAt);
                const isSelected = selectedItems.includes(item.id);
                
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getEntityIcon(item.entityType)}
                        <div className="mr-3">
                          <div className="text-sm font-medium text-gray-900">{item.entityName}</div>
                          <div className="text-sm text-gray-500">{item.entityDescription}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.entityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.deletedByName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.deletedAt.toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        daysUntilDelete <= 7 ? 'bg-red-100 text-red-800' :
                        daysUntilDelete <= 30 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {daysUntilDelete} يوم
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {item.canRestore && (
                          <button
                            onClick={() => handleRestoreItem(item.id)}
                            className="text-green-600 hover:text-green-900"
                            title="استعادة"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="حذف نهائي"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Trash2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">سلة المحذوفات فارغة</p>
            <p className="text-sm mt-2">لا توجد عناصر محذوفة حالياً</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default TrashPage;