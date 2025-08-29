import React from 'react';
import { BarChart3, TrendingUp, Target, Clock, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * مكون رسم بياني للمهام
 * يعرض توزيع المهام حسب الحالة مع إحصائيات تفاعلية
 */
const TasksChart: React.FC = () => {
  // استخدام السياق للحصول على البيانات الفعلية
  const { state } = useApp();

  // حساب البيانات من المهام الفعلية
  const data = React.useMemo(() => {
    const tasks = state.tasks || [];
    return [
      { 
        name: 'جديدة', 
        value: tasks.filter(t => t.status === 'جديدة').length, 
        color: 'bg-blue-500',
        icon: Target
      },
      { 
        name: 'قيد التنفيذ', 
        value: tasks.filter(t => t.status === 'قيد التنفيذ').length, 
        color: 'bg-yellow-500',
        icon: Clock
      },
      { 
        name: 'مكتملة', 
        value: tasks.filter(t => t.status === 'مكتملة').length, 
        color: 'bg-green-500',
        icon: Target
      },
      { 
        name: 'متأخرة', 
        value: tasks.filter(t => t.status === 'متأخرة').length, 
        color: 'bg-red-500',
        icon: AlertTriangle
      }
    ];
  }, [state.tasks]);

  const maxValue = Math.max(...data.map(item => item.value));
  const totalTasks = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">توزيع المهام حسب الحالة</h3>
            <p className="text-sm text-gray-500">إجمالي {totalTasks} مهمة في النظام</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">
            {totalTasks > 0 ? Math.round((data.find(d => d.name === 'مكتملة')?.value || 0) / totalTasks * 100) : 0}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <item.icon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color} transition-all duration-1000`}
                  style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900 min-w-[2rem] text-left">
                {item.value}
              </span>
              <span className="text-xs text-gray-500 min-w-[3rem] text-left">
                ({totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">إجمالي المهام</span>
          <span className="font-bold text-gray-900">
            {totalTasks}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-2">
          <span className="text-gray-500">معدل الإنجاز</span>
          <span className="font-bold text-green-600">
            {totalTasks > 0 ? Math.round((data.find(d => d.name === 'مكتملة')?.value || 0) / totalTasks * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default TasksChart;