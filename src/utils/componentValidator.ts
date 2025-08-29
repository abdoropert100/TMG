/**
 * أداة التحقق من صحة المكونات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { Employee, Task, Correspondence, Department, Division } from '../types';

// واجهة نتيجة التحقق
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * فئة التحقق من صحة المكونات
 */
export class ComponentValidator {

  /**
   * التحقق من صحة بيانات الموظف
   */
  static validateEmployee(employee: Partial<Employee>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // فحص الحقول المطلوبة
    if (!employee.name?.trim()) {
      errors.push('اسم الموظف مطلوب');
    }

    if (!employee.employeeNumber?.trim()) {
      errors.push('الرقم الوظيفي مطلوب');
    } else if (!/^[A-Z]{2,4}[0-9]{3,6}$/.test(employee.employeeNumber)) {
      warnings.push('تنسيق الرقم الوظيفي غير قياسي');
      suggestions.push('استخدم تنسيق مثل EMP001 أو ADMIN001');
    }

    if (employee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
      errors.push('البريد الإلكتروني غير صحيح');
    }

    if (employee.phone && !/^[0-9+\-\s()]{10,15}$/.test(employee.phone)) {
      warnings.push('تنسيق رقم الهاتف قد يكون غير صحيح');
    }

    if (!employee.department) {
      errors.push('الإدارة مطلوبة');
    }

    if (!employee.position?.trim()) {
      errors.push('المنصب مطلوب');
    }

    if (employee.points !== undefined && employee.points < 0) {
      errors.push('النقاط لا يمكن أن تكون سالبة');
    }

    // اقتراحات للتحسين
    if (!employee.email) {
      suggestions.push('إضافة بريد إلكتروني للموظف');
    }

    if (!employee.phone) {
      suggestions.push('إضافة رقم هاتف للموظف');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * التحقق من صحة بيانات المهمة
   */
  static validateTask(task: Partial<Task>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // فحص الحقول المطلوبة
    if (!task.title?.trim()) {
      errors.push('عنوان المهمة مطلوب');
    } else if (task.title.length < 3) {
      warnings.push('عنوان المهمة قصير جداً');
    }

    if (!task.description?.trim()) {
      errors.push('وصف المهمة مطلوب');
    } else if (task.description.length < 10) {
      warnings.push('وصف المهمة قصير جداً');
      suggestions.push('أضف وصفاً أكثر تفصيلاً للمهمة');
    }

    if (!task.department) {
      errors.push('الإدارة مطلوبة');
    }

    if (!task.assignedTo || task.assignedTo.length === 0) {
      errors.push('يجب إسناد المهمة لموظف واحد على الأقل');
    }

    // فحص التواريخ
    if (task.startDate && task.endDate) {
      if (task.startDate > task.endDate) {
        errors.push('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
      }
      
      const daysDiff = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        warnings.push('مدة المهمة طويلة جداً (أكثر من سنة)');
      }
    }

    // فحص النقاط
    if (task.points !== undefined) {
      if (task.points < 0) {
        errors.push('النقاط لا يمكن أن تكون سالبة');
      } else if (task.points > 1000) {
        warnings.push('النقاط مرتفعة جداً');
        suggestions.push('تأكد من أن النقاط متناسبة مع صعوبة المهمة');
      }
    }

    // اقتراحات للتحسين
    if (!task.estimatedHours) {
      suggestions.push('إضافة تقدير للساعات المطلوبة');
    }

    if (!task.tags || task.tags.length === 0) {
      suggestions.push('إضافة علامات للمهمة لتسهيل البحث');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * التحقق من صحة بيانات المراسلة
   */
  static validateCorrespondence(correspondence: Partial<Correspondence>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // فحص الحقول المطلوبة
    if (!correspondence.number?.trim()) {
      errors.push('رقم المراسلة مطلوب');
    }

    if (!correspondence.subject?.trim()) {
      errors.push('موضوع المراسلة مطلوب');
    } else if (correspondence.subject.length < 5) {
      warnings.push('موضوع المراسلة قصير جداً');
    }

    if (correspondence.type === 'وارد') {
      if (!correspondence.sender?.trim()) {
        errors.push('اسم المرسل مطلوب للمراسلات الواردة');
      }
    } else if (correspondence.type === 'صادر') {
      if (!correspondence.recipient?.trim()) {
        errors.push('اسم المستلم مطلوب للمراسلات الصادرة');
      }
    }

    if (!correspondence.department) {
      errors.push('الإدارة مطلوبة');
    }

    if (!correspondence.assignedTo) {
      errors.push('الموظف المسؤول مطلوب');
    }

    // فحص التاريخ
    if (correspondence.date) {
      const corrDate = new Date(correspondence.date);
      const now = new Date();
      const daysDiff = Math.ceil((now.getTime() - corrDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 365) {
        warnings.push('المراسلة قديمة جداً (أكثر من سنة)');
      }
    }

    // فحص السرية والاستعجال
    if (correspondence.confidentiality === 'سري جداً' && correspondence.urgency === 'عادي') {
      warnings.push('المراسلات السرية جداً عادة ما تكون عاجلة');
    }

    // اقتراحات للتحسين
    if (!correspondence.notes?.trim()) {
      suggestions.push('إضافة ملاحظات للمراسلة');
    }

    if (correspondence.type === 'وارد' && !correspondence.senderOrganization) {
      suggestions.push('إضافة اسم الجهة المرسلة');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * التحقق من صحة بيانات الإدارة
   */
  static validateDepartment(department: Partial<Department>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // فحص الحقول المطلوبة
    if (!department.name?.trim()) {
      errors.push('اسم الإدارة مطلوب');
    } else if (department.name.length < 3) {
      warnings.push('اسم الإدارة قصير جداً');
    }

    if (!department.description?.trim()) {
      errors.push('وصف الإدارة مطلوب');
    } else if (department.description.length < 10) {
      warnings.push('وصف الإدارة قصير جداً');
      suggestions.push('أضف وصفاً أكثر تفصيلاً للإدارة');
    }

    // اقتراحات للتحسين
    if (!department.head) {
      suggestions.push('تعيين رئيس للإدارة');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * التحقق من صحة بيانات القسم
   */
  static validateDivision(division: Partial<Division>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // فحص الحقول المطلوبة
    if (!division.name?.trim()) {
      errors.push('اسم القسم مطلوب');
    }

    if (!division.description?.trim()) {
      errors.push('وصف القسم مطلوب');
    }

    if (!division.departmentId) {
      errors.push('الإدارة التابعة مطلوبة');
    }

    // اقتراحات للتحسين
    if (!division.head) {
      suggestions.push('تعيين رئيس للقسم');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * فحص التكامل بين البيانات
   */
  static validateDataIntegrity(
    employees: Employee[],
    departments: Department[],
    divisions: Division[],
    tasks: Task[],
    correspondences: Correspondence[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // فحص ربط الموظفين بالإدارات
    const employeesWithInvalidDept = employees.filter(emp => 
      emp.department && !departments.find(dept => dept.id === emp.department)
    );
    
    if (employeesWithInvalidDept.length > 0) {
      errors.push(`${employeesWithInvalidDept.length} موظف مرتبط بإدارات غير موجودة`);
    }

    // فحص ربط الأقسام بالإدارات
    const divisionsWithInvalidDept = divisions.filter(div => 
      !departments.find(dept => dept.id === div.departmentId)
    );
    
    if (divisionsWithInvalidDept.length > 0) {
      errors.push(`${divisionsWithInvalidDept.length} قسم مرتبط بإدارات غير موجودة`);
    }

    // فحص ربط المهام بالموظفين
    const tasksWithInvalidEmployees = tasks.filter(task => 
      task.assignedTo && task.assignedTo.some(empId => 
        !employees.find(emp => emp.id === empId)
      )
    );
    
    if (tasksWithInvalidEmployees.length > 0) {
      warnings.push(`${tasksWithInvalidEmployees.length} مهمة مسندة لموظفين غير موجودين`);
    }

    // فحص ربط المراسلات بالمهام
    const correspondencesWithInvalidTasks = correspondences.filter(corr => 
      corr.linkedTaskId && !tasks.find(task => task.id === corr.linkedTaskId)
    );
    
    if (correspondencesWithInvalidTasks.length > 0) {
      warnings.push(`${correspondencesWithInvalidTasks.length} مراسلة مرتبطة بمهام غير موجودة`);
    }

    // إحصائيات التكامل
    const linkedTasks = tasks.filter(t => t.linkedCorrespondenceId).length;
    const linkedCorrespondences = correspondences.filter(c => c.linkedTaskId).length;
    
    if (linkedTasks === 0 && linkedCorrespondences === 0) {
      suggestions.push('ربط المهام بالمراسلات لتحسين التكامل');
    }

    // فحص توزيع البيانات
    const departmentsWithoutEmployees = departments.filter(dept => 
      !employees.find(emp => emp.department === dept.id)
    );
    
    if (departmentsWithoutEmployees.length > 0) {
      warnings.push(`${departmentsWithoutEmployees.length} إدارة بدون موظفين`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * فحص أداء النظام
   */
  static validatePerformance(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // فحص استخدام الذاكرة
    if (performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      
      if (memoryUsage > 200) {
        warnings.push(`استخدام الذاكرة مرتفع: ${memoryUsage.toFixed(1)} MB`);
        suggestions.push('تنظيف البيانات غير المستخدمة');
      }
    }

    // فحص حجم التخزين المحلي
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }
      
      const sizeInMB = totalSize / 1024 / 1024;
      if (sizeInMB > 5) {
        warnings.push(`حجم التخزين المحلي كبير: ${sizeInMB.toFixed(1)} MB`);
        suggestions.push('تنظيف البيانات المحلية القديمة');
      }
    } catch (error) {
      warnings.push('لا يمكن فحص حجم التخزين المحلي');
    }

    // فحص دعم المتصفح
    if (!('indexedDB' in window)) {
      errors.push('المتصفح لا يدعم IndexedDB');
    }

    if (!('localStorage' in window)) {
      errors.push('المتصفح لا يدعم Local Storage');
    }

    if (!('fetch' in window)) {
      errors.push('المتصفح لا يدعم Fetch API');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * فحص أمان النظام
   */
  static validateSecurity(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // فحص بيانات الجلسة
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (!sessionData) {
      warnings.push('لا توجد بيانات جلسة محفوظة');
    } else {
      try {
        const session = JSON.parse(sessionData);
        const now = new Date().getTime();
        
        if (session.expiresAt && now > session.expiresAt) {
          warnings.push('جلسة المستخدم منتهية الصلاحية');
        }
      } catch (error) {
        errors.push('بيانات الجلسة تالفة');
      }
    }

    // فحص HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      warnings.push('النظام لا يستخدم HTTPS');
      suggestions.push('استخدام HTTPS لتأمين البيانات');
    }

    // فحص كلمات المرور المحفوظة
    const savedPasswords = localStorage.getItem('savedPasswords');
    if (savedPasswords) {
      warnings.push('توجد كلمات مرور محفوظة في المتصفح');
      suggestions.push('تجنب حفظ كلمات المرور في المتصفح');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * فحص شامل لجميع البيانات
   */
  static async validateAllData(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      // تحميل جميع البيانات
      const [employees, departments, divisions, tasks, incoming, outgoing] = await Promise.all([
        databaseService.getAll<Employee>('employees'),
        databaseService.getAll<Department>('departments'),
        databaseService.getAll<Division>('divisions'),
        databaseService.getAll<Task>('tasks'),
        databaseService.getAll<Correspondence>('correspondence_incoming'),
        databaseService.getAll<Correspondence>('correspondence_outgoing')
      ]);

      const correspondences = [...incoming, ...outgoing];

      // فحص كل نوع بيانات
      employees.forEach((emp, index) => {
        const result = this.validateEmployee(emp);
        if (!result.isValid) {
          errors.push(`موظف ${index + 1}: ${result.errors.join(', ')}`);
        }
        warnings.push(...result.warnings.map(w => `موظف ${emp.name}: ${w}`));
      });

      tasks.forEach((task, index) => {
        const result = this.validateTask(task);
        if (!result.isValid) {
          errors.push(`مهمة ${index + 1}: ${result.errors.join(', ')}`);
        }
        warnings.push(...result.warnings.map(w => `مهمة ${task.title}: ${w}`));
      });

      correspondences.forEach((corr, index) => {
        const result = this.validateCorrespondence(corr);
        if (!result.isValid) {
          errors.push(`مراسلة ${index + 1}: ${result.errors.join(', ')}`);
        }
        warnings.push(...result.warnings.map(w => `مراسلة ${corr.number}: ${w}`));
      });

      departments.forEach((dept, index) => {
        const result = this.validateDepartment(dept);
        if (!result.isValid) {
          errors.push(`إدارة ${index + 1}: ${result.errors.join(', ')}`);
        }
        warnings.push(...result.warnings.map(w => `إدارة ${dept.name}: ${w}`));
      });

      // فحص التكامل
      const integrityResult = this.validateDataIntegrity(employees, departments, divisions, tasks, correspondences);
      errors.push(...integrityResult.errors);
      warnings.push(...integrityResult.warnings);
      suggestions.push(...integrityResult.suggestions);

    } catch (error) {
      errors.push(`خطأ في فحص البيانات: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}

export default ComponentValidator;