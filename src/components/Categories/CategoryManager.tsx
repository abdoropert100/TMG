/**
 * مدير التصنيفات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Edit, Trash2, Search, Filter, Save,
  CheckCircle, AlertTriangle, Eye, X, Palette
} from 'lucide-react';
import { Category } from '../../types/categories';
import { categoryService } from '../../services/CategoryService';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  module?: 'tasks' | 'correspondence' | 'both';
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose, module = 'both' }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // حالات النموذج
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    applicableModules: ['both'] as ('tasks' | 'correspondence' | 'both')[],
    visibilityLevel: 'public' as 'public' | 'department' | 'sector' | 'restricted'
  });

  // حالات الفلترة
  const [filters, setFilters] = useState({
    search: '',
    module: '',
    visibilityLevel: ''
  });

  // تحميل البيانات
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // تطبيق الفلاتر
  useEffect(() => {
    applyFilters();
  }, [categories, filters]);

  /**
   * تحميل التصنيفات
   */
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('خطأ في تحميل التصنيفات');
      console.error('خطأ في تحميل التصنيفات:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * تطبيق الفلاتر
   */
  const applyFilters = () => {
    let filtered = [...categories];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm) ||
        cat.description.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.module) {
      filtered = filtered.filter(cat =>
        cat.applicableModules.includes(filters.module as any) ||
        cat.applicableModules.includes('both')
      );
    }

    if (filters.visibilityLevel) {
      filtered = filtered.filter(cat => cat.visibilityLevel === filters.visibilityLevel);
    }

    setFilteredCategories(filtered);
  };

  /**
   * حفظ التصنيف
   */
  const handleSaveCategory = async () => {
    try {
      if (!formData.name.trim()) {
        setError('اسم التصنيف مطلوب');
        return;
      }

      setLoading(true);

      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, {
          ...formData,
          updatedBy: 'current-user'
        });
        setSuccess('تم تحديث التصنيف بنجاح');
      } else {
        await categoryService.createCategory({
          ...formData,
          createdBy: 'current-user'
        });
        setSuccess('تم إنشاء التصنيف بنجاح');
      }

      await loadCategories();
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      setTimeout(() => setSuccess(null), 3000);

    } catch (error) {
      setError('خطأ في حفظ التصنيف');
      console.error('خطأ في حفظ التصنيف:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * حذف التصنيف
   */
  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      try {
        await categoryService.deleteCategory(categoryId);
        await loadCategories();
        setSuccess('تم حذف التصنيف بنجاح');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setError('خطأ في حذف التصنيف');
        console.error('خطأ في حذف التصنيف:', error);
      }
    }
  };

  /**
   * فتح نموذج التعديل
   */
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      applicableModules: category.applicableModules,
      visibilityLevel: category.visibilityLevel
    });
    setShowForm(true);
  };

  /**
   * إعادة تعيين النموذج
   */
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      applicableModules: ['both'],
      visibilityLevel: 'public'
    });
    setEditingCategory(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Tag className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">إدارة التصنيفات</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* رسائل النجاح والخطأ */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="mr-auto text-red-600 hover:text-red-800">×</button>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-700">{success}</span>
            <button onClick={() => setSuccess(null)} className="mr-auto text-green-600 hover:text-green-800">×</button>
          </div>
        )}

        {/* المحتوى الرئيسي */}
        <div className="p-6 space-y-6">
          
          {/* شريط الإجراءات */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في التصنيفات..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={filters.module}
                onChange={(e) => setFilters(prev => ({ ...prev, module: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">جميع الوحدات</option>
                <option value="tasks">المهام</option>
                <option value="correspondence">المراسلات</option>
                <option value="both">مشترك</option>
              </select>
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              إضافة تصنيف جديد
            </button>
          </div>

          {/* نموذج إضافة/تعديل التصنيف */}
          {showForm && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم التصنيف *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="اسم التصنيف"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="وصف التصنيف"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نطاق الاستخدام</label>
                  <select
                    value={formData.applicableModules[0]}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      applicableModules: [e.target.value as any] 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="both">المهام والمراسلات</option>
                    <option value="tasks">المهام فقط</option>
                    <option value="correspondence">المراسلات فقط</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">مستوى الرؤية</label>
                  <select
                    value={formData.visibilityLevel}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      visibilityLevel: e.target.value as any 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="public">عام</option>
                    <option value="department">على مستوى الإدارة</option>
                    <option value="sector">على مستوى القطاع</option>
                    <option value="restricted">مقيد</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveCategory}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* قائمة التصنيفات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map(category => (
              <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="تعديل"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{category.description}</p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {category.applicableModules.join(', ')}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {category.visibilityLevel}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    استُخدم {category.usageCount} مرة
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">لا توجد تصنيفات</p>
              <p className="text-sm mt-2">ابدأ بإضافة تصنيف جديد</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default CategoryManager;