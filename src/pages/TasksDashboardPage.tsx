import React from 'react';
import IntegratedDashboard from '../components/Dashboard/IntegratedDashboard';

const TasksDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">لوحة تحكم المهام</h2>
      <IntegratedDashboard />
    </div>
  );
};

export default TasksDashboardPage;
