/**
 * مكون شارة الإشعارات
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React from 'react';

interface NotificationBadgeProps {
  count: number;
  maxDisplay?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * مكون شارة الإشعارات مع العدد
 */
const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxDisplay = 99,
  className = '',
  onClick
}) => {
  if (count <= 0) return null;

  const displayCount = count > maxDisplay ? `${maxDisplay}+` : count.toString();

  return (
    <span 
      className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-colors ${className} ${onClick ? 'cursor-pointer hover:bg-red-600' : ''}`}
      onClick={onClick}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;