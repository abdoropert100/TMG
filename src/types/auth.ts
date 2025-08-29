/**
 * أنواع بيانات المصادقة والصلاحيات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

// الأدوار الهرمية في النظام
export type UserRole = 
  | 'رئيس_المصلحة'      // أعلى صلاحية - يرى كل شيء
  | 'رئيس_قطاع'         // يرى قطاعه فقط
  | 'رئيس_إدارة_مركزية' // يرى إدارته المركزية فقط
  | 'مدير_إدارة_عامة'   // يرى إدارته العامة فقط
  | 'مدير_إدارة'        // يرى إدارته فقط
  | 'مهندس'             // صلاحيات فنية محدودة
  | 'موظف'              // صلاحيات أساسية
  | 'مشرف'              // صلاحيات إشرافية
  | 'فني'               // صلاحيات فنية
  | 'ادمن';             // مدير النظام التقني

// الصلاحيات التفصيلية
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: 'tasks' | 'correspondence' | 'employees' | 'departments' | 'reports' | 'settings' | 'system';
  action: 'view' | 'create' | 'edit' | 'delete' | 'transfer' | 'import' | 'export' | 'print' | 'archive' | 'approve';
}

// مستخدم النظام
export interface SystemUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  employeeId?: string; // ربط بجدول الموظفين
  role: UserRole;
  permissions: string[]; // معرفات الصلاحيات
  isActive: boolean;
  mustChangePassword: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  twoFactorEnabled: boolean;
  preferredLanguage: 'ar' | 'en';
  theme: 'light' | 'dark';
  dashboardLayout: any; // تخطيط لوحة التحكم المخصص
  
  // الهيكل التنظيمي
  organizationLevel: 'مصلحة' | 'قطاع' | 'إدارة_مركزية' | 'إدارة_عامة' | 'إدارة' | 'قسم';
  sectorId?: string;      // معرف القطاع
  centralDeptId?: string; // معرف الإدارة المركزية
  generalDeptId?: string; // معرف الإدارة العامة
  departmentId?: string;  // معرف الإدارة
  divisionId?: string;    // معرف القسم
  
  // إعدادات الرؤية
  visibilityScope: {
    canViewAllSectors: boolean;
    canViewAllDepartments: boolean;
    canViewAllEmployees: boolean;
    restrictedToOwnData: boolean;
  };
  
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  deletedAt?: Date;
}

// جلسة المستخدم
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
}

// سجل تسجيل الدخول
export interface LoginLog {
  id: string;
  userId: string;
  username: string;
  ipAddress: string;
  userAgent: string;
  loginTime: Date;
  logoutTime?: Date;
  success: boolean;
  failureReason?: string;
  sessionDuration?: number; // بالدقائق
}

// الهيكل التنظيمي الهرمي
export interface OrganizationStructure {
  مصلحة: {
    id: string;
    name: string;
    head: string; // رئيس المصلحة
    قطاعات: {
      [sectorId: string]: {
        id: string;
        name: string;
        head: string; // رئيس القطاع
        إدارات_مركزية: {
          [centralDeptId: string]: {
            id: string;
            name: string;
            head: string; // رئيس الإدارة المركزية
            إدارات_عامة: {
              [generalDeptId: string]: {
                id: string;
                name: string;
                head: string; // مدير الإدارة العامة
                إدارات: {
                  [deptId: string]: {
                    id: string;
                    name: string;
                    head: string; // مدير الإدارة
                    أقسام: {
                      [divisionId: string]: {
                        id: string;
                        name: string;
                        head: string; // رئيس القسم
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
}

// إعدادات الصلاحيات
export interface RolePermissions {
  [role: string]: {
    permissions: string[];
    dashboardAccess: {
      canViewSystemStats: boolean;
      canViewAllSectors: boolean;
      canViewAllDepartments: boolean;
      canViewAllEmployees: boolean;
      canViewAllTasks: boolean;
      canViewAllCorrespondence: boolean;
      restrictedToScope: boolean;
    };
    dataAccess: {
      ownDataOnly: boolean;
      departmentDataOnly: boolean;
      sectorDataOnly: boolean;
      allData: boolean;
    };
  };
}