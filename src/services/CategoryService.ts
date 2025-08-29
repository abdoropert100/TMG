/**
 * خدمة إدارة التصنيفات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { databaseService } from './DatabaseService';
import { Category, SubCategory, CategoryAssignment, CategoryFilter } from '../types/categories';

class CategoryService {
  /**
   * الحصول على جميع التصنيفات
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      return await databaseService.getAll<Category>('categories');
    } catch (error) {
      console.error('خطأ في تحميل التصنيفات:', error);
      return [];
    }
  }

  /**
   * الحصول على التصنيفات حسب الوحدة
   */
  async getCategoriesByModule(module: 'tasks' | 'correspondence' | 'both'): Promise<Category[]> {
    try {
      const allCategories = await this.getAllCategories();
      return allCategories.filter(cat => 
        cat.applicableModules.includes(module) || cat.applicableModules.includes('both')
      );
    } catch (error) {
      console.error('خطأ في تحميل تصنيفات الوحدة:', error);
      return [];
    }
  }

  /**
   * إنشاء تصنيف جديد
   */
  async createCategory(categoryData: Partial<Category>): Promise<string> {
    try {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: categoryData.name!,
        description: categoryData.description || '',
        color: categoryData.color || '#3B82F6',
        icon: categoryData.icon,
        parentId: categoryData.parentId,
        level: categoryData.parentId ? 1 : 0,
        sortOrder: categoryData.sortOrder || 0,
        isActive: true,
        applicableModules: categoryData.applicableModules || ['both'],
        visibilityLevel: categoryData.visibilityLevel || 'public',
        allowedRoles: categoryData.allowedRoles || [],
        usageCount: 0,
        createdBy: categoryData.createdBy!,
        createdAt: new Date(),
        updatedBy: categoryData.createdBy!,
        updatedAt: new Date()
      };

      const categoryId = await databaseService.add('categories', newCategory);
      
      // تسجيل العملية
      await this.logCategoryActivity('create', categoryId, `تم إنشاء تصنيف جديد: ${newCategory.name}`);
      
      return categoryId;
    } catch (error) {
      console.error('خطأ في إنشاء التصنيف:', error);
      throw error;
    }
  }

  /**
   * تحديث تصنيف
   */
  async updateCategory(categoryId: string, updateData: Partial<Category>): Promise<void> {
    try {
      await databaseService.update('categories', categoryId, {
        ...updateData,
        updatedAt: new Date()
      });

      await this.logCategoryActivity('update', categoryId, `تم تحديث التصنيف: ${categoryId}`);
    } catch (error) {
      console.error('خطأ في تحديث التصنيف:', error);
      throw error;
    }
  }

  /**
   * حذف تصنيف
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // فحص الاستخدام قبل الحذف
      const assignments = await this.getCategoryAssignments(categoryId);
      if (assignments.length > 0) {
        throw new Error('لا يمكن حذف التصنيف لأنه مستخدم في عناصر أخرى');
      }

      await databaseService.delete('categories', categoryId);
      await this.logCategoryActivity('delete', categoryId, `تم حذف التصنيف: ${categoryId}`);
    } catch (error) {
      console.error('خطأ في حذف التصنيف:', error);
      throw error;
    }
  }

  /**
   * ربط تصنيف بعنصر
   */
  async assignCategoryToEntity(
    categoryId: string, 
    entityType: 'task' | 'correspondence_incoming' | 'correspondence_outgoing',
    entityId: string,
    assignedBy: string,
    isPrimary: boolean = false
  ): Promise<void> {
    try {
      const assignment: CategoryAssignment = {
        id: `assign-${Date.now()}`,
        categoryId,
        entityType,
        entityId,
        assignedBy,
        assignedAt: new Date(),
        isPrimary
      };

      await databaseService.add('category_assignments', assignment);
      
      // تحديث عداد الاستخدام
      await this.incrementCategoryUsage(categoryId);
      
    } catch (error) {
      console.error('خطأ في ربط التصنيف:', error);
      throw error;
    }
  }

  /**
   * إلغاء ربط تصنيف من عنصر
   */
  async unassignCategoryFromEntity(categoryId: string, entityId: string): Promise<void> {
    try {
      const assignments = await databaseService.getAll<CategoryAssignment>('category_assignments');
      const assignment = assignments.find(a => 
        a.categoryId === categoryId && a.entityId === entityId
      );

      if (assignment) {
        await databaseService.delete('category_assignments', assignment.id);
        await this.decrementCategoryUsage(categoryId);
      }
    } catch (error) {
      console.error('خطأ في إلغاء ربط التصنيف:', error);
      throw error;
    }
  }

  /**
   * الحصول على تصنيفات عنصر معين
   */
  async getEntityCategories(entityType: string, entityId: string): Promise<Category[]> {
    try {
      const assignments = await databaseService.getAll<CategoryAssignment>('category_assignments');
      const entityAssignments = assignments.filter(a => 
        a.entityType === entityType && a.entityId === entityId
      );

      const categories = await this.getAllCategories();
      return categories.filter(cat => 
        entityAssignments.some(a => a.categoryId === cat.id)
      );
    } catch (error) {
      console.error('خطأ في تحميل تصنيفات العنصر:', error);
      return [];
    }
  }

  /**
   * البحث في التصنيفات
   */
  async searchCategories(query: string, module?: string): Promise<Category[]> {
    try {
      const allCategories = await this.getAllCategories();
      let filtered = allCategories;

      if (module) {
        filtered = filtered.filter(cat => 
          cat.applicableModules.includes(module as any) || 
          cat.applicableModules.includes('both')
        );
      }

      if (query) {
        const searchTerm = query.toLowerCase();
        filtered = filtered.filter(cat =>
          cat.name.toLowerCase().includes(searchTerm) ||
          cat.description.toLowerCase().includes(searchTerm)
        );
      }

      return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
    } catch (error) {
      console.error('خطأ في البحث في التصنيفات:', error);
      return [];
    }
  }

  /**
   * الحصول على التصنيفات الأكثر استخداماً
   */
  async getPopularCategories(limit: number = 10): Promise<Category[]> {
    try {
      const categories = await this.getAllCategories();
      return categories
        .filter(cat => cat.usageCount > 0)
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit);
    } catch (error) {
      console.error('خطأ في تحميل التصنيفات الشائعة:', error);
      return [];
    }
  }

  /**
   * تهيئة التصنيفات الافتراضية
   */
  async initializeDefaultCategories(): Promise<void> {
    try {
      const existingCategories = await this.getAllCategories();
      if (existingCategories.length > 0) return;

      const defaultCategories = [
        // تصنيفات المهام
        { name: 'صيانة', description: 'مهام الصيانة والإصلاح', color: '#F59E0B', modules: ['tasks'] },
        { name: 'تطوير', description: 'مهام التطوير والتحسين', color: '#3B82F6', modules: ['tasks'] },
        { name: 'طوارئ', description: 'مهام الطوارئ العاجلة', color: '#EF4444', modules: ['tasks'] },
        { name: 'تدريب', description: 'مهام التدريب والتأهيل', color: '#8B5CF6', modules: ['tasks'] },
        { name: 'مشروع', description: 'مهام المشاريع الكبرى', color: '#10B981', modules: ['tasks'] },
        
        // تصنيفات المراسلات
        { name: 'استفسار', description: 'مراسلات الاستفسارات', color: '#06B6D4', modules: ['correspondence'] },
        { name: 'شكوى', description: 'مراسلات الشكاوى', color: '#F97316', modules: ['correspondence'] },
        { name: 'طلب', description: 'مراسلات الطلبات', color: '#84CC16', modules: ['correspondence'] },
        { name: 'تقرير', description: 'مراسلات التقارير', color: '#6366F1', modules: ['correspondence'] },
        { name: 'إشعار', description: 'مراسلات الإشعارات', color: '#EC4899', modules: ['correspondence'] },
        
        // تصنيفات مشتركة
        { name: 'عاجل', description: 'عناصر تحتاج معالجة عاجلة', color: '#DC2626', modules: ['both'] },
        { name: 'مهم', description: 'عناصر مهمة', color: '#D97706', modules: ['both'] },
        { name: 'روتيني', description: 'عناصر روتينية', color: '#059669', modules: ['both'] }
      ];

      for (const catData of defaultCategories) {
        await this.createCategory({
          ...catData,
          applicableModules: catData.modules as any,
          createdBy: 'system'
        });
      }

    } catch (error) {
      console.error('خطأ في تهيئة التصنيفات الافتراضية:', error);
    }
  }

  /**
   * زيادة عداد استخدام التصنيف
   */
  private async incrementCategoryUsage(categoryId: string): Promise<void> {
    try {
      const category = await databaseService.getById<Category>('categories', categoryId);
      if (category) {
        await databaseService.update('categories', categoryId, {
          usageCount: (category.usageCount || 0) + 1,
          lastUsed: new Date()
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث عداد الاستخدام:', error);
    }
  }

  /**
   * تقليل عداد استخدام التصنيف
   */
  private async decrementCategoryUsage(categoryId: string): Promise<void> {
    try {
      const category = await databaseService.getById<Category>('categories', categoryId);
      if (category && category.usageCount > 0) {
        await databaseService.update('categories', categoryId, {
          usageCount: category.usageCount - 1
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث عداد الاستخدام:', error);
    }
  }

  /**
   * الحصول على ربط التصنيفات لتصنيف معين
   */
  private async getCategoryAssignments(categoryId: string): Promise<CategoryAssignment[]> {
    try {
      const assignments = await databaseService.getAll<CategoryAssignment>('category_assignments');
      return assignments.filter(a => a.categoryId === categoryId);
    } catch (error) {
      console.error('خطأ في تحميل ربط التصنيفات:', error);
      return [];
    }
  }

  /**
   * تسجيل نشاط التصنيفات
   */
  private async logCategoryActivity(action: string, categoryId: string, description: string): Promise<void> {
    try {
      await databaseService.add('activity_logs', {
        id: `cat-${Date.now()}`,
        module: 'categories',
        action,
        entityId: categoryId,
        userId: 'current-user', // سيتم تحديثه من السياق
        userName: 'مستخدم النظام',
        details: description,
        timestamp: new Date(),
        ipAddress: 'localhost'
      });
    } catch (error) {
      console.error('خطأ في تسجيل نشاط التصنيف:', error);
    }
  }
}

export const categoryService = new CategoryService();
export default CategoryService;