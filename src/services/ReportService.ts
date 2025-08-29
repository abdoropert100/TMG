// دالة توليد وصف نصي واضح لسجل النظام
export function generateLogDescription(log: any): string {
  switch (log.action) {
    case 'CREATE_TASK':
      return `مدير النظام أضاف مهمة جديدة بعنوان "${log.taskTitle}" يوم ${new Date(log.timestamp).toLocaleString()}`;
    case 'DELETE_EMPLOYEE':
      return `تم حذف موظف اسمه "${log.employeeName}" بواسطة ${log.userName || log.userId} يوم ${new Date(log.timestamp).toLocaleString()}`;
    case 'UPDATE_SYSTEM_NAME':
      return `تم تعديل اسم النظام إلى "${log.newSystemName}" بواسطة ${log.userName || log.userId} يوم ${new Date(log.timestamp).toLocaleString()}`;
    case 'GRANT_PERMISSION':
      return `تم منح صلاحية "${log.permission}" للمستخدم "${log.targetUser}" بواسطة ${log.userName || log.userId} يوم ${new Date(log.timestamp).toLocaleString()}`;
    case 'SEND_MESSAGE':
      return `تم إرسال رسالة بعنوان "${log.messageTitle}" من قبل ${log.userName || log.userId} يوم ${new Date(log.timestamp).toLocaleString()}`;
    // أضف حالات أخرى حسب الأحداث المطلوبة
    default:
      return log.description || `${log.action} بواسطة ${log.userName || log.userId} يوم ${new Date(log.timestamp).toLocaleString()}`;
  }
}
/**
 * خدمة التقارير المتقدمة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { databaseService } from './DatabaseService';
import { fileSystemService } from './FileSystemService';
import { Task, Employee, Correspondence, Department, Division } from '../types';

// واجهة بيانات التقرير
interface ReportData {
  id: string;
  title: string;
  type: 'tasks' | 'correspondence' | 'employees' | 'departments' | 'performance' | 'custom';
  data: any[];
  filters: Record<string, any>;
  dateRange: {
    start: Date;
    end: Date;
  };
  generatedBy: string;
  generatedAt: Date;
  summary: {
    totalRecords: number;
    keyMetrics: Record<string, number>;
    insights: string[];
  };
}

class ReportService {
  /**
   * إنشاء تقرير المهام
   */
  async generateTasksReport(filters: any = {}): Promise<ReportData> {
    try {
      const tasks = await databaseService.getAll<Task>('tasks');
      const employees = await databaseService.getAll<Employee>('employees');
      const departments = await databaseService.getAll<Department>('departments');

      // تطبيق الفلاتر
      let filteredTasks = tasks;
      
      if (filters.department) {
        filteredTasks = filteredTasks.filter(t => t.department === filters.department);
      }
      
      if (filters.status) {
        filteredTasks = filteredTasks.filter(t => t.status === filters.status);
      }
      
      if (filters.dateRange) {
        filteredTasks = filteredTasks.filter(t => {
          const taskDate = new Date(t.createdAt);
          return taskDate >= filters.dateRange.start && taskDate <= filters.dateRange.end;
        });
      }

      // حساب المقاييس الرئيسية
      const totalTasks = filteredTasks.length;
      const completedTasks = filteredTasks.filter(t => t.status === 'مكتملة').length;
      const overdueTasks = filteredTasks.filter(t => t.status === 'متأخرة').length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const report: ReportData = {
        id: `report-tasks-${Date.now()}`,
        title: 'تقرير المهام',
        type: 'tasks',
        data: filteredTasks,
        filters,
        dateRange: filters.dateRange || {
          start: new Date(new Date().getFullYear(), 0, 1),
          end: new Date()
        },
        generatedBy: 'system',
        generatedAt: new Date(),
        summary: {
          totalRecords: totalTasks,
          keyMetrics: {
            completionRate,
            totalTasks,
            completedTasks,
            overdueTasks
          },
          insights: [
            `معدل الإنجاز: ${completionRate}%`,
            `إجمالي المهام: ${totalTasks}`,
            `المهام المكتملة: ${completedTasks}`,
            `المهام المتأخرة: ${overdueTasks}`
          ]
        }
      };

      // حفظ التقرير
      await this.saveReport(report);
      
      return report;
    } catch (error) {
      console.error('خطأ في إنشاء تقرير المهام:', error);
      throw error;
    }
  }

  /**
   * إنشاء تقرير المراسلات
   */
  async generateCorrespondenceReport(filters: any = {}): Promise<ReportData> {
    try {
      const incoming = await databaseService.getAll<Correspondence>('correspondence_incoming');
      const outgoing = await databaseService.getAll<Correspondence>('correspondence_outgoing');
      const allCorrespondence = [
        ...incoming.map(c => ({ ...c, type: 'وارد' })),
        ...outgoing.map(c => ({ ...c, type: 'صادر' }))
      ];

      // تطبيق الفلاتر
      let filteredCorrespondence = allCorrespondence;
      
      if (filters.type) {
        filteredCorrespondence = filteredCorrespondence.filter(c => c.type === filters.type);
      }
      
      if (filters.urgency) {
        filteredCorrespondence = filteredCorrespondence.filter(c => c.urgency === filters.urgency);
      }

      const totalCorrespondence = filteredCorrespondence.length;
      const incomingCount = filteredCorrespondence.filter(c => c.type === 'وارد').length;
      const outgoingCount = filteredCorrespondence.filter(c => c.type === 'صادر').length;
      const urgentCount = filteredCorrespondence.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length;

      const report: ReportData = {
        id: `report-correspondence-${Date.now()}`,
        title: 'تقرير المراسلات',
        type: 'correspondence',
        data: filteredCorrespondence,
        filters,
        dateRange: filters.dateRange || {
          start: new Date(new Date().getFullYear(), 0, 1),
          end: new Date()
        },
        generatedBy: 'system',
        generatedAt: new Date(),
        summary: {
          totalRecords: totalCorrespondence,
          keyMetrics: {
            totalCorrespondence,
            incomingCount,
            outgoingCount,
            urgentCount
          },
          insights: [
            `إجمالي المراسلات: ${totalCorrespondence}`,
            `المراسلات الواردة: ${incomingCount}`,
            `المراسلات الصادرة: ${outgoingCount}`,
            `المراسلات العاجلة: ${urgentCount}`
          ]
        }
      };

      await this.saveReport(report);
      return report;
    } catch (error) {
      console.error('خطأ في إنشاء تقرير المراسلات:', error);
      throw error;
    }
  }

  /**
   * إنشاء تقرير الموظفين
   */
  async generateEmployeesReport(filters: any = {}): Promise<ReportData> {
    try {
      const employees = await databaseService.getAll<Employee>('employees');
      const tasks = await databaseService.getAll<Task>('tasks');

      // حساب أداء كل موظف
      const employeePerformance = employees.map(emp => {
        const empTasks = tasks.filter(t => t.assignedTo && t.assignedTo.includes(emp.id));
        const completedTasks = empTasks.filter(t => t.status === 'مكتملة');
        
        return {
          ...emp,
          totalTasks: empTasks.length,
          completedTasks: completedTasks.length,
          completionRate: empTasks.length > 0 ? Math.round((completedTasks.length / empTasks.length) * 100) : 0
        };
      });

      const report: ReportData = {
        id: `report-employees-${Date.now()}`,
        title: 'تقرير الموظفين',
        type: 'employees',
        data: employeePerformance,
        filters,
        dateRange: filters.dateRange || {
          start: new Date(new Date().getFullYear(), 0, 1),
          end: new Date()
        },
        generatedBy: 'system',
        generatedAt: new Date(),
        summary: {
          totalRecords: employees.length,
          keyMetrics: {
            totalEmployees: employees.length,
            activeEmployees: employees.filter(e => e.status === 'نشط').length,
            avgPoints: Math.round(employees.reduce((sum, e) => sum + e.points, 0) / employees.length)
          },
          insights: [
            `إجمالي الموظفين: ${employees.length}`,
            `الموظفون النشطون: ${employees.filter(e => e.status === 'نشط').length}`,
            `متوسط النقاط: ${Math.round(employees.reduce((sum, e) => sum + e.points, 0) / employees.length)}`
          ]
        }
      };

      await this.saveReport(report);
      return report;
    } catch (error) {
      console.error('خطأ في إنشاء تقرير الموظفين:', error);
      throw error;
    }
  }

  /**
   * حفظ التقرير في النظام
   */
  private async saveReport(report: ReportData): Promise<void> {
    try {
      // حفظ في قاعدة البيانات
      await databaseService.add('saved_reports', {
        id: report.id,
        report_name: report.title,
        report_type: report.type,
        report_data: report.data,
        filters_applied: report.filters,
        date_range: report.dateRange,
        generated_by: report.generatedBy,
        generated_at: report.generatedAt
      });

      // حفظ في نظام الملفات
      await fileSystemService.saveReport(report.title, report);
    } catch (error) {
      console.error('خطأ في حفظ التقرير:', error);
    }
  }

  /**
   * الحصول على التقارير المحفوظة
   */
  async getSavedReports(): Promise<any[]> {
    try {
      return await databaseService.getAll('saved_reports');
    } catch (error) {
      console.error('خطأ في جلب التقارير المحفوظة:', error);
      return [];
    }
  }

  /**
   * تصدير تقرير إلى Excel
   */
  async exportReportToExcel(reportId: string): Promise<void> {
    try {
      const report = await databaseService.getById('saved_reports', reportId);
      if (!report) {
        throw new Error('التقرير غير موجود');
      }

      // تصدير باستخدام خدمة Excel
      const { excelService } = await import('./ExcelService');
      await excelService.exportReport(report.report_type, report.date_range);
    } catch (error) {
      console.error('خطأ في تصدير التقرير:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
export default ReportService;