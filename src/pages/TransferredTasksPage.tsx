import React from 'react';
import TaskTransfer from '../components/Tasks/TaskTransfer';

const TransferredTasksPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">المهام المحولة</h2>
      <TaskTransfer />
    </div>
  );
};

export default TransferredTasksPage;
