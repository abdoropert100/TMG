// كيان سلة المحذوفات
export interface TrashItem {
  id: string;
  module: string; // نوع الوحدة (المهام، موظف، مراسلة ...)
  entity_id: string;
  entity_data: any;
  deleted_by: string;
  deleted_at: Date;
  restore_possible: boolean;
  notes?: string;
}
// أنواع البيانات الأساسية للنظام

export interface Employee {
  id: string;
  name: string;
  employeeNumber: string;
  email: string;
  phone: string;
  address?: string;
  department: string;
  division: string;
  position: string;
  points: number;
  status: 'نشط' | 'معطل' | 'إجازة';
  permissions: string[];
  avatar?: string;
  hireDate?: Date;
  birthDate?: Date;
  nationalId?: string;
  rating?: number;
  // معرف من أنشأ السجل
  created_by: string;
  // تاريخ الإنشاء
  created_at: Date;
  // معرف آخر من عدّل السجل
  updated_by: string;
  // تاريخ آخر تعديل
  updated_at: Date;
  // حذف منطقي
  deleted_flag?: boolean;
  // ملاحظات
  // ملاحظات إضافية
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'منخفض' | 'متوسط' | 'عالي' | 'عاجل';
  status: 'جديدة' | 'قيد التنفيذ' | 'مكتملة' | 'متأخرة';
  assignedTo: string[];
  completedBy: string[];
  department: string;
  division: string;
  startDate: Date;
  endDate: Date;
  points: number;
  createdBy: string;
  completedAt?: Date;
  isRecurring?: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  originalTaskId?: string;
  recurringCount?: number;
  estimatedHours?: number;
  actualHours?: number;
  qualityScore?: number;
  linkedCorrespondenceId?: string;
  tags?: string[];
  attachments?: string[];
  transferHistory?: {
    fromDepartment: string;
    toDepartment: string;
    transferredBy: string;
    transferredAt: Date;
    reason: string;
    notes: string;
  }[];
  pointsDistributed?: boolean;
  distributionHistory?: {
    employeeId: string;
    points: number;
    distributedAt: Date;
    distributedBy: string;
  }[];
  // معرف من أنشأ السجل
  created_by: string;
  // تاريخ الإنشاء
  created_at: Date;
  // معرف آخر من عدّل السجل
  updated_by: string;
  // تاريخ آخر تعديل
  updated_at: Date;
  // حذف منطقي
  deleted_flag?: boolean;
  // ملاحظات
  notes?: string;
}

export interface Correspondence {
  id: string;
  type: 'وارد' | 'صادر';
  number: string;
  date: Date;
  subject: string;
  sender: string;
  senderOrganization?: string;
  recipient: string;
  recipientOrganization?: string;
  confidentiality: 'عادي' | 'سري' | 'سري جداً';
  urgency: 'عادي' | 'عاجل' | 'فوري';
  status: 'مسودة' | 'مسجل' | 'محال' | 'مغلق' | 'جديد' | 'قيد المراجعة' | 'بانتظار التوقيع' | 'صادر' | 'مكتمل' | 'مؤرشف';
  linkedIncomingId?: string;
  receivedVia?: string;
  deliveryChannel?: string;
  department: string;
  division: string;
  assignedTo: string;
  linkedTaskId?: string;
  attachments: string[];
  completedAt?: Date;
  createdBy: string;
  bodyContent?: string;
  senderContact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  recipientContact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  deliveryStatus?: 'لم يرسل' | 'مرسل' | 'مستلم' | 'مرفوض';
  deliveryDate?: Date;
  responseRequired?: boolean;
  responseDeadline?: Date;
  hasResponse?: boolean;
  responseId?: string;
  routingHistory?: {
    fromDepartment: string;
    toDepartment: string;
    routedBy: string;
    routedAt: Date;
    action: string;
    notes: string;
  }[];
  tags?: string[];
  isRepeated?: boolean;
  relatedCorrespondenceIds?: string[];
  approvalWorkflow?: {
    step: string;
    approver: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp?: Date;
    notes?: string;
  }[];
  securityClassification?: string;
  retentionPeriod?: number;
  archiveLocation?: string;
  // معرف من أنشأ السجل
  created_by: string;
  // تاريخ الإنشاء
  created_at: Date;
  // معرف آخر من عدّل السجل
  updated_by: string;
  // تاريخ آخر تعديل
  updated_at: Date;
  // حذف منطقي
  deleted_flag?: boolean;
  // ملاحظات
  // ملاحظات إضافية
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  head: string;
  employeeCount: number;
  budget?: number;
  location?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  // معرف من أنشأ السجل
  created_by: string;
  // تاريخ الإنشاء
  created_at: Date;
  // معرف آخر من عدّل السجل
  updated_by: string;
  // تاريخ آخر تعديل
  updated_at: Date;
  // حذف منطقي
  deleted_flag?: boolean;
}

export interface Division {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  head: string;
  employeeCount: number;
  budget?: number;
  location?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  // معرف من أنشأ السجل
  created_by: string;
  // تاريخ الإنشاء
  created_at: Date;
  // معرف آخر من عدّل السجل
  updated_by: string;
  // تاريخ آخر تعديل
  updated_at: Date;
  // حذف منطقي
  deleted_flag?: boolean;
}

export interface SystemSettings {
  systemName: string;
  organizationName: string;
  logo: string;
  theme: 'فاتح' | 'داكن';
  language: 'ar' | 'en';
  dateFormat: string;
  currency: string;
  autoBackup?: boolean;
  backupInterval?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  sessionTimeout?: number;
  enableAuditLog?: boolean;
  enableNotifications?: boolean;
  correspondenceNumberFormat?: {
    incoming: string;
    outgoing: string;
    includeYear: boolean;
    includeDepartment: boolean;
  };
  confidentialityLevels?: string[];
  urgencyLevels?: string[];
  taskStatuses?: string[];
  correspondenceStatuses?: {
    incoming: string[];
    outgoing: string[];
  };
}

export interface Report {
  id: string;
  title: string;
  type: 'المهام' | 'المراسلات' | 'الموظفين' | 'الأداء';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: Record<string, any>;
  data: any[];
  generatedBy: string;
  generatedAt: Date;
}

export interface ActivityLog {
  id: string;
  module: string;
  action: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
  entityId?: string;
  entityType?: string;
  beforeData?: any;
  afterData?: any;
  success?: boolean;
  errorMessage?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'معلومات' | 'تحذير' | 'خطأ' | 'نجاح';
  userId: string;
  read: boolean;
  readAt?: Date;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  relatedEntityId?: string;
  relatedEntityType?: 'task' | 'correspondence' | 'employee' | 'department';
  actionUrl?: string;
  actionText?: string;
  channels?: ('browser' | 'email' | 'sms')[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface Correspondent {
  id: string;
  name: string;
  organization?: string;
  type: 'فرد' | 'جهة حكومية' | 'شركة' | 'منظمة' | 'أخرى';
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  relationshipType: 'عميل' | 'مورد' | 'شريك' | 'حكومي' | 'داخلي' | 'أخرى';
  importanceLevel: 'منخفض' | 'متوسط' | 'عالي' | 'حرج';
  lastCorrespondenceDate?: Date;
  totalCorrespondences: number;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  moduleType: 'task' | 'correspondence_incoming' | 'correspondence_outgoing' | 'employee';
  moduleId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  uploadedBy: string;
  uploadedAt: Date;
  downloadCount: number;
  isPublic: boolean;
  virusScanStatus: 'pending' | 'clean' | 'infected' | 'error';
  // معرف من أنشأ السجل
  created_by: string;
  // تاريخ الإنشاء
  created_at: Date;
  // معرف آخر من عدّل السجل
  updated_by: string;
  // تاريخ آخر تعديل
  updated_at: Date;
  // حذف منطقي
  deleted_flag?: boolean;
  // ملاحظات إضافية
  notes?: string;
}

export interface BackupRecord {
  id: string;
  backupName: string;
  backupType: 'full' | 'partial' | 'incremental';
  filePath: string;
  fileSize: number;
  includesAttachments: boolean;
  status: 'pending' | 'completed' | 'failed';
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}