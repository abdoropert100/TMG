import React from 'react';
import { Trophy, Target, Users, TrendingUp } from 'lucide-react';

import { useApp } from '../../context/AppContext';

const PerformanceMetrics: React.FC = () => {
  const { state } = useApp();
  
  // دالة تصنيف الموظفين بناءً على نسبة الإنجاز
  const getEmployeeRating = (completionRate: number): string => {
    if (completionRate >= 90) return 'ممتاز';
    if (completionRate >= 80) return 'جيد جداً';
    if (completionRate >= 70) return 'جيد';
    if (completionRate >= 60) return 'مقبول';
    return 'ضعيف';
  };

  // حساب أفضل الموظفين من البيانات الفعلية
  const topPerformers = React.useMemo(() => {
    if (!state.employees || state.employees.length === 0) {
      return [];
    }
    
    // حساب نسبة الإنجاز لكل موظف
    const employeesWithCompletion = state.employees.map(emp => {
      const department = (state.departments || []).find(d => d.id === emp.department);
      const empTasks = (state.tasks || []).filter(t => t.assignedTo && t.assignedTo.includes(emp.id));
      const completedTasks = empTasks.filter(t => t.status === 'مكتملة');
      const completionRate = empTasks.length > 0 ? Math.round((completedTasks.length / empTasks.length) * 100) : 0;
      
      return {
        name: emp.name,
        points: emp.points || 0,
        department: department?.name || emp.department,
        completionRate,
        rating: getEmployeeRating(completionRate),
        rank: 0
      };
    });
    
    // الحصول على إعدادات النظام لمعرفة ما إذا كان وزن صعوبة المهمة مفعل
    const settings = localStorage.getItem('systemSettings');
    const systemConfig = settings ? JSON.parse(settings) : { enableTaskWeighting: false };
    
    return employeesWithCompletion
      .filter(emp => emp.completionRate > 0)
      // إذا كان وزن صعوبة المهمة مفعل، نرتب حسب النقاط، وإلا نرتب حسب نسبة الإنجاز
      .sort((a, b) => systemConfig.enableTaskWeighting ? 
        (b.points - a.points) : 
        (b.completionRate - a.completionRate))
      .slice(0, 4)
      .map((emp, index) => ({ ...emp, rank: index + 1 }));
  }, [state.employees, state.departments]);

  // حساب أداء الإدارات من البيانات الفعلية
  const departmentPerformance = React.useMemo(() => {
    if (!state.departments || state.departments.length === 0) {
      return [];
    }
    
    return state.departments.map(dept => {
      const deptTasks = (state.tasks || []).filter(t => t.department === dept.id);
      const completedTasks = deptTasks.filter(t => t.status === 'مكتملة');
      const completion = deptTasks.length > 0 ? Math.round((completedTasks.length / deptTasks.length) * 100) : 0;
      
      return {
        name: dept.name,
        completion,
        color: completion >= 90 ? 'bg-green-500' :
               completion >= 80 ? 'bg-blue-500' :
               completion >= 70 ? 'bg-orange-500' : 'bg-red-500'
      };
    }).filter(dept => dept.completion > 0);
  }, [state.departments, state.tasks]);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-gray-600 bg-gray-100';
      case 3: return 'text-orange-600 bg-orange-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* أفضل الموظفين */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Trophy className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">أفضل الموظفين</h3>
            <p className="text-sm text-gray-500">ترتيب حسب نسبة الإنجاز أو النقاط</p>
          </div>
        </div>

        <div className="space-y-4">
          {topPerformers.map((performer) => (
            <div key={performer.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(performer.rank)}`}>
                  {performer.rank}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{performer.name}</h4>
                  <p className="text-xs text-gray-500">{performer.department}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-lg text-gray-900">{performer.rating}</p>
                <p className="text-xs text-gray-500">{performer.completionRate}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* أداء الإدارات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Target className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">أداء الإدارات</h3>
            <p className="text-sm text-gray-500">معدل إكمال المهام</p>
          </div>
        </div>

        <div className="space-y-4">
          {departmentPerformance.map((dept, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">{dept.name}</h4>
                <span className="text-sm font-bold text-gray-900">{dept.completion}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${dept.color} transition-all duration-1000`}
                  style={{ width: `${dept.completion}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">متوسط الأداء العام</span>
          </div>
          <p className="text-2xl font-bold text-green-600">85.25%</p>
          <p className="text-xs text-gray-500">تحسن بنسبة +7% عن الشهر الماضي</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;