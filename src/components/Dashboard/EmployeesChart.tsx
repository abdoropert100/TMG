/**
 * مكون رسم بياني للموظفين
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Users, Award, TrendingUp, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * مكون رسم بياني للموظفين المتقدم
 * يعرض توزيع الموظفين حسب الإدارات والنقاط والحالة
 */
const EmployeesChart: React.FC = () => {
  // استخدام السياق للحصول على البيانات الفعلية
  const { state } = useApp();

  // حساب بيانات الموظفين من البيانات الفعلية
  const employeesData = React.useMemo(() => {
    const employees = state.employees || [];
    const departments = state.departments || [];
    
    if (employees.length === 0) {
      // عرض بيانات فارغة
      return {
        departmentData: [
        ],
        statusData: [
          { name: 'نشط', value: 0, color: '#10B981' },
          { name: 'إجازة', value: 0, color: '#F59E0B' },
          { name: 'معطل', value: 0, color: '#EF4444' }
        ],
        pointsData: [
          { range: '0-200', count: 0 },
          { range: '200-400', count: 0 },
          { range: '400-600', count: 0 },
          { range: '600-800', count: 0 },
          { range: '800+', count: 0 }
        ]
      };
    }
    
    // حساب البيانات الفعلية
    const departmentData = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept.id);
      return {
        department: dept.name,
        count: deptEmployees.length,
        active: deptEmployees.filter(emp => emp.status === 'نشط').length,
        inactive: deptEmployees.filter(emp => emp.status !== 'نشط').length
      };
    }).filter(dept => dept.count > 0);

    const statusData = [
      { 
        name: 'نشط', 
        value: employees.filter(emp => emp.status === 'نشط').length, 
        color: '#10B981' 
      },
      { 
        name: 'إجازة', 
        value: employees.filter(emp => emp.status === 'إجازة').length, 
        color: '#F59E0B' 
      },
      { 
        name: 'معطل', 
        value: employees.filter(emp => emp.status === 'معطل').length, 
        color: '#EF4444' 
      }
    ].filter(item => item.value > 0);

    // توزيع النقاط
    const pointsRanges = [
      { range: '0-200', min: 0, max: 200 },
      { range: '200-400', min: 200, max: 400 },
      { range: '400-600', min: 400, max: 600 },
      { range: '600-800', min: 600, max: 800 },
      { range: '800+', min: 800, max: Infinity }
    ];

    const pointsData = pointsRanges.map(range => ({
      range: range.range,
      count: employees.filter(emp => 
        emp.points >= range.min && emp.points < range.max
      ).length
    })).filter(range => range.count > 0);

    return { departmentData, statusData, pointsData };
  }, [state.employees, state.departments]);

  const totalEmployees = employeesData.departmentData.reduce((sum, dept) => sum + dept.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">إحصائيات الموظفين</h3>
            <p className="text-sm text-gray-500">إجمالي {totalEmployees} موظف في النظام</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-purple-600">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">متنامي</span>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* توزيع الموظفين حسب الإدارة */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">توزيع الموظفين حسب الإدارة</h4>
          {employeesData.departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={employeesData.departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="department" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={10}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" fill="#10B981" name="نشط" />
                <Bar dataKey="inactive" fill="#EF4444" name="غير نشط" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <Building2 className="h-12 w-12" />
            </div>
          )}
        </div>

        {/* توزيع حسب الحالة */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">توزيع الموظفين حسب الحالة</h4>
          {employeesData.statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={employeesData.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {employeesData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <Users className="h-12 w-12" />
            </div>
          )}
        </div>

      </div>

      {/* توزيع النقاط */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-3">توزيع الموظفين حسب النقاط</h4>
        <div className="grid grid-cols-5 gap-2">
          {employeesData.pointsData.map((range, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{range.count}</div>
              <div className="text-xs text-gray-600">{range.range}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default EmployeesChart;