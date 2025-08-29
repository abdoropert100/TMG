import React from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, ResponsiveContainer, Area, AreaChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Target, Clock, AlertTriangle, Mail, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * مكون الرسوم البيانية المتقدمة
 * يعرض تحليلات شاملة لجميع بيانات النظام
 */
const AdvancedCharts: React.FC = () => {
  const { state } = useApp();

  // حساب بيانات المهام حسب الحالة من البيانات الفعلية
  const tasksStatusData = React.useMemo(() => {
    const tasks = state.tasks || [];
    if (tasks.length === 0) {
      // عرض بيانات فارغة إذا لم توجد مهام
      return [
        { name: 'جديدة', value: 0, color: '#3B82F6', icon: Target },
        { name: 'قيد التنفيذ', value: 0, color: '#F59E0B', icon: Clock },
        { name: 'مكتملة', value: 0, color: '#10B981', icon: Target },
        { name: 'متأخرة', value: 0, color: '#EF4444', icon: AlertTriangle }
      ];
    }
    
    return [
      { name: 'جديدة', value: tasks.filter(t => t.status === 'جديدة').length, color: '#3B82F6', icon: Target },
      { name: 'قيد التنفيذ', value: tasks.filter(t => t.status === 'قيد التنفيذ').length, color: '#F59E0B', icon: Clock },
      { name: 'مكتملة', value: tasks.filter(t => t.status === 'مكتملة').length, color: '#10B981', icon: Target },
      { name: 'متأخرة', value: tasks.filter(t => t.status === 'متأخرة').length, color: '#EF4444', icon: AlertTriangle }
    ].filter(item => item.value > 0); // إخفاء الفئات الفارغة
  }, [state.tasks]);

  // حساب بيانات المهام حسب الإدارة من البيانات الفعلية
  const tasksByDepartmentData = React.useMemo(() => {
    if ((state.departments || []).length === 0 || (state.tasks || []).length === 0) {
      // عرض بيانات فارغة
      return [
      ];
    }
    
    return (state.departments || []).map(dept => {
      const deptTasks = (state.tasks || []).filter(t => t.department === dept.id);
      return {
        department: dept.name,
        tasks: deptTasks.length,
        completed: deptTasks.filter(t => t.status === 'مكتملة').length,
        pending: deptTasks.filter(t => t.status === 'قيد التنفيذ').length
      };
    }).filter(dept => dept.tasks > 0);
  }, [state.tasks, state.departments]);

  // حساب بيانات المراسلات حسب مستوى السرية من البيانات الفعلية
  const correspondenceData = React.useMemo(() => {
    const correspondence = state.correspondence || [];
    if (correspondence.length === 0) {
      // عرض بيانات فارغة
      return [
        { name: 'عادي', value: 0, color: '#6B7280' },
        { name: 'عاجل', value: 0, color: '#F59E0B' },
        { name: 'سري', value: 0, color: '#EF4444' },
        { name: 'سري جداً', value: 0, color: '#7C2D12' }
      ];
    }
    
    return [
      { name: 'عادي', value: correspondence.filter(c => c.confidentiality === 'عادي').length, color: '#6B7280' },
      { name: 'عاجل', value: correspondence.filter(c => c.urgency === 'عاجل').length, color: '#F59E0B' },
      { name: 'سري', value: correspondence.filter(c => c.confidentiality === 'سري').length, color: '#EF4444' },
      { name: 'سري جداً', value: correspondence.filter(c => c.confidentiality === 'سري جداً').length, color: '#7C2D12' }
    ].filter(item => item.value > 0); // إخفاء الفئات الفارغة
  }, [state.correspondence]);

  // حساب بيانات الأداء الشهري من البيانات الفعلية
  const monthlyPerformanceData = React.useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    return months.map((month, index) => {
      const monthTasks = state.tasks.filter(t => {
        const taskMonth = new Date(t.createdAt).getMonth();
        return taskMonth === index;
      });
      const monthCorr = state.correspondence.filter(c => {
        const corrMonth = new Date(c.date).getMonth();
        return corrMonth === index;
      });
      
      return {
        month,
        tasks: monthTasks.length,
        correspondence: monthCorr.length,
        employees: state.employees.length
      };
    });
  }, [state.tasks, state.correspondence, state.employees]);

  // بيانات رادار الأداء العام
  const performanceRadarData = React.useMemo(() => {
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.status === 'مكتملة').length;
    const totalCorr = state.correspondence.length;
    const processedCorr = state.correspondence.filter(c => c.status === 'مغلق' || c.status === 'مؤرشف').length;
    const activeEmployees = state.employees.filter(e => e.status === 'نشط').length;
    
    return [
      { 
        subject: 'إنجاز المهام', 
        A: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0, 
        fullMark: 100 
      },
      { 
        subject: 'معالجة المراسلات', 
        A: totalCorr > 0 ? Math.round((processedCorr / totalCorr) * 100) : 0, 
        fullMark: 100 
      },
      { 
        subject: 'نشاط الموظفين', 
        A: state.employees.length > 0 ? Math.round((activeEmployees / state.employees.length) * 100) : 0, 
        fullMark: 100 
      },
      { 
        subject: 'كفاءة الأقسام',
        A: state.departments.length > 0 ? Math.round((state.departments.length / (state.departments.length + 1)) * 100) : 0,
        fullMark: 100 
      }
    ];
  }, [state.tasks, state.correspondence, state.employees]);

  return (
    <div className="space-y-6">
      
      {/* الرسوم البيانية الأساسية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* رسم دائري للمراسلات حسب مستوى السرية */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            المراسلات حسب مستوى السرية ({state.correspondence.length} مراسلة)
          </h3>
          {correspondenceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={correspondenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {correspondenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد مراسلات لعرضها</p>
              </div>
            </div>
          )}
        </div>

        {/* رادار الأداء العام */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">مؤشرات الأداء العام</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={performanceRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="الأداء" 
                dataKey="A" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3} 
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* رسم خطي للأداء الشهري */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">اتجاه الأداء الشهري</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="tasks" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="المهام"
            />
            <Line 
              type="monotone" 
              dataKey="correspondence" 
              stroke="#10B981" 
              strokeWidth={2}
              name="المراسلات"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* رسم شريطي للمهام حسب الإدارة */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          المهام حسب الإدارة ({state.departments.length} إدارة)
        </h3>
        {tasksByDepartmentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tasksByDepartmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="department" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10B981" name="مكتملة" />
              <Bar dataKey="pending" fill="#F59E0B" name="قيد التنفيذ" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>لا توجد بيانات لعرضها</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdvancedCharts;
