/**
 * خدمة إدارة قاعدة البيانات المحلية
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 * م. عبدالعال محمد - abdelaalmiti@gmail.com - +201000731116
 */

import { Task, Correspondence, Department, Division, ActivityLog } from '../types';

/**
 * واجهة إعدادات قاعدة البيانات
 * تحدد اسم قاعدة البيانات والإصدار والمخازن
 */
interface DatabaseConfig {
  name: string;
  version: number;
  stores: string[];
}

/**
 * إعدادات قاعدة البيانات الأساسية
 * تحدد جميع المخازن المطلوبة للنظام
 */
const DB_CONFIG: DatabaseConfig = {
  name: 'IrrigationManagementDB',
  version: 1,
  stores: [
    'employees',
    'departments', 
    'divisions',
    'tasks',
    'correspondence_incoming',
    'correspondence_outgoing',
    'activity_logs',
    'employee_points',
    'notifications',
    'system_settings',
    'correspondents',
    'attachments',
    'system_users',
    'categories',
    'category_assignments',
    'trash_items',
    'user_sessions',
    'login_logs',
    'sectors',
    'central_departments',
    'general_departments'
  ]
};

/**
 * فئة خدمة قاعدة البيانات الرئيسية
 * توفر جميع العمليات المطلوبة للتعامل مع IndexedDB
 */
class DatabaseService {
  /**
   * إضافة التصنيفات الافتراضية إذا لم تكن موجودة
   */
  async ensureDefaultTags() {
    const defaults = ['تقرير', 'للنشر', 'للعلم'];
    const tags = await this.getCorrespondenceTags();
    for (const tag of defaults) {
      if (!tags.includes(tag)) {
        await this.addCorrespondenceTag(tag);
      }
    }
  }
  /**
   * تحويل مهمة بين الإدارات/الأقسام
   * @param taskId معرف المهمة
   * @param transferData بيانات التحويل
   * @param userId معرف الموظف المنفذ
   */
  async transferTask(taskId: string, transferData: any, userId: string): Promise<void> {
    // جلب المهمة الحالية
    const task = await this.getById('tasks', taskId) as Task;
    if (!task || !task.department || !task.division || !task.assignedTo) throw new Error('المهمة غير مكتملة البيانات');

    // تحديث بيانات المهمة
    const updatedTask: Task = {
      ...task,
      department: transferData.toDepartment,
      division: transferData.toDivision,
      assignedTo: [transferData.toEmployee],
      transferHistory: Array.isArray(task.transferHistory) ? [
        ...task.transferHistory,
        {
          fromDepartment: task.department,
          toDepartment: transferData.toDepartment,
          transferredBy: userId,
          transferredAt: new Date(),
          reason: transferData.reason,
          notes: transferData.notes
        }
      ] : [
        {
          fromDepartment: task.department,
          toDepartment: transferData.toDepartment,
          transferredBy: userId,
          transferredAt: new Date(),
          reason: transferData.reason,
          notes: transferData.notes
        }
      ],
  updated_at: new Date()
    };
    await this.update('tasks', taskId, updatedTask);
    // تسجيل العملية في سجل النشاطات
    await this.logActivity('transfer', 'tasks', taskId, updatedTask, task);
  }
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  // مشتركين للتحديثات المباشرة
  private subscribers: Map<string, ((action: string, data: any) => void)[]> = new Map();

  /**
   * تهيئة قاعدة البيانات
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.db) {
      console.log('قاعدة البيانات مهيئة مسبقاً');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onerror = () => {
        console.error('خطأ في فتح قاعدة البيانات:', request.error);
        this.isInitialized = false;
        this.db = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('تم تهيئة قاعدة البيانات بنجاح');
        
        // تهيئة البيانات التجريبية بعد تأخير قصير
        setTimeout(() => {
          this.initializeMockDataIfNeeded();
        }, 500);
        
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // إنشاء جميع المخازن المطلوبة
        DB_CONFIG.stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });
            
            // إضافة الفهارس المناسبة لكل مخزن
            this.createIndexes(store, storeName);
          }
        });
      };
    });
  }

  /**
   * تهيئة البيانات التجريبية إذا لم تكن موجودة
   */
  private async initializeMockDataIfNeeded(): Promise<void> {
    try {
      const employees = await this.getAll('employees');
      if (employees.length === 0) {
        // استيراد البيانات التجريبية
        const { initializeMockData } = await import('../data/mockData');
        await initializeMockData();
      }
    } catch (error) {
      console.error('خطأ في تهيئة البيانات التجريبية:', error);
    }
  }

  /**
   * خاصية للتحقق من حالة التهيئة
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
  /**
   * إنشاء الفهارس المناسبة لكل مخزن
   * @param store مخزن قاعدة البيانات
   * @param storeName اسم المخزن
   */
  private createIndexes(store: IDBObjectStore, storeName: string): void {
    switch (storeName) {
      case 'employees':
        // فهارس خاصة بالموظفين
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('employeeNumber', 'employeeNumber', { unique: true });
        store.createIndex('email', 'email', { unique: false });
        store.createIndex('department', 'department', { unique: false });
        store.createIndex('division', 'division', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('points', 'points', { unique: false });
        break;

      case 'tasks':
        // فهارس خاصة بالمهام
        store.createIndex('title', 'title', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('priority', 'priority', { unique: false });
        store.createIndex('department', 'department', { unique: false });
        store.createIndex('division', 'division', { unique: false });
        store.createIndex('createdBy', 'createdBy', { unique: false });
        store.createIndex('startDate', 'startDate', { unique: false });
        store.createIndex('endDate', 'endDate', { unique: false });
        break;

      case 'correspondence_incoming':
      case 'correspondence_outgoing':
        // فهارس خاصة بالمراسلات
        store.createIndex('number', 'number', { unique: true });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('subject', 'subject', { unique: false });
        store.createIndex('confidentiality', 'confidentiality', { unique: false });
        store.createIndex('urgency', 'urgency', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('department', 'department', { unique: false });
        store.createIndex('division', 'division', { unique: false });
        break;

      case 'departments':
        // فهارس خاصة بالإدارات
        store.createIndex('name', 'name', { unique: true });
        break;

      case 'divisions':
        // فهارس خاصة بالأقسام
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('departmentId', 'departmentId', { unique: false });
        break;

      case 'activity_logs':
        // فهارس خاصة بسجل النشاطات
        store.createIndex('module', 'module', { unique: false });
        store.createIndex('action', 'action', { unique: false });
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        break;

      case 'notifications':
        // فهارس خاصة بالإشعارات
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('read', 'read', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        break;

      case 'system_users':
        // فهارس خاصة بمستخدمي النظام
        store.createIndex('username', 'username', { unique: true });
        store.createIndex('role', 'role', { unique: false });
        store.createIndex('isActive', 'isActive', { unique: false });
        break;

      case 'categories':
        // فهارس خاصة بالتصنيفات
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('applicableModules', 'applicableModules', { unique: false });
        store.createIndex('isActive', 'isActive', { unique: false });
        break;

      case 'category_assignments':
        // فهارس خاصة بربط التصنيفات
        store.createIndex('categoryId', 'categoryId', { unique: false });
        store.createIndex('entityType', 'entityType', { unique: false });
        store.createIndex('entityId', 'entityId', { unique: false });
        break;

      case 'trash_items':
        // فهارس خاصة بسلة المحذوفات
        store.createIndex('entityType', 'entityType', { unique: false });
        store.createIndex('deletedBy', 'deletedBy', { unique: false });
        store.createIndex('deletedAt', 'deletedAt', { unique: false });
        store.createIndex('canRestore', 'canRestore', { unique: false });
        break;

      case 'sectors':
        // فهارس خاصة بالقطاعات
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('isActive', 'isActive', { unique: false });
        break;

      case 'central_departments':
        // فهارس خاصة بالإدارات المركزية
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('sectorId', 'sectorId', { unique: false });
        store.createIndex('isActive', 'isActive', { unique: false });
        break;

      case 'general_departments':
        // فهارس خاصة بالإدارات العامة
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('centralDeptId', 'centralDeptId', { unique: false });
        store.createIndex('isActive', 'isActive', { unique: false });
        break;
    }
  }

  /**
   * إضافة سجل جديد إلى المخزن المحدد
   * @param storeName اسم المخزن
   * @param data بيانات السجل
   */
  async add<T>(storeName: string, data: T): Promise<string> {
    if (!this.db || !this.isInitialized) {
      console.warn('قاعدة البيانات غير مهيئة، جاري إعادة التهيئة...');
      await this.initialize();
      if (!this.db) {
        throw new Error('فشل في تهيئة قاعدة البيانات');
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // إضافة معرف فريد وطوابع زمنية إذا لم تكن موجودة
      const record = { 
        ...data, 
        id: (data as any).id || this.generateId(),
        createdAt: (data as any).createdAt || new Date(),
        updatedAt: new Date()
      };

      // استخدام put بدلاً من add لتجنب خطأ المفتاح المكرر
      const request = store.put(record);

      request.onsuccess = () => {
        // تسجيل العملية في سجل النشاطات (بدون await لتجنب التكرار)
        this.logActivity('create', storeName, record.id, record).catch(console.error);
        // إشعار المشتركين بالتحديث
        this.notifySubscribers(storeName, 'add', record);
        resolve(record.id);
      };

      request.onerror = () => {
        console.error(`خطأ في إضافة السجل إلى ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * تحديث سجل موجود في المخزن المحدد
   * @param storeName اسم المخزن
   * @param id معرف السجل
   * @param data البيانات المحدثة
   */
  async update<T>(storeName: string, id: string, data: Partial<T>): Promise<void> {
    if (!this.db) throw new Error('قاعدة البيانات غير مهيئة');

    return new Promise(async (resolve, reject) => {
      try {
        // الحصول على السجل الحالي للمقارنة
        const currentRecord = await this.getById(storeName, id);
        if (!currentRecord) {
          reject(new Error('السجل غير موجود'));
          return;
        }

        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // دمج البيانات الجديدة مع الموجودة
        const updatedRecord = {
          ...currentRecord,
          ...data,
          id,
          updatedAt: new Date()
        };

        const request = store.put(updatedRecord);

        request.onsuccess = () => {
          // تسجيل العملية في سجل النشاطات
          this.logActivity('update', storeName, id, updatedRecord, currentRecord);
          // إشعار المشتركين بالتحديث
          this.notifySubscribers(storeName, 'update', updatedRecord);
          resolve();
        };

        request.onerror = () => {
          console.error(`خطأ في تحديث السجل في ${storeName}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * حذف سجل من المخزن (soft delete)
   * @param storeName اسم المخزن
   * @param id معرف السجل
   */
  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('قاعدة البيانات غير مهيئة');

    return new Promise(async (resolve, reject) => {
      try {
        // الحصول على السجل قبل الحذف لتسجيل العملية
        const record = await this.getById(storeName, id);
        
        // تنفيذ الحذف الفعلي
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
          // تسجيل عملية الحذف
          this.logActivity('delete', storeName, id, null, record);
          // إشعار المشتركين بالحذف
          this.notifySubscribers(storeName, 'delete', { id });
          resolve();
        };

        request.onerror = () => {
          console.error(`خطأ في حذف السجل من ${storeName}:`, request.error);
          reject(request.error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * حذف نهائي للسجل من قاعدة البيانات
   * @param storeName اسم المخزن
   * @param id معرف السجل
   */
  async hardDelete(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('قاعدة البيانات غير مهيئة');

    return new Promise(async (resolve, reject) => {
      try {
        // الحصول على السجل قبل الحذف النهائي
        const record = await this.getById(storeName, id);
        
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
          // تسجيل عملية الحذف النهائي
          this.logActivity('hard_delete', storeName, id, null, record);
          resolve();
        };

        request.onerror = () => {
          console.error(`خطأ في الحذف النهائي من ${storeName}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * استعادة سجل محذوف منطقياً
   * @param storeName اسم المخزن
   * @param id معرف السجل
   */
  async restore(storeName: string, id: string): Promise<void> {
    try {
      await this.update(storeName, id, { 
        deletedAt: null,
        updatedAt: new Date()
      });
      // تسجيل عملية الاستعادة
      this.logActivity('restore', storeName, id);
    } catch (error) {
      console.error('خطأ في استعادة السجل:', error);
      throw error;
    }
  }

  /**
   * الحصول على جميع السجلات المحذوفة منطقياً
   * @param storeName اسم المخزن
   */
  async getDeleted<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error('قاعدة البيانات غير مهيئة');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        // فلترة السجلات المحذوفة فقط
        const deletedResults = results.filter((item: any) => item.deletedAt);
        resolve(deletedResults);
      };

      request.onerror = () => {
        console.error(`خطأ في الحصول على السجلات المحذوفة من ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * حفظ إعدادات النظام
   * @param settings الإعدادات الجديدة
   */
  async saveSettings(settings: any): Promise<void> {
    try {
      await this.add('system_settings', {
        id: 'main-settings',
        ...settings,
        updatedAt: new Date()
      });
    } catch (error) {
      // إذا كانت الإعدادات موجودة مسبقاً، قم بالتحديث
      await this.update('system_settings', 'main-settings', {
        ...settings,
        updatedAt: new Date()
      });
    }
  }

  /**
   * جلب إعدادات النظام المحفوظة
   */
  async getSettings(): Promise<any> {
    try {
      return await this.getById('system_settings', 'main-settings');
    } catch (error) {
      console.error('خطأ في جلب الإعدادات:', error);
      return null;
    }
  }

  /**
   * الحصول على سجل واحد بالمعرف
   * @param storeName اسم المخزن
   * @param id معرف السجل
   */
  async getById<T>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) throw new Error('قاعدة البيانات غير مهيئة');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error(`خطأ في الحصول على السجل من ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * الحصول على جميع السجلات من المخزن (باستثناء المحذوفة)
   * @param storeName اسم المخزن
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error('قاعدة البيانات غير مهيئة');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        // استبعاد السجلات المحذوفة منطقياً
        const activeResults = results.filter((item: any) => !item.deletedAt);
        resolve(activeResults);
      };

      request.onerror = () => {
        console.error(`خطأ في الحصول على السجلات من ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * البحث في المخزن باستخدام فهرس محدد
   * @param storeName اسم المخزن
   * @param indexName اسم الفهرس
   * @param value القيمة المراد البحث عنها
   */
  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    if (!this.db) throw new Error('قاعدة البيانات غير مهيئة');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error(`خطأ في البحث بالفهرس ${indexName} في ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * الاشتراك في تحديثات مخزن معين
   */
  subscribe(storeName: string, callback: (action: string, data: any) => void): () => void {
    if (!this.subscribers.has(storeName)) {
      this.subscribers.set(storeName, []);
    }
    this.subscribers.get(storeName)!.push(callback);
    
    // إرجاع دالة إلغاء الاشتراك
    return () => {
      const callbacks = this.subscribers.get(storeName);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * إشعار المشتركين بالتحديثات
   */
  private notifySubscribers(storeName: string, action: string, data: any): void {
    const callbacks = this.subscribers.get(storeName);
    if (callbacks) {
      callbacks.forEach(callback => callback(action, data));
    }
  }

  /**
   * البحث المتقدم في مخزن معين
   */
  async search<T>(storeName: string, searchTerm: string, fields: string[]): Promise<T[]> {
    const allData = await this.getAll<T>(storeName);
    
    if (!searchTerm.trim()) return allData;
    
    return allData.filter(item => {
      return fields.some(field => {
        const value = (item as any)[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
  }

  /**
   * الحصول على البيانات مع الترقيم
   */
  async getPaginated<T>(storeName: string, page: number, pageSize: number): Promise<T[]> {
    const allData = await this.getAll<T>(storeName);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allData.slice(startIndex, endIndex);
  }

  /**
   * عد السجلات في مخزن معين
   */
  async count(storeName: string): Promise<number> {
    const data = await this.getAll(storeName);
    return data.length;
  }

  /**
   * فحص حالة قاعدة البيانات
   */
  async getStatus(): Promise<{ connected: boolean; stores: string[]; version: number }> {
    return {
      connected: this.isInitialized && this.db !== null,
      stores: DB_CONFIG.stores,
      version: DB_CONFIG.version
    };
  }

  /**
   * تسجيل نشاط في سجل النظام
   * @param action نوع الإجراء
   * @param module اسم الوحدة
   * @param entityId معرف الكيان
   * @param newData البيانات الجديدة
   * @param oldData البيانات القديمة
   */
  private async logActivity(
    action: string, 
    module: string, 
    entityId: string, 
    newData?: any, 
    oldData?: any
  ): Promise<void> {
    try {
      // تجنب التكرار اللانهائي
      if (module === 'activity_logs') return;
      
      const log: ActivityLog = {
        id: this.generateId(),
        module,
        action,
        userId: 'user-001',
        userName: 'مدير النظام',
        details: `${action} في ${module}`,
        timestamp: new Date(),
        ipAddress: 'localhost'
      };

      // إضافة مباشرة بدون استدعاء add لتجنب التكرار
      if (this.db && this.isInitialized) {
        const transaction = this.db.transaction(['activity_logs'], 'readwrite');
        const store = transaction.objectStore('activity_logs');
        store.put(log);
      }
    } catch (error) {
      console.error('خطأ في تسجيل النشاط:', error);
    }
  }

  /**
   * توليد معرف فريد للسجلات الجديدة
   */
  private generateId(): string {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * تصدير جميع البيانات إلى تنسيق JSON
   */
  async exportToJSON(): Promise<string> {
    const exportData: any = {};
    
    for (const storeName of DB_CONFIG.stores) {
      exportData[storeName] = await this.getAll(storeName);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * استيراد البيانات من تنسيق JSON
   * @param jsonData البيانات بتنسيق JSON
   */
  async importFromJSON(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      for (const storeName of DB_CONFIG.stores) {
        if (data[storeName] && Array.isArray(data[storeName])) {
          // مسح البيانات الحالية قبل الاستيراد
          await this.clearStore(storeName);
          
          // إضافة البيانات المستوردة
          for (const record of data[storeName]) {
            await this.add(storeName, record);
          }
        }
      }
    } catch (error) {
      console.error('خطأ في استيراد البيانات:', error);
      throw error;
    }
  }

  /**
   * مسح جميع البيانات من مخزن محدد
   * @param storeName اسم المخزن
   */
  private async clearStore(storeName: string): Promise<void> {
    if (!this.db) throw new Error('قاعدة البيانات غير مهيئة');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * إنشاء نسخة احتياطية كاملة من البيانات
   */
  async createBackup(): Promise<Blob> {
    const exportData = await this.exportToJSON();
    const blob = new Blob([exportData], { type: 'application/json' });
    return blob;
  }

  /**
   * استعادة البيانات من نسخة احتياطية
   * @param file ملف النسخة الاحتياطية
   */
  async restoreFromBackup(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const jsonData = e.target?.result as string;
          await this.importFromJSON(jsonData);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * إدارة التصنيفات المركزية للمراسلات
   */
  async getCorrespondenceTags(): Promise<string[]> {
    const settings = await this.getSettings();
    return Array.isArray(settings?.correspondenceTags) ? settings.correspondenceTags : [];
  }
  async addCorrespondenceTag(tag: string): Promise<void> {
    const settings = await this.getSettings() || {};
    const tags = Array.isArray(settings.correspondenceTags) ? settings.correspondenceTags : [];
    if (!tags.includes(tag)) tags.push(tag);
    await this.saveSettings({ ...settings, correspondenceTags: tags });
  }
  async updateCorrespondenceTag(oldTag: string, newTag: string): Promise<void> {
    const settings = await this.getSettings() || {};
  let tags = Array.isArray(settings.correspondenceTags) ? settings.correspondenceTags : [];
  tags = tags.map((t: string) => t === oldTag ? newTag : t);
    await this.saveSettings({ ...settings, correspondenceTags: tags });
  }
  async deleteCorrespondenceTag(tag: string): Promise<void> {
    const settings = await this.getSettings() || {};
  let tags = Array.isArray(settings.correspondenceTags) ? settings.correspondenceTags : [];
  tags = tags.filter((t: string) => t !== tag);
    await this.saveSettings({ ...settings, correspondenceTags: tags });
  }
}

/**
 * إنشاء مثيل واحد من خدمة قاعدة البيانات (Singleton)
 */
export const databaseService = new DatabaseService();

// تهيئة قاعدة البيانات تلقائياً عند تحميل الوحدة
databaseService.initialize().then(() => databaseService.ensureDefaultTags()).catch(console.error);

export default DatabaseService;