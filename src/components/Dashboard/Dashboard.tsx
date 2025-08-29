/**
 * لوحة التحكم الرئيسية لنظام إدارة مصلحة الري
 * وزارة الموارد المائية والري - جمهورية مصر العربية
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import IntegratedDashboard from './IntegratedDashboard';

/**
 * مكون لوحة التحكم الرئيسية
 * يعرض ملخصاً شاملاً لحالة النظام مع إحصائيات ورسوم بيانية تفاعلية
 */
const Dashboard: React.FC = () => {
  return <IntegratedDashboard />;
};

export default Dashboard;