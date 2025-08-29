/**
 * خدمة إدارة المراسلات المتقدمة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { databaseService } from './DatabaseService';
import { Correspondence, Employee, Department, Division } from '../types';

// واجهة إحصائيات المراسلات
interface CorrespondenceStats {
  total: number;
  incoming: number;
  outgoing: number;
  urgent: number;
  confidential: number;
  processed: number;
  pending: number;
  overdue: number;
}

// واجهة خيارات البحث المتقدم
interface SearchOptions {
  query?: string;
  type?: 'وارد' | 'صادر';
  status?: string;
  confidentiality?: string;
  urgency?: string;
  department?: string;
  division?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasAttachments?: boolean;
  hasLinkedTasks?: boolean;
}

/**
 * فئة خدمة المراسلات المتقدمة
 */
class CorrespondenceService {

  /**
   * الحصول على إحصائيات المراسلات الشاملة
   */
  async getCorrespondenceStats(): Promise<CorrespondenceStats> {
    try {
      const [incoming, outgoing] = await Promise.all([
        databaseService.getAll<Correspondence>('correspondence_incoming'),
        databaseService.getAll<Correspondence>('correspondence_outgoing')
      ]);

      const allCorrespondence = [
        ...incoming.map(c => ({ ...c, type: 'وارد' as const })),
        ...outgoing.map(c => ({ ...c, type: 'صادر' as const }))
      ];

      const total = allCorrespondence.length;
      const urgentCount = allCorrespondence.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length;
      const confidentialCount = allCorrespondence.filter(c => c.confidentiality === 'سري' || c.confidentiality === 'سري جداً').length;
      const processedCount = allCorrespondence.filter(c => 
        c.status === 'مغلق' || c.status === 'مؤرشف' || c.status === 'صادر'
      ).length;
      const pendingCount = allCorrespondence.filter(c => 
        c.status === 'قيد المراجعة' || c.status === 'محال' || c.status === 'مسودة'
      ).length;

      // حساب المراسلات المتأخرة (التي تجاوزت موعد الرد)
      const overdueCount = allCorrespondence.filter(c => {
        if (c.responseDeadline) {
          const deadline = new Date(c.responseDeadline);
          const now = new Date();
          return deadline < now && !c.hasResponse;
        }
        return false;
      }).length;

      return {
        total,
        incoming: incoming.length,
        outgoing: outgoing.length,
        urgent: urgentCount,
        confidential: confidentialCount,
        processed: processedCount,
        pending: pendingCount,
        overdue: overdueCount
      };
    } catch (error) {
      console.error('خطأ في حساب إحصائيات المراسلات:', error);
      return {
        total: 0,
        incoming: 0,
        outgoing: 0,
        urgent: 0,
        confidential: 0,
        processed: 0,
        pending: 0,
        overdue: 0
      };
    }
  }

  /**
   * البحث المتقدم في المراسلات
   */
  async searchCorrespondence(options: SearchOptions): Promise<Correspondence[]> {
    try {
      const [incoming, outgoing] = await Promise.all([
        databaseService.getAll<Correspondence>('correspondence_incoming'),
        databaseService.getAll<Correspondence>('correspondence_outgoing')
      ]);

      let allCorrespondence = [
        ...incoming.map(c => ({ ...c, type: 'وارد' as const })),
        ...outgoing.map(c => ({ ...c, type: 'صادر' as const }))
      ];

      // تطبيق الفلاتر
      if (options.query) {
        const query = options.query.toLowerCase();
        allCorrespondence = allCorrespondence.filter(c =>
          c.subject.toLowerCase().includes(query) ||
          c.number.toLowerCase().includes(query) ||
          (c.sender && c.sender.toLowerCase().includes(query)) ||
          (c.recipient && c.recipient.toLowerCase().includes(query)) ||
          (c.notes && c.notes.toLowerCase().includes(query))
        );
      }

      if (options.type) {
        allCorrespondence = allCorrespondence.filter(c => c.type === options.type);
      }

      if (options.status) {
        allCorrespondence = allCorrespondence.filter(c => c.status === options.status);
      }

      if (options.confidentiality) {
        allCorrespondence = allCorrespondence.filter(c => c.confidentiality === options.confidentiality);
      }

      if (options.urgency) {
        allCorrespondence = allCorrespondence.filter(c => c.urgency === options.urgency);
      }

      if (options.department) {
        allCorrespondence = allCorrespondence.filter(c => c.department === options.department);
      }

      if (options.division) {
        allCorrespondence = allCorrespondence.filter(c => c.division === options.division);
      }

      if (options.dateFrom) {
        allCorrespondence = allCorrespondence.filter(c => new Date(c.date) >= options.dateFrom!);
      }

      if (options.dateTo) {
        allCorrespondence = allCorrespondence.filter(c => new Date(c.date) <= options.dateTo!);
      }

      if (options.hasAttachments) {
        allCorrespondence = allCorrespondence.filter(c => c.attachments && c.attachments.length > 0);
      }

      if (options.hasLinkedTasks) {
        allCorrespondence = allCorrespondence.filter(c => c.linkedTaskId);
      }

      // ترتيب حسب التاريخ (الأحدث أولاً)
      return allCorrespondence.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error) {
      console.error('خطأ في البحث في المراسلات:', error);
      return [];
    }
  }

  /**
   * الحصول على المراسلات العاجلة
   */
  async getUrgentCorrespondence(): Promise<Correspondence[]> {
    return this.searchCorrespondence({
      urgency: 'عاجل'
    });
  }

  /**
   * الحصول على المراسلات المتأخرة
   */
  async getOverdueCorrespondence(): Promise<Correspondence[]> {
    const allCorrespondence = await this.searchCorrespondence({});
    const now = new Date();
    
    return allCorrespondence.filter(c => {
      if (c.responseDeadline) {
        const deadline = new Date(c.responseDeadline);
        return deadline < now && !c.hasResponse;
      }
      return false;
    });
  }

  /**
   * الحصول على المراسلات حسب الإدارة
   */
  async getCorrespondenceByDepartment(departmentId: string): Promise<Correspondence[]> {
    return this.searchCorrespondence({
      department: departmentId
    });
  }

  /**
   * الحصول على المراسلات المرتبطة بمهمة
   */
  async getCorrespondenceByTask(taskId: string): Promise<Correspondence[]> {
    const allCorrespondence = await this.searchCorrespondence({});
    return allCorrespondence.filter(c => c.linkedTaskId === taskId);
  }

  /**
   * إنشاء رقم مراسلة تلقائي
   */
  generateCorrespondenceNumber(type: 'وارد' | 'صادر'): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const prefix = type === 'وارد' ? 'IN' : 'OUT';
    return `${prefix}-${year}-${timestamp}`;
  }

  /**
   * ربط مراسلة بمهمة
   */
  async linkCorrespondenceToTask(correspondenceId: string, taskId: string): Promise<void> {
    try {
      // تحديد نوع المراسلة
      const correspondence = await this.getCorrespondenceById(correspondenceId);
      if (!correspondence) {
        throw new Error('المراسلة غير موجودة');
      }

      const storeName = correspondence.type === 'وارد' ? 'correspondence_incoming' : 'correspondence_outgoing';
      
      await databaseService.update(storeName, correspondenceId, {
        linkedTaskId: taskId,
        updatedAt: new Date()
      });

      // تحديث المهمة أيضاً
      await databaseService.update('tasks', taskId, {
        linkedCorrespondenceId: correspondenceId,
        updatedAt: new Date()
      });

    } catch (error) {
      console.error('خطأ في ربط المراسلة بالمهمة:', error);
      throw error;
    }
  }

  /**
   * إلغاء ربط مراسلة بمهمة
   */
  async unlinkCorrespondenceFromTask(correspondenceId: string, taskId: string): Promise<void> {
    try {
      const correspondence = await this.getCorrespondenceById(correspondenceId);
      if (!correspondence) return;

      const storeName = correspondence.type === 'وارد' ? 'correspondence_incoming' : 'correspondence_outgoing';
      
      await databaseService.update(storeName, correspondenceId, {
        linkedTaskId: null,
        updatedAt: new Date()
      });

      await databaseService.update('tasks', taskId, {
        linkedCorrespondenceId: null,
        updatedAt: new Date()
      });

    } catch (error) {
      console.error('خطأ في إلغاء ربط المراسلة بالمهمة:', error);
      throw error;
    }
  }

  /**
   * الحصول على مراسلة بالمعرف
   */
  async getCorrespondenceById(correspondenceId: string): Promise<Correspondence | null> {
    try {
      // البحث في المراسلات الواردة أولاً
      let correspondence = await databaseService.getById<Correspondence>('correspondence_incoming', correspondenceId);
      if (correspondence) {
        return { ...correspondence, type: 'وارد' };
      }

      // البحث في المراسلات الصادرة
      correspondence = await databaseService.getById<Correspondence>('correspondence_outgoing', correspondenceId);
      if (correspondence) {
        return { ...correspondence, type: 'صادر' };
      }

      return null;
    } catch (error) {
      console.error('خطأ في الحصول على المراسلة:', error);
      return null;
    }
  }

  /**
   * إنشاء تقرير المراسلات
   */
  async generateCorrespondenceReport(period: { startDate: Date; endDate: Date }) {
    try {
      const correspondences = await this.searchCorrespondence({
        dateFrom: period.startDate,
        dateTo: period.endDate
      });

      const stats = await this.getCorrespondenceStats();
      
      return {
        period,
        stats,
        correspondences,
        summary: {
          totalProcessed: correspondences.filter(c => c.status === 'مغلق' || c.status === 'صادر').length,
          averageProcessingTime: this.calculateAverageProcessingTime(correspondences),
          departmentBreakdown: this.getCorrespondenceByDepartmentBreakdown(correspondences),
          urgencyBreakdown: this.getCorrespondenceByUrgencyBreakdown(correspondences)
        }
      };
    } catch (error) {
      console.error('خطأ في إنشاء تقرير المراسلات:', error);
      throw error;
    }
  }

  /**
   * حساب متوسط وقت المعالجة
   */
  private calculateAverageProcessingTime(correspondences: Correspondence[]): number {
    const processedCorrespondences = correspondences.filter(c => c.completedAt);
    
    if (processedCorrespondences.length === 0) return 0;

    const totalTime = processedCorrespondences.reduce((sum, c) => {
      const startDate = new Date(c.createdAt);
      const endDate = new Date(c.completedAt!);
      const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    return Math.round(totalTime / processedCorrespondences.length);
  }

  /**
   * تحليل المراسلات حسب الإدارة
   */
  private getCorrespondenceByDepartmentBreakdown(correspondences: Correspondence[]) {
    const breakdown: Record<string, number> = {};
    
    correspondences.forEach(c => {
      const dept = c.department || 'غير محدد';
      breakdown[dept] = (breakdown[dept] || 0) + 1;
    });

    return Object.entries(breakdown).map(([department, count]) => ({
      department,
      count
    }));
  }

  /**
   * تحليل المراسلات حسب الاستعجال
   */
  private getCorrespondenceByUrgencyBreakdown(correspondences: Correspondence[]) {
    const breakdown: Record<string, number> = {};
    
    correspondences.forEach(c => {
      const urgency = c.urgency || 'عادي';
      breakdown[urgency] = (breakdown[urgency] || 0) + 1;
    });

    return Object.entries(breakdown).map(([urgency, count]) => ({
      urgency,
      count
    }));
  }

  /**
   * إنشاء مهمة من مراسلة
   */
  async createTaskFromCorrespondence(correspondenceId: string, taskData: any): Promise<string> {
    try {
      const correspondence = await this.getCorrespondenceById(correspondenceId);
      if (!correspondence) {
        throw new Error('المراسلة غير موجودة');
      }

      // إنشاء المهمة
      const newTask = {
        id: `task-${Date.now()}`,
        title: taskData.title || `معالجة مراسلة: ${correspondence.subject}`,
        description: taskData.description || `مهمة مرتبطة بالمراسلة رقم ${correspondence.number}`,
        priority: this.mapUrgencyToPriority(correspondence.urgency),
        status: 'جديدة',
        department: correspondence.department,
        division: correspondence.division,
        assignedTo: [correspondence.assignedTo],
        completedBy: [],
        startDate: new Date(),
        endDate: taskData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        points: taskData.points || 20,
        linkedCorrespondenceId: correspondenceId,
        createdBy: taskData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const taskId = await databaseService.add('tasks', newTask);

      // ربط المراسلة بالمهمة
      await this.linkCorrespondenceToTask(correspondenceId, taskId);

      return taskId;
    } catch (error) {
      console.error('خطأ في إنشاء مهمة من المراسلة:', error);
      throw error;
    }
  }

  /**
   * تحويل درجة الاستعجال إلى أولوية المهمة
   */
  private mapUrgencyToPriority(urgency: string): string {
    switch (urgency) {
      case 'فوري': return 'عاجل';
      case 'عاجل': return 'عالي';
      case 'عادي': return 'متوسط';
      default: return 'متوسط';
    }
  }

  /**
   * إنشاء رد على مراسلة واردة
   */
  async createReplyToIncoming(incomingId: string, replyData: any): Promise<string> {
    try {
      const incomingCorrespondence = await databaseService.getById<Correspondence>('correspondence_incoming', incomingId);
      if (!incomingCorrespondence) {
        throw new Error('المراسلة الواردة غير موجودة');
      }

      // إنشاء المراسلة الصادرة كرد
      const replyCorrespondence = {
        id: `out-reply-${Date.now()}`,
        number: this.generateCorrespondenceNumber('صادر'),
        date: new Date(),
        subject: replyData.subject || `رد على: ${incomingCorrespondence.subject}`,
        recipient: incomingCorrespondence.sender,
        recipientOrganization: incomingCorrespondence.senderOrganization,
        confidentiality: incomingCorrespondence.confidentiality,
        urgency: replyData.urgency || 'عادي',
        status: 'مسودة',
        department: incomingCorrespondence.department,
        division: incomingCorrespondence.division,
        assignedTo: replyData.assignedTo || incomingCorrespondence.assignedTo,
        deliveryChannel: replyData.deliveryChannel || 'بريد',
        linkedTaskId: incomingCorrespondence.linkedTaskId,
        linkedIncomingId: incomingId,
        bodyContent: replyData.content || '',
        attachments: [],
        notes: replyData.notes || `رد على المراسلة الواردة رقم ${incomingCorrespondence.number}`,
        createdBy: replyData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const replyId = await databaseService.add('correspondence_outgoing', replyCorrespondence);

      // تحديث المراسلة الواردة لتشير إلى الرد
      await databaseService.update('correspondence_incoming', incomingId, {
        hasResponse: true,
        responseId: replyId,
        status: 'مغلق',
        updatedAt: new Date()
      });

      return replyId;
    } catch (error) {
      console.error('خطأ في إنشاء الرد:', error);
      throw error;
    }
  }

  /**
   * تحويل مراسلة بين الإدارات
   */
  async transferCorrespondence(correspondenceId: string, transferData: any): Promise<void> {
    try {
      const correspondence = await this.getCorrespondenceById(correspondenceId);
      if (!correspondence) {
        throw new Error('المراسلة غير موجودة');
      }

      const storeName = correspondence.type === 'وارد' ? 'correspondence_incoming' : 'correspondence_outgoing';

      // إضافة سجل التحويل
      const routingEntry = {
        fromDepartment: correspondence.department,
        fromDivision: correspondence.division,
        toDepartment: transferData.toDepartment,
        toDivision: transferData.toDivision,
        toEmployee: transferData.toEmployee,
        action: transferData.action || 'إحالة',
        reason: transferData.reason,
        notes: transferData.notes,
        transferredBy: transferData.transferredBy,
        transferredAt: new Date(),
        priority: transferData.priority || 'عادي'
      };

      const currentHistory = correspondence.routingHistory || [];
      const updatedHistory = [...currentHistory, routingEntry];

      // تحديث المراسلة
      await databaseService.update(storeName, correspondenceId, {
        department: transferData.toDepartment,
        division: transferData.toDivision,
        assignedTo: transferData.toEmployee,
        status: 'محال',
        routingHistory: updatedHistory,
        updatedAt: new Date()
      });

    } catch (error) {
      console.error('خطأ في تحويل المراسلة:', error);
      throw error;
    }
  }

  /**
   * الحصول على إحصائيات الأداء حسب الإدارة
   */
  async getDepartmentPerformanceStats(): Promise<any[]> {
    try {
      const [correspondences, departments] = await Promise.all([
        this.searchCorrespondence({}),
        databaseService.getAll<Department>('departments')
      ]);

      return departments.map(dept => {
        const deptCorrespondences = correspondences.filter(c => c.department === dept.id);
        const processed = deptCorrespondences.filter(c => 
          c.status === 'مغلق' || c.status === 'مؤرشف' || c.status === 'صادر'
        );
        const urgent = deptCorrespondences.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري');
        const avgProcessingTime = this.calculateAverageProcessingTime(deptCorrespondences);

        return {
          departmentId: dept.id,
          departmentName: dept.name,
          totalCorrespondences: deptCorrespondences.length,
          processedCorrespondences: processed.length,
          urgentCorrespondences: urgent.length,
          processingRate: deptCorrespondences.length > 0 ? Math.round((processed.length / deptCorrespondences.length) * 100) : 0,
          averageProcessingTime: avgProcessingTime
        };
      }).filter(dept => dept.totalCorrespondences > 0);

    } catch (error) {
      console.error('خطأ في حساب إحصائيات أداء الإدارات:', error);
      return [];
    }
  }

  /**
   * تحديث حالة المراسلة مع تسجيل السبب
   */
  async updateCorrespondenceStatus(correspondenceId: string, newStatus: string, reason?: string): Promise<void> {
    try {
      const correspondence = await this.getCorrespondenceById(correspondenceId);
      if (!correspondence) {
        throw new Error('المراسلة غير موجودة');
      }

      const storeName = correspondence.type === 'وارد' ? 'correspondence_incoming' : 'correspondence_outgoing';
      
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date()
      };

      // إضافة تاريخ الإكمال إذا كانت الحالة مغلق أو مؤرشف
      if (newStatus === 'مغلق' || newStatus === 'مؤرشف' || newStatus === 'صادر') {
        updateData.completedAt = new Date();
      }

      await databaseService.update(storeName, correspondenceId, updateData);

      // تسجيل تغيير الحالة في السجل
      if (reason) {
        // يمكن إضافة سجل تفصيلي هنا
      }

    } catch (error) {
      console.error('خطأ في تحديث حالة المراسلة:', error);
      throw error;
    }
  }
}

// إنشاء مثيل واحد من الخدمة
export const correspondenceService = new CorrespondenceService();

export default CorrespondenceService;