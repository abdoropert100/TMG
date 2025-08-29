import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { Task, Employee, Department, Division } from '../../types';
import { Target, TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

// واجهة خصائص تقرير المهام
interface TasksReportProps {
  tasks: Task[];
  employees: Employee[];
  departments: Department[];
  divisions: Division[];
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

// مكون تقرير المهام
const TasksReport: React.FC<TasksReportProps> = ({
  tasks,
  employees,
  departments,
  divisions,
  reportPeriod
}) => {
  // فلترة المهام حسب فترة التقرير
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.startDate);
      return taskDate >= reportPeriod.startDate && taskDate <= reportPeriod.endDate;
    });
  }, [tasks, reportPeriod]);

  // إحصائيات المهام
  const taskStats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'مكتملة').length;
    const inProgress = filteredTasks.filter(t => t.status === 'قيد التنفيذ').length;
    const overdue = filteredTasks.filter(t => t.status === 'متأخرة').length;
    const newTasks = filteredTasks.filter(t => t.status === 'جديدة').length;

    return {
      total,
      completed,
      inProgress,
      overdue,
      newTasks,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [filteredTasks]);

  // بيانات المهام حسب الحالة للرسم البياني الدائري
  const statusData = useMemo(() => [
    { name: 'مكتملة', value: taskStats.completed, color: '#10B981' },
    { name: 'قيد التنفيذ', value: taskStats.inProgress, color: '#3B82F6' },
    { name: 'متأخرة', value: taskStats.overdue, color: '#EF4444' },
    { name: 'جديدة', value: taskStats.newTasks, color: '#6B7280' }
  ], [taskStats]);

  // بيانات المهام حسب الأولوية
  const priorityData = useMemo(() => {
    const priorities = ['منخفض', 'متوسط', 'عالي', 'عاجل'];
    return priorities.map(priority => ({
      name: priority,
      count: filteredTasks.filter(t => t.priority === priority).length
    }));
  }, [filteredTasks]);

  // بيانات المهام حسب الإدارة
  const departmentData = useMemo(() => {
    return departments.map(dept => {
      const deptTasks = filteredTasks.filter(t => t.department === dept.id);
      return {
        name: dept.name,
        total: deptTasks.length,
        completed: deptTasks.filter(t => t.status === 'مكتملة').length,
        inProgress: deptTasks.filter(t => t.status === 'قيد التنفيذ').length,
        overdue: deptTasks.filter(t => t.status === 'متأخرة').length
      };
    }).filter(dept => dept.total > 0);
  }, [filteredTasks, departments]);

  // بيانات أداء الموظفين
  const employeePerformance = useMemo(() => {
    return employees.map(emp => {
      const empTasks = filteredTasks.filter(t => 
        t.assignedTo && t.assignedTo.includes(emp.id)
      );
      const completedTasks = empTasks.filter(t => t.status === 'مكتملة');
      const totalPoints = completedTasks.reduce((sum, task) => sum + (task.points || 0), 0);
      
      return {
        name: emp.name,
        totalTasks: empTasks.length,
        completedTasks: completedTasks.length,
        points: totalPoints,
        completionRate: empTasks.length > 0 ? Math.round((completedTasks.length / empTasks.length) * 100) : 0
      };
    }).filter(emp => emp.totalTasks > 0)
      .sort((a, b) => {
        // الحصول على إعدادات النظام لمعرفة ما إذا كان وزن صعوبة المهمة مفعل
        const settings = localStorage.getItem('systemSettings');
        const systemConfig = settings ? JSON.parse(settings) : { enableTaskWeighting: false };
        
        // إذا كان وزن صعوبة المهمة مفعل، نرتب حسب النقاط
        if (systemConfig.enableTaskWeighting) {
          return b.points - a.points;
        }
        // وإلا نرتب حسب نسبة الإنجاز
        return b.completionRate - a.completionRate;
      })
      .slice(0, 10); // أفضل 10 موظفين
  }, [filteredTasks, employees]);

  // بيانات المهام عبر الوقت (آخر 30 يوم)
  const timelineData = useMemo(() => {
    const days = [];
    const endDate = new Date(reportPeriod.endDate);
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      
      const dayTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt || task.startDate);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const completedTasks = filteredTasks.filter(task => {
        const completedDate = new Date(task.completedAt || task.endDate);
        return completedDate.toDateString() === date.toDateString() && task.status === 'مكتملة';
      });

      days.push({
        date: date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
        created: dayTasks.length,
        completed: completedTasks.length
      });
    }
    
    return days;
  }, [filteredTasks, reportPeriod]);

  return (
    <div className="space-y-6">
      
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">إجمالي المهام</p>
              <p className="text-2xl font-bold text-blue-900">{taskStats.total}</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">مكتملة</p>
              <p className="text-2xl font-bold text-green-900">{taskStats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">قيد التنفيذ</p>
              <p className="text-2xl font-bold text-yellow-900">{taskStats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">متأخرة</p>
              <p className="text-2xl font-bold text-red-900">{taskStats.overdue}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">معدل الإنجاز</p>
              <p className="text-2xl font-bold text-purple-900">{taskStats.completionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* توزيع المهام حسب الحالة */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المهام حسب الحالة</h3>
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
        </div>

        {/* المهام حسب الأولوية */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">المهام حسب الأولوية</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* المهام حسب الإدارة */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">المهام حسب الإدارة</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={departmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#10B981" name="مكتملة" />
            <Bar dataKey="inProgress" stackId="a" fill="#3B82F6" name="قيد التنفيذ" />
            <Bar dataKey="overdue" stackId="a" fill="#EF4444" name="متأخرة" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* أداء الموظفين */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">أفضل 10 موظفين (حسب النقاط)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموظف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجمالي المهام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المهام المكتملة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النقاط
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معدل الإنجاز
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeePerformance.map((emp, index) => (
                <tr key={index} className={index < 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 && (
                        <span className="mr-2 text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-900">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.totalTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.completedTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {emp.points} نقطة
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${emp.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{emp.completionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* المهام عبر الوقت */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">اتجاه المهام (آخر 30 يوم)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="created" stroke="#3B82F6" name="مهام جديدة" />
            <Line type="monotone" dataKey="completed" stroke="#10B981" name="مهام مكتملة" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default TasksReport;
