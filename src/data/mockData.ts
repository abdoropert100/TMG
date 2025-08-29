/**
 * بيانات تجريبية للنظام
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 * م. عبدالعال محمد - abdelaalmiti@gmail.com - +201000731116
 */

import { Employee, Task, Correspondence, Department, Division } from '../types';
import { databaseService } from '../services/DatabaseService';

/**
 * قائمة الموظفين التجريبية
 * تحتوي على بيانات كاملة للموظفين مع النقاط والتقييمات
 */
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'أحمد محمد علي',
    employeeNumber: 'EMP001',
    email: 'ahmed.ali@irrigation.gov.eg',
    phone: '01234567890',
    address: 'القاهرة - مدينة نصر',
    department: 'dept-001',
    division: 'div-001',
    position: 'مهندس أول',
    points: 850,
    status: 'نشط',
    permissions: ['مشاهدة', 'إضافة', 'تعديل'],
    hireDate: new Date('2020-01-15'),
    birthDate: new Date('1985-05-20'),
    nationalId: '28505201234567',
    rating: 4.5,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'فاطمة السيد أحمد',
    employeeNumber: 'EMP002',
    email: 'fatma.ahmed@irrigation.gov.eg',
    phone: '01234567891',
    address: 'الجيزة - الدقي',
    department: 'dept-002',
    division: 'div-004',
    position: 'أخصائي إداري',
    points: 720,
    status: 'نشط',
    permissions: ['مشاهدة', 'إضافة'],
    hireDate: new Date('2021-03-10'),
    birthDate: new Date('1988-12-15'),
    nationalId: '28812151234568',
    rating: 4.2,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'محمد صلاح الدين',
    employeeNumber: 'EMP003',
    email: 'mohamed.salah@irrigation.gov.eg',
    phone: '01234567892',
    address: 'الإسكندرية - سموحة',
    department: 'dept-003',
    division: 'div-006',
    position: 'محاسب أول',
    points: 920,
    status: 'نشط',
    permissions: ['مشاهدة', 'إضافة', 'تعديل', 'حذف'],
    hireDate: new Date('2019-11-20'),
    birthDate: new Date('1982-08-10'),
    nationalId: '28208101234569',
    rating: 4.8,
    createdAt: new Date('2022-11-20'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'نورا أحمد محمود',
    employeeNumber: 'EMP004',
    email: 'nora.mahmoud@irrigation.gov.eg',
    phone: '01234567893',
    address: 'القاهرة - مصر الجديدة',
    department: 'dept-005',
    division: 'div-010',
    position: 'فني صيانة',
    points: 650,
    status: 'نشط',
    permissions: ['مشاهدة'],
    hireDate: new Date('2022-05-08'),
    birthDate: new Date('1990-03-25'),
    nationalId: '29003251234570',
    rating: 4.0,
    createdAt: new Date('2023-05-08'),
    updatedAt: new Date('2024-01-01')
  }
];

/**
 * قائمة المهام التجريبية
 * تحتوي على مهام متنوعة بحالات وأولويات مختلفة
 */
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'صيانة محطة ضخ المياه الرئيسية',
    description: 'إجراء صيانة دورية شاملة لمحطة ضخ المياه الرئيسية بمنطقة الدلتا',
    priority: 'عالي',
    status: 'قيد التنفيذ',
    assignedTo: ['1', '4'],
    completedBy: [],
    department: 'dept-005',
    division: 'div-010',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-01-25'),
    points: 50,
    createdBy: '1',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    title: 'إعداد تقرير استهلاك المياه الشهري',
    description: 'جمع وتحليل بيانات استهلاك المياه لشهر ديسمبر وإعداد التقرير الشهري',
    priority: 'متوسط',
    status: 'مكتملة',
    assignedTo: ['3'],
    completedBy: ['3'],
    department: 'dept-003',
    division: 'div-006',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-05'),
    points: 30,
    createdBy: '2',
    completedAt: new Date('2024-01-05'),
    createdAt: new Date('2023-12-28'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '3',
    title: 'مراجعة وثائق مشروع الري الحديث',
    description: 'مراجعة جميع الوثائق الفنية لمشروع الري الحديث في محافظة المنيا',
    priority: 'عاجل',
    status: 'جديدة',
    assignedTo: ['1', '2'],
    completedBy: [],
    department: 'dept-001',
    division: 'div-001',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-30'),
    points: 40,
    createdBy: '1',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
];

/**
 * قائمة المراسلات التجريبية
 * تحتوي على مراسلات واردة وصادرة بمستويات سرية مختلفة
 */
export const mockCorrespondences: Correspondence[] = [
  {
    id: '1',
    type: 'وارد',
    number: 'IN-2024-001',
    date: new Date('2024-01-10'),
    subject: 'طلب موافقة على مشروع شبكة ري جديدة',
    sender: 'محافظة الجيزة - إدارة الري',
    senderOrganization: 'محافظة الجيزة',
    recipient: 'وزارة الموارد المائية',
    confidentiality: 'عادي',
    urgency: 'عاجل',
    status: 'قيد المراجعة',
    receivedVia: 'بوابة',
    department: 'dept-001',
    division: 'div-001',
    assignedTo: '1',
    attachments: ['مخططات المشروع.pdf', 'دراسة الجدوى.docx'],
    notes: 'تم إحالة الطلب للمراجعة الفنية',
    createdBy: '2',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: '2',
    type: 'صادر',
    number: 'OUT-2024-001',
    date: new Date('2024-01-08'),
    subject: 'رد على استفسار بشأن مواعيد الري',
    sender: 'وزارة الموارد المائية',
    recipient: 'جمعية مستخدمي المياه - الفيوم',
    recipientOrganization: 'جمعية مستخدمي المياه',
    confidentiality: 'عادي',
    urgency: 'عادي',
    status: 'صادر',
    deliveryChannel: 'بريد',
    department: 'dept-002',
    division: 'div-005',
    assignedTo: '2',
    attachments: ['جدول مواعيد الري.pdf'],
    notes: 'تم إرسال الرد عبر البريد الإلكتروني والفاكس',
    createdBy: '2',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '3',
    type: 'وارد',
    number: 'IN-2024-002',
    date: new Date('2024-01-12'),
    subject: 'شكوى من انقطاع المياه في قرية البرجايا',
    sender: 'عمدة قرية البرجايا',
    senderOrganization: 'قرية البرجايا',
    recipient: 'وزارة الموارد المائية',
    confidentiality: 'عادي',
    urgency: 'فوري',
    status: 'جديد',
    receivedVia: 'هاتف',
    department: 'dept-005',
    division: 'div-011',
    assignedTo: '4',
    linkedTaskId: '1',
    attachments: [],
    notes: 'تم ربط الشكوى بمهمة الصيانة العاجلة',
    createdBy: '1',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
];

/**
 * قائمة الإدارات التجريبية
 * تحتوي على الهيكل التنظيمي الأساسي للوزارة
 */
export const mockDepartments: Department[] = [
  {
    id: 'dept-001',
    name: 'الإدارة الهندسية',
    description: 'إدارة المشاريع الهندسية والإشراف على أعمال البناء والتطوير',
    head: '1',
    employeeCount: 25,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'dept-002',
    name: 'الشؤون الإدارية',
    description: 'إدارة الموارد البشرية والشؤون الإدارية والخدمات العامة',
    head: '2',
    employeeCount: 18,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'dept-003',
    name: 'الإدارة المالية',
    description: 'إدارة الشؤون المالية والميزانيات والمحاسبة',
    head: '3',
    employeeCount: 12,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'dept-004',
    name: 'إدارة المشاريع',
    description: 'تخطيط وتنفيذ المشاريع المائية الكبرى',
    head: '1',
    employeeCount: 22,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'dept-005',
    name: 'الإدارة الفنية',
    description: 'الصيانة والدعم الفني والطوارئ',
    head: '4',
    employeeCount: 30,
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

/**
 * قائمة الأقسام التجريبية
 * تحتوي على الأقسام التابعة لكل إدارة
 */
export const mockDivisions: Division[] = [
  // أقسام الإدارة الهندسية
  { 
    id: 'div-001', 
    name: 'قسم المشاريع', 
    description: 'إدارة وتنفيذ المشاريع الهندسية', 
    departmentId: 'dept-001', 
    head: '1', 
    employeeCount: 12, 
    createdAt: new Date('2020-01-01'), 
    updatedAt: new Date('2024-01-01') 
  },
  { 
    id: 'div-002', 
    name: 'قسم التصميم', 
    description: 'التصميم الهندسي والمخططات', 
    departmentId: 'dept-001', 
    head: '1', 
    employeeCount: 8, 
    createdAt: new Date('2020-01-01'), 
    updatedAt: new Date('2024-01-01') 
  },
  { 
    id: 'div-003', 
    name: 'قسم الإشراف', 
    description: 'الإشراف على تنفيذ المشاريع', 
    departmentId: 'dept-001', 
    head: '1', 
    employeeCount: 5, 
    createdAt: new Date('2020-01-01'), 
    updatedAt: new Date('2024-01-01') 
  },

  // أقسام الشؤون الإدارية
  { 
    id: 'div-004', 
    name: 'قسم الموارد البشرية', 
    description: 'إدارة شؤون الموظفين', 
    departmentId: 'dept-002', 
    head: '2', 
    employeeCount: 10, 
    createdAt: new Date('2020-01-01'), 
    updatedAt: new Date('2024-01-01') 
  },
  { 
    id: 'div-005', 
    name: 'قسم الخدمات العامة', 
    description: 'الخدمات الإدارية العامة', 
    departmentId: 'dept-002', 
    head: '2', 
    employeeCount: 8, 
    createdAt: new Date('2020-01-01'), 
    updatedAt: new Date('2024-01-01') 
  },

  // أقسام الإدارة المالية
  { 
    id: 'div-006', 
    name: 'قسم المحاسبة', 
    description: 'المحاسبة والتدقيق المالي', 
    departmentId: 'dept-003', 
    head: '3', 
    employeeCount: 8, 
    createdAt: new Date('2020-01-01'), 
    updatedAt: new Date('2024-01-01') 
  },
  { 
    id: 'div-007', 
    name: 'قسم الميزانية', 
    description: 'إعداد ومتابعة الميزانية', 
    departmentId: 'dept-003', 
    head: '3', 
    employeeCount: 4, 
    createdAt: new Date('2020-01-01'), 
    updatedAt: new Date('2024-01-01') 
  },

  // أقسام إدارة المشاريع
  { 
    id: 'div-008', 
    name: 'قسم التخطيط', 
    description: 'تخطيط وجدولة المشاريع', 
    departmentId: 'dept-004', 
    head: '1', 
    employeeCount: 10, 
    createdAt: new Date('2020-01-01'), 
    updatedAt: new Date('2024-01-01') 
  },
  { 
    id: 'div-009', 
    name: 'قسم المتابعة', 
    description: 'متابعة تنفيذ المشاريع', 
    departmentId: 'dept-004', 
    head: '1', 
    employeeCount: 12, 
    createdAt: new Date('2020-01-01'), 
    updatedAt: new Date('2024-01-01') 
  },

  // أقسام الإدارة الفنية
  { 
    id: 'div-010', 
    name: 'قسم الصيانة', 
    description: 'صيانة المعدات والمرافق', 
    departmentId: 'dept-005', 
    head: '4', 
    employeeCount: 15, 
    createdAt: new Date('2020-01-01'), 
    updatedAt: new Date('2024-01-01') 
  },
  { 
    id: 'div-011', 
    name: 'قسم الطوارئ', 
    description: 'التعامل مع حالات الطوارئ', 
    departmentId: 'dept-005', 
    head: '4', 
    employeeCount: 15, 
    createdAt: new Date('2020-01-01'), 
    updatedAt: new Date('2024-01-01') 
  }
];

/**
 * دالة تهيئة البيانات التجريبية في قاعدة البيانات
 * تقوم بإدراج البيانات التجريبية عند بدء تشغيل النظام
 */
export const initializeMockData = async () => {
  try {
    // التحقق من وجود بيانات مسبقاً
    const existingEmployees = await databaseService.getAll('employees');
    if (existingEmployees.length > 0) {
      console.log('البيانات التجريبية موجودة مسبقاً');
      return;
    }

    // إدراج البيانات التجريبية
    console.log('جاري إدراج البيانات التجريبية...');
    
    // إدراج الإدارات أولاً
    for (const dept of mockDepartments) {
      await databaseService.add('departments', dept);
    }
    
    // إدراج الأقسام
    for (const div of mockDivisions) {
      await databaseService.add('divisions', div);
    }
    
    // إدراج الموظفين
    for (const emp of mockEmployees) {
      await databaseService.add('employees', emp);
    }
    
    // إدراج المهام
    for (const task of mockTasks) {
      await databaseService.add('tasks', task);
    }
    
    // إدراج المراسلات
    for (const corr of mockCorrespondences) {
      const storeName = corr.type === 'وارد' ? 'correspondence_incoming' : 'correspondence_outgoing';
      await databaseService.add(storeName, corr);
    }
    
    console.log('تم إدراج البيانات التجريبية بنجاح');
    
  } catch (error) {
    console.error('خطأ في إدراج البيانات التجريبية:', error);
  }
};