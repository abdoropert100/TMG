/**
 * لوحة تحكم المهام المتقدمة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Target,
  TrendingUp,
  Users,
  Building2,
  Award,
  Repeat,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * مكون لوحة تحكم المهام الشاملة
 * يعرض إحصائيات ورسوم بيانية تفاعلية للمهام
 */
const TaskDashboard: React.FC = () => {
  const { state } = useApp();

  // حساب الإحصائيات الرئيسية
  const mainStats = React.useMemo(() => {
    const tasks = state.tasks || [];
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'مكتملة').length;
    const inProgress = tasks.filter(t => t.status === 'قيد التنفيذ').length;
    const overdue = tasks.filter(t => t.status === 'متأخرة').length;
    const newTasks = tasks.filter(t => t.status === 'جديدة').length;
    const recurring = tasks.filter(t => t.isRecurring).length;
    const urgent = tasks.filter(t => t.priority === 'عاجل').length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      newTasks,
      recurring,
      urgent,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [state.tasks]);

  // بيانات المهام حسب الحالة للرسم الدائري
  const statusData = React.useMemo(() => [
    { name: 'مكتملة', value: mainStats.completed, color: '#10B981' },
    { name: 'قيد التنفيذ', value: mainStats.inProgress, color: '#3B82F6' },
    { name: 'متأخرة', value: mainStats.overdue, color: '#EF4444' },
    { name: 'جديدة', value: mainStats.newTasks, color: '#6B7280' }
  ], [mainStats]);

  // بيانات المهام حسب الإدارة
  const departmentData = React.useMemo(() => {
    return (state.departments || []).map(dept => {
      const deptTasks = (state.tasks || []).filter(t => t.department === dept.id);
      return {
        name: dept.name,
        total: deptTasks.length,
        completed: deptTasks.filter(t => t.status === 'مكتملة').length,
        inProgress: deptTasks.filter(t => t.status === 'قيد التنفيذ').length,
        overdue: deptTasks.filter(t => t.status === 'متأخرة').length
      };
    }).filter(dept => dept.total > 0);
  }, [state.tasks, state.departments]);

  // بيانات المهام المتكررة
  const recurringTasksData = React.useMemo(() => {
    const recurringTasks = (state.tasks || []).filter(t => t.isRecurring);
    const frequencyCount = recurringTasks.reduce((acc, task) => {
      const freq = task.recurringPattern?.frequency || 'weekly';
      acc[freq] = (acc[freq] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(frequencyCount).map(([frequency, count]) => ({
      frequency: frequency === 'daily' ? 'يومي' :
                frequency === 'weekly' ? 'أسبوعي' :
                frequency === 'monthly' ? 'شهري' : 'سنوي',
      count
    }));
  }, [state.tasks]);

  return (
    <div className="space-y-6">
      
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">إجمالي المهام</p>
              <p className="text-2xl font-bold text-blue-900">{mainStats.total}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">مكتملة</p>
              <p className="text-2xl font-bold text-green-900">{mainStats.completed}</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">قيد التنفيذ</p>
              <p className="text-2xl font-bold text-yellow-900">{mainStats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">متأخرة</p>
              <p className="text-2xl font-bold text-red-900">{mainStats.overdue}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">متكررة</p>
              <p className="text-2xl font-bold text-purple-900">{mainStats.recurring}</p>
            </div>
            <Repeat className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">عاجلة</p>
              <p className="text-2xl font-bold text-orange-900">{mainStats.urgent}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600">معدل الإنجاز</p>
              <p className="text-2xl font-bold text-indigo-900">{mainStats.completionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* توزيع المهام حسب الحالة */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المهام حسب الحالة</h3>
          {statusData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد مهام لعرضها</p>
              </div>
            </div>
          )}
        </div>

        {/* المهام حسب الإدارة */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">المهام حسب الإدارة</h3>
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10B981" name="مكتملة" />
                <Bar dataKey="inProgress" fill="#3B82F6" name="قيد التنفيذ" />
                <Bar dataKey="overdue" fill="#EF4444" name="متأخرة" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد بيانات لعرضها</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* المهام المتكررة */}
      {recurringTasksData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">المهام المتكررة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recurringTasksData.map((item, index) => (
              <div key={index} className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{item.count}</div>
                <div className="text-sm text-purple-800">{item.frequency}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default TaskDashboard;