/**
 * أدوات التاريخ والوقت
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

// تنسيق التاريخ بالعربية
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string => {
  const d = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  };

  return d.toLocaleDateString('ar-EG', options[format]);
};

// تنسيق الوقت بالعربية
export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
};

// تنسيق التاريخ والوقت معاً
export const formatDateTime = (date: Date | string): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// حساب الفرق بين تاريخين بالأيام
export const getDaysDifference = (date1: Date | string, date2: Date | string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// التحقق من انتهاء الموعد
export const isOverdue = (endDate: Date | string): boolean => {
  const today = new Date();
  const end = new Date(endDate);
  return end < today;
};

// الحصول على بداية الشهر
export const getStartOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// الحصول على نهاية الشهر
export const getEndOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

// الحصول على بداية الأسبوع
export const getStartOfWeek = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // الأحد = 0
  return new Date(d.setDate(diff));
};

// الحصول على نهاية الأسبوع
export const getEndOfWeek = (date: Date = new Date()): Date => {
  const startOfWeek = getStartOfWeek(date);
  return new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
};

// تحويل التاريخ إلى نص نسبي
export const getRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return 'أمس';
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
  if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} أشهر`;
  return `منذ ${Math.floor(diffDays / 365)} سنوات`;
};

// التحقق من صحة التاريخ
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

// إضافة أيام لتاريخ
export const addDays = (date: Date | string, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// إضافة أشهر لتاريخ
export const addMonths = (date: Date | string, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// الحصول على أيام الأسبوع بالعربية
export const getWeekdays = (): string[] => {
  return ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
};

// الحصول على أشهر السنة بالعربية
export const getMonths = (): string[] => {
  return [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
};