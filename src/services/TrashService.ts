/**
 * خدمة سلة المحذوفات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { databaseService } from './DatabaseService';
import { TrashItem, TrashSettings, RestoreOperation, TrashStats } from '../types/trash';

class TrashService {
  /**
   * نقل عنصر إلى سلة المحذوفات
   */
  async moveToTrash(
    entityType: string,
    entityId: string,
    entityData: any,
    deletedBy: string,
    deleteReason?: string
  ): Promise<string> {
    try {
      const trashItem: TrashItem = {
        id: `trash-${Date.now()}`,
        originalId: entityId,
        entityType: entityType as any,
        entityData,
        entityName: this.getEntityName(entityType, entityData),
        entityDescription: this.getEntityDescription(entityType, entityData),
        deletedBy,
        deletedByName: await this.getUserName(deletedBy),
        deletedAt: new Date(),
        deleteReason,
        deleteType: 'soft',
        canRestore: true,
        restoreComplexity: this.assessRestoreComplexity(entityType, entityData),
        relatedItems: await this.findRelatedItems(entityType, entityId),
        retentionDays: await this.getRetentionDays(entityType),
        autoDeleteAt: new Date(Date.now() + (await this.getRetentionDays(entityType)) * 24 * 60 * 60 * 1000),
        size: JSON.stringify(entityData).length,
        attachmentsCount: this.countAttachments(entityData),
        dependenciesCount: await this.countDependencies(entityType, entityId),
        metadata: {
          originalModule: entityType,
          originalPath: this.getOriginalPath(entityType),
          checksumHash: this.generateChecksum(entityData)
        }
      };

      const trashId = await databaseService.add('trash_items', trashItem);
      
      // تسجيل العملية
      await this.logTrashActivity('move_to_trash', trashId, 
        `تم نقل ${entityType} إلى سلة المحذوفات: ${trashItem.entityName}`);
      
      return trashId;
    } catch (error) {
      console.error('خطأ في نقل العنصر إلى سلة المحذوفات:', error);
      throw error;
    }
  }

  /**
   * استعادة عنصر من سلة المحذوفات
   */
  async restoreFromTrash(trashItemId: string, restoredBy: string, reason: string): Promise<{
    success: boolean;
    restoredItemId?: string;
    error?: string;
  }> {
    try {
      const trashItem = await databaseService.getById<TrashItem>('trash_items', trashItemId);
      if (!trashItem) {
        return { success: false, error: 'العنصر غير موجود في سلة المحذوفات' };
      }

      if (!trashItem.canRestore) {
        return { success: false, error: 'لا يمكن استعادة هذا العنصر' };
      }

      // فحص التعارضات
      const conflicts = await this.checkRestoreConflicts(trashItem);
      if (conflicts.length > 0) {
        return { success: false, error: `تعارضات في الاستعادة: ${conflicts.join(', ')}` };
      }

      // استعادة العنصر
      const restoredData = {
        ...trashItem.entityData,
        id: trashItem.originalId,
        deletedAt: null,
        restoredAt: new Date(),
        restoredBy
      };

      await databaseService.add(this.getStoreName(trashItem.entityType), restoredData);
      
      // تحديث سلة المحذوفات
      await databaseService.update('trash_items', trashItemId, {
        restoredAt: new Date(),
        restoredBy
      });

      // تسجيل العملية
      await this.logTrashActivity('restore', trashItemId, 
        `تم استعادة ${trashItem.entityType}: ${trashItem.entityName}`);

      return { success: true, restoredItemId: trashItem.originalId };

    } catch (error) {
      console.error('خطأ في استعادة العنصر:', error);
      return { success: false, error: 'خطأ في عملية الاستعادة' };
    }
  }

  /**
   * حذف نهائي من سلة المحذوفات
   */
  async permanentDelete(trashItemId: string, deletedBy: string): Promise<void> {
    try {
      const trashItem = await databaseService.getById<TrashItem>('trash_items', trashItemId);
      if (!trashItem) return;

      // حذف المرفقات المرتبطة
      await this.deleteRelatedAttachments(trashItem);

      // حذف العنصر من سلة المحذوفات
      await databaseService.delete('trash_items', trashItemId);

      // تسجيل العملية
      await this.logTrashActivity('permanent_delete', trashItemId, 
        `تم الحذف النهائي لـ ${trashItem.entityType}: ${trashItem.entityName}`);

    } catch (error) {
      console.error('خطأ في الحذف النهائي:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع عناصر سلة المحذوفات
   */
  async getTrashItems(filters?: {
    entityType?: string;
    deletedBy?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<TrashItem[]> {
    try {
      let items = await databaseService.getAll<TrashItem>('trash_items');

      if (filters) {
        if (filters.entityType) {
          items = items.filter(item => item.entityType === filters.entityType);
        }
        if (filters.deletedBy) {
          items = items.filter(item => item.deletedBy === filters.deletedBy);
        }
        if (filters.dateFrom) {
          items = items.filter(item => item.deletedAt >= filters.dateFrom!);
        }
        if (filters.dateTo) {
          items = items.filter(item => item.deletedAt <= filters.dateTo!);
        }
      }

      return items.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
    } catch (error) {
      console.error('خطأ في تحميل سلة المحذوفات:', error);
      return [];
    }
  }

  /**
   * تنظيف سلة المحذوفات التلقائي
   */
  async autoCleanup(): Promise<{ deletedCount: number; errors: string[] }> {
    try {
      const items = await this.getTrashItems();
      const now = new Date();
      const expiredItems = items.filter(item => item.autoDeleteAt <= now);
      
      let deletedCount = 0;
      const errors: string[] = [];

      for (const item of expiredItems) {
        try {
          await this.permanentDelete(item.id, 'system');
          deletedCount++;
        } catch (error) {
          errors.push(`خطأ في حذف ${item.entityName}: ${error.message}`);
        }
      }

      return { deletedCount, errors };
    } catch (error) {
      console.error('خطأ في التنظيف التلقائي:', error);
      return { deletedCount: 0, errors: [error.message] };
    }
  }

  /**
   * الحصول على إحصائيات سلة المحذوفات
   */
  async getTrashStats(): Promise<TrashStats> {
    try {
      const items = await this.getTrashItems();
      
      const stats: TrashStats = {
        totalItems: items.length,
        itemsByType: {},
        totalSize: 0,
        oldestItem: new Date(),
        newestItem: new Date(),
        itemsNearExpiry: 0,
        restorableItems: 0,
        permanentlyDeletedToday: 0
      };

      if (items.length === 0) return stats;

      // حساب الإحصائيات
      items.forEach(item => {
        stats.itemsByType[item.entityType] = (stats.itemsByType[item.entityType] || 0) + 1;
        stats.totalSize += item.size || 0;
        
        if (item.canRestore) stats.restorableItems++;
        
        // العناصر القريبة من الانتهاء (خلال 7 أيام)
        const daysUntilExpiry = Math.floor((item.autoDeleteAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 7) stats.itemsNearExpiry++;
      });

      stats.oldestItem = new Date(Math.min(...items.map(i => i.deletedAt.getTime())));
      stats.newestItem = new Date(Math.max(...items.map(i => i.deletedAt.getTime())));

      return stats;
    } catch (error) {
      console.error('خطأ في حساب إحصائيات سلة المحذوفات:', error);
      return {
        totalItems: 0,
        itemsByType: {},
        totalSize: 0,
        oldestItem: new Date(),
        newestItem: new Date(),
        itemsNearExpiry: 0,
        restorableItems: 0,
        permanentlyDeletedToday: 0
      };
    }
  }

  // دوال مساعدة خاصة
  private getEntityName(entityType: string, entityData: any): string {
    switch (entityType) {
      case 'employee': return entityData.name || 'موظف غير محدد';
      case 'task': return entityData.title || 'مهمة غير محددة';
      case 'correspondence': return entityData.subject || 'مراسلة غير محددة';
      case 'department': return entityData.name || 'إدارة غير محددة';
      case 'division': return entityData.name || 'قسم غير محدد';
      case 'attachment': return entityData.fileName || 'مرفق غير محدد';
      default: return 'عنصر غير محدد';
    }
  }

  private getEntityDescription(entityType: string, entityData: any): string {
    switch (entityType) {
      case 'employee': return `${entityData.position || ''} - ${entityData.department || ''}`;
      case 'task': return entityData.description || '';
      case 'correspondence': return `${entityData.type || ''} - ${entityData.number || ''}`;
      default: return entityData.description || '';
    }
  }

  private assessRestoreComplexity(entityType: string, entityData: any): 'simple' | 'complex' | 'impossible' {
    // تقييم تعقيد الاستعادة بناءً على العلاقات والتبعيات
    if (entityType === 'attachment') return 'simple';
    if (entityType === 'employee' && entityData.isManager) return 'complex';
    if (entityType === 'department' && entityData.employeeCount > 0) return 'complex';
    return 'simple';
  }

  private async findRelatedItems(entityType: string, entityId: string): Promise<any[]> {
    // البحث عن العناصر المرتبطة
    const related = [];
    
    try {
      if (entityType === 'employee') {
        const tasks = await databaseService.getAll('tasks');
        const relatedTasks = tasks.filter(t => 
          t.assignedTo?.includes(entityId) || t.createdBy === entityId
        );
        related.push(...relatedTasks.map(t => ({
          type: 'task',
          id: t.id,
          name: t.title,
          status: 'exists'
        })));
      }
      
      if (entityType === 'department') {
        const employees = await databaseService.getAll('employees');
        const deptEmployees = employees.filter(e => e.department === entityId);
        related.push(...deptEmployees.map(e => ({
          type: 'employee',
          id: e.id,
          name: e.name,
          status: 'exists'
        })));
      }
    } catch (error) {
      console.error('خطأ في البحث عن العناصر المرتبطة:', error);
    }

    return related;
  }

  private async getRetentionDays(entityType: string): Promise<number> {
    // الحصول على أيام الاحتفاظ من الإعدادات
    const settings = await databaseService.getSettings();
    const trashSettings = settings?.trashSettings || {};
    
    const defaultDays = {
      'employee': 90,
      'task': 30,
      'correspondence': 60,
      'department': 180,
      'division': 180,
      'attachment': 30,
      'category': 30
    };

    return trashSettings.retentionByType?.[entityType] || defaultDays[entityType] || 30;
  }

  private countAttachments(entityData: any): number {
    return entityData.attachments?.length || 0;
  }

  private async countDependencies(entityType: string, entityId: string): Promise<number> {
    // حساب عدد العناصر المعتمدة على هذا العنصر
    let count = 0;
    
    try {
      if (entityType === 'employee') {
        const tasks = await databaseService.getAll('tasks');
        count += tasks.filter(t => t.assignedTo?.includes(entityId)).length;
      }
      
      if (entityType === 'department') {
        const employees = await databaseService.getAll('employees');
        count += employees.filter(e => e.department === entityId).length;
      }
    } catch (error) {
      console.error('خطأ في حساب التبعيات:', error);
    }

    return count;
  }

  private getOriginalPath(entityType: string): string {
    const paths = {
      'employee': '/employees',
      'task': '/tasks',
      'correspondence': '/correspondence',
      'department': '/departments',
      'division': '/departments',
      'attachment': '/attachments',
      'category': '/settings/categories'
    };

    return paths[entityType] || '/';
  }

  private generateChecksum(data: any): string {
    // توليد checksum بسيط للبيانات
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // تحويل إلى 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private getStoreName(entityType: string): string {
    const storeNames = {
      'employee': 'employees',
      'task': 'tasks',
      'correspondence': 'correspondence_incoming', // سيتم تحديد النوع لاحقاً
      'department': 'departments',
      'division': 'divisions',
      'attachment': 'attachments',
      'category': 'categories'
    };

    return storeNames[entityType] || entityType;
  }

  private async checkRestoreConflicts(trashItem: TrashItem): Promise<string[]> {
    const conflicts: string[] = [];
    
    try {
      // فحص تعارض المعرف
      const existingItem = await databaseService.getById(
        this.getStoreName(trashItem.entityType), 
        trashItem.originalId
      );
      
      if (existingItem) {
        conflicts.push('يوجد عنصر بنفس المعرف');
      }

      // فحص تعارضات أخرى حسب نوع العنصر
      if (trashItem.entityType === 'employee') {
        const employees = await databaseService.getAll('employees');
        const emailConflict = employees.find(e => e.email === trashItem.entityData.email);
        if (emailConflict) {
          conflicts.push('البريد الإلكتروني مستخدم بالفعل');
        }
      }

    } catch (error) {
      console.error('خطأ في فحص التعارضات:', error);
      conflicts.push('خطأ في فحص التعارضات');
    }

    return conflicts;
  }

  private async deleteRelatedAttachments(trashItem: TrashItem): Promise<void> {
    try {
      if (trashItem.attachmentsCount && trashItem.attachmentsCount > 0) {
        const attachments = await databaseService.getAll('attachments');
        const relatedAttachments = attachments.filter(att => 
          att.moduleType === trashItem.entityType && att.moduleId === trashItem.originalId
        );

        for (const attachment of relatedAttachments) {
          await databaseService.delete('attachments', attachment.id);
        }
      }
    } catch (error) {
      console.error('خطأ في حذف المرفقات المرتبطة:', error);
    }
  }

  private async getUserName(userId: string): Promise<string> {
    try {
      const user = await databaseService.getById<SystemUser>('system_users', userId);
      return user?.fullName || 'مستخدم غير معروف';
    } catch (error) {
      return 'مستخدم غير معروف';
    }
  }

  private async logTrashActivity(action: string, itemId: string, description: string): Promise<void> {
    try {
      await databaseService.add('activity_logs', {
        id: `trash-${Date.now()}`,
        module: 'trash',
        action,
        entityId: itemId,
        userId: 'current-user',
        userName: 'مستخدم النظام',
        details: description,
        timestamp: new Date(),
        ipAddress: 'localhost'
      });
    } catch (error) {
      console.error('خطأ في تسجيل نشاط سلة المحذوفات:', error);
    }
  }
}

export const trashService = new TrashService();
export default TrashService;