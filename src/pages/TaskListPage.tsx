import React, { useState } from 'react';
import TaskList from '../components/Tasks/TaskList';

const PAGE_SIZE = 20;

const TaskListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">قائمة المهام</h2>
      <div className="flex items-center gap-4 mb-4">
        <button
          className={`px-3 py-1 rounded-lg border text-sm font-medium ${sortOrder === 'desc' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
          onClick={() => setSortOrder('desc')}
        >ترتيب من الأحدث للأقدم</button>
        <button
          className={`px-3 py-1 rounded-lg border text-sm font-medium ${sortOrder === 'asc' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
          onClick={() => setSortOrder('asc')}
        >ترتيب من الأقدم للأحدث</button>
      </div>
      <TaskList page={page} pageSize={PAGE_SIZE} sortOrder={sortOrder} />
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          className="px-3 py-1 rounded-lg border text-sm font-medium"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >السابق</button>
        <span className="text-sm font-bold">صفحة {page}</span>
        <button
          className="px-3 py-1 rounded-lg border text-sm font-medium"
          onClick={() => setPage(p => p + 1)}
        >التالي</button>
      </div>
    </div>
  );
};

export default TaskListPage;
