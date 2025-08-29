/**
 * أدوات التنسيق والعرض
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

// تنسيق الأرقام بالعربية
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ar-EG');
};

// تنسيق العملة
export const formatCurrency = (amount: number, currency: string = 'EGP'): string => {
  const currencySymbols: Record<string, string> = {
    EGP: 'ج.م',
    USD: '$',
    EUR: '€',
    SAR: 'ر.س'
  };

  return `${formatNumber(amount)} ${currencySymbols[currency] || currency}`;
};

// تنسيق النسبة المئوية
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// تقصير النص مع إضافة نقاط
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// تنسيق حجم الملف
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 بايت';
  
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// تنسيق رقم الهاتف
export const formatPhoneNumber = (phone: string): string => {
  // إزالة جميع الأحرف غير الرقمية
  const cleaned = phone.replace(/\D/g, '');
  
  // تنسيق الرقم المصري
  if (cleaned.startsWith('20')) {
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8)}`;
  } else if (cleaned.startsWith('01')) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone;
};

// تنسيق البريد الإلكتروني
export const formatEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// تحويل النص إلى عنوان URL
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '') // إزالة الأحرف الخاصة مع الاحتفاظ بالعربية
    .replace(/[\s_-]+/g, '-') // استبدال المسافات بشرطات
    .replace(/^-+|-+$/g, ''); // إزالة الشرطات من البداية والنهاية
};

// تنسيق الاسم (أول حرف كبير)
export const formatName = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// تنسيق الرقم الوظيفي
export const formatEmployeeNumber = (number: string): string => {
  return number.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

// تنسيق الرقم القومي
export const formatNationalId = (id: string): string => {
  const cleaned = id.replace(/\D/g, '');
  if (cleaned.length === 14) {
    return `${cleaned.substring(0, 1)} ${cleaned.substring(1, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7, 12)} ${cleaned.substring(12)}`;
  }
  return id;
};

// تنسيق العنوان
export const formatAddress = (address: string): string => {
  return address
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(', ');
};

// تحويل الحالة إلى لون
export const getStatusColor = (status: string, type: 'task' | 'correspondence' | 'employee' = 'task'): string => {
  const colorMaps = {
    task: {
      'جديدة': 'bg-gray-100 text-gray-800',
      'قيد التنفيذ': 'bg-blue-100 text-blue-800',
      'مكتملة': 'bg-green-100 text-green-800',
      'متأخرة': 'bg-red-100 text-red-800',
      'ملغية': 'bg-gray-100 text-gray-600'
    },
    correspondence: {
      'مسجل': 'bg-gray-100 text-gray-800',
      'قيد المراجعة': 'bg-blue-100 text-blue-800',
      'محال': 'bg-yellow-100 text-yellow-800',
      'مغلق': 'bg-green-100 text-green-800',
      'مؤرشف': 'bg-purple-100 text-purple-800',
      'مسودة': 'bg-gray-100 text-gray-600',
      'صادر': 'bg-green-100 text-green-800'
    },
    employee: {
      'نشط': 'bg-green-100 text-green-800',
      'معطل': 'bg-red-100 text-red-800',
      'إجازة': 'bg-yellow-100 text-yellow-800'
    }
  };

  return colorMaps[type][status] || 'bg-gray-100 text-gray-800';
};

// تحويل الأولوية إلى لون
export const getPriorityColor = (priority: string): string => {
  const priorityColors: Record<string, string> = {
    'منخفض': 'bg-green-100 text-green-800',
    'متوسط': 'bg-yellow-100 text-yellow-800',
    'عالي': 'bg-orange-100 text-orange-800',
    'عاجل': 'bg-red-100 text-red-800'
  };

  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
};

// تحويل مستوى السرية إلى لون
export const getConfidentialityColor = (confidentiality: string): string => {
  const confidentialityColors: Record<string, string> = {
    'عادي': 'bg-gray-100 text-gray-800',
    'سري': 'bg-orange-100 text-orange-800',
    'سري جداً': 'bg-red-100 text-red-800'
  };

  return confidentialityColors[confidentiality] || 'bg-gray-100 text-gray-800';
};