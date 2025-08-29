import React from 'react';
import { useApp } from '../../context/AppContext';

const RecurringTasks: React.FC = () => {
  const { state } = useApp();
  const recurringTasks = (state.tasks || []).filter(t => t.isRecurring);
  if (recurringTasks.length === 0) {
    return <div className="text-center py-8 text-gray-500">لا توجد مهام متكررة.</div>;
  }
  return (
    <div>
      {recurringTasks.map(task => (
        <div key={task.id} className="p-4 border-b border-gray-100">
          <div className="font-bold text-lg">{task.title}</div>
          <div className="text-sm text-gray-600">{task.status}</div>
          {/* إذا كان هناك زر أو select أضف title="..." */}
        </div>
      ))}
    </div>
  );
};

export default RecurringTasks;