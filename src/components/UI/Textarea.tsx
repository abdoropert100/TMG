/**
 * مكون منطقة النص القابل لإعادة الاستخدام
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React from 'react';

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
  icon?: React.ReactNode;
}

const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  rows = 3,
  className = '',
  icon
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {icon && <span className="inline-block mr-1">{icon}</span>}
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
          error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

export default Textarea;