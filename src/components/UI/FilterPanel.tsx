/**
 * مكون لوحة الفلاتر
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState } from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text' | 'number';
  options?: { value: string; label: string }[];
  value?: any;
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterOption[];
  onFilterChange: (key: string, value: any) => void;
  onReset: () => void;
  onApply?: () => void;
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  onApply,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const renderFilterInput = (filter: FilterOption) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={filter.value || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{filter.placeholder || 'اختر...'}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={filter.value || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'text':
        return (
          <input
            type="text"
            value={filter.value || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={filter.value || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      default:
        return null;
    }
  };

  const hasActiveFilters = filters.some(filter => filter.value);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">الفلاتر</h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                نشط
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              إعادة تعيين
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isOpen ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map(filter => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>

            {onApply && (
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={onApply}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  تطبيق الفلاتر
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;