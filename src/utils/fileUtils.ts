/**
 * أدوات إدارة الملفات والمجلدات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

// @ts-ignore
import * as fs from 'fs';
// @ts-ignore
import * as path from 'path';

// إنشاء مجلد في النظام
export const createFolder = (folderName: string): void => {
  try {
  if (typeof window === 'undefined' && fs && path) {
      // بيئة Node/Electron
      const baseDir = path.join(process.cwd(), folderName);
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }
    } else {
      // بيئة المتصفح: محاكاة LocalStorage
      const folders = JSON.parse(localStorage.getItem('systemFolders') || '[]');
      if (!folders.includes(folderName)) {
        folders.push(folderName);
        localStorage.setItem('systemFolders', JSON.stringify(folders));
      }
    }
  } catch (error) {
    console.error('خطأ في إنشاء المجلد:', error);
  }
};

// حفظ ملف في مجلد محدد
export const saveFileToFolder = (folderName: string, fileName: string, fileData: any): void => {
  try {
  if (typeof window === 'undefined' && fs && path) {
      // بيئة Node/Electron
      const baseDir = path.join(process.cwd(), folderName);
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }
      const filePath = path.join(baseDir, fileName);
      // دعم الحفظ للأنواع المختلفة
      if (Buffer.isBuffer(fileData)) {
        fs.writeFileSync(filePath, fileData);
      } else if (fileData instanceof ArrayBuffer) {
        fs.writeFileSync(filePath, Buffer.from(fileData));
      } else if (typeof fileData === 'string') {
        fs.writeFileSync(filePath, fileData);
      } else {
        fs.writeFileSync(filePath, JSON.stringify(fileData));
      }
    } else {
      // بيئة المتصفح: الحفظ في LocalStorage
      createFolder(folderName);
      const folderKey = `folder_${folderName}`;
      const folderFiles = JSON.parse(localStorage.getItem(folderKey) || '{}');
      folderFiles[fileName] = {
        data: fileData,
        createdAt: new Date().toISOString(),
        size: JSON.stringify(fileData).length
      };
      localStorage.setItem(folderKey, JSON.stringify(folderFiles));
    }
  } catch (error) {
    console.error('خطأ في حفظ الملف:', error);
  }
};

// قراءة ملف من مجلد
export const readFileFromFolder = (folderName: string, fileName: string): any => {
  try {
  if (typeof window === 'undefined' && fs && path) {
      // بيئة Node/Electron
      const filePath = path.join(process.cwd(), folderName, fileName);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
      } else {
        return null;
      }
    } else {
      // بيئة المتصفح: القراءة من LocalStorage
      const folderKey = `folder_${folderName}`;
      const folderFiles = JSON.parse(localStorage.getItem(folderKey) || '{}');
      return folderFiles[fileName]?.data || null;
    }
  } catch (error) {
    console.error('خطأ في قراءة الملف:', error);
    return null;
  }
};

// الحصول على قائمة الملفات في مجلد
export const getFilesInFolder = (folderName: string): string[] => {
  try {
  if (typeof window === 'undefined' && fs && path) {
      // بيئة Node/Electron
      const baseDir = path.join(process.cwd(), folderName);
      if (fs.existsSync(baseDir)) {
        return fs.readdirSync(baseDir);
      } else {
        return [];
      }
    } else {
      // بيئة المتصفح: القراءة من LocalStorage
      const folderKey = `folder_${folderName}`;
      const folderFiles = JSON.parse(localStorage.getItem(folderKey) || '{}');
      return Object.keys(folderFiles);
    }
  } catch (error) {
    console.error('خطأ في قراءة المجلد:', error);
    return [];
  }
};

// حذف ملف من مجلد
export const deleteFileFromFolder = (folderName: string, fileName: string): void => {
  try {
  if (typeof window === 'undefined' && fs && path) {
      // بيئة Node/Electron
      const filePath = path.join(process.cwd(), folderName, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } else {
      // بيئة المتصفح: الحذف من LocalStorage
      const folderKey = `folder_${folderName}`;
      const folderFiles = JSON.parse(localStorage.getItem(folderKey) || '{}');
      delete folderFiles[fileName];
      localStorage.setItem(folderKey, JSON.stringify(folderFiles));
    }
  } catch (error) {
    console.error('خطأ في حذف الملف:', error);
  }
};

// تنسيق حجم الملف
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 بايت';
  
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// تحميل ملف للمستخدم
export const downloadFile = (fileName: string, data: any, mimeType: string = 'application/json'): void => {
  try {
    const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('خطأ في تحميل الملف:', error);
  }
};

// دالة تحميل ملف من فولدر النظام أو LocalStorage
export const downloadFileFromFolder = (folderName: string, fileName: string, fileType: string = 'application/octet-stream'): void => {
  try {
    // بيئة Node.js/Electron
    if (typeof window === 'undefined' && require) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', folderName, fileName);
      if (fs.existsSync(filePath)) {
        // يمكن هنا تنفيذ منطق التحميل أو فتح الملف
        // مثال: فتح الملف في تطبيق خارجي أو نسخه
        console.log('تم العثور على الملف:', filePath);
      } else {
        console.error('الملف غير موجود في المسار:', filePath);
      }
    } else {
      // بيئة المتصفح: التحميل من LocalStorage
      const folderKey = `folder_${folderName}`;
      const folderFiles = JSON.parse(localStorage.getItem(folderKey) || '{}');
      const fileData = folderFiles[fileName]?.data;
      if (fileData) {
        const blob = new Blob([fileData], { type: fileType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        alert('لم يتم العثور على الملف في النظام');
      }
    }
  } catch (error) {
    alert('تعذر تحميل الملف');
    console.error('خطأ في تحميل الملف:', error);
  }
};

// إنشاء المجلدات الأساسية للنظام
export const initializeSystemFolders = (): void => {
  const systemFolders = [
    'exports',
    'imports',
    'attachments',
    'backups',
    'reports',
    'templates'
  ];
  systemFolders.forEach(createFolder);
}