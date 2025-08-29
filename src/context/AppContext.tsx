/**
 * سياق التطبيق المركزي لإدارة حالة النظام
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Employee, Task, Correspondence, Department, Division, SystemSettings, ActivityLog } from '../types';
import { databaseService } from '../services/DatabaseService';
import { initializeMockData } from '../data/mockData';

/**
 * واجهة حالة التطبيق الرئيسية
 * تحتوي على جميع البيانات والحالات المطلوبة للنظام
 */
interface AppState {
  // إعدادات النظام القابلة للتخصيص
  systemSettings: SystemSettings;
  
  // بيانات النظام الأساسية
  employees: Employee[];
  tasks: Task[];
  correspondence: Correspondence[];
  departments: Department[];
  divisions: Division[];
  activityLogs: ActivityLog[];
  
  // حالات التحميل والأخطاء
  loading: boolean;
  error: string | null;
  
  // حالات واجهة المستخدم
  currentPage: string;
  sidebarCollapsed: boolean;
  notifications: any[];
  
  // بيانات المستخدم الحالي
  currentUser: {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar: string;
    permissions: string[];
  };
}

/**
 * أنواع الإجراءات المتاحة في النظام
 * تحدد جميع العمليات التي يمكن تنفيذها على الحالة
 */
type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_PAGE'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SYSTEM_SETTINGS'; payload: Partial<SystemSettings> }
  | { type: 'SET_CURRENT_USER'; payload: Partial<AppState['currentUser']> }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: { id: string; data: Partial<Employee> } }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; data: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_CORRESPONDENCE'; payload: Correspondence[] }
  | { type: 'ADD_CORRESPONDENCE'; payload: Correspondence }
  | { type: 'UPDATE_CORRESPONDENCE'; payload: { id: string; data: Partial<Correspondence> } }
  | { type: 'DELETE_CORRESPONDENCE'; payload: string }
  | { type: 'SET_DEPARTMENTS'; payload: Department[] }
  | { type: 'ADD_DEPARTMENT'; payload: Department }
  | { type: 'UPDATE_DEPARTMENT'; payload: { id: string; data: Partial<Department> } }
  | { type: 'DELETE_DEPARTMENT'; payload: string }
  | { type: 'SET_DIVISIONS'; payload: Division[] }
  | { type: 'ADD_DIVISION'; payload: Division }
  | { type: 'UPDATE_DIVISION'; payload: { id: string; data: Partial<Division> } }
  | { type: 'DELETE_DIVISION'; payload: string }
  | { type: 'ADD_ACTIVITY_LOG'; payload: ActivityLog }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string };

/**
 * الحالة الأولية للتطبيق
 * تحدد القيم الافتراضية لجميع البيانات
 */
const initialState: AppState = {
  systemSettings: {
    systemName: 'نظام إدارة مصلحة الري',
    organizationName: 'وزارة الموارد المائية والري - جمهورية مصر العربية',
    logo: '/logo.png',
    theme: 'فاتح',
    language: 'ar',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EGP'
  },
  employees: [],
  tasks: [],
  correspondence: [],
  departments: [],
  divisions: [],
  activityLogs: [],
  loading: false,
  error: null,
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  notifications: [],
  currentUser: {
    id: 'user-001',
    name: 'مدير النظام',
    role: 'مدير النظام',
    department: 'إدارة تقنية المعلومات',
    avatar: '/avatar.png',
    permissions: ['admin', 'read', 'write', 'delete', 'export', 'import']
  }
};

/**
 * مخفض الحالة (Reducer)
 * يدير جميع التحديثات على حالة التطبيق
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    case 'SET_SYSTEM_SETTINGS':
      return { 
        ...state, 
        systemSettings: { ...state.systemSettings, ...action.payload } 
      };
    
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: { ...state.currentUser, ...action.payload },
        currentPage: 'dashboard', // انتقل مباشرة للداشبورد بعد تسجيل الدخول
      };

    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp => 
          emp.id === action.payload.id 
            ? { ...emp, ...action.payload.data }
            : emp
        )
      };
    
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload)
      };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id 
            ? { ...task, ...action.payload.data }
            : task
        )
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    
    case 'SET_CORRESPONDENCE':
      return { ...state, correspondence: action.payload };
    
    case 'ADD_CORRESPONDENCE':
      return { ...state, correspondence: [...state.correspondence, action.payload] };
    
    case 'UPDATE_CORRESPONDENCE':
      return {
        ...state,
        correspondence: state.correspondence.map(corr => 
          corr.id === action.payload.id 
            ? { ...corr, ...action.payload.data }
            : corr
        )
      };
    
    case 'DELETE_CORRESPONDENCE':
      return {
        ...state,
        correspondence: state.correspondence.filter(corr => corr.id !== action.payload)
      };
    
    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload };
    
    case 'ADD_DEPARTMENT':
      return { ...state, departments: [...state.departments, action.payload] };
    
    case 'UPDATE_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.map(dept => 
          dept.id === action.payload.id 
            ? { ...dept, ...action.payload.data }
            : dept
        )
      };
    
    case 'DELETE_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.filter(dept => dept.id !== action.payload)
      };
    
    case 'SET_DIVISIONS':
      return { ...state, divisions: action.payload };
    
    case 'ADD_DIVISION':
      return { ...state, divisions: [...state.divisions, action.payload] };
    
    case 'UPDATE_DIVISION':
      return {
        ...state,
        divisions: state.divisions.map(div => 
          div.id === action.payload.id 
            ? { ...div, ...action.payload.data }
            : div
        )
      };
    
    case 'DELETE_DIVISION':
      return {
        ...state,
        divisions: state.divisions.filter(div => div.id !== action.payload)
      };
    
    case 'ADD_ACTIVITY_LOG':
      return { 
        ...state, 
        activityLogs: [action.payload, ...state.activityLogs].slice(0, 1000) // الاحتفاظ بآخر 1000 سجل فقط
      };
    
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications] 
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => 
          notif.id === action.payload 
            ? { ...notif, read: true }
            : notif
        )
      };
    
    default:
      return state;
  }
}

/**
 * سياق التطبيق الرئيسي
 * يوفر الوصول للحالة والإجراءات في جميع أنحاء التطبيق
 */
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    // الإجراءات العامة للنظام
    setCurrentPage: (page: string) => void;
    toggleSidebar: () => void;
    updateSystemSettings: (settings: Partial<SystemSettings>) => void;
    updateCurrentUser: (userData: Partial<AppState['currentUser']>) => void;
    
    // إجراءات إدارة الموظفين
    loadEmployees: () => Promise<void>;
    addEmployee: (employee: Employee) => Promise<void>;
    updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
    deleteEmployee: (id: string) => Promise<void>;
    
    // إجراءات إدارة المهام
    loadTasks: () => Promise<void>;
    addTask: (task: Task) => Promise<void>;
    updateTask: (id: string, data: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    
    // إجراءات إدارة المراسلات
    loadCorrespondence: () => Promise<void>;
    addCorrespondence: (correspondence: Correspondence) => Promise<void>;
    updateCorrespondence: (id: string, data: Partial<Correspondence>) => Promise<void>;
    deleteCorrespondence: (id: string) => Promise<void>;
    
    // إجراءات إدارة الأقسام والإدارات
    loadDepartments: () => Promise<void>;
    addDepartment: (department: Department) => Promise<void>;
    updateDepartment: (id: string, data: Partial<Department>) => Promise<void>;
    deleteDepartment: (id: string) => Promise<void>;
    
    loadDivisions: () => Promise<void>;
    addDivision: (division: Division) => Promise<void>;
    updateDivision: (id: string, data: Partial<Division>) => Promise<void>;
    deleteDivision: (id: string) => Promise<void>;
    
    // إجراءات السجلات والإشعارات
    logActivity: (module: string, action: string, details: string) => void;
    addNotification: (notification: any) => void;
  };
} | undefined>(undefined);

/**
 * مزود السياق الرئيسي
 * يوفر الحالة والإجراءات لجميع المكونات الفرعية
 */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  /**
   * تهيئة قاعدة البيانات والبيانات التجريبية عند بدء التطبيق
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // تهيئة قاعدة البيانات
        await databaseService.initialize();
        
        // انتظار قليل للتأكد من اكتمال التهيئة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // تحميل جميع البيانات من قاعدة البيانات
        await Promise.all([
          actions.loadEmployees(),
          actions.loadTasks(),
          actions.loadCorrespondence(),
          actions.loadDepartments(),
          actions.loadDivisions()
        ]);
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        dispatch({ type: 'SET_ERROR', payload: 'فشل في تهيئة التطبيق' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeApp();
  }, []);

  /**
   * تعريف جميع الإجراءات المتاحة في النظام
   */
  const actions = {
    /**
     * تغيير الصفحة الحالية مع تسجيل النشاط
     * @param page اسم الصفحة الجديدة
     */
    setCurrentPage: (page: string) => {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
      actions.logActivity('navigation', 'page_change', `تم الانتقال إلى صفحة ${page}`);
    },
    
    /**
     * تبديل حالة الشريط الجانبي (مطوي/موسع)
     */
    toggleSidebar: () => {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    },
    
    /**
     * تحديث إعدادات النظام
     * @param settings الإعدادات الجديدة
     */
    updateSystemSettings: (settings: Partial<SystemSettings>) => {
      dispatch({ type: 'SET_SYSTEM_SETTINGS', payload: settings });
      actions.logActivity('settings', 'update', 'تم تحديث إعدادات النظام');
    },

    /**
     * تحديث بيانات المستخدم الحالي
     * @param userData بيانات المستخدم الجديدة
     */
    updateCurrentUser: (userData: Partial<AppState['currentUser']>) => {
      dispatch({ type: 'SET_CURRENT_USER', payload: userData });
      actions.logActivity('user', 'update_profile', 'تم تحديث بيانات المستخدم');
    },
    /**
     * تحميل جميع الموظفين من قاعدة البيانات
     */
    loadEmployees: async () => {
      try {
        const employees = await databaseService.getAll<Employee>('employees');
        dispatch({ type: 'SET_EMPLOYEES', payload: employees });
      } catch (error) {
        console.error('خطأ في تحميل الموظفين:', error);
        dispatch({ type: 'SET_EMPLOYEES', payload: [] });
      }
    },

    /**
     * إضافة موظف جديد
     * @param employee بيانات الموظف الجديد
     */
    addEmployee: async (employee: Employee) => {
      try {
        await databaseService.add('employees', employee);
        dispatch({ type: 'ADD_EMPLOYEE', payload: employee });
        actions.logActivity('employees', 'create', `تم إضافة موظف جديد: ${employee.name}`);
      } catch (error) {
        console.error('خطأ في إضافة الموظف:', error);
        throw error;
      }
    },

    /**
     * تحديث بيانات موظف موجود
     * @param id معرف الموظف
     * @param data البيانات المحدثة
     */
    updateEmployee: async (id: string, data: Partial<Employee>) => {
      try {
        await databaseService.update('employees', id, data);
        dispatch({ type: 'UPDATE_EMPLOYEE', payload: { id, data } });
        actions.logActivity('employees', 'update', `تم تحديث بيانات الموظف: ${id}`);
      } catch (error) {
        console.error('خطأ في تحديث الموظف:', error);
        throw error;
      }
    },

    /**
     * حذف موظف من النظام
     * @param id معرف الموظف
     */
    deleteEmployee: async (id: string) => {
      try {
        await databaseService.delete('employees', id);
        dispatch({ type: 'DELETE_EMPLOYEE', payload: id });
        actions.logActivity('employees', 'delete', `تم حذف الموظف: ${id}`);
      } catch (error) {
        console.error('خطأ في حذف الموظف:', error);
        throw error;
      }
    },

    /**
     * تحميل جميع المهام من قاعدة البيانات
     */
    loadTasks: async () => {
      try {
        const tasks = await databaseService.getAll<Task>('tasks');
        dispatch({ type: 'SET_TASKS', payload: tasks });
      } catch (error) {
        console.error('خطأ في تحميل المهام:', error);
        dispatch({ type: 'SET_TASKS', payload: [] });
      }
    },

    /**
     * إضافة مهمة جديدة
     * @param task بيانات المهمة الجديدة
     */
    addTask: async (task: Task) => {
      try {
        await databaseService.add('tasks', task);
        dispatch({ type: 'ADD_TASK', payload: task });
        actions.logActivity('tasks', 'create', `تم إضافة مهمة جديدة: ${task.title}`);
      } catch (error) {
        console.error('خطأ في إضافة المهمة:', error);
        throw error;
      }
    },

    /**
     * تحديث بيانات مهمة موجودة
     * @param id معرف المهمة
     * @param data البيانات المحدثة
     */
    updateTask: async (id: string, data: Partial<Task>) => {
      try {
        await databaseService.update('tasks', id, data);
        dispatch({ type: 'UPDATE_TASK', payload: { id, data } });
        actions.logActivity('tasks', 'update', `تم تحديث المهمة: ${id}`);
      } catch (error) {
        console.error('خطأ في تحديث المهمة:', error);
        throw error;
      }
    },

    /**
     * حذف مهمة من النظام
     * @param id معرف المهمة
     */
    deleteTask: async (id: string) => {
      try {
        await databaseService.delete('tasks', id);
        dispatch({ type: 'DELETE_TASK', payload: id });
        actions.logActivity('tasks', 'delete', `تم حذف المهمة: ${id}`);
      } catch (error) {
        console.error('خطأ في حذف المهمة:', error);
        throw error;
      }
    },

    /**
     * تحميل جميع المراسلات من قاعدة البيانات
     */
    loadCorrespondence: async () => {
      try {
        const incoming = await databaseService.getAll<Correspondence>('correspondence_incoming');
        const outgoing = await databaseService.getAll<Correspondence>('correspondence_outgoing');
        // دمج المراسلات مع تحديد النوع
        const allCorrespondence = [
          ...incoming.map(c => ({ ...c, type: 'وارد' as const })),
          ...outgoing.map(c => ({ ...c, type: 'صادر' as const }))
        ];
        dispatch({ type: 'SET_CORRESPONDENCE', payload: allCorrespondence });
      } catch (error) {
        console.error('خطأ في تحميل المراسلات:', error);
        dispatch({ type: 'SET_CORRESPONDENCE', payload: [] });
      }
    },

    /**
     * إضافة مراسلة جديدة
     * @param correspondence بيانات المراسلة الجديدة
     */
    addCorrespondence: async (correspondence: Correspondence) => {
      try {
        const store = correspondence.type === 'وارد' ? 'correspondence_incoming' : 'correspondence_outgoing';
        await databaseService.add(store, correspondence);
        dispatch({ type: 'ADD_CORRESPONDENCE', payload: correspondence });
        actions.logActivity('correspondence', 'create', `تم إضافة مراسلة جديدة: ${correspondence.subject}`);
      } catch (error) {
        console.error('خطأ في إضافة المراسلة:', error);
        throw error;
      }
    },

    /**
     * تحديث بيانات مراسلة موجودة
     * @param id معرف المراسلة
     * @param data البيانات المحدثة
     */
    updateCorrespondence: async (id: string, data: Partial<Correspondence>) => {
      try {
        const correspondence = state.correspondence.find(c => c.id === id);
        if (correspondence) {
          const store = correspondence.type === 'وارد' ? 'correspondence_incoming' : 'correspondence_outgoing';
          await databaseService.update(store, id, data);
          dispatch({ type: 'UPDATE_CORRESPONDENCE', payload: { id, data } });
          actions.logActivity('correspondence', 'update', `تم تحديث المراسلة: ${id}`);
        }
      } catch (error) {
        console.error('خطأ في تحديث المراسلة:', error);
        throw error;
      }
    },

    /**
     * حذف مراسلة من النظام
     * @param id معرف المراسلة
     */
    deleteCorrespondence: async (id: string) => {
      try {
        const correspondence = state.correspondence.find(c => c.id === id);
        if (correspondence) {
          const store = correspondence.type === 'وارد' ? 'correspondence_incoming' : 'correspondence_outgoing';
          await databaseService.delete(store, id);
          dispatch({ type: 'DELETE_CORRESPONDENCE', payload: id });
          actions.logActivity('correspondence', 'delete', `تم حذف المراسلة: ${id}`);
        }
      } catch (error) {
        console.error('خطأ في حذف المراسلة:', error);
        throw error;
      }
    },

    /**
     * تحميل جميع الإدارات من قاعدة البيانات
     */
    loadDepartments: async () => {
      try {
        const departments = await databaseService.getAll<Department>('departments');
        dispatch({ type: 'SET_DEPARTMENTS', payload: departments });
      } catch (error) {
        console.error('خطأ في تحميل الإدارات:', error);
        dispatch({ type: 'SET_DEPARTMENTS', payload: [] });
      }
    },

    /**
     * إضافة إدارة جديدة
     * @param department بيانات الإدارة الجديدة
     */
    addDepartment: async (department: Department) => {
      try {
        await databaseService.add('departments', department);
        dispatch({ type: 'ADD_DEPARTMENT', payload: department });
        actions.logActivity('departments', 'create', `تم إضافة إدارة جديدة: ${department.name}`);
      } catch (error) {
        console.error('خطأ في إضافة الإدارة:', error);
        throw error;
      }
    },

    /**
     * تحديث بيانات إدارة موجودة
     * @param id معرف الإدارة
     * @param data البيانات المحدثة
     */
    updateDepartment: async (id: string, data: Partial<Department>) => {
      try {
        await databaseService.update('departments', id, data);
        dispatch({ type: 'UPDATE_DEPARTMENT', payload: { id, data } });
        actions.logActivity('departments', 'update', `تم تحديث الإدارة: ${id}`);
      } catch (error) {
        console.error('خطأ في تحديث الإدارة:', error);
        throw error;
      }
    },

    /**
     * حذف إدارة من النظام
     * @param id معرف الإدارة
     */
    deleteDepartment: async (id: string) => {
      try {
        await databaseService.delete('departments', id);
        dispatch({ type: 'DELETE_DEPARTMENT', payload: id });
        actions.logActivity('departments', 'delete', `تم حذف الإدارة: ${id}`);
      } catch (error) {
        console.error('خطأ في حذف الإدارة:', error);
        throw error;
      }
    },

    /**
     * تحميل جميع الأقسام من قاعدة البيانات
     */
    loadDivisions: async () => {
      try {
        const divisions = await databaseService.getAll<Division>('divisions');
        dispatch({ type: 'SET_DIVISIONS', payload: divisions });
      } catch (error) {
        console.error('خطأ في تحميل الأقسام:', error);
        dispatch({ type: 'SET_DIVISIONS', payload: [] });
      }
    },

    /**
     * إضافة قسم جديد
     * @param division بيانات القسم الجديد
     */
    addDivision: async (division: Division) => {
      try {
        await databaseService.add('divisions', division);
        dispatch({ type: 'ADD_DIVISION', payload: division });
        actions.logActivity('divisions', 'create', `تم إضافة قسم جديد: ${division.name}`);
      } catch (error) {
        console.error('خطأ في إضافة القسم:', error);
        throw error;
      }
    },

    /**
     * تحديث بيانات قسم موجود
     * @param id معرف القسم
     * @param data البيانات المحدثة
     */
    updateDivision: async (id: string, data: Partial<Division>) => {
      try {
        await databaseService.update('divisions', id, data);
        dispatch({ type: 'UPDATE_DIVISION', payload: { id, data } });
        actions.logActivity('divisions', 'update', `تم تحديث القسم: ${id}`);
      } catch (error) {
        console.error('خطأ في تحديث القسم:', error);
        throw error;
      }
    },

    /**
     * حذف قسم من النظام
     * @param id معرف القسم
     */
    deleteDivision: async (id: string) => {
      try {
        await databaseService.delete('divisions', id);
        dispatch({ type: 'DELETE_DIVISION', payload: id });
        actions.logActivity('divisions', 'delete', `تم حذف القسم: ${id}`);
      } catch (error) {
        console.error('خطأ في حذف القسم:', error);
        throw error;
      }
    },

    /**
     * تسجيل نشاط في سجل النظام
     * @param module اسم الوحدة
     * @param action نوع الإجراء
     * @param details تفاصيل الإجراء
     */
    logActivity: (module: string, action: string, details: string) => {
      // تجنب تسجيل النشاط إذا لم تكن قاعدة البيانات مهيئة
      if (!databaseService.isInitialized) {
        console.warn('تم تجاهل تسجيل النشاط - قاعدة البيانات غير مهيئة');
        return;
      }
      
      const log: ActivityLog = {
        id: `log-${Date.now()}`,
        module,
        action,
        userId: state.currentUser.id,
        userName: state.currentUser.name,
        details,
        timestamp: new Date(),
        ipAddress: 'localhost'
      };
      
      dispatch({ type: 'ADD_ACTIVITY_LOG', payload: log });
      // تسجيل النشاط بشكل غير متزامن
      setTimeout(() => {
        databaseService.add('activity_logs', log).catch(console.error);
      }, 100);
    },

    /**
     * إضافة إشعار جديد
     * @param notification بيانات الإشعار
     */
    addNotification: (notification: any) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * خطاف استخدام السياق
 * يوفر وصولاً آمناً للحالة والإجراءات
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
