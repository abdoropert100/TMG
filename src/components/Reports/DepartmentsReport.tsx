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
  Treemap
} from 'recharts';
import { Task, Employee, Correspondence, Department, Division } from '../../types';
import { Building2, Users, Target, TrendingUp } from 'lucide-react';

// واجهة خصائص تقرير الأقسام
interface DepartmentsReportProps {
  departments: Department[];
  divisions: Division[];
  employees: Employee[];
  tasks: Task[];
  correspondences: Correspondence[];
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

// مكون تقرير الأقسام والإدارات
const DepartmentsReport: React.FC<DepartmentsReportProps> = ({
  departments,
  divisions,
  employees,
  tasks,
  correspondences,
  reportPeriod
}) => {
  // فلترة البيانات حسب فترة التقرير
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt || task.startDate);
      return taskDate >= reportPeriod.startDate && taskDate <= reportPeriod.endDate;
    });
  }, [tasks, reportPeriod]);

  const filteredCorrespondences = useMemo(() => {
    return correspondences.filter(corr => {
      const corrDate = new Date(corr.date);
      return corrDate >= reportPeriod.startDate && corrDate <= reportPeriod.endDate;
    });
  }, [correspondences, reportPeriod]);

  // إحصائيات عامة للأقسام
  const departmentStats = useMemo(() => {
    return {
      totalDepartments: departments.length,
      totalDivisions: divisions.length,
      totalEmployees: employees.length,
      avgEmployeesPerDept: departments.length > 0 ? Math.round(employees.length / departments.length) : 0
    };
  }, [departments, divisions, employees]);

  // تحليل أداء الإدارات
  const departmentPerformance = useMemo(() => {
    return departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept.id);
      const deptDivisions = divisions.filter(div => div.departmentId === dept.id);
      const deptTasks = filteredTasks.filter(task => task.department === dept.id);
      const deptCorrespondences = filteredCorrespondences.filter(corr => corr.department === dept.id);
      
      const completedTasks = deptTasks.filter(task => task.status === 'مكتملة');
      const totalPoints = completedTasks.reduce((sum, task) => sum + (task.points || 0), 0);
      const avgEmployeeRating = deptEmployees.length > 0 
        ? deptEmployees.reduce((sum, emp) => sum + (emp.rating || 0), 0) / deptEmployees.length 
        : 0;

      return {
        id: dept.id,
        name: dept.name,
        employeeCount: deptEmployees.length,
        divisionCount: deptDivisions.length,
        taskCount: deptTasks.length,
        completedTasks: completedTasks.length,
        correspondenceCount: deptCorrespondences.length,
        totalPoints,
        avgRating: avgEmployeeRating,
        taskCompletionRate: deptTasks.length > 0 ? Math.round((completedTasks.length / deptTasks.length) * 100) : 0,
        productivity: deptEmployees.length > 0 ? Math.round(totalPoints / deptEmployees.length) : 0
      };
    });
  }, [departments, divisions, employees, filteredTasks, filteredCorrespondences]);

  // تحليل أداء الأقسام
  const divisionPerformance = useMemo(() => {
    return divisions.map(div => {
      const divEmployees = employees.filter(emp => emp.division === div.id);
      const divTasks = filteredTasks.filter(task => task.division === div.id);
      const divCorrespondences = filteredCorrespondences.filter(corr => corr.division === div.id);
      
      const completedTasks = divTasks.filter(task => task.status === 'مكتملة');
      const totalPoints = completedTasks.reduce((sum, task) => sum + (task.points || 0), 0);
      const department = departments.find(dept => dept.id === div.departmentId);

      return {
        id: div.id,
        name: div.name,
        departmentName: department?.name || '',
        employeeCount: divEmployees.length,
        taskCount: divTasks.length,
        completedTasks: completedTasks.length,
        correspondenceCount: divCorrespondences.length,
        totalPoints,
        taskCompletionRate: divTasks.length > 0 ? Math.round((completedTasks.length / divTasks.length) * 100) : 0,
        productivity: divEmployees.length > 0 ? Math.round(totalPoints / divEmployees.length) : 0
      };
    }).filter(div => div.employeeCount > 0 || div.taskCount > 0);
  }, [divisions, departments, employees, filteredTasks, filteredCorrespondences]);

  // توزيع الموظفين حسب الإدارة
  const employeeDistribution = useMemo(() => {
    return departmentPerformance.map(dept => ({
      name: dept.name,
      employees: dept.employeeCount,
      divisions: dept.divisionCount
    }));
  }, [departmentPerformance]);

  // توزيع المهام حسب الإدارة
  const taskDistribution = useMemo(() => {
    return departmentPerformance.map(dept => ({
      name: dept.name,
      total: dept.taskCount,
      completed: dept.completedTasks,
      pending: dept.taskCount - dept.completedTasks
    })).filter(dept => dept.total > 0);
  }, [departmentPerformance]);

  // بيانات الخريطة الشجرية للإنتاجية
  const productivityTreemapData = useMemo(() => {
    return departmentPerformance.map(dept => ({
      name: dept.name,
      size: dept.totalPoints,
      productivity: dept.productivity
    })).filter(dept => dept.size > 0);
  }, [departmentPerformance]);

  // أفضل 5 إدارات
  const topDepartments = useMemo(() => {
    // الحصول على إعدادات النظام لمعرفة ما إذا كان وزن صعوبة المهمة مفعل
    const settings = localStorage.getItem('systemSettings');
    const systemConfig = settings ? JSON.parse(settings) : { enableTaskWeighting: false };
    
    return [...departmentPerformance]
      .sort((a, b) => {
        // إذا كان وزن صعوبة المهمة مفعل، نرتب حسب الإنتاجية
        if (systemConfig.enableTaskWeighting) {
          return b.productivity - a.productivity;
        }
        // وإلا نرتب حسب معدل الإنجاز
        return b.taskCompletionRate - a.taskCompletionRate;
      })
      .slice(0, 5);
  }, [departmentPerformance]);

  // أفضل 5 أقسام
  const topDivisions = useMemo(() => {
    // الحصول على إعدادات النظام لمعرفة ما إذا كان وزن صعوبة المهمة مفعل
    const settings = localStorage.getItem('systemSettings');
    const systemConfig = settings ? JSON.parse(settings) : { enableTaskWeighting: false };
    
    return [...divisionPerformance]
      .sort((a, b) => {
        // إذا كان وزن صعوبة المهمة مفعل، نرتب حسب الإنتاجية
        if (systemConfig.enableTaskWeighting) {
          return b.productivity - a.productivity;
        }
        // وإلا نرتب حسب معدل الإنجاز
        return b.taskCompletionRate - a.taskCompletionRate;
      })
      .slice(0, 5);
  }, [divisionPerformance]);

  // ألوان للرسوم البيانية
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">إجمالي الإدارات</p>
              <p className="text-2xl font-bold text-blue-900">{departmentStats.totalDepartments}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">إجمالي الأقسام</p>
              <p className="text-2xl font-bold text-green-900">{departmentStats.totalDivisions}</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">إجمالي الموظفين</p>
              <p className="text-2xl font-bold text-purple-900">{departmentStats.totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">متوسط الموظفين/إدارة</p>
              <p className="text-2xl font-bold text-orange-900">{departmentStats.avgEmployeesPerDept}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* أفضل الإدارات والأقسام */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* أفضل 5 إدارات */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">أفضل 5 إدارات (حسب الإنتاجية)</h3>
          <div className="space-y-4">
            {topDepartments.map((dept, index) => (
              <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-lg mr-3">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">{dept.name}</h4>
                    <p className="text-sm text-gray-600">{dept.employeeCount} موظف</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{dept.productivity} نقطة/موظف</p>
                  <p className="text-sm text-gray-600">{dept.taskCompletionRate}% إنجاز</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* أفضل 5 أقسام */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">أفضل 5 أقسام (حسب الإنتاجية)</h3>
          <div className="space-y-4">
            {topDivisions.map((div, index) => (
              <div key={div.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-lg mr-3">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">{div.name}</h4>
                    <p className="text-sm text-gray-600">{div.departmentName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{div.productivity} نقطة/موظف</p>
                  <p className="text-sm text-gray-600">{div.taskCompletionRate}% إنجاز</p>
                </div>
              </div>
            ))}
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
                data={employeeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="employees"
              >
                {employeeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* توزيع المهام حسب الإدارة */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المهام حسب الإدارة</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10B981" name="مكتملة" />
              <Bar dataKey="pending" fill="#F59E0B" name="معلقة" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* خريطة الإنتاجية الشجرية */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">خريطة الإنتاجية حسب الإدارة</h3>
        <ResponsiveContainer width="100%" height={400}>
          <Treemap
            data={productivityTreemapData}
            dataKey="size"
            aspectRatio={4/3}
            stroke="#fff"
            fill="#8884d8"
          />
        </ResponsiveContainer>
      </div>

      {/* جدول تفصيلي لأداء الإدارات */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">تقرير أداء الإدارات التفصيلي</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإدارة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموظفين
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الأقسام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المهام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مكتملة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المراسلات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النقاط
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإنتاجية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معدل الإنجاز
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentPerformance.map((dept, index) => (
                <tr key={dept.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index < 3 && (
                        <span className="mr-2 text-lg">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.employeeCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.divisionCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.taskCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {dept.completedTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.correspondenceCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {dept.totalPoints}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {dept.productivity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${dept.taskCompletionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{dept.taskCompletionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* جدول تفصيلي لأداء الأقسام */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">تقرير أداء الأقسام التفصيلي</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  القسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإدارة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموظفين
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المهام
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  مكتملة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المراسلات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النقاط
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإنتاجية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معدل الإنجاز
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {divisionPerformance.map(div => (
                <tr key={div.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {div.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {div.departmentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {div.employeeCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {div.taskCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {div.completedTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {div.correspondenceCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {div.totalPoints}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {div.productivity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${div.taskCompletionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{div.taskCompletionRate}%</span>
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

export default DepartmentsReport;
