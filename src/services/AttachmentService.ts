/**
 * خدمة إدارة المرفقات والملفات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import { databaseService } from './DatabaseService';

// واجهة بيانات المرفق
interface Attachment {
  id: string;
  moduleType: 'task' | 'correspondence_incoming' | 'correspondence_outgoing' | 'employee';
  moduleId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  fileHash: string;
  uploadedBy: string;
  uploadedAt: Date;
  downloadCount: number;
}

// فئة خدمة المرفقات
class AttachmentService {
  private maxFileSize = 10 * 1024 * 1024; // 10 ميجابايت
  private allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif'];

  /**
   * رفع ملف جديد
   */
  async uploadFile(
    file: File, 
    moduleType: Attachment['moduleType'], 
    moduleId: string,
    uploadedBy: string
  ): Promise<string> {
    try {
      // التحقق من حجم الملف
      if (file.size > this.maxFileSize) {
        throw new Error(`حجم الملف كبير جداً. الحد الأقصى ${this.maxFileSize / 1024 / 1024} ميجابايت`);
      }

      // التحقق من نوع الملف
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!this.allowedTypes.includes(fileExtension)) {
        throw new Error(`نوع الملف غير مدعوم. الأنواع المدعومة: ${this.allowedTypes.join(', ')}`);
      }

      // تحويل الملف إلى Base64 للتخزين المحلي
      const fileData = await this.fileToBase64(file);
      const fileHash = await this.generateFileHash(fileData);

      // إنشاء سجل المرفق
      const attachment: Attachment = {
        id: `att-${Date.now()}`,
        moduleType,
        moduleId,
        fileName: `${Date.now()}_${file.name}`,
        originalName: file.name,
        filePath: fileData, // تخزين البيانات مباشرة في IndexedDB
        fileSize: file.size,
        mimeType: file.type,
        fileExtension,
        fileHash,
        uploadedBy,
        uploadedAt: new Date(),
        downloadCount: 0
      };

      // حفظ في قاعدة البيانات
      await databaseService.add('attachments', attachment);

      return attachment.id;
    } catch (error) {
      console.error('خطأ في رفع الملف:', error);
      throw error;
    }
  }

  /**
   * الحصول على مرفقات وحدة معينة
   */
  async getModuleAttachments(moduleType: string, moduleId: string): Promise<Attachment[]> {
    try {
      const allAttachments = await databaseService.getAll<Attachment>('attachments');
      return allAttachments.filter(att => 
        att.moduleType === moduleType && att.moduleId === moduleId
      );
    } catch (error) {
      console.error('خطأ في جلب المرفقات:', error);
      return [];
    }
  }

  /**
   * تحميل ملف
   */
  async downloadFile(attachmentId: string): Promise<void> {
    try {
      const attachment = await databaseService.getById<Attachment>('attachments', attachmentId);
      if (!attachment) {
        throw new Error('الملف غير موجود');
      }

      // إنشاء رابط التحميل
      const link = document.createElement('a');
      link.href = attachment.filePath;
      link.download = attachment.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // تحديث عداد التحميل
      await databaseService.update('attachments', attachmentId, {
        downloadCount: attachment.downloadCount + 1
      });
    } catch (error) {
      console.error('خطأ في تحميل الملف:', error);
      throw error;
    }
  }

  /**
   * حذف مرفق
   */
  async deleteAttachment(attachmentId: string): Promise<void> {
    try {
      await databaseService.delete('attachments', attachmentId);
    } catch (error) {
      console.error('خطأ في حذف المرفق:', error);
      throw error;
    }
  }

  /**
   * تحويل الملف إلى Base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * توليد hash للملف
   */
  private async generateFileHash(fileData: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(fileData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * تنسيق حجم الملف
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * التحقق من نوع الملف
   */
  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * التحقق من ملف PDF
   */
  isPdfFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  /**
   * التحقق من ملف Office
   */
  isOfficeFile(mimeType: string): boolean {
    return mimeType.includes('officedocument') || 
           mimeType.includes('msword') || 
           mimeType.includes('excel') ||
           mimeType.includes('powerpoint');
  }
}

// إنشاء مثيل واحد من الخدمة
export const attachmentService = new AttachmentService();

export default AttachmentService;