/**
 * خطاف قاعدة البيانات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { useState, useEffect } from 'react';
import { databaseService } from '../services/DatabaseService';

export const useDatabase = <T>(storeName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تحميل البيانات
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await databaseService.getAll<T>(storeName);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل البيانات');
      console.error(`خطأ في تحميل البيانات من ${storeName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  // إضافة عنصر جديد
  const addItem = async (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
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
  const updateItem = async (id: string, updates: Partial<T>): Promise<void> => {
    try {
      await databaseService.update(storeName, id, updates);
      await loadData(); // إعادة تحميل البيانات
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحديث العنصر');
      throw err;
    }
  };

  // حذف عنصر
  const deleteItem = async (id: string): Promise<void> => {
    try {
      await databaseService.delete(storeName, id);
      await loadData(); // إعادة تحميل البيانات
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في حذف العنصر');
      throw err;
    }
  };

  // البحث في البيانات
  const searchItems = async (searchTerm: string, fields: string[]): Promise<T[]> => {
    try {
      return await databaseService.search<T>(storeName, searchTerm, fields);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في البحث');
      return [];
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
    deleteItem,
    searchItems,
    setError
  };
};