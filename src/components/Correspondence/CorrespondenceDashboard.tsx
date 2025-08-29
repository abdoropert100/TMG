/**
 * لوحة تحكم المراسلات المتخصصة
 * نظام إدارة مصلحة الري - وزارة الموارد المائية والري
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Mail, 
  MailOpen, 
  Shield, 
  Clock, 
  AlertTriangle,
  Building2,
  User,
  TrendingUp,
  Target,
  CheckCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { correspondenceService } from '../../services/CorrespondenceService';

/**
 * مكون لوحة تحكم المراسلات المتخصصة
 */
const CorrespondenceDashboard: React.FC = () => {
  const { state } = useApp();
  
  // حالات المكون
  const [stats, setStats] = useState({
    total: 0,
    incoming: 0,
    outgoing: 0,
    urgent: 0,
    confidential: 0,
    processed: 0,
    pending: 0,
    overdue: 0
  });
  
  const [departmentPerformance, setDepartmentPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * تحميل البيانات عند تحميل المكون
   */
  useEffect(() => {
    loadDashboardData();
  }, [state.correspondence]);

  /**
   * دالة تحميل بيانات لوحة التحكم
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // تحميل الإحصائيات العامة
      // حساب الإحصائيات من البيانات المحلية
      const correspondence = state.correspondence || [];
      const calculatedStats = {
        total: correspondence.length,
        incoming: correspondence.filter(c => c.type === 'وارد').length,
        outgoing: correspondence.filter(c => c.type === 'صادر').length,
        urgent: correspondence.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length,
        confidential: correspondence.filter(c => c.confidentiality === 'سري' || c.confidentiality === 'سري جداً').length,
        processed: correspondence.filter(c => c.status === 'مغلق' || c.status === 'مؤرشف' || c.status === 'صادر').length,
        pending: correspondence.filter(c => c.status === 'قيد المراجعة' || c.status === 'محال').length,
        overdue: 0
      };
      setStats(calculatedStats);

      // تحميل أداء الإدارات
      const deptPerformance = (state.departments || []).map(dept => {
        const deptCorrespondences = correspondence.filter(c => c.department === dept.id);
        const processed = deptCorrespondences.filter(c => c.status === 'مغلق' || c.status === 'مؤرشف');
        
        return {
          departmentId: dept.id,
          departmentName: dept.name,
          totalCorrespondences: deptCorrespondences.length,
          processedCorrespondences: processed.length,
          urgentCorrespondences: deptCorrespondences.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length,
          processingRate: deptCorrespondences.length > 0 ? Math.round((processed.length / deptCorrespondences.length) * 100) : 0,
          averageProcessingTime: 3
        };
      }).filter(dept => dept.totalCorrespondences > 0);
      setDepartmentPerformance(deptPerformance);

    } catch (error) {
      console.error('خطأ في تحميل بيانات لوحة التحكم:', error);
    } finally {
      setLoading(false);
    }
  };

  // حساب البيانات للرسوم البيانية
  const chartData = React.useMemo(() => {
    const correspondence = state.correspondence || [];
    
    // توزيع حسب النوع
    const typeData = [
      { name: 'واردة', value: correspondence.filter(c => c.type === 'وارد').length, color: '#3B82F6' },
      { name: 'صادرة', value: correspondence.filter(c => c.type === 'صادر').length, color: '#10B981' }
    ];

    // توزيع حسب الحالة
    const statusData = [
      { name: 'مسجل', value: correspondence.filter(c => c.status === 'مسجل').length },
      { name: 'قيد المراجعة', value: correspondence.filter(c => c.status === 'قيد المراجعة').length },
      { name: 'محال', value: correspondence.filter(c => c.status === 'محال').length },
      { name: 'مغلق', value: correspondence.filter(c => c.status === 'مغلق').length },
      { name: 'صادر', value: correspondence.filter(c => c.status === 'صادر').length },
      { name: 'مؤرشف', value: correspondence.filter(c => c.status === 'مؤرشف').length }
    ].filter(item => item.value > 0);

    // توزيع حسب الاستعجال
    const urgencyData = [
      { name: 'عادي', value: correspondence.filter(c => c.urgency === 'عادي').length, color: '#10B981' },
      { name: 'عاجل', value: correspondence.filter(c => c.urgency === 'عاجل').length, color: '#F59E0B' },
      { name: 'فوري', value: correspondence.filter(c => c.urgency === 'فوري').length, color: '#EF4444' }
    ];

    // توزيع حسب السرية
    const confidentialityData = [
      { name: 'عادي', value: correspondence.filter(c => c.confidentiality === 'عادي').length, color: '#6B7280' },
      { name: 'سري', value: correspondence.filter(c => c.confidentiality === 'سري').length, color: '#F59E0B' },
      { name: 'سري جداً', value: correspondence.filter(c => c.confidentiality === 'سري جداً').length, color: '#EF4444' }
    ];

    // الاتجاهات الشهرية
    const monthlyData = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'].map((month, index) => {
      const monthCorrespondences = correspondence.filter(c => {
        let corrMonth = null;
        if (c.date) {
          const d = new Date(c.date);
          if (!isNaN(d.getTime())) {
            corrMonth = d.getMonth();
          }
        }
        return corrMonth === index;
      });

      return {
        month,
        incoming: monthCorrespondences.filter(c => c.type === 'وارد').length,
        outgoing: monthCorrespondences.filter(c => c.type === 'صادر').length,
        urgent: monthCorrespondences.filter(c => c.urgency === 'عاجل' || c.urgency === 'فوري').length
      };
    });

    return {
      typeData,
      statusData,
      urgencyData,
      confidentialityData,
      monthlyData
    };
  }, [state.correspondence]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-2 text-gray-600">جاري تحميل بيانات المراسلات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">إجمالي المراسلات</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600">واردة</p>
              <p className="text-2xl font-bold text-indigo-900">{stats.incoming}</p>
            </div>
            <Mail className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">صادرة</p>
              <p className="text-2xl font-bold text-green-900">{stats.outgoing}</p>
            </div>
            <MailOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">عاجلة</p>
              <p className="text-2xl font-bold text-orange-900">{stats.urgent}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">سرية</p>
              <p className="text-2xl font-bold text-red-900">{stats.confidential}</p>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">معالجة</p>
              <p className="text-2xl font-bold text-purple-900">{stats.processed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">معلقة</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-pink-600">معدل المعالجة</p>
              <p className="text-2xl font-bold text-pink-900">
                {stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0}%
              </p>
            </div>
            <Target className="h-8 w-8 text-pink-600" />
          </div>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* توزيع المراسلات حسب النوع */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المراسلات حسب النوع</h3>
          {chartData.typeData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <CheckCircle className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>

      </div>

      {/* أداء الإدارات في معالجة المراسلات */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">أداء الإدارات في معالجة المراسلات</h3>
        {departmentPerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={departmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="departmentName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalCorrespondences" fill="#3B82F6" name="إجمالي" />
              <Bar dataKey="processedCorrespondences" fill="#10B981" name="معالجة" />
              <Bar dataKey="urgentCorrespondences" fill="#EF4444" name="عاجل" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <Building2 className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* الاتجاهات الشهرية */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الاتجاهات الشهرية للمراسلات</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="incoming" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="واردة" />
            <Area type="monotone" dataKey="outgoing" stackId="1" stroke="#10B981" fill="#10B981" name="صادرة" />
            <Line type="monotone" dataKey="urgent" stroke="#EF4444" strokeWidth={2} name="عاجلة" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* توزيع الاستعجال والسرية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* توزيع الاستعجال */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع حسب الاستعجال</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.urgencyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.urgencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* توزيع السرية */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع حسب السرية</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.confidentialityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.confidentialityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};

export default CorrespondenceDashboard;