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
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Correspondence, Employee, Department, Division } from '../../types';
import { Mail, MailOpen, Shield, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

// واجهة خصائص تقرير المراسلات
interface CorrespondenceReportProps {
  correspondences: Correspondence[];
  employees: Employee[];
  departments: Department[];
  divisions: Division[];
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

// مكون تقرير المراسلات
const CorrespondenceReport: React.FC<CorrespondenceReportProps> = ({
  correspondences,
  employees,
  departments,
  divisions,
  reportPeriod
}) => {
  // فلترة المراسلات حسب فترة التقرير
  const filteredCorrespondences = useMemo(() => {
    return correspondences.filter(corr => {
      const corrDate = new Date(corr.date);
      return corrDate >= reportPeriod.startDate && corrDate <= reportPeriod.endDate;
    });
  }, [correspondences, reportPeriod]);

  // إحصائيات المراسلات العامة
  const correspondenceStats = useMemo(() => {
    const total = filteredCorrespondences.length;
    const incoming = filteredCorrespondences.filter(c => c.type === 'incoming').length;
    const outgoing = filteredCorrespondences.filter(c => c.type === 'outgoing').length;
    const urgent = filteredCorrespondences.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length;
    const confidential = filteredCorrespondences.filter(c => c.confidentiality === 'سري' || c.confidentiality === 'سري جداً').length;
    const closed = filteredCorrespondences.filter(c => c.status === 'مغلق' || c.status === 'مؤرشف').length;

    return {
      total,
      incoming,
      outgoing,
      urgent,
      confidential,
      closed,
      processingRate: total > 0 ? Math.round((closed / total) * 100) : 0
    };
  }, [filteredCorrespondences]);

  // توزيع المراسلات حسب النوع
  const typeDistribution = useMemo(() => [
    { name: 'واردة', value: correspondenceStats.incoming, color: '#3B82F6' },
    { name: 'صادرة', value: correspondenceStats.outgoing, color: '#10B981' }
  ], [correspondenceStats]);

  // توزيع المراسلات حسب الحالة
  const statusDistribution = useMemo(() => {
    const statuses = ['مسجل', 'قيد المراجعة', 'محال', 'مغلق', 'مؤرشف', 'مسودة', 'بانتظار التوقيع', 'صادر'];
    return statuses.map(status => ({
      name: status,
      count: filteredCorrespondences.filter(c => c.status === status).length
    })).filter(s => s.count > 0);
  }, [filteredCorrespondences]);

  // توزيع المراسلات حسب الاستعجال
  const urgencyDistribution = useMemo(() => [
    { name: 'عادي', value: filteredCorrespondences.filter(c => c.urgency === 'عادي').length, color: '#10B981' },
    { name: 'عاجل', value: filteredCorrespondences.filter(c => c.urgency === 'عاجل').length, color: '#F59E0B' },
    { name: 'فوري', value: filteredCorrespondences.filter(c => c.urgency === 'فوري').length, color: '#EF4444' }
  ], [filteredCorrespondences]);

  // توزيع المراسلات حسب السرية
  const confidentialityDistribution = useMemo(() => [
    { name: 'عادي', value: filteredCorrespondences.filter(c => c.confidentiality === 'عادي').length, color: '#6B7280' },
    { name: 'سري', value: filteredCorrespondences.filter(c => c.confidentiality === 'سري').length, color: '#F59E0B' },
    { name: 'سري جداً', value: filteredCorrespondences.filter(c => c.confidentiality === 'سري جداً').length, color: '#EF4444' }
  ], [filteredCorrespondences]);

  // المراسلات حسب الإدارة
  const departmentData = useMemo(() => {
    return departments.map(dept => {
      const deptCorrespondences = filteredCorrespondences.filter(c => c.department === dept.id);
      return {
        name: dept.name,
        incoming: deptCorrespondences.filter(c => c.type === 'incoming').length,
        outgoing: deptCorrespondences.filter(c => c.type === 'outgoing').length,
        total: deptCorrespondences.length
      };
    }).filter(dept => dept.total > 0);
  }, [filteredCorrespondences, departments]);

  // اتجاه المراسلات عبر الوقت (آخر 30 يوم)
  const timelineData = useMemo(() => {
    const days = [];
    const endDate = new Date(reportPeriod.endDate);
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      
      const dayCorrespondences = filteredCorrespondences.filter(corr => {
        const corrDate = new Date(corr.date);
        return corrDate.toDateString() === date.toDateString();
      });

      days.push({
        date: date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
        incoming: dayCorrespondences.filter(c => c.type === 'incoming').length,
        outgoing: dayCorrespondences.filter(c => c.type === 'outgoing').length,
        urgent: dayCorrespondences.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length
      });
    }
    
    return days;
  }, [filteredCorrespondences, reportPeriod]);

  // أداء معالجة المراسلات
  const processingPerformance = useMemo(() => {
    return departments.map(dept => {
      const deptCorrespondences = filteredCorrespondences.filter(c => c.department === dept.id);
      const processed = deptCorrespondences.filter(c => c.status === 'مغلق' || c.status === 'مؤرشف');
      const avgProcessingTime = deptCorrespondences.length > 0 
        ? deptCorrespondences.reduce((sum, corr) => {
            const startDate = new Date(corr.date);
            const endDate = corr.completedAt ? new Date(corr.completedAt) : new Date();
            const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            return sum + diffDays;
          }, 0) / deptCorrespondences.length
        : 0;

      return {
        department: dept.name,
        total: deptCorrespondences.length,
        processed: processed.length,
        processingRate: deptCorrespondences.length > 0 ? Math.round((processed.length / deptCorrespondences.length) * 100) : 0,
        avgProcessingTime: Math.round(avgProcessingTime)
      };
    }).filter(dept => dept.total > 0);
  }, [filteredCorrespondences, departments]);

  return (
    <div className="space-y-6">
      
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">إجمالي المراسلات</p>
              <p className="text-2xl font-bold text-blue-900">{correspondenceStats.total}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600">واردة</p>
              <p className="text-2xl font-bold text-indigo-900">{correspondenceStats.incoming}</p>
            </div>
            <Mail className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">صادرة</p>
              <p className="text-2xl font-bold text-green-900">{correspondenceStats.outgoing}</p>
            </div>
            <MailOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">عاجلة</p>
              <p className="text-2xl font-bold text-orange-900">{correspondenceStats.urgent}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">سرية</p>
              <p className="text-2xl font-bold text-red-900">{correspondenceStats.confidential}</p>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">معدل المعالجة</p>
              <p className="text-2xl font-bold text-purple-900">{correspondenceStats.processingRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* الرسوم البيانية الأساسية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* توزيع المراسلات حسب النوع */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المراسلات حسب النوع</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {typeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* توزيع المراسلات حسب الاستعجال */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المراسلات حسب الاستعجال</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={urgencyDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {urgencyDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* المراسلات حسب الحالة */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">المراسلات حسب الحالة</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* المراسلات حسب الإدارة */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">المراسلات حسب الإدارة</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={departmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="incoming" fill="#3B82F6" name="واردة" />
            <Bar dataKey="outgoing" fill="#10B981" name="صادرة" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* اتجاه المراسلات عبر الوقت */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">اتجاه المراسلات (آخر 30 يوم)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="incoming" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="واردة" />
            <Area type="monotone" dataKey="outgoing" stackId="1" stroke="#10B981" fill="#10B981" name="صادرة" />
            <Line type="monotone" dataKey="urgent" stroke="#EF4444" strokeWidth={2} name="عاجلة" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* أداء معالجة المراسلات */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">أداء معالجة المراسلات حسب الإدارة</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإدارة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  إجمالي المراسلات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المعالجة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معدل المعالجة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  متوسط وقت المعالجة (يوم)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processingPerformance.map((dept, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dept.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dept.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {dept.processed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${dept.processingRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{dept.processingRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      dept.avgProcessingTime <= 3 ? 'bg-green-100 text-green-800' :
                      dept.avgProcessingTime <= 7 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {dept.avgProcessingTime} يوم
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* توزيع السرية */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المراسلات حسب مستوى السرية</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={confidentialityDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default CorrespondenceReport;
