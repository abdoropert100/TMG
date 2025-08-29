/**
 * خدمة المصادقة والصلاحيات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { databaseService } from './DatabaseService';
import { SystemUser, UserRole, UserSession, LoginLog, Permission, RolePermissions } from '../types/auth';

class AuthService {
  private currentUser: SystemUser | null = null;
  private currentSession: UserSession | null = null;

  /**
   * تسجيل الدخول
   */
  async login(username: string, password: string, rememberMe: boolean = false): Promise<{
    success: boolean;
    user?: SystemUser;
    session?: UserSession;
    error?: string;
  }> {
    try {
      // البحث عن المستخدم
      const users = await databaseService.getAll<SystemUser>('system_users');
      const user = users.find(u => 
        (u.username === username || u.email === username) && u.isActive
      );

      if (!user) {
        await this.logLoginAttempt(username, false, 'مستخدم غير موجود');
        return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
      }

      // فحص القفل
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return { success: false, error: 'الحساب مقفل مؤقتاً' };
      }

      // التحقق من كلمة المرور (محاكاة)
      const passwordValid = await this.verifyPassword(password, user.username);
      
      if (!passwordValid) {
        // زيادة محاولات الدخول الفاشلة
        await this.incrementLoginAttempts(user.id);
        await this.logLoginAttempt(username, false, 'كلمة مرور خاطئة');
        return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
      }

      // إنشاء جلسة جديدة
      const session = await this.createSession(user, rememberMe);
      
      // تحديث آخر دخول وإعادة تعيين المحاولات
      await databaseService.update('system_users', user.id, {
        lastLogin: new Date(),
        loginAttempts: 0,
        lockedUntil: null
      });

      // تسجيل الدخول الناجح
      await this.logLoginAttempt(username, true);

      this.currentUser = user;
      this.currentSession = session;

      return { success: true, user, session };

    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return { success: false, error: 'خطأ في النظام' };
    }
  }

  /**
   * تسجيل الخروج
   */
  async logout(): Promise<void> {
    try {
      if (this.currentSession) {
        // تحديث الجلسة
        await databaseService.update('user_sessions', this.currentSession.id, {
          isActive: false,
          logoutTime: new Date()
        });

        // تسجيل الخروج
        await this.logLogout(this.currentUser?.id || '');
      }

      // مسح البيانات المحلية
      this.currentUser = null;
      this.currentSession = null;
      localStorage.removeItem('userSession');
      sessionStorage.removeItem('userSession');

    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  }

  /**
   * التحقق من الصلاحية
   */
  async hasPermission(permission: string, module?: string): Promise<boolean> {
    if (!this.currentUser) return false;

    // مدير النظام له كل الصلاحيات
    if (this.currentUser.role === 'ادمن') return true;

    // فحص الصلاحيات المخصصة
    return this.currentUser.permissions.includes(permission);
  }

  /**
   * فحص صلاحية الوصول للبيانات حسب النطاق التنظيمي
   */
  async canAccessData(entityType: string, entityData: any): Promise<boolean> {
    if (!this.currentUser) return false;

    // مدير النظام ورئيس المصلحة يرون كل شيء
    if (this.currentUser.role === 'ادمن' || this.currentUser.role === 'رئيس_المصلحة') {
      return true;
    }

    // رئيس القطاع يرى قطاعه فقط
    if (this.currentUser.role === 'رئيس_قطاع') {
      return entityData.sectorId === this.currentUser.sectorId;
    }

    // رئيس الإدارة المركزية يرى إدارته المركزية فقط
    if (this.currentUser.role === 'رئيس_إدارة_مركزية') {
      return entityData.centralDeptId === this.currentUser.centralDeptId;
    }

    // مدير الإدارة العامة يرى إدارته العامة فقط
    if (this.currentUser.role === 'مدير_إدارة_عامة') {
      return entityData.generalDeptId === this.currentUser.generalDeptId;
    }

    // مدير الإدارة يرى إدارته فقط
    if (this.currentUser.role === 'مدير_إدارة') {
      return entityData.departmentId === this.currentUser.departmentId;
    }

    // الموظفون العاديون يرون بياناتهم أو ما يُسمح لهم به
    return entityData.createdBy === this.currentUser.id || 
           entityData.assignedTo?.includes(this.currentUser.employeeId);
  }

  /**
   * إنشاء مستخدم جديد
   */
  async createUser(userData: Partial<SystemUser>, createdBy: string): Promise<string> {
    try {
      const newUser: SystemUser = {
        id: `user-${Date.now()}`,
        username: userData.username!,
        email: userData.email!,
        phone: userData.phone!,
        fullName: userData.fullName!,
        employeeId: userData.employeeId,
        role: userData.role!,
        permissions: this.getDefaultPermissions(userData.role!),
        isActive: true,
        mustChangePassword: true,
        loginAttempts: 0,
        twoFactorEnabled: false,
        preferredLanguage: 'ar',
        theme: 'light',
        dashboardLayout: this.getDefaultDashboardLayout(userData.role!),
        organizationLevel: this.getRoleOrganizationLevel(userData.role!),
        sectorId: userData.sectorId,
        centralDeptId: userData.centralDeptId,
        generalDeptId: userData.generalDeptId,
        departmentId: userData.departmentId,
        divisionId: userData.divisionId,
        visibilityScope: this.getDefaultVisibilityScope(userData.role!),
        createdBy: createdBy,
        createdAt: new Date(),
        updatedBy: createdBy,
        updatedAt: new Date()
      };

      const userId = await databaseService.add('system_users', newUser);
      
      // تسجيل العملية
      await this.logActivity('create_user', `تم إنشاء مستخدم جديد: ${newUser.fullName}`, createdBy);
      
      return userId;

    } catch (error) {
      console.error('خطأ في إنشاء المستخدم:', error);
      throw error;
    }
  }

  /**
   * الحصول على الصلاحيات الافتراضية للدور
   */
  private getDefaultPermissions(role: UserRole): string[] {
    const rolePermissions: { [key in UserRole]: string[] } = {
      'ادمن': ['*'], // كل الصلاحيات
      'رئيس_المصلحة': [
        'view_all', 'create_all', 'edit_all', 'delete_all', 'transfer_all',
        'export_all', 'import_all', 'print_all', 'archive_all', 'approve_all'
      ],
      'رئيس_قطاع': [
        'view_sector', 'create_sector', 'edit_sector', 'transfer_sector',
        'export_sector', 'print_sector', 'approve_sector'
      ],
      'رئيس_إدارة_مركزية': [
        'view_central_dept', 'create_central_dept', 'edit_central_dept',
        'transfer_central_dept', 'export_central_dept', 'print_central_dept'
      ],
      'مدير_إدارة_عامة': [
        'view_general_dept', 'create_general_dept', 'edit_general_dept',
        'transfer_general_dept', 'export_general_dept'
      ],
      'مدير_إدارة': [
        'view_dept', 'create_dept', 'edit_dept', 'export_dept'
      ],
      'مهندس': [
        'view_assigned', 'edit_assigned', 'create_tasks', 'upload_attachments'
      ],
      'موظف': [
        'view_assigned', 'edit_own', 'upload_attachments'
      ],
      'مشرف': [
        'view_supervised', 'edit_supervised', 'create_tasks', 'assign_tasks'
      ],
      'فني': [
        'view_assigned', 'edit_assigned', 'upload_attachments', 'create_maintenance_tasks'
      ]
    };

    return rolePermissions[role] || ['view_assigned'];
  }

  /**
   * الحصول على مستوى التنظيم للدور
   */
  private getRoleOrganizationLevel(role: UserRole): SystemUser['organizationLevel'] {
    const levelMap: { [key in UserRole]: SystemUser['organizationLevel'] } = {
      'ادمن': 'مصلحة',
      'رئيس_المصلحة': 'مصلحة',
      'رئيس_قطاع': 'قطاع',
      'رئيس_إدارة_مركزية': 'إدارة_مركزية',
      'مدير_إدارة_عامة': 'إدارة_عامة',
      'مدير_إدارة': 'إدارة',
      'مهندس': 'قسم',
      'موظف': 'قسم',
      'مشرف': 'قسم',
      'فني': 'قسم'
    };

    return levelMap[role];
  }

  /**
   * الحصول على نطاق الرؤية الافتراضي
   */
  private getDefaultVisibilityScope(role: UserRole): SystemUser['visibilityScope'] {
    const scopeMap: { [key in UserRole]: SystemUser['visibilityScope'] } = {
      'ادمن': {
        canViewAllSectors: true,
        canViewAllDepartments: true,
        canViewAllEmployees: true,
        restrictedToOwnData: false
      },
      'رئيس_المصلحة': {
        canViewAllSectors: true,
        canViewAllDepartments: true,
        canViewAllEmployees: true,
        restrictedToOwnData: false
      },
      'رئيس_قطاع': {
        canViewAllSectors: false,
        canViewAllDepartments: false,
        canViewAllEmployees: false,
        restrictedToOwnData: false
      },
      'رئيس_إدارة_مركزية': {
        canViewAllSectors: false,
        canViewAllDepartments: false,
        canViewAllEmployees: false,
        restrictedToOwnData: false
      },
      'مدير_إدارة_عامة': {
        canViewAllSectors: false,
        canViewAllDepartments: false,
        canViewAllEmployees: false,
        restrictedToOwnData: false
      },
      'مدير_إدارة': {
        canViewAllSectors: false,
        canViewAllDepartments: false,
        canViewAllEmployees: false,
        restrictedToOwnData: false
      },
      'مهندس': {
        canViewAllSectors: false,
        canViewAllDepartments: false,
        canViewAllEmployees: false,
        restrictedToOwnData: true
      },
      'موظف': {
        canViewAllSectors: false,
        canViewAllDepartments: false,
        canViewAllEmployees: false,
        restrictedToOwnData: true
      },
      'مشرف': {
        canViewAllSectors: false,
        canViewAllDepartments: false,
        canViewAllEmployees: false,
        restrictedToOwnData: false
      },
      'فني': {
        canViewAllSectors: false,
        canViewAllDepartments: false,
        canViewAllEmployees: false,
        restrictedToOwnData: true
      }
    };

    return scopeMap[role];
  }

  /**
   * الحصول على تخطيط لوحة التحكم الافتراضي
   */
  private getDefaultDashboardLayout(role: UserRole): any {
    const layouts = {
      'ادمن': {
        widgets: ['system_stats', 'all_tasks', 'all_correspondence', 'all_employees', 'system_health', 'activity_logs'],
        chartTypes: ['pie', 'bar', 'line', 'radar'],
        showAdvancedMetrics: true
      },
      'رئيس_المصلحة': {
        widgets: ['organization_overview', 'sector_performance', 'strategic_metrics', 'executive_summary'],
        chartTypes: ['pie', 'bar', 'line'],
        showAdvancedMetrics: true
      },
      'رئيس_قطاع': {
        widgets: ['sector_stats', 'department_performance', 'sector_tasks', 'sector_correspondence'],
        chartTypes: ['pie', 'bar'],
        showAdvancedMetrics: false
      },
      'مدير_إدارة': {
        widgets: ['dept_stats', 'dept_tasks', 'dept_employees', 'dept_correspondence'],
        chartTypes: ['pie', 'bar'],
        showAdvancedMetrics: false
      },
      'موظف': {
        widgets: ['my_tasks', 'my_correspondence', 'my_performance'],
        chartTypes: ['pie'],
        showAdvancedMetrics: false
      }
    };

    return layouts[role] || layouts['موظف'];
  }

  /**
   * التحقق من كلمة المرور
   */
  private async verifyPassword(password: string, username: string): Promise<boolean> {
    // محاكاة التحقق - في التطبيق الحقيقي استخدم bcrypt أو مشابه
    const defaultPasswords: { [key: string]: string } = {
      'admin': 'admin123',
      'manager': 'manager123',
      'employee': 'employee123'
    };

    return defaultPasswords[username] === password;
  }

  /**
   * إنشاء جلسة جديدة
   */
  private async createSession(user: SystemUser, rememberMe: boolean): Promise<UserSession> {
    const session: UserSession = {
      id: `session-${Date.now()}`,
      userId: user.id,
      token: this.generateToken(),
      refreshToken: this.generateToken(),
      expiresAt: new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000)),
      ipAddress: 'localhost',
      userAgent: navigator.userAgent,
      isActive: true,
      lastActivity: new Date(),
      createdAt: new Date()
    };

    await databaseService.add('user_sessions', session);
    return session;
  }

  /**
   * توليد رمز الجلسة
   */
  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * زيادة محاولات الدخول الفاشلة
   */
  private async incrementLoginAttempts(userId: string): Promise<void> {
    const user = await databaseService.getById<SystemUser>('system_users', userId);
    if (user) {
      const newAttempts = (user.loginAttempts || 0) + 1;
      const updateData: any = { loginAttempts: newAttempts };

      // قفل الحساب بعد 5 محاولات فاشلة
      if (newAttempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 دقيقة
      }

      await databaseService.update('system_users', userId, updateData);
    }
  }

  /**
   * تسجيل محاولة الدخول
   */
  private async logLoginAttempt(username: string, success: boolean, reason?: string): Promise<void> {
    const log: LoginLog = {
      id: `login-${Date.now()}`,
      userId: success ? this.currentUser?.id || '' : '',
      username,
      ipAddress: 'localhost',
      userAgent: navigator.userAgent,
      loginTime: new Date(),
      success,
      failureReason: reason
    };

    await databaseService.add('login_logs', log);
  }

  /**
   * تسجيل الخروج
   */
  private async logLogout(userId: string): Promise<void> {
    // تحديث آخر سجل دخول بوقت الخروج
    const logs = await databaseService.getAll<LoginLog>('login_logs');
    const lastLogin = logs
      .filter(log => log.userId === userId && log.success && !log.logoutTime)
      .sort((a, b) => b.loginTime.getTime() - a.loginTime.getTime())[0];

    if (lastLogin) {
      const sessionDuration = Math.floor((Date.now() - lastLogin.loginTime.getTime()) / (1000 * 60));
      await databaseService.update('login_logs', lastLogin.id, {
        logoutTime: new Date(),
        sessionDuration
      });
    }
  }

  /**
   * تسجيل نشاط المصادقة
   */
  private async logActivity(action: string, description: string, userId: string): Promise<void> {
    await databaseService.add('activity_logs', {
      id: `auth-${Date.now()}`,
      module: 'auth',
      action,
      userId,
      userName: this.currentUser?.fullName || 'نظام',
      details: description,
      timestamp: new Date(),
      ipAddress: 'localhost'
    });
  }

  /**
   * الحصول على المستخدم الحالي
   */
  getCurrentUser(): SystemUser | null {
    return this.currentUser;
  }

  /**
   * فحص صحة الجلسة
   */
  async validateSession(token: string): Promise<boolean> {
    try {
      const sessions = await databaseService.getAll<UserSession>('user_sessions');
      const session = sessions.find(s => s.token === token && s.isActive);

      if (!session || session.expiresAt < new Date()) {
        return false;
      }

      // تحديث آخر نشاط
      await databaseService.update('user_sessions', session.id, {
        lastActivity: new Date()
      });

      return true;
    } catch (error) {
      console.error('خطأ في فحص الجلسة:', error);
      return false;
    }
  }

  /**
   * تهيئة المستخدمين الافتراضيين
   */
  async initializeDefaultUsers(): Promise<void> {
    try {
      const existingUsers = await databaseService.getAll('system_users');
      if (existingUsers.length > 0) return;

      // إنشاء مدير النظام الافتراضي
      const adminUser: SystemUser = {
        id: 'admin-001',
        username: 'admin',
        email: 'admin@irrigation.gov.eg',
        phone: '+201000731116',
        fullName: 'مدير النظام',
        role: 'ادمن',
        permissions: ['*'],
        isActive: true,
        mustChangePassword: false,
        loginAttempts: 0,
        twoFactorEnabled: false,
        preferredLanguage: 'ar',
        theme: 'light',
        dashboardLayout: this.getDefaultDashboardLayout('ادمن'),
        organizationLevel: 'مصلحة',
        visibilityScope: {
          canViewAllSectors: true,
          canViewAllDepartments: true,
          canViewAllEmployees: true,
          restrictedToOwnData: false
        },
        createdBy: 'system',
        createdAt: new Date(),
        updatedBy: 'system',
        updatedAt: new Date()
      };

      await databaseService.add('system_users', adminUser);

      // إنشاء مستخدمين تجريبيين آخرين
      const testUsers = [
        {
          username: 'manager',
          email: 'manager@irrigation.gov.eg',
          fullName: 'مدير الإدارة',
          role: 'مدير_إدارة' as UserRole
        },
        {
          username: 'employee',
          email: 'employee@irrigation.gov.eg',
          fullName: 'موظف عادي',
          role: 'موظف' as UserRole
        }
      ];

      for (const userData of testUsers) {
        await this.createUser({
          ...userData,
          phone: '+201234567890'
        }, 'admin-001');
      }

    } catch (error) {
      console.error('خطأ في تهيئة المستخدمين الافتراضيين:', error);
    }
  }
}

export const authService = new AuthService();
export default AuthService;