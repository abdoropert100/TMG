/**
 * أنواع بيانات التصنيفات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

// تصنيف عام قابل للاستخدام في المهام والمراسلات
export interface Category {
  id: string;
  name: string;
  description: string;
  color: string; // لون التصنيف
  icon?: string; // أيقونة التصنيف
  parentId?: string; // للتصنيفات الفرعية
  level: number; // مستوى التصنيف (0 = رئيسي، 1 = فرعي، إلخ)
  sortOrder: number; // ترتيب العرض
  isActive: boolean;
  
  // نطاق الاستخدام
  applicableModules: ('tasks' | 'correspondence' | 'both')[];
  
  // إعدادات الرؤية والصلاحيات
  visibilityLevel: 'public' | 'department' | 'sector' | 'restricted';
  allowedRoles: UserRole[];
  
  // إحصائيات الاستخدام
  usageCount: number;
  lastUsed?: Date;
  
  // بيانات التتبع
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  deletedAt?: Date;
}

// تصنيف فرعي
export interface SubCategory {
  id: string;
  name: string;
  parentCategoryId: string;
  description: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ربط التصنيفات بالكيانات
export interface CategoryAssignment {
  id: string;
  categoryId: string;
  entityType: 'task' | 'correspondence_incoming' | 'correspondence_outgoing';
  entityId: string;
  assignedBy: string;
  assignedAt: Date;
  isPrimary: boolean; // التصنيف الرئيسي
}

// إعدادات التصنيفات
export interface CategorySettings {
  allowMultipleCategories: boolean; // السماح بتصنيفات متعددة
  requireCategory: boolean; // إجبارية التصنيف
  maxCategoriesPerItem: number; // الحد الأقصى للتصنيفات لكل عنصر
  allowUserDefinedCategories: boolean; // السماح للمستخدمين بإنشاء تصنيفات
  autoSuggestCategories: boolean; // اقتراح تصنيفات تلقائي
  categoryHierarchyDepth: number; // عمق التسلسل الهرمي
}

// فلتر التصنيفات
export interface CategoryFilter {
  categoryIds: string[];
  includeSubcategories: boolean;
  operator: 'AND' | 'OR'; // طريقة دمج التصنيفات
}

import { UserRole } from './auth';