/**
 * خدمة نظام الملفات المحلي
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { saveFileToFolder, readFileFromFolder, getFilesInFolder, deleteFileFromFolder, downloadFile, initializeSystemFolders } from '../utils/fileUtils';

class FileSystemService {
  constructor() {
    // تهيئة المجلدات الأساسية عند إنشاء الخدمة
    initializeSystemFolders();
  }

  /**
   * حفظ تقرير في مجلد التقارير
   */
  async saveReport(reportName: string, reportData: any): Promise<void> {
    const fileName = `${reportName}_${new Date().toISOString().split('T')[0]}.json`;
    saveFileToFolder('reports', fileName, reportData);
  }

  /**
   * حفظ نسخة احتياطية
   */
  async saveBackup(backupData: any): Promise<string> {
    const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    saveFileToFolder('backups', fileName, backupData);
    return fileName;
  }

  /**
   * حفظ ملف مستورد
   */
  async saveImportedFile(fileName: string, fileData: any): Promise<void> {
    saveFileToFolder('imports', fileName, fileData);
  }

  /**
   * حفظ ملف مصدر
   */
  async saveExportedFile(fileName: string, fileData: any): Promise<void> {
    saveFileToFolder('exports', fileName, fileData);
  }

  /**
   * حفظ مرفق
   */
  async saveAttachment(fileName: string, fileData: any): Promise<string> {
    const attachmentId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullFileName = `${attachmentId}_${fileName}`;
    saveFileToFolder('attachments', fullFileName, fileData);
    return attachmentId;
  }

  /**
   * الحصول على قائمة التقارير المحفوظة
   */
  getSavedReports(): string[] {
    return getFilesInFolder('reports');
  }

  /**
   * الحصول على قائمة النسخ الاحتياطية
   */
  getSavedBackups(): string[] {
    return getFilesInFolder('backups');
  }

  /**
   * الحصول على قائمة المرفقات
   */
  getSavedAttachments(): string[] {
    return getFilesInFolder('attachments');
  }

  /**
   * قراءة تقرير محفوظ
   */
  readReport(fileName: string): any {
    return readFileFromFolder('reports', fileName);
  }

  /**
   * قراءة نسخة احتياطية
   */
  readBackup(fileName: string): any {
    return readFileFromFolder('backups', fileName);
  }

  /**
   * قراءة مرفق
   */
  readAttachment(fileName: string): any {
    return readFileFromFolder('attachments', fileName);
  }

  /**
   * حذف ملف
   */
  deleteFile(folderName: string, fileName: string): void {
    deleteFileFromFolder(folderName, fileName);
  }

  /**
   * تحميل ملف للمستخدم
   */
  downloadFileToUser(folderName: string, fileName: string, downloadName?: string): void {
    const fileData = readFileFromFolder(folderName, fileName);
    if (fileData) {
      downloadFile(downloadName || fileName, fileData);
    }
  }

  /**
   * الحصول على معلومات المجلد
   */
  getFolderInfo(folderName: string): { fileCount: number; totalSize: number } {
    const files = getFilesInFolder(folderName);
    let totalSize = 0;
    
    files.forEach(fileName => {
      const fileData = readFileFromFolder(folderName, fileName);
      if (fileData) {
        totalSize += JSON.stringify(fileData).length;
      }
    });

    return {
      fileCount: files.length,
      totalSize
    };
  }

  /**
   * تنظيف الملفات القديمة
   */
  cleanupOldFiles(folderName: string, daysOld: number = 30): void {
    const files = getFilesInFolder(folderName);
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    files.forEach(fileName => {
      const fileData = readFileFromFolder(folderName, fileName);
      if (fileData && fileData.createdAt) {
        const fileDate = new Date(fileData.createdAt);
        if (fileDate < cutoffDate) {
          deleteFileFromFolder(folderName, fileName);
        }
      }
    });
  }
}

export const fileSystemService = new FileSystemService();
export default FileSystemService;