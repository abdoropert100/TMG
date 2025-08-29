/**
 * مكون عارض المرفقات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import { Download, Eye, Trash2, File, Image, FileText } from 'lucide-react';
import { attachmentService } from '../../services/AttachmentService';

// واجهة بيانات المرفق
interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  downloadCount: number;
}

// واجهة خصائص عارض المرفقات
interface AttachmentViewerProps {
  moduleType: string;
  moduleId: string;
  canDelete?: boolean;
  showUploadCount?: boolean;
}

/**
 * مكون عارض المرفقات
 * يعرض قائمة المرفقات مع إمكانية التحميل والحذف
 */
const AttachmentViewer: React.FC<AttachmentViewerProps> = ({
  moduleType,
  moduleId,
  canDelete = false,
  showUploadCount = true
}) => {
  // حالات المكون
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * تحميل المرفقات عند تحميل المكون
   */
  useEffect(() => {
    loadAttachments();
  }, [moduleType, moduleId]);

  /**
   * دالة تحميل المرفقات
   */
  const loadAttachments = async () => {
    try {
      setLoading(true);
      const attachmentsData = await attachmentService.getModuleAttachments(moduleType, moduleId);
      setAttachments(attachmentsData);
      setError(null);
    } catch (err) {
      setError('خطأ في تحميل المرفقات');
      console.error('خطأ في تحميل المرفقات:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * دالة تحميل ملف
   */
  const handleDownload = async (attachmentId: string) => {
    try {
      await attachmentService.downloadFile(attachmentId);
      // إعادة تحميل المرفقات لتحديث عداد التحميل
      await loadAttachments();
    } catch (error) {
      console.error('خطأ في تحميل الملف:', error);
      setError('خطأ في تحميل الملف');
    }
  };

  /**
   * دالة حذف مرفق
   */
  const handleDelete = async (attachmentId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المرفق؟')) {
      try {
        await attachmentService.deleteAttachment(attachmentId);
        await loadAttachments();
      } catch (error) {
        console.error('خطأ في حذف المرفق:', error);
        setError('خطأ في حذف المرفق');
      }
    }
  };

  /**
   * دالة الحصول على أيقونة نوع الملف
   */
  const getFileIcon = (mimeType: string) => {
    if (attachmentService.isImageFile(mimeType)) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (attachmentService.isPdfFile(mimeType)) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (attachmentService.isOfficeFile(mimeType)) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  /**
   * دالة تنسيق تاريخ الرفع
   */
  const formatUploadDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="mr-2 text-gray-600">جاري تحميل المرفقات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <File className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">لا توجد مرفقات</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      
      {/* عنوان القسم */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          المرفقات ({attachments.length})
        </h4>
        {showUploadCount && (
          <span className="text-xs text-gray-500">
            إجمالي التحميلات: {attachments.reduce((sum, att) => sum + att.downloadCount, 0)}
          </span>
        )}
      </div>

      {/* قائمة المرفقات */}
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            
            {/* أيقونة نوع الملف */}
            <div className="flex-shrink-0">
              {getFileIcon(attachment.mimeType)}
            </div>

            {/* معلومات الملف */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachment.originalName}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{attachmentService.formatFileSize(attachment.fileSize)}</span>
                <span>•</span>
                <span>{formatUploadDate(attachment.uploadedAt)}</span>
                {attachment.downloadCount > 0 && (
                  <>
                    <span>•</span>
                    <span>{attachment.downloadCount} تحميل</span>
                  </>
                )}
              </div>
            </div>

            {/* إجراءات الملف */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(attachment.id)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="تحميل"
              >
                <Download className="h-4 w-4" />
              </button>
              
              {canDelete && (
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default AttachmentViewer;