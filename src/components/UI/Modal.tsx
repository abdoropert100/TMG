/**
 * مكون النافذة المنبثقة العامة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
}

/**
 * مكون النافذة المنبثقة القابل لإعادة الاستخدام
 * يدعم الإغلاق بالنقر خارجها أو بمفتاح ESC
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOutsideClick = true,
  closeOnEscape = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // إدارة التركيز عند فتح النافذة
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // إغلاق النافذة بمفتاح ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, closeOnEscape]);

  // منع التمرير في الخلفية عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // أحجام النوافذ المختلفة
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* النافذة الرئيسية */}
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* رأس النافذة */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* محتوى النافذة */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>

      </div>

      {/* طبقة الخلفية للإغلاق عند النقر خارج النافذة */}
      {closeOnOutsideClick && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={onClose}
        ></div>
      )}
    </div>
  );
};

export default Modal;