/**
 * خدمة تصدير واستيراد البيانات من وإلى Excel
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Employee, Task, Correspondence, Department, Division } from '../types';
import { databaseService } from './DatabaseService';

// واجهة خيارات التصدير
interface ExportOptions {
  fileName?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

// فئة خدمة Excel
class ExcelService {

  /**
   * تصدير الموظفين إلى Excel
   */
  async exportEmployees(options: ExportOptions = {}): Promise<void> {
    try {
      const employees = await databaseService.getAll<Employee>('employees');
      const departments = await databaseService.getAll<Department>('departments');
      const divisions = await databaseService.getAll<Division>('divisions');

      // إنشاء خريطة للأقسام والإدارات للبحث السريع
      const deptMap = new Map(departments.map(d => [d.id, d.name]));
      const divMap = new Map(divisions.map(d => [d.id, d.name]));

      // تحويل البيانات للتصدير
      const exportData = employees.map(emp => ({
        'الرقم الوظيفي': emp.employeeNumber,
        'الاسم': emp.name,
        'البريد الإلكتروني': emp.email,
        'الهاتف': emp.phone,
        'الإدارة': deptMap.get(emp.department) || emp.department,
        'القسم': divMap.get(emp.division) || emp.division,
        'المنصب': emp.position,
        'النقاط': emp.points,
        'الحالة': emp.status,
        'تاريخ التعيين': emp.createdAt ? this.formatDate(emp.createdAt) : '',
        'آخر تحديث': emp.updatedAt ? this.formatDate(emp.updatedAt) : ''
      }));

      await this.exportToExcel(exportData, {
        fileName: options.fileName || 'قائمة_الموظفين',
        sheetName: options.sheetName || 'الموظفين',
        ...options
      });

    } catch (error) {
      console.error('خطأ في تصدير الموظفين:', error);
      throw error;
    }
  }

  /**
   * تصدير المهام إلى Excel
   */
  async exportTasks(options: ExportOptions = {}): Promise<void> {
    try {
      const tasks = await databaseService.getAll<Task>('tasks');
      const employees = await databaseService.getAll<Employee>('employees');
      const departments = await databaseService.getAll<Department>('departments');
      const divisions = await databaseService.getAll<Division>('divisions');

      // إنشاء خرائط للبحث السريع
      const empMap = new Map(employees.map(e => [e.id, e.name]));
      const deptMap = new Map(departments.map(d => [d.id, d.name]));
      const divMap = new Map(divisions.map(d => [d.id, d.name]));

      // تحويل البيانات للتصدير
      const exportData = tasks.map(task => ({
        'عنوان المهمة': task.title,
        'الوصف': task.description,
        'الأولوية': task.priority,
        'الحالة': task.status,
        'الإدارة': deptMap.get(task.department) || task.department,
        'القسم': divMap.get(task.division) || task.division,
        'المسند إليهم': Array.isArray(task.assignedTo) 
          ? task.assignedTo.map(id => empMap.get(id) || id).join(', ')
          : '',
        'المنجزون': Array.isArray(task.completedBy)
          ? task.completedBy.map(id => empMap.get(id) || id).join(', ')
          : '',
        'تاريخ البداية': task.startDate ? this.formatDate(task.startDate) : '',
        'تاريخ النهاية': task.endDate ? this.formatDate(task.endDate) : '',
        'النقاط': task.points,
        'منشئ المهمة': empMap.get(task.createdBy) || task.createdBy,
        'تاريخ الإنشاء': task.createdAt ? this.formatDate(task.createdAt) : '',
        'آخر تحديث': task.updatedAt ? this.formatDate(task.updatedAt) : ''
      }));

      await this.exportToExcel(exportData, {
        fileName: options.fileName || 'قائمة_المهام',
        sheetName: options.sheetName || 'المهام',
        ...options
      });

    } catch (error) {
      console.error('خطأ في تصدير المهام:', error);
      throw error;
    }
  }

  /**
   * تصدير المراسلات إلى Excel
   */
  async exportCorrespondence(type: 'incoming' | 'outgoing' | 'both' = 'both', options: ExportOptions = {}): Promise<void> {
    try {
      const employees = await databaseService.getAll<Employee>('employees');
      const departments = await databaseService.getAll<Department>('departments');
      const divisions = await databaseService.getAll<Division>('divisions');

      // إنشاء خرائط للبحث السريع
      const empMap = new Map(employees.map(e => [e.id, e.name]));
      const deptMap = new Map(departments.map(d => [d.id, d.name]));
      const divMap = new Map(divisions.map(d => [d.id, d.name]));

      let exportData: any[] = [];

      if (type === 'incoming' || type === 'both') {
        const incoming = await databaseService.getAll<Correspondence>('correspondence_incoming');
        const incomingData = incoming.map(corr => ({
          'النوع': 'وارد',
          'الرقم': corr.number,
          'التاريخ': corr.date ? this.formatDate(corr.date) : '',
          'المرسل': corr.sender,
          'الموضوع': corr.subject,
          'مستوى السرية': corr.confidentiality,
          'الاستعجال': corr.urgency,
          'الحالة': corr.status,
          'الإدارة': deptMap.get(corr.department) || corr.department,
          'القسم': divMap.get(corr.division) || corr.division,
          'المسند إليه': empMap.get(corr.assignedTo) || corr.assignedTo,
          'الملاحظات': corr.notes || '',
          'تاريخ الإنشاء': corr.createdAt ? this.formatDate(corr.createdAt) : ''
        }));
        exportData = [...exportData, ...incomingData];
      }

      if (type === 'outgoing' || type === 'both') {
        const outgoing = await databaseService.getAll<Correspondence>('correspondence_outgoing');
        const outgoingData = outgoing.map(corr => ({
          'النوع': 'صادر',
          'الرقم': corr.number,
          'التاريخ': corr.date ? this.formatDate(corr.date) : '',
          'المستلم': corr.recipient,
          'الموضوع': corr.subject,
          'مستوى السرية': corr.confidentiality,
          'الاستعجال': corr.urgency,
          'الحالة': corr.status,
          'الإدارة': deptMap.get(corr.department) || corr.department,
          'القسم': divMap.get(corr.division) || corr.division,
          'المعد': empMap.get(corr.assignedTo) || corr.assignedTo,
          'الملاحظات': corr.notes || '',
          'تاريخ الإنشاء': corr.createdAt ? this.formatDate(corr.createdAt) : ''
        }));
        exportData = [...exportData, ...outgoingData];
      }

      await this.exportToExcel(exportData, {
        fileName: options.fileName || `المراسلات_${type === 'both' ? 'الكل' : type === 'incoming' ? 'الواردة' : 'الصادرة'}`,
        sheetName: options.sheetName || 'المراسلات',
        ...options
      });

    } catch (error) {
      console.error('خطأ في تصدير المراسلات:', error);
      throw error;
    }
  }

  /**
   * تصدير الأقسام والإدارات إلى Excel
   */
  async exportDepartments(options: ExportOptions = {}): Promise<void> {
    try {
      const departments = await databaseService.getAll<Department>('departments');
      const divisions = await databaseService.getAll<Division>('divisions');
      const employees = await databaseService.getAll<Employee>('employees');

      const empMap = new Map(employees.map(e => [e.id, e.name]));

      // تصدير الإدارات
      const deptData = departments.map(dept => ({
        'اسم الإدارة': dept.name,
        'الوصف': dept.description || '',
        'رئيس الإدارة': empMap.get(dept.head) || dept.head || '',
        'عدد الموظفين': dept.employeeCount || 0,
        'تاريخ الإنشاء': dept.createdAt ? this.formatDate(dept.createdAt) : ''
      }));

      // تصدير الأقسام
      const deptMap = new Map(departments.map(d => [d.id, d.name]));
      const divData = divisions.map(div => ({
        'اسم القسم': div.name,
        'الوصف': div.description || '',
        'الإدارة التابعة': deptMap.get(div.departmentId) || div.departmentId,
        'رئيس القسم': empMap.get(div.head) || div.head || '',
        'عدد الموظفين': div.employeeCount || 0,
        'تاريخ الإنشاء': div.createdAt ? this.formatDate(div.createdAt) : ''
      }));

      // إنشاء ملف Excel متعدد الأوراق
      const workbook = XLSX.utils.book_new();
      
      const deptWorksheet = XLSX.utils.json_to_sheet(deptData);
      const divWorksheet = XLSX.utils.json_to_sheet(divData);
      
      XLSX.utils.book_append_sheet(workbook, deptWorksheet, 'الإدارات');
      XLSX.utils.book_append_sheet(workbook, divWorksheet, 'الأقسام');

      const fileName = `${options.fileName || 'الهيكل_التنظيمي'}_${this.getDateString()}.xlsx`;
      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error('خطأ في تصدير الأقسام والإدارات:', error);
      throw error;
    }
  }

  /**
   * تصدير تقرير شامل
   */
  async exportFullReport(options: ExportOptions = {}): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();

      // الحصول على جميع البيانات
      const employees = await databaseService.getAll<Employee>('employees');
      const tasks = await databaseService.getAll<Task>('tasks');
      const departments = await databaseService.getAll<Department>('departments');
      const divisions = await databaseService.getAll<Division>('divisions');
      const incomingCorr = await databaseService.getAll<Correspondence>('correspondence_incoming');
      const outgoingCorr = await databaseService.getAll<Correspondence>('correspondence_outgoing');

      // إنشاء ملخص إحصائي
      const summary = [
        { 'البيان': 'إجمالي الموظفين', 'العدد': employees.length },
        { 'البيان': 'إجمالي الإدارات', 'العدد': departments.length },
        { 'البيان': 'إجمالي الأقسام', 'العدد': divisions.length },
        { 'البيان': 'إجمالي المهام', 'العدد': tasks.length },
        { 'البيان': 'المهام المكتملة', 'العدد': tasks.filter(t => t.status === 'مكتملة').length },
        { 'البيان': 'المهام قيد التنفيذ', 'العدد': tasks.filter(t => t.status === 'قيد التنفيذ').length },
        { 'البيان': 'المهام المتأخرة', 'العدد': tasks.filter(t => t.status === 'متأخرة').length },
        { 'البيان': 'المراسلات الواردة', 'العدد': incomingCorr.length },
        { 'البيان': 'المراسلات الصادرة', 'العدد': outgoingCorr.length },
        { 'البيان': 'المراسلات العاجلة', 'العدد': [...incomingCorr, ...outgoingCorr].filter(c => c.urgency === 'عاجل').length }
      ];

      // إضافة الأوراق
      const summarySheet = XLSX.utils.json_to_sheet(summary);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'الملخص الإحصائي');

      // حفظ الملف
      const fileName = `${options.fileName || 'التقرير_الشامل'}_${this.getDateString()}.xlsx`;
      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error('خطأ في تصدير التقرير الشامل:', error);
      throw error;
    }
  }

  /**
   * استيراد الموظفين من Excel
   */
  async importEmployees(file: File): Promise<{ success: number; errors: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let success = 0;
          const errors: string[] = [];

          for (const [index, row] of jsonData.entries()) {
            try {
              const employee: Partial<Employee> = {
                id: `emp-${Date.now()}-${index}`,
                name: (row as any)['الاسم'],
                employeeNumber: (row as any)['الرقم الوظيفي'],
                email: (row as any)['البريد الإلكتروني'],
                phone: (row as any)['الهاتف'],
                department: (row as any)['الإدارة'],
                division: (row as any)['القسم'],
                position: (row as any)['المنصب'],
                points: parseInt((row as any)['النقاط']) || 0,
                status: (row as any)['الحالة'] || 'نشط',
                permissions: ['مشاهدة'],
                created_at: undefined,
                updated_at: undefined
              };

              // التحقق من البيانات المطلوبة
              if (!employee.name || !employee.employeeNumber) {
                errors.push(`الصف ${index + 2}: الاسم والرقم الوظيفي مطلوبان`);
                continue;
              }

              await databaseService.add('employees', employee);
              success++;

            } catch (error) {
              errors.push(`الصف ${index + 2}: ${error}`);
            }
          }

          resolve({ success, errors });

        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * استيراد المهام من Excel
   */
  async importTasks(file: File): Promise<{ success: number; errors: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let success = 0;
          const errors: string[] = [];

          for (const [index, row] of jsonData.entries()) {
            try {
              let rawStart = (row as any)['تاريخ البداية'];
              let rawEnd = (row as any)['تاريخ النهاية'];
              let parsedStart = rawStart ? new Date(rawStart) : undefined;
              let parsedEnd = rawEnd ? new Date(rawEnd) : undefined;
              if (!rawStart || isNaN(parsedStart?.getTime() ?? NaN)) parsedStart = undefined;
              if (!rawEnd || isNaN(parsedEnd?.getTime() ?? NaN)) parsedEnd = undefined;
              const task: Partial<Task> = {
                id: `task-${Date.now()}-${index}`,
                title: (row as any)['عنوان المهمة'],
                description: (row as any)['الوصف'],
                priority: (row as any)['الأولوية'] || 'متوسط',
                status: (row as any)['الحالة'] || 'جديدة',
                department: (row as any)['الإدارة'],
                division: (row as any)['القسم'],
                startDate: parsedStart,
                endDate: parsedEnd,
                points: parseInt((row as any)['النقاط']) || 0,
                estimatedHours: parseInt((row as any)['الساعات المقدرة']) || 0,
                tags: (row as any)['العلامات'] ? (row as any)['العلامات'].split(',').map((tag: string) => tag.trim()) : [],
                notes: (row as any)['الملاحظات'] || '',
                isRecurring: (row as any)['متكررة'] === 'نعم',
                assignedTo: [],
                completedBy: [],
                createdBy: 'system',
                createdAt: new Date(),
                updatedAt: new Date()
              };

              // التحقق من البيانات المطلوبة
              if (!task.title || !task.description) {
                errors.push(`الصف ${index + 2}: العنوان والوصف مطلوبان`);
                continue;
              }

              await databaseService.add('tasks', task);
              success++;

            } catch (error) {
              errors.push(`الصف ${index + 2}: ${error}`);
            }
          }

          resolve({ success, errors });

        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * استيراد المراسلات من Excel
   */
  async importCorrespondence(file: File, type: 'incoming' | 'outgoing'): Promise<{ success: number; errors: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          let success = 0;
          const errors: string[] = [];

          for (const [index, row] of jsonData.entries()) {
            try {
              let rawDate = (row as any)['التاريخ'];
              let parsedDate = rawDate ? new Date(rawDate) : undefined;
              if (!rawDate || isNaN(parsedDate?.getTime() ?? NaN)) {
                parsedDate = undefined;
              }
              const correspondence: Partial<Correspondence> = {
                id: `${type === 'incoming' ? 'inc' : 'out'}-${Date.now()}-${index}`,
                type: type === 'incoming' ? 'وارد' : 'صادر',
                number: (row as any)['الرقم'],
                date: parsedDate,
                subject: (row as any)['الموضوع'],
                sender: type === 'incoming' ? (row as any)['المرسل'] : undefined,
                senderOrganization: type === 'incoming' ? (row as any)['الجهة المرسلة'] : undefined,
                recipient: type === 'outgoing' ? (row as any)['المستلم'] : undefined,
                recipientOrganization: type === 'outgoing' ? (row as any)['الجهة المستلمة'] : undefined,
                confidentiality: (row as any)['مستوى السرية'] || 'عادي',
                urgency: (row as any)['الاستعجال'] || 'عادي',
                status: (row as any)['الحالة'] || 'مسجل',
                department: (row as any)['الإدارة'],
                division: (row as any)['القسم'],
                assignedTo: (row as any)['المسؤول'],
                bodyContent: (row as any)['المحتوى'] || '',
                receivedVia: type === 'incoming' ? (row as any)['طريقة الاستلام'] : undefined,
                deliveryChannel: type === 'outgoing' ? (row as any)['قناة التسليم'] : undefined,
                tags: (row as any)['العلامات'] ? (row as any)['العلامات'].split(',').map((tag: string) => tag.trim()) : [],
                notes: (row as any)['الملاحظات'] || '',
                attachments: [],
                createdBy: 'system',
                createdAt: new Date(),
                updatedAt: new Date()
              };

              // التحقق من البيانات المطلوبة
              if (!correspondence.number || !correspondence.subject) {
                errors.push(`الصف ${index + 2}: الرقم والموضوع مطلوبان`);
                continue;
              }

              const storeName = type === 'incoming' ? 'correspondence_incoming' : 'correspondence_outgoing';
              await databaseService.add(storeName, correspondence);
              success++;

            } catch (error) {
              errors.push(`الصف ${index + 2}: ${error}`);
            }
          }

          resolve({ success, errors });

        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * إنشاء قالب Excel للمراسلات
   */
  async createCorrespondenceTemplate(type: 'incoming' | 'outgoing'): Promise<void> {
    try {
      const headers = type === 'incoming' 
        ? [
            'الرقم', 'التاريخ', 'المرسل', 'الجهة المرسلة', 'الموضوع', 
            'مستوى السرية', 'الاستعجال', 'الحالة', 'الإدارة', 'القسم', 
            'المسؤول', 'طريقة الاستلام', 'العلامات', 'الملاحظات'
          ]
        : [
            'الرقم', 'التاريخ', 'المستلم', 'الجهة المستلمة', 'الموضوع',
            'مستوى السرية', 'الاستعجال', 'الحالة', 'الإدارة', 'القسم',
            'المعد', 'قناة التسليم', 'العلامات', 'الملاحظات'
          ];

      const templateData = [headers];
      
      // إضافة صف مثال
      const exampleRow = type === 'incoming'
        ? [
            'IN-2024-001', '2024-01-15', 'أحمد محمد', 'محافظة الجيزة',
            'طلب موافقة على مشروع', 'عادي', 'عاجل', 'مسجل',
            'الإدارة الهندسية', 'قسم المشاريع', 'أحمد علي', 'إيميل',
            'مشروع، موافقة', 'يحتاج مراجعة فنية'
          ]
        : [
            'OUT-2024-001', '2024-01-15', 'محافظ الجيزة', 'محافظة الجيزة',
            'رد على طلب الموافقة', 'عادي', 'عادي', 'مسودة',
            'الإدارة الهندسية', 'قسم المشاريع', 'أحمد علي', 'بريد',
            'رد، موافقة', 'تمت الموافقة على المشروع'
          ];
      
      templateData.push(exampleRow);

      const worksheet = XLSX.utils.aoa_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, type === 'incoming' ? 'المراسلات الواردة' : 'المراسلات الصادرة');

      const fileName = `قالب_${type === 'incoming' ? 'المراسلات_الواردة' : 'المراسلات_الصادرة'}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('خطأ في إنشاء قالب Excel:', error);
      throw error;
    }
  }

  /**
   * تصدير تقرير مخصص
   */
  async exportReport(reportType: string, period: any): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();
      
      // إضافة ورقة الملخص
      const summaryData = [
        { 'نوع التقرير': reportType },
        { 'فترة التقرير': `${period.startDate.toLocaleDateString('ar-EG')} - ${period.endDate.toLocaleDateString('ar-EG')}` },
        { 'تاريخ الإنشاء': new Date().toLocaleDateString('ar-EG') }
      ];
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص التقرير');
      
      // حفظ الملف
      const fileName = `تقرير_${reportType}_${this.getDateString()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error('خطأ في تصدير التقرير:', error);
      throw error;
    }
  }

  /**
   * تصدير نسخة احتياطية كاملة
   */
  async exportFullSystemBackup(): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();

      // الحصول على جميع البيانات
      const [
        employees,
        departments,
        divisions,
        tasks,
        incomingCorr,
        outgoingCorr,
        activityLogs
      ] = await Promise.all([
        databaseService.getAll('employees'),
        databaseService.getAll('departments'),
        databaseService.getAll('divisions'),
        databaseService.getAll('tasks'),
        databaseService.getAll('correspondence_incoming'),
        databaseService.getAll('correspondence_outgoing'),
        databaseService.getAll('activity_logs')
      ]);

      // إضافة كل نوع بيانات في ورقة منفصلة
      const employeesSheet = XLSX.utils.json_to_sheet(employees);
      const departmentsSheet = XLSX.utils.json_to_sheet(departments);
      const divisionsSheet = XLSX.utils.json_to_sheet(divisions);
      const tasksSheet = XLSX.utils.json_to_sheet(tasks);
      const incomingSheet = XLSX.utils.json_to_sheet(incomingCorr);
      const outgoingSheet = XLSX.utils.json_to_sheet(outgoingCorr);
      const logsSheet = XLSX.utils.json_to_sheet(activityLogs.slice(-1000)); // آخر 1000 سجل

      XLSX.utils.book_append_sheet(workbook, employeesSheet, 'الموظفين');
      XLSX.utils.book_append_sheet(workbook, departmentsSheet, 'الإدارات');
      XLSX.utils.book_append_sheet(workbook, divisionsSheet, 'الأقسام');
      XLSX.utils.book_append_sheet(workbook, tasksSheet, 'المهام');
      XLSX.utils.book_append_sheet(workbook, incomingSheet, 'المراسلات الواردة');
      XLSX.utils.book_append_sheet(workbook, outgoingSheet, 'المراسلات الصادرة');
      XLSX.utils.book_append_sheet(workbook, logsSheet, 'سجل النشاطات');

      // إضافة ورقة الملخص
      const summaryData = [
        { 'البيان': 'تاريخ النسخة الاحتياطية', 'القيمة': new Date().toLocaleString('ar-EG') },
        { 'البيان': 'إجمالي الموظفين', 'القيمة': employees.length },
        { 'البيان': 'إجمالي الإدارات', 'القيمة': departments.length },
        { 'البيان': 'إجمالي الأقسام', 'القيمة': divisions.length },
        { 'البيان': 'إجمالي المهام', 'القيمة': tasks.length },
        { 'البيان': 'إجمالي المراسلات الواردة', 'القيمة': incomingCorr.length },
        { 'البيان': 'إجمالي المراسلات الصادرة', 'القيمة': outgoingCorr.length },
        { 'البيان': 'سجلات النشاط المصدرة', 'القيمة': Math.min(activityLogs.length, 1000) }
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص النسخة الاحتياطية');

      const fileName = `نسخة_احتياطية_كاملة_${this.getDateString()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('خطأ في تصدير النسخة الاحتياطية الكاملة:', error);
      throw error;
    }
  }

  /**
   * دالة مساعدة لتصدير البيانات إلى Excel
   */
  private async exportToExcel(data: any[], options: ExportOptions): Promise<void> {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'البيانات');
    
    const fileName = `${options.fileName || 'تصدير'}_${this.getDateString()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * تنسيق التاريخ
   */
  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('ar-EG');
  }

  /**
   * الحصول على نص التاريخ الحالي
   */
  private getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  }
}

// إنشاء مثيل واحد من الخدمة
export const excelService = new ExcelService();

export default ExcelService;
