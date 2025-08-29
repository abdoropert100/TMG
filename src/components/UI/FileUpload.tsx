/**
 * مكون رفع الملفات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Download, Trash2 } from 'lucide-react';
import { attachmentService } from '../../services/AttachmentService';

// واجهة خصائص مكون رفع الملفات
interface FileUploadProps {
  moduleType: 'task' | 'correspondence_incoming' | 'correspondence_outgoing' | 'employee';
  moduleId: string;
  uploadedBy: string;
  onUploadComplete?: (attachmentId: string) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  showPreview?: boolean;
}

// واجهة ملف محلي
interface LocalFile {
  id: string;
  file: File;
  preview?: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  attachmentId?: string;
}

/**
 * مكون رفع الملفات المتقدم
 * يدعم السحب والإفلات ومعاينة الملفات
 */
const FileUpload: React.FC<FileUploadProps> = ({
  moduleType,
  moduleId,
  uploadedBy,
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  showPreview = true
}) => {
  // حالات المكون
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * دالة معالجة اختيار الملفات
   */
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: LocalFile[] = [];
    
    for (let i = 0; i < selectedFiles.length && files.length + newFiles.length < maxFiles; i++) {
      const file = selectedFiles[i];
      const localFile: LocalFile = {
        id: `file-${Date.now()}-${i}`,
        file,
        uploading: false,
        uploaded: false
      };

      // إنشاء معاينة للصور
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles(prev => prev.map(f => 
            f.id === localFile.id ? { ...f, preview: e.target?.result as string } : f
          ));
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(localFile);
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  /**
   * دالة رفع ملف واحد
   */
  const uploadFile = async (localFile: LocalFile) => {
    try {
      // تحديث حالة الرفع
      setFiles(prev => prev.map(f => 
        f.id === localFile.id ? { ...f, uploading: true, error: undefined } : f
      ));

      // رفع الملف
      const attachmentId = await attachmentService.uploadFile(
        localFile.file,
        moduleType,
        moduleId,
        uploadedBy
      );

      // تحديث حالة النجاح
      setFiles(prev => prev.map(f => 
        f.id === localFile.id ? { 
          ...f, 
          uploading: false, 
          uploaded: true, 
          attachmentId 
        } : f
      ));

      // استدعاء callback النجاح
      if (onUploadComplete) {
        onUploadComplete(attachmentId);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في رفع الملف';
      
      // تحديث حالة الخطأ
      setFiles(prev => prev.map(f => 
        f.id === localFile.id ? { 
          ...f, 
          uploading: false, 
          error: errorMessage 
        } : f
      ));

      // استدعاء callback الخطأ
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  };

  /**
   * دالة رفع جميع الملفات
   */
  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => !f.uploaded && !f.uploading && !f.error);
    
    for (const file of pendingFiles) {
      await uploadFile(file);
    }
  };

  /**
   * دالة إزالة ملف من القائمة
   */
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  /**
   * دالة الحصول على أيقونة نوع الملف
   */
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  /**
   * معالجة السحب والإفلات
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      
      {/* منطقة رفع الملفات */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          اسحب الملفات هنا أو انقر للاختيار
        </p>
        <p className="text-xs text-gray-500 mb-4">
          الحد الأقصى: {maxFiles} ملفات، {attachmentService.formatFileSize(10 * 1024 * 1024)} لكل ملف
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          اختيار الملفات
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* قائمة الملفات المختارة */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">الملفات المختارة ({files.length})</h4>
            <button
              onClick={uploadAllFiles}
              disabled={files.every(f => f.uploaded || f.uploading)}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              رفع الكل
            </button>
          </div>

          <div className="space-y-2">
            {files.map((localFile) => (
              <div key={localFile.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                
                {/* معاينة الملف */}
                <div className="flex-shrink-0">
                  {localFile.preview ? (
                    <img 
                      src={localFile.preview} 
                      alt={localFile.file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(localFile.file.type)}
                    </div>
                  )}
                </div>

                {/* معلومات الملف */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {localFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {attachmentService.formatFileSize(localFile.file.size)}
                  </p>
                  {localFile.error && (
                    <p className="text-xs text-red-600">{localFile.error}</p>
                  )}
                </div>

                {/* حالة الرفع */}
                <div className="flex items-center gap-2">
                  {localFile.uploading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  {localFile.uploaded && (
                    <div className="text-green-600">✓</div>
                  )}
                  {!localFile.uploaded && !localFile.uploading && (
                    <button
                      onClick={() => uploadFile(localFile)}
                      className="text-blue-600 hover:text-blue-800"
                      title="رفع"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(localFile.id)}
                    className="text-red-600 hover:text-red-800"
                    title="إزالة"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default FileUpload;