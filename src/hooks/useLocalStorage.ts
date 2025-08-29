/**
 * خطاف التخزين المحلي
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // الحصول على القيمة من التخزين المحلي
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`خطأ في قراءة ${key} من التخزين المحلي:`, error);
      return initialValue;
    }
  });

  // دالة تحديث القيمة
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`خطأ في حفظ ${key} في التخزين المحلي:`, error);
    }
  };

  // دالة حذف القيمة
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`خطأ في حذف ${key} من التخزين المحلي:`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
};