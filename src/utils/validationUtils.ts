/**
 * أدوات التحقق من صحة البيانات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

// قواعد التحقق الأساسية
export const validationRules = {
  required: (value: any) => value !== null && value !== undefined && value !== '',
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value: string) => /^[0-9+\-\s()]{10,15}$/.test(value),
  employeeNumber: (value: string) => /^[A-Z]{2,4}[0-9]{3,6}$/.test(value),
  nationalId: (value: string) => /^[0-9]{14}$/.test(value),
  minLength: (min: number) => (value: string) => value.length >= min,
  maxLength: (max: number) => (value: string) => value.length <= max,
  numeric: (value: string) => /^[0-9]+$/.test(value),
  alphanumeric: (value: string) => /^[a-zA-Z0-9\u0600-\u06FF\s]+$/.test(value),
  url: (value: string) => /^https?:\/\/.+/.test(value),
  date: (value: string) => !isNaN(Date.parse(value)),
  positiveNumber: (value: number) => value > 0,
  nonNegativeNumber: (value: number) => value >= 0
};

// واجهة قاعدة التحقق
interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

// دالة التحقق العامة
export const validate = (data: any, rules: Record<string, ValidationRule[]>) => {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    
    for (const rule of fieldRules) {
      if (!rule.validator(value)) {
        errors[field] = rule.message;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// التحقق من صحة بيانات الموظف
export const validateEmployee = (employee: any) => {
  return validate(employee, {
    name: [
      { validator: validationRules.required, message: 'اسم الموظف مطلوب' },
      { validator: validationRules.minLength(2), message: 'الاسم يجب أن يكون حرفين على الأقل' },
      { validator: validationRules.alphanumeric, message: 'الاسم يحتوي على أحرف غير صالحة' }
    ],
    employeeNumber: [
      { validator: validationRules.required, message: 'الرقم الوظيفي مطلوب' },
      { validator: validationRules.employeeNumber, message: 'تنسيق الرقم الوظيفي غير صحيح' }
    ],
    email: [
      { validator: (value) => !value || validationRules.email(value), message: 'البريد الإلكتروني غير صحيح' }
    ],
    phone: [
      { validator: (value) => !value || validationRules.phone(value), message: 'رقم الهاتف غير صحيح' }
    ],
    nationalId: [
      { validator: (value) => !value || validationRules.nationalId(value), message: 'الرقم القومي يجب أن يكون 14 رقم' }
    ],
    department: [
      { validator: validationRules.required, message: 'الإدارة مطلوبة' }
    ],
    position: [
      { validator: validationRules.required, message: 'المنصب مطلوب' }
    ],
    points: [
      { validator: validationRules.nonNegativeNumber, message: 'النقاط يجب أن تكون رقماً موجباً أو صفر' }
    ]
  });
};

// التحقق من صحة بيانات المهمة
export const validateTask = (task: any) => {
  return validate(task, {
    title: [
      { validator: validationRules.required, message: 'عنوان المهمة مطلوب' },
      { validator: validationRules.minLength(3), message: 'العنوان يجب أن يكون 3 أحرف على الأقل' }
    ],
    description: [
      { validator: validationRules.required, message: 'وصف المهمة مطلوب' },
      { validator: validationRules.minLength(10), message: 'الوصف يجب أن يكون 10 أحرف على الأقل' }
    ],
    department: [
      { validator: validationRules.required, message: 'الإدارة مطلوبة' }
    ],
    assignedTo: [
      { validator: (value) => Array.isArray(value) && value.length > 0, message: 'يجب إسناد المهمة لموظف واحد على الأقل' }
    ],
    startDate: [
      { validator: validationRules.required, message: 'تاريخ البداية مطلوب' }
    ],
    endDate: [
      { validator: validationRules.required, message: 'تاريخ النهاية مطلوب' }
    ],
    points: [
      { validator: validationRules.nonNegativeNumber, message: 'النقاط يجب أن تكون رقماً موجباً أو صفر' }
    ]
  });
};

// التحقق من صحة بيانات المراسلة
export const validateCorrespondence = (correspondence: any) => {
  return validate(correspondence, {
    number: [
      { validator: validationRules.required, message: 'رقم المراسلة مطلوب' }
    ],
    subject: [
      { validator: validationRules.required, message: 'موضوع المراسلة مطلوب' },
      { validator: validationRules.minLength(5), message: 'الموضوع يجب أن يكون 5 أحرف على الأقل' }
    ],
    sender: [
      { validator: (value) => correspondence.type === 'وارد' ? validationRules.required(value) : true, message: 'اسم المرسل مطلوب للمراسلات الواردة' }
    ],
    recipient: [
      { validator: (value) => correspondence.type === 'صادر' ? validationRules.required(value) : true, message: 'اسم المستلم مطلوب للمراسلات الصادرة' }
    ],
    department: [
      { validator: validationRules.required, message: 'الإدارة مطلوبة' }
    ],
    assignedTo: [
      { validator: validationRules.required, message: 'الموظف المسؤول مطلوب' }
    ],
    date: [
      { validator: validationRules.required, message: 'تاريخ المراسلة مطلوب' }
    ]
  });
};

// التحقق من صحة بيانات الإدارة
export const validateDepartment = (department: any) => {
  return validate(department, {
    name: [
      { validator: validationRules.required, message: 'اسم الإدارة مطلوب' },
      { validator: validationRules.minLength(3), message: 'اسم الإدارة يجب أن يكون 3 أحرف على الأقل' }
    ],
    description: [
      { validator: validationRules.required, message: 'وصف الإدارة مطلوب' },
      { validator: validationRules.minLength(10), message: 'الوصف يجب أن يكون 10 أحرف على الأقل' }
    ]
  });
};

// التحقق من صحة بيانات القسم
export const validateDivision = (division: any) => {
  return validate(division, {
    name: [
      { validator: validationRules.required, message: 'اسم القسم مطلوب' },
      { validator: validationRules.minLength(3), message: 'اسم القسم يجب أن يكون 3 أحرف على الأقل' }
    ],
    description: [
      { validator: validationRules.required, message: 'وصف القسم مطلوب' },
      { validator: validationRules.minLength(10), message: 'الوصف يجب أن يكون 10 أحرف على الأقل' }
    ],
    departmentId: [
      { validator: validationRules.required, message: 'الإدارة التابعة مطلوبة' }
    ]
  });
};

// التحقق من صحة كلمة المرور
export const validatePassword = (password: string) => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};