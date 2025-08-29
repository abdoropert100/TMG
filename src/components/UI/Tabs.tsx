/**
 * مكون التبويبات القابل لإعادة الاستخدام
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState } from 'react';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* شريط التبويبات */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 space-x-reverse px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && onTabChange(tab.key)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* محتوى التبويب */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Tabs;