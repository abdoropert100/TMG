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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Task, Employee, Department, Division } from '../../types';
import { Users, Award, TrendingUp, Target, Star } from 'lucide-react';

// واجهة خصائص تقرير الموظفين
interface EmployeesReportProps {
  employees: Employee[];
  tasks: Task[];
  departments: Department[];
  divisions: Division[];
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

// مكون تقرير الموظفين
const EmployeesReport: React.FC<EmployeesReportProps> = ({
  employees,
  tasks,
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

  // إحصائيات الموظفين العامة
  const employeeStats = useMemo(() => {
    const activeEmployees = employees.filter(emp => emp.status === 'نشط').length;
    const totalPoints = employees.reduce((sum, emp) => sum + (emp.points || 0), 0);
    const avgPoints = employees.length > 0 ? Math.round(totalPoints / employees.length) : 0;
    
    return {
      total: employees.length,
      active: activeEmployees,
      inactive: employees.length - activeEmployees,
      totalPoints,
      avgPoints
    };
  }, [employees]);

  // توزيع الموظفين حسب الإدارة
  const departmentDistribution = useMemo(() => {
    return departments.map(dept => ({
      name: dept.name,
      count: employees.filter(emp => emp.department === dept.id).length
    })).filter(dept => dept.count > 0);
  }, [employees, departments]);

  // توزيع الموظفين حسب المنصب
  const positionDistribution = useMemo(() => {
    const positions = [...new Set(employees.map(emp => emp.position))];
    return positions.map(position => ({
      name: position,
      count: employees.filter(emp => emp.position === position).length
    }));
  }, [employees]);

  // أداء الموظفين المفصل
  const employeePerformance = useMemo(() => {
    return employees.map(emp => {
      const empTasks = filteredTasks.filter(t => 
        t.assignedTo && t.assignedTo.includes(emp.id)
      );
      const completedTasks = empTasks.filter(t => t.status === 'مكتملة');
      const overdueTasks = empTasks.filter(t => t.status === 'متأخرة');
      const totalPoints = completedTasks.reduce((sum, task) => sum + (task.points || 0), 0);
      
      return {
        id: emp.id,
        name: emp.name,
        position: emp.position,
        department: departments.find(d => d.id === emp.department)?.name || '',
        totalTasks: empTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        points: totalPoints,
        rating: emp.rating || 0,
        completionRate: empTasks.length > 0 ? Math.round((completedTasks.length / empTasks.length) * 100) : 0,
        efficiency: empTasks.length > 0 ? Math.round(((completedTasks.length - overdueTasks.length) / empTasks.length) * 100) : 0
      };
    }).sort((a, b) => {
      // الحصول على إعدادات النظام لمعرفة ما إذا كان وزن صعوبة المهمة مفعل
      const settings = localStorage.getItem('systemSettings');
      const systemConfig = settings ? JSON.parse(settings) : { enableTaskWeighting: false };
      
      // إذا كان وزن صعوبة المهمة مفعل، نرتب حسب النقاط
      if (systemConfig.enableTaskWeighting) {
        return b.points - a.points;
      }
      // وإلا نرتب حسب نسبة الإنجاز
      return b.completionRate - a.completionRate;
    });
  }, [employees, filteredTasks, departments]);

  // أفضل 5 موظفين
  const topPerformers = useMemo(() => {
    return employeePerformance.slice(0, 5);
  }, [employeePerformance]);

  // تصنيف الموظفين بناءً على نسبة الإنجاز
  const getEmployeeRating = (completionRate: number): { stars: number, label: string } => {
    if (completionRate >= 90) return { stars: 5, label: 'ممتاز ⭐⭐⭐⭐⭐' };
    if (completionRate >= 70) return { stars: 4, label: 'جيد جدًا ⭐⭐⭐⭐' };
    if (completionRate >= 50) return { stars: 3, label: 'جيد ⭐⭐⭐' };
    if (completionRate >= 30) return { stars: 2, label: 'مقبول ⭐⭐' };
    return { stars: 1, label: 'ضعيف ⭐' };
  };

  // توزيع التقييمات بناءً على نسبة الإنجاز
  const ratingDistribution = useMemo(() => {
    const ratings = [1, 2, 3, 4, 5];
    const ratingLabels = [
      'ضعيف ⭐',
      'مقبول ⭐⭐',
      'جيد ⭐⭐⭐',
      'جيد جدًا ⭐⭐⭐⭐',
      'ممتاز ⭐⭐⭐⭐⭐'
    ];
    
    return ratings.map(rating => ({
      rating: ratingLabels[rating - 1],
      count: employeePerformance.filter(emp => getEmployeeRating(emp.completionRate).stars === rating).length
    }));
  }, [employeePerformance]);

  // بيانات الرادار للأداء العام
  const performanceRadarData = useMemo(() => {
    const avgCompletionRate = employeePerformance.length > 0 
      ? employeePerformance.reduce((sum, emp) => sum + emp.completionRate, 0) / employeePerformance.length 
      : 0;
    
    const avgEfficiency = employeePerformance.length > 0 
      ? employeePerformance.reduce((sum, emp) => sum + emp.efficiency, 0) / employeePerformance.length 
      : 0;
    
    const avgRating = employees.length > 0 
      ? (employees.reduce((sum, emp) => sum + (emp.rating || 0), 0) / employees.length) * 20 
      : 0;

    return [
      { subject: 'معدل الإنجاز', A: avgCompletionRate, fullMark: 100 },
      { subject: 'الكفاءة', A: avgEfficiency, fullMark: 100 },
      { subject: 'التقييم', A: avgRating, fullMark: 100 },
      { subject: 'النشاط', A: (employeeStats.active / employeeStats.total) * 100, fullMark: 100 },
    ];
  }, [employeePerformance, employees, employeeStats]);

  // ألوان للرسوم البيانية
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">إجمالي الموظفين</p>
              <p className="text-2xl font-bold text-blue-900">{employeeStats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">نشط</p>
              <p className="text-2xl font-bold text-green-900">{employeeStats.active}</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">غير نشط</p>
              <p className="text-2xl font-bold text-gray-900">{employeeStats.inactive}</p>
            </div>
            <Users className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">إجمالي النقاط</p>
              <p className="text-2xl font-bold text-purple-900">{employeeStats.totalPoints}</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">متوسط النقاط</p>
              <p className="text-2xl font-bold text-orange-900">{employeeStats.avgPoints}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* توزيع الموظفين حسب الإدارة */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع الموظفين حسب الإدارة</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {departmentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* توزيع المناصب */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المناصب</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={positionDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* أفضل 5 موظفين */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">أفضل 5 موظفين</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {topPerformers.map((emp, index) => (
            <div key={emp.id} className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{emp.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{emp.position}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>النقاط:</span>
                  <span className="font-semibold text-blue-600">{emp.points}</span>
                </div>
                <div className="flex justify-between">
                  <span>الإنجاز:</span>
                  <span className="font-semibold text-green-600">{emp.completionRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>التقييم:</span>
                  <span className="font-semibold text-yellow-600">{emp.rating.toFixed(1)} ⭐</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* تحليل الأداء العام */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* رادار الأداء */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">تحليل الأداء العام</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="الأداء" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* توزيع التقييمات */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع التقييمات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* جدول تفصيلي لأداء الموظفين */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">تقرير أداء الموظفين التفصيلي</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموظف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المنصب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإدارة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المهام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مكتملة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  متأخرة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النقاط
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التقييم (نسبة الإنجاز)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معدل الإنجاز
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeePerformance.map((emp, index) => (
                <tr key={emp.id} className={index < 3 ? 'bg-yellow-50' : ''}>
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
                    {emp.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.totalTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {emp.completedTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {emp.overdueTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {emp.points}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{getEmployeeRating(emp.completionRate).label}</span>
                    </div>
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

    </div>
  );
};

export default EmployeesReport;
