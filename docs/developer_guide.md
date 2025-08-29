# دليل المطور الفني
## نظام إدارة مصلحة الري
### وزارة الموارد المائية والري - جمهورية مصر العربية

---

## فهرس المحتويات

1. [نظرة عامة على البنية](#نظرة-عامة-على-البنية)
2. [إعداد بيئة التطوير](#إعداد-بيئة-التطوير)
3. [هيكل المشروع](#هيكل-المشروع)
4. [أنماط التطوير](#أنماط-التطوير)
5. [إدارة البيانات](#إدارة-البيانات)
6. [واجهة المستخدم](#واجهة-المستخدم)
7. [الاختبارات](#الاختبارات)
8. [النشر والتوزيع](#النشر-والتوزيع)
9. [المساهمة في المشروع](#المساهمة-في-المشروع)

---

## نظرة عامة على البنية

### التقنيات المستخدمة:

#### الواجهة الأمامية:
- **React 18**: مكتبة بناء واجهات المستخدم
- **TypeScript**: لغة البرمجة مع الأنواع الثابتة
- **Vite**: أداة البناء والتطوير
- **Tailwind CSS**: إطار عمل التصميم
- **Lucide React**: مكتبة الأيقونات
- **Recharts**: مكتبة الرسوم البيانية

#### إدارة البيانات:
- **IndexedDB**: قاعدة بيانات محلية في المتصفح
- **Local Storage**: تخزين الإعدادات المحلية
- **MySQL**: قاعدة البيانات الرئيسية (خادم)

#### أدوات التطوير:
- **ESLint**: فحص جودة الكود
- **Prettier**: تنسيق الكود
- **Husky**: Git hooks
- **Jest**: إطار عمل الاختبارات

### المبادئ المعمارية:

#### 1. فصل الاهتمامات (Separation of Concerns):
```
├── components/     # مكونات الواجهة
├── services/       # منطق الأعمال
├── types/          # تعريفات الأنواع
├── utils/          # أدوات مساعدة
└── hooks/          # React Hooks مخصصة
```

#### 2. إدارة الحالة:
- **React State**: للحالة المحلية
- **Context API**: للحالة المشتركة
- **Custom Hooks**: لمنطق الحالة المعقد

#### 3. التصميم المتجاوب:
- **Mobile First**: تصميم يبدأ من الهاتف المحمول
- **RTL Support**: دعم الكتابة من اليمين لليسار
- **Accessibility**: إمكانية الوصول للجميع

---

## إعداد بيئة التطوير

### المتطلبات:
```bash
# Node.js 18 أو أحدث
node --version  # v18.0.0+

# npm أو yarn
npm --version   # 8.0.0+
```

### التثبيت:
```bash
# استنساخ المشروع
git clone https://github.com/irrigation-ministry/management-system.git
cd management-system

# تثبيت التبعيات
npm install

# نسخ ملف الإعدادات
cp .env.example .env

# تشغيل خادم التطوير
npm run dev
```

### أوامر التطوير:
```bash
# تشغيل خادم التطوير
npm run dev

# بناء المشروع للإنتاج
npm run build

# معاينة البناء
npm run preview

# فحص جودة الكود
npm run lint

# إصلاح مشاكل الكود
npm run lint:fix

# تشغيل الاختبارات
npm run test

# تشغيل الاختبارات مع المراقبة
npm run test:watch

# تحليل حجم الحزمة
npm run analyze
```

### إعداد المحرر (VS Code):

#### الإضافات المطلوبة:
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### إعدادات المحرر:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

---

## هيكل المشروع

### الهيكل العام:
```
src/
├── components/           # مكونات React
│   ├── Layout/          # مكونات التخطيط
│   ├── Dashboard/       # مكونات لوحة التحكم
│   ├── Tasks/           # مكونات المهام
│   ├── Employees/       # مكونات الموظفين
│   ├── Correspondence/ # مكونات المراسلات
│   ├── Reports/         # مكونات التقارير
│   └── Settings/        # مكونات الإعدادات
├── services/            # خدمات البيانات
│   ├── DatabaseService.ts
│   ├── ExcelService.ts
│   └── NotificationService.ts
├── types/               # تعريفات TypeScript
│   └── index.ts
├── utils/               # أدوات مساعدة
│   ├── dateUtils.ts
│   ├── formatUtils.ts
│   └── validationUtils.ts
├── hooks/               # React Hooks مخصصة
│   ├── useDatabase.ts
│   ├── useNotifications.ts
│   └── useLocalStorage.ts
├── data/                # بيانات تجريبية
│   └── mockData.ts
├── database/            # ملفات قاعدة البيانات
│   ├── schema.sql
│   └── sample_data.sql
└── assets/              # الموارد الثابتة
    ├── images/
    └── icons/
```

### تنظيم المكونات:

#### مكون نموذجي:
```typescript
// src/components/Tasks/TaskCard.tsx

import React from 'react';
import { Task } from '../../types';
import { formatDate } from '../../utils/dateUtils';

// واجهة خصائص المكون
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

// مكون بطاقة المهمة
const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  // منطق المكون
  const handleEdit = () => {
    onEdit(task);
  };

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      onDelete(task.id);
    }
  };

  // عرض المكون
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {task.title}
      </h3>
      <p className="text-gray-600 mb-4">{task.description}</p>
      
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:text-blue-800"
          >
            تعديل
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

// دالة مساعدة للألوان
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'مكتملة': return 'bg-green-100 text-green-800';
    case 'قيد التنفيذ': return 'bg-yellow-100 text-yellow-800';
    case 'متأخرة': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default TaskCard;
```

---

## أنماط التطوير

### 1. تسمية الملفات والمجلدات:

#### القواعد:
- **المكونات**: PascalCase (مثل `TaskCard.tsx`)
- **الخدمات**: PascalCase + Service (مثل `DatabaseService.ts`)
- **الأدوات**: camelCase (مثل `dateUtils.ts`)
- **الأنواع**: camelCase (مثل `index.ts`)
- **المجلدات**: PascalCase للمكونات، camelCase للباقي

### 2. تعريف الأنواع:

```typescript
// src/types/index.ts

// نوع أساسي للكيان
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// نوع الموظف
export interface Employee extends BaseEntity {
  name: string;
  employeeNumber: string;
  email: string;
  phone: string;
  department: string;
  division: string;
  position: string;
  points: number;
  status: 'نشط' | 'معطل' | 'إجازة';
  permissions: string[];
}

// نوع المهمة
export interface Task extends BaseEntity {
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
}

// نوع الاستجابة من API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// نوع خيارات الفلترة
export interface FilterOptions {
  search?: string;
  status?: string;
  department?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
```

### 3. إدارة الحالة:

#### استخدام Context:
```typescript
// src/contexts/AppContext.tsx

import React, { createContext, useContext, useReducer } from 'react';

// تعريف حالة التطبيق
interface AppState {
  currentUser: Employee | null;
  notifications: Notification[];
  settings: SystemSettings;
  isLoading: boolean;
}

// تعريف الإجراءات
type AppAction = 
  | { type: 'SET_USER'; payload: Employee }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'SET_LOADING'; payload: boolean };

// مخفض الحالة
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload] 
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// إنشاء السياق
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// مزود السياق
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    currentUser: null,
    notifications: [],
    settings: defaultSettings,
    isLoading: false
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// خطاف استخدام السياق
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

### 4. خطافات مخصصة:

```typescript
// src/hooks/useDatabase.ts

import { useState, useEffect } from 'react';
import { databaseService } from '../services/DatabaseService';

// خطاف لإدارة البيانات
export const useDatabase = <T>(storeName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تحميل البيانات
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await databaseService.getAll<T>(storeName);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // إضافة عنصر جديد
  const addItem = async (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await databaseService.add(storeName, item);
      await loadData(); // إعادة تحميل البيانات
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في إضافة العنصر');
      throw err;
    }
  };

  // تحديث عنصر
  const updateItem = async (id: string, updates: Partial<T>) => {
    try {
      await databaseService.update(storeName, id, updates);
      await loadData(); // إعادة تحميل البيانات
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحديث العنصر');
      throw err;
    }
  };

  // حذف عنصر
  const deleteItem = async (id: string) => {
    try {
      await databaseService.delete(storeName, id);
      await loadData(); // إعادة تحميل البيانات
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في حذف العنصر');
      throw err;
    }
  };

  // تحميل البيانات عند التحميل الأول
  useEffect(() => {
    loadData();
  }, [storeName]);

  return {
    data,
    loading,
    error,
    loadData,
    addItem,
    updateItem,
    deleteItem
  };
};
```

---

## إدارة البيانات

### خدمة قاعدة البيانات:

#### العمليات الأساسية:
```typescript
// src/services/DatabaseService.ts

class DatabaseService {
  // إضافة سجل جديد
  async add<T>(storeName: string, data: T): Promise<string> {
    // تنفيذ الإضافة
  }

  // تحديث سجل موجود
  async update<T>(storeName: string, id: string, data: Partial<T>): Promise<void> {
    // تنفيذ التحديث
  }

  // حذف سجل
  async delete(storeName: string, id: string): Promise<void> {
    // تنفيذ الحذف
  }

  // الحصول على سجل بالمعرف
  async getById<T>(storeName: string, id: string): Promise<T | null> {
    // تنفيذ الاستعلام
  }

  // الحصول على جميع السجلات
  async getAll<T>(storeName: string): Promise<T[]> {
    // تنفيذ الاستعلام
  }

  // البحث بالفهرس
  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    // تنفيذ البحث
  }
}
```

### التحقق من صحة البيانات:

```typescript
// src/utils/validationUtils.ts

// قواعد التحقق
export const validationRules = {
  required: (value: any) => value !== null && value !== undefined && value !== '',
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value: string) => /^[0-9]{11}$/.test(value),
  employeeNumber: (value: string) => /^EMP[0-9]{3,}$/.test(value)
};

// دالة التحقق العامة
export const validate = (data: any, rules: Record<string, any[]>) => {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const rule of fieldRules) {
      if (typeof rule === 'function') {
        if (!rule(value)) {
          errors[field] = `${field} غير صحيح`;
          break;
        }
      } else if (rule.validator && !rule.validator(value)) {
        errors[field] = rule.message || `${field} غير صحيح`;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// مثال على الاستخدام
export const validateEmployee = (employee: Partial<Employee>) => {
  return validate(employee, {
    name: [validationRules.required],
    employeeNumber: [validationRules.required, validationRules.employeeNumber],
    email: [validationRules.email],
    phone: [validationRules.phone]
  });
};
```

---

## واجهة المستخدم

### نظام التصميم:

#### الألوان:
```css
/* src/index.css */

:root {
  /* الألوان الأساسية */
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* الألوان الرمادية */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-900: #111827;
  
  /* الخطوط */
  --font-family: 'Cairo', sans-serif;
}
```

#### المكونات القابلة لإعادة الاستخدام:

```typescript
// src/components/UI/Button.tsx

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? 'جاري التحميل...' : children}
    </button>
  );
};
```

### إمكانية الوصول:

```typescript
// مثال على مكون يدعم إمكانية الوصول
const AccessibleModal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // إدارة التركيز
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // إغلاق بمفتاح Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <h2 id="modal-title" className="text-xl font-semibold mb-4">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};
```

---

## الاختبارات

### إعداد بيئة الاختبار:

```bash
# تثبيت أدوات الاختبار
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### اختبار المكونات:

```typescript
// src/components/Tasks/__tests__/TaskCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from '../TaskCard';
import { Task } from '../../../types';

// بيانات تجريبية للاختبار
const mockTask: Task = {
  id: '1',
  title: 'مهمة تجريبية',
  description: 'وصف المهمة التجريبية',
  status: 'قيد التنفيذ',
  priority: 'عالي',
  assignedTo: ['emp-1'],
  completedBy: [],
  department: 'dept-1',
  division: 'div-1',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  points: 50,
  createdBy: 'emp-1',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('TaskCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('يعرض معلومات المهمة بشكل صحيح', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('مهمة تجريبية')).toBeInTheDocument();
    expect(screen.getByText('وصف المهمة التجريبية')).toBeInTheDocument();
    expect(screen.getByText('قيد التنفيذ')).toBeInTheDocument();
  });

  test('يستدعي دالة التعديل عند النقر على زر التعديل', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('تعديل'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  test('يظهر تأكيد الحذف عند النقر على زر الحذف', () => {
    // محاكاة دالة confirm
    window.confirm = jest.fn(() => true);

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('حذف'));
    expect(window.confirm).toHaveBeenCalledWith('هل أنت متأكد من حذف هذه المهمة؟');
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
});
```

### اختبار الخدمات:

```typescript
// src/services/__tests__/DatabaseService.test.ts

import DatabaseService from '../DatabaseService';

// محاكاة IndexedDB
const mockIDBRequest = {
  onsuccess: null as any,
  onerror: null as any,
  result: null as any
};

const mockIDBTransaction = {
  objectStore: jest.fn(() => ({
    add: jest.fn(() => mockIDBRequest),
    get: jest.fn(() => mockIDBRequest),
    getAll: jest.fn(() => mockIDBRequest),
    put: jest.fn(() => mockIDBRequest),
    delete: jest.fn(() => mockIDBRequest)
  }))
};

const mockIDBDatabase = {
  transaction: jest.fn(() => mockIDBTransaction)
};

describe('DatabaseService', () => {
  let databaseService: DatabaseService;

  beforeEach(() => {
    databaseService = new DatabaseService();
    // محاكاة قاعدة البيانات المهيئة
    (databaseService as any).db = mockIDBDatabase;
    (databaseService as any).isInitialized = true;
  });

  test('إضافة عنصر جديد', async () => {
    const testData = { name: 'اختبار', value: 123 };

    // محاكاة نجاح العملية
    setTimeout(() => {
      mockIDBRequest.onsuccess();
    }, 0);

    const result = await databaseService.add('test-store', testData);

    expect(mockIDBDatabase.transaction).toHaveBeenCalledWith(['test-store'], 'readwrite');
    expect(result).toBeDefined();
  });

  test('الحصول على جميع العناصر', async () => {
    const testData = [{ id: '1', name: 'اختبار 1' }, { id: '2', name: 'اختبار 2' }];

    // محاكاة نجاح العملية
    mockIDBRequest.result = testData;
    setTimeout(() => {
      mockIDBRequest.onsuccess();
    }, 0);

    const result = await databaseService.getAll('test-store');

    expect(mockIDBDatabase.transaction).toHaveBeenCalledWith(['test-store'], 'readonly');
    expect(result).toEqual(testData);
  });
});
```

### اختبار التكامل:

```typescript
// src/__tests__/integration/TaskManagement.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../../contexts/AppContext';
import TaskList from '../../components/Tasks/TaskList';

// مكون مساعد للاختبار
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>
    {children}
  </AppProvider>
);

describe('إدارة المهام - اختبار التكامل', () => {
  test('دورة حياة المهمة الكاملة', async () => {
    render(
      <TestWrapper>
        <TaskList />
      </TestWrapper>
    );

    // إضافة مهمة جديدة
    fireEvent.click(screen.getByText('إضافة مهمة جديدة'));

    // ملء النموذج
    fireEvent.change(screen.getByLabelText('عنوان المهمة'), {
      target: { value: 'مهمة اختبار' }
    });

    fireEvent.change(screen.getByLabelText('الوصف'), {
      target: { value: 'وصف مهمة الاختبار' }
    });

    // حفظ المهمة
    fireEvent.click(screen.getByText('حفظ'));

    // التحقق من ظهور المهمة في القائمة
    await waitFor(() => {
      expect(screen.getByText('مهمة اختبار')).toBeInTheDocument();
    });

    // تعديل المهمة
    fireEvent.click(screen.getByText('تعديل'));
    fireEvent.change(screen.getByDisplayValue('مهمة اختبار'), {
      target: { value: 'مهمة اختبار محدثة' }
    });
    fireEvent.click(screen.getByText('حفظ التغييرات'));

    // التحقق من التحديث
    await waitFor(() => {
      expect(screen.getByText('مهمة اختبار محدثة')).toBeInTheDocument();
    });
  });
});
```

---

## النشر والتوزيع

### بناء المشروع للإنتاج:

```bash
# بناء المشروع
npm run build

# فحص البناء
npm run preview

# تحليل حجم الحزمة
npm run analyze
```

### إعداد خادم الإنتاج:

#### استخدام Nginx:
```nginx
# /etc/nginx/sites-available/irrigation-system

server {
    listen 80;
    server_name irrigation.gov.eg;
    root /var/www/irrigation-system/dist;
    index index.html;

    # ضغط الملفات
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # تخزين مؤقت للموارد الثابتة
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # إعادة توجيه جميع الطلبات إلى index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # أمان إضافي
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Docker:

```dockerfile
# Dockerfile

# مرحلة البناء
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# مرحلة الإنتاج
FROM nginx:alpine

# نسخ ملفات البناء
COPY --from=builder /app/dist /usr/share/nginx/html

# نسخ إعدادات Nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml

version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secure_password
      MYSQL_DATABASE: irrigation_management_system
    volumes:
      - mysql_data:/var/lib/mysql
      - ./src/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped

volumes:
  mysql_data:
```

### CI/CD Pipeline:

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/irrigation-system
            git pull origin main
            npm ci
            npm run build
            sudo systemctl reload nginx
```

---

## المساهمة في المشروع

### قواعد المساهمة:

#### 1. إعداد البيئة:
```bash
# استنساخ المشروع
git clone https://github.com/irrigation-ministry/management-system.git
cd management-system

# إنشاء فرع جديد
git checkout -b feature/new-feature

# تثبيت التبعيات
npm install

# تشغيل الاختبارات
npm test
```

#### 2. معايير الكود:
- استخدام TypeScript لجميع الملفات
- اتباع قواعد ESLint المحددة
- كتابة تعليقات باللغة العربية
- اختبار جميع الوظائف الجديدة

#### 3. رسائل الالتزام:
```bash
# تنسيق رسائل الالتزام
git commit -m "feat: إضافة ميزة البحث المتقدم في المهام"
git commit -m "fix: إصلاح مشكلة تحميل البيانات"
git commit -m "docs: تحديث دليل المستخدم"
```

#### 4. مراجعة الكود:
- إنشاء Pull Request مع وصف واضح
- التأكد من نجاح جميع الاختبارات
- طلب مراجعة من فريق التطوير

### هيكل المساهمة:

```
المساهمة الجديدة:
├── تحليل المتطلبات
├── تصميم الحل
├── تطوير الكود
├── كتابة الاختبارات
├── تحديث الوثائق
└── مراجعة الكود
```

### قائمة مراجعة المساهمة:

- [ ] الكود يتبع معايير المشروع
- [ ] جميع الاختبارات تمر بنجاح
- [ ] الوثائق محدثة
- [ ] لا توجد تحذيرات من ESLint
- [ ] الكود محسن للأداء
- [ ] يدعم إمكانية الوصول
- [ ] متوافق مع المتصفحات المدعومة

---

## الموارد والمراجع

### الوثائق الرسمية:
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### أدوات التطوير:
- [VS Code](https://code.visualstudio.com/)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)

### المجتمع والدعم:
- [GitHub Repository](https://github.com/irrigation-ministry/management-system)
- [Discord Server](https://discord.gg/irrigation-dev)
- البريد الإلكتروني: dev@irrigation.gov.eg

---

*آخر تحديث: يناير 2024*
*الإصدار: 1.0*
