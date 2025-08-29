/**
 * أنواع بيانات سلة المحذوفات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

// عنصر في سلة المحذوفات
export interface TrashItem {
  id: string;
  originalId: string; // المعرف الأصلي للعنصر
  entityType: 'employee' | 'task' | 'correspondence' | 'department' | 'division' | 'attachment' | 'category';
  entityData: any; // البيانات الأصلية للعنصر
  entityName: string; // اسم العنصر للعرض
  entityDescription?: string; // وصف مختصر
  
  // معلومات الحذف
  deletedBy: string;
  deletedByName: string;
  deletedAt: Date;
  deleteReason?: string;
  deleteType: 'soft' | 'hard'; // نوع الحذف
  
  // معلومات الاستعادة
  canRestore: boolean;
  restoreComplexity: 'simple' | 'complex' | 'impossible';
  restoreNotes?: string;
  restoredAt?: Date;
  restoredBy?: string;
  
  // العلاقات المرتبطة
  relatedItems: {
    type: string;
    id: string;
    name: string;
    status: 'exists' | 'deleted' | 'missing';
  }[];
  
  // إعدادات الاحتفاظ
  retentionDays: number; // عدد أيام الاحتفاظ في السلة
  autoDeleteAt: Date; // تاريخ الحذف التلقائي النهائي
  
  // بيانات إضافية
  size?: number; // حجم البيانات
  attachmentsCount?: number; // عدد المرفقات المرتبطة
  dependenciesCount?: number; // عدد العناصر المعتمدة عليه
  
  metadata: {
    originalModule: string;
    originalPath: string;
    backupLocation?: string;
    checksumHash?: string;
  };
}

// إعدادات سلة المحذوفات
export interface TrashSettings {
  enabled: boolean;
  defaultRetentionDays: number;
  maxItemsInTrash: number;
  autoCleanupEnabled: boolean;
  autoCleanupInterval: number; // بالساعات
  
  // إعدادات حسب نوع العنصر
  retentionByType: {
    [entityType: string]: number; // أيام الاحتفاظ
  };
  
  // صلاحيات الاستعادة
  restorePermissions: {
    [role: string]: {
      canRestoreOwn: boolean;
      canRestoreAll: boolean;
      canPermanentDelete: boolean;
      maxRestoreAge: number; // بالأيام
    };
  };
}

// عملية استعادة
export interface RestoreOperation {
  id: string;
  trashItemId: string;
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  reason: string;
  notes?: string;
  
  // تفاصيل الاستعادة
  restoreToOriginalLocation: boolean;
  newLocation?: {
    module: string;
    parentId?: string;
  };
  
  // نتائج الاستعادة
  restoredItemId?: string;
  conflictsResolved?: {
    type: string;
    resolution: string;
  }[];
  
  completedAt?: Date;
  errorMessage?: string;
}

// إحصائيات سلة المحذوفات
export interface TrashStats {
  totalItems: number;
  itemsByType: { [type: string]: number };
  totalSize: number; // بالبايت
  oldestItem: Date;
  newestItem: Date;
  itemsNearExpiry: number; // العناصر القريبة من الحذف النهائي
  restorableItems: number;
  permanentlyDeletedToday: number;
}