import React from 'react';
import RecurringTasks from '../components/Tasks/RecurringTasks';

const RecurringTasksPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">إدارة المهام المتكررة</h2>
      <RecurringTasks />
    </div>
  );
};

export default RecurringTasksPage;
